import { useState, useEffect, useRef } from 'react';
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
  
  // Refs para controlar timers e evitar loops
  const notificationTimerRef = useRef<NodeJS.Timeout | null>(null);
  const hideTimerRef = useRef<NodeJS.Timeout | null>(null);
  const fetchIntervalRef = useRef<NodeJS.Timeout | null>(null);

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

  // Buscar vendas recentes do Supabase
  const fetchRecentSales = async () => {
    console.log('🔍 Buscando vendas no Supabase...');
    try {
      const { data, error } = await supabase
        .from('sales')
        .select('*')
        .gte('date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('❌ Erro ao buscar vendas:', error);
        return;
      }

      if (data && data.length > 0) {
        console.log(`✅ ${data.length} vendas carregadas`);
        setRecentSales(data);
      } else {
        console.log('⚠️ Nenhuma venda encontrada');
      }
    } catch (error) {
      console.error('❌ Erro ao conectar com Supabase:', error);
    }
  };

  // Mostrar uma notificação
  const showNotification = () => {
    console.log(`📊 Vendas disponíveis: ${recentSales.length}`);
    if (recentSales.length === 0) {
      console.log('❌ Nenhuma venda disponível');
      return;
    }

    // Limpar timer anterior se existir
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
    }

    const randomSale = recentSales[Math.floor(Math.random() * recentSales.length)];
    console.log(`✅ Mostrando notificação para: ${randomSale.customer_name}`);
    setCurrentNotification(randomSale);
    setIsVisible(true);

    // Agendar para esconder após 5 segundos
    hideTimerRef.current = setTimeout(() => {
      console.log('⏰ Ocultando notificação');
      setIsVisible(false);
      setCurrentNotification(null);
    }, 5000);
  };

  // Agendar próxima notificação
  const scheduleNextNotification = () => {
    // Limpar timer anterior
    if (notificationTimerRef.current) {
      clearTimeout(notificationTimerRef.current);
    }

    // Agendar próxima notificação em 10-15 segundos (para teste)
    const delay = 10000 + Math.random() * 5000; // 10-15 segundos
    console.log(`🔔 Próxima notificação em ${Math.round(delay/1000)} segundos`);
    notificationTimerRef.current = setTimeout(() => {
      console.log('🎯 Executando showNotification');
      showNotification();
      scheduleNextNotification(); // Reagendar próxima
    }, delay);
  };

  useEffect(() => {
    // Buscar dados iniciais
    fetchRecentSales();

    // Configurar intervalo para buscar novas vendas a cada 5 minutos
    fetchIntervalRef.current = setInterval(fetchRecentSales, 5 * 60 * 1000);

    // Iniciar sistema de notificações após 5 segundos
    console.log('🚀 Sistema iniciado, primeira notificação em 5 segundos');
    const initialTimeout = setTimeout(() => {
      console.log('🎬 Iniciando sistema de notificações');
      scheduleNextNotification();
    }, 5000);

    // Cleanup function
    return () => {
      if (notificationTimerRef.current) {
        clearTimeout(notificationTimerRef.current);
      }
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
      }
      if (fetchIntervalRef.current) {
        clearInterval(fetchIntervalRef.current);
      }
      clearTimeout(initialTimeout);
    };
  }, []); // Array vazio - executa apenas uma vez

  // Efeito para reagendar quando as vendas são carregadas
  useEffect(() => {
    if (recentSales.length > 0 && !notificationTimerRef.current) {
      // Se ainda não há timer rodando e temos vendas, iniciar
      scheduleNextNotification();
    }
  }, [recentSales]);

  return {
    currentNotification,
    isVisible,
    maskCustomerName,
    totalSales: recentSales.length
  };
}; 