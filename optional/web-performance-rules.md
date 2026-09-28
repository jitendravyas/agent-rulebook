# Web performance rules

Do not profile, gather metrics, or change performance tooling unless the task requires it. Use Modern Web Guidance for implementation choices.

  * Identify the affected journey, metric or symptom, representative device, network, content, authentication, and cache state. Use project targets and field data when available; do not assume a generic score or device represents users.
  * Compare a representative baseline and result under equivalent conditions. Keep lab observations, field data, and local-preview results separate. A successful build, smaller bundle, or one fast local run does not prove a user-visible improvement.
  * Preserve correctness, accessibility, privacy, and user choice. Check caching, preloading, prioritisation, deferral, and third-party changes for stale, personalised, consent-dependent, or security-sensitive responses.
  * Make the narrowest change that addresses the observed bottleneck. Do not add dashboards, budgets, telemetry, dependencies, or broad rewrites unless the task requires them and required approval is obtained.
  * Report measured conditions, result, tradeoffs, and unverified environments. Do not generalise a result beyond the tested route, state, and environment.
