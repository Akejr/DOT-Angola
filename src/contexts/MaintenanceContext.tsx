import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';

interface MaintenanceContextType {
  isInMaintenance: boolean;
  maintenanceMessage: string;
}

const MaintenanceContext = createContext<MaintenanceContextType>({
  isInMaintenance: false,
  maintenanceMessage: '',
});

export const useMaintenanceStatus = () => useContext(MaintenanceContext);

interface MaintenanceProviderProps {
  children: ReactNode;
}

export const MaintenanceProvider: React.FC<MaintenanceProviderProps> = ({ children }) => {
  const [isInMaintenance, setIsInMaintenance] = useState(false);
  const [maintenanceMessage, setMaintenanceMessage] = useState('');

  useEffect(() => {
    const fetchMaintenanceStatus = async () => {
      try {
        const { data, error } = await supabase
          .from('system_settings')
          .select('maintenance_mode, maintenance_message')
          .single();

        if (error) {
          console.error('Erro ao buscar status de manutenção:', error);
          return;
        }

        if (data) {
          setIsInMaintenance(data.maintenance_mode);
          setMaintenanceMessage(data.maintenance_message || 'Estamos realizando manutenção no site. Por favor, volte em breve.');
        }
      } catch (error) {
        console.error('Erro ao verificar status de manutenção:', error);
      }
    };

    fetchMaintenanceStatus();

    // Configurar um canal para ouvir mudanças nas configurações
    const channel = supabase
      .channel('system_settings_changes')
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'system_settings' 
      }, (payload) => {
        if (payload.new) {
          setIsInMaintenance(payload.new.maintenance_mode);
          setMaintenanceMessage(payload.new.maintenance_message || 'Estamos realizando manutenção no site. Por favor, volte em breve.');
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <MaintenanceContext.Provider value={{ isInMaintenance, maintenanceMessage }}>
      {children}
    </MaintenanceContext.Provider>
  );
};