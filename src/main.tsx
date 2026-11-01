import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { STORAGE_KEY, TEMPLATES_STORAGE_KEY } from './constants'
import { initCdn } from './lib/cdn'
import { hydratePersistedImages } from './lib/persist'

initCdn()

void hydratePersistedImages([STORAGE_KEY, TEMPLATES_STORAGE_KEY]).then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
})
