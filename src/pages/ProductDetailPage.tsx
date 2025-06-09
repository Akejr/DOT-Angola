import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ShoppingBag, Package, Star, Tag, Scale, Globe, Truck, Shield, MessageCircle, Check, Heart, Eye, Clock, MapPin, Phone, Mail } from 'lucide-react';
import Header from '@/components/Header';
import Navigation from '@/components/Navigation';
import { SEO } from '@/components/SEO';
import { getPhysicalProductById, getExchangeRates, createImportRequest } from '@/lib/database';
import { formatDescription } from '@/utils/formatDescription';

interface PhysicalProduct {
  id: string;
  name: string;
  description: string;
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

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<PhysicalProduct | null>(null);
  const [kwanzaPrice, setKwanzaPrice] = useState<number | null>(null);
  const [kwanzaShippingCost, setKwanzaShippingCost] = useState<number | null>(null);
  const [totalKwanzaPrice, setTotalKwanzaPrice] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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

  // Função para calcular custo de envio baseado no peso
  const calculateShippingCost = (weight: number): number => {
    if (weight <= 1) return 45;
    if (weight <= 2) return 65;
    if (weight <= 3) return 90;
    if (weight <= 4) return 93;
    if (weight <= 5) return 100;
    return 100; // Para produtos acima de 5kg, usar o valor máximo
  };

  useEffect(() => {
    // Forçar scroll para o topo imediatamente
    window.scrollTo(0, 0);
    
    const loadProduct = async () => {
      if (!id) {
        setError('ID do produto não encontrado');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        const productData = await getPhysicalProductById(id);
        if (!productData) {
          setError('Produto não encontrado');
          return;
        }
        
        setProduct(productData as unknown as PhysicalProduct);
        
        // Buscar taxas de câmbio
        const rates = await getExchangeRates();
        
        // Converter preço do produto para Kwanzas
        const rate = rates.find(r => r.currency === productData.currency);
        if (rate) {
          const priceInKwanzas = productData.price * rate.rate;
          setKwanzaPrice(priceInKwanzas);
          
          // Calcular custo de envio e converter para Kwanzas
          const weight = productData.weight || 1; // Default 1kg se não especificado
          const shippingCostEuros = calculateShippingCost(weight);
          const euroRate = rates.find(r => r.currency === 'EUR');
          
          if (euroRate) {
            const shippingCostKwanzas = shippingCostEuros * euroRate.rate;
            setKwanzaShippingCost(shippingCostKwanzas);
            setTotalKwanzaPrice(priceInKwanzas + shippingCostKwanzas);
          }
        }
        
        // Atualizar título da página
        document.title = `${productData.name} | DOT Angola - Importação da Europa`;
        
      } catch (error) {
        console.error('Erro ao carregar produto:', error);
        setError('Erro ao carregar dados do produto. Por favor, tente novamente mais tarde.');
      } finally {
        setLoading(false);
        // Garantir scroll no topo após carregar
        setTimeout(() => {
          window.scrollTo(0, 0);
        }, 100);
      }
    };

    loadProduct();
  }, [id]);

  const handlePageChange = (id: number) => {
    console.log('Page changed:', id);
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

  if (loading) {
    return (
      <>
        <SEO 
          title="Carregando produto... | DOT Angola"
          description="Carregando informações do produto"
          type="product"
        />
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-0 sm:p-4">
          <div className="max-w-6xl w-full bg-white rounded-none sm:rounded-3xl shadow-xl overflow-hidden">
            <Header />
            <Navigation onPageChange={handlePageChange} />
            <div className="flex items-center justify-center min-h-screen">
              <div className="animate-spin rounded-full h-24 w-24 border-b-2 border-blue-600"></div>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (error || !product) {
    return (
      <>
        <SEO 
          title="Produto não encontrado | DOT Angola"
          description="O produto solicitado não foi encontrado"
          type="website"
        />
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-0 sm:p-4">
          <div className="max-w-6xl w-full bg-white rounded-none sm:rounded-3xl shadow-xl overflow-hidden">
            <Header />
            <Navigation onPageChange={handlePageChange} />
            <div className="flex flex-col items-center justify-center min-h-screen text-center p-6">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Package className="w-8 h-8 text-gray-400" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-3">Produto não encontrado</h1>
              <p className="text-gray-600 mb-6 max-w-md">{error || 'O produto que você está procurando não existe ou foi removido.'}</p>
              <Link 
                to="/importacao" 
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Voltar para Importação
              </Link>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <SEO 
        title={`${product.name} | DOT Angola - Importação da Europa`}
        description={product.description || `Importe ${product.name} da Europa com segurança e qualidade garantida. Entrega em 7-15 dias úteis. Preço inclui produto e envio.`}
        type="product"
      />
      
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-0 sm:p-4">
        <div className="max-w-6xl w-full bg-white rounded-none sm:rounded-3xl shadow-xl overflow-hidden">
          <Header />
          <Navigation onPageChange={handlePageChange} />
          
          <div className="p-4 sm:p-6">
            {/* Botão Voltar */}
            <div className="mb-4">
              <Link
                to="/importacao"
                className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors font-medium text-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                Voltar para Importação
              </Link>
            </div>



            {/* Layout Principal */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Galeria de Imagens */}
              <div className="space-y-3">
                {/* Imagem Principal */}
                <div className="aspect-square bg-gray-50 rounded-xl overflow-hidden">
                  <img
                    src={product.images[currentImageIndex] || '/placeholder-product.jpg'}
                    alt={product.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
                
                {/* Thumbnails */}
                {product.images.length > 1 && (
                  <div className="grid grid-cols-4 gap-2">
                    {product.images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                          currentImageIndex === index 
                            ? 'border-blue-500' 
                            : 'border-gray-200 hover:border-gray-300'
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
                {/* Header do Produto */}
                <div>
                  {product.is_featured && (
                    <div className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full mb-3 text-xs">
                      <Star className="w-3 h-3 fill-current" />
                      <span className="font-medium">Destaque</span>
                    </div>
                  )}
                  
                  <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>
                  
                  {/* Informações e Preço juntos */}
                  <div className="space-y-3">
                    {/* Detalhes do produto */}
                    <div className="flex flex-wrap items-center gap-4 text-xs text-gray-600 mb-4">
                      {product.category && (
                        <div className="flex items-center gap-1">
                          <Tag className="w-3 h-3" />
                          <span>{product.category.name}</span>
                        </div>
                      )}
                      
                      {product.weight && (
                        <div className="flex items-center gap-1">
                          <Scale className="w-3 h-3" />
                          <span>{product.weight} kg</span>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-1">
                        <Globe className="w-3 h-3" />
                        <span>Europa</span>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>7-15 dias</span>
                      </div>
                    </div>

                    {/* Preço */}
                    <div className="mb-4">
                      <div className="text-xs text-gray-600 mb-1">Preço total estimado:</div>
                      <div className="text-3xl font-bold text-blue-600">
                        {totalKwanzaPrice ? formatCurrency(totalKwanzaPrice, 'KWZ') : 'Consulte-nos'}
                      </div>
                      
                      {/* Breakdown do preço */}
                      {kwanzaPrice && kwanzaShippingCost && product?.weight && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                          <h4 className="text-xs font-medium text-gray-700 mb-2">Detalhamento:</h4>
                          <div className="space-y-1 text-xs">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Produto:</span>
                              <span className="font-medium">{formatCurrency(kwanzaPrice, 'KWZ')}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">
                                Envio ({product.weight}kg):
                              </span>
                              <span className="font-medium">{formatCurrency(kwanzaShippingCost, 'KWZ')}</span>
                            </div>
                            <div className="border-t border-gray-200 pt-1 mt-2">
                              <div className="flex justify-between font-semibold">
                                <span className="text-gray-900">Total:</span>
                                <span className="text-blue-600">{formatCurrency(totalKwanzaPrice, 'KWZ')}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      <p className="text-xs text-gray-500 mt-2">
                        *Preço pode variar conforme taxas alfandegárias
                      </p>
                    </div>
                  </div>
                </div>

                {/* Envio DHL */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                  <div className="flex items-center justify-center gap-3">
                    <div className="text-center">
                      <h3 className="font-bold text-gray-900 text-sm mb-1">Envio Expresso</h3>
                      <p className="text-xs text-gray-600">Parceria oficial</p>
                    </div>
                    <img
                      src="/images/DHL-Logo.wine.svg"
                      alt="DHL"
                      className="h-10 w-auto"
                    />
                  </div>
                </div>

                {/* Garantias */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-green-600" />
                    <span>Produto Original</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-blue-600" />
                    <span>Embalagem Segura</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-600" />
                    <span>Garantia Internacional</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-orange-600" />
                    <span>Rastreamento</span>
                  </div>
                </div>

                {/* Botões de Ação */}
                <div className="space-y-3 pt-2">
                  <button
                    onClick={handleRequestProduct}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    Solicitar Importação
                  </button>
                  
                  <button
                    onClick={handleWhatsAppContact}
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Falar no WhatsApp
                  </button>
                </div>
              </div>
            </div>

            {/* Descrição */}
            {product.description && (
              <div className="mb-6">
                <h2 className="text-lg font-bold text-gray-900 mb-3">Sobre o Produto</h2>
                {formatDescription(product.description)}
              </div>
            )}
          </div>
          
          {/* Footer */}
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
                <a href="/termos" className="text-sm text-gray-500 hover:text-blue-600 transition-colors duration-300">Termos e Condições</a>
                <a href="/privacidade" className="text-sm text-gray-500 hover:text-blue-600 transition-colors duration-300">Política de Privacidade</a>
                <a href="/contato" className="text-sm text-gray-500 hover:text-blue-600 transition-colors duration-300">Contato</a>
              </div>
              
              <div className="mt-4 md:mt-0">
                <p className="text-sm text-gray-500">© 2025. Todos os direitos reservados.</p>
              </div>
            </div>
          </footer>
        </div>
      </div>

      {/* Modal de Solicitação */}
      {showRequestForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">
                  Solicitar Importação
                </h3>
                <button
                  onClick={() => setShowRequestForm(false)}
                  className="text-gray-400 hover:text-gray-600 text-xl font-bold"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>
                
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowRequestForm(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Enviar
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