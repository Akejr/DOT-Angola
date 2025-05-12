import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { 
  Calendar as CalendarIcon, 
  Download, 
  FileText, 
  MoreVertical, 
  Plus, 
  Search,
  Trash,
  Edit,
  Receipt,
  ArrowDown,
  DollarSign,
  Loader2,
  ChevronDown,
  X,
  FileDown,
  Check
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import SalesInvoicePDF from './SalesInvoicePDF';
import { Sale, SaleItem } from '@/types/supabase';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import logoImg from '/images/Logo Branco.png'; // Importar o logo para usar no relatório

// Adicionar a interface do plano modificada para incluir o nome
interface GiftCardPlanExtended {
  id: string;
  price: number;
  name?: string;
}

export default function SalesManager() {
  const { toast } = useToast();
  const [isAddSaleDialogOpen, setIsAddSaleDialogOpen] = useState(false);
  
  // Corrigir a inicialização do mês para garantir que use o mês atual corretamente
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState<string>(
    (currentDate.getMonth() + 1).toString().padStart(2, '0')
  );
  const [selectedYear, setSelectedYear] = useState<string>(
    currentDate.getFullYear().toString()
  );
  
  // Corrigir inicialização da data para garantir que a data atual esteja correta
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [customerName, setCustomerName] = useState('');
  const [customerLocation, setCustomerLocation] = useState('');
  const [saleItems, setSaleItems] = useState<SaleItem[]>([]);
  const [productName, setProductName] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [unitPrice, setUnitPrice] = useState(0);
  const [profit, setProfit] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSaleForPDF, setSelectedSaleForPDF] = useState<Sale | null>(null);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);

  // Estado para o produto selecionado do banco de dados
  const [selectedDatabaseProduct, setSelectedDatabaseProduct] = useState<string | null>(null);
  const [isManualEntry, setIsManualEntry] = useState(false);
  const [isAddingItem, setIsAddingItem] = useState(false);

  // Adicionar novos estados para o filtro de produtos e seleção de plano
  const [productFilter, setProductFilter] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [filteredProducts, setFilteredProducts] = useState<Array<{
    id: string;
    name: string;
    plans: GiftCardPlanExtended[];
  }>>([]);

  // Adicionar estado para controle de geração de PDF
  const [isPdfGenerating, setIsPdfGenerating] = useState(false);
  const [isPdfDownloading, setIsPdfDownloading] = useState(false);

  const [saleToDelete, setSaleToDelete] = useState<Sale | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  const [totalSessions, setTotalSessions] = useState({
    day: 0,
    week: 0,
    month: 0,
    year: 0
  });
  const [totalProfit, setTotalProfit] = useState({
    day: 0,
    week: 0,
    month: 0,
    year: 0
  });

  const [editingSale, setEditingSale] = useState<Sale | null>(null);
  const [editingItem, setEditingItem] = useState<SaleItem | null>(null);
  const [editingProfit, setEditingProfit] = useState(0);

  // Função para buscar produtos do banco de dados
  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('gift_cards')
          .select('id, name, plans:gift_card_plans(id, price, name)');
        
        if (error) throw error;
        console.log('Produtos carregados:', data); // Adicionar log para verificar se os produtos estão sendo carregados
        return data || [];
      } catch (error) {
        console.error('Erro ao buscar produtos:', error);
        return [];
      }
    }
  });

  // Função para buscar vendas
  const { 
    data: sales = [], 
    isLoading, 
    refetch 
  } = useQuery({
    queryKey: ['sales', selectedMonth, selectedYear],
    queryFn: async () => {
      const startDate = `${selectedYear}-${selectedMonth}-01`;
      const lastDay = new Date(parseInt(selectedYear), parseInt(selectedMonth), 0).getDate();
      const endDate = `${selectedYear}-${selectedMonth}-${lastDay}`;

      const { data, error } = await supabase
        .from('sales')
        .select('*')
        .gte('date', startDate)
        .lte('date', endDate);

      if (error) throw error;
      return data || [];
    }
  });

  // Função para buscar estatísticas
  const { data: stats, refetch: refetchStats } = useQuery({
    queryKey: ['sales-stats', selectedMonth, selectedYear],
    queryFn: async () => {
      const startDate = `${selectedYear}-${selectedMonth}-01`;
      const lastDay = new Date(parseInt(selectedYear), parseInt(selectedMonth), 0).getDate();
      const endDate = `${selectedYear}-${selectedMonth}-${lastDay}`;

      // Buscar todas as vendas do período
      const { data: salesData, error: salesError } = await supabase
        .from('sales')
        .select('*')
        .gte('date', startDate)
        .lte('date', endDate);

      if (salesError) throw salesError;
      
      // Se não houver dados, retornar zeros
      if (!salesData || salesData.length === 0) {
        return {
          totalSales: 0,
          totalRevenue: 0,
          totalProfit: 0
        };
      }
      
      // Calcular o total de receita e lucro
      const totalRevenue = salesData.reduce((acc, sale) => acc + Number(sale.total), 0);
      const totalProfit = salesData.reduce((acc, sale) => acc + Number(sale.profit || 0), 0);

      return {
        totalSales: salesData.length,
        totalRevenue,
        totalProfit
      };
    }
  });

  // Função auxiliar para recarregar todos os dados
  const refreshAllData = async () => {
    try {
      // Recarregar vendas e estatísticas em paralelo
      await Promise.all([refetch(), refetchStats()]);
    } catch (error) {
      console.error('Erro ao recarregar dados:', error);
    }
  };

  // Adicionar item à venda
  const addItemToSale = () => {
    setIsAddingItem(true);
    
    try {
      if (isManualEntry) {
        if (!productName || quantity <= 0 || unitPrice <= 0) {
          toast({
            title: "Erro ao adicionar item",
            description: "Preencha todos os campos corretamente",
            variant: "destructive"
          });
          return;
        }

        const newItem: SaleItem = {
          id: crypto.randomUUID(),
          product_name: productName,
          quantity,
          unit_price: unitPrice,
          total_price: quantity * unitPrice,
          profit: profit
        };

        setSaleItems([...saleItems, newItem]);
        setProductName('');
        setQuantity(1);
        setUnitPrice(0);
        setProfit(0);
        
        toast({
          title: "Produto adicionado",
          description: `${newItem.product_name} foi adicionado à venda`,
        });
      } else {
        if (!selectedDatabaseProduct) {
          toast({
            title: "Erro ao adicionar item",
            description: "Selecione um produto",
            variant: "destructive"
          });
          return;
        }

        const product = products.find(p => p.id === selectedDatabaseProduct);
        if (!product || !product.plans || !product.plans.length) {
          toast({
            title: "Erro ao adicionar item",
            description: "Produto não encontrado ou sem preço definido",
            variant: "destructive"
          });
          return;
        }

        // Encontrar o plano selecionado ou usar o primeiro plano
        const selectedPlanData = selectedPlan 
          ? product.plans.find(p => p.id === selectedPlan)
          : product.plans[0];
          
        if (!selectedPlanData) {
          toast({
            title: "Erro ao adicionar item",
            description: "Selecione um plano válido",
            variant: "destructive"
          });
          return;
        }

        // Verificar se o produto com este plano específico já existe na lista
        const existingItemIndex = saleItems.findIndex(
          item => item.product_name === `${product.name} - ${selectedPlanData.name || 'Plano Básico'}`
        );

        if (existingItemIndex !== -1) {
          // Se o produto já existir, atualizar a quantidade e o total
          const updatedItems = [...saleItems];
          const existingItem = updatedItems[existingItemIndex];
          const newQuantity = existingItem.quantity + quantity;
          const newTotalPrice = newQuantity * existingItem.unit_price;
          
          updatedItems[existingItemIndex] = {
            ...existingItem,
            quantity: newQuantity,
            total_price: newTotalPrice,
            profit: profit // Atualizar o lucro também
          };
          
          setSaleItems(updatedItems);
          toast({
            title: "Quantidade atualizada",
            description: `Quantidade de ${product.name} atualizada para ${newQuantity}`,
          });
        } else {
          // Se o produto não existir, adicionar como novo item
          const planPrice = parseFloat(selectedPlanData.price.toString()) || 0;
          const planName = selectedPlanData.name || 'Plano Básico';
          
          const newItem: SaleItem = {
            id: crypto.randomUUID(),
            product_name: `${product.name} - ${planName}`,
            quantity,
            unit_price: planPrice,
            total_price: quantity * planPrice,
            profit: profit
          };

          setSaleItems([...saleItems, newItem]);
          toast({
            title: "Produto adicionado",
            description: `${newItem.product_name} foi adicionado à venda`,
          });
        }

        setSelectedDatabaseProduct(null);
        setSelectedPlan(null);
        setQuantity(1);
        setProfit(0);
        setProductFilter('');
      }
    } finally {
      setIsAddingItem(false);
    }
  };

  // Remover item da venda
  const removeItem = (id: string) => {
    setSaleItems(saleItems.filter(item => item.id !== id));
  };

  // Limpar formulário
  const clearForm = () => {
    setCustomerName('');
    setCustomerLocation('');
    setSaleItems([]);
    setDate(new Date());
    setSelectedDatabaseProduct(null);
    setSelectedPlan(null);
    setProductFilter('');
    setProductName('');
    setQuantity(1);
    setUnitPrice(0);
    setIsManualEntry(false);
  };

  // Salvar venda (atualizar para usar refreshAllData)
  const saveSale = async () => {
    if (!customerName || !customerLocation || saleItems.length === 0 || !date) {
      toast({
        title: "Erro ao salvar venda",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }

    // Formatar items para garantir compatibilidade com o formato JSONB do Supabase
    const formattedItems = saleItems.map(item => ({
      id: item.id,
      product_name: item.product_name,
      quantity: Number(item.quantity),
      unit_price: Number(item.unit_price),
      total_price: Number(item.total_price),
      profit: Number(item.profit || 0)
    }));

    const totalAmount = formattedItems.reduce((acc, item) => acc + item.total_price, 0);
    const totalProfit = formattedItems.reduce((acc, item) => acc + (item.profit || 0), 0);
    const invoiceNumber = `${Date.now().toString().slice(-5)}`;

    const newSale = {
      customer_name: customerName.trim(),
      customer_location: customerLocation.trim(),
      date: format(date, 'yyyy-MM-dd'),
      items: formattedItems,
      total: Number(totalAmount),
      profit: Number(totalProfit),
      invoice_number: invoiceNumber
    };

    console.log('Tentando salvar venda:', JSON.stringify(newSale));

    try {
      // Tenta salvar com formato JSONB correto
      const { data, error } = await supabase
        .from('sales')
        .insert([{
          ...newSale,
          // Não converter para string, deixar como objeto para o Supabase tratar como JSONB
          items: formattedItems
        }]);

      console.log('Resposta do Supabase:', { data, error });

      if (error) {
        console.error('Erro detalhado do Supabase:', error);
        
        // Se o erro for de formato JSON, tenta corrigir e reenviar
        if (error.message?.includes('JSON')) {
          const fallbackSale = {
            ...newSale,
            items: JSON.stringify(formattedItems)
          };
          
          console.log('Tentando formato alternativo:', fallbackSale);
          
          const { data: retryData, error: retryError } = await supabase
            .from('sales')
            .insert([fallbackSale]);
            
          if (retryError) {
            console.error('Erro na segunda tentativa:', retryError);
            throw retryError;
          }
          
          console.log('Segunda tentativa bem-sucedida:', retryData);
        } else {
          throw error;
        }
      }
      
      toast({
        title: "Venda registrada",
        description: "A venda foi registrada com sucesso",
      });

      // Desativar a geração automática de PDF após salvar
      // Vamos agora primeiro fechar o diálogo e limpar o formulário
      clearForm();
      setIsAddSaleDialogOpen(false);
      
      // Recarregar todos os dados
      await refreshAllData();
      
    } catch (error) {
      console.error('Erro ao registrar venda:', error);
      toast({
        title: "Erro ao registrar venda",
        description: error.message || "Não foi possível salvar a venda",
        variant: "destructive"
      });
    }
  };

  // Handler para geração do PDF com controle de estado
  const handlePdfGenerated = (blob: Blob) => {
    try {
      setPdfBlob(blob);
      
      // Depois de gerar, pode fazer o download automático
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `fatura-${selectedSaleForPDF?.invoice_number || 'nova'}.pdf`;
      
      // Usar setTimeout para evitar problemas de renderização
      setTimeout(() => {
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        // Limpar a URL após o download
        URL.revokeObjectURL(url);
        setIsPdfDownloading(false);
        setSelectedSaleForPDF(null);
        setPdfBlob(null);
        
        toast({
          title: "PDF gerado",
          description: "O PDF da fatura foi baixado com sucesso",
        });
      }, 100);
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      setIsPdfDownloading(false);
      toast({
        title: "Erro ao gerar PDF",
        description: "Não foi possível gerar o PDF da fatura",
        variant: "destructive"
      });
    }
  };

  // Download do PDF para uma venda específica com controle de estado
  const downloadPDF = (sale: Sale) => {
    try {
      setIsPdfDownloading(true);
      
      // Preparar dados da venda para serem passados como parâmetros de URL
      const saleData = {
        id: sale.id,
        invoice_number: sale.invoice_number,
        customer_name: sale.customer_name,
        customer_location: sale.customer_location,
        date: sale.date,
        total: sale.total,
        items: sale.items
      };
      
      // Codificar os dados como JSON e depois como URI para evitar problemas de caracteres especiais
      const encodedSaleData = encodeURIComponent(JSON.stringify(saleData));
      
      // Abrir em nova janela ou aba, enviando os dados como parâmetro de consulta
      const pdfWindow = window.open(`/admin/invoice-pdf?data=${encodedSaleData}`, '_blank');
      
      // Se não conseguir abrir a janela, criar o PDF diretamente
      if (!pdfWindow) {
        setSelectedSaleForPDF(sale);
      } else {
        // Resetar estados após abrir a janela
        setTimeout(() => {
          setIsPdfDownloading(false);
        }, 500);
      }
    } catch (error) {
      console.error('Erro ao iniciar download de PDF:', error);
      setIsPdfDownloading(false);
      toast({
        title: "Erro ao preparar PDF",
        description: "Não foi possível iniciar a geração do PDF",
        variant: "destructive"
      });
    }
  };

  // Filtrar vendas por termo de busca
  const filteredSales = sales.filter(sale => 
    sale.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sale.invoice_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calcular total de vendas e faturação para o mês selecionado
  const totalSales = stats?.totalSales || 0;
  const totalRevenue = stats?.totalRevenue || 0;

  // Calcular totais
  const totalItems = saleItems.reduce((acc, item) => acc + item.quantity, 0);
  const totalAmount = saleItems.reduce((acc, item) => acc + item.total_price, 0);

  // Anos disponíveis para filtro (últimos 5 anos)
  const availableYears = Array.from({ length: 5 }, (_, i) => 
    (new Date().getFullYear() - i).toString()
  );

  // Adicionar um useEffect para filtrar produtos com base no texto digitado
  useEffect(() => {
    if (products) {
      if (!productFilter.trim()) {
        setFilteredProducts(products);
      } else {
        const filtered = products.filter(product => 
          product.name.toLowerCase().includes(productFilter.toLowerCase())
        );
        setFilteredProducts(filtered);
      }
    }
  }, [productFilter, products]);

  // Inicializar os produtos filtrados quando o componente carregar
  useEffect(() => {
    setFilteredProducts(products);
  }, [products]);

  // Excluir venda (atualizar para usar refreshAllData)
  const deleteSale = async (id: string) => {
    try {
      setIsDeleting(true);
      
      const { error } = await supabase
        .from('sales')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast({
        title: "Venda excluída",
        description: "A venda foi excluída com sucesso",
      });
      
      // Recarregar todos os dados
      await refreshAllData();
    } catch (error) {
      console.error('Erro ao excluir venda:', error);
      toast({
        title: "Erro ao excluir venda",
        description: error.message || "Não foi possível excluir a venda",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
      setSaleToDelete(null);
      setIsDeleteDialogOpen(false);
    }
  };
  
  // Handler para iniciar o processo de exclusão
  const handleDeleteClick = (sale: Sale) => {
    setSaleToDelete(sale);
    setIsDeleteDialogOpen(true);
  };
  
  // Handler para cancelar a exclusão
  const handleCancelDelete = () => {
    setSaleToDelete(null);
    setIsDeleteDialogOpen(false);
  };

  // Handler para confirmar a exclusão
  const handleConfirmDelete = () => {
    if (saleToDelete) {
      deleteSale(saleToDelete.id);
    }
  };

  // Função para formatar a data corretamente considerando o timezone
  const formatDateWithTimezone = (dateString: string) => {
    // Adicionar a hora no formato ISO para evitar problemas de timezone
    const dateWithTime = new Date(`${dateString}T12:00:00`);
    return format(dateWithTime, 'dd/MM/yyyy');
  };

  // Gerar relatório mensal em PDF
  const generateMonthlyReport = async () => {
    try {
      setIsGeneratingReport(true);
      
      // Importar jsPDF dinamicamente para evitar problemas de SSR
      const { jsPDF } = await import('jspdf');
      await import('jspdf-autotable');
      
      // Preparar dados do mês selecionado para o título - corrigir formatação da data
      const monthDate = new Date(`${selectedYear}-${selectedMonth}-15T12:00:00`);
      const monthName = format(monthDate, 'MMMM yyyy', { locale: pt });
      
      // Criar uma nova instância do jsPDF
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      // Carregar o logo
      const logoResponse = await fetch(logoImg);
      const logoBlob = await logoResponse.blob();
      const logoBase64 = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(logoBlob);
      });
      
      // Definir cores da empresa
      const primaryColor = [1, 4, 45]; // Azul #01042D em RGB
      
      // Adicionar um cabeçalho com fundo colorido
      doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.rect(0, 0, 210, 35, 'F');
      
      // Adicionar logo
      if (logoBase64) {
        doc.addImage(logoBase64 as string, 'PNG', 15, 10, 25, 12);
      }
      
      // Título do relatório
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text(`RELATÓRIO MENSAL`, 105, 20, { align: 'center' });
      
      doc.setFontSize(14);
      doc.text(monthName.toUpperCase(), 105, 30, { align: 'center' });
      
      // Resetar a cor do texto
      doc.setTextColor(0, 0, 0);
      
      // Informações da empresa
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('DOT ANGOLA - LOJA ONLINE DE GIFT CARDS', 105, 45, { align: 'center' });
      doc.text('www.dotangola.com', 105, 50, { align: 'center' });
      
      // Dados do relatório
      doc.setFillColor(245, 245, 245);
      doc.roundedRect(20, 60, 170, 50, 3, 3, 'F');
      
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text('RESUMO DE VENDAS', 105, 75, { align: 'center' });
      
      // Informações de vendas
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(80, 80, 80);
      
      // Adicionar tabela de vendas se houver vendas
      if (sales.length > 0) {
        let finalY = 120;
        
        // @ts-ignore - A tipagem do autotable não está corretamente definida no TypeScript
        doc.autoTable({
          startY: 120,
          head: [['Nº Fatura', 'Cliente', 'Data', 'Total (AOA)', 'Lucro (AOA)']],
          body: sales.map((sale) => [
            sale.invoice_number,
            sale.customer_name,
            formatDateWithTimezone(sale.date),
            sale.total.toLocaleString('pt-AO'),
            (sale.profit || 0).toLocaleString('pt-AO')
          ]),
          theme: 'grid',
          headStyles: {
            fillColor: [primaryColor[0], primaryColor[1], primaryColor[2]],
            textColor: [255, 255, 255],
            fontStyle: 'bold',
            halign: 'center'
          },
          alternateRowStyles: {
            fillColor: [245, 245, 245]
          },
          didDrawPage: function(data) {
            finalY = data.cursor.y;
          }
        });

        // Adicionar totais
        const totalRevenue = sales.reduce((acc, sale) => acc + sale.total, 0);
        const totalProfit = sales.reduce((acc, sale) => acc + (sale.profit || 0), 0);

        doc.setFontSize(12);
        doc.setTextColor(100, 100, 100);
        doc.text(`Total de Vendas: ${sales.length}`, 20, finalY + 10);
        doc.text(`Faturação Total: ${totalRevenue.toLocaleString('pt-AO')} AOA`, 20, finalY + 20);
        doc.text(`Lucro Total: ${totalProfit.toLocaleString('pt-AO')} AOA`, 20, finalY + 30);
      } else {
        doc.setFontSize(12);
        doc.setTextColor(100, 100, 100);
        doc.text('Nenhuma venda registrada neste período', 105, 130, { align: 'center' });
      }
      
      // Rodapé
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        const pageHeight = doc.internal.pageSize.height;
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.text(`Gerado em ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, 105, pageHeight - 10, { align: 'center' });
      }
      
      // Baixar o PDF
      doc.save(`Relatorio-Vendas-${selectedMonth}-${selectedYear}.pdf`);
      
      toast({
        title: "Relatório gerado",
        description: "O relatório mensal foi baixado com sucesso",
      });
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
      toast({
        title: "Erro ao gerar relatório",
        description: "Não foi possível gerar o relatório mensal",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingReport(false);
    }
  };

  // Função para editar item
  const editItem = (item: SaleItem) => {
    setEditingItem(item);
    setEditingProfit(item.profit || 0);
  };

  // Função para salvar edição do item
  const saveItemEdit = () => {
    if (!editingItem) return;

    const updatedItems = saleItems.map(item => {
      if (item.id === editingItem.id) {
        const updatedItem = {
          ...item,
          profit: editingProfit,
          total_price: item.quantity * item.unit_price
        };
        console.log('Item atualizado:', updatedItem); // Log para debug
        return updatedItem;
      }
      return item;
    });

    console.log('Lista de itens atualizada:', updatedItems); // Log para debug
    setSaleItems(updatedItems);
    setEditingItem(null);
    setEditingProfit(0);

    // Mostrar toast de confirmação
    toast({
      title: "Item atualizado",
      description: "O lucro do item foi atualizado com sucesso",
    });
  };

  // Função para editar venda
  const editSale = (sale: Sale) => {
    setEditingSale(sale);
    setCustomerName(sale.customer_name);
    setCustomerLocation(sale.customer_location);
    setDate(new Date(sale.date));
    setSaleItems(sale.items);
    setIsAddSaleDialogOpen(true);
  };

  // Função para salvar edição da venda
  const saveSaleEdit = async () => {
    if (!editingSale) return;

    const totalAmount = saleItems.reduce((acc, item) => acc + item.total_price, 0);
    const totalProfit = saleItems.reduce((acc, item) => acc + (item.profit || 0), 0);

    console.log('Salvando venda com itens:', saleItems); // Log para debug
    console.log('Lucro total calculado:', totalProfit); // Log para debug

    const updatedSale = {
      ...editingSale,
      customer_name: customerName.trim(),
      customer_location: customerLocation.trim(),
      date: format(date!, 'yyyy-MM-dd'),
      items: saleItems.map(item => ({
        ...item,
        profit: item.profit || 0 // Garantir que o lucro seja um número
      })),
      total: totalAmount,
      profit: totalProfit
    };

    try {
      console.log('Dados a serem enviados:', updatedSale); // Log para debug

      const { error } = await supabase
        .from('sales')
        .update(updatedSale)
        .eq('id', editingSale.id);

      if (error) {
        console.error('Erro do Supabase:', error); // Log para debug
        throw error;
      }

      toast({
        title: "Venda atualizada",
        description: "A venda foi atualizada com sucesso",
      });

      await refreshAllData();
      setIsAddSaleDialogOpen(false);
      clearForm();
      setEditingSale(null);
    } catch (error) {
      console.error('Erro ao atualizar venda:', error);
      toast({
        title: "Erro ao atualizar venda",
        description: error.message || "Não foi possível atualizar a venda",
        variant: "destructive"
      });
    }
  };

  // Atualizar o botão de salvar no dialog
  const handleSaveSale = () => {
    if (editingSale) {
      saveSaleEdit();
    } else {
      saveSale();
    }
  };

  return (
    <div className="space-y-6">
      {/* Componente oculto para gerar PDF */}
      {selectedSaleForPDF && !isPdfGenerating && (
        <div className="hidden">
          <SalesInvoicePDF 
            sale={selectedSaleForPDF} 
            onGenerated={(blob) => {
              setIsPdfGenerating(true);
              handlePdfGenerated(blob);
              setIsPdfGenerating(false);
            }} 
          />
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Gestão de Vendas</h2>
          <p className="text-muted-foreground">
            Gerencie todas as vendas e faturas em um só lugar
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={generateMonthlyReport} disabled={isGeneratingReport} className="flex items-center gap-2">
            {isGeneratingReport ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Gerando...</span>
              </>
            ) : (
              <>
                <FileDown className="h-4 w-4" />
                <span>Relatório Mensal</span>
              </>
            )}
          </Button>
          <Button onClick={() => setIsAddSaleDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Nova Venda
          </Button>
        </div>
      </div>

      {/* Cards de estatísticas */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Vendas</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSales}</div>
            <p className="text-xs text-muted-foreground">
              {format(new Date(`${selectedYear}-${selectedMonth}-15T12:00:00`), 'MMMM yyyy', { locale: pt })}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Faturação Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRevenue.toLocaleString('pt-AO')} AOA</div>
            <p className="text-xs text-muted-foreground">
              {format(new Date(`${selectedYear}-${selectedMonth}-15T12:00:00`), 'MMMM yyyy', { locale: pt })}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lucro Total</CardTitle>
            <ArrowDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalProfit.toLocaleString('pt-AO')} AOA</div>
            <div className="flex items-center gap-2">
              <p className="text-xs text-muted-foreground">
                {format(new Date(`${selectedYear}-${selectedMonth}-15T12:00:00`), 'MMMM yyyy', { locale: pt })}
              </p>
              {stats?.totalRevenue > 0 && (
                <p className="text-xs text-green-600 font-medium">
                  {((stats?.totalProfit / stats?.totalRevenue) * 100).toFixed(1)}% de margem
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar vendas..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="flex flex-col md:flex-row gap-2">
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Selecione o mês" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="01">Janeiro</SelectItem>
              <SelectItem value="02">Fevereiro</SelectItem>
              <SelectItem value="03">Março</SelectItem>
              <SelectItem value="04">Abril</SelectItem>
              <SelectItem value="05">Maio</SelectItem>
              <SelectItem value="06">Junho</SelectItem>
              <SelectItem value="07">Julho</SelectItem>
              <SelectItem value="08">Agosto</SelectItem>
              <SelectItem value="09">Setembro</SelectItem>
              <SelectItem value="10">Outubro</SelectItem>
              <SelectItem value="11">Novembro</SelectItem>
              <SelectItem value="12">Dezembro</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Selecione o ano" />
            </SelectTrigger>
            <SelectContent>
              {availableYears.map(year => (
                <SelectItem key={year} value={year}>{year}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tabela de vendas */}
      <div className="rounded-md border">
        <div className="max-h-[500px] overflow-y-auto">
          <Table>
            <TableHeader className="sticky top-0 bg-background z-10">
              <TableRow>
                <TableHead>Nº Fatura</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Produto(s)</TableHead>
                <TableHead>Data</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10">
                    Carregando...
                  </TableCell>
                </TableRow>
              ) : filteredSales.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                    Nenhuma venda encontrada para o período selecionado
                  </TableCell>
                </TableRow>
              ) : (
                filteredSales.map((sale) => (
                  <TableRow key={sale.id}>
                    <TableCell className="font-medium">{sale.invoice_number}</TableCell>
                    <TableCell>{sale.customer_name}</TableCell>
                    <TableCell>
                      {/* Mostrar os produtos da venda - limitado a 2 com indicação de mais */}
                      {sale.items?.length > 0 ? (
                        <div>
                          {sale.items.slice(0, 2).map((item, index) => (
                            <div key={index} className="truncate text-sm">
                              {item.product_name}
                            </div>
                          ))}
                          {sale.items.length > 2 && (
                            <div className="text-xs text-muted-foreground mt-1">
                              + {sale.items.length - 2} mais
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">Sem produtos</span>
                      )}
                    </TableCell>
                    <TableCell>{formatDateWithTimezone(sale.date)}</TableCell>
                    <TableCell className="text-right">{sale.total.toLocaleString('pt-AO')} AOA</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Abrir menu</span>
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem 
                            onClick={() => downloadPDF(sale)}
                            disabled={isPdfDownloading}
                          >
                            {isPdfDownloading ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                <span>Gerando PDF...</span>
                              </>
                            ) : (
                              <>
                                <Download className="mr-2 h-4 w-4" />
                                <span>Download PDF</span>
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => editSale(sale)}>
                            <Edit className="mr-2 h-4 w-4" />
                            <span>Editar</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeleteClick(sale)}
                            className="text-red-600"
                          >
                            <Trash className="mr-2 h-4 w-4" />
                            <span>Excluir</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Dialog para adicionar/editar venda */}
      <Dialog open={isAddSaleDialogOpen} onOpenChange={setIsAddSaleDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto" style={{ zIndex: 50 }}>
          <DialogHeader>
            <DialogTitle>{editingSale ? 'Editar Venda' : 'Registar Nova Venda'}</DialogTitle>
            <DialogDescription>
              {editingSale ? 'Atualize os detalhes da venda' : 'Adicione os detalhes da venda e itens vendidos'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {/* Informações do Cliente */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="customerName">Nome do Cliente</Label>
                <Input 
                  id="customerName" 
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Ex: João Silva"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customerLocation">Localização</Label>
                <Input 
                  id="customerLocation" 
                  value={customerLocation}
                  onChange={(e) => setCustomerLocation(e.target.value)}
                  placeholder="Ex: Luanda, Angola"
                />
              </div>
            </div>

            {/* Data da Venda */}
            <div className="space-y-2">
              <Label htmlFor="date">Data da Venda</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, 'dd/MM/yyyy') : <span>Selecione uma data</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Tipo de entrada de produto */}
            <div className="space-y-2">
              <Label>Tipo de Entrada de Produto</Label>
              <div className="flex space-x-4">
                <div className="flex items-center space-x-2">
                  <input 
                    type="radio" 
                    id="database" 
                    name="entryType" 
                    checked={!isManualEntry}
                    onChange={() => setIsManualEntry(false)}
                  />
                  <label htmlFor="database">Do Banco de Dados</label>
                </div>
                <div className="flex items-center space-x-2">
                  <input 
                    type="radio" 
                    id="manual" 
                    name="entryType" 
                    checked={isManualEntry}
                    onChange={() => setIsManualEntry(true)}
                  />
                  <label htmlFor="manual">Entrada Manual</label>
                </div>
              </div>
            </div>

            {/* Adicionar Itens */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium">Adicionar Item</div>
                {saleItems.length > 0 && (
                  <div className="text-xs text-muted-foreground">
                    {totalItems} {totalItems === 1 ? 'item' : 'itens'} | Total: {totalAmount.toLocaleString('pt-AO')} AOA
                  </div>
                )}
              </div>
              {isManualEntry ? (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="productName">Nome do Produto</Label>
                    <Input 
                      id="productName" 
                      value={productName}
                      onChange={(e) => setProductName(e.target.value)}
                      placeholder="Ex: Drone DJI Mavic 3"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="quantity">Quantidade</Label>
                    <Input 
                      id="quantity" 
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="unitPrice">Preço Unitário (AOA)</Label>
                    <Input 
                      id="unitPrice" 
                      type="number"
                      min="0"
                      value={unitPrice}
                      onChange={(e) => setUnitPrice(parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="profit">Lucro (AOA)</Label>
                    <Input 
                      id="profit" 
                      type="number"
                      min="0"
                      value={profit}
                      onChange={(e) => setProfit(parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2 relative">
                    <Label htmlFor="productSearch">Buscar Produto</Label>
                    <div className="relative">
                      <Input
                        id="productSearch"
                        placeholder="Digite para buscar produtos..."
                        value={productFilter}
                        onChange={(e) => {
                          setProductFilter(e.target.value);
                          setSelectedDatabaseProduct(null);
                          setSelectedPlan(null);
                        }}
                        className="w-full pr-10"
                      />
                      {productFilter && (
                        <button
                          type="button"
                          onClick={() => {
                            setProductFilter('');
                            setSelectedDatabaseProduct(null);
                            setSelectedPlan(null);
                          }}
                          className="absolute inset-y-0 right-0 flex items-center pr-3"
                        >
                          <X className="h-4 w-4 opacity-70" />
                        </button>
                      )}
                    </div>
                    
                    {productFilter && filteredProducts.length > 0 && !selectedDatabaseProduct && (
                      <div className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                        <div className="max-h-60 overflow-y-auto">
                          {filteredProducts.map((product) => (
                            <div
                              key={product.id}
                              className="relative cursor-pointer select-none py-2 px-4 hover:bg-slate-100"
                              onClick={() => {
                                setSelectedDatabaseProduct(product.id);
                                setProductFilter(product.name);
                                if (product.plans && product.plans.length === 1) {
                                  setSelectedPlan(product.plans[0].id);
                                }
                              }}
                            >
                              {product.name}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {selectedDatabaseProduct && (
                    <div className="space-y-2">
                      <Label htmlFor="planSelect">Plano</Label>
                      <div className="relative">
                        <select
                          id="planSelect"
                          value={selectedPlan || ''}
                          onChange={(e) => {
                            console.log('Plano selecionado:', e.target.value);
                            setSelectedPlan(e.target.value);
                          }}
                          className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                        >
                          <option value="" disabled>Selecione um plano</option>
                          {products
                            .find(p => p.id === selectedDatabaseProduct)?.plans
                            .map((plan) => (
                              <option key={plan.id} value={plan.id}>
                                {plan.name || 'Plano Básico'} - {parseFloat(plan.price.toString()).toLocaleString('pt-AO')} AOA
                              </option>
                            ))}
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                          <ChevronDown className="h-4 w-4 opacity-50" />
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="quantity">Quantidade</Label>
                      <Input 
                        id="quantity" 
                        type="number"
                        min="1"
                        value={quantity}
                        onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="profit">Lucro (AOA)</Label>
                      <Input 
                        id="profit" 
                        type="number"
                        min="0"
                        value={profit}
                        onChange={(e) => setProfit(parseFloat(e.target.value) || 0)}
                      />
                    </div>
                  </div>
                </div>
              )}
              <Button 
                type="button" 
                onClick={addItemToSale} 
                className="w-full"
                disabled={isAddingItem}
              >
                {isAddingItem ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adicionando...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" /> 
                    Adicionar Item
                  </>
                )}
              </Button>
            </div>

            {/* Tabela de itens com edição */}
            {saleItems.length > 0 && (
              <div className="space-y-2">
                <div className="text-sm font-medium">
                  Itens Adicionados <span className="text-xs font-normal text-muted-foreground">({saleItems.length} {saleItems.length === 1 ? 'item' : 'itens'})</span>
                </div>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Produto</TableHead>
                        <TableHead className="text-right">Qtd</TableHead>
                        <TableHead className="text-right">Preço Unit.</TableHead>
                        <TableHead className="text-right">Lucro</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {saleItems.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>{item.product_name}</TableCell>
                          <TableCell className="text-right">{item.quantity}</TableCell>
                          <TableCell className="text-right">{item.unit_price.toLocaleString('pt-AO')} AOA</TableCell>
                          <TableCell className="text-right">
                            {editingItem?.id === item.id ? (
                              <Input
                                type="number"
                                min="0"
                                value={editingProfit}
                                onChange={(e) => setEditingProfit(parseFloat(e.target.value) || 0)}
                                className="w-24"
                              />
                            ) : (
                              item.profit?.toLocaleString('pt-AO') || '0'
                            )} AOA
                          </TableCell>
                          <TableCell className="text-right">{item.total_price.toLocaleString('pt-AO')} AOA</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              {editingItem?.id === item.id ? (
                                <>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={saveItemEdit}
                                    className="h-8 w-8 p-0 text-green-600"
                                  >
                                    <Check className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      setEditingItem(null);
                                      setEditingProfit(0);
                                    }}
                                    className="h-8 w-8 p-0 text-red-600"
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </>
                              ) : (
                                <>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => editItem(item)}
                                    className="h-8 w-8 p-0"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeItem(item.id)}
                                    className="h-8 w-8 p-0 text-red-600"
                                  >
                                    <Trash className="h-4 w-4" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow>
                        <TableCell colSpan={3} className="text-right font-bold">Total:</TableCell>
                        <TableCell className="text-right font-bold">
                          {saleItems.reduce((acc, item) => acc + (item.profit || 0), 0).toLocaleString('pt-AO')} AOA
                        </TableCell>
                        <TableCell className="text-right font-bold">
                          {totalAmount.toLocaleString('pt-AO')} AOA
                        </TableCell>
                        <TableCell></TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsAddSaleDialogOpen(false);
              clearForm();
              setEditingSale(null);
            }}>
              Cancelar
            </Button>
            <Button 
              type="button" 
              onClick={handleSaveSale}
              disabled={saleItems.length === 0 || !customerName || !customerLocation || !date}
            >
              {editingSale ? 'Salvar Alterações' : 'Salvar Venda'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Dialog de confirmação de exclusão */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta venda? Esta ação não pode ser desfeita.
              {saleToDelete && (
                <div className="mt-2 p-3 bg-slate-50 rounded border text-sm">
                  <p><strong>Cliente:</strong> {saleToDelete.customer_name}</p>
                  <p><strong>Fatura:</strong> {saleToDelete.invoice_number}</p>
                  <p><strong>Total:</strong> {saleToDelete.total.toLocaleString('pt-AO')} AOA</p>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelDelete}>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Excluindo...
                </>
              ) : (
                'Excluir'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 