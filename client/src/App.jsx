import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoadingScreen from './components/LoadingScreen/LoadingScreen';
import SuggestionForm from './components/SuggestionForm/SuggestionForm';
import AdminPanel from './components/AdminPanel/AdminPanel';
import './styles/global.scss';

// PWA Install Prompt Component
const InstallPrompt = ({ onClose }) => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Check if already installed or dismissed
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
    
    if (dismissed || isStandalone) {
      return;
    }

    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // For iOS - show custom prompt after delay
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    if (isIOS && !isStandalone) {
      setTimeout(() => setShowPrompt(true), 3000);
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowPrompt(false);
      }
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-install-dismissed', 'true');
  };

  if (!showPrompt) return null;

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

  return (
    <div className="pwa-install-prompt">
      <div className="pwa-install-content">
        <div className="pwa-install-icon">📱</div>
        <div className="pwa-install-text">
          <strong>Install SSG InnoVoice</strong>
          {isIOS ? (
            <p>Tap <span className="ios-share">⬆️</span> then "Add to Home Screen"</p>
          ) : (
            <p>Add to your home screen for quick access</p>
          )}
        </div>
        <div className="pwa-install-actions">
          {!isIOS && (
            <button className="pwa-install-btn" onClick={handleInstall}>
              Install
            </button>
          )}
          <button className="pwa-dismiss-btn" onClick={handleDismiss}>
            ✕
          </button>
        </div>
      </div>
    </div>
  );
};

function App() {
  const [isLoading, setIsLoading] = useState(true);

  const handleLoadComplete = () => {
    setIsLoading(false);
  };

  return (
    <Router>
      {isLoading ? (
        <LoadingScreen onLoadComplete={handleLoadComplete} />
      ) : (
        <>
          <InstallPrompt />
          <Routes>
            <Route path="/" element={<SuggestionForm />} />
            <Route path="/admin" element={<AdminPanel />} />
          </Routes>
        </>
      )}
    </Router>
  );
}

export default App;
