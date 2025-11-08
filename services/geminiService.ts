import { UserLocation, EmergencyCategory, Responder, EmergencyCategoryEnum } from '../types';
import * as backend from './backendService';

// This file now acts as a client-side API layer.
// In a real application, these functions would use `fetch` to call a backend server.
// Here, we simulate that by calling the functions from `backendService.ts`.

export const simplifyText = (text: string): Promise<string> => {
  return backend.simplifyText(text);
};

export const findNearbyResponders = (
  category: EmergencyCategory,
  details: string,
  location: UserLocation
): Promise<Responder[]> => {
  return backend.findNearbyResponders(category, details, location);
};

export const detectLanguage = (text: string): Promise<string> => {
  return backend.detectLanguage(text);
};

export const translateText = (text: string, sourceLang: string, targetLang: string): Promise<string> => {
  return backend.translateText(text, sourceLang, targetLang);
};

export const processVoiceCommand = (
  transcript: string,
  currentStep: 'initial' | 'review',
  previousCategory?: string
): Promise<{
  detectedLang: string;
  englishDetails: string;
  category: EmergencyCategoryEnum | null;
  isValid: boolean;
  isFinalConfirmation: boolean;
  aiResponseText: string;
}> => {
  return backend.processVoiceCommand(transcript, currentStep, previousCategory);
};

export const validateEmergencyDetails = (details: string, categoryName: string): Promise<{ isValid: boolean; feedback: string; }> => {
  // If the backend provides validateEmergencyDetails, use it; otherwise return a simple fallback
  if (typeof (backend as any).validateEmergencyDetails === 'function') {
    return (backend as any).validateEmergencyDetails(details, categoryName);
  }

  // Basic fallback validation: require non-empty details with a minimum length
  const trimmed = details ? details.trim() : '';
  const isValid = trimmed.length > 10;
  const feedback = isValid
    ? 'Details look sufficient.'
    : 'Please provide more information about the emergency (at least ~10 characters).';

  return Promise.resolve({ isValid, feedback });
};

export const getFollowUpPrompt = (categoryName: string, details: string): Promise<string> => {
  // If the backend provides getFollowUpPrompt, use it; otherwise return a simple fallback
  if (typeof (backend as any).getFollowUpPrompt === 'function') {
    return (backend as any).getFollowUpPrompt(categoryName, details);
  }

  // Basic fallback prompt
  return Promise.resolve(`Can you provide more details about the ${categoryName} emergency?`);
};
