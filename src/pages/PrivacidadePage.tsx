import React from 'react';
import Header from "@/components/Header";
import Navigation from "@/components/Navigation";
import { Lock, Database, ShieldCheck, BookOpen, Eye, Server, AlertTriangle, Globe } from 'lucide-react';

export default function PrivacidadePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Navigation onPageChange={() => {}} />
      
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl p-8 shadow-sm mb-6">
          <div className="flex items-center gap-3 mb-6">
            <Lock className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-[#01042D]">Política de Privacidade</h1>
          </div>
          
          <p className="text-gray-500 mb-8">
            Última atualização: 15 de Janeiro de 2025
          </p>
          
          <div className="prose prose-blue max-w-none">
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-[#01042D] mb-3 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-600" />
                Introdução
              </h2>
              <p className="text-gray-600">
                A DOT Angola valoriza sua privacidade e está comprometida em proteger seus 
                dados pessoais. Esta Política de Privacidade descreve como coletamos, 
                usamos, processamos e compartilhamos suas informações quando você utiliza 
                nossos serviços, incluindo nosso website e a compra de gift cards e 
                cartões virtuais Visa.
              </p>
              <p className="text-gray-600 mt-2">
                Ao utilizar nossos serviços, você concorda com as práticas descritas nesta 
                política. Recomendamos que você leia este documento na íntegra para 
                compreender nossas práticas de privacidade.
              </p>
            </div>
            
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-[#01042D] mb-3 flex items-center gap-2">
                <Database className="w-5 h-5 text-blue-600" />
                Informações que Coletamos
              </h2>
              <p className="text-gray-600">
                Para fornecer nossos serviços, podemos coletar os seguintes tipos de informações:
              </p>
              
              <h3 className="text-lg font-medium text-gray-800 mt-4 mb-2">Informações de Registro</h3>
              <p className="text-gray-600">
                Quando você cria uma conta, coletamos seu nome, endereço de e-mail, número de 
                telefone, e outras informações necessárias para criar e gerenciar sua conta.
              </p>
              
              <h3 className="text-lg font-medium text-gray-800 mt-4 mb-2">Informações de Transação</h3>
              <p className="text-gray-600">
                Ao realizar compras, coletamos detalhes sobre suas transações, incluindo os 
                produtos adquiridos, valores, métodos de pagamento e endereços de faturamento.
              </p>
              
              <h3 className="text-lg font-medium text-gray-800 mt-4 mb-2">Informações de Uso</h3>
              <p className="text-gray-600">
                Coletamos informações sobre como você interage com nosso site, como páginas 
                visitadas, tempo gasto em cada página, padrões de cliques e outras estatísticas 
                de uso.
              </p>
              
              <h3 className="text-lg font-medium text-gray-800 mt-4 mb-2">Informações do Dispositivo</h3>
              <p className="text-gray-600">
                Podemos coletar informações sobre os dispositivos que você usa para acessar 
                nossos serviços, incluindo modelo de hardware, sistema operacional, 
                identificadores de dispositivo únicos e informações de rede.
              </p>
            </div>
            
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-[#01042D] mb-3 flex items-center gap-2">
                <Eye className="w-5 h-5 text-blue-600" />
                Como Usamos suas Informações
              </h2>
              <p className="text-gray-600">
                Utilizamos as informações coletadas para os seguintes fins:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-1 text-gray-600">
                <li>Fornecer, manter e melhorar nossos serviços</li>
                <li>Processar suas transações e enviar confirmações de compra</li>
                <li>Comunicar-nos com você sobre sua conta, produtos e promoções</li>
                <li>Personalizar sua experiência e oferecer conteúdo relevante</li>
                <li>Detectar, investigar e prevenir atividades fraudulentas</li>
                <li>Cumprir obrigações legais e resolver disputas</li>
              </ul>
            </div>
            
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-[#01042D] mb-3 flex items-center gap-2">
                <Server className="w-5 h-5 text-blue-600" />
                Compartilhamento de Informações
              </h2>
              <p className="text-gray-600">
                Podemos compartilhar suas informações com terceiros nas seguintes circunstâncias:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-1 text-gray-600">
                <li>
                  <strong>Prestadores de Serviços:</strong> Compartilhamos informações com 
                  empresas que nos auxiliam na operação, fornecimento e melhoria dos nossos 
                  serviços (processadores de pagamento, serviços de hospedagem, etc.).
                </li>
                <li>
                  <strong>Parceiros Comerciais:</strong> Para fornecer gift cards e cartões 
                  virtuais, podemos compartilhar informações com nossos parceiros comerciais.
                </li>
                <li>
                  <strong>Requisitos Legais:</strong> Podemos divulgar informações em resposta 
                  a intimações, ordens judiciais ou processos legais, ou para estabelecer ou 
                  exercer nossos direitos legais ou defesas contra reivindicações legais.
                </li>
                <li>
                  <strong>Segurança e Fraude:</strong> Podemos compartilhar informações para 
                  investigar, prevenir ou tomar medidas em relação a atividades ilegais, 
                  suspeitas de fraude ou situações que envolvam ameaças à segurança de 
                  qualquer pessoa.
                </li>
              </ul>
              <p className="text-gray-600 mt-3">
                Não vendemos, alugamos ou compartilhamos suas informações pessoais com 
                terceiros para fins de marketing direto sem o seu consentimento.
              </p>
            </div>
            
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-[#01042D] mb-3 flex items-center gap-2">
                <Globe className="w-5 h-5 text-blue-600" />
                Transferências Internacionais
              </h2>
              <p className="text-gray-600">
                Seus dados pessoais podem ser transferidos e processados em países fora de 
                Angola, onde as leis de proteção de dados podem ser diferentes. Nesses casos, 
                tomamos medidas para garantir que suas informações recebam um nível adequado 
                de proteção, incluindo a implementação de cláusulas contratuais padrão e outras 
                salvaguardas legalmente reconhecidas.
              </p>
            </div>
            
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-[#01042D] mb-3 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-blue-600" />
                Segurança de Dados
              </h2>
              <p className="text-gray-600">
                Implementamos medidas de segurança técnicas, administrativas e físicas para 
                proteger suas informações contra acesso não autorizado, perda, alteração ou 
                destruição. Estas medidas incluem:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-1 text-gray-600">
                <li>Criptografia de dados sensíveis em trânsito e em repouso</li>
                <li>Controles de acesso rigorosos para sistemas internos</li>
                <li>Monitoramento contínuo de nossos sistemas para detectar vulnerabilidades</li>
                <li>Treinamento regular de nossa equipe sobre práticas de segurança</li>
              </ul>
              <p className="text-gray-600 mt-3">
                Embora nos esforcemos para proteger suas informações, nenhum método de 
                transmissão pela Internet ou método de armazenamento eletrônico é 100% seguro. 
                Portanto, não podemos garantir sua segurança absoluta.
              </p>
            </div>
            
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-[#01042D] mb-3 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-blue-600" />
                Retenção de Dados
              </h2>
              <p className="text-gray-600">
                Retemos suas informações pessoais pelo tempo necessário para cumprir os 
                propósitos descritos nesta Política de Privacidade, a menos que um período 
                de retenção mais longo seja exigido ou permitido por lei. Os critérios 
                usados para determinar nossos períodos de retenção incluem:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-1 text-gray-600">
                <li>A duração do nosso relacionamento contínuo com você</li>
                <li>Nossa obrigação legal de manter certos dados por períodos determinados</li>
                <li>Períodos de limitação aplicáveis sob as leis relevantes</li>
              </ul>
            </div>
            
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-[#01042D] mb-3 flex items-center gap-2">
                <Lock className="w-5 h-5 text-blue-600" />
                Seus Direitos e Escolhas
              </h2>
              <p className="text-gray-600">
                Você tem certos direitos relacionados às suas informações pessoais, incluindo:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-1 text-gray-600">
                <li>
                  <strong>Acesso:</strong> Você pode solicitar acesso às suas informações 
                  pessoais que mantemos.
                </li>
                <li>
                  <strong>Correção:</strong> Você pode solicitar a correção de informações 
                  inexatas ou incompletas.
                </li>
                <li>
                  <strong>Exclusão:</strong> Em determinadas circunstâncias, você pode 
                  solicitar a exclusão de suas informações pessoais.
                </li>
                <li>
                  <strong>Restrição:</strong> Você pode solicitar a restrição do processamento 
                  de suas informações pessoais.
                </li>
                <li>
                  <strong>Oposição:</strong> Você pode se opor ao processamento de suas 
                  informações pessoais para certas finalidades.
                </li>
                <li>
                  <strong>Portabilidade:</strong> Você pode solicitar uma cópia de suas 
                  informações pessoais em formato eletrônico e o direito de transmitir essas 
                  informações para terceiros.
                </li>
              </ul>
              <p className="text-gray-600 mt-3">
                Para exercer esses direitos, entre em contato conosco usando as informações 
                fornecidas no final desta política. Observe que alguns desses direitos podem 
                estar sujeitos a limitações e exceções sob a lei aplicável.
              </p>
            </div>
            
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-[#01042D] mb-3 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-600" />
                Alterações nesta Política
              </h2>
              <p className="text-gray-600">
                Podemos atualizar esta Política de Privacidade periodicamente para refletir 
                mudanças em nossas práticas ou por outros motivos operacionais, legais ou 
                regulatórios. Notificaremos você sobre quaisquer alterações materiais a esta 
                política publicando a nova política em nosso site e, quando apropriado, 
                enviando um aviso direto a você.
              </p>
              <p className="text-gray-600 mt-2">
                Recomendamos que você revise esta política regularmente para se manter 
                informado sobre como estamos protegendo suas informações.
              </p>
            </div>
            
            <div>
              <h2 className="text-xl font-semibold text-[#01042D] mb-3 flex items-center gap-2">
                <Database className="w-5 h-5 text-blue-600" />
                Contato
              </h2>
              <p className="text-gray-600">
                Se você tiver dúvidas, preocupações ou solicitações relacionadas a esta 
                Política de Privacidade ou ao processamento de suas informações pessoais, 
                entre em contato conosco:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-1 text-gray-600">
                <li>Por e-mail: privacidade@dotangola.com</li>
                <li>Por telefone: +244 931 343 433</li>
                <li>Através de nosso formulário de contato em nosso site</li>
              </ul>
              <p className="text-gray-600 mt-3">
                Nos esforçamos para responder a todas as solicitações dentro de 30 dias.
              </p>
            </div>
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="bg-gray-50 p-6 border-t mt-10">
        <div className="flex flex-col md:flex-row justify-between items-center max-w-4xl mx-auto">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            <img 
              src="/images/sczs.png" 
              alt="Logo" 
              width={32} 
              height={32}
              className="h-8 w-auto"
            />
          </div>
          
          <div className="flex flex-wrap justify-center gap-6">
            <a href="/sobre" className="text-sm text-gray-500 hover:text-blue-600 transition-colors duration-300">Sobre Nós</a>
            <a href="/termos" className="text-sm text-gray-500 hover:text-blue-600 transition-colors duration-300">Termos e Condições</a>
            <a href="/privacidade" className="text-sm text-gray-500 hover:text-blue-600 transition-colors duration-300">Política de Privacidade</a>
            <a href="/contato" className="text-sm text-gray-500 hover:text-blue-600 transition-colors duration-300">Contato</a>
          </div>
          
          <div className="mt-4 md:mt-0">
            <p className="text-sm text-gray-500">© 2025. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
} 