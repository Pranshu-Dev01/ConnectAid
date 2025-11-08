
import React from 'react';

interface EmergencyButtonProps {
  onClick: () => void;
}

export const EmergencyButton: React.FC<EmergencyButtonProps> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="relative flex items-center justify-center w-48 h-48 md:w-64 md:h-64 rounded-full bg-aid-red high-contrast:bg-danger-color text-white shadow-lg
                 transform transition-transform duration-200 ease-in-out hover:scale-105
                 focus:outline-none focus:ring-4 focus:ring-red-400 focus:ring-opacity-75"
      aria-label="Request Emergency Assistance"
    >
      <span className="absolute inset-0 rounded-full bg-black opacity-0 group-hover:opacity-10 transition-opacity"></span>
      <span className="absolute animate-ping inline-flex h-full w-full rounded-full bg-aid-red high-contrast:bg-danger-color opacity-75"></span>
      <span className="relative z-10 text-2xl md:text-4xl font-bold uppercase tracking-wider">
        Get Help
      </span>
    </button>
  );
};
