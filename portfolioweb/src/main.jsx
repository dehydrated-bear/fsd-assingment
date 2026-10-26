import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import AppRouter from './AppRouter'
import SiteProvider from './data/SiteProvider'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <SiteProvider>
      <AppRouter />
    </SiteProvider>
  </StrictMode>,
)
