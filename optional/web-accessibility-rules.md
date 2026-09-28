# Accessibility evaluation rules

Use only for requested accessibility review, conformance work, remediation, or a change with material accessibility risk. Do not start an audit or claim conformance merely because this file is loaded. Use Modern Web Guidance for implementation choices.

  * Establish the requested purpose, target standard and level, supported environments, included routes and states, and exclusions. Do not assume a universal legal or product target.
  * Treat automated checks, linters, and browser inspection as evidence only for the cases they cover. Use proportionate manual checks of the affected flow and relevant assistive technology when available.
  * Check affected rendered journeys, including dynamic updates, errors, dialogs, loading, empty, disabled, and recovery states. Test keyboard, zoom or text size, and user-preference cases only where they are relevant to the requested scope.
  * For shared components and third-party embeds, identify affected consumers and separate what the project controls from what it does not. Do not use a visual-only workaround to hide an inaccessible integration.
  * Report scope, methods, verified behaviour, limits, and remaining barriers. Do not claim full conformance from a partial review. Keep unrequested audit artifacts and monitoring tools out of the project.
