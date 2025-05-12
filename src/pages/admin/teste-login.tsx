import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function TesteLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [envVars, setEnvVars] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResult(null);
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(`Erro: ${error.message}`);
      } else {
        setResult(`Login bem-sucedido! Usuário: ${data.user?.email}`);
      }
    } catch (err) {
      setError(`Erro inesperado: ${(err as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  const checkEnvVars = () => {
    setEnvVars({
      supabaseUrl: import.meta.env.VITE_SUPABASE_URL || 'Não definido',
      supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Definido (não exibido)' : 'Não definido',
    });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="bg-white rounded-lg shadow-md p-6 max-w-md w-full mb-4">
        <h2 className="text-xl font-bold mb-4">Teste de Login</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Testando...' : 'Testar Login'}
          </button>
        </form>

        {error && (
          <div className="mt-4 p-3 bg-red-50 text-red-700 rounded">
            {error}
          </div>
        )}

        {result && (
          <div className="mt-4 p-3 bg-green-50 text-green-700 rounded">
            {result}
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 max-w-md w-full">
        <h2 className="text-xl font-bold mb-4">Variáveis de Ambiente</h2>
        <button
          onClick={checkEnvVars}
          className="bg-gray-200 text-gray-800 py-2 px-4 rounded hover:bg-gray-300"
        >
          Verificar Variáveis
        </button>

        {Object.keys(envVars).length > 0 && (
          <div className="mt-4">
            <h3 className="font-semibold mb-2">Valores:</h3>
            <ul className="space-y-1">
              {Object.entries(envVars).map(([key, value]) => (
                <li key={key}>
                  <strong>{key}:</strong> {value}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="mt-4">
        <a href="/" className="text-blue-600 hover:underline">
          Voltar para a Página Inicial
        </a>
      </div>
    </div>
  );
} 