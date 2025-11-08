import React, { useState } from 'react';
import { SettingsPanel } from './SettingsPanel';
import { useApp } from '../context/AppContext';
import { UserIcon } from './icons/EmergencyIcons';

interface HeaderProps {
  onShowProfile: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onShowProfile }) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { user } = useApp();

  return (
    <>
      <header className="w-full p-4 bg-gray-900/50 high-contrast:bg-black border-b border-gray-700 high-contrast:border-primary-color flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold tracking-tight text-white high-contrast:text-primary-color">
            ConnectAid <span className="text-aid-blue high-contrast:text-secondary-color">AI</span>
          </h1>
          {user && <span className="text-gray-300">Welcome, {user.name}</span>}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onShowProfile}
            className="p-2 rounded-full hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-aid-dark focus:ring-white high-contrast:focus:ring-primary-color"
            aria-label="Open profile page"
          >
            <UserIcon className="h-6 w-6" />
          </button>
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="p-2 rounded-full hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-aid-dark focus:ring-white high-contrast:focus:ring-primary-color"
            aria-label="Open accessibility and user settings"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
      </header>
      <SettingsPanel isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </>
  );
};
