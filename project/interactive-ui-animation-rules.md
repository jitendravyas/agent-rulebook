# Web and native UI animation rules

Apply when creating or changing live user interface (UI) animations in browser or native applications.

  * Honor available reduced-motion preferences for nonessential animation. Keep required information and controls usable when motion is reduced or disabled.
  * Keep application state independent of decorative animation completion. Required actions and cleanup must still work when motion is skipped, canceled, or has zero duration; do not rely only on an animation-end event.
  * Coordinate effects that change the same interface element or property. Preserve properties needed by other behavior. Cancel or remove only the effects owned by the changed feature; do not reset unrelated animations to fix one effect.
  * For custom time-driven motion, calculate progress from elapsed time rather than frame or callback counts. Handle pauses without replaying a backlog of decorative updates.
  * Stop animation loops and release owned callbacks, subscriptions, and references when their target is removed or replaced. Repeated initialization must not create duplicate loops or handlers.
  * Preserve animation progress across unrelated content or state updates. Restart or replay an effect only for its intended trigger, not merely because the interface updated again.
  * Handle interrupted or rapidly reversed motion without overwriting newer UI state or losing input, focus, or usable controls.
