import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CheckCircle, Clock, MessageCircle, ArrowLeft, Package } from 'lucide-react';
import { SEO } from '@/components/SEO';

export default function ImportThankYouPage() {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirecionar para a página de importação após 10 segundos
    const timer = setTimeout(() => {
      navigate('/importacao');
    }, 10000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <>
      <SEO 
        title="Obrigado pelo seu pedido! | DOT Angola"
        description="Recebemos o seu pedido de importação. Nossa equipe entrará em contato em alguns minutos."
        type="website"
      />
      
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-0 sm:p-4">
        <div className="max-w-6xl w-full bg-white rounded-none sm:rounded-3xl shadow-xl overflow-hidden">
          <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center">
            {/* Ícone de sucesso */}
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>

            {/* Título principal */}
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Pedido recebido com sucesso!
            </h1>

            {/* Mensagem de agradecimento */}
            <p className="text-lg text-gray-600 mb-8 max-w-md">
              Obrigado pelo seu interesse nos nossos produtos. Recebemos o seu pedido de importação.
            </p>

            {/* Card de informações */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8 max-w-md w-full">
              <div className="flex items-center gap-3 mb-4">
                <Clock className="w-6 h-6 text-blue-600" />
                <div className="text-left">
                  <h3 className="font-semibold text-blue-900">Próximos passos</h3>
                  <p className="text-sm text-blue-700">Nossa equipe vai entrar em contato</p>
                </div>
              </div>
              
              <div className="text-sm text-blue-700 space-y-2">
                <p>• Análise do produto solicitado</p>
                <p>• Verificação de disponibilidade</p>
                <p>• Cotação de preço e frete</p>
                <p>• Tempo estimado de entrega</p>
              </div>
            </div>

            {/* Tempo de resposta */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-8 max-w-md w-full">
              <div className="flex items-center gap-2 justify-center">
                <MessageCircle className="w-5 h-5 text-green-600" />
                <p className="text-sm font-medium text-green-800">
                  Resposta em alguns minutos
                </p>
              </div>
            </div>

            {/* Botões de ação */}
            <div className="flex flex-col sm:flex-row gap-4 max-w-md w-full">
              <Link
                to="/importacao"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                <Package className="w-5 h-5" />
                Ver outros produtos
              </Link>
              
              <Link
                to="/"
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-5 h-5" />
                Voltar ao início
              </Link>
            </div>

            {/* Contador regressivo */}
            <p className="text-sm text-gray-500 mt-6">
              Redirecionando automaticamente em alguns segundos...
            </p>
          </div>
        </div>
      </div>
    </>
  );
} 