# Browser verification rules

Apply when verifying browser-rendered software in a browser or embedded runtime.

  * Confirm the intended file, page, or application and, when applicable, its source checkout; a familiar host, port, or tab may show different work. Distinguish application failures from browser-tool or connection failures.
  * For development checks, use isolated browser state and controlled test data when practical. Preserve required test isolation when reusing sessions. Check the backing environment and account before actions that change data; a disposable browser profile does not isolate backend data. Use real accounts or persistent profiles only when required and authorized.
  * Inspect the rendered result, relevant interactions, and errors in the intended browser or embedded runtime. Report what was checked and any gaps without generalizing beyond the observed result. Do not change application behavior merely to make browser automation pass.
