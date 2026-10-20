# Agent Rulebook

Reusable instructions for AI agents, with broad global defaults, optional activity guidance, and reusable project-scoped rules. Global defaults protect work and guide everyday behavior. Activity guidance applies only to the work it covers; project-scoped rules can serve many projects of the relevant kind without loading in unrelated projects.

When supported and enabled, user-level **global instructions** load across an agent's sessions, so keep them broadly useful. A **project handbook** loads for its own project and is the place for that repository's build and test commands, layout, style, and conventions. **Skills** are separate, on-demand playbooks for repeatable specialized work where the agent supports them; this repository provides rules, not skills. Do not put a detailed skill procedure into always-loaded instructions merely because the agent can use skills.

These rules are for agents that work with files on a local machine, in a remote workspace, or in a sandbox. Load them through the agent's supported instruction files or rules settings, such as Cursor's User Rules. They are not designed for ordinary chatbot personalization fields, and reading or uploading a file does not by itself activate it as standing instructions. The website's generated prompt is a one-time request for an agent conversation, not text for a Custom Instructions box.

The rules also apply without a desktop, including servers accessed only through SSH. Use available tools for the task. If a required interaction or visual check is unavailable, report the gap rather than claiming it passed.

For the `AGENTS.md` format, examples, FAQ, and supported-agent directory, see [agents.md](https://agents.md/). The instructions below explain how to use this repository's rules.

Choose how to start:

- [Use the website](https://jitendravyas.github.io/agent-rulebook/) to ask your agent which rules fit your existing instructions.
- [Copy reviewed rule text](#how-to-use) yourself if you already know what you need.

## Choose only relevant rule sets

The rule files are for agents; this README is for people choosing and installing them.

- **Global defaults:** General and the applicable OS safety file suit user-level instructions across tasks.
- **Optional activities:** Coding, Version control, Browser use, and Computer use suit global use when they recur across tasks; otherwise use relevant project, task-scoped, or supported conditional guidance. A file in `global/` does not require global installation.
- **Reusable project-scoped rules:** Files in `project/` can be used in many matching projects, but belong only in the projects where their topic applies. For one-off work without project instructions, ask for task-scoped guidance that applies only to that conversation. Keep each project's own commands, layout, style, tools, and requirements in its handbook, not user-level global rules.

If narrower loading is unavailable for occasional work, use task-specific guidance instead of adding permanent instructions.

Each rule file is independent; none requires General or another module. [General rules](global/general-rules.md) are a starting point for shared safety and behavior without a project, desktop, plugins, or skills. Use the source Git commit for an exact revision.

When combining sets, merge equivalent guidance without losing any distinct requirement, condition, exception, or safety protection. Preserve when each instruction applies; retain separate guidance if equivalence is uncertain. Across separately loaded files, remove overlap only when the remaining instruction is confirmed to apply and load everywhere needed.

**Do not load the whole collection by default.** Preserve required approval, security, and privacy protections in your active instructions, whether from General or your own guidance. Add only modules for work that agent actually does. For example, research and documents need no Coding or Web rules; building a website does not automatically need animation, localization, or desktop-operation rules.

| Agent setup | Relevant standalone file | Covers |
| --- | --- | --- |
| Agent works on macOS | [macOS rules](global/macos-agent-rules.md) | System protection, app permissions, synced files, and local-processing boundaries. |
| Agent works on Windows | [Windows rules](global/windows-agent-rules.md) | Protected files, redirected and synced folders, and Windows Subsystem for Linux boundaries. |
| Agent works on Linux | [Linux rules](global/linux-agent-rules.md) | Distribution differences, protected system interfaces, permissions, and persistent state. |
| Any task | [General rules](global/general-rules.md) | Scope, approvals, safety, privacy, verification, communication, tool use, basic efficiency, and file-reference maintenance. |
| Browser operation | [Browser use rules](global/browser-use-rules.md) | Browser choice, sessions, tabs, and page state for any task. |
| Desktop operation | [Computer use rules](global/computer-use-rules.md) | Focus, selection, and window control for agents with desktop access. |
| Version control, including non-code files | [Version control rules](global/version-control-rules.md) | Using tools like Git to review changes, preserve work, and check identities, commits, pushes, and exposed history. |
| Software development | [Software development rules](global/coding-rules.md) | Software implementation, security, maintenance, performance, and static checks. |
| Software testing | [Software testing rules](project/software-testing-rules.md) | Running existing tests and writing or updating tests for software changes. |
| Live UI animation | [Web and native UI animation rules](project/interactive-ui-animation-rules.md) | Animation behavior, reduced motion, interruption, and cleanup in browser and native apps. |
| Software localization | [Software localization rules](project/internationalization-localization-rules.md) | Multiple languages, regional formats, and text direction in software. |
| Web development | [Web development rules](project/web-development-rules.md) | Browser-specific implementation, resource loading, web security, and verification of rendered results and interactions. |
| Apple app development | [Apple app development rules](project/apple-app-development-rules.md) | App-specific approvals, file-access boundaries, and privacy declarations. |
| Android app development | [Android app development rules](project/android-app-development-rules.md) | App-specific approvals, component exposure, and merged manifests. |

"Global" means reusable across tasks or projects, not permission to act everywhere. Project instructions govern implementation choices, not waivers of required approval or safety.

When combining files, if General is included, keep General first, selected add-ons next, and move General's **Personalize** section, including any preferences already added, to the end. Change its heading to `# Personalize` so it is separate from every add-on. Keep `## Personalize` when using General alone. Under Personalize, add any personal preferences and, if useful, name a private context file and when the agent should read it.

Before copying rules, check [instruction loading and size](#instruction-loading-and-size).

American English is used consistently in the supplied rules; it does not prescribe how agents must write your content.

The [behavior scenarios](https://github.com/jitendravyas/agent-rulebook/blob/main/tests/agent-rule-scenarios.md) provide nine safe scenarios for checking loading and behavior across agents.

These rules change over time and have not been tested with every agent, model, or workflow. Treat them as a starting point, not a guarantee of better or safer results. Review and adapt them, try them on a low-risk task, and review updates before adopting them.

## Use the review prompt builder

The [website](https://jitendravyas.github.io/agent-rulebook/) offers separate choices so you can keep your agent's always-loaded instructions focused. Use it with an agent that can read the linked public rule files and the instruction files being reviewed. If your app only offers a Custom Instructions text box, do not paste the generated prompt there. Global guidance may live in a user-level `AGENTS.md` or `CLAUDE.md` when supported. Reusable project-scoped choices belong in each relevant project, not the global file. The website generates a review prompt, not an installed rule file. The prompt keeps editing destinations separate and confirms activity placement from intended use. The website updates after its checks pass on `main`.

The choices are grouped by where the rules belong:

1. **Global defaults:** General first, followed by optional operating-system rules. Choose the OS where your agent works, not the apps it builds.
2. **Activity rules:** Browser use, Computer use, Version control, and Software development. Keep these global for regular use across projects; otherwise use them only in the relevant project or task. Select Computer use only if your agent can control desktop apps.
3. **Project rules:** optional additions for relevant projects, grouped into Platform Agnostic Rules, Web development, and Native app development. Platform agnostic means independent of platform, not required for every project. Web development includes browser verification.

All choices remain visible and independently selectable. The prompt asks your agent to confirm placement before suggesting edits. **Details** explains each choice and links to its source without selecting it. For one-off work, use project guidance only for that task. Skills remain separate, on-demand playbooks.

The published website checks for a newer version once when opened. Before interaction, it can reload once with your selections preserved; otherwise it offers **Load latest**. Failed checks leave the page usable. It does not poll for changes while you work.

**General rules** start selected; you can uncheck them. Choose one OS or use **Clear OS selection**, which keeps other choices. Selecting Web, Apple, or Android development adds **Software development rules**; you can uncheck them if already covered. Testing, localization, and animation do not add Software development. Directly selecting **Software development rules** also selects **Version control rules**; uncheck them if unnecessary. Saved links restore your exact choices. **Clear selection** removes all choices.

1. **Choose relevant rules.** Use the [selection guide above](#choose-only-relevant-rule-sets); select only the groups that fit your work.
2. **Click Preview prompt, then copy it.** The full prompt stays hidden until you click **Preview prompt**. Check its labeled source lists; changing choices hides the preview.
3. **Ask your agent to review.** Paste the prompt into a conversation, not an instruction file or Custom Instructions box. If you selected project-scoped rules for an existing project, open that project first; review another project separately. For one-off work without project instructions, ask for task-scoped guidance instead. The agent first reads existing instructions without changing them, then summarizes proposed additions, their value, unchanged personal or machine-specific guidance, and a private backup plan. It asks for approval for each affected location before creating backups or editing. It must confirm an unclear project target and leave unselected locations unchanged. It may recommend no changes.

The agent needs access to the public links and relevant instructions. The website never reads or uploads private instructions, project files, or agent settings, and does not merge rules, install anything, or change settings. Review recommendations yourself; an agent may miss conflicts or duplicates.

The prompt asks the agent to check for incomplete or truncated sources, retrieve missing text, or report sources it cannot fully read. It must check adopted guidance against the complete sources for lost or invented requirements, conditions, exceptions, and safety protections, including after saving approved edits. It must read the source license separately and propose any required copyright and permission notices in a separate file beside the instructions.

Source links are for the review, not your installed instructions. Adopted rule text must omit repository branding, source links, paths, and tracking metadata. Required license notices stay outside active rules.

For a first setup, the prompt asks your agent to propose suitable instruction locations and edits. If you already have instructions, it treats them as the baseline and leaves useful, nonconflicting content exactly as written. No files are created or replaced until you approve the proposed destinations, edits, and backup locations. After approval, the agent must verify a private, recoverable copy of each existing file before changing it; if it cannot, it stops instead of editing.

For later reviews, reopen the website, revisit your choices, and copy a fresh prompt. Bookmark the page address or use **Copy setup link** to remember selected sets. Links restore choices, not a fixed rule version or a record of what you adopted. An old copied prompt still reads current `main` for its existing links, but it cannot include new sets or later prompt improvements; a removed or renamed source needs a refreshed selection. An exact since-last-review comparison needs a known earlier-reviewed source revision or copy. The prompt asks your agent to report the retrieval date and an exact source revision when verifiable in its reply, not in adopted instructions. Keep that reply if you want a baseline for next time. Without one, the agent should compare current sources with your active instructions and ask before removing anything; a missing source rule may still be your own useful instruction. Local preview links work only on the serving machine; share the hosted address with others.

The website's **Read the source rules** section links to the original Markdown files, this README, and the license. People, crawlers, and agents can follow them without JavaScript.

<details>
<summary>Preview the website locally</summary>

Serve the repository root with an existing static web server, then open its root URL in your browser. No package installation or build step is required; opening the HTML file directly is not supported.

Local previews still generate prompts linking to public `main`. They do not include unpublished local rule edits, even when the preview's source links show those edits.

</details>

## How to use

Copy rule text you decide to adopt, whether you used the website or reviewed the files yourself. Do not copy the builder's review prompt into an instruction file.

1. **Find supported instruction locations.** Use the [placement guidance above](#choose-only-relevant-rule-sets) and your agent's documentation. Support for project instructions alone does not confirm global loading.
2. **Review alongside your existing instructions.** Remove duplicates and resolve conflicts before changing active instructions. Preserve your own guidance, project requirements, safety boundaries, and each rule's conditions and exceptions.
3. **Save reviewed rules at the agreed locations.** Do not merge both groups into one global file. Use the filenames and formats your agent supports, and obtain approval for each affected location. Supported imports or loading controls can organize files; an ordinary Markdown link is not a universal import. No package installation is needed.
4. **Confirm loading, then try a small task.** Check your agent's loading diagnostics where available, including whether referenced files loaded. Cloning this repository or saving files in an arbitrary folder does not activate them.

Copy the rule files above, not this repository's [AGENTS.md](https://github.com/jitendravyas/agent-rulebook/blob/main/AGENTS.md). That file is only for agents maintaining this repository.

See [Set up global rules](#set-up-global-rules) for official setup guides. The table distinguishes global loading from imports and project-only support so you can choose the right location.

Loaded rules are standing instructions, not skills to invoke. The agent should recognize relevant conditions from context and apply the guidance without reminders. This does not expand the task or grant approval; mentioning audits, tests, or tools does not request them. Checks must match the work, risk, stage, and project requirements.

### Instruction loading and size

Check your agent's current documentation before copying. There is no universal maximum rule-file size: agents may have per-file limits, combined loading limits, or recommendations rather than hard limits. Content beyond a loading limit may be omitted. Recheck the total when instructions change. Loading a file in full does not mean its size is effective; unnecessary guidance consumes context.

Select fewer relevant sections or use supported conditional loading. An “Apply when” sentence limits behavior, not context use: its text still loads. Separate files save context only when irrelevant files stay unloaded. Imports alone do not reduce context use or bypass a combined loading limit. Keep essential safety and approval boundaries active.

For example, [Claude Code recommends keeping each `CLAUDE.md` under 200 lines](https://code.claude.com/docs/en/memory#write-effective-instructions). This is a recommendation, not a hard line limit or a target for other agents. Its imports load at startup too.

### Safe setup

This advice is for the person installing, not instructions to load into the agent. Rules guide behavior; they cannot enforce it or guarantee safety. Follow [How to use](#how-to-use) to choose, merge, save, and confirm loading. Review updates before replacing active rules and keep the MIT license notice when reusing the files.

- **Enable available controls.** Use approval prompts for destructive actions, installations, external writes, and access beyond the task. Prefer a sandbox restricted to the task directory and necessary network access. Do not disable controls because the rules ask for approval. If controls are unavailable, start with disposable data and restrict account permissions.
- **Protect Git commits from secrets.** If you use Git, configure an approved secret scanner through a global pre-commit hook. Check the effective hooks configuration and preserve or compose with existing hooks. Test with synthetic examples, never real credentials, and confirm coverage for new, changed, and non-text files. Local hooks can be bypassed and do not inspect other contributors' pushes or all outgoing history; use server-side push protection or continuous integration (CI) checks where available.
- **Store credentials securely.** Use an operating-system credential store or password/credential manager, not plaintext documents, agent instructions, source files, or chat. Use supported secure injection and least-privilege credentials. Do not paste secrets to prove they work.
- **Try the rules safely.** Keep private context outside this public repository. Run the [behavior scenarios](https://github.com/jitendravyas/agent-rulebook/blob/main/tests/agent-rule-scenarios.md) in a disposable environment and review failures before trusting unattended work.

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
| [Gemini CLI](https://geminicli.com/docs/cli/gemini-md/) (enterprise or paid API access) | `~/.gemini/GEMINI.md` by default | Configure `context.fileName` to recognize `AGENTS.md`; do not just rename the default file. Consumer users should see Antigravity CLI. |
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
| [Hermes](https://hermes-agent.nousresearch.com/docs/guides/use-soul-with-hermes) | `~/.hermes/SOUL.md` for personal communication and behavior defaults | Uses `AGENTS.md` for project instructions. Merge only relevant behavior defaults into `SOUL.md`, not a full development bundle; preserve the existing persona. |
| [goose](https://goose-docs.ai/docs/guides/context-engineering/using-goosehints/) | `~/.config/goose/.goosehints` | [Version 1.39+](https://github.com/aaif-goose/goose/releases/tag/v1.39.0) also supports `~/.agents/AGENTS.md`. Check the required Developer extension. |
| [Zed Agent](https://zed.dev/docs/ai/instructions) | `~/.config/zed/AGENTS.md`; Windows: `%APPDATA%\Zed\AGENTS.md` | Reads this global file directly. External agents may use their own configuration instead. |
| [Aider](https://aider.chat/docs/config/aider_conf.html) | Set `read:` in `~/.aider.conf.yml` to an absolute file path | Can load an `AGENTS.md` through that configuration; it is not a special global filename. |
| [Warp](https://docs.warp.dev/agents/capabilities/rules/) | Global Rules in Warp Drive or agent settings | Reads repository `AGENTS.md` for project guidance; global rules are managed separately in the UI. |

Claude Code's [2.1.277 release notes](https://github.com/anthropics/claude-code/releases/tag/v2.1.277) added project `AGENTS.md` loading when no `CLAUDE.md` exists, initially excluding Bedrock, Vertex, and Foundry. Its memory guide still describes the import route. Check your version and `/config` before relying on direct loading.

For renamed or replaced products, follow the current product's guide: [Windsurf became Devin Desktop](https://devin.ai/blog/windsurf-is-now-devin-desktop), and [Gemini CLI consumer access moved to Antigravity CLI](https://developers.googleblog.com/an-important-update-transitioning-gemini-cli-to-antigravity-cli/). Instructions for one product or session type do not automatically apply to another.

</details>

<details>
<summary>Rule categories and optional tools</summary>

### General behavior

[General rules](global/general-rules.md) include tool guidance when tools are used; they do not require tool use for ordinary replies.

- [Version control](global/version-control-rules.md): using tools like Git to review and preserve repository changes, commits, pushes, and conflicts. Shown under Activity rules for code and non-code tasks; select it only when relevant. Selecting Software development checks it by default, but it remains independently selectable.

### Operating systems

Choose an optional operating-system file for the system where the agent works, not the platform of apps it builds. Each file also works without General.

- [macOS agent rules](global/macos-agent-rules.md): a compact safety add-on for agents that operate a Mac, including non-software tasks. Covers system protection, permissions, iCloud and Photos file handling, and local-processing boundaries. This safety layer can stay loaded; detailed tool guidance stays optional.
- [Windows agent rules](global/windows-agent-rules.md): protect managed system files, handle redirected and synced folders, and keep Windows and WSL operations distinct.
- [Linux agent rules](global/linux-agent-rules.md): respect distribution differences and protect system interfaces, permissions, and persistent application data.

### Browser and computer use

- [Browser use](global/browser-use-rules.md): guidance for agents that can navigate and interact with websites. Covers browser choice, tabs, sessions, and page state for any task.
- [Computer use](global/computer-use-rules.md): guidance for agents that can control desktop apps or system interfaces. Covers choosing the intended app, window, and control before acting. Select each file only if your agent has the relevant tools.

### Project-specific software additions

Choose only the areas your agent needs. None requires a Git repository, and each can complement your own instructions:

Keep these additions in the relevant project's instructions or supported project-scoped rules, rather than loading them in every agent session. Shared Coding guidance remains in `global/` and may be copied into a project when appropriate.

- [Coding and maintenance](global/coding-rules.md): shared implementation guidance for native apps, browser apps, and temporary software, including whole-feature performance and static code checks. It applies only to software work.
- [Web development](project/web-development-rules.md): browser-specific implementation, resource-loading safeguards, security, and verification of rendered results and interactions through manual or automated checks in the intended browser or embedded runtime. Software testing covers test design and execution; Browser use covers ordinary browser operation.
- [Apple app development](project/apple-app-development-rules.md): three optional safeguards for app-specific approvals, file-access boundaries, and privacy declarations. Applies to the Apple app platforms you target, not merely using an Apple device.
- [Android app development](project/android-app-development-rules.md): three optional safeguards for app-specific approvals, component exposure, and merged manifests. Applies to Android apps, not merely using an Android device. Both modules are separate from the agent's operating-system choice. They complement shared Coding guidance without summarizing platform documentation or prescribing a framework or development tool.
- [Software testing](project/software-testing-rules.md): optional guidance for agents that run existing tests or write and update tests for software changes, including browser end-to-end tests when relevant. Covers affected input boundaries, representative interface content, accessibility assessment boundaries, and spelling in changed user-facing text while avoiding duplicate coverage. It does not trigger a full test suite or audit just because it is loaded. General retains the basic expectations to verify outcomes and report unchecked work honestly.
- [Web and native UI animation](project/interactive-ui-animation-rules.md): optional guidance for live animation in browser and native app interfaces. Keeps state, controls, and cleanup reliable when motion is interrupted.
- [Software localization](project/internationalization-localization-rules.md): optional guidance for apps, websites, and other software that support multiple languages or regional formats. Browser-specific translation controls and document checks are in Web development.

General asks agents to check requested appearance or interaction in the actual result when possible. Software testing covers writing and running tests, including browser end-to-end tests when relevant. Web development includes safeguards for checking rendered software in the intended browser. Detailed browser or device verification workflows, and project-specific cross-browser targets, belong in the relevant project or an on-demand skill.

### Tool reference

The [helper-tool reference](reference/helper-tools.md) covers utilities, integrations, and operating-system capabilities for research, browser use, files, and other tasks. It includes Windows and Linux diagnostics, Spotlight, text recognition, Shortcuts, and Apple Intelligence, with version conditions where needed. These tools are optional, not assumed to be installed. Provide relevant entries for a task or use supported conditional loading; do not load the whole reference in every session. No rule file imports it automatically. Git history records edits, not verification of every tool or requirement.

</details>

## FAQ

### How do I migrate from older rule files?

Rule files now live in `global/` or `project/`. The former root-level General and Coding files are `global/general-rules.md` and `global/coding-rules.md`; Web and the specialist software modules are in `project/`. Update imports or links to the old paths. Already-copied rule text does not move automatically. Review placement before updating installed instructions; do not duplicate a module in both locations unnecessarily.

Replace old copied guidance rather than appending another copy, preserving personal preferences and essential safety protections.

<details>
<summary>Changes to older files and saved links</summary>

Communication and Tools and execution are now part of General rather than separate files or website choices. When adopting the updated General, remove equivalent older copied guidance to avoid duplication; preserve personal preferences. Older website links selecting either former module now select General once for review and show a migration notice.

`global/coding-rules.md` remains a separate opt-in file. General does not include its software-specific guidance. Website links preserve General and Coding as separate choices; review the changed sources before adopting them.

Browser verification is now part of Web development rather than a separate file or website choice. Older saved links select Web development once and show a notice to review its broader scope. When adopting the combined file, remove equivalent older browser-verification guidance to avoid duplication. The former Native app verification choice is no longer a separate rule file; older saved links selecting it show a notice without adding a replacement. Review previously adopted guidance before removing it from your own instructions.

Browser and computer use are now separate choices. Older website links selecting the combined choice keep both and show a notice. New links can select Browser use without Computer use. When updating installed guidance, retain only the capabilities your agent actually has.

Browser animation is now Web and native UI animation, with guidance for live browser and native interfaces. Older website links keep the selection and show a scope-change notice. Replace the older copied module rather than adding a second copy.

Replace older copied web rules to remove the bundled animation section and detailed browser-testing checklist. Add the optional Web and native UI animation rules only when relevant. The former standalone accessibility file is no longer needed; implementation safeguards remain in Coding and assessment boundaries are in Software testing.

The former standalone web-performance rules are also no longer needed. Basic resource-efficiency guidance is in General, software performance assessment is in Coding, and browser-loading safeguards are in Web. Remove older copied performance guidance when replacing it to avoid duplicates; none of these defaults requests an unrelated audit.

Saved links store rule choices, not a single review destination. Old scope parameters are ignored with a notice, while selected rules are kept. Each source follows its labeled or confirmed destination, with activity placement confirmed from intended use. Check the prompt before copying. Old host-OS parameters are ignored.

</details>

### What if they conflict with my project rules or skills?

These are gap-filling defaults, not a competing project policy. Follow your agent's instruction hierarchy and applicable task or project requirements for implementation and workflow choices. Resolve remaining material conflicts before adopting rules. Keep project-specific tools, commands, and conventions in project instructions, and detailed procedures in skills or references. Project rules and skills cannot waive required approval, security, or privacy protections.

### How should a team use these rules?

Global instructions apply only to the adopting user's agent. Project instructions can be shared with a team through the project's supported instruction files. Agree on project requirements and preserve global safety protections; do not assume teammates load the same global defaults.

Record the source commit and agree who reviews updates. Rules do not enforce behavior; use automated checks and permission controls for requirements that need enforcement.

### Will these rules save tokens?

Not necessarily. They add context and may add checks. Savings depend on whether they prevent enough mistakes and repeated prompting to offset that cost. Compare similar tasks with and without your selected rules, including time and rework.

### Will they make the agent ask permission more often?

They may. Downloads, installations, and publishing need approval unless already authorized. Exceptions cover temporary reference copies of public documentation and restoring a project's existing locked dependencies through its established workflow. These exceptions do not permit new tools, changed requirements, or wider access; see the [approval conditions](global/general-rules.md#required-approval). Check that this policy fits your workflow. Routine in-scope work and already approved actions should not trigger repeated questions.

## Influences

The rules combine practical experience, research, and ideas shared publicly by other developers. They are updated as useful ideas or unnecessary friction become clear.

<details>
<summary>Tools used to refine the rules</summary>

[Vale](https://docs.vale.sh/) checks wording, [Promptfoo](https://www.promptfoo.dev/docs/intro/) has been used for small model-response comparisons, and [Firecrawl](https://docs.firecrawl.dev/introduction) supports research into public documentation and developer feedback. These tools help refine the rules but do not certify them. You do not need them to use the rules.

The [Vale workflow](https://github.com/jitendravyas/agent-rulebook/blob/main/.github/workflows/vale.yml) checks the general, software, web, and optional rule files after pushes to `main` that change them, the Vale configuration, or the workflow itself. Warnings are advisory; errors fail the check. It does not rewrite files.

The [website workflow](https://github.com/jitendravyas/agent-rulebook/blob/main/.github/workflows/website.yml) runs on relevant pull requests and pushes to `main`. It checks rule-file links, catalog categories, review prompts, and saved-selection behavior. On pushes to `main`, successful checks package the public site before the dependent deployment job publishes it. Asset URLs include the deployment version so refreshed pages load matching code. Pull requests do not deploy. GitHub Pages must use GitHub Actions as its publishing source. Run the checks locally with Node.js 24: `node --test tests/*.test.js`. These tests do not assess rendered appearance or accessibility.

</details>

<details>
<summary>Sources behind specific guidance</summary>

These sources contributed guidance that remains in the rules; this is not a list of everything reviewed.

- Apple's guidance on [sandbox file access](https://developer.apple.com/documentation/security/accessing-files-from-the-macos-app-sandbox), [shared app data](https://developer.apple.com/documentation/technologyoverviews/shared-data), and [privacy manifests](https://developer.apple.com/documentation/bundleresources/privacy-manifest-files) informed the Apple app safeguards.
- Android's guidance on [component exposure](https://developer.android.com/privacy-and-security/risks/android-exported), [intents](https://developer.android.com/guide/components/intents-filters), and [manifest merging](https://developer.android.com/build/manage-manifests) informed the Android app safeguards.

- [ASD-STE100's writing principles](https://asd-ste100.org/STE_faq.html) informed short sentences, active voice, and one main idea per sentence in explanations. The rules borrow these principles without requiring the standard's restricted vocabulary or overriding the user's requested style.
- [EARS (Easy Approach to Requirements Syntax)](https://alistairmavin.com/ears/) informed placing conditions before actions and stating expected results. [Anthropic's prompting guidance](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices) informed giving a permitted alternative when a prohibition alone leaves the next action unclear. These guide instruction authoring, without requiring a fixed template or weakening safety restrictions.
- MDN's guidance on [animation timing](https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame), [transition completion](https://developer.mozilla.org/en-US/docs/Web/API/Element/transitionend_event), and [cancellation](https://developer.mozilla.org/en-US/docs/Web/API/Animation/cancel) informed the interactive UI animation safeguards.
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
- Addy Osmani's [Brownfield Agentic Engineering](https://addyosmani.com/blog/brownfield-agentic-engineering/) informed the rules to establish existing behavior before refactoring and preserve safeguards and consumer compatibility during replacement.
- [AWS's secure agentic development guidance](https://docs.aws.amazon.com/prescriptive-guidance/latest/agentic-ai-security/best-practices-dev-practices.html) and OWASP's [input-validation](https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html), [injection-prevention](https://cheatsheetseries.owasp.org/cheatsheets/Injection_Prevention_Cheat_Sheet.html), and [CSRF-prevention](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html) guidance informed the trust-boundary and web-security rules.
- Jad Joubran's [Baseline article](https://www.smashingmagazine.com/2026/08/how-baseline-can-help-ship-less-javascript/) informed the browser-support decision rule without replacing project-specific compatibility requirements.
- [Anthropic's customization guidance](https://claude.com/blog/steering-claude-code-skills-hooks-rules-subagents-and-more) informed the distinction between instructions and enforceable controls.
- [The Elements of Agent Style](https://github.com/yzhao062/agent-style/blob/99722a59e5ab654bafe68788f3bff7d1c8237f5a/RULES.md#L32-L42) informed writing for the intended reader, [consistent terminology](https://github.com/yzhao062/agent-style/blob/99722a59e5ab654bafe68788f3bff7d1c8237f5a/RULES.md#L681-L691), and [evidence-backed factual claims](https://github.com/yzhao062/agent-style/blob/99722a59e5ab654bafe68788f3bff7d1c8237f5a/RULES.md#L747-L757).

</details>

## License

Licensed under [MIT](LICENSE). When copying these rules or substantial portions of them, retain the copyright and permission notice from the license.
