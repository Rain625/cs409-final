import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// Handle GitHub Pages redirect for client-side routing
if (sessionStorage.redirect) {
  const redirectPath = sessionStorage.redirect;
  delete sessionStorage.redirect;
  window.history.replaceState(null, '', redirectPath);
}

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(<App />);
