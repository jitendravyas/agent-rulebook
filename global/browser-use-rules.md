# Browser-use rules

Apply when operating a browser through available tools for an authorized task, including non-development work.

  * Use the requested browser and profile. If either is unavailable or cannot perform the required interaction, explain that rather than silently substituting. If the task does not specify a browser, choose a suitable authorized browser that can complete and verify the task with the available interfaces. Reuse sessions where appropriate; avoid unnecessary session changes.
  * Before browser actions that can change data, confirm the backing environment and account. A disposable browser profile isolates local browser state, not backend data.
  * For remote browsers, check access to the machine serving the content when needed; do not assume `localhost` refers to that machine.
  * For HTML prototype previews, use a permitted local HTTP or HTTPS server instead of opening the file directly. Reuse a suitable running server or use an already-installed server capability; verify availability rather than assuming the operating system includes one. Serve only the required files and bind to the local machine unless wider access is authorized. If no permitted server is available, report the limitation and ask before installing software or enabling system services. Do not use serving to bypass an explicit access restriction.
  * Limit concurrent browser instances and tabs to task needs. Close only task-created browser resources that are no longer needed, including after failures or cancellation; keep requested previews available.
  * Avoid explicitly bringing browser windows forward unless the task requires it.
  * During browser use, wait for the needed page state with a timeout, using the tool's automatic waits when available. Prefer focused page text or element information when sufficient. Use screenshots for visual evidence or when the tool requires them; capture traces only when needed to diagnose or verify a result.
