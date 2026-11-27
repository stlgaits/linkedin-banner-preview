import en, { type MessageKey, type Messages } from './en';
import fr from './fr';

export type { MessageKey, Messages };

// To add a language: create `xx.ts` (copy `fr.ts` and translate the values),
// register it below, and add an <option> to the #lang select in index.html.
export const LOCALES = Object.freeze({ en, fr });
export type LangCode = keyof typeof LOCALES;
export const DEFAULT_LANG: LangCode = 'en';

export const isSupported = (lang: unknown): lang is LangCode =>
  typeof lang === 'string' && Object.hasOwn(LOCALES, lang);

export const isMessageKey = (key: string): key is MessageKey =>
  Object.hasOwn(LOCALES[DEFAULT_LANG], key);

export type Translate = (key: MessageKey, vars?: Record<string, string | number>) => string;

/**
 * Build a translate function for a language. Falls back to English, then to the key.
 * `{name}` placeholders are replaced from `vars`.
 */
export function createTranslator(lang: string): Translate {
  const messages: Messages = isSupported(lang) ? LOCALES[lang] : LOCALES[DEFAULT_LANG];
  return (key, vars = {}) =>
    (messages[key] ?? LOCALES[DEFAULT_LANG][key] ?? key).replace(/\{(\w+)\}/g, (_, name: string) =>
      String(vars[name] ?? `{${name}}`),
    );
}

/** Pick the initial language. Priority: URL parameter, saved choice, browser language, default. */
export function detectLanguage(sources: {
  param?: string | null;
  saved?: string | null;
  browser?: string | null;
}): LangCode {
  // Stryker disable next-line StringLiteral: any unsupported fallback gives the same result
  const browserLang = (sources.browser ?? '').slice(0, 2).toLowerCase();
  return [sources.param, sources.saved, browserLang].find(isSupported) ?? DEFAULT_LANG;
}
