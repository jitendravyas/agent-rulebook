# Maintaining these rules

Before creating or editing rule files in this repository, read and apply [agent-workflow-authoring-rules.md](optional/agent-workflow-authoring-rules.md). This includes changes to the authoring file and this file.

- Keep the general rules useful on their own for non-development tasks. Keep software, web, operating-system, and specialist requirements in their appropriate files.
- Keep reusable rule files understandable when copied into a single instruction file. In those reusable files, do not add imports or references to other rule files; explain recommended combinations in `README.md`.
- Maintain reusable rules here, not skills or detailed task procedures. Keep human-facing setup and usage guidance in `README.md`.

## Website work

Before creating, changing, reviewing, or testing this repository's website (`index.html` and `site/`), read and apply [General rules](agent-global-rules.md), [Coding rules](coding-agent-global-rules.md), and [Web development rules](web-development-rules.md), in that order. Reuse current copies already loaded in context.

Load optional rules only when their stated scope matches the work: [software testing](optional/software-testing-rules.md) for tests and verification of software changes, [browser animation](optional/browser-animation-rules.md) for animation changes, [browser and computer use](optional/browser-computer-use-rules.md) when operating those interfaces, and [version control](optional/version-control-rules.md) when using version control. Use the categories in the [README](README.md) to find other relevant add-ons. Keep checks proportionate to the task; loading these rules does not request unrelated audits.
