import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            fontFamily: 'Lato, sans-serif',
            fontSize: '14px',
            background: '#FAF7F2',
            color: '#2C2C2C',
            border: '1px solid #E8A0BF',
            borderRadius: '12px',
            boxShadow: '0 4px 16px rgba(212,175,55,0.12)',
          },
          success: {
            iconTheme: { primary: '#D4AF37', secondary: '#FAF7F2' },
          },
          error: {
            iconTheme: { primary: '#ef4444', secondary: '#FAF7F2' },
          },
        }}
      />
    </BrowserRouter>
  </React.StrictMode>,
);
