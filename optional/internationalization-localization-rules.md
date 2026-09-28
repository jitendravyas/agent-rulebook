# Internationalization and localization rules

Use when a project supports more than one language or locale, or when work adds, changes, or prepares that support. Do not introduce translation infrastructure, locales, or translated copy merely because this file is loaded. Use Modern Web Guidance for browser API choices.

## Decide the product contract first

  * Identify supported locales, default and fallback behaviour, locale selection, text ownership and approval, and affected surfaces such as UI, email, documents, APIs, storage, search, URLs, and support content. Ask only when a missing decision would materially change the implementation.
  * Follow the project's established localization system. Reuse its message format, locale identifiers, routing, resource layout, and build process. Do not add or replace an internationalization library or translation service without approval.
  * Keep locale preference explicit and separate from authentication, authorisation, region, and currency unless product requirements deliberately connect them. Do not infer a user's language or location from an unreliable signal such as IP address when a supported preference is available.

## Keep code and data localizable

  * Keep translatable user-facing messages as complete messages with named values. Do not compose grammar by concatenating fragments, translating text after formatting it, or relying on English word order. Keep stable message identifiers separate from display text where the project uses message resources.
  * Use locale-aware platform or project formatting for dates, times, numbers, units, currencies, sorting, and plural or ordinal messages. Keep locale-independent values and their required context, such as currency code and time zone, in data rather than storing only a formatted display string.
  * Preserve user-entered Unicode and the distinction between language data and identifiers. Use the project's normalization, comparison, length, and search rules; do not apply lossy normalization or ASCII-only validation to natural-language text without an explicit contract.
  * Treat text length as variable. Do not make layout, storage limits, validation, truncation, or cursor movement depend on English length, bytes, or code units. Use the platform's appropriate grapheme, word, or locale-aware facilities when user-visible boundaries matter.
  * Keep language and direction metadata with natural-language content when a format supports it. Do not add bidirectional control characters as a general fix; use the platform's language and direction mechanisms, and isolate mixed-direction dynamic values where needed. For web content, use logical layout properties when direction can change.

## Translation, direction, and verification

  * Do not invent, machine-translate, or overwrite approved product copy. Report missing or stale translations, preserve the project's review process, and use only documented fallback behaviour.
  * When changing localized behaviour, verify the affected locales, plural forms, formatting, fallback, and language selection that the change can affect. Test representative translated text, including longer text, and right-to-left direction only when the product supports or adds it.
  * For browser-delivered interfaces, verify document language and direction, logical layout behaviour, focus order, and mixed-direction text where the change can affect them. Browser translation or language-detection APIs do not replace approved product translations, locale selection, or server-side support.
