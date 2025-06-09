import { createClient } from '@supabase/supabase-js';

// Função para gerar slug (mesma lógica do database.ts)
function generateSlug(name: string): string {
  // Se houver "|" no nome, usar apenas a parte antes do primeiro "|"
  const nameBeforePipe = name.split('|')[0].trim();
  
  return nameBeforePipe
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/[^a-z0-9]+/g, '-') // Substitui caracteres especiais por hífen
    .replace(/^-+|-+$/g, '') // Remove hífens do início e fim
    .replace(/--+/g, '-'); // Remove hífens duplicados
}

// Função para atualizar slugs dos produtos existentes
export async function updateProductSlugs() {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Configurações do Supabase não encontradas');
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  try {
    // Buscar todos os produtos
    const { data: products, error: fetchError } = await supabase
      .from('physical_products')
      .select('id, name, slug');

    if (fetchError) {
      console.error('Erro ao buscar produtos:', fetchError);
      return;
    }

    console.log(`Encontrados ${products.length} produtos`);

    // Atualizar apenas produtos que têm "|" no nome
    const productsToUpdate = products.filter(product => product.name.includes('|'));
    
    console.log(`${productsToUpdate.length} produtos precisam de atualização de slug`);

    for (const product of productsToUpdate) {
      const newSlug = generateSlug(product.name);
      
      console.log(`Atualizando "${product.name}"`);
      console.log(`  Slug antigo: ${product.slug}`);
      console.log(`  Slug novo: ${newSlug}`);
      
      const { error: updateError } = await supabase
        .from('physical_products')
        .update({ slug: newSlug })
        .eq('id', product.id);

      if (updateError) {
        console.error(`Erro ao atualizar produto ${product.id}:`, updateError);
      } else {
        console.log(`  ✓ Atualizado com sucesso\n`);
      }
    }

    console.log('Atualização concluída!');
    console.log('Recarregue a página para ver os novos slugs em ação');
  } catch (error) {
    console.error('Erro geral:', error);
  }
}

// Disponibilizar a função globalmente para uso no console
(window as any).updateProductSlugs = updateProductSlugs; 