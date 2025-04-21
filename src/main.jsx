import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// Import only the merged CSS file
import './index.css'
// Remove the style.css import since we've merged everything
// import './style.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)