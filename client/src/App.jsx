import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoadingScreen from './components/LoadingScreen/LoadingScreen';
import SuggestionForm from './components/SuggestionForm/SuggestionForm';
import AdminPanel from './components/AdminPanel/AdminPanel';
import './styles/global.scss';

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
        <Routes>
          <Route path="/" element={<SuggestionForm />} />
          <Route path="/admin" element={<AdminPanel />} />
        </Routes>
      )}
    </Router>
  );
}

export default App;
