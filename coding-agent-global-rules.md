# Coding-agent rules for software work

## Scope and project constraints

  * Apply to authorised software development on any platform, including temporary and standalone work outside a repository. Apply software-specific requirements to supporting work only where relevant. Using files, commands, websites, or helper scripts only to complete a non-development task does not make it software development.
  * Avoid speculative features, abstractions, dependencies, and unrelated cleanup or refactoring.

## Project inspection and planning

  * Use the intended workspace or checkout even for read-only questions. Ground project-specific answers in its current code, tests, configuration, documentation, and history when needed, not general guidance.
  * Before version-sensitive commands or changes to architecture, dependencies, or tools, check project constraints and required or pinned versions in version files, wrappers, manifests, scripts, continuous integration configuration, or documentation. Use a compatible version, not just the default on `PATH`. If the project requires a version that is unavailable, or sources conflict, stop the affected operation and report it; do not substitute another version. If no version is specified, use the project's normal supported command or ask only when the choice could change the result. Do not assume the execution environment matches the build or target environment. Report important unknowns.
  * When designing a feature or interface, start from its intended use and expected behaviour, then choose implementation details.
  * For unfamiliar multi-component features, verify a small working path through affected components before expanding to agreed scope. Compare alternatives only for consequential or uncertain decisions.
  * Before parallel development or testing, identify shared state that could cause conflicts, such as writable build output, ports, databases, and test accounts. Isolate that state or coordinate access using supported mechanisms; separate checkouts or Git worktrees do not isolate it.

## Software-specific approvals

  * Obtain explicit user approval for the following actions unless already authorised within the current scope:
    * Changing project dependency, runtime, or package-manager requirements.
    * Changing an existing public API or a shared schema or data contract that may affect existing consumers or stored data.
    * Changing app permissions, entitlements, signing, store configuration, or minimum platform or SDK versions.
    * Applying migrations to existing persistent or shared data stores. In-scope setup of a new project and migrations on confirmed disposable local or test stores need no separate approval.
    * Deploying software.

## Application security

  * For protected operations, enforce authentication, authorisation, object access, and allowed state transitions at the trusted boundary. Derive security- and business-critical values from trusted state; identifiers alone prove neither permission nor correctness. Fail closed on security-sensitive failures and prevent partial sensitive changes. Return non-sensitive errors with safe recovery actions where possible; do not expose protected data or implementation details.
  * Validate untrusted input at the receiving trust boundary before use or persistence: relevant types, sizes, ranges, and business constraints. Apply to all sources, including imported files and external services; validation earlier in the data flow is not sufficient. For public or resource-intensive operations, bound accepted work and use project-appropriate abuse controls with observable limits and safe, recoverable failures.
  * Use parameterised queries instead of building executable queries from untrusted data. Use destination-appropriate output encoding and maintained sanitisers for intentionally accepted rich markup. Input validation alone does not prevent injection; generic blacklists and home-grown escaping do not replace these protections.

## Implementation and maintenance

  * Ask before hard-to-reverse choices that are not already authorised. For names the project does not prescribe, use clear project terms, not vague abbreviations or sensitive data. When writing or changing code, make it clear where data comes from and what can change it.
  * Keep machine- and deployment-specific values in established configuration, not shared code. Declare approved project dependencies and compatible versions; do not rely on undeclared global installations for project workflows. Preserve defaults unless the task requires changes; add configuration only for current requirements or deployment needs.
  * Recommend a shared development setup for agent-used tools when recurring contributor use justifies setup and upkeep. Add it only when authorised.
  * Preserve user-provided Unicode through input, storage, and output without accidental loss or corruption, even in single-language projects. Do not treat bytes or code units as user-visible character counts when limiting, slicing, or positioning text. Follow explicit field and format requirements for validation or normalisation.
  * For displayed right-to-left or mixed-direction text, use established platform or project mechanisms for text direction. Preserve existing locale and direction support; verify only affected behaviour. Add languages, translations, or translation infrastructure only when the task requires them.
  * Preserve user-facing accessibility for supported input methods and assistive technologies; verify affected behaviour proportionately with established platform mechanisms.
  * For user-facing changes, handle states affected by the change or needed for new behaviour, such as initial, loading, empty, success, validation, permission, failure, slow-network, offline, retry, and cancellation. Preserve recoverable input and make the next action clear.
  * Before adding helpers, abstractions, dependencies, configuration, or workflows, look for an existing fit. Reuse only where constraints align; do not couple independently changing behaviour because code looks similar.
  * Before copying code or reusing components, check for defects, risks, or materially poor practices that affect the new use. Do not spread confirmed problems for consistency. If others may reuse the problematic code and adding a note is within the authorised task, note the drawback and better option once in that code or in existing tracking. Otherwise, report the problem's location.
  * Prefer maintained, non-deprecated solutions compatible with actual dependency, runtime, and deployment versions. Recommend upgrades only when they materially help the current task or address an identified risk. Use newer capabilities only after the upgrade is approved and in place.
  * For generated or externally maintained files, lockfiles, and snapshots, find their source and supported update process. Prefer supported configuration to third-party patches; avoid accidental lockfile migrations or dependency re-resolution. Review regenerated output, including changed dependency sources. Preserve configured integrity, signature, and provenance checks; stop and investigate failures rather than bypassing them.
  * Remove task-introduced obsolete or temporary code and output. Preserve pre-existing notes and out-of-scope dead code; do not substitute a new TODO for required work.
  * For persisted or exchanged formats, account for existing data and consumers unable to update together; retain compatibility paths only while needed.
  * Where retries, partial failure, or concurrency could corrupt state, use idempotency, ordering, conflict checks, cancellation, or recovery as needed. When related data changes must succeed together, use a supported transaction or handle partial failure safely.
  * Do not assume reverting code also undoes changes to a database or external service.
  * For performance work, measure a representative baseline and bottleneck; compare before and after under equivalent conditions against available targets, preserving correctness.
  * When a bug reveals a repeatable gap or the same correction occurs twice, recommend the smallest useful prevention: a behaviour test, automated check, or project rule. Recommend user-level prevention only for lessons that apply across software projects. Consider false positives and upkeep; add prevention only when authorised and in scope. Exclude secrets and temporary facts.
  * Use comments to explain non-obvious reasons or when a temporary workaround can be removed, not what the code already states. Preserve useful documentation and licence notices.

## Change review

  * During authorised implementation work, review final changes, using a diff when available, for bugs, regressions, security, and needless complexity. Before acting on reported findings, verify them against the current code and requirements. Fix required in-scope findings; report others with location, impact, and evidence, separate from optional improvements. Recheck after further edits when needed.
