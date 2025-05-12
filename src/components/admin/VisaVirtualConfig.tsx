import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { CreditCard, RefreshCw } from 'lucide-react';

interface ExchangeRate {
  id: string;
  currency: string;
  rate: number;
  updated_at: string;
}

export default function VisaVirtualConfig() {
  const [rates, setRates] = useState<ExchangeRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingEUR, setUpdatingEUR] = useState(false);
  const [updatingBRL, setUpdatingBRL] = useState(false);
  const [eurRate, setEurRate] = useState('');
  const [brlRate, setBrlRate] = useState('');

  useEffect(() => {
    loadRates();
  }, []);

  const loadRates = async () => {
    try {
      const { data, error } = await supabase
        .from('visa_virtual_exchange_rates')
        .select('*')
        .order('currency');

      if (error) throw error;
      
      if (data) {
        setRates(data);
        const eur = data.find(r => r.currency === 'EUR');
        const brl = data.find(r => r.currency === 'BRL');
        if (eur) setEurRate(eur.rate.toString());
        if (brl) setBrlRate(brl.rate.toString());
      }
    } catch (err) {
      console.error('Erro ao carregar taxas:', err);
      toast.error('Erro ao carregar taxas de câmbio');
    } finally {
      setLoading(false);
    }
  };

  const updateRate = async (currency: 'EUR' | 'BRL') => {
    const setUpdating = currency === 'EUR' ? setUpdatingEUR : setUpdatingBRL;
    const rate = currency === 'EUR' ? eurRate : brlRate;
    const rateRecord = rates.find(r => r.currency === currency);

    if (!rateRecord) {
      toast.error(`Taxa de ${currency} não encontrada`);
      return;
    }

    try {
      setUpdating(true);
      
      const { error } = await supabase
        .from('visa_virtual_exchange_rates')
        .update({ rate: parseFloat(rate) })
        .eq('id', rateRecord.id);

      if (error) throw error;

      setRates(prev => 
        prev.map(r => 
          r.currency === currency 
            ? { ...r, rate: parseFloat(rate), updated_at: new Date().toISOString() } 
            : r
        )
      );

      toast.success(`Taxa de ${currency} atualizada com sucesso`);
    } catch (err) {
      console.error(`Erro ao atualizar taxa de ${currency}:`, err);
      toast.error(`Erro ao atualizar taxa de ${currency}`);
      
      if (currency === 'EUR') {
        setEurRate(rateRecord.rate.toString());
      } else {
        setBrlRate(rateRecord.rate.toString());
      }
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin text-[#01042D]">
          <RefreshCw size={32} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-[#01042D] text-white p-2 rounded-lg">
            <CreditCard size={24} />
          </div>
          <h1 className="text-2xl font-semibold text-[#01042D]">
            Configuração do Visa Virtual
          </h1>
        </div>

        {/* Card Principal */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-medium text-[#01042D]">
              Taxas de Câmbio
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Configure as taxas de conversão para cada moeda
            </p>
          </div>

          <div className="p-6">
            <div className="grid gap-6">
              {/* Taxa EUR */}
              <div className="bg-gray-50 rounded-xl p-6">
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  <div className="w-full md:w-32">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-[#01042D]">EUR</span>
                      <span className="text-xs text-gray-500">Euro</span>
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex gap-3">
                      <div className="relative flex-1">
                        <input
                          type="number"
                          value={eurRate}
                          onChange={(e) => setEurRate(e.target.value)}
                          className="w-full pl-12 pr-4 py-2.5 rounded-lg border border-gray-200 focus:border-[#01042D] focus:ring-1 focus:ring-[#01042D] transition-colors"
                          step="0.01"
                          min="0"
                          disabled={updatingEUR}
                        />
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                          AOA
                        </div>
                      </div>
                      <button
                        onClick={() => updateRate('EUR')}
                        disabled={updatingEUR}
                        className={`px-6 py-2.5 rounded-lg text-sm font-medium text-white transition-colors
                          ${updatingEUR 
                            ? 'bg-gray-300 cursor-not-allowed' 
                            : 'bg-[#01042D] hover:bg-[#01042D]/90'}`}
                      >
                        {updatingEUR ? (
                          <RefreshCw size={18} className="animate-spin" />
                        ) : (
                          'Atualizar'
                        )}
                      </button>
                    </div>
                    <div className="mt-2 text-xs text-gray-500">
                      Última atualização: {new Date(rates.find(r => r.currency === 'EUR')?.updated_at || '').toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>

              {/* Taxa BRL */}
              <div className="bg-gray-50 rounded-xl p-6">
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  <div className="w-full md:w-32">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-[#01042D]">BRL</span>
                      <span className="text-xs text-gray-500">Real</span>
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex gap-3">
                      <div className="relative flex-1">
                        <input
                          type="number"
                          value={brlRate}
                          onChange={(e) => setBrlRate(e.target.value)}
                          className="w-full pl-12 pr-4 py-2.5 rounded-lg border border-gray-200 focus:border-[#01042D] focus:ring-1 focus:ring-[#01042D] transition-colors"
                          step="0.01"
                          min="0"
                          disabled={updatingBRL}
                        />
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                          AOA
                        </div>
                      </div>
                      <button
                        onClick={() => updateRate('BRL')}
                        disabled={updatingBRL}
                        className={`px-6 py-2.5 rounded-lg text-sm font-medium text-white transition-colors
                          ${updatingBRL 
                            ? 'bg-gray-300 cursor-not-allowed' 
                            : 'bg-[#01042D] hover:bg-[#01042D]/90'}`}
                      >
                        {updatingBRL ? (
                          <RefreshCw size={18} className="animate-spin" />
                        ) : (
                          'Atualizar'
                        )}
                      </button>
                    </div>
                    <div className="mt-2 text-xs text-gray-500">
                      Última atualização: {new Date(rates.find(r => r.currency === 'BRL')?.updated_at || '').toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 