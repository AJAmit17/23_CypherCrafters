export const locales = ["en", "de", "kn-IN", "hi-IN"] as const;
export const localeNames = {
    en: "English",
    de: "Deutsch",
    "kn-IN": "ಕನ್ನಡ",
    "hi-IN": "हिन्दी"
};
export type Locale = (typeof locales)[number];
