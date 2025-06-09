import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Navigation from '../components/Navigation';
import { supabase } from '../lib/supabase';
import { SEO } from '@/components/SEO';
import { CreditCard, User, Euro, Info, ArrowRight, MessageCircle, Lock, Clock, Globe, Check, ChevronDown, Wallet, X } from 'lucide-react';

const VisaVirtualPage: React.FC = () => {
  const navigate = useNavigate();
  const [isFlipped, setIsFlipped] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolderName, setCardHolderName] = useState('NOME DO TITULAR');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [isCardGenerated, setIsCardGenerated] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currency, setCurrency] = useState('EUR');
  const [amount, setAmount] = useState('');
  const [amountKz, setAmountKz] = useState('0');
  const [isFormValid, setIsFormValid] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [isGeneratingConfirmation, setIsGeneratingConfirmation] = useState(false);
  const [confirmationCardGenerated, setConfirmationCardGenerated] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);
  const totalSlides = 6;

  // Valores de conversão
  const [conversionRates, setConversionRates] = useState<Record<string, number>>({
    EUR: 1300,
    BRL: 260
  });

  useEffect(() => {
    const loadExchangeRates = async () => {
      try {
        const { data, error } = await supabase
          .from('visa_virtual_exchange_rates')
          .select('currency, rate');

        if (error) throw error;
        
        if (data) {
          const newRates: Record<string, number> = {};
          data.forEach(rate => {
            newRates[rate.currency] = rate.rate;
          });
          setConversionRates(newRates);
        }
      } catch (err) {
        console.error('Erro ao carregar taxas:', err);
      }
    };

    loadExchangeRates();
  }, []);
  
  const handlePageChange = (id: number) => {
    // Simplificada - a navegação já é gerenciada pelo componente Navigation
    console.log("Mudando para página:", id);
  };

  // Inicializar os dados do cartão quando o componente for montado
  useEffect(() => {
    // Gerar dados iniciais do cartão apenas para a etapa de confirmação
    if (currentStep === 2) {
      setCardNumber(generateCardNumber());
      setCvv(generateCVV());
      setExpiryDate(generateExpiryDate());
    }
  }, [currentStep]);

  // Função para gerar números de cartão formatados
  const generateCardNumber = () => {
    const randomCardNumber = Array(16).fill(0).map(() => Math.floor(Math.random() * 10)).join('');
    return randomCardNumber.match(/.{1,4}/g)?.join(' ') || '';
  };

  // Função para gerar CVV
  const generateCVV = () => {
    return Array(3).fill(0).map(() => Math.floor(Math.random() * 10)).join('');
  };

  // Função para gerar data de expiração
  const generateExpiryDate = () => {
    const today = new Date();
    const futureDate = new Date(today);
    futureDate.setMonth(today.getMonth() + 1);
    const month = String(futureDate.getMonth() + 1).padStart(2, '0');
    const year = String(futureDate.getFullYear()).slice(2);
    return `${month}/${year}`;
  };

  // Gerar números de cartão aleatórios com animação na etapa 1
  useEffect(() => {
    if (!isCardGenerated && !isGenerating && currentStep === 1) {
      setIsGenerating(true);
      let iterations = 0;
      const maxIterations = 20;
      
      const interval = setInterval(() => {
        iterations++;
        
        // Gerar números aleatórios para o cartão
        setCardNumber(generateCardNumber());
        setCvv(generateCVV());
        setExpiryDate(generateExpiryDate());
        
        if (iterations >= maxIterations) {
          clearInterval(interval);
          setIsCardGenerated(true);
          setIsGenerating(false);
        }
      }, 100);
      
      return () => clearInterval(interval);
    }
  }, [isCardGenerated, isGenerating, currentStep]);

  // Função para gerar números de cartão aleatórios com efeito visual mais marcante
  useEffect(() => {
    // Só executar a animação na etapa 2
    if (currentStep === 2 && !confirmationCardGenerated && !isGeneratingConfirmation) {
      setIsGeneratingConfirmation(true);
      let iterations = 0;
      const maxIterations = 25;
      
      const interval = setInterval(() => {
        iterations++;
        
        // Gerar números aleatórios para o cartão com efeito visual mais marcante
        if (iterations < maxIterations) {
          // Durante a animação, gere números aleatórios a cada iteração
          setCardNumber(generateCardNumber());
          setCvv(generateCVV());
          setExpiryDate(generateExpiryDate());
        } else {
          // Na última iteração, gere o número final que será mantido
          const finalCardNumber = generateCardNumber();
          const finalCVV = generateCVV();
          const finalExpiryDate = generateExpiryDate();
          
          setCardNumber(finalCardNumber);
          setCvv(finalCVV);
          setExpiryDate(finalExpiryDate);
          
          clearInterval(interval);
          setConfirmationCardGenerated(true);
          setIsGeneratingConfirmation(false);
        }
      }, 60); // Velocidade mais rápida para melhor efeito visual
      
      return () => clearInterval(interval);
    }
  }, [currentStep, confirmationCardGenerated, isGeneratingConfirmation]);

  // Atualizar valor em Kwanzas quando o valor ou moeda mudar
  useEffect(() => {
    if (amount) {
      const numericAmount = parseFloat(amount);
      if (!isNaN(numericAmount)) {
        const convertedAmount = numericAmount * conversionRates[currency as keyof typeof conversionRates];
        setAmountKz(convertedAmount.toLocaleString('pt-AO') + ' Kz');
      }
    } else {
      setAmountKz('0 Kz');
    }
  }, [amount, currency]);

  // Validar formulário
  useEffect(() => {
    if (cardHolderName && cardHolderName !== 'NOME DO TITULAR' && amount && parseFloat(amount) > 0) {
      setIsFormValid(true);
    } else {
      setIsFormValid(false);
      setIsConfirmed(false);
    }
  }, [cardHolderName, amount]);
  
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9.]/g, '');
      setAmount(value);
  };
  
  const formatCardHolderName = (name: string) => {
    if (!name || name === 'NOME DO TITULAR') return 'NOME DO TITULAR';
    
    // Se o nome for muito longo, use apenas primeiro e último nome
    if (name.length > 20) {
      const nameParts = name.trim().split(' ');
      if (nameParts.length > 1) {
        return `${nameParts[0]} ${nameParts[nameParts.length - 1]}`;
      }
    }
    
    return name;
  };
  
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase();
    setCardHolderName(value || 'NOME DO TITULAR');
  };

  const handleCurrencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCurrency(e.target.value);
  };

  const openWhatsApp = () => {
    const message = 
      `*Solicitação de Cartão Virtual Visa*\n\n` +
      `Nome: ${cardHolderName}\n` +
      `Valor: ${amount} ${currency}\n` +
      `Valor em Kwanzas: ${amountKz}\n\n` +
      `Estou solicitando um cartão virtual para uso único, conforme as condições informadas no site.`;
      
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/244931343433?text=${encodedMessage}`, '_blank');
  };

  const handleNextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Reset do cartão quando mudar de etapa
  useEffect(() => {
    // Ao voltar para etapa 1, resetar o status de geração da etapa 2
    if (currentStep === 1) {
      setConfirmationCardGenerated(false);
    }
    
    // Ao mudar para etapa 2, iniciar geração de números novos
    if (currentStep === 2 && confirmationCardGenerated) {
      setConfirmationCardGenerated(false);
    }
  }, [currentStep]);

  // Componente para exibir o número do cartão dependendo da etapa
  const CardNumberDisplay = () => {
    // Na etapa 1, exibir apenas pontinhos
    if (currentStep === 1) {
      return (
        <div className="font-mono text-xl tracking-wide">
          •••• •••• •••• ••••
        </div>
      );
    }
    
    // Na etapa 2, exibir os números reais com blur no último dígito
    return (
      <div className="font-mono text-xl tracking-wide">
        {cardNumber ? (
          <>
            <span>{cardNumber.substring(0, 15)}</span>
            <span className="blur-sm">{cardNumber.substring(15)}</span>
          </>
        ) : '•••• •••• •••• ••••'}
      </div>
    );
  };
  
  // Componente para exibir a data de validade dependendo da etapa
  const ExpiryDateDisplay = () => {
    if (currentStep === 1) {
      return <div className="font-mono text-sm">MM/AA</div>;
    }
    
    return <div className="font-mono text-sm">{expiryDate || 'MM/AA'}</div>;
  };
  
  // Componente para exibir o CVV dependendo da etapa
  const CVVDisplay = () => {
    if (currentStep === 1) {
      return <div className="font-mono text-base text-black">•••</div>;
    }
    
    return <div className="font-mono text-base text-black blur-sm">{cvv || '•••'}</div>;
  };
  
  const nextSlide = () => {
    setActiveSlide((prev) => (prev === totalSlides - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setActiveSlide((prev) => (prev === 0 ? totalSlides - 1 : prev - 1));
  };

  const goToSlide = (index: number) => {
    setActiveSlide(index);
  };

  // Adicionar efeito de slide automático
  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 5000); // Muda a cada 5 segundos
    
    return () => clearInterval(interval);
  }, [activeSlide]);
  
  return (
    <>
      <SEO 
        title="Visa Virtual | DOT Angola"
        description="Cartão Visa Virtual pré-pago para angolanos comprarem online no exterior. Pagamento em Kwanzas, entrega digital instantânea e aceito mundialmente para compras internacionais seguras."
        type="product"
      />
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-0 sm:p-4">
        <div className="max-w-6xl w-full bg-white rounded-none sm:rounded-3xl shadow-xl overflow-hidden">
          <Header />
          <Navigation onPageChange={handlePageChange} />
          
          <div className="flex-grow flex flex-col">
            <div className="p-4 sm:p-6">
              <div className="max-w-5xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Cartão Virtual - Mantido intacto */}
                  <div className="flex flex-col items-center justify-center rounded-xl shadow-sm border border-gray-100">
                    <div className="w-full max-w-md mx-auto p-6">
                      <div 
                        className="card-container relative w-full aspect-[1.586/1] rounded-xl cursor-pointer perspective mx-auto"
                        onClick={() => setIsFlipped(!isFlipped)}
                      >
                        {/* Card Wrapper */}
                        <div className={`transition-all duration-700 w-full h-full ${isFlipped ? 'rotate-y-180' : ''} preserve-3d`}>
                          {/* Frente do cartão */}
                          <div className="card-face front absolute inset-0 rounded-xl overflow-hidden backface-hidden">
                            {/* Gradiente de fundo */}
                            <div className="absolute inset-0 bg-gradient-to-br from-[#01042D] via-[#020A5E] to-[#0A1F7E] opacity-90"></div>
                            
                            {/* Efeito holográfico */}
                            <div className="absolute inset-0 opacity-30">
                              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-10"
                                   style={{backgroundSize: '200% 100%', animation: 'shine 1.5s infinite'}}></div>
                              <div className="absolute inset-0" 
                                   style={{
                                     backgroundImage: 'repeating-linear-gradient(45deg, rgba(255,255,255,0.1), rgba(255,255,255,0.1) 10px, transparent 10px, transparent 20px)',
                                   }}></div>
                            </div>
                            
                            {/* Conteúdo do cartão */}
                            <div className="relative p-5 h-full flex flex-col justify-between text-white">
                              <div className="flex justify-between items-start">
                                <div className="bg-gradient-to-br from-yellow-300 to-yellow-400 w-12 h-9 rounded-md grid grid-rows-3 gap-1 p-1 shadow-sm">
                                  <div className="bg-yellow-600 h-1.5 rounded-sm"></div>
                                  <div className="bg-yellow-600 h-1.5 rounded-sm"></div>
                                  <div className="bg-yellow-600 h-1.5 rounded-sm"></div>
                                </div>
                                <div className="text-white text-2xl font-bold italic">
                                  VISA
                                </div>
                              </div>
                              
                              {/* Número do cartão - etapa 1 (pontinhos) */}
                              <div className="my-6">
                                <div className="text-xs mb-1 opacity-70">Número do Cartão</div>
                                <CardNumberDisplay />
                              </div>
                              
                              <div className="flex justify-between">
                                <div>
                                  <div className="text-xs opacity-70">Titular</div>
                                  <div className="font-mono text-sm truncate max-w-[200px]">{formatCardHolderName(cardHolderName)}</div>
                                </div>
                                <div>
                                  <div className="text-xs opacity-70">Validade</div>
                                  <ExpiryDateDisplay />
                                </div>
                                
                                <div className="flex flex-col items-end justify-end">
                                  <div className="flex items-center space-x-1">
                                    <div className="h-2 w-2 rounded-full bg-white opacity-60"></div>
                                    <div className="h-2 w-2 rounded-full bg-white opacity-80"></div>
                                    <div className="h-2 w-2 rounded-full bg-white"></div>
                                  </div>
                                  <div className="text-xs mt-1">{currency}</div>
                                  <div className="text-xs font-bold">{amount ? `${amount} ${currency}` : ''}</div>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          {/* Verso do cartão */}
                          <div className="card-face back absolute inset-0 rounded-xl overflow-hidden backface-hidden rotate-y-180">
                            {/* Gradiente de fundo */}
                            <div className="absolute inset-0 bg-gradient-to-br from-[#01042D] via-[#020A5E] to-[#0A1F7E] opacity-90"></div>
                            
                            {/* Faixa magnética */}
                            <div className="absolute top-8 inset-x-0 h-12 bg-black"></div>
                            
                            {/* CVV */}
                            <div className="absolute top-28 right-6 bg-white px-3 py-2 rounded">
                              <div className="text-xs text-gray-500">CVV</div>
                              <CVVDisplay />
                            </div>
                            
                            {/* Aviso de uso único */}
                            <div className="absolute bottom-6 left-6 right-6">
                              <div className="text-xs text-white opacity-70 text-center">
                                Este cartão é de uso único e expira em 1 mês
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Formulário Redesenhado */}
                  <div className="rounded-xl shadow-sm border border-gray-100 p-8 min-h-[420px] flex flex-col justify-between">
                    <div className="max-w-md mx-auto mb-8">
                      <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden mb-8">
                        <div 
                          className="absolute top-0 left-0 h-full bg-[#01042D] transition-all duration-500 ease-out"
                          style={{ width: `${((currentStep - 1) / 2) * 100}%` }}
                        >
                        </div>
                      </div>
                      
                      <div className="flex justify-center gap-12">
                        {/* Etapa 1 */}
                        <div className="flex flex-col items-center relative">
                          <div 
                            className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 shadow-sm transition-all duration-300 ${
                              currentStep >= 1 ? 'bg-[#01042D] text-white' : 'bg-white text-gray-400 border border-gray-200'
                            }`}
                          >
                            <User className="w-6 h-6" />
                          </div>
                          <span className={`text-sm font-semibold ${
                            currentStep >= 1 ? 'text-[#01042D]' : 'text-gray-400'
                          }`}>
                            Dados
                          </span>
                        </div>
                        
                        {/* Etapa 2 */}
                        <div className="flex flex-col items-center relative">
                          <div 
                            className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 shadow-sm transition-all duration-300 ${
                              currentStep >= 2 ? 'bg-[#01042D] text-white' : 'bg-white text-gray-400 border border-gray-200'
                            }`}
                          >
                            <CreditCard className="w-6 h-6" />
                          </div>
                          <span className={`text-sm font-semibold ${
                            currentStep >= 2 ? 'text-[#01042D]' : 'text-gray-400'
                          }`}>
                            Confirmação
                          </span>
                        </div>
                        
                        {/* Etapa 3 */}
                        <div className="flex flex-col items-center relative">
                          <div 
                            className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 shadow-sm transition-all duration-300 ${
                              currentStep >= 3 ? 'bg-[#01042D] text-white' : 'bg-white text-gray-400 border border-gray-200'
                            }`}
                          >
                            <MessageCircle className="w-6 h-6" />
                          </div>
                          <span className={`text-sm font-semibold ${
                            currentStep >= 3 ? 'text-[#01042D]' : 'text-gray-400'
                          }`}>
                            Solicitar
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {currentStep === 1 && (
                      <div className="space-y-6">
                        <div className="group">
                          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                            <div className="flex items-center">
                              <User className="w-4 h-4 mr-2 text-[#01042D]" />
                              Nome completo
                            </div>
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              id="name"
                              className="w-full py-4 px-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#01042D] focus:border-[#01042D] transition-all placeholder-gray-400"
                              placeholder="Digite seu nome completo"
                              onChange={handleNameChange}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="group">
                            <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-2">
                              <div className="flex items-center">
                                <Euro className="w-4 h-4 mr-2 text-[#01042D]" />
                                Moeda
                              </div>
                            </label>
                            <div className="relative">
                              <select
                                id="currency"
                                className="w-full py-4 px-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#01042D] focus:border-[#01042D] transition-all appearance-none"
                                onChange={handleCurrencyChange}
                                value={currency}
                              >
                                <option value="EUR">Euro (EUR)</option>
                                <option value="BRL">Real (BRL)</option>
                              </select>
                              <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                                <ChevronDown className="w-4 h-4 text-gray-400" />
                              </div>
                            </div>
                          </div>

                          <div className="group">
                            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
                              <div className="flex items-center">
                                <Wallet className="w-4 h-4 mr-2 text-[#01042D]" />
                                Valor
                              </div>
                            </label>
                            <div className="relative">
                              <input
                                type="text"
                                id="amount"
                                className="w-full py-4 px-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#01042D] focus:border-[#01042D] transition-all placeholder-gray-400"
                                placeholder="0.00"
                                onChange={handleAmountChange}
                                value={amount}
                              />
                              <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                                <span className="text-sm font-medium text-gray-400">{currency}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Valor em Kwanzas */}
                        <div className="bg-gradient-to-r from-[#01042D]/5 to-[#01042D]/10 p-4 rounded-xl border border-[#01042D]/10">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium text-gray-600">Valor em Kwanzas:</span>
                            <span className="text-xl font-bold text-[#01042D]">{amountKz}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-500">
                            <Info className="w-4 h-4 mr-2 text-[#01042D]" />
                            Taxa de conversão: 1 {currency} = {conversionRates[currency as keyof typeof conversionRates].toLocaleString('pt-AO')} Kz
                          </div>
                        </div>

                        {/* Aviso de Conversão Automática */}
                        {currency === 'EUR' && (
                          <div className="animate-fadeIn bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl overflow-hidden border border-blue-200">
                            <div className="flex items-center p-4 gap-4">
                              <div className="flex-shrink-0">
                                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                  <Euro className="w-5 h-5 text-[#01042D]" />
                                </div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-[#01042D]">
                                  Conversão Automática
                                </p>
                                <p className="mt-1 text-sm text-[#01042D]/70">
                                  Este cartão pode ser usado para compras em qualquer moeda. A conversão é feita automaticamente.
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Botão de Continuar */}
                        <button
                          className={`w-full py-4 px-6 rounded-xl transition-all flex items-center justify-center ${
                            isFormValid 
                              ? 'bg-[#01042D] text-white hover:bg-[#020A5E] hover:shadow-lg' 
                              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          }`}
                          disabled={!isFormValid}
                          onClick={handleNextStep}
                        >
                          <span className="text-base font-medium mr-2">Continuar</span>
                          <ArrowRight className="w-5 h-5" />
                        </button>

                        {/* Informações de Segurança */}
                        <div className="flex items-center justify-center text-sm text-gray-500 mt-4">
                          <Lock className="w-4 h-4 mr-2" />
                          Seus dados estão protegidos
                        </div>
                      </div>
                    )}

                    {currentStep === 2 && (
                      <div className="flex flex-col flex-1 justify-center">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                          <div className="p-4 bg-gray-50 rounded-md shadow-sm">
                            <div className="text-sm font-medium text-gray-500">Nome</div>
                            <div className="text-lg font-semibold text-gray-900">{cardHolderName}</div>
                          </div>
                          <div className="p-4 bg-gray-50 rounded-md shadow-sm">
                            <div className="text-sm font-medium text-gray-500">Valor</div>
                            <div className="text-lg font-semibold text-gray-900">{amount} {currency}</div>
                            <div className="text-sm text-gray-500">{amountKz}</div>
                          </div>
                        </div>

                        {/* Avisos Importantes */}
                        <div className="space-y-3 mb-6">
                          <div className="bg-amber-50 rounded-xl overflow-hidden border border-amber-200">
                            <div className="p-4">
                              <div className="flex items-center gap-2 mb-3">
                                <Info className="w-5 h-5 text-amber-600" />
                                <h3 className="font-medium text-amber-900">Avisos Importantes</h3>
                              </div>
                              <div className="space-y-2">
                                <div className="flex items-start gap-2">
                                  <div className="w-5 h-5 mt-0.5 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                                    <span className="text-xs font-medium text-amber-700">1</span>
                                  </div>
                                  <p className="text-sm text-amber-800">
                                    Se usar em uma compra superior ao saldo, será cobrada uma <span className="font-medium">multa automática de 1 EUR</span>.
                                  </p>
                                </div>
                                <div className="flex items-start gap-2">
                                  <div className="w-5 h-5 mt-0.5 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                                    <span className="text-xs font-medium text-amber-700">2</span>
                                  </div>
                                  <p className="text-sm text-amber-800">
                                    Este é um cartão de <span className="font-medium">uso único</span>. Após ser usado, o cartão deixa de existir automaticamente.
                                  </p>
                                </div>
                                <div className="flex items-start gap-2">
                                  <div className="w-5 h-5 mt-0.5 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                                    <span className="text-xs font-medium text-amber-700">3</span>
                                  </div>
                                  <p className="text-sm text-amber-800">
                                    Após o envio do cartão carregado, <span className="font-medium">não há possibilidade de reembolso</span>.
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex-1 flex flex-col justify-center items-center">
                          <div className="w-full bg-blue-50 border border-blue-100 rounded-lg p-4 flex items-center mb-6">
                            <Info className="w-5 h-5 text-blue-500 mr-2" />
                            <span className="text-sm text-blue-900">Confira atentamente seus dados antes de confirmar. Após a solicitação, não será possível alterar as informações.</span>
                          </div>
                        </div>

                        <div className="flex gap-3 pt-2">
                          <button
                            className="flex-1 py-3 px-4 border border-gray-300 bg-white text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                            onClick={handlePrevStep}
                          >
                            Voltar
                          </button>
                          <button
                            className="flex-1 py-3 px-4 bg-[#01042D] text-white rounded-md hover:bg-[#020A5E] transition-colors"
                            onClick={handleNextStep}
                          >
                            Confirmar
                          </button>
                        </div>
                      </div>
                    )}

                    {currentStep === 3 && (
                      <div className="flex flex-col flex-1 justify-center items-center min-h-[320px]">
                        <div className="w-full flex flex-col items-center justify-center mb-6">
                          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto text-green-600 mb-2">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          <h2 className="text-xl font-bold mb-1 text-center">Tudo pronto!</h2>
                          <p className="text-gray-600 mb-2 text-center">
                            Seus dados foram confirmados.<br />Clique no botão abaixo para solicitar seu cartão via WhatsApp.
                          </p>
                        </div>
                        <div className="flex flex-col gap-3 w-full">
                          <button
                            className="w-full py-3 px-4 bg-[#01042D] text-white rounded-md hover:bg-[#020A5E] transition-all flex items-center justify-center"
                            onClick={openWhatsApp}
                          >
                            <svg 
                              className="w-5 h-5 mr-2" 
                              fill="currentColor" 
                              viewBox="0 0 24 24" 
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                            </svg>
                            Solicitar Cartão via WhatsApp
                          </button>
                          <button
                            className="w-full py-3 px-4 border border-gray-300 bg-white text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                            onClick={handlePrevStep}
                          >
                            Voltar
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Informações do Cartão */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 mb-8">
                  <div className="border border-gray-100 p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center mb-4">
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mr-3">
                        <Check className="w-4 h-4 text-green-600" />
                      </div>
                      <h3 className="font-semibold text-gray-900">Uso Único</h3>
                    </div>
                    <p className="text-sm text-gray-600">Cartão válido para uma única compra, garantindo sua segurança.</p>
                  </div>

                  <div className="border border-gray-100 p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center mb-4">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                        <Clock className="w-4 h-4 text-blue-600" />
                      </div>
                      <h3 className="font-semibold text-gray-900">Validade</h3>
                    </div>
                    <p className="text-sm text-gray-600">Válido por 30 dias após a emissão do cartão.</p>
                  </div>

                  <div className="border border-gray-100 p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center mb-4">
                      <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center mr-3">
                        <Globe className="w-4 h-4 text-purple-600" />
                      </div>
                      <h3 className="font-semibold text-gray-900">Internacional</h3>
                    </div>
                    <p className="text-sm text-gray-600">Aceito em qualquer loja online internacional.</p>
                  </div>
                </div>
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
      
      <style>
        {`
          .preserve-3d {
            transform-style: preserve-3d;
            -webkit-transform-style: preserve-3d;
          }
          
          .perspective {
            perspective: 1000px;
          }
          
          .backface-hidden {
            backface-visibility: hidden;
            -webkit-backface-visibility: hidden;
          }
          
          .rotate-y-180 {
            transform: rotateY(180deg);
          }
          
          @keyframes shine {
            0% { background-position: 200% center; }
            100% { background-position: -200% center; }
          }
          
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(-4px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          .animate-fadeIn {
            animation: fadeIn 0.3s ease-out;
          }
        `}
      </style>
    </>
  );
};

export default VisaVirtualPage; 