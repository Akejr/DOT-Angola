import { useState, useEffect } from 'react';
import { Smartphone, Clock, Bell, Save, RefreshCw, CheckCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { usePWA, salesNotificationManager } from '@/lib/pwa';

interface PWASettings {
  daily_notification_time: string;
}

export default function PWASettings() {
  const [settings, setSettings] = useState<PWASettings>({
    daily_notification_time: '20:20'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'success' | 'error' | null>(null);
  const { getPWAInfo, requestPermission } = usePWA();
  const [pwaInfo, setPwaInfo] = useState<any>(null);

  // Carregar configurações
  useEffect(() => {
    loadSettings();
    setPwaInfo(getPWAInfo());
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('pwa_settings')
        .select('setting_key, setting_value')
        .in('setting_key', ['daily_notification_time']);

      if (error) throw error;

      if (data && data.length > 0) {
        const settingsObj: any = {};
        data.forEach(item => {
          settingsObj[item.setting_key] = item.setting_value;
        });
        setSettings(prev => ({ ...prev, ...settingsObj }));
      }
    } catch (error) {
      console.error('Erro ao carregar configurações PWA:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      setSaveStatus(null);

      // Validar horário
      if (!isValidTime(settings.daily_notification_time)) {
        throw new Error('Horário inválido. Use o formato HH:MM');
      }

      // Salvar configuração no Supabase
      const { error } = await supabase
        .rpc('update_pwa_setting', {
          key_name: 'daily_notification_time',
          new_value: settings.daily_notification_time
        });

      if (error) throw error;

      setSaveStatus('success');
      
      // Atualizar service worker com novo horário
      await updateServiceWorkerSchedule();
      
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus(null), 3000);
    } finally {
      setSaving(false);
    }
  };

  const isValidTime = (time: string): boolean => {
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return timeRegex.test(time);
  };

  const updateServiceWorkerSchedule = async () => {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready;
      if (registration.active) {
        registration.active.postMessage({
          type: 'UPDATE_NOTIFICATION_SCHEDULE',
          time: settings.daily_notification_time
        });
      }
    }
  };

  const testDailyNotification = async () => {
    try {
      // Buscar estatísticas do dia
      const { data, error } = await supabase
        .rpc('get_daily_order_stats');

      if (error) throw error;

      const message = data?.message || 'Você teve o lucro líquido diário de 0 AOA';
      
      // Mostrar notificação de teste
      await salesNotificationManager.getPWAManager().showLocalNotification({
        title: '📊 Teste - Relatório Diário',
        body: message,
        tag: 'test-daily-report',
        requireInteraction: true
      });
    } catch (error) {
      console.error('Erro ao testar notificação diária:', error);
    }
  };

  const activateNotifications = async () => {
    try {
      const result = await requestPermission();
      if (result.permission === 'granted') {
        setPwaInfo(getPWAInfo());
      }
    } catch (error) {
      console.error('Erro ao ativar notificações:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#01042D]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
        <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
          <Smartphone className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-[#01042D]">Configurações PWA</h1>
          <p className="text-sm text-gray-500">Configure suas notificações e aplicativo web</p>
        </div>
      </div>

      {/* Status PWA */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Smartphone className="h-5 w-5" />
          Status da PWA
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${pwaInfo?.isInstalled ? 'bg-green-500' : 'bg-gray-300'}`} />
            <span className="text-sm">
              {pwaInfo?.isInstalled ? 'App instalado' : 'App não instalado'}
            </span>
          </div>
          
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${pwaInfo?.notificationPermission === 'granted' ? 'bg-green-500' : 'bg-gray-300'}`} />
            <span className="text-sm">
              {pwaInfo?.notificationPermission === 'granted' ? 'Notificações ativas' : 'Notificações inativas'}
            </span>
          </div>
        </div>

        {pwaInfo?.notificationPermission !== 'granted' && (
          <button
            onClick={activateNotifications}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Bell className="h-4 w-4" />
            Ativar Notificações
          </button>
        )}
      </div>

      {/* Configurações de Notificação */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Notificação Diária
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Horário da notificação
            </label>
            <div className="flex items-center gap-3">
              <input
                type="time"
                value={settings.daily_notification_time}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  daily_notification_time: e.target.value
                }))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <span className="text-sm text-gray-500">
                Você receberá um relatório diário neste horário
              </span>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-2">Mensagem da notificação:</h3>
            <p className="text-sm text-gray-600 italic">
              "Você teve o lucro líquido diário de [VALOR] AOA"
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={saveSettings}
              disabled={saving}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                saving
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-[#01042D] text-white hover:bg-[#01042D]/90'
              }`}
            >
              {saving ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {saving ? 'Salvando...' : 'Salvar Configurações'}
            </button>

            <button
              onClick={testDailyNotification}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Bell className="h-4 w-4" />
              Testar Notificação
            </button>
          </div>

          {saveStatus && (
            <div className={`flex items-center gap-2 p-3 rounded-lg ${
              saveStatus === 'success' 
                ? 'bg-green-50 text-green-700' 
                : 'bg-red-50 text-red-700'
            }`}>
              {saveStatus === 'success' ? (
                <>
                  <CheckCircle className="h-4 w-4" />
                  Configurações salvas com sucesso!
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4" />
                  Erro ao salvar configurações
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Informações Adicionais */}
      <div className="bg-blue-50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">Como funciona</h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
            A notificação diária mostra seu lucro líquido baseado nas compras do dia
          </li>
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
            Você receberá notificações automáticas sempre que houver uma nova compra
          </li>
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
            As notificações funcionam mesmo quando o admin está em segundo plano
          </li>
        </ul>
      </div>
    </div>
  );
} 