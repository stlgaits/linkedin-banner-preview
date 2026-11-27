import { describe, expect, it } from 'vitest';
import {
  DEFAULT_LANG,
  LOCALES,
  createTranslator,
  detectLanguage,
  type LangCode,
} from '../src/i18n';
import { PRESETS, type ModeKey } from '../src/presets';

describe('locales', () => {
  it('define exactly the same keys as English', () => {
    const reference = Object.keys(LOCALES[DEFAULT_LANG]).sort();
    for (const lang of Object.keys(LOCALES) as LangCode[]) {
      expect(Object.keys(LOCALES[lang]).sort(), lang).toEqual(reference);
    }
  });

  it('describe every preset', () => {
    for (const lang of Object.keys(LOCALES) as LangCode[]) {
      for (const mode of Object.keys(PRESETS) as ModeKey[]) {
        expect(LOCALES[lang][`note.${mode}`], `${lang} note.${mode}`).toBeTruthy();
        expect(LOCALES[lang][`mode.${mode}`], `${lang} mode.${mode}`).toBeTruthy();
      }
    }
  });
});

describe('createTranslator', () => {
  it('replaces placeholders', () => {
    expect(createTranslator('en')('upload', { w: 10, h: 5 })).toBe('Upload your banner (10×5)');
  });
  it('falls back to English for an unknown language, and to the key for an unknown key', () => {
    expect(createTranslator('xx')('follow')).toBe(LOCALES.en.follow);
    // @ts-expect-error unknown keys are rejected at compile time; this checks the runtime fallback
    expect(createTranslator('fr')('does.not.exist')).toBe('does.not.exist');
  });
  it('translates', () => {
    expect(createTranslator('fr')('follow')).toBe('+ Suivre');
  });
});

describe('detectLanguage', () => {
  it('prefers the URL parameter, then the saved choice, then the browser', () => {
    expect(detectLanguage({ param: 'fr', saved: 'en', browser: 'en-US' })).toBe('fr');
    expect(detectLanguage({ param: null, saved: 'fr', browser: 'en-US' })).toBe('fr');
    expect(detectLanguage({ param: null, saved: null, browser: 'fr-FR' })).toBe('fr');
  });
  it('ignores unsupported values and falls back to English', () => {
    expect(detectLanguage({ param: 'de', saved: 'es', browser: 'ja-JP' })).toBe('en');
    expect(detectLanguage({})).toBe('en');
  });
  it('does not accept prototype keys as languages', () => {
    expect(detectLanguage({ param: 'constructor' })).toBe('en');
  });
});
