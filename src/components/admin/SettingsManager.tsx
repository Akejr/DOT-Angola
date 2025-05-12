import { useState, useEffect } from 'react';
import { Settings, Save, RefreshCw, Shield, Globe, DollarSign, Mail, Phone } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface SystemSettings {
  site_name: string;
  site_description: string;
  contact_email: string;
  contact_phone: string;
  whatsapp_number: string;
  enable_notifications: boolean;
  maintenance_mode: boolean;
  default_currency: string;
}

export default function SettingsManager() {
  const [settings, setSettings] = useState<SystemSettings>({
    site_name: 'DOT ANGOLA - O melhor da tecnologia em Angola',
    site_description: 'O melhor da tecnologia em Angola. Gift cards internacionais, cartões presente e cartões virtuais com os melhores preços.',
    contact_email: 'contato@dotangola.com',
    contact_phone: '',
    whatsapp_number: '+244 931343433',
    enable_notifications: true,
    maintenance_mode: false,
    default_currency: 'AOA'
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 é o código para "não encontrado"
        throw error;
      }

      if (data) {
        setSettings(data);
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      
      // Verificar se já existe registro de configurações
      const { data, error: checkError } = await supabase
        .from('settings')
        .select('id')
        .single();
      
      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }
      
      let saveError;
      
      if (data) {
        // Atualizar configurações existentes
        const { error } = await supabase
          .from('settings')
          .update(settings)
          .eq('id', data.id);
          
        saveError = error;
      } else {
        // Inserir novas configurações
        const { error } = await supabase
          .from('settings')
          .insert([settings]);
          
        saveError = error;
      }
      
      if (saveError) throw saveError;
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      alert('Erro ao salvar as configurações. Por favor tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    setSettings({
      ...settings,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Configurações do Sistema</h1>
        <div className="flex items-center space-x-3">
          <button
            onClick={loadSettings}
            className="flex items-center px-3 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            disabled={saving}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            <span>Atualizar</span>
          </button>
          <button
            onClick={saveSettings}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            disabled={saving}
          >
            <Save className="w-4 h-4 mr-2" />
            <span>{saving ? 'Salvando...' : 'Salvar Alterações'}</span>
          </button>
        </div>
      </div>

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
          Configurações salvas com sucesso!
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-medium text-gray-900 flex items-center">
            <Globe className="w-5 h-5 mr-2 text-gray-500" />
            Configurações do Site
          </h2>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome do Site
              </label>
              <input
                type="text"
                name="site_name"
                value={settings.site_name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descrição do Site
              </label>
              <textarea
                name="site_description"
                value={settings.site_description}
                onChange={handleInputChange}
                rows={2}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-medium text-gray-900 flex items-center">
            <Mail className="w-5 h-5 mr-2 text-gray-500" />
            Informações de Contato
          </h2>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email de Contato
              </label>
              <input
                type="email"
                name="contact_email"
                value={settings.contact_email}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Telefone de Contato
              </label>
              <input
                type="tel"
                name="contact_phone"
                value={settings.contact_phone}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Número do WhatsApp para Compras
              </label>
              <div className="flex items-center">
                <Phone className="w-5 h-5 text-gray-400 mr-2" />
                <input
                  type="tel"
                  name="whatsapp_number"
                  value={settings.whatsapp_number}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="+244 000000000"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Número utilizado para enviar mensagens de compra. Inclua o código do país.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-medium text-gray-900 flex items-center">
            <DollarSign className="w-5 h-5 mr-2 text-gray-500" />
            Configurações de Moeda
          </h2>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Moeda Padrão
            </label>
            <select
              name="default_currency"
              value={settings.default_currency}
              onChange={handleInputChange}
              className="w-full md:w-1/3 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="AOA">Kwanza (AOA)</option>
              <option value="USD">Dólar Americano (USD)</option>
              <option value="EUR">Euro (EUR)</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-medium text-gray-900 flex items-center">
            <Shield className="w-5 h-5 mr-2 text-gray-500" />
            Configurações do Sistema
          </h2>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between py-2 border-b border-gray-100">
            <div>
              <h3 className="text-sm font-medium text-gray-900">Ativar Notificações</h3>
              <p className="text-xs text-gray-500">
                Mostrar notificações ativas na página inicial
              </p>
            </div>
            <div className="relative inline-block w-10 mr-2 align-middle select-none">
              <input
                type="checkbox"
                name="enable_notifications"
                id="enable_notifications"
                checked={settings.enable_notifications}
                onChange={handleInputChange}
                className="sr-only peer"
              />
              <label
                htmlFor="enable_notifications"
                className="block h-6 overflow-hidden bg-gray-200 rounded-full cursor-pointer peer-checked:bg-blue-600 after:absolute after:z-[2] after:top-0 after:left-0 after:content-[''] after:bg-white after:h-6 after:w-6 after:rounded-full after:transition-all after:duration-300 peer-checked:after:translate-x-full"
              ></label>
            </div>
          </div>
          <div className="flex items-center justify-between py-2">
            <div>
              <h3 className="text-sm font-medium text-gray-900">Modo Manutenção</h3>
              <p className="text-xs text-gray-500">
                Exibir página de manutenção para todos os visitantes
              </p>
            </div>
            <div className="relative inline-block w-10 mr-2 align-middle select-none">
              <input
                type="checkbox"
                name="maintenance_mode"
                id="maintenance_mode"
                checked={settings.maintenance_mode}
                onChange={handleInputChange}
                className="sr-only peer"
              />
              <label
                htmlFor="maintenance_mode"
                className="block h-6 overflow-hidden bg-gray-200 rounded-full cursor-pointer peer-checked:bg-red-600 after:absolute after:z-[2] after:top-0 after:left-0 after:content-[''] after:bg-white after:h-6 after:w-6 after:rounded-full after:transition-all after:duration-300 peer-checked:after:translate-x-full"
              ></label>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end mt-6">
        <button
          onClick={saveSettings}
          className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          disabled={saving}
        >
          <Settings className="w-5 h-5 mr-2" />
          <span>{saving ? 'Salvando Configurações...' : 'Salvar Todas as Configurações'}</span>
        </button>
      </div>
    </div>
  );
} 