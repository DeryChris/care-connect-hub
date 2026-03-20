import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

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

const defaultSettings: AppSettings = {
  currency: 'GHS',
  currencySymbol: '₵',
  darkMode: false,
  hospitalName: 'Care Connect Hospital',
};

const currencySymbols: Record<string, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  INR: '₹',
  GHS: '₵',
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('app-settings');
    return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
  });

  useEffect(() => {
    localStorage.setItem('app-settings', JSON.stringify(settings));
    // Apply dark mode class to document
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings]);

  const updateSettings = (key: keyof AppSettings, value: string | boolean) => {
    setSettings(prev => {
      const newSettings = { ...prev, [key]: value };
      // Update currency symbol when currency changes
      if (key === 'currency') {
        newSettings.currencySymbol = currencySymbols[value as string] || '$';
      }
      return newSettings;
    });
  };

  const formatCurrency = (amount: number): string => {
    return `${settings.currencySymbol}${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, formatCurrency }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
