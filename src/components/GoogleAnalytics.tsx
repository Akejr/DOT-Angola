import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
  }
}

const GA_TRACKING_ID = 'G-L8NPTHL7YH'; // ID do Google Analytics

export function GoogleAnalytics() {
  const location = useLocation();

  useEffect(() => {
    // Adiciona o script do Google Analytics
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`;
    document.head.appendChild(script);

    // Inicializa o Google Analytics
    window.gtag = function gtag() {
      // @ts-ignore
      window.dataLayer = window.dataLayer || [];
      // @ts-ignore
      window.dataLayer.push(arguments);
    };

    window.gtag('js', new Date());
    window.gtag('config', GA_TRACKING_ID);

    return () => {
      // Remove o script quando o componente for desmontado
      document.head.removeChild(script);
    };
  }, []);

  // Rastreia mudanças de página
  useEffect(() => {
    window.gtag('config', GA_TRACKING_ID, {
      page_path: location.pathname + location.search
    });
  }, [location]);

  return null;
} 