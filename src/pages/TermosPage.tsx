import React from 'react';
import Header from "@/components/Header";
import Navigation from "@/components/Navigation";
import { Shield, AlertTriangle, Award, Eye, Book, FileText, LockKeyhole, Scale } from 'lucide-react';

export default function TermosPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Navigation onPageChange={() => {}} />
      
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl p-8 shadow-sm mb-6">
          <div className="flex items-center gap-3 mb-6">
            <FileText className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-[#01042D]">Termos e Condições</h1>
          </div>
          
          <p className="text-gray-500 mb-8">
            Última atualização: 15 de Janeiro de 2025
          </p>
          
          <div className="prose prose-blue max-w-none">
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-[#01042D] mb-3 flex items-center gap-2">
                <Book className="w-5 h-5 text-blue-600" />
                Introdução
              </h2>
              <p className="text-gray-600">
                Bem-vindo a DOT Angola. Estes Termos e Condições regem seu uso de nosso website 
                localizado em dotangola.com e quaisquer serviços relacionados, incluindo a 
                compra de gift cards internacionais e cartões virtuais Visa.
              </p>
              <p className="text-gray-600 mt-2">
                Ao acessar ou usar nosso serviço, você concorda com estes Termos e Condições. 
                Se você não concordar com qualquer parte destes termos, você não terá permissão para 
                acessar o serviço.
              </p>
            </div>
            
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-[#01042D] mb-3 flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-600" />
                Contas e Registro
              </h2>
              <p className="text-gray-600">
                Ao se registrar em nosso site, você afirma que é maior de 18 anos ou que possui 
                autorização de um responsável legal. Você é responsável por manter sua senha 
                em segurança e por todas as atividades realizadas com sua conta.
              </p>
              <p className="text-gray-600 mt-2">
                Você deve notificar-nos imediatamente se tomar conhecimento de qualquer 
                violação de segurança ou uso não autorizado de sua conta. Não seremos 
                responsáveis por perdas resultantes do uso não autorizado de sua conta.
              </p>
            </div>
            
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-[#01042D] mb-3 flex items-center gap-2">
                <Scale className="w-5 h-5 text-blue-600" />
                Compras e Produtos
              </h2>
              <p className="text-gray-600">
                Todos os produtos e serviços estão sujeitos à disponibilidade. Nos reservamos 
                o direito de limitar a quantidade de produtos vendidos e alterar os preços a 
                qualquer momento. Todas as descrições de produtos e preços estão sujeitos a 
                alterações a qualquer momento sem aviso prévio.
              </p>
              <h3 className="text-lg font-medium text-gray-800 mt-4 mb-2">Gift Cards Internacionais</h3>
              <p className="text-gray-600">
                Os gift cards são válidos apenas para uso nas plataformas ou lojas 
                especificadas e podem estar sujeitos a termos adicionais impostos pelo 
                fornecedor do gift card. Não nos responsabilizamos pela impossibilidade de 
                uso do gift card devido a restrições regionais ou bloqueios geográficos.
              </p>
              <h3 className="text-lg font-medium text-gray-800 mt-4 mb-2">Cartões Virtuais Visa</h3>
              <p className="text-gray-600">
                Os cartões virtuais Visa são destinados para uma única utilização e estão 
                sujeitos às condições impostas pelo emissor do cartão. Após a compra e 
                revelação dos dados do cartão, não oferecemos reembolsos para transações 
                já concluídas. A DOT Angola não se responsabiliza por quaisquer problemas 
                relacionados ao uso do cartão em sites que não aceitam pagamentos 
                com cartões virtuais ou internacionais.
              </p>
            </div>
            
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-[#01042D] mb-3 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-blue-600" />
                Limitação de Responsabilidade
              </h2>
              <p className="text-gray-600">
                Em nenhum caso a DOT Angola, seus diretores, funcionários, parceiros, agentes, 
                fornecedores ou afiliados serão responsáveis por quaisquer danos indiretos, 
                incidentais, especiais, consequenciais ou punitivos, incluindo, sem limitação, 
                perda de lucros, dados, uso, boa vontade ou outras perdas intangíveis, 
                resultantes de:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-1 text-gray-600">
                <li>Seu acesso ou uso ou incapacidade de acessar ou usar o serviço;</li>
                <li>Qualquer conduta ou conteúdo de terceiros no serviço;</li>
                <li>
                  Conteúdo obtido do serviço; e
                </li>
                <li>
                  Acesso não autorizado, uso ou alteração de suas transmissões ou conteúdo.
                </li>
              </ul>
            </div>
            
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-[#01042D] mb-3 flex items-center gap-2">
                <LockKeyhole className="w-5 h-5 text-blue-600" />
                Propriedade Intelectual
              </h2>
              <p className="text-gray-600">
                O serviço e todo o conteúdo, recursos e funcionalidades contidos nele são de 
                propriedade da DOT Angola, seus licenciadores ou outros fornecedores desse 
                material e são protegidos por direitos autorais, marcas registradas, patentes, 
                segredos comerciais e outras leis de propriedade intelectual ou direitos de 
                propriedade.
              </p>
              <p className="text-gray-600 mt-2">
                Nosso nome, logotipo e todos os nomes, logotipos, nomes de produtos e serviços 
                relacionados, designs e slogans são marcas registradas da DOT Angola ou de 
                seus afiliados ou licenciadores. Você não deve usar tais marcas sem a prévia 
                permissão por escrito da DOT Angola.
              </p>
            </div>
            
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-[#01042D] mb-3 flex items-center gap-2">
                <Award className="w-5 h-5 text-blue-600" />
                Garantias e Devoluções
              </h2>
              <p className="text-gray-600">
                Devido à natureza digital de nossos produtos, não oferecemos reembolsos após 
                a entrega dos códigos dos gift cards ou dos dados dos cartões virtuais, exceto 
                nos casos específicos em que o produto não funcione por falha comprovada do 
                fornecedor.
              </p>
              <p className="text-gray-600 mt-2">
                Para processar uma solicitação de reembolso em situações excepcionais, você 
                deve entrar em contato conosco em até 24 horas após a compra e fornecer 
                detalhes completos sobre a questão. Cada caso será avaliado individualmente.
              </p>
            </div>
            
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-[#01042D] mb-3 flex items-center gap-2">
                <Eye className="w-5 h-5 text-blue-600" />
                Monitoramento e Conformidade Legal
              </h2>
              <p className="text-gray-600">
                A DOT Angola reserva-se o direito de monitorar transações para prevenir 
                fraudes e garantir o cumprimento das leis aplicáveis. Reservamo-nos o direito 
                de recusar serviços, encerrar contas ou cancelar pedidos a nosso critério, 
                inclusive se acreditarmos que as ações do cliente violam as leis aplicáveis 
                ou são prejudiciais a terceiros.
              </p>
              <p className="text-gray-600 mt-2">
                Você concorda em não utilizar nossos produtos e serviços para fins ilegais ou 
                não autorizados, incluindo, mas não se limitando a, lavagem de dinheiro, 
                financiamento de terrorismo ou qualquer atividade que viole sanções econômicas 
                internacionais.
              </p>
            </div>
            
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-[#01042D] mb-3 flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-600" />
                Alterações aos Termos
              </h2>
              <p className="text-gray-600">
                Reservamo-nos o direito, a nosso critério exclusivo, de modificar ou substituir 
                estes Termos a qualquer momento. Se uma revisão for material, tentaremos fornecer 
                um aviso com pelo menos 30 dias de antecedência antes que quaisquer novos termos 
                entrem em vigor.
              </p>
              <p className="text-gray-600 mt-2">
                O que constitui uma alteração material será determinado a nosso critério exclusivo. 
                Ao continuar a acessar ou usar nosso serviço após essas revisões se tornarem 
                efetivas, você concorda em obedecer aos termos revisados.
              </p>
            </div>
            
            <div>
              <h2 className="text-xl font-semibold text-[#01042D] mb-3 flex items-center gap-2">
                <Book className="w-5 h-5 text-blue-600" />
                Contato
              </h2>
              <p className="text-gray-600">
                Se você tiver dúvidas sobre estes Termos e Condições, entre em contato conosco:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-1 text-gray-600">
                <li>Por e-mail: termos@dotangola.com</li>
                <li>Por telefone: +244 931 343 433</li>
                <li>Através de nosso formulário de contato em nosso site</li>
              </ul>
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