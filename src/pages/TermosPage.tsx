import React from 'react';
import { FileText, Shield, AlertCircle, CheckCircle, Clock, CreditCard } from 'lucide-react';
import MainLayout from '@/components/MainLayout';

const TermosPage: React.FC = () => {
  const handlePageChange = (id: number) => {
    console.log("Mudando para página:", id);
  };

  const seoProps = {
    title: 'Termos e Condições | DOT ANGOLA',
    description: 'Leia nossos termos e condições de uso dos serviços de tecnologia, cartões presente e cartões virtuais na DOT ANGOLA.',
    type: 'website'
  };

  return (
    <MainLayout seoProps={seoProps} onPageChange={handlePageChange}>
      <div className="container mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <FileText className="w-10 h-10 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Termos e Condições</h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Última atualização: Janeiro de 2025
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Introdução */}
          <div className="bg-blue-50 rounded-2xl p-8 mb-8">
            <div className="flex items-start gap-4">
              <AlertCircle className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-3">Importante</h2>
                <p className="text-gray-700 leading-relaxed">
                  Ao utilizar os serviços da DOT ANGOLA, você concorda com estes termos e condições. 
                  Recomendamos que leia atentamente antes de fazer qualquer compra.
                </p>
              </div>
            </div>
          </div>

          {/* Seções dos Termos */}
          <div className="space-y-8">
            {/* 1. Definições */}
            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-blue-600" />
                1. Definições
              </h2>
              <div className="bg-gray-50 rounded-xl p-6">
                <ul className="space-y-3 text-gray-700">
                  <li><strong>"DOT ANGOLA"</strong> refere-se à nossa empresa e plataforma online</li>
                  <li><strong>"Usuário"</strong> refere-se a qualquer pessoa que acesse nossos serviços</li>
                  <li><strong>"Gift Cards"</strong> são cartões presente digitais oferecidos em nossa plataforma</li>
                  <li><strong>"Cartões Virtuais"</strong> são cartões de pagamento digitais temporários</li>
                  <li><strong>"Serviços"</strong> incluem todos os produtos e funcionalidades oferecidos</li>
                </ul>
              </div>
            </section>

            {/* 2. Aceitação dos Termos */}
            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-3">
                <Shield className="w-6 h-6 text-blue-600" />
                2. Aceitação dos Termos
              </h2>
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-700 leading-relaxed mb-4">
                  Ao acessar e usar a plataforma DOT ANGOLA, você automaticamente aceita e concorda 
                  em cumprir estes termos e condições, bem como nossa Política de Privacidade.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  Se você não concordar com qualquer parte destes termos, não deve usar nossos serviços.
                </p>
              </div>
            </section>

            {/* 3. Produtos e Serviços */}
            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-3">
                <CreditCard className="w-6 h-6 text-blue-600" />
                3. Produtos e Serviços
              </h2>
              <div className="space-y-4">
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h3 className="font-semibold text-gray-800 mb-3">Gift Cards</h3>
                  <ul className="space-y-2 text-gray-700 text-sm">
                    <li>• Todos os gift cards são produtos digitais originais</li>
                    <li>• Códigos são entregues instantaneamente após confirmação do pagamento</li>
                    <li>• Validade e termos específicos variam por produto</li>
                    <li>• Não oferecemos reembolso após entrega do código</li>
                  </ul>
                </div>
                
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h3 className="font-semibold text-gray-800 mb-3">Cartões Virtuais</h3>
                  <ul className="space-y-2 text-gray-700 text-sm">
                    <li>• Cartões temporários para compras online seguras</li>
                    <li>• Ativação imediata após confirmação do pagamento</li>
                    <li>• Sujeitos a limites e restrições específicas</li>
                    <li>• Válidos conforme especificado no momento da compra</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* 4. Pagamentos */}
            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-3">
                <Clock className="w-6 h-6 text-blue-600" />
                4. Pagamentos e Preços
              </h2>
              <div className="bg-gray-50 rounded-xl p-6">
                <div className="space-y-4 text-gray-700">
                  <p>
                    <strong>Métodos de Pagamento:</strong> Aceitamos pagamentos via WhatsApp, 
                    transferência bancária e pagamento presencial em nossa loja parceira.
                  </p>
                  <p>
                    <strong>Preços:</strong> Todos os preços são exibidos em Kwanzas (Kz) e 
                    incluem todas as taxas aplicáveis.
                  </p>
                  <p>
                    <strong>Confirmação:</strong> Produtos são entregues apenas após confirmação 
                    total do pagamento.
                  </p>
                  <p>
                    <strong>Ponto Presencial:</strong> Loja Tec Yetu Solutions - Luanda, 
                    Cassenda, Rua 8.
                  </p>
                </div>
              </div>
            </section>

            {/* 5. Entrega */}
            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">5. Entrega e Ativação</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-green-50 rounded-xl p-6">
                  <h3 className="font-semibold text-green-800 mb-3">Entrega Digital</h3>
                  <ul className="space-y-2 text-green-700 text-sm">
                    <li>• Códigos enviados via WhatsApp ou email</li>
                    <li>• Entrega imediata após confirmação</li>
                    <li>• Instruções de uso incluídas</li>
                    <li>• Suporte para ativação disponível</li>
                  </ul>
                </div>
                
                <div className="bg-blue-50 rounded-xl p-6">
                  <h3 className="font-semibold text-blue-800 mb-3">Ativação Manual</h3>
                  <ul className="space-y-2 text-blue-700 text-sm">
                    <li>• Ativação realizada pela nossa equipe</li>
                    <li>• Processo em até 24 horas</li>
                    <li>• Notificação de conclusão enviada</li>
                    <li>• Acompanhamento via WhatsApp</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* 6. Responsabilidades */}
            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">6. Responsabilidades</h2>
              <div className="space-y-4">
                <div className="border-l-4 border-blue-600 bg-blue-50 p-4">
                  <h3 className="font-semibold text-gray-800 mb-2">Da DOT ANGOLA</h3>
                  <ul className="space-y-1 text-gray-700 text-sm">
                    <li>• Fornecer produtos originais e funcionais</li>
                    <li>• Entregar códigos após confirmação do pagamento</li>
                    <li>• Oferecer suporte técnico adequado</li>
                    <li>• Manter a segurança das transações</li>
                  </ul>
                </div>
                
                <div className="border-l-4 border-orange-600 bg-orange-50 p-4">
                  <h3 className="font-semibold text-gray-800 mb-2">Do Usuário</h3>
                  <ul className="space-y-1 text-gray-700 text-sm">
                    <li>• Fornecer informações corretas e atualizadas</li>
                    <li>• Usar produtos conforme termos específicos</li>
                    <li>• Não compartilhar códigos antes do uso</li>
                    <li>• Comunicar problemas em tempo hábil</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* 7. Limitações */}
            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">7. Limitações e Restrições</h2>
              <div className="bg-red-50 rounded-xl p-6">
                <ul className="space-y-3 text-gray-700">
                  <li>• Não oferecemos reembolso após entrega de códigos digitais</li>
                  <li>• Produtos sujeitos à disponibilidade de estoque</li>
                  <li>• Alguns gift cards podem ter restrições geográficas</li>
                  <li>• Limites de compra podem ser aplicados por segurança</li>
                  <li>• Reservamo-nos o direito de cancelar pedidos suspeitos</li>
                </ul>
              </div>
            </section>

            {/* 8. Contato */}
            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">8. Contato e Suporte</h2>
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 text-white">
                <p className="mb-4">
                  Para dúvidas sobre estes termos ou nossos serviços, entre em contato:
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
              </div>
            </section>

            {/* Data de Atualização */}
            <div className="text-center pt-8 border-t border-gray-200">
              <p className="text-gray-500 text-sm">
                Estes termos podem ser atualizados periodicamente. 
                A versão mais recente estará sempre disponível em nosso site.
              </p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default TermosPage; 