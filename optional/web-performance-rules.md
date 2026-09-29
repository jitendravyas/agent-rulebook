# Web performance rules

Do not profile, gather metrics, or change performance tooling unless the task requires it.

  * Identify the affected journey, metric or symptom, representative device, network, content, authentication, and cache state. Use project targets and field data when available; do not assume a generic score or device represents users.
  * Compare a representative baseline and result under equivalent conditions. Keep lab observations, field data, and local-preview results separate. A successful build, smaller bundle, or one fast local run does not prove a user-visible improvement.
  * Preserve correctness, accessibility, privacy, and user choice. Check caching, preloading, prioritisation, deferral, and third-party changes for stale, personalised, consent-dependent, or security-sensitive responses.
  * Address the measured bottleneck. Add performance tooling or telemetry only when the task requires it and required approval is obtained.
  * Report measured conditions, result, tradeoffs, and unverified environments. Do not generalise a result beyond the tested route, state, and environment.
