import assert from 'node:assert/strict';
import { readFileSync, statSync } from 'node:fs';
import test from 'node:test';
import { RULE_GROUPS, RULES, buildReviewPrompt, ruleSourceURL } from './rules.js';

const repository = new URL('../', import.meta.url);
const html = readFileSync(new URL('index.html', repository), 'utf8');

test('catalog IDs and paths are unique and point to existing rule files', () => {
  assert.equal(new Set(RULES.map(rule => rule.id)).size, RULES.length);
  assert.equal(new Set(RULES.map(rule => rule.path)).size, RULES.length);
  for (const rule of RULES) {
    assert.match(rule.id, /^[a-z][a-z0-9-]*$/);
    assert.match(rule.path, /\.md$/);
    const file = new URL(rule.path, repository);
    assert.ok(file.href.startsWith(repository.href), `Path outside repository: ${rule.path}`);
    assert.ok(statSync(file).isFile(), `Missing rule file: ${rule.path}`);
  }
});

test('every catalog rule belongs to exactly one category', () => {
  assert.equal(new Set(RULE_GROUPS.map(group => group.id)).size, RULE_GROUPS.length);
  const grouped = RULE_GROUPS.flatMap(group => group.rules);
  assert.equal(grouped.length, RULES.length);
  assert.equal(new Set(grouped.map(rule => rule.id)).size, RULES.length);
  for (const rule of RULES) assert.ok(grouped.includes(rule), `Uncategorised rule: ${rule.id}`);
});

test('static source links and categories match the live catalog', () => {
  const section = html.match(/<section\b[^>]*id="source-rules"[^>]*>([\s\S]*?)<\/section>/)?.[1];
  assert.ok(section, 'Missing no-JavaScript source list');
  assert.equal([...section.matchAll(/\bdata-rule-id="[^"]+"/g)].length, RULES.length);
  const groups = [...section.matchAll(/<h3>([^<]+)<\/h3>\s*<ul>([\s\S]*?)<\/ul>/g)];
  assert.equal(groups.length, RULE_GROUPS.length);
  groups.forEach(([, title, list], index) => {
    const group = RULE_GROUPS[index];
    assert.equal(title, group.title);
    const links = [...list.matchAll(/<a\b([^>]+)>/g)].map(([, attributes]) =>
      Object.fromEntries([...attributes.matchAll(/([\w-]+)="([^"]*)"/g)].map(([, key, value]) => [key, value])));
    assert.deepEqual(links.map(link => link['data-rule-id']), group.rules.map(rule => rule.id));
    links.forEach((link, position) => {
      assert.equal(link.href, `./${group.rules[position].path}`);
      assert.equal(link.type, 'text/markdown');
    });
  });
});

test('identifies one host and additional operating systems in either scope', () => {
  for (const scope of ['personal', 'project']) {
    const prompt = buildReviewPrompt(['general', 'mac', 'linux', 'windows'], scope, 'mac');
    assert.ok(prompt.includes('Host operating system: macOS.'));
    assert.ok(prompt.includes('Additional operating systems (not the host): Windows, Linux.'));
    assert.ok(prompt.includes('ask for my approval first'));
    assert.equal((prompt.match(/https:\/\/raw\.githubusercontent\.com\//g) || []).length, 4);
  }
});

test('does not infer a host from a single or multiple OS selections', () => {
  for (const ids of [['mac'], ['windows', 'linux']]) {
    const prompt = buildReviewPrompt(ids);
    assert.ok(prompt.includes('Host operating system: not specified.'));
    assert.ok(prompt.includes('Operating systems to consider (roles not specified):'));
    assert.ok(!prompt.includes('Additional operating systems (not the host):'));
  }
});

test('host-only selection does not invent additional environments', () => {
  const prompt = buildReviewPrompt(['linux'], 'personal', 'linux');
  assert.ok(prompt.includes('Host operating system: Linux.'));
  assert.ok(prompt.includes('Additional operating systems (not the host): none selected.'));
});

test('no OS selection adds no environment assumptions', () => {
  assert.ok(!buildReviewPrompt(['general']).includes('Host operating system:'));
  assert.equal(buildReviewPrompt([]), '');
});

test('rejects unknown hosts and hosts without a selected rule set', () => {
  for (const host of ['general', 'other', null, ['mac']]) {
    assert.throws(() => buildReviewPrompt(['mac'], 'personal', host), /host operating system/i);
  }
  assert.throws(() => buildReviewPrompt(['general'], 'personal', 'mac'), /selected rule/i);
});

test('retains every selected source once and keeps the licence footer removed', () => {
  const prompt = buildReviewPrompt(RULES.map(rule => rule.id), 'project', 'windows');
  for (const rule of RULES) assert.equal(prompt.split(ruleSourceURL(rule)).length - 1, 1);
  assert.ok(!prompt.includes('Source and MIT licence:'));
  assert.ok(!prompt.endsWith('\n'));
});
