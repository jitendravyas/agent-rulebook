Apply when testing software or verifying software changes, including temporary and standalone work; match checks to the task, risk, stage, and supported environments, without unrelated tests or audits.

# Software testing and browser verification rules

## Software checks

  * Use the test environment specified for the check, whether local or remote. Otherwise, prefer a relevant established environment when suitable. Isolate checks that could affect shared state or real data. Check that inherited settings do not redirect isolated tests to real or shared resources. Self-contained checks need no additional services or isolation unless project policy requires them.
  * Set expected results from requirements or contracts, not implementation logic. Do not assert incidental internals or mock away the behaviour being tested.
  * When adding a regression test, confirm it detects the original defect where safe and practical.
  * When the task or project has an established test approach, follow it. Reuse available coverage. Add or change tests only for meaningful gaps; a focused check may be enough for a small, low-risk change. Prefer the narrowest test level that reliably detects the relevant failure. Avoid repeating detailed cases across test levels; retain broader checks where they add confidence in integration or important user journeys.
  * Before refactoring poorly tested behaviour, establish what must stay compatible and which changes are intentional.
  * When test creation or changes are within the authorised task, small tests using available tools need no separate approval, even without an existing test suite, unless applicable policy requires it. This includes new test files. Ask before adding test dependencies or infrastructure or expanding beyond the task. Before deleting tests, identify what they guard and confirm needed coverage remains.
  * For verification, use commands that finish and report results. Use watch or interactive mode only when the task needs it.
  * For repeatable tests, control time, randomness, and external state that affect results. Preserve variations the test is meant to exercise.
  * For asynchronous tests, prefer waiting for the required event or condition with a timeout over fixed delays, unless timing itself is being tested.
  * When changing or testing a trust boundary, test inputs bypassing the normal interface. Check validation, access controls, object boundaries, and workflow order with relevant unauthenticated, unauthorised, cross-user or cross-object, repeated, and out-of-order cases.
  * For text-only changes, choose checks based on what could break, such as links, translation placeholders, layout, or build output. Run code tests only when they check an affected risk or project policy requires them.
  * Static checks do not prove runtime behaviour. When build, packaging, or runtime configuration matters, check the built result the way users will run or install it, not only the source.
  * When verifying upgrades or migrations, test representative existing data or configuration. A successful fresh installation does not prove an upgrade works.
  * Broaden checks for risk or failures. Run the full suite when project policy requires it, focused checks are insufficient, or the suite is known to be quick and simpler than selecting reliable focused checks. Do not run it merely because work is being committed, submitted for review, merged, or released.

## Browser verification

  * Use browser checks when requested, required by the project, or needed to verify affected rendering or interaction.
  * Before browser verification, confirm the intended file, page, or application and, when applicable, its source checkout; a familiar host, port, or tab may show different work. Distinguish content or application failures from browser-tool or connection failures; do not change the content or behaviour merely to make automation pass.
  * For development tests, prefer isolated, disposable browser state and controlled test data. Preserve required test isolation when reusing sessions; use real accounts or persistent browser profiles only when required and authorised.
  * When checking rendering or interaction, inspect the result and relevant errors in the intended browser or embedded runtime. Report coverage and verification gaps without generalising beyond what was checked.
  * For accessibility assessments, use the agreed standard, level, coverage, and exclusions; do not invent a conformance target. Report methods, remaining barriers, and limits. Distinguish project-controlled issues from provider limitations. Do not hide inaccessible integrations with visual-only workarounds or claim full conformance from a partial review.
