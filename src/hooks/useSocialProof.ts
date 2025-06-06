import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export interface SaleNotification {
  id: string;
  customer_name: string;
  items: any[];
  total: number;
  date: string;
  customer_location: string;
}

export const useSocialProof = () => {
  const [currentNotification, setCurrentNotification] = useState<SaleNotification | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [recentSales, setRecentSales] = useState<SaleNotification[]>([]);

  // Função para mascarar o nome do cliente
  const maskCustomerName = (name: string): string => {
    if (!name || name.length < 3) return name;
    
    const parts = name.trim().split(' ');
    if (parts.length === 1) {
      return name.slice(0, 3) + '***';
    } else {
      const firstName = parts[0];
      const lastName = parts[parts.length - 1];
      return `${firstName} ${lastName.slice(0, Math.min(4, lastName.length))}***`;
    }
  };

  useEffect(() => {
    // Buscar vendas
    const fetchSales = async () => {
      try {
        const { data } = await supabase
          .from('sales')
          .select('id, customer_name, items, total, created_at, customer_location')
          .order('created_at', { ascending: false })
          .limit(20);

        if (data && data.length > 0) {
          console.log('Dados das vendas:', data[0]); // Debug
          // Mapear os dados para o formato correto
          const mappedSales = data.map(sale => ({
            ...sale,
            date: sale.created_at
          }));
          setRecentSales(mappedSales);
        }
      } catch (error) {
        console.error('Erro:', error);
      }
    };

    fetchSales();

    // Sistema simples de notificações
    const showNotifications = () => {
      setInterval(async () => {
        try {
          const { data } = await supabase
            .from('sales')
            .select('id, customer_name, items, total, created_at, customer_location')
            .order('created_at', { ascending: false })
            .limit(20);

          if (data && data.length > 0) {
            const mappedData = data.map(sale => ({
              ...sale,
              date: sale.created_at
            }));
            const randomSale = mappedData[Math.floor(Math.random() * mappedData.length)];
            setCurrentNotification(randomSale);
            setIsVisible(true);

            setTimeout(() => {
              setIsVisible(false);
            }, 4000);
          }
        } catch (error) {
          console.error('Erro ao mostrar notificação:', error);
        }
              }, 20000); // A cada 20 segundos
    };

    // Iniciar após 5 segundos
    const timer = setTimeout(showNotifications, 5000);

    return () => clearTimeout(timer);
  }, []);

  return {
    currentNotification,
    isVisible,
    maskCustomerName,
    totalSales: recentSales.length
  };
}; 