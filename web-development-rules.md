# Browser-specific instructions

## Web scope and browser compatibility

  * Apply these rules only to authorised work on browser-delivered content, behaviour, and supporting web endpoints, including embedded browsers, regardless of rendering architecture.
  * Treat the project's browser and device support, accessibility and performance targets, SEO needs, rendering architecture, design system, and product behaviour as constraints.
  * Before using a browser feature with uncertain support or removing a fallback, find supported browsers and embedded runtimes in project instructions, configuration, or usage data. Check current compatibility; general compatibility summaries do not replace project policy. If no policy exists and support matters, propose a target for approval.

## Browser behaviour, layout, and accessibility

  * Prefer semantic HTML and native elements before custom replacements. Preserve normal links, forms, focus, selection, copy and paste, autofill, URLs, reload, history, and zoom unless intentionally changed. Keep required content and actions usable across supported viewports, text sizes, and input methods, with accessible names, keyboard use, visible focus, useful feedback, and text alternatives for non-text content.
  * For new or changed layouts, prefer flexible, content-driven sizing with bounds over fixed viewport or text-length assumptions. Let components and media adapt to available space; avoid fixed text-container heights that clip expanded content. Preserve intentional fixed dimensions and physical positioning required by design or behaviour.
  * For direction-dependent layouts, prefer CSS logical properties and direction-relative values in new or changed styles, even in single-language projects. Follow project conventions and browser support. Set language and direction in HTML; isolate mixed-direction dynamic text when needed. These defaults do not prove full right-to-left support. Do not replace intentional physical directions.
  * Use feature detection when capability availability can vary within supported environments and built-in browser fallback behaviour is insufficient. Provide fallbacks for essential tasks and let non-essential enhancements degrade safely within the project's support policy. Do not impose a no-JavaScript requirement when the intended architecture requires JavaScript.
  * Before fixing styles, inspect source and, when available, computed styles or layout evidence to find the cause. If browser access is unavailable, report what remains visually unverified. Do not hide unexplained problems by increasing CSS selector specificity, adding `!important` or `z-index`, or hiding overflow. Scope selectors to their intended elements and verify representative affected components and pages after shared-style changes.

## Browser lifecycle and state recovery

  * When changing client state, sessions, or lifecycle behaviour, handle refresh, restore, backgrounding, and expiry. Do not depend only on page-close events or uninterrupted background work to preserve required state. Revalidate restored state when freshness affects correctness or access.

## Web security and privacy

  * Treat client-side validation as a usability aid, not proof that input is safe. When a server processes data, validate it there even if the browser checks it. Do not rely on client routing, hidden controls, or visibility for permissions. Do not send protected data and rely on client code or the UI to hide it.
  * For state-changing requests with cookies or other automatically attached credentials, enforce server-side protection against cross-site request forgery (CSRF). Set cross-origin access deliberately. Cross-Origin Resource Sharing (CORS) is not authentication or a complete CSRF defence. Preserve needed integrations and check that unintended origins cannot perform protected actions.
  * Keep secrets out of client-delivered code. Avoid unnecessary personal or sensitive data in URLs, browser storage, analytics, client-visible errors, or rendered markup.
  * For URLs derived from untrusted data, validate allowed schemes and destinations before using them for navigation, redirects, embeds, or resource loading; escaping and Content Security Policy (CSP) do not replace URL validation.
  * Set caching deliberately for personalised or sensitive responses. Prevent caches from exposing one user's data to another; verify variants stay separate when identity, role, tenant, or permission changes the response.
  * When Content Security Policy is applicable, make the narrowest necessary policy change, avoid broad exceptions without justification, and verify the policy on the rendered response.

## Browser verification

  * Test only dimensions the change can affect, such as routes, states, viewports, input methods, supported browsers, rendering modes, sessions, storage, caches, and network conditions. Choose representative combinations by risk and project support, not every combination. For consent-dependent features or third-party integrations, include denied consent, blocked resources, and unavailable storage where relevant. In those states, check that other functions remain usable and dependent features offer a clear recovery path where possible, without bypassing user choices.
  * Use isolated, disposable browser state and controlled test data by default. When changed UI depends on variable content, check representative extremes within expected use, such as empty values, long labels, or large lists. Keep essential information distinguishable and controls usable. Use real accounts or persistent browser profiles only when required and authorised.
  * With parallel worktrees or local previews, confirm the preview's checkout before browser testing; a familiar host, port, or tab may serve another worktree.
  * For changes affecting rendering or interaction, use available project-appropriate tools to check the affected entry point and state in the intended browser or embedded runtime. Inspect the rendered result, relevant console errors, failed requests, navigation, and whether expected state changes persist. If that environment is unavailable, state what was checked and what remains unverified.
  * Match browser actions and assertions to observable state. Use bounded waits, not arbitrary delays. Prefer structured page, console, and network evidence; capture screenshots or traces only when needed to prove a claim or failure.
  * Compare affected visual output when appearance can change. For affected styling and interactions, verify settings the change can affect, such as reduced motion, `forced-colors` mode, text enlargement, and supported themes. Keep content, controls, and focus indicators perceivable and usable. Responsive layouts or automated checks alone do not prove accessibility; one browser does not prove cross-browser correctness.
