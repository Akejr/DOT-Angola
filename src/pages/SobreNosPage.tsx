import React from 'react';
import Header from "@/components/Header";
import Navigation from "@/components/Navigation";

export default function SobreNosPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Navigation onPageChange={() => {}} />
      
      <main className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-[#01042D] mb-8">Sobre Nós</h1>
        
        <div className="bg-white rounded-2xl p-8 shadow-sm space-y-8">
          <section>
            <h2 className="text-xl font-semibold text-[#01042D] mb-4">Quem Somos</h2>
            <p className="text-gray-600">
              A DOT Angola é uma empresa líder no setor de soluções digitais em Angola, 
              especializada na comercialização de gift cards internacionais e serviços 
              financeiros digitais. Fundada em 2023, nossa missão é conectar os angolanos 
              ao mundo digital global, oferecendo acesso fácil e seguro a produtos e serviços 
              internacionais.
            </p>
          </section>

          <section className="flex flex-col md:flex-row gap-8 items-center">
            <div className="w-full md:w-1/2">
              <h2 className="text-xl font-semibold text-[#01042D] mb-4">Nossa Visão</h2>
              <p className="text-gray-600">
                Buscamos ser a principal ponte entre Angola e o mercado digital global. 
                Queremos democratizar o acesso a serviços digitais internacionais, 
                impulsionando a inclusão digital e proporcionando aos angolanos as 
                mesmas oportunidades disponíveis em mercados mais desenvolvidos.
              </p>
              <div className="mt-4 flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                  <span className="text-gray-700">Facilitar transações internacionais</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                  <span className="text-gray-700">Promover a inclusão digital</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                  <span className="text-gray-700">Oferecer soluções seguras e confiáveis</span>
                </div>
              </div>
            </div>
            <div className="w-full md:w-1/2 bg-gradient-to-br from-[#01042D] to-[#0A1F7E] rounded-xl p-6 text-white">
              <h3 className="text-lg font-medium mb-3">Nossos valores</h3>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <span className="bg-white w-5 h-5 rounded-full flex items-center justify-center text-[#01042D] flex-shrink-0 mt-0.5">1</span>
                  <p><span className="font-medium">Integridade:</span> Nosso compromisso com práticas comerciais éticas e transparentes.</p>
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-white w-5 h-5 rounded-full flex items-center justify-center text-[#01042D] flex-shrink-0 mt-0.5">2</span>
                  <p><span className="font-medium">Inovação:</span> Buscamos constantemente novas soluções tecnológicas.</p>
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-white w-5 h-5 rounded-full flex items-center justify-center text-[#01042D] flex-shrink-0 mt-0.5">3</span>
                  <p><span className="font-medium">Excelência:</span> Comprometidos em oferecer o melhor serviço possível.</p>
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-white w-5 h-5 rounded-full flex items-center justify-center text-[#01042D] flex-shrink-0 mt-0.5">4</span>
                  <p><span className="font-medium">Acessibilidade:</span> Tornamos o mercado global acessível para todos.</p>
                </li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#01042D] mb-4">Nossos Serviços</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-4 rounded-xl">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                  </svg>
                </div>
                <h3 className="font-medium text-gray-800 mb-2">Gift Cards Internacionais</h3>
                <p className="text-sm text-gray-600">
                  Oferecemos uma ampla variedade de gift cards para as principais plataformas e 
                  serviços internacionais, incluindo Netflix, Spotify, Amazon, Google Play, 
                  iTunes, Xbox, PlayStation e muito mais.
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-xl">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
                <h3 className="font-medium text-gray-800 mb-2">Cartões Virtuais Visa</h3>
                <p className="text-sm text-gray-600">
                  Nossos cartões virtuais permitem realizar compras em sites internacionais 
                  com segurança e praticidade, mesmo sem ter um cartão de crédito internacional físico.
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-xl">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg>
                </div>
                <h3 className="font-medium text-gray-800 mb-2">Serviços de Importação</h3>
                <p className="text-sm text-gray-600">
                  Em breve, facilitaremos a importação de produtos internacionais 
                  com um processo simplificado e acessível para nossos clientes.
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-xl">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="font-medium text-gray-800 mb-2">Câmbio Digital</h3>
                <p className="text-sm text-gray-600">
                  Oferecemos taxas competitivas para a conversão de Kwanzas em moedas 
                  digitais para uso em plataformas internacionais.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#01042D] mb-4">Nossa Equipe</h2>
            <p className="text-gray-600 mb-4">
              Contamos com uma equipe de profissionais especializados em tecnologia, 
              finanças e atendimento ao cliente, todos comprometidos em oferecer a 
              melhor experiência possível para nossos clientes.
            </p>
            <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
              <p className="text-blue-700 italic">
                "Estamos empenhados em construir pontes digitais entre Angola e o resto do mundo, 
                facilitando o acesso a serviços e produtos que melhoram a qualidade de vida dos 
                nossos clientes."
              </p>
              <p className="text-sm text-blue-900 font-medium mt-2">— Equipe DOT Angola</p>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 p-6 border-t">
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