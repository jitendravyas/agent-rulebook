# Web accessibility evaluation rules

Apply when a task asks for an accessibility review, conformance work, remediation, or a change with a material accessibility risk. Do not load it for routine web work solely because accessibility may be relevant. Use with the global and web-development rules. Modern Web Guidance provides implementation guidance; this file covers evaluation scope and honest claims that it cannot determine.

  * Before an accessibility audit or conformance claim, establish its purpose, target standard and level if any, supported environments, included routes and states, and exclusions. Do not assume a universal legal or product target.
  * Treat automated checks, linters, and browser inspection as evidence for the cases they cover, not proof that a page or application is accessible or conformant. Combine them with proportionate manual use of the affected flow and relevant assistive technology when available.
  * Check the rendered user journey, including dynamic updates, errors, dialogs, loading, empty, disabled, and recovery states that the change can affect. Test representative keyboard, zoom or text-size, and user-preference cases when relevant to the requested scope.
  * For shared components or third-party embeds, identify the affected consumers and distinguish what the project controls from what it does not. Do not hide an inaccessible integration behind a visual-only workaround or claim it has been fixed without evidence.
  * Report the exact scope, methods, verified behaviour, limitations, and remaining barriers. Do not claim full conformance from a partial review. Keep unrequested audit reports and monitoring tools in chat unless the project workflow requires them or the user approves a persistent artifact.

## References

Consult these only for requested accessibility work when project guidance is insufficient:

  * [W3C accessibility evaluation guidance](https://www.w3.org/WAI/test-evaluate/) for the limits of automated checks and proportionate evaluation.
  * [W3C WCAG conformance guidance](https://www.w3.org/WAI/WCAG22/Understanding/conformance) for claims and the role of human evaluation.
