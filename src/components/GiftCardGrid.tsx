import { useState, useEffect, useRef, useCallback, memo } from 'react';
import { Grid2X2, ListFilter, Sliders, ChevronDown, CheckIcon } from "lucide-react";
import { GiftCard, Category, ExchangeRate } from '@/types/supabase';
import { getGiftCards, getCategories, getExchangeRates } from '@/lib/database';
import GiftCardItem from "./GiftCardItem";
import { LoadingOptimizer, CardSkeletons, getAnimationDelay } from './LoadingOptimizer';

interface GiftCardGridProps {
  selectedCategory?: string | null;
}

// Componente de Item de Card Memorizado para evitar re-renderização desnecessária
const MemoizedGiftCardItem = memo(GiftCardItem);

const GiftCardGrid = ({ selectedCategory: externalSelectedCategory }: GiftCardGridProps) => {
  const [allGiftCards, setAllGiftCards] = useState<GiftCard[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [exchangeRates, setExchangeRates] = useState<ExchangeRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [initialDataLoaded, setInitialDataLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [filteredCards, setFilteredCards] = useState<GiftCard[]>([]);
  const [displayedCards, setDisplayedCards] = useState<GiftCard[]>([]);
  const [visibleCardCount, setVisibleCardCount] = useState(12);
  const [loadingMore, setLoadingMore] = useState(false);
  const [internalSelectedCategory, setInternalSelectedCategory] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'newest' | 'price-asc' | 'price-desc'>('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoryMappings, setCategoryMappings] = useState<Map<string, number>>(new Map());
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const categoryDropdownRef = useRef<HTMLDivElement>(null);
  const cardsContainerRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Use the external selectedCategory from props if provided, otherwise use internal state
  const selectedCategory = externalSelectedCategory !== undefined ? externalSelectedCategory : internalSelectedCategory;

  // Carregar dados iniciais
  useEffect(() => {
    loadData();
    
    // Limpeza quando o componente é desmontado
    return () => {
      if (observerRef.current && sentinelRef.current) {
        observerRef.current.unobserve(sentinelRef.current);
        observerRef.current.disconnect();
      }
    };
  }, []);

  // Filtrar cards quando categoria ou ordenação mudam
  useEffect(() => {
    if (!allGiftCards.length) return;
    
    console.log("Aplicando filtros. Categoria:", selectedCategory, "Ordenação:", sortBy);
    
    // Função para filtrar por categoria
    const filterByCategory = (cards: GiftCard[]): GiftCard[] => {
      if (!selectedCategory) return cards;
      
      console.log(`Filtrando ${cards.length} gift cards pela categoria ${selectedCategory}`);
      
      return cards.filter(card => {
        // Verificar se o card tem categorias definidas
        if (!card.gift_card_categories || !Array.isArray(card.gift_card_categories)) {
          return false;
        }
        
        // Verificar se o card pertence à categoria selecionada
        const matchesCategory = card.gift_card_categories.some(relation => 
          relation.categories && relation.categories.id === selectedCategory
        );
        
        return matchesCategory;
      });
    };
    
    // Função para ordenar os cards
    const sortCards = (cards: GiftCard[]): GiftCard[] => {
      const sortedCards = [...cards];
      
      if (sortBy === 'price-asc') {
        return sortedCards.sort((a, b) => (a.original_price || 0) - (b.original_price || 0));
      } else if (sortBy === 'price-desc') {
        return sortedCards.sort((a, b) => (b.original_price || 0) - (a.original_price || 0));
      } else {
        // 'newest' é o padrão
        return sortedCards.sort((a, b) => 
          new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime()
        );
      }
    };
    
    // Aplicar filtros e ordenação
    const filtered = filterByCategory(allGiftCards);
    const sorted = sortCards(filtered);
    
    console.log(`Resultado: ${sorted.length} gift cards após filtragem e ordenação`);
    
    setFilteredCards(sorted);
    setVisibleCardCount(12); // Resetar para mostrar apenas os primeiros 12 cards
  }, [selectedCategory, allGiftCards, sortBy]);

  // Atualizar cards exibidos
  useEffect(() => {
    setDisplayedCards(filteredCards.slice(0, visibleCardCount));
  }, [filteredCards, visibleCardCount]);

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target as Node)) {
        setShowCategoryDropdown(false);
      }
    }
    if (showCategoryDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [showCategoryDropdown]);

  // Configurar o IntersectionObserver para detecção mais eficiente do scroll
  const setupIntersectionObserver = useCallback(() => {
    if (!sentinelRef.current) return;

    // Desconectar o observer anterior se existir
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    const options = {
      root: null,
      rootMargin: '100px',
      threshold: 0.1
    };

    observerRef.current = new IntersectionObserver((entries) => {
      const [entry] = entries;
      if (entry.isIntersecting && displayedCards.length < filteredCards.length && !loadingMore) {
        loadMoreCards();
      }
    }, options);

    observerRef.current.observe(sentinelRef.current);
  }, [displayedCards.length, filteredCards.length, loadingMore]);

  // Configurar observer quando displayedCards ou filteredCards mudam
  useEffect(() => {
    setupIntersectionObserver();
  }, [displayedCards, filteredCards, setupIntersectionObserver]);

  // Função para carregar dados
  const loadData = async () => {
    try {
      setLoading(true);
      setCategoriesLoading(true);
      setHasError(false);

      // Carregar gift cards
      try {
        const fetchCardsPromise = getGiftCards();
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Timeout')), 8000)
        );
        
        const cards = await Promise.race([fetchCardsPromise, timeoutPromise]) as GiftCard[];
        console.log(`Carregados ${cards.length} gift cards`);
        
        setAllGiftCards(cards);
        setFilteredCards(cards);
        setDisplayedCards(cards.slice(0, visibleCardCount));
        setInitialDataLoaded(true);
      } catch (error) {
        console.error("Erro ao carregar gift cards:", error);
        setInitialDataLoaded(true);
        setHasError(true);
      }
      
      // Carregar categorias e taxas de câmbio em paralelo
      try {
        const [cats, rates] = await Promise.all([
          getCategories(),
          getExchangeRates()
        ]);
        
        console.log(`Carregadas ${cats.length} categorias`);
        setCategories(cats);
        setExchangeRates(rates);
        
        // Calcular contagem de gift cards por categoria
        if (cats.length > 0) {
          const categoryCountMap = computeCategoryMappings(allGiftCards, cats);
          setCategoryMappings(categoryCountMap);
        }
      } catch (error) {
        console.error("Erro ao carregar dados secundários:", error);
      } finally {
        setCategoriesLoading(false);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setHasError(true);
    } finally {
      setLoading(false);
    }
  };

  // Calculador de mapeamento de categorias
  const computeCategoryMappings = useCallback((cards: GiftCard[], categories: Category[]) => {
    const categoryMap = new Map<string, number>();
    
    // Inicializar o mapa com todas as categorias (mesmo que vazias)
    categories.forEach(cat => {
      categoryMap.set(cat.id, 0);
    });
    
    // Contar gift cards por categoria
    cards.forEach(card => {
      if (card.gift_card_categories && Array.isArray(card.gift_card_categories)) {
        card.gift_card_categories.forEach(categoryRelation => {
          if (categoryRelation.categories) {
            const categoryId = categoryRelation.categories.id;
            categoryMap.set(
              categoryId, 
              (categoryMap.get(categoryId) || 0) + 1
            );
          }
        });
      }
    });
    
    return categoryMap;
  }, []);

  // Carregar mais cards
  const loadMoreCards = useCallback(() => {
    if (displayedCards.length >= filteredCards.length || loadingMore) return;
    
    setLoadingMore(true);
    
    requestAnimationFrame(() => {
      setVisibleCardCount(prevCount => prevCount + 8);
      
      setTimeout(() => {
        setLoadingMore(false);
      }, 200);
    });
  }, [displayedCards.length, filteredCards.length, loadingMore]);

  // Manipulador de seleção de categoria
  const handleCategorySelect = useCallback((categoryId: string | null) => {
    console.log(`Selecionando categoria: ${categoryId || 'todas'}`);
    setInternalSelectedCategory(categoryId);
    setShowCategoryDropdown(false);
  }, []);

  // Limpar todos os filtros
  const clearFilters = useCallback(() => {
    console.log("Limpando todos os filtros");
    setInternalSelectedCategory(null);
    setSortBy('newest');
  }, []);

  // Cor de fundo para os cards
  const getCardColor = useCallback((name: string) => {
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
  }, []);

  // Função para tentar novamente em caso de erro
  const handleRetry = useCallback(() => {
    loadData();
  }, []);

  // Renderizar apenas os cards visíveis
  const renderGiftCards = () => {
    return displayedCards.map((card, index) => (
      <div 
        key={card.id} 
        className="animate-fade-in" 
        style={{ 
          animationDelay: getAnimationDelay(index),
          opacity: 0,
          animation: `fadeIn 0.4s ease-out ${getAnimationDelay(index)} forwards`
        }}
      >
        <MemoizedGiftCardItem
          giftCard={card}
          bgColor={getCardColor(card.name)}
          viewMode={viewMode}
        />
      </div>
    ));
  };

  return (
    <div>
      <LoadingOptimizer
        loading={loading}
        initialDataLoaded={initialDataLoaded}
        hasError={hasError}
        onRetry={handleRetry}
        loadingText="Carregando gift cards..."
        skeletonContent={<CardSkeletons count={8} columns={2} />}
      >
        {/* Barra de filtros */}
        <div className="flex flex-col space-y-4 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Gift Cards Disponíveis</h2>
              <p className="text-sm text-gray-600">{filteredCards.length} produtos encontrados</p>
            </div>
            
            {/* Controles de visualização e filtros */}
            <div className="mt-4 md:mt-0 flex flex-wrap items-center gap-2 md:gap-3">
              {/* Botão de seleção de categoria */}
              <div className="relative">
                <button 
                  onClick={() => setShowCategoryDropdown((prev) => !prev)}
                  className={`flex items-center justify-center gap-1 px-3 py-2 bg-white border ${selectedCategory ? 'border-blue-300' : 'border-gray-200'} rounded-lg text-sm font-medium ${selectedCategory ? 'text-blue-600' : 'text-gray-700'} hover:bg-gray-50 shadow-sm`}
                  aria-label="Selecionar categoria"
                >
                  <CheckIcon className={`h-4 w-4 ${selectedCategory ? 'text-blue-500' : 'text-gray-500'}`} />
                  <span>
                    {selectedCategory 
                      ? categories.find(c => c.id === selectedCategory)?.name || 'Categoria'
                      : 'Selecionar categoria'
                    }
                  </span>
                  <ChevronDown className="h-4 w-4" />
                </button>
                
                {/* Dropdown de categorias */}
                {showCategoryDropdown && (
                  <div 
                    ref={categoryDropdownRef}
                    className="absolute right-0 sm:right-auto left-0 sm:left-auto z-50 mt-1 w-full sm:w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
                  >
                    <div className="py-1 max-h-[60vh] overflow-y-auto">
                      <button
                        onClick={() => handleCategorySelect(null)}
                        className={`w-full text-left px-4 py-2.5 sm:py-2 text-sm ${!selectedCategory ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'}`}
                      >
                        Todas as categorias
                      </button>
                      {categories && categories.length > 0 ? (
                        categories.map(category => {
                          const count = categoryMappings.get(category.id) || 0;
                          // Mostrar apenas categorias que têm pelo menos um gift card
                          return count > 0 ? (
                            <button 
                              key={category.id}
                              onClick={() => handleCategorySelect(category.id)}
                              className={`w-full text-left px-4 py-2.5 sm:py-2 text-sm ${selectedCategory === category.id ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'}`}
                            >
                              {category.name} <span className="text-xs ml-1 opacity-75">({count})</span>
                            </button>
                          ) : null;
                        })
                      ) : null}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Botões de visualização e filtros */}
              <div className="flex items-center bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm flex-grow md:flex-grow-0">
                <button 
                  onClick={() => setViewMode('grid')}
                  className={`p-2 flex-1 md:flex-initial flex items-center justify-center md:justify-start ${viewMode === 'grid' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
                  aria-label="Visualização em grade"
                >
                  <Grid2X2 className="h-4 w-4 mr-0 md:mr-1.5" />
                  <span className="text-sm font-medium hidden md:inline">Grade</span>
                </button>
                <div className="h-6 border-r border-gray-200"></div>
                <button 
                  onClick={() => setViewMode('list')}
                  className={`p-2 flex-1 md:flex-initial flex items-center justify-center md:justify-start ${viewMode === 'list' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
                  aria-label="Visualização em lista"
                >
                  <ListFilter className="h-4 w-4 mr-0 md:mr-1.5" />
                  <span className="text-sm font-medium hidden md:inline">Lista</span>
                </button>
                <div className="h-6 border-r border-gray-200"></div>
                <button 
                  onClick={() => setShowFilters((prev) => !prev)}
                  className={`p-2 flex-1 md:flex-initial flex items-center justify-center md:justify-start ${showFilters ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-50'} relative`}
                  aria-label="Filtros"
                >
                  <Sliders className={`h-5 w-5 md:h-4 md:w-4 mr-0 md:mr-1.5 ${showFilters ? 'text-blue-600' : ''}`} />
                  <span className="text-sm font-medium hidden md:inline">Filtros</span>
                  {(selectedCategory !== null || sortBy !== 'newest') && (
                    <span className="ml-1 flex h-5 w-5 md:h-4 md:w-4 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white">
                      {selectedCategory !== null && sortBy !== 'newest' ? 2 : 1}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
          
          {/* Filtros expandidos */}
          <div 
            className={`transition-all duration-300 ease-in-out overflow-hidden ${
              showFilters 
                ? 'max-h-[2000px] opacity-100 mb-5 mt-3 visible'
                : 'max-h-0 opacity-0 invisible'
            }`}
          >
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-gray-800">Filtros</h3>
                {(selectedCategory !== null || sortBy !== 'newest') && (
                  <button 
                    onClick={clearFilters}
                    className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                  >
                    <span>Limpar todos</span>
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
                {/* Categorias */}
                <div>
                  <div className="flex items-center justify-between mb-3">
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
                        className={`px-3 py-2.5 sm:px-4 sm:py-2 text-sm rounded-lg transition-all duration-200 flex items-center justify-center ${!selectedCategory ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
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
                              className={`px-3 py-2.5 sm:px-4 sm:py-2 text-sm rounded-lg transition-all duration-200 flex items-center justify-center ${selectedCategory === category.id ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
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
                  <div className="flex flex-col sm:flex-row flex-wrap gap-2">
                    <button 
                      onClick={() => setSortBy('newest')}
                      className={`px-3 py-2.5 sm:px-4 sm:py-2 text-sm rounded-lg transition-all duration-200 flex items-center justify-center ${sortBy === 'newest' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                    >
                      Mais recentes
                    </button>
                    <button 
                      onClick={() => setSortBy('price-asc')}
                      className={`px-3 py-2.5 sm:px-4 sm:py-2 text-sm rounded-lg transition-all duration-200 flex items-center justify-center ${sortBy === 'price-asc' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                    >
                      Menor preço
                    </button>
                    <button 
                      onClick={() => setSortBy('price-desc')}
                      className={`px-3 py-2.5 sm:px-4 sm:py-2 text-sm rounded-lg transition-all duration-200 flex items-center justify-center ${sortBy === 'price-desc' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                    >
                      Maior preço
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
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
          <div 
            ref={cardsContainerRef}
            className={
              viewMode === 'grid' 
                ? "gift-card-container relative"
                : "flex flex-col space-y-6 relative"
            }
          >
            {renderGiftCards()}
            
            {/* Elemento sentinela para detecção de scroll - otimizado */}
            {displayedCards.length < filteredCards.length && (
              <div 
                id="cards-sentinel" 
                ref={sentinelRef}
                className="h-20 w-full flex items-center justify-center my-4"
              >
                {loadingMore ? (
                  <div className="flex flex-col items-center space-y-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-4 h-4 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-4 h-4 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                    <span className="text-sm text-gray-500">Carregando mais items...</span>
                  </div>
                ) : (
                  <button 
                    onClick={loadMoreCards}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm transition-colors flex items-center gap-2"
                  >
                    <span>Carregar mais</span>
                    <ChevronDown className="h-4 w-4" />
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </LoadingOptimizer>
    </div>
  );
};

export default GiftCardGrid;
