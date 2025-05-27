import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUpDown, Globe, Shield, Clock, MessageCircle, CheckCircle, ArrowRight, Zap, Users, Award, Send, TrendingUp } from 'lucide-react';
import Header from '../components/Header';
import Navigation from '../components/Navigation';
import { supabase } from '../lib/supabase';
import { SEO } from '@/components/SEO';

// Tipos para melhor tipagem
interface ExchangeRates {
  EUR: number;
  BRL: number;
}

interface CurrencyInfo {
  symbol: string;
  flag: string;
  name: string;
  country: string;
  code: string;
}

const TransferenciasPage: React.FC = () => {
  const navigate = useNavigate();
  
  // Estados da calculadora
  const [topAmount, setTopAmount] = useState<string>('');
  const [bottomAmount, setBottomAmount] = useState<string>('');
  const [topCurrency, setTopCurrency] = useState<'AOA' | 'EUR' | 'BRL'>('AOA');
  const [bottomCurrency, setBottomCurrency] = useState<'AOA' | 'EUR' | 'BRL'>('EUR');
  const [exchangeRates, setExchangeRates] = useState<ExchangeRates>({
    EUR: 1300,
    BRL: 215
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Configurações de desconto por moeda (corrigido)
  const CURRENCY_DISCOUNTS = {
    EUR: 100,
    BRL: 40
  } as const;

  // Carregar taxas de câmbio do Supabase
  useEffect(() => {
    const loadExchangeRates = async (): Promise<void> => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('visa_virtual_exchange_rates')
          .select('currency, rate');

        if (error) throw error;
        
        if (data && data.length > 0) {
          const rates: Partial<ExchangeRates> = {};
          data.forEach(rate => {
            if (rate.currency === 'EUR' || rate.currency === 'BRL') {
              // Garantir que estamos usando a taxa ORIGINAL (sem desconto)
              const originalRate = Number(rate.rate);
              rates[rate.currency] = originalRate;
            }
          });
          
          // Atualizar apenas se temos dados válidos
          if (rates.EUR || rates.BRL) {
            setExchangeRates(prev => ({ ...prev, ...rates }));
          }
        }
      } catch (error) {
        console.error('Erro ao carregar taxas de câmbio:', error);
        // Manter taxas padrão em caso de erro
      } finally {
        setIsLoading(false);
      }
    };

    loadExchangeRates();
  }, []);

  // Função para formatar números no padrão angolano/português
  const formatCurrency = useCallback((value: number, currency: 'AOA' | 'EUR' | 'BRL'): string => {
    if (!value || isNaN(value) || !isFinite(value)) return '';
    
    const formatter = new Intl.NumberFormat('pt-AO', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    
    return formatter.format(value);
  }, []);

  // Função para limpar e converter string para número
  const parseNumericValue = useCallback((value: string): number => {
    if (!value || typeof value !== 'string') return 0;
    
    // Remove espaços e caracteres especiais, mantém apenas números, vírgulas e pontos
    let cleaned = value.replace(/[^\d,.]/g, '');
    
    // Se tem vírgula e ponto, assumir que vírgula é separador de milhares e ponto é decimal
    if (cleaned.includes(',') && cleaned.includes('.')) {
      // Formato: 1.200.000,50 (padrão brasileiro/europeu)
      cleaned = cleaned.replace(/\./g, '').replace(',', '.');
    } else if (cleaned.includes(',')) {
      // Se só tem vírgula, pode ser decimal (1200,50) ou milhares (1,200)
      const parts = cleaned.split(',');
      if (parts.length === 2 && parts[1].length <= 2) {
        // Provavelmente decimal: 1200,50
        cleaned = cleaned.replace(',', '.');
      } else {
        // Provavelmente separador de milhares: 1,200,000
        cleaned = cleaned.replace(/,/g, '');
      }
    }
    // Se só tem pontos, assumir que são separadores de milhares: 1.200.000
    else if (cleaned.includes('.')) {
      const parts = cleaned.split('.');
      if (parts.length > 2 || (parts.length === 2 && parts[1].length > 2)) {
        // Múltiplos pontos ou último grupo > 2 dígitos = separadores de milhares
        cleaned = cleaned.replace(/\./g, '');
      }
      // Senão, manter como decimal
    }
    
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  }, []);

  // Função para formatar input em tempo real
  const formatInputValue = useCallback((value: string): string => {
    if (!value) return '';
    
    // Parse do valor
    const numericValue = parseNumericValue(value);
    if (numericValue === 0) return '';
    
    // Formatar usando a mesma função
    return formatCurrency(numericValue, 'AOA'); // Usar AOA como padrão para formatação
  }, [parseNumericValue, formatCurrency]);

  // Obter taxa ajustada com desconto (corrigido para BRL)
  const getAdjustedRate = useCallback((currency: 'EUR' | 'BRL'): number => {
    const baseRate = exchangeRates[currency];
    const discount = CURRENCY_DISCOUNTS[currency];
    return Math.max(baseRate - discount, 1);
  }, [exchangeRates]);

  // Converter entre moedas
  const convertCurrency = useCallback((amount: number, fromCurrency: 'AOA' | 'EUR' | 'BRL', toCurrency: 'AOA' | 'EUR' | 'BRL'): number => {
    if (amount <= 0 || fromCurrency === toCurrency) return amount;
    
    if (fromCurrency === 'AOA') {
      // De AOA para moeda estrangeira (sempre taxa original - SEM desconto)
      const baseRate = exchangeRates[toCurrency as 'EUR' | 'BRL'];
      return amount / baseRate;
    } else if (toCurrency === 'AOA') {
      // De moeda estrangeira para AOA
      // DESCONTO APENAS se AOA estiver no campo de baixo (bottomCurrency)
      if (bottomCurrency === 'AOA') {
        const adjustedRate = getAdjustedRate(fromCurrency as 'EUR' | 'BRL');
        return amount * adjustedRate;
      } else {
        // Se AOA estiver no campo de cima, usar taxa original
        const baseRate = exchangeRates[fromCurrency as 'EUR' | 'BRL'];
        return amount * baseRate;
      }
    } else {
      // Entre duas moedas estrangeiras (via AOA)
      const toAOA = convertCurrency(amount, fromCurrency, 'AOA');
      return convertCurrency(toAOA, 'AOA', toCurrency);
    }
  }, [exchangeRates, getAdjustedRate, bottomCurrency]);

  // Handler para mudança no campo superior
  const handleTopAmountChange = useCallback((value: string): void => {
    setTopAmount(value);
    
    if (!value.trim()) {
      setBottomAmount('');
      return;
    }
    
    const numericValue = parseNumericValue(value);
    if (numericValue > 0) {
      const converted = convertCurrency(numericValue, topCurrency, bottomCurrency);
      setBottomAmount(formatCurrency(converted, bottomCurrency));
    } else {
      setBottomAmount('');
    }
  }, [parseNumericValue, convertCurrency, topCurrency, bottomCurrency, formatCurrency]);

  // Handler para mudança no campo inferior
  const handleBottomAmountChange = useCallback((value: string): void => {
    setBottomAmount(value);
    
    if (!value.trim()) {
      setTopAmount('');
      return;
    }
    
    const numericValue = parseNumericValue(value);
    if (numericValue > 0) {
      const converted = convertCurrency(numericValue, bottomCurrency, topCurrency);
      setTopAmount(formatCurrency(converted, topCurrency));
    } else {
      setTopAmount('');
    }
  }, [parseNumericValue, convertCurrency, bottomCurrency, topCurrency, formatCurrency]);

  // Trocar posições das moedas
  const swapCurrencies = useCallback((): void => {
    // Trocar moedas
    const tempCurrency = topCurrency;
    setTopCurrency(bottomCurrency);
    setBottomCurrency(tempCurrency);
    
    // Trocar valores
    const tempAmount = topAmount;
    setTopAmount(bottomAmount);
    setBottomAmount(tempAmount);
  }, [topCurrency, bottomCurrency, topAmount, bottomAmount]);

  // Handler para mudança de moeda superior
  const handleTopCurrencyChange = useCallback((newCurrency: 'AOA' | 'EUR' | 'BRL'): void => {
    setTopCurrency(newCurrency);
    
    // Se a moeda superior não for AOA, a inferior deve ser AOA
    if (newCurrency !== 'AOA') {
      setBottomCurrency('AOA');
    }
    
    // Recalcular se há valor
    if (topAmount.trim()) {
      const numericValue = parseNumericValue(topAmount);
      if (numericValue > 0) {
        const targetCurrency = newCurrency !== 'AOA' ? 'AOA' : bottomCurrency;
        const converted = convertCurrency(numericValue, newCurrency, targetCurrency);
        setBottomAmount(formatCurrency(converted, targetCurrency));
      }
    }
  }, [topAmount, parseNumericValue, convertCurrency, bottomCurrency, formatCurrency]);

  // Handler para mudança de moeda inferior
  const handleBottomCurrencyChange = useCallback((newCurrency: 'AOA' | 'EUR' | 'BRL'): void => {
    // Se a moeda superior não for AOA, a inferior só pode ser AOA
    if (topCurrency !== 'AOA' && newCurrency !== 'AOA') {
      return; // Não permitir mudança
    }
    
    setBottomCurrency(newCurrency);
    
    // Recalcular se há valor
    if (topAmount.trim()) {
      const numericValue = parseNumericValue(topAmount);
      if (numericValue > 0) {
        const converted = convertCurrency(numericValue, topCurrency, newCurrency);
        setBottomAmount(formatCurrency(converted, newCurrency));
      }
    }
  }, [topCurrency, topAmount, parseNumericValue, convertCurrency, formatCurrency]);

  // Obter informações da moeda
  const getCurrencyInfo = useCallback((currency: string): CurrencyInfo => {
    const currencyMap: Record<string, CurrencyInfo> = {
      AOA: { 
        symbol: 'Kz', 
        flag: '🇦🇴', 
        name: 'Kwanza Angolano',
        country: 'Angola',
        code: 'AOA'
      },
      EUR: { 
        symbol: '€', 
        flag: '🇪🇺', 
        name: 'Euro',
        country: 'Europa',
        code: 'EUR'
      },
      BRL: { 
        symbol: 'R$', 
        flag: '🇧🇷', 
        name: 'Real Brasileiro',
        country: 'Brasil',
        code: 'BRL'
      }
    };
    
    return currencyMap[currency] || currencyMap.AOA;
  }, []);

  // Obter taxa de câmbio atual para exibição
  const getCurrentExchangeRate = useCallback((): string => {
    // Verificar se a moeda não é AOA antes de acessar as taxas
    if (topCurrency === 'AOA' || bottomCurrency === 'AOA') {
      const foreignCurrency = topCurrency === 'AOA' ? bottomCurrency : topCurrency;
      if (foreignCurrency !== 'AOA') {
        const baseRate = exchangeRates[foreignCurrency as 'EUR' | 'BRL'];
        const adjustedRate = getAdjustedRate(foreignCurrency as 'EUR' | 'BRL');
        return `1 ${foreignCurrency} = ${formatCurrency(baseRate, 'AOA')} AOA (compra) | ${formatCurrency(adjustedRate, 'AOA')} AOA (venda)`;
      }
    }
    return '';
  }, [topCurrency, bottomCurrency, exchangeRates, getAdjustedRate, formatCurrency]);

  // Handler para WhatsApp
  const handleWhatsAppTransfer = useCallback((): void => {
    if (!topAmount.trim() || !bottomAmount.trim()) return;
    
    const rate = getCurrentExchangeRate();
    const message = `*Solicitação de Transferência Internacional*

*Valor em ${topCurrency}:* ${topAmount} ${getCurrencyInfo(topCurrency).symbol}
*Valor em ${bottomCurrency}:* ${bottomAmount} ${getCurrencyInfo(bottomCurrency).symbol}
*Taxa de câmbio:* ${rate}

Gostaria de realizar esta transferência internacional.`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/244931343433?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  }, [topAmount, bottomAmount, topCurrency, bottomCurrency, getCurrentExchangeRate, getCurrencyInfo]);

  const handlePageChange = (id: number) => {
    console.log("Mudando para página:", id);
  };

  return (
    <>
      <SEO 
        title="Transferências Internacionais | DOT ANGOLA"
        description="Envie dinheiro de Angola para Europa, Brasil e outros países com as melhores taxas. Transferências rápidas, seguras e confiáveis."
        type="website"
      />
      
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-0 sm:p-4">
        <div className="max-w-6xl w-full bg-white rounded-none sm:rounded-3xl shadow-xl overflow-hidden">
        <Header />
        <Navigation onPageChange={handlePageChange} />
        
          {/* Hero Section */}
          <div className="px-4 sm:px-6 py-8 sm:py-16">
            <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-center">
              {/* Conteúdo da esquerda */}
              <div className="text-center lg:text-left order-2 lg:order-1">
                <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 rounded-full px-4 py-2 mb-6">
                  <Globe className="w-4 h-4" />
                  <span className="text-sm font-medium">Transferências Globais</span>
                </div>
                
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-800 mb-6 leading-tight">
                  Envie Dinheiro para
                  <span className="block text-blue-600">
                    Europa & Brasil
                  </span>
                </h1>
                
                <p className="text-lg sm:text-xl text-gray-600 mb-8 leading-relaxed">
                  Transferências rápidas, seguras e com as melhores taxas do mercado. 
                  De Angola para o mundo todo.
                </p>
                
                {/* Features */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                  <div className="flex items-center gap-3 justify-center lg:justify-start">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                    <span className="text-gray-700">100% Seguro & Confiável</span>
                  </div>
                  
                  <div className="flex items-center gap-3 justify-center lg:justify-start">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Zap className="w-4 h-4 text-blue-600" />
                    </div>
                    <span className="text-gray-700">Transferência Rápida</span>
                  </div>
                  
                  <div className="flex items-center gap-3 justify-center lg:justify-start">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <Shield className="w-4 h-4 text-purple-600" />
                    </div>
                    <span className="text-gray-700">Taxas Competitivas</span>
                  </div>
                  
                  <div className="flex items-center gap-3 justify-center lg:justify-start">
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                      <Users className="w-4 h-4 text-orange-600" />
                    </div>
                    <span className="text-gray-700">Suporte 24/7</span>
                  </div>
                </div>
                
                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <button 
                    onClick={() => document.getElementById('calculator')?.scrollIntoView({ behavior: 'smooth' })}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
                  >
                    <ArrowRight className="w-5 h-5" />
                    Calcular Transferência
                  </button>
                  
                  <button 
                    onClick={handleWhatsAppTransfer}
                    className="border-2 border-gray-300 hover:border-blue-600 text-gray-700 hover:text-blue-600 px-8 py-3 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
                  >
                    <MessageCircle className="w-5 h-5" />
                    Falar com Especialista
                  </button>
                </div>
              </div>
              
              {/* Calculadora da direita - RESPONSIVA */}
              <div id="calculator" className="w-full order-1 lg:order-2">
                <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-xl border border-gray-100 w-full max-w-md mx-auto lg:max-w-sm">
                  {/* Header da Calculadora */}
                  <div className="text-center mb-4">
                    <h3 className="text-lg font-bold text-gray-900 mb-1">Enviar Dinheiro</h3>
                    <p className="text-gray-500 text-xs">Calcule sua transferência</p>
                  </div>

                  {/* Cards de Envio e Recebimento */}
                  <div className="space-y-3">
                    {/* Card Superior - Você Envia */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-3 border border-blue-100">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">VOCÊ ENVIA</span>
                        <span className="text-xs font-semibold text-gray-700">{getCurrencyInfo(topCurrency).flag} {topCurrency}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={topAmount}
                          onChange={(e) => handleTopAmountChange(e.target.value)}
                          placeholder="0,00"
                          className="flex-1 text-xl font-bold text-gray-900 bg-transparent border-0 focus:outline-none placeholder-gray-400"
                        />
                        <select
                          value={topCurrency}
                          onChange={(e) => handleTopCurrencyChange(e.target.value as 'AOA' | 'EUR' | 'BRL')}
                          className="appearance-none bg-white border border-gray-200 rounded-md px-2 py-1 text-xs font-semibold text-gray-700 focus:outline-none cursor-pointer"
                        >
                          <option value="AOA">{getCurrencyInfo('AOA').flag} AOA</option>
                          <option value="EUR">{getCurrencyInfo('EUR').flag} EUR</option>
                          <option value="BRL">{getCurrencyInfo('BRL').flag} BRL</option>
                        </select>
                      </div>
                    </div>

                    {/* Botão de Troca */}
                    <div className="flex justify-center">
                      <button
                        onClick={swapCurrencies}
                        className="bg-gray-900 hover:bg-gray-800 text-white rounded-full p-2 transition-all transform hover:scale-110 shadow-md"
                        title="Trocar valores"
                      >
                        <ArrowUpDown className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Card Inferior - Você Recebe */}
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-3 border border-green-100">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">VOCÊ RECEBE</span>
                        <span className="text-xs font-semibold text-gray-700">{getCurrencyInfo(bottomCurrency).flag} {bottomCurrency}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={bottomAmount}
                          onChange={(e) => handleBottomAmountChange(e.target.value)}
                          placeholder="0,00"
                          className="flex-1 text-xl font-bold text-gray-900 bg-transparent border-0 focus:outline-none placeholder-gray-400"
                        />
                        <select
                          value={bottomCurrency}
                          onChange={(e) => handleBottomCurrencyChange(e.target.value as 'AOA' | 'EUR' | 'BRL')}
                          disabled={topCurrency !== 'AOA'}
                          className={`appearance-none bg-white border border-gray-200 rounded-md px-2 py-1 text-xs font-semibold text-gray-700 focus:outline-none cursor-pointer ${
                            topCurrency !== 'AOA' ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                        >
                          <option value="AOA">{getCurrencyInfo('AOA').flag} AOA</option>
                          {topCurrency === 'AOA' && (
                            <>
                              <option value="EUR">{getCurrencyInfo('EUR').flag} EUR</option>
                              <option value="BRL">{getCurrencyInfo('BRL').flag} BRL</option>
                            </>
                          )}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Informações da Taxa */}
                  {(topAmount.trim() || bottomAmount.trim()) && (
                    <div className="mt-4 bg-gray-50 rounded-lg p-3">
                      {(() => {
                        const foreignCurrency = topCurrency === 'AOA' ? bottomCurrency : topCurrency;
                        if (foreignCurrency !== 'AOA') {
                          // Determinar qual taxa mostrar baseado na direção da conversão
                          if (topCurrency === 'AOA') {
                            // AOA → Moeda estrangeira (compra - taxa original)
                            return (
                              <div className="flex justify-between items-center text-xs">
                                <span className="text-gray-600">Taxa de câmbio</span>
                                <span className="font-semibold text-blue-600">1 {foreignCurrency} = {formatCurrency(exchangeRates[foreignCurrency as 'EUR' | 'BRL'], 'AOA')} AOA</span>
                              </div>
                            );
                          } else {
                            // Moeda estrangeira → AOA (venda - taxa com desconto)
                            return (
                              <div className="flex justify-between items-center text-xs">
                                <span className="text-gray-600">Taxa de câmbio</span>
                                <span className="font-semibold text-green-600">1 {foreignCurrency} = {formatCurrency(getAdjustedRate(foreignCurrency as 'EUR' | 'BRL'), 'AOA')} AOA</span>
                              </div>
                            );
                          }
                        }
                        return null;
                      })()}
                    </div>
                  )}

                  {/* Botão de Continuar */}
                  <button
                    onClick={handleWhatsAppTransfer}
                    disabled={!topAmount.trim() || !bottomAmount.trim() || isLoading}
                    className="w-full mt-4 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 shadow-md"
                  >
                    {isLoading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Continuar
                      </>
                    )}
                  </button>

                  {/* Informações de Segurança */}
                  <div className="mt-3 text-center">
                    <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                      <span>🔒 Seguro</span>
                      <span>✨ Sem taxas</span>
                      <span>⚡ Rápido</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Como Funciona + Vantagens - VERSÃO COMPACTA */}
          <div className="py-12 px-6 bg-gray-50">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Como Funciona & Por que Escolher a DOT</h2>
                <p className="text-gray-600">Processo simples e as melhores condições do mercado</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Como Funciona - Compacto */}
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-gray-800 text-center mb-4">Como Funciona</h3>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold text-xs">1</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 text-sm">Calcule o Valor</h4>
                      <p className="text-gray-600 text-xs">Use nossa calculadora</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold text-xs">2</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 text-sm">Confirme via WhatsApp</h4>
                      <p className="text-gray-600 text-xs">Nossa equipe te guia</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold text-xs">3</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 text-sm">Dinheiro Enviado</h4>
                      <p className="text-gray-600 text-xs">Rápido e seguro</p>
                    </div>
                  </div>
                </div>

                {/* Vantagens - Grid 2x2 Compacto */}
                <div>
                  <h3 className="text-lg font-bold text-gray-800 text-center mb-4">Por que Escolher a DOT</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100 text-center">
                      <Shield className="w-6 h-6 text-green-600 mx-auto mb-2" />
                      <h4 className="font-semibold text-gray-800 text-xs mb-1">Seguro</h4>
                      <p className="text-gray-600 text-xs">100% protegido</p>
                    </div>
                    
                    <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100 text-center">
                      <Clock className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                      <h4 className="font-semibold text-gray-800 text-xs mb-1">Rápido</h4>
                      <p className="text-gray-600 text-xs">Até 24h</p>
                    </div>
                    
                    <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100 text-center">
                      <Award className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                      <h4 className="font-semibold text-gray-800 text-xs mb-1">Melhores Taxas</h4>
                      <p className="text-gray-600 text-xs">Sem surpresas</p>
                    </div>
                    
                    <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100 text-center">
                      <Users className="w-6 h-6 text-orange-600 mx-auto mb-2" />
                      <h4 className="font-semibold text-gray-800 text-xs mb-1">Suporte 24/7</h4>
                      <p className="text-gray-600 text-xs">Sempre disponível</p>
                    </div>
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
    </>
  );
};

export default TransferenciasPage; 