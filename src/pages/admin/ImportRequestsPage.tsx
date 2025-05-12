import { SEO } from '@/components/SEO';
import ImportRequestsManager from '@/components/admin/ImportRequestsManager';

export default function ImportRequestsPage() {
  return (
    <>
      <SEO 
        title="Pedidos de Importação | Painel Administrativo"
        description="Gerencie todos os pedidos de importação de produtos recebidos pela DOT ANGOLA."
      />
      
      <ImportRequestsManager />
    </>
  );
} 