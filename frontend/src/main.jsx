import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
<<<<<<< HEAD

// Register Service Worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/service-worker.js')
      .then(registration => {
        console.log('SW Registered with scope:', registration.scope);
      })
      .catch(error => {
        console.log('SW Registration failed:', error);
      });
  });
}
=======
>>>>>>> b9f92a9bcdcc037a3ddfaa8e3442089792c02471
