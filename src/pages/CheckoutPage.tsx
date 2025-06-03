import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Phone, MapPin, Mail, CreditCard, CheckCircle, AlertCircle, Copy, MessageCircle } from 'lucide-react';
import { GiftCard } from '@/types/supabase';
import { getGiftCardById, getExchangeRates } from '@/lib/database';
import { supabase } from '@/lib/supabase';
import { SEO } from '@/components/SEO';
import MainLayout from '@/components/MainLayout';

interface CheckoutFormData {
  name: string;
  phone: string;
  address: string;
  email: string;
}

interface OrderData extends CheckoutFormData {
  giftCardId: string;
  planId?: string;
  amount: number;
  currency: string;
  amountKz: number;
  orderNumber: string;
  status: 'pending' | 'completed';
}

const CheckoutPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [giftCard, setGiftCard] = useState<GiftCard | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(1); // 1: dados pessoais, 2: instruções de pagamento
  const [orderNumber, setOrderNumber] = useState('');
  const [amountKz, setAmountKz] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [orderCreated, setOrderCreated] = useState(false);
  
  const [formData, setFormData] = useState<CheckoutFormData>({
    name: '',
    phone: '',
    address: '',
    email: ''
  });

  const [errors, setErrors] = useState<Partial<CheckoutFormData>>({});

  useEffect(() => {
    if (id) {
      loadGiftCard();
    }
  }, [id]);

  useEffect(() => {
    // Gerar número único do pedido
    const generateOrderNumber = () => {
      const timestamp = Date.now().toString().slice(-6);
      const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      return `DOT${timestamp}${random}`;
    };
    
    setOrderNumber(generateOrderNumber());
  }, []);

  const loadGiftCard = async () => {
    try {
      setLoading(true);
      const card = await getGiftCardById(id!);
      if (card) {
        setGiftCard(card);
        
        // Pegar plano selecionado do sessionStorage (vem da página individual)
        const selectedPlanData = sessionStorage.getItem('selectedPlan');
        if (selectedPlanData) {
          const plan = JSON.parse(selectedPlanData);
          setSelectedPlan(plan);
          sessionStorage.removeItem('selectedPlan'); // Limpar após usar
        } else if (card.plans && card.plans.length > 0) {
          // Se não tem plano selecionado, usar o primeiro
          setSelectedPlan(card.plans[0]);
        }
        
        // Calcular valor em Kwanzas
        await calculateKwanzaAmount(card);
      }
    } catch (error) {
      console.error('Erro ao carregar gift card:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateKwanzaAmount = async (card: GiftCard) => {
    try {
      const rates = await getExchangeRates();
      let basePrice = selectedPlan ? selectedPlan.price : card.original_price;
      
      const rate = rates.find((r: any) => r.currency === card.currency);
      if (rate) {
        const priceInKwanzas = basePrice * rate.rate;
        setAmountKz(priceInKwanzas);
      }
    } catch (error) {
      console.error('Erro ao calcular preço em Kwanzas:', error);
    }
  };

  useEffect(() => {
    if (giftCard && selectedPlan) {
      calculateKwanzaAmount(giftCard);
    }
  }, [selectedPlan]);

  const validateForm = (): boolean => {
    const newErrors: Partial<CheckoutFormData> = {};
    
    if (!formData.name.trim()) newErrors.name = 'Nome é obrigatório';
    if (!formData.phone.trim()) newErrors.phone = 'Telefone é obrigatório';
    if (!formData.address.trim()) newErrors.address = 'Morada é obrigatória';
    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof CheckoutFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleNextStep = () => {
    if (validateForm()) {
      setCurrentStep(2);
    }
  };

  const handlePaymentConfirmation = async () => {
    if (!giftCard) return;
    
    try {
      setSubmitting(true);
      
      const orderData: OrderData = {
        ...formData,
        giftCardId: giftCard.id,
        planId: selectedPlan?.id,
        amount: selectedPlan ? selectedPlan.price : giftCard.original_price,
        currency: giftCard.currency,
        amountKz: amountKz,
        orderNumber: orderNumber,
        status: 'pending'
      };

      const { error } = await supabase
        .from('orders')
        .insert([{
          order_number: orderData.orderNumber,
          customer_name: orderData.name,
          customer_phone: orderData.phone,
          customer_address: orderData.address,
          customer_email: orderData.email,
          total_amount_kz: orderData.amountKz,
          status: orderData.status
        }]);

      if (error) throw error;
      
      setOrderCreated(true);
      
      // Redirecionar após alguns segundos
      setTimeout(() => {
        navigate('/');
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

  if (orderCreated) {
    return (
      <MainLayout seoProps={{ title: "Pedido Criado - DOT Angola" }}>
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Pedido Criado!</h1>
            <p className="text-gray-600 mb-4">
              Seu pedido #{orderNumber} foi criado com sucesso. 
              Processaremos sua compra assim que confirmarmos o pagamento.
            </p>
            <p className="text-sm text-gray-500">
              Redirecionando para a página inicial...
            </p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </MainLayout>
    );
  }

  if (!giftCard) {
    return (
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Produto não encontrado</h1>
            <button 
              onClick={() => navigate('/')}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              Voltar ao início
            </button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout seoProps={{ title: `Checkout - ${giftCard.name}` }}>
      <div className="container p-6">
        {/* Header */}
        <div className="mb-6">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-gray-800 mb-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Voltar
          </button>
          <h1 className="text-2xl font-bold text-gray-800">Finalizar Compra</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Resumo do Pedido - Esquerda */}
          <div className="bg-white rounded-3xl shadow-xl p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Resumo do Pedido</h2>
            
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
                <h3 className="font-semibold text-gray-800 mb-1">{giftCard.name}</h3>
                {selectedPlan && (
                  <p className="text-sm text-gray-600 mb-2">
                    Plano: {selectedPlan.name}
                  </p>
                )}
              </div>
            </div>

            {/* Total */}
            <div className="border-t pt-4">
              <div className="flex justify-between items-center text-lg font-bold">
                <span>Total:</span>
                <span className="text-blue-600">
                  {amountKz.toLocaleString('pt-AO', { maximumFractionDigits: 0 })} Kz
                </span>
              </div>
            </div>
          </div>

          {/* Formulário - Direita */}
          <div className="bg-white rounded-3xl shadow-xl p-6">
            {currentStep === 1 ? (
              <>
                <h2 className="text-xl font-bold text-gray-800 mb-6">Dados Pessoais</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <User className="w-4 h-4 inline mr-2" />
                      Nome Completo
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.name ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Digite seu nome completo"
                    />
                    {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Phone className="w-4 h-4 inline mr-2" />
                      Número de Telefone (WhatsApp)
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.phone ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="+244 900 000 000"
                    />
                    {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <MapPin className="w-4 h-4 inline mr-2" />
                      Morada
                    </label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.address ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Digite sua morada"
                    />
                    {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Mail className="w-4 h-4 inline mr-2" />
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.email ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="seu@email.com"
                    />
                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                  </div>
                </div>

                <button
                  onClick={handleNextStep}
                  className="w-full mt-6 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Continuar para Pagamento
                </button>
              </>
            ) : (
              <>
                <h2 className="text-xl font-bold text-gray-800 mb-6">
                  <CreditCard className="w-6 h-6 inline mr-2" />
                  Instruções de Pagamento BAI Direto
                </h2>
                
                <div className="space-y-4 mb-6">
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
                        <span className="font-bold">{amountKz.toLocaleString('pt-AO', { maximumFractionDigits: 0 })} Kz</span>
                        <button 
                          onClick={() => copyToClipboard(amountKz.toString())}
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
                </div>

                <div className="space-y-3">
                  <button
                    onClick={handlePaymentConfirmation}
                    disabled={submitting}
                    className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50"
                  >
                    {submitting ? 'Processando...' : 'Pagamento Feito'}
                  </button>
                  
                  <button
                    onClick={() => setCurrentStep(1)}
                    className="w-full bg-gray-200 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Voltar aos Dados
                  </button>
                </div>

                <div className="mt-6 text-center">
                  <p className="text-sm text-gray-600 mb-2">Dúvidas?</p>
                  <button
                    onClick={openWhatsApp}
                    className="inline-flex items-center text-green-600 hover:text-green-700"
                  >
                    <MessageCircle className="w-4 h-4 mr-1" />
                    WhatsApp: +244 931343433
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default CheckoutPage; 