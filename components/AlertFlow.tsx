import React, { useState, useEffect, useCallback } from 'react';
import { Alert, EmergencyCategory, UserLocation, EmergencyCategoryEnum } from '../types';
import { EMERGENCY_CATEGORIES } from '../constants';
import { simplifyText, validateEmergencyDetails } from '../services/geminiService';
import { useApp } from '../context/AppContext';

interface AlertFlowProps {
  onSubmit: (alert: Alert) => void;
  onCancel: () => void;
}

type FlowStep = 'category' | 'details' | 'location' | 'review';

export const AlertFlow: React.FC<AlertFlowProps> = ({ onSubmit, onCancel }) => {
  const [step, setStep] = useState<FlowStep>('category');
  const [selectedCategory, setSelectedCategory] = useState<EmergencyCategory | null>(null);
  const [details, setDetails] = useState('');
  const [location, setLocation] = useState<UserLocation | null>(null);
  const [isSimplifying, setIsSimplifying] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [detailsError, setDetailsError] = useState<string | null>(null);
  const [locationStatus, setLocationStatus] = useState('Fetching location...');
  const { speak } = useApp();

  useEffect(() => {
    speak("Please select the category of your emergency.");
  }, [speak]);

  const handleCategorySelect = (category: EmergencyCategory) => {
    setSelectedCategory(category);
    setStep('details');
    speak(`You have selected ${category.name}. Now, please describe your situation.`);
  };

  const handleDetailsSubmit = async () => {
    if (!selectedCategory) return;
    setIsValidating(true);
    setDetailsError(null);
    try {
        const { isValid, feedback } = await validateEmergencyDetails(details, selectedCategory.name);
        if (isValid) {
            setStep('location');
            speak("Details confirmed. I am now fetching your current location to find the nearest help.");
        } else {
            setDetailsError(feedback);
            speak(feedback);
        }
    } catch (error) {
        console.error("Validation error", error);
        const errorMsg = "Could not validate details. Please try again.";
        setDetailsError(errorMsg);
        speak(errorMsg);
    } finally {
        setIsValidating(false);
    }
  };
  
  const handleSimplifyText = async () => {
    if(!details.trim()) return;
    setIsSimplifying(true);
    speak("Simplifying your text for clarity.");
    try {
        const simplified = await simplifyText(details);
        setDetails(simplified);
    } catch (error) {
        console.error("Failed to simplify text", error);
    } finally {
        setIsSimplifying(false);
    }
  };

  const handleLocationConfirm = useCallback(() => {
    speak("Location acquired. Please review the details before sending the alert.");
    setStep('review');
  }, [speak]);

  useEffect(() => {
    if (step === 'location') {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ lat: latitude, lng: longitude });
          setLocationStatus('Location acquired successfully.');
          setTimeout(handleLocationConfirm, 1500);
        },
        (error) => {
          console.error("Geolocation error:", error);
          const errorMsg = `Could not get location: ${error.message}. Please proceed and contact responders with your location.`;
          setLocationStatus(errorMsg);
          speak(errorMsg);
        }
      );
    }
  }, [step, handleLocationConfirm, speak]);

  const handleSubmit = () => {
    if (selectedCategory) {
      const newAlert: Alert = {
        id: `ALRT-${Date.now()}`,
        category: selectedCategory,
        details: details,
        location: location,
        timestamp: new Date(),
      };
      onSubmit(newAlert);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 'category':
        return (
          <div className="w-full max-w-4xl">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-6">What is the nature of your emergency?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {EMERGENCY_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => handleCategorySelect(cat)}
                  className="flex flex-col items-center p-4 bg-gray-800 high-contrast:bg-black high-contrast:border-2 high-contrast:border-secondary-color rounded-lg shadow-lg text-center transform transition-transform hover:scale-105 hover:bg-aid-blue-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-aid-dark focus:ring-white high-contrast:focus:ring-primary-color"
                >
                  <cat.icon className="w-12 h-12 mb-3 text-aid-blue high-contrast:text-secondary-color" />
                  <span className="font-semibold text-lg">{cat.name}</span>
                  <p className="text-sm text-gray-400 mt-1">{cat.description}</p>
                </button>
              ))}
            </div>
             <div className="text-center mt-8">
                <button onClick={onCancel} className="text-gray-400 hover:text-white">Cancel</button>
            </div>
          </div>
        );
      case 'details':
        return (
          <div className="w-full max-w-lg">
            <h2 className="text-2xl font-bold text-center mb-4">Provide Details</h2>
            <p className="text-center text-gray-400 mb-6">Briefly describe the situation. Be clear and concise.</p>
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              className="w-full h-40 p-3 bg-gray-900 high-contrast:bg-black high-contrast:border-2 high-contrast:border-text-color rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-aid-blue"
              placeholder="e.g., 'Chest pain and difficulty breathing' or 'House is flooded, we are on the roof.'"
              aria-invalid={!!detailsError}
              aria-describedby="details-error"
            />
            {detailsError && <p id="details-error" className="text-red-400 text-sm mt-2">{detailsError}</p>}
            <div className="flex flex-col sm:flex-row gap-4 mt-4">
               <button onClick={handleSimplifyText} disabled={isSimplifying || isValidating} className="flex-1 w-full px-6 py-3 bg-aid-blue hover:bg-aid-blue-dark high-contrast:bg-secondary-color high-contrast:text-secondary-text-color text-white font-bold rounded-lg disabled:bg-gray-600 disabled:cursor-not-allowed">
                {isSimplifying ? 'Simplifying...' : 'Simplify with AI ✨'}
              </button>
              <button onClick={handleDetailsSubmit} disabled={isValidating || isSimplifying} className="flex-1 w-full px-6 py-3 bg-aid-green hover:bg-green-700 text-white font-bold rounded-lg disabled:bg-gray-600 disabled:cursor-not-allowed">
                {isValidating ? 'Validating...' : 'Continue'}
              </button>
            </div>
          </div>
        );
      case 'location':
        return (
          <div className="w-full max-w-lg text-center">
            <h2 className="text-2xl font-bold mb-4">Confirming Location</h2>
            <div className="flex justify-center items-center my-6">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-aid-blue"></div>
            </div>
            <p className="text-lg text-gray-300">{locationStatus}</p>
            {location && <p className="text-sm text-gray-500 mt-2">Lat: {location.lat.toFixed(4)}, Lng: {location.lng.toFixed(4)}</p>}
          </div>
        );
      case 'review':
        return (
          <div className="w-full max-w-lg bg-gray-800 p-6 rounded-lg">
            <h2 className="text-2xl font-bold text-center mb-6">Review and Submit</h2>
            <div className="space-y-4 text-left">
                <div>
                    <h3 className="font-semibold text-gray-400">Category</h3>
                    <p className="text-lg">{selectedCategory?.name}</p>
                </div>
                <div>
                    <h3 className="font-semibold text-gray-400">Details</h3>
                    <p className="text-lg whitespace-pre-wrap">{details || "No details provided."}</p>
                </div>
                <div>
                    <h3 className="font-semibold text-gray-400">Location</h3>
                    <p className="text-lg">{location ? `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}` : 'Location not available'}</p>
                </div>
            </div>
            <p className="text-center text-aid-yellow mt-6">Submitting will send your alert to nearby responders immediately.</p>
            <button
              onClick={handleSubmit}
              className="w-full mt-4 px-6 py-4 bg-aid-red hover:bg-aid-red-dark high-contrast:bg-danger-color text-white text-xl font-bold rounded-lg"
            >
              CONFIRM & SEND ALERT
            </button>
          </div>
        );
    }
  };

  return <div className="flex flex-col items-center justify-center w-full">{renderStep()}</div>;
};
