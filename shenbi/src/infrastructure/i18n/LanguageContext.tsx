/**
 * Language Context
 *
 * Provides translation function to all components.
 * Simplified to English only.
 */

import { createContext, useContext, useCallback, ReactNode } from 'react';
import { translations, TranslationKeys } from './translations';

interface LanguageContextValue {
  language: 'en';
  t: TranslationFunction;
}

// Helper type to get nested object paths
type NestedKeyOf<T, K extends keyof T = keyof T> = K extends string
  ? T[K] extends Record<string, unknown>
    ? `${K}.${NestedKeyOf<T[K]>}`
    : K
  : never;

export type TranslationKey = NestedKeyOf<TranslationKeys>;

type TranslationFunction = (key: TranslationKey, fallback?: string) => string;

const LanguageContext = createContext<LanguageContextValue | null>(null);

interface LanguageProviderProps {
  children: ReactNode;
}

/**
 * Get nested value from object by dot-separated path
 */
function getNestedValue(obj: Record<string, unknown>, path: string): string | undefined {
  const keys = path.split('.');
  let current: unknown = obj;

  for (const key of keys) {
    if (current && typeof current === 'object' && key in current) {
      current = (current as Record<string, unknown>)[key];
    } else {
      return undefined;
    }
  }

  return typeof current === 'string' ? current : undefined;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  // Translation function - always uses English
  const t: TranslationFunction = useCallback((key: TranslationKey, fallback?: string): string => {
    const value = getNestedValue(translations.en as Record<string, unknown>, key);
    return value || fallback || key;
  }, []);

  const value: LanguageContextValue = {
    language: 'en',
    t,
  };

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

/**
 * Hook to access language context
 */
export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

/**
 * Hook for just the translation function (convenience)
 */
export function useTranslation() {
  const { t, language } = useLanguage();
  return { t, language };
}
