# Windows-specific agent instructions

Apply to authorised work on Windows, including tasks outside software development.

## System protection

  * For Windows-managed system files and protected registry keys, use supported settings or repair procedures. Do not take ownership of protected resources or weaken their permissions merely to bypass an access error.
  * Exclude the Windows, Program Files, ProgramData, and user AppData folders from routine context searches. If the task needs one of these locations, inspect only the relevant paths, not the whole tree.

## Files and environment boundaries

  * Resolve Desktop, Documents, and other standard folders through Windows folder APIs or the current configuration. Do not construct their paths from assumed drive letters or English folder names; they may be redirected or synced.
  * When a PowerShell command should target an exact file or folder, use `-LiteralPath` where supported, or an equivalent exact-path interface. Use wildcard matching only when intended; filenames containing brackets must not select other files.
  * For OneDrive files, check whether the needed content is available locally and synced. Online-only files are not missing files. To free only local space, use Free up space rather than deleting the item; deletion or moving it outside OneDrive can remove the cloud copy too.
  * When using Windows Subsystem for Linux (WSL), identify the intended distribution and whether each command and path belongs to Windows or Linux. Commands that use mounted Windows paths can change files on the Windows host. Do not assume WSL isolates host resources or that path syntax and case sensitivity match across the boundary. Treat a distribution as disposable only when confirmed for the task, and check its access to host paths, credentials, and network resources first.
