import { useState, useEffect, ReactNode } from "react";
import { RefreshCw } from "lucide-react";

interface LoadingOptimizerProps {
  loading: boolean;
  initialDataLoaded: boolean;
  hasError: boolean;
  children: ReactNode;
  onRetry: () => void;
  loadingText?: string;
  errorText?: string;
  skeletonContent: ReactNode;
}

// Componente que implementa o padrão de carregamento otimizado para todas as páginas
export const LoadingOptimizer = ({
  loading,
  initialDataLoaded,
  hasError,
  children,
  onRetry,
  loadingText = "Carregando conteúdo...",
  errorText = "Não foi possível carregar os dados. Por favor, tente novamente.",
  skeletonContent
}: LoadingOptimizerProps) => {
  const [loadingTimeout, setLoadingTimeout] = useState(false);

  useEffect(() => {
    // Definir um timeout para mostrar uma mensagem de fallback se o carregamento demorar muito
    const timer = setTimeout(() => {
      if (loading && !initialDataLoaded) {
        setLoadingTimeout(true);
      }
    }, 5000);
    
    return () => clearTimeout(timer);
  }, [loading, initialDataLoaded]);

  // Reiniciar o timeout quando o carregamento for iniciado novamente
  useEffect(() => {
    if (!loading) {
      setLoadingTimeout(false);
    }
  }, [loading]);

  if (loading && !initialDataLoaded) {
    return (
      <>
        {loadingTimeout ? (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-3">O carregamento está demorando mais que o esperado.</p>
            <button 
              onClick={onRetry}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm transition-colors flex items-center mx-auto"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Tentar novamente
            </button>
          </div>
        ) : (
          <div>
            <div className="flex justify-center items-center py-4">
              <div className="w-8 h-8 rounded-full border-3 border-gray-200 border-t-blue-600 animate-spin"></div>
            </div>
            <div className="text-center text-sm text-gray-500 mb-4">{loadingText}</div>
            <div className="overflow-hidden">
              {skeletonContent}
            </div>
          </div>
        )}
      </>
    );
  }

  if (hasError) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 mb-3">{errorText}</p>
        <button 
          onClick={onRetry}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm transition-colors flex items-center mx-auto"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Tentar novamente
        </button>
      </div>
    );
  }

  return <>{children}</>;
};

// Componente para renderizar esqueletos de cards para carregamento
export const CardSkeletons = ({ count = 6, columns = 2 }) => {
  // Garantir que count é sempre um número positivo
  const itemCount = Math.max(1, count);
  
  // Definir a classe de grid baseada no número de colunas
  const gridClass = `grid grid-cols-${columns} sm:grid-cols-${Math.min(columns + 1, 4)} md:grid-cols-${Math.min(columns + 2, 5)} gap-3 px-2 py-2`;
  
  return (
    <div className={gridClass}>
      {Array(itemCount).fill(0).map((_, index) => (
        <div key={`skeleton-${index}`} className="bg-gray-100 rounded-lg animate-pulse">
          <div className="w-full h-28 sm:h-32 rounded-lg bg-gray-200"></div>
          <div className="p-3">
            <div className="h-3 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Componente para renderizar esqueleto de detalhes do produto
export const ProductDetailSkeleton = () => {
  return (
    <div className="animate-pulse">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-1/2">
          <div className="bg-gray-200 rounded-lg h-64 md:h-96"></div>
        </div>
        <div className="w-full md:w-1/2">
          <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
          <div className="h-10 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 rounded w-full"></div>
            <div className="h-3 bg-gray-200 rounded w-full"></div>
            <div className="h-3 bg-gray-200 rounded w-3/4"></div>
          </div>
          <div className="mt-6">
            <div className="h-10 bg-gray-200 rounded w-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Função utilitária para atrasar a animação com base no índice e viewport
export const getAnimationDelay = (index: number) => {
  if (typeof window !== 'undefined' && window.innerWidth < 640) {
    // Em dispositivos móveis, usar delays menores para acelerar a aparência
    return `${Math.min(index * 20, 200)}ms`;
  }
  return `${Math.min(index * 50, 500)}ms`;
};

export default LoadingOptimizer; 