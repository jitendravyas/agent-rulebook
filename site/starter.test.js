import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';
import { PRESETS, RULES } from './rules.js';

const root = new URL('../', import.meta.url);
const read = path => readFileSync(new URL(path, root), 'utf8');
const modules = [
  'web-development-rules.md',
  'optional/software-testing-rules.md',
  'optional/version-control-rules.md',
  'optional/browser-computer-use-rules.md',
];

test('General is compact, versioned, neutral, and excludes software-specific workflow', () => {
  const general = read('agent-global-rules.md');
  assert.ok(general.trimEnd().split('\n').length < 150);
  assert.match(general, /Version: \d+\.\d+\.\d+ · Updated: \d{4}-\d{2}-\d{2}/);
  assert.match(general, /Project instructions govern implementation choices, but cannot waive/);
  assert.doesNotMatch(general, /## Software work|parameterised queries|static analysis covers/);
  assert.match(read('coding-agent-global-rules.md'), /^Apply only to software development/);
  assert.match(general, /## Personalise/);
  assert.match(general, /Do not assume one exists or search for one/);
  assert.doesNotMatch(general, /agent-info\.json|\/Users\/|C:\\|modern-web-guidance|Chrome DevTools|\bMCP\b/);
});

test('opt-in modules start with applicability and do not import other rule files', () => {
  for (const path of modules) {
    const content = read(path);
    assert.match(content.split('\n')[0], /^Apply when /);
    assert.doesNotMatch(content, /(?:agent-global|coding-agent-global|web-development|software-testing|version-control|browser-computer-use)-rules\.md/);
    assert.ok(RULES.some(rule => rule.path === path));
  }
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
