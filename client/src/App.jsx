import { useState } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import LoadingScreen from './components/LoadingScreen/LoadingScreen';
import SuggestionForm from './components/SuggestionForm/SuggestionForm';
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
        <SuggestionForm />
      )}
    </Router>
  );
}

export default App;
