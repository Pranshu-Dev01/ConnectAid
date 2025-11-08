
import React, { createContext, useState, useContext, useMemo, useEffect } from 'react';
import { AccessibilitySettings } from '../types';

interface AccessibilityContextType extends AccessibilitySettings {
  toggleHighContrast: () => void;
  toggleLargeText: () => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export const AccessibilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AccessibilitySettings>({
    isHighContrast: false,
    isLargeText: false,
  });

  useEffect(() => {
    const root = document.documentElement;
    if (settings.isHighContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }
    if (settings.isLargeText) {
      root.classList.add('large-text');
    } else {
      root.classList.remove('large-text');
    }
  }, [settings]);

  const toggleHighContrast = () => {
    setSettings(s => ({ ...s, isHighContrast: !s.isHighContrast }));
  };

  const toggleLargeText = () => {
    setSettings(s => ({ ...s, isLargeText: !s.isLargeText }));
  };

  const value = useMemo(() => ({
    ...settings,
    toggleHighContrast,
    toggleLargeText,
  }), [settings]);

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
      <style>{`
        html.high-contrast {
          --bg-color: #000000;
          --text-color: #ffffff;
          --primary-color: #ffff00;
          --primary-text-color: #000000;
          --secondary-color: #0000ff;
          --secondary-text-color: #ffffff;
          --danger-color: #ff0000;
        }
        html.high-contrast body {
          background-color: var(--bg-color) !important;
          color: var(--text-color) !important;
        }
        html.large-text {
          font-size: 18px;
        }
        @media (min-width: 768px) {
            html.large-text {
                font-size: 20px;
            }
        }
      `}</style>
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = (): AccessibilityContextType => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
};
