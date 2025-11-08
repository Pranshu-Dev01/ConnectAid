import React from 'react';
import { useApp } from '../context/AppContext';
import { Alert } from '../types';

const AlertHistoryCard: React.FC<{ alert: Alert }> = ({ alert }) => (
    <div className="bg-gray-900 high-contrast:bg-black high-contrast:border high-contrast:border-secondary-color rounded-lg p-4">
        <div className="flex justify-between items-start">
            <div>
                <h4 className="font-bold text-lg text-aid-blue high-contrast:text-secondary-color">{alert.category.name}</h4>
                <p className="text-sm text-gray-400">{alert.timestamp.toLocaleString()}</p>
            </div>
            <span className="text-xs font-mono bg-gray-700 px-2 py-1 rounded">{alert.id}</span>
        </div>
        <p className="mt-2 text-gray-300 whitespace-pre-wrap">{alert.details}</p>
    </div>
);

export const ProfilePage: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const { user } = useApp();

    if (!user) {
        return (
            <div className="text-center">
                <p>User not found. Please log in again.</p>
                <button onClick={onClose} className="mt-4 px-6 py-2 bg-aid-blue rounded-lg">Go Back</button>
            </div>
        );
    }
    
    return (
        <div className="w-full max-w-2xl bg-gray-800 high-contrast:bg-black high-contrast:border-2 high-contrast:border-primary-color rounded-lg shadow-xl p-6 animate-fade-in">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-center high-contrast:text-primary-color">Your Profile</h2>
                <button onClick={onClose} className="text-gray-400 hover:text-white">&times; Close</button>
            </div>

            <div className="bg-gray-900 rounded-lg p-4 mb-6">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                    <div>
                        <p className="text-sm text-gray-400">Name</p>
                        <p className="text-xl font-semibold">{user.name}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-400">Contact ({user.loginMethod})</p>
                        <p className="text-xl font-semibold">{user.contact}</p>
                    </div>
                </div>
            </div>

            <h3 className="text-2xl font-bold mb-4 high-contrast:text-primary-color">Alert History</h3>
            {user.alerts && user.alerts.length > 0 ? (
                <div className="space-y-4 max-h-[22rem] overflow-y-auto pr-2">
                    {user.alerts.map((alert) => (
                        <AlertHistoryCard key={alert.id} alert={alert} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-8 bg-gray-900 rounded-lg">
                    <p className="text-gray-400">You have not submitted any alerts yet.</p>
                </div>
            )}
        </div>
    );
};
