import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ShoppingBag, Bell, X, Tag } from "lucide-react";
import NotificationDropdown from "./NotificationDropdown";
import CartDropdown from "./CartDropdown";
import { getActiveNotifications, getGiftCards, getExchangeRates } from "@/lib/database";
import { useCart } from "@/contexts/CartContext";
import { Link, useNavigate } from "react-router-dom";
import { useSearch } from "@/contexts/SearchContext";
import { GiftCard } from "@/types/supabase";

const Header = () => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const { totalItems, cartOpen, setCartOpen } = useCart();
  const { searchTerm, setSearchTerm } = useSearch();
  const [inputFocused, setInputFocused] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [searchResults, setSearchResults] = useState<GiftCard[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [allGiftCards, setAllGiftCards] = useState<GiftCard[]>([]);
  const [exchangeRates, setExchangeRates] = useState<Array<{currency: string, rate: number}>>([]);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const mobileSearchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  
  // Estado para controlar a exibição da barra de pesquisa móvel
  const [showMobileSearch, setShowMobileSearch] = useState(false);

  useEffect(() => {
    const loadNotificationCount = async () => {
      try {
        const notifications = await getActiveNotifications();
        setNotificationCount(notifications.length);
      } catch (error) {
        console.error('Erro ao carregar contagem de notificações:', error);
      }
    };

    // Carregar apenas uma vez ao montar o componente
    loadNotificationCount();
    
    // Comentando o intervalo para evitar atualizações constantes
    // const interval = setInterval(loadNotificationCount, 5 * 60 * 1000);
    
    // return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Carregar todos os gift cards para pesquisa
    const loadGiftCards = async () => {
      try {
        const cards = await getGiftCards();
        setAllGiftCards(cards);
      } catch (error) {
        console.error('Erro ao carregar gift cards:', error);
      }
    };

    loadGiftCards();
  }, []);

  useEffect(() => {
    // Função para lidar com cliques fora do container de pesquisa
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
      
      // Fechar pesquisa móvel quando clicar fora
      if (mobileSearchRef.current && !mobileSearchRef.current.contains(event.target as Node)) {
        setShowMobileSearch(false);
      }
    };

    // Adicionar event listener
    document.addEventListener('mousedown', handleClickOutside);
    
    // Limpar event listener
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (searchTerm.trim().length > 0) {
      setIsSearching(true);
      setShowResults(true);
      
      const searchTermLower = searchTerm.toLowerCase().trim();
      
      // Filtrar os gift cards pelo termo de pesquisa
      const filtered = allGiftCards.filter(card => {
        // Pesquisar no nome do gift card
        const nameMatch = card.name.toLowerCase().includes(searchTermLower);
        
        // Pesquisar na descrição do gift card (se disponível)
        const descriptionMatch = card.description ? 
          card.description.toLowerCase().includes(searchTermLower) : false;
        
        // Pesquisar nas categorias do gift card
        const categoryMatch = card.gift_card_categories ? 
          card.gift_card_categories.some(
            cat => cat.categories && cat.categories.name.toLowerCase().includes(searchTermLower)
          ) : false;
        
        return nameMatch || descriptionMatch || categoryMatch;
      });
      
      // Limitar a 5 resultados para o dropdown
      setSearchResults(filtered.slice(0, 5));
      setIsSearching(false);
    } else {
      setShowResults(false);
      setSearchResults([]);
    }
  }, [searchTerm, allGiftCards]);

  useEffect(() => {
    // Carregar taxas de câmbio
    const loadExchangeRates = async () => {
      try {
        const rates = await getExchangeRates();
        setExchangeRates(rates);
      } catch (error) {
        console.error('Erro ao carregar taxas de câmbio:', error);
      }
    };
    
    loadExchangeRates();
  }, []);

  const toggleNotifications = () => {
    setShowNotifications(prev => !prev);
    setCartOpen(false); // Fechar o carrinho ao abrir as notificações
  };

  const toggleCart = () => {
    setCartOpen(!cartOpen);
    setShowNotifications(false); // Fechar as notificações ao abrir o carrinho
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      // Redirecionar para a página do gift card se houver apenas um resultado
      if (searchResults.length === 1) {
        navigate(`/gift-card/${searchResults[0].slug || searchResults[0].id}`);
      } else if (searchResults.length > 0) {
        // Se houver mais de um resultado, mantenha o dropdown aberto
        setShowResults(true);
      }
    }
  };

  const clearSearch = () => {
    setSearchTerm('');
    setShowResults(false);
  };

  const getMainCategory = (giftCard: GiftCard) => {
    if (giftCard.gift_card_categories && 
        giftCard.gift_card_categories.length > 0 && 
        giftCard.gift_card_categories[0].categories) {
      return giftCard.gift_card_categories[0].categories.name;
    }
    return null;
  };

  const handleResultClick = (cardId: string) => {
    setShowResults(false);
    setSearchTerm('');
    navigate(`/gift-card/${cardId}`);
  };

  const formatPrice = (price: number, currency: string) => {
    if (currency === 'KWZ') {
      return `${price.toLocaleString('pt-AO', { maximumFractionDigits: 0 })} Kz`;
    }
    
    // Converter para kwanzas usando a taxa de câmbio
    const rate = exchangeRates.find(r => r.currency === currency)?.rate || 0;
    const priceInKwanzas = price * rate;
    
    return `${priceInKwanzas.toLocaleString('pt-AO', { maximumFractionDigits: 0 })} Kz`;
  };

  const toggleMobileSearch = () => {
    setShowMobileSearch(prev => !prev);
    if (!showMobileSearch) {
      // Focar o input quando abrir a pesquisa móvel
      setTimeout(() => {
        const mobileInput = document.getElementById('mobile-search-input');
        if (mobileInput) {
          mobileInput.focus();
        }
      }, 300); // Tempo suficiente para a animação começar
    }
  };

  return (
    <header className="py-4 px-6 bg-dot-white rounded-t-3xl flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-2">
        <Link to="/">
          <img 
            src="/images/sczs.png" 
            alt="Logo" 
            width={100} 
            height={35}
            className="h-8 w-auto"
          />
        </Link>
      </div>
      
      {/* Desktop search */}
      <div 
        ref={searchContainerRef}
        className="relative w-1/2 mx-4 hidden md:block z-50"
      >
        <form onSubmit={handleSearch}>
          <Input 
            placeholder="Pesquisar gift cards..." 
            className={`pl-10 pr-${searchTerm ? '10' : '4'} py-2 bg-dot-light-gray rounded-full w-full transition-all duration-300 focus:w-full ${inputFocused ? 'ring-2 ring-blue-500' : ''}`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => {
              setInputFocused(true);
              if (searchTerm.trim().length > 0) setShowResults(true);
            }}
            onBlur={() => setInputFocused(false)}
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          
          {searchTerm && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </form>
        
        {/* Dropdown de resultados de pesquisa */}
        {showResults && (
          <div className="absolute mt-2 w-full bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden z-50 max-h-[400px] overflow-y-auto">
            {isSearching ? (
              <div className="p-4 text-center">
                <div className="inline-block w-6 h-6 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
                <p className="mt-2 text-sm text-gray-500">Buscando resultados...</p>
              </div>
            ) : searchResults.length > 0 ? (
              <>
                <div className="p-3 border-b border-gray-100">
                  <h3 className="text-sm font-medium text-gray-700">Resultados da Pesquisa</h3>
                </div>
                <div>
                  {searchResults.map(result => (
                    <div 
                      key={result.id} 
                      className="border-b border-gray-100 last:border-0 p-3 hover:bg-gray-50 cursor-pointer transition-colors duration-150"
                      onClick={() => handleResultClick(result.id)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-md overflow-hidden bg-gray-100 flex-shrink-0">
                          <img 
                            src={result.image_url || '/images/placeholder.png'} 
                            alt={result.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-gray-800 line-clamp-1">{result.name}</h4>
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-sm font-semibold text-blue-600">
                              {formatPrice(result.original_price, result.currency)}
                            </span>
                            {getMainCategory(result) && (
                              <div className="inline-flex items-center bg-gray-100 text-gray-700 text-xs font-medium px-2 py-0.5 rounded">
                                <Tag className="w-3 h-3 mr-1" />
                                {getMainCategory(result)}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-2 text-center border-t border-gray-100">
                  <button
                    onClick={() => {
                      setShowResults(false);
                      navigate(`/`);
                    }}
                    className="text-xs text-blue-600 hover:underline"
                  >
                    Ver todos os resultados
                  </button>
                </div>
              </>
            ) : (
              <div className="p-4 text-center">
                <p className="text-sm text-gray-500">Nenhum resultado encontrado para "{searchTerm}"</p>
                <p className="mt-1 text-xs text-gray-400">Tente diferentes palavras-chave ou navegue por categorias</p>
              </div>
            )}
          </div>
        )}
      </div>
      
      <div className="flex items-center gap-4">
        {/* Botão de pesquisa móvel */}
        <Button 
          variant="ghost" 
          size="icon" 
          className="rounded-full text-dot-gray-text hover:text-dot-brand-blue hover:bg-blue-50 transition-colors duration-300 md:hidden"
          onClick={toggleMobileSearch}
        >
          <Search className="h-6 w-6" />
        </Button>

        <div className="relative">
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full text-dot-gray-text hover:text-dot-brand-blue hover:bg-blue-50 transition-colors duration-300 relative"
            onClick={toggleNotifications}
          >
            <Bell className="h-6 w-6" />
            {notificationCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-dot-brand-blue text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {notificationCount > 9 ? '9+' : notificationCount}
              </span>
            )}
          </Button>
          
          {showNotifications && (
            <NotificationDropdown onClose={() => setShowNotifications(false)} />
          )}
        </div>
        
        <div className="relative">
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full text-dot-gray-text hover:text-dot-brand-blue hover:bg-blue-50 transition-colors duration-300 relative"
            onClick={toggleCart}
          >
            <ShoppingBag className="h-6 w-6" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-dot-brand-blue text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {totalItems > 9 ? '9+' : totalItems}
              </span>
            )}
          </Button>
          
          {cartOpen && (
            <CartDropdown onClose={() => setCartOpen(false)} />
          )}
        </div>
      </div>

      {/* Barra de pesquisa móvel com animação */}
      <div 
        ref={mobileSearchRef}
        className={`fixed top-0 left-0 right-0 bg-white p-4 shadow-lg transform transition-all duration-300 ease-in-out z-50 ${
          showMobileSearch 
            ? 'translate-y-0 opacity-100' 
            : '-translate-y-full opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex items-center gap-2">
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <Input 
                id="mobile-search-input"
                placeholder="Pesquisar gift cards..." 
                className="pl-10 pr-10 py-2 bg-dot-light-gray rounded-full w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => {
                  if (searchTerm.trim().length > 0) setShowResults(true);
                }}
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              
              {searchTerm ? (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400"
                >
                  <X className="h-4 w-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowMobileSearch(false)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </form>
        </div>
        
        {/* Resultados da pesquisa móvel */}
        {showResults && searchTerm.trim() && (
          <div className="mt-3 bg-white rounded-xl shadow-inner border border-gray-100 max-h-[60vh] overflow-y-auto">
            {isSearching ? (
              <div className="p-4 text-center">
                <div className="inline-block w-6 h-6 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
                <p className="mt-2 text-sm text-gray-500">Buscando resultados...</p>
              </div>
            ) : searchResults.length > 0 ? (
              <>
                <div className="p-3 border-b border-gray-100">
                  <h3 className="text-sm font-medium text-gray-700">Resultados da Pesquisa</h3>
                </div>
                <div>
                  {searchResults.map(result => (
                    <div 
                      key={result.id} 
                      className="border-b border-gray-100 last:border-0 p-3 hover:bg-gray-50 cursor-pointer transition-colors duration-150"
                      onClick={() => {
                        handleResultClick(result.id);
                        setShowMobileSearch(false);
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-md overflow-hidden bg-gray-100 flex-shrink-0">
                          <img 
                            src={result.image_url || '/images/placeholder.png'} 
                            alt={result.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-gray-800 line-clamp-1">{result.name}</h4>
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-sm font-semibold text-blue-600">
                              {formatPrice(result.original_price, result.currency)}
                            </span>
                            {getMainCategory(result) && (
                              <div className="inline-flex items-center bg-gray-100 text-gray-700 text-xs font-medium px-2 py-0.5 rounded">
                                <Tag className="w-3 h-3 mr-1" />
                                {getMainCategory(result)}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-2 text-center border-t border-gray-100">
                  <button
                    onClick={() => {
                      setShowResults(false);
                      setShowMobileSearch(false);
                      navigate(`/`);
                    }}
                    className="text-xs text-blue-600 hover:underline"
                  >
                    Ver todos os resultados
                  </button>
                </div>
              </>
            ) : (
              <div className="p-4 text-center">
                <p className="text-sm text-gray-500">Nenhum resultado encontrado para "{searchTerm}"</p>
                <p className="mt-1 text-xs text-gray-400">Tente diferentes palavras-chave ou navegue por categorias</p>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
