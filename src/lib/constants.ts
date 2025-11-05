export const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'ru', name: 'Russian' },
  { code: 'tr', name: 'Turkish' },
  { code: 'uk', name: 'Ukrainian' },
] as const;

export type LanguageCode = typeof LANGUAGES[number]['code'];

export const LANGUAGE_NAMES: Record<string, string> = {
  'en': 'English',
  'ru': 'Russian',
  'tr': 'Turkish',
  'uk': 'Ukrainian',
};

