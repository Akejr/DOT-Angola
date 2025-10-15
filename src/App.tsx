import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { CartProvider } from '@/contexts/CartContext';
import { SearchProvider } from '@/contexts/SearchContext';
import { MaintenanceProvider, useMaintenanceStatus } from '@/contexts/MaintenanceContext';
import MaintenanceScreen from '@/components/MaintenanceScreen';
import Index from "./pages/Index";
import GiftCardDetailPage from "./pages/GiftCardDetailPage";
import CheckoutPage from "./pages/CheckoutPage";
import CheckoutCartPage from "./pages/CheckoutCartPage";
import VisaVirtualPage from "./pages/VisaVirtualPage";
import ImportacaoProdutosPage from "./pages/ImportacaoProdutosPage";
import CategoryPage from "./pages/CategoryPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import PhysicalProductDetailPage from "./pages/PhysicalProductDetailPage";
import ImportThankYouPage from "./pages/ImportThankYouPage";
import OutrosServicosPage from "./pages/OutrosServicosPage";
import MaisVendidosPage from "./pages/MaisVendidosPage";
import SobreNosPage from "./pages/SobreNosPage";
import TermosPage from "./pages/TermosPage";
import PrivacidadePage from "./pages/PrivacidadePage";
import ContatoPage from "./pages/ContatoPage";
import AdminLogin from '@/pages/admin/login';
import TesteLogin from '@/pages/admin/teste-login';
import NotFound from "./pages/NotFound";
import AdminRoutes from './routes/admin';
import ProtectedRoute from './components/admin/ProtectedRoute';
import AdminLayout from '@/components/admin/AdminLayout';
import { Analytics } from '@/components/Analytics';
import { GoogleAnalytics } from '@/components/GoogleAnalytics';
import { HelmetProvider } from 'react-helmet-async';
import SEO from '@/components/SEO';
import ErrorBoundary from '@/components/ErrorBoundary';
import GlobalSocialProof from '@/components/GlobalSocialProof';
import { trackPageViewAutomatic } from '@/lib/analytics-tracker';
import { useEffect } from 'react';

const queryClient = new QueryClient();

// Componente para verificar o estado de manutenção
function MaintenanceCheck({ children }: { children: React.ReactNode }) {
  const { isInMaintenance, maintenanceMessage } = useMaintenanceStatus();
  const location = useLocation();
  
  // Não mostrar tela de manutenção para rotas de admin
  const isAdminRoute = location.pathname.startsWith('/admin');
  
  if (isInMaintenance && !isAdminRoute) {
    return <MaintenanceScreen message={maintenanceMessage} />;
  }
  
  return <>{children}</>;
}

export default function App() {
  useEffect(() => {
    // Inicializar rastreamento automático de páginas
    trackPageViewAutomatic();
  }, []);

  return (
    <ErrorBoundary>
      <HelmetProvider>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <Router>
              <SEO />
              <AuthProvider>
                <CartProvider>
                  <SearchProvider>
                    <MaintenanceProvider>
                      <Analytics />
                      <GoogleAnalytics />
                      <MaintenanceCheck>
                        <Routes>
                          <Route path="/" element={<Index />} />
                          <Route path="/gift-card/:id" element={<GiftCardDetailPage />} />
                          <Route path="/checkout/:id" element={<CheckoutPage />} />
                          <Route path="/checkout-cart" element={<CheckoutCartPage />} />
                          <Route path="/visa-virtual" element={<VisaVirtualPage />} />
                          <Route path="/importacao" element={<ImportacaoProdutosPage />} />
                          <Route path="/importacao/categoria/:categorySlug" element={<CategoryPage />} />
                          <Route path="/importacao/obrigado" element={<ImportThankYouPage />} />
                          <Route path="/produto/:id" element={<ProductDetailPage />} />
                          <Route path="/transferencias" element={<OutrosServicosPage />} />
                          <Route path="/outros-servicos" element={<OutrosServicosPage />} />
                          <Route path="/mais-vendidos" element={<MaisVendidosPage />} />
                          <Route path="/sobre-nos" element={<SobreNosPage />} />
                          <Route path="/termos" element={<TermosPage />} />
                          <Route path="/privacidade" element={<PrivacidadePage />} />
                          <Route path="/contato" element={<ContatoPage />} />
                          <Route path="/admin/login" element={<AdminLogin />} />
                          <Route path="/admin/teste-login" element={<TesteLogin />} />
                          <Route
                            path="/admin/*"
                            element={
                              <ProtectedRoute>
                                <AdminLayout>
                                  <AdminRoutes />
                                </AdminLayout>
                              </ProtectedRoute>
                            }
                          />
                          <Route path="*" element={<NotFound />} />
                        </Routes>
                      </MaintenanceCheck>
                      
                      {/* Notificação Social Global - aparece em todas as páginas exceto admin */}
                      <GlobalSocialProof />
                    </MaintenanceProvider>
                  </SearchProvider>
                </CartProvider>
              </AuthProvider>
            </Router>
          </TooltipProvider>
        </QueryClientProvider>
      </HelmetProvider>
    </ErrorBoundary>
  );
}
