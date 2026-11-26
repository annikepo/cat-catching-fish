import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '../styles/normalize.css' 
import '../styles/variables.css'
import '../styles/base.css'
import '../styles/game.css'
import '../styles/login.css'
//import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
