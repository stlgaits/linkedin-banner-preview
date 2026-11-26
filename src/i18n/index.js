import en from './en.js';
import fr from './fr.js';

// To add a language: create `xx.js` (copy `en.js` and translate the values),
// register it below, and add an <option> to the #lang select in index.html.
export const LOCALES = Object.freeze({ en, fr });
export const DEFAULT_LANG = 'en';

/** @param {unknown} lang */
export const isSupported = (lang) => typeof lang === 'string' && Object.hasOwn(LOCALES, lang);

/**
 * Build a translate function for a language. Falls back to English, then to the key.
 * `{name}` placeholders are replaced from `vars`.
 *
 * @param {string} lang
 * @returns {(key: string, vars?: Record<string, string | number>) => string}
 */
export function createTranslator(lang) {
  const messages = isSupported(lang) ? LOCALES[lang] : LOCALES[DEFAULT_LANG];
  return (key, vars = {}) =>
    (messages[key] ?? LOCALES[DEFAULT_LANG][key] ?? key).replace(/\{(\w+)\}/g, (_, name) =>
      String(vars[name] ?? `{${name}}`),
    );
}

/**
 * Pick the initial language. Priority: URL parameter, saved choice, browser language, default.
 *
 * @param {{ param?: string | null, saved?: string | null, browser?: string | null }} sources
 */
export function detectLanguage({ param, saved, browser }) {
  const browserLang = (browser ?? '').slice(0, 2).toLowerCase();
  return [param, saved, browserLang].find(isSupported) ?? DEFAULT_LANG;
}
