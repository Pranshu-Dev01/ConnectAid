import React, { createContext, useContext, useMemo } from 'react';
import { useSpeech } from '../hooks/useSpeech';
import { User, Alert } from '../types';

interface AppContextType {
  user: User | null;
  logout: () => void;
  addAlertToHistory: (alert: Alert) => void;
  detectedLang: string;
  setDetectedLang: React.Dispatch<React.SetStateAction<string>>;
  speak: (text: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ 
  children: React.ReactNode; 
  user: User | null; 
  logout: () => void;
  addAlertToHistory: (alert: Alert) => void;
}> = ({ children, user, logout, addAlertToHistory }) => {
  const [detectedLang, setDetectedLang] = React.useState('en-US');
  const { speak } = useSpeech(detectedLang);

  const value = useMemo(() => ({
    user,
    logout,
    addAlertToHistory,
    detectedLang,
    setDetectedLang,
    speak,
  }), [user, logout, addAlertToHistory, detectedLang, speak]);

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
