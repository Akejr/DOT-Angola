import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Navigation from '../components/Navigation';

const OutrosServicosPage: React.FC = () => {
  const navigate = useNavigate();

  const handlePageChange = (id: number) => {
    // Simplificada - a navegação já é gerenciada pelo componente Navigation
    console.log("Mudando para página:", id);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-0 sm:p-4">
      <div className="max-w-6xl w-full bg-white rounded-none sm:rounded-3xl shadow-xl overflow-hidden flex flex-col min-h-screen sm:min-h-[calc(100vh-2rem)]">
        <Header />
        <Navigation onPageChange={handlePageChange} />
        
        {/* Hero section com altura flexível */}
        <div className="flex-grow flex flex-col justify-between">
          <div className="py-16 px-4 flex flex-col items-center justify-center text-center">
            <div className="mb-8">
              <div className="w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                <svg 
                  className="w-12 h-12 text-purple-600" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M13 10V3L4 14h7v7l9-11h-7z" 
                  />
                </svg>
              </div>
            </div>
            
            <h1 className="text-3xl font-bold text-gray-800 mb-4">
              Novos Serviços Chegando
            </h1>
            
            <p className="text-gray-600 text-lg max-w-xl mb-8">
              Estamos desenvolvendo uma variedade de novos serviços inovadores para atender às suas necessidades. Fique ligado para muitas novidades em breve!
            </p>

            <div className="flex items-center justify-center space-x-1">
              <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
          
          <footer className="bg-gray-50 p-4 border-t">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="flex items-center gap-2 mb-4 md:mb-0">
                <img 
                  src="/images/sczs.png" 
                  alt="Logo" 
                  width={32} 
                  height={32}
                  className="h-8 w-auto"
                />
              </div>
              
              <div className="flex flex-wrap justify-center gap-6">
                <a href="#" className="text-sm text-gray-500 hover:text-blue-600 transition-colors duration-300">Sobre Nós</a>
                <a href="#" className="text-sm text-gray-500 hover:text-blue-600 transition-colors duration-300">Termos e Condições</a>
                <a href="#" className="text-sm text-gray-500 hover:text-blue-600 transition-colors duration-300">Política de Privacidade</a>
                <a href="#" className="text-sm text-gray-500 hover:text-blue-600 transition-colors duration-300">Contato</a>
              </div>
              
              <div className="mt-4 md:mt-0">
                <p className="text-sm text-gray-500">© 2025. Todos os direitos reservados.</p>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default OutrosServicosPage; 