import React, { useState, useEffect, useCallback } from 'react';
import { Alert, EmergencyCategory, UserLocation } from '../types';
import { useSpeech } from '../hooks/useSpeech';
import { MicrophoneIcon } from './icons/EmergencyIcons';
import { processVoiceCommand } from '../services/geminiService';
import { EMERGENCY_CATEGORIES } from '../constants';
import { useApp } from '../context/AppContext';

interface VoiceAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (alert: Alert) => void;
}

type Step = 'initial' | 'review';

const StatusIndicator: React.FC<{ status: string }> = ({ status }) => (
    <div className="bg-black/50 text-white text-lg rounded-full px-6 py-2">
        {status}
    </div>
);

export const VoiceAssistant: React.FC<VoiceAssistantProps> = ({ isOpen, onClose, onSubmit }) => {
  const [step, setStep] = useState<Step>('initial');
  const { detectedLang, setDetectedLang, speak } = useApp();
  const [alertData, setAlertData] = useState<{ category: EmergencyCategory | null; details: string }>({ category: null, details: '' });
  const [userTranscript, setUserTranscript] = useState('');
  const [systemMessage, setSystemMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  const { isListening, startListening } = useSpeech(detectedLang);

  const processAndSubmit = (finalCategory: EmergencyCategory, finalDetails: string) => {
      navigator.geolocation.getCurrentPosition(
          (position) => {
              const location: UserLocation = { lat: position.coords.latitude, lng: position.coords.longitude };
              const finalAlert: Alert = {
                  id: `ALRT-VOICE-${Date.now()}`,
                  category: finalCategory,
                  details: finalDetails,
                  location,
                  timestamp: new Date(),
              };
              onSubmit(finalAlert);
          },
          (error) => {
              console.error("Geolocation error:", error);
              const finalAlert: Alert = {
                  id: `ALRT-VOICE-${Date.now()}`,
                  category: finalCategory,
                  details: finalDetails,
                  location: null,
                  timestamp: new Date(),
              };
              onSubmit(finalAlert);
          }
      );
  };

  const handleListen = async () => {
    if (isListening || isProcessing) return;
    
    // Permission check logic
    if (navigator.permissions) {
      try {
        const permissionStatus = await navigator.permissions.query({ name: 'microphone' as PermissionName });
        if (permissionStatus.state === 'denied') {
          const errorMsg = "Microphone access is blocked. To use the voice assistant, please go to your browser's site settings and allow microphone access for this page.";
          setSystemMessage(errorMsg);
          await speak(errorMsg);
          return;
        }
      } catch (err) {
        console.warn("Could not query microphone permission status:", err);
      }
    }

    try {
        const transcript = await startListening();
        if (transcript) {
            setIsProcessing(true);
            setUserTranscript(transcript);

            const result = await processVoiceCommand(
                transcript, 
                step, 
                alertData.category?.name
            );
            
            setDetectedLang(result.detectedLang);
            setSystemMessage(result.aiResponseText);
            await speak(result.aiResponseText);
            
            if (step === 'review') {
                if (result.isFinalConfirmation && alertData.category) {
                    processAndSubmit(alertData.category, alertData.details);
                } else {
                    // Canceled or misunderstood confirmation, reset the flow
                    setStep('initial');
                    setAlertData({ category: null, details: '' });
                }
            } else { // 'initial'
                if (result.isValid && result.category) {
                    const category = EMERGENCY_CATEGORIES.find(c => c.id === result.category);
                    if (category) {
                        setAlertData({ category, details: result.englishDetails });
                        setStep('review');
                    } else {
                        setStep('initial');
                    }
                } else {
                    setStep('initial');
                    setAlertData({ category: null, details: '' });
                }
            }
        }
    } catch (error) {
        console.error("Listening failed", error);
        let errorMsg = "Sorry, an unexpected error occurred. Please try again.";
        if (typeof error === 'string') {
            if (error.includes('not-allowed')) {
                errorMsg = "Microphone access was denied. Please allow microphone access in your browser settings to use the voice assistant.";
            } else if (error.includes('no-speech')) {
                errorMsg = "I didn't hear anything. Please press the microphone button and try speaking again.";
            }
        }
        
        setSystemMessage(errorMsg);
        await speak(errorMsg);
    } finally {
        setIsProcessing(false);
    }
  };
  
  useEffect(() => {
    if (isOpen) {
      setStep('initial');
      setAlertData({ category: null, details: '' });
      setUserTranscript('');
      const welcome = "Press the microphone button and tell me what's wrong.";
      setSystemMessage(welcome);
      speak(welcome);
    }
  }, [isOpen, speak]);

  if (!isOpen) return null;

  const getStatusText = () => {
      if(isProcessing) return "Processing...";
      if(isListening) return "Listening...";
      return "Ready";
  }

  return (
    <div className="fixed inset-0 z-50 bg-aid-dark/95 flex flex-col items-center justify-between p-8" role="dialog" aria-modal="true">
        <div className="absolute top-5 right-5">
            <button onClick={onClose} className="text-white text-2xl font-bold">&times;</button>
        </div>
        
        <StatusIndicator status={getStatusText()} />
        
        <div className="text-center">
            <p className="text-2xl md:text-4xl font-light text-gray-300 mb-4">{systemMessage}</p>
            {userTranscript && <p className="text-xl md:text-3xl text-white font-semibold">You said: "{userTranscript}"</p>}
        </div>

        <button 
            onClick={handleListen} 
            disabled={isProcessing}
            className={`relative flex items-center justify-center w-32 h-32 rounded-full transition-colors duration-300 disabled:opacity-50 ${
                isListening ? 'bg-aid-red animate-pulse' : 'bg-aid-blue'
            }`}
        >
            <MicrophoneIcon className="w-16 h-16 text-white" />
        </button>
    </div>
  );
};