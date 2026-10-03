# Web development rules

## Web scope and browser compatibility

  * Apply these rules to authorised web-development work: creating, changing, reviewing, or testing browser-rendered content, behaviour, and supporting web endpoints, including temporary output and embedded browsers, regardless of rendering architecture. Using a website or creating a temporary page for a non-development task does not by itself trigger a web-development workflow.
  * Before using a browser feature with uncertain support or removing a fallback, find supported browsers and embedded runtimes in project instructions, configuration, or usage data. Check current compatibility; general compatibility summaries do not replace project policy. If no policy exists and support matters, propose a target for approval.

## Web security and privacy

  * In application code, request location, notification, or other browser permissions in the context of a feature the user wants to use, not merely because the page loaded. Explain the need and handle refusal without breaking unrelated features or repeatedly prompting.
  * For pages served over HTTPS, use secure resource URLs and avoid mixed content.
  * Treat client-side validation as a usability aid, not proof that input is safe. When a server processes data, validate it there even if the browser checks it. Do not rely on client routing, hidden controls, or visibility for permissions. Do not send protected data and rely on client code or the UI to hide it.
  * For state-changing requests with cookies or other automatically attached credentials, enforce server-side protection against cross-site request forgery (CSRF). Set cross-origin access deliberately. Cross-Origin Resource Sharing (CORS) is not authentication or a complete CSRF defence. Preserve needed integrations and check that unintended origins cannot perform protected actions.
  * Keep secrets out of client-delivered code. Avoid unnecessary personal or sensitive data in URLs, browser storage, analytics, client-visible errors, or rendered markup.
  * For URLs derived from untrusted data, validate allowed schemes and destinations before using them for navigation, redirects, embeds, or resource loading; escaping and Content Security Policy (CSP) do not replace URL validation.
  * Set caching deliberately for personalised or sensitive responses. Prevent caches from exposing one user's data to another. Verify that cached responses stay separate when identity, role, tenant, or permission changes the response.
  * When Content Security Policy is applicable, make the narrowest necessary policy change, avoid broad exceptions without justification, and verify the policy on the rendered response.

## Content and identifiers

  * Preserve existing content bindings when changing titles or text alternatives. Do not insert document-level markup into embedded fragments.
  * When creating or changing web content, use `translate="no"` for text explicitly designated as non-translatable by project requirements or conventions. Keep exclusions narrow and surrounding text translatable. Do not disable whole-page translation merely to protect a few names or terms.
  * Identify application actions and data using stable identifiers or explicit state, not translated labels or formatted display text.
  * When copying or repeating HTML or inline SVG, keep IDs unique within their DOM tree and keep references pointing to the intended elements.

## Style changes

  * Before fixing styles, inspect source and, when available, computed styles or layout evidence to find the cause. Do not hide unexplained problems by increasing CSS selector specificity, adding `!important` or `z-index`, or hiding overflow. Scope selectors to their intended elements. After shared-style changes, verify representative affected components and pages, including third-party widgets or surrounding page content that the changes could affect.

## Browser lifecycle and state recovery

  * When changing client state, sessions, or lifecycle behaviour, handle refresh, restore, backgrounding, and expiry. Do not depend only on page-close events or uninterrupted background work to preserve required state. Revalidate restored state when freshness affects correctness or access.

## Resource loading and responses

  * When changing script loading, preserve dependency order and required startup behaviour. Do not remove code solely because it is unused during initial page load; other routes or interactions may need it.
  * When changing delivery configuration stored in project files, use appropriate compression and caching for assets and avoid unnecessary redirects. Use long-lived caching only when the project has a reliable way to deliver updated assets.
  * For responses controlled by project code or configuration, return HTTP status codes that reflect the response, including missing pages.

## Browser verification

  * Use browser checks when requested, required by the project, or needed to verify affected rendering or interaction. Match coverage to the task's risk, stage, and supported environments; do not start unrelated audits.
  * Before browser verification, confirm the intended file, page, or application and, when applicable, its source checkout; a familiar host, port, or tab may show different work. Distinguish content or application failures from browser-tool or connection failures; do not change the content or behaviour merely to make automation pass.
  * For development tests, prefer isolated, disposable browser state and controlled test data. Preserve required test isolation when reusing sessions; use real accounts or persistent browser profiles only when required and authorised.
  * When checking rendering or interaction, inspect the result and relevant errors in the intended browser or embedded runtime. Direct requests or passing builds do not prove rendered behaviour. Report coverage and verification gaps without generalising beyond what was checked.
  * For accessibility assessments, use the agreed standard, level, coverage, and exclusions; do not invent a conformance target. Report methods, remaining barriers, and limits. Distinguish project-controlled issues from provider limitations. Do not hide inaccessible integrations with visual-only workarounds or claim full conformance from a partial review.
