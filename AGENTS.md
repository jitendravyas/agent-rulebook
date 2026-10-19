# Maintaining these rules

These instructions govern maintenance of this repository, not users' global agent behavior.

- Use American English for repository prose. Preserve exact names, paths, code identifiers, and source quotations.
- Keep General useful on its own for non-development tasks. Keep software-specific guidance in Coding, web, and testing files. Keep version-control, browser-use, computer-use, operating-system, and specialist guidance in their appropriate files.
- Each reusable rule file must stand on its own within its stated scope. Include the context and safeguards its topic needs, not a copy of the whole general-purpose rule set. Do not add imports or references to other rule files; explain recommended combinations in `README.md`.
- Maintain reusable rules here, not skills or detailed task procedures. Write rules for agent behavior, not for the website's prompt format; adapt the website to the rules. Keep website-only selection and adoption details outside rule files. Keep human-facing usage and safety setup in `README.md`.
- For Apple or Android app work, read the corresponding optional [Apple app](project/apple-app-development-rules.md) or [Android app](project/android-app-development-rules.md) rules. They concern app targets, not the agent's operating system, and are not needed for this repository's static website.

## Rule maintenance

- Add guidance only for a concrete failure or missing context. After an agent failure, check whether guidance was absent, unclear, conflicting, unloaded, or not followed; address the cause rather than adding a duplicate. Prefer outcomes and boundaries over prescribed methods unless a method is necessary to prevent the failure. Check existing controls and relevant skills, but do not assume users have them or remove useful standalone guidance merely because it overlaps.
- Keep user-level global defaults broadly useful across tasks. Keep repository commands and conventions in the owning project's instructions. Keep specialized procedures in separate on-demand skills when supported, not in this rules repository or always-loaded instructions. Keep temporary task state out of reusable rules.
- Keep progress logs, review issue lists, and evaluation run results out of this repository. Retain reusable test scenarios and files needed for automated checks or deployment.
- Use plain, direct language with consistent terms. Clarify ambiguous references and expected results when needed; add examples only to prevent ambiguity. Put conditions before actions and keep exceptions nearby. If a prohibition leaves the next step unclear, state a safe alternative. Loading a rule must not start unrelated work; keep safety and approval boundaries explicit.
- Verify paths and URLs before adding references, and say when to read them. Do not hide essential safety or approval boundaries in optional references.
- Group rules by when they apply; separate activities users can choose independently, not merely by role or tool. When moving, shortening, or combining them, preserve every distinct requirement, condition, exception, and safety protection. Check files independently and in supported combinations for lost context, duplication, or conflicts.
- For changes to applicability or permissions, check cases where guidance should and should not apply. Compare previous and revised behavior on representative tasks before claiming improvement; wording checks alone do not prove better behavior. Re-evaluate model- or tool-specific workarounds when their assumptions change; retire ones that no longer help without weakening needed safety boundaries.
- When changing rule sources or the website catalog, check both first-time adoption and later reviews. Saved links remember choices, not adopted text or source revisions; do not imply that removed guidance can be deleted without checking its origin and value.

## Website work

Before creating, changing, reviewing, or testing this repository's website (`index.html` and `site/`), read and apply [General rules](global/general-rules.md), [Coding rules](global/coding-rules.md), and [Web development rules](project/web-development-rules.md), in that order. Reuse current copies already loaded in context.

Read project modules only when their scope matches this work: [software testing](project/software-testing-rules.md) for tests, [browser verification](project/browser-verification-rules.md) for rendered checks, and [UI animation](project/interactive-ui-animation-rules.md) for interface motion. Read [browser use](global/browser-use-rules.md) when operating a browser, [computer use](global/computer-use-rules.md) when operating desktop interfaces, and [version control](global/version-control-rules.md) when using it. The website distinguishes global and project review; keep catalogs, source links, and tests aligned. Loading guidance does not request unrelated audits.
