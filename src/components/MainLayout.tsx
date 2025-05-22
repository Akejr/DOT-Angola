import React, { ReactNode } from 'react';
import Header from './Header';
import Navigation from './Navigation';
import { SEO } from './SEO';

// Definindo a interface SEOProps igual à do componente SEO
interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  type?: string;
}

interface MainLayoutProps {
  children: ReactNode;
  seoProps?: SEOProps;
  onPageChange?: (id: number) => void;
}

const MainLayout: React.FC<MainLayoutProps> = ({ 
  children, 
  seoProps,
  onPageChange = () => {} 
}) => {
  return (
    <>
      {seoProps && <SEO {...seoProps} />}
      
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-0 sm:p-4">
        <div className="max-w-6xl w-full bg-white rounded-none sm:rounded-3xl shadow-xl overflow-hidden">
          <Header />
          <Navigation onPageChange={onPageChange} />
          
          <div className="page-content">
            {children}
          </div>
          
          <footer className="bg-gray-50 p-6 border-t">
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
    </>
  );
};

export default MainLayout; 