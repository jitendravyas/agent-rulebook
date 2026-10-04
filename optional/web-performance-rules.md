# Web performance rules

Do not profile, gather metrics, or change performance tooling unless the task or project requirements call for it.

  * When investigating performance, identify the affected journey, metric or symptom, and relevant device, network, content, authentication, and cache conditions. Use project targets and field data when available; choose representative conditions rather than testing every combination. Do not assume a generic score or device represents users.
  * Keep lab observations, field data, and local-preview results separate. A successful build, smaller bundle, or one fast local run does not prove a user-visible improvement.
  * When changing caching, preloading, prioritisation, deferral, or third-party loading, check how those changes affect stale, personalised, consent-dependent, or security-sensitive responses. Preserve correctness, accessibility, privacy, and user choice.
  * When reporting performance results, state measured conditions, result, tradeoffs, and unverified environments. Do not generalise a result beyond the tested route, state, and environment.
