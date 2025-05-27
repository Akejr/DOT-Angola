import React from 'react';
import { Shield, Lock, Eye, Database, UserCheck, AlertTriangle } from 'lucide-react';
import MainLayout from '@/components/MainLayout';

const PrivacidadePage: React.FC = () => {
  const handlePageChange = (id: number) => {
    console.log("Mudando para página:", id);
  };

  const seoProps = {
    title: 'Política de Privacidade | DOT ANGOLA',
    description: 'Conheça nossa política de privacidade e como protegemos seus dados pessoais na DOT ANGOLA.',
    type: 'website'
  };

  return (
    <MainLayout seoProps={seoProps} onPageChange={handlePageChange}>
      <div className="container mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Shield className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Política de Privacidade</h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Última atualização: Janeiro de 2025
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Introdução */}
          <div className="bg-green-50 rounded-2xl p-8 mb-8">
            <div className="flex items-start gap-4">
              <Lock className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-3">Seu Compromisso com a Privacidade</h2>
                <p className="text-gray-700 leading-relaxed">
                  Na DOT ANGOLA, levamos sua privacidade a sério. Esta política explica como coletamos, 
                  usamos e protegemos suas informações pessoais quando você utiliza nossos serviços.
                </p>
              </div>
            </div>
          </div>

          {/* Seções da Política */}
          <div className="space-y-8">
            {/* 1. Informações que Coletamos */}
            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-3">
                <Database className="w-6 h-6 text-blue-600" />
                1. Informações que Coletamos
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-blue-50 rounded-xl p-6">
                  <h3 className="font-semibold text-blue-800 mb-3">Informações Fornecidas por Você</h3>
                  <ul className="space-y-2 text-blue-700 text-sm">
                    <li>• Nome completo</li>
                    <li>• Número de telefone (WhatsApp)</li>
                    <li>• Endereço de email</li>
                    <li>• Informações de pagamento</li>
                    <li>• Histórico de compras</li>
                  </ul>
                </div>
                
                <div className="bg-purple-50 rounded-xl p-6">
                  <h3 className="font-semibold text-purple-800 mb-3">Informações Coletadas Automaticamente</h3>
                  <ul className="space-y-2 text-purple-700 text-sm">
                    <li>• Endereço IP</li>
                    <li>• Tipo de dispositivo e navegador</li>
                    <li>• Páginas visitadas</li>
                    <li>• Tempo de permanência no site</li>
                    <li>• Cookies e tecnologias similares</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* 2. Como Usamos suas Informações */}
            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-3">
                <UserCheck className="w-6 h-6 text-blue-600" />
                2. Como Usamos suas Informações
              </h2>
              <div className="bg-gray-50 rounded-xl p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-3">Finalidades Principais</h3>
                    <ul className="space-y-2 text-gray-700 text-sm">
                      <li>• Processar e entregar seus pedidos</li>
                      <li>• Comunicar sobre status de compras</li>
                      <li>• Fornecer suporte ao cliente</li>
                      <li>• Verificar identidade e prevenir fraudes</li>
                      <li>• Melhorar nossos serviços</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-3">Comunicações</h3>
                    <ul className="space-y-2 text-gray-700 text-sm">
                      <li>• Confirmações de pedidos</li>
                      <li>• Atualizações de produtos</li>
                      <li>• Ofertas especiais (opcional)</li>
                      <li>• Avisos importantes do serviço</li>
                      <li>• Pesquisas de satisfação</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* 3. Compartilhamento de Informações */}
            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-3">
                <Eye className="w-6 h-6 text-blue-600" />
                3. Compartilhamento de Informações
              </h2>
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                  <h3 className="font-semibold text-green-800 mb-3">✓ Quando Compartilhamos</h3>
                  <ul className="space-y-2 text-green-700 text-sm">
                    <li>• Com processadores de pagamento (para transações)</li>
                    <li>• Com fornecedores de gift cards (para ativação)</li>
                    <li>• Com autoridades legais (quando exigido por lei)</li>
                    <li>• Com sua autorização expressa</li>
                  </ul>
                </div>
                
                <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                  <h3 className="font-semibold text-red-800 mb-3">✗ Nunca Compartilhamos</h3>
                  <ul className="space-y-2 text-red-700 text-sm">
                    <li>• Suas informações para marketing de terceiros</li>
                    <li>• Dados pessoais para fins comerciais não relacionados</li>
                    <li>• Informações de pagamento completas</li>
                    <li>• Dados sem sua autorização</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* 4. Segurança dos Dados */}
            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-3">
                <Lock className="w-6 h-6 text-blue-600" />
                4. Segurança dos Dados
              </h2>
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Shield className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-gray-800 mb-2">Criptografia</h3>
                    <p className="text-gray-600 text-sm">Todas as transmissões são protegidas com SSL/TLS</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Lock className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-gray-800 mb-2">Acesso Restrito</h3>
                    <p className="text-gray-600 text-sm">Apenas funcionários autorizados têm acesso</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Database className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-gray-800 mb-2">Backup Seguro</h3>
                    <p className="text-gray-600 text-sm">Backups regulares em servidores protegidos</p>
                  </div>
                </div>
              </div>
            </section>

            {/* 5. Seus Direitos */}
            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">5. Seus Direitos</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="bg-white border border-gray-200 rounded-xl p-4">
                    <h3 className="font-semibold text-gray-800 mb-2">Acesso</h3>
                    <p className="text-gray-600 text-sm">Solicitar cópia dos seus dados pessoais</p>
                  </div>
                  
                  <div className="bg-white border border-gray-200 rounded-xl p-4">
                    <h3 className="font-semibold text-gray-800 mb-2">Correção</h3>
                    <p className="text-gray-600 text-sm">Atualizar informações incorretas ou incompletas</p>
                  </div>
                  
                  <div className="bg-white border border-gray-200 rounded-xl p-4">
                    <h3 className="font-semibold text-gray-800 mb-2">Exclusão</h3>
                    <p className="text-gray-600 text-sm">Solicitar remoção dos seus dados (quando aplicável)</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="bg-white border border-gray-200 rounded-xl p-4">
                    <h3 className="font-semibold text-gray-800 mb-2">Portabilidade</h3>
                    <p className="text-gray-600 text-sm">Receber seus dados em formato estruturado</p>
                  </div>
                  
                  <div className="bg-white border border-gray-200 rounded-xl p-4">
                    <h3 className="font-semibold text-gray-800 mb-2">Oposição</h3>
                    <p className="text-gray-600 text-sm">Opor-se ao processamento para marketing</p>
                  </div>
                  
                  <div className="bg-white border border-gray-200 rounded-xl p-4">
                    <h3 className="font-semibold text-gray-800 mb-2">Limitação</h3>
                    <p className="text-gray-600 text-sm">Restringir o processamento em certas situações</p>
                  </div>
                </div>
              </div>
            </section>

            {/* 6. Cookies */}
            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">6. Cookies e Tecnologias Similares</h2>
              <div className="bg-orange-50 rounded-xl p-6">
                <div className="flex items-start gap-4 mb-4">
                  <AlertTriangle className="w-6 h-6 text-orange-600 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">O que são Cookies?</h3>
                    <p className="text-gray-700 text-sm mb-4">
                      Cookies são pequenos arquivos de texto armazenados no seu dispositivo para melhorar sua experiência.
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Essenciais</h4>
                    <p className="text-gray-600 text-sm">Necessários para funcionamento básico do site</p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Funcionais</h4>
                    <p className="text-gray-600 text-sm">Lembram suas preferências e configurações</p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Analíticos</h4>
                    <p className="text-gray-600 text-sm">Ajudam a entender como você usa o site</p>
                  </div>
                </div>
              </div>
            </section>

            {/* 7. Retenção de Dados */}
            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">7. Retenção de Dados</h2>
              <div className="bg-gray-50 rounded-xl p-6">
                <div className="space-y-4 text-gray-700">
                  <p>
                    <strong>Dados de Conta:</strong> Mantemos enquanto sua conta estiver ativa ou conforme necessário para fornecer serviços.
                  </p>
                  <p>
                    <strong>Histórico de Transações:</strong> Conservamos por até 5 anos para fins contábeis e legais.
                  </p>
                  <p>
                    <strong>Dados de Marketing:</strong> Mantemos até você cancelar a inscrição ou solicitar remoção.
                  </p>
                  <p>
                    <strong>Logs do Sistema:</strong> Armazenamos por até 12 meses para segurança e diagnósticos.
                  </p>
                </div>
              </div>
            </section>

            {/* 8. Contato */}
            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">8. Entre em Contato</h2>
              <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-xl p-6 text-white">
                <p className="mb-4">
                  Para exercer seus direitos ou esclarecer dúvidas sobre esta política:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <strong>Email:</strong><br />
                    dotangola@gmail.com
                  </div>
                  <div>
                    <strong>WhatsApp:</strong><br />
                    +244 931 343 433
                  </div>
                  <div>
                    <strong>Instagram:</strong><br />
                    @dotangola
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-white/20">
                  <p className="text-sm">
                    <strong>Endereço:</strong> Loja Tec Yetu Solutions - Luanda, Cassenda, Rua 8
                  </p>
                </div>
              </div>
            </section>

            {/* Alterações na Política */}
            <div className="text-center pt-8 border-t border-gray-200">
              <div className="bg-blue-50 rounded-xl p-6">
                <h3 className="font-semibold text-gray-800 mb-2">Alterações nesta Política</h3>
                <p className="text-gray-600 text-sm">
                  Podemos atualizar esta política periodicamente. Notificaremos sobre mudanças significativas 
                  via email ou aviso em nosso site. A versão mais recente estará sempre disponível aqui.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default PrivacidadePage; 