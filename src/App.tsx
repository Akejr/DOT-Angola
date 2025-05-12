import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { CartProvider } from '@/contexts/CartContext';
import { SearchProvider } from '@/contexts/SearchContext';
import Index from "./pages/Index";
import GiftCardDetailPage from "./pages/GiftCardDetailPage";
import VisaVirtualPage from "./pages/VisaVirtualPage";
import ImportacaoProdutosPage from "./pages/ImportacaoProdutosPage";
import OutrosServicosPage from "./pages/OutrosServicosPage";
import MaisVendidosPage from "./pages/MaisVendidosPage";
import AdminLogin from '@/pages/admin/login';
import NotFound from "./pages/NotFound";
import AdminRoutes from './routes/admin';
import ProtectedRoute from './components/admin/ProtectedRoute';
import AdminLayout from '@/components/admin/AdminLayout';
import { Analytics } from '@/components/Analytics';
import { HelmetProvider } from 'react-helmet-async';
import SEO from '@/components/SEO';

const queryClient = new QueryClient();

export default function App() {
  return (
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
                  <Analytics />
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/gift-card/:id" element={<GiftCardDetailPage />} />
                    <Route path="/visa-virtual" element={<VisaVirtualPage />} />
                    <Route path="/importacao" element={<ImportacaoProdutosPage />} />
                    <Route path="/outros-servicos" element={<OutrosServicosPage />} />
                    <Route path="/mais-vendidos" element={<MaisVendidosPage />} />
                    <Route path="/admin/login" element={<AdminLogin />} />
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
                </SearchProvider>
              </CartProvider>
            </AuthProvider>
          </Router>
        </TooltipProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
}
