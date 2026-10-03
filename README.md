# AI agent rules

Reusable instructions to help AI agents stay within scope, protect existing work, check results, and explain them clearly. Use them with one agent or several, for everyday tasks, small experiments, or established software projects. They aim to reduce repeated prompting and avoidable mistakes without prescribing an operating system, framework, or agent.

These rules are intended for agents that work with files on a local machine, in a remote workspace, or in a sandbox. Load them through the agent's supported instruction files or rules settings, such as Cursor's User Rules. They are not designed for ordinary chatbot personalisation fields. Reading or uploading a file does not by itself activate it as standing instructions.

## Choose your rules

| Agent setup | Load these files | Covers |
| --- | --- | --- |
| General tasks | [General rules](agent-global-rules.md) | Research, files, documents, media, browser and device work. |
| Software development | [General](agent-global-rules.md) + [coding](coding-agent-global-rules.md) | Software planning, implementation, maintenance, and testing. |
| Web development | [General](agent-global-rules.md) + [coding](coding-agent-global-rules.md) + [web](web-development-rules.md) | Browser behaviour, resource loading, web security, and proportionate browser checks. |

Load the files in the order shown. "Global" means reusable across tasks or projects; your task and project requirements still set the architecture, tools, and conventions.

These rules change over time and have not been tested with every agent, model, or workflow. Treat them as a starting point, not a guarantee of better or safer results. Review and adapt them, try them on a low-risk task, and review updates before adopting them.

## Build a single rule file

The repository includes a static [rule builder](index.html). Serve the repository root with an existing static web server, then open its root URL in your browser. No package installation or build step is required; opening the HTML file directly is not supported.

Choose a preset or individual rule sets, review the combined text and file size, then copy it or download one Markdown file. The builder reads the original rule files, preserves their text, and includes the MIT licence. Drafts, the helper-tool reference, and repository-maintenance instructions are not bundled.

Optionally choose Codex, Claude Code, Cursor, or Other agent, then personal or project use. The builder shows the download filename, where to place the rules, and how to check loading. These choices do not change the rule text.

Your selection and setup choices stay in the page address. Bookmark it or use **Copy setup link**; shared links restore choices, not a frozen copy of the rules. Reopening or reloading reads the current rule files. Older links warn about unavailable choices. Local preview links work only on the machine serving them; share the hosted website’s address with others.

Open **Included rules & sizes** to see each selected file’s contribution and the licence, attribution, and separator overhead. These UTF-8 byte counts are calculated from the actual exported text, not hard-coded sizes or token estimates.

Downloading does not activate the rules or update existing agent settings. Merge the result with your current instructions and follow the setup guidance below. Selection happens in your browser; no account, analytics, or AI service is used by the builder.

With a compatible browser and agent, the builder also offers optional [WebMCP](https://developer.chrome.com/docs/ai/webmcp/) tools to list rule sets and assemble a file. Agent selections appear in the same builder. These tools return the file content for review; they do not save it or change agent settings. WebMCP is experimental; the normal controls work without it.

## How to use

**Check loading limits before copying.** The complete general + coding + web setup exceeds the [32 KiB default combined instruction limit documented for Codex](https://learn.chatgpt.com/docs/agent-configuration/agents-md). Content beyond a loading limit may be omitted. Compare your selected rules and existing instructions with your agent's current limit; see [what to do if the rules are too large](#what-if-the-rules-are-too-large).

1. **Choose the scope.** Use your agent's user-level instructions for your own work across projects, or a project's instruction file for that project and its contributors.
2. **Copy your chosen rules.** Put the selected content in your agent's supported instruction file, such as an `AGENTS.md` or `CLAUDE.md`, or paste it into Cursor's User Rules under Customize → Rules. For files, use the filename, location, and format your agent requires. The files do not automatically import one another. No package installation is needed.
3. **Merge with your existing instructions.** Remove duplicates and resolve conflicts. Keep project requirements, safety boundaries, and the conditions and exceptions attached to each rule.
4. **Confirm loading, then try a small task.** Check your agent's loading diagnostics where available. Cloning this repository or saving files in an arbitrary folder does not activate them.

Copy the rule files above, not this repository's [AGENTS.md](AGENTS.md). That file is only for agents maintaining this repository.

For placement details, see the official instructions for [Cursor](https://cursor.com/docs/rules), [Codex](https://developers.openai.com/codex/guides/agents-md), [Claude Code](https://code.claude.com/docs/en/memory), or your chosen agent.

Once loaded, these are standing instructions, not skills you need to invoke. The agent should apply only what is relevant to your request, without starting extra audits, tests, or installations just because a rule mentions them. Browser checks should match the requested work, risk, stage, and project requirements, not run a full audit for every web task.

<details>
<summary>Optional rules and tools — skip unless needed</summary>

### Specialist rules

These are not required for the basic web setup. OS-specific rules can accompany any setup, including general tasks without coding rules. Choose the add-on for the environment the agent operates in, including remote environments. For other specialities, prefer project-level instructions or supported file- or task-specific loading instead of loading every file in every session.

- [Browser animations](optional/browser-animation-rules.md): preserve application state and animation lifecycles when creating or changing live web motion. Not needed for web work without animation or for video exports.
- [Web performance](optional/web-performance-rules.md): investigate and measure relevant performance changes without treating a local result as proof for all users.
- [Motion graphics videos](optional/motion-video-rules.md): keep composition, timeline, assets, and video export consistent. Use with the general rules for motion graphics intended for MP4 or other video output; a browser preview alone does not require the web-development setup.
- [Internationalization and localization](optional/internationalization-localization-rules.md): prepare code for different languages and regions, and handle translations and text direction without requiring translation infrastructure in every project.
- [Agent workflow authoring](optional/agent-workflow-authoring-rules.md): write or maintain rules, skills, subagents, and tool workflows.
- [macOS agent rules](optional/macos-agent-rules.md): a compact safety add-on for agents that operate a Mac, including non-software tasks. Covers system protection, permissions, iCloud and Photos file handling, and local-processing boundaries. This safety layer can stay loaded; detailed tool guidance stays optional.
- [Windows agent rules](optional/windows-agent-rules.md): protect managed system files, handle redirected and synced folders, and keep Windows and WSL operations distinct.
- [Linux agent rules](optional/linux-agent-rules.md): respect distribution differences and protect system interfaces, permissions, and persistent application data.

### Tool reference

[Helper tools](optional/helper-tools.md) covers utilities, integrations, and operating-system capabilities for research, browser use, files, and other tasks. It includes Windows and Linux diagnostics, Spotlight, text recognition, Shortcuts, and Apple Intelligence, with version conditions where needed. These tools are optional, not assumed to be installed. Provide relevant entries for a task or use supported conditional loading; do not load the whole reference in every session. No rule file imports it automatically.

</details>

## FAQ

### Do I need coding rules for non-development work?

No. The general rules work on their own or with OS-specific rules, including when the agent uses tools, helper scripts, or temporary browser output. Add coding or web rules when you want their specialised development guidance.

The development rules also cover temporary and standalone work without a Git repository. No setup requires project structure, dependencies, test infrastructure, or version control that the task does not need.

If one agent handles mixed work, your selected rules can stay loaded. Each applies only within its stated scope; use conditional loading where supported to reduce context use.

### What if the rules are too large?

Select fewer relevant sections, load sections conditionally where supported, or adjust a supported loading-limit setting. A condition inside a copied rule does not stop that text from using context. Splitting the same text across files does not avoid a combined limit, and increasing that limit does not reduce context use. Keep essential safety and approval boundaries in the instructions that load for the relevant work. Recheck the total when the rules or your existing instructions change.

### How do I migrate from the coding rules?

When replacing an earlier version of `coding-agent-global-rules.md`, add `agent-global-rules.md` at the same time. Shared safety, permissions, tool use, research, communication, and verification guidance have moved there. Keep the coding file for software development and add the web file for web development. Replace the old copied rules rather than appending duplicate versions, while preserving your own instructions.

Replace older copied web rules to remove the bundled animation section and detailed browser-testing checklist. Add the optional browser-animation rules only when relevant. The former standalone accessibility file is no longer needed; scoped safeguards remain in the web rules.

### What if they conflict with my project rules or skills?

These are defaults, not a replacement for project requirements or your agent's instruction hierarchy. Resolve conflicts before adopting them. Keep project-specific tools, commands, and conventions in project instructions, and detailed procedures in skills or references. Project rules and skills cannot waive required approval, security, or privacy protections.

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

</details>

<details>
<summary>Sources behind specific guidance</summary>

These sources contributed guidance that remains in the rules; this is not a list of everything reviewed.

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
