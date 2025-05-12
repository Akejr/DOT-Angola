import { useState, useEffect } from 'react';
import { 
  Gift, Plus, Search, Edit, Trash2, 
  ExternalLink, X, Tag, BanknoteIcon, Package,
  ChevronDown, ChevronUp, Filter
} from 'lucide-react';
import { GiftCard, Category } from '@/types/supabase';
import { getGiftCards, getCategories, deleteGiftCard, createGiftCard, updateGiftCard } from '@/lib/database';
import GiftCardForm from './GiftCardForm';
import { supabase } from '@/lib/supabase';

export default function GiftCardManager() {
  const [giftCards, setGiftCards] = useState<GiftCard[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [currentGiftCard, setCurrentGiftCard] = useState<GiftCard | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'name' | 'featured' | 'newest'>('newest');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [giftCardsData, categoriesData] = await Promise.all([
        getGiftCards(),
        getCategories()
      ]);
      setGiftCards(giftCardsData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (giftCard: GiftCard) => {
    // Fazer uma cópia profunda do objeto para evitar referências que podem causar problemas
    console.log('Gift card original para edição:', giftCard);
    
    // Garantir que os planos estejam no formato correto
    const formattedGiftCard = {
      ...giftCard,
      plans: giftCard.plans?.map(plan => ({
        name: plan.name,
        price: Number(plan.price),
        currency: plan.currency,
        description: plan.description || ''
      })) || []
    };
    
    console.log('Gift card formatado para edição:', formattedGiftCard);
    setCurrentGiftCard(formattedGiftCard);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este gift card?')) {
      try {
        setIsDeleting(true);
        setDeleteId(id);
        await deleteGiftCard(id);
        setGiftCards(giftCards.filter(card => card.id !== id));
      } catch (error) {
        console.error('Erro ao excluir gift card:', error);
        alert('Erro ao excluir gift card. Por favor tente novamente.');
      } finally {
        setIsDeleting(false);
        setDeleteId(null);
      }
    }
  };

  const handleAddNew = () => {
    setCurrentGiftCard(null);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setCurrentGiftCard(null);
    setError(null);
  };

  const handleSubmit = async (formData: any, giftCardId?: string) => {
    try {
      setIsSaving(true);
      setError(null);

      console.log('Dados recebidos do formulário:', formData);
      console.log('ID do gift card para atualização:', giftCardId);
      
      // Processar upload de imagem se houver um arquivo
      let imageUrl = formData.get('image_url');
      if (formData.get('image') && formData.get('image') instanceof File) {
        // Criar nome de arquivo único
        const file = formData.get('image');
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
        const filePath = `gift-cards/${fileName}`;
        
        // Upload da imagem para o Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('gift-cards')
          .upload(filePath, file);
          
        if (uploadError) {
          throw uploadError;
        }
        
        // Obter URL pública da imagem
        const { data: { publicUrl } } = supabase.storage
          .from('gift-cards')
          .getPublicUrl(filePath);
          
        imageUrl = publicUrl;
      }
      
      // Extrair e processar categorias
      let categories = [];
      try {
        const categoriesStr = formData.get('categories');
        if (categoriesStr) {
          categories = JSON.parse(categoriesStr);
          console.log('Categorias processadas:', categories);
        }
      } catch (error) {
        console.error('Erro ao processar categorias:', error);
        categories = [];
      }
      
      // Extrair e processar planos
      let plans = [];
      try {
        const plansStr = formData.get('plans');
        if (plansStr) {
          plans = JSON.parse(plansStr);
          // Garantir que todos os preços sejam números
          plans = plans.map(plan => ({
            ...plan,
            price: typeof plan.price === 'number' ? plan.price : Number(plan.price) || 0
          }));
          console.log('Planos processados:', plans);
        }
      } catch (error) {
        console.error('Erro ao processar planos:', error);
        plans = [];
      }
      
      // Preparar dados para envio à API
      const giftCardData = {
        name: formData.get('name'),
        description: formData.get('description'),
        is_featured: formData.get('is_featured') === 'true',
        delivery_method: formData.get('delivery_method'),
        categories: categories,
        plans: plans,
        image_url: imageUrl
      };
      
      console.log('Dados processados para envio:', giftCardData);

      if (currentGiftCard && giftCardId) {
        console.log('Atualizando gift card existente com ID:', giftCardId);
        // Atualizar gift card existente - usando o ID passado do formulário
        const updatedGiftCard = await updateGiftCard(giftCardId, giftCardData);
        console.log('Gift card atualizado com sucesso:', updatedGiftCard);
        setGiftCards(prev => 
          prev.map(card => card.id === updatedGiftCard.id ? updatedGiftCard : card)
        );
      } else {
        console.log('Criando novo gift card');
        // Criar novo gift card
        const newGiftCard = await createGiftCard(giftCardData);
        console.log('Novo gift card criado com sucesso:', newGiftCard);
        setGiftCards(prev => [...prev, newGiftCard]);
      }

      closeModal();
    } catch (error) {
      console.error('Erro ao salvar gift card:', error);
      setError('Erro ao salvar gift card: ' + (error instanceof Error ? error.message : 'Tente novamente.'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleSort = (field: 'name' | 'featured' | 'newest') => {
    if (sortBy === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDirection('asc');
    }
  };

  const filteredAndSortedGiftCards = giftCards
    .filter(card => {
      const matchesSearch = card.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        card.description?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = !selectedCategory || 
        card.gift_card_categories?.some(gc => gc.categories?.id === selectedCategory);

      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sortBy === 'name') {
        return sortDirection === 'asc' 
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      } else if (sortBy === 'featured') {
        return sortDirection === 'asc'
          ? (a.is_featured === b.is_featured ? 0 : a.is_featured ? 1 : -1)
          : (a.is_featured === b.is_featured ? 0 : a.is_featured ? -1 : 1);
      } else {
        const dateA = new Date(a.created_at || '').getTime();
        const dateB = new Date(b.created_at || '').getTime();
        return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
      }
    });

  const getDeliveryMethodLabel = (method: string) => {
    switch (method) {
      case 'code': return 'Código';
      case 'manual_activation': return 'Manual';
      default: return 'N/A';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#01042D]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold text-[#01042D] flex items-center">
          <Gift className="w-5 h-5 mr-2" />
          Gerenciador de Gift Cards
        </h1>
        <button
          onClick={handleAddNew}
          className="flex items-center px-4 py-2 bg-[#01042D] text-white rounded-xl hover:bg-[#01042D]/90 transition-colors shadow-sm text-sm"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          <span>Novo Gift Card</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
        {/* Barra de Ferramentas */}
        <div className="p-4 border-b border-gray-100 flex flex-wrap gap-4 items-center">
          {/* Pesquisa */}
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Pesquisar gift cards..."
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#01042D] focus:border-[#01042D]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Filtro por Categoria */}
          <div className="relative">
            <select
              value={selectedCategory || ''}
              onChange={(e) => setSelectedCategory(e.target.value || null)}
              className="appearance-none pl-9 pr-8 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#01042D] focus:border-[#01042D] bg-white"
            >
              <option value="">Todas as categorias</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>
        </div>

        {/* Lista de Gift Cards */}
        {filteredAndSortedGiftCards.length === 0 ? (
          <div className="text-center py-12">
            <Gift className="mx-auto h-12 w-12 text-gray-300" />
            <h3 className="mt-4 text-base font-medium text-gray-900">Nenhum gift card encontrado</h3>
            <p className="mt-2 text-sm text-gray-500 max-w-md mx-auto">
              {searchTerm || selectedCategory
                ? 'Nenhum gift card corresponde aos filtros aplicados.'
                : 'Comece adicionando um novo gift card clicando no botão acima.'}
            </p>
            {(searchTerm || selectedCategory) && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory(null);
                }}
                className="mt-4 text-sm text-[#01042D] hover:text-[#01042D]/80"
              >
                Limpar filtros
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 p-6">
            {filteredAndSortedGiftCards.map((giftCard) => (
              <div key={giftCard.id} className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                <div className="flex items-start gap-6 p-6">
                  <div className="w-32 h-32 rounded-xl bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {giftCard.image_url ? (
                      <img 
                        src={giftCard.image_url} 
                        alt={giftCard.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Gift className="w-12 h-12 text-gray-400" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-semibold text-[#01042D] truncate">
                          {giftCard.name}
                        </h3>
                        {giftCard.description && (
                          <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                            {giftCard.description}
                          </p>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(giftCard)}
                          className="p-2 text-gray-500 hover:text-[#01042D] rounded-lg hover:bg-gray-100 transition-colors"
                          title="Editar"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(giftCard.id)}
                          className="p-2 text-gray-500 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                          disabled={isDeleting && deleteId === giftCard.id}
                          title="Excluir"
                        >
                          {isDeleting && deleteId === giftCard.id ? (
                            <div className="w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <Trash2 className="w-5 h-5" />
                          )}
                        </button>
                        <a
                          href={`/gift-card/${giftCard.slug || giftCard.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-gray-500 hover:text-[#01042D] rounded-lg hover:bg-gray-100 transition-colors"
                          title="Ver na loja"
                        >
                          <ExternalLink className="w-5 h-5" />
                        </a>
                      </div>
                    </div>
                    
                    <div className="mt-4 flex flex-wrap items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-[#01042D]" />
                        <span className="text-sm font-medium text-gray-700">
                          {getDeliveryMethodLabel(giftCard.delivery_method || 'code')}
                        </span>
                      </div>
                      
                      {giftCard.is_featured && (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-green-50 text-green-700">
                          Destaque
                        </span>
                      )}
                      
                      {giftCard.gift_card_categories?.map(gc => gc.categories).map(category => (
                        category && (
                          <span 
                            key={category.id}
                            className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-[#01042D]/5 text-[#01042D]"
                          >
                            <Tag className="w-3 h-3 mr-1" />
                            {category.name}
                          </span>
                        )
                      ))}
                    </div>
                    
                    <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {giftCard.plans?.map((plan, index) => (
                        <div 
                          key={index}
                          className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg"
                        >
                          <BanknoteIcon className="w-4 h-4 text-[#01042D]" />
                          <div className="min-w-0">
                            <div className="text-sm font-medium text-gray-900 truncate">
                              {plan.name}
                            </div>
                            <div className="text-xs text-gray-600">
                              {plan.price} {plan.currency}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de Formulário */}
      {showModal && (
        <div className="fixed inset-0 overflow-y-auto z-50">
          <div className="flex items-center justify-center min-h-screen p-4">
            <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm" onClick={closeModal}></div>
            <div className="relative bg-white rounded-2xl max-w-5xl w-full shadow-xl overflow-hidden">
              <div className="p-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
                <h2 className="text-lg font-semibold text-[#01042D] flex items-center">
                  <Gift className="w-5 h-5 mr-2" />
                  {currentGiftCard ? 'Editar Gift Card' : 'Novo Gift Card'}
                </h2>
                <button 
                  onClick={closeModal}
                  className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              
              <div className="p-6">
                <GiftCardForm
                  giftCard={currentGiftCard}
                  categories={categories}
                  onSubmit={handleSubmit}
                  onCancel={closeModal}
                  isSaving={isSaving}
                  error={error}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 