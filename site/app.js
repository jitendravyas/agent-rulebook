import { RULE_GROUPS, RULES, OS_RULES, DEFAULT_RULE_IDS, TASK_PRESETS, buildReviewPrompt, ruleReviewScope } from './rules.js';

const DEPLOYMENT_VERSION = '';
const element = (id) => document.getElementById(id);
const selected = new Set(DEFAULT_RULE_IDS);
const selectedPresets = new Set();
const codingSuggestions = ['web', 'apple-apps', 'android-apps'];
const checkboxes = new Map();
const linkWarnings = new Map();
const sourceSizes = new Map();
let sizeCheck = Promise.resolve();
const preview = element('prompt-preview');
const copyButton = element('copy-prompt');
const previewButtons = [element('preview-prompt'), element('preview-prompt-top')];
const status = element('action-status');
let currentPrompt = '';
let revision = 0;
let sectionHistoryGroup = 0;
let historyGroupCount = 0;
let lastSelectionSearch = window.location.search;

function selectionURL() {
  // Share only catalog IDs and setup choices, never rule text or other URL data.
  const url = new URL(window.location.pathname, window.location.origin);
  url.searchParams.set('rules', RULES.filter((rule) => selected.has(rule.id)).map((rule) => rule.id).join(','));
  url.hash = 'builder';
  return url;
}

function syncSelectionURL() {
  const shareURL = selectionURL();
  const link = element('setup-link');
  if (link.value !== shareURL.href) element('share-status').textContent = '';
  link.value = shareURL.href;
  const address = new URL(window.location.href);
  address.searchParams.delete('agent');
  address.searchParams.delete('scope');
  address.searchParams.delete('host');
  for (const [key, value] of shareURL.searchParams) address.searchParams.set(key, value);
  const entry = window.history.state?.rulebook;
  if (address.href === window.location.href && entry?.document === performance.timeOrigin
    && entry.group === sectionHistoryGroup && entry.search === address.search) {
    clearLinkWarnings('history');
    return;
  }
  try {
    // Update this entry, not a new Back-button step for every checkbox.
    window.history.replaceState({ ...window.history.state,
      rulebook: { document: performance.timeOrigin, group: sectionHistoryGroup, search: address.search },
    }, '', address);
    lastSelectionSearch = address.search;
    clearLinkWarnings('history');
  } catch {
    linkWarnings.set('history', 'Your browser could not update the address. Use Copy setup link to save your choices.');
    renderLinkWarnings();
  }
}

function renderLinkWarnings() {
  const warning = element('link-warning');
  const text = [...linkWarnings.values()].join(' ');
  if (warning.textContent !== text) warning.textContent = text;
  warning.hidden = !text;
}

function clearLinkWarnings(...keys) {
  keys.forEach((key) => linkWarnings.delete(key));
  renderLinkWarnings();
}

function restoreLinkedSelection() {
  const params = new URL(window.location.href).searchParams;
  const originalRequested = params.has('rules') ? params.get('rules').split(',').filter(Boolean) : DEFAULT_RULE_IDS;
  const mergedNames = [['communication', 'Communication'], ['tools-execution', 'Tools and execution']]
    .filter(([id]) => originalRequested.includes(id)).map(([, name]) => name);
  const requested = originalRequested.flatMap(id => ['communication', 'tools-execution'].includes(id) ? ['general']
    : id === 'browser-verification' ? ['web']
      : id === 'browser-animation' ? ['ui-animation']
      : id === 'browser-use' ? ['browser-operation', 'computer-use'] : [id]);
  if (originalRequested.includes('browser-verification')) {
    linkWarnings.set('verification-merged', 'Browser verification is now part of Web development. This saved choice selects Web development for review; check its broader scope before previewing.');
  } else linkWarnings.delete('verification-merged');
  if (originalRequested.includes('browser-use')) {
    linkWarnings.set('browser-split', 'Browser and computer use is now two choices. This older link kept both; uncheck Computer use if your agent cannot control desktop apps.');
  } else linkWarnings.delete('browser-split');
  if (originalRequested.includes('browser-animation')) {
    linkWarnings.set('animation', 'Browser animation is now Web and native UI animation, covering browser and native interfaces. Your selection is kept; review its updated scope.');
  } else linkWarnings.delete('animation');
  if (mergedNames.length) {
    linkWarnings.set('merged', `${mergedNames.join(' and ')} ${mergedNames.length === 1 ? 'is' : 'are'} now part of General. This saved choice selects General for review; check it before previewing.`);
  } else linkWarnings.delete('merged');
  const retiredVerification = ['native-verification'].filter(id => originalRequested.includes(id));
  if (retiredVerification.length) {
    const names = retiredVerification.map(() => 'Native app verification');
    linkWarnings.set('retired-verification', `${names.join(' and ')} ${names.length === 1 ? 'is' : 'are'} no longer separate rule choices. Review your remaining choices; no replacement was selected automatically.`);
  } else linkWarnings.delete('retired-verification');
  const known = new Set(RULES.map((rule) => rule.id));
  const requestedOS = OS_RULES.filter(rule => requested.includes(rule.id));
  const selectedOSId = requestedOS[0]?.id;
  const ids = RULES.filter((rule) => requested.includes(rule.id)
    && (!rule.environment || rule.id === selectedOSId)).map((rule) => rule.id);
  if (requestedOS.length > 1) linkWarnings.set('os', `This saved link selected multiple operating systems. ${requestedOS[0].label} is kept; choose the OS where your agent runs.`);
  else linkWarnings.delete('os');
  const oldScopes = params.getAll('scope');
  const invalidChoices = {
    rules: requested.some((id) => !known.has(id) && !retiredVerification.includes(id)) || params.getAll('rules').length > 1,
    scope: oldScopes.length > 0,
  };
  const warnings = {
    rules: 'Some rule choices in this link are unavailable or repeated. Review your rule selection.',
    scope: 'This link used a single review destination. Your choices are kept; each rule now goes to its labeled or confirmed instruction location. Review the prompt before copying.',
  };
  for (const key of Object.keys(invalidChoices)) {
    if (invalidChoices[key]) linkWarnings.set(key, warnings[key]);
    else linkWarnings.delete(key);
  }
  if (params.has('agent')) {
    linkWarnings.set('legacy', 'This saved link now creates a review prompt, not a rule file. Your rule selection is kept; an agent choice is no longer needed.');
  } else {
    linkWarnings.delete('legacy');
  }
  renderLinkWarnings();
  const changed = ids.length !== selected.size || ids.some((id) => !selected.has(id));
  selected.clear();
  ids.forEach((id) => selected.add(id));
  selectedPresets.clear();
  TASK_PRESETS.filter(preset => preset.rules.every(id => selected.has(id)))
    .forEach(preset => selectedPresets.add(preset.id));
  return changed;
}

function textElement(tag, className, text) {
  const node = document.createElement(tag);
  node.className = className;
  node.textContent = text;
  return node;
}

function renderPresets() {
  for (const preset of TASK_PRESETS) {
    const label = textElement('label', 'task-preset', '');
    const input = document.createElement('input');
    input.id = `preset-${preset.id}`;
    input.type = 'checkbox';
    input.name = 'tasks';
    input.value = preset.id;
    input.setAttribute('aria-labelledby', `preset-name-${preset.id}`);
    input.setAttribute('aria-describedby', `preset-description-${preset.id} preset-includes-${preset.id}`);
    const text = document.createElement('span');
    const name = textElement('strong', 'rule-name', preset.label);
    name.id = `preset-name-${preset.id}`;
    const description = textElement('span', 'rule-description', preset.description);
    description.id = `preset-description-${preset.id}`;
    const includes = textElement('span', 'preset-includes', `Includes: ${preset.rules.map(id => RULES.find(rule => rule.id === id).label).join(', ')}.`);
    includes.id = `preset-includes-${preset.id}`;
    text.append(name, description, includes);
    input.addEventListener('change', () => {
      clearLinkWarnings('rules', 'scope', 'legacy', 'os', 'merged', 'retired-verification', 'animation', 'browser-split', 'verification-merged');
      const owned = new Set(TASK_PRESETS.filter(item => selectedPresets.has(item.id)).flatMap(item => item.rules));
      const independent = [...selected].filter(id => !owned.has(id));
      if (input.checked) selectedPresets.add(preset.id);
      else selectedPresets.delete(preset.id);
      selected.clear();
      [...independent, ...TASK_PRESETS.filter(item => selectedPresets.has(item.id)).flatMap(item => item.rules)]
        .forEach(id => selected.add(id));
      codingSuggestions.forEach(id => { element(`coding-added-${id}`).hidden = true; });
      updateSelection();
    });
    label.append(input, text);
    element('task-presets').append(label);
  }
}

function renderChoices() {
  const containers = new Map();
  for (const group of RULE_GROUPS) {
    const fieldset = textElement('fieldset', 'rule-group', '');
    fieldset.id = `rule-group-${group.id}`;
    const legend = textElement('legend', '', group.title);
    legend.id = `group-title-${group.id}`;
    const description = textElement('p', 'group-description', group.description);
    description.id = `group-description-${group.id}`;
    if (group.description) fieldset.setAttribute('aria-describedby', description.id);
    description.hidden = !group.description;
    const choices = document.createElement('div');
    fieldset.append(legend, description, choices);
    if (group.id === 'global') {
      containers.set('general', choices);
      const osGroup = textElement('fieldset', 'os-group', '');
      osGroup.id = 'os-rules';
      const osTitle = textElement('legend', '', 'Operating System (optional)');
      const osDescription = textElement('p', 'group-description', 'Which operating system will your agent run on? Select it if your agent manages files, apps, permissions, or system settings on that machine. These rules cover system protection and safe file handling, not the app platform you build for.');
      osDescription.id = 'group-description-environment';
      osGroup.setAttribute('aria-describedby', osDescription.id);
      const osChoices = textElement('div', 'os-choices', '');
      const clear = textElement('button', 'text-button', 'Clear OS selection');
      clear.id = 'clear-os-selection';
      clear.type = 'button';
      clear.addEventListener('click', () => {
        clearLinkWarnings('rules', 'scope', 'legacy', 'os', 'merged', 'retired-verification', 'animation', 'browser-split');
        OS_RULES.forEach(rule => selected.delete(rule.id));
        updateSelection();
      });
      osGroup.append(osTitle, osDescription, osChoices, clear);
      element('operating-system').append(osGroup);
      OS_RULES.forEach(rule => containers.set(rule.id, osChoices));
    } else if (group.id === 'project') {
      choices.className = 'software-rule-choices';
      for (const area of group.areas) {
        const areaGroup = textElement('div', 'software-area', '');
        areaGroup.id = `software-area-${area.id}`;
        areaGroup.setAttribute('role', 'group');
        areaGroup.setAttribute('aria-labelledby', `software-area-title-${area.id}`);
        areaGroup.setAttribute('aria-describedby', `software-area-description-${area.id}`);
        const title = textElement('p', 'software-area-title', area.title);
        title.id = `software-area-title-${area.id}`;
        const explanation = textElement('p', 'software-area-description', area.description);
        explanation.id = `software-area-description-${area.id}`;
        const areaChoices = textElement('div', 'software-area-choices', '');
        areaGroup.append(title, explanation, areaChoices);
        choices.append(areaGroup);
        area.rules.forEach((rule) => containers.set(rule.id, areaChoices));
      }
    } else group.rules.forEach((rule) => containers.set(rule.id, choices));
    element('rule-groups').append(fieldset);
  }
  for (const rule of RULE_GROUPS.flatMap(group => group.rules)) {
    const card = textElement('div', 'rule-card', '');
    if (rule.id === 'general') card.className += ' rule-card--general';
    const label = document.createElement('label');
    const input = document.createElement('input');
    input.type = rule.environment ? 'radio' : 'checkbox';
    input.name = rule.environment ? 'operating-system' : 'rules';
    input.value = rule.id;
    input.id = `rule-${rule.id}`;
    input.setAttribute('aria-labelledby', `name-${rule.id}`);
    input.addEventListener('change', () => {
      clearLinkWarnings('rules', 'scope', 'legacy', 'os', 'merged', 'retired-verification', 'animation', 'browser-split');
      if (rule.environment && input.checked) OS_RULES.forEach(os => selected.delete(os.id));
      if (rule.id === 'coding' && input.checked) {
        selected.add('version-control');
      }
      if (codingSuggestions.includes(rule.id) && input.checked && !selected.has('coding')) {
        selected.add('coding');
        element(`coding-added-${rule.id}`).hidden = false;
      }
      if (input.checked) selected.add(rule.id);
      else selected.delete(rule.id);
      updateSelection();
    });
    const text = document.createElement('span');
    const name = textElement('strong', 'rule-name', rule.label);
    name.id = `name-${rule.id}`;
    text.append(name);
    const scope = ruleReviewScope(rule);
    if (scope !== 'project') {
      const placement = textElement('span', 'rule-placement', scope === 'global' ? 'Global default' : 'Global if recurring');
      placement.id = `placement-${rule.id}`;
      text.append(placement);
    }
    const description = textElement('span', 'rule-description', rule.purpose
      + (rule.id === 'coding' ? ' Selecting this checkbox also adds Version control rules; you can uncheck them.' : ''));
    description.id = `description-${rule.id}`;
    input.setAttribute('aria-describedby', `${scope === 'project' ? 'group-description-project' : `placement-${rule.id}`} ${description.id}`
      + (rule.environment ? ' group-description-environment' : ''));
    text.append(description);
    label.append(input, text);
    card.append(label);
    const source = textElement('a', 'source-link', 'Read rules');
    source.href = new URL(rule.path, document.baseURI).href;
    source.type = 'text/markdown';
    source.target = '_blank';
    source.rel = 'noopener noreferrer';
    source.setAttribute('aria-label', `Read rules: ${rule.label} (opens in a new tab)`);
    const details = textElement('div', 'rule-detail-panel', '');
    details.id = `details-${rule.id}`;
    details.hidden = true;
    details.append(textElement('p', '', rule.description), source);
    const toggle = textElement('button', 'detail-toggle', 'Details');
    toggle.id = `details-button-${rule.id}`;
    toggle.type = 'button';
    toggle.setAttribute('aria-controls', details.id);
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', `${rule.label}: ${toggle.textContent}`);
    toggle.addEventListener('click', () => {
      details.hidden = !details.hidden;
      toggle.setAttribute('aria-expanded', String(!details.hidden));
    });
    card.append(toggle, details);
    if (codingSuggestions.includes(rule.id)) {
      const note = textElement('div', 'rule-detail-panel', '');
      note.id = `coding-added-${rule.id}`;
      note.hidden = true;
      const message = textElement('p', '', 'Software development rules added for shared coding guidance.');
      message.setAttribute('role', 'status');
      const remove = textElement('button', 'text-button', 'Remove Software development');
      remove.id = `remove-coding-${rule.id}`;
      remove.type = 'button';
      remove.addEventListener('click', () => {
        selected.delete('coding');
        updateSelection();
        input.focus();
      });
      note.append(message, remove);
      card.append(note);
    }
    containers.get(rule.id).append(card);
    checkboxes.set(rule.id, input);
  }
}

function updateSelection() {
  revision++;
  const chosen = RULES.filter((rule) => selected.has(rule.id));
  for (const preset of TASK_PRESETS) {
    if (!preset.rules.every(id => selected.has(id))) selectedPresets.delete(preset.id);
    element(`preset-${preset.id}`).checked = selectedPresets.has(preset.id);
  }
  element('chosen-rules').textContent = chosen.length
    ? `Selected rules: ${chosen.map(rule => rule.label).join(', ')}.` : 'No rules selected.';
  sizeCheck = updateSourceSize(chosen, revision);
  syncSelectionURL();
  for (const [id, input] of checkboxes) {
    input.checked = selected.has(id);
  }
  for (const id of codingSuggestions) {
    if (!selected.has('coding') || !selected.has(id)) element(`coding-added-${id}`).hidden = true;
  }
  const globalRuleIds = chosen.filter(rule => ruleReviewScope(rule) === 'global').map(rule => rule.id);
  const projectRuleIds = chosen.filter(rule => ruleReviewScope(rule) === 'project').map(rule => rule.id);
  const placementRuleIds = chosen.filter(rule => ruleReviewScope(rule) === 'global-or-project').map(rule => rule.id);
  element('clear-os-selection').disabled = !chosen.some(rule => rule.environment);
  const scopeText = globalRuleIds.length && projectRuleIds.length
    ? 'Review global and project instructions separately.'
    : projectRuleIds.length ? 'Review guidance for one project or one-off task.'
    : globalRuleIds.length ? 'Review your global instructions.'
    : 'Review your selected activity rules.';
  element('output-scope').textContent = scopeText + (placementRuleIds.length
    ? ' Your agent will recommend which instructions belong globally and which belong in this project.'
    : '');
  element('project-handoff').hidden = !projectRuleIds.length;
  element('project-selection-note').hidden = !projectRuleIds.length;
  currentPrompt = buildReviewPrompt(selected);
  hidePrompt();
  previewButtons.forEach(button => { button.disabled = !currentPrompt; });
  element('empty-selection-note').hidden = Boolean(currentPrompt);
  element('mobile-review-link').setAttribute('aria-disabled', String(!currentPrompt));
  preview.value = currentPrompt;
  copyButton.disabled = !currentPrompt;
  element('rule-count').textContent = chosen.length;
  element('rule-count-label').textContent = chosen.length === 1 ? 'rule set' : 'rule sets';
  element('mobile-rule-count').textContent = chosen.length === 1 && selected.has('general') ? 'General' : chosen.length;
  element('selection-summary').replaceChildren(...chosen.map((rule) => {
    const item = textElement('li', '', '');
    const scope = ruleReviewScope(rule);
    const destination = scope === 'global-or-project' ? 'Global, project, or this conversation'
      : scope === 'global' ? 'Global instructions' : 'Project or task-scoped guidance';
    item.append(textElement('strong', '', rule.label),
      textElement('span', 'selection-purpose', `${destination}: ${rule.purpose}`));
    return item;
  }));
  if (!chosen.length) element('selection-summary').append(textElement('li', '', 'No rules selected'));
  status.textContent = '';
}

async function updateSourceSize(chosen, selectionRevision) {
  const output = element('selection-size');
  if (!chosen.length) {
    output.textContent = 'As-is rule size: 0 KB (0 bytes).';
    return;
  }
  output.textContent = 'As-is rule size: calculating…';
  try {
    const sizes = await Promise.all(chosen.map(rule => {
      if (!sourceSizes.has(rule.id)) {
        const request = (async () => {
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 5000);
          try {
            const url = new URL(rule.path, document.baseURI);
            if (DEPLOYMENT_VERSION) url.searchParams.set('v', DEPLOYMENT_VERSION);
            const response = await fetch(url, { credentials: 'omit', signal: controller.signal });
            if (!response.ok) throw new Error('Rule source unavailable');
            return (await response.arrayBuffer()).byteLength;
          } finally {
            clearTimeout(timeout);
          }
        })().catch(error => {
          sourceSizes.delete(rule.id);
          throw error;
        });
        sourceSizes.set(rule.id, request);
      }
      return sourceSizes.get(rule.id);
    }));
    if (revision !== selectionRevision) return;
    const bytes = sizes.reduce((total, size) => total + size, 0);
    output.textContent = `As-is rule size: ${(bytes / 1000).toFixed(1)} KB (${bytes.toLocaleString('en-US')} bytes).`;
  } catch {
    if (revision === selectionRevision) output.textContent = 'As-is rule size unavailable: a selected source could not be read. You can still preview the prompt.';
  }
}

function setMobileReview(promptVisible) {
  const link = element('mobile-review-link');
  const label = element('mobile-review-label');
  link.href = promptVisible ? '#builder' : '#your-file';
  label.textContent = promptVisible ? 'Back to rule selection' : 'Preview prompt';
}

function syncMobileReview() {
  setMobileReview(false);
  if (!('IntersectionObserver' in window)) return;
  const observer = new window.IntersectionObserver(([entry]) => {
    setMobileReview(entry.isIntersecting && !element('your-file').hidden);
  });
  observer.observe(element('your-file'));
}

function showPrompt() {
  if (!currentPrompt) return;
  const output = element('your-file');
  output.hidden = false;
  previewButtons.forEach(button => button.setAttribute('aria-expanded', 'true'));
  setMobileReview(true);
  output.focus({ preventScroll: true });
  output.scrollIntoView({ block: 'start' });
}

function hidePrompt() {
  const output = element('your-file');
  if (output.contains(document.activeElement)) element('preview-prompt').focus({ preventScroll: true });
  output.hidden = true;
  previewButtons.forEach(button => button.setAttribute('aria-expanded', 'false'));
  setMobileReview(false);
}

function returnToSelection() {
  hidePrompt();
  const heading = element('choose-title');
  heading.focus({ preventScroll: true });
  heading.scrollIntoView({ block: 'start' });
}

previewButtons.forEach(button => button.addEventListener('click', showPrompt));
element('back-to-selection').addEventListener('click', event => {
  event.preventDefault();
  returnToSelection();
});
element('mobile-review-link').addEventListener('click', event => {
  event.preventDefault();
  if (new URL(element('mobile-review-link').href, window.location.href).hash === '#builder') returnToSelection();
  else showPrompt();
});

copyButton.addEventListener('click', async () => {
  if (!currentPrompt) return;
  const copiedRevision = revision;
  const content = currentPrompt;
  try {
    if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
    await navigator.clipboard.writeText(content);
    if (copiedRevision !== revision) return;
    status.textContent = 'Prompt copied. Paste it into a conversation with your agent, not into a rules file.';
  } catch {
    if (copiedRevision !== revision) return;
    preview.focus();
    preview.select();
    status.textContent = 'Automatic copy is unavailable. The prompt is selected; use your copy shortcut.';
  }
});

element('copy-setup-link').addEventListener('click', async () => {
  const link = element('setup-link');
  const requestedLink = link.value;
  try {
    if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
    await navigator.clipboard.writeText(requestedLink);
    if (link.value === requestedLink) element('share-status').textContent = 'Setup link copied. It restores choices, not adopted instructions; open it later to copy a fresh prompt.';
  } catch {
    if (link.value !== requestedLink) return;
    link.hidden = false;
    element('setup-link-label').hidden = false;
    link.focus();
    link.select();
    element('share-status').textContent = 'Automatic copy is unavailable. The link is selected; use your copy shortcut.';
  }
});

element('clear-selection').addEventListener('click', () => {
  clearLinkWarnings('rules', 'scope', 'legacy', 'os', 'merged', 'retired-verification', 'animation', 'browser-split');
  selected.clear();
  updateSelection();
});
element('rule-form').addEventListener('submit', (event) => event.preventDefault());
window.addEventListener('popstate', (event) => {
  const entry = event.state?.rulebook;
  // Section links create entries without state. Older section entries may have stale choices.
  const knownEntry = entry?.document === performance.timeOrigin && entry.search === window.location.search;
  if ((knownEntry && entry.group === sectionHistoryGroup) || (!entry && window.location.search === lastSelectionSearch)) {
    syncSelectionURL();
    return;
  }
  sectionHistoryGroup = knownEntry ? entry.group : ++historyGroupCount;
  const changed = restoreLinkedSelection();
  if (changed) updateSelection();
  else syncSelectionURL();
});
renderPresets();
renderChoices();
restoreLinkedSelection();
const isLocalPreview = /^(localhost|.*\.localhost|127\..*|\[::1\])$/.test(window.location.hostname);
element('local-link-note').hidden = !isLocalPreview;
element('local-prompt-note').hidden = !isLocalPreview;
element('startup-message').hidden = true;
element('builder').hidden = false;
element('skip-link').href = '#builder';
element('skip-link').textContent = 'Skip to rule builder';
element('mobile-review').hidden = false;
updateSelection();
syncMobileReview();
const updateCheck = checkWebsiteUpdate();

async function checkWebsiteUpdate() {
  if (!/^[a-f0-9]{40}$/.test(DEPLOYMENT_VERSION) || isLocalPreview) return;
  let interacted = false;
  const interactionEvents = ['pointerdown', 'keydown', 'touchstart', 'wheel', 'input', 'change'];
  const markInteraction = () => { interacted = true; };
  interactionEvents.forEach(type => document.addEventListener(type, markInteraction, { capture: true, passive: true }));
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);
  try {
    const manifest = new URL('./version.json', document.baseURI);
    manifest.searchParams.set('check', String(Date.now()));
    const response = await fetch(manifest, { cache: 'no-store', credentials: 'omit', signal: controller.signal });
    if (!response.ok) return;
    const { version } = await response.json();
    if (typeof version !== 'string' || !/^[a-f0-9]{40}$/.test(version) || version === DEPLOYMENT_VERSION) return;
    const loadLatest = () => {
      const address = new URL(window.location.href);
      address.searchParams.set('rules', selectionURL().searchParams.get('rules'));
      address.searchParams.set('_rulebook_update', version);
      window.location.replace(address.href);
    };
    if (!interacted && document.visibilityState === 'visible'
      && !new URL(window.location.href).searchParams.has('_rulebook_update')) {
      loadLatest();
    } else {
      element('load-latest').addEventListener('click', loadLatest);
      element('website-update').hidden = false;
    }
  } catch {
    return;
  } finally {
    clearTimeout(timeout);
    interactionEvents.forEach(type => document.removeEventListener(type, markInteraction, true));
  }
}
