import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'jotai';
import App from './App';
import './styles/index.scss';

// Vision type and utility functions for theme switching
type Vision = 'corporate' | 'casual';

const applyVision = (vision: Vision) => {
  document.documentElement.setAttribute('data-vision', vision);
  localStorage.setItem('app-vision', vision); // Persist preference
};

const loadVision = () => {
  const storedVision = localStorage.getItem('app-vision') as Vision | null;
  if (storedVision) {
    applyVision(storedVision);
  } else {
    applyVision('corporate'); // Default vision
  }
};

// Load vision early in application setup
loadVision();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider>
      <App />
    </Provider>
  </React.StrictMode>
);
