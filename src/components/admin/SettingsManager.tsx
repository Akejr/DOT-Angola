import { useState, useEffect } from 'react';
import { Settings, Save, RefreshCw, Shield, AlertTriangle } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface SystemSettings {
  maintenance_mode: boolean;
  maintenance_message?: string;
}

export default function SettingsManager() {
  const [settings, setSettings] = useState<SystemSettings>({
    maintenance_mode: false,
    maintenance_message: 'Estamos realizando manutenção no site. Por favor, volte em breve.'
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
        .from('system_settings')
        .select('maintenance_mode, maintenance_message')
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 é o código para "não encontrado"
        throw error;
      }

      if (data) {
        setSettings({
          maintenance_mode: data.maintenance_mode || false,
          maintenance_message: data.maintenance_message || 'Estamos realizando manutenção no site. Por favor, volte em breve.'
        });
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      let saveError = null;
      
      // Verificar se já existe uma configuração
      const { data, error } = await supabase
        .from('system_settings')
        .select('*')
        .limit(1);
      
      if (error) throw error;
      
      // Preparar os dados para salvar (apenas os campos necessários)
      const settingsToSave = {
        maintenance_mode: settings.maintenance_mode,
        maintenance_message: settings.maintenance_message
      };
      
      if (data && data.length > 0) {
        // Atualizar configurações existentes
        const { error } = await supabase
          .from('system_settings')
          .update(settingsToSave)
          .eq('id', data[0].id);
          
        saveError = error;
      } else {
        // Inserir novas configurações
        const { error } = await supabase
          .from('system_settings')
          .insert([settingsToSave]);
          
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
            <Shield className="w-5 h-5 mr-2 text-gray-500" />
            Modo de Manutenção
          </h2>
        </div>
        <div className="p-6 space-y-4">
          {settings.maintenance_mode && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertTriangle className="h-5 w-5 text-yellow-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    <strong>Atenção:</strong> O site está atualmente em modo de manutenção. Os visitantes não conseguirão acessar o conteúdo normal do site.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          <div className="flex items-center justify-between py-2 border-b border-gray-100">
            <div>
              <h3 className="text-sm font-medium text-gray-900">Ativar Modo de Manutenção</h3>
              <p className="text-xs text-gray-500">
                Quando ativado, todos os visitantes verão apenas a página de manutenção
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
          
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mensagem de Manutenção
            </label>
            <textarea
              name="maintenance_message"
              value={settings.maintenance_message}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Mensagem que será exibida durante a manutenção"
            />
            <p className="text-xs text-gray-500 mt-1">
              Esta mensagem será exibida na página de manutenção para informar os visitantes.
            </p>
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
          <span>{saving ? 'Salvando Configurações...' : 'Salvar Configurações'}</span>
        </button>
      </div>
    </div>
  );
}