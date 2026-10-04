# Version-control rules

Apply when using version control for an authorised task, including non-software work.

## Reviewing and preserving work

  * Before using restore, checkout, clean, reset, stash, or similar operations, check exact targets and status.
  * When asked to review a branch or proposed version-controlled changes, or to submit them for review or merging, check the comparison base and full diff. Account separately for relevant uncommitted changes; the working-tree diff alone is insufficient.
  * Resolve version-control conflicts by inspecting both versions, preserving intended content and behaviour, and rerunning affected checks.
  * Before version-controlled handoff, compare task-owned changes with the starting state, including added, generated, renamed, and deleted paths; identify unrelated changes. Scope follows the request, not original authorship.
  * In version-controlled work, retain requested deliverables, but do not stage temporary or local-only output by default. Follow established conventions for generated files; ask only if the tracking decision remains unclear after inspection. Recommend narrow ignores for recurring local output, adding them only in scope. Never ignore files to hide them from review; ignores do not protect secrets or tracked files.

## Committing and pushing

  * Before the first Git commit or push for a repository, confirm the intended author and committer identities and, for pushes, the destination and authenticated account when applicable. Reuse already confirmed choices. Check effective settings silently and ask again only if they conflict with those choices or the intended identity or destination becomes unclear.
  * Before each commit, inspect selected paths and content, including new, renamed, and non-text files, for secrets, credentials, sensitive configuration, and personal or customer data. Use available approved checks; exclude uninspectable content or ask. Stop on suspected exposure without repeating values.
  * Commit only authorised changes in coherent, reviewable commits following established conventions. Check status, exact selection, and staged diff where supported; exclude unrelated files and hunks, whether new or pre-existing.
  * Before pushing, verify destination and outgoing commits, including branch, upstream, and remote where applicable. Check sensitive additions even if later removed; a clean final tree is insufficient.
