import { supabase } from './supabase';
import { GiftCard, Category, ExchangeRate, Session, DashboardStats, ImportRequest } from '@/types/supabase';

// Definição da interface Notification
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  is_active: boolean;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}

// Gift Cards
export async function getGiftCards() {
  try {
    console.log('Iniciando getGiftCards');
    
    // Primeiro, buscar os gift cards
    const { data: giftCards, error: giftCardsError } = await supabase
      .from('gift_cards')
      .select('*')
      .order('created_at', { ascending: false });

    if (giftCardsError) {
      console.error('Erro ao buscar gift cards:', giftCardsError);
      throw giftCardsError;
    }

    console.log(`Encontrados ${giftCards.length} gift cards`);

    // Buscar configurações de promoção
    const promotionSettings = await getPromotionSettings();
    const hasActivePromotion = promotionSettings && promotionSettings.is_active;
    const discountPercentage = hasActivePromotion ? promotionSettings.discount_percentage : 0;

    // Para cada gift card, buscar suas categorias e planos
    const giftCardsComplete = await Promise.all(
      giftCards.map(async (giftCard) => {
        // Buscar categorias
        const { data: categoryRelations, error: categoriesError } = await supabase
          .from('gift_card_categories')
          .select(`
            category_id,
            categories:categories(id, name, slug, description)
          `)
          .eq('gift_card_id', giftCard.id);

        if (categoriesError) {
          console.error(`Erro ao buscar categorias para o gift card ${giftCard.id}:`, categoriesError);
          throw categoriesError;
        }

        // Buscar planos
        const { data: plans, error: plansError } = await supabase
          .from('gift_card_plans')
          .select('*')
          .eq('gift_card_id', giftCard.id)
          .order('price', { ascending: true });

        if (plansError) {
          console.error(`Erro ao buscar planos para o gift card ${giftCard.id}:`, plansError);
          throw plansError;
        }

        // Aplicar desconto aos planos se a promoção estiver ativa
        let discountedPlans = plans || [];
        if (hasActivePromotion && discountPercentage > 0) {
          discountedPlans = discountedPlans.map(plan => {
            // Preservar o preço original
            const originalPrice = plan.price;
            // Calcular o preço com desconto (arredondado para 2 casas decimais)
            const discountedPrice = Number((originalPrice * (1 - discountPercentage / 100)).toFixed(2));
            
            return {
              ...plan,
              original_price: originalPrice, // Guardar o preço original
              price: discountedPrice, // Atualizar o preço com desconto
              has_discount: true, // Indicar que há desconto
              discount_percentage: discountPercentage // Guardar a porcentagem de desconto
            };
          });
        }

        // Montar o objeto completo
        return {
          ...giftCard,
          gift_card_categories: categoryRelations || [],
          plans: discountedPlans,
          has_discount: hasActivePromotion && discountPercentage > 0,
          discount_percentage: hasActivePromotion ? discountPercentage : 0
        };
      })
    );

    console.log('getGiftCards concluído com sucesso');
    return giftCardsComplete;
  } catch (error) {
    console.error('Erro crítico em getGiftCards:', error);
    throw error;
  }
}

export async function getGiftCardById(idOrSlug: string): Promise<GiftCard | null> {
  try {
    console.log('Iniciando busca de gift card com id/slug:', idOrSlug);
    
    // Primeiro, tentar buscar por ID
    let { data: giftCardData, error: giftCardError } = await supabase
      .from('gift_cards')
      .select('*')
      .eq('id', idOrSlug)
      .single();

    // Se não encontrar por ID, tentar por slug
    if (!giftCardData) {
      console.log('Gift card não encontrado por ID, tentando por slug...');
      const result = await supabase
        .from('gift_cards')
        .select('*')
        .eq('slug', idOrSlug)
        .single();
      
      giftCardData = result.data;
      giftCardError = result.error;
    }

    if (giftCardError) {
      console.error('Erro ao buscar gift card:', giftCardError);
      return null;
    }

    if (!giftCardData) {
      console.log('Gift card não encontrado nem por ID nem por slug');
      return null;
    }

    console.log('Gift card encontrado:', giftCardData);

    // Buscar configurações de promoção
    const promotionSettings = await getPromotionSettings();
    const hasActivePromotion = promotionSettings && promotionSettings.is_active;
    const discountPercentage = hasActivePromotion ? promotionSettings.discount_percentage : 0;

    const giftCard: GiftCard = {
      ...giftCardData,
      gift_card_categories: [],
      plans: []
    };

    // Buscar categorias associadas
    console.log('Buscando categorias para o gift card:', giftCard.id);
    const { data: categories, error: categoriesError } = await supabase
      .from('gift_card_categories')
      .select(`
        categories:category_id (
          id,
          name,
          slug,
          description,
          created_at,
          updated_at
        )
      `)
      .eq('gift_card_id', giftCard.id);

    if (categoriesError) {
      console.error('Erro ao buscar categorias:', categoriesError);
    } else if (categories) {
      console.log('Categorias encontradas:', categories);
      giftCard.gift_card_categories = categories.map(c => ({
        categories: c.categories[0]
      }));
    }

    // Buscar planos associados
    console.log('Buscando planos para o gift card:', giftCard.id);
    const { data: plans, error: plansError } = await supabase
      .from('gift_card_plans')
      .select('*')
      .eq('gift_card_id', giftCard.id)
      .order('price', { ascending: true });

    if (plansError) {
      console.error('Erro ao buscar planos:', plansError);
    } else if (plans) {
      console.log('Planos encontrados:', plans);
      
      // Aplicar desconto aos planos se a promoção estiver ativa
      let discountedPlans = plans;
      if (hasActivePromotion && discountPercentage > 0) {
        discountedPlans = discountedPlans.map(plan => {
          // Preservar o preço original
          const originalPrice = plan.price;
          // Calcular o preço com desconto (arredondado para 2 casas decimais)
          const discountedPrice = Number((originalPrice * (1 - discountPercentage / 100)).toFixed(2));
          
          return {
            ...plan,
            original_price: originalPrice, // Guardar o preço original
            price: discountedPrice, // Atualizar o preço com desconto
            has_discount: true, // Indicar que há desconto
            discount_percentage: discountPercentage // Guardar a porcentagem de desconto
          };
        });
      }
      
      giftCard.plans = discountedPlans;
      giftCard.has_discount = hasActivePromotion && discountPercentage > 0;
      giftCard.discount_percentage = hasActivePromotion ? discountPercentage : 0;
    }

    console.log('Gift card completo:', giftCard);
    return giftCard;
  } catch (error) {
    console.error('Erro crítico ao buscar gift card:', error);
    return null;
  }
}

// Função auxiliar para gerar slugs
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/[^a-z0-9]+/g, '-') // Substitui caracteres especiais por hífen
    .replace(/^-+|-+$/g, '') // Remove hífens do início e fim
    .replace(/--+/g, '-'); // Remove hífens duplicados
}

export async function createGiftCard(data: Omit<GiftCard, 'id' | 'created_at' | 'updated_at'> & { categories?: string[] }) {
  const { categories, plans, ...giftCardData } = data;
  
  // Verificar se pelo menos um plano foi fornecido
  if (!plans || plans.length === 0) {
    throw new Error('Pelo menos um plano deve ser fornecido');
  }

  // Gerar o slug a partir do nome
  const slug = generateSlug(giftCardData.name);

  // Criar o gift card
  const { data: giftCard, error: giftCardError } = await supabase
    .from('gift_cards')
    .insert([{
      name: giftCardData.name,
      description: giftCardData.description,
      delivery_method: giftCardData.delivery_method || 'code',
      is_featured: giftCardData.is_featured,
      image_url: giftCardData.image_url || null,
      slug: slug
    }])
    .select()
    .single();

  if (giftCardError) throw giftCardError;

  // Adicionar planos
  if (plans.length > 0) {
    const planData = plans.map(plan => ({
      gift_card_id: giftCard.id,
      name: plan.name,
      price: plan.price,
      currency: plan.currency,
      description: plan.description || null
    }));

    const { error: planError } = await supabase
      .from('gift_card_plans')
      .insert(planData);

    if (planError) throw planError;
  }

  // Se houver categorias, criar as relações
  if (categories?.length) {
    const categoryRelations = categories.map(categoryId => ({
      gift_card_id: giftCard.id,
      category_id: categoryId
    }));

    const { error: categoriesError } = await supabase
      .from('gift_card_categories')
      .insert(categoryRelations);

    if (categoriesError) throw categoriesError;
  }

  // Retornar o gift card com as categorias e planos
  const { data: giftCardPlans, error: plansError } = await supabase
    .from('gift_card_plans')
    .select('*')
    .eq('gift_card_id', giftCard.id);

  if (plansError) throw plansError;

  const { data: giftCardCategories, error: categoriesError } = await supabase
    .from('gift_card_categories')
    .select('categories:category_id(*)')
    .eq('gift_card_id', giftCard.id);

  if (categoriesError) throw categoriesError;

  return {
    ...giftCard,
    plans: giftCardPlans || [],
    gift_card_categories: giftCardCategories || []
  };
}

export async function updateGiftCard(id: string, giftCard: Partial<GiftCard> & { categories?: string[] }) {
  console.log('=== INICIANDO ATUALIZAÇÃO DO GIFT CARD ===');
  console.log('ID recebido para atualização:', id);
  console.log('Dados recebidos para atualização:', giftCard);
  
  // Desestruturar para separar os dados do gift card das categorias e planos
  const { categories, plans, featured, ...giftCardData } = giftCard;
  
  console.log('Categorias extraídas:', categories);
  console.log('Planos extraídos:', plans);
  console.log('Dados básicos do gift card:', giftCardData);
  
  // Gerar novo slug se o nome foi atualizado
  const updateData = {
    ...giftCardData,
    ...(giftCardData.name && { slug: generateSlug(giftCardData.name) })
  };
  
  console.log('Dados formatados para atualização:', updateData);

  try {
    // Atualizar os dados básicos do gift card
    const { data, error } = await supabase
      .from('gift_cards')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Erro ao atualizar dados básicos do gift card:', error);
      throw error;
    }
    
    console.log('Dados básicos atualizados com sucesso:', data);
    
    // Se planos foram fornecidos, atualizar os planos
    if (plans) {
      console.log('Iniciando atualização de planos...');
      
      try {
        // Primeiro, remover os planos existentes
        const { error: deletePlanError } = await supabase
          .from('gift_card_plans')
          .delete()
          .eq('gift_card_id', id);
        
        if (deletePlanError) {
          console.error('Erro ao excluir planos existentes:', deletePlanError);
          throw deletePlanError;
        }
        
        console.log('Planos existentes removidos com sucesso.');
        
        // Adicionar os novos planos
        if (plans.length > 0) {
          const planData = plans.map(plan => ({
            gift_card_id: id,
            name: plan.name,
            price: plan.price,
            currency: plan.currency,
            description: plan.description || null
          }));
          
          console.log('Novos planos a serem inseridos:', planData);
          
          const { error: insertPlanError } = await supabase
            .from('gift_card_plans')
            .insert(planData);
          
          if (insertPlanError) {
            console.error('Erro ao inserir novos planos:', insertPlanError);
            throw insertPlanError;
          }
          
          console.log('Novos planos adicionados com sucesso');
        } else {
          console.log('Nenhum plano para adicionar');
        }
      } catch (error) {
        console.error('Erro no processamento de planos:', error);
        throw error;
      }
    }
    
    // Se categorias foram fornecidas, atualizar as relações
    if (categories !== undefined) {
      console.log('Iniciando atualização de categorias...');
      
      try {
        // Primeiro, remover as categorias existentes
        const { error: deleteError } = await supabase
          .from('gift_card_categories')
          .delete()
          .eq('gift_card_id', id);
        
        if (deleteError) {
          console.error('Erro ao excluir categorias existentes:', deleteError);
          throw deleteError;
        }
        
        console.log('Categorias existentes removidas com sucesso.');
        
        // Se houver novas categorias, adicioná-las
        if (categories.length > 0) {
          const categoryRelations = categories.map(categoryId => ({
            gift_card_id: id,
            category_id: categoryId
          }));
          
          console.log('Novas categorias a serem inseridas:', categoryRelations);
          
          const { error: insertError } = await supabase
            .from('gift_card_categories')
            .insert(categoryRelations);
          
          if (insertError) {
            console.error('Erro ao inserir novas categorias:', insertError);
            throw insertError;
          }
          
          console.log('Novas categorias adicionadas com sucesso');
        } else {
          console.log('Nenhuma categoria para adicionar');
        }
      } catch (error) {
        console.error('Erro no processamento de categorias:', error);
        throw error;
      }
    }
    
    // Obter os planos atualizados
    const { data: giftCardPlans, error: plansError } = await supabase
      .from('gift_card_plans')
      .select('*')
      .eq('gift_card_id', id);

    if (plansError) {
      console.error('Erro ao buscar planos atualizados:', plansError);
      throw plansError;
    }
    
    console.log('Planos recuperados após atualização:', giftCardPlans);

    // Obter as categorias atualizadas
    const { data: giftCardCategories, error: categoriesError } = await supabase
      .from('gift_card_categories')
      .select('categories:category_id(*)')
      .eq('gift_card_id', id);

    if (categoriesError) {
      console.error('Erro ao buscar categorias atualizadas:', categoriesError);
      throw categoriesError;
    }
    
    console.log('Categorias recuperadas após atualização:', giftCardCategories);

    // Preparar objeto de retorno
    const result = {
      ...data,
      plans: giftCardPlans || [],
      gift_card_categories: giftCardCategories || []
    };
    
    console.log('Gift card atualizado com sucesso:', result);
    console.log('=== FIM DA ATUALIZAÇÃO DO GIFT CARD ===');
    
    // Retornar o gift card completo
    return result;
  } catch (error) {
    console.error('Erro fatal durante a atualização do giftcard:', error);
    throw error;
  }
}

export async function deleteGiftCard(id: string) {
  const { error } = await supabase
    .from('gift_cards')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// Categories
export async function getCategories() {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name');

  if (error) throw error;
  return data;
}

export async function createCategory(data: { name: string; description?: string }): Promise<Category> {
  // Gerar o slug a partir do nome
  const slug = data.name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/[^a-z0-9]+/g, '-') // Substitui caracteres especiais por hífen
    .replace(/^-+|-+$/g, ''); // Remove hífens do início e fim

  const { data: category, error } = await supabase
    .from('categories')
    .insert([{ 
      name: data.name, 
      description: data.description,
      slug: slug
    }])
    .select()
    .single();

  if (error) throw error;
  return category;
}

export async function updateCategory(id: string, data: { name: string; description?: string }): Promise<Category> {
  // Gerar o slug a partir do nome
  const slug = data.name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/[^a-z0-9]+/g, '-') // Substitui caracteres especiais por hífen
    .replace(/^-+|-+$/g, ''); // Remove hífens do início e fim

  const { data: category, error } = await supabase
    .from('categories')
    .update({ 
      name: data.name, 
      description: data.description,
      slug: slug,
      updated_at: new Date().toISOString() 
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return category;
}

export async function deleteCategory(id: string) {
  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// Exchange Rates
export async function getExchangeRates(): Promise<ExchangeRate[]> {
  const { data, error } = await supabase
    .from('exchange_rates')
    .select('*')
    .order('currency');

  if (error) throw error;
  return data || [];
}

// Inicializar taxas de câmbio com valores padrão se não existirem
// e remover moedas não suportadas
export async function initExchangeRates(): Promise<void> {
  try {
    const supportedCurrencies = ['EUR', 'BRL', 'KWZ'];
    const defaultRates = {
      'EUR': 900.00,
      'BRL': 200.00,
      'KWZ': 1.00
    };
    
    // Obter todas as taxas existentes
    const { data: existingRates, error: fetchError } = await supabase
      .from('exchange_rates')
      .select('*');
      
    if (fetchError) throw fetchError;
    
    // Verificar moedas não suportadas e removê-las
    if (existingRates) {
      const unsupportedRates = existingRates.filter(rate => 
        !supportedCurrencies.includes(rate.currency));
      
      for (const rate of unsupportedRates) {
        console.log(`Removendo moeda não suportada: ${rate.currency}`);
        await supabase
          .from('exchange_rates')
          .delete()
          .eq('id', rate.id);
      }
    }
    
    // Garantir que todas as moedas suportadas existam
    for (const currency of supportedCurrencies) {
      const existingRate = existingRates?.find(r => r.currency === currency);
      
      if (!existingRate) {
        console.log(`Adicionando taxa de câmbio padrão para ${currency}`);
        await supabase
          .from('exchange_rates')
          .insert([{
            currency,
            rate: defaultRates[currency],
            updated_at: new Date().toISOString()
          }]);
      }
    }
    
    console.log('Taxas de câmbio inicializadas com sucesso');
  } catch (error) {
    console.error('Erro ao inicializar taxas de câmbio:', error);
    throw error;
  }
}

export async function updateExchangeRate(currency: string, rate: number): Promise<ExchangeRate> {
  try {
    // Verificar se a moeda já existe
    const { data: existingRate, error: fetchError } = await supabase
      .from('exchange_rates')
      .select('id')
      .eq('currency', currency)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      // PGRST116 é o código para "não encontrado", outros erros devem ser tratados
      console.error(`Erro ao buscar taxa de câmbio para ${currency}:`, fetchError);
      throw fetchError;
    }

    const timestamp = new Date().toISOString();
    
    if (existingRate) {
      // Atualizar taxa existente
      const { data, error } = await supabase
        .from('exchange_rates')
        .update({ rate, updated_at: timestamp })
        .eq('id', existingRate.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } else {
      // Inserir nova taxa
      const { data, error } = await supabase
        .from('exchange_rates')
        .insert([{ currency, rate, updated_at: timestamp }])
        .select()
        .single();

      if (error) throw error;
      return data;
    }
  } catch (error) {
    console.error(`Erro ao atualizar taxa de câmbio para ${currency}:`, error);
    throw error;
  }
}

// Sessions
export async function createSession(session: Omit<Session, 'id' | 'end_time'>) {
  const { data, error } = await supabase
    .from('sessions')
    .insert([session])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function endSession(id: string) {
  const { error } = await supabase
    .from('sessions')
    .update({ end_time: new Date().toISOString() })
    .eq('id', id);

  if (error) throw error;
}

// Dashboard Stats
export async function getDashboardStats(): Promise<DashboardStats> {
  try {
    // Tentar usar a função RPC se estiver disponível
    const { data: rpcData, error: rpcError } = await supabase.rpc('get_dashboard_stats');
    
    if (!rpcError && rpcData) {
      return rpcData;
    }
    
    // Se a função RPC falhar, calcular as estatísticas manualmente
    console.log('RPC falhou, calculando estatísticas manualmente');
    
    // Obter dados de vendas (a ser implementado no futuro)
    const salesData = {
      total_gift_cards: 0,
      total_sales: 0,
      sales_today: 0,
      sales_this_week: 0,
      sales_this_month: 0,
      sales_percent_change: 0,
      popular_categories: [] as { name: string; count: number }[]
    };
    
    // Obter dados de sessões para estatísticas de usuários
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();
    const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay())).toISOString();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString();
    const startOfYear = new Date(today.getFullYear(), 0, 1).toISOString();
    
    // Obter total de usuários
    const { count: totalUsers } = await supabase
      .from('sessions')
      .select('user_id', { count: 'exact', head: true })
      .is('user_id', 'not.null');
    
    // Usuários hoje
    const { count: usersToday } = await supabase
      .from('sessions')
      .select('user_id', { count: 'exact', head: true })
      .is('user_id', 'not.null')
      .gte('start_time', startOfDay);
    
    // Usuários esta semana
    const { count: usersThisWeek } = await supabase
      .from('sessions')
      .select('user_id', { count: 'exact', head: true })
      .is('user_id', 'not.null')
      .gte('start_time', startOfWeek);
    
    // Usuários este mês
    const { count: usersThisMonth } = await supabase
      .from('sessions')
      .select('user_id', { count: 'exact', head: true })
      .is('user_id', 'not.null')
      .gte('start_time', startOfMonth);
    
    // Usuários este ano
    const { count: usersThisYear } = await supabase
      .from('sessions')
      .select('user_id', { count: 'exact', head: true })
      .is('user_id', 'not.null')
      .gte('start_time', startOfYear);
    
    // Para calcular a mudança percentual, precisaríamos de dados do período anterior
    // Por enquanto, usamos um valor fixo (simulação)
    const userPercentChange = 5.2;
    
    // Combinar estatísticas
    return {
      ...salesData,
      users_today: usersToday || 0,
      users_this_week: usersThisWeek || 0,
      users_this_month: usersThisMonth || 0,
      users_this_year: usersThisYear || 0,
      total_users: totalUsers || 0,
      user_percent_change: userPercentChange
    };
  } catch (error) {
    console.error('Erro ao obter estatísticas do dashboard:', error);
    
    // Retornar dados vazios em caso de erro
    return {
      total_gift_cards: 0,
      total_sales: 0,
      sales_today: 0,
      sales_this_week: 0,
      sales_this_month: 0,
      sales_percent_change: 0,
      popular_categories: [],
      users_today: 0,
      users_this_week: 0,
      users_this_month: 0,
      users_this_year: 0,
      total_users: 0,
      user_percent_change: 0
    };
  }
}

export async function getGiftCardsByCategory(category: string): Promise<GiftCard[]> {
  const { data, error } = await supabase
    .from('gift_cards')
    .select('*')
    .eq('category', category)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Erro ao buscar gift cards por categoria:', error);
    return [];
  }

  return data || [];
}

// Funções para gerenciar notificações
export async function getNotifications(): Promise<Notification[]> {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Erro ao buscar notificações:', error);
    return [];
  }

  return data || [];
}

export async function getActiveNotifications(): Promise<Notification[]> {
  const now = new Date().toISOString();
  
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('is_active', true)
    .or(`expires_at.gt.${now},expires_at.is.null`)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Erro ao buscar notificações ativas:', error);
    return [];
  }

  return data || [];
}

export async function createNotification(notification: Omit<Notification, 'id' | 'created_at' | 'updated_at'>): Promise<Notification> {
  const { data, error } = await supabase
    .from('notifications')
    .insert([notification])
    .select()
    .single();

  if (error) {
    console.error('Erro ao criar notificação:', error);
    throw error;
  }

  return data;
}

export async function updateNotification(id: string, notification: Partial<Notification>): Promise<Notification> {
  const { data, error } = await supabase
    .from('notifications')
    .update(notification)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Erro ao atualizar notificação:', error);
    throw error;
  }

  return data;
}

export async function deleteNotification(id: string): Promise<void> {
  const { error } = await supabase
    .from('notifications')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Erro ao excluir notificação:', error);
    throw error;
  }
}

// Funções para gerenciar configurações do sistema
export interface SystemSettings {
  id: string;
  site_name: string;
  site_description: string;
  contact_email: string;
  contact_phone: string;
  whatsapp_number: string;
  enable_notifications: boolean;
  maintenance_mode: boolean;
  default_currency: string;
  created_at: string;
  updated_at: string;
}

export async function getSystemSettings(): Promise<SystemSettings | null> {
  const { data, error } = await supabase
    .from('settings')
    .select('*')
    .single();

  if (error) {
    if (error.code === 'PGRST116') { // Código para "não encontrado"
      // Criar configurações padrão com o novo nome do site
      const defaultSettings = {
        site_name: 'DOT ANGOLA - O melhor da tecnologia em Angola',
        site_description: 'O melhor da tecnologia em Angola. Gift cards internacionais, cartões presente e cartões virtuais com os melhores preços.',
        contact_email: 'contato@dotangola.com',
        contact_phone: '+244 923456789',
        whatsapp_number: '+244 931343433',
        enable_notifications: true,
        maintenance_mode: false,
        default_currency: 'AOA'
      };
      
      try {
        const { data: newSettings } = await supabase
          .from('settings')
          .insert([defaultSettings])
          .select()
          .single();
          
        return newSettings;
      } catch (createError) {
        console.error('Erro ao criar configurações padrão:', createError);
        return null;
      }
    }
    console.error('Erro ao buscar configurações do sistema:', error);
    throw error;
  }

  return data;
}

export async function updateSystemSettings(settings: Partial<Omit<SystemSettings, 'id' | 'created_at' | 'updated_at'>>): Promise<SystemSettings> {
  // Verificar se já existe uma configuração
  const { data: existingSettings, error: fetchError } = await supabase
    .from('settings')
    .select('id')
    .single();

  if (fetchError && fetchError.code !== 'PGRST116') {
    console.error('Erro ao verificar configurações existentes:', fetchError);
    throw fetchError;
  }

  let data;
  let error;

  if (existingSettings) {
    // Atualizar configurações existentes
    const response = await supabase
      .from('settings')
      .update(settings)
      .eq('id', existingSettings.id)
      .select()
      .single();
    
    data = response.data;
    error = response.error;
  } else {
    // Criar novas configurações
    const response = await supabase
      .from('settings')
      .insert([settings])
      .select()
      .single();
    
    data = response.data;
    error = response.error;
  }

  if (error) {
    console.error('Erro ao salvar configurações do sistema:', error);
    throw error;
  }

  return data;
}

// Função para contar gift cards por categoria
export async function countGiftCardsByCategory(): Promise<Map<string, number>> {
  try {
    const { data, error } = await supabase
      .from('gift_card_categories')
      .select('category_id, gift_card_id');

    if (error) {
      console.error('Erro ao contar gift cards por categoria:', error);
      return new Map();
    }

    const countMap = new Map<string, number>();
    
    // Contar gift cards por categoria
    data?.forEach(item => {
      const categoryId = item.category_id;
      if (categoryId) {
        const currentCount = countMap.get(categoryId) || 0;
        countMap.set(categoryId, currentCount + 1);
      }
    });

    return countMap;
  } catch (error) {
    console.error('Erro ao contar gift cards por categoria:', error);
    return new Map();
  }
}

export async function fixAllGiftCardSlugs(): Promise<void> {
  try {
    // Buscar todos os gift cards
    const { data: giftCards, error: fetchError } = await supabase
      .from('gift_cards')
      .select('id, name, slug');

    if (fetchError) {
      console.error('Erro ao buscar gift cards:', fetchError);
      throw fetchError;
    }

    // Atualizar o slug de cada gift card
    for (const giftCard of giftCards || []) {
      const newSlug = generateSlug(giftCard.name);
      
      if (newSlug !== giftCard.slug) {
        const { error: updateError } = await supabase
          .from('gift_cards')
          .update({ slug: newSlug })
          .eq('id', giftCard.id);

        if (updateError) {
          console.error(`Erro ao atualizar slug do gift card ${giftCard.id}:`, updateError);
        } else {
          console.log(`Slug atualizado para gift card ${giftCard.id}: ${newSlug}`);
        }
      }
    }
  } catch (error) {
    console.error('Erro ao corrigir slugs:', error);
    throw error;
  }
}

// Função para buscar configurações de promoção global
export async function getPromotionSettings() {
  try {
    const { data, error } = await supabase
      .from('promotion_settings')
      .select('*')
      .eq('applies_to_all', true)
      .eq('is_active', true)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Erro ao buscar configurações de promoção:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Erro ao buscar configurações de promoção:', error);
    return null;
  }
}

// Import Requests
export async function createImportRequest(request: Omit<ImportRequest, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('import_requests')
    .insert([request])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getImportRequests(status?: string) {
  let query = supabase
    .from('import_requests')
    .select('*')
    .order('created_at', { ascending: false });

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data;
}

export async function updateImportRequestStatus(id: string, status: string, notes?: string) {
  const { data, error } = await supabase
    .from('import_requests')
    .update({ 
      status,
      notes: notes || null,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getImportRequestById(id: string) {
  const { data, error } = await supabase
    .from('import_requests')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
} 