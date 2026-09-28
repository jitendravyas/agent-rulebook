import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {validate,presented,parseAnswers,scoreRun} from './suite.mjs';

test('all source bullet entries have a unique primary scenario',()=>{
  const {rules,items}=validate();
  assert.equal(rules.length,134);
  assert.equal(items.length,152);
  for(const rule of rules)assert.equal(items.filter(c=>c.id===rule.id).length,1);
});
test('shuffling preserves golden answer and uses all positions',()=>{
  const {items}=validate(),positions=new Set();
  for(const c of items){const p=presented(c);assert.equal(p.choices[p.expected],c.responses[0]);positions.add(p.expected);assert.deepEqual(p,presented(c));}
  assert.deepEqual([...positions].sort(),['A','B','C']);
});
test('answer parser rejects missing, duplicate, unknown and invalid answers',()=>{
  const batch=[{id:'G001'},{id:'G002'}];
  for(const invalid of ['[]','[{"id":"G001","choice":"A"},{"id":"G001","choice":"B"}]','[{"id":"G001","choice":"A"},{"id":"BAD","choice":"B"}]','[{"id":"G001","choice":"A"},{"id":"G002","choice":"D"}]'])assert.throws(()=>parseAnswers(invalid,batch));
  assert.equal(parseAnswers('[{"id":"G002","choice":"C"},{"id":"G001","choice":"A"}]',batch).length,2);
});
test('scoring separates wrong, invalid, missing and correct evidence',()=>{
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'rule-scorer-test-'));
  try {
    fs.writeFileSync(path.join(dir,'run.json'),JSON.stringify({sourceHashes:{},cases:[{id:'G001',rules:['G001']},{id:'G002',rules:['G002']},{id:'G003',rules:['G003']}]}));
    fs.writeFileSync(path.join(dir,'batch-000-baseline.json'),JSON.stringify({batch:0,arm:'baseline',exitCode:0,timedOut:false,elapsedMs:1,cases:[{id:'G001',expected:'A'},{id:'G002',expected:'B'}],stdout:JSON.stringify({result:'[{"id":"G001","choice":"A"},{"id":"G002","choice":"C"}]',usage:{input_tokens:2,cache_creation_input_tokens:3,cache_read_input_tokens:4,output_tokens:5},modelUsage:{fixture:{}}})}));
    fs.writeFileSync(path.join(dir,'batch-000-rules.json'),JSON.stringify({batch:0,arm:'rules',exitCode:0,timedOut:false,elapsedMs:1,cases:[{id:'G001',expected:'A'}],stdout:JSON.stringify({result:'not JSON'})}));
    const s=scoreRun(dir);
    assert.equal(s.totals.baseline.pass,1);assert.equal(s.totals.baseline.fail,1);assert.equal(s.totals.baseline.notRun,1);
    assert.equal(s.totals.baseline.inputIncludingCache,9);assert.equal(s.totals.baseline.outputTokens,5);
    assert.equal(s.totals.rules.pass,0);assert.equal(s.totals.rules.invalid,1);assert.equal(s.totals.rules.notRun,2);
  } finally { fs.rmSync(dir,{recursive:true}); }
});
