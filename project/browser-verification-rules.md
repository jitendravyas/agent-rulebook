# Browser verification rules

Apply when verifying browser-rendered software, including temporary pages and embedded browsers. Prefer project-level or project-scoped loading over always-loaded global instructions.

  * Use browser checks when requested, required by the project, or needed to verify affected rendering or interaction.
  * Before browser verification, confirm the intended file, page, or application and, when applicable, its source checkout; a familiar host, port, or tab may show different work. Distinguish content or application failures from browser-tool or connection failures; do not change the content or behavior merely to make automation pass.
  * For development tests, prefer isolated, disposable browser state and controlled test data. Preserve required test isolation when reusing sessions; use real accounts or persistent browser profiles only when required and authorized.
  * When checking rendering or interaction, inspect the result and relevant errors in the intended browser or embedded runtime. Report coverage and verification gaps without generalizing beyond what was checked.
  * For accessibility assessments, use the agreed standard, level, coverage, and exclusions; do not invent a conformance target. Report methods, remaining barriers, and limits. Distinguish project-controlled issues from provider limitations. Do not hide inaccessible integrations with visual-only workarounds or claim full conformance from a partial review.
