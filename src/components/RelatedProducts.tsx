import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { GiftCard } from '@/types/supabase';
import { getGiftCards, getExchangeRates } from '@/lib/database';
import { Link } from 'react-router-dom';

interface RelatedProductsProps {
  currentProductId: string;
  currentProductCategory?: string;
}

export default function RelatedProducts({ currentProductId, currentProductCategory }: RelatedProductsProps) {
  const [relatedProducts, setRelatedProducts] = useState<GiftCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [exchangeRates, setExchangeRates] = useState<any[]>([]);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [touchStartX, setTouchStartX] = useState(0);
  const [touchEndX, setTouchEndX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadRelatedProducts();
  }, [currentProductId]);

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying || relatedProducts.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex(prev => {
        const maxIndex = Math.max(0, relatedProducts.length - getMaxVisibleItems());
        return prev >= maxIndex ? 0 : prev + 1;
      });
    }, 4000); // Muda a cada 4 segundos

    return () => clearInterval(interval);
  }, [isAutoPlaying, relatedProducts.length]);

  // Touch handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.targetTouches[0].clientX);
    setIsAutoPlaying(false); // Parar auto-play quando usuário interage
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEndX(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    
    const touchDiff = touchStartX - touchEndX;
    const minSwipeDistance = 50;

    if (Math.abs(touchDiff) > minSwipeDistance) {
      if (touchDiff > 0) {
        // Swipe left - next slide
        nextSlide();
      } else {
        // Swipe right - previous slide
        prevSlide();
      }
    }
    
    setIsDragging(false);
    // Reativar auto-play após 5 segundos de inatividade
    setTimeout(() => setIsAutoPlaying(true), 5000);
  };

  const loadRelatedProducts = async () => {
    try {
      setLoading(true);
      const [allCards, rates] = await Promise.all([
        getGiftCards(),
        getExchangeRates()
      ]);
      
      setExchangeRates(rates);
      
      // Filtrar produtos relacionados (excluir o produto atual)
      let filteredCards = allCards.filter(card => card.id !== currentProductId);
      
      // Se há categoria, priorizar produtos da mesma categoria
      if (currentProductCategory) {
        const sameCategory = filteredCards.filter(card => 
          card.gift_card_categories?.some(cat => 
            cat.categories?.name?.toLowerCase() === currentProductCategory.toLowerCase()
          )
        );
        
        const otherCards = filteredCards.filter(card => 
          !card.gift_card_categories?.some(cat => 
            cat.categories?.name?.toLowerCase() === currentProductCategory.toLowerCase()
          )
        );
        
        // Misturar: alguns da mesma categoria + outros aleatórios
        filteredCards = [...sameCategory.slice(0, 4), ...otherCards];
      }
      
      // Embaralhar e limitar a 8 produtos
      const shuffled = filteredCards.sort(() => Math.random() - 0.5).slice(0, 8);
      setRelatedProducts(shuffled);
    } catch (error) {
      console.error('Erro ao carregar produtos relacionados:', error);
    } finally {
      setLoading(false);
    }
  };

  const convertPriceToKwanzas = (card: GiftCard) => {
    let basePrice = card.original_price;
    
    if (card.plans && card.plans.length > 0) {
      const lowestPricePlan = card.plans.reduce((lowest, current) => 
        current.price < lowest.price ? current : lowest, card.plans[0]);
      basePrice = lowestPricePlan.price;
    }
    
    const rate = exchangeRates.find((r: any) => r.currency === card.currency);
    
    if (rate) {
      const priceInKwanzas = basePrice * rate.rate;
      return priceInKwanzas.toLocaleString('pt-AO', { maximumFractionDigits: 0 }) + " Kz";
    }
    return "Preço indisponível";
  };

  const getCardColor = (name: string) => {
    const colors = [
      'bg-blue-100',
      'bg-indigo-100', 
      'bg-purple-100',
      'bg-pink-100',
      'bg-green-100',
      'bg-teal-100'
    ];
    const index = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[index % colors.length];
  };

  const getMaxVisibleItems = () => {
    if (typeof window === 'undefined') return 4;
    if (window.innerWidth < 640) return 2;
    if (window.innerWidth < 768) return 3;
    if (window.innerWidth < 1024) return 4;
    return 5;
  };

  const nextSlide = () => {
    const maxIndex = Math.max(0, relatedProducts.length - getMaxVisibleItems());
    setCurrentIndex(prev => Math.min(prev + 1, maxIndex));
    setIsAutoPlaying(false);
    // Reativar auto-play após 5 segundos
    setTimeout(() => setIsAutoPlaying(true), 5000);
  };

  const prevSlide = () => {
    setCurrentIndex(prev => Math.max(prev - 1, 0));
    setIsAutoPlaying(false);
    // Reativar auto-play após 5 segundos
    setTimeout(() => setIsAutoPlaying(true), 5000);
  };

  if (loading) {
    return (
      <div className="mt-12 pt-8 border-t border-gray-200">
        <h3 className="text-xl font-bold text-gray-800 mb-6">Você também pode gostar</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array(5).fill(0).map((_, index) => (
            <div key={index} className="bg-gray-100 rounded-xl animate-pulse h-36"></div>
          ))}
        </div>
      </div>
    );
  }

  if (relatedProducts.length === 0) {
    return null;
  }

  return (
    <div className="mt-12 pt-8 border-t border-gray-200 mb-16">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-800">Você também pode gostar</h3>
        
        {/* Controles de navegação - apenas no desktop */}
        <div className="hidden md:flex items-center gap-2">
          <button
            onClick={prevSlide}
            disabled={currentIndex === 0}
            className="p-2 rounded-full bg-white border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={nextSlide}
            disabled={currentIndex >= relatedProducts.length - getMaxVisibleItems()}
            className="p-2 rounded-full bg-white border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Container do slider */}
      <div className="relative overflow-hidden">
        <div 
          ref={sliderRef}
          className="flex transition-transform duration-500 ease-out"
          style={{
            transform: `translateX(-${currentIndex * (100 / getMaxVisibleItems())}%)`,
          }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {relatedProducts.map((card) => (
            <div 
              key={card.id} 
              className="flex-none px-2"
              style={{ 
                width: `${100 / getMaxVisibleItems()}%`,
              }}
            >
              <Link 
                to={`/gift-card/${card.slug || card.id}`} 
                className="block h-36 aspect-auto rounded-2xl overflow-hidden shadow-sm hover:shadow-md relative group"
              >
                <div className="w-full h-full bg-white overflow-hidden rounded-2xl">
                  {card.image_url ? (
                    <img 
                      src={card.image_url} 
                      alt={card.name} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 rounded-2xl"
                    />
                  ) : (
                    <div className={`w-full h-full flex items-center justify-center ${getCardColor(card.name)} rounded-2xl`}>
                      <span className="text-gray-600 font-medium text-sm">{card.name}</span>
                    </div>
                  )}
                </div>
                
                {/* Overlay com informações */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl">
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <h4 className="text-white font-medium text-sm leading-tight mb-1 line-clamp-2">
                      {card.name}
                    </h4>
                    <p className="text-white/90 text-xs font-bold">
                      {convertPriceToKwanzas(card)}
                    </p>
                  </div>
                </div>

                {/* Badge de desconto */}
                {card.has_discount && card.discount_percentage && (
                  <div className="absolute top-2 right-2 z-10 bg-red-500 text-white text-xs font-bold py-1 px-2 rounded-md shadow-sm">
                    -{card.discount_percentage}%
                  </div>
                )}
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Indicadores de posição - apenas no mobile */}
      <div className="flex md:hidden justify-center mt-4 gap-2">
        {Array(Math.ceil(relatedProducts.length / getMaxVisibleItems())).fill(0).map((_, index) => (
          <button
            key={index}
            onClick={() => {
              setCurrentIndex(index * getMaxVisibleItems());
              setIsAutoPlaying(false);
              setTimeout(() => setIsAutoPlaying(true), 5000);
            }}
            className={`w-2 h-2 rounded-full transition-colors ${
              Math.floor(currentIndex / getMaxVisibleItems()) === index 
                ? 'bg-blue-600' 
                : 'bg-gray-300'
            }`}
          />
        ))}
      </div>
    </div>
  );
} 