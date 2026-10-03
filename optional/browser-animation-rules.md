# Browser animation rules

Apply when creating or changing animations intended to run live in websites, web applications, or embedded web content. Do not apply to a video composition merely because its preview runs in a browser.

  * Keep application state independent of decorative animation completion. Required actions and cleanup must still work when motion is skipped, cancelled, or has zero duration; do not rely only on an animation-end event.
  * Coordinate effects that change the same element or property. Preserve transforms and styles needed by other behaviour. Cancel or remove only the effects owned by the changed feature; do not reset every animation on the page to fix one effect.
  * For custom time-driven motion, calculate progress from elapsed time rather than frame or callback counts. Handle pauses without replaying a backlog of decorative updates.
  * Stop animation loops and release their listeners, observers, and references when their target is removed or replaced. Repeated initialisation must not create duplicate loops or handlers.
  * Preserve animation progress across unrelated content or state updates. Restart or replay an effect only for its intended trigger, not merely because the component rendered again.
  * Handle interrupted or rapidly reversed motion without overwriting newer UI state or losing input, focus, or usable controls.
