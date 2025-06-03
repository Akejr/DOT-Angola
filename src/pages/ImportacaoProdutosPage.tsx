import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, AlertTriangle, Check, Info, Package, Clock, Shield, ChevronLeft, ChevronRight, Image, Link2, MapPin, CalendarClock, FileText, User, Send, X } from 'lucide-react';
import Header from '@/components/Header';
import Navigation from '@/components/Navigation';
import { SEO } from '@/components/SEO';
import { supabase } from '@/lib/supabase';
import { notifyNewImportRequest } from '@/lib/notifications';

export default function ImportacaoProdutosPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPage, setSelectedPage] = useState(1);
  const [activeStep, setActiveStep] = useState(1);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);
  const sliderRef = useRef<HTMLDivElement>(null);
  const [formData, setFormData] = useState({
    productName: '',
    hasLink: null as boolean | null,
    productLink: '',
    hasImages: null as boolean | null,
    images: [] as File[],
    urgencyLevel: '' as '' | 'urgent' | 'not-urgent',
    termsAccepted: false,
    fullName: '',
    email: '',
    phone: '',
    address: '',
    province: 'Luanda',
  });
  
  // Array com as imagens do slider
  const sliderImages = [
    '/import produtos/img1.png',
    '/import produtos/img2.png',
    '/import produtos/img3.png',
    '/import produtos/img4.png',
    '/import produtos/img5.png',
  ];
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Efeito para o auto-play do slider
  useEffect(() => {
    if (isAutoPlaying) {
      autoPlayRef.current = setInterval(() => {
        setCurrentSlide(prev => (prev === sliderImages.length - 1 ? 0 : prev + 1));
      }, 4000);
    }
    
    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    };
  }, [isAutoPlaying, sliderImages.length]);
  
  // Função para mudar o slide
  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };
  
  // Função para ir para o próximo slide
  const nextSlide = () => {
    setCurrentSlide(prev => (prev === sliderImages.length - 1 ? 0 : prev + 1));
  };
  
  // Função para ir para o slide anterior
  const prevSlide = () => {
    setCurrentSlide(prev => (prev === 0 ? sliderImages.length - 1 : prev - 1));
  };
  
  // Pausar o auto-play quando o mouse está sobre o slider
  const handleMouseEnter = () => {
    setIsAutoPlaying(false);
  };
  
  // Retomar o auto-play quando o mouse sai do slider
  const handleMouseLeave = () => {
    setIsAutoPlaying(true);
  };

  const handlePageChange = (id: number) => {
    setSelectedPage(id);
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...filesArray]
      }));
    }
  };

  const handleRemoveImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleOpenFileDialog = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const validateCurrentStep = (): boolean => {
    switch (activeStep) {
      case 1:
        if (!formData.productName) {
          setError('Por favor, insira o nome do produto.');
          return false;
        }
        return true;
      case 2:
        if (formData.hasLink === null) {
          setError('Por favor, selecione se o produto tem link.');
          return false;
        }
        if (formData.hasLink && !formData.productLink) {
          setError('Por favor, insira o link do produto.');
          return false;
        }
        return true;
      case 3:
        if (formData.hasImages === null) {
          setError('Por favor, selecione se o produto tem imagens.');
          return false;
        }
        if (formData.hasImages && formData.images.length === 0) {
          setError('Por favor, adicione pelo menos uma imagem do produto.');
          return false;
        }
        return true;
      case 4:
        if (!formData.urgencyLevel) {
          setError('Por favor, selecione o nível de urgência.');
          return false;
        }
        return true;
      case 5:
        if (!formData.termsAccepted) {
          setError('Por favor, aceite os termos e condições.');
          return false;
        }
        return true;
      case 6:
        if (!formData.fullName) {
          setError('Por favor, insira seu nome completo.');
          return false;
        }
        if (!formData.email) {
          setError('Por favor, insira seu e-mail.');
          return false;
        }
        if (!formData.phone) {
          setError('Por favor, insira seu telefone.');
          return false;
        }
        if (!formData.address) {
          setError('Por favor, insira seu endereço.');
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (activeStep === 6) {
      return; // Não permitir avançar além do último passo
    }

    if (!validateCurrentStep()) {
      setError('Por favor, preencha todos os campos obrigatórios.');
      setTimeout(() => setError(null), 3000);
      return;
    }

    setActiveStep(prev => Math.min(6, prev + 1));
    setError(null);
  };

  const handleBack = () => {
    setActiveStep(prev => Math.max(1, prev - 1));
    setError(null);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const filesArray = Array.from(e.dataTransfer.files);
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...filesArray]
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateCurrentStep()) {
      setError('Por favor, preencha todos os campos obrigatórios.');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Upload das imagens para o Supabase Storage
      let imageUrls: string[] = [];
      if (formData.hasImages && formData.images.length > 0) {
        for (const image of formData.images) {
          const fileExt = image.name.split('.').pop();
          const fileName = `${Math.random()}.${fileExt}`;
          const filePath = `import_requests/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from('import_requests')
            .upload(filePath, image);

          if (uploadError) throw uploadError;

          const { data: { publicUrl } } = supabase.storage
            .from('import_requests')
            .getPublicUrl(filePath);

          imageUrls.push(publicUrl);
        }
      }

      // Inserir os dados no Supabase
      const { data: insertData, error: insertError } = await supabase
        .from('import_requests')
        .insert({
          product_name: formData.productName,
          has_link: formData.hasLink,
          product_link: formData.productLink,
          has_images: formData.hasImages,
          images: imageUrls,
          urgency_level: formData.urgencyLevel,
          terms_accepted: formData.termsAccepted,
          full_name: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          province: formData.province,
          status: 'pending',
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // Criar notificação automática para o admin
      try {
        await notifyNewImportRequest({
          product_name: formData.productName,
          full_name: formData.fullName,
          urgency_level: formData.urgencyLevel as 'urgent' | 'not-urgent'
        });
      } catch (notificationError) {
        // Log do erro mas não interrompe o fluxo principal
        console.warn('Erro ao criar notificação automática:', notificationError);
      }
      
      setSuccess(true);
      // Resetar o formulário
      setFormData({
        productName: '',
        hasLink: null,
        productLink: '',
        hasImages: null,
        images: [],
        urgencyLevel: '',
        termsAccepted: false,
        fullName: '',
        email: '',
        phone: '',
        address: '',
        province: 'Luanda',
      });
      
    } catch (err) {
      console.error('Erro ao enviar pedido:', err);
      setError('Ocorreu um erro ao enviar o formulário. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // Adicionar função para lidar com o evento de tecla pressionada
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleNext();
    }
  };

  const renderStepIndicator = () => {
    const steps = [
      { id: 1, title: 'Produto', icon: <Package className="w-4 h-4" /> },
      { id: 2, title: 'Link', icon: <Link2 className="w-4 h-4" /> },
      { id: 3, title: 'Imagens', icon: <Image className="w-4 h-4" /> },
      { id: 4, title: 'Urgência', icon: <CalendarClock className="w-4 h-4" /> },
      { id: 5, title: 'Termos', icon: <FileText className="w-4 h-4" /> },
      { id: 6, title: 'Dados', icon: <User className="w-4 h-4" /> },
    ];
    
    return (
      <div className="mb-8">
        <div className="hidden md:flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className="flex flex-col items-center">
                <div 
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                    step.id === activeStep 
                      ? 'bg-[#01042D] text-white shadow-lg shadow-[#01042D]/20' 
                      : step.id < activeStep 
                        ? 'bg-[#01042D]/10 text-[#01042D] border border-[#01042D]/30' 
                        : 'bg-gray-100 text-gray-400 border border-gray-200'
                  }`}
                >
                  {step.id < activeStep ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    step.icon
                  )}
            </div>
                <span className={`text-xs mt-2 font-medium ${
                  step.id === activeStep 
                    ? 'text-[#01042D]' 
                    : step.id < activeStep 
                      ? 'text-[#01042D]/70' 
                      : 'text-gray-400'
                }`}>
                  {step.title}
                </span>
              </div>
              
              {index < steps.length - 1 && (
                <div 
                  className={`h-0.5 w-full max-w-[80px] mx-2 transition-all duration-300 ${
                    step.id < activeStep ? 'bg-[#01042D]' : 'bg-gray-200'
                }`}
              />
            )}
          </div>
        ))}
        </div>
        
        {/* Versão mobile */}
        <div className="flex items-center justify-between md:hidden">
          {steps.map((step) => (
            <div 
              key={step.id}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                step.id === activeStep 
                  ? 'bg-[#01042D] text-white shadow-md' 
                  : step.id < activeStep 
                    ? 'bg-[#01042D]/10 text-[#01042D] border border-[#01042D]/30' 
                    : 'bg-gray-100 text-gray-400 border border-gray-200'
              }`}
            >
              {step.id < activeStep ? (
                <Check className="w-3 h-3" />
              ) : (
                <span className="text-xs font-medium">{step.id}</span>
              )}
            </div>
          ))}
        </div>
        
        <div className="mt-4 text-center">
          <h3 className="text-lg font-medium text-[#01042D]">
            {steps.find(s => s.id === activeStep)?.title} 
            <span className="text-gray-400 text-sm ml-2">Etapa {activeStep} de 6</span>
          </h3>
        </div>
      </div>
    );
  };

  const renderStep = () => {
    switch (activeStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-[#01042D]/10 text-[#01042D] rounded-full">
                <Package className="w-5 h-5" />
              </div>
            <h2 className="text-xl font-semibold text-gray-800">Nome do Produto</h2>
            </div>
            
            <p className="text-gray-600">
              Digite o nome do produto que você deseja importar. Quanto mais específico for, 
              melhor poderemos atender sua solicitação.
            </p>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="space-y-3">
                <label htmlFor="productName" className="block text-sm font-medium text-gray-700">
                  Nome do produto
                </label>
            <input
                  id="productName"
              type="text"
                  placeholder="Ex: iPhone 15 Pro Max 256GB Preto"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#01042D] transition-all duration-200"
              value={formData.productName}
              onChange={(e) => handleInputChange('productName', e.target.value)}
              onKeyPress={handleKeyPress}
            />
                
                <p className="text-xs text-gray-500 mt-2">
                  Dica: inclua detalhes como modelo, cor, capacidade ou outras especificações relevantes.
                </p>
              </div>
            </div>
            
            <div className="p-4 bg-blue-50 rounded-lg flex items-start mt-4 border border-blue-100">
              <Info className="text-blue-600 w-5 h-5 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-blue-800 text-sm">Porque isso é importante?</h4>
                <p className="text-blue-700 text-sm mt-1">
                  Um nome detalhado nos ajuda a encontrar exatamente o que você precisa, evitando erros na cotação.
                </p>
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-[#01042D]/10 text-[#01042D] rounded-full">
                <Link2 className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-semibold text-gray-800">Link do Produto</h2>
            </div>
            
            <p className="text-gray-600">
              Você possui um link do produto que deseja importar? Isso facilita a identificação exata do item.
            </p>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                    className={`relative p-4 rounded-xl border-2 transition-all duration-200 flex flex-col items-center ${
                  formData.hasLink === true 
                        ? 'border-[#01042D] bg-[#01042D]/5' 
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
                onClick={() => handleInputChange('hasLink', true)}
              >
                    <div className={`w-5 h-5 rounded-full border absolute top-3 right-3 ${
                      formData.hasLink === true 
                        ? 'border-[#01042D] bg-[#01042D]' 
                        : 'border-gray-300'
                    }`}>
                      {formData.hasLink === true && (
                        <Check className="w-3 h-3 text-white m-auto" />
                      )}
                    </div>
                    
                    <Link2 className={`w-8 h-8 mb-2 ${formData.hasLink === true ? 'text-[#01042D]' : 'text-gray-400'}`} />
                    <span className={`font-medium ${formData.hasLink === true ? 'text-[#01042D]' : 'text-gray-600'}`}>
                      Sim, tenho o link
                    </span>
              </button>
                  
              <button
                type="button"
                    className={`relative p-4 rounded-xl border-2 transition-all duration-200 flex flex-col items-center ${
                  formData.hasLink === false 
                        ? 'border-[#01042D] bg-[#01042D]/5' 
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
                onClick={() => handleInputChange('hasLink', false)}
              >
                    <div className={`w-5 h-5 rounded-full border absolute top-3 right-3 ${
                      formData.hasLink === false 
                        ? 'border-[#01042D] bg-[#01042D]' 
                        : 'border-gray-300'
                    }`}>
                      {formData.hasLink === false && (
                        <Check className="w-3 h-3 text-white m-auto" />
                      )}
                    </div>
                    
                    <div className={`w-8 h-8 mb-2 flex items-center justify-center ${formData.hasLink === false ? 'text-[#01042D]' : 'text-gray-400'}`}>
                      <Link2 className="w-7 h-7" />
                      <span className="absolute text-3xl font-bold leading-none">∅</span>
                    </div>
                    <span className={`font-medium ${formData.hasLink === false ? 'text-[#01042D]' : 'text-gray-600'}`}>
                      Não tenho o link
                    </span>
              </button>
            </div>
            
            {formData.hasLink && (
                  <div className="pt-3 border-t border-gray-100 mt-4">
                    <label htmlFor="productLink" className="block text-sm font-medium text-gray-700 mb-2">
                      Link do produto
                    </label>
                    <div className="flex">
                      <div className="bg-gray-50 border-l border-y border-gray-300 rounded-l-lg px-3 flex items-center text-gray-500">
                        <Link2 className="w-4 h-4" />
                      </div>
                <input
                        id="productLink"
                  type="url"
                        placeholder="https://www.exemplo.com/produto"
                        className="flex-1 p-3 border border-gray-300 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-[#01042D] transition-all duration-200"
                  value={formData.productLink}
                  onChange={(e) => handleInputChange('productLink', e.target.value)}
                  onKeyPress={handleKeyPress}
                />
                    </div>
              </div>
            )}
              </div>
            </div>
            
            {formData.hasLink === false && (
              <div className="p-4 bg-[#01042D]/5 rounded-lg flex items-start mt-2">
                <Check className="text-[#01042D] w-5 h-5 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-[#01042D] text-sm">Sem problemas!</h4>
                  <p className="text-[#01042D]/80 text-sm mt-1">
                    Nossa equipe irá encontrar o melhor preço possível a partir do nome e descrição do produto.
                  </p>
                </div>
              </div>
            )}
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-[#01042D]/10 text-[#01042D] rounded-full">
                <Image className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-semibold text-gray-800">Imagens do Produto</h2>
            </div>
            
            <p className="text-gray-600">
              Você deseja adicionar imagens do produto? Isso nos ajuda a identificar exatamente o que você procura.
            </p>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                    className={`relative p-4 rounded-xl border-2 transition-all duration-200 flex flex-col items-center ${
                  formData.hasImages === true 
                        ? 'border-[#01042D] bg-[#01042D]/5' 
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
                onClick={() => handleInputChange('hasImages', true)}
              >
                    <div className={`w-5 h-5 rounded-full border absolute top-3 right-3 ${
                      formData.hasImages === true 
                        ? 'border-[#01042D] bg-[#01042D]' 
                        : 'border-gray-300'
                    }`}>
                      {formData.hasImages === true && (
                        <Check className="w-3 h-3 text-white m-auto" />
                      )}
                    </div>
                    
                    <Image className={`w-8 h-8 mb-2 ${formData.hasImages === true ? 'text-[#01042D]' : 'text-gray-400'}`} />
                    <span className={`font-medium ${formData.hasImages === true ? 'text-[#01042D]' : 'text-gray-600'}`}>
                      Sim, tenho imagens
                    </span>
              </button>
                  
              <button
                type="button"
                    className={`relative p-4 rounded-xl border-2 transition-all duration-200 flex flex-col items-center ${
                  formData.hasImages === false 
                        ? 'border-[#01042D] bg-[#01042D]/5' 
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
                onClick={() => handleInputChange('hasImages', false)}
              >
                    <div className={`w-5 h-5 rounded-full border absolute top-3 right-3 ${
                      formData.hasImages === false 
                        ? 'border-[#01042D] bg-[#01042D]' 
                        : 'border-gray-300'
                    }`}>
                      {formData.hasImages === false && (
                        <Check className="w-3 h-3 text-white m-auto" />
                      )}
                    </div>
                    
                    <div className={`w-8 h-8 mb-2 flex items-center justify-center ${formData.hasImages === false ? 'text-[#01042D]' : 'text-gray-400'}`}>
                      <Image className="w-7 h-7" />
                      <span className="absolute text-3xl font-bold leading-none">∅</span>
                    </div>
                    <span className={`font-medium ${formData.hasImages === false ? 'text-[#01042D]' : 'text-gray-600'}`}>
                      Não tenho imagens
                    </span>
              </button>
            </div>
            
            {formData.hasImages && (
                  <div className="pt-4 border-t border-gray-100 mt-4">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                />
                
                <div
                      className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:bg-gray-50 transition-colors duration-200"
                  onClick={handleOpenFileDialog}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                >
                      <div className="mx-auto w-16 h-16 mb-4 rounded-full bg-[#01042D]/5 flex items-center justify-center">
                        <Upload className="w-8 h-8 text-[#01042D]" />
                      </div>
                      <h3 className="font-medium text-gray-700 mb-1">Arraste suas imagens aqui</h3>
                      <p className="text-gray-500 text-sm mb-3">
                        ou <span className="text-[#01042D] font-medium underline underline-offset-2">clique para selecionar</span> do seu dispositivo
                      </p>
                      <p className="text-gray-400 text-xs">
                        Formatos aceitos: JPG, PNG, WEBP (máx. 5MB por arquivo)
                      </p>
                </div>
                
                {formData.images.length > 0 && (
                      <div className="mt-6">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-sm font-medium text-gray-700">
                            {formData.images.length} {formData.images.length === 1 ? 'imagem' : 'imagens'} selecionada{formData.images.length !== 1 ? 's' : ''}
                          </h4>
                          <button 
                            type="button" 
                            className="text-xs text-red-600 hover:text-red-800 transition-colors"
                            onClick={() => handleInputChange('images', [])}
                          >
                            Remover todas
                          </button>
                        </div>
                        
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {formData.images.map((file, index) => (
                            <div key={index} className="relative group rounded-lg overflow-hidden border border-gray-200 aspect-square shadow-sm">
                            <img
                              src={URL.createObjectURL(file)}
                              alt={`Imagem ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button
                            type="button"
                                  className="bg-red-500 text-white rounded-full p-1.5 transform scale-90 hover:scale-100 transition-transform"
                            onClick={() => handleRemoveImage(index)}
                          >
                                  <X className="w-4 h-4" />
                          </button>
                              </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
              </div>
            </div>
            
            {formData.hasImages === false && (
              <div className="p-4 bg-[#01042D]/5 rounded-lg flex items-start mt-2">
                <Check className="text-[#01042D] w-5 h-5 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-[#01042D] text-sm">Sem problemas!</h4>
                  <p className="text-[#01042D]/80 text-sm mt-1">
                    Podemos continuar com sua importação apenas com a descrição do produto.
                  </p>
                </div>
              </div>
            )}
          </div>
        );
      case 4:
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-[#01042D]/10 text-[#01042D] rounded-full">
                <CalendarClock className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-semibold text-gray-800">Nível de Urgência</h2>
            </div>
            
            <p className="text-gray-600">
              Escolha o nível de urgência da sua importação para ajudarmos a definir o melhor método de envio.
            </p>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="space-y-4">
              <button
                type="button"
                  className={`w-full p-5 rounded-xl border-2 text-left transition-all duration-200 flex items-start gap-4 ${
                  formData.urgencyLevel === 'urgent' 
                      ? 'border-[#01042D] bg-[#01042D]/5' 
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
                onClick={() => handleInputChange('urgencyLevel', 'urgent')}
              >
                  <div className="flex-shrink-0">
                    <div className={`w-6 h-6 rounded-full border relative ${
                    formData.urgencyLevel === 'urgent' 
                        ? 'border-[#01042D] bg-[#01042D]' 
                      : 'border-gray-400'
                  }`}>
                    {formData.urgencyLevel === 'urgent' && (
                        <Check className="w-4 h-4 text-white absolute inset-0 m-auto" />
                    )}
                  </div>
                </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center mb-1">
                      <h3 className="font-semibold text-gray-800 text-lg">Urgente</h3>
                      <span className="ml-2 px-2 py-0.5 bg-red-50 text-red-600 text-xs font-medium rounded">Mais rápido</span>
                    </div>
                    
                    <p className="text-gray-600 text-sm">
                      Recomendamos envio por <span className="font-medium">DHL Express (7 a 10 dias úteis)</span>.
                    </p>
                    
                    <div className="mt-3 p-2 bg-amber-50 rounded-lg">
                      <p className="text-amber-700 text-xs">
                        Também oferecemos envio por Correios de Angola (15 a 30 dias úteis) caso prefira.
                      </p>
                    </div>
                </div>
              </button>
              
              <button
                type="button"
                  className={`w-full p-5 rounded-xl border-2 text-left transition-all duration-200 flex items-start gap-4 ${
                  formData.urgencyLevel === 'not-urgent' 
                      ? 'border-[#01042D] bg-[#01042D]/5' 
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
                onClick={() => handleInputChange('urgencyLevel', 'not-urgent')}
              >
                  <div className="flex-shrink-0">
                    <div className={`w-6 h-6 rounded-full border relative ${
                    formData.urgencyLevel === 'not-urgent' 
                        ? 'border-[#01042D] bg-[#01042D]' 
                      : 'border-gray-400'
                  }`}>
                    {formData.urgencyLevel === 'not-urgent' && (
                        <Check className="w-4 h-4 text-white absolute inset-0 m-auto" />
                    )}
                  </div>
                </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center mb-1">
                      <h3 className="font-semibold text-gray-800 text-lg">Não urgente</h3>
                      <span className="ml-2 px-2 py-0.5 bg-green-50 text-green-600 text-xs font-medium rounded">Mais econômico</span>
                    </div>
                    
                    <p className="text-gray-600 text-sm">
                      Você pode escolher entre <span className="font-medium">DHL Express e Correios de Angola</span>. Apresentaremos ambos os preços.
                    </p>
                    
                    <div className="mt-3 p-2 bg-blue-50 rounded-lg">
                      <p className="text-blue-700 text-xs">
                        Opções mais econômicas geralmente têm prazos de entrega mais longos.
                  </p>
                </div>
            </div>
                </button>
                
                <div className="p-4 bg-gray-50 rounded-xl mt-4 flex items-start border border-gray-200">
                  <Info className="text-blue-600 w-5 h-5 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-gray-800 text-sm">Informação de frete</h4>
                    <p className="text-gray-600 text-sm mt-1">
                      O valor do envio depende do peso e dimensões do produto. Será informado após a análise do seu pedido e antes da confirmação.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case 5:
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-[#01042D]/10 text-[#01042D] rounded-full">
                <FileText className="w-5 h-5" />
              </div>
            <h2 className="text-xl font-semibold text-gray-800">Termos e Condições</h2>
            </div>
            
            <p className="text-gray-600">
              Antes de prosseguir, por favor leia e concorde com os nossos termos e condições de importação.
            </p>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="bg-green-50 p-4 rounded-xl">
                    <div className="flex items-center mb-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-2">
                        <Shield className="w-4 h-4 text-green-600" />
                      </div>
                      <h3 className="font-medium text-green-800">Garantia de Qualidade</h3>
                    </div>
                    <p className="text-sm text-green-700">
                      Todos os produtos são testados antes do envio para garantir funcionamento e qualidade adequados.
                    </p>
                  </div>
                  
                  <div className="bg-blue-50 p-4 rounded-xl">
                    <div className="flex items-center mb-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-2">
                        <Package className="w-4 h-4 text-blue-600" />
                      </div>
                      <h3 className="font-medium text-blue-800">Rastreamento de Envio</h3>
                    </div>
                    <p className="text-sm text-blue-700">
                      Após o envio, disponibilizamos o código de rastreamento para acompanhamento da entrega.
                    </p>
                  </div>
                  
                  <div className="bg-amber-50 p-4 rounded-xl">
                    <div className="flex items-center mb-3">
                      <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center mr-2">
                        <Info className="w-4 h-4 text-amber-600" />
                      </div>
                      <h3 className="font-medium text-amber-800">Responsabilidade</h3>
                    </div>
                    <p className="text-sm text-amber-700">
                      Suporte completo para resolução de qualquer problema junto à empresa de logística, caso ocorra.
                    </p>
                  </div>
                  
                  <div className="bg-purple-50 p-4 rounded-xl">
                    <div className="flex items-center mb-3">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-2">
                        <Check className="w-4 h-4 text-purple-600" />
                      </div>
                      <h3 className="font-medium text-purple-800">Autenticidade Garantida</h3>
                    </div>
                    <p className="text-sm text-purple-700">
                      Todos os produtos são de origem europeia e com autenticidade garantida e comprovada.
                    </p>
                  </div>
                </div>
                
                <div className="pt-4 mt-2 border-t border-gray-200">
                  <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                <input 
                  type="checkbox" 
                  id="termsAccepted" 
                      className="h-5 w-5 rounded border-gray-300 text-[#01042D] focus:ring-[#01042D] mt-0.5"
                  checked={formData.termsAccepted}
                  onChange={(e) => handleInputChange('termsAccepted', e.target.checked)}
                />
                    <div>
                      <label htmlFor="termsAccepted" className="text-sm font-medium text-gray-800 cursor-pointer">
                        Li e concordo com todos os termos e condições acima
                </label>
                      <p className="text-xs text-gray-500 mt-1">
                        Ao concordar, você autoriza a DOT a importar o produto solicitado e reconhece as condições de compra.
                      </p>
                    </div>
              </div>
            </div>
            
            {!formData.termsAccepted && (
                  <div className="p-3 bg-amber-50 rounded-lg border border-amber-100">
                    <p className="text-sm text-amber-700 flex items-center">
                      <Info className="w-4 h-4 mr-2 flex-shrink-0" />
                      É necessário aceitar os termos para prosseguir com a importação.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
        
      case 6:
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-[#01042D]/10 text-[#01042D] rounded-full">
                <User className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-semibold text-gray-800">Seus Dados de Contato</h2>
            </div>
            
            <p className="text-gray-600">
              Informe seus dados para que possamos entrar em contato sobre sua importação e realizar a entrega.
            </p>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Nome completo <span className="text-red-500">*</span>
                  </label>
                <input
                  type="text"
                  placeholder="Digite seu nome completo"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#01042D] transition-all duration-200"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  onKeyPress={handleKeyPress}
                />
              </div>
              
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Email <span className="text-red-500">*</span>
                  </label>
                <input
                  type="email"
                  placeholder="Digite seu email"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#01042D] transition-all duration-200"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  onKeyPress={handleKeyPress}
                />
              </div>
              
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Telefone (WhatsApp) <span className="text-red-500">*</span>
                  </label>
                <input
                  type="tel"
                    placeholder="Ex: +244 923 456 789"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#01042D] transition-all duration-200"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  onKeyPress={handleKeyPress}
                />
                  <p className="text-xs text-gray-500">
                    Preferimos contato via WhatsApp para agilizar o atendimento.
                  </p>
              </div>
              
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Província <span className="text-red-500">*</span>
                  </label>
                  <select
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#01042D] transition-all duration-200 bg-white"
                    value={formData.province}
                    onChange={(e) => handleInputChange('province', e.target.value)}
                  >
                    <option value="Luanda">Luanda</option>
                    <option value="Benguela">Benguela</option>
                    <option value="Huambo">Huambo</option>
                    <option value="Cabinda">Cabinda</option>
                    <option value="Lubango">Lubango</option>
                  </select>
                </div>
                
                <div className="md:col-span-2 space-y-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Endereço de entrega <span className="text-red-500">*</span>
                  </label>
                <textarea
                    placeholder="Digite seu endereço completo para entrega"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#01042D] transition-all duration-200 min-h-[100px] resize-none"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                />
                  <p className="text-xs text-gray-500">
                    Inclua rua, número, bairro, referências e CEP (se disponível).
                  </p>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100 flex items-start">
                <Info className="text-blue-600 w-5 h-5 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                  <h4 className="font-medium text-blue-800 text-sm">Política de Privacidade</h4>
                  <p className="text-blue-700 text-xs mt-1">
                    Seus dados são protegidos e utilizados apenas para o processo de importação do produto solicitado. 
                    Não compartilhamos suas informações com terceiros não envolvidos no processo.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-green-50 rounded-lg border border-green-100 flex items-start">
              <Check className="text-green-600 w-5 h-5 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-green-800 text-sm">Último passo!</h4>
                <p className="text-green-700 text-sm mt-1">
                  Após enviar, nossa equipe entrará em contato em até 24 horas para confirmar os detalhes da importação.
                </p>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  if (success) {
    return (
      <>
        <SEO 
          title="Importação de Produtos - Solicitação Enviada"
          description="Sua solicitação de importação de produtos foi enviada com sucesso. A DOT entrará em contato em breve."
        />
        <div className="min-h-screen bg-gray-100 py-4">
          <div className="max-w-6xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col min-h-[calc(100vh-2rem)]">
            <Header />
            <Navigation onPageChange={handlePageChange} />
            
            <div className="flex-grow flex flex-col justify-center items-center px-6 py-12">
              <div className="max-w-xl w-full">
                <div className="text-center mb-8">
                  <div className="relative mx-auto mb-6">
                    <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto animate-pulse">
                      <Check className="w-12 h-12 text-green-600" />
                </div>
                    <div className="absolute w-full h-full top-0 left-0 rounded-full border-4 border-green-400 border-t-transparent animate-spin"></div>
                  </div>
                  
                  <h1 className="text-3xl font-bold text-gray-800 mb-3">Solicitação Enviada com Sucesso!</h1>
                  <div className="h-1 w-16 bg-green-500 mx-auto mb-6 rounded-full"></div>
                  <p className="text-lg text-gray-600 mb-6">
                    Obrigado pela sua solicitação! A DOT entrará em contacto através do seu WhatsApp em até 24 horas para finalizar sua importação.
                  </p>
                  
                  <div className="bg-gray-50 p-4 rounded-xl text-left mb-8 border border-gray-200">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">O que acontece agora?</h3>
                    <ul className="space-y-3">
                      <li className="flex items-center text-sm text-gray-600">
                        <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mr-3 flex-shrink-0">
                          1
                        </div>
                        Nossa equipe irá analisar seu pedido e preparar uma cotação
                      </li>
                      <li className="flex items-center text-sm text-gray-600">
                        <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mr-3 flex-shrink-0">
                          2
                        </div>
                        Entraremos em contato via WhatsApp para confirmar detalhes
                      </li>
                      <li className="flex items-center text-sm text-gray-600">
                        <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mr-3 flex-shrink-0">
                          3
                        </div>
                        Após aprovação, iniciaremos o processo de importação
                      </li>
                    </ul>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={() => {
                      navigate('/');
                    }}
                    className="bg-white text-gray-800 border border-gray-300 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors flex-1 flex items-center justify-center"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Voltar para a página inicial
                  </button>
                  <button
                    onClick={() => {
                      setSuccess(false);
                      setActiveStep(1);
                      setFormData({
                        productName: '',
                        hasLink: null,
                        productLink: '',
                        hasImages: null,
                        images: [],
                        urgencyLevel: '',
                        termsAccepted: false,
                        fullName: '',
                        email: '',
                        phone: '',
                        address: '',
                        province: 'Luanda',
                      });
                    }}
                    className="bg-[#01042D] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#01042D]/90 transition-colors flex-1 flex items-center justify-center"
                  >
                    <Package className="w-4 h-4 mr-2" />
                    Solicitar nova importação
                  </button>
                </div>
              </div>
            </div>
            
            <footer className="bg-gray-50 p-6 border-t">
              <div className="flex flex-col md:flex-row justify-between items-center">
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
                  <a href="#" className="text-sm text-gray-500 hover:text-[#01042D] transition-colors duration-300">Sobre Nós</a>
                  <a href="#" className="text-sm text-gray-500 hover:text-[#01042D] transition-colors duration-300">Termos e Condições</a>
                  <a href="#" className="text-sm text-gray-500 hover:text-[#01042D] transition-colors duration-300">Política de Privacidade</a>
                  <a href="#" className="text-sm text-gray-500 hover:text-[#01042D] transition-colors duration-300">Contato</a>
                </div>
                
                <div className="mt-4 md:mt-0">
                  <p className="text-sm text-gray-500">© 2023 DOT. Todos os direitos reservados.</p>
                </div>
              </div>
            </footer>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <SEO 
        title="Importação de Produtos | DOT Angola"
        description="Importe produtos da Europa para Angola com a DOT. Eletrônicos, gadgets e tecnologia entregues em sua casa em Luanda e outras províncias. Processo seguro e rastreado."
      />
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-0 sm:p-4">
        <div className="max-w-6xl w-full bg-white rounded-none sm:rounded-3xl shadow-xl overflow-hidden flex flex-col min-h-screen sm:min-h-[calc(100vh-2rem)]">
          <Header />
          <Navigation onPageChange={handlePageChange} />
          
          <div className="flex-grow px-6 py-8">
            <div className="max-w-3xl mx-auto">
              {error && (
                <div className="mb-8 p-4 bg-red-50 rounded-xl border border-red-100 flex items-start animate-pulse">
                  <AlertTriangle className="text-red-600 w-5 h-5 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-red-800 text-sm">Atenção</h4>
                    <p className="text-red-700 text-sm mt-0.5">{error}</p>
                  </div>
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="relative bg-white rounded-2xl p-1 shadow-sm border border-gray-200">
                <div className="absolute -top-px left-0 right-0 h-1 bg-gradient-to-r from-[#01042D] to-blue-500 rounded-t-2xl"></div>
                
                <div className="p-6 sm:p-8">
                  <div className="mb-8 text-center">
                    <p className="text-gray-600">
                      Solicite a importação de produtos da Europa por meio da DOT. Preencha o formulário 
                      abaixo e nossa equipe entrará em contato para finalizar seu pedido.
                    </p>
                  </div>
                
                {renderStepIndicator()}
                
                  <div className="mt-6">
                  {renderStep()}
                </div>
                
                  <div className="flex justify-between mt-10 pt-6 border-t border-gray-100">
                  {activeStep > 1 ? (
                    <button
                      type="button"
                      onClick={handleBack}
                        className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-all duration-200 flex items-center"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                      Voltar
                    </button>
                  ) : (
                      <button
                        type="button"
                        onClick={() => navigate('/')}
                        className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-all duration-200 flex items-center"
                      >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Início
                      </button>
                  )}
                  
                  {activeStep < 6 ? (
                    <button
                      type="button"
                      onClick={handleNext}
                        className="px-6 py-3 bg-[#01042D] text-white rounded-lg hover:bg-[#01042D]/90 transition-all duration-200 flex items-center shadow-md shadow-[#01042D]/10"
                    >
                      Próximo
                        <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={loading}
                        className="px-6 py-3 bg-[#01042D] text-white rounded-lg hover:bg-[#01042D]/90 transition-all duration-200 flex items-center shadow-md shadow-[#01042D]/10 min-w-[160px] justify-center"
                    >
                      {loading ? (
                        <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                          Enviando...
                        </>
                      ) : (
                          <>
                            <Send className="w-4 h-4 mr-2" />
                            Enviar pedido
                          </>
                      )}
                    </button>
                  )}
                  </div>
                </div>
              </form>
              
              {/* Slider "O que nossos clientes compram" */}
              <div className="mt-16 mb-12">
                <div className="text-center mb-10">
                  <span className="inline-block px-3 py-1 bg-[#01042D]/5 text-[#01042D] rounded-full text-xs font-medium mb-2">Produtos populares</span>
                  <h2 className="text-2xl font-bold text-gray-800">
                    O que nossos clientes importam
                  </h2>
                  <div className="w-16 h-1 bg-[#01042D] mx-auto mt-2 rounded-full"></div>
                  <p className="text-gray-600 mt-3 max-w-xl mx-auto">
                    Confira alguns dos produtos mais solicitados pelos nossos clientes
                  </p>
                </div>
                
                <div 
                  className="relative rounded-xl overflow-hidden shadow-lg bg-white border border-gray-100"
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                  ref={sliderRef}
                >
                  {/* Container dos slides - design completamente novo */}
                  <div className="relative h-80 md:h-[450px]">
                    {sliderImages.map((src, index) => (
                      <div
                        key={index}
                        className={`absolute inset-0 transition-all duration-1000 ease-in-out transform ${
                          index === currentSlide 
                            ? 'opacity-100 translate-x-0 scale-100 z-10' 
                            : index < currentSlide 
                              ? 'opacity-0 -translate-x-full scale-95 z-0' 
                              : 'opacity-0 translate-x-full scale-95 z-0'
                        }`}
                      >
                        {/* Conteúdo simplificado - apenas a imagem com barra superior */}
                        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#01042D] to-blue-500"></div>
                        
                        <div className="w-full h-full flex items-center justify-center p-8">
                          <img 
                            src={src} 
                            alt={`Produto importado ${index + 1}`}
                            className="max-w-full max-h-full object-contain transition-all duration-500 hover:scale-[1.02]" 
                          />
                        </div>
                        
                        {/* Numeração discreta no canto superior */}
                        <div className="absolute top-4 right-4 md:top-6 md:right-6">
                          <div className="bg-white text-[#01042D] rounded-full w-10 h-10 flex items-center justify-center shadow-md border border-gray-100">
                            <span className="text-sm font-medium">{index + 1}/{sliderImages.length}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Controles de navegação aprimorados */}
                  <button 
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white text-[#01042D] rounded-full p-3 shadow-md transition-all duration-300 hover:bg-[#01042D]/5 z-20 focus:outline-none border border-gray-100"
                    onClick={prevSlide}
                    aria-label="Slide anterior"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  
                  <button 
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white text-[#01042D] rounded-full p-3 shadow-md transition-all duration-300 hover:bg-[#01042D]/5 z-20 focus:outline-none border border-gray-100"
                    onClick={nextSlide}
                    aria-label="Próximo slide"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                  
                  {/* Indicadores estilizados */}
                  <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
                    {sliderImages.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => goToSlide(index)}
                        className={`h-2 rounded-full transition-all duration-300 ${
                          index === currentSlide 
                            ? 'bg-[#01042D] w-10' 
                            : 'bg-gray-300 hover:bg-gray-400 w-3'
                        }`}
                        aria-label={`Ver produto ${index + 1}`}
                      />
                    ))}
                  </div>
                </div>
                
                <div className="text-center mt-10 max-w-xl mx-auto">
                  <p className="text-gray-600">
                    Nossa equipe especializada importa produtos premium da Europa com autenticidade garantida e entrega segura até você.
                  </p>
                  <div className="mt-5 flex flex-wrap justify-center gap-2">
                    <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-100">
                      <Check className="w-3.5 h-3.5 mr-1" /> Entrega rastreada
                    </span>
                    <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                      <Check className="w-3.5 h-3.5 mr-1" /> Produtos originais
                    </span>
                    <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-100">
                      <Check className="w-3.5 h-3.5 mr-1" /> Qualidade garantida
                    </span>
                    <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border border-purple-100">
                      <Check className="w-3.5 h-3.5 mr-1" /> Suporte personalizado
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <footer className="bg-gray-50 p-6 border-t">
            <div className="flex flex-col md:flex-row justify-between items-center">
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
                <a href="#" className="text-sm text-gray-500 hover:text-[#01042D] transition-colors duration-300">Sobre Nós</a>
                <a href="#" className="text-sm text-gray-500 hover:text-[#01042D] transition-colors duration-300">Termos e Condições</a>
                <a href="#" className="text-sm text-gray-500 hover:text-[#01042D] transition-colors duration-300">Política de Privacidade</a>
                <a href="#" className="text-sm text-gray-500 hover:text-[#01042D] transition-colors duration-300">Contato</a>
              </div>
              
              <div className="mt-4 md:mt-0">
                <p className="text-sm text-gray-500">© 2023 DOT. Todos os direitos reservados.</p>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </>
  );
}