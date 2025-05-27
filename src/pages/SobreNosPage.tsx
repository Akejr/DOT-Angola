import React from 'react';
import { Users, Target, Award, MapPin, Clock, Shield } from 'lucide-react';
import MainLayout from '@/components/MainLayout';

const SobreNosPage: React.FC = () => {
  const handlePageChange = (id: number) => {
    console.log("Mudando para página:", id);
  };

  const seoProps = {
    title: 'Sobre Nós | DOT ANGOLA',
    description: 'Conheça a DOT ANGOLA, sua loja online de confiança para gift cards e cartões virtuais em Angola. Saiba mais sobre nossa missão e valores.',
    type: 'website'
  };

  return (
    <MainLayout seoProps={seoProps} onPageChange={handlePageChange}>
      <div className="container mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Users className="w-10 h-10 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Sobre a DOT ANGOLA</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Somos uma loja 100% online especializada em gift cards e cartões virtuais, 
            oferecendo soluções digitais modernas e seguras para Angola.
          </p>
        </div>

        {/* Nossa História */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Nossa História</h2>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <p>
                A DOT ANGOLA nasceu da necessidade de democratizar o acesso a gift cards e 
                cartões virtuais em Angola, oferecendo uma experiência de compra moderna, 
                segura e conveniente.
              </p>
              <p>
                Como uma loja 100% online, revolucionamos a forma como os angolanos 
                acessam produtos digitais, eliminando barreiras geográficas e oferecendo 
                preços competitivos com a melhor experiência do usuário.
              </p>
              <p>
                Nossa missão é conectar Angola ao mundo digital, proporcionando acesso 
                fácil e seguro aos melhores serviços e plataformas internacionais.
              </p>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">Nossos Valores</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Shield className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-gray-800">Segurança</h4>
                  <p className="text-gray-600 text-sm">Proteção total dos seus dados e transações</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Target className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-gray-800">Excelência</h4>
                  <p className="text-gray-600 text-sm">Qualidade superior em produtos e atendimento</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-gray-800">Agilidade</h4>
                  <p className="text-gray-600 text-sm">Entrega rápida e eficiente dos seus produtos</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Localização e Atendimento */}
        <div className="bg-gray-50 rounded-2xl p-8 mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                <MapPin className="w-6 h-6 text-blue-600" />
                Ponto de Pagamento Presencial
              </h3>
              <div className="space-y-4">
                <p className="text-gray-600">
                  Embora sejamos uma loja 100% online, oferecemos um ponto de pagamento 
                  presencial para sua conveniência:
                </p>
                <div className="bg-white rounded-lg p-4 border-l-4 border-blue-600">
                  <h4 className="font-semibold text-gray-800 mb-2">Loja Tec Yetu Solutions</h4>
                  <p className="text-gray-600">
                    <strong>Endereço:</strong> Luanda, Cassenda - Rua 8<br />
                    <strong>Horário:</strong> Segunda a Sexta, 8h às 17h<br />
                    <strong>Sábado:</strong> 8h às 13h
                  </p>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-2xl font-bold text-gray-800 mb-6">Por que Escolher a DOT?</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Award className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-800">Produtos Originais</h4>
                    <p className="text-gray-600 text-sm">Todos os nossos gift cards são 100% originais e verificados</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-800">Entrega Imediata</h4>
                    <p className="text-gray-600 text-sm">Receba seus códigos instantaneamente após a confirmação do pagamento</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Shield className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-800">Suporte Dedicado</h4>
                    <p className="text-gray-600 text-sm">Atendimento especializado via WhatsApp e presencial</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">100%</div>
            <div className="text-gray-600 text-sm">Online</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">24/7</div>
            <div className="text-gray-600 text-sm">Disponível</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">100+</div>
            <div className="text-gray-600 text-sm">Produtos</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">1000+</div>
            <div className="text-gray-600 text-sm">Clientes Satisfeitos</div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white">
          <h3 className="text-2xl font-bold mb-4">Pronto para começar?</h3>
          <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
            Explore nossa seleção de gift cards e cartões virtuais. 
            Compre online com segurança e receba instantaneamente.
          </p>
          <a 
            href="/" 
            className="inline-block bg-white text-blue-600 font-semibold px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Ver Produtos
          </a>
        </div>
      </div>
    </MainLayout>
  );
};

export default SobreNosPage; 