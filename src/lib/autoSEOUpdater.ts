import { seoService } from './seoService';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // Apenas log se for ambiente de desenvolvimento
  if (import.meta.env.DEV) {
    console.error('Configurações do Supabase não encontradas para AutoSEOUpdater');
  }
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface ProductForSEO {
  id: string;
  name: string;
  description: string;
  slug?: string;
  price: number;
  currency: string;
  images: string[];
  category?: {
    id: string;
    name: string;
  };
  subcategory?: {
    id: string;
    name: string;
  };
}

interface CategoryForSEO {
  id: string;
  name: string;
  description?: string;
  subcategories?: CategoryForSEO[];
}

class AutoSEOUpdater {
  private lastUpdate: number = 0;
  private updateInterval: number = 30 * 60 * 1000; // 30 minutos (reduzido de 5 para 30)
  private isMonitoring: boolean = false;
  private enableLogs: boolean = false; // Desabilitar logs por padrão

  /**
   * Inicia o monitoramento automático de produtos
   */
  startMonitoring() {
    if (this.isMonitoring) {
      if (this.enableLogs) console.log('SEO Auto-updater já está monitorando');
      return;
    }

    this.isMonitoring = true;
    if (this.enableLogs) console.log('🔍 SEO Auto-updater iniciado - Monitorando novos produtos...');
    
    // Verificação inicial
    this.checkForUpdates();
    
    // Verificação periódica
    setInterval(() => {
      this.checkForUpdates();
    }, this.updateInterval);
  }

  /**
   * Para o monitoramento
   */
  stopMonitoring() {
    this.isMonitoring = false;
    if (this.enableLogs) console.log('⏹️ SEO Auto-updater parado');
  }

  /**
   * Habilita ou desabilita logs do SEO updater
   */
  setLogsEnabled(enabled: boolean) {
    this.enableLogs = enabled;
    if (this.enableLogs) {
      console.log('📝 Logs do SEO Auto-updater habilitados');
      console.log('💡 Para inicializar o sistema: initializeAutoSEO()');
    } else {
      console.log('🔇 Logs do SEO Auto-updater desabilitados');
    }
  }

  /**
   * Verifica se há novos produtos ou categorias
   */
  private async checkForUpdates() {
    try {
      const now = Date.now();
      
      // Verificar novos produtos
      const newProducts = await this.getNewProducts(this.lastUpdate);
      if (newProducts.length > 0) {
        if (this.enableLogs) console.log(`🆕 ${newProducts.length} novos produtos detectados:`, newProducts.map(p => p.name));
        await this.updateSEOForNewProducts(newProducts);
      }

      // Verificar novas categorias
      const newCategories = await this.getNewCategories(this.lastUpdate);
      if (newCategories.length > 0) {
        if (this.enableLogs) console.log(`🆕 ${newCategories.length} novas categorias detectadas:`, newCategories.map(c => c.name));
        await this.updateSEOForNewCategories(newCategories);
      }

      this.lastUpdate = now;
    } catch (error) {
      if (this.enableLogs) console.error('❌ Erro ao verificar atualizações de SEO:', error);
    }
  }

  /**
   * Busca produtos criados após timestamp
   */
  private async getNewProducts(timestamp: number): Promise<ProductForSEO[]> {
    const timestampDate = new Date(timestamp).toISOString();
    
    const { data, error } = await supabase
      .from('physical_products')
      .select(`
        id,
        name,
        description,
        slug,
        price,
        currency,
        images,
        created_at,
        category:physical_product_categories!category_id(id, name),
        subcategory:physical_product_categories!subcategory_id(id, name)
      `)
      .gte('created_at', timestampDate)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      if (this.enableLogs) console.error('Erro ao buscar novos produtos:', error);
      return [];
    }

    // Converter dados para formato correto
    return (data || []).map(product => ({
      ...product,
      category: Array.isArray(product.category) ? product.category[0] : product.category,
      subcategory: Array.isArray(product.subcategory) ? product.subcategory[0] : product.subcategory
    }));
  }

  /**
   * Busca categorias criadas após timestamp
   */
  private async getNewCategories(timestamp: number): Promise<CategoryForSEO[]> {
    const timestampDate = new Date(timestamp).toISOString();
    
    const { data, error } = await supabase
      .from('physical_product_categories')
      .select('id, name, description, created_at')
      .gte('created_at', timestampDate)
      .order('created_at', { ascending: false });

    if (error) {
              if (this.enableLogs) console.error('Erro ao buscar novas categorias:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Atualiza SEO para novos produtos
   */
  private async updateSEOForNewProducts(products: ProductForSEO[]) {
    for (const product of products) {
      try {
        // Gerar SEO para o produto
        const seoData = seoService.generateProductSEO(product);
        
        // Log das otimizações aplicadas (apenas se logs estiverem habilitados)
        if (this.enableLogs) {
          console.log(`✅ SEO atualizado para: ${product.name}`);
          console.log(`   📝 Título: ${seoData.title}`);
          console.log(`   🔗 Palavras-chave: ${seoData.keywords.slice(0, 5).join(', ')}...`);
          console.log(`   📊 Dados estruturados: Produto Schema.org`);
        }
        
        // Aqui você poderia salvar os dados SEO no banco se necessário
        await this.saveSEOMetadata(product.id, seoData, 'product');
        
      } catch (error) {
        if (this.enableLogs) console.error(`❌ Erro ao atualizar SEO para ${product.name}:`, error);
      }
    }
  }

  /**
   * Atualiza SEO para novas categorias
   */
  private async updateSEOForNewCategories(categories: CategoryForSEO[]) {
    for (const category of categories) {
      try {
        // Buscar produtos da categoria para gerar SEO
        const { data: categoryProducts } = await supabase
          .from('physical_products')
          .select(`
            id, name, description, slug, price, currency, images,
            category:physical_product_categories!category_id(id, name)
          `)
          .or(`category_id.eq.${category.id},subcategory_id.eq.${category.id}`)
          .eq('is_active', true);

        // Converter dados para formato correto
        const formattedProducts = (categoryProducts || []).map(product => ({
          ...product,
          category: Array.isArray(product.category) ? product.category[0] : product.category
        }));

        const seoData = seoService.generateCategorySEO(category, formattedProducts);
        
        if (this.enableLogs) {
          console.log(`✅ SEO atualizado para categoria: ${category.name}`);
          console.log(`   📝 Título: ${seoData.title}`);
          console.log(`   🔗 Palavras-chave: ${seoData.keywords.slice(0, 5).join(', ')}...`);
        }
        
        await this.saveSEOMetadata(category.id, seoData, 'category');
        
      } catch (error) {
        if (this.enableLogs) console.error(`❌ Erro ao atualizar SEO para categoria ${category.name}:`, error);
      }
    }
  }

  /**
   * Salva metadados SEO no banco (tabela opcional para cache)
   */
  private async saveSEOMetadata(entityId: string, seoData: any, type: 'product' | 'category') {
    try {
      const { error } = await supabase
        .from('seo_metadata')
        .upsert({
          entity_id: entityId,
          entity_type: type,
          title: seoData.title,
          description: seoData.description,
          keywords: seoData.keywords,
          og_title: seoData.ogTitle,
          og_description: seoData.ogDescription,
          og_image: seoData.ogImage,
          structured_data: seoData.structuredData,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'entity_id,entity_type'
        });

      if (error && !error.message.includes('relation "seo_metadata" does not exist')) {
        if (this.enableLogs) console.error('Erro ao salvar metadados SEO:', error);
      }
    } catch (error) {
      // Tabela opcional - não interromper se não existir
      if (!error.message?.includes('relation "seo_metadata" does not exist')) {
        if (this.enableLogs) console.error('Erro ao salvar metadados SEO:', error);
      }
    }
  }

  /**
   * Força atualização imediata de todos os produtos
   */
  async forceFullUpdate() {
    if (this.enableLogs) console.log('🔄 Forçando atualização completa de SEO...');
    
    try {
      // Buscar todos os produtos ativos
      const { data: products } = await supabase
        .from('physical_products')
        .select(`
          id, name, description, slug, price, currency, images,
          category:physical_product_categories!category_id(id, name),
          subcategory:physical_product_categories!subcategory_id(id, name)
        `)
        .eq('is_active', true);

      // Buscar todas as categorias
      const { data: categories } = await supabase
        .from('physical_product_categories')
        .select('id, name, description');

      if (products && products.length > 0) {
        if (this.enableLogs) console.log(`🔄 Atualizando SEO para ${products.length} produtos...`);
        // Converter dados para formato correto
        const formattedProducts = products.map(product => ({
          ...product,
          category: Array.isArray(product.category) ? product.category[0] : product.category,
          subcategory: Array.isArray(product.subcategory) ? product.subcategory[0] : product.subcategory
        }));
        await this.updateSEOForNewProducts(formattedProducts);
      }

      if (categories && categories.length > 0) {
        if (this.enableLogs) console.log(`🔄 Atualizando SEO para ${categories.length} categorias...`);
        await this.updateSEOForNewCategories(categories);
      }

      if (this.enableLogs) console.log('✅ Atualização completa de SEO concluída!');
    } catch (error) {
              if (this.enableLogs) console.error('❌ Erro na atualização completa:', error);
    }
  }

  /**
   * Gera relatório de SEO atual
   */
  async generateSEOReport() {
    try {
      const { data: products } = await supabase
        .from('physical_products')
        .select('id, name, slug, created_at, category:physical_product_categories!category_id(name)')
        .eq('is_active', true);

      const { data: categories } = await supabase
        .from('physical_product_categories')
        .select('id, name, created_at');

      let recentProductsCount = 0;
      if (products && products.length > 0) {
        const recentProducts = products.filter(p => 
          new Date(p.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        );
        recentProductsCount = recentProducts.length;
        
        if (this.enableLogs) {
          console.log('\n📊 RELATÓRIO SEO ATUAL:');
          console.log('=======================');
          console.log(`✅ Produtos ativos: ${products?.length || 0}`);
          console.log(`✅ Categorias: ${categories?.length || 0}`);
          console.log(`🆕 Produtos adicionados nos últimos 7 dias: ${recentProductsCount}`);
          
          if (recentProducts.length > 0) {
            console.log('   Produtos recentes:');
            recentProducts.forEach(p => {
              const categoryName = Array.isArray(p.category) && p.category.length > 0 ? p.category[0].name : 'Sem categoria';
              console.log(`   - ${p.name} (${categoryName})`);
            });
          }
        }
      }

      const featuredProducts = products?.filter(p => p.name.toLowerCase().includes('iphone') || 
        p.name.toLowerCase().includes('playstation') || 
        p.name.toLowerCase().includes('macbook') ||
        p.name.toLowerCase().includes('rog ally')) || [];
      
      if (this.enableLogs) {
        console.log(`🌟 Produtos com alta otimização SEO: ${featuredProducts.length}`);
        console.log('=======================\n');
      }

      return {
        totalProducts: products?.length || 0,
        totalCategories: categories?.length || 0,
        recentProducts: recentProductsCount,
        featuredProducts: featuredProducts.length
      };
    } catch (error) {
              if (this.enableLogs) console.error('❌ Erro ao gerar relatório SEO:', error);
      return null;
    }
  }
}

// Criar instância global
export const autoSEOUpdater = new AutoSEOUpdater();

// Função para inicializar automaticamente
export function initializeAutoSEO() {
  console.info('🚀 Inicializando sistema de SEO automático...');
  
  // Aguardar um pouco para o app carregar
  setTimeout(() => {
    autoSEOUpdater.startMonitoring();
    
    // Gerar relatório inicial
    setTimeout(() => {
      autoSEOUpdater.generateSEOReport();
    }, 3000);
  }, 2000);
}

// Função para habilitar logs manualmente no console
export function enableSEOLogs() {
  autoSEOUpdater.setLogsEnabled(true);
}

// Função para desabilitar logs manualmente no console
export function disableSEOLogs() {
  autoSEOUpdater.setLogsEnabled(false);
}

// Adicionar funções globais para facilitar o uso no console
// Para habilitar logs: enableSEOLogs()
// Para desabilitar logs: disableSEOLogs()
// Para inicializar: initializeAutoSEO()
if (typeof window !== 'undefined') {
  (window as any).enableSEOLogs = enableSEOLogs;
  (window as any).disableSEOLogs = disableSEOLogs;
  (window as any).initializeAutoSEO = initializeAutoSEO;
}

export default autoSEOUpdater; 