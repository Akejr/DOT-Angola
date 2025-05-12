import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { ListFilter, Sliders, Grid2X2, ArrowLeft, RefreshCw } from "lucide-react";
import Header from "@/components/Header";
import Navigation from "@/components/Navigation";
import { Helmet } from "react-helmet-async";
import { GiftCard, Category, ExchangeRate } from "@/types/supabase";
import { getGiftCards, getCategories, getExchangeRates } from "@/lib/database";
import GiftCardItem from "@/components/GiftCardItem";
import "@/styles/cards.css";
import { SEO } from "@/components/SEO";

const MaisVendidosPage = () => {
  const [featuredCards, setFeaturedCards] = useState<GiftCard[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [exchangeRates, setExchangeRates] = useState<ExchangeRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [initialDataLoaded, setInitialDataLoaded] = useState(false);
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [filteredCards, setFilteredCards] = useState<GiftCard[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'newest' | 'price-asc' | 'price-desc'>('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoryMappings, setCategoryMappings] = useState<Map<string, number>>(new Map());

  useEffect(() => {
    // Definir um timeout para mostrar uma mensagem de fallback se o carregamento demorar muito
    const timer = setTimeout(() => {
      setLoadingTimeout(true);
    }, 5000);
    
    loadData();
    
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    filterGiftCards();
  }, [selectedCategory, featuredCards, sortBy]);

  const loadData = async () => {
    try {
      setLoading(true);
      setCategoriesLoading(true);
      setHasError(false);

      // Priorizar o carregamento dos gift cards
      try {
        // Adicionar um timeout para a requisição dos gift cards
        const fetchCardsPromise = getGiftCards();
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Timeout')), 8000)
        );
        
        const cards = await Promise.race([fetchCardsPromise, timeoutPromise]) as GiftCard[];
        
        // Filtra os gift cards destacados
        const featured = cards.filter(card => card.is_featured);
        setFeaturedCards(featured);
        setFilteredCards(featured);
        setInitialDataLoaded(true);
      } catch (error) {
        console.error("Erro ao carregar gift cards destacados:", error);
        setHasError(true);
        setInitialDataLoaded(true); // Mostrar interface mesmo com erro
      }
      
      // Carregar dados secundários após os principais
      Promise.all([
        getCategories().catch(err => {
          console.error("Erro ao carregar categorias:", err);
          return [];
        }),
        getExchangeRates().catch(err => {
          console.error("Erro ao carregar taxas de câmbio:", err);
          return [];
        })
      ]).then(([cats, rates]) => {
        setCategories(cats);
        setExchangeRates(rates);
        
        // Contar gift cards por categoria
        const categoryCountMap = new Map<string, number>();
        featuredCards.forEach(card => {
          if (card.gift_card_categories && Array.isArray(card.gift_card_categories)) {
            card.gift_card_categories.forEach(categoryRelation => {
              if (categoryRelation.categories) {
                const categoryId = categoryRelation.categories.id;
                categoryCountMap.set(
                  categoryId, 
                  (categoryCountMap.get(categoryId) || 0) + 1
                );
              }
            });
          }
        });
        setCategoryMappings(categoryCountMap);
        setCategoriesLoading(false);
      }).catch(error => {
        console.error("Erro ao carregar dados secundários:", error);
        setCategoriesLoading(false);
      });
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  // Função para recarregar os dados
  const handleRetry = () => {
    setLoadingTimeout(false);
    setHasError(false);
    loadData();
  };

  // Renderizar esqueletos de cards para carregamento
  const renderSkeletons = () => (
    <>
      {Array(6).fill(0).map((_, index) => (
        <div key={`skeleton-${index}`} className="bg-gray-100 rounded-lg animate-pulse">
          <div className="w-full h-28 sm:h-32 rounded-lg bg-gray-200"></div>
          <div className="p-3">
            <div className="h-3 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      ))}
    </>
  );

  // Reduzir o delay de carregamento para mobile
  const getAnimationDelay = (index: number) => {
    if (typeof window !== 'undefined' && window.innerWidth < 640) {
      // Em dispositivos móveis, usar delays menores para acelerar a aparência
      return `${Math.min(index * 20, 200)}ms`;
    }
    return `${Math.min(index * 50, 500)}ms`;
  };

  const filterGiftCards = () => {
    let filtered = [...featuredCards];
    
    // Filtrar por categoria
    if (selectedCategory) {
      filtered = filtered.filter(card => {
        if (!card.gift_card_categories) return false;
        
        return card.gift_card_categories.some(categoryRelation => {
          if (!categoryRelation.categories) return false;
          return categoryRelation.categories.id === selectedCategory;
        });
      });
    }
    
    // Ordenar
    switch (sortBy) {
      case 'price-asc':
        filtered.sort((a, b) => a.original_price - b.original_price);
        break;
      case 'price-desc':
        filtered.sort((a, b) => b.original_price - a.original_price);
        break;
      case 'newest':
      default:
        filtered.sort((a, b) => 
          new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime()
        );
        break;
    }
    
    setFilteredCards(filtered);
  };

  const handleCategorySelect = (categoryId: string | null) => {
    setSelectedCategory(categoryId);
  };

  const clearFilters = () => {
    setSelectedCategory(null);
    setSortBy('newest');
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

  const handlePageChange = (id: number) => {
    // Esta função é necessária para o componente Navigation
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-0 sm:p-4">
      <SEO 
        title="Produtos Mais Vendidos"
        description="Confira os gift cards e produtos mais vendidos da DOT ANGOLA"
      />
      
      <div className="max-w-6xl w-full bg-white rounded-none sm:rounded-3xl shadow-xl overflow-hidden">
        <Header />
        <Navigation onPageChange={handlePageChange} />
        
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center mb-4">
            <Link to="/" className="flex items-center text-gray-600 hover:text-blue-600 mr-4 transition">
              <ArrowLeft className="h-4 w-4 mr-1" />
              <span className="text-sm">Voltar</span>
            </Link>
            <h1 className="text-xl font-semibold text-gray-800">Produtos Mais Vendidos</h1>
          </div>
          
          {/* Conteúdo principal */}
          <div className="bg-white rounded-xl">
            {loading && !initialDataLoaded ? (
              <>
                {loadingTimeout ? (
                  <div className="text-center py-12">
                    <p className="text-gray-600 mb-3">O carregamento está demorando mais que o esperado.</p>
                    <button 
                      onClick={handleRetry}
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
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 px-2 py-2">
                      {renderSkeletons()}
                    </div>
                  </div>
                )}
              </>
            ) : hasError ? (
              <div className="text-center py-12">
                <p className="text-gray-600 mb-3">Não foi possível carregar os produtos. Por favor, tente novamente.</p>
                <button 
                  onClick={handleRetry}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm transition-colors flex items-center mx-auto"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Tentar novamente
                </button>
              </div>
            ) : (
              <div>
                {/* Barra de filtros */}
                <div className="flex flex-col space-y-4 mb-8">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                    <div>
                      <p className="text-sm text-gray-600">{filteredCards.length} produtos encontrados</p>
                    </div>
                    
                    <div className="mt-4 md:mt-0 flex items-center gap-3">
                      <div className="flex items-center bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                        <button 
                          onClick={() => setViewMode('grid')}
                          className={`p-2 flex items-center ${viewMode === 'grid' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
                          aria-label="Visualização em grade"
                        >
                          <Grid2X2 className="h-4 w-4 mr-1.5" />
                          <span className="text-sm font-medium">Grade</span>
                        </button>
                        <div className="h-6 border-r border-gray-200"></div>
                        <button 
                          onClick={() => setViewMode('list')}
                          className={`p-2 flex items-center ${viewMode === 'list' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
                          aria-label="Visualização em lista"
                        >
                          <ListFilter className="h-4 w-4 mr-1.5" />
                          <span className="text-sm font-medium">Lista</span>
                        </button>
                        <div className="h-6 border-r border-gray-200"></div>
                        <button 
                          onClick={() => setShowFilters(!showFilters)}
                          className={`p-2 flex items-center ${showFilters ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
                          aria-label="Filtros"
                        >
                          <Sliders className="h-4 w-4 mr-1.5" />
                          <span className="text-sm font-medium">Filtros</span>
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Filtros expandidos */}
                  {showFilters && (
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="font-semibold text-gray-800">Filtros</h3>
                        {(selectedCategory !== null || sortBy !== 'newest') && (
                          <button 
                            onClick={clearFilters}
                            className="text-sm text-blue-600 hover:text-blue-800"
                          >
                            Limpar todos
                          </button>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Categorias */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <label className="block text-sm font-medium text-gray-700">Categorias</label>
                            {selectedCategory && (
                              <button 
                                onClick={() => handleCategorySelect(null)}
                                className="text-xs text-blue-600 hover:text-blue-800"
                              >
                                Limpar
                              </button>
                            )}
                          </div>
                          
                          {categoriesLoading ? (
                            <div className="flex gap-2">
                              <div className="h-8 w-16 bg-gray-100 animate-pulse rounded-full"></div>
                              <div className="h-8 w-24 bg-gray-100 animate-pulse rounded-full"></div>
                              <div className="h-8 w-20 bg-gray-100 animate-pulse rounded-full"></div>
                            </div>
                          ) : (
                            <div className="flex flex-wrap gap-2">
                              <button 
                                onClick={() => handleCategorySelect(null)}
                                className={`px-3 py-1 text-sm rounded-full transition-all duration-200 ${!selectedCategory ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                              >
                                Todas
                              </button>
                              {categories && categories.length > 0 ? (
                                categories.map(category => {
                                  // Usar o mapeamento pré-calculado para a contagem de gift cards por categoria
                                  const count = categoryMappings.get(category.id) || 0;
                                  
                                  // Mostrar apenas categorias que têm pelo menos um gift card
                                  return count > 0 ? (
                                    <button 
                                      key={category.id}
                                      onClick={() => handleCategorySelect(category.id)}
                                      className={`px-3 py-1 text-sm rounded-full transition-all duration-200 ${selectedCategory === category.id ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                                    >
                                      {category.name} <span className="text-xs ml-1 opacity-75">({count})</span>
                                    </button>
                                  ) : null;
                                })
                              ) : (
                                <span className="text-sm text-gray-500">Sem categorias disponíveis</span>
                              )}
                            </div>
                          )}
                        </div>
                        
                        {/* Ordenação */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <label className="block text-sm font-medium text-gray-700">Ordenar por</label>
                            {sortBy !== 'newest' && (
                              <button 
                                onClick={() => setSortBy('newest')}
                                className="text-xs text-blue-600 hover:text-blue-800"
                              >
                                Padrão
                              </button>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <button 
                              onClick={() => setSortBy('newest')}
                              className={`px-3 py-1 text-sm rounded-full transition-all duration-200 ${sortBy === 'newest' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                            >
                              Mais recentes
                            </button>
                            <button 
                              onClick={() => setSortBy('price-asc')}
                              className={`px-3 py-1 text-sm rounded-full transition-all duration-200 ${sortBy === 'price-asc' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                            >
                              Menor preço
                            </button>
                            <button 
                              onClick={() => setSortBy('price-desc')}
                              className={`px-3 py-1 text-sm rounded-full transition-all duration-200 ${sortBy === 'price-desc' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                            >
                              Maior preço
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                  
                {/* Lista de Gift Cards */}
                {filteredCards.length === 0 ? (
                  <div className="text-center py-16 bg-gray-50 rounded-lg">
                    <p className="text-gray-500 mb-2">Nenhum gift card encontrado</p>
                    <button 
                      onClick={clearFilters}
                      className="text-blue-600 hover:underline text-sm"
                    >
                      Limpar filtros
                    </button>
                  </div>
                ) : (
                  <div className={
                    viewMode === 'grid' 
                      ? "gift-card-container grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4"
                      : "flex flex-col space-y-6"
                  }>
                    {filteredCards.map((card, index) => (
                      <div 
                        key={card.id} 
                        className="animate-fade-in scale-90" 
                        style={{ 
                          animationDelay: getAnimationDelay(index),
                          opacity: 0,
                          animation: `fadeIn 0.4s ease-out ${getAnimationDelay(index)} forwards`
                        }}
                      >
                        <GiftCardItem
                          giftCard={card}
                          bgColor={getCardColor(card.name)}
                          viewMode={viewMode}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
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
  );
};

export default MaisVendidosPage; 