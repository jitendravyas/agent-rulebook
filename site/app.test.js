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

function boot(address, { intersectionObserver = true, modelContext = false, clipboard } = {}) {
  const nodes = new Map();
  const observers = [];
  const tools = new Map();
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
    addEventListener(type, listener) {
      const listeners = this.listeners.get(type) ?? [];
      listeners.push(listener);
      this.listeners.set(type, listeners);
    }
    focus() { this.focused = true; }
    select() { this.selected = true; }
    dispatch(type, details = {}) {
      return Promise.all((this.listeners.get(type) ?? []).map(listener =>
        listener({ type, target: this, preventDefault() {}, ...details })));
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
  const window = new Node('window');
  Object.defineProperty(window, 'location', { get: () => location });
  const entries = [{ url: location.href, state: null }];
  let entryIndex = 0;
  window.history = {
    get state() { return entries[entryIndex].state; },
    get length() { return entries.length; },
    replaceState(state, unused, url) {
      location = new URL(url, location);
      entries[entryIndex] = { url: location.href, state };
    },
    pushState(state, unused, url) {
      location = new URL(url, location);
      entries.splice(++entryIndex, entries.length, { url: location.href, state });
    },
    back() {
      assert.ok(entryIndex > 0, 'A previous history entry exists');
      const entry = entries[--entryIndex];
      location = new URL(entry.url);
      return window.dispatch('popstate', { state: entry.state });
    },
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
  if (modelContext) document.modelContext = { async registerTool(tool) { tools.set(tool.name, tool); } };
  runInNewContext(script, {
    catalog, document, window, URL, performance: { timeOrigin: 1000 },
    navigator: { clipboard }, AbortController,
  }, { filename: 'site/app.js', timeout: 1000 });
  return { get, window, observers, tools };
}

test('saved setup restores selected controls, host OS, and the global prompt', () => {
  const first = boot('https://example.test/agent-rulebook/?unrelated=discard-from-share');
  const host = first.get('host-os');
  host.value = 'mac';
  host.dispatch('change');
  for (const id of ['web', 'linux', 'i18n']) {
    const input = first.get(`rule-${id}`);
    input.checked = true;
    input.dispatch('change');
  }
  const saved = first.get('setup-link').value;
  assert.deepEqual([...new URL(saved).searchParams.keys()], ['rules', 'host']);

  const restored = boot(saved);
  const expectedIds = ['general', 'web', 'mac', 'linux', 'i18n'];
  assert.deepEqual(catalog.RULES.filter(rule => restored.get(`rule-${rule.id}`).checked).map(rule => rule.id), expectedIds);
  assert.equal(restored.get('host-os').value, 'mac');
  assert.equal(restored.get('rule-mac').disabled, true);
  assert.equal(restored.get('rule-linux').disabled, false);
  assert.equal(restored.get('rule-coding').checked, false);
  assert.match(restored.get('role-mac').textContent, /Host OS/);
  assert.match(restored.get('role-linux').textContent, /Additional OS/);
  assert.equal(restored.get('rule-count').textContent, '5');
  assert.equal(restored.get('copy-prompt').disabled, false);
  assert.equal(restored.get('setup-link').value, saved);
  const prompt = restored.get('prompt-preview').value;
  assert.equal(prompt, first.get('prompt-preview').value);
  assert.match(prompt, /Host operating system: macOS\./);
  assert.match(prompt, /Additional operating systems \(not the host\): Linux\./);
  assert.match(prompt.split('\n')[0], /my user-level \(global\) agent instructions/);
  for (const rule of catalog.RULES) {
    assert.equal(prompt.includes(catalog.ruleSourceURL(rule)), expectedIds.includes(rule.id));
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

test('copy buttons write the exact current prompt and setup link', async () => {
  const writes = [];
  const page = boot('https://example.test/agent-rulebook/', {
    clipboard: { async writeText(text) { writes.push(text); } },
  });
  const prompt = page.get('prompt-preview').value;
  const link = page.get('setup-link').value;
  await page.get('copy-prompt').dispatch('click');
  assert.deepEqual(writes, [prompt]);
  assert.match(page.get('action-status').textContent, /prompt copied/i);
  await page.get('copy-setup-link').dispatch('click');
  assert.deepEqual(writes, [prompt, link]);
  assert.match(page.get('share-status').textContent, /link copied/i);
  page.get('clear-selection').dispatch('click');
  await page.get('copy-prompt').dispatch('click');
  assert.deepEqual(writes, [prompt, link], 'An empty prompt is not copied');
});

test('unavailable or rejected clipboard writes offer manual copy without claiming success', async () => {
  for (const clipboard of [undefined, { async writeText() { throw new Error('Denied'); } }]) {
    const page = boot('https://example.test/agent-rulebook/', { clipboard });
    const preview = page.get('prompt-preview');
    const prompt = preview.value;
    await page.get('copy-prompt').dispatch('click');
    assert.equal(preview.value, prompt);
    assert.ok(preview.focused && preview.selected);
    assert.match(page.get('action-status').textContent, /copy.*unavailable.*selected.*copy shortcut/i);
    assert.doesNotMatch(page.get('action-status').textContent, /prompt copied/i);

    const link = page.get('setup-link');
    const address = link.value;
    await page.get('copy-setup-link').dispatch('click');
    assert.equal(link.value, address);
    assert.equal(link.hidden, false);
    assert.equal(page.get('setup-link-label').hidden, false);
    assert.ok(link.focused && link.selected);
    assert.match(page.get('share-status').textContent, /copy.*unavailable.*selected.*copy shortcut/i);
    assert.doesNotMatch(page.get('share-status').textContent, /link copied/i);
  }
});

test('late copy success or failure cannot overwrite feedback for a changed selection', async () => {
  for (const failed of [false, true]) {
    for (const button of ['copy-prompt', 'copy-setup-link']) {
      let settle;
      const page = boot('https://example.test/agent-rulebook/', {
        clipboard: { writeText: () => new Promise((resolve, reject) => {
          settle = failed ? () => reject(new Error('Denied')) : resolve;
        }) },
      });
      const pending = page.get(button).dispatch('click');
      page.get('rule-web').checked = true;
      page.get('rule-web').dispatch('change');
      const feedback = page.get('action-status').textContent;
      const prompt = page.get('prompt-preview').value;
      const link = page.get('setup-link').value;
      settle();
      await pending;
      assert.equal(page.get('action-status').textContent, feedback);
      assert.equal(page.get('share-status').textContent, '');
      assert.equal(page.get('prompt-preview').value, prompt);
      assert.equal(page.get('setup-link').value, link);
      assert.ok(!page.get('prompt-preview').focused && !page.get('setup-link').focused);
    }
  }
});

test('Back between page sections keeps choices made after opening the prompt', async () => {
  const page = boot('https://example.test/agent-rulebook/#builder');
  page.window.history.pushState(null, '', '#your-file');
  page.get('rule-web').checked = true;
  page.get('rule-web').dispatch('change');
  const prompt = page.get('prompt-preview').value;
  assert.equal(page.window.history.length, 2, 'Checkbox changes replace rather than add history entries');
  await page.window.history.back();
  assert.equal(page.window.location.hash, '#builder');
  assert.equal(page.get('rule-web').checked, true);
  assert.equal(page.get('prompt-preview').value, prompt);
  assert.ok(new URL(page.get('setup-link').value).searchParams.get('rules').split(',').includes('web'));
});

test('Back to a different saved setup restores its choices, host, summary, and global prompt', async () => {
  const page = boot('https://example.test/agent-rulebook/?rules=general,mac&host=mac#builder');
  const prompt = page.get('prompt-preview').value;
  const summary = page.get('selection-summary').textContent;
  page.window.history.pushState(null, '', '?rules=web,linux&host=linux#your-file');
  await page.window.dispatch('popstate', { state: null });
  assert.equal(page.get('host-os').value, 'linux');
  assert.equal(page.get('rule-web').checked, true);
  assert.equal(page.get('rule-general').checked, false);
  await page.window.history.back();
  assert.equal(page.get('host-os').value, 'mac');
  assert.equal(page.get('rule-mac').checked, true);
  assert.equal(page.get('rule-mac').disabled, true);
  assert.equal(page.get('rule-general').checked, true);
  assert.equal(page.get('rule-web').checked, false);
  assert.equal(page.get('rule-linux').checked, false);
  assert.equal(page.get('selection-summary').textContent, summary);
  assert.equal(page.get('prompt-preview').value, prompt);
  assert.match(prompt, /^Review my user-level \(global\)/);
});

test('legacy project links preserve choices but clearly migrate to global-only review', () => {
  for (const scopeQuery of ['scope=project', 'scope=other', 'scope=project&scope=personal']) {
    const page = boot(`https://example.test/agent-rulebook/?rules=web,mac&${scopeQuery}&host=mac`);
    assert.equal(page.get('rule-web').checked, true);
    assert.equal(page.get('rule-mac').checked, true);
    assert.equal(page.get('rule-general').checked, false);
    assert.equal(page.get('host-os').value, 'mac');
    assert.match(page.get('prompt-preview').value, /^Review my user-level \(global\)/);
    assert.match(page.get('link-warning').textContent, /now reviews global instructions only/);
    assert.ok(!new URL(page.get('setup-link').value).searchParams.has('scope'));
    assert.ok(!page.window.location.search.includes('scope='));
  }
});

test('agent-facing tools only generate global reviews and reject retired scope inputs', async () => {
  const page = boot('https://example.test/agent-rulebook/', { modelContext: true });
  await new Promise(setImmediate);
  const list = page.tools.get('list_rule_sets');
  const generate = page.tools.get('generate_review_prompt');
  assert.ok(list && generate, 'Both real app tools register');
  assert.ok(!Object.hasOwn(generate.inputSchema.properties, 'scope'));
  const catalogResult = list.execute({});
  assert.ok(!Object.hasOwn(catalogResult, 'scopes'));
  assert.ok(!Object.hasOwn(catalogResult.selection, 'scope'));

  const before = page.get('prompt-preview').value;
  for (const scope of ['personal', 'project']) {
    const rejected = generate.execute({ ruleIds: ['web'], scope });
    assert.equal(rejected.status, 'error');
    assert.equal(rejected.code, 'invalid_input');
    assert.equal(page.get('prompt-preview').value, before);
    assert.equal(page.get('rule-web').checked, false);
  }
  const result = generate.execute({ ruleIds: ['web', 'mac'], hostOS: 'mac' });
  assert.equal(result.status, 'ready');
  assert.equal(result.prompt, catalog.buildReviewPrompt(['web', 'mac'], 'mac'));
  assert.equal(page.get('prompt-preview').value, result.prompt);
  assert.equal(page.get('rule-general').checked, false);
  assert.equal(page.get('rule-coding').checked, false);
  assert.equal(page.get('rule-web').checked, true);
  assert.ok(!new URL(result.setupLink).searchParams.has('scope'));
});

test('new General add-ons remain opt-in and survive saved-link reloads', () => {
  const generalOnly = boot('https://example.test/agent-rulebook/?rules=general');
  for (const id of ['tools-execution', 'communication']) assert.equal(generalOnly.get(`rule-${id}`).checked, false);
  for (const scope of ['personal', 'project']) {
    const page = boot(`https://example.test/agent-rulebook/?rules=tools-execution,communication&scope=${scope}`);
    assert.equal(page.get('rule-general').checked, false);
    assert.equal(page.get('rule-count').textContent, '2');
    assert.equal(page.get('prompt-preview').value, catalog.buildReviewPrompt(['tools-execution', 'communication']));
    const restored = boot(page.get('setup-link').value);
    for (const id of ['tools-execution', 'communication']) assert.equal(restored.get(`rule-${id}`).checked, true);
    assert.equal(restored.get('rule-general').checked, false);
    assert.equal(restored.get('prompt-preview').value, page.get('prompt-preview').value);
  }
});

test('changing or clearing the host preserves manually selected OS rules in controls, links, and prompts', () => {
  for (const rule of catalog.OS_RULES) {
    const page = boot('https://example.test/agent-rulebook/?rules=general&host=unspecified');
    const input = page.get(`rule-${rule.id}`);
    input.checked = true;
    input.dispatch('change');
    const host = page.get('host-os');
    host.value = rule.id;
    host.dispatch('change');
    assert.equal(input.disabled, true);

    const other = catalog.OS_RULES.find(candidate => candidate.id !== rule.id);
    for (const nextHost of [other.id, 'unspecified']) {
      host.value = nextHost;
      host.dispatch('change');
      assert.equal(input.checked, true, `${rule.id} stays selected when the host is ${nextHost}`);
      assert.equal(input.disabled, false);
      assert.match(page.get(`role-${rule.id}`).textContent,
        nextHost === 'unspecified' ? /OS role not specified/ : /Additional OS/);
      const saved = page.get('setup-link').value;
      assert.ok(new URL(saved).searchParams.get('rules').split(',').includes(rule.id));
      assert.equal(new URL(saved).searchParams.get('host'), nextHost);
      const ids = catalog.RULES.filter(candidate => page.get(`rule-${candidate.id}`).checked)
        .map(candidate => candidate.id);
      assert.equal(page.get('prompt-preview').value, catalog.buildReviewPrompt(ids, nextHost));
      const restored = boot(saved);
      assert.equal(restored.get(`rule-${rule.id}`).checked, true);
      assert.equal(restored.get('prompt-preview').value, page.get('prompt-preview').value);
    }

    input.checked = false;
    input.dispatch('change');
    assert.ok(!page.get('prompt-preview').value.includes(catalog.ruleSourceURL(rule)));
    assert.ok(!new URL(page.get('setup-link').value).searchParams.get('rules').split(',').includes(rule.id));
  }
});

test('host changes retain selected OS guidance until it is explicitly unchecked or cleared', () => {
  const page = boot('https://example.test/agent-rulebook/');
  const host = page.get('host-os');
  assert.equal(host.children[0].textContent, 'Choose your agent’s operating system');
  assert.equal(host.children[0].value, 'unspecified');
  assert.equal(page.get('group-description-environment').textContent, 'Optional. Select only operating systems your agent actually accesses.');
  const osHeading = page.get('os-rules-heading');
  assert.equal(osHeading.tag, 'h3');
  assert.equal(osHeading.textContent, 'OS rules to include');
  const osGroup = page.get('rule-groups').children.find(group => group.children.includes(osHeading));
  assert.doesNotMatch(osGroup.textContent, /SSH|agent running remotely/i);
  const choices = osGroup.children[osGroup.children.indexOf(osHeading) + 1];
  assert.equal(choices.role, 'group');
  assert.equal(choices['aria-labelledby'], osHeading.id);
  host.value = 'mac';
  host.dispatch('change');
  host.value = 'linux';
  host.dispatch('change');
  assert.equal(page.get('rule-mac').checked, true);
  assert.equal(page.get('rule-mac').disabled, false);
  assert.equal(page.get('rule-linux').checked, true);
  assert.equal(page.get('rule-linux').disabled, true);
  assert.match(page.get('prompt-preview').value, /Additional operating systems \(not the host\): macOS\./);

  page.get('clear-selection').dispatch('click');
  assert.equal(host.value, 'unspecified');
  assert.ok(catalog.OS_RULES.every(rule => !page.get(`rule-${rule.id}`).checked));
  assert.equal(page.get('prompt-preview').value, '');
});

test('saved links flag a retired set without losing other choices', () => {
  const page = boot('https://example.test/agent-rulebook/?rules=general,coding,web,web-performance,mac&scope=project&host=mac');
  const ids = catalog.RULES.filter(rule => page.get(`rule-${rule.id}`).checked).map(rule => rule.id);
  assert.deepEqual(ids, ['general', 'coding', 'web', 'mac']);
  assert.equal(page.get('host-os').value, 'mac');
  assert.equal(page.get('link-warning').hidden, false);
  assert.match(page.get('link-warning').textContent, /unavailable/);
  assert.equal(page.get('prompt-preview').value, catalog.buildReviewPrompt(ids, 'mac'));
  assert.ok(!page.get('setup-link').value.includes('web-performance'));
});

test('a saved coding-only choice remains Coding without silently adding General', () => {
  const page = boot('https://example.test/agent-rulebook/?rules=coding&scope=project');
  assert.equal(page.get('rule-general').checked, false);
  assert.equal(page.get('rule-coding').checked, true);
  assert.equal(page.get('rule-count').textContent, '1');
  assert.equal(page.get('link-warning').hidden, false);
  assert.match(page.get('link-warning').textContent, /global instructions only/);
  assert.equal(page.get('prompt-preview').value, catalog.buildReviewPrompt(['coding']));
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
  assert.match(summary.textContent, /no.*selected/i);
});

test('mobile shortcut returns to selection while the prompt section is visible', () => {
  const page = boot('https://example.test/agent-rulebook/');
  const link = page.get('mobile-review-link');
  const label = page.get('mobile-review-label');
  assert.equal(page.observers.length, 1);
  const observer = page.observers[0];
  assert.equal(observer.target, page.get('your-file'));
  assert.equal(link.href, '#your-file');
  assert.match(label.textContent, /get.*prompt/i);

  observer.callback([{ isIntersecting: true, intersectionRatio: 0 }]);
  assert.equal(link.href, '#builder');
  assert.match(label.textContent, /back.*selection/i);

  observer.callback([{ isIntersecting: true, intersectionRatio: 0.1 }]);
  assert.equal(link.href, '#builder');
  assert.match(label.textContent, /back.*selection/i);

  observer.callback([{ isIntersecting: false, intersectionRatio: 0 }]);
  assert.equal(link.href, '#your-file');
  assert.match(label.textContent, /get.*prompt/i);
});

test('mobile shortcut keeps its working default without IntersectionObserver', () => {
  const page = boot('https://example.test/agent-rulebook/', { intersectionObserver: false });
  assert.equal(page.get('mobile-review-link').href, '#your-file');
  assert.match(page.get('mobile-review-label').textContent, /get.*prompt/i);
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
