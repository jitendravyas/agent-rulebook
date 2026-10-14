# Android app development rules

Apply only to authorized Android app development, including Android-specific parts of cross-platform projects and apps targeting phones, tablets, Android TV, or Wear OS. Running an agent on Android does not itself require these rules. Prefer project-level or project-scoped loading over always-loaded global instructions.

  * Unless the action and target are already authorized within the current scope, ask before changing app signing, app store settings, or minimum platform or software development kit (SDK) versions.
  * When changing app components or entry points, keep internal components private and protect exported ones with the required access controls. Intent filters do not restrict callers. Limit forwarded intents and temporary content-URI grants to intended actions and recipients.
  * When changing manifests, build variants, or dependencies that contribute manifest entries, inspect the affected final merged manifests. Check permissions, device requirements, component exposure, and intent filters; dependencies can change the packaged app's declarations. Do not resolve merge conflicts by silently widening access or device requirements.
