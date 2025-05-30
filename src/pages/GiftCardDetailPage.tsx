import { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingBag, Tag, AlertTriangle, Heart, Check, ChevronDown, Package, Zap, User, Phone, MapPin, Mail, CreditCard, CheckCircle, AlertCircle, Copy, MessageCircle } from 'lucide-react';
import { getGiftCardById, getExchangeRates } from '@/lib/database';
import { GiftCard, GiftCardPlan } from '@/types/supabase';
import { useCart } from '@/contexts/CartContext';
import { LoadingOptimizer, ProductDetailSkeleton } from '@/components/LoadingOptimizer';
import MainLayout from '@/components/MainLayout';
import RelatedProducts from '@/components/RelatedProducts';
import { supabase } from '@/lib/supabase';
import { SEO } from '@/components/SEO';

export default function GiftCardDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [giftCard, setGiftCard] = useState<GiftCard | null>(null);
  const [kwanzaPrice, setKwanzaPrice] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialDataLoaded, setInitialDataLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasError, setHasError] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [selectedPage, setSelectedPage] = useState(1);
  const [showPurchaseOptions, setShowPurchaseOptions] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<GiftCardPlan | null>(null);
  const [exchangeRates, setExchangeRates] = useState<Array<{currency: string, rate: number}>>([]);
  const { addItem } = useCart();
  const navigate = useNavigate();
  const [showAllPlans, setShowAllPlans] = useState(false);
  
  // Estados para checkout inline
  const [showCheckout, setShowCheckout] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState(1);
  const [orderNumber, setOrderNumber] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [orderCreated, setOrderCreated] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    email: ''
  });
  const [formErrors, setFormErrors] = useState<any>({});

  // Usando useMemo para calcular de forma segura se existem múltiplos planos
  const hasMultiplePlans = useMemo(() => {
    return giftCard?.plans && giftCard.plans.length > 1;
  }, [giftCard]);

  useEffect(() => {
    // Rolar para o topo da página quando o componente for montado
    window.scrollTo({ top: 0, behavior: 'instant' });
    
    const loadGiftCard = async () => {
      if (!id) {
        setError('ID do gift card não encontrado');
        setHasError(true);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setHasError(false);
        
        // Adicionar um timeout para a requisição
        const fetchGiftCardPromise = getGiftCardById(id);
        const timeoutPromise = new Promise<GiftCard | null>((_, reject) =>
          setTimeout(() => reject(new Error('Timeout')), 10000)
        );
        
        const card = await Promise.race([fetchGiftCardPromise, timeoutPromise])
          .catch(err => {
            console.error("Erro na requisição:", err);
            setError('Erro ao carregar o gift card. Tente novamente em alguns instantes.');
            setHasError(true);
            return null;
          });
        
        if (!card) {
          setError('Gift card não encontrado ou erro na busca');
          setHasError(true);
          setInitialDataLoaded(true);
          return;
        }
        
        console.log("Gift card carregado com sucesso:", card.name);
        setGiftCard(card);
        setInitialDataLoaded(true);
        
        // Atualizar a URL com o slug se disponível
        if (card.slug && !window.location.pathname.includes(card.slug)) {
          navigate(`/gift-card/${card.slug}`, { replace: true });
        }
        
        // Buscar taxas de câmbio
        try {
          const rates = await getExchangeRates();
          setExchangeRates(rates);
          
          // Selecionar o plano com menor preço como padrão, com verificação segura
          if (card.plans && card.plans.length > 0) {
            const defaultPlan = [...card.plans].sort((a, b) => a.price - b.price)[0];
            setSelectedPlan(defaultPlan);
            
            // Converter o preço do plano selecionado para Kwanza
            const rate = rates.find(r => r.currency === defaultPlan.currency);
            if (rate) {
              const priceInKwanzas = defaultPlan.price * rate.rate;
              setKwanzaPrice(priceInKwanzas);
            }
          } else {
            // Lógica antiga para compatibilidade com gift cards sem planos
            if (card.original_price && card.currency) {
              const rate = rates.find(r => r.currency === card.currency);
              
              if (rate) {
                const priceInKwanzas = card.original_price * rate.rate;
                setKwanzaPrice(priceInKwanzas);
              }
            }
          }
        } catch (rateError) {
          console.error('Erro ao carregar taxas de câmbio:', rateError);
          // Continue mesmo com erro nas taxas
        }
        
      } catch (error) {
        console.error('Erro ao carregar gift card:', error);
        setError('Erro ao carregar dados do gift card. Por favor, tente novamente mais tarde.');
        setHasError(true);
        setInitialDataLoaded(true);
      } finally {
        setLoading(false);
      }
    };

    loadGiftCard();
  }, [id, navigate]);

  // Atualizar preço quando o plano selecionado mudar
  useEffect(() => {
    if (!selectedPlan || !giftCard) return;
    
    const updatePrice = async () => {
      try {
        const rates = await getExchangeRates();
        const rate = rates.find(r => r.currency === selectedPlan.currency);
        
        if (rate) {
          const priceInKwanzas = selectedPlan.price * rate.rate;
          setKwanzaPrice(priceInKwanzas);
        }
      } catch (error) {
        console.error('Erro ao converter preço:', error);
      }
    };
    
    updatePrice();
  }, [selectedPlan, giftCard]);

  const handlePageChange = (id: number) => {
    setSelectedPage(id);
  };

  const handleAddToCart = () => {
    if (giftCard) {
      // Adiciona o gift card com o plano selecionado
      addItem(giftCard, quantity, selectedPlan);
    }
  };
  
  const handlePurchaseClick = () => {
    setShowPurchaseOptions(!showPurchaseOptions);
  };

  const handlePlanSelect = (plan: GiftCardPlan) => {
    setSelectedPlan(plan);
  };

  const handleWhatsAppPurchase = () => {
    const message = `Olá! Gostaria de comprar ${quantity}x ${giftCard?.name}${selectedPlan ? ` - ${selectedPlan.name}` : ''} por ${formatCurrency(kwanzaPrice || 0, selectedPlan?.currency || giftCard?.currency || 'USD')}`;
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/244931343433?text=${encodedMessage}`, '_blank');
  };

  const handleBaiDirectoPurchase = () => {
    if (giftCard) {
      // Gerar número do pedido
      const timestamp = Date.now().toString().slice(-6);
      const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      setOrderNumber(`DOT${timestamp}${random}`);
      
      // Mostrar checkout inline
      setShowCheckout(true);
      setCheckoutStep(1);
    }
  };

  const validateCheckoutForm = (): boolean => {
    const newErrors: any = {};
    
    if (!formData.name.trim()) newErrors.name = 'Nome é obrigatório';
    if (!formData.phone.trim()) newErrors.phone = 'Telefone é obrigatório';
    if (!formData.address.trim()) newErrors.address = 'Morada é obrigatória';
    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }
    
    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCheckoutInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleNextCheckoutStep = () => {
    if (validateCheckoutForm()) {
      setCheckoutStep(2);
    }
  };

  const handlePaymentConfirmation = async () => {
    if (!giftCard) return;
    
    try {
      setSubmitting(true);
      
      // Criar o pedido principal
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([{
          order_number: orderNumber,
          customer_name: formData.name,
          customer_phone: formData.phone,
          customer_address: formData.address,
          customer_email: formData.email,
          total_amount_kz: kwanzaPrice || 0,
          status: 'pending'
        }])
        .select()
        .single();

      if (orderError) throw orderError;

      // Criar o item do pedido
      const unitPrice = selectedPlan ? selectedPlan.price : giftCard.original_price;
      const currency = selectedPlan ? selectedPlan.currency : giftCard.currency;
      const unitPriceKz = kwanzaPrice || 0;
      
      const { error: itemError } = await supabase
        .from('order_items')
        .insert([{
          order_id: order.id,
          gift_card_id: giftCard.id,
          plan_id: selectedPlan?.id || null,
          quantity: 1,
          unit_price: unitPrice,
          currency: currency,
          unit_price_kz: unitPriceKz,
          total_price_kz: unitPriceKz
        }]);

      if (itemError) throw itemError;
      
      setOrderCreated(true);
      
      // Resetar após alguns segundos
      setTimeout(() => {
        setShowCheckout(false);
        setOrderCreated(false);
        setCheckoutStep(1);
        setFormData({ name: '', phone: '', address: '', email: '' });
      }, 5000);
      
    } catch (error) {
      console.error('Erro ao criar pedido:', error);
      alert('Erro ao processar pedido. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const openWhatsApp = () => {
    const message = `Olá! Tenho uma dúvida sobre o meu pedido ${orderNumber}`;
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/244931343433?text=${encodedMessage}`, '_blank');
  };

  // Função para renderizar as categorias
  const renderCategories = () => {
    if (!giftCard?.gift_card_categories || giftCard.gift_card_categories.length === 0) {
      return null;
    }

    return (
      <div className="flex flex-wrap gap-2">
        {giftCard.gift_card_categories.map(cat => 
          cat.categories && (
            <span 
              key={cat.categories.id} 
              className="inline-flex items-center text-xs text-gray-600 px-2.5 py-1 rounded-full bg-gray-100"
            >
              {cat.categories.name}
            </span>
          )
        )}
      </div>
    );
  };

  // Função para formatação de valores monetários
  const formatCurrency = (price: number, currency: string) => {
    switch (currency) {
      case 'EUR':
        return `${price.toFixed(2)} €`;
      case 'BRL':
        return `R$ ${price.toFixed(2)}`;
      case 'KWZ':
        return `${price.toLocaleString('pt-AO', { maximumFractionDigits: 0 })} Kz`;
      default:
        return `${price.toFixed(2)}`;
    }
  };

  const togglePlansVisibility = () => {
    setShowAllPlans(prev => !prev);
  };
  
  const handleRetry = () => {
    if (id) {
      setLoading(true);
      setHasError(false);
      setError(null);
      window.location.reload();
    }
  };

  // Construir os props para o SEO
  const getSeoProps = () => {
    if (!giftCard) {
      return {
        title: 'Gift Card | DOT ANGOLA',
        description: 'Compre gift cards internacionais com os melhores preços em Angola.',
        image: '/images/sczs.png',
        type: 'product'
      };
    }
    
    // Construir uma descrição adequada para SEO
    let description = giftCard.description || `Compre ${giftCard.name} com o melhor preço em Angola.`;
    
    // Adicionar informações de preço e disponibilidade se disponíveis
    if (kwanzaPrice) {
      description += ` Disponível a partir de ${kwanzaPrice.toLocaleString('pt-AO', { maximumFractionDigits: 0 })} Kz.`;
    }
    
    // Adicionar informações sobre os planos disponíveis
    if (giftCard.plans && giftCard.plans.length > 1) {
      description += ` Disponível em ${giftCard.plans.length} opções diferentes.`;
    }
    
    return {
      title: giftCard.name,
      description: description,
      image: giftCard.image_url || '/images/sczs.png',
      type: "product"
    };
  };

  const seoProps = getSeoProps();

  return (
    <>
      <SEO {...seoProps} />
      <MainLayout onPageChange={handlePageChange}>
        <div className="container p-6">
          <Link to="/" className="inline-flex items-center text-gray-600 hover:text-blue-600 mb-6 transition">
            <ArrowLeft className="h-4 w-4 mr-1" />
            <span>Voltar</span>
          </Link>
          
          <LoadingOptimizer
            loading={loading}
            initialDataLoaded={initialDataLoaded}
            hasError={hasError}
            onRetry={handleRetry}
            loadingText="Carregando detalhes do produto..."
            errorText={error || "Não foi possível carregar os detalhes do produto. Por favor, tente novamente."}
            skeletonContent={<ProductDetailSkeleton />}
          >
            {showCheckout && giftCard ? (
              /* Checkout Inline - Substitui todo o conteúdo */
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                {orderCreated ? (
                  <div className="text-center py-8">
                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Pedido Criado!</h2>
                    <p className="text-gray-600 mb-4">
                      Seu pedido #{orderNumber} foi criado com sucesso. 
                      Processaremos sua compra assim que confirmarmos o pagamento.
                    </p>
                    <p className="text-sm text-gray-500 mb-6">
                      Este formulário será fechado automaticamente...
                    </p>
                    <button
                      onClick={() => setShowCheckout(false)}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                    >
                      Voltar ao Produto
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between mb-6">
                      <h1 className="text-2xl font-bold text-gray-800">
                        {checkoutStep === 1 ? 'Dados Pessoais' : 'Instruções de Pagamento BAI Direto'}
                      </h1>
                      <button 
                        onClick={() => setShowCheckout(false)}
                        className="text-gray-400 hover:text-gray-600 text-2xl"
                      >
                        ✕
                      </button>
                    </div>

                    {checkoutStep === 1 ? (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Resumo do Pedido */}
                        <div className="bg-gray-50 rounded-xl p-6">
                          <h3 className="text-xl font-bold text-gray-800 mb-6">Resumo do Pedido</h3>
                          <div className="flex items-start gap-4 mb-6">
                            <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
                              {giftCard.image_url ? (
                                <img 
                                  src={giftCard.image_url} 
                                  alt={giftCard.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                  <span className="text-gray-400 text-xs">{giftCard.name.substring(0, 2)}</span>
                                </div>
                              )}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-800 mb-1">{giftCard.name}</h4>
                              {selectedPlan && (
                                <p className="text-sm text-gray-600 mb-2">Plano: {selectedPlan.name}</p>
                              )}
                            </div>
                          </div>
                          <div className="border-t pt-4">
                            <div className="flex justify-between items-center text-lg font-bold">
                              <span>Total:</span>
                              <span className="text-blue-600">
                                {kwanzaPrice?.toLocaleString('pt-AO', { maximumFractionDigits: 0 })} Kz
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Formulário */}
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              <User className="w-4 h-4 inline mr-2" />
                              Nome Completo
                            </label>
                            <input
                              type="text"
                              value={formData.name}
                              onChange={(e) => handleCheckoutInputChange('name', e.target.value)}
                              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                formErrors.name ? 'border-red-500' : 'border-gray-300'
                              }`}
                              placeholder="Digite seu nome completo"
                            />
                            {formErrors.name && <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              <Phone className="w-4 h-4 inline mr-2" />
                              Telefone (WhatsApp)
                            </label>
                            <input
                              type="tel"
                              value={formData.phone}
                              onChange={(e) => handleCheckoutInputChange('phone', e.target.value)}
                              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                formErrors.phone ? 'border-red-500' : 'border-gray-300'
                              }`}
                              placeholder="+244 900 000 000"
                            />
                            {formErrors.phone && <p className="text-red-500 text-sm mt-1">{formErrors.phone}</p>}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              <MapPin className="w-4 h-4 inline mr-2" />
                              Morada
                            </label>
                            <input
                              type="text"
                              value={formData.address}
                              onChange={(e) => handleCheckoutInputChange('address', e.target.value)}
                              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                formErrors.address ? 'border-red-500' : 'border-gray-300'
                              }`}
                              placeholder="Digite sua morada"
                            />
                            {formErrors.address && <p className="text-red-500 text-sm mt-1">{formErrors.address}</p>}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              <Mail className="w-4 h-4 inline mr-2" />
                              Email
                            </label>
                            <input
                              type="email"
                              value={formData.email}
                              onChange={(e) => handleCheckoutInputChange('email', e.target.value)}
                              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                formErrors.email ? 'border-red-500' : 'border-gray-300'
                              }`}
                              placeholder="seu@email.com"
                            />
                            {formErrors.email && <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>}
                          </div>

                          <button
                            onClick={handleNextCheckoutStep}
                            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                          >
                            Continuar para Pagamento
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <h3 className="font-medium text-blue-800 mb-3">Siga estes passos:</h3>
                          <ol className="space-y-2 text-sm text-blue-700">
                            <li>1. Abra o seu aplicativo BAI DIRETO e selecione 'Transferências'</li>
                            <li>2. Insira o nosso IBAN e o montante:</li>
                          </ol>
                          
                          <div className="mt-3 space-y-2">
                            <div className="flex items-center justify-between bg-white p-2 rounded border">
                              <span className="font-mono text-sm">0040 0000 0540 87871010 5</span>
                              <button 
                                onClick={() => copyToClipboard('0040000005408787101055')}
                                className="text-blue-600 hover:text-blue-800"
                              >
                                <Copy className="w-4 h-4" />
                              </button>
                            </div>
                            <div className="flex items-center justify-between bg-white p-2 rounded border">
                              <span className="font-bold">{kwanzaPrice?.toLocaleString('pt-AO', { maximumFractionDigits: 0 })} Kz</span>
                              <button 
                                onClick={() => copyToClipboard(kwanzaPrice?.toString() || '')}
                                className="text-blue-600 hover:text-blue-800"
                              >
                                <Copy className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                          
                          <ol className="space-y-2 text-sm text-blue-700 mt-3" start={3}>
                            <li>3. Confirme se o nome de beneficiário é <strong>João Evandro Taveira Casanova</strong></li>
                            <li>4. Insira esta referência no descritivo para o beneficiário:</li>
                          </ol>
                          
                          <div className="mt-2 flex items-center justify-between bg-white p-2 rounded border">
                            <span className="font-mono text-sm font-bold">{orderNumber}</span>
                            <button 
                              onClick={() => copyToClipboard(orderNumber)}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                          </div>
                          
                          <ol className="space-y-2 text-sm text-blue-700 mt-3" start={5}>
                            <li>5. <strong>Atenção:</strong> o descritivo é para o Beneficiário e não para o Ordenante</li>
                            <li>6. Confirme o pagamento</li>
                          </ol>
                        </div>

                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                          <div className="flex items-start">
                            <AlertCircle className="w-5 h-5 text-amber-600 mr-2 mt-0.5" />
                            <div className="text-sm text-amber-800">
                              <p className="font-medium mb-1">Importante:</p>
                              <p>A compra só será efetuada após clicar no botão "Pagamento Feito" abaixo. Receberá a sua compra em alguns minutos após a confirmação.</p>
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-3">
                          <button
                            onClick={handlePaymentConfirmation}
                            disabled={submitting}
                            className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50"
                          >
                            {submitting ? 'Processando...' : 'Pagamento Feito'}
                          </button>
                          
                          <button
                            onClick={() => setCheckoutStep(1)}
                            className="flex-1 bg-gray-200 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-300 transition-colors"
                          >
                            Voltar aos Dados
                          </button>
                        </div>

                        <div className="text-center">
                          <p className="text-sm text-gray-600 mb-2">Dúvidas?</p>
                          <button
                            onClick={openWhatsApp}
                            className="inline-flex items-center text-green-600 hover:text-green-700"
                          >
                            <MessageCircle className="w-4 h-4 mr-1" />
                            WhatsApp: +244 931343433
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            ) : (
              /* Conteúdo normal do gift card */
              <>
                {giftCard && (
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-8 bg-white rounded-2xl p-6 shadow-sm">
                    {/* Coluna da esquerda - Imagem */}
                    <div className="md:col-span-5 flex flex-col items-center justify-start">
                      <div className="relative w-full">
                        {giftCard.is_featured && (
                          <div className="absolute -top-2 -right-2 z-10">
                            <div className="bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-full transform rotate-6 shadow-md">
                              MAIS VENDIDO
                            </div>
                          </div>
                        )}
                        <div className="aspect-square w-full rounded-xl overflow-hidden bg-gray-50 shadow-md">
                          <img 
                            src={giftCard.image_url || '/images/placeholder.png'} 
                            alt={giftCard.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                    </div>
                    
                    {/* Coluna da direita - Todo o conteúdo */}
                    <div className="md:col-span-7 flex flex-col">
                      {/* Nome do produto */}
                      <h1 className="text-2xl font-bold text-gray-800 mb-4">{giftCard.name}</h1>
                      
                      {/* Categorias */}
                      <div className="mb-3">
                        {renderCategories()}
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-2 mb-5">
                        <span className="text-xs px-3 py-1 bg-blue-50 text-blue-700 rounded-full">Segurança</span>
                        <span className="text-xs px-3 py-1 bg-green-50 text-green-700 rounded-full">Ativação Rápida</span>
                        <span className="text-xs px-3 py-1 bg-purple-50 text-purple-700 rounded-full">Praticidade</span>
                        <span className="text-xs px-3 py-1 bg-amber-50 text-amber-700 rounded-full">Melhor Custo-Benefício</span>
                      </div>
                      
                      {/* Preço */}
                      {kwanzaPrice && (
                        <div className="mb-5 p-4 bg-gray-50 rounded-xl">
                          <span className="text-3xl font-bold text-gray-900">
                            {kwanzaPrice.toLocaleString('pt-AO', { maximumFractionDigits: 0 })} Kz
                          </span>
                          <span className="text-sm text-green-600 font-medium block mt-1">
                            <Check className="w-4 h-4 inline mr-1" /> Em estoque • Envio imediato
                          </span>
                        </div>
                      )}
                      
                      {/* Planos disponíveis */}
                      {hasMultiplePlans && (
                        <div className="mb-5 bg-gray-50 rounded-xl overflow-hidden">
                          <div className="flex items-center justify-between p-3 border-b border-gray-200">
                            <h3 className="text-sm font-semibold text-gray-800">Plano selecionado</h3>
                            <button 
                              onClick={togglePlansVisibility}
                              className="text-xs text-blue-600 hover:text-blue-800 flex items-center transition-colors"
                            >
                              {showAllPlans ? 'Esconder planos' : 'Ver todos os planos'}
                              <ChevronDown 
                                className={`ml-1 w-3.5 h-3.5 transition-transform duration-300 ${showAllPlans ? 'rotate-180' : ''}`}
                              />
                            </button>
                          </div>
                          
                          {/* Plano selecionado - sempre visível */}
                          {selectedPlan && (
                            <div 
                              onClick={togglePlansVisibility}
                              className={`flex justify-between items-center p-3 text-left bg-blue-50 border-b border-gray-200 cursor-pointer transition-all duration-200 hover:bg-blue-100 ${!showAllPlans ? 'rounded-b-xl' : ''}`}
                            >
                              <div className="flex items-center">
                                <div className="w-3.5 h-3.5 rounded-full mr-2.5 bg-blue-500">
                                  <div className="w-1.5 h-1.5 bg-white rounded-full m-1"></div>
                                </div>
                                <span className="font-medium text-sm text-gray-800">{selectedPlan.name}</span>
                              </div>
                              <div className="text-right">
                                <span className="font-semibold text-sm text-gray-900">
                                  {(selectedPlan.price * (exchangeRates.find(r => r.currency === selectedPlan.currency)?.rate || 0)).toLocaleString('pt-AO', { maximumFractionDigits: 0 })} Kz
                                </span>
                              </div>
                            </div>
                          )}
                          
                          {/* Lista de todos os planos - visível apenas quando expandido */}
                          <div 
                            className={`grid grid-cols-1 divide-y divide-gray-200 overflow-hidden transition-all duration-300 ease-in-out transform origin-top ${
                              showAllPlans 
                                ? 'max-h-96 opacity-100 scale-y-100' 
                                : 'max-h-0 opacity-0 scale-y-95'
                            }`}
                          >
                            {giftCard.plans
                              .filter(plan => plan.name !== selectedPlan?.name) // Excluir o plano já selecionado
                              .map((plan) => (
                                <button
                                  key={plan.name}
                                  onClick={() => {
                                    handlePlanSelect(plan);
                                    // Opcional: fecha a lista depois de selecionar
                                    setShowAllPlans(false);
                                  }}
                                  className="flex justify-between items-center p-3 text-left transition-all duration-200 bg-white hover:bg-gray-50 hover:shadow-sm relative"
                                >
                                  <div className="flex items-center">
                                    <div className="w-3.5 h-3.5 rounded-full mr-2.5 border border-gray-300 group-hover:border-blue-300 transition-colors"></div>
                                    <span className="font-medium text-sm text-gray-800">{plan.name}</span>
                                  </div>
                                  <div className="text-right">
                                    <span className="font-semibold text-sm text-gray-900">
                                      {(plan.price * (exchangeRates.find(r => r.currency === plan.currency)?.rate || 0)).toLocaleString('pt-AO', { maximumFractionDigits: 0 })} Kz
                                    </span>
                                  </div>
                                </button>
                              ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Quantidade e ações de compra */}
                      <div className="p-4 bg-gray-50 rounded-xl space-y-4">
                        <h3 className="text-sm font-semibold text-gray-800 mb-2">Finalizar compra</h3>
                        
                        {/* Quantidade */}
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-gray-700 font-medium min-w-20">Quantidade:</span>
                          <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-white">
                            <button 
                              className="w-8 h-8 text-gray-600 hover:bg-gray-100 flex items-center justify-center"
                              onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                            >
                              <span className="text-lg">−</span>
                            </button>
                            <input 
                              type="number" 
                              value={quantity}
                              onChange={(e) => setQuantity(Math.max(1, Math.min(99, parseInt(e.target.value) || 1)))}
                              className="w-10 text-center h-8 text-sm text-gray-800 focus:outline-none border-x border-gray-200"
                              min="1"
                              max="99"
                            />
                            <button 
                              className="w-8 h-8 text-gray-600 hover:bg-gray-100 flex items-center justify-center"
                              onClick={() => setQuantity(prev => Math.min(99, prev + 1))}
                            >
                              <span className="text-lg">+</span>
                            </button>
                          </div>
                        </div>
                        
                        {/* Botões de compra */}
                        <button 
                          onClick={handlePurchaseClick}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium flex items-center justify-center transition-colors shadow-sm"
                        >
                          <span className="flex items-center">
                            Comprar Agora
                            <ChevronDown 
                              className={`w-4 h-4 ml-1.5 transition-transform ${showPurchaseOptions ? 'rotate-180' : ''}`}
                            />
                          </span>
                        </button>
                        
                        {/* Opções de compra */}
                        <div 
                          className={`overflow-hidden transition-all duration-300 ${
                            showPurchaseOptions ? 'max-h-16 opacity-100' : 'max-h-0 opacity-0'
                          }`}
                        >
                          <div className="grid grid-cols-2 gap-3">
                            <button 
                              onClick={handleWhatsAppPurchase}
                              className="bg-green-600 hover:bg-green-700 text-white py-2.5 px-3 rounded-lg font-medium text-sm flex items-center justify-center transition-colors"
                            >
                              <svg viewBox="0 0 24 24" className="w-4 h-4 mr-1.5 fill-current" xmlns="http://www.w3.org/2000/svg">
                                <path d="M17.6 6.32A7.85 7.85 0 0 0 12.05 4c-4.38 0-7.93 3.56-7.93 7.93a7.9 7.9 0 0 0 1.07 3.96L4 20l4.19-1.1a7.9 7.9 0 0 0 3.8.96h.01c4.38 0 7.94-3.55 7.94-7.93 0-2.12-.83-4.12-2.34-5.61zm-5.55 12.18h-.01a6.55 6.55 0 0 1-3.35-.92l-.24-.14-2.5.65.67-2.43-.16-.25a6.59 6.59 0 0 1-1.01-3.49c0-3.64 2.96-6.6 6.61-6.6a6.57 6.57 0 0 1 6.6 6.6c-.01 3.64-2.97 6.58-6.61 6.58zm3.63-4.93c-.2-.1-1.18-.58-1.36-.64-.18-.07-.32-.1-.45.1-.13.2-.5.64-.62.77-.11.13-.23.15-.43.05-.2-.1-.85-.31-1.62-.99-.6-.54-1-1.2-1.12-1.4-.11-.2-.01-.31.09-.41.09-.09.2-.23.3-.35.1-.12.13-.2.2-.33.07-.13.03-.24-.01-.34-.05-.1-.45-1.08-.62-1.47-.16-.4-.33-.33-.45-.34-.12-.01-.25-.01-.38-.01-.13 0-.34.05-.52.25-.18.2-.68.67-.68 1.63 0 .96.7 1.89.8 2.02.1.13 1.37 2.1 3.32 2.94.47.2.83.32 1.11.41.47.15.89.13 1.23.08.37-.06 1.15-.47 1.32-.93.16-.46.16-.85.12-.93-.05-.1-.18-.15-.38-.25z" />
                              </svg>
                              WhatsApp
                            </button>
                            <button 
                              onClick={handleBaiDirectoPurchase}
                              className="bg-gradient-to-r from-blue-950 via-blue-800 to-blue-600 hover:from-blue-900 hover:to-blue-700 text-white py-2.5 px-3 rounded-lg font-medium text-sm flex items-center justify-center transition-all relative"
                            >
                              BAI DIRETO
                              <span className="absolute -top-1.5 -right-1.5 bg-amber-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold" style={{transform: 'translateX(-4px)'}}>BETA</span>
                            </button>
                          </div>
                        </div>
                        
                        <button 
                          onClick={handleAddToCart}
                          className="w-full bg-white hover:bg-gray-50 text-gray-800 py-3 px-4 rounded-lg font-medium text-sm flex items-center justify-center transition-colors border border-gray-200"
                        >
                          <ShoppingBag className="w-4 h-4 mr-2" />
                          Adicionar ao Carrinho
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Seções adicionais */}
                {giftCard && (
                  <div className="mt-10 pt-6 border-t border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Descrição */}
                    <div className="bg-gray-50 p-5 rounded-xl">
                      <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                        <Tag className="w-4 h-4 mr-2 text-blue-600" />
                        Sobre o produto
                      </h3>
                      <p className="text-sm text-gray-600 leading-relaxed">{giftCard.description}</p>
                    </div>
                    
                    {/* Método de entrega */}
                    <div className="bg-gray-50 p-5 rounded-xl">
                      <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                        {giftCard.delivery_method === 'code' ? (
                          <Package className="w-4 h-4 mr-2 text-blue-600" />
                        ) : (
                          <Zap className="w-4 h-4 mr-2 text-blue-600" />
                        )}
                        Método de entrega
                      </h3>
                      <div className="flex items-start">
                        {giftCard.delivery_method === 'code' ? (
                          <div>
                            <p className="text-sm font-medium text-gray-800">Código de ativação</p>
                            <p className="text-sm text-gray-600 mt-1">Você receberá um código para ativar diretamente na plataforma...</p>
                          </div>
                        ) : (
                          <div>
                            <p className="text-sm font-medium text-gray-800">Ativação manual</p>
                            <p className="text-sm text-gray-600 mt-1">Nossa equipe realizará a ativação para você após a confirmação do pagamento...</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Seção "Você também pode gostar" */}
                {giftCard && (
                  <RelatedProducts 
                    currentProductId={giftCard.id}
                    currentProductCategory={giftCard.gift_card_categories?.[0]?.categories?.name}
                  />
                )}
              </>
            )}
          </LoadingOptimizer>
        </div>
      </MainLayout>
    </>
  );
} 