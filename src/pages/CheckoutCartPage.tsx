import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Phone, MapPin, Mail, Copy, MessageCircle, CheckCircle, AlertCircle } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { getExchangeRates } from '@/lib/database';
import { supabase } from '@/lib/supabase';
import MainLayout from '@/components/MainLayout';

export default function CheckoutCartPage() {
  const { items, clearCart } = useCart();
  const navigate = useNavigate();
  const [checkoutStep, setCheckoutStep] = useState(1);
  const [orderNumber, setOrderNumber] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [orderCreated, setOrderCreated] = useState(false);
  const [totalInKwanzas, setTotalInKwanzas] = useState<number | null>(null);
  const [exchangeRates, setExchangeRates] = useState<Array<{currency: string, rate: number}>>([]);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    email: ''
  });
  const [formErrors, setFormErrors] = useState<any>({});

  // Redirecionar se carrinho estiver vazio
  useEffect(() => {
    if (items.length === 0) {
      navigate('/');
      return;
    }

    // Gerar número do pedido
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    setOrderNumber(`DOT${timestamp}${random}`);
  }, [items, navigate]);

  // Converter preço total para Kwanzas
  useEffect(() => {
    const convertToKwanzas = async () => {
      try {
        const rates = await getExchangeRates();
        setExchangeRates(rates);
        
        let kwanzaTotal = 0;
        
        for (const item of items) {
          const price = item.selectedPlan ? item.selectedPlan.price : item.giftCard.original_price;
          const currency = item.selectedPlan ? item.selectedPlan.currency : item.giftCard.currency;
          
          if (currency === 'KWZ') {
            kwanzaTotal += price * item.quantity;
            continue;
          }
          
          const rate = rates.find(r => r.currency === currency);
          if (rate) {
            const itemTotal = price * item.quantity * rate.rate;
            kwanzaTotal += itemTotal;
          }
        }
        
        setTotalInKwanzas(kwanzaTotal);
      } catch (error) {
        console.error('Erro ao converter para Kwanzas:', error);
      }
    };
    
    if (items.length > 0) {
      convertToKwanzas();
    }
  }, [items]);

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-AO', {
      maximumFractionDigits: 0
    });
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
    if (items.length === 0) return;
    
    try {
      setSubmitting(true);
      
      // Criar um pedido principal que agrupa todos os itens
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([{
          order_number: orderNumber,
          customer_name: formData.name,
          customer_phone: formData.phone,
          customer_address: formData.address,
          customer_email: formData.email,
          total_amount_kz: totalInKwanzas || 0,
          status: 'pending'
        }])
        .select()
        .single();

      if (orderError) throw orderError;
      
      setOrderCreated(true);
      clearCart();
      
      // Resetar após alguns segundos
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

  if (items.length === 0) {
    return null; // Componente será redirecionado
  }

  return (
    <MainLayout>
      <div className="container p-6">
        <button 
          onClick={() => navigate('/')}
          className="inline-flex items-center text-gray-600 hover:text-blue-600 mb-6 transition"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          <span>Voltar</span>
        </button>

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          {orderCreated ? (
            <div className="text-center py-8">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Pedido Criado!</h2>
              <p className="text-gray-600 mb-4">
                Seu pedido #{orderNumber} foi criado com sucesso. 
                Processaremos suas compras assim que confirmarmos o pagamento.
              </p>
              <p className="text-sm text-gray-500 mb-6">
                Redirecionando para a página inicial...
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-800">
                  {checkoutStep === 1 ? 'Dados Pessoais' : 'Instruções de Pagamento BAI Direto'}
                </h1>
              </div>

              {checkoutStep === 1 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Resumo do Pedido */}
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-6">Resumo do Pedido</h3>
                    <div className="space-y-4 mb-6">
                      {items.map((item) => (
                        <div key={`${item.giftCard.id}-${item.selectedPlan?.id || 'default'}`} className="flex items-start gap-4">
                          <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
                            {item.giftCard.image_url ? (
                              <img 
                                src={item.giftCard.image_url} 
                                alt={item.giftCard.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                <span className="text-gray-400 text-xs">{item.giftCard.name.substring(0, 2)}</span>
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-800 mb-1">{item.giftCard.name}</h4>
                            {item.selectedPlan && (
                              <p className="text-sm text-gray-600 mb-2">Plano: {item.selectedPlan.name}</p>
                            )}
                            <p className="text-sm text-gray-600 mb-1">Quantidade: {item.quantity}</p>
                            <p className="text-sm font-medium text-gray-800">
                              {formatCurrency((item.selectedPlan ? item.selectedPlan.price : item.giftCard.original_price) * 
                                (exchangeRates.find(r => r.currency === (item.selectedPlan ? item.selectedPlan.currency : item.giftCard.currency))?.rate || 0) * 
                                item.quantity)} Kz
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center text-lg font-bold">
                        <span>Total:</span>
                        <span className="text-blue-600">
                          {totalInKwanzas?.toLocaleString('pt-AO', { maximumFractionDigits: 0 })} Kz
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
                        <span className="font-bold">{totalInKwanzas?.toLocaleString('pt-AO', { maximumFractionDigits: 0 })} Kz</span>
                        <button 
                          onClick={() => copyToClipboard(totalInKwanzas?.toString() || '')}
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
                        <p>As compras só serão efetuadas após clicar no botão "Pagamento Feito" abaixo. Receberá suas compras em alguns minutos após a confirmação.</p>
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
      </div>
    </MainLayout>
  );
} 