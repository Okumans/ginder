import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'

// The Gleo map library (loaded from a CDN, see index.html) throws this
// specific error from inside its own ResizeObserver callback when the map
// canvas is measured during a brief zero-size layout moment -- a known,
// harmless timing race that isn't reachable from our own try/catch since
// it fires outside our call stack. The map recovers and renders correctly
// on the next resize; this just keeps it from spamming as an uncaught
// error. Anything else still surfaces normally.
window.addEventListener('error', (event) => {
  if (event.message === 'Map size is zero') {
    event.preventDefault();
  }
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
