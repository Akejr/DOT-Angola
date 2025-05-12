import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import Header from "./Header";
import Navigation from "./Navigation";
import HeroBanner from "./HeroBanner";
import FilterSection from "./FilterSection";
import GiftCardGrid from "./GiftCardGrid";
import { GiftCard } from "@/types/supabase";
import { getGiftCards } from "@/lib/database";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import GiftCardItem from "./GiftCardItem";
import { supabase } from "@/lib/supabase";
import { SEO } from "@/components/SEO";

const HomeLayout = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [featuredCards, setFeaturedCards] = useState<GiftCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState(0);
  const [touchEndX, setTouchEndX] = useState(0);
  const sliderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadFeaturedCards = async () => {
      try {
        setLoading(true);
        const cards = await getGiftCards();
        // Filtra os gift cards destacados e limita a 8 itens
        const featured = cards
          .filter(card => card.is_featured)
          .slice(0, 8);
        setFeaturedCards(featured);
      } catch (error) {
        console.error("Erro ao carregar gift cards destacados:", error);
      } finally {
        setLoading(false);
      }
    };

    loadFeaturedCards();
  }, []);

  // Adicionar efeito de rotação automática
  useEffect(() => {
    if (featuredCards.length <= getMaxVisibleItems()) return;
    
    const maxIndex = Math.max(0, featuredCards.length - getMaxVisibleItems());
    const timer = setInterval(() => {
      setCurrentIndex(current => {
        // Quando chegar ao final, voltar para o início suavemente
        if (current >= maxIndex) return 0;
        return current + 0.5; // Movimento mais suave usando decimal
      });
    }, 3000);
    
    return () => clearInterval(timer);
  }, [featuredCards]);

  const handlePageChange = (id: number) => {
    // Esta função é necessária para o componente Navigation
    // Mas não precisamos mais mudar o estado selectedPage
  };

  const handleCategorySelect = (categoryId: string | null) => {
    setSelectedCategory(categoryId);
  };

  const getMaxVisibleItems = () => {
    // Retorna o número de itens visíveis baseado no tamanho da tela
    if (typeof window !== "undefined") {
      if (window.innerWidth >= 1280) return 4; // xl
      if (window.innerWidth >= 1024) return 3; // lg
      if (window.innerWidth >= 768) return 2;  // md
      if (window.innerWidth >= 480) return 2; // sm - exatamente 2 itens
      return 2; // mobile - exatamente 2 itens
    }
    return 3; // fallback padrão
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

  // Funções para o controle de toque no mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEndX(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (featuredCards.length <= getMaxVisibleItems()) return;
    
    const maxIndex = Math.max(0, featuredCards.length - getMaxVisibleItems());
    const touchDiff = touchStartX - touchEndX;
    
    // Se o movimento for significativo (mais de 40px)
    if (Math.abs(touchDiff) > 40) {
      if (touchDiff > 0) {
        // Deslizar para a esquerda - próximo item
        setCurrentIndex(prev => Math.min(prev + 1, maxIndex));
      } else {
        // Deslizar para a direita - item anterior
        setCurrentIndex(prev => Math.max(prev - 1, 0));
      }
    }
  };

  // Navegar para slide anterior
  const goToPrevSlide = () => {
    setCurrentIndex(prev => Math.max(prev - 1, 0));
  };

  // Navegar para próximo slide
  const goToNextSlide = () => {
    const maxIndex = Math.max(0, featuredCards.length - getMaxVisibleItems());
    setCurrentIndex(prev => Math.min(prev + 1, maxIndex));
  };

  return (
    <>
      <SEO 
        title="Gift Cards e Visa Virtual"
        description="A melhor plataforma de gift cards internacionais e cartões Visa Virtual em Angola. Compre com segurança e os melhores preços do mercado."
      />
      
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-0 sm:p-4">
        <div className="max-w-6xl w-full bg-white rounded-none sm:rounded-3xl shadow-xl overflow-hidden">
          <Header />
          <Navigation onPageChange={handlePageChange} />
          
          <div id="gift-card-content">
            <HeroBanner />
            
            {/* Seção de Cards Mais Vendidos - Versão melhorada para mobile */}
            <div className="relative py-4 sm:py-6 overflow-hidden bg-gray-100">
              {/* Elementos decorativos mínimos */}
              <div className="absolute left-0 top-0 w-48 h-48 bg-blue-400 opacity-5 rounded-full -translate-x-16 -translate-y-16 blur-3xl"></div>
              
              <div className="w-full mx-auto relative px-2 sm:px-0">
                <div className="flex justify-between items-center mb-4 px-3 sm:px-6">
                  <h2 className="text-base font-semibold text-gray-800">Mais Vendidos</h2>
                  <Link to="/mais-vendidos" className="text-xs sm:text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1">
                    Ver todos
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
                
                {featuredCards.length > 0 ? (
                  <div className="relative w-full">
                    {/* Versão Mobile (Grid Moderno) */}
                    <div className="md:hidden px-3">
                      <div className="grid grid-cols-2 gap-3">
                        {/* Primeiro card (destacado, ocupa toda a largura) */}
                        {featuredCards.length > 0 && (
                          <Link 
                            key={featuredCards[0].id}
                            to={`/gift-card/${featuredCards[0].slug || featuredCards[0].id}`} 
                            className="relative group overflow-hidden rounded-xl shadow-sm col-span-2 h-36"
                          >
                            <div className="absolute left-0 top-0 bg-blue-600 text-white text-xs z-10 py-1 px-2 rounded-br-lg font-medium flex items-center">
                              <span className="mr-1">★</span>
                              Top Vendas
                            </div>
                            
                            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/10 to-black/70 z-10"></div>
                            {featuredCards[0].image_url ? (
                              <img 
                                src={featuredCards[0].image_url} 
                                alt={featuredCards[0].name} 
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                              />
                            ) : (
                              <div className={`w-full h-full flex items-center justify-center ${getCardColor(featuredCards[0].name)}`}>
                                <span className="text-gray-600 font-medium">{featuredCards[0].name}</span>
                              </div>
                            )}
                            
                            <div className="absolute bottom-0 left-0 right-0 p-2 z-20 flex flex-col">
                              <h3 className="text-white text-xs font-medium leading-tight truncate">
                                {featuredCards[0].name}
                              </h3>
                              {featuredCards[0].plans && featuredCards[0].plans[0] && (
                                <p className="text-white/90 text-xs mt-0.5 font-bold">
                                  AOA {featuredCards[0].plans[0].price.toFixed(2).replace(".", ",")}
                                </p>
                              )}
                            </div>
                            
                            <div className="absolute inset-0 bg-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          </Link>
                        )}
                        
                        {/* Segundo card */}
                        {featuredCards.length > 1 && (
                          <Link 
                            key={featuredCards[1].id}
                            to={`/gift-card/${featuredCards[1].slug || featuredCards[1].id}`} 
                            className="relative group overflow-hidden rounded-xl shadow-sm h-28"
                          >
                            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/10 to-black/70 z-10"></div>
                            {featuredCards[1].image_url ? (
                              <img 
                                src={featuredCards[1].image_url} 
                                alt={featuredCards[1].name} 
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                              />
                            ) : (
                              <div className={`w-full h-full flex items-center justify-center ${getCardColor(featuredCards[1].name)}`}>
                                <span className="text-gray-600 font-medium">{featuredCards[1].name}</span>
                              </div>
                            )}
                            
                            <div className="absolute bottom-0 left-0 right-0 p-2 z-20 flex flex-col">
                              <h3 className="text-white text-xs font-medium leading-tight truncate">
                                {featuredCards[1].name}
                              </h3>
                              {featuredCards[1].plans && featuredCards[1].plans[0] && (
                                <p className="text-white/90 text-xs mt-0.5 font-bold">
                                  AOA {featuredCards[1].plans[0].price.toFixed(2).replace(".", ",")}
                                </p>
                              )}
                            </div>
                            
                            <div className="absolute inset-0 bg-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          </Link>
                        )}
                        
                        {/* Terceiro card */}
                        {featuredCards.length > 2 && (
                          <Link 
                            key={featuredCards[2].id}
                            to={`/gift-card/${featuredCards[2].slug || featuredCards[2].id}`} 
                            className="relative group overflow-hidden rounded-xl shadow-sm h-28"
                          >
                            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/10 to-black/70 z-10"></div>
                            {featuredCards[2].image_url ? (
                              <img 
                                src={featuredCards[2].image_url} 
                                alt={featuredCards[2].name} 
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                              />
                            ) : (
                              <div className={`w-full h-full flex items-center justify-center ${getCardColor(featuredCards[2].name)}`}>
                                <span className="text-gray-600 font-medium">{featuredCards[2].name}</span>
                              </div>
                            )}
                            
                            <div className="absolute bottom-0 left-0 right-0 p-2 z-20 flex flex-col">
                              <h3 className="text-white text-xs font-medium leading-tight truncate">
                                {featuredCards[2].name}
                              </h3>
                              {featuredCards[2].plans && featuredCards[2].plans[0] && (
                                <p className="text-white/90 text-xs mt-0.5 font-bold">
                                  AOA {featuredCards[2].plans[0].price.toFixed(2).replace(".", ",")}
                                </p>
                              )}
                            </div>
                            
                            <div className="absolute inset-0 bg-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          </Link>
                        )}
                      </div>
                    </div>
                    
                    {/* Versão original para desktop */}
                    <div className="hidden md:block">
                      {/* Botões de navegação - Apenas desktop */}
                      <button 
                        onClick={goToPrevSlide}
                        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 p-1 rounded-full shadow-md hidden md:block"
                        style={{ display: currentIndex === 0 ? 'none' : 'block' }}
                        aria-label="Slide anterior"
                      >
                        <ChevronLeft className="w-4 h-4 text-gray-700" />
                      </button>
                      
                      <button 
                        onClick={goToNextSlide}
                        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 p-1 rounded-full shadow-md hidden md:block"
                        style={{ display: currentIndex >= Math.max(0, featuredCards.length - getMaxVisibleItems()) ? 'none' : 'block' }}
                        aria-label="Próximo slide"
                      >
                        <ChevronRight className="w-4 h-4 text-gray-700" />
                      </button>
                      
                      <div 
                        className="flex transition-transform duration-500 ease-out"
                      style={{
                        transform: `translateX(-${currentIndex * (100 / getMaxVisibleItems())}%)`,
                      }}
                    >
                      {featuredCards.map((card, idx) => (
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
                                  <span className="text-gray-600 font-medium">{card.name}</span>
                                </div>
                              )}
                            </div>
                            
                              {/* Badge apenas no primeiro item - para desktop */}
                            {idx === 0 && (
                              <div className="absolute top-1 right-1 bg-blue-600 text-white text-xs px-1.5 py-0.5 rounded-full">
                                Top
                              </div>
                            )}
                          </Link>
                        </div>
                      ))}
                      </div>
                      
                      {/* Indicadores - apenas para desktop */}
                      {featuredCards.length > 0 && (
                        <div className="flex justify-center mt-4 gap-2">
                          {Array.from({ length: Math.ceil(featuredCards.length / getMaxVisibleItems()) }).map((_, index) => (
                            <button
                              key={index}
                              onClick={() => setCurrentIndex(index * Math.floor(getMaxVisibleItems()))}
                              className={`transition-all duration-300 ${
                                Math.floor(currentIndex / getMaxVisibleItems()) === index 
                                  ? "bg-blue-600 w-5 h-1.5 rounded-full" 
                                  : "bg-gray-300 w-1.5 h-1.5 rounded-full hover:bg-gray-400"
                              }`}
                              aria-label={`Ir para página ${index + 1}`}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6 bg-white rounded-xl shadow-sm">
                    <p className="text-gray-500 text-xs">Nenhum produto destacado</p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row">
              <div className="w-full md:w-1/4 border-r hidden md:block">
                <FilterSection 
                  onCategorySelect={handleCategorySelect}
                  selectedCategory={selectedCategory}
                />
              </div>
              <div className="w-full md:w-3/4 md:p-6 p-4">
                <GiftCardGrid 
                  selectedCategory={selectedCategory}
                />
              </div>
            </div>
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

export default HomeLayout;
