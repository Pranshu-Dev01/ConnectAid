import React, { useState, useEffect } from 'react';
import { Alert, Responder } from '../types';
import { findNearbyResponders, getFollowUpPrompt, translateText } from '../services/geminiService';
import { MapPinIcon, WebIcon } from './icons/EmergencyIcons';
import { useApp } from '../context/AppContext';

interface AlertStatusProps {
  alert: Alert;
  onReset: () => void;
}

const ResponderCard: React.FC<{ responder: Responder }> = ({ responder }) => (
    <div className="bg-gray-900 high-contrast:bg-black high-contrast:border high-contrast:border-secondary-color rounded-lg p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex-shrink-0">
            {responder.type === 'place' ? 
                <MapPinIcon className="w-8 h-8 text-aid-blue high-contrast:text-secondary-color" /> : 
                <WebIcon className="w-8 h-8 text-aid-green" />
            }
        </div>
        <div className="flex-grow">
            <h4 className="font-bold text-lg">{responder.name}</h4>
        </div>
        <div className="flex-shrink-0 flex gap-2 w-full sm:w-auto">
            <a 
                href={responder.uri} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex-1 text-center px-4 py-2 bg-aid-blue hover:bg-aid-blue-dark text-white font-semibold rounded-lg transition-colors"
            >
                {responder.type === 'place' ? 'View Map' : 'Open Link'}
            </a>
        </div>
    </div>
);

export const AlertStatus: React.FC<AlertStatusProps> = ({ alert, onReset }) => {
  const [responders, setResponders] = useState<Responder[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [followUpQuestion, setFollowUpQuestion] = useState<string | null>(null);
  const { speak, detectedLang } = useApp();

  useEffect(() => {
    const fetchAndSpeak = async () => {
      if (!alert.location) {
        const errorMsg = "Your location is not available, so we cannot find nearby responders. Please call emergency services directly.";
        setError(errorMsg);
        speak(await translateText(errorMsg, 'en-US', detectedLang));
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        speak(await translateText(`Your alert has been sent. I am now finding the closest responders for your ${alert.category.name} emergency. This may take a moment.`, 'en-US', detectedLang));

        const results = await findNearbyResponders(alert.category, alert.details, alert.location);
        
        if (results.length === 0) {
            const errorMsg = "No specific responders could be found automatically. Please contact your local emergency services.";
            setError(errorMsg);
            speak(await translateText(errorMsg, 'en-US', detectedLang));
        } else {
            setResponders(results);
            const foundMsg = `I have found ${results.length} potential responder${results.length > 1 ? 's' : ''}.`;
            speak(await translateText(foundMsg, 'en-US', detectedLang));

            const followUp = await getFollowUpPrompt(alert.category.name, alert.details);
            const translatedFollowUp = await translateText(followUp, 'en-US', detectedLang);
            setFollowUpQuestion(translatedFollowUp);
            speak(translatedFollowUp);
        }
      } catch (e) {
        console.error(e);
        const errorMsg = "An error occurred while searching for responders. Please contact your local emergency services.";
        setError(errorMsg);
        speak(await translateText(errorMsg, 'en-US', detectedLang));
      } finally {
        setIsLoading(false);
      }
    };

    fetchAndSpeak();
  }, [alert, speak, detectedLang]);
  
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="text-center">
            <h2 className="text-3xl font-bold text-center mb-2 high-contrast:text-primary-color">Finding Help...</h2>
            <p className="text-center text-gray-400 mb-6">
                Using your location to find verified responders. Please wait.
            </p>
            <div className="flex justify-center items-center my-6">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-aid-blue"></div>
            </div>
        </div>
      );
    }

    if (error) {
       return (
        <div className="text-center">
            <h2 className="text-3xl font-bold text-red-500 text-center mb-2 high-contrast:text-danger-color">Could Not Find Responders</h2>
            <p className="text-center text-gray-300 mb-6 max-w-md mx-auto">{error}</p>
            <div className="bg-gray-900 p-4 rounded-lg my-4">
                <p className="text-lg">For immediate assistance, please call your local emergency number.</p>
                <p className="text-4xl font-bold text-white my-2">e.g., 911, 112, 999</p>
            </div>
        </div>
       )
    }

    if (responders) {
        const places = responders.filter(r => r.type === 'place');
        const webResources = responders.filter(r => r.type === 'web');

        return (
            <>
                <h2 className="text-3xl font-bold text-center mb-2 high-contrast:text-primary-color">Responders Found Near You</h2>
                <p className="text-center text-gray-400 mb-6">
                    Here is a list of organizations that may be able to help. Please contact them directly.
                </p>
                <div className="bg-gray-900 rounded-lg p-3 mb-6 text-center">
                    <p className="text-sm text-gray-400">For reference, your Alert ID is:</p>
                    <p className="font-mono text-lg text-aid-yellow">{alert.id}</p>
                </div>
                
                <div className="space-y-4 max-h-[22rem] overflow-y-auto pr-2">
                    {places.length > 0 && places.map((responder, index) => <ResponderCard key={index} responder={responder} />)}
                    {webResources.length > 0 && (
                        <>
                            <h3 className="text-xl font-bold text-center pt-6 high-contrast:text-primary-color">Online Resources</h3>
                             {webResources.map((responder, index) => <ResponderCard key={index + places.length} responder={responder} />)}
                        </>
                    )}
                </div>

                {followUpQuestion && (
                    <div className="mt-6 p-4 bg-aid-blue/20 rounded-lg text-center">
                        <p className="text-lg font-semibold text-aid-light">{followUpQuestion}</p>
                    </div>
                )}
            </>
        )
    }

    return null;
  };


  return (
    <div className="w-full max-w-2xl bg-gray-800 high-contrast:bg-black high-contrast:border-2 high-contrast:border-primary-color rounded-lg shadow-xl p-6">
        {renderContent()}
        <div className="mt-6 text-center">
            <button 
                onClick={onReset}
                className="px-6 py-3 bg-aid-blue hover:bg-aid-blue-dark text-white font-bold rounded-lg"
            >
                {isLoading ? 'Cancel' : 'Start New Alert'}
            </button>
        </div>
    </div>
  );
};
