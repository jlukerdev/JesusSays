import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/themes/theme-classic.css'
import './styles/base.css'
import './styles/modern-nav.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
)
