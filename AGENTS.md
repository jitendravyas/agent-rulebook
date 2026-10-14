# Maintaining these rules

Before creating or editing rule files in this repository, read and apply [agent-workflow-authoring-rules.md](global/agent-workflow-authoring-rules.md). This includes changes to the authoring file and this file.

- Use American English for repository prose. Preserve exact names, paths, code identifiers, and source quotations.
- Keep General useful on its own for non-development tasks. Keep software-specific guidance in Coding and web, testing, version-control, computer-use, operating-system, and specialist details in their appropriate files.
- Keep reusable rule files understandable when copied into a single instruction file. In those reusable files, do not add imports or references to other rule files; explain recommended combinations in `README.md`.
- Maintain reusable rules here, not skills or detailed task procedures. Keep human-facing usage and safety setup in `README.md`.
- For Apple or Android app work, read the corresponding optional [Apple app](project/apple-app-development-rules.md) or [Android app](project/android-app-development-rules.md) rules. They concern app targets, not the agent's operating system, and are not needed for this repository's static website.

## Website work

Before creating, changing, reviewing, or testing this repository's website (`index.html` and `site/`), read and apply [General rules](global/general-rules.md), [Coding rules](global/coding-rules.md), and [Web development rules](project/web-development-rules.md), in that order. Reuse current copies already loaded in context.

Read project modules only when their scope matches this work: [software testing](project/software-testing-rules.md) for tests, [browser verification](project/browser-verification-rules.md) for rendered checks, and [UI animation](project/interactive-ui-animation-rules.md) for interface motion. Read [computer use](global/browser-computer-use-rules.md) when operating interfaces and [version control](global/version-control-rules.md) when using it. The website distinguishes global and project review; keep catalogs, source links, and tests aligned. Loading guidance does not request unrelated audits.
