# Internationalization and localization rules

Do not introduce translation infrastructure, locales, or translated copy unless the task requires it.

## Decide the product contract first

  * Identify supported locales, default and fallback behaviour, locale selection, text ownership and approval, and affected surfaces such as UI, email, documents, APIs, storage, search, URLs, and support content. Ask only when a missing decision would materially change the implementation.
  * Follow the project's established localization system. Reuse its message format, locale identifiers, routing, resource layout, and build process. Do not add or replace an internationalization library or translation service without approval.
  * Keep locale preference explicit and separate from authentication, authorisation, region, and currency unless product requirements deliberately connect them. Do not infer a user's language or location from an unreliable signal such as IP address when a supported preference is available.

## Keep code and data localizable

  * Keep translatable user-facing messages as complete messages with named values. Do not compose grammar by concatenating fragments, translating text after formatting it, or relying on English word order. Keep message identifiers stable and separate from display text where the project uses message resources. Preserve required placeholders and code identifiers when translating, and keep messages valid in the project's message format.
  * Use locale-aware platform or project formatting for dates, times, numbers, units, currencies, sorting, and plural or ordinal messages. Keep locale-independent values and their required context, such as currency code and time zone, in data rather than storing only a formatted display string.
  * Preserve user-entered Unicode and the distinction between language data and identifiers. Use the project's normalization, comparison, length, and search rules; do not apply lossy normalization or ASCII-only validation to natural-language text without an explicit contract.
  * Allow layouts to accommodate different text lengths. Do not treat bytes or code units as user-visible character counts. Use the platform's appropriate grapheme, word, or locale-aware facilities for user-visible counts, truncation, and cursor movement. Preserve explicit storage, protocol, and validation limits, including byte limits.
  * Keep language and direction metadata with natural-language content when a format supports it. Do not add bidirectional control characters as a general fix; use the platform's language and direction mechanisms, and isolate mixed-direction dynamic values where needed. For web content, use logical layout properties when direction can change.

## Translation, direction, and verification

  * Translate copy only when required by the task. Treat translations you create as drafts until approved through the project's review process. Do not overwrite approved product copy without authorisation. Report missing or stale translations and use only documented fallback behaviour.
  * Follow existing glossaries and do-not-translate terms. Preserve personal, place, organisation, brand, product, and official feature names unless project conventions specify an established localized form or approved transliteration. Do not invent literal translations of names. Translate ordinary interface labels and surrounding text unless explicitly protected.
  * When changing localized behaviour, verify the affected locales, plural forms, formatting, fallback, and language selection that the change can affect. Test representative translated text, including longer text, and right-to-left direction only when the product supports or adds it.
  * For browser-delivered interfaces, verify document language and direction, logical layout behaviour, focus order, and mixed-direction text where the change can affect them. Browser translation or language-detection APIs do not replace approved product translations, locale selection, or server-side support.
