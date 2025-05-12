import { Route, Routes } from "react-router-dom";
import GiftCardManager from "@/components/admin/GiftCardManager";
import ExchangeRateManager from "@/components/admin/ExchangeRateManager";
import CategoryManager from "@/components/admin/CategoryManager";
import Dashboard from "@/components/admin/Dashboard";
import NotificationManager from "@/components/admin/NotificationManager";
import SettingsManager from "@/components/admin/SettingsManager";
import NotFound from "@/pages/NotFound";
import VisaVirtualConfig from '@/components/admin/VisaVirtualConfig';
import PromotionsPage from '@/pages/admin/PromotionsPage';
import ImportRequestsPage from '@/pages/admin/ImportRequestsPage';
import SalesManager from '@/components/admin/SalesManager';
import InvoicePdfPage from '@/pages/admin/InvoicePdfPage';

export default function AdminRoutes() {
  return (
    <Routes>
      <Route index element={<Dashboard />} />
      <Route path="gift-cards" element={<GiftCardManager />} />
      <Route path="categories" element={<CategoryManager />} />
      <Route path="promotions" element={<PromotionsPage />} />
      <Route path="sales" element={<SalesManager />} />
      <Route path="exchange-rates" element={<ExchangeRateManager />} />
      <Route path="notifications" element={<NotificationManager />} />
      <Route path="settings" element={<SettingsManager />} />
      <Route path="visa-virtual" element={<VisaVirtualConfig />} />
      <Route path="import-requests" element={<ImportRequestsPage />} />
      <Route path="invoice-pdf" element={<InvoicePdfPage />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
} 