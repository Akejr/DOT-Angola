import { ReactNode, useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { LogOut, User, Home, ArrowLeft } from 'lucide-react';
import { clearAdminSession } from '@/lib/analytics';

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Limpa a sessão quando entra no admin
  useEffect(() => {
    clearAdminSession();
  }, []);

  const handleLogout = () => {
    // Aqui você implementaria a lógica de logout
    // Por exemplo: supabase.auth.signOut()
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center text-gray-700 hover:text-blue-600 transition-colors">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <User className="h-5 w-5 text-gray-400" />
                <span>Administrador</span>
              </div>
              <button 
                onClick={handleLogout}
                className="ml-4 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 flex items-center"
              >
                <LogOut className="h-4 w-4 mr-2" />
                <span>Sair</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 py-6">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500">
              &copy; 2025 DOT Angola
            </div>
            <div className="text-sm text-gray-500">
              Painel de Administração
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
} 