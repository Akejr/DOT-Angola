import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { RefreshCw, File, Image, AlertTriangle, Check, Search } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";

export default function DiagnosticTool() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [bucketInfo, setBucketInfo] = useState<any>(null);
  const [testFile, setTestFile] = useState<File | null>(null);
  const [uploadResult, setUploadResult] = useState<any>(null);
  const [testImageUrl, setTestImageUrl] = useState<string | null>(null);
  const [imageLoadSuccess, setImageLoadSuccess] = useState<boolean | null>(null);
  const [urlToAnalyze, setUrlToAnalyze] = useState<string>('');
  const [urlAnalysisResult, setUrlAnalysisResult] = useState<any>(null);

  useEffect(() => {
    checkBucketStatus();
  }, []);

  const checkBucketStatus = async () => {
    try {
      setLoading(true);
      
      // Verificar se o bucket "gift-cards" existe
      const { data: buckets, error: bucketsError } = await supabase
        .storage
        .listBuckets();
      
      if (bucketsError) {
        throw bucketsError;
      }
      
      const giftCardsBucket = buckets?.find(b => b.name === 'gift-cards');
      
      if (!giftCardsBucket) {
        setBucketInfo({
          exists: false,
          message: "O bucket 'gift-cards' não existe."
        });
        return;
      }
      
      // Listar arquivos no bucket
      const { data: files, error: filesError } = await supabase
        .storage
        .from('gift-cards')
        .list();
      
      if (filesError) {
        throw filesError;
      }
      
      // Verificar permissões tentando obter URL pública de um arquivo
      let publicUrlTest = null;
      
      if (files && files.length > 0) {
        const { data: publicUrlData } = supabase
          .storage
          .from('gift-cards')
          .getPublicUrl(files[0].name);
        
        publicUrlTest = {
          success: !!publicUrlData.publicUrl,
          url: publicUrlData.publicUrl || null
        };
      }
      
      setBucketInfo({
        exists: true,
        isPublic: giftCardsBucket.public || false,
        fileCount: files?.length || 0,
        recentFiles: files?.slice(0, 5) || [],
        publicUrlTest
      });
      
    } catch (error) {
      console.error('Erro ao verificar bucket:', error);
      setBucketInfo({
        exists: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setTestFile(e.target.files[0]);
    }
  };

  const uploadTestFile = async () => {
    if (!testFile) {
      toast({
        title: "Nenhum arquivo selecionado",
        description: "Por favor, selecione um arquivo para teste",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setLoading(true);
      setUploadResult(null);
      setTestImageUrl(null);
      setImageLoadSuccess(null);
      
      // Nome de arquivo único para teste
      const fileExt = testFile.name.split('.').pop();
      const fileName = `teste-diagnostico-${Date.now()}.${fileExt}`;
      
      // Upload de teste com MIME type explícito
      const { data, error } = await supabase.storage
        .from('gift-cards')
        .upload(fileName, testFile, {
          contentType: testFile.type,
          cacheControl: '3600'
        });
      
      if (error) {
        throw error;
      }
      
      // Obter URL pública
      const { data: publicUrlData } = supabase.storage
        .from('gift-cards')
        .getPublicUrl(fileName, {
          download: false,
          transform: {
            quality: 80
          }
        });
      
      // Adicionar parâmetro para evitar cache
      const publicUrl = `${publicUrlData.publicUrl}?t=${Date.now()}`;
      
      setTestImageUrl(publicUrl);
      setUploadResult({
        success: true,
        fileName,
        publicUrl,
        contentType: testFile.type
      });
      
      toast({
        title: "Upload concluído",
        description: "Arquivo de teste enviado com sucesso."
      });
      
    } catch (error) {
      console.error('Erro no upload de teste:', error);
      setUploadResult({
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
      
      toast({
        title: "Erro no upload",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImageLoad = () => {
    setImageLoadSuccess(true);
    toast({
      title: "Imagem carregada com sucesso",
      description: "A URL da imagem está funcionando corretamente!"
    });
  };

  const handleImageError = () => {
    setImageLoadSuccess(false);
    toast({
      title: "Erro ao carregar imagem",
      description: "A imagem não pode ser carregada a partir da URL pública.",
      variant: "destructive"
    });
  };

  const analyzeImageUrl = () => {
    if (!urlToAnalyze.trim()) {
      toast({
        title: "URL vazia",
        description: "Por favor, insira uma URL para analisar",
        variant: "destructive"
      });
      return;
    }

    try {
      // Extrair informações da URL
      const isValidUrl = urlToAnalyze.startsWith('http');
      const usesRenderImage = urlToAnalyze.includes('/render/image/');
      const usesObjectPublic = urlToAnalyze.includes('/object/public/');
      const hasDuplicatePath = urlToAnalyze.includes('/gift-cards/gift-cards/');
      
      // Criar URL alternativa com formato object/public
      let alternativeUrl = urlToAnalyze;
      if (usesRenderImage) {
        alternativeUrl = urlToAnalyze.replace('/render/image/', '/object/public/');
      }
      
      // Verificar se a URL pode ser corrigida
      let canBeFixed = false;
      let suggestedFix = '';
      
      if (usesRenderImage) {
        canBeFixed = true;
        suggestedFix = 'Converter de /render/image/ para /object/public/';
      } else if (hasDuplicatePath) {
        canBeFixed = true;
        suggestedFix = 'Remover duplicação de caminho gift-cards/gift-cards/';
      }
      
      setUrlAnalysisResult({
        originalUrl: urlToAnalyze,
        isValidUrl,
        usesRenderImage,
        usesObjectPublic,
        hasDuplicatePath,
        alternativeUrl: alternativeUrl !== urlToAnalyze ? alternativeUrl : null,
        canBeFixed,
        suggestedFix
      });
      
      // Testar a imagem
      const testImg = new window.Image();
      testImg.onload = () => {
        setUrlAnalysisResult(prev => ({
          ...prev,
          imageLoadsSuccessfully: true
        }));
      };
      testImg.onerror = () => {
        setUrlAnalysisResult(prev => ({
          ...prev,
          imageLoadsSuccessfully: false
        }));
      };
      testImg.src = urlToAnalyze;
      
    } catch (error) {
      console.error('Erro ao analisar URL:', error);
      toast({
        title: "Erro na análise",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-[#01042D]">
          Ferramenta de Diagnóstico de Imagens
        </h1>
        <button
          onClick={checkBucketStatus}
          disabled={loading}
          className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors flex items-center gap-1.5"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Verificar Status
        </button>
      </div>

      {/* Informações do Bucket */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="border-b border-gray-100 p-4">
          <h2 className="font-medium text-gray-900">Status do Bucket do Supabase</h2>
        </div>
        
        <div className="p-4">
          {loading && !bucketInfo ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : bucketInfo ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className={`p-1.5 rounded-full ${bucketInfo.exists ? 'bg-green-100' : 'bg-red-100'}`}>
                  {bucketInfo.exists ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                  )}
                </div>
                <span className="font-medium">
                  Bucket 'gift-cards': {bucketInfo.exists ? 'Existe' : 'Não encontrado'}
                </span>
              </div>
              
              {bucketInfo.exists && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm font-medium text-gray-700">
                        Status: {bucketInfo.isPublic ? 'Público' : 'Privado'}
                      </p>
                      <p className="text-sm text-gray-600">
                        Arquivos: {bucketInfo.fileCount} encontrados
                      </p>
                    </div>
                    
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm font-medium text-gray-700">
                        Teste de URL pública: 
                        {bucketInfo.publicUrlTest?.success ? (
                          <span className="text-green-600 ml-1">Funcionando</span>
                        ) : (
                          <span className="text-red-600 ml-1">Falha</span>
                        )}
                      </p>
                      {bucketInfo.publicUrlTest?.url && (
                        <p className="text-xs text-gray-500 truncate">
                          URL: {bucketInfo.publicUrlTest.url}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {bucketInfo.recentFiles && bucketInfo.recentFiles.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium mb-2">Arquivos recentes:</h3>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <ul className="space-y-1">
                          {bucketInfo.recentFiles.map((file: any, index: number) => (
                            <li key={index} className="text-sm flex items-center gap-2">
                              <File className="w-4 h-4 text-gray-500" />
                              <span className="text-gray-700">{file.name}</span>
                              <span className="text-xs text-gray-500">
                                ({(file.metadata?.size / 1024).toFixed(2)} KB)
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </>
              )}
              
              {bucketInfo.error && (
                <div className="bg-red-50 p-4 rounded-lg text-red-700">
                  <p className="font-medium">Erro ao verificar bucket:</p>
                  <p className="text-sm">{bucketInfo.error}</p>
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-500">Clique em "Verificar Status" para verificar o bucket do Supabase.</p>
          )}
        </div>
      </div>

      {/* Teste de Upload */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="border-b border-gray-100 p-4">
          <h2 className="font-medium text-gray-900">Teste de Upload de Imagem</h2>
        </div>
        
        <div className="p-4">
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Selecione uma imagem para teste
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                />
              </div>
              
              <div className="sm:self-end">
                <button
                  type="button"
                  onClick={uploadTestFile}
                  disabled={loading || !testFile}
                  className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors flex items-center justify-center gap-1.5"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Image className="w-4 h-4" />
                      Testar Upload
                    </>
                  )}
                </button>
              </div>
            </div>
            
            {uploadResult && (
              <div className={`p-4 rounded-lg ${uploadResult.success ? 'bg-green-50' : 'bg-red-50'}`}>
                <h3 className={`text-sm font-medium ${uploadResult.success ? 'text-green-800' : 'text-red-800'} mb-2`}>
                  {uploadResult.success ? 'Upload realizado com sucesso!' : 'Falha no upload'}
                </h3>
                
                {uploadResult.success ? (
                  <div className="space-y-2">
                    <p className="text-sm text-green-700">
                      <strong>Nome do arquivo:</strong> {uploadResult.fileName}
                    </p>
                    <p className="text-sm text-green-700">
                      <strong>Tipo de conteúdo:</strong> {uploadResult.contentType}
                    </p>
                    <div className="text-sm text-green-700">
                      <strong>URL pública:</strong>
                      <div className="bg-white p-2 rounded border border-green-200 mt-1 overflow-auto">
                        <code className="text-xs break-all">{uploadResult.publicUrl}</code>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-green-800 mb-2">Teste de Carregamento da Imagem:</h4>
                      <div className="flex items-center justify-center border border-green-200 bg-white rounded-lg p-4 h-64">
                        {testImageUrl && (
                          <img
                            src={testImageUrl}
                            alt="Imagem de teste"
                            onLoad={handleImageLoad}
                            onError={handleImageError}
                            className="max-h-full max-w-full object-contain"
                          />
                        )}
                        
                        {imageLoadSuccess === false && (
                          <div className="text-center text-red-600">
                            <AlertTriangle className="w-12 h-12 mx-auto mb-2" />
                            <p>Erro ao carregar a imagem</p>
                          </div>
                        )}
                      </div>
                      
                      {imageLoadSuccess !== null && (
                        <div className={`mt-2 p-2 rounded text-sm ${imageLoadSuccess ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {imageLoadSuccess
                            ? 'A imagem foi carregada com sucesso! Tudo está funcionando corretamente.'
                            : 'A imagem não pôde ser carregada. Isso indica um problema com o Supabase Storage ou com as permissões do bucket.'}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-red-700">
                    <strong>Erro:</strong> {uploadResult.error}
                  </p>
                )}
              </div>
            )}
            
            <div className="mt-4 bg-blue-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-blue-800 mb-2">Diagnóstico e Solução</h3>
              <p className="text-sm text-blue-700 mb-2">
                Se você estiver enfrentando problemas com imagens, verifique:
              </p>
              <ol className="list-decimal pl-5 text-sm text-blue-700 space-y-1">
                <li>Se o bucket 'gift-cards' existe e está configurado como público.</li>
                <li>Se as políticas de segurança (RLS) permitem leitura pública.</li>
                <li>Se os cabeçalhos MIME estão configurados corretamente. Isso é crucial para arquivos WEBP.</li>
                <li>Se o upload está sendo feito com o contentType correto.</li>
                <li>Tente limpar o cache do navegador ou usar uma janela anônima para testar.</li>
              </ol>

              <div className="mt-4 bg-amber-50 border border-amber-200 p-3 rounded-lg">
                <h4 className="text-sm font-medium text-amber-800 mb-2">Problema de URL detectado:</h4>
                <p className="text-xs text-amber-700">
                  Algumas imagens podem ter problemas com URLs incorretas. Verificamos dois padrões problemáticos:
                </p>
                <ul className="list-disc pl-5 text-xs text-amber-700 space-y-1 mt-1">
                  <li>
                    <strong>Duplicação de path:</strong> URLs com padrão <code className="bg-amber-100 px-1 py-0.5 rounded">/gift-cards/gift-cards/</code> 
                    devem ser corrigidas para <code className="bg-amber-100 px-1 py-0.5 rounded">/gift-cards/</code>
                  </li>
                  <li>
                    <strong>Formato incorreto:</strong> URLs que usam <code className="bg-amber-100 px-1 py-0.5 rounded">/render/image/</code> 
                    devem ser convertidas para <code className="bg-amber-100 px-1 py-0.5 rounded">/object/public/</code>
                  </li>
                </ul>
                <p className="text-xs text-amber-700 mt-2">
                  Nossas correções tentam resolver automaticamente esses problemas. Use o botão "Corrigir Imagens" 
                  no Gerenciador de Gift Cards para aplicar as correções em todas as imagens.
                </p>
                <div className="mt-3 text-center">
                  <button
                    onClick={() => window.location.href = '/admin/gift-cards'}
                    className="px-3 py-1.5 bg-amber-600 text-white text-xs rounded hover:bg-amber-700 transition-colors"
                  >
                    Ir para Gerenciador de Gift Cards
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Analisador de URL */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="border-b border-gray-100 p-4">
          <h2 className="font-medium text-gray-900">Analisador de URL de Imagem</h2>
        </div>
        
        <div className="p-4">
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cole a URL de uma imagem para analisar
                </label>
                <input
                  type="text"
                  value={urlToAnalyze}
                  onChange={(e) => setUrlToAnalyze(e.target.value)}
                  placeholder="https://example.supabase.co/storage/v1/..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                />
              </div>
              
              <div className="sm:self-end">
                <button
                  type="button"
                  onClick={analyzeImageUrl}
                  disabled={!urlToAnalyze.trim()}
                  className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors flex items-center justify-center gap-1.5"
                >
                  <Search className="w-4 h-4" />
                  Analisar URL
                </button>
              </div>
            </div>
            
            {urlAnalysisResult && (
              <div className="mt-4 border border-gray-200 rounded-lg overflow-hidden">
                <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                  <h3 className="font-medium text-gray-900">Resultado da Análise</h3>
                  <div className={`text-xs font-medium px-2 py-1 rounded ${
                    urlAnalysisResult.imageLoadsSuccessfully === true 
                      ? 'bg-green-100 text-green-800' 
                      : urlAnalysisResult.imageLoadsSuccessfully === false
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-800'
                  }`}>
                    {urlAnalysisResult.imageLoadsSuccessfully === true 
                      ? 'Imagem carrega corretamente' 
                      : urlAnalysisResult.imageLoadsSuccessfully === false
                        ? 'Imagem não carrega'
                        : 'Testando...'}
                  </div>
                </div>
                
                <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="space-y-2">
                      <div>
                        <p className="text-xs font-medium text-gray-500">URL Original:</p>
                        <div className="mt-1 bg-gray-50 p-2 rounded text-xs break-all border border-gray-200">
                          {urlAnalysisResult.originalUrl}
                        </div>
                      </div>
                      
                      {urlAnalysisResult.alternativeUrl && (
                        <div>
                          <p className="text-xs font-medium text-gray-500">URL Sugerida:</p>
                          <div className="mt-1 bg-green-50 p-2 rounded text-xs break-all border border-green-200">
                            {urlAnalysisResult.alternativeUrl}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-4 space-y-1">
                      <p className="text-xs font-medium text-gray-900">Diagnóstico:</p>
                      <ul className="list-disc pl-5 text-xs text-gray-700 space-y-1">
                        <li className={urlAnalysisResult.isValidUrl ? 'text-green-700' : 'text-red-700'}>
                          URL {urlAnalysisResult.isValidUrl ? 'começa com http (válida)' : 'não começa com http (inválida)'}
                        </li>
                        <li className={urlAnalysisResult.usesRenderImage ? 'text-red-700' : 'text-gray-700'}>
                          {urlAnalysisResult.usesRenderImage 
                            ? 'Usa formato /render/image/ (PROBLEMA!)' 
                            : 'Não usa formato /render/image/'}
                        </li>
                        <li className={urlAnalysisResult.usesObjectPublic ? 'text-green-700' : 'text-gray-700'}>
                          {urlAnalysisResult.usesObjectPublic 
                            ? 'Usa formato /object/public/ (CORRETO)' 
                            : 'Não usa formato /object/public/'}
                        </li>
                        <li className={urlAnalysisResult.hasDuplicatePath ? 'text-red-700' : 'text-gray-700'}>
                          {urlAnalysisResult.hasDuplicatePath 
                            ? 'Tem duplicação de caminho gift-cards/gift-cards/ (PROBLEMA!)' 
                            : 'Não tem duplicação de caminho'}
                        </li>
                      </ul>
                    </div>
                    
                    {urlAnalysisResult.canBeFixed && (
                      <div className="mt-4 bg-blue-50 p-3 rounded border border-blue-200">
                        <p className="text-xs font-medium text-blue-800">Correção sugerida:</p>
                        <p className="text-xs text-blue-700 mt-1">{urlAnalysisResult.suggestedFix}</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="border border-gray-200 rounded-lg overflow-hidden h-48 flex items-center justify-center bg-gray-50">
                    {urlAnalysisResult.originalUrl ? (
                      <img 
                        src={urlAnalysisResult.originalUrl} 
                        alt="Imagem de teste" 
                        className="max-w-full max-h-full object-contain"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          document.getElementById('image-error')?.classList.remove('hidden');
                        }}
                      />
                    ) : (
                      <p className="text-sm text-gray-500">Sem imagem para exibir</p>
                    )}
                    <div id="image-error" className="hidden text-center text-red-600">
                      <AlertTriangle className="w-12 h-12 mx-auto mb-2" />
                      <p className="text-sm">Erro ao carregar a imagem</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 