# Internationalization and localization rules

Apply to internationalization and localization of software and its user-facing content, including right-to-left interfaces. Do not apply the software workflow to ordinary message or document translation.

Updated: 2026-10-10

Do not introduce translation infrastructure, locales, or translated copy unless the task requires it.

## Project requirements

  * Identify only the locale decisions and affected surfaces needed for the current task, such as supported locales, fallback behavior, locale selection, text approval, UI, email, or stored data. Reuse established project choices. Ask only when a missing decision would materially change the work.
  * When the project has an established localization system, follow it and reuse its message format, locale identifiers, routing, resource layout, and build process. Do not add or replace an internationalization library or translation service without approval.
  * Keep locale preference explicit and separate from authentication, authorization, region, and currency unless product requirements deliberately connect them. Do not infer a user's language or location from an unreliable signal such as IP address when a supported preference is available.

## Keep code and data localizable

  * Keep translatable user-facing messages complete and use placeholders supported by the project's message format. Do not compose grammar by concatenating fragments, translating text after formatting it, or relying on source-language word order.
  * Follow the project's message identifier scheme, including source-text identifiers; keep separate keys stable where used. Reuse messages only when meaning and grammatical context match, not just source text. Use the project's keys or context mechanism to distinguish other uses.
  * Preserve required placeholders and code identifiers when translating, and keep messages valid in the project's message format.
  * Use locale-aware platform or project formatting for dates, times, numbers, units, currencies, and plural or ordinal messages.
  * When adding or changing natural-language display sorting, use locale-aware order unless another order is required. Keep it consistent with any server-side sorting, pagination, or search. Preserve established ordering outside the requested change, including for identifiers and machine data.
  * Keep locale-independent values and their required context, such as currency code and time zone, in data rather than storing only a formatted display string.
  * For natural-language text, use the project's normalization, comparison, length, and search rules; do not apply lossy normalization or ASCII-only validation without an explicit contract.
  * Allow layouts to accommodate different text lengths. Use the platform's appropriate grapheme, word, or locale-aware facilities for user-visible counts, truncation, and cursor movement. Preserve explicit storage, protocol, and validation limits, including byte limits.
  * Keep language and direction metadata with natural-language content when a format supports it. Do not add bidirectional control characters as a general fix; use the platform's language and direction mechanisms, and isolate mixed-direction dynamic values where needed.

## Translation, direction, and verification

  * Follow the project's translation review requirements. Reuse approval already given for the current copy; do not invent additional approval steps or claim approval without evidence. Do not overwrite approved product copy without authorization. Report missing or stale translations. Use established fallback behavior verified in project documentation, code, or configuration.
  * Follow existing glossaries and do-not-translate terms. Preserve personal, place, organization, brand, product, and official feature names unless project conventions specify an established localized form or approved transliteration. Do not invent literal translations of names. Translate ordinary interface labels and surrounding text unless explicitly protected.
  * When verifying localized behavior, check the locales, plural forms, formatting, fallback, and language selection within the task's scope. Test representative translated text, including longer text. Include affected right-to-left and mixed-direction text, including user content in an otherwise left-to-right interface.
  * For browser-delivered interfaces, verify document language and direction, logical layout behavior, and focus order where relevant to that scope. Browser translation or language-detection APIs do not replace approved product translations, locale selection, or server-side support.
