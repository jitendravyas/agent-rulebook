# Browser-specific instructions

## Web scope and browser compatibility

  * Apply these rules only to authorised work on browser-delivered content, behaviour, and supporting web endpoints, including embedded browsers, regardless of rendering architecture.
  * Treat the project's browser and device support, accessibility and performance targets, SEO needs, rendering architecture, design system, and product behaviour as constraints.
  * Before using a browser feature with uncertain support or removing a fallback, find supported browsers and embedded runtimes in project instructions, configuration, or usage data. Check current compatibility; general compatibility summaries do not replace project policy. If no policy exists and support matters, propose a target for approval.

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

## Web security and privacy

  * Request location, notification, or other browser permissions in the context of a feature the user wants to use, not merely because the page loaded. Explain the need and handle refusal without breaking unrelated features or repeatedly prompting.
  * For pages served over HTTPS, use secure resource URLs and avoid mixed content.
  * Treat client-side validation as a usability aid, not proof that input is safe. When a server processes data, validate it there even if the browser checks it. Do not rely on client routing, hidden controls, or visibility for permissions. Do not send protected data and rely on client code or the UI to hide it.
  * For state-changing requests with cookies or other automatically attached credentials, enforce server-side protection against cross-site request forgery (CSRF). Set cross-origin access deliberately. Cross-Origin Resource Sharing (CORS) is not authentication or a complete CSRF defence. Preserve needed integrations and check that unintended origins cannot perform protected actions.
  * Keep secrets out of client-delivered code. Avoid unnecessary personal or sensitive data in URLs, browser storage, analytics, client-visible errors, or rendered markup.
  * For URLs derived from untrusted data, validate allowed schemes and destinations before using them for navigation, redirects, embeds, or resource loading; escaping and Content Security Policy (CSP) do not replace URL validation.
  * Set caching deliberately for personalised or sensitive responses. Prevent caches from exposing one user's data to another. Verify that cached responses stay separate when identity, role, tenant, or permission changes the response.
  * When Content Security Policy is applicable, make the narrowest necessary policy change, avoid broad exceptions without justification, and verify the policy on the rendered response.

## Browser verification

  * Scope browser verification to behaviour affected by implementation, or to existing behaviour requested for testing or review. Select relevant dimensions, such as routes, states, viewports, input methods, supported browsers, rendering modes, sessions, storage, caches, and network conditions. Choose representative combinations by risk and project support, not every combination.
  * When verifying animated interactions, check relevant interruptions or rapid reversals; an earlier animation must not overwrite newer UI state. When verifying how a layout adapts to supported viewport or container sizes, check resizing during use. In these checks, confirm that input is not lost unintentionally and that focus and controls remain usable.
  * For features under test that depend on browser capabilities, storage, consent, or external resources, check relevant permission or consent denials, blocked resources, and unavailable or full storage. In those states, check that other functions remain usable and dependent features explain limitations or offer recovery where possible, without bypassing user choices or environment restrictions.
  * Use isolated, disposable browser state and controlled test data by default. Preserve the user's tabs, profiles, and browsing state outside the task. Reuse task-created sessions when useful without breaking required test isolation. Close only task-created browser resources that are no longer needed; keep requested previews available. When UI under test depends on variable content, check representative extremes within expected use, such as empty values, long labels, or large lists. Keep essential information distinguishable and controls usable. Use real accounts or persistent browser profiles only when required and authorised.
  * Before browser verification, confirm access to the intended application and checkout; a familiar host, port, or tab may serve another worktree. For remote browsers, check local-network access when needed; do not assume `localhost` refers to the developer's machine. Distinguish application failures from browser-tool or connection failures; do not change application behaviour merely to make automation pass.
  * When verifying rendering or interaction, use available project-appropriate tools to check the entry point and state in scope in the intended browser or embedded runtime. Inspect the rendered result, relevant console errors, failed requests, and whether expected state changes persist. When verifying navigation, check relevant supported entry modes, such as direct URL entry, reload, Back/Forward, or normal link opening.
  * Match browser actions and assertions to observable state. Use bounded waits, not arbitrary delays. Prefer structured page, console, and network evidence; capture screenshots or traces only when needed to prove a claim or failure.
  * When verifying appearance, compare changed output with the intended result or assess existing output against the task's requirements. Check relevant settings, such as reduced motion, `forced-colors` mode, text enlargement, and supported themes. Responsive layouts and one browser do not prove support across all environments.
