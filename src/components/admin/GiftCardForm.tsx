import { useState, useEffect, useRef } from 'react';
import { Gift, Plus, X, Tag, BanknoteIcon, Package, Image as ImageIcon, Link, Upload } from 'lucide-react';
import { GiftCard, Category, GiftCardPlan } from '@/types/supabase';
import { useToast } from "@/components/ui/use-toast";

interface GiftCardFormProps {
  giftCard?: GiftCard | null;
  categories: Category[];
  onSubmit: (data: any, id?: string) => void;
  onCancel: () => void;
  isSaving: boolean;
  error: string | null;
}

export default function GiftCardForm({ giftCard, categories, onSubmit, onCancel, isSaving, error }: GiftCardFormProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image_url: '',
    image_file: null as File | null,
    is_featured: false,
    delivery_method: 'code',
    categories: [] as string[],
    plans: [{ name: '', price: 0, currency: 'EUR' as const }] as GiftCardPlan[]
  });

  useEffect(() => {
    if (giftCard) {
      console.log('Recebendo gift card para editar:', giftCard);
      
      // Garantir que os planos sejam formatados corretamente
      const formattedPlans = giftCard.plans?.map(plan => ({
        name: plan.name || '',
        price: typeof plan.price === 'number' ? plan.price : Number(plan.price) || 0,
        currency: plan.currency || 'EUR',
        description: plan.description || ''
      })) || [{ name: '', price: 0, currency: 'EUR' }];
      
      // Garantir que a lista de categorias seja um array de strings
      const formattedCategories = giftCard.gift_card_categories?.map(gc => 
        gc.categories?.id || ''
      ).filter(id => id !== '') || [];
      
      console.log('Planos formatados:', formattedPlans);
      console.log('Categorias formatadas:', formattedCategories);
      
      setFormData({
        name: giftCard.name || '',
        description: giftCard.description || '',
        image_url: giftCard.image_url || '',
        image_file: null,
        is_featured: giftCard.is_featured || false,
        delivery_method: giftCard.delivery_method || 'code',
        categories: formattedCategories,
        plans: formattedPlans.length > 0 ? formattedPlans : [{ name: '', price: 0, currency: 'EUR' }]
      });
      
      if (giftCard.image_url) {
        setImagePreview(giftCard.image_url);
      }
    }
  }, [giftCard]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB
        toast({
          title: "Erro ao carregar imagem",
          description: "A imagem deve ter no máximo 5MB",
          variant: "destructive"
        });
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Erro ao carregar imagem",
          description: "O arquivo deve ser uma imagem",
          variant: "destructive"
        });
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      
      setFormData(prev => ({
        ...prev,
        image_file: file,
        image_url: '' // Limpa a URL quando um arquivo é selecionado
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Enviando formulário com dados:', formData);
    console.log('ID do gift card (se for edição):', giftCard?.id);
    
    try {
      // Criar um novo objeto FormData para enviar arquivos
      const submitData = new FormData();
      
      // Adicionar campos básicos
      submitData.append('name', formData.name);
      submitData.append('description', formData.description || '');
      submitData.append('is_featured', formData.is_featured.toString());
      submitData.append('delivery_method', formData.delivery_method);
      
      // Adicionar categorias - garantir que é um array válido
      submitData.append('categories', JSON.stringify(formData.categories || []));
      
      // Formatar e adicionar planos, garantindo que os preços sejam números
      const formattedPlans: GiftCardPlan[] = formData.plans.map(plan => ({
        name: plan.name || '',
        price: typeof plan.price === 'number' ? plan.price : Number(plan.price) || 0,
        currency: plan.currency || 'EUR',
        description: plan.description || ''
      }));
      
      submitData.append('plans', JSON.stringify(formattedPlans));
      console.log('Planos formatados:', formattedPlans);
      
      // Adicionar imagem se houver uma nova
      if (formData.image_file) {
        submitData.append('image', formData.image_file);
      } else if (formData.image_url) {
        submitData.append('image_url', formData.image_url);
      }
      
      console.log('Dados formatados para envio:', {
        textData: Object.fromEntries(submitData.entries()),
        plans: formattedPlans,
        categories: formData.categories
      });
      
      // Garantir que o ID seja passado corretamente
      if (giftCard?.id) {
        console.log('Enviando ID para atualização:', giftCard.id);
      }
      
      await onSubmit(submitData, giftCard?.id);
    } catch (error) {
      console.error('Erro ao enviar formulário:', error);
    }
  };

  const handlePlanChange = (index: number, field: string, value: string | number) => {
    const newPlans = [...formData.plans];
    if (field === 'price') {
      newPlans[index] = { ...newPlans[index], [field]: Number(value) || 0 };
    } else {
      newPlans[index] = { ...newPlans[index], [field]: value };
    }
    setFormData({ ...formData, plans: newPlans });
  };

  const addPlan = () => {
    setFormData({
      ...formData,
      plans: [...formData.plans, { name: '', price: 0, currency: 'EUR' }]
    });
  };

  const removePlan = (index: number) => {
    const newPlans = formData.plans.filter((_, i) => i !== index);
    setFormData({ ...formData, plans: newPlans });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Informações Básicas */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2 mb-6">
              <Gift className="w-5 h-5 text-[#01042D]" />
              Informações Básicas
            </h3>

            <div className="space-y-5">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Nome do Gift Card
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#01042D] focus:border-[#01042D] bg-white shadow-sm"
                  required
                  placeholder="Ex: Steam Gift Card"
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Descrição
                </label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#01042D] focus:border-[#01042D] bg-white shadow-sm"
                  placeholder="Descreva o gift card em detalhes..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Imagem do Gift Card
                </label>
                <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl p-6 transition-colors hover:border-[#01042D] cursor-pointer bg-gray-50"
                     onClick={() => fileInputRef.current?.click()}>
                  {imagePreview ? (
                    <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-white shadow-sm">
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        className="w-full h-full object-contain"
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setImagePreview(null);
                          setFormData(prev => ({ ...prev, image_file: null, image_url: '' }));
                        }}
                        className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="text-center">
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="mt-4 flex text-sm text-gray-600">
                        <label className="relative cursor-pointer rounded-md font-medium text-[#01042D] focus-within:outline-none">
                          <span>Carregar imagem</span>
                        </label>
                        <p className="pl-1">ou arraste e solte</p>
                      </div>
                      <p className="text-xs text-gray-500">PNG, JPG, GIF até 5MB</p>
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    onChange={handleImageChange}
                    accept="image/*"
                  />
                </div>
              </div>

              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_featured}
                    onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                    className="w-5 h-5 text-[#01042D] border-gray-300 rounded focus:ring-[#01042D]"
                  />
                  <span className="text-sm font-medium text-gray-700">Destacar na loja</span>
                </label>

                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      value="code"
                      checked={formData.delivery_method === 'code'}
                      onChange={(e) => setFormData({ ...formData, delivery_method: e.target.value })}
                      className="w-5 h-5 text-[#01042D] border-gray-300 focus:ring-[#01042D]"
                    />
                    <span className="text-sm text-gray-700">Código</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      value="manual_activation"
                      checked={formData.delivery_method === 'manual_activation'}
                      onChange={(e) => setFormData({ ...formData, delivery_method: e.target.value })}
                      className="w-5 h-5 text-[#01042D] border-gray-300 focus:ring-[#01042D]"
                    />
                    <span className="text-sm text-gray-700">Ativação Manual</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Categorias e Planos */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2 mb-6">
              <Tag className="w-5 h-5 text-[#01042D]" />
              Categorias
            </h3>

            <div className="grid grid-cols-2 gap-3">
              {categories.map((category) => (
                <label 
                  key={category.id} 
                  className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer transition-all
                    ${formData.categories.includes(category.id)
                      ? 'border-[#01042D] bg-[#01042D]/5'
                      : 'border-gray-200 hover:border-[#01042D] hover:bg-gray-50'
                    }`}
                >
                  <input
                    type="checkbox"
                    checked={formData.categories.includes(category.id)}
                    onChange={(e) => {
                      const newCategories = e.target.checked
                        ? [...formData.categories, category.id]
                        : formData.categories.filter(id => id !== category.id);
                      setFormData({ ...formData, categories: newCategories });
                    }}
                    className="w-5 h-5 text-[#01042D] border-gray-300 rounded focus:ring-[#01042D]"
                  />
                  <span className="text-sm font-medium text-gray-700">{category.name}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                <BanknoteIcon className="w-5 h-5 text-[#01042D]" />
                Planos
              </h3>
              <button
                type="button"
                onClick={addPlan}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#01042D] hover:bg-[#01042D]/5 rounded-xl transition-colors"
              >
                <Plus className="w-4 h-4" />
                Adicionar Plano
              </button>
            </div>

            <div className="space-y-4">
              {formData.plans.map((plan, index) => (
                <div key={index} className="relative p-4 border border-gray-200 rounded-xl bg-white">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nome do Plano
                      </label>
                      <input
                        type="text"
                        value={plan.name}
                        onChange={(e) => handlePlanChange(index, 'name', e.target.value)}
                        placeholder="Ex: Básico, Premium, etc."
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#01042D] focus:border-[#01042D]"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Preço
                        </label>
                        <input
                          type="number"
                          value={plan.price}
                          onChange={(e) => handlePlanChange(index, 'price', e.target.value)}
                          placeholder="0.00"
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#01042D] focus:border-[#01042D]"
                          required
                          min="0"
                          step="0.01"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Moeda
                        </label>
                        <select
                          value={plan.currency}
                          onChange={(e) => handlePlanChange(index, 'currency', e.target.value)}
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#01042D] focus:border-[#01042D] bg-white"
                        >
                          <option value="EUR">EUR</option>
                          <option value="BRL">BRL</option>
                          <option value="KWZ">KWZ</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  {formData.plans.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removePlan(index)}
                      className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-100">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2.5 text-sm text-gray-700 hover:text-gray-900 font-medium"
          disabled={isSaving}
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="px-6 py-2.5 bg-[#01042D] text-white rounded-xl hover:bg-[#01042D]/90 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm"
          disabled={isSaving}
        >
          {isSaving ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Salvando...
            </>
          ) : (
            <>
              <Gift className="w-4 h-4" />
              {giftCard ? 'Salvar Alterações' : 'Criar Gift Card'}
            </>
          )}
        </button>
      </div>
    </form>
  );
} 