import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { initializeAutoSEO } from './lib/autoSEOUpdater'

createRoot(document.getElementById("root")!).render(<App />);

// Inicializar sistema de SEO automático
initializeAutoSEO();
