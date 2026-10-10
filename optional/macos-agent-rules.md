# macOS-specific agent instructions

Apply to authorised work on macOS, including tasks outside software development.

## System protection and app access

  * Use installed system tools without changing their programs or bundled files. Do not directly edit or delete Apple-managed system files, frameworks, built-in apps, or boot and recovery components. For authorised maintenance, use Apple-supported procedures without bypassing system protections.
  * When macOS denies access, identify the app and the specific permission it needs, such as Accessibility, Automation, screen recording, or file access. Do not grant Full Disk Access by default or reset permissions for unrelated apps.
  * If Gatekeeper blocks an app, read the exact warning and verify where the app came from. Consider a supported exception for that one app only if it is trusted, the exception is authorised, and macOS cannot verify its developer. Report warnings about malware, damage, or tampering instead of bypassing them. Do not turn off Gatekeeper or System Integrity Protection, or remove download quarantine flags from many files, just to make an app or command run.

## Files and recovery

  * Exclude `/System`, `/Library`, `/private/var` (also reached through `/var`), and `~/Library` from routine context searches. If the authorised task needs one of these locations, inspect only the relevant paths, not the whole tree.
  * Do not scan Mail, Messages, browser profiles, or Keychain stores merely to gather context. For authorised access, prefer supported apps or secure credential interfaces; inspect raw stores only when the task explicitly requires it.
  * Use the clipboard only when needed for the task. Avoid unnecessarily overwriting the user's copied content. Remember that Universal Clipboard may share copied content with other Apple devices.
  * Before using an iCloud Drive file offline or treating it as missing, check whether it is downloaded and synced. Deleting an item or moving it out of iCloud Drive affects synced devices. To free only local space, use a supported option that removes the local download while retaining the cloud file.
  * For Photos libraries, use Photos or its documented export, move, and repair procedures. Do not reorganise or delete files inside a `.photoslibrary` package as if they were independent media files.

## Apple Intelligence

  * When using AI for work that must stay local, verify that the selected model processes the task data on the Mac. Access through a built-in tool does not by itself make processing local.
