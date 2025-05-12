import { useState, useEffect } from 'react';
import { Euro, DollarSign, RefreshCw, TrendingUp, Banknote } from 'lucide-react';
import { ExchangeRate, Currency } from '@/types/supabase';
import { getExchangeRates, updateExchangeRate, initExchangeRates } from '@/lib/database';

export default function ExchangeRateManager() {
  const [rates, setRates] = useState<ExchangeRate[]>([]);
  const [loading, setLoading] = useState<Record<Currency, boolean>>({
    EUR: false,
    BRL: false,
    KWZ: false,
  });
  const [formData, setFormData] = useState<Record<Currency, string>>({
    EUR: '',
    BRL: '',
    KWZ: '',
  });
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const initialize = async () => {
      try {
        setInitializing(true);
        // Inicializar taxas de câmbio (remove moedas não suportadas e adiciona as que faltam)
        await initExchangeRates();
        // Carregar taxas após inicialização
        await loadRates();
      } catch (error) {
        console.error('Erro ao inicializar taxas de câmbio:', error);
      } finally {
        setInitializing(false);
      }
    };

    initialize();
  }, []);

  const loadRates = async () => {
    try {
      setLoading({EUR: true, BRL: true, KWZ: true});
      const data = await getExchangeRates();
      setRates(data);
      
      // Atualizar formulário com taxas atuais
      const rateValues = data.reduce((acc, rate) => ({
        ...acc,
        [rate.currency]: rate.rate.toString()
      }), {} as Record<Currency, string>);
      
      setFormData(prev => ({
        ...prev,
        ...rateValues
      }));
    } catch (error) {
      console.error('Erro ao carregar taxas:', error);
    } finally {
      setLoading({EUR: false, BRL: false, KWZ: false});
    }
  };

  const handleUpdateRate = async (currency: Currency) => {
    try {
      setLoading(prev => ({...prev, [currency]: true}));
      const rate = parseFloat(formData[currency]);
      if (isNaN(rate)) {
        throw new Error('Taxa inválida');
      }
      console.log(`Atualizando taxa de ${currency} para ${rate}`);
      const updatedExchangeRate = await updateExchangeRate(currency, rate);
      
      // Atualiza apenas a moeda específica nos estados
      setRates(prevRates => {
        return prevRates.map(r => 
          r.currency === currency ? updatedExchangeRate : r
        );
      });
      
      // Atualiza apenas o campo de formulário da moeda atualizada
      setFormData(prev => ({
        ...prev,
        [currency]: updatedExchangeRate.rate.toString()
      }));
    } catch (error) {
      console.error(`Erro ao atualizar taxa de ${currency}:`, error);
      alert(`Erro ao atualizar taxa de câmbio para ${currency}. Verifique o valor informado.`);
    } finally {
      setLoading(prev => ({...prev, [currency]: false}));
    }
  };

  const handleInputChange = (currency: Currency, value: string) => {
    setFormData(prev => ({
      ...prev,
      [currency]: value
    }));
  };

  const getCurrencyInfo = (currency: Currency) => {
    switch (currency) {
      case 'EUR':
        return {
          name: 'Euro',
          symbol: '€',
          icon: Euro,
          color: 'blue'
        };
      case 'BRL':
        return {
          name: 'Real',
          symbol: 'R$',
          icon: DollarSign,
          color: 'green'
        };
      case 'KWZ':
        return {
          name: 'Kwanza',
          symbol: 'Kz',
          icon: Banknote,
          color: 'yellow'
        };
      default:
        return {
          name: currency,
          symbol: currency,
          icon: DollarSign,
          color: 'gray'
        };
    }
  };

  return (
    <div className="space-y-6">
      {initializing ? (
        <div className="flex flex-col items-center justify-center py-12">
          <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mb-4" />
          <p className="text-gray-600">Inicializando taxas de câmbio...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(['EUR', 'BRL', 'KWZ'] as Currency[]).map((currency) => {
            const info = getCurrencyInfo(currency);
            const Icon = info.icon;
            const currentRate = rates.find(r => r.currency === currency);
            const isLoadingThis = loading[currency];
            
            return (
              <div
                key={currency}
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
              >
                <div className="p-4 bg-gray-50 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                        <Icon className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{info.name}</h3>
                        <p className="text-sm text-gray-500">{currency}</p>
                      </div>
                    </div>
                    {currentRate && (
                      <div className="flex items-center space-x-2 text-green-600">
                        <TrendingUp className="w-4 h-4" />
                        <span className="text-sm font-medium">
                          {currentRate.rate.toFixed(2)} {info.symbol}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="p-4">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nova Taxa
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={formData[currency]}
                          onChange={(e) => handleInputChange(currency, e.target.value)}
                          className="w-full pl-8 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Digite a nova taxa"
                        />
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                          {info.symbol}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleUpdateRate(currency)}
                      disabled={isLoadingThis || !formData[currency]}
                      className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      <RefreshCw className={`w-4 h-4 ${isLoadingThis ? 'animate-spin' : ''}`} />
                      <span>{isLoadingThis ? 'Atualizando...' : 'Atualizar Taxa'}</span>
                    </button>
                  </div>
                  {currentRate && (
                    <div className="mt-4 text-sm text-gray-500">
                      Última atualização: {new Date(currentRate.updated_at).toLocaleString()}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
} 