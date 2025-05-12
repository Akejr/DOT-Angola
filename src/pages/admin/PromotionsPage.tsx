import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Percent, Save, RefreshCw, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface PromotionSettings {
  id?: string;
  discount_percentage: number;
  is_active: boolean;
  applies_to_all: boolean;
  created_at?: string;
  updated_at?: string;
}

export default function PromotionsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [globalPromotion, setGlobalPromotion] = useState<PromotionSettings>({
    discount_percentage: 0,
    is_active: false,
    applies_to_all: true,
  });

  // Carregar a configuração de promoção atual
  useEffect(() => {
    async function loadPromotionSettings() {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('promotion_settings')
          .select('*')
          .eq('applies_to_all', true)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Erro ao carregar promoções:', error);
          toast.error('Erro ao carregar configurações de promoção');
          return;
        }

        if (data) {
          setGlobalPromotion(data);
        }
      } catch (error) {
        console.error('Erro ao carregar promoções:', error);
        toast.error('Erro ao carregar configurações de promoção');
      } finally {
        setIsLoading(false);
      }
    }

    loadPromotionSettings();
  }, []);

  // Salvar configurações de promoção
  const handleSavePromotion = async () => {
    try {
      setIsSaving(true);
      
      // Verifica se os valores são válidos
      const discountPercentage = Number(globalPromotion.discount_percentage);
      if (isNaN(discountPercentage) || discountPercentage < 0 || discountPercentage > 100) {
        toast.error('Porcentagem de desconto deve ser um número entre 0 e 100');
        return;
      }

      const promotionData = {
        ...globalPromotion,
        discount_percentage: discountPercentage,
        updated_at: new Date().toISOString()
      };

      let response;
      if (globalPromotion.id) {
        // Atualizar promoção existente
        response = await supabase
          .from('promotion_settings')
          .update(promotionData)
          .eq('id', globalPromotion.id);
      } else {
        // Criar nova promoção
        promotionData.created_at = new Date().toISOString();
        response = await supabase
          .from('promotion_settings')
          .insert([promotionData])
          .select();
      }

      if (response.error) {
        throw response.error;
      }

      if (response.data && response.data[0]) {
        setGlobalPromotion(response.data[0]);
      }

      toast.success('Configurações de promoção salvas com sucesso');
    } catch (error) {
      console.error('Erro ao salvar promoção:', error);
      toast.error('Erro ao salvar configurações de promoção');
    } finally {
      setIsSaving(false);
    }
  };

  // Função para renderizar o status atual da promoção
  const renderPromotionStatus = () => {
    if (!globalPromotion.id) {
      return (
        <div className="flex items-center p-4 bg-blue-50 text-blue-700 rounded-lg border border-blue-100">
          <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
          <span>Nova configuração - Salve para ativar</span>
        </div>
      );
    }

    if (globalPromotion.is_active) {
      return (
        <div className="flex items-center p-4 bg-green-50 text-green-700 rounded-lg border border-green-100">
          <CheckCircle className="w-5 h-5 mr-2 flex-shrink-0" />
          <div>
            <p className="font-medium">Promoção Ativa</p>
            <p className="text-sm text-green-600">Desconto de {globalPromotion.discount_percentage}% está sendo aplicado a todos os produtos</p>
          </div>
        </div>
      );
    }

    return (
      <div className="flex items-center p-4 bg-gray-50 text-gray-600 rounded-lg border border-gray-200">
        <Clock className="w-5 h-5 mr-2 flex-shrink-0" />
        <div>
          <p className="font-medium">Promoção Inativa</p>
          <p className="text-sm text-gray-500">Configure e ative para aplicar os descontos</p>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-800">
          Promoções
        </h1>
        {!isLoading && renderPromotionStatus()}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gray-50">
          <h2 className="text-lg font-medium text-gray-800 flex items-center">
            <Percent className="w-5 h-5 mr-2 text-blue-600" />
            Configuração de Desconto Global
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Defina um desconto percentual que será aplicado a todos os produtos do site.
          </p>
        </div>

        <div className="p-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-40">
              <RefreshCw className="w-6 h-6 text-blue-600 animate-spin" />
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label 
                    htmlFor="discount_percentage" 
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Porcentagem de Desconto (%)
                  </label>
                  <div className="relative">
                    <input
                      id="discount_percentage"
                      type="number"
                      min="0"
                      max="100"
                      value={globalPromotion.discount_percentage}
                      onChange={(e) => setGlobalPromotion({
                        ...globalPromotion,
                        discount_percentage: Number(e.target.value)
                      })}
                      className="block w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <Percent className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                  <p className="mt-1 text-sm text-gray-500">
                    Digite um valor entre 0 e 100
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status da Promoção
                  </label>
                  <label className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={globalPromotion.is_active}
                      onChange={(e) => setGlobalPromotion({
                        ...globalPromotion,
                        is_active: e.target.checked
                      })}
                      className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-600"
                    />
                    <div>
                      <span className={`font-medium ${globalPromotion.is_active ? 'text-green-600' : 'text-gray-700'}`}>
                        {globalPromotion.is_active ? 'Promoção Ativa' : 'Promoção Inativa'}
                      </span>
                      <p className="text-xs text-gray-500 mt-1">
                        {globalPromotion.is_active 
                          ? 'Os descontos serão aplicados automaticamente a todos os produtos' 
                          : 'Marque esta opção para ativar a promoção'
                        }
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              <div className="pt-4 mt-6 border-t border-gray-100">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                  <div className="text-sm text-gray-500 flex items-center">
                    {globalPromotion.id && globalPromotion.updated_at ? (
                      <>
                        <Clock className="w-4 h-4 mr-1 text-gray-400" />
                        <span>Última atualização: </span>
                        <span className="font-medium ml-1">
                          {new Date(globalPromotion.updated_at).toLocaleString('pt-BR')}
                        </span>
                      </>
                    ) : (
                      <span className="italic">Nova configuração de promoção</span>
                    )}
                  </div>
                  
                  <button
                    onClick={handleSavePromotion}
                    disabled={isSaving}
                    className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition disabled:opacity-50 disabled:pointer-events-none"
                  >
                    {isSaving ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Salvar Configurações
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-xl p-6">
        <h3 className="text-base font-medium text-yellow-800 mb-4 flex items-center">
          <Percent className="w-5 h-5 mr-2 text-yellow-600" />
          Prévia de Desconto: {globalPromotion.discount_percentage}%
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-white/70 backdrop-blur-sm rounded-lg border border-yellow-100 transition-all hover:shadow-sm">
            <div className="text-lg font-bold mb-1">R$ 100,00</div>
            <div className="flex items-center">
              <div className="bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded">
                {globalPromotion.discount_percentage}% OFF
              </div>
              <div className="text-gray-500 line-through text-xs ml-2">R$ 100,00</div>
            </div>
            <div className="mt-2 text-lg text-green-600 font-bold">
              R$ {(100 - (100 * (globalPromotion.discount_percentage / 100))).toFixed(2)}
            </div>
          </div>
          
          <div className="p-4 bg-white/70 backdrop-blur-sm rounded-lg border border-yellow-100 transition-all hover:shadow-sm">
            <div className="text-lg font-bold mb-1">R$ 50,00</div>
            <div className="flex items-center">
              <div className="bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded">
                {globalPromotion.discount_percentage}% OFF
              </div>
              <div className="text-gray-500 line-through text-xs ml-2">R$ 50,00</div>
            </div>
            <div className="mt-2 text-lg text-green-600 font-bold">
              R$ {(50 - (50 * (globalPromotion.discount_percentage / 100))).toFixed(2)}
            </div>
          </div>
          
          <div className="p-4 bg-white/70 backdrop-blur-sm rounded-lg border border-yellow-100 transition-all hover:shadow-sm">
            <div className="text-lg font-bold mb-1">R$ 200,00</div>
            <div className="flex items-center">
              <div className="bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded">
                {globalPromotion.discount_percentage}% OFF
              </div>
              <div className="text-gray-500 line-through text-xs ml-2">R$ 200,00</div>
            </div>
            <div className="mt-2 text-lg text-green-600 font-bold">
              R$ {(200 - (200 * (globalPromotion.discount_percentage / 100))).toFixed(2)}
            </div>
          </div>
        </div>
        
        <div className="mt-4 text-xs text-yellow-700 flex items-center">
          <AlertCircle className="w-3 h-3 mr-1 flex-shrink-0" />
          <span>Esta prévia é apenas para visualização. Os preços reais serão calculados no momento da compra.</span>
        </div>
      </div>
    </div>
  );
} 