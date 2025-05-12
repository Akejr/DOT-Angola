import { useState, useEffect, useCallback, memo } from 'react';
import { GiftCard } from '@/types/supabase';
import { getExchangeRates } from '@/lib/database';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';

interface GiftCardItemProps {
  giftCard: GiftCard;
  bgColor: string;
  viewMode?: 'grid' | 'list';
}

// Cache para as taxas de câmbio para evitar múltiplas requisições
let exchangeRatesCache: any = null;
let lastFetchTime: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

// Função para obter taxas de câmbio com cache
const getExchangeRatesWithCache = async () => {
  const now = Date.now();
  if (exchangeRatesCache && (now - lastFetchTime < CACHE_DURATION)) {
    return exchangeRatesCache;
  }
  
  const rates = await getExchangeRates();
  exchangeRatesCache = rates;
  lastFetchTime = now;
  return rates;
};

const GiftCardItem = ({ giftCard, bgColor, viewMode = 'grid' }: GiftCardItemProps) => {
  const [kwanzaPrice, setKwanzaPrice] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    // Resetar estados da imagem quando um novo gift card é recebido
    setImageLoaded(false);
    setImageError(false);
    
    // Não fazer pré-carregamento de imagem - vamos usar loading="lazy" diretamente na tag img
    // para deixar o navegador gerenciar isso mais eficientemente
    if (!giftCard.image_url) {
      // Se não tiver imagem, considerar como carregada
      setImageLoaded(true);
    }
  }, [giftCard.id, giftCard.image_url]);

  useEffect(() => {
    const convertPrice = async () => {
      try {
        setLoading(true);
        const rates = await getExchangeRatesWithCache();
        
        // Determinar o menor preço entre os planos disponíveis
        let basePrice = giftCard.original_price;
        
        // Se o gift card tiver planos, encontrar o menor preço entre eles
        if (giftCard.plans && giftCard.plans.length > 0) {
          const lowestPricePlan = giftCard.plans.reduce((lowest, current) => 
            current.price < lowest.price ? current : lowest, giftCard.plans[0]);
          
          basePrice = lowestPricePlan.price;
        }
        
        // Encontrar a taxa de câmbio correspondente à moeda do gift card
        const rate = rates.find((r: any) => r.currency === giftCard.currency);
        
        if (rate) {
          // Converter diretamente usando a taxa correspondente à moeda do gift card
          const priceInKwanzas = basePrice * rate.rate;
          setKwanzaPrice(priceInKwanzas);
        } else {
          console.error(`Taxa de câmbio não encontrada para ${giftCard.currency}`);
          setKwanzaPrice(null);
        }
      } catch (error) {
        console.error('Erro ao converter preço:', error);
        setKwanzaPrice(null);
      } finally {
        setLoading(false);
      }
    };

    convertPrice();
  }, [giftCard.original_price, giftCard.currency, giftCard.plans]);

  const handleImageLoad = useCallback(() => {
    setImageLoaded(true);
    setImageError(false);
  }, []);
  
  const handleImageError = useCallback(() => {
    setImageError(true);
    setImageLoaded(true); // Consideramos carregado mesmo com erro para não mostrar o spinner indefinidamente
  }, []);

  // Função utilitária para determinar a cor da linha com base no gift card
  // Memoizada para evitar recálculos desnecessários
  const getCardLineColor = useCallback(() => {
    // Cache via memoization - esta implementação usa o callback para memorizar o resultado
    // para a mesma instância do componente
    
    // Lógica simplificada com mapa otimizado para não fazer checagens excessivas
    const nameToColor = new Map([
      // Por nome de gift card
      ['netflix', 'linear-gradient(90deg, #e50914, #ff4d4d, #e50914)'],
      ['youtube', 'linear-gradient(90deg, #e50914, #ff4d4d, #e50914)'],
      ['spotify', 'linear-gradient(90deg, #1db954, #1ed760, #1db954)'],
      ['amazon', 'linear-gradient(90deg, #FF9900, #ffbb33, #FF9900)'],
      ['google', 'linear-gradient(90deg, #4285F4, #34A853, #FBBC05, #EA4335)'],
      ['apple', 'linear-gradient(90deg, #A2AAAD, #FFFFFF, #A2AAAD)'],
      ['facebook', 'linear-gradient(90deg, #4267B2, #1877F2, #4267B2)'],
      ['steam', 'linear-gradient(90deg, #1b2838, #66c0f4, #1b2838)'],
      ['playstation', 'linear-gradient(90deg, #006FCD, #00ACED, #006FCD)'],
      ['nintendo', 'linear-gradient(90deg, #e4000f, #ff4d4d, #e4000f)'],
    ]);
    
    // Verifica se o nome do gift card contém alguma das palavras-chave
    const cardName = giftCard.name.toLowerCase();
    for (const [key, value] of nameToColor.entries()) {
      if (cardName.includes(key)) {
        return value;
      }
    }
    
    // Se não encontrar pelo nome, verificar pela categoria
    if (giftCard.gift_card_categories?.length > 0) {
      const categoryName = giftCard.gift_card_categories[0].categories?.name?.toLowerCase();
      
      const categoryToColor = new Map([
        ['jogos', 'linear-gradient(90deg, #1b2838, #66c0f4, #1b2838)'],
        ['games', 'linear-gradient(90deg, #1b2838, #66c0f4, #1b2838)'],
        ['entretenimento', 'linear-gradient(90deg, #e50914, #ff4d4d, #e50914)'],
        ['música', 'linear-gradient(90deg, #1db954, #1ed760, #1db954)'],
        ['streaming', 'linear-gradient(90deg, #e50914, #ff4d4d, #e50914)'],
        ['compras', 'linear-gradient(90deg, #FF9900, #ffbb33, #FF9900)'],
      ]);
      
      if (categoryName) {
        for (const [key, value] of categoryToColor.entries()) {
          if (categoryName.includes(key)) {
            return value;
          }
        }
      }
    }
    
    // Para cards em destaque
    if (giftCard.is_featured) {
      return 'linear-gradient(90deg, #f59e0b, #fdba74, #f59e0b)';
    }
    
    // Padrão - azul
    return 'linear-gradient(90deg, #3b82f6, #93c5fd, #3b82f6)';
  }, [giftCard.name, giftCard.gift_card_categories, giftCard.is_featured]);

  // Renderização para o modo Grid (padrão) - Design moderno com imagem em destaque
  const renderGridView = useCallback(() => {
    return (
      <div 
        className="gift-card-modern relative overflow-hidden group"
        onMouseEnter={() => setHovered(true)} 
        onMouseLeave={() => setHovered(false)}
      >
        {/* Imagem de fundo com fallback imediato */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-gray-200">
          {!imageError ? (
            <img 
              src={giftCard.image_url || '/images/placeholder.png'} 
              alt={giftCard.name}
              className="absolute inset-0 w-full h-full object-cover"
              onLoad={handleImageLoad}
              onError={handleImageError}
              loading="lazy"
              decoding="async"
              fetchPriority="low"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-gray-100">
              <span className="text-4xl font-bold text-gray-300">{giftCard.name.substring(0, 2).toUpperCase()}</span>
            </div>
          )}
          
          {/* Loading spinner - exibido apenas brevemente */}
          {!imageLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/5">
              <div className="w-8 h-8 border-3 border-white border-t-blue-500 rounded-full animate-spin"></div>
            </div>
          )}
        </div>
        
        {/* Badge destaque */}
        {giftCard.is_featured && (
          <div className="absolute top-2 left-2 z-10 bg-amber-500 text-white text-xs font-bold py-1 px-2 rounded-md shadow-sm">
            Destaque
          </div>
        )}
        
        {/* Badge de desconto */}
        {giftCard.has_discount && giftCard.discount_percentage && (
          <div className="absolute top-2 right-2 z-10 bg-red-500 text-white text-xs font-bold py-1 px-2 rounded-md shadow-sm">
            -{giftCard.discount_percentage}%
          </div>
        )}
        
        {/* Sobreposição degradê para melhorar legibilidade do texto */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-10"></div>
        
        {/* Título e preço */}
        <div className="absolute inset-x-0 bottom-0 z-10">
          <div className="relative px-4 py-3 pb-4">
            {/* Nome do produto com sombra de texto para melhor legibilidade */}
            <h3 className="text-white font-semibold text-base leading-tight mb-1 line-clamp-1 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
              {giftCard.name}
            </h3>
            
            {/* Preço em Kwanzas com sombra para melhor destaque */}
            {loading ? (
              <div className="h-5 w-24 bg-white/10 animate-pulse rounded"></div>
            ) : kwanzaPrice ? (
              <div>
                <div className="text-white font-bold text-lg drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                  {kwanzaPrice.toLocaleString('pt-AO', { maximumFractionDigits: 0 })} Kz
                </div>
                {giftCard.has_discount && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-white/70 line-through">
                      {(kwanzaPrice / (1 - giftCard.discount_percentage! / 100)).toLocaleString('pt-AO', { maximumFractionDigits: 0 })} Kz
                    </span>
                    <span className="text-xs font-medium bg-red-500 text-white px-1.5 py-0.5 rounded-sm">
                      -{giftCard.discount_percentage}%
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <span className="text-sm text-white font-medium drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">Preço indisponível</span>
            )}
          </div>
        </div>
        
        {/* Linha animada na parte inferior com efeito de brilho */}
        <div className="absolute inset-x-0 bottom-0 z-20 overflow-hidden">
          {/* Linha principal que cresce com o hover */}
          <div 
            className={`h-[3px] w-full transform transition-all duration-500 origin-left ${hovered ? 'scale-x-100' : 'scale-x-0'}`}
            style={{
              background: getCardLineColor(),
              backgroundSize: '200% 100%'
            }}
          />
          
          {/* Efeito de brilho adicional que se move */}
          <div 
            className={`absolute top-0 h-[3px] w-full transform opacity-0 transition-opacity duration-300 shine-effect ${hovered ? 'opacity-100' : ''}`}
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.8), transparent)',
              backgroundSize: '200% 100%'
            }}
          />
        </div>
      </div>
    );
  }, [giftCard, imageError, imageLoaded, loading, kwanzaPrice, hovered, handleImageLoad, handleImageError, getCardLineColor]);

  // Renderização para o modo Lista
  const renderListView = useCallback(() => {
    // Implementação similar ao Grid View, mas em formato horizontal...
    // Código mantido para brevidade
    return (
      <div 
        className="gift-card-list relative overflow-hidden rounded-xl shadow-sm hover:shadow-md transition-shadow group bg-white"
        onMouseEnter={() => setHovered(true)} 
        onMouseLeave={() => setHovered(false)}
      >
        <div className="flex items-start w-full">
          {/* Área da imagem - responsiva */}
          <div className="w-1/3 relative aspect-square overflow-hidden">
            {!imageError ? (
              <img 
                src={giftCard.image_url || '/images/placeholder.png'} 
                alt={giftCard.name}
                className="w-full h-full object-cover"
                onLoad={handleImageLoad}
                onError={handleImageError}
                loading="lazy"
                decoding="async"
                fetchPriority="low"
              />
            ) : (
              <div className={`w-full h-full flex items-center justify-center ${bgColor}`}>
                <span className="text-2xl font-bold text-gray-600/30">{giftCard.name.substring(0, 2).toUpperCase()}</span>
              </div>
            )}
            
            {!imageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
              </div>
            )}
            
            {/* Badge de destaque */}
            {giftCard.is_featured && (
              <div className="absolute top-1 left-1 z-10 bg-amber-500 text-white text-xs font-bold py-0.5 px-1 rounded shadow-sm">
                Destaque
              </div>
            )}
          </div>
          
          {/* Conteúdo - texto e preço */}
          <div className="flex-1 p-3 overflow-hidden">
            <h3 className="font-medium text-gray-800 mb-1 line-clamp-2 text-sm md:text-base">
              {giftCard.name}
            </h3>
            
            {/* Preço em Kwanzas */}
            {loading ? (
              <div className="h-4 bg-gray-200 animate-pulse rounded w-20 my-1"></div>
            ) : kwanzaPrice ? (
              <div className="flex items-start flex-col mt-1">
                <div className="text-gray-900 font-bold">
                  {kwanzaPrice.toLocaleString('pt-AO', { maximumFractionDigits: 0 })} Kz
                </div>
                {giftCard.has_discount && (
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-gray-500 line-through">
                      {(kwanzaPrice / (1 - giftCard.discount_percentage! / 100)).toLocaleString('pt-AO', { maximumFractionDigits: 0 })} Kz
                    </span>
                    <span className="text-xs font-medium bg-red-500 text-white px-1 py-0.5 rounded-sm">
                      -{giftCard.discount_percentage}%
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <span className="text-xs text-gray-500">Preço indisponível</span>
            )}
            
            {/* Botão Ver detalhes */}
            <div className="mt-2 flex items-center text-xs text-blue-600 font-medium">
              <span>Ver detalhes</span>
              <ArrowUpRight className="w-3 h-3 ml-0.5" />
            </div>
          </div>
        </div>
        
        {/* Linha animada na parte inferior com efeito de brilho */}
        <div className="absolute inset-x-0 bottom-0 z-20 overflow-hidden">
          {/* Linha principal que cresce com o hover */}
          <div 
            className={`h-[3px] w-full transform transition-all duration-500 origin-left ${hovered ? 'scale-x-100' : 'scale-x-0'}`}
            style={{
              background: getCardLineColor(),
              backgroundSize: '200% 100%'
            }}
          />
          
          {/* Efeito de brilho adicional que se move */}
          <div 
            className={`absolute top-0 h-[3px] w-full transform opacity-0 transition-opacity duration-300 shine-effect ${hovered ? 'opacity-100' : ''}`}
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.8), transparent)',
              backgroundSize: '200% 100%'
            }}
          />
        </div>
      </div>
    );
  }, [giftCard, bgColor, imageError, imageLoaded, loading, kwanzaPrice, hovered, handleImageLoad, handleImageError, getCardLineColor]);

  return (
    <Link to={`/gift-card/${giftCard.slug || giftCard.id}`} className="block h-full group">
      {viewMode === 'grid' ? renderGridView() : renderListView()}
    </Link>
  );
};

export default memo(GiftCardItem);
