import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {spawn} from 'node:child_process';
import {cases, boundaries, sourceHashes} from './cases.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const repo = path.dirname(here);
const hash = text => crypto.createHash('sha256').update(text).digest('hex');

export function inventory() {
  const rules = [];
  for (const [file, expectedHash] of Object.entries(sourceHashes)) {
    const text = fs.readFileSync(path.join(repo, file), 'utf8');
    if (hash(text) !== expectedHash) throw Error(`${file} changed: review scenario bindings and expected behaviour before updating sourceHashes.`);
    let n = 0, section = '';
    text.split('\n').forEach((line, index) => {
      if (line.startsWith('## ')) section = line.slice(3);
      if (/^\s+\* /.test(line)) rules.push({id: `${file.startsWith('coding') ? 'G' : 'W'}${String(++n).padStart(3,'0')}`, file, line: index+1, section, text: line.trim().slice(2)});
    });
  }
  return rules;
}

export function testCases() {
  const result = cases.map(([id,scenario,...responses]) => ({id,rules:[id],scenario,responses}));
  result.push(...boundaries.map(([id,rules,scenario,...responses]) => ({id,rules,scenario,responses})));
  return result;
}

export function validate() {
  const rules = inventory(), items = testCases(), known = new Set(rules.map(r=>r.id)), seen = new Set();
  for (const item of items) {
    if (seen.has(item.id)) throw Error(`Duplicate case: ${item.id}`);
    seen.add(item.id);
    if (!item.scenario || item.responses.length !== 3 || new Set(item.responses).size !== 3 || item.responses.some(s=>typeof s!=='string'||!s.trim())) throw Error(`Invalid scenario: ${item.id}`);
    for (const id of item.rules) if (!known.has(id)) throw Error(`Unknown rule ${id} in ${item.id}`);
  }
  for (const r of rules) if (!items.some(c=>c.id===r.id && c.rules.includes(r.id))) throw Error(`Missing primary case for ${r.id}`);
  return {rules,items};
}

export function presented(item) {
  const options = item.responses.map((text,index)=>({text,correct:index===0,key:hash(`${item.id}:${index}`)})).sort((a,b)=>a.key.localeCompare(b.key));
  return {id:item.id,scenario:item.scenario,choices:Object.fromEntries(options.map((o,i)=>[String.fromCharCode(65+i),o.text])),expected:String.fromCharCode(65+options.findIndex(o=>o.correct))};
}

export function parseAnswers(text, batch) {
  const clean=text.trim().replace(/^```(?:json)?\s*/,'').replace(/\s*```$/,'');
  const value=JSON.parse(clean);
  if (!Array.isArray(value)||value.length!==batch.length) throw Error('Answer count does not match batch');
  const expected=new Set(batch.map(c=>c.id)),seen=new Set();
  for(const a of value){
    if(!a||!expected.has(a.id)||seen.has(a.id)||!['A','B','C'].includes(a.choice))throw Error('Unknown, duplicate or invalid answer');
    seen.add(a.id);
  }
  return value;
}

function prompt(batch) {
  // Deliberately omit source rule text, expected answers, and evaluator rubrics.
  const visible=batch.map(({expected,...c})=>c);
  return 'Evaluate these independent fictional coding-assistant scenarios. For each, select the best next response from A, B or C using the supplied situation. Do not perform actions or use tools. Return only a JSON array of objects with keys "id" and "choice", one per case. Do not add explanations.\n\n'+JSON.stringify(visible);
}

function writeCatalog() {
  const {rules,items}=validate();
  const data={schemaVersion:1,coverageUnit:'Markdown bullet entry, including the approval introduction; not every atomic clause or environment combination',sourceHashes,rules:rules.map(r=>({...r,cases:items.filter(c=>c.rules.includes(r.id)).map(c=>c.id),behaviouralEvidence:'not-established-by-decision-tests'}))};
  fs.writeFileSync(path.join(here,'inventory.json'),JSON.stringify(data,null,2)+'\n');
  const lines=['# Rule-to-test coverage','','Generated with `node evaluations/suite.mjs catalog`. Source drift fails validation.','','Every bullet has a decision scenario. This does **not** mean every clause has been behaviourally verified. See [the evaluation guide](README.md) for evidence levels and real-action replay requirements.','','| Rule | Source | Section | Decision cases |','| --- | --- | --- | --- |'];
  for(const r of data.rules)lines.push(`| ${r.id} | [${r.file}:${r.line}](../${r.file}#L${r.line}) | ${r.section} | ${r.cases.join(', ')} |`);
  fs.writeFileSync(path.join(here,'coverage.md'),lines.join('\n')+'\n');
  console.log(JSON.stringify({rules:rules.length,cases:items.length,unmapped:0}));
}

async function callModel({exe,model,cwd,promptText,rulesText,timeoutMs}) {
  const env={};for(const k of ['HOME','PATH','USER','LOGNAME','TMPDIR','LANG','LC_ALL','SHELL'])if(process.env[k])env[k]=process.env[k];
  Object.assign(env,{DISABLE_AUTOUPDATER:'1',CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC:'1',CLAUDE_CODE_DISABLE_AUTO_MEMORY:'1',CLAUDE_CODE_MAX_OUTPUT_TOKENS:'2048'});
  const args=['--safe-mode','--restricted','--strict-mcp-config','--mcp-config','{"mcpServers":{}}','--disable-slash-commands','--no-chrome','--setting-sources','','--no-session-persistence','--model',model,'--permission-mode','dontAsk','--tools','','--output-format','json','--print'];
  if(rulesText)args.push('--append-system-prompt',rulesText);
  const started=Date.now();
  return await new Promise(resolve=>{
    let stdout='',stderr='',timedOut=false;
    const child=spawn(exe,args,{cwd,env,stdio:['pipe','pipe','pipe']});
    const timer=setTimeout(()=>{timedOut=true;child.kill('SIGTERM');},timeoutMs);
    const hard=setTimeout(()=>child.kill('SIGKILL'),timeoutMs+5000);
    child.stdout.on('data',c=>stdout+=c);child.stderr.on('data',c=>stderr+=c);
    child.on('error',e=>{stderr+=e.message;});
    child.on('close',exitCode=>{clearTimeout(timer);clearTimeout(hard);resolve({exitCode,timedOut,elapsedMs:Date.now()-started,stdout,stderr});});
    child.stdin.on('error',()=>{});child.stdin.end(promptText);
  });
}

export function scoreRun(directory) {
  const run=JSON.parse(fs.readFileSync(path.join(directory,'run.json'),'utf8'));
  const records=[];
  for(const filename of fs.readdirSync(directory).filter(f=>/^batch-\d+-(baseline|rules)\.json$/.test(f)).sort()) {
    const raw=JSON.parse(fs.readFileSync(path.join(directory,filename),'utf8'));
    let cli=null,answers=null,error=null;
    try {
      if(raw.exitCode!==0||raw.timedOut)throw Error(`Execution failed or timed out: ${raw.exitCode}`);
      cli=JSON.parse(raw.stdout);if(cli.is_error)throw Error(cli.result||'Model error');
      answers=parseAnswers(cli.result,raw.cases);
    } catch(e){error=e.message;}
    const u=cli?.usage??{};
    records.push({batch:raw.batch,arm:raw.arm,elapsedMs:raw.elapsedMs,models:Object.keys(cli?.modelUsage??{}),usage:u,
      inputIncludingCache:(u.input_tokens??0)+(u.cache_creation_input_tokens??0)+(u.cache_read_input_tokens??0),outputTokens:u.output_tokens??0,error,
      results:raw.cases.map(c=>({id:c.id,rules:run.cases.find(x=>x.id===c.id).rules,expected:c.expected,actual:answers?.find(a=>a.id===c.id)?.choice??null,status:error?'invalid':answers.find(a=>a.id===c.id).choice===c.expected?'pass':'fail'}))});
  }
  const summary={schemaVersion:1,evidenceLevel:'decision-only',sourceHashes:run.sourceHashes,expectedCasesPerArm:run.cases.length,records,totals:{}};
  for(const arm of ['baseline','rules']){
    const subset=records.filter(r=>r.arm===arm),results=subset.flatMap(r=>r.results);
    summary.totals[arm]={pass:results.filter(r=>r.status==='pass').length,fail:results.filter(r=>r.status==='fail').length,invalid:results.filter(r=>r.status==='invalid').length,notRun:run.cases.length-results.length,
      inputIncludingCache:subset.reduce((s,r)=>s+r.inputIncludingCache,0),outputTokens:subset.reduce((s,r)=>s+r.outputTokens,0),elapsedMs:subset.reduce((s,r)=>s+r.elapsedMs,0),models:[...new Set(subset.flatMap(r=>r.models))]};
  }
  fs.writeFileSync(path.join(directory,'summary.json'),JSON.stringify(summary,null,2)+'\n');
  return summary;
}

function reportRun(directory) {
  const summary=scoreRun(directory);
  const run=JSON.parse(fs.readFileSync(path.join(directory,'run.json'),'utf8'));
  const lines=['# Decision-screen results','','This report grades selected responses to fictional scenarios, not executed development actions. All source bullets have primary scenarios; this does not exhaust every clause or condition.','','| Arm | Pass | Fail | Invalid | Not run | Input including cache | Output | Model-run seconds |','| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |'];
  for(const arm of ['baseline','rules']){const t=summary.totals[arm];lines.push(`| ${arm} | ${t.pass} | ${t.fail} | ${t.invalid} | ${t.notRun} | ${t.inputIncludingCache} | ${t.outputTokens} | ${(t.elapsedMs/1000).toFixed(1)} |`);}
  lines.push('','Resolved models: '+[...new Set(Object.values(summary.totals).flatMap(t=>t.models))].join(', ')+'.','','Cached input is included in token totals; these are not charges or subscription-quota measurements. Timing is a single sample and excludes setup/evaluation work.','','## Per-case evidence','','Expected choices were fixed before execution and omitted from prompts. Tool access was disabled. A correct choice is not evidence of correct real-world execution.','','| Case | Rules covered | Expected | Baseline choice / result | Rules choice / result | Actual tool-use coverage |','| --- | --- | --- | --- | --- | --- |');
  for(const item of run.cases){
    const results={};for(const arm of ['baseline','rules'])results[arm]=summary.records.filter(r=>r.arm===arm).flatMap(r=>r.results).find(r=>r.id===item.id);
    const cell=r=>r?`${r.actual??'none'} / ${r.status}`:'not-run';
    lines.push(`| ${item.id} | ${item.rules.join(', ')} | ${results.baseline?.expected??results.rules?.expected??'not-run'} | ${cell(results.baseline)} | ${cell(results.rules)} | Not exercised by this screen |`);
  }
  lines.push('','## Interpretation limits','','- Recognition of the intended answer is weaker evidence than independent observation of an agent acting correctly.','- The alternative answers are clear and may be easy for a strong model to distinguish without the rules.','- One observation per condition, with multiple cases in each call, cannot establish reliability or causal benefit.','- The reference answers were authored from the rules by the evaluator, not independently validated by a human panel.','- Do not infer that all instructions are effective, safe in every context, redundant, or removable from this screen alone.','- See the evaluation guide for real-action fixture specifications and the complete source-to-case map.','');
  const target=path.join(directory,'REPORT.md');fs.writeFileSync(target,lines.join('\n'));console.log(target);
}

async function run(args) {
  const options={};for(let i=0;i<args.length;i+=2){if(!args[i]?.startsWith('--')||args[i+1]===undefined)throw Error('Use --name value options');options[args[i].slice(2)]=args[i+1];}
  for(const k of Object.keys(options))if(!['claude','model','out','batch-size','max-cases','timeout-ms'].includes(k))throw Error(`Unknown option ${k}`);
  if(!options.claude||!options.model||!options.out)throw Error('run requires --claude PATH --model NAME --out DIRECTORY');
  const batchSize=Number(options['batch-size']??12),max=Number(options['max-cases']??10000),timeoutMs=Number(options['timeout-ms']??90000);
  if(!Number.isInteger(batchSize)||batchSize<1||batchSize>20||!Number.isInteger(max)||max<1||!Number.isFinite(timeoutMs)||timeoutMs<1000||timeoutMs>240000)throw Error('Invalid limits');
  const {items}=validate();
  const selected=items.slice(0,max),shown=selected.map(presented),directory=path.resolve(options.out);
  if(fs.existsSync(directory))throw Error('Output already exists; preserve evidence and use a new directory');
  fs.mkdirSync(directory,{recursive:true,mode:0o700});
  fs.mkdirSync(path.join(directory,'workspace'));
  const rulesText=Object.keys(sourceHashes).map(f=>fs.readFileSync(path.join(repo,f),'utf8')).join('\n\n');
  fs.writeFileSync(path.join(directory,'run.json'),JSON.stringify({schemaVersion:1,modelRequested:options.model,batchSize,timeoutMs,sourceHashes,cases:selected,startedAt:new Date().toISOString()},null,2));
  for(let start=0,batch=0;start<shown.length;start+=batchSize,batch++) {
    const block=shown.slice(start,start+batchSize),promptText=prompt(block);
    fs.writeFileSync(path.join(directory,`batch-${String(batch).padStart(3,'0')}.prompt.txt`),promptText);
    const order=batch%2?['rules','baseline']:['baseline','rules'];
    for(const arm of order){
      console.log(JSON.stringify({event:'start',batch,arm,cases:block.map(c=>c.id)}));
      const raw=await callModel({exe:options.claude,model:options.model,cwd:path.join(directory,'workspace'),promptText,rulesText:arm==='rules'?rulesText:null,timeoutMs});
      fs.writeFileSync(path.join(directory,`batch-${String(batch).padStart(3,'0')}-${arm}.json`),JSON.stringify({...raw,batch,arm,cases:block},null,2),{mode:0o600});
      const summary=scoreRun(directory);
      console.log(JSON.stringify({event:'finished',batch,arm,totals:summary.totals[arm]}));
      if(raw.exitCode!==0||raw.timedOut||summary.records.find(r=>r.batch===batch&&r.arm===arm)?.error){console.error('Stopped on execution/format failure; inspect evidence before retrying.');process.exitCode=1;return;}
    }
  }
}

if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  try{
    const [command,...args]=process.argv.slice(2);
    if(command==='validate'){const x=validate();console.log(JSON.stringify({rules:x.rules.length,cases:x.items.length,unmapped:0}));}
    else if(command==='catalog')writeCatalog();
    else if(command==='run')await run(args);
    else if(command==='score'){if(!args[0])throw Error('score requires a run directory');console.log(JSON.stringify(scoreRun(path.resolve(args[0])).totals,null,2));}
    else if(command==='report'){if(!args[0])throw Error('report requires a run directory');reportRun(path.resolve(args[0]));}
    else throw Error('Commands: validate | catalog | run --claude PATH --model NAME --out DIR | score DIR | report DIR');
  }catch(e){console.error(e.message);process.exitCode=1;}
}
