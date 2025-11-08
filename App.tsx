import React from 'react';
import { Header } from './components/Header';
import { AlertFlow } from './components/AlertFlow';
import { AlertStatus } from './components/AlertStatus';
import { EmergencyButton } from './components/EmergencyButton';
import { VoiceAssistant } from './components/VoiceAssistant';
import { MicrophoneIcon } from './components/icons/EmergencyIcons';
import { Alert, User } from './types';
import { AccessibilityProvider } from './context/AccessibilityContext';
import { AppProvider, useApp } from './context/AppContext';
import { useAuth } from './hooks/useAuth';
import { LoginPage } from './components/LoginPage';
import { ProfilePage } from './components/ProfilePage';

type AppState = 'home' | 'creating_alert' | 'alert_sent' | 'profile';

const MainApp: React.FC = () => {
  const [appState, setAppState] = React.useState<AppState>('home');
  const [activeAlert, setActiveAlert] = React.useState<Alert | null>(null);
  const [isVoiceAssistantOpen, setIsVoiceAssistantOpen] = React.useState(false);
  const { speak, user, addAlertToHistory } = useApp();

  React.useEffect(() => {
    if(appState === 'home' && user) {
      speak(`Welcome, ${user.name}. If you are in an emergency, press the 'Get Help' button or use the voice assistant.`);
    }
  }, [appState, user, speak]);

  const handleCreateAlert = React.useCallback(() => {
    setAppState('creating_alert');
  }, []);

  const handleAlertSubmit = React.useCallback((alert: Alert) => {
    setActiveAlert(alert);
    addAlertToHistory(alert);
    setIsVoiceAssistantOpen(false);
    setAppState('alert_sent');
  }, [addAlertToHistory]);

  const handleReset = React.useCallback(() => {
    setActiveAlert(null);
    setAppState('home');
  }, []);

  const handleShowProfile = React.useCallback(() => {
    speak("Opening your profile.");
    setAppState('profile');
  }, [speak]);

  const handleCloseProfile = React.useCallback(() => {
    setAppState('home');
  }, []);


  const renderContent = () => {
    switch (appState) {
      case 'creating_alert':
        return <AlertFlow onSubmit={handleAlertSubmit} onCancel={() => setAppState('home')} />;
      case 'alert_sent':
        return activeAlert && <AlertStatus alert={activeAlert} onReset={handleReset} />;
      case 'profile':
        return <ProfilePage onClose={handleCloseProfile} />;
      case 'home':
      default:
        return (
          <div className="flex flex-col items-center justify-center text-center p-4">
            <h1 className="text-3xl md:text-5xl font-bold mb-2 high-contrast:text-primary-color">In an emergency?</h1>
            <p className="text-lg md:text-xl text-gray-300 high-contrast:text-text-color mb-8 max-w-2xl">
              Press the button to connect with responders, or use our voice assistant for hands-free help.
            </p>
            <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
              <EmergencyButton onClick={handleCreateAlert} />
              <div className="flex flex-col items-center gap-2">
                 <button 
                    onClick={() => setIsVoiceAssistantOpen(true)} 
                    className="flex items-center justify-center w-28 h-28 rounded-full bg-aid-blue hover:bg-aid-blue-dark focus:outline-none focus:ring-4 focus:ring-blue-400 focus:ring-opacity-75 transition-transform transform hover:scale-105"
                    aria-label="Use Voice Assistant"
                  >
                    <MicrophoneIcon className="w-14 h-14 text-white" />
                </button>
                <p className="font-semibold text-lg">Use Voice Assistant</p>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-aid-dark high-contrast:bg-black text-aid-light high-contrast:text-white flex flex-col transition-colors duration-300">
      <Header onShowProfile={handleShowProfile} />
      <main className="flex-grow flex items-center justify-center px-4 py-8">
        {renderContent()}
      </main>
      {isVoiceAssistantOpen && <VoiceAssistant isOpen={isVoiceAssistantOpen} onClose={() => setIsVoiceAssistantOpen(false)} onSubmit={handleAlertSubmit} />}
    </div>
  );
};

const App: React.FC = () => {
  const auth = useAuth();

  return (
     <AccessibilityProvider>
      <AppProvider user={auth.user} logout={auth.logout} addAlertToHistory={auth.addAlertToHistory}>
        {!auth.user ? <LoginPage onLogin={auth} /> : <MainApp />}
      </AppProvider>
    </AccessibilityProvider>
  );
};

export default App;