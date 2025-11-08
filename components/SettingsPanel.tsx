import React from 'react';
import { useAccessibility } from '../context/AccessibilityContext';
import { useApp } from '../context/AppContext';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ToggleProps {
  label: string;
  enabled: boolean;
  onChange: () => void;
}

const Toggle: React.FC<ToggleProps> = ({ label, enabled, onChange }) => (
    <div className="flex items-center justify-between py-4">
        <span className="text-lg text-gray-200 high-contrast:text-text-color">{label}</span>
        <button
            onClick={onChange}
            className={`${
            enabled ? 'bg-aid-blue high-contrast:bg-secondary-color' : 'bg-gray-600'
            } relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white high-contrast:focus:ring-primary-color`}
            role="switch"
            aria-checked={enabled}
        >
            <span
            className={`${
                enabled ? 'translate-x-6' : 'translate-x-1'
            } inline-block w-4 h-4 transform bg-white rounded-full transition-transform`}
            />
        </button>
    </div>
);

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ isOpen, onClose }) => {
    const { isHighContrast, toggleHighContrast, isLargeText, toggleLargeText } = useAccessibility();
    const { logout, user } = useApp();

    return (
        <div 
          className={`fixed inset-0 z-50 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
          aria-labelledby="settings-title"
          role="dialog"
          aria-modal="true"
        >
            <div className="absolute inset-0 bg-black/60" onClick={onClose} aria-hidden="true"></div>
            
            <div className={`fixed top-0 right-0 h-full w-full max-w-sm bg-gray-800 high-contrast:bg-black shadow-2xl transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="flex flex-col h-full">
                    <div className="flex items-center justify-between p-4 border-b border-gray-700 high-contrast:border-primary-color">
                        <h2 id="settings-title" className="text-xl font-semibold text-white high-contrast:text-primary-color">Settings</h2>
                        <button 
                            onClick={onClose} 
                            className="p-2 rounded-full hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-white high-contrast:focus:ring-primary-color"
                            aria-label="Close settings panel"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    <div className="flex-grow p-6">
                        <h3 className="text-lg font-semibold text-gray-300 high-contrast:text-primary-color mb-2">Accessibility</h3>
                        <Toggle label="High Contrast" enabled={isHighContrast} onChange={toggleHighContrast} />
                        <div className="border-t border-gray-700 my-2"></div>
                        <Toggle label="Large Text" enabled={isLargeText} onChange={toggleLargeText} />
                    </div>
                     {user && (
                        <div className="p-6 border-t border-gray-700">
                             <button
                                onClick={logout}
                                className="w-full px-4 py-3 bg-aid-red-dark hover:bg-aid-red text-white font-bold rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white"
                            >
                                Log Out
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
