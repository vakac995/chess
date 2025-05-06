import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'jotai';
import App from './App';
import './styles/index.scss';

type Vision = 'corporate' | 'casual';

const applyVision = (vision: Vision) => {
  document.documentElement.setAttribute('data-vision', vision);
  localStorage.setItem('app-vision', vision);
};

const loadVision = () => {
  const storedVision = localStorage.getItem('app-vision') as Vision | null;
  if (storedVision) {
    applyVision(storedVision);
  } else {
    applyVision('corporate');
  }
};

loadVision();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider>
      <App />
    </Provider>
  </React.StrictMode>
);
