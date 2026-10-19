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

function boot(address, { intersectionObserver = true, clipboard } = {}) {
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
  runInNewContext(script, {
    catalog, document, window, URL, performance: { timeOrigin: 1000 },
    navigator: { clipboard },
  }, { filename: 'site/app.js', timeout: 5000 });
  return { get, window, observers };
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

test('choices put OS first and show specialist software guidance without expanding it', () => {
  const page = boot('https://example.test/agent-rulebook/');
  assert.deepEqual(page.get('rule-groups').children.map(group => group.id), [
    'rule-group-environment', 'rule-group-general', 'rule-group-development',
  ]);
  const softwareGuidance = page.get('software-guidance');
  assert.equal(softwareGuidance.tag, 'div', 'Specialist choices have no collapse control');
  assert.ok(!softwareGuidance.hidden);
  assert.equal(softwareGuidance.children[0].tag, 'h3');
  assert.ok(page.get('rule-group-development').contains(softwareGuidance));
  assert.equal(softwareGuidance.children[0].textContent, 'More software rules (optional)');
  assert.equal(softwareGuidance.children[1].id, 'specialist-placement');
  assert.match(softwareGuidance.children[1].textContent, /reused across matching projects/);
  assert.match(softwareGuidance.children[1].textContent, /only in projects where they apply/);
  assert.match(softwareGuidance.children[1].textContent, /one-off work/);
  for (const group of catalog.RULE_GROUPS) {
    const fieldset = page.get(`rule-group-${group.id}`);
    const description = page.get(`group-description-${group.id}`);
    assert.equal(description.textContent, group.description);
    assert.equal(description.hidden, false);
    assert.ok(fieldset.contains(description), `${group.id} displays its description`);
    assert.equal(fieldset['aria-describedby'], description.id);
  }
  assert.deepEqual(catalog.RULE_GROUPS.find(group => group.id === 'general').rules.map(rule => rule.id), ['general', 'browser-operation', 'computer-use', 'version-control']);
  const generalChoices = page.get('rule-group-general').children[2];
  assert.match(generalChoices.children[0].className, /rule-card--general/);
  assert.equal(generalChoices.children[1].textContent, 'Other activities (optional)');
  assert.deepEqual(generalChoices.children.slice(2).map(card => card.children[0].children[0].value),
    ['browser-operation', 'computer-use', 'version-control']);
  assert.equal(page.get('group-title-development').textContent, 'Software development');
  assert.ok(page.get('rule-group-development').children[2].contains(page.get('rule-coding')));
  const softwareAreas = catalog.RULE_GROUPS.find(group => group.id === 'development').areas;
  assert.deepEqual(softwareGuidance.children[2].children.map(area => area.id), softwareAreas.map(area => `software-area-${area.id}`));
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
      assert.ok(page.get(`rule-${rule.id}`)['aria-describedby'].split(' ').includes('specialist-placement'));
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
  assert.match(page.get('description-coding').textContent, /Also selects Version control rules; you can uncheck them/);
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

test('saved project choices retain independent selections in the visible group', () => {
  const page = boot('https://example.test/agent-rulebook/?rules=general,web,mac');
  assert.equal(page.get('software-guidance').tag, 'div');
  assert.ok(!page.get('software-guidance').hidden);
  assert.equal(page.get('rule-web').checked, true);
  assert.equal(page.get('rule-coding').checked, false);
  assert.equal(page.get('rule-mac').checked, true);
  assert.equal(page.get('your-file').hidden, true);
});

test('software choices stay visible after unrelated changes and clearing selections', () => {
  const page = boot('https://example.test/agent-rulebook/?rules=general,web');
  page.get('rule-mac').checked = true;
  page.get('rule-mac').dispatch('change');
  assert.ok(!page.get('software-guidance').hidden);
  page.get('clear-selection').dispatch('click');
  assert.ok(!page.get('software-guidance').hidden);
  for (const rule of catalog.RULE_GROUPS.find(group => group.id === 'development').rules) {
    assert.equal(page.get(`rule-${rule.id}`).checked, false);
    assert.equal(page.get(`rule-${rule.id}`).disabled, false);
  }
});

test('project-only choices also explain the one-off task route', () => {
  const page = boot('https://example.test/agent-rulebook/?rules=web');
  assert.match(page.get('output-scope').textContent, /one project or one-off software task/);
  assert.match(page.get('selection-summary').textContent, /Project or task-scoped guidance/);
  assert.match(page.get('prompt-preview').value, /without creating a persistent project or global rule file/);
});

test('project and activity choices describe both review scopes', () => {
  const page = boot('https://example.test/agent-rulebook/?rules=coding,web');
  assert.match(page.get('output-scope').textContent, /one project or one-off software task and selected activity guidance/);
  assert.match(page.get('output-scope').textContent, /It asks your agent to suggest whether each selected activity rule belongs globally, in a project, or only in this conversation/);
  assert.match(page.get('selection-summary').textContent, /Global, project, or this conversation/);
  assert.equal(page.get('action-status').textContent, '');
  assert.match(page.get('prompt-preview').value, /Project sources/);
  assert.match(page.get('prompt-preview').value, /Activity sources/);
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
  assert.equal(page.get('prompt-preview').value, catalog.buildReviewPrompt(['testing', 'web']));
  assert.equal(page.get('link-warning').hidden, true);
});

test('browser verification saved links keep the choice without selecting Web development', () => {
  const page = boot('https://example.test/agent-rulebook/?rules=browser-verification');
  assert.equal(page.get('rule-browser-verification').checked, true);
  assert.equal(page.get('rule-web').checked, false);
  assert.equal(page.get('rule-general').checked, false);
  assert.equal(page.get('link-warning').hidden, true);
  assert.equal(page.get('prompt-preview').value, catalog.buildReviewPrompt(['browser-verification']));
  assert.match(page.get('setup-link').value, /browser-verification/);
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
  const osGroup = page.get('rule-group-environment');
  const [legend, choices, clear, help] = osGroup.children;
  assert.equal(legend.tag, 'legend');
  assert.equal(legend.textContent, 'Your agent’s operating system (optional)');
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
  assert.equal(summary.children.length, 1);
  assert.ok(summary.textContent.includes(web.label));
  assert.ok(summary.textContent.includes(web.purpose));
  assert.equal(page.get('rule-coding').checked, false);
  assert.equal(page.get('rule-browser-operation').checked, false);
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
  assert.equal(page.get('your-file').scrollOptions.block, 'start');
  assert.equal(page.get('mobile-review-link').href, '#builder');
  page.get('mobile-review-link').dispatch('click');
  assert.equal(page.get('your-file').hidden, true);
  assert.equal(page.get('mobile-review-link').href, '#your-file');
  assert.equal(page.get('choose-title').focused, true);
  assert.equal(page.get('choose-title').scrollOptions.block, 'start');
});

test('keeps a static favicon and accurate review approval guidance', () => {
  assert.match(html, /<link id="favicon"[^>]+type="image\/svg\+xml"[^>]+data:image\/svg\+xml/);
  assert.match(html, /Nothing is installed or activated here\./);
  assert.equal((html.match(/installed or activated/g) ?? []).length, 1);
  assert.match(html, /This is a one-time review request/);
  assert.match(html, /Paste it into a conversation with your agent, not an instruction file or Custom Instructions box/);
  assert.match(html, /Copy prompt for agent chat/);
  assert.match(html, /propose changes and a backup plan, then wait for approval/);
  assert.doesNotMatch(html, /Your agent must show proposed changes/);
  assert.doesNotMatch(app, /animateFavicon/);
  assert.match(html, /id="pause-motion"/);
});
