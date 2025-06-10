import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingBag, Tag, Heart, Check, ChevronDown, Package, Star, User, Phone, MapPin, Mail, MessageCircle, Scale, Truck, Shield, Globe } from 'lucide-react';
import { getPhysicalProductById, getExchangeRates, createImportRequest } from '@/lib/database';
import { formatDescription } from '@/utils/formatDescription';
import MainLayout from '@/components/MainLayout';
import { DynamicSEO } from '@/components/DynamicSEO';
import { seoService } from '@/lib/seoService';

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

export default function PhysicalProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<PhysicalProduct | null>(null);
  const [kwanzaPrice, setKwanzaPrice] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedPage, setSelectedPage] = useState(3);
  const [exchangeRates, setExchangeRates] = useState<Array<{currency: string, rate: number}>>([]);
  const [seoData, setSeoData] = useState<any>(null);
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showRequestForm, setShowRequestForm] = useState(false);
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
    window.scrollTo({ top: 0, behavior: 'instant' });
    
    const loadProduct = async () => {
      if (!id) {
        console.error('ID do produto não encontrado');
        setError('ID do produto não encontrado');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log('Carregando produto com ID/slug:', id);
        
        const productData = await getPhysicalProductById(id);
        console.log('Dados do produto carregados:', productData);
        
        if (!productData) {
          console.error('Produto não encontrado para ID/slug:', id);
          setError('Produto não encontrado');
          return;
        }
        
        setProduct(productData as unknown as PhysicalProduct);
        console.log('Produto definido no estado:', productData.name);
        
        // Buscar taxas de câmbio
        const rates = await getExchangeRates();
        setExchangeRates(rates);
        
        // Converter preço para Kwanzas
        const rate = rates.find(r => r.currency === productData.currency);
        let convertedPrice = null;
        if (rate) {
          convertedPrice = productData.price * rate.rate;
          setKwanzaPrice(convertedPrice);
          console.log('Preço convertido para Kwanzas:', convertedPrice);
        }
        
        // Gerar SEO dinâmico
        const seoMetadata = seoService.generateProductSEO(productData as any, convertedPrice);
        setSeoData(seoMetadata);
        
      } catch (error) {
        console.error('Erro ao carregar produto:', error);
        setError(`Erro ao carregar dados do produto: ${error.message || 'Erro desconhecido'}`);
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [id]);

  const handlePageChange = (id: number) => {
    setSelectedPage(id);
  };

  const handleRequestProduct = () => {
    if (product) {
      setRequestFormData(prev => ({
        ...prev,
        productName: product.name
      }));
    }
    setShowRequestForm(true);
  };

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar campos obrigatórios
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
      window.location.href = '/importacao/obrigado';
    } catch (error) {
      console.error('Erro completo ao enviar solicitação:', error);
      alert(`Erro ao enviar solicitação: ${error.message || 'Erro desconhecido'}. Tente novamente.`);
    }
  };

  const handleWhatsAppContact = () => {
    const message = `Olá! Tenho interesse no produto: ${product?.name}. Gostaria de mais informações sobre importação.`;
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/244931343433?text=${encodedMessage}`, '_blank');
  };

  const formatCurrency = (price: number, currency: string) => {
    if (currency === 'KWZ') {
      return new Intl.NumberFormat('pt-AO', {
        style: 'currency',
        currency: 'AOA',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(price).replace('AOA', 'Kz');
    }
    
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price);
  };

  const getSeoProps = () => {
    if (!product) {
      return {
        title: 'Produto | DOT Angola',
        description: 'Produto de importação da DOT Angola',
        image: '/images/sczs.png',
        type: 'product'
      };
    }

    // Construir uma descrição otimizada para SEO
    let description = product.description || `Importe ${product.name} da Europa com segurança e qualidade garantida.`;
    
    // Adicionar informações de preço se disponível
    if (kwanzaPrice) {
      description += ` Disponível a partir de ${kwanzaPrice.toLocaleString('pt-AO', { maximumFractionDigits: 0 })} Kz.`;
    }
    
    // Adicionar informações da categoria
    if (product.category) {
      description += ` Categoria: ${product.category.name}.`;
    }
    
    // Adicionar informações de importação
    description += ' Entrega em 7-15 dias úteis. Produto original com garantia internacional.';

    return {
      title: `${product.name} | DOT Angola - Importação da Europa`,
      description: description,
      image: product.images?.[0] || '/images/sczs.png',
      type: 'product'
    };
  };

  if (loading) {
    return (
      <>
        <SEO 
          title="Carregando produto... | DOT Angola"
          description="Carregando informações do produto"
          image="/images/sczs.png"
          type="product"
        />
        <MainLayout selectedPage={selectedPage} onPageChange={handlePageChange}>
          <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#01042D]"></div>
          </div>
        </MainLayout>
      </>
    );
  }

  if (error || !product) {
    return (
      <>
        <SEO 
          title="Produto não encontrado | DOT Angola"
          description="O produto que você está procurando não foi encontrado"
          image="/images/sczs.png"
          type="product"
        />
        <MainLayout selectedPage={selectedPage} onPageChange={handlePageChange}>
          <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
            <Package className="w-16 h-16 text-gray-400 mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Produto não encontrado</h1>
            <p className="text-gray-600 mb-6">{error || 'O produto que você está procurando não existe.'}</p>
            <Link 
              to="/importacao" 
              className="bg-[#01042D] text-white px-6 py-3 rounded-lg hover:bg-[#020A5E] transition-colors"
            >
              Voltar para Importação
            </Link>
          </div>
        </MainLayout>
      </>
    );
  }

  // Dados estruturados JSON-LD para SEO
  const structuredData = {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": product.name,
    "description": product.description,
    "image": product.images || [],
    "category": product.category?.name,
    "brand": {
      "@type": "Organization",
      "name": "DOT Angola"
    },
    "offers": {
      "@type": "Offer",
      "price": kwanzaPrice || product.price,
      "priceCurrency": kwanzaPrice ? "AOA" : product.currency,
      "availability": "https://schema.org/InStock",
      "seller": {
        "@type": "Organization",
        "name": "DOT Angola"
      }
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "reviewCount": "127"
    }
  };

  const seoProps = getSeoProps();

  return (
    <>
      <SEO 
        title={seoProps.title}
        description={seoProps.description}
        image={seoProps.image}
        type={seoProps.type}
      />
      
      {/* Dados estruturados JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData)
        }}
      />
      
      <MainLayout selectedPage={selectedPage} onPageChange={handlePageChange}>
        <div className="max-w-6xl mx-auto p-4 space-y-8">
          {/* Botão Voltar */}
          <div className="mb-4">
            <Link
              to="/importacao"
              className="inline-flex items-center text-gray-600 hover:text-[#01042D] transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar para Importação
            </Link>
          </div>



          {/* Conteúdo Principal */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Galeria de Imagens */}
            <div className="space-y-4">
              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={product.images[currentImageIndex] || '/placeholder-product.jpg'}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              
              {product.images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {product.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 transition-colors ${
                        currentImageIndex === index ? 'border-[#01042D]' : 'border-transparent'
                      }`}
                    >
                      <img
                        src={image}
                        alt={`${product.name} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Informações do Produto */}
            <div className="space-y-6">
              {/* Cabeçalho */}
              <div>
                {product.is_featured && (
                  <div className="inline-flex items-center px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-medium rounded-full mb-3">
                    <Star className="w-4 h-4 mr-1" />
                    Produto em Destaque
                  </div>
                )}
                
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
                
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  {product.category && (
                    <span className="flex items-center">
                      <Tag className="w-4 h-4 mr-1" />
                      {product.category.name}
                    </span>
                  )}
                  
                  {product.weight && (
                    <span className="flex items-center">
                      <Scale className="w-4 h-4 mr-1" />
                      {product.weight} kg
                    </span>
                  )}
                </div>
              </div>

              {/* Preço */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-600 mb-1">Preço estimado:</div>
                <div className="text-3xl font-bold text-[#01042D]">
                  {kwanzaPrice ? formatCurrency(kwanzaPrice, 'KWZ') : 'Consulte-nos'}
                </div>
              </div>

              {/* Descrição */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Descrição</h3>
                {formatDescription(product.description)}
              </div>

              {/* Destaque Envio DHL */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center justify-center space-x-3">
                  <span className="text-lg font-semibold text-gray-900">Envio por</span>
                  <img
                    src="/images/DHL-Logo.wine.svg"
                    alt="DHL"
                    className="h-8 w-auto"
                  />
                </div>
              </div>

              {/* Informações de Importação */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Informações de Importação</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center">
                    <Globe className="w-4 h-4 mr-2 text-blue-600" />
                    <span>Origem: Europa</span>
                  </div>
                  <div className="flex items-center">
                    <Truck className="w-4 h-4 mr-2 text-blue-600" />
                    <span>7-15 dias úteis</span>
                  </div>
                  <div className="flex items-center">
                    <Shield className="w-4 h-4 mr-2 text-blue-600" />
                    <span>Produto garantido</span>
                  </div>
                  <div className="flex items-center">
                    <Package className="w-4 h-4 mr-2 text-blue-600" />
                    <span>Embalagem segura</span>
                  </div>
                </div>
              </div>

              {/* Botões de Ação */}
              <div className="space-y-3">
                <button
                  onClick={handleRequestProduct}
                  className="w-full bg-[#01042D] text-white py-4 px-6 rounded-lg font-semibold hover:bg-[#020A5E] transition-colors flex items-center justify-center"
                >
                  <ShoppingBag className="w-5 h-5 mr-2" />
                  Solicitar Importação
                </button>
                
                <button
                  onClick={handleWhatsAppContact}
                  className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center"
                >
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Falar no WhatsApp
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Modal de Solicitação */}
        {showRequestForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Solicitar Importação
                  </h3>
                  <button
                    onClick={() => setShowRequestForm(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </button>
                </div>
                
                <form onSubmit={handleSubmitRequest} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Produto *
                    </label>
                    <input
                      type="text"
                      required
                      value={requestFormData.productName}
                      onChange={(e) => setRequestFormData(prev => ({ ...prev, productName: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#01042D] focus:border-[#01042D]"
                      disabled
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nome Completo *
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
      </MainLayout>
    </>
  );
} 