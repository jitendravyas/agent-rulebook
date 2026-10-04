const SOURCE_REPOSITORY_URL = 'https://github.com/jitendravyas/agent-rulebook';

const GENERAL_RULE = {
  id: 'general',
  title: 'General agent rules',
  label: 'General agent behaviour',
  description:
    'Recommended for every task, including development. Covers safety, privacy, communication, and staying on task.',
  path: 'agent-global-rules.md',
};

const CODING_RULE = {
  id: 'coding',
  title: 'Coding-agent rules',
  label: 'Coding and maintenance',
  description:
    'Shared development guidance for web, mobile, desktop, and other software. Skip if your own coding instructions cover this.',
  path: 'coding-agent-global-rules.md',
};

const WEB_RULE = {
  id: 'web',
  title: 'Web development rules',
  label: 'Web development',
  description:
    'Browser-specific implementation and security guidance for websites and web apps, alongside your chosen coding instructions.',
  path: 'web-development-rules.md',
};

const TESTING_RULE = {
  id: 'testing',
  title: 'Software testing rules',
  label: 'Software testing',
  description:
    'Focused tests, lint checks, and browser verification. Use with these coding rules or your own; not a request to run every check.',
  path: 'optional/software-testing-rules.md',
};

const MAC_RULE = {
  id: 'mac',
  title: 'macOS agent rules',
  label: 'macOS',
  environment: true,
  description:
    'Safety guidance for authorised work on macOS, including system protection, permissions, and synced files.',
  path: 'optional/macos-agent-rules.md',
};

const WINDOWS_RULE = {
  id: 'windows',
  title: 'Windows agent rules',
  label: 'Windows',
  environment: true,
  description:
    'Safety guidance for protected Windows resources, redirected folders, OneDrive, and WSL boundaries.',
  path: 'optional/windows-agent-rules.md',
};

const LINUX_RULE = {
  id: 'linux',
  title: 'Linux agent rules',
  label: 'Linux',
  environment: true,
  description:
    'Safety guidance for distribution differences, protected system interfaces, permissions, and persistent state.',
  path: 'optional/linux-agent-rules.md',
};

const BROWSER_USE_RULE = {
  id: 'browser-use',
  title: 'Browser and computer-use rules',
  label: 'Use browsers or desktop apps',
  description:
    'For an agent that clicks, navigates, or operates apps. Not just for building websites.',
  path: 'optional/browser-computer-use-rules.md',
};

const VERSION_CONTROL_RULE = {
  id: 'version-control',
  title: 'Version-control rules',
  label: 'Version control',
  description:
    'Review and preserve repository changes, including non-code files. Applies across version-control systems, with Git-specific identity checks.',
  path: 'optional/version-control-rules.md',
};

const BROWSER_ANIMATION_RULE = {
  id: 'browser-animation',
  title: 'Browser animation rules',
  label: 'Animate web interfaces',
  description:
    'For motion within a website or app, not an exported video.',
  path: 'optional/browser-animation-rules.md',
};

const WEB_PERFORMANCE_RULE = {
  id: 'web-performance',
  title: 'Web performance rules',
  label: 'Improve web performance',
  description:
    'For measuring and improving how quickly a website or web app works.',
  path: 'optional/web-performance-rules.md',
};

const MOTION_VIDEO_RULE = {
  id: 'motion-video',
  title: 'Motion graphics video rules',
  label: 'Create motion videos',
  description:
    'For animated videos exported to MP4 or another video format.',
  path: 'optional/motion-video-rules.md',
};

const I18N_RULE = {
  id: 'i18n',
  title: 'Internationalization and localization rules',
  label: 'Build multilingual software',
  description:
    'For software in different languages and regions, including right-to-left interfaces. Not ordinary document translation.',
  path: 'optional/internationalization-localization-rules.md',
};

const AUTHORING_RULE = {
  id: 'authoring',
  title: 'Agent workflow authoring rules',
  label: 'Write agent instructions',
  description:
    'For creating or improving agent rules, skills, and workflows.',
  path: 'optional/agent-workflow-authoring-rules.md',
};

// Keep export order stable when the display categories change.
export const RULES = [
  GENERAL_RULE,
  CODING_RULE,
  WEB_RULE,
  TESTING_RULE,
  MAC_RULE,
  WINDOWS_RULE,
  LINUX_RULE,
  BROWSER_USE_RULE,
  VERSION_CONTROL_RULE,
  BROWSER_ANIMATION_RULE,
  WEB_PERFORMANCE_RULE,
  MOTION_VIDEO_RULE,
  I18N_RULE,
  AUTHORING_RULE,
];

export const RULE_GROUPS = [
  {
    id: 'environment',
    title: 'Operating systems',
    description: 'Choose where your agent works, including remote machines. Skip if unsure.',
    rules: [MAC_RULE, WINDOWS_RULE, LINUX_RULE],
  },
  {
    id: 'general',
    title: 'General behaviour',
    description: 'Selected by default. Use on its own or alongside instructions you already have.',
    rules: [GENERAL_RULE],
  },
  {
    id: 'tools',
    title: 'Tools and interfaces',
    description: 'For development and everyday tasks. Choose only the tools your agent uses.',
    collapsible: true,
    rules: [BROWSER_USE_RULE, VERSION_CONTROL_RULE],
  },
  {
    id: 'development',
    title: 'Software development',
    description: 'Choose individual areas for web, mobile, desktop, or other software. Opening this group selects nothing.',
    collapsible: true,
    rules: [
      CODING_RULE,
      WEB_RULE,
      TESTING_RULE,
      BROWSER_ANIMATION_RULE,
      WEB_PERFORMANCE_RULE,
      I18N_RULE,
    ],
  },
  {
    id: 'media',
    title: 'Creative media',
    description: 'For media output, separate from software development. Choose the activities you need.',
    collapsible: true,
    rules: [MOTION_VIDEO_RULE],
  },
  {
    id: 'authoring',
    title: 'Agent instructions',
    description: 'For writing and maintaining instructions for agents.',
    collapsible: true,
    rules: [AUTHORING_RULE],
  },
];

// Bundle shortcuts remain available to agents; the page uses individual checkboxes.
export const PRESETS = [
  {
    id: 'general',
    label: 'Everyday tasks',
    description: 'Research, documents, files, and media',
    ids: ['general'],
  },
  {
    id: 'coding',
    label: 'Software projects',
    description: 'Build or maintain software',
    ids: ['general', 'coding'],
  },
  {
    id: 'web',
    label: 'Websites & web apps',
    description: 'Build pages and browser-based software',
    ids: ['general', 'coding', 'web'],
  },
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
 * Return base rules recommended by selected development or activity rules.
 * Recommendations are informational; this function never mutates or adds ids.
 *
 * @param {Iterable<string>} selectedIds
 * @returns {string[]}
 */
export function getMissingBaseRules(selectedIds) {
  const selected = new Set(uniqueIds(selectedIds));
  const missing = [];

  if (['coding', 'web', 'testing', 'browser-use', 'version-control'].some((id) => selected.has(id)) && !selected.has('general')) {
    missing.push('general');
  }

  if (selected.has('web') && !selected.has('coding')) {
    missing.push('coding');
  }

  return missing;
}
