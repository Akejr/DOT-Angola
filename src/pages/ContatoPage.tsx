import React, { useState } from 'react';
import { Mail, Phone, MapPin, MessageCircle, Clock, Send, CheckCircle, Instagram } from 'lucide-react';
import MainLayout from '@/components/MainLayout';
import { SEO } from '@/components/SEO';

const ContatoPage: React.FC = () => {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    assunto: '',
    mensagem: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handlePageChange = (id: number) => {
    console.log("Mudando para página:", id);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simular envio do formulário
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Criar mensagem para WhatsApp
    const message = `*Nova mensagem do site DOT ANGOLA*

*Nome:* ${formData.nome}
*Email:* ${formData.email}
*Telefone:* ${formData.telefone}
*Assunto:* ${formData.assunto}

*Mensagem:*
${formData.mensagem}`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/244931343433?text=${encodedMessage}`;
    
    // Abrir WhatsApp
    window.open(whatsappUrl, '_blank');

    setIsSubmitting(false);
    setIsSubmitted(true);

    // Reset form after 3 seconds
    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({
        nome: '',
        email: '',
        telefone: '',
        assunto: '',
        mensagem: ''
      });
    }, 3000);
  };

  const handleWhatsAppDirect = () => {
    const message = "Olá! Gostaria de saber mais sobre os serviços da DOT ANGOLA.";
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/244931343433?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <>
      <SEO 
        title="Contato"
        description="Entre em contato com a DOT ANGOLA. Estamos aqui para ajudar com suas dúvidas sobre tecnologia, cartões presente e cartões virtuais."
        type="website"
      />
      <MainLayout onPageChange={handlePageChange}>
        <div className="container mx-auto px-6 py-12">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <MessageCircle className="w-10 h-10 text-blue-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-800 mb-4">Entre em Contato</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Estamos aqui para ajudar! Entre em contato conosco através dos canais abaixo 
              ou visite nosso ponto de atendimento presencial.
            </p>
          </div>

          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Informações de Contato */}
              <div className="space-y-8">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">Nossos Canais</h2>
                  
                  {/* WhatsApp - Destaque */}
                  <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-6 text-white mb-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                        <MessageCircle className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold">WhatsApp</h3>
                        <p className="text-green-100">Canal preferencial - Resposta rápida</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-semibold">+244 931 343 433</span>
                      <button
                        onClick={handleWhatsAppDirect}
                        className="bg-white text-green-600 px-4 py-2 rounded-lg font-semibold hover:bg-green-50 transition-colors"
                      >
                        Conversar Agora
                      </button>
                    </div>
                  </div>

                  {/* Outros Contatos */}
                  <div className="space-y-4">
                    <div className="bg-white border border-gray-200 rounded-xl p-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <Mail className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-800">Email</h3>
                          <p className="text-gray-600">dotangola@gmail.com</p>
                          <p className="text-sm text-gray-500">Resposta em até 24 horas</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-xl p-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                          <Instagram className="w-6 h-6 text-purple-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-800">Instagram</h3>
                          <p className="text-gray-600">@dotangola</p>
                          <p className="text-sm text-gray-500">Siga-nos para novidades</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Localização */}
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">Ponto de Atendimento</h2>
                  <div className="bg-blue-50 rounded-2xl p-6">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                        <MapPin className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-800">Loja Tec Yetu Solutions</h3>
                        <p className="text-gray-600 mb-2">Luanda, Cassenda - Rua 8</p>
                        <p className="text-sm text-gray-500">
                          Embora sejamos uma loja 100% online, oferecemos este ponto 
                          para pagamentos presenciais e suporte.
                        </p>
                      </div>
                    </div>
                    
                    <div className="border-t border-blue-200 pt-4">
                      <div className="flex items-center gap-3 mb-2">
                        <Clock className="w-5 h-5 text-blue-600" />
                        <span className="font-semibold text-gray-800">Horários de Funcionamento</span>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p><strong>Segunda a Sexta:</strong> 8h às 17h</p>
                        <p><strong>Sábado:</strong> 8h às 13h</p>
                        <p><strong>Domingo:</strong> Fechado</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Informações Adicionais */}
                <div className="bg-gray-50 rounded-2xl p-6">
                  <h3 className="font-semibold text-gray-800 mb-4">Informações Importantes</h3>
                  <div className="space-y-3 text-sm text-gray-600">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Atendimento em português</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Suporte técnico especializado</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Orientação para ativação de produtos</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Esclarecimento de dúvidas sobre compras</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Formulário de Contato */}
              <div>
                <div className="bg-white border border-gray-200 rounded-2xl p-8">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">Envie uma Mensagem</h2>
                  
                  {isSubmitted ? (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="w-8 h-8 text-green-600" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-800 mb-2">Mensagem Enviada!</h3>
                      <p className="text-gray-600">
                        Sua mensagem foi enviada via WhatsApp. Nossa equipe entrará em contato em breve.
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-2">
                            Nome Completo *
                          </label>
                          <input
                            type="text"
                            id="nome"
                            name="nome"
                            value={formData.nome}
                            onChange={handleInputChange}
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            placeholder="Seu nome completo"
                          />
                        </div>
                        
                        <div>
                          <label htmlFor="telefone" className="block text-sm font-medium text-gray-700 mb-2">
                            Telefone (WhatsApp) *
                          </label>
                          <input
                            type="tel"
                            id="telefone"
                            name="telefone"
                            value={formData.telefone}
                            onChange={handleInputChange}
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            placeholder="+244 xxx xxx xxx"
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                          Email
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          placeholder="seu@email.com"
                        />
                      </div>

                      <div>
                        <label htmlFor="assunto" className="block text-sm font-medium text-gray-700 mb-2">
                          Assunto *
                        </label>
                        <select
                          id="assunto"
                          name="assunto"
                          value={formData.assunto}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        >
                          <option value="">Selecione um assunto</option>
                          <option value="Dúvidas sobre produtos">Dúvidas sobre produtos</option>
                          <option value="Suporte técnico">Suporte técnico</option>
                          <option value="Problemas com pedido">Problemas com pedido</option>
                          <option value="Sugestões">Sugestões</option>
                          <option value="Parcerias">Parcerias</option>
                          <option value="Outros">Outros</option>
                        </select>
                      </div>

                      <div>
                        <label htmlFor="mensagem" className="block text-sm font-medium text-gray-700 mb-2">
                          Mensagem *
                        </label>
                        <textarea
                          id="mensagem"
                          name="mensagem"
                          value={formData.mensagem}
                          onChange={handleInputChange}
                          required
                          rows={5}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                          placeholder="Descreva sua dúvida ou mensagem..."
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-3 px-6 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
                      >
                        {isSubmitting ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Enviando...
                          </>
                        ) : (
                          <>
                            <Send className="w-5 h-5" />
                            Enviar Mensagem
                          </>
                        )}
                      </button>

                      <p className="text-xs text-gray-500 text-center">
                        * Campos obrigatórios. Sua mensagem será enviada via WhatsApp.
                      </p>
                    </form>
                  )}
                </div>
              </div>
            </div>

            {/* FAQ Rápido */}
            <div className="mt-16">
              <h2 className="text-2xl font-bold text-gray-800 mb-8 text-center">Perguntas Frequentes</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h3 className="font-semibold text-gray-800 mb-3">Como recebo meu gift card?</h3>
                  <p className="text-gray-600 text-sm">
                    Após a confirmação do pagamento, você recebe o código instantaneamente 
                    via WhatsApp ou email, junto com instruções de uso.
                  </p>
                </div>
                
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h3 className="font-semibold text-gray-800 mb-3">Quais formas de pagamento?</h3>
                  <p className="text-gray-600 text-sm">
                    Aceitamos transferência bancária, pagamento via WhatsApp e 
                    pagamento presencial em nossa loja parceira.
                  </p>
                </div>
                
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h3 className="font-semibold text-gray-800 mb-3">Posso visitar a loja?</h3>
                  <p className="text-gray-600 text-sm">
                    Sim! Temos um ponto de atendimento na Loja Tec Yetu Solutions 
                    para pagamentos presenciais e suporte.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </MainLayout>
    </>
  );
};

export default ContatoPage; 