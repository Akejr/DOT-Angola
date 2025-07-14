import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { initializeAutoSEO } from './lib/autoSEOUpdater'

createRoot(document.getElementById("root")!).render(<App />);

// Sistema de SEO automático disponível
// Para habilitar logs: enableSEOLogs()
// Para inicializar: initializeAutoSEO()
if (import.meta.env.DEV) {
  console.info('💡 Sistema SEO disponível. Para ativar logs digite: enableSEOLogs()');
}
