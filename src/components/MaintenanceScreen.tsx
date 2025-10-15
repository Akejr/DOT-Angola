import React, { useEffect, useState } from 'react';
import { AlertTriangle, Wrench, Clock } from 'lucide-react';

interface MaintenanceScreenProps {
  message?: string;
}

const MaintenanceScreen: React.FC<MaintenanceScreenProps> = ({ 
  message = 'Estamos realizando manutenção no site. Por favor, volte em breve.'
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Efeito de fade-in ao carregar
    setIsVisible(true);
    
    // Efeito de progresso simulado
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 1;
      });
    }, 150);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`min-h-screen bg-gradient-to-br from-blue-50 via-gray-50 to-amber-50 flex flex-col items-center justify-center p-4 transition-opacity duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      <div className="max-w-md w-full bg-white/90 backdrop-blur-md rounded-xl shadow-xl p-8 text-center transform transition-all duration-700 hover:scale-[1.02] border border-gray-100">
        <div className="flex justify-center mb-6">
          <div className="h-24 w-24 rounded-full bg-amber-100 flex items-center justify-center shadow-inner animate-pulse">
            <div className="absolute animate-spin-slow">
              <Wrench className="h-10 w-10 text-amber-500" />
            </div>
            <AlertTriangle className="h-12 w-12 text-amber-600 animate-bounce-slow" />
          </div>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-800 mb-4 animate-fade-in">Site em Manutenção</h1>
        
        <p className="text-gray-600 mb-6 animate-slide-up">{message}</p>
        
        {/* Barra de progresso */}
        <div className="w-full bg-gray-200 rounded-full h-2.5 mb-6 overflow-hidden">
          <div 
            className="bg-gradient-to-r from-amber-400 to-amber-600 h-2.5 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        
        <div className="flex items-center justify-center mb-4 text-amber-600 animate-pulse">
          <Clock className="h-5 w-5 mr-2" />
          <span className="text-sm">Voltaremos em breve</span>
        </div>
        
        <div className="flex justify-center mt-4 transform transition hover:scale-105">
          <img 
            src="/images/sczs.png" 
            alt="DOT Angola Logo" 
            className="h-14 w-auto opacity-70 hover:opacity-100 transition-opacity"
          />
        </div>
      </div>
      
      <div className="mt-8 text-sm text-gray-500 animate-fade-in-delayed">
        &copy; 2025 DOT Angola. Todos os direitos reservados.
      </div>
    </div>
  );
};

export default MaintenanceScreen;