# Coding agent rules

Reusable instructions for AI coding agents, covering scope, approvals, protecting existing work, checking changes, and explaining results clearly. They aim to reduce repeated prompting and avoidable mistakes.

Use them with one agent or several, for small experiments or established software projects. They do not prescribe a framework, platform, or coding agent. Your project still sets its own architecture, tools, and conventions.

These rules change over time and have not been tested with every agent, model, or workflow. Treat them as a starting point, not a guarantee of better or safer results. Review and adapt them, try them on a low-risk task, and review updates before adopting them.

## Choose your rules

- [coding-agent-global-rules.md](coding-agent-global-rules.md): the base for any software project, including native apps, backend services, libraries, and command-line tools. Covers development and related work such as documentation, research, and version control.
- [web-development-rules.md](web-development-rules.md): add this to the global rules for browser-based work, from a single HTML page to a web app or embedded web interface. Covers browser behaviour, web security, and checking the rendered result.

Here, "global" means reusable across software projects, not every task an assistant handles. In mixed projects, the web rules apply only to web content and its supporting endpoints.

## How to use

1. **Choose the scope.** Use your agent's user-level instructions for your own work across projects, or a project's instruction file for that project and its contributors.
2. **Copy the selected rules into your agent's instructions.** Depending on the agent, use an `AGENTS.md` or `CLAUDE.md` file, or paste them into Cursor's User Rules in settings. For web work, combine both core files in the same file or settings field. No package installation is needed.
3. **Merge with your existing instructions.** Remove duplicates and resolve conflicts. Keep project requirements, safety boundaries, and the conditions and exceptions attached to each rule.
4. **Confirm loading, then try a small task.** Check your agent's loading diagnostics where available. Cloning this repository or saving files in an arbitrary folder does not activate them. Check the [size guidance below](#what-if-the-rules-are-too-large) before copying everything.

```text
Non-web project:
  coding-agent-global-rules.md ------------------> one file or settings field

Web project:
  coding-agent-global-rules.md ----+
                                   +---------------> one file or settings field
  web-development-rules.md --------+
```

Copy the rule files above, not this repository's [AGENTS.md](AGENTS.md). That file is only for agents maintaining this repository.

For placement details, see the official instructions for [Cursor](https://cursor.com/docs/rules), [Codex](https://developers.openai.com/codex/guides/agents-md), [Claude Code](https://code.claude.com/docs/en/memory), or your chosen agent.

Once loaded, these are standing instructions, not skills you need to invoke. The agent should apply only what is relevant to your request, without starting extra audits, tests, or installations just because a rule mentions them.

## Optional specialist rules

Add these to the same instruction setup if they fit your work. They are not required for the basic web setup.

- [Web accessibility](optional/web-accessibility-rules.md): keep accessibility work and checks tied to project requirements.
- [Web performance](optional/web-performance-rules.md): investigate and measure relevant performance changes without treating a local result as proof for all users.
- [Internationalization and localization](optional/internationalization-localization-rules.md): prepare code for different languages and regions, and handle translations and text direction without requiring translation infrastructure in every project.
- [Agent workflow authoring](optional/agent-workflow-authoring-rules.md): write or maintain rules, skills, subagents, and tool workflows.

## FAQ

### Do I need every rule?

No. Keep what helps and adapt anything that adds friction without helping. If your agent also handles non-software tasks, project-level placement or supported conditional loading can avoid loading coding rules for unrelated work.

### What if the rules are too large?

The two core files total about **38.8 KiB (39,759 bytes)**, before your existing instructions. Compare the combined content with your agent's documented loading limit. Select fewer relevant sections, load sections conditionally where supported, or adjust the limit if your agent allows it. Splitting the same text across files does not avoid a combined limit. Keep essential safety and approval boundaries in the instructions that load for the relevant work.

### What if they conflict with my project rules or skills?

These are defaults, not a replacement for project requirements or your agent's instruction hierarchy. Resolve conflicts before adopting them. Keep project-specific tools, commands, and conventions in project instructions, and detailed procedures in skills or references. Project rules and skills cannot waive required approval, security, or privacy protections.

### How should a team use these rules?

Your user-level rules do not affect teammates' agents. Agree on a shared subset, keep it in the project's version-controlled instructions, and confirm each agent loads it. Keep personal preferences at user level.

Record the source commit and agree who reviews updates. Rules do not enforce behaviour; use automated checks and permission controls for requirements that need enforcement.

### Will these rules save tokens?

Not necessarily. They add context and may add checks. Savings depend on whether they prevent enough mistakes and repeated prompting to offset that cost. Compare similar tasks with and without your selected rules, including time and rework.

### Will they make the agent ask permission more often?

They may. Downloads, installations, and publishing need explicit approval unless already authorised for the task. Check that this policy fits your workflow. Routine work within scope and actions already approved should not trigger repeated questions.

## Influences

The rules combine practical experience, research, and ideas shared publicly by other developers. They are updated as useful ideas or unnecessary friction become clear.

<details>
<summary>Tools used to refine the rules</summary>

[Vale](https://docs.vale.sh/) checks wording, [Promptfoo](https://www.promptfoo.dev/docs/intro/) has been used for small model-response comparisons, and [Firecrawl](https://docs.firecrawl.dev/introduction) supports research into public documentation and developer feedback. These tools help refine the rules but do not certify them. You do not need them to use the rules.

The [Vale workflow](.github/workflows/vale.yml) checks the core and optional rule files after pushes to `main` that change them, the Vale configuration, or the workflow itself. Warnings are advisory; errors fail the check. It does not rewrite files.

</details>

<details>
<summary>Sources behind specific guidance</summary>

These sources contributed guidance that remains in the rules; this is not a list of everything reviewed.

- Lauren Tan's [pstack article](https://x.com/poteto/article/2094457600259842065) and [verification-skill pattern](https://github.com/cursor/plugins/blob/main/pstack/skills/create-verification-skill/SKILL.md) shaped the emphasis on direct evidence and reusable verification for important recurring work.
- Samuel Hu's [run-receipt suggestion](https://x.com/realSamHu/status/2103409341240119777) and Harsh Munjal's [execution-record feedback](https://x.com/Mr_Munjal/status/2103394763109966193) informed inspecting available execution evidence before retries and naming verification checks, results, and relevant errors in reports. Adapted with error redaction, without requiring automatic logging, spend tracking, or a receipt before each retry.
- [Ohans Emmanuel's process-cleanup post](https://x.com/OhansEmmanuel/status/2103885312787439850) informed checking for a suitable running instance before starting another long-running development process.
- Ansh Nanda's [testing discussion](https://x.com/anshnanda/status/2101627891721371971) informed the requirement for meaningful tests with expected results independent of the implementation, without adopting an E2E-only policy.
- Emil Kowalski's [UI stress-testing thread](https://x.com/emilkowalski/status/2103516287452483885) and a [reply about misleading truncation](https://x.com/benmodev/status/2103518916752691506) informed checking changed UI with representative data extremes while keeping essential information distinguishable.
- Matt Pocock's [tracer-bullet approach](https://www.aihero.dev/tracer-bullets) informed the small end-to-end path for unfamiliar multi-component features; his [small-change guidance](https://x.com/mattpocockuk/status/2103506709633466648) and [advice to pair direct evidence with a narrow, reversible change](https://x.com/mattpocockuk/status/2103601654113112276) informed keeping changes reviewable and recoverable.
- Addy Osmani's [Brownfield Agentic Engineering](https://addyosmani.com/blog/brownfield-agentic-engineering/) informed the rules to establish existing behaviour before refactoring and preserve safeguards and consumer compatibility during replacement.
- [AWS's secure agentic development guidance](https://docs.aws.amazon.com/prescriptive-guidance/latest/agentic-ai-security/best-practices-dev-practices.html) and OWASP's [input-validation](https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html), [injection-prevention](https://cheatsheetseries.owasp.org/cheatsheets/Injection_Prevention_Cheat_Sheet.html), and [CSRF-prevention](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html) guidance informed the trust-boundary and web-security rules.
- Jad Joubran's [Baseline article](https://www.smashingmagazine.com/2026/08/how-baseline-can-help-ship-less-javascript/) informed the browser-support decision rule without replacing project-specific compatibility requirements.
- [Anthropic's customisation guidance](https://claude.com/blog/steering-claude-code-skills-hooks-rules-subagents-and-more) informed the distinction between instructions and enforceable controls.
- [The Elements of Agent Style](https://github.com/yzhao062/agent-style/blob/99722a59e5ab654bafe68788f3bff7d1c8237f5a/RULES.md#L32-L42) informed writing for the intended reader, [consistent terminology](https://github.com/yzhao062/agent-style/blob/99722a59e5ab654bafe68788f3bff7d1c8237f5a/RULES.md#L681-L691), and [evidence-backed factual claims](https://github.com/yzhao062/agent-style/blob/99722a59e5ab654bafe68788f3bff7d1c8237f5a/RULES.md#L747-L757).

</details>

## Licence

Licensed under [MIT](LICENSE). When copying these rules or substantial portions of them, retain the copyright and permission notice from the licence.
