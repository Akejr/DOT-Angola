import { useAnalytics } from '@/hooks/useAnalytics';
import { useLocation } from 'react-router-dom';

// Função auxiliar para verificar se é uma página admin
function isAdminPage(path: string): boolean {
  return path.startsWith('/admin') || path.includes('admin');
}

export function Analytics() {
  const location = useLocation();
  const path = location.pathname;
  
  // Somente usar analytics em páginas que não são admin
  if (!isAdminPage(path)) {
    useAnalytics();
  }
  
  return null;
} 