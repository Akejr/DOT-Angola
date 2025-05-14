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
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoryMappings, setCategoryMappings] = useState<Map<string, number>>(new Map());
  const categoryDropdownRef = useRef<HTMLDivElement>(null);
  const cardsContainerRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const [selectedCategoryName, setSelectedCategoryName] = useState<string | null>(null);
  // Estado para controlar se estamos em mobile ou desktop
  const [isMobile, setIsMobile] = useState(false);
  // Referência para o objeto window
  const windowRef = useRef<Window | null>(null);

  // Use the external selectedCategory from props if provided, otherwise use internal state
  const selectedCategory = externalSelectedCategory !== undefined ? externalSelectedCategory : internalSelectedCategory;

  // Efeito para detectar se estamos em mobile ou desktop
  useEffect(() => {
    // Verificar se estamos no navegador
    if (typeof window !== 'undefined') {
      windowRef.current = window;
      
      // Função para verificar o tamanho da tela
      const checkIfMobile = () => {
        setIsMobile(window.innerWidth < 768); // 768px é o breakpoint do md no Tailwind
      };
      
      // Verificar inicialmente
      checkIfMobile();
      
      // Adicionar listener para redimensionamento
      window.addEventListener('resize', checkIfMobile);
      
      // Limpar listener quando o componente for desmontado
      return () => {
        window.removeEventListener('resize', checkIfMobile);
      };
    }
  }, []);

  // Efeito para definir o número inicial de cards a mostrar com base no dispositivo
  useEffect(() => {
    if (isMobile) {
      setVisibleCardCount(6); // No mobile, mostrar 6 cards
    } else {
      setVisibleCardCount(12); // No desktop, mostrar 12 cards
    }
  }, [isMobile]);

  // Efeito para buscar o nome da categoria selecionada
  useEffect(() => {
    // Apenas se tiver uma categoria selecionada
    if (selectedCategory) {
      const fetchCategoryName = async () => {
        // Se já temos categorias carregadas, procurar nelas
        if (categories.length > 0) {
          const category = categories.find(c => c.id === selectedCategory);
          if (category) {
            console.log(`Nome da categoria encontrado em cache: ${category.name}`);
            setSelectedCategoryName(category.name);
            return;
          }
        }
        
        // Se não encontrou nas categorias carregadas, buscar do servidor
        try {
          console.log("Buscando categorias do servidor para nome da categoria selecionada");
          setCategoriesLoading(true);
          const cats = await getCategories();
          setCategories(cats);
          
          const category = cats.find(c => c.id === selectedCategory);
          if (category) {
            console.log(`Nome da categoria encontrado no servidor: ${category.name}`);
            setSelectedCategoryName(category.name);
          } else {
            console.log(`Categoria com ID ${selectedCategory} não encontrada`);
            setSelectedCategoryName("Categoria");
          }
        } catch (error) {
          console.error("Erro ao buscar nome da categoria:", error);
          setSelectedCategoryName("Categoria");
        } finally {
          setCategoriesLoading(false);
        }
      };
      
      fetchCategoryName();
    } else {
      setSelectedCategoryName(null);
    }
  }, [selectedCategory, categories]);

  // Adicionar um event listener para o evento personalizado categoryChanged
  useEffect(() => {
    const handleCategoryChange = (event: any) => {
      const { categoryId, categoryName } = event.detail;
      console.log(`GiftCardGrid: Recebeu evento de categoria alterada: ${categoryName} (${categoryId})`);
      
      // Atualizar o nome da categoria diretamente
      if (categoryName) {
        setSelectedCategoryName(categoryName);
      } else {
        setSelectedCategoryName(null);
      }
      
      // Forçar atualização da UI
      if (showCategoryDropdown) {
        setShowCategoryDropdown(false);
      }
    };
    
    // Registrar o listener
    window.addEventListener('categoryChanged', handleCategoryChange);
    
    // Limpar ao desmontar
    return () => {
      window.removeEventListener('categoryChanged', handleCategoryChange);
    };
  }, [showCategoryDropdown]);

  // Sincronizar com props externas quando elas mudarem
  useEffect(() => {
    if (externalSelectedCategory !== undefined) {
      console.log(`Recebendo categoria externa: ${externalSelectedCategory || 'todas'}`);
      setInternalSelectedCategory(externalSelectedCategory);
      
      // Carregar categorias se estiverem vazias ou se houver uma categoria selecionada
      if (categories.length === 0 || externalSelectedCategory) {
        const loadCats = async () => {
          console.log("Carregando categorias para mostrar o nome da categoria selecionada");
          try {
            const cats = await getCategories();
            console.log(`Carregadas ${cats.length} categorias ao receber categoria externa`);
            setCategories(cats);
            const categoryName = cats.find(c => c.id === externalSelectedCategory)?.name;
            console.log(`Nome da categoria externa: ${categoryName || 'não encontrado'}`);
          } catch (error) {
            console.error("Erro ao carregar categorias:", error);
          }
        };
        loadCats();
      }
    }
  }, [externalSelectedCategory]);

  // Monitorar quando as categorias são carregadas e há uma categoria selecionada
  useEffect(() => {
    if (categories.length > 0 && selectedCategory) {
      const categoryName = categories.find(c => c.id === selectedCategory)?.name;
      console.log(`Categoria selecionada atualizada: ${categoryName || 'não encontrado'} (ID: ${selectedCategory})`);
    }
  }, [categories, selectedCategory]);

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
      
      // Encontrar e exibir o nome da categoria para debug
      const categoryName = categories.find(c => c.id === selectedCategory)?.name;
      console.log(`Nome da categoria selecionada: ${categoryName || 'desconhecido'}`);
      
      const filtered = cards.filter(card => {
        // Verificar se o card tem categorias definidas
        if (!card.gift_card_categories || !Array.isArray(card.gift_card_categories)) {
          return false;
        }
        
        // Verificar se o card pertence à categoria selecionada
        const matchesCategory = card.gift_card_categories.some(relation => {
          if (!relation.categories) return false;
          const categoryId = relation.categories.id;
          const matches = categoryId === selectedCategory;
          if (matches) {
            console.log(`Card ${card.name} pertence à categoria ${selectedCategory}`);
          }
          return matches;
        });
        
        return matchesCategory;
      });
      
      console.log(`Encontrados ${filtered.length} cards para a categoria ${selectedCategory}`);
      return filtered;
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
    setVisibleCardCount(isMobile ? 6 : 12); // Resetar para mostrar apenas os primeiros cards baseado no dispositivo
  }, [selectedCategory, allGiftCards, sortBy, categories, isMobile]);

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

  // Configurar o IntersectionObserver para detecção mais eficiente do scroll - apenas para desktop
  const setupIntersectionObserver = useCallback(() => {
    // Não configurar o IntersectionObserver no mobile
    if (!sentinelRef.current || isMobile) {
      // Se estamos no mobile e o observer existe, desconectá-lo
      if (isMobile && observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
      return;
    }

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
  }, [displayedCards.length, filteredCards.length, loadingMore, isMobile]);

  // Configurar observer quando displayedCards ou filteredCards mudam - apenas para desktop
  useEffect(() => {
    setupIntersectionObserver();
  }, [displayedCards, filteredCards, setupIntersectionObserver, isMobile]);

  // Função para carregar dados
  const loadData = async () => {
    try {
      setLoading(true);
      setCategoriesLoading(true);
      setHasError(false);

      // Carregar gift cards
      try {
        // Carregar categorias e taxas de câmbio em paralelo com os gift cards
        const [cards, cats, rates] = await Promise.all([
          getGiftCards(),
          getCategories(),
          getExchangeRates()
        ]);
        
        console.log(`Carregados ${cards.length} gift cards`);
        console.log(`Carregadas ${cats.length} categorias`);
        
        setAllGiftCards(cards);
        setFilteredCards(cards);
        setDisplayedCards(cards.slice(0, isMobile ? 6 : visibleCardCount));
        setInitialDataLoaded(true);
        
        setCategories(cats);
        setExchangeRates(rates);
        
        // Calcular contagem de gift cards por categoria
        if (cats.length > 0) {
          const categoryCountMap = computeCategoryMappings(cards, cats);
          setCategoryMappings(categoryCountMap);
        }
      } catch (error) {
        console.error("Erro ao carregar gift cards:", error);
        setInitialDataLoaded(true);
        setHasError(true);
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

  // Carregar mais cards - específico por dispositivo
  const loadMoreCards = useCallback(() => {
    if (displayedCards.length >= filteredCards.length || loadingMore) return;
    
    // Iniciar o estado de carregamento
    setLoadingMore(true);
    
    // Se for mobile, escondemos o botão temporariamente
    if (isMobile) {
      const btnVerMais = document.getElementById('btn-ver-mais');
      if (btnVerMais) {
        btnVerMais.style.display = 'none';
      }
    }
    
    // Processar o carregamento de novos cards após um pequeno delay
    setTimeout(() => {
      // Determinar quantos cards carregar com base no dispositivo
      const cardsToAdd = isMobile ? 6 : 8;
      
      // Atualizar o número de cards visíveis
      setVisibleCardCount(prevCount => prevCount + cardsToAdd);
      
      // Esperar que o DOM seja atualizado antes de mostrar o botão novamente
      setTimeout(() => {
        setLoadingMore(false);
        
        // Para mobile: mostrar o botão novamente
        if (isMobile) {
          // Garantir que os novos cards tenham sido renderizados
          setTimeout(() => {
            // Restaurar a visibilidade do botão
            const btnVerMais = document.getElementById('btn-ver-mais');
            if (btnVerMais) {
              btnVerMais.style.display = 'inline-block';
            }
            
            // Rolar até o botão "Ver mais" para garantir que ele esteja visível
            if (sentinelRef.current) {
              window.scrollTo({
                top: sentinelRef.current.offsetTop - 100,
                behavior: 'smooth'
              });
            }
          }, 50);
        }
      }, 200);
    }, 100);
  }, [displayedCards.length, filteredCards.length, loadingMore, isMobile]);

  // Manipulador de seleção de categoria para o botão mobile
  const handleCategorySelect = useCallback((categoryId: string | null) => {
    console.log(`GiftCardGrid: Selecionando categoria: ${categoryId || 'todas'}`);
    
    // Atualizar o estado interno
    setInternalSelectedCategory(categoryId);
    
    // Fechar o dropdown
    setShowCategoryDropdown(false);
    
    // Se tivermos o nome da categoria disponível, atualize-o diretamente
    if (categoryId && categories.length > 0) {
      const category = categories.find(c => c.id === categoryId);
      if (category) {
        setSelectedCategoryName(category.name);
        
        // Disparar evento para notificar outros componentes
        const event = new CustomEvent('categoryChanged', { 
          detail: { 
            categoryId: categoryId,
            categoryName: category.name 
          } 
        });
        window.dispatchEvent(event);
      }
    } else if (!categoryId) {
      setSelectedCategoryName(null);
      
      // Disparar evento para notificar outros componentes sobre reset
      const event = new CustomEvent('categoryChanged', { 
        detail: { 
          categoryId: null,
          categoryName: null 
        } 
      });
      window.dispatchEvent(event);
    }
    
    // Forçar a atualização dos cards filtrados
    if (allGiftCards.length > 0) {
      const filtered = allGiftCards.filter(card => {
        if (!categoryId) return true; // Sem filtro de categoria
        if (!card.gift_card_categories || !Array.isArray(card.gift_card_categories)) return false;
        return card.gift_card_categories.some(relation => 
          relation.categories && relation.categories.id === categoryId
        );
      });
      
      setFilteredCards(filtered);
      // Resetar a contagem para mostrar apenas os primeiros cards com base no dispositivo
      setVisibleCardCount(isMobile ? 6 : 12);
      console.log(`Filtrados ${filtered.length} gift cards de ${allGiftCards.length} para a categoria ${categoryId}`);
    }
  }, [allGiftCards, categories]);

  // Limpar todos os filtros (função mantida para compatibilidade com o FilterSection)
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
    <div className="gift-card-grid-container">
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
              {/* Botão de seleção de categoria - visível apenas no mobile */}
              <div className="relative block md:hidden">
                <button 
                  onClick={() => {
                    // Se não houver categorias carregadas ainda, carregue-as
                    if (categories.length === 0) {
                      setCategoriesLoading(true);
                      getCategories().then(cats => {
                        setCategories(cats);
                        setCategoriesLoading(false);
                      }).catch(err => {
                        console.error("Erro ao carregar categorias:", err);
                        setCategoriesLoading(false);
                      });
                    }
                    setShowCategoryDropdown((prev) => !prev);
                  }}
                  className={`flex items-center justify-center gap-1 px-3 py-2 bg-white border ${selectedCategory ? 'border-blue-300' : 'border-gray-200'} rounded-lg text-sm font-medium ${selectedCategory ? 'text-blue-600' : 'text-gray-700'} hover:bg-gray-50 shadow-sm`}
                  aria-label="Selecionar categoria"
                  aria-expanded={showCategoryDropdown}
                  aria-controls="category-dropdown"
                >
                  <CheckIcon className={`h-4 w-4 ${selectedCategory ? 'text-blue-500' : 'text-gray-500'}`} />
                  <span data-testid="mobile-category-button-text">
                    {selectedCategory
                      ? (selectedCategoryName || (categoriesLoading ? 'Carregando...' : 'Categoria'))
                      : 'Selecionar categoria'
                    }
                  </span>
                  <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${showCategoryDropdown ? 'transform rotate-180' : ''}`} />
                </button>
                
                {/* Dropdown de categorias */}
                {showCategoryDropdown && (
                  <div 
                    id="category-dropdown"
                    ref={categoryDropdownRef}
                    className="absolute right-0 sm:right-auto left-0 sm:left-auto z-50 mt-1 w-full sm:w-64 origin-top-right bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
                    style={{ maxHeight: '350px', overflowY: 'auto' }}
                  >
                    <div className="py-1 max-h-60vh overflow-y-auto">
                      <button
                        type="button"
                        onClick={() => handleCategorySelect(null)}
                        className={`w-full text-left px-4 py-2.5 sm:py-2 text-sm flex items-center ${!selectedCategory ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700 hover:bg-gray-50'}`}
                        data-testid="category-option-all"
                      >
                        {!selectedCategory && <CheckIcon className="h-4 w-4 mr-2 text-blue-500" />}
                        <span className={!selectedCategory ? 'ml-2' : 'ml-6'}>Todas as categorias</span>
                      </button>
                      
                      {categories && categories.length > 0 ? (
                        categories.map(category => {
                          const count = categoryMappings.get(category.id) || 0;
                          // Mostrar apenas categorias que têm pelo menos um gift card
                          return count > 0 ? (
                            <button 
                              key={category.id}
                              type="button"
                              onClick={() => handleCategorySelect(category.id)}
                              className={`w-full text-left px-4 py-2.5 sm:py-2 text-sm flex items-center ${selectedCategory === category.id ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700 hover:bg-gray-50'}`}
                              data-category-id={category.id}
                              data-category-name={category.name}
                              data-testid={`category-option-${category.id}`}
                            >
                              {selectedCategory === category.id && <CheckIcon className="h-4 w-4 mr-2 text-blue-500" />}
                              <span className={selectedCategory === category.id ? 'ml-2' : 'ml-6'}>
                                {category.name} <span className="text-xs ml-1 opacity-75">({count})</span>
                              </span>
                            </button>
                          ) : null;
                        })
                      ) : (
                        <div className="px-4 py-2 text-sm text-gray-500">Nenhuma categoria disponível</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Botões de visualização */}
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
              </div>
            </div>
          </div>
          
          {/* Lista de Gift Cards - layout diferente para mobile e desktop */}
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
            <div id="gift-cards-wrapper">
              {/* Container dos cards - diferente para mobile e desktop */}
              <div 
                ref={cardsContainerRef}
                className={`
                  ${isMobile 
                    ? "grid grid-cols-2 gap-3" 
                    : viewMode === 'grid' 
                      ? "gift-card-container" 
                      : "flex flex-col space-y-6"
                  }
                  ${isMobile ? "mobile-gift-card-display" : ""}
                `}
                style={{ 
                  overflow: isMobile ? 'visible' : 'auto',
                  paddingBottom: isMobile ? '0.5rem' : '0'
                }}
              >
                {renderGiftCards()}
              </div>
              
              {/* Botão "Ver mais" apenas para mobile */}
              {isMobile && displayedCards.length < filteredCards.length && (
                <div 
                  className="my-2 text-center"
                  ref={sentinelRef}
                >
                  {loadingMore ? (
                    <div className="inline-flex items-center justify-center space-x-2 bg-gray-100 px-6 py-2 rounded-lg">
                      <div className="w-3 h-3 rounded-full bg-secondary animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-3 h-3 rounded-full bg-secondary animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-3 h-3 rounded-full bg-secondary animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  ) : (
                    <button 
                      id="btn-ver-mais"
                      onClick={loadMoreCards}
                      className="inline-block px-6 py-2 bg-secondary text-white font-medium text-sm rounded-md shadow-sm hover:shadow-md"
                    >
                      Ver mais
                    </button>
                  )}
                </div>
              )}
              
              {/* Elemento sentinela para desktop (carregamento automático) */}
              {!isMobile && displayedCards.length < filteredCards.length && (
                <div 
                  ref={sentinelRef}
                  className="h-20 w-full flex items-center justify-center my-4"
                >
                  {loadingMore && (
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full bg-secondary animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-3 h-3 rounded-full bg-secondary animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-3 h-3 rounded-full bg-secondary animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </LoadingOptimizer>
    </div>
  );
};

export default GiftCardGrid;
