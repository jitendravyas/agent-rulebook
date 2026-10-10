# Agent Rulebook

Reusable instructions to help AI agents stay within scope, protect existing work, check results, and explain them clearly. Use them with one agent or several for everyday tasks, small experiments, or established software projects. They do not prescribe an operating system, framework, or agent.

These rules are for agents that work with files on a local machine, in a remote workspace, or in a sandbox. Load them through the agent's supported instruction files or rules settings, such as Cursor's User Rules. They are not designed for ordinary chatbot personalisation fields, and reading or uploading a file does not by itself activate it as standing instructions.

The rules also apply without a desktop, including servers accessed only through SSH. Use available tools for the task. If a required interaction or visual check is unavailable, report the gap rather than claiming it passed.

For the `AGENTS.md` format, examples, FAQ, and supported-agent directory, see [agents.md](https://agents.md/). The instructions below explain how to use this repository's rules.

Choose how to start:

- [Use the website](#use-the-review-prompt-builder) to ask your agent which rules fit your existing instructions.
- [Copy reviewed rule text](#how-to-use) yourself if you already know what you need.

## Choose General, then relevant add-ons

Start with [General rules](agent-global-rules.md) for safety, approvals, privacy, verification, and communication. They work without a project, desktop, plugins, or skills. Add [Coding rules](coding-agent-global-rules.md) only for software development. Both files are versioned and dated so you can review updates.

Append only the add-ons relevant to your intended activities. Keep their applicability lines when copying. They can complement General or equivalent existing guidance; no file imports or activates another file. The existing files remain the source, with no duplicate starter bundle.

| Agent setup | Load these files | Covers |
| --- | --- | --- |
| Any task | [General](agent-global-rules.md) | Scope, approvals, safety, privacy, verification, communication, and basic efficiency. |
| Software development | General + [Coding](coding-agent-global-rules.md) | Software implementation, security, maintenance, performance, and static checks. |
| Web development | General + Coding + [web](web-development-rules.md) | Browser-specific implementation, resource loading, and web security. |
| Software testing and browser verification | General + [testing](optional/software-testing-rules.md) | Focused tests and proportionate browser verification. |
| Version control, including non-code files | General + [version control](optional/version-control-rules.md) | Reviewing changes, preserving work, identities, commits, pushes, and exposed history. |
| Browser or desktop operation | General + [computer use](optional/browser-computer-use-rules.md) | Sessions, tabs, focus, and interface interaction for any task. |

For fresh installs, General is a suggested baseline; software and activity-specific guidance is opt-in. When updating existing instructions, compare before merging and avoid duplicate versions. Project instructions govern implementation choices, not waivers of required approval or safety. "Global" means reusable across tasks or projects, not permission to act everywhere.

Add personal preferences or an optional private context-file instruction under General's **Personalise** section. British English is used consistently in the supplied rules; it does not prescribe how agents must write your content.

The [scenario test plan](docs/rule-scenarios.md) provides eight safe checks for loading and behaviour across agents. Existing operating-system and specialist files remain available separately; they are not required for the starter setup.

These rules change over time and have not been tested with every agent, model, or workflow. Treat them as a starting point, not a guarantee of better or safer results. Review and adapt them, try them on a low-risk task, and review updates before adopting them.

## Use the review prompt builder

The [website](https://jitendravyas.github.io/agent-rulebook/) creates a review prompt with links to your selected public rules. It does not merge rules, install anything, or change agent settings. It updates when changes reach `main`.

Choose individual sets; opening a group selects nothing. General is selected by default. It can be deselected when reviewing add-ons against equivalent instructions you already have. Coding is a separate choice, not automatically included.

1. **Choose rules to review.** Choose one host OS where the agent runs commands or operates apps, not necessarily the device viewing the website. This selects its OS rules. Leave it unspecified if unsure; add other operating systems for remote machines, virtual machines, containers, or WSL. Each set applies only within its scope.
2. **Copy your review prompt.** Choose global instructions or instructions for a specific project. This sets review context, not installation location. Read the full prompt before copying.
3. **Ask your agent to review.** Paste the prompt into a conversation, opening the project first for a project review. The agent compares the references with instructions and skills it can inspect, skips duplicates and unsuitable guidance, flags conflicts, and proposes worthwhile edits. It must ask before editing and may recommend no changes.

The agent needs access to the public links and relevant instructions. The website never reads or uploads your private instructions, project files, or agent settings. Review recommendations yourself; an agent may miss conflicts or duplicates.

Bookmark the page address or use **Copy setup link** to save selected sets, host OS, and scope. These choices also appear in the prompt. Links restore choices, not a fixed rule version; prompts always link to public `main`. Older links leave the host unspecified and may warn about unavailable choices. Local preview links work only on the serving machine; share the hosted address with others.

The website's **Read the source rules** section links to the original Markdown files, this README, and the licence. People, crawlers, and agents can follow them without JavaScript.

With a compatible browser and agent, the builder also offers optional [WebMCP](https://developer.chrome.com/docs/ai/webmcp/) tools to list the available rule sets and generate the same review prompt. These tools return public rule links and prompt text for review; they do not save files, upload private content, or change agent settings. WebMCP is experimental; the normal controls work without it.

<details>
<summary>Preview the website locally</summary>

Serve the repository root with an existing static web server, then open its root URL in your browser. No package installation or build step is required; opening the HTML file directly is not supported.

Local previews still generate prompts linking to public `main`. They do not include unpublished local rule edits, even when the preview's source links show those edits.

</details>

## How to use

Copy rule text you decide to adopt, whether you used the website or reviewed the files yourself. Do not copy the builder's review prompt into an instruction file.

**Check how your agent loads instructions before copying.** There is no universal maximum rule-file size. Agents may have per-file limits, combined loading limits, or recommendations rather than hard limits. Content beyond an applicable loading limit may be omitted. Check your agent's current documentation for the applicable limit.

1. **Choose the scope.** Use your agent's user-level instructions for your own work across projects, or a project's instruction file for that project and its contributors.
2. **Review alongside your existing instructions.** Remove duplicates and resolve conflicts before changing active instructions. Preserve your own guidance, project requirements, safety boundaries, and each rule's conditions and exceptions.
3. **Save the reviewed rules.** Merge the selected content into your agent's supported instruction file, such as an `AGENTS.md` or `CLAUDE.md`, or into Cursor's User Rules under Customize → Rules. Use the filename, location, and format your agent requires. You can combine rules or keep them in separate files using supported imports or loading controls; an ordinary Markdown link is not a universal import. No package installation is needed.
4. **Confirm loading, then try a small task.** Check your agent's loading diagnostics where available, including whether referenced files loaded. Cloning this repository or saving files in an arbitrary folder does not activate them.

Copy the rule files above, not this repository's [AGENTS.md](AGENTS.md). That file is only for agents maintaining this repository.

For personal instructions across projects, see [Set up global rules](#set-up-global-rules). It links to official setup guides and distinguishes direct `AGENTS.md` support from imports and project-level support.

Loaded rules are standing instructions, not skills to invoke. The agent should recognise relevant conditions from context and apply the guidance without reminders. This does not expand the task or grant approval; mentioning audits, tests, or tools does not request them. Checks must match the work, risk, stage, and project requirements.

### Safe setup

This advice is for the person installing, not instructions to load into the agent. Rules guide behaviour; they cannot enforce it or guarantee safety. Follow [How to use](#how-to-use) to choose, merge, save, and confirm loading. Review updates before replacing active rules, retain the version/date, and keep the MIT licence notice when reusing the files.

- **Enable available controls.** Use approval prompts for destructive actions, installations, external writes, and access beyond the task. Prefer a sandbox restricted to the task directory and necessary network access. Do not disable controls because the rules ask for approval. If controls are unavailable, start with disposable data and restrict account permissions.
- **Protect Git commits from secrets.** If you use Git, configure an approved secret scanner through a global pre-commit hook. Check the effective hooks configuration and preserve or compose with existing hooks. Test with synthetic examples, never real credentials, and confirm coverage for new, changed, and non-text files. Local hooks can be bypassed and do not inspect other contributors' pushes or all outgoing history; use server-side push protection or continuous integration (CI) checks where available.
- **Store credentials securely.** Use an operating-system credential store or password/credential manager, not plaintext documents, agent instructions, source files, or chat. Use supported secure injection and least-privilege credentials. Do not paste secrets to prove they work.
- **Try the rules safely.** Keep private context outside this public repository. Run the [scenario checks](docs/rule-scenarios.md) in a disposable environment and review failures before trusting unattended work.

These documents and the website do not install tools or hooks, connect accounts, or change permissions.

### Set up global rules

Copy your selected rule text into the file or settings your agent supports. The filename does not have to be `AGENTS.md`. Support for a project's `AGENTS.md` does not mean that the same file loads globally.

<details>
<summary>Find your agent's official setup guide and AGENTS.md support</summary>

Documentation checked on 4 October 2026. These are documented defaults, not a complete list of agents or a runtime test of each one. Follow the linked guide for your product version, activation settings, imports, and limits. `~` means the home folder in the environment where the agent runs; check the guide for Windows paths and custom configuration locations.

| Agent and official guide | Global/user-level setup | `AGENTS.md` support |
| --- | --- | --- |
| [Codex](https://learn.chatgpt.com/docs/agent-configuration/agents-md) | `~/.codex/AGENTS.md` | Reads this global file directly, separately from project files. |
| [Claude Code](https://code.claude.com/docs/en/memory) | `~/.claude/CLAUDE.md` or `~/.claude/rules/` | Can import a shared `AGENTS.md` using `@path/to/AGENTS.md` in `CLAUDE.md`. Direct project loading depends on version, provider, and the **Project instructions** setting; see the note below. |
| [Cursor](https://cursor.com/help/customization/rules) | **Customize → Rules** for synced User Rules; `~/.cursor/rules` for local user rules | Reads project `AGENTS.md`; use User Rules for personal guidance across projects. |
| [GitHub Copilot CLI](https://docs.github.com/en/copilot/how-tos/copilot-cli/customize-copilot/add-custom-instructions) | `~/.copilot/copilot-instructions.md` or `~/.copilot/instructions/**/*.instructions.md` | Reads project `AGENTS.md`; a shared file can also load from a directory listed in `COPILOT_CUSTOM_INSTRUCTIONS_DIRS`. |
| [Copilot in VS Code](https://code.visualstudio.com/docs/agent-customization/custom-instructions) | User instruction files; placement differs between Local and Agent Host sessions | Project `AGENTS.md` support depends on the session type and settings. Follow the guide for the agent you use. |
| [Antigravity CLI](https://www.antigravity.google/docs/rules/) | `~/.gemini/AGENTS.md` or `~/.gemini/GEMINI.md` | Reads either global filename directly; also supports project instructions. |
| [Gemini CLI](https://geminicli.com/docs/cli/gemini-md/) (enterprise or paid API access) | `~/.gemini/GEMINI.md` by default | Configure `context.fileName` to recognise `AGENTS.md`; do not just rename the default file. Consumer users should see Antigravity CLI. |
| [Devin CLI / Devin Local](https://docs.devin.ai/cli/extensibility/rules) | `~/.config/devin/AGENTS.md` | Reads global and project `AGENTS.md`. [Devin Desktop's Devin Local agent](https://docs.devin.ai/desktop/devin-local) uses this setup, not legacy Cascade's global location. |
| [Windsurf for JetBrains](https://docs.devin.ai/windsurf/plugins/cascade/memories) | **Customizations → Rules → + Global** | Use the plugin's Global Rules option for personal instructions; do not assume Devin Desktop's file support applies to the plugin. |
| [OpenCode V2](https://opencode.ai/v2/docs/instructions) / [V1](https://opencode.ai/docs/rules/) | `~/.config/opencode/AGENTS.md` | Both read this global file directly. V1 and V2 differ in other supported instruction sources. |
| [Amp](https://ampcode.com/docs/customize/agents-md) | `~/.config/amp/AGENTS.md` | Reads this global file directly. |
| [Factory / Droid](https://docs.factory.com/harness/agents-md) | `~/.factory/AGENTS.md` | Reads personal and project `AGENTS.md` files. |
| [Cline](https://docs.cline.bot/customization/cline-rules) | Global Cline Rules directory or `~/.agents/AGENTS.md` | Reads this global file and project `AGENTS.md`; check the Rules panel for enabled sources. |
| [Kilo Code](https://kilo.ai/docs/customize/agents-md) | `~/.config/kilo/AGENTS.md` | Reads this global file directly. |
| [Augment / Auggie](https://docs.augmentcode.com/cli/rules) | `~/.augment/rules/` | Reads project `AGENTS.md`; the global directory accepts Markdown rule files. |
| [Junie CLI](https://junie.jetbrains.com/docs/guidelines-and-memory.html) | `~/.junie/AGENTS.md` | Reads this global file alongside project guidelines. |
| [Kiro IDE / CLI](https://kiro.dev/docs/steering/) | `~/.kiro/steering/` | Accepts `AGENTS.md` in this global directory. Custom agents require resource configuration; cloud sessions need separate setup. |
| [Mistral Vibe](https://docs.mistral.ai/vibe/code/cli/agents) | `~/.vibe/AGENTS.md` | Reads this global file directly. |
| [Pi](https://pi.dev/docs/latest/configuration) | `~/.pi/agent/AGENTS.md` | Reads this global file and project instructions. A custom agent directory changes the global location. |
| [Kimi Code CLI](https://www.kimi.com/code/docs/en/kimi-code-cli/customization/agents.html#instruction-files) | `~/.kimi-code/AGENTS.md` or shared `~/.agents/AGENTS.md` | Reads global and project instructions. This is the current Kimi Code CLI, not the archived Kimi CLI. |
| [Qwen Code](https://qwenlm.github.io/qwen-code-docs/en/users/features/memory/) | `~/.qwen/QWEN.md` | Reads project `AGENTS.md` too; `QWEN.md` can import a shared file using `@path/to/file`. |
| [OpenClaw](https://docs.openclaw.ai/concepts/agent-workspace) | `AGENTS.md` in the agent's workspace; default: `~/.openclaw/workspace/AGENTS.md` | Loads for that agent's sessions. Separate agents can have separate workspaces; this is not a machine-wide rules file. |
| [Hermes](https://hermes-agent.nousresearch.com/docs/guides/use-soul-with-hermes) | `~/.hermes/SOUL.md` for personal communication and behaviour defaults | Uses `AGENTS.md` for project instructions. Merge only relevant behaviour defaults into `SOUL.md`, not a full development bundle; preserve the existing persona. |
| [goose](https://goose-docs.ai/docs/guides/context-engineering/using-goosehints/) | `~/.config/goose/.goosehints` | [Version 1.39+](https://github.com/aaif-goose/goose/releases/tag/v1.39.0) also supports `~/.agents/AGENTS.md`. Check the required Developer extension. |
| [Zed Agent](https://zed.dev/docs/ai/instructions) | `~/.config/zed/AGENTS.md`; Windows: `%APPDATA%\Zed\AGENTS.md` | Reads this global file directly. External agents may use their own configuration instead. |
| [Aider](https://aider.chat/docs/config/aider_conf.html) | Set `read:` in `~/.aider.conf.yml` to an absolute file path | Can load an `AGENTS.md` through that configuration; it is not a special global filename. |
| [Warp](https://docs.warp.dev/agents/capabilities/rules/) | Global Rules in Warp Drive or agent settings | Reads repository `AGENTS.md` for project guidance; global rules are managed separately in the UI. |

Claude Code's [2.1.277 release notes](https://github.com/anthropics/claude-code/releases/tag/v2.1.277) added project `AGENTS.md` loading when no `CLAUDE.md` exists, initially excluding Bedrock, Vertex, and Foundry. Its memory guide still describes the import route. Check your version and `/config` before relying on direct loading.

For renamed or replaced products, follow the current product's guide: [Windsurf became Devin Desktop](https://devin.ai/blog/windsurf-is-now-devin-desktop), and [Gemini CLI consumer access moved to Antigravity CLI](https://developers.googleblog.com/an-important-update-transitioning-gemini-cli-to-antigravity-cli/). Instructions for one product or session type do not automatically apply to another.

</details>

<details>
<summary>Rule categories and optional tools</summary>

### General behaviour

[General rules](agent-global-rules.md) are useful for development and everyday work. They cover safety, approvals, verification, communication, and basic efficiency, not software-specific implementation. The categories below add context only when the task needs it.

### Operating systems

These additional add-ons can accompany General for development or everyday tasks. Choose the operating-system file for the environment where the agent works, including remote environments.

- [macOS agent rules](optional/macos-agent-rules.md): a compact safety add-on for agents that operate a Mac, including non-software tasks. Covers system protection, permissions, iCloud and Photos file handling, and local-processing boundaries. This safety layer can stay loaded; detailed tool guidance stays optional.
- [Windows agent rules](optional/windows-agent-rules.md): protect managed system files, handle redirected and synced folders, and keep Windows and WSL operations distinct.
- [Linux agent rules](optional/linux-agent-rules.md): respect distribution differences and protect system interfaces, permissions, and persistent application data.

### Tools and interfaces

- [Browser and computer use](optional/browser-computer-use-rules.md): managing browser sessions, tabs, and desktop interaction. Choose it when the agent operates a browser or app.
- [Version control](optional/version-control-rules.md): reviewing and preserving repository changes, commits, pushes, and conflicts across systems, with identity checks specifically for Git. Choose it for version-controlled work, including non-code files.

### Software development

Choose only the areas your agent needs. None requires a Git repository, and each can complement your own instructions:

- [Coding and maintenance](coding-agent-global-rules.md): shared implementation guidance for native apps, browser apps, and temporary software, including whole-feature performance and static code checks. It applies only to software work.
- [Web development](web-development-rules.md): browser-specific implementation, resource-loading safeguards, and security guidance.
- [Software testing](optional/software-testing-rules.md): test quality and proportionate browser verification. It does not trigger a full test suite or audit just because it is loaded. General retains the basic expectations to verify outcomes and report unchecked work honestly.
- [Browser animations](optional/browser-animation-rules.md): preserve application state and animation lifecycles when creating or changing live web motion. Not needed for web work without animation or for video exports.
- [Internationalization and localization](optional/internationalization-localization-rules.md): prepare software and product interfaces for different languages and regions, including translations and text direction. It is not for ordinary message or document translation.

### Creative media

- [Motion graphics videos](optional/motion-video-rules.md): keep composition, timeline, assets, and video export consistent. Use with General for motion graphics intended for MP4 or other video output; a browser preview alone does not require the web-development setup.

### Agent instructions

- [Agent workflow authoring](optional/agent-workflow-authoring-rules.md): write or maintain rules, skills, subagents, and tool workflows.

### Tool reference

[Helper tools](optional/helper-tools.md) covers utilities, integrations, and operating-system capabilities for research, browser use, files, and other tasks. It includes Windows and Linux diagnostics, Spotlight, text recognition, Shortcuts, and Apple Intelligence, with version conditions where needed. These tools are optional, not assumed to be installed. Provide relevant entries for a task or use supported conditional loading; do not load the whole reference in every session. No rule file imports it automatically.

</details>

## FAQ

### Do I need coding rules for non-development work?

No. General stands alone for non-development tasks. Add Coding only for software work. Browser and computer use, Version control, or other activity-specific guidance can be useful without software development.

Development rules also cover temporary and standalone work without a Git repository. They do not require browser automation or version control when unnecessary.

If one agent handles mixed work, your selected rules can stay loaded. Each applies only within its stated scope; use conditional loading where supported to reduce context use.

### What if the rules are too large?

Select fewer relevant sections, load sections conditionally where supported, or adjust a supported loading-limit setting. The split saves context only when you omit an irrelevant add-on; selecting all modules still combines all their text. A condition inside a copied rule does not stop that text from using context. Splitting files does not bypass a combined loading limit; increasing the limit does not reduce context use. Keep essential safety and approval boundaries in the instructions that load for the relevant work. Recheck the total when the rules or your existing instructions change.

### How do I migrate from older rule files?

The existing General and Coding files now include a version and update date. Replace old copied guidance rather than appending another copy, preserving personal preferences and essential safety protections.

`coding-agent-global-rules.md` remains a separate opt-in file. General does not include its software-specific guidance. Website links preserve General and Coding as separate choices; review the changed sources before adopting them.

Replace older copied web rules to remove the bundled animation section and detailed browser-testing checklist. Add the optional browser-animation rules only when relevant. The former standalone accessibility file is no longer needed; implementation safeguards remain in Coding and assessment boundaries are in Software testing.

The former standalone web-performance rules are also no longer needed. Basic efficiency is in General, software performance assessment is in Coding, and browser-loading safeguards are in Web. Remove older copied performance guidance when replacing it to avoid duplicates; none of these defaults requests an unrelated audit.

### What if they conflict with my project rules or skills?

These are gap-filling defaults, not a competing project policy. Follow your agent's instruction hierarchy and applicable task or project requirements for implementation and workflow choices. Resolve remaining material conflicts before adopting rules. Keep project-specific tools, commands, and conventions in project instructions, and detailed procedures in skills or references. Project rules and skills cannot waive required approval, security, or privacy protections.

### How should a team use these rules?

Your user-level rules do not affect teammates' agents. Agree on a shared subset, keep it in the project's version-controlled instructions, and confirm each agent loads it. Keep personal preferences at user level.

Record the source commit and agree who reviews updates. Rules do not enforce behaviour; use automated checks and permission controls for requirements that need enforcement.

### Will these rules save tokens?

Not necessarily. They add context and may add checks. Savings depend on whether they prevent enough mistakes and repeated prompting to offset that cost. Compare similar tasks with and without your selected rules, including time and rework.

### Will they make the agent ask permission more often?

They may. Downloads, installations, and publishing need approval unless already authorised. Exceptions cover temporary reference copies of public documentation and restoring a project's existing locked dependencies through its established workflow. These exceptions do not permit new tools, changed requirements, or wider access; see the [approval conditions](agent-global-rules.md#required-approval). Check that this policy fits your workflow. Routine in-scope work and already approved actions should not trigger repeated questions.

## Influences

The rules combine practical experience, research, and ideas shared publicly by other developers. They are updated as useful ideas or unnecessary friction become clear.

<details>
<summary>Tools used to refine the rules</summary>

[Vale](https://docs.vale.sh/) checks wording, [Promptfoo](https://www.promptfoo.dev/docs/intro/) has been used for small model-response comparisons, and [Firecrawl](https://docs.firecrawl.dev/introduction) supports research into public documentation and developer feedback. These tools help refine the rules but do not certify them. You do not need them to use the rules.

The [Vale workflow](.github/workflows/vale.yml) checks the general, software, web, and optional rule files after pushes to `main` that change them, the Vale configuration, or the workflow itself. Warnings are advisory; errors fail the check. It does not rewrite files.

The [website test workflow](.github/workflows/website.yml) runs on relevant pull requests and pushes to `main`. It checks rule-file links, catalog categories, review prompts, and saved-selection behaviour. Run it locally with Node.js 24: `node --test site/*.test.js`. These tests do not assess rendered appearance or accessibility.

</details>

<details>
<summary>Sources behind specific guidance</summary>

These sources contributed guidance that remains in the rules; this is not a list of everything reviewed.

- [ASD-STE100's writing principles](https://asd-ste100.org/STE_faq.html) informed short sentences, active voice, and one main idea per sentence in explanations. The rules borrow these principles without requiring the standard's restricted vocabulary or overriding the user's requested style.
- [EARS (Easy Approach to Requirements Syntax)](https://alistairmavin.com/ears/) informed placing conditions before actions and stating expected results. [Anthropic's prompting guidance](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices) informed giving a permitted alternative when a prohibition alone leaves the next action unclear. These guide instruction authoring, without requiring a fixed template or weakening safety restrictions.
- MDN's guidance on [animation timing](https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame), [transition completion](https://developer.mozilla.org/en-US/docs/Web/API/Element/transitionend_event), and [cancellation](https://developer.mozilla.org/en-US/docs/Web/API/Animation/cancel) informed the browser-animation safeguards.
- Remotion's guidance on [frame-based animation](https://www.remotion.dev/docs/animating-properties), [asset readiness](https://www.remotion.dev/docs/delay-render), and [encoding](https://www.remotion.dev/docs/encoding) informed the video rules without requiring that tool. W3C's [flash-safety guidance](https://www.w3.org/WAI/WCAG22/Understanding/three-flashes-or-below-threshold.html) informs avoiding rapid, high-contrast flashing.
- Apple's guidance on [command-line Shortcuts](https://support.apple.com/guide/shortcuts-mac/run-shortcuts-from-the-command-line-apd455c82f02/mac), [Script Editor and app scripting dictionaries](https://support.apple.com/en-ca/guide/script-editor/scpedt6935/mac), [app permissions](https://support.apple.com/guide/security/controlling-app-access-to-files-secddd1d86a6/web), [Gatekeeper](https://support.apple.com/en-us/102445), [System Integrity Protection](https://support.apple.com/en-us/102149), [Rosetta](https://support.apple.com/en-us/102527), [iCloud Drive files](https://support.apple.com/guide/mac-help/work-with-folders-and-files-in-icloud-drive-mchl1a02d711/mac), and [Photos libraries](https://support.apple.com/guide/photos/where-are-the-items-i-imported-pht12e7a8015/mac) informed the macOS safeguards and optional tool guidance.
- Apple's guidance on [Spotlight indexing](https://support.apple.com/en-ie/102321), [document version history](https://support.apple.com/guide/mac-help/view-and-restore-past-versions-of-documents-mh40710/mac), and [Live Text in Preview](https://support.apple.com/guide/preview/interact-with-text-in-a-photo-prvw625a5b2c/mac), plus the installed `mdfind` and `mdls` manuals, informed the native discovery and recovery guidance. The [macOS Monterey release notes](https://www.apple.com/newsroom/2021/10/macos-monterey-is-now-available/) establish the macOS 12 minimum for Shortcuts and Live Text.
- Apple's [Foundation Models CLI introduction](https://developer.apple.com/videos/play/wwdc2026/334/) and installed `fm` manual informed the conditional local-AI guidance. The [Container project](https://github.com/apple/container), [container machines](https://developer.apple.com/videos/play/wwdc2026/389/), and [macOS virtualization documentation](https://developer.apple.com/documentation/virtualization/virtualize-macos-on-a-mac) informed the distinction between isolated execution and shared resources.
- Microsoft's guidance on [Windows Resource Protection](https://learn.microsoft.com/en-us/windows/win32/wfp/about-windows-file-protection), [PowerShell objects](https://learn.microsoft.com/en-us/powershell/scripting/learn/ps101/03-discovering-objects), [event-log queries](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.diagnostics/get-winevent), [known folders](https://learn.microsoft.com/en-us/windows/win32/shell/known-folders), [exact-path handling](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.management/remove-item), [OneDrive Files On-Demand](https://support.microsoft.com/en-us/onedrive/save-disk-space-with-onedrive-files-on-demand-for-windows), and [WSL file systems](https://learn.microsoft.com/en-us/windows/wsl/filesystems) informed the Windows safeguards and optional tool guidance.
- The Linux kernel's documentation for [process information](https://docs.kernel.org/filesystems/proc.html) and [system attributes](https://docs.kernel.org/filesystems/sysfs.html), the Filesystem Hierarchy Standard's [persistent application state guidance](https://refspecs.linuxfoundation.org/FHS_3.0/fhs/ch05s08.html), systemd's manuals for [OS identification](https://github.com/systemd/systemd/blob/main/man/os-release.xml) and [journal queries](https://github.com/systemd/systemd/blob/main/man/journalctl.xml), and guidance on [SELinux](https://docs.redhat.com/en/documentation/red_hat_enterprise_linux/9/html-single/using_selinux/index) and [AppArmor](https://ubuntu.com/server/docs/how-to/security/apparmor/) informed the Linux safeguards and optional tool guidance without assuming every distribution uses those tools.
- [samwho's agent instructions](https://github.com/samwho/pi/blob/main/agent/APPEND_SYSTEM.md) informed choosing direct URL retrieval, browser inspection, and isolated helper-script dependencies for their intended uses, without requiring specific tools.
- [Task-status guidance by @kkurilyak](https://x.com/kkurilyak/status/2105068689087516783) informed carrying forward unfinished work and verification gaps within an active task, without a fixed report template.
- Google's [Lighthouse configuration](https://github.com/GoogleChrome/lighthouse/blob/v13.5.0/core/config/default-config.js) informed the web rules for browser permission requests, HTTPS resources, and HTTP response codes.
- Lauren Tan's [pstack article](https://x.com/poteto/article/2094457600259842065) and [verification-skill pattern](https://github.com/cursor/plugins/blob/main/pstack/skills/create-verification-skill/SKILL.md) shaped the emphasis on direct evidence and reusable verification for important recurring work.
- Samuel Hu's [run-receipt suggestion](https://x.com/realSamHu/status/2103409341240119777) and Harsh Munjal's [execution-record feedback](https://x.com/Mr_Munjal/status/2103394763109966193) informed inspecting available execution evidence before retries and naming verification checks, results, and relevant errors in reports. Adapted with error redaction, without requiring automatic logging, spend tracking, or a receipt before each retry.
- [Ohans Emmanuel's process-cleanup post](https://x.com/OhansEmmanuel/status/2103885312787439850) informed checking for a suitable running instance before starting another long-running development process.
- Ansh Nanda's [testing discussion](https://x.com/anshnanda/status/2101627891721371971) informed the requirement for meaningful tests with expected results independent of the implementation, without adopting an E2E-only policy.
- Matt Pocock's [tracer-bullet approach](https://www.aihero.dev/tracer-bullets) informed the small end-to-end path for unfamiliar multi-component features; his [small-change guidance](https://x.com/mattpocockuk/status/2103506709633466648) and [advice to pair direct evidence with a narrow, reversible change](https://x.com/mattpocockuk/status/2103601654113112276) informed keeping changes reviewable and recoverable.
- Addy Osmani's [Brownfield Agentic Engineering](https://addyosmani.com/blog/brownfield-agentic-engineering/) informed the rules to establish existing behaviour before refactoring and preserve safeguards and consumer compatibility during replacement.
- [AWS's secure agentic development guidance](https://docs.aws.amazon.com/prescriptive-guidance/latest/agentic-ai-security/best-practices-dev-practices.html) and OWASP's [input-validation](https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html), [injection-prevention](https://cheatsheetseries.owasp.org/cheatsheets/Injection_Prevention_Cheat_Sheet.html), and [CSRF-prevention](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html) guidance informed the trust-boundary and web-security rules.
- Jad Joubran's [Baseline article](https://www.smashingmagazine.com/2026/08/how-baseline-can-help-ship-less-javascript/) informed the browser-support decision rule without replacing project-specific compatibility requirements.
- [Anthropic's customisation guidance](https://claude.com/blog/steering-claude-code-skills-hooks-rules-subagents-and-more) informed the distinction between instructions and enforceable controls.
- [The Elements of Agent Style](https://github.com/yzhao062/agent-style/blob/99722a59e5ab654bafe68788f3bff7d1c8237f5a/RULES.md#L32-L42) informed writing for the intended reader, [consistent terminology](https://github.com/yzhao062/agent-style/blob/99722a59e5ab654bafe68788f3bff7d1c8237f5a/RULES.md#L681-L691), and [evidence-backed factual claims](https://github.com/yzhao062/agent-style/blob/99722a59e5ab654bafe68788f3bff7d1c8237f5a/RULES.md#L747-L757).

</details>

## Licence

Licensed under [MIT](LICENSE). When copying these rules or substantial portions of them, retain the copyright and permission notice from the licence.
