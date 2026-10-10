# Web development rules

Apply when developing, changing, reviewing, or testing browser-rendered content, behavior, or supporting web endpoints, including temporary pages and embedded browsers. Using a website or creating a temporary page for a non-development task does not by itself trigger a web-development workflow.

Updated: 2026-10-10

## Web scope and browser compatibility

  * Before using a browser feature with uncertain support or removing a fallback, identify supported browsers and embedded runtimes from the task, project instructions, configuration, or usage data. Reuse targets already established by the user or project. Check current compatibility; general compatibility summaries do not replace project policy. If the target remains unclear and support matters, propose a target for approval.

## Web security and privacy

  * In application code, request location, notification, or other browser permissions in the context of a feature the user wants to use, not merely because the page loaded. Explain the need and handle refusal without breaking unrelated features or repeatedly prompting.
  * For pages served over Hypertext Transfer Protocol Secure (HTTPS), use secure resource addresses and avoid mixed content.
  * Treat client-side validation as a usability aid, not proof that input is safe. When a server processes data, validate it there even if the browser checks it. Do not rely on client routing, hidden controls, or visibility for permissions. Do not send protected data and rely on client code or the UI to hide it.
  * For state-changing requests with cookies or other automatically attached credentials, enforce server-side protection against cross-site request forgery (CSRF). Set cross-origin access deliberately. Cross-Origin Resource Sharing (CORS) is not authentication or a complete CSRF defense. Preserve needed integrations and check that unintended origins cannot perform protected actions.
  * Keep secrets out of client-delivered code. Avoid unnecessary personal or sensitive data in URLs, browser storage, analytics, client-visible errors, or rendered markup.
  * For web addresses derived from untrusted data, validate allowed schemes and destinations before using them for navigation, redirects, embeds, or resource loading; escaping and Content Security Policy (CSP) do not replace address validation.
  * Set caching deliberately for personalized or sensitive responses. Prevent caches from exposing one user's data to another. Verify that cached responses stay separate when identity, role, tenant, or permission changes the response.
  * When Content Security Policy is applicable, make the narrowest necessary policy change, avoid broad exceptions without justification, and verify the policy on the rendered response.

## Content and identifiers

  * Preserve existing content bindings when changing titles or text alternatives. Do not insert document-level markup into embedded fragments.
  * When creating or changing web content, follow task or project conventions for marking text explicitly designated as non-translatable. For browser translation, use `translate="no"` where applicable. Keep exclusions narrow and surrounding text translatable. Do not disable whole-page translation merely to protect a few names or terms.
  * When copying or repeating page elements, keep identifiers unique within their document object model (DOM) tree and keep references pointing to the intended elements.

## Style changes

  * Before fixing styles, inspect source and, when available, computed styles or layout evidence to find the cause. Do not hide unexplained problems by increasing selector specificity or adding `!important` or `z-index`. After shared-style changes, verify representative affected components and pages, including third-party widgets or surrounding page content that the changes could affect.

## Browser lifecycle and state recovery

  * When changing client state, sessions, or lifecycle behavior, handle the refresh, restore, backgrounding, and expiry cases relevant to the affected state. Preserve or reset state according to task or product requirements; keep intentionally temporary state temporary. Do not depend only on page-close events or uninterrupted background work to preserve required state. Revalidate restored state when freshness affects correctness or access.

## Resource loading and responses

  * When changing resource loading, preserve script dependency order, required startup and interaction behavior, response freshness, and consent requirements. Check preloading, prioritization, deferral, and third-party loading for effects on personalized or security-sensitive content. Do not remove code solely because it is unused during initial page load; other routes or interactions may need it.
  * When changing delivery configuration stored in project files, use appropriate compression and caching for assets and avoid unnecessary redirects. Use long-lived caching only when the project has a reliable way to deliver updated assets.
  * For responses controlled by project code or configuration, return Hypertext Transfer Protocol (HTTP) status codes that reflect the response, including missing pages.
