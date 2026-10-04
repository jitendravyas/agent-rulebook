# Browser and computer-use rules

Apply when operating a browser or desktop interface for an authorised task, including non-development work.

  * Use the requested browser and profile. If either is unavailable, explain that rather than silently substituting. If the task does not specify a browser, choose a suitable authorised browser. Reuse sessions where appropriate. For new sessions, prefer headless mode when it can reliably complete and verify the task; use a visible browser for user interaction, inspection, or behaviour headless mode cannot reproduce. Do not switch sessions just to change between headless and visible modes.
  * For remote browsers, check access to the machine serving the content when needed; do not assume `localhost` refers to that machine.
  * Limit concurrent browser instances and tabs to task needs. Close only task-created browser resources that are no longer needed, including after failures or cancellation; keep requested previews available.
  * Avoid explicitly bringing browser windows forward unless the task requires it.
  * Before UI actions that depend on focus, selection, or screen position, confirm the intended app, window, and control using current observations. Refresh those observations after relevant changes or interruptions.
  * During browser use, wait for the needed page state with a timeout, using the tool's automatic waits when available. Prefer focused page text or element information when sufficient. Use screenshots for visual evidence or when the tool requires them; capture traces only when needed to diagnose or verify a result.
