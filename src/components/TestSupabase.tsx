import { useEffect, useState } from 'react';
import { getCategories, getGiftCards } from '@/lib/database';
import { Category, GiftCard } from '@/types/supabase';
import { supabase } from '@/lib/supabase';

export default function TestSupabase() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [giftCards, setGiftCards] = useState<GiftCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<string>('Verificando conexão...');

  useEffect(() => {
    async function testConnection() {
      try {
        const { data, error } = await supabase.from('categories').select('count');
        if (error) throw error;
        setConnectionStatus('Conexão estabelecida com sucesso!');
      } catch (err) {
        console.error('Erro na conexão:', err);
        setConnectionStatus('Erro na conexão com o Supabase');
      }
    }

    async function loadData() {
      try {
        await testConnection();
        
        const [categoriesData, giftCardsData] = await Promise.all([
          getCategories(),
          getGiftCards()
        ]);

        console.log('Categorias:', categoriesData);
        console.log('Gift Cards:', giftCardsData);

        setCategories(categoriesData);
        setGiftCards(giftCardsData);
        setLoading(false);
      } catch (err) {
        console.error('Erro ao carregar dados:', err);
        setError('Erro ao carregar dados: ' + (err instanceof Error ? err.message : String(err)));
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">Carregando...</h2>
        <p>{connectionStatus}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4 text-red-600">Erro</h2>
        <p>{error}</p>
        <p>{connectionStatus}</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Teste do Supabase</h2>
      <p className="mb-4 text-green-600">{connectionStatus}</p>
      
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-2">Categorias ({categories.length})</h3>
        {categories.length === 0 ? (
          <p>Nenhuma categoria encontrada</p>
        ) : (
          <ul className="list-disc pl-5">
            {categories.map(category => (
              <li key={category.id}>{category.name}</li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-2">Gift Cards ({giftCards.length})</h3>
        {giftCards.length === 0 ? (
          <p>Nenhum gift card encontrado</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {giftCards.map(card => (
              <div key={card.id} className="border p-4 rounded-lg">
                <h4 className="font-bold">{card.name}</h4>
                <p className="text-sm text-gray-600">{card.description}</p>
                <p className="mt-2">Preço: R$ {card.price}</p>
                <p>Desconto: {card.discount}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 