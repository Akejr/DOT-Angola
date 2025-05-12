import { useState, useEffect, useRef } from "react";
import { GiftCard } from "@/types/supabase";
import { getGiftCards } from "@/lib/database";

const FeaturedSection = () => {
  const [featuredCards, setFeaturedCards] = useState<GiftCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadFeaturedCards();
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  // Efeito para controlar o slide automático
  useEffect(() => {
    if (loading || featuredCards.length <= 1) return;
    
    const startTimer = () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        setCurrentSlide((prev) => (prev + 1) % featuredCards.length);
      }, 5000);
    };

    startTimer();
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [currentSlide, loading, featuredCards.length]);

  const loadFeaturedCards = async () => {
    try {
      setLoading(true);
      const cards = await getGiftCards();
      const featured = cards.filter(card => card.is_featured);
      setFeaturedCards(featured);
    } catch (error) {
      console.error('Erro ao carregar gift cards destacados:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-6 bg-gray-100">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-medium text-gray-800">Mais vendidos</h2>
          <a 
            href="#" 
            className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
          >
            Ver todos
          </a>
        </div>
        
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="w-8 h-8 rounded-full border-2 border-gray-200 border-t-blue-600 animate-spin"></div>
          </div>
        ) : featuredCards.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            Nenhum produto em destaque disponível
          </div>
        ) : (
          <div ref={containerRef} className="relative">
            <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide">
              {featuredCards.slice(currentSlide, currentSlide + 3).concat(
                currentSlide + 3 > featuredCards.length 
                  ? featuredCards.slice(0, (currentSlide + 3) % featuredCards.length) 
                  : []
              ).slice(0, 3).map((card) => (
                <div 
                  key={card.id} 
                  className="flex-shrink-0 transition-opacity duration-500"
                >
                  <div className="h-20 w-44 rounded-2xl overflow-hidden">
                    <div className="w-full h-full flex items-center justify-center bg-brand-color">
                      <img 
                        src={card.image_url || '/images/placeholder.png'} 
                        alt={card.name}
                        className="h-[60%] w-auto object-contain"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Indicadores minimalistas */}
            {featuredCards.length > 3 && (
              <div className="flex justify-center mt-4 space-x-1">
                {Array.from({ length: Math.ceil(featuredCards.length / 3) }).map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index * 3)}
                    className={`w-8 h-1 transition-all duration-300 rounded-sm ${
                      Math.floor(currentSlide / 3) === index 
                        ? 'bg-blue-600' 
                        : 'bg-gray-300'
                    }`}
                    aria-label={`Grupo de slides ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedSection;
