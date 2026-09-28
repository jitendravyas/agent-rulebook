# Web performance measurement rules

Apply when a task requests performance work, investigates a regression, or changes a user path likely to affect measured performance. Do not load it for routine web work solely because performance may be relevant. Use with the global and web-development rules. Modern Web Guidance provides implementation techniques; this file covers measurement, scope, and product safety.

  * Before changing code for performance, identify the affected user journey, metric or symptom, representative device, network, content, authentication, and cache state. Use the project's targets and field data when available; do not assume a generic score or device represents users.
  * Compare a representative baseline and result under equivalent conditions. Separate lab observations, field data, and local-preview results. A successful build, smaller bundle, or one fast local run does not prove a user-visible improvement.
  * Preserve correctness, accessibility, privacy, and user choice while optimizing. Check caching, preloading, prioritisation, deferral, and third-party changes for stale, personalised, consent-dependent, or security-sensitive responses.
  * Make the narrowest change that addresses the observed bottleneck. Do not add performance dashboards, budgets, telemetry, new dependencies, or broad rewrites unless the task requires them and required approval is obtained.
  * Report the measured conditions, result, tradeoffs, and unverified environments. Do not generalise a result beyond the tested route, state, and environment.

## References

Consult only when project documentation and Modern Web Guidance do not answer the measurement question:

  * [Web Vitals](https://web.dev/articles/vitals) for user-experience performance metrics and their interpretation.
  * [Web Vitals field measurement guidance](https://web.dev/articles/vitals-field-measurement-best-practices) for the difference between field and local or lab observations.
