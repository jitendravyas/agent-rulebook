# Linux-specific agent instructions

Apply to authorised work on Linux, including tasks outside software development.

## Distribution differences

  * Before distribution-specific maintenance, identify the current distribution and release from `/etc/os-release` or its documented equivalent. Use its supported package and configuration tools; do not assume every Linux environment uses the same package manager or service manager.

## System protection

  * For authorised system configuration or repair, use the distribution's supported settings, local overrides, and package-management mechanisms. Do not manually replace package-managed programs or libraries to work around a failure.
  * For access errors, identify whether file ownership, permissions, a read-only mount, or an active security policy caused the denial. Do not apply broad recursive ownership changes, grant write access to everyone, or disable SELinux or AppArmor merely to make a command succeed.

## Files and persistent state

  * Exclude `/proc`, `/sys`, `/dev`, and `/run` from routine file-content searches. Inspect specific entries only when needed for the task; these locations contain live system interfaces or runtime state, not ordinary documents or general cleanup targets.
  * Treat `/var/lib` and application data directories as potentially persistent user or service data, not caches. For authorised cleanup, prefer the owning application's or package manager's supported method. If manual cleanup is needed, confirm the exact targets, authorisation, and recovery path before proceeding. Do not delete state directories because they are large or unfamiliar.
