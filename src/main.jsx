import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './style.css' // 🔥 Add this line to load your custom styles
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
