import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { runInNewContext } from 'node:vm';
import * as catalog from './rules.js';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const app = readFileSync(new URL('./app.js', import.meta.url), 'utf8');
const importLine = /^import \{([^}]+)\} from '\.\/rules\.js';\r?\n/;
assert.match(app, importLine);
const script = app.replace(importLine, (_, names) => `const {${names}} = catalog;\n`);

function boot(address, { intersectionObserver = true } = {}) {
  const nodes = new Map();
  const observers = [];
  let location = new URL(address);

  // This DOM double runs the actual app and event handlers, not layout or browser APIs.
  class Node {
    constructor(tag) {
      this.tag = tag;
      this.children = [];
      this.listeners = new Map();
      this.classList = { add() {} };
      this.checked = false;
      this.disabled = false;
      this.value = '';
      this.text = '';
    }
    set id(value) {
      assert.ok(!nodes.has(value), `Duplicate control ID: ${value}`);
      nodes.set(value, this);
      this.identifier = value;
    }
    get id() { return this.identifier; }
    set textContent(value) { this.text = String(value); this.children = []; }
    get textContent() { return this.text + this.children.map(node => node.textContent ?? node).join(''); }
    setAttribute(key, value) { this[key] = value; }
    append(...children) { this.children.push(...children); }
    insertBefore(child, before) {
      const index = this.children.indexOf(before);
      assert.ok(index >= 0);
      this.children.splice(index, 0, child);
    }
    replaceChildren(...children) { this.children = children; this.text = ''; }
    querySelectorAll(selector) {
      assert.equal(selector, 'input');
      return this.children.filter(node => node.tag === 'input');
    }
    querySelector(selector) {
      assert.equal(selector, 'input:checked');
      return this.querySelectorAll('input').find(input => input.checked) ?? null;
    }
    addEventListener(type, listener) {
      const listeners = this.listeners.get(type) ?? [];
      listeners.push(listener);
      this.listeners.set(type, listeners);
    }
    dispatch(type) {
      for (const listener of this.listeners.get(type) ?? []) {
        listener({ type, target: this, preventDefault() {} });
      }
    }
  }

  const attributes = markup => [...markup.matchAll(/\s([\w-]+)(?:="([^"]*)")?/g)]
    .map(([, key, value]) => [key, value ?? true]);
  for (const [markup, tag] of html.matchAll(/<([\w-]+)\b[^>]*\bid="[^"]+"[^>]*>/g)) {
    const node = new Node(tag);
    for (const [key, value] of attributes(markup)) node[key] = value;
  }
  const get = id => {
    assert.ok(nodes.has(id), `Missing page control: ${id}`);
    return nodes.get(id);
  };
  const scope = html.match(/<fieldset\b[^>]*id="rule-scope"[^>]*>([\s\S]*?)<\/fieldset>/)?.[1];
  assert.ok(scope);
  for (const [markup] of scope.matchAll(/<input\b[^>]*>/g)) {
    const input = new Node('input');
    for (const [key, value] of attributes(markup)) input[key] = value;
    get('rule-scope').append(input);
  }
  const window = new Node('window');
  Object.defineProperty(window, 'location', { get: () => location });
  window.history = {
    state: null,
    replaceState(state, unused, url) { this.state = state; location = new URL(url, location); },
  };
  if (intersectionObserver) {
    window.IntersectionObserver = class {
      constructor(callback) {
        this.callback = callback;
        observers.push(this);
      }
      observe(target) { this.target = target; }
    };
  }
  const document = new Node('document');
  Object.defineProperty(document, 'baseURI', { get: () => location.href });
  Object.assign(document, {
    getElementById: id => nodes.get(id) ?? null,
    createElement: tag => new Node(tag),
    createElementNS: (namespace, tag) => new Node(tag),
  });
  runInNewContext(script, {
    catalog, document, window, URL, performance: { timeOrigin: 1000 },
    navigator: {}, AbortController,
  }, { filename: 'site/app.js', timeout: 1000 });
  return { get, window, observers };
}

test('saved setup restores selected controls, host OS, scope, and the exact prompt', () => {
  for (const scope of ['personal', 'project']) {
    const first = boot('https://example.test/agent-rulebook/?unrelated=discard-from-share');
    const host = first.get('host-os');
    host.value = 'mac';
    host.dispatch('change');
    for (const id of ['web', 'linux', 'i18n']) {
      const input = first.get(`rule-${id}`);
      input.checked = true;
      input.dispatch('change');
    }
    for (const input of first.get('rule-scope').querySelectorAll('input')) input.checked = input.value === scope;
    first.get('rule-scope').dispatch('change');
    const saved = first.get('setup-link').value;
    assert.deepEqual([...new URL(saved).searchParams.keys()], ['rules', 'scope', 'host']);

    const restored = boot(saved);
    const expectedIds = ['general', 'web', 'mac', 'linux', 'i18n'];
    assert.deepEqual(catalog.RULES.filter(rule => restored.get(`rule-${rule.id}`).checked).map(rule => rule.id), expectedIds);
    assert.equal(restored.get('host-os').value, 'mac');
    assert.equal(restored.get('rule-mac').disabled, true);
    assert.equal(restored.get('rule-linux').disabled, false);
    assert.equal(restored.get('rule-coding').checked, false);
    assert.equal(restored.get('rule-scope').querySelector('input:checked').value, scope);
    assert.match(restored.get('role-mac').textContent, /Host OS/);
    assert.match(restored.get('role-linux').textContent, /Additional OS/);
    assert.equal(restored.get('rule-count').textContent, '5');
    assert.equal(restored.get('copy-prompt').disabled, false);
    assert.equal(restored.get('setup-link').value, saved);
    const prompt = restored.get('prompt-preview').value;
    assert.equal(prompt, first.get('prompt-preview').value);
    assert.match(prompt, /Host operating system: macOS\./);
    assert.match(prompt, /Additional operating systems \(not the host\): Linux\./);
    assert.match(prompt.split('\n')[0], scope === 'project' ? /instructions for this project/ : /my user-level \(global\) agent instructions/);
    for (const rule of catalog.RULES) {
      assert.equal(prompt.includes(catalog.ruleSourceURL(rule)), expectedIds.includes(rule.id));
    }
  }
});

test('an explicitly empty saved selection stays empty after reload', () => {
  const first = boot('https://example.test/agent-rulebook/');
  first.get('clear-selection').dispatch('click');
  const restored = boot(first.get('setup-link').value);
  assert.ok(catalog.RULES.every(rule => !restored.get(`rule-${rule.id}`).checked));
  assert.equal(restored.get('host-os').value, 'unspecified');
  assert.equal(restored.get('prompt-preview').value, '');
  assert.equal(restored.get('copy-prompt').disabled, true);
});

test('saved links flag a retired set without losing other choices', () => {
  const page = boot('https://example.test/agent-rulebook/?rules=general,coding,web,web-performance,mac&scope=project&host=mac');
  const ids = catalog.RULES.filter(rule => page.get(`rule-${rule.id}`).checked).map(rule => rule.id);
  assert.deepEqual(ids, ['general', 'coding', 'web', 'mac']);
  assert.equal(page.get('host-os').value, 'mac');
  assert.equal(page.get('rule-scope').querySelector('input:checked').value, 'project');
  assert.equal(page.get('link-warning').hidden, false);
  assert.match(page.get('link-warning').textContent, /unavailable/);
  assert.equal(page.get('prompt-preview').value, catalog.buildReviewPrompt(ids, 'project', 'mac'));
  assert.ok(!page.get('setup-link').value.includes('web-performance'));
});

test('a saved coding-only choice remains Coding without silently adding General', () => {
  const page = boot('https://example.test/agent-rulebook/?rules=coding&scope=project');
  assert.equal(page.get('rule-general').checked, false);
  assert.equal(page.get('rule-coding').checked, true);
  assert.equal(page.get('rule-count').textContent, '1');
  assert.equal(page.get('link-warning').hidden, true);
  assert.equal(page.get('prompt-preview').value, catalog.buildReviewPrompt(['coding'], 'project'));
  assert.equal(new URL(page.get('setup-link').value).searchParams.get('rules'), 'coding');
});

test('shows purpose examples before a category is opened without selecting its rules', () => {
  const page = boot('https://example.test/agent-rulebook/');
  for (const group of catalog.RULE_GROUPS.filter(group => group.collapsible)) {
    const disclosure = page.get(`group-${group.id}`);
    assert.ok(!disclosure.open);
    const summary = disclosure.children[0];
    assert.equal(summary.tag, 'summary');
    assert.ok(summary.children.includes(page.get(`group-examples-${group.id}`)));
    assert.equal(page.get(`group-examples-${group.id}`).textContent, group.summary);
    assert.ok(group.rules.every(rule => !page.get(`rule-${rule.id}`).checked));
  }
});

test('selected guidance explains its purpose and remains independently optional', () => {
  const page = boot('https://example.test/agent-rulebook/');
  const summary = page.get('selection-summary');
  const general = catalog.RULES.find(rule => rule.id === 'general');
  assert.equal(summary.children.length, 1);
  assert.ok(summary.textContent.includes(general.purpose));

  page.get('rule-general').checked = false;
  page.get('rule-general').dispatch('change');
  page.get('rule-web').checked = true;
  page.get('rule-web').dispatch('change');
  const web = catalog.RULES.find(rule => rule.id === 'web');
  assert.equal(summary.children.length, 1);
  assert.ok(summary.textContent.includes(web.label));
  assert.ok(summary.textContent.includes(web.purpose));
  assert.equal(page.get('rule-coding').checked, false);
  assert.equal(page.get('rule-browser-use').checked, false);
  assert.equal(page.get('rule-testing').checked, false);
  assert.equal(page.get('rule-general').checked, false);
  assert.equal(page.get('prompt-preview').value, catalog.buildReviewPrompt(['web']));

  page.get('clear-selection').dispatch('click');
  assert.equal(summary.textContent, 'No rules selected');
});

test('mobile shortcut returns to selection while the prompt section is visible', () => {
  const page = boot('https://example.test/agent-rulebook/');
  const link = page.get('mobile-review-link');
  const label = page.get('mobile-review-label');
  assert.equal(page.observers.length, 1);
  const observer = page.observers[0];
  assert.equal(observer.target, page.get('your-file'));
  assert.equal(link.href, '#your-file');
  assert.equal(label.textContent, 'Get prompt');

  observer.callback([{ isIntersecting: true, intersectionRatio: 0 }]);
  assert.equal(link.href, '#builder');
  assert.equal(label.textContent, 'Back to rule selection');

  observer.callback([{ isIntersecting: true, intersectionRatio: 0.1 }]);
  assert.equal(link.href, '#builder');
  assert.equal(label.textContent, 'Back to rule selection');

  observer.callback([{ isIntersecting: false, intersectionRatio: 0 }]);
  assert.equal(link.href, '#your-file');
  assert.equal(label.textContent, 'Get prompt');
});

test('mobile shortcut keeps its working default without IntersectionObserver', () => {
  const page = boot('https://example.test/agent-rulebook/', { intersectionObserver: false });
  assert.equal(page.get('mobile-review-link').href, '#your-file');
  assert.equal(page.get('mobile-review-label').textContent, 'Get prompt');
  assert.equal(page.get('copy-prompt').disabled, false);
});

test('keeps a static favicon and separate review approval guidance', () => {
  assert.match(html, /<link id="favicon"[^>]+type="image\/svg\+xml"[^>]+data:image\/svg\+xml/);
  assert.match(html, /Selection adds public rule links to the prompt; it does not install or activate rules\./);
  assert.equal((html.match(/install or activate/g) ?? []).length, 1);
  assert.match(html, /show proposed changes and ask for your approval before editing instructions/);
  assert.doesNotMatch(app, /animateFavicon/);
  assert.match(html, /id="pause-motion"/);
});
