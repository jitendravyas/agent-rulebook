# Coding agent rules

Reusable instructions you can copy into your coding agent for everyday software development. They aim to reduce repeated prompting, avoidable mistakes, and time and tokens spent on rework.

Think of them as a reset for coding agents: safe defaults for doing the requested work, while your project still chooses its stack, architecture, conventions, and testing approach. They are written without depending on a particular coding agent or LLM model.

## Choose your rules

### [coding-agent-global-rules.md](coding-agent-global-rules.md)

Start here for any kind of software development project: websites, backend services, native applications, libraries, or command-line tools. Use it when starting a project or working in an established codebase.

It guides everyday work beyond writing code, including documentation, project research, tooling, and version control. The instructions ask the agent to stay within scope, protect existing work and sensitive data, get required approvals, check version-specific information, verify results, and explain blockers and next steps clearly.

### [web-development-rules.md](web-development-rules.md)

Add this for website and web application development, whether you work on a single HTML/CSS page, a server-rendered website, a multi-page application, or a JavaScript-rendered single-page application.

It adds web development defaults for native browser behaviour, layouts, accessibility, compatibility, web security, and testing the actual rendered result. It applies to web content and its supporting endpoints, including web interfaces embedded in native applications, without requiring a particular framework or rendering architecture.

**For web projects, use both `coding-agent-global-rules.md` and `web-development-rules.md` together.** Copy the contents of both into one agent instruction file. The web rules add to the global rules; the source files stay separate here only for maintenance.

You can still adapt or take selected sections to suit your workflow. Neither file replaces project-specific coding standards or specialist procedures; their scope is software-project work, not general-purpose assistant use.

Rules for additional operating systems and application runtime environments are planned.

## How to use

```text
Non-web project:
  coding-agent-global-rules.md ------------------> one agent instruction file

Web project:
  coding-agent-global-rules.md ----+
                                   +---------------> one agent instruction file
  web-development-rules.md --------+                  (AGENTS.md, CLAUDE.md,
                                                      or a Cursor rule)
```

1. **Choose where to use them.** Add them to your agent's user-level instructions for use across software projects, or to a project's instruction file for that project only. Here, "global" means reusable across software projects, not every task the agent handles. For teams, keep shared instructions in version control so developers can use the same rules.
2. **Copy the content into one instruction file your agent reads.** This could be `AGENTS.md`, `CLAUDE.md`, or a Cursor rule. For a web project, paste the contents of both source files into that same file, in either order. Keep headings, scope conditions, nested lists, and attached safety and approval conditions with the content.
3. **Merge with your existing rules.** Remove duplicates and resolve conflicts while preserving project requirements and safety boundaries. In mixed projects, apply the web rules only to web content and its supporting endpoints.
4. **Confirm the rules are loaded, then try them on a task.** Use your agent's available loading diagnostics to check that the complete content is included. Cloning this repository or copying these files into an arbitrary folder does not activate them. Adjust the selection if a rule adds friction without helping your work; use project checks to enforce mechanical requirements.

For placement details, see the official instructions for [Cursor](https://cursor.com/docs/rules), [Codex](https://developers.openai.com/codex/guides/agents-md), [Claude Code](https://code.claude.com/docs/en/memory), or your chosen agent.

### Keep context relevant

When adapting these rules, distinguish guidance needed across tasks from guidance needed only for a project or activity:

- **Across tasks:** keep approval, privacy, work-preservation, verification, and communication boundaries in the instructions that are always loaded within your chosen scope.
- **For a project:** keep its tools, commands, conventions, and compatibility requirements in project instructions. Scope web development guidance to web projects or web-related areas of mixed projects using your agent's supported loading controls.
- **For an occasional task:** keep specialist procedures, such as full accessibility audits or performance profiling, in a task-specific reference or skill. Load them when relevant; keep basic safeguards and checks for affected behaviour in the baseline.

If the same agent also handles non-software tasks, user-level placement may load these coding rules for those tasks too. Scope headings limit when the rules apply; they do not prevent the loaded text from using context. Use conditional loading where available or project instructions if you want to avoid that overhead. Do not move essential safety or approval boundaries solely into optional references.

Rules and skills can overlap; a different file type does not justify repeating the same instruction. Use relevant skills only when available and compatible with the project; otherwise consult official documentation. Using a skill does not authorise installations, upgrades, or unrelated changes.

## Contributing

Issues and pull requests are welcome, including feedback from trying the rules in your own projects. Explain the problem your suggestion solves and whether it belongs in the global rules, web development rules, or project instructions.

## Influences

These rules mainly reflect practical experience with coding agents. The sources below contributed specific guidance that remains in the files; other material reviewed during drafting is not listed.

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

## Licence

Licensed under [MIT](LICENSE). When copying these rules or substantial portions of them, retain the copyright and permission notice from the licence.
