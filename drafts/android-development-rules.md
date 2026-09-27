# Android-specific instructions (draft)

Apply only to authorised Android app work and Android-specific parts of cross-platform projects.

  * For changes using Android APIs, check availability across the project's supported runtime versions, not just `compileSdk`. Preserve `minSdk` compatibility through supported alternatives or runtime guards. Account for behaviour changes tied to the running Android version and `targetSdk`.
  * When changing screen state or lifecycle behaviour, preserve required state across configuration changes and system-driven activity or process recreation. In-memory state alone does not survive process death; restore only state the product should retain.
  * When work must continue after the user leaves the screen or app, choose a supported Android execution mechanism for its duration, urgency, and user visibility. Account for background limits and interruption; do not assume an ordinary thread, timer, or foreground service guarantees uninterrupted execution.
  * Use project-appropriate emulators or physical devices for the behaviour being checked. For hardware, manufacturer-specific behaviour, or performance claims that emulation cannot establish, use suitable available physical devices or report the specific verification gap. State the tested configuration; one emulator or device does not prove all supported configurations.
