import { CheckCircle } from 'lucide-react';
import { useSocialProof } from '@/hooks/useSocialProof';

const SocialProofNotification = () => {
  const { currentNotification, isVisible, maskCustomerName } = useSocialProof();

  if (!currentNotification || !isVisible) return null;

  // Pegar apenas o primeiro nome e mascarar
  const getFirstName = (fullName: string): string => {
    if (!fullName || fullName.length < 3) return fullName;
    
    const firstName = fullName.trim().split(' ')[0];
    if (firstName.length <= 3) {
      return firstName;
    }
    return firstName.slice(0, Math.min(4, firstName.length)) + '***';
  };

  const maskedName = getFirstName(currentNotification.customer_name);
  
  // Extrair nome do produto
  const getProductName = () => {
    console.log('Dados completos da notificação:', currentNotification);
    
    if (currentNotification.items && currentNotification.items.length > 0) {
      const firstItem = currentNotification.items[0];
      
      console.log('Primeiro item dos dados:', firstItem);
      
      let productName = '';
      
      // Tentar diferentes formas de acessar o nome
      if (typeof firstItem === 'string') {
        productName = firstItem;
      } else if (firstItem && typeof firstItem === 'object') {
        productName = firstItem.product_name || firstItem.name || firstItem.title || '';
      }
      
      console.log('Nome do produto extraído:', productName);
      
      // Se temos um nome válido, processá-lo
      if (productName && productName.trim()) {
        // Lista de produtos conhecidos para manter
        const knownProducts = [
          'netflix', 'spotify', 'steam', 'playstation', 'xbox', 'nintendo',
          'amazon', 'google play', 'apple', 'itunes', 'youtube', 'disney',
          'hulu', 'twitch', 'roblox', 'fortnite', 'minecraft', 'valorant',
          'visa', 'mastercard', 'paypal', 'pubg', 'free fire'
        ];
        
        // Procurar por produtos conhecidos no nome
        const lowerName = productName.toLowerCase();
        for (const product of knownProducts) {
          if (lowerName.includes(product)) {
            return product.charAt(0).toUpperCase() + product.slice(1);
          }
        }
        
        // Limpar palavras comuns mas manter o nome principal
        let cleanName = productName
          .replace(/gift\s*card/gi, '')
          .replace(/cartão/gi, '')
          .replace(/virtual/gi, '')
          .replace(/presente/gi, '')
          .replace(/gift/gi, '')
          .replace(/card/gi, '')
          .replace(/-/g, ' ')
          .trim();
        
        // Se ainda tem um nome válido após limpeza
        if (cleanName && cleanName.length > 2) {
          // Capitalizar primeira letra de cada palavra
          return cleanName.split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
        }
        
        // Se só sobrou pouco conteúdo, usar o nome original mas melhorado
        if (productName.length > 5) {
          return productName.split(' ')[0].charAt(0).toUpperCase() + 
                 productName.split(' ')[0].slice(1).toLowerCase();
        }
      }
    }
    
    // Fallback: produtos populares no mercado angolano
    const popularProducts = ['Netflix', 'Spotify', 'Steam', 'PlayStation', 'Amazon', 'iTunes'];
    return popularProducts[Math.floor(Math.random() * popularProducts.length)];
  };

  const productName = getProductName();

  return (
    <div 
      className={`fixed z-[99999] transition-all duration-500 ease-out transform ${
        isVisible ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0'
      }`}
      style={{ 
        position: 'fixed',
        top: 'calc(64px + 8px)', // Header height + margem
        // Alinhamento com o final do ícone do carrinho:
        // px-6 (24px padding) + botão do carrinho fica no final
        right: '24px', // Mesmo padding do header
        zIndex: 99999
      }}
    >
      <div className="bg-white shadow-xl border border-gray-300 text-gray-800 rounded-lg min-w-[200px] max-w-[300px] overflow-hidden">
        <div className="px-3 py-2 flex items-center space-x-2">
          {/* Ícone */}
          <div className="flex-shrink-0">
            <CheckCircle className="w-4 h-4 text-green-500" />
          </div>

          {/* Conteúdo */}
          <div className="flex-1 min-w-0">
            <span className="text-sm text-gray-700 leading-tight">
              <span className="font-semibold text-gray-900">{maskedName}</span> comprou{' '}
              <span className="font-medium text-blue-600">{productName}</span>
            </span>
          </div>
        </div>

        {/* Barra de progresso */}
        <div className="h-0.5 bg-blue-500/30 relative overflow-hidden">
          <div 
            className="h-full bg-blue-500 transition-all duration-[4000ms] ease-linear"
            style={{ 
              width: isVisible ? '0%' : '100%',
              transitionDelay: isVisible ? '0ms' : '0ms'
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default SocialProofNotification; 