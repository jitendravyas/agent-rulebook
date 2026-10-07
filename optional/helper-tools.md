# Optional helper tools for agents

Consult relevant entries only when choosing a tool could materially improve the current task. Do not load this reference for every request or treat it as an installation list. The reusable rules do not depend on these tools.

  * Check availability in the current environment; a tool listed here may not be installed.
  * Use these tools for authorised tasks, including research, files, personal work, and software development. A project or repository is not required.
  * A tool recommendation does not authorise downloads, installations, account connections, or services.
  * The cross-platform utilities listed below are open source, but connected services may require accounts or have separate terms and costs. Keep task data within authorised destinations; local installation does not mean every operation stays local.

## Cross-platform utilities

These utilities support macOS, Windows, and Linux, subject to their current runtime and platform requirements. Do not assume they ship with every operating system.

| Tool and official reference | Use when helpful | Requirements and limits |
| --- | --- | --- |
| [`curl`](https://curl.se/docs/faq.html) | Retrieve a known URL, API response, or authorised download without opening a browser. | It does not execute webpage JavaScript or prove rendered behaviour. Use an authorised browser when needed. MIT-derived licence. |
| [`jq`](https://jqlang.org/) | Select or transform relevant fields from JSON responses before passing them to the model. | It processes JSON, not webpage HTML. Do not filter out errors or pagination information needed for the task. [MIT licence and platform downloads](https://jqlang.org/download/). |
| [`trafilatura`](https://trafilatura.readthedocs.io/en/latest/) | Extract main text and metadata from HTML when available retrieval tools return too much clutter. | Requires a supported Python environment. Preserve needed links, dates, tables, and context; check the original when extraction omits relevant content. It is not a rendered browser. [Platform requirements](https://trafilatura.readthedocs.io/en/latest/installation.html); Apache-2.0 licence for current versions. |
| [`gh`](https://github.com/cli/cli) | Prefer it for authorised GitHub tasks when available and suitable, including reading content, obtaining tools or releases, and working with issues. | Check the host and account for authenticated operations. GitHub access and service limits still apply. MIT licence. |
| [`uv`](https://docs.astral.sh/uv/guides/tools/) | Run approved Python helper tools in isolated environments without adding them to project dependencies. | Tool execution can download and install packages; isolation does not waive approval. Check the selected operation's effects on Python, caches, and project files. [Platform support and MIT or Apache-2.0 licensing](https://github.com/astral-sh/uv). |

## Browser interaction

  * Consider [Chrome DevTools MCP](https://github.com/ChromeDevTools/chrome-devtools-mcp) when an available integration helps inspect or interact with rendered pages, whether for research, general browser tasks, or development. Prefer direct retrieval when it provides the needed content.
  * Check the supported Node.js and Chrome versions before setup. The server uses the Apache-2.0 licence; it is not an operating-system component. Browser session data is exposed to the connected agent. Check usage-statistics and performance-data transfer settings before use with sensitive content, and obtain approval for required configuration changes. Do not connect unrelated personal sessions merely for convenience.

## Windows native tools

  * For Windows automation, prefer suitable installed PowerShell commands that return structured objects. Select the properties needed for the task rather than parsing formatted tables; format output only after processing it.
  * For Windows app or service diagnosis, use relevant status queries and filtered event logs, such as `Get-WinEvent` when available. Limit queries to the affected source and time range rather than collecting a full system report.

## Linux service diagnostics

  * For Linux app or service diagnosis, use the installed service manager's status and log tools. On systems using systemd, use filtered `journalctl` queries when relevant. Select the affected service and time range, and distinguish user services from system services.

## macOS built-in tools and capabilities

  * Do not assume Xcode or Command Line Tools are installed. For routine tasks, prefer an already accessible tool over setting up developer tools just to use a macOS feature.
  * When investigating a processor-compatibility problem during installation or launch, check whether the Mac uses Apple silicon or Intel hardware and whether the app runs through Rosetta. Use compatible versions of the app and its plug-ins. Do not force the app to run without Rosetta when its plug-ins still need it.
  * Use Spotlight (`mdfind`) to search relevant locations, or `mdls` to read selected file information, when this avoids unnecessary scanning. An empty search result does not prove a file is missing. Check relevant paths directly when needed.
  * Before recreating earlier document content or installing recovery tools, check the app's available version history. Restore a copy if the current document must stay unchanged. Do not assume every app or file has saved versions.
  * Consider available built-in text-recognition tools, such as Live Text, before installing text-recognition software or uploading images for text extraction. Use the selected tool only when the agent can access it and it supports the language and task. Check uncertain extracted text against the original.
  * When automating a Mac app, check its scripting dictionary (the commands it supports) or available Shortcuts actions if a capability is unclear. Do not assume every app supports the same commands or actions.
  * Use the available `shortcuts` command for authorised Shortcut runs when suitable. Provide the inputs and output locations the run needs. Before running a Shortcut without user supervision, check whether any step needs user input. Running it from the terminal can still show prompts.

### Apple Intelligence

  * Before using Apple Intelligence models, check that the Mac supports them and they are ready to use. Obtain approval before accepting terms for the whole Mac or enabling required features. Check generated content before relying on it; correct formatting does not prove the information is accurate.
  * On macOS 27 or later, consider the available `fm` command for small tasks when it meaningfully helps. Examples include sorting items into categories, extracting details, rewriting or summarising text, and returning structured data such as JSON. Check its built-in help for supported models, inputs, and output formats. Prefer running commands directly. Start its local API server only when an authorised integration needs it.
  * On macOS 26 or later, consider a suitable existing Shortcut with the `Use Model` action for AI tasks that need to run repeatedly. Consider the Foundation Models framework when the task needs on-device AI built into an app and the required developer tools are already available.

## Separately installed macOS utility

  * Consider [Apple's `container` tool](https://github.com/apple/container) only when an authorised task benefits from isolated Linux execution. It is separately installed, not bundled with macOS, and requires supported Apple silicon hardware and macOS; check the current requirements. It runs Linux, not native macOS applications.
  * Account for installer permissions, service startup, image downloads, and shared host resources. The tool uses the Apache-2.0 licence.
