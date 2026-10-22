import React from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { StudentAuthProvider } from './context/StudentAuthContext';
import App from './App.jsx';

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'dummy-google-client-id';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={googleClientId}>
      <StudentAuthProvider>
        <App />
      </StudentAuthProvider>
    </GoogleOAuthProvider>
  </React.StrictMode>,
);
