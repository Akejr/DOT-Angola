import { ReactNode, useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Home, 
  Tag, 
  DollarSign, 
  Settings, 
  User, 
  Menu, 
  X, 
  ShoppingBag, 
  Bell, 
  LogOut, 
  Search,
  CreditCard,
  ChevronRight,
  Percent,
  Package,
  Receipt,
  ShoppingCart,
  Smartphone,
  Download
} from 'lucide-react';
import { FixSlugsButton } from './FixSlugsButton';
import { useAuth } from '@/contexts/AuthContext';
import { usePWA, salesNotificationManager } from '@/lib/pwa';

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pwaInfo, setPwaInfo] = useState<any>(null);
  const [notificationStatus, setNotificationStatus] = useState<string>('');
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { requestPermission, showInstallPrompt, getPWAInfo, showNotification } = usePWA();
  
  useEffect(() => {
    // Verificar status da PWA
    const info = getPWAInfo();
    setPwaInfo(info);
  }, []);

  const handleLogout = async () => {
    await signOut();
    navigate('/admin/login');
  };

  const handleNotificationSetup = async () => {
    try {
      setNotificationStatus('Configurando...');
      const result = await requestPermission();
      
      if (result.permission === 'granted') {
        setNotificationStatus('✅ Notificações ativadas!');
        
        // Mostrar notificação de teste
        await showNotification({
          title: '🎉 Notificações Ativadas!',
          body: 'Você receberá notificações de vendas e relatórios diários às 20:00',
          requireInteraction: true
        });
        
        setTimeout(() => setNotificationStatus(''), 3000);
      } else if (result.permission === 'unsupported') {
        setNotificationStatus('⚠️ Não suportado neste navegador');
        setTimeout(() => setNotificationStatus(''), 5000);
      } else {
        setNotificationStatus('❌ Permissão negada');
        setTimeout(() => setNotificationStatus(''), 3000);
      }
    } catch (error) {
      setNotificationStatus('❌ Erro ao configurar');
      setTimeout(() => setNotificationStatus(''), 3000);
    }
  };

  const handleInstallPWA = async () => {
    const installed = await showInstallPrompt();
    if (installed) {
      const info = getPWAInfo();
      setPwaInfo(info);
    }
  };

  const testNotification = async () => {
    await salesNotificationManager.testSaleNotification();
  };

  const menuItems = [
    { icon: Home, label: 'Dashboard', path: '/admin' },
    { icon: ShoppingBag, label: 'Gift Cards', path: '/admin/gift-cards' },
    { icon: Tag, label: 'Categorias', path: '/admin/categories' },
    { icon: Percent, label: 'Promoções', path: '/admin/promotions' },
    { icon: Receipt, label: 'Vendas', path: '/admin/sales' },
    { icon: ShoppingCart, label: 'Compras Efetuadas', path: '/admin/orders' },
    { icon: DollarSign, label: 'Taxas de Câmbio', path: '/admin/exchange-rates' },
    { icon: CreditCard, label: 'Visa Virtual', path: '/admin/visa-virtual' },
    { icon: Package, label: 'Pedidos de Importação', path: '/admin/import-requests' },
    { icon: Bell, label: 'Notificações', path: '/admin/notifications' },
    { icon: Settings, label: 'Configurações', path: '/admin/settings' },
  ];
  
  const isActive = (path: string) => {
    return location.pathname === path || 
           (path !== '/admin' && location.pathname.startsWith(path));
  };
  
  const getPageTitle = () => {
    const activeItem = menuItems.find(item => isActive(item.path));
    return activeItem ? activeItem.label : 'Painel Admin';
  };
  
  return (
    <div className="min-h-screen bg-[#F8F9FC] flex">
      {/* Sidebar para Mobile */}
      <div className={`fixed inset-0 z-50 md:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div 
          className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
        
        <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-2xl">
          <div className="h-16 flex items-center gap-3 px-6 border-b">
            <button onClick={() => setSidebarOpen(false)} className="p-1.5 rounded-lg hover:bg-gray-100">
              <X className="h-5 w-5 text-gray-500" />
            </button>
            <Link to="/" className="flex items-center gap-2">
              <img className="h-8 w-auto" src="/images/sczs.png" alt="Logo" />
            </Link>
          </div>
          
          <nav className="p-4 space-y-1">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all
                  ${isActive(item.path)
                    ? 'bg-[#01042D] text-white shadow-lg shadow-[#01042D]/10'
                    : 'text-gray-600 hover:bg-gray-50'
                  }`}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
                <ChevronRight className={`ml-auto h-4 w-4 transition-transform
                  ${isActive(item.path) ? 'opacity-100' : 'opacity-0'}`}
                />
              </Link>
            ))}
          </nav>
          
          {/* Seção PWA Mobile */}
          <div className="p-4 border-t">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Smartphone className="h-4 w-4" />
                <span>PWA Status</span>
              </div>
              
              {!pwaInfo?.isInstalled && (
                <button
                  onClick={handleInstallPWA}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <Download className="h-4 w-4" />
                  Instalar App
                </button>
              )}
              
              <button
                onClick={handleNotificationSetup}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
              >
                <Bell className="h-4 w-4" />
                {pwaInfo?.notificationPermission === 'granted' ? 'Notificações Ativas' : 'Ativar Notificações'}
              </button>
              
              {process.env.NODE_ENV === 'development' && (
                <button
                  onClick={testNotification}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors"
                >
                  🧪 Teste Cross-Device
                </button>
              )}
              
              {notificationStatus && (
                <div className="p-2 text-xs text-center bg-gray-50 rounded-lg">
                  {notificationStatus}
                </div>
              )}
            </div>
          </div>
          
          {/* Perfil do Usuário Mobile */}
          <div className="p-4 border-t">
            <div className="flex items-center gap-3 px-4 py-2">
              <div className="h-9 w-9 rounded-full bg-[#01042D] text-white flex items-center justify-center">
                <User className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#01042D] truncate">Administrador</p>
                <p className="text-xs text-gray-500 truncate">admin@digiftcard.com</p>
              </div>
              <button 
                onClick={handleLogout}
                className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Sidebar para Desktop */}
      <div className="hidden md:flex w-64 flex-col bg-white border-r border-gray-100">
        <div className="h-16 flex items-center gap-3 px-6 border-b">
          <Link to="/" className="flex items-center gap-2">
            <img className="h-8 w-auto" src="/images/sczs.png" alt="Logo" />
          </Link>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all
                ${isActive(item.path)
                  ? 'bg-[#01042D] text-white shadow-lg shadow-[#01042D]/10'
                  : 'text-gray-600 hover:bg-gray-50'
                }`}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
              <ChevronRight className={`ml-auto h-4 w-4 transition-transform
                ${isActive(item.path) ? 'opacity-100' : 'opacity-0'}`}
              />
            </Link>
          ))}
        </nav>
        
        {/* Seção PWA */}
        <div className="p-4 border-t">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Smartphone className="h-4 w-4" />
              <span>PWA Status</span>
            </div>
            
            {!pwaInfo?.isInstalled && (
              <button
                onClick={handleInstallPWA}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <Download className="h-4 w-4" />
                Instalar App
              </button>
            )}
            
            <button
              onClick={handleNotificationSetup}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
            >
              <Bell className="h-4 w-4" />
              {pwaInfo?.notificationPermission === 'granted' ? 'Notificações Ativas' : 'Ativar Notificações'}
            </button>
            
            {process.env.NODE_ENV === 'development' && (
              <button
                onClick={testNotification}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors"
              >
                🧪 Teste Cross-Device
              </button>
            )}
            
            {notificationStatus && (
              <div className="p-2 text-xs text-center bg-gray-50 rounded-lg">
                {notificationStatus}
              </div>
            )}
          </div>
        </div>
        
        {/* Perfil do Usuário */}
        <div className="p-4 border-t">
          <div className="flex items-center gap-3 px-4 py-2">
            <div className="h-9 w-9 rounded-full bg-[#01042D] text-white flex items-center justify-center">
              <User className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[#01042D] truncate">Administrador</p>
              <p className="text-xs text-gray-500 truncate">admin@digiftcard.com</p>
            </div>
            <button 
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
      
      <div className="flex-1 flex flex-col">
        <header className="h-16 bg-white border-b border-gray-100 flex items-center gap-4 px-6">
          <button
            type="button"
            className="md:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </button>
          
          <div className="flex-1 flex justify-end items-center gap-4">
            <div className="relative max-w-xs w-full hidden md:block">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Pesquisar..."
                className="block w-full pl-10 pr-4 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#01042D] focus:border-transparent"
              />
            </div>
            
            <button className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 block h-2 w-2 rounded-full bg-red-500"></span>
            </button>
          </div>
          <div className="flex items-center gap-4">
            <FixSlugsButton />
            <button className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </header>
        
        <main className="flex-1 overflow-y-auto p-4 sm:p-8">
          <div className="max-w-7xl mx-auto">
            <div className="bg-white rounded-lg sm:rounded-2xl shadow-sm p-4 sm:p-6 mb-4 sm:mb-6">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
} 