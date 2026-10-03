const SOURCE_REPOSITORY_URL = 'https://github.com/jitendravyas/agent-rulebook';

const GENERAL_RULE = {
  id: 'general',
  title: 'General agent rules',
  description:
    'Reusable guidance for research, files, documents, media, browsers, devices, and software tasks.',
  path: 'agent-global-rules.md',
};

const CODING_RULE = {
  id: 'coding',
  title: 'Coding-agent rules',
  description:
    'Software-project guidance for planning, implementation, maintenance, testing, and handoff.',
  path: 'coding-agent-global-rules.md',
};

const WEB_RULE = {
  id: 'web',
  title: 'Web development rules',
  description:
    'Browser compatibility, web security, privacy, and proportionate verification guidance.',
  path: 'web-development-rules.md',
};

const MAC_RULE = {
  id: 'mac',
  title: 'macOS agent rules',
  description:
    'Safety guidance for authorised work on macOS, including system protection, permissions, and synced files.',
  path: 'optional/macos-agent-rules.md',
};

const WINDOWS_RULE = {
  id: 'windows',
  title: 'Windows agent rules',
  description:
    'Safety guidance for protected Windows resources, redirected folders, OneDrive, and WSL boundaries.',
  path: 'optional/windows-agent-rules.md',
};

const LINUX_RULE = {
  id: 'linux',
  title: 'Linux agent rules',
  description:
    'Safety guidance for distribution differences, protected system interfaces, permissions, and persistent state.',
  path: 'optional/linux-agent-rules.md',
};

const BROWSER_ANIMATION_RULE = {
  id: 'browser-animation',
  title: 'Browser animation rules',
  description:
    'Lifecycle, cancellation, interruption, and state safeguards for live web animation.',
  path: 'optional/browser-animation-rules.md',
};

const WEB_PERFORMANCE_RULE = {
  id: 'web-performance',
  title: 'Web performance rules',
  description:
    'Measure relevant journeys while preserving correctness, accessibility, privacy, and user choice.',
  path: 'optional/web-performance-rules.md',
};

const MOTION_VIDEO_RULE = {
  id: 'motion-video',
  title: 'Motion graphics video rules',
  description:
    'Composition, timing, assets, audio, and export guidance for motion graphics video.',
  path: 'optional/motion-video-rules.md',
};

const I18N_RULE = {
  id: 'i18n',
  title: 'Internationalization and localization rules',
  description:
    'Locale-aware, localizable code and content guidance without requiring translation infrastructure.',
  path: 'optional/internationalization-localization-rules.md',
};

const AUTHORING_RULE = {
  id: 'authoring',
  title: 'Agent workflow authoring rules',
  description:
    'Guidance for writing and maintaining durable rules, skills, subagents, and tool workflows.',
  path: 'optional/agent-workflow-authoring-rules.md',
};

export const RULE_GROUPS = [
  {
    id: 'core',
    title: 'Core rules',
    description: 'Start with general guidance, then add the software or web layer that matches the task.',
    rules: [GENERAL_RULE, CODING_RULE, WEB_RULE],
  },
  {
    id: 'operating-systems',
    title: 'Operating system rules',
    description: 'Add guidance for the operating system where the agent is working.',
    rules: [MAC_RULE, WINDOWS_RULE, LINUX_RULE],
  },
  {
    id: 'specialist',
    title: 'Specialist rules',
    description: 'Add these focused rule sets only when the task needs their extra context.',
    rules: [
      BROWSER_ANIMATION_RULE,
      WEB_PERFORMANCE_RULE,
      MOTION_VIDEO_RULE,
      I18N_RULE,
      AUTHORING_RULE,
    ],
  },
];

export const RULES = RULE_GROUPS.flatMap((group) => group.rules);

export const PRESETS = [
  { id: 'general', label: 'General', ids: ['general'] },
  { id: 'coding', label: 'Coding', ids: ['general', 'coding'] },
  { id: 'web', label: 'Web', ids: ['general', 'coding', 'web'] },
];

const RULE_BY_ID = new Map(RULES.map((rule) => [rule.id, rule]));

function uniqueIds(selectedIds) {
  if (
    selectedIds === null ||
    typeof selectedIds === 'string' ||
    typeof selectedIds === 'undefined' ||
    typeof selectedIds[Symbol.iterator] !== 'function'
  ) {
    throw new TypeError('selectedIds must be an iterable of rule ids');
  }

  return [...new Set(selectedIds)];
}

/**
 * Combine selected rule sources in catalog order and append attribution.
 *
 * @param {Iterable<string>} selectedIds
 * @param {Map<string, string>} sourceById
 * @param {string} licenseText
 * @returns {string}
 */
export function buildBundle(selectedIds, sourceById, licenseText) {
  const ids = uniqueIds(selectedIds);

  if (ids.length === 0) {
    return '';
  }

  const unknownIds = ids.filter((id) => !RULE_BY_ID.has(id));
  if (unknownIds.length > 0) {
    throw new Error(`Unknown rule id(s): ${unknownIds.join(', ')}`);
  }

  if (!(sourceById instanceof Map)) {
    throw new TypeError('sourceById must be a Map');
  }

  if (typeof licenseText !== 'string' || licenseText.trim() === '') {
    throw new Error('licenseText must be a non-empty string');
  }

  const selected = new Set(ids);
  const sources = RULES.filter((rule) => selected.has(rule.id)).map((rule) => {
    const source = sourceById.get(rule.id);
    if (typeof source !== 'string' || source.trim() === '') {
      throw new Error(`Missing or empty source for rule: ${rule.id}`);
    }
    return source.trim();
  });

  const attribution = [
    '<!--',
    `Source repository: ${SOURCE_REPOSITORY_URL}`,
    '',
    licenseText.trim(),
    '-->',
  ].join('\n');

  return `${sources.join('\n\n---\n\n')}\n\n${attribution}`;
}

/**
 * Return base rules recommended by the selected development layers.
 * Recommendations are informational; this function never mutates or adds ids.
 *
 * @param {Iterable<string>} selectedIds
 * @returns {string[]}
 */
export function getMissingBaseRules(selectedIds) {
  const selected = new Set(uniqueIds(selectedIds));
  const missing = [];

  if ((selected.has('coding') || selected.has('web')) && !selected.has('general')) {
    missing.push('general');
  }

  if (selected.has('web') && !selected.has('coding')) {
    missing.push('coding');
  }

  return missing;
}
