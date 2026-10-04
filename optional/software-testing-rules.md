# Software testing rules

Apply when testing software or verifying software changes, including temporary and standalone work. Match checks to the authorised task, its risk, stage, and supported environments. Loading these rules does not request unrelated testing or audits.

## Software checks

  * When the task or project defines a development or test environment, default to isolated instances in that environment for verification, whether local or remote.
  * Fix task-related lint, type, and static-analysis errors at source. For demonstrably inapplicable rules, use the narrowest project-allowed suppression and explain the reason near the suppression. At untyped or external boundaries, keep any justified bypass of type checks narrowly scoped. Ask before broad or policy-changing suppressions.
  * Tests must exercise intended behaviour and detect relevant defects. Set expected results from requirements or contracts, not implementation logic. Do not assert incidental internals or mock away the behaviour being tested.
  * Follow any established task or project test approach. Inspect and reuse available tests, adding tests only for meaningful coverage gaps. Before refactoring poorly tested behaviour, establish what must stay compatible and which changes are intentional.
  * Small, task-related tests using available tools need no separate approval, even without an existing test suite, unless applicable policy requires it. This includes new test files. Ask before adding test dependencies or infrastructure or expanding beyond the task. Before deleting tests, identify what they guard and confirm needed coverage remains.
  * When changing or testing a trust boundary, test inputs bypassing the normal interface. Check validation, access controls, object boundaries, and workflow order with relevant unauthenticated, unauthorised, cross-user or cross-object, repeated, and out-of-order cases.
  * When relying on a third-party or custom linter or static checker, confirm it covers changed paths and file types and applies the intended rules. A pass may have skipped files or rules. Respect intentional exclusions. Fix missing coverage if in scope; otherwise recommend the smallest change. A gap alone does not justify new tools or unrelated checks.
  * For text-only changes, choose checks based on what could break, such as links, translation placeholders, layout, or build output. Run code tests only when they check an affected risk or project policy requires them.
  * Static checks do not prove runtime behaviour; inspect representative built output when build, packaging, or runtime configuration matters.
  * Broaden checks for risk or failures. Run the full suite only if project policy requires it or focused checks are insufficient, not merely because work is being committed, submitted for review, merged, or released.

## Browser verification

  * Use browser checks when requested, required by the project, or needed to verify affected rendering or interaction. Match coverage to the task's risk, stage, and supported environments; do not start unrelated audits.
  * Before browser verification, confirm the intended file, page, or application and, when applicable, its source checkout; a familiar host, port, or tab may show different work. Distinguish content or application failures from browser-tool or connection failures; do not change the content or behaviour merely to make automation pass.
  * For development tests, prefer isolated, disposable browser state and controlled test data. Preserve required test isolation when reusing sessions; use real accounts or persistent browser profiles only when required and authorised.
  * When checking rendering or interaction, inspect the result and relevant errors in the intended browser or embedded runtime. Direct requests or passing builds do not prove rendered behaviour. Report coverage and verification gaps without generalising beyond what was checked.
  * For accessibility assessments, use the agreed standard, level, coverage, and exclusions; do not invent a conformance target. Report methods, remaining barriers, and limits. Distinguish project-controlled issues from provider limitations. Do not hide inaccessible integrations with visual-only workarounds or claim full conformance from a partial review.
