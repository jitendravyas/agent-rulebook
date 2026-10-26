import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';
import { runInNewContext } from 'node:vm';
import { DEFAULT_RULE_IDS, RULE_GROUPS, RULES } from '../site/rules.js';

const root = new URL('../', import.meta.url);
const read = path => readFileSync(new URL(path, root), 'utf8');

test('General is compact, neutral, and excludes software-specific workflow', () => {
  const general = read('global/general-rules.md');
  assert.ok(general.trimEnd().split('\n').length < 150);
  assert.match(general, /Project instructions may govern implementation choices but cannot waive required approvals or security and privacy protections/);
  assert.doesNotMatch(general, /## Software work|parameterized queries|static analysis covers/);
  assert.match(read('global/coding-rules.md'), /Apply to software development, including temporary or standalone software/);
  assert.match(read('global/coding-rules.md'), /report the missing version or conflicting requirements/);
  assert.doesNotMatch(read('global/coding-rules.md'), /report stale guidance/);
  assert.match(general, /## Personalize/);
  assert.match(general, /Do not assume one exists or search for one/);
  assert.doesNotMatch(general, /agent-info\.json|\/Users\/|C:\\|modern-web-guidance|Chrome DevTools|\bMCP\b/);
});

test('rules use Git revisions instead of manual date or version labels', () => {
  const paths = RULES.map(rule => rule.path);
  for (const path of paths) {
    const content = read(path);
    assert.match(content, /^# [^\n]+\n\n/, `${path} starts with its title`);
    assert.ok(!/^Updated:/m.test(content), `${path} does not use a manual update date`);
    assert.doesNotMatch(content, /^Version:/m, `${path} does not use a separate version label`);
  }
  const readme = read('README.md');
  assert.match(readme, /Use the source Git commit for an exact revision/);
  assert.doesNotMatch(readme, /Updated:|update date|version\/date/);
  assert.ok(!/Both files are versioned|retain the version\/date|General and Coding files now include a version/.test(readme), 'README does not describe the removed version labels');
});

test('General covers unattended approval, persistent memory, and final self-review', () => {
  const general = read('global/general-rules.md');
  const approvals = general.split('## Required approval\n')[1].split('\n## ')[0];
  assert.match(approvals, /approval or a material decision is needed and no one can respond during the run/);
  assert.match(approvals, /finish safe, independent, authorized work, then report what is blocked/);
  assert.match(approvals, /Do not wait indefinitely or treat silence as approval/);
  const privacy = general.split('## Security and privacy\n')[1].split('\n## ')[0];
  assert.match(privacy, /When persistent memory use is authorized, save only confirmed, reusable facts or preferences/);
  assert.match(privacy, /applicable scope/);
  assert.match(privacy, /Save sensitive personal, customer, or confidential details only when needed for an explicitly authorized memory purpose/);
  assert.match(privacy, /Keep real secrets[^\n]*out of[^\n]*persistent memory/);
  assert.match(privacy, /Do not retain guesses or temporary task state as reusable guidance/);
  const completion = general.split('## Verification and completion\n')[1].split('\n## ')[0];
  assert.match(completion, /Before handing off changed work, review your final changes against the request/);
  assert.match(completion, /omissions, unintended edits, and obsolete task-created output/);
  assert.doesNotMatch(read('global/version-control-rules.md'), /Before using restore, checkout, clean, reset, stash/);
  assert.match(general, /Before destructive actions or cleanup, verify exact targets and full scope/);
});

test('General includes communication and tool guidance without duplicate bullets', () => {
  const general = read('global/general-rules.md');
  for (const safeguard of [
    'Search narrowly, not across the whole home folder or device',
    'Do not assume shared tools, accounts, or budgets',
    'Stop only your temporary processes',
    'Delegation cannot expand authority',
    'When attempts make no useful progress, pause affected work',
    'Establish recovery for partial or inconsistent changes',
    'During long work, report blockers',
    'Store artifacts in permitted temporary locations outside project sources and version control',
  ]) assert.ok(general.includes(safeguard), `General retains: ${safeguard}`);
  assert.match(general, /Simple status questions usually need one sentence/);
  assert.match(general, /Allow for spelling, dictation, transcription errors/);
  assert.match(general, /Assess recommendations against evidence and goals, not agreement alone/);
  assert.match(general, /Avoid unnecessary processing, memory, transfers, loading, rendering, and asset size/);
  assert.match(general, /When moving, renaming, removing, or reversing files, update affected references and dependencies/);
  assert.match(general, /For repetitive or mechanical work, prefer available tools and skills/);
  assert.match(general, /recommend simpler steps, automation, or a reusable agent-led skill if the agent supports skills/);
  assert.match(general, /Search for or recommend alternatives only when expected benefits outweigh discovery, setup, upkeep, and delivery effort/);
  assert.match(general, /Before recommending adoption of or adopting a third-party tool, check official sources for license or service terms relevant to the intended use/);
  assert.match(general, /Use authoritative documentation or built-in help for uncertain version-sensitive commands/);
  assert.match(general, /Before starting long-running processes, check for a suitable running instance/);
  assert.match(general, /Reply in chat instead of saving plans, notes, reports, or other documents unless the user requested the file or approves it first/);
  const communication = general.split('## Communication\n')[1].split('\n## ')[0];
  assert.match(communication, /If a visual or interactive artifact would explain better than chat, propose an available format/);
  assert.doesNotMatch(communication, /\bHTML\b|\bPDF\b|Mermaid/);
  assert.match(communication, /its benefit, and safe viewing method, including remote or headless use/);
  assert.match(communication, /Create only when requested or approved/);
  assert.match(communication, /use chat if safe access is unavailable/);
  assert.match(communication, /unless another location is approved/);
  assert.match(communication, /Avoid disruption; use motion only when it helps explain/);
  assert.doesNotMatch(general, /Create temporary explanatory artifacts only when/);
  assert.ok(!existsSync(new URL('optional/communication-rules.md', root)));
  assert.ok(!existsSync(new URL('optional/tools-execution-rules.md', root)));
  const combined = [general];
  const bullets = combined.flatMap(content => content.split('\n').filter(line => /^\s*\* /.test(line)).map(line => line.trim()));
  assert.equal(new Set(bullets).size, bullets.length, 'General contains each bullet once');
});

test('input validation preserves trust boundaries without requiring redundant internal checks', () => {
  const coding = read('global/coding-rules.md');
  assert.match(coding, /Validate untrusted input at each receiving trust boundary before use or storage: required fields, types, nulls, sizes, ranges, and business constraints/);
  assert.match(coding, /Include files and external services; types alone do not establish that external data is valid/);
  assert.match(coding, /Within a trusted internal flow, reuse established validation guarantees unless the data changes in a way that invalidates them/);
  assert.match(coding, /bound accepted work and output with appropriate abuse controls, observable limits, and recoverable failures/);
  assert.doesNotMatch(coding, /earlier validation is insufficient/);
});

test('tool and coding guidance respects assessment scope and supported project setups', () => {
  const general = read('global/general-rules.md');
  assert.match(general, /including output, distribution, and attribution/);
  assert.match(general, /Assess material maintenance, compatibility, access, and workplace-policy risks/);
  assert.match(general, /Merely mentioning an option does not require a full assessment; do not present unchecked suitability as verified/);
  assert.match(general, /Reuse valid assessments but recheck changed uses or concerns/);
  const coding = read('global/coding-rules.md');
  assert.doesNotMatch(general, /private dependencies/);
  assert.equal(coding.split('Never replace private dependencies with public ones silently.').length - 1, 1);
  assert.match(coding, /For new choices, prefer maintained solutions compatible with supported versions/);
  assert.match(coding, /For existing dependencies, report relevant maintenance or compatibility risks without expanding the task into an upgrade/);
  assert.match(coding, /use new capabilities only after required upgrades are approved and installed/);
  assert.match(coding, /Make approved dependencies and versions reproducible through the project's supported setup/);
  assert.match(coding, /do not rely on undocumented machine-specific installations/);
  assert.doesNotMatch(coding, /instead of relying on global installations/);
  assert.match(coding, /When using or relying on static analysis, check that it covers changed paths, file types, and intended rules, respecting intentional exclusions/);
  assert.match(coding, /Use only narrow, justified, project-allowed suppressions or type-check bypasses; explain them and ask before policy changes/);
  assert.match(coding, /Coverage gaps alone do not justify new tools/);
});

test('grouped approval rules retain dependency safeguards and software exceptions', () => {
  const general = read('global/general-rules.md');
  assert.match(general, /Sending messages or submitting work outside this conversation; publishing/);
  const restore = general.match(/^ {4}\* You may restore needed locked project dependencies[^\n]*\n(?: {6}\* [^\n]*\n)+/m)?.[0];
  assert.ok(restore, 'dependency restoration has a separate safeguard list');
  for (const requirement of [
    'established workflow', 'Inspect commands and relevant install scripts',
    'compatible installed tools', 'declarations, lockfiles, versions, and authorized sources',
    'task environment and expected tool-cache writes', 'Ask if effects are unclear',
    'undeclared dependencies or new runtime requirements', 'elevated access or system changes',
    'Ask before cache deletion or unauthorized transfers',
  ]) {
    assert.ok(restore.includes(requirement), `dependency restoration retains: ${requirement}`);
  }
  const approvals = read('global/coding-rules.md')
    .split('## Software-specific approvals\n')[1].split('\n## ')[0];
  assert.match(approvals, /Unless the action and target are already authorized within the current scope, ask before:\n/);
  assert.equal([...approvals.matchAll(/Unless the action and target/g)].length, 1);
  for (const category of [
    'Changing dependency, runtime, or package-manager requirements',
    'Changing existing public application programming interfaces (APIs), shared schemas, or data contracts',
    'Changing app permissions or entitlements',
    'Deploying software', 'Applying migrations to existing persistent or shared stores',
  ]) {
    assert.ok(approvals.includes(`  * ${category}.`), `approval remains required for: ${category}`);
  }
  assert.match(approvals, /Authorized new-project setup and confirmed disposable test stores need no separate migration approval/);
  assert.match(approvals, /Reverting code does not undo database or service changes/);
  assert.doesNotMatch(approvals, /signing|store settings|minimum platform|software development kit/);
  for (const path of ['project/apple-app-development-rules.md', 'project/android-app-development-rules.md']) {
    assert.ok(read(path).includes('Unless the action and target are already authorized within the current scope, ask before changing app signing, app store settings, or minimum platform or software development kit (SDK) versions.'), `${path} retains app-specific approvals and their exception`);
  }
  assert.match(read('global/coding-rules.md'), /Preserve compatibility for existing stored formats and consumers that cannot update together/);
});

test('repository prose uses American spelling while source paths stay unchanged', () => {
  const paths = [
    ...RULES.map(rule => rule.path),
    'AGENTS.md', 'README.md',
  ];
  const britishSpellings = /\b(?:authorised|authorisation|behaviour|licence|personalis(?:e[ds]?|ing|ation)|generalis(?:e[ds]?|ing|ations?)|internationalisation|localisation|localisable|localised|organisations?|normalisation|parameterised|sanitisers?|sanitised|cancelled|colour|synchronisation|recognise)\b/i;
  for (const spelling of ['generalise', 'generalised', 'generalises', 'generalising', 'generalisation', 'personalise', 'personalised', 'personalises', 'personalising', 'personalisation']) {
    assert.ok(britishSpellings.test(spelling), `detects ${spelling}`);
  }
  for (const spelling of ['generalizing', 'generalization', 'personalization', 'exercise', 'surprise', 'franchise']) {
    assert.ok(!britishSpellings.test(spelling), `permits ${spelling}`);
  }
  for (const path of paths) {
    const prose = read(path).replace(/`[^`]*`|https?:\/\/[^\s<>")\]]+|^>.*$|“[^”]*”/gm, '');
    assert.ok(!britishSpellings.test(prose), `${path} uses American spellings in prose`);
  }
  for (const entry of [...RULES, ...RULE_GROUPS]) {
    for (const field of ['title', 'label', 'description', 'purpose']) {
      if (typeof entry[field] === 'string') {
        assert.ok(!britishSpellings.test(entry[field]), `${entry.id}.${field} uses American spellings`);
      }
    }
  }
  assert.match(read('README.md'), /American English is used consistently/);
  assert.match(read('AGENTS.md'), /Use American English for repository prose/);
  const rule = RULES.find(rule => rule.id === 'i18n');
  assert.equal(rule.path, 'project/internationalization-localization-rules.md');
});

test('rule files stand alone without website-driven formatting or imports', () => {
  for (const { path } of RULES) {
    const content = read(path);
    assert.match(content, /^# [^\n]+\n\n/, `${path} starts with its title`);
    assert.doesNotMatch(content, /(?:agent-global|coding-agent-global|web-development|software-testing|browser-verification|version-control|browser-use|computer-use)-rules\.md/);
    for (const other of RULES.filter(rule => rule.path !== path)) {
      assert.ok(!content.includes(other.path.split('/').at(-1)), `${path} does not reference ${other.path}`);
    }
  }
  assert.match(read('AGENTS.md'), /Each reusable rule file must stand on its own within its stated scope/);
  assert.match(read('AGENTS.md'), /Write rules for agent behavior, not for the website's prompt format/);
  assert.match(read('project/interactive-ui-animation-rules.md'), /Honor available reduced-motion preferences for nonessential animation/);
  assert.match(read('AGENTS.md'), /not a copy of the whole general-purpose rule set/);
});

test('platform-agnostic guidance leaves browser translation mechanisms in Web development', () => {
  const area = RULE_GROUPS.find(group => group.id === 'project').areas.find(area => area.id === 'across');
  for (const rule of area.rules) {
    assert.doesNotMatch(read(rule.path), /translate="no"|browser-delivered interfaces|Browser translation or language-detection APIs/i);
  }
  const localization = read('project/internationalization-localization-rules.md');
  assert.match(localization, /Follow existing glossaries and do-not-translate terms/);
  assert.match(localization, /use the platform's language and direction mechanisms/);
  const web = read('project/web-development-rules.md');
  assert.match(web, /For browser translation, use `translate="no"` where applicable/);
  assert.match(web, /Do not disable whole-page translation merely to protect a few names or terms/);
  assert.match(web, /verify document language and direction, logical layout behavior, and focus order/);
  assert.match(web, /Browser translation or language-detection APIs do not replace approved product translations, locale selection, or server-side support/);
});

test('README and scenarios cover the separate browser and desktop choices', () => {
  const readme = read('README.md');
  for (const rule of RULES) {
    assert.ok(readme.includes(`](${rule.path})`), `README links to ${rule.path}`);
  }
  assert.ok(!readme.includes('browser-computer-use-rules.md'));
  const scenarios = read('tests/agent-rule-scenarios.md');
  assert.match(scenarios, /Browser use, and Computer use selections/);
  assert.match(scenarios, /mock desktop login interface/);
  assert.match(scenarios, /Browser use alone, without Computer use/);
});

test('Web development preserves browser verification safeguards and covers automated checks', () => {
  const verification = read('project/web-development-rules.md');
  assert.match(verification, /^## Browser verification$/m);
  assert.match(verification, /Preserve required test isolation when reusing sessions/);
  assert.match(verification, /a disposable browser profile does not isolate backend data/);
  assert.match(verification, /Use real accounts or persistent profiles only when required and authorized/);
  const purpose = RULES.find(rule => rule.id === 'web').description;
  const readmeEntry = read('README.md').split('\n').find(line => line.startsWith('- [Web development]'));
  for (const text of [purpose, readmeEntry]) {
    assert.match(text, /manual or automated checks/);
    assert.doesNotMatch(text, /separate from .*writing or running automated tests/);
  }
});

test('README keeps Personalize last and independent when combining files', () => {
  const guidance = read('README.md').match(/^When combining files,[^\n]+/m)?.[0];
  assert.ok(guidance, 'README explains how to combine files');
  assert.match(guidance, /if General is included/);
  assert.match(guidance, /General first, selected add-ons next/);
  assert.match(guidance, /move General's \*\*Personalize\*\* section.*to the end/);
  assert.match(guidance, /Change its heading to `# Personalize` so it is separate from every add-on/);
  assert.match(guidance, /Keep `## Personalize` when using General alone/);
  assert.match(read('global/general-rules.md'), /^## Personalize$/m);
});

test('README and website distinguish relevant modules from loading the whole collection', () => {
  const readme = read('README.md');
  assert.match(readme, /Do not load the whole collection by default/);
  assert.match(readme, /user-level `AGENTS\.md` or `CLAUDE\.md` when supported/);
  assert.match(readme, /Each rule file is independent; none requires General or another module/);
  assert.match(readme, /Preserve required approval, security, and privacy protections/);
  assert.match(readme, /An “Apply when” sentence limits behavior, not context use/);
  assert.match(readme, /Separate files save context only when irrelevant files stay unloaded/);
  assert.equal([...readme.matchAll(/There is no universal maximum rule-file size/g)].length, 1);
  assert.equal([...readme.matchAll(/Imports alone do not reduce context use/g)].length, 1);
  assert.match(readme, /### Instruction loading and size/);
  assert.match(readme, /broad global defaults, optional activity guidance, and reusable project-scoped rules/);
  assert.match(readme, /confirms activity placement from intended use/);
  assert.match(readme, /A file in `global\/` does not require global installation/);
  assert.match(readme, /If narrower loading is unavailable for occasional work, use task-specific guidance/);
  assert.match(readme, /Keep each project's own commands, layout, style, tools, and requirements in its handbook, not user-level global rules/);
  assert.match(readme, /Skills.*separate, on-demand playbooks/);
  assert.match(readme, /open that project first; review another project separately/);
  assert.match(readme, /\[Use the website\]\(https:\/\/jitendravyas\.github\.io\/agent-rulebook\/\)/);
  assert.doesNotMatch(readme, /either group or both/);
  assert.match(readme, /For one-off work without project instructions, ask for task-scoped guidance/);
  assert.match(readme, /Links restore choices, not a fixed rule version or a record of what you adopted/);
  assert.doesNotMatch(readme, /\]\((?:AGENTS\.md|\.github\/workflows\/[^)]+)\)/, 'Published README does not link to files omitted from the website artifact');
  for (const path of ['AGENTS.md', '.github/workflows/vale.yml', '.github/workflows/website.yml']) {
    assert.ok(readme.includes(`https://github.com/jitendravyas/agent-rulebook/blob/main/${path}`), `${path} resolves through the repository`);
  }
  const html = read('index.html');
  assert.match(html, /The review scope for your selected rules appears here/);
  const defaults = html.match(/<p\b[^>]*id="selection-purpose"[^>]*>([\s\S]*?)<\/p>/)?.[1];
  assert.match(defaults, /Choose your tasks, preview the prompt, and paste it into your agent’s chat/);
  assert.match(html, /<div id="customize-rules"[^>]*aria-labelledby="customize-toggle" hidden>/);
  assert.ok(html.indexOf('id="task-presets"') < html.indexOf('id="customize-rules"'));
  assert.ok(html.indexOf('id="customize-rules"') < html.indexOf('id="rule-groups"'));
  assert.match(html, /Shared rules are included once and kept while another selected task needs them/);
  assert.match(html, /id="project-selection-note"[^>]*hidden>For project-specific rules, select what applies to one project\. Repeat for other projects\./);
  assert.ok(html.indexOf('id="project-selection-note"') < html.indexOf('id="preview-prompt"'));
  assert.match(html, /Tasks select rules, not tools or skills/);
  assert.match(html, /<details class="placement-help"><summary>About this size<\/summary><p>Each source is counted once\. This measures file bytes, not prompt size or tokens/);
  assert.match(readme, /Individual rules remain independently selectable: OS rules above the task choices/);
  assert.match(readme, /Click \*\*Preview prompt\*\* when your selection is ready/);
  assert.ok(html.indexOf('id="selection-next"') < html.indexOf('id="rule-form"'));
  const descriptions = html.match(/<form\b[^>]*id="rule-form"[^>]*aria-describedby="([^"]+)"/)?.[1].split(/\s+/);
  assert.deepEqual(descriptions, ['agent-fit', 'selection-purpose', 'selection-next']);
  assert.doesNotMatch(html, /id="scope-global"|id="scope-project"|name="review-scope"/);
  assert.match(html, /This website does not replace your instructions/);
  const nextStep = html.match(/<section class="next-step"[^>]*>([\s\S]*?)<\/section>/)?.[1];
  assert.match(nextStep, /<p id="project-handoff" hidden>For project rules, open that project first\.<\/p>/);
  assert.match(nextStep, /Review one project at a time/);
  assert.match(nextStep, /For one-off work without project instructions, ask for guidance only for that conversation/);
  assert.match(nextStep, /don’t have instructions yet[^<]*propose where to create them/i);
  assert.match(nextStep, /Review the proposed changes and backup locations before approving edits to each file/i);
  assert.match(nextStep, /instructions being reviewed/);
  assert.match(html, /Preserve required approval, security, and privacy protections/);
  assert.match(html, /An “Apply when” sentence does not keep unused text out of context/);
  const guideURL = html.match(/<a href="([^"]+)">module-loading guide<\/a>/)?.[1];
  assert.equal(guideURL, 'https://github.com/jitendravyas/agent-rulebook#choose-only-relevant-rule-sets');
});

test('website workflow checks relevant changes and gates main deployment on successful tests', () => {
  const workflow = read('.github/workflows/website.yml');
  for (const event of ['push', 'pull_request']) {
    const section = workflow.match(new RegExp(`^  ${event}:\n([\\s\\S]*?)(?=^  \\w+:|^\\S|(?![\\s\\S]))`, 'm'))?.[1];
    assert.ok(section, `${event} has a trigger configuration`);
    assert.match(section, /^      - AGENTS\.md$/m, `${event} covers AGENTS.md`);
    assert.match(section, /^      - 'tests\/\*\*'$/m, `${event} covers test changes`);
    assert.match(section, /^      - 'global\/\*\*'$/m, `${event} covers global rules`);
    assert.match(section, /^      - 'project\/\*\*'$/m, `${event} covers project rules`);
    assert.match(section, /^      - README\.md$/m, `${event} covers the behavior checks`);
  }
  const deploy = workflow.split('\n  deploy:\n')[1];
  assert.ok(deploy, 'The workflow has a deployment job');
  assert.match(deploy, /^    needs: website$/m, 'Deployment waits for website checks and artifact upload');
  assert.match(deploy, /^    if: github\.event_name == 'push' && github\.ref == 'refs\/heads\/main'$/m);
  assert.match(deploy, /^      pages: write$/m);
  assert.match(deploy, /^      id-token: write$/m);
  assert.match(deploy, /name: github-pages/);
  assert.match(deploy, /uses: actions\/deploy-pages@[a-f0-9]{40}/);
  const checks = workflow.split('\n  deploy:\n')[0];
  assert.ok(checks.indexOf('run: node --test tests/*.test.js') < checks.indexOf('name: Prepare the static website'));
  assert.match(checks, /cp -R global project "\$RUNNER_TEMP\/rulebook-site\/"/);
  assert.doesNotMatch(checks, /cp -R[^\n]*tests/, 'Behavior tests are not published as website assets');
  assert.match(checks, /uses: actions\/upload-pages-artifact@[a-f0-9]{40}/);
  assert.doesNotMatch(checks, /^      pages: write$|^      id-token: write$/m, 'The test job has no deployment permissions');
});

test('deployment versions the page assets and imported catalog together without changing rules', () => {
  const workflow = read('.github/workflows/website.yml');
  assert.match(workflow, /RULEBOOK_DEPLOYMENT_SHA: \$\{\{ github\.sha \}\}/);
  const script = workflow.match(/^          node - <<'NODE'\n([\s\S]*?)^          NODE$/m)?.[1];
  assert.ok(script, 'The deployment prepares versioned assets');
  const run = (version, alter = files => files) => {
    const files = alter(new Map([
      ['/build/index.html', read('index.html')],
      ['/build/site/app.js', read('site/app.js')],
      ['/build/site/rules.js', read('site/rules.js')],
      ['/build/global/general-rules.md', read('global/general-rules.md')],
    ]));
    const writes = [];
    const execute = () => runInNewContext(script.replace(/^ {10}/gm, ''), {
      process: { env: { RULEBOOK_STATIC_DIR: '/build', RULEBOOK_DEPLOYMENT_SHA: version } },
      require: name => {
        assert.equal(name, 'node:fs');
        return {
          readFileSync: path => { assert.ok(files.has(path)); return files.get(path); },
          writeFileSync: (path, content) => { writes.push(path); files.set(path, content); },
        };
      },
    });
    return { files, writes, execute };
  };
  for (const version of ['a'.repeat(40), 'b'.repeat(40)]) {
    const result = run(version);
    result.execute();
    assert.ok(result.files.get('/build/index.html').includes(`href="./site/styles.css?v=${version}"`));
    assert.ok(result.files.get('/build/index.html').includes(`src="./site/app.js?v=${version}"`));
    assert.ok(result.files.get('/build/site/app.js').includes(`from './rules.js?v=${version}';`));
    assert.ok(result.files.get('/build/site/app.js').includes(`const DEPLOYMENT_VERSION = '${version}';`));
    assert.equal(JSON.parse(result.files.get('/build/version.json')).version, version);
    assert.equal(result.files.get('/build/site/rules.js'), read('site/rules.js'));
    assert.equal(result.files.get('/build/global/general-rules.md'), read('global/general-rules.md'));
    assert.deepEqual(result.writes, ['/build/index.html', '/build/site/app.js', '/build/version.json']);
  }
  const invalidVersion = run('not-a-commit');
  assert.throws(invalidVersion.execute, /deployment version/);
  assert.deepEqual(invalidVersion.writes, []);
  for (const count of [0, 2]) {
    const changedVersion = run('a'.repeat(40), files => {
      files.set('/build/site/app.js', read('site/app.js').replace("const DEPLOYMENT_VERSION = '';", "const DEPLOYMENT_VERSION = '';".repeat(count)));
      return files;
    });
    assert.throws(changedVersion.execute, /exactly one/);
    assert.deepEqual(changedVersion.writes, []);
    const changedImport = run('a'.repeat(40), files => {
      files.set('/build/site/app.js', "from './rules.js';".repeat(count));
      return files;
    });
    assert.throws(changedImport.execute, /exactly one/);
    assert.deepEqual(changedImport.writes, [], 'Reject uncertain replacements before writing either asset');
  }
});

test('shared coding guidance has one canonical file and General is the default selection', () => {
  assert.ok(existsSync(new URL('global/coding-rules.md', root)));
  assert.equal(RULES.filter(rule => rule.id === 'coding').length, 1);
  assert.deepEqual(DEFAULT_RULE_IDS, ['general']);
  assert.ok(DEFAULT_RULE_IDS.every(id => RULES.some(rule => rule.id === id)));
});

test('README setup advice and standalone scenarios stay outside agent rule sources', () => {
  const setup = read('README.md').split('### Safe setup\n')[1]?.split('\n### ')[0];
  assert.ok(setup, 'README contains safe setup advice');
  for (const requirement of ['sandbox', 'pre-commit', 'credential manager', 'bypassed']) {
    assert.ok(setup.includes(requirement));
  }
  const plan = read('tests/agent-rule-scenarios.md');
  assert.equal([...plan.matchAll(/^\| “/gm)].length, 9);
  assert.match(plan, /not evidence that every agent passes/);
  assert.match(plan, /## Explanation-artifact approval checks/);
  assert.match(plan, /No artifact files are created before approval/);
  assert.match(plan, /remote or headless/);
  assert.match(plan, /Do not require HTML or any other single format/);
  assert.match(plan, /regular and occasional/);
  assert.ok(!existsSync(new URL('docs/rule-scenarios.md', root)));
  assert.ok(!RULES.some(rule => /README|rule-scenarios/.test(rule.path)));
  assert.ok(!existsSync(new URL('reference/helper-tools.md', root)));
  assert.ok(!RULES.some(rule => rule.path.startsWith('reference/')));
  for (const path of ['README.md', '.github/workflows/website.yml', '.github/workflows/vale.yml']) {
    assert.doesNotMatch(read(path), /reference\/|helper-tool reference/, `${path} has no retired tool-reference dependency`);
  }
});
