/**
 * i18n Module
 *
 * Exports language context, hooks, and translations.
 */

export {
  LanguageProvider,
  useLanguage,
  useTranslation,
  type TranslationKey,
} from './LanguageContext';
export { translations, type Language, type TranslationKeys } from './translations';
