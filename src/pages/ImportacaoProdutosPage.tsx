import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Header from '@/components/Header';
import Navigation from '@/components/Navigation';
import { DynamicSEO } from '@/components/DynamicSEO';
import { seoService } from '@/lib/seoService';
import { 
  Package, 
  Truck, 
  Shield, 
  Clock, 
  ArrowRight, 
  Check, 
  Globe, 
  Star,
  Filter,
  Search,
  ShoppingCart,
  Heart,
  Eye,
  X,
  User,
  Euro,
  ChevronDown
} from 'lucide-react';
import { 
  getPhysicalProducts, 
  getPhysicalProductCategories,
  getExchangeRates,
  createImportRequest
} from '@/lib/database';
import PhysicalProductsSection from '@/components/PhysicalProductsSection';
import '@/lib/updateSlugs'; // Disponibiliza a função updateProductSlugs globalmente

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

export default function ImportacaoProdutosPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [selectedPage, setSelectedPage] = useState(1);
  const [products, setProducts] = useState<PhysicalProduct[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [exchangeRates, setExchangeRates] = useState<any[]>([]);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [seoData, setSeoData] = useState<any>(null);
  const [requestFormData, setRequestFormData] = useState({
    productName: '',
    productLink: '',
    urgencyLevel: 'not-urgent' as 'urgent' | 'not-urgent',
    fullName: '',
    email: '',
    phone: '',
    address: '',
    province: 'Luanda'
  });

  useEffect(() => {
    loadData();
  }, []);

  // Gerar SEO dinâmico quando produtos e categorias carregarem
  useEffect(() => {
    if (products.length > 0 && categories.length > 0) {
      const featuredProducts = products.filter(p => p.is_featured && p.is_active);
      const seoMetadata = seoService.generateImportPageSEO(categories, featuredProducts);
      setSeoData(seoMetadata);
    }
  }, [products, categories]);

  // Verificar parâmetros da URL para categoria selecionada
  useEffect(() => {
    const categoryParam = searchParams.get('categoria');
    if (categoryParam && categories.length > 0) {
      // Procurar categoria por nome (slug)
      const foundCategory = findCategoryBySlug(categoryParam, categories);
      if (foundCategory) {
        setSelectedCategory(foundCategory.id);
        // Fazer scroll para a seção de produtos após um pequeno delay
        setTimeout(() => {
          scrollToProducts();
        }, 500);
      }
    }
  }, [searchParams, categories]);

  const findCategoryBySlug = (slug: string, allCategories: Category[]): Category | null => {
    for (const category of allCategories) {
      if (generateSlug(category.name) === slug) {
        return category;
      }
      if (category.subcategories) {
        for (const subcat of category.subcategories) {
          if (generateSlug(subcat.name) === slug) {
            return subcat;
          }
        }
      }
    }
    return null;
  };

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

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

  const handlePageChange = (id: number) => {
    setSelectedPage(id);
  };

  const convertPriceToKwanzas = (price: number, currency: string) => {
    const rate = exchangeRates.find(r => r.currency === currency);
    if (rate) {
      const priceInKwanzas = price * rate.rate;
      return priceInKwanzas.toLocaleString('pt-AO', { maximumFractionDigits: 0 }) + " Kz";
    }
    return "Preço indisponível";
  };

  const handleRequestProduct = () => {
    setShowRequestForm(true);
  };

  const scrollToProducts = () => {
    const productsSection = document.querySelector('[data-products-section]');
    if (productsSection) {
      productsSection.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar campos obrigatórios
    if (!requestFormData.productName.trim()) {
      alert('Por favor, informe o nome do produto.');
      return;
    }
    
    if (!requestFormData.fullName.trim()) {
      alert('Por favor, informe seu nome completo.');
      return;
    }
    
    if (!requestFormData.email.trim()) {
      alert('Por favor, informe seu email.');
      return;
    }
    
    if (!requestFormData.phone.trim()) {
      alert('Por favor, informe seu telefone.');
      return;
    }
    
    try {
      console.log('Enviando solicitação de importação...');
      
      const requestData = {
        product_name: requestFormData.productName.trim(),
        product_link: requestFormData.productLink?.trim() || null,
        has_images: false,
        images: null,
        urgency_level: requestFormData.urgencyLevel,
        full_name: requestFormData.fullName.trim(),
        email: requestFormData.email.trim(),
        phone: requestFormData.phone.trim(),
        address: requestFormData.address.trim(),
        province: requestFormData.province,
        status: 'pending' as const
      };
      
      console.log('Dados da solicitação:', requestData);
      
      const result = await createImportRequest(requestData);
      console.log('Solicitação criada:', result);
      
      setShowRequestForm(false);
      setRequestFormData({
        productName: '',
        productLink: '',
        urgencyLevel: 'not-urgent' as 'urgent' | 'not-urgent',
        fullName: '',
        email: '',
        phone: '',
        address: '',
        province: 'Luanda'
      });
      
      window.location.href = '/importacao/obrigado';
    } catch (error) {
      console.error('Erro completo ao enviar solicitação:', error);
      alert(`Erro ao enviar solicitação: ${error.message || 'Erro desconhecido'}. Tente novamente.`);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesCategory = !selectedCategory || 
      product.category_id === selectedCategory || 
      product.subcategory_id === selectedCategory;
    
    const matchesSearch = !searchTerm || 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesCategory && matchesSearch && product.is_active;
  });

  const featuredProducts = products.filter(p => p.is_featured && p.is_active).slice(0, 6);



  return (
    <>
      <DynamicSEO seoData={seoData} />
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-0 sm:p-4">
        <div className="max-w-6xl w-full bg-white rounded-none sm:rounded-3xl shadow-xl overflow-hidden">
          <Header />
          <Navigation onPageChange={handlePageChange} />
          
          <div className="flex-grow flex flex-col">
            {/* Hero Section - Igual ao tamanho da página de transferências */}
            <div className="px-4 sm:px-6 py-8 sm:py-16">
              <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-center">
                {/* Conteúdo da esquerda */}
                <div className="text-center lg:text-left">
                  <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 rounded-full px-4 py-2 mb-6">
                    <Package className="w-4 h-4" />
                    <span className="text-sm font-medium">Importação de Produtos</span>
                  </div>
                  
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-800 mb-6 leading-tight">
                    Importação de
                    <span className="block text-blue-600">
                      Produtos da Europa
                    </span>
                  </h1>
                  
                  <p className="text-lg sm:text-xl text-gray-600 mb-8 leading-relaxed">
                    Trazemos os melhores produtos europeus diretamente para Angola. 
                    Eletrônicos, roupas, cosméticos, acessórios e muito mais com 
                    garantia de qualidade e entrega segura.
                  </p>
                  
                  {/* Features */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                    <div className="flex items-center gap-3 justify-center lg:justify-start">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <Shield className="w-4 h-4 text-green-600" />
                      </div>
                      <span className="text-gray-700">Produtos Garantidos</span>
                    </div>
                    
                    <div className="flex items-center gap-3 justify-center lg:justify-start">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <Truck className="w-4 h-4 text-blue-600" />
                      </div>
                      <span className="text-gray-700">Entrega Segura</span>
                    </div>
                    
                    <div className="flex items-center gap-3 justify-center lg:justify-start">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                        <Globe className="w-4 h-4 text-purple-600" />
                      </div>
                      <span className="text-gray-700">Origem Europa</span>
                    </div>
                    
                    <div className="flex items-center gap-3 justify-center lg:justify-start">
                      <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                        <Clock className="w-4 h-4 text-orange-600" />
                      </div>
                      <span className="text-gray-700">7-15 dias</span>
                    </div>
                  </div>
                  
                  {/* CTA Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                    <button
                      onClick={scrollToProducts}
                      className="bg-[#01042D] hover:bg-[#020A5E] text-white px-8 py-3 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
                    >
                      <Eye className="w-5 h-5" />
                      Ver Produtos Disponíveis
                    </button>
                    <button
                      onClick={handleRequestProduct}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
                    >
                      <Package className="w-5 h-5" />
                      Solicitar Produto
                    </button>
                  </div>
                  
                  <p className="text-sm text-gray-500 mt-4 text-center lg:text-left">
                    Não encontrou o que procura? Solicite e nós importamos para você!
                  </p>
                </div>
                
                {/* Imagem de Importação */}
                <div className="w-full flex justify-center lg:justify-end">
                  <div className="max-w-lg w-full">
                    <img
                      src="/images/import.png"
                      alt="Importação de Produtos"
                      className="w-full h-auto rounded-2xl shadow-lg"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Seção de Marcas */}
            <div className="bg-gray-50 py-8">
              <div className="max-w-6xl mx-auto px-4 sm:px-6">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-gray-900">
                    Algumas marcas que importamos
                  </h2>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 items-center">
                  {/* Apple */}
                  <div className="flex items-center justify-center p-3">
                    <img
                      src="/images/marcas/apple.png"
                      alt="Apple"
                      className="h-10 w-auto filter grayscale hover:grayscale-0 transition-all duration-300"
                    />
                  </div>
                  
                  {/* Asus */}
                  <div className="flex items-center justify-center p-3">
                    <img
                      src="/images/marcas/asus.png"
                      alt="Asus"
                      className="h-10 w-auto filter grayscale hover:grayscale-0 transition-all duration-300"
                    />
                  </div>
                  
                  {/* DJI */}
                  <div className="flex items-center justify-center p-3">
                    <img
                      src="/images/marcas/Dji.png"
                      alt="DJI"
                      className="h-10 w-auto filter grayscale hover:grayscale-0 transition-all duration-300"
                    />
                  </div>
                  
                  {/* PlayStation */}
                  <div className="flex items-center justify-center p-3">
                    <img
                      src="/images/marcas/playsation.png"
                      alt="PlayStation"
                      className="h-10 w-auto filter grayscale hover:grayscale-0 transition-all duration-300"
                    />
                  </div>
                  
                  {/* Xiaomi */}
                  <div className="flex items-center justify-center p-3">
                    <img
                      src="/images/marcas/xiaomi.png"
                      alt="Xiaomi"
                      className="h-10 w-auto filter grayscale hover:grayscale-0 transition-all duration-300"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Seção de Produtos */}
            <div className="p-8" data-products-section>
              <div className="max-w-7xl mx-auto">
                <PhysicalProductsSection 
                  onRequestProduct={handleRequestProduct}
                  categoryFilter={selectedCategory}
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
                <a href="/sobre-nos" className="text-sm text-gray-500 hover:text-blue-600 transition-colors duration-300">Sobre Nós</a>
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

      {/* Modal de Solicitação de Produto */}
      {showRequestForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Solicitar Produto
                </h3>
                <button
                  onClick={() => setShowRequestForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <form onSubmit={handleSubmitRequest} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <div className="flex items-center">
                      <Package className="w-4 h-4 mr-2 text-[#01042D]" />
                      Nome do Produto *
                    </div>
                  </label>
                  <input
                    type="text"
                    required
                    value={requestFormData.productName}
                    onChange={(e) => setRequestFormData(prev => ({ ...prev, productName: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#01042D] focus:border-[#01042D]"
                    placeholder="Ex: iPhone 15 Pro Max"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Link do Produto (opcional)
                  </label>
                  <input
                    type="url"
                    value={requestFormData.productLink}
                    onChange={(e) => setRequestFormData(prev => ({ ...prev, productLink: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#01042D] focus:border-[#01042D]"
                    placeholder="https://exemplo.com/produto"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <div className="flex items-center">
                      <User className="w-4 h-4 mr-2 text-[#01042D]" />
                      Nome Completo *
                    </div>
                  </label>
                  <input
                    type="text"
                    required
                    value={requestFormData.fullName}
                    onChange={(e) => setRequestFormData(prev => ({ ...prev, fullName: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#01042D] focus:border-[#01042D]"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={requestFormData.email}
                    onChange={(e) => setRequestFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#01042D] focus:border-[#01042D]"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Telefone *
                  </label>
                  <input
                    type="tel"
                    required
                    value={requestFormData.phone}
                    onChange={(e) => setRequestFormData(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#01042D] focus:border-[#01042D]"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Endereço *
                  </label>
                  <input
                    type="text"
                    required
                    value={requestFormData.address}
                    onChange={(e) => setRequestFormData(prev => ({ ...prev, address: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#01042D] focus:border-[#01042D]"
                  />
                </div>
                
                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowRequestForm(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-[#01042D] text-white rounded-lg hover:bg-[#020A5E] transition-colors"
                  >
                    Enviar Solicitação
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 