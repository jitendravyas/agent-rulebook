import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { runInNewContext } from 'node:vm';
import * as catalog from '../site/rules.js';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const app = readFileSync(new URL('../site/app.js', import.meta.url), 'utf8');
const importLine = /^import \{([^}]+)\} from '\.\/rules\.js';\r?\n/;
assert.match(app, importLine);
const script = app.replace(importLine, (_, names) => `const {${names}} = catalog;\n`);

function boot(address, { intersectionObserver = true, clipboard, version = '', fetch, visibility = 'visible' } = {}) {
  const nodes = new Map();
  const observers = [];
  const navigations = [];
  const timers = new Map();
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
      if (tag === 'details') this.open = false;
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
    removeEventListener(type, listener) {
      this.listeners.set(type, (this.listeners.get(type) ?? []).filter(item => item !== listener));
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
  Object.defineProperty(window, 'location', { get: () => Object.assign(location, {
    replace: url => { navigations.push(url); },
  }) });
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
    visibilityState: visibility,
    getElementById: id => nodes.get(id) ?? null,
    createElement: tag => new Node(tag),
    createElementNS: (namespace, tag) => new Node(tag),
  });
  const ready = runInNewContext(script.replace("const DEPLOYMENT_VERSION = '';", `const DEPLOYMENT_VERSION = '${version}';`) + '\nupdateCheck;', {
    catalog, document, window, URL, performance: { timeOrigin: 1000 },
    navigator: { clipboard },
    fetch, AbortController,
    setTimeout: (callback, delay) => { timers.set(callback, delay); return callback; },
    clearTimeout: callback => timers.delete(callback),
  }, { filename: 'site/app.js', timeout: 5000 });
  return { get, window, observers, document, ready, navigations, timers };
}

test('prompt stays hidden until Preview prompt and hides again when choices change', () => {
  assert.ok(html.indexOf('id="copy-prompt"') < html.indexOf('id="selection-summary"'), 'Copy is available before the long selection recap');
  assert.ok(html.indexOf('id="prompt-preview"') < html.indexOf('id="selection-summary"'), 'The prompt is visible before the long selection recap');
  assert.ok(html.indexOf('id="prompt-preview"') < html.indexOf('id="copy-prompt"'), 'Visitors can review the prompt before the Copy control');
  assert.equal([...html.matchAll(/id="copy-prompt"/g)].length, 1, 'There is one Copy control');
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

test('choices group global defaults, activities, and visible project guidance', () => {
  const page = boot('https://example.test/agent-rulebook/');
  assert.deepEqual(page.get('rule-groups').children.map(group => group.id), [
    'rule-group-global', 'rule-group-activities', 'rule-group-project',
  ]);
  const projectGroup = page.get('rule-group-project');
  assert.equal(projectGroup.tag, 'fieldset', 'Project rules have their own non-collapsible group');
  assert.ok(!projectGroup.hidden);
  assert.equal(page.get('group-title-project').textContent, 'Project rules');
  assert.match(page.get('group-description-project').textContent, /not your global instructions/);
  assert.match(page.get('group-description-project').textContent, /one-off work/);
  for (const group of catalog.RULE_GROUPS) {
    const fieldset = page.get(`rule-group-${group.id}`);
    const description = page.get(`group-description-${group.id}`);
    assert.equal(description.textContent, group.description);
    assert.equal(description.hidden, false);
    assert.ok(fieldset.contains(description), `${group.id} displays its description`);
    assert.equal(fieldset['aria-describedby'], description.id);
  }
  const globalGroup = page.get('rule-group-global');
  assert.ok(globalGroup.children[2].contains(page.get('rule-general')));
  assert.ok(globalGroup.children[3].contains(page.get('rule-mac')));
  assert.equal(globalGroup.children[3].id, 'os-rules');
  assert.deepEqual(page.get('rule-group-activities').children[2].children.map(card => card.children[0].children[0].value),
    ['browser-operation', 'computer-use', 'version-control', 'coding']);
  const softwareAreas = catalog.RULE_GROUPS.find(group => group.id === 'project').areas;
  assert.deepEqual(projectGroup.children[2].children.map(area => area.id), softwareAreas.map(area => `software-area-${area.id}`));
  for (const area of softwareAreas) {
    const areaGroup = page.get(`software-area-${area.id}`);
    assert.equal(areaGroup['aria-labelledby'], `software-area-title-${area.id}`);
    assert.equal(areaGroup['aria-describedby'], `software-area-description-${area.id}`);
    assert.equal(page.get(`software-area-title-${area.id}`).textContent, area.title);
    assert.equal(page.get(`software-area-description-${area.id}`).textContent, area.description);
    assert.deepEqual(areaGroup.children[2].children.map(card => card.children[0].children[0].value), area.rules.map(rule => rule.id));
  }
  assert.equal(page.get('rule-general').checked, true);
  assert.match(page.get('description-browser-operation').textContent, /navigate and interact with websites/);
  assert.equal(page.get('name-browser-operation').textContent, 'Browser use rules');
  assert.match(page.get('details-browser-operation').textContent, /browser choice, tabs, sessions, and page state/);
  assert.match(page.get('description-computer-use').textContent, /operate desktop apps/);
  assert.equal(page.get('name-computer-use').textContent, 'Computer use rules');
  assert.match(page.get('details-computer-use').textContent, /focus, selection, windows, and controls/);
  assert.equal(page.get('rule-computer-use').checked, false);
  for (const rule of catalog.RULES) {
    const description = page.get(`description-${rule.id}`);
    const scope = catalog.ruleReviewScope(rule);
    if (scope === 'project') {
      assert.ok(page.get(`rule-${rule.id}`)['aria-describedby'].split(' ').includes('group-description-project'));
    } else {
      const placement = page.get(`placement-${rule.id}`);
      assert.equal(placement.textContent, scope === 'global' ? 'Global default' : 'Global if recurring');
      assert.ok(page.get(`rule-${rule.id}`)['aria-describedby'].split(' ').includes(placement.id));
    }
    assert.ok(description.textContent.includes(rule.purpose), `${rule.id} explains its purpose without opening Details`);
    assert.notEqual(description.hidden, true);
    assert.ok(page.get(`rule-${rule.id}`)['aria-describedby'].split(' ').includes(description.id));
    const details = page.get(`details-${rule.id}`);
    const toggle = page.get(`details-button-${rule.id}`);
    assert.equal(details.hidden, true);
    assert.equal(toggle['aria-controls'], details.id);
    assert.equal(details.children[1].href, new URL(rule.path, page.window.location.href).href);
    assert.ok(details.children[1]['aria-label'].includes(details.children[1].textContent), `${rule.id} accessible link name includes its visible text`);
    assert.ok(details.children[1]['aria-label'].includes(rule.label), `${rule.id} accessible link uses its selection name`);
  }
  for (const id of ['general', 'mac']) {
    const checked = page.get(`rule-${id}`).checked;
    page.get(`details-button-${id}`).dispatch('click');
    assert.equal(page.get(`details-${id}`).hidden, false);
    assert.equal(page.get(`rule-${id}`).checked, checked, 'Opening Details does not select a rule');
  }
  assert.match(page.get('description-coding').textContent, /Selecting this checkbox also adds Version control rules; you can uncheck them/);
  assert.equal(page.get('rule-browser-operation').checked, false);
  assert.equal(page.get('rule-computer-use').checked, false);
  page.get('rule-browser-operation').checked = true;
  page.get('rule-browser-operation').dispatch('change');
  assert.equal(page.get('rule-coding').checked, false);
  assert.equal(page.get('rule-computer-use').checked, false);
  assert.match(page.get('prompt-preview').value, /global\/browser-use-rules\.md/);
  assert.doesNotMatch(page.get('prompt-preview').value, /computer-use-rules\.md/);
  page.get('rule-computer-use').checked = true;
  page.get('rule-computer-use').dispatch('change');
  assert.match(page.get('prompt-preview').value, /global\/computer-use-rules\.md/);
  page.get('rule-coding').checked = true;
  page.get('rule-coding').dispatch('change');
  assert.equal(page.get('rule-web').checked, false, 'Visible specialist choices remain optional');
  page.get('rule-coding').checked = false;
  page.get('rule-coding').dispatch('change');
  assert.equal(page.get('rule-browser-operation').checked, true);
  assert.equal(page.get('rule-computer-use').checked, true);
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
  const expectedIds = ['general', 'coding', 'web', 'linux', 'i18n'];
  assert.deepEqual(catalog.RULES.filter(rule => restored.get(`rule-${rule.id}`).checked).map(rule => rule.id), expectedIds);
  assert.equal(restored.get('rule-mac').disabled, false);
  assert.equal(restored.get('rule-linux').disabled, false);
  assert.equal(restored.get('rule-coding').checked, true);
  assert.equal(restored.get('rule-count').textContent, '5');
  assert.equal(restored.get('copy-prompt').disabled, false);
  assert.equal(restored.get('setup-link').value, saved);
  const prompt = restored.get('prompt-preview').value;
  assert.equal(prompt, first.get('prompt-preview').value);
  assert.match(prompt, /Operating-system rules to consider: Linux rules\./);
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
  assert.match(page.get('share-status').textContent, /restores choices.*fresh prompt/i);
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
test('old Tools and Communication links migrate visibly to General without duplicates', () => {
  for (const ids of ['communication', 'general,communication', 'tools-execution', 'general,tools-execution', 'tools-execution,communication']) {
    const page = boot(`https://example.test/agent-rulebook/?rules=${ids}`);
    assert.equal(page.get('rule-general').checked, true);
    assert.equal(page.get('rule-count').textContent, '1');
    assert.equal(page.get('prompt-preview').value, catalog.buildReviewPrompt(['general']));
    assert.match(page.get('link-warning').textContent, /(?:Communication|Tools and execution).*part of General/);
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
  assert.ok(!page.get('rule-group-project').hidden);
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

test('saved project choices retain independent selections in the visible group', () => {
  const page = boot('https://example.test/agent-rulebook/?rules=general,web,mac');
  assert.equal(page.get('rule-group-project').tag, 'fieldset');
  assert.ok(!page.get('rule-group-project').hidden);
  assert.equal(page.get('rule-web').checked, true);
  assert.equal(page.get('rule-coding').checked, false);
  assert.equal(page.get('rule-mac').checked, true);
  assert.equal(page.get('your-file').hidden, true);
});

test('platform development suggests only Coding and preserves manual opt-outs', () => {
  for (const id of ['web', 'apple-apps', 'android-apps']) {
    const page = boot('https://example.test/agent-rulebook/?rules=');
    page.get(`rule-${id}`).click();
    assert.equal(page.get('rule-coding').checked, true);
    assert.equal(page.get('rule-coding').disabled, false);
    assert.equal(page.get('rule-version-control').checked, false);
    assert.equal(page.get(`coding-added-${id}`).hidden, false);
    assert.match(page.get(`coding-added-${id}`).textContent, /Remove Software development/);
    assert.equal(page.get('prompt-preview').value, catalog.buildReviewPrompt([id, 'coding']));
    page.get('rule-coding').click();
    assert.equal(page.get(`rule-${id}`).checked, true);
    assert.equal(page.get(`coding-added-${id}`).hidden, true);
    page.get('rule-general').click();
    assert.equal(page.get('rule-coding').checked, false);
    const restored = boot(page.get('setup-link').value);
    assert.equal(restored.get('rule-coding').checked, false);
    assert.equal(restored.get(`rule-${id}`).checked, true);
  }
});

test('platform notices are outside labels and removal changes only Coding', () => {
  for (const id of ['web', 'apple-apps', 'android-apps']) {
    const page = boot('https://example.test/agent-rulebook/?rules=general,version-control,testing');
    const input = page.get(`rule-${id}`);
    input.click();
    const note = page.get(`coding-added-${id}`);
    const labels = node => [ ...(node.tag === 'label' ? [node] : []),
      ...node.children.filter(child => typeof child === 'object').flatMap(labels) ];
    const label = labels(page.get('rule-group-project')).find(node => node.contains(input));
    assert.ok(label);
    assert.equal(label.contains(note), false);
    assert.ok(note.contains(page.get(`remove-coding-${id}`)));
    page.get('preview-prompt').click();
    page.get(`remove-coding-${id}`).click();
    assert.equal(input.checked, true);
    assert.equal(input.focused, true);
    assert.equal(page.get('rule-coding').checked, false);
    assert.equal(note.hidden, true);
    assert.equal(page.get('your-file').hidden, true);
    const remaining = ['general', 'version-control', 'testing', id];
    assert.equal(page.get('prompt-preview').value, catalog.buildReviewPrompt(remaining));
    const restored = boot(page.get('setup-link').value);
    assert.equal(restored.get('prompt-preview').value, catalog.buildReviewPrompt(remaining));
  }
});

test('testing, localization, and animation do not select Coding', () => {
  for (const id of ['testing', 'i18n', 'ui-animation']) {
    const page = boot('https://example.test/agent-rulebook/?rules=');
    page.get(`rule-${id}`).click();
    assert.equal(page.get('rule-coding').checked, false);
    assert.equal(page.get('prompt-preview').value, catalog.buildReviewPrompt([id]));
  }
});

test('software choices stay visible after unrelated changes and clearing selections', () => {
  const page = boot('https://example.test/agent-rulebook/?rules=general,web');
  page.get('rule-mac').checked = true;
  page.get('rule-mac').dispatch('change');
  assert.ok(!page.get('rule-group-project').hidden);
  page.get('clear-selection').dispatch('click');
  assert.ok(!page.get('rule-group-project').hidden);
  for (const rule of catalog.RULE_GROUPS.find(group => group.id === 'project').rules) {
    assert.equal(page.get(`rule-${rule.id}`).checked, false);
    assert.equal(page.get(`rule-${rule.id}`).disabled, false);
  }
});

test('project-only choices also explain the one-off task route', () => {
  const page = boot('https://example.test/agent-rulebook/?rules=web');
  assert.match(page.get('output-scope').textContent, /one project or one-off task/);
  assert.match(page.get('selection-summary').textContent, /Project or task-scoped guidance/);
  assert.match(page.get('prompt-preview').value, /guidance for this conversation only, not persistent files/);
});

test('project and activity choices describe both review scopes', () => {
  const page = boot('https://example.test/agent-rulebook/?rules=coding,web');
  assert.match(page.get('output-scope').textContent, /one project or one-off task/);
  assert.match(page.get('output-scope').textContent, /Your agent will recommend where the activity rules belong/);
  assert.match(page.get('selection-summary').textContent, /Global, project, or this conversation/);
  assert.equal(page.get('action-status').textContent, '');
  assert.match(page.get('prompt-preview').value, /Project sources/);
  assert.match(page.get('prompt-preview').value, /Activity sources/);
});

test('mobile selection label names General only when it is the sole selection', () => {
  const page = boot('https://example.test/agent-rulebook/');
  assert.equal(page.get('mobile-rule-count').textContent, 'General');
  page.get('rule-testing').checked = true;
  page.get('rule-testing').dispatch('change');
  assert.equal(String(page.get('mobile-rule-count').textContent), '2');
  page.get('rule-general').checked = false;
  page.get('rule-general').dispatch('change');
  assert.equal(String(page.get('mobile-rule-count').textContent), '1');
  page.get('clear-selection').dispatch('click');
  assert.equal(String(page.get('mobile-rule-count').textContent), '0');
  page.get('rule-general').checked = true;
  page.get('rule-general').dispatch('change');
  assert.equal(page.get('mobile-rule-count').textContent, 'General');
  assert.equal(boot('https://example.test/agent-rulebook/?rules=general').get('mobile-rule-count').textContent, 'General');
});

test('saved multiple-OS choices ask for review and keep one OS', () => {
  const page = boot('https://example.test/agent-rulebook/?rules=general,mac,linux');
  assert.equal(page.get('rule-mac').checked, true);
  assert.equal(page.get('rule-linux').checked, false);
  assert.match(page.get('link-warning').textContent, /multiple operating systems/i);
});

test('software testing and web development remain independent choices', () => {
  const page = boot('https://example.test/agent-rulebook/?rules=testing');
  assert.equal(page.get('rule-testing').checked, true);
  assert.equal(page.get('rule-web').checked, false);
  assert.equal(page.get('prompt-preview').value, catalog.buildReviewPrompt(['testing']));
  assert.equal(page.get('link-warning').hidden, true);
  page.get('rule-web').checked = true;
  page.get('rule-web').dispatch('change');
  assert.equal(page.get('prompt-preview').value, catalog.buildReviewPrompt(['testing', 'web', 'coding']));
  assert.equal(page.get('link-warning').hidden, true);
});

test('browser verification saved links select Web development once with a scope notice', () => {
  for (const selection of ['browser-verification', 'browser-verification,web']) {
    const page = boot(`https://example.test/agent-rulebook/?rules=${selection}`);
    assert.equal(page.get('rule-web').checked, true);
    assert.equal(page.get('rule-general').checked, false);
    assert.equal(page.get('your-file').hidden, true);
    assert.equal(page.get('link-warning').hidden, false);
    assert.match(page.get('link-warning').textContent, /Browser verification is now part of Web development/);
    assert.match(page.get('link-warning').textContent, /broader scope/);
    assert.equal(page.get('prompt-preview').value, catalog.buildReviewPrompt(['web']));
    assert.doesNotMatch(page.get('setup-link').value, /browser-verification/);
    assert.equal(new URL(page.get('setup-link').value).searchParams.get('rules'), 'web');
  }
});

test('retired native verification choice shows a notice without selecting a replacement', () => {
  const page = boot('https://example.test/agent-rulebook/?rules=apple-apps,native-verification');
  assert.equal(page.get('rule-apple-apps').checked, true);
  assert.equal(page.get('rule-general').checked, false);
  assert.match(page.get('link-warning').textContent, /no longer separate rule choices/);
  assert.equal(page.get('prompt-preview').value, catalog.buildReviewPrompt(['apple-apps']));
  assert.ok(!page.get('setup-link').value.includes('native-verification'));
});

test('published app-platform rules are optional and independent of the agent OS', () => {
  const page = boot('https://example.test/agent-rulebook/?rules=general,mac');
  for (const id of ['apple-apps', 'android-apps']) {
    assert.equal(page.get(`rule-${id}`).checked, false);
    page.get(`rule-${id}`).checked = true;
    page.get(`rule-${id}`).dispatch('change');
    assert.equal(page.get('rule-coding').checked, true);
    assert.equal(page.get('rule-mac').checked, true);
  }
  const link = page.get('setup-link').value;
  const restored = boot(link);
  for (const id of ['apple-apps', 'android-apps', 'mac']) assert.equal(restored.get(`rule-${id}`).checked, true);
  assert.equal(restored.get('prompt-preview').value, catalog.buildReviewPrompt(['general', 'coding', 'apple-apps', 'android-apps', 'mac']));
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

test('old combined browser and computer links preserve both choices with a notice', () => {
  const page = boot('https://example.test/agent-rulebook/?rules=general,browser-use');
  assert.equal(page.get('rule-browser-operation').checked, true);
  assert.equal(page.get('rule-computer-use').checked, true);
  assert.match(page.get('link-warning').textContent, /older link kept both/);
  assert.equal(page.get('prompt-preview').value, catalog.buildReviewPrompt(['general', 'browser-operation', 'computer-use']));
  const saved = new URL(page.get('setup-link').value);
  assert.equal(saved.searchParams.get('rules'), 'general,browser-operation,computer-use');
  const restored = boot(saved.href);
  assert.equal(restored.get('link-warning').hidden, true);
  page.get('rule-computer-use').checked = false;
  page.get('rule-computer-use').dispatch('change');
  assert.equal(page.get('link-warning').hidden, true);
  assert.equal(page.get('prompt-preview').value, catalog.buildReviewPrompt(['general', 'browser-operation']));
});

test('new browser-only links do not select desktop control or show a migration notice', () => {
  const page = boot('https://example.test/agent-rulebook/?rules=browser-operation');
  assert.equal(page.get('rule-browser-operation').checked, true);
  assert.equal(page.get('rule-computer-use').checked, false);
  assert.equal(page.get('link-warning').hidden, true);
  assert.equal(page.get('prompt-preview').value, catalog.buildReviewPrompt(['browser-operation']));
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
  const osGroup = page.get('os-rules');
  const [legend, choices, clear, help] = osGroup.children;
  assert.equal(legend.tag, 'legend');
  assert.equal(legend.textContent, 'Operating-system rules (optional)');
  assert.equal(clear.id, 'clear-os-selection');
  assert.equal(help.id, 'group-description-environment');
  assert.equal(help.textContent, 'Choose the system where your agent works, not the apps you build.');
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
  const page = boot('https://example.test/agent-rulebook/?rules=general,coding,web,web-performance,motion-video,authoring,mac&scope=project&host=mac');
  const ids = catalog.RULES.filter(rule => page.get(`rule-${rule.id}`).checked).map(rule => rule.id);
  assert.deepEqual(ids, ['general', 'coding', 'web', 'mac']);
  assert.equal(page.get('rule-mac').disabled, false);
  assert.equal(page.get('link-warning').hidden, false);
  assert.match(page.get('link-warning').textContent, /unavailable/);
  assert.equal(page.get('prompt-preview').value, catalog.buildReviewPrompt(ids));
  assert.ok(!page.get('setup-link').value.includes('web-performance'));
  assert.ok(!page.get('setup-link').value.includes('motion-video'));
  assert.ok(!page.get('setup-link').value.includes('authoring'));
  const retiredOnly = boot('https://example.test/agent-rulebook/?rules=authoring');
  assert.match(retiredOnly.get('link-warning').textContent, /unavailable/);
  assert.equal(retiredOnly.get('prompt-preview').value, '');
  assert.equal(retiredOnly.get('preview-prompt').disabled, true);
  assert.equal(retiredOnly.get('copy-prompt').disabled, true);
  assert.ok(catalog.RULES.every(rule => !retiredOnly.get(`rule-${rule.id}`).checked));
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
  assert.equal(summary.children.length, 2);
  assert.ok(summary.textContent.includes(web.label));
  assert.ok(summary.textContent.includes(web.purpose));
  assert.equal(page.get('rule-coding').checked, true);
  assert.equal(page.get('rule-browser-operation').checked, false);
  assert.equal(page.get('rule-testing').checked, false);
  assert.equal(page.get('rule-general').checked, false);
  assert.equal(page.get('prompt-preview').value, catalog.buildReviewPrompt(['web', 'coding']));

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
  assert.equal(page.get('your-file').scrollOptions.block, 'start');
  assert.equal(page.get('mobile-review-link').href, '#builder');
  page.get('mobile-review-link').dispatch('click');
  assert.equal(page.get('your-file').hidden, true);
  assert.equal(page.get('mobile-review-link').href, '#your-file');
  assert.equal(page.get('choose-title').focused, true);
  assert.equal(page.get('choose-title').scrollOptions.block, 'start');
});

test('update check reloads once with current choices and preserves the path and fragment', async () => {
  const version = 'a'.repeat(40);
  const latest = 'b'.repeat(40);
  const requests = [];
  const page = boot('https://example.test/agent-rulebook/?rules=general,web&extra=kept#builder', {
    version,
    fetch: async (url, options) => {
      requests.push({ url, options });
      return { ok: true, json: async () => ({ version: latest }) };
    },
  });
  await page.ready;
  assert.equal(requests.length, 1);
  assert.equal(requests[0].url.pathname, '/agent-rulebook/version.json');
  assert.ok(requests[0].url.searchParams.has('check'));
  assert.equal(requests[0].options.cache, 'no-store');
  assert.equal(requests[0].options.credentials, 'omit');
  assert.equal(page.navigations.length, 1);
  const destination = new URL(page.navigations[0]);
  assert.equal(destination.origin, 'https://example.test');
  assert.equal(destination.pathname, '/agent-rulebook/');
  assert.equal(destination.hash, '#builder');
  assert.equal(destination.searchParams.get('rules'), 'general,web');
  assert.equal(destination.searchParams.get('extra'), 'kept');
  assert.equal(destination.searchParams.get('_rulebook_update'), latest);
  const repeated = boot(destination.href, {
    version, fetch: async () => ({ ok: true, json: async () => ({ version: latest }) }),
  });
  await repeated.ready;
  assert.equal(repeated.navigations.length, 0);
  assert.equal(repeated.get('website-update').hidden, false);
  assert.ok(!repeated.get('setup-link').value.includes('_rulebook_update'));
  assert.equal(page.timers.size, 0);
  assert.equal(page.document.listeners.get('pointerdown').length, 0);
});

test('update check does not interrupt interaction and Load latest uses the newest selection', async () => {
  let respond;
  const page = boot('https://example.test/agent-rulebook/?rules=general', {
    version: 'a'.repeat(40), fetch: () => new Promise(resolve => { respond = resolve; }),
  });
  await page.document.dispatch('pointerdown');
  await page.get('rule-coding').click();
  respond({ ok: true, json: async () => ({ version: 'b'.repeat(40) }) });
  await page.ready;
  assert.equal(page.navigations.length, 0);
  assert.equal(page.get('website-update').hidden, false);
  await page.get('rule-web').click();
  await page.get('load-latest').click();
  const destination = new URL(page.navigations[0]);
  assert.equal(destination.searchParams.get('rules'), 'general,coding,web,version-control');
  assert.match(html, /id="website-update"[^>]*role="status"[^>]*hidden/);
  assert.match(html, /Your rule selections will be kept/);
});

test('update check leaves current, failed, or malformed responses usable without retries', async () => {
  const version = 'a'.repeat(40);
  for (const result of [
    { ok: true, json: async () => ({ version }) },
    { ok: false },
    { ok: true, json: async () => ({ version: 'https://untrusted.test/' }) },
    { ok: true, json: async () => ({ version: ['b'.repeat(40)] }) },
    { ok: true, json: async () => { throw new Error('Invalid JSON'); } },
    null,
  ]) {
    let calls = 0;
    const page = boot('https://example.test/agent-rulebook/', { version, fetch: async () => {
      calls++;
      if (!result) throw new Error('Offline');
      return result;
    } });
    await page.ready;
    assert.equal(calls, 1);
    assert.equal(page.navigations.length, 0);
    assert.equal(page.get('website-update').hidden, true);
    assert.equal(page.get('builder').hidden, false);
    await page.get('preview-prompt').click();
    assert.equal(page.get('your-file').hidden, false);
    assert.equal(page.timers.size, 0);
  }
});

test('update check times out and skips unversioned or local previews', async () => {
  const page = boot('https://example.test/agent-rulebook/', {
    version: 'a'.repeat(40), fetch: (url, { signal }) => new Promise((resolve, reject) => {
      signal.addEventListener('abort', () => reject(new Error('Aborted')));
    }),
  });
  const [[expire, delay]] = page.timers;
  assert.equal(delay, 5000);
  expire();
  await page.ready;
  assert.equal(page.navigations.length, 0);
  assert.equal(page.get('website-update').hidden, true);
  assert.equal(page.timers.size, 0);
  for (const [address, version] of [['https://example.test/', ''], ['http://localhost:8000/', 'a'.repeat(40)]]) {
    let calls = 0;
    const preview = boot(address, { version, fetch: async () => { calls++; } });
    await preview.ready;
    assert.equal(calls, 0);
  }
});

test('background tabs offer an update instead of navigating automatically', async () => {
  const page = boot('https://example.test/agent-rulebook/', {
    version: 'a'.repeat(40), visibility: 'hidden',
    fetch: async () => ({ ok: true, json: async () => ({ version: 'b'.repeat(40) }) }),
  });
  await page.ready;
  assert.equal(page.navigations.length, 0);
  assert.equal(page.get('website-update').hidden, false);
});

test('keeps a static favicon and accurate review approval guidance', () => {
  assert.match(html, /<link id="favicon"[^>]+type="image\/svg\+xml"[^>]+data:image\/svg\+xml/);
  assert.match(html, /Nothing is installed or activated here\./);
  assert.equal((html.match(/installed or activated/g) ?? []).length, 1);
  assert.match(html, /Copy the whole prompt\. It requests a review, not immediate changes/);
  assert.match(html, /your agent’s chat<\/strong>, not a rules file or Custom Instructions box/);
  assert.match(html, /Copy prompt for agent chat/);
  assert.match(html, /Review the proposed changes and backup locations before approving edits to each file/);
  assert.doesNotMatch(html, /Your agent must show proposed changes/);
  assert.doesNotMatch(app, /animateFavicon/);
  assert.match(html, /id="pause-motion"/);
});
