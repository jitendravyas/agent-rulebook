Apply only to software development, including temporary or standalone software. Using a helper script or website for another task does not itself require a development workflow.

# Coding-agent rules for software work

Version: 1.0.0 · Updated: 2026-10-10

## Project inspection and planning

* Inspect current code, configuration, documentation, and relevant history in the intended workspace. Follow established conventions and boundaries; explain necessary material departures.
* Check required or pinned dependency, runtime, and tool versions before version-sensitive work. Do not assume execution, build, and target environments match. If a required version is unavailable or requirements materially conflict, stop that operation and report stale guidance; do not silently substitute. Otherwise use supported project commands.
* Resolve important integration uncertainty with a small working path before a larger implementation. For parallel work, coordinate or isolate shared outputs, ports, databases, and accounts; separate checkouts alone do not isolate them.

## Software-specific approvals

* Unless the action and target are already authorised within the current scope, ask before changing dependency, runtime, or package-manager requirements; existing public application programming interfaces (APIs), shared schemas, or data contracts; app permissions, entitlements, signing, store settings, or minimum platform or software development kit (SDK) versions; or deploying software.
* Unless the action and target are already authorised within the current scope, ask before migrations on existing persistent or shared stores. Authorised new-project setup and confirmed disposable test stores need no separate migration approval. Reverting code does not undo database or service changes.

## Application security

* For protected operations, enforce authentication, authorisation, object access, and allowed state changes at the trusted boundary. Derive critical values from trusted state; identifiers are not permission. Fail closed on security failures, prevent partial sensitive changes, and return safe errors with recovery without protected details.
* Validate untrusted input at its receiving boundary before use or storage: required fields, types, nulls, sizes, ranges, and business constraints. Include files and external services; earlier validation is insufficient. For public or resource-intensive operations, bound accepted work and output with appropriate abuse controls, observable limits, and recoverable failures.
* Use parameterised queries, destination-appropriate output encoding, and maintained sanitisers for accepted rich markup. Validation, blacklists, and improvised escaping do not replace injection protections.

## Implementation and maintenance

* Check existing capabilities before building. Extend or reuse only when requirements align; similarity alone does not justify shared behaviour. Check reused code for defects rather than spreading problems for consistency; note reusable drawbacks only within scope, otherwise report them.
* Keep responsibilities clear and separate them when that helps understanding, testing, or independent changes; follow project size constraints but do not split for an arbitrary limit. Use clear names, not sensitive data or vague abbreviations; make data sources and changes understandable.
* Use maintained solutions compatible with supported versions. Recommend upgrades for current needs or identified risks; use new capabilities only after required upgrades are approved and installed.
* Update generated files, lockfiles, and snapshots through their source and supported process. Avoid accidental dependency re-resolution; review regenerated output and sources. Preserve integrity, signatures, and provenance checks; investigate failures rather than bypassing them.
* Keep environment-specific values in established configuration. Declare approved dependencies and versions instead of relying on global installations. Preserve defaults unless changes are required.
* Use stable identifiers, not translated labels or formatted text, for actions and data. Preserve Unicode without corruption; bytes and code units are not user-visible character counts. Follow explicit validation and normalisation requirements.
* Preserve locale, right-to-left and mixed text direction, and accessibility using established platform mechanisms. Add languages or translation infrastructure only when required; verify affected input and assistive-technology behaviour proportionately.
* Handle relevant initial, loading, empty, success, validation, permission, failure, slow-network, offline, retry, and cancellation states. Preserve recoverable input and make the next action clear.
* Remove task-obsoleted code and task-created disposable intermediates when no longer needed; retain deliverables and requested previews. Preserve unrelated notes and dead code; do not replace required work with an unfinished-work note.
* Preserve compatibility for existing stored formats and consumers that cannot update together; keep compatibility paths only while needed.
* Handle or propagate failures with useful sanitised context; do not turn errors into success. Fallbacks must preserve required behaviour. Release owned resources on completion, failure, or cancellation, without releasing shared resources still in use.
* Coordinate retries with lower layers. Prevent cancelled or replaced work from applying stale results. Where needed, use duplicate prevention, ordering, conflict checks, transactions, or recovery so retries and partial failures do not corrupt state.
* Follow comment conventions: explain non-obvious reasons, not obvious code. Preserve notices and required documentation; remove comments only when confirmed wrong, redundant, or obsolete.

## Performance

* Consider performance of the complete affected operation, including interactions, data access, dependencies, and assets. Check uncertain choices with material impact. For performance fixes, identify the bottleneck and compare representative equivalent conditions against available targets; assess requirements for new work. Distinguish local measurements from real-use evidence and report tradeoffs and limits.

## Code checks and review

* Check that static analysis covers changed paths, file types, and intended rules, respecting intentional exclusions. Fix in-scope findings at source. Use only narrow, justified, project-allowed suppressions or type-check bypasses; explain them and ask before policy changes. Coverage gaps alone do not justify new tools.
* Verify review findings against current requirements and code. Fix required in-scope issues and report others with evidence. Recommend the smallest useful recurrence prevention only when benefit justifies upkeep and false positives; add it only when authorised. Global prevention must apply across projects, without secrets or temporary facts.
