# Coding-agent rules for software work

## Scope and project constraints

  * Apply to authorised software development on any platform, including temporary and standalone work outside a repository. Apply software-specific requirements to supporting work only where relevant. Using files, commands, websites, or helper scripts only to complete a non-development task does not make it software development.
  * Add features, abstractions, dependencies, configuration, or workflows only for current requirements or demonstrated risks, not hypothetical future needs. Keep cleanup and refactoring within the task's scope.

## Project inspection and planning

  * Use the intended workspace or checkout even for read-only questions. Ground project-specific answers in its current code, tests, configuration, documentation, and history when needed, not general guidance.
  * Follow relevant project conventions and component boundaries. Depart from them only when the task requires it or an identified problem justifies it; explain material departures.
  * Before version-sensitive commands or changes to architecture, dependencies, or tools, check project constraints and required or pinned versions in version files, wrappers, manifests, scripts, continuous integration configuration, or documentation. Use a compatible version, not just the default on `PATH`. Do not assume the execution environment matches the build or target environment. Report important unknowns.
  * If project sources conflict, identify which requirement governs the intended operation and report stale guidance. If the required version is unavailable or a material conflict remains unresolved, stop the affected operation and report it; do not substitute another version. If no version is specified, use the project's normal supported command or ask only when the choice could change the result.
  * Resolve uncertainty about how components work together early. Use a small working path when it can answer that uncertainty before a larger implementation. Compare alternatives only for consequential or uncertain decisions.
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
  * Validate untrusted input at the receiving trust boundary before use or persistence: required fields, types, allowed null values, sizes, ranges, and business constraints. Apply to all sources, including imported files and external services; validation earlier in the data flow is not sufficient. For public or resource-intensive operations, bound accepted work and generated output and use project-appropriate abuse controls with observable limits and safe, recoverable failures.
  * Use parameterised queries instead of building executable queries from untrusted data. Use destination-appropriate output encoding and maintained sanitisers for intentionally accepted rich markup. Input validation alone does not prevent injection; generic blacklists and home-grown escaping do not replace these protections.

## Implementation and maintenance

  * Ask before hard-to-reverse choices that are not already authorised. For names the project does not prescribe, use clear project terms, not vague abbreviations or sensitive data. When writing or changing code, make it clear where data comes from and what can change it.
  * Before implementing new behaviour, check for an existing capability. If it partly fits, assess whether to extend it or build a new solution. Reuse only where requirements and constraints align; similar-looking code alone does not justify shared behaviour.
  * Before extending a file, consider whether the new responsibility belongs there. Follow task or project structure and file-size requirements. Otherwise, separate distinct responsibilities when that improves understanding, testing, or independent changes; do not split solely to meet a self-imposed line limit.
  * Before copying code or reusing components, check for defects, risks, or materially poor practices that affect the new use. Do not spread confirmed problems for consistency. If others may reuse the problematic code and adding a note is within the authorised task, note the drawback and better option once in that code or in existing tracking. Otherwise, report the problem's location.
  * Prefer maintained, non-deprecated solutions compatible with actual dependency, runtime, and deployment versions. Recommend upgrades only when they materially help the current task or address an identified risk. Use newer capabilities only after the upgrade is approved and in place.
  * For generated or externally maintained files, lockfiles, and snapshots, find their source and supported update process. Prefer supported configuration to third-party patches; avoid accidental lockfile migrations or dependency re-resolution. Review regenerated output, including changed dependency sources. Preserve configured integrity, signature, and provenance checks; stop and investigate failures rather than bypassing them.
  * Keep machine- and deployment-specific values in established configuration, not shared code. Declare approved project dependencies and compatible versions; do not rely on undeclared global installations for project workflows. Preserve defaults unless the task requires changes.
  * Identify application actions and data using stable identifiers or explicit state, not translated labels or formatted display text.
  * Preserve user-provided Unicode through input, storage, and output without accidental loss or corruption, even in single-language projects. Do not treat bytes or code units as user-visible character counts when limiting, slicing, or positioning text. Follow explicit field and format requirements for validation or normalisation.
  * For displayed right-to-left or mixed-direction text, use established platform or project mechanisms for text direction. Preserve existing locale and direction support; verify only affected behaviour. Add languages, translations, or translation infrastructure only when the task requires them.
  * Preserve user-facing accessibility for supported input methods and assistive technologies; verify affected behaviour proportionately with established platform mechanisms.
  * For user-facing changes, handle states affected by the change or needed for new behaviour, such as initial, loading, empty, success, validation, permission, failure, slow-network, offline, retry, and cancellation. Preserve recoverable input and make the next action clear.
  * Remove code made obsolete by the authorised task and task-introduced disposable intermediate output when no longer needed. Retain requested deliverables and previews, even for temporary work. Preserve pre-existing notes and out-of-scope dead code; do not substitute a new TODO for required work.
  * For persisted or exchanged formats, account for existing data and consumers unable to update together; retain compatibility paths only while needed.
  * Handle or propagate failures according to the operation's requirements, preserving useful, sanitised diagnostic context. Do not silently turn an error into a successful result. Use fallbacks only when they preserve the required behaviour.
  * Release resources owned by the changed code when no longer needed, including on failure or cancellation. Preserve shared resources still in use.
  * Before adding retries, check whether lower layers already retry. Coordinate retry limits to avoid multiplying requests and delays.
  * When work is cancelled or replaced by a newer request, stop it where possible and prevent its late results from changing the current state.
  * Where retries, partial failure, or concurrency could corrupt state, use idempotency, ordering, conflict checks, cancellation, or recovery as needed. When related data changes must succeed together, use a supported transaction or handle partial failure safely.
  * Do not assume reverting code also undoes changes to a database or external service.
  * When the likelihood and impact of recurrence justify the upkeep, recommend the smallest useful prevention: a behaviour test, automated check, or project rule. Recommend user-level prevention only for lessons that apply across software projects. Consider false positives; add prevention only when authorised and in scope. Exclude secrets and temporary facts.
  * Follow project conventions for comments. Explain non-obvious reasons or constraints rather than restating the code. Preserve required notices and API documentation; remove existing comments only after confirming they are redundant, incorrect, or obsolete.

## Performance

  * When planning, creating, or changing software, consider performance of the complete affected feature or operation under expected use, including component interactions, data access, dependencies, and assets. Check uncertain choices that could materially affect performance.
  * For targeted performance improvements, identify the bottleneck and compare existing behaviour before and after under equivalent, representative conditions against available targets. For new implementations, assess relevant performance requirements. Distinguish local or lab measurements from field evidence; report tested conditions, tradeoffs, and measurement limits.

## Code checks and review

  * When relying on static code checks, confirm they cover changed paths and file types and apply the intended rules. A pass may have skipped files or rules. Respect intentional exclusions. Fix missing coverage if in scope; otherwise recommend the smallest change. A gap alone does not justify new tools or unrelated checks.
  * When fixes are within the authorised task, address task-related lint, type, and static-analysis errors at source. For demonstrably inapplicable rules, use the narrowest project-allowed suppression and explain the reason near the suppression. At untyped or external boundaries, keep any justified bypass of type checks narrowly scoped. Ask before broad or policy-changing suppressions.
  * Before acting on reported findings, verify them against the current code and requirements. Fix required in-scope findings; report others with location, impact, and evidence, separate from optional improvements.
