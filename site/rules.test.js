import assert from 'node:assert/strict';
import test from 'node:test';
import { RULES, buildReviewPrompt, ruleSourceURL } from './rules.js';

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
