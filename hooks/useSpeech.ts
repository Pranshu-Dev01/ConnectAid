import { useState, useEffect, useRef, useCallback } from 'react';

// More specific type definitions for the Web Speech API to improve type safety.
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface SpeechRecognitionStatic {
  new (): SpeechRecognition;
}

interface SpeechRecognition {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: (this: SpeechRecognition, ev: SpeechRecognitionEvent) => any;
  onerror: (this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any;
  onend: (this: SpeechRecognition, ev: Event) => any;
}

declare global {
  interface Window {
    SpeechRecognition: SpeechRecognitionStatic;
    webkitSpeechRecognition: SpeechRecognitionStatic;
  }
}

const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
const synth = window.speechSynthesis;

export const useSpeech = (lang: string = 'en-US') => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const langRef = useRef(lang);
  
  useEffect(() => {
    langRef.current = lang;
  }, [lang]);

  // Initialize recognition and manage its lifecycle.
  useEffect(() => {
    if (!SpeechRecognitionAPI) {
      console.warn("Speech recognition is not supported by this browser.");
      return;
    }
    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
        recognitionRef.current = null;
      }
    };
  }, []);

  // Update recognition language when the app's language changes.
  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = lang;
    }
  }, [lang]);

  const startListening = useCallback(() => {
    return new Promise<string>((resolve, reject) => {
      const recognition = recognitionRef.current;
      if (!recognition) {
        return reject('Speech recognition not supported or initialized.');
      }
      
      if (isListening) {
        recognition.stop();
      }

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const resultTranscript = event.results[0][0].transcript;
        setTranscript(resultTranscript);
        resolve(resultTranscript);
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        reject(event.error);
      };

      recognition.onend = () => {
        setIsListening(false);
      };
      
      setTranscript('');
      setIsListening(true);
      recognition.start();
    });
  }, [isListening]);

  const speak = useCallback((text: string) => {
    return new Promise<void>((resolve, reject) => {
        if (!text || !text.trim() || !synth) {
            return resolve(); // Resolve silently if there's nothing to say.
        }

        // --- CORE FIX: AGGRESSIVE RESET ---
        // Unconditionally cancel any ongoing or queued speech. This is the most
        // reliable way to prevent the synth engine from getting into a stuck state,
        // which is a common cause of silent failures.
        synth.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        const currentLang = langRef.current;
        utterance.lang = currentLang;

        // --- CORE FIX: JUST-IN-TIME VOICE LOADING ---
        // Fetch the list of voices every single time. This avoids race conditions
        // where `speak` is called before the browser has asynchronously loaded
        // all available voices (especially for non-English languages).
        const voices = synth.getVoices();
        const languagePart = currentLang.split('-')[0];
        const bestVoice = voices.find(v => v.lang === currentLang) ||
                        voices.find(v => v.lang.startsWith(languagePart));
        
        if (bestVoice) {
            utterance.voice = bestVoice;
        } else {
            console.warn(`No pre-installed voice for ${currentLang}. Using browser default.`);
        }
        
        utterance.onend = () => {
            resolve();
        };

        utterance.onerror = (e) => {
            console.error("Speech synthesis error:", e);
            reject(new Error(`Speech synthesis failed: ${e.error}`));
        };
        
        // Use a timeout to allow the `cancel()` operation to fully complete
        // before queueing the new utterance, further preventing race conditions.
        setTimeout(() => {
          synth.speak(utterance);
        }, 100);
    });
  }, []); 

  return { isListening, transcript, startListening, speak, setTranscript };
};
