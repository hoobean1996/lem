/**
 * Settings Context
 *
 * Provides global settings (sound) accessible from any component.
 * Persists settings to backend API.
 * Falls back to defaults if API is unavailable.
 */

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { getStorage } from '../../../infrastructure/storage/StorageProvider';
import type { UserSettings } from '../../../infrastructure/storage/types';
import { warn } from '../../../infrastructure/logging';
import { useAuth } from './AuthContext';

interface SettingsContextValue {
  // Settings state
  soundEnabled: boolean;
  loading: boolean;
  error: string | null;

  // Actions
  setSoundEnabled: (enabled: boolean) => void;

  // Tour tracking
  isTourCompleted: (tourId: string) => boolean;
  markTourCompleted: (tourId: string) => void;
  resetTourCompleted: (tourId: string) => void;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

interface SettingsProviderProps {
  children: ReactNode;
}

// Default settings when API is unavailable
const defaultSettings: UserSettings = {
  soundEnabled: true,
  tourCompleted: {},
};

export function SettingsProvider({ children }: SettingsProviderProps) {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load settings only when authenticated
  useEffect(() => {
    // Wait for auth to finish loading
    if (authLoading) {
      return;
    }

    // Only fetch settings if authenticated
    if (!isAuthenticated) {
      setSettings(defaultSettings);
      setLoading(false);
      setError(null);
      return;
    }

    getStorage()
      .getSettings()
      .then((s) => {
        setSettings(s);
        setError(null);
      })
      .catch((err: unknown) => {
        warn('Failed to load settings', { error: err }, 'SettingsContext');
        setError(err instanceof Error ? err.message : 'Failed to load settings');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [isAuthenticated, authLoading]);

  // Update settings helper
  const updateSettings = useCallback(async (updates: Partial<UserSettings>) => {
    // Update local state immediately for responsive UI
    setSettings((prev) => ({ ...prev, ...updates }));

    // Persist to API (fire and forget)
    try {
      await getStorage().updateSettings(updates);
      const newSettings = await getStorage().getSettings();
      setSettings(newSettings);
    } catch (err) {
      warn('Failed to save settings', { error: err, updates }, 'SettingsContext');
      // Keep local state as-is
    }
  }, []);

  // Sound toggle
  const setSoundEnabled = useCallback(
    (enabled: boolean) => {
      updateSettings({ soundEnabled: enabled });
    },
    [updateSettings]
  );

  // Tour completed check
  const isTourCompleted = useCallback(
    (tourId: string): boolean => {
      return settings?.tourCompleted[tourId] || false;
    },
    [settings]
  );

  // Mark tour as completed
  const markTourCompleted = useCallback(
    (tourId: string) => {
      updateSettings({
        tourCompleted: { ...settings.tourCompleted, [tourId]: true },
      });
    },
    [settings, updateSettings]
  );

  // Reset tour completion (for replay)
  const resetTourCompleted = useCallback(
    (tourId: string) => {
      const newTourCompleted = { ...settings.tourCompleted };
      delete newTourCompleted[tourId];
      updateSettings({ tourCompleted: newTourCompleted });
    },
    [settings, updateSettings]
  );

  const value: SettingsContextValue = {
    soundEnabled: settings?.soundEnabled ?? true,
    loading,
    error,
    setSoundEnabled,
    isTourCompleted,
    markTourCompleted,
    resetTourCompleted,
  };

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

/**
 * Hook to access global settings
 */
export function useGlobalSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useGlobalSettings must be used within a SettingsProvider');
  }
  return context;
}
