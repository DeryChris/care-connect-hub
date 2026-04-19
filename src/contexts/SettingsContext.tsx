// src/contexts/SettingsContext.tsx
// Syncs with /api/settings on mount, falls back to localStorage while loading.
// External interface (useSettings, formatCurrency, updateSettings) is UNCHANGED.

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { settingsService } from '@/services';

interface AppSettings {
  currency: string;
  currencySymbol: string;
  darkMode: boolean;
  hospitalName: string;
}

interface SettingsContextType {
  settings: AppSettings;
  updateSettings: (key: keyof AppSettings, value: string | boolean) => void;
  formatCurrency: (amount: number) => string;
}

const currencySymbols: Record<string, string> = {
  USD: '$', EUR: '€', GBP: '£', INR: '₹', GHS: '₵',
};

const defaultSettings: AppSettings = {
  currency: 'GHS',
  currencySymbol: '₵',
  darkMode: false,
  hospitalName: 'Care Connect Hospital',
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem('app-settings');
      return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
    } catch {
      return defaultSettings;
    }
  });

  // Sync from API on mount
  useEffect(() => {
    settingsService.list()
      .then(res => {
        const remote = res.data;
        setSettings(prev => ({
          ...prev,
          hospitalName: remote.hospital_name ?? prev.hospitalName,
          currency: remote.currency ?? prev.currency,
          currencySymbol: currencySymbols[remote.currency ?? prev.currency] ?? prev.currencySymbol,
          darkMode: remote.dark_mode === 'true',
        }));
      })
      .catch(() => {
        // API unavailable — keep local settings silently
      });
  }, []);

  // Apply dark mode and persist locally whenever settings change
  useEffect(() => {
    try {
      localStorage.setItem('app-settings', JSON.stringify(settings));
    } catch {
      // ignore storage errors
    }
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings]);

  const updateSettings = (key: keyof AppSettings, value: string | boolean) => {
    setSettings(prev => {
      const next = { ...prev, [key]: value };
      if (key === 'currency') {
        next.currencySymbol = currencySymbols[value as string] || '$';
      }
      return next;
    });

    // Persist to backend
    const apiKeyMap: Record<string, string> = {
      hospitalName: 'hospital_name',
      currency: 'currency',
      darkMode: 'dark_mode',
    };
    const apiKey = apiKeyMap[key];
    if (apiKey) {
      settingsService.update(apiKey, value).catch(() => {});
      if (key === 'currency') {
        settingsService.update('currency_symbol', currencySymbols[value as string] || '$').catch(() => {});
      }
    }
  };

  const formatCurrency = (amount: number): string =>
    `${settings.currencySymbol}${amount.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, formatCurrency }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within a SettingsProvider');
  return ctx;
}
