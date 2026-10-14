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
    append(...children) {
      this.children = this.children.filter(child => !children.includes(child));
      this.children.push(...children);
    }
    insertBefore(child, before) {
      this.children = this.children.filter(existing => existing !== child);
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
    focus() { this.focused = true; document.activeElement = this; }
    scrollIntoView(options) { this.scrollOptions = options; }
    click() {
      if (this.disabled) return Promise.resolve();
      this.focus();
      const events = [];
      if (this.tag === 'input' && this.type === 'radio' && !this.checked) {
        for (const node of nodes.values()) {
          if (node.tag === 'input' && node.type === 'radio' && node.name === this.name) node.checked = false;
        }
        this.checked = true;
        events.push(this.dispatch('change'));
      } else if (this.tag === 'input' && this.type === 'checkbox') {
        this.checked = !this.checked;
        events.push(this.dispatch('change'));
      }
      return Promise.all([...events, this.dispatch('click')]);
    }
    contains(node) { return node === this || this.children.some(child => typeof child === 'object' && child.contains(node)); }
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

test('prompt stays hidden until Preview prompt and hides again when choices change', () => {
  const page = boot('https://example.test/agent-rulebook/?rules=general,mac#your-file');
  assert.equal(page.get('your-file').hidden, true);
  assert.equal(page.get('preview-prompt').disabled, false);
  page.get('preview-prompt').dispatch('click');
  assert.equal(page.get('your-file').hidden, false);
  assert.equal(page.get('your-file').focused, true);
  assert.equal(page.get('preview-prompt')['aria-expanded'], 'true');
  page.get('rule-coding').checked = true;
  page.get('rule-coding').dispatch('change');
  assert.equal(page.get('your-file').hidden, true);
  assert.equal(page.get('preview-prompt').focused, true);
  page.get('mobile-review-link').dispatch('click');
  assert.equal(page.get('your-file').hidden, false);
  page.get('back-to-selection').dispatch('click');
  assert.equal(page.get('your-file').hidden, true);
  assert.equal(page.get('choose-title').focused, true);
  assert.equal(page.get('choose-title').scrollOptions.block, 'start');
  page.get('clear-selection').dispatch('click');
  assert.equal(page.get('preview-prompt').disabled, true);
  assert.equal(page.get('empty-selection-note').hidden, false);
  assert.equal(page.get('mobile-review-link')['aria-disabled'], 'true');
  page.get('preview-prompt').dispatch('click');
  assert.equal(page.get('your-file').hidden, true);
});

test('choices show each purpose, put OS first, and keep details available on demand', () => {
  const page = boot('https://example.test/agent-rulebook/');
  assert.deepEqual(page.get('rule-groups').children.map(group => group.id), [
    'rule-group-environment', 'rule-group-general', 'rule-group-development', 'rule-group-capabilities',
  ]);
  for (const group of catalog.RULE_GROUPS) {
    const fieldset = page.get(`rule-group-${group.id}`);
    const description = page.get(`group-description-${group.id}`);
    assert.equal(description.textContent, group.description);
    assert.equal(description.hidden, false);
    assert.ok(fieldset.contains(description), `${group.id} displays its description`);
    assert.equal(fieldset['aria-describedby'], description.id);
  }
  assert.deepEqual(catalog.RULE_GROUPS.find(group => group.id === 'general').rules.map(rule => rule.id), ['general', 'coding', 'version-control', 'authoring']);
  assert.equal(page.get('rule-general').checked, true);
  assert.match(page.get('description-browser-use').textContent, /For agents with browser or desktop control tools/);
  assert.equal(page.get('name-browser-use').textContent, 'Browser and desktop control');
  assert.match(page.get('details-browser-use').textContent, /Browser verification is separate guidance/);
  for (const rule of catalog.RULES) {
    const description = page.get(`description-${rule.id}`);
    assert.ok(description.textContent.includes(rule.purpose), `${rule.id} explains its purpose without opening Details`);
    assert.notEqual(description.hidden, true);
    assert.ok(page.get(`rule-${rule.id}`)['aria-describedby'].split(' ').includes(description.id));
  }
  assert.match(page.get('description-coding').textContent, /Also selects Git \/ version control; you can uncheck it/);
  assert.equal(page.get('rule-authoring').checked, false);
  page.get('rule-authoring').checked = true;
  page.get('rule-authoring').dispatch('change');
  assert.equal(page.get('rule-coding').checked, false);
  assert.equal(page.get('rule-browser-use').checked, false);
  page.get('rule-browser-use').checked = true;
  page.get('rule-browser-use').dispatch('change');
  assert.equal(page.get('rule-coding').checked, false);
  assert.match(page.get('prompt-preview').value, /browser-computer-use-rules\.md/);
  page.get('rule-coding').checked = true;
  page.get('rule-coding').dispatch('change');
  page.get('rule-coding').checked = false;
  page.get('rule-coding').dispatch('change');
  assert.equal(page.get('rule-browser-use').checked, true);
  assert.equal(page.get('rule-authoring').checked, true);
  const details = page.get('details-testing');
  const control = page.get('details-button-testing');
  assert.equal(details.hidden, true);
  control.dispatch('click');
  assert.equal(details.hidden, false);
  assert.equal(control['aria-expanded'], 'true');
  assert.equal(page.get('rule-testing').checked, false);
  control.dispatch('click');
  assert.equal(details.hidden, true);
});

test('saved setup restores selected controls and the global prompt without host metadata', () => {
  const first = boot('https://example.test/agent-rulebook/?unrelated=discard-from-share');
  for (const id of ['web', 'mac', 'linux', 'i18n']) {
    const input = first.get(`rule-${id}`);
    input.checked = true;
    input.dispatch('change');
  }
  const saved = first.get('setup-link').value;
  assert.deepEqual([...new URL(saved).searchParams.keys()], ['rules']);
  assert.equal(new URL(saved).hash, '#builder');

  const restored = boot(saved);
  const expectedIds = ['general', 'web', 'linux', 'i18n'];
  assert.deepEqual(catalog.RULES.filter(rule => restored.get(`rule-${rule.id}`).checked).map(rule => rule.id), expectedIds);
  assert.equal(restored.get('rule-mac').disabled, false);
  assert.equal(restored.get('rule-linux').disabled, false);
  assert.equal(restored.get('rule-coding').checked, false);
  assert.equal(restored.get('rule-count').textContent, '4');
  assert.equal(restored.get('copy-prompt').disabled, false);
  assert.equal(restored.get('setup-link').value, saved);
  const prompt = restored.get('prompt-preview').value;
  assert.equal(prompt, first.get('prompt-preview').value);
  assert.match(prompt, /Operating systems to consider: Linux\./);
  assert.doesNotMatch(prompt, /host|roles not specified/i);
  assert.match(prompt.split('\n')[0], /my global agent instructions and/);
  for (const rule of catalog.RULES) {
    assert.equal(prompt.includes(catalog.ruleSourceURL(rule)), expectedIds.includes(rule.id));
  }
});

test('an explicitly empty saved selection stays empty after reload', () => {
  const first = boot('https://example.test/agent-rulebook/');
  first.get('clear-selection').dispatch('click');
  const restored = boot(first.get('setup-link').value);
  assert.ok(catalog.RULES.every(rule => !restored.get(`rule-${rule.id}`).checked));
  assert.equal(restored.get('prompt-preview').value, '');
  assert.equal(restored.get('copy-prompt').disabled, true);
});

test('copy buttons write the exact current prompt and setup link', async () => {
  const writes = [];
  const page = boot('https://example.test/agent-rulebook/?rules=general,web', {
    clipboard: { async writeText(text) { writes.push(text); } },
  });
  const prompt = page.get('prompt-preview').value;
  const link = page.get('setup-link').value;
  assert.match(prompt, /Global sources/);
  assert.match(prompt, /Project sources/);
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

test('Back to a different saved setup restores its choices, summary, and global prompt', async () => {
  const page = boot('https://example.test/agent-rulebook/?rules=general,mac&host=mac#builder');
  const prompt = page.get('prompt-preview').value;
  const summary = page.get('selection-summary').textContent;
  page.window.history.pushState(null, '', '?rules=web,linux&host=linux#your-file');
  await page.window.dispatch('popstate', { state: null });
  assert.equal(page.get('rule-linux').checked, true);
  assert.equal(page.get('rule-web').checked, true);
  assert.equal(page.get('rule-general').checked, false);
  await page.window.history.back();
  assert.equal(page.get('rule-mac').checked, true);
  assert.equal(page.get('rule-mac').disabled, false);
  assert.equal(page.get('rule-general').checked, true);
  assert.equal(page.get('rule-web').checked, false);
  assert.equal(page.get('rule-linux').checked, false);
  assert.equal(page.get('selection-summary').textContent, summary);
  assert.equal(page.get('prompt-preview').value, prompt);
  assert.match(prompt, /^Review my user-level \(global\)/);
});

test('old single-scope links keep all choices and migrate to per-rule destinations', () => {
  for (const scope of ['global', 'personal', 'project', 'other']) {
    const page = boot('https://example.test/agent-rulebook/?rules=general,web,mac&scope='+scope);
    for (const id of ['general', 'web', 'mac']) assert.equal(page.get('rule-'+id).checked, true);
    assert.match(page.get('prompt-preview').value, /^Review my global agent instructions and/);
    assert.match(page.get('link-warning').textContent, /each rule now goes to its labeled/);
    assert.ok(!new URL(page.get('setup-link').value).searchParams.has('scope'));
    assert.ok(!page.window.location.search.includes('scope='));
  }
});
test('agent-facing tools support mixed selections and reject obsolete scope inputs without mutation', async () => {
  const page = boot('https://example.test/agent-rulebook/', { modelContext: true });
  await new Promise(setImmediate);
  const list = page.tools.get('list_rule_sets');
  const generate = page.tools.get('generate_review_prompt');
  assert.ok(list && generate);
  assert.ok(!Object.hasOwn(generate.inputSchema.properties, 'scope'));
  assert.equal(list.execute({}).ruleSets.find(rule => rule.id === 'web').recommendedScope, 'project');
  for (const id of ['coding', 'version-control', 'authoring', 'browser-use']) {
    assert.equal(list.execute({}).ruleSets.find(rule => rule.id === id).recommendedScope, 'global-or-project');
  }
  const before = page.get('prompt-preview').value;
  for (const args of [{ ruleIds: ['web'], scope: 'global' }, { ruleIds: ['web'], hostOS: 'mac' },
    { ruleIds: ['web', 'mac', 'linux'] }]) {
    assert.equal(generate.execute(args).code, 'invalid_input');
    assert.equal(page.get('prompt-preview').value, before);
  }
  const result = generate.execute({ ruleIds: ['general', 'web'] });
  assert.equal(result.status, 'ready');
  assert.deepEqual(Array.from(result.destinations.globalRuleIds), ['general']);
  assert.deepEqual(Array.from(result.destinations.projectRuleIds), ['web']);
  assert.equal(result.prompt, catalog.buildReviewPrompt(['general', 'web']));
  assert.equal(page.get('rule-web').checked, true);
  assert.ok(!new URL(result.setupLink).searchParams.has('scope'));
  const coding = generate.execute({ ruleIds: ['general', 'coding', 'web'] });
  assert.deepEqual(Array.from(coding.destinations.globalRuleIds), ['general']);
  assert.deepEqual(Array.from(coding.destinations.projectRuleIds), ['web']);
  assert.deepEqual(Array.from(coding.destinations.placementRuleIds), ['coding']);
  assert.match(page.get('selection-summary').textContent, /Confirm placement/);
  assert.match(page.get('output-scope').textContent, /regular or occasional/);
  for (const id of ['version-control', 'authoring', 'browser-use']) {
    const activity = generate.execute({ ruleIds: [id] });
    assert.deepEqual(Array.from(activity.destinations.globalRuleIds), []);
    assert.deepEqual(Array.from(activity.destinations.projectRuleIds), []);
    assert.deepEqual(Array.from(activity.destinations.placementRuleIds), [id]);
    assert.match(page.get('selection-summary').textContent, /Confirm placement/);
    assert.match(page.get('output-scope').textContent, /regular or occasional/);
    assert.ok(!page.get('output-scope').textContent.includes('software guidance'));
    assert.equal(page.get('your-file').hidden, true);
  }
});
test('old Tools and Communication links migrate visibly to General without duplicates', () => {
  for (const ids of ['communication', 'general,communication', 'tools-execution', 'general,tools-execution', 'tools-execution,communication']) {
    const page = boot(`https://example.test/agent-rulebook/?rules=${ids}`);
    assert.equal(page.get('rule-general').checked, true);
    assert.equal(page.get('rule-count').textContent, '1');
    assert.equal(page.get('prompt-preview').value, catalog.buildReviewPrompt(['general']));
    assert.match(page.get('link-warning').textContent, /(?:Communication|Tool guidance).*part of General/);
  }
  for (const scope of ['personal', 'project']) {
    const page = boot(`https://example.test/agent-rulebook/?rules=tools-execution,communication&scope=${scope}`);
    assert.equal(page.get('rule-general').checked, true);
    assert.equal(page.get('rule-count').textContent, '1');
    assert.equal(page.get('prompt-preview').value, catalog.buildReviewPrompt(['general']));
    assert.match(page.get('link-warning').textContent, /Communication.*part of General/);
    assert.ok(!page.get('setup-link').value.includes('communication'));
    assert.ok(!page.get('setup-link').value.includes('tools-execution'));
    const restored = boot(page.get('setup-link').value);
    assert.equal(restored.get('rule-general').checked, true);
    assert.equal(restored.get('prompt-preview').value, page.get('prompt-preview').value);
  }
});

test('choosing an OS replaces the previous OS without selecting app guidance', () => {
  const page = boot('https://example.test/agent-rulebook/');
  for (const id of ['mac', 'windows', 'linux']) {
    const input = page.get(`rule-${id}`);
    assert.equal(input.type, 'radio');
    input.checked = true;
    input.dispatch('change');
    assert.deepEqual(catalog.OS_RULES.filter(rule => page.get(`rule-${rule.id}`).checked).map(rule => rule.id), [id]);
    assert.equal(page.get('rule-coding').checked, false);
    assert.equal(page.get('rule-web').checked, false);
    assert.equal(page.get('prompt-preview').value, catalog.buildReviewPrompt(['general', id]));
  }
});

test('global and project choices remain visible and independently selectable together', () => {
  const page = boot('https://example.test/agent-rulebook/');
  assert.ok(!page.get('rule-group-development').hidden);
  assert.equal(page.get('rule-web').disabled, false);
  page.get('rule-web').checked = true;
  page.get('rule-web').dispatch('change');
  page.get('preview-prompt').dispatch('click');
  page.get('rule-coding').checked = true;
  page.get('rule-coding').dispatch('change');
  assert.equal(page.get('rule-version-control').checked, true);
  assert.equal(page.get('your-file').hidden, true);
  page.get('rule-coding').checked = false;
  page.get('rule-coding').dispatch('change');
  assert.equal(page.get('rule-web').checked, true);
  assert.equal(page.get('rule-version-control').checked, true);
  assert.match(page.get('prompt-preview').value, /Global sources/);
  assert.match(page.get('prompt-preview').value, /Project sources/);
});
test('saved multiple-OS choices ask for review and keep one OS', () => {
  const page = boot('https://example.test/agent-rulebook/?rules=general,mac,linux');
  assert.equal(page.get('rule-mac').checked, true);
  assert.equal(page.get('rule-linux').checked, false);
  assert.match(page.get('link-warning').textContent, /multiple operating systems/i);
});

test('software testing and browser verification are independently optional', () => {
  for (const id of ['testing', 'browser-verification']) {
    const other = id === 'testing' ? 'browser-verification' : 'testing';
    const page = boot(`https://example.test/agent-rulebook/?rules=${id}`);
    assert.equal(page.get(`rule-${id}`).checked, true);
    assert.equal(page.get(`rule-${other}`).checked, false);
    assert.equal(page.get('prompt-preview').value, catalog.buildReviewPrompt([id]));
    assert.equal(page.get('link-warning').hidden, true, 'Current selections do not show migration warnings');
    const restored = boot(page.get('setup-link').value);
    assert.equal(restored.get('link-warning').hidden, true, 'New saved selections stay free of migration warnings');
    page.get(`rule-${other}`).checked = true;
    page.get(`rule-${other}`).dispatch('change');
    assert.equal(page.get('prompt-preview').value, catalog.buildReviewPrompt(['testing', 'browser-verification']));
    assert.equal(page.get('link-warning').hidden, true);
  }
  const legacy = boot('https://example.test/agent-rulebook/?rules=testing&scope=project');
  assert.match(legacy.get('link-warning').textContent, /no longer includes Browser verification/);
});

test('published app-platform rules are optional and independent of the agent OS', () => {
  const page = boot('https://example.test/agent-rulebook/?rules=general,mac');
  for (const id of ['apple-apps', 'android-apps']) {
    assert.equal(page.get(`rule-${id}`).checked, false);
    page.get(`rule-${id}`).checked = true;
    page.get(`rule-${id}`).dispatch('change');
    assert.equal(page.get('rule-coding').checked, false);
    assert.equal(page.get('rule-mac').checked, true);
  }
  const link = page.get('setup-link').value;
  const restored = boot(link);
  for (const id of ['apple-apps', 'android-apps', 'mac']) assert.equal(restored.get(`rule-${id}`).checked, true);
  assert.equal(restored.get('prompt-preview').value, catalog.buildReviewPrompt(['general', 'apple-apps', 'android-apps', 'mac']));
});

test('old browser animation links retain the selection with its broadened scope explained', () => {
  const page = boot('https://example.test/agent-rulebook/?rules=general,browser-animation');
  assert.equal(page.get('rule-ui-animation').checked, true);
  assert.equal(page.get('rule-coding').checked, false);
  assert.match(page.get('link-warning').textContent, /covering browser and native interfaces/);
  assert.equal(page.get('prompt-preview').value, catalog.buildReviewPrompt(['general', 'ui-animation']));
  assert.ok(!page.get('setup-link').value.includes('browser-animation'));
  const fresh = boot('https://example.test/agent-rulebook/?rules=general,coding');
  assert.equal(fresh.get('rule-ui-animation').checked, false);
});

test('OS choices switch through radio clicks and clear without losing other guidance', async () => {
  for (const rule of catalog.OS_RULES) {
    const page = boot('https://example.test/agent-rulebook/?rules=general,web');
    const clearOS = page.get('clear-os-selection');
    assert.equal(clearOS.disabled, true);
    const input = page.get(`rule-${rule.id}`);
    await input.click();
    assert.equal(input.disabled, false);
    assert.equal(clearOS.disabled, false);
    await input.click();
    assert.equal(input.checked, true, 'Clicking a selected native radio does not uncheck it');

    const other = catalog.OS_RULES.find(candidate => candidate.id !== rule.id);
    await page.get(`rule-${other.id}`).click();
    assert.equal(input.checked, false, `${other.id} replaces ${rule.id}`);
    assert.equal(page.get(`rule-${other.id}`).checked, true);
    await clearOS.click();
    assert.ok(catalog.OS_RULES.every(os => !page.get(`rule-${os.id}`).checked));
    assert.equal(page.get('rule-general').checked, true);
    assert.equal(page.get('rule-web').checked, true);
    assert.equal(clearOS.disabled, true);
    const saved = page.get('setup-link').value;
    assert.equal(new URL(saved).searchParams.get('rules'), 'general,web');
    assert.equal(page.get('prompt-preview').value, catalog.buildReviewPrompt(['general', 'web']));
    const restored = boot(saved);
    assert.equal(restored.get('prompt-preview').value, page.get('prompt-preview').value);
    assert.ok(catalog.OS_RULES.every(os => !restored.get(`rule-${os.id}`).checked));
  }
});

test('OS choices explain that they select safety rules, with help after the radios and no dropdown', () => {
  const page = boot('https://example.test/agent-rulebook/');
  const osGroup = page.get('rule-group-environment');
  const [legend, choices, clear, help] = osGroup.children;
  assert.equal(legend.tag, 'legend');
  assert.equal(legend.textContent, 'Operating system rules');
  assert.equal(clear.id, 'clear-os-selection');
  assert.equal(help.id, 'group-description-environment');
  assert.equal(help.textContent, 'Select the OS your agent uses to include its safety rules in the review prompt. This is not the platform you build apps for.');
  assert.equal(osGroup['aria-describedby'], help.id);
  assert.deepEqual(choices.children.map(card => card.children[0].children[0].value), ['mac', 'windows', 'linux']);
  const descendants = node => [node, ...node.children.filter(child => typeof child === 'object').flatMap(descendants)];
  assert.ok(!descendants(osGroup).some(node => node.tag === 'select' || node.id?.startsWith('role-')));
  assert.doesNotMatch(osGroup.textContent, /SSH|agent running remotely/i);
  for (const rule of catalog.OS_RULES) {
    const input = page.get(`rule-${rule.id}`);
    input.checked = true;
    input.dispatch('change');
  }
  page.get('clear-selection').dispatch('click');
  assert.ok(catalog.OS_RULES.every(rule => !page.get(`rule-${rule.id}`).checked));
  assert.equal(page.get('prompt-preview').value, '');
});

test('saved links flag a retired set without losing other choices', () => {
  const page = boot('https://example.test/agent-rulebook/?rules=general,coding,web,web-performance,motion-video,mac&scope=project&host=mac');
  const ids = catalog.RULES.filter(rule => page.get(`rule-${rule.id}`).checked).map(rule => rule.id);
  assert.deepEqual(ids, ['general', 'coding', 'web', 'mac']);
  assert.equal(page.get('rule-mac').disabled, false);
  assert.equal(page.get('link-warning').hidden, false);
  assert.match(page.get('link-warning').textContent, /unavailable/);
  assert.equal(page.get('prompt-preview').value, catalog.buildReviewPrompt(ids));
  assert.ok(!page.get('setup-link').value.includes('web-performance'));
  assert.ok(!page.get('setup-link').value.includes('motion-video'));
});

test('legacy host parameters are ignored without changing selected rules', () => {
  for (const host of ['mac', 'linux', 'unspecified', 'other', 'mac&host=windows']) {
    const page = boot(`https://example.test/agent-rulebook/?rules=general,mac&host=${host}`);
    assert.equal(page.get('rule-mac').checked, true);
    assert.equal(page.get('rule-linux').checked, false);
    assert.equal(page.get('prompt-preview').value, catalog.buildReviewPrompt(['general', 'mac']));
    assert.equal(page.get('link-warning').hidden, true);
    assert.ok(!page.window.location.search.includes('host='));
    assert.ok(!new URL(page.get('setup-link').value).searchParams.has('host'));
  }
});

test('a saved coding-only choice remains Coding without silently adding General', () => {
  const page = boot('https://example.test/agent-rulebook/?rules=coding&scope=project');
  assert.equal(page.get('rule-general').checked, false);
  assert.equal(page.get('rule-coding').checked, true);
  assert.equal(page.get('rule-count').textContent, '1');
  assert.equal(page.get('link-warning').hidden, false);
  assert.equal(page.get('prompt-preview').value, catalog.buildReviewPrompt(['coding']));
  assert.equal(new URL(page.get('setup-link').value).searchParams.get('rules'), 'coding');
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
  assert.match(label.textContent, /preview.*prompt/i);

  page.get('preview-prompt').dispatch('click');
  observer.callback([{ isIntersecting: true, intersectionRatio: 0 }]);
  assert.equal(link.href, '#builder');
  assert.match(label.textContent, /back.*selection/i);

  observer.callback([{ isIntersecting: true, intersectionRatio: 0.1 }]);
  assert.equal(link.href, '#builder');
  assert.match(label.textContent, /back.*selection/i);

  observer.callback([{ isIntersecting: false, intersectionRatio: 0 }]);
  assert.equal(link.href, '#your-file');
  assert.match(label.textContent, /preview.*prompt/i);
  page.get('back-to-selection').dispatch('click');
  observer.callback([{ isIntersecting: true, intersectionRatio: 1 }]);
  assert.equal(link.href, '#your-file', 'A late observer event cannot reopen a hidden prompt');
});

test('mobile shortcut previews and returns without IntersectionObserver', () => {
  const page = boot('https://example.test/agent-rulebook/', { intersectionObserver: false });
  assert.equal(page.get('mobile-review-link').href, '#your-file');
  assert.match(page.get('mobile-review-label').textContent, /preview.*prompt/i);
  assert.equal(page.get('copy-prompt').disabled, false);
  page.get('mobile-review-link').dispatch('click');
  assert.equal(page.get('your-file').hidden, false);
  assert.equal(page.get('mobile-review-link').href, '#builder');
  page.get('mobile-review-link').dispatch('click');
  assert.equal(page.get('your-file').hidden, true);
  assert.equal(page.get('mobile-review-link').href, '#your-file');
  assert.equal(page.get('choose-title').focused, true);
  assert.equal(page.get('choose-title').scrollOptions.block, 'start');
});

test('keeps a static favicon and separate review approval guidance', () => {
  assert.match(html, /<link id="favicon"[^>]+type="image\/svg\+xml"[^>]+data:image\/svg\+xml/);
  assert.match(html, /Nothing is installed or activated here\./);
  assert.match(html, /Your agent combines useful guidance, removes duplicates, and preserves scope and safeguards before you approve changes\./);
  assert.equal((html.match(/installed or activated/g) ?? []).length, 1);
  assert.match(html, /show proposed changes and ask for your approval before editing instructions/);
  assert.doesNotMatch(app, /animateFavicon/);
  assert.match(html, /id="pause-motion"/);
});
