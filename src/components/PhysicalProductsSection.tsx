import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Filter,
  Search,
  ShoppingCart,
  Star,
  Package,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { 
  getPhysicalProducts, 
  getPhysicalProductCategories,
  getExchangeRates
} from '@/lib/database';

interface PhysicalProduct {
  id: string;
  name: string;
  description: string;
  slug?: string;
  price: number;
  currency: string;
  weight?: number;
  images: string[];
  category_id: string;
  subcategory_id?: string;
  is_featured: boolean;
  is_active: boolean;
  category?: {
    id: string;
    name: string;
  };
  subcategory?: {
    id: string;
    name: string;
  };
}

interface Category {
  id: string;
  name: string;
  description?: string;
  parent_id?: string;
  subcategories?: Category[];
  product_count?: number;
}

interface PhysicalProductsSectionProps {
  onRequestProduct: () => void;
  categoryFilter?: string;
  hideCategories?: boolean;
}

function PhysicalProductsSection({ 
  onRequestProduct, 
  categoryFilter,
  hideCategories = false 
}: PhysicalProductsSectionProps) {
  const [products, setProducts] = useState<PhysicalProduct[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>(categoryFilter || '');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [exchangeRates, setExchangeRates] = useState<any[]>([]);
  const [displayedProducts, setDisplayedProducts] = useState<PhysicalProduct[]>([]);
  const [visibleCount, setVisibleCount] = useState(6);
  const [loadingMore, setLoadingMore] = useState(false);
  const [showCategoriesMobile, setShowCategoriesMobile] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  // Atualizar produtos exibidos quando filtros mudarem
  useEffect(() => {
    const filtered = products.filter(product => {
      const matchesCategory = !selectedCategory || 
        product.category_id === selectedCategory || 
        product.subcategory_id === selectedCategory;
      
      const matchesSearch = !searchTerm || 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesCategory && matchesSearch && product.is_active;
    });

    // Resetar para mostrar apenas os primeiros 6 quando filtros mudarem
    setDisplayedProducts(filtered.slice(0, 6));
    setVisibleCount(6);
  }, [products, selectedCategory, searchTerm]);

  // Atualizar selectedCategory quando categoryFilter mudar
  useEffect(() => {
    if (categoryFilter) {
      setSelectedCategory(categoryFilter);
    }
  }, [categoryFilter]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [productsData, categoriesData, ratesData] = await Promise.all([
        getPhysicalProducts(),
        getPhysicalProductCategories(),
        getExchangeRates()
      ]);
      
      setProducts(productsData as unknown as PhysicalProduct[]);
      setCategories(categoriesData as unknown as Category[]);
      setExchangeRates(ratesData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const convertPriceToKwanzas = (price: number, currency: string) => {
    const rate = exchangeRates.find(r => r.currency === currency);
    if (rate) {
      const priceInKwanzas = price * rate.rate;
      return priceInKwanzas.toLocaleString('pt-AO', { maximumFractionDigits: 0 });
    }
    return "Preço indisponível";
  };

  const loadMoreProducts = async () => {
    setLoadingMore(true);
    
    // Simular delay para mostrar loading
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const filtered = products.filter(product => {
      const matchesCategory = !selectedCategory || 
        product.category_id === selectedCategory || 
        product.subcategory_id === selectedCategory;
      
      const matchesSearch = !searchTerm || 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesCategory && matchesSearch && product.is_active;
    });

    const newVisibleCount = visibleCount + 6;
    setDisplayedProducts(filtered.slice(0, newVisibleCount));
    setVisibleCount(newVisibleCount);
    setLoadingMore(false);
  };

  const featuredProducts = products.filter(p => p.is_featured && p.is_active).slice(0, 6);

  // Calcular contagem de produtos por categoria
  const getProductCountForCategory = (categoryId: string) => {
    return products.filter(p => 
      p.is_active && (p.category_id === categoryId || p.subcategory_id === categoryId)
    ).length;
  };

  // Função para gerar slug da categoria
  const generateCategorySlug = (categoryName: string) => {
    return categoryName
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Botão para mostrar/ocultar categorias no mobile */}
      {!hideCategories && (
        <div className="lg:hidden">
          <button
            onClick={() => setShowCategoriesMobile(!showCategoriesMobile)}
            className="w-full bg-white border border-gray-200 rounded-lg p-4 flex items-center justify-between text-gray-900 font-medium hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center">
              <Filter className="w-5 h-5 mr-2 text-blue-600" />
              Filtrar por Categoria
            </div>
            {showCategoriesMobile ? (
              <ChevronUp className="w-5 h-5 text-gray-600" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-600" />
            )}
          </button>
        </div>
      )}

      {/* Sidebar - Categorias (Esquerda) */}
      {!hideCategories && (
        <div className={`lg:w-1/4 ${showCategoriesMobile ? 'block' : 'hidden lg:block'}`}>
          <div className="bg-white rounded-lg shadow-sm border p-6 lg:sticky lg:top-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Filter className="w-5 h-5 mr-2 text-blue-600" />
              Categorias
            </h3>
            
            <div className="space-y-2">
              <button
                onClick={() => setSelectedCategory('')}
                className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                  selectedCategory === '' 
                    ? 'bg-blue-100 text-blue-700 font-medium' 
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                Todas as Categorias ({products.filter(p => p.is_active).length})
              </button>
              
              {categories.map((category) => (
                <div key={category.id}>
                  <button
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                      selectedCategory === category.id 
                        ? 'bg-blue-100 text-blue-700 font-medium' 
                        : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    {category.name} ({getProductCountForCategory(category.id)})
                  </button>
                  
                  {/* Subcategorias */}
                  {category.subcategories && category.subcategories.map((sub) => (
                    <button
                      key={sub.id}
                      onClick={() => setSelectedCategory(sub.id)}
                      className={`w-full text-left px-8 py-1 text-sm rounded-lg transition-colors ${
                        selectedCategory === sub.id 
                          ? 'bg-blue-50 text-blue-600 font-medium' 
                          : 'hover:bg-gray-50 text-gray-600'
                      }`}
                    >
                      {sub.name} ({getProductCountForCategory(sub.id)})
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Lista de Produtos (Direita) */}
      <div className={hideCategories ? "w-full" : "lg:w-3/4"}>
        {/* Barra de Pesquisa */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Pesquisar produtos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Produtos em Destaque */}
        {featuredProducts.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg lg:text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Star className="w-4 lg:w-5 h-4 lg:h-5 mr-2 text-yellow-500" />
              <span className="hidden sm:inline">Produtos em Destaque</span>
              <span className="sm:hidden">Destaques</span>
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 mb-8">
              {featuredProducts.map((product) => (
                <Link key={product.id} to={`/produto/${product.slug || product.id}`} className="group bg-white rounded-lg shadow-sm border hover:shadow-lg transition-all duration-200 block overflow-hidden">
                  <div className="relative">
                    <div className="aspect-square bg-gray-50 rounded-t-lg overflow-hidden">
                      <img
                        src={product.images[0] || '/placeholder-product.jpg'}
                        alt={product.name}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="absolute top-2 left-2">
                      <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                        Destaque
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-3 lg:p-4 bg-white">
                    <h4 className="font-semibold text-gray-900 mb-2 lg:mb-3 line-clamp-2 min-h-[2.5rem] lg:min-h-[3rem] leading-snug text-sm lg:text-base">
                      {product.name}
                    </h4>
                    
                    <div className="space-y-2 lg:space-y-3">
                      <div className="flex items-baseline gap-1">
                        <span className="text-lg lg:text-2xl font-bold text-[#01042D]">{convertPriceToKwanzas(product.price, product.currency)}</span>
                        <span className="text-sm lg:text-lg font-semibold text-[#01042D]">Kz</span>
                      </div>
                      
                      <div className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 lg:py-3 px-3 lg:px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 text-sm lg:text-base">
                        <ShoppingCart className="w-3 lg:w-4 h-3 lg:h-4" />
                        <span>Comprar</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Todos os Produtos */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <h3 className="text-xl lg:text-2xl font-bold text-gray-900 flex items-center">
              <Package className="w-5 lg:w-6 h-5 lg:h-6 mr-2 lg:mr-3 text-blue-600" />
              <span className="hidden sm:inline">{selectedCategory ? 'Produtos da Categoria' : 'Todos os Produtos'}</span>
              <span className="sm:hidden">{selectedCategory ? 'Categoria' : 'Produtos'}</span>
              <span className="bg-blue-100 text-blue-700 text-sm lg:text-lg font-semibold px-2 lg:px-3 py-1 rounded-full ml-2 lg:ml-3">
                {(() => {
                  return products.filter(product => {
                    const matchesCategory = !selectedCategory || 
                      product.category_id === selectedCategory || 
                      product.subcategory_id === selectedCategory;
                    
                    const matchesSearch = !searchTerm || 
                      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      product.description.toLowerCase().includes(searchTerm.toLowerCase());
                    
                    return matchesCategory && matchesSearch && product.is_active;
                  }).length;
                })()}
              </span>
            </h3>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-6 text-lg">Carregando produtos incríveis...</p>
          </div>
        ) : displayedProducts.length === 0 ? (
          <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200">
            <Package className="w-20 h-20 text-gray-400 mx-auto mb-6" />
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              Nenhum produto encontrado
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Não encontramos produtos com os critérios selecionados. Que tal solicitar um produto específico?
            </p>
            <button
              onClick={onRequestProduct}
              className="bg-gradient-to-r from-[#01042D] to-[#020A5E] hover:from-[#020A5E] hover:to-[#030D8B] text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Solicitar Produto Específico
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
              {displayedProducts.map((product) => (
              <Link key={product.id} to={`/produto/${product.slug || product.id}`} className="group bg-white rounded-lg shadow-sm border hover:shadow-lg transition-all duration-200 block overflow-hidden">
                <div className="relative">
                  <div className="aspect-square bg-gray-50 rounded-t-lg overflow-hidden">
                    <img
                      src={product.images[0] || '/placeholder-product.jpg'}
                      alt={product.name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  {product.is_featured && (
                    <div className="absolute top-2 left-2">
                      <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                        Destaque
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="p-3 lg:p-4 bg-white">
                  <h4 className="font-semibold text-gray-900 mb-2 lg:mb-3 line-clamp-2 min-h-[2.5rem] lg:min-h-[3rem] leading-snug text-sm lg:text-base">
                    {product.name}
                  </h4>
                  
                  <div className="space-y-2 lg:space-y-3">
                    <div className="flex items-baseline gap-1">
                      <span className="text-lg lg:text-2xl font-bold text-[#01042D]">{convertPriceToKwanzas(product.price, product.currency)}</span>
                      <span className="text-sm lg:text-lg font-semibold text-[#01042D]">Kz</span>
                    </div>
                    
                    <div className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 lg:py-3 px-3 lg:px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 text-sm lg:text-base">
                      <ShoppingCart className="w-3 lg:w-4 h-3 lg:h-4" />
                      <span>Comprar</span>
                    </div>
                  </div>
                </div>
              </Link>
              ))}
            </div>
            
            {/* Botão Ver Mais */}
            {(() => {
              const totalFiltered = products.filter(product => {
                const matchesCategory = !selectedCategory || 
                  product.category_id === selectedCategory || 
                  product.subcategory_id === selectedCategory;
                
                const matchesSearch = !searchTerm || 
                  product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  product.description.toLowerCase().includes(searchTerm.toLowerCase());
                
                return matchesCategory && matchesSearch && product.is_active;
              }).length;
              
              return visibleCount < totalFiltered && (
                <div className="text-center mt-8">
                  <button
                    onClick={loadMoreProducts}
                    disabled={loadingMore}
                    className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-8 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 mx-auto"
                  >
                    {loadingMore ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Carregando...</span>
                      </>
                    ) : (
                      <>
                        <Package className="w-4 h-4" />
                        <span>Ver mais ({Math.min(6, totalFiltered - visibleCount)} produtos)</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })()}
          </>
        )}
      </div>
    </div>
  );
}

export default PhysicalProductsSection;