import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import AdminWidget from './AdminWidget.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AdminWidget />
  </StrictMode>,
)
