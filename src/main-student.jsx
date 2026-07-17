import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import StudentWidget from './StudentWidget.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <StudentWidget />
  </StrictMode>,
)
