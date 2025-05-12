import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { Sale, SaleItem } from '@/types/supabase';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Download, Loader2 } from 'lucide-react';
import assinaturaImg from '@/assets/fatura/assinatura.png';
import logoImg from '/images/Logo Branco.png'; // Usando o logo branco correto

export default function InvoicePdfPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [sale, setSale] = useState<Sale | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [assinaturaImgData, setAssinaturaImgData] = useState<string | null>(null);
  const [logoImgData, setLogoImgData] = useState<string | null>(null);

  // Carrega as imagens quando o componente monta
  useEffect(() => {
    const loadImages = async () => {
      try {
        // Carrega a imagem de assinatura
        const assinaturaResponse = await fetch(assinaturaImg);
        const assinaturaBlob = await assinaturaResponse.blob();
        const assinaturaReader = new FileReader();
        assinaturaReader.onloadend = () => {
          setAssinaturaImgData(assinaturaReader.result as string);
        };
        assinaturaReader.readAsDataURL(assinaturaBlob);

        // Carrega a imagem do logo
        const logoResponse = await fetch(logoImg);
        const logoBlob = await logoResponse.blob();
        const logoReader = new FileReader();
        logoReader.onloadend = () => {
          setLogoImgData(logoReader.result as string);
        };
        logoReader.readAsDataURL(logoBlob);
      } catch (error) {
        console.error('Erro ao carregar imagens:', error);
      }
    };

    loadImages();
  }, []);

  useEffect(() => {
    try {
      // Extrair dados da venda da URL
      const params = new URLSearchParams(location.search);
      const saleData = params.get('data');

      if (!saleData) {
        setError('Dados da venda não encontrados');
        setIsLoading(false);
        return;
      }

      // Decodificar e parsear os dados da venda
      const decodedSaleData = JSON.parse(decodeURIComponent(saleData));
      setSale(decodedSaleData);
      
      // Verifica se as imagens foram carregadas antes de gerar o PDF
      if (assinaturaImgData && logoImgData) {
        generatePDF(decodedSaleData);
      }
    } catch (error) {
      console.error('Erro ao carregar dados da venda:', error);
      setError('Erro ao carregar dados da venda');
      setIsLoading(false);
    }
  }, [location, assinaturaImgData, logoImgData]);

  const generatePDF = (saleData: Sale) => {
    try {
      // Criar uma nova instância do jsPDF
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Configurações de fonte
      doc.setFont('helvetica');
      doc.setFontSize(10);

      // Definir cores da empresa - cor principal atualizada para #01042D
      const primaryColor = [1, 4, 45]; // Azul #01042D em RGB
      const secondaryColor = [25, 118, 210]; // Azul secundário
      const accentColor = [245, 124, 0]; // Laranja

      // Adicionar um cabeçalho com fundo colorido
      doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.rect(0, 0, 210, 35, 'F');

      // Adicionar logo da marca (agora usando a imagem carregada) - tamanho reduzido ainda mais
      if (logoImgData) {
        doc.addImage(logoImgData, 'PNG', 15, 10, 25, 12);
      }

      // Número da fatura no cabeçalho
      doc.setTextColor(255, 255, 255); // Texto branco para o cabeçalho
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(`Nº ${saleData.invoice_number}`, 140, 20, { align: 'right' });

      // Resetar a cor do texto para o resto do documento
      doc.setTextColor(0, 0, 0);

      // Adicionar informações da empresa
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('DOT ANGOLA - LOJA ONLINE DE GIFT CARDS', 20, 45);
      doc.text('www.dotangola.com', 20, 50);
      doc.text('Luanda - Angola', 20, 55);
      doc.text('Email: dotangola@gmail.com', 20, 60); // E-mail atualizado
      doc.text('Tel: +244 923 456 789', 20, 65);

      // Adicionar bordas para seções importantes
      // Seção do cliente
      doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.setFillColor(245, 245, 245);
      doc.roundedRect(20, 75, 80, 40, 3, 3, 'FD');
      
      // Título da seção do cliente
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text('CLIENTE', 25, 85);
      
      // Dados do cliente
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(10);
      doc.text(saleData.customer_name, 25, 95);
      doc.text(saleData.customer_location, 25, 105);

      // Seção da data
      doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.setFillColor(245, 245, 245);
      doc.roundedRect(110, 75, 80, 40, 3, 3, 'FD');
      
      // Título da seção de data
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text('DETALHES', 115, 85);
      
      // Dados da data
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(10);
      doc.text(`Data: ${format(new Date(saleData.date), 'dd/MM/yyyy')}`, 115, 95);
      doc.text(`Método de Pagamento: Transferência`, 115, 105);

      // Adicionar tabela de produtos com estilo melhorado
      // @ts-ignore - A tipagem do autotable não está corretamente definida no TypeScript
      doc.autoTable({
        startY: 125,
        head: [['ARTIGO', 'QUANTIDADE', 'PREÇO UNIT.', 'IVA', 'TOTAL']],
        body: saleData.items.map((item: SaleItem) => [
          item.product_name,
          item.quantity.toFixed(2),
          `${item.unit_price.toLocaleString('pt-AO')} AOA`,
          '0,00',
          `${item.total_price.toLocaleString('pt-AO')} AOA`
        ]),
        theme: 'grid',
        headStyles: {
          fillColor: [primaryColor[0], primaryColor[1], primaryColor[2]],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          halign: 'center',
          valign: 'middle',
          fontSize: 10,
          cellPadding: 6,
        },
        columnStyles: {
          0: { cellWidth: 70 },
          1: { cellWidth: 25, halign: 'center' },
          2: { cellWidth: 35, halign: 'right' },
          3: { cellWidth: 25, halign: 'right' },
          4: { cellWidth: 35, halign: 'right' }
        },
        styles: {
          fontSize: 9,
          font: 'helvetica',
          lineColor: [200, 200, 200],
          lineWidth: 0.1,
        },
        alternateRowStyles: {
          fillColor: [248, 248, 248]
        },
        bodyStyles: {
          cellPadding: 5,
        }
      });

      // Obter a posição Y final da tabela
      const finalY = (doc as any).lastAutoTable.finalY;

      // Adicionar sumário com estilo melhorado
      const summaryX = 130;
      
      // Fundo para o sumário
      doc.setFillColor(245, 245, 245);
      doc.roundedRect(summaryX - 5, finalY + 10, 65, 50, 2, 2, 'F');
      
      // Sumário - linhas normais
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(80, 80, 80);
      doc.text('SUBTOTAL:', summaryX, finalY + 20);
      doc.text('IVA (0%):', summaryX, finalY + 28);
      doc.text('DESCONTO:', summaryX, finalY + 36);
      
      // Valores do sumário
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
      doc.text(`${saleData.total.toLocaleString('pt-AO')} AOA`, summaryX + 45, finalY + 20, { align: 'right' });
      doc.text('0,00 AOA', summaryX + 45, finalY + 28, { align: 'right' });
      doc.text('0,00 AOA', summaryX + 45, finalY + 36, { align: 'right' });
      
      // Linha separadora
      doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.line(summaryX - 3, finalY + 42, summaryX + 58, finalY + 42);
      
      // Total em destaque
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text('TOTAL:', summaryX, finalY + 52);
      doc.text(`${saleData.total.toLocaleString('pt-AO')} AOA`, summaryX + 45, finalY + 52, { align: 'right' });

      // Adicionar assinatura usando a imagem carregada
      if (assinaturaImgData) {
        doc.addImage(assinaturaImgData, 'PNG', 130, finalY + 80, 60, 20);
      }
      
      // Linha para assinatura
      doc.setDrawColor(0);
      doc.line(125, finalY + 105, 190, finalY + 105);
      doc.setFontSize(8);
      doc.setTextColor(80, 80, 80);
      doc.text('Assinatura autorizada', 145, finalY + 112);

      // Adicionar rodapé com políticas e agradecimento
      const footerY = finalY + 130;
      doc.setFillColor(245, 245, 245);
      doc.rect(0, footerY, 210, 25, 'F');
      
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(80, 80, 80);
      
      // Adicionar texto "COMPROVATIVO DE COMPRA" acima do agradecimento
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text('COMPROVATIVO DE COMPRA', 105, footerY + 5, { align: 'center' });
      
      // Texto de agradecimento
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(80, 80, 80);
      doc.text('OBRIGADO PELA SUA COMPRA!', 105, footerY + 12, { align: 'center' });
      doc.text('Este documento serve como comprovativo oficial de compra. Para mais informações, contacte-nos.', 105, footerY + 18, { align: 'center' });

      // Converter o PDF para URL
      const pdfBlob = doc.output('blob');
      const url = URL.createObjectURL(pdfBlob);
      setPdfUrl(url);
      setIsLoading(false);
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      setError('Erro ao gerar PDF do comprovativo');
      setIsLoading(false);
    }
  };

  const downloadPDF = () => {
    if (pdfUrl && sale) {
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = `comprovativo-${sale.invoice_number}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const numeroParaExtenso = (valor: number): string => {
    try {
      // Versão segura, simplificada
      const valorString = Math.floor(valor).toString();
      if (valorString === '0') return 'zero';
      
      if (valor < 1000) {
        return `${valorString}`;
      } else if (valor < 1000000) {
        return `${Math.floor(valor / 1000)} mil ${valor % 1000 > 0 ? valorString.slice(-3) : ''}`;
      } else {
        const milhoes = Math.floor(valor / 1000000);
        return `${milhoes} ${milhoes === 1 ? 'milhão' : 'milhões'}`;
      }
    } catch (error) {
      console.error('Erro ao converter número para extenso:', error);
      return valor.toString();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4">
      <div className="container mx-auto">
        <div className="mb-4 flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => navigate('/admin/sales')}
            className="flex items-center gap-2"
          >
            <ChevronLeft size={16} />
            Voltar para Vendas
          </Button>
          
          {pdfUrl && sale && (
            <Button 
              onClick={downloadPDF}
              className="flex items-center gap-2"
            >
              <Download size={16} />
              Baixar Comprovativo
            </Button>
          )}
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-[80vh]">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-4" />
              <p className="text-gray-500">Gerando PDF...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-[80vh]">
              <p className="text-red-500 mb-2">{error}</p>
              <Button 
                variant="outline" 
                onClick={() => navigate('/admin/sales')}
              >
                Voltar para Vendas
              </Button>
            </div>
          ) : (
            <div className="h-[80vh] flex items-center justify-center">
              {pdfUrl && (
                <iframe 
                  src={pdfUrl} 
                  className="w-full h-full border-0"
                  title="Comprovativo de Compra PDF"
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 