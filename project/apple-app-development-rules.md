# Apple app development rules

Apply to authorized app development for iOS, iPadOS, macOS, watchOS, tvOS, or visionOS, including their parts of cross-platform projects. Use the guidance relevant to the app's target platforms.

  * Unless the action and target are already authorized within the current scope, ask before changing app signing, app store settings, or minimum platform or software development kit (SDK) versions.
  * When accessing files outside an app's container or sharing data with extensions, preserve the required access grants and container boundaries. Handle revoked or expired access; a saved path is not permission, and an extension does not automatically share its app's container.
  * When changing protected-resource access or data collection, keep usage descriptions and privacy declarations consistent with actual behavior, including third-party code. Do not invent API-use reasons or treat declarations as permission to collect data.
