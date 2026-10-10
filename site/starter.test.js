import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import test from 'node:test';
import { PRESETS, RULE_GROUPS, RULES } from './rules.js';

const root = new URL('../', import.meta.url);
const read = path => readFileSync(new URL(path, root), 'utf8');
const modules = [
  'coding-agent-global-rules.md',
  'web-development-rules.md',
  'optional/software-testing-rules.md',
  'optional/version-control-rules.md',
  'optional/browser-computer-use-rules.md',
];

test('General is compact, neutral, and excludes software-specific workflow', () => {
  const general = read('agent-global-rules.md');
  assert.ok(general.trimEnd().split('\n').length < 150);
  assert.match(general, /Project instructions govern implementation choices, but cannot waive/);
  assert.doesNotMatch(general, /## Software work|parameterized queries|static analysis covers/);
  assert.match(read('coding-agent-global-rules.md'), /^Apply only to software development/m);
  assert.match(general, /## Personalize/);
  assert.match(general, /Do not assume one exists or search for one/);
  assert.doesNotMatch(general, /agent-info\.json|\/Users\/|C:\\|modern-web-guidance|Chrome DevTools|\bMCP\b/);
});

test('published and draft rule files have one valid update date near the title, without version labels', () => {
  const paths = [
    ...RULES.map(rule => rule.path),
    ...readdirSync(new URL('drafts/', root))
      .filter(path => path.endsWith('-rules.md'))
      .map(path => `drafts/${path}`),
  ];
  for (const path of paths) {
    const content = read(path);
    const dates = [...content.matchAll(/^Updated: (.+)$/gm)];
    assert.equal(dates.length, 1, `${path} has exactly one update date`);
    const date = dates[0][1];
    assert.match(date, /^\d{4}-\d{2}-\d{2}$/, `${path} uses YYYY-MM-DD`);
    const parsed = new Date(`${date}T00:00:00Z`);
    assert.ok(!Number.isNaN(parsed.getTime()), `${path} has a valid date`);
    assert.equal(parsed.toISOString().slice(0, 10), date, `${path} has a real calendar date`);
    assert.match(content.split('\n').slice(0, 7).join('\n'), /^# [^\n]+\n[\s\S]*\nUpdated: \d{4}-\d{2}-\d{2}(?:\n|$)/);
    assert.doesNotMatch(content, /^Version:/m, `${path} does not use a separate version label`);
  }
  const readme = read('README.md');
  assert.match(readme, /Each rule file, including drafts, has an `Updated: YYYY-MM-DD` date/);
  assert.ok(!/Both files are versioned|retain the version\/date|General and Coding files now include a version/.test(readme), 'README does not describe the removed version labels');
});

test('General covers unattended approval, persistent memory, and final self-review', () => {
  const general = read('agent-global-rules.md');
  const approvals = general.split('## Required approval\n')[1].split('\n## ')[0];
  assert.match(approvals, /approval or a material decision is needed and no one can respond during the run/);
  assert.match(approvals, /finish safe, independent, authorized work, then report what is blocked/);
  assert.match(approvals, /Do not wait indefinitely or treat silence as approval/);
  const privacy = general.split('## Security and privacy\n')[1].split('\n## ')[0];
  assert.match(privacy, /When persistent memory use is authorized, save only confirmed, reusable facts or preferences/);
  assert.match(privacy, /applicable scope/);
  assert.match(privacy, /Do not retain guesses or temporary task state as reusable guidance/);
  const completion = general.split('## Verification and completion\n')[1].split('\n## ')[0];
  assert.match(completion, /Before handing off changed work, review your final changes against the request/);
  assert.match(completion, /omissions, unintended edits, and obsolete task-created output/);
  assert.doesNotMatch(read('optional/version-control-rules.md'), /Before using restore, checkout, clean, reset, stash/);
  assert.match(general, /Before destructive actions or cleanup, verify exact targets and full scope/);
});

test('grouped approval rules retain dependency safeguards and software exceptions', () => {
  const general = read('agent-global-rules.md');
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
  const approvals = read('coding-agent-global-rules.md')
    .split('## Software-specific approvals\n')[1].split('\n## ')[0];
  assert.match(approvals, /Unless the action and target are already authorized within the current scope, ask before:\n/);
  assert.equal([...approvals.matchAll(/Unless the action and target/g)].length, 1);
  for (const category of [
    'Changing dependency, runtime, or package-manager requirements',
    'Changing existing public application programming interfaces (APIs), shared schemas, or data contracts',
    'Changing app permissions, entitlements, signing, or store settings',
    'Changing minimum platform or software development kit (SDK) versions',
    'Deploying software', 'Applying migrations to existing persistent or shared stores',
  ]) {
    assert.ok(approvals.includes(`  * ${category}.`), `approval remains required for: ${category}`);
  }
  assert.match(approvals, /Authorized new-project setup and confirmed disposable test stores need no separate migration approval/);
  assert.match(approvals, /Reverting code does not undo database or service changes/);
});

test('repository prose uses American spelling while source paths stay unchanged', () => {
  const paths = [
    ...RULES.map(rule => rule.path),
    'AGENTS.md', 'README.md', 'optional/helper-tools.md', 'docs/rule-scenarios.md',
    ...readdirSync(new URL('drafts/', root))
      .filter(path => path.endsWith('-rules.md'))
      .map(path => `drafts/${path}`),
  ];
  const britishSpellings = /\b(?:authorised|authorisation|behaviour|licence|personalise|internationalisation|localisation|localisable|localised|organisations?|normalisation|parameterised|sanitisers?|sanitised|cancelled|colour|synchronisation|recognise)\b/i;
  for (const path of paths) {
    const prose = read(path).replace(/`[^`]*`|https?:\/\/[^\s<>")\]]+|^>.*$|“[^”]*”/gm, '');
    assert.ok(!britishSpellings.test(prose), `${path} uses American spellings in prose`);
  }
  for (const entry of [...RULES, ...RULE_GROUPS]) {
    for (const field of ['title', 'label', 'description', 'purpose', 'summary']) {
      if (typeof entry[field] === 'string') {
        assert.ok(!britishSpellings.test(entry[field]), `${entry.id}.${field} uses American spellings`);
      }
    }
  }
  assert.match(read('README.md'), /American English is used consistently/);
  assert.match(read('AGENTS.md'), /Use American English for repository prose/);
  const rule = RULES.find(rule => rule.id === 'i18n');
  assert.equal(rule.path, 'optional/internationalization-localization-rules.md');
  const title = read(rule.path).split('\n')[0].replace(/^# /, '');
  assert.equal(rule.title, title);
  assert.ok(read('index.html').includes(`type="text/markdown">${title}</a>`));
});

test('opt-in modules put applicability beneath their title and do not import other rule files', () => {
  for (const path of modules) {
    const content = read(path);
    assert.match(content.split('\n').slice(0, 3).join('\n'), /^# [^\n]+\n\nApply (?:when|only to) /);
    assert.doesNotMatch(content, /(?:agent-global|coding-agent-global|web-development|software-testing|version-control|browser-computer-use)-rules\.md/);
    assert.ok(RULES.some(rule => rule.path === path));
  }
});

test('README keeps Personalize last when combining files', () => {
  const guidance = read('README.md').match(/^When combining files,[^\n]+/m)?.[0];
  assert.ok(guidance, 'README explains how to combine files');
  assert.match(guidance, /General first, selected add-ons next/);
  assert.match(guidance, /move General's \*\*Personalize\*\* section.*to the end/);
});

test('README and website distinguish relevant modules from loading the whole collection', () => {
  const readme = read('README.md');
  assert.match(readme, /Do not load the whole collection by default/);
  assert.match(readme, /Keep General, or equivalent safety guidance, active/);
  assert.match(readme, /An “Apply when” sentence limits behavior, not context use/);
  assert.match(readme, /Separate files save context only when irrelevant files stay unloaded/);
  const html = read('index.html');
  assert.match(html, /General alone can be enough/);
  assert.match(html, /keep General or equivalent safety guidance active/);
  assert.match(html, /An “Apply when” sentence does not keep unused text out of context/);
  assert.match(html, /README\.md#choose-general-then-relevant-add-ons/);
});

test('shared coding guidance has one canonical file and presets use it', () => {
  assert.ok(existsSync(new URL('coding-agent-global-rules.md', root)));
  assert.equal(RULES.filter(rule => rule.id === 'coding').length, 1);
  assert.deepEqual(PRESETS.find(preset => preset.id === 'general').ids, ['general']);
  assert.deepEqual(PRESETS.find(preset => preset.id === 'coding').ids, ['general', 'coding']);
  for (const preset of PRESETS) {
    assert.ok(preset.ids.includes('general'));
    assert.ok(preset.ids.every(id => RULES.some(rule => rule.id === id)));
  }
});

test('README setup advice and eight scenario checks stay separate from agent rule sources', () => {
  const setup = read('README.md').split('### Safe setup\n')[1]?.split('\n### ')[0];
  assert.ok(setup, 'README contains safe setup advice');
  for (const requirement of ['sandbox', 'pre-commit', 'credential manager', 'bypassed']) {
    assert.ok(setup.includes(requirement));
  }
  const plan = read('docs/rule-scenarios.md');
  assert.equal([...plan.matchAll(/^\| “/gm)].length, 8);
  assert.match(plan, /not evidence that every agent passes/);
  assert.ok(!RULES.some(rule => /README|rule-scenarios/.test(rule.path)));
});
