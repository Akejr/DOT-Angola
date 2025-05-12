'use client';

import { useState } from 'react';
import AdminLayout from '@/components/layouts/AdminLayout';
import Dashboard from '@/components/admin/Dashboard';
import NotificationManager from '@/components/admin/NotificationManager';
import SettingsManager from '@/components/admin/SettingsManager';
import GiftCardManager from '@/components/admin/GiftCardManager';
import { 
  LayoutDashboard, 
  Bell, 
  Gift, 
  Settings,
  ChevronRight
} from 'lucide-react';

type TabType = 'dashboard' | 'gift-cards' | 'notifications' | 'settings';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'gift-cards', label: 'Gift Cards', icon: Gift },
    { id: 'notifications', label: 'Notificações', icon: Bell },
    { id: 'settings', label: 'Configurações', icon: Settings },
  ];

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Painel de Administração</h1>
          <div className="flex items-center text-sm text-gray-500 mt-1">
            <span>Admin</span>
            <ChevronRight className="h-4 w-4 mx-1" />
            <span>{tabs.find(tab => tab.id === activeTab)?.label}</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm mb-6 overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                const Icon = tab.icon;
                
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as TabType)}
                    className={`
                      py-4 px-6 font-medium text-sm flex items-center
                      ${isActive 
                        ? 'border-b-2 border-blue-600 text-blue-600' 
                        : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                      transition-colors duration-200
                    `}
                  >
                    <Icon className={`h-5 w-5 mr-2 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        <div className="bg-gray-50 rounded-xl p-6">
          {activeTab === 'dashboard' && <Dashboard />}
          {activeTab === 'gift-cards' && <GiftCardManager />}
          {activeTab === 'notifications' && <NotificationManager />}
          {activeTab === 'settings' && <SettingsManager />}
        </div>
      </div>
    </AdminLayout>
  );
} 