# iOS-specific instructions (draft)

Apply only to authorized iOS or iPadOS app work and their platform-specific integrations in cross-platform projects.

Updated: 2026-10-10

  * For changes using platform APIs, check availability across the project's supported operating-system versions, not just the SDK used to build. Preserve deployment-target compatibility through runtime availability checks or supported alternatives.
  * When changing app or scene lifecycle behavior, handle backgrounding, suspension, and system termination without losing state the product should retain. Do not assume in-memory state survives a new launch.
  * When work must continue after the app enters the background, choose a supported iOS or iPadOS execution mechanism for that work. Handle system-imposed time limits, cancellation, and interruption; an ordinary task or timer does not guarantee continued execution.
  * Use project-appropriate simulators or physical devices for the behavior being checked. For hardware, device-only capabilities, or performance claims that simulation cannot establish, use suitable available physical devices or report the specific verification gap. State the tested configuration; one simulator or device does not prove all supported configurations.
