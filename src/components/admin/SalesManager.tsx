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
  const [quantity, setQuantity] = useState<number | string>(1);
  const [unitPrice, setUnitPrice] = useState<number | string>(0);
  const [profit, setProfit] = useState<number | string>(0);
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

  // Funções auxiliares para conversão de valores
  const getNumericValue = (value: number | string): number => {
    if (typeof value === 'string') {
      const parsed = parseFloat(value);
      return isNaN(parsed) ? 0 : parsed;
    }
    return value;
  };

  const getQuantityValue = (value: number | string): number => {
    const numeric = getNumericValue(value);
    return numeric <= 0 ? 1 : numeric;
  };

  // Função para buscar produtos do banco de dados
  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('gift_cards')
          .select('id, name, plans:gift_card_plans(id, price, name, currency)');
        
        if (error) throw error;
        console.log('Produtos carregados:', data); // Adicionar log para verificar se os produtos estão sendo carregados
        return data || [];
      } catch (error) {
        console.error('Erro ao buscar produtos:', error);
        return [];
      }
    }
  });

  // Buscar taxas de câmbio
  const { data: exchangeRates = [] } = useQuery({
    queryKey: ['exchange-rates'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('exchange_rates')
          .select('*')
          .order('currency');
        
        if (error) throw error;
        return data || [];
      } catch (error) {
        console.error('Erro ao buscar taxas de câmbio:', error);
        return [];
      }
    }
  });

  // Função para converter preço para Kwanzas
  const convertToKwanzas = (price: number, currency: string): number => {
    if (currency === 'KWZ') {
      return price;
    }
    
    const rate = exchangeRates.find(r => r.currency === currency);
    if (rate) {
      const converted = price * rate.rate;
      console.log(`Convertendo ${price} ${currency} para ${converted.toFixed(2)} KWZ (taxa: ${rate.rate})`);
      return converted;
    }
    
    console.warn(`Taxa de câmbio não encontrada para ${currency}, usando preço original`);
    return price;
  };

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
        const numericQuantity = getQuantityValue(quantity);
        const numericUnitPrice = getNumericValue(unitPrice);
        const numericProfit = getNumericValue(profit);

        if (!productName || numericQuantity <= 0 || numericUnitPrice <= 0) {
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
          quantity: numericQuantity,
          unit_price: numericUnitPrice,
          total_price: numericQuantity * numericUnitPrice,
          profit: numericProfit
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

        const numericQuantity = getQuantityValue(quantity);
        const numericProfit = getNumericValue(profit);

        // Verificar se o produto com este plano específico já existe na lista
        const existingItemIndex = saleItems.findIndex(
          item => item.product_name === `${product.name} - ${selectedPlanData.name || 'Plano Básico'}`
        );

        if (existingItemIndex !== -1) {
          // Se o produto já existir, atualizar a quantidade e o total
          const updatedItems = [...saleItems];
          const existingItem = updatedItems[existingItemIndex];
          const newQuantity = existingItem.quantity + numericQuantity;
          const newTotalPrice = newQuantity * existingItem.unit_price;
          
          updatedItems[existingItemIndex] = {
            ...existingItem,
            quantity: newQuantity,
            total_price: newTotalPrice,
            profit: numericProfit // Atualizar o lucro também
          };
          
          setSaleItems(updatedItems);
          toast({
            title: "Quantidade atualizada",
            description: `Quantidade de ${product.name} atualizada para ${newQuantity}`,
          });
        } else {
          // Se o produto não existir, adicionar como novo item
          const planPrice = parseFloat(selectedPlanData.price.toString()) || 0;
          const planCurrency = selectedPlanData.currency || 'EUR';
          const planName = selectedPlanData.name || 'Plano Básico';
          
          // Converter preço para Kwanzas
          const priceInKwanzas = convertToKwanzas(planPrice, planCurrency);
          
          const newItem: SaleItem = {
            id: crypto.randomUUID(),
            product_name: `${product.name} - ${planName}`,
            quantity: numericQuantity,
            unit_price: priceInKwanzas,
            total_price: numericQuantity * priceInKwanzas,
            profit: numericProfit
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
    <div className="w-full max-w-full overflow-hidden">
      <div className="space-y-4 sm:space-y-6">
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

        {/* Cabeçalho */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div className="min-w-0 flex-1">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight truncate">Gestão de Vendas</h2>
            <p className="text-xs sm:text-sm text-muted-foreground truncate">
              Gerencie todas as vendas e faturas em um só lugar
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Button 
              variant="outline" 
              onClick={generateMonthlyReport} 
              disabled={isGeneratingReport} 
              className="flex items-center gap-2 w-full sm:w-auto text-xs sm:text-sm"
              size="sm"
            >
              {isGeneratingReport ? (
                <>
                  <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                  <span className="hidden sm:inline">Gerando...</span>
                  <span className="sm:hidden">Gerando</span>
                </>
              ) : (
                <>
                  <FileDown className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Relatório Mensal</span>
                  <span className="sm:hidden">Relatório</span>
                </>
              )}
            </Button>
            <Button onClick={() => setIsAddSaleDialogOpen(true)} className="w-full sm:w-auto [font-size:16px] sm:text-sm" size="sm">
              <Plus className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Nova Venda</span>
              <span className="sm:hidden">Nova</span>
            </Button>
          </div>
        </div>

        {/* Cards de estatísticas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <Card className="min-w-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
              <CardTitle className="text-xs sm:text-sm font-medium truncate">Total de Vendas</CardTitle>
              <Receipt className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
            </CardHeader>
            <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
              <div className="text-lg sm:text-2xl font-bold">{totalSales}</div>
              <p className="text-xs text-muted-foreground truncate">
                {format(new Date(`${selectedYear}-${selectedMonth}-15T12:00:00`), 'MMM yyyy', { locale: pt })}
              </p>
            </CardContent>
          </Card>
          
          <Card className="min-w-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
              <CardTitle className="text-xs sm:text-sm font-medium truncate">Faturação Total</CardTitle>
              <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
            </CardHeader>
            <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
              <div className="text-lg sm:text-2xl font-bold truncate">{totalRevenue.toLocaleString('pt-AO')} AOA</div>
              <p className="text-xs text-muted-foreground truncate">
                {format(new Date(`${selectedYear}-${selectedMonth}-15T12:00:00`), 'MMM yyyy', { locale: pt })}
              </p>
            </CardContent>
          </Card>
          
          <Card className="min-w-0 sm:col-span-2 lg:col-span-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
              <CardTitle className="text-xs sm:text-sm font-medium truncate">Lucro Total</CardTitle>
              <ArrowDown className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
            </CardHeader>
            <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
              <div className="text-lg sm:text-2xl font-bold truncate">{stats?.totalProfit.toLocaleString('pt-AO')} AOA</div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                <p className="text-xs text-muted-foreground truncate">
                  {format(new Date(`${selectedYear}-${selectedMonth}-15T12:00:00`), 'MMM yyyy', { locale: pt })}
                </p>
                {stats?.totalRevenue > 0 && (
                  <p className="text-xs text-green-600 font-medium truncate">
                    {((stats?.totalProfit / stats?.totalRevenue) * 100).toFixed(1)}% margem
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <div className="flex flex-col gap-3 sm:gap-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar vendas..."
              className="pl-8 sm:pl-10 [font-size:16px] sm:text-sm h-8 sm:h-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-2 sm:flex sm:gap-2">
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-full sm:w-[140px] lg:w-[180px] [font-size:16px] sm:text-sm h-8 sm:h-10">
                <SelectValue placeholder="Mês" />
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
              <SelectTrigger className="w-full sm:w-[120px] lg:w-[140px] [font-size:16px] sm:text-sm h-8 sm:h-10">
                <SelectValue placeholder="Ano" />
              </SelectTrigger>
              <SelectContent>
                {availableYears.map(year => (
                  <SelectItem key={year} value={year}>{year}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Tabela de vendas - Mobile first com scroll horizontal controlado */}
        <div className="w-full min-w-0">
          <div className="rounded-md border bg-white overflow-hidden">
            <div className="max-h-[400px] sm:max-h-[500px] overflow-y-auto">
              {/* Mobile View */}
              <div className="block sm:hidden">
                {isLoading ? (
                  <div className="p-6 text-center text-sm">Carregando...</div>
                ) : filteredSales.length === 0 ? (
                  <div className="p-6 text-center text-sm text-muted-foreground">
                    Nenhuma venda encontrada
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {filteredSales.map((sale) => (
                      <div key={sale.id} className="p-3 space-y-2 min-w-0">
                        <div className="flex justify-between items-start gap-2 min-w-0">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="text-xs font-medium text-muted-foreground truncate">#{sale.invoice_number}</span>
                              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded flex-shrink-0">
                                {formatDateWithTimezone(sale.date)}
                              </span>
                            </div>
                            <h4 className="font-medium text-sm truncate mt-1">{sale.customer_name}</h4>
                            <p className="text-xs text-muted-foreground truncate">{sale.customer_location}</p>
                          </div>
                          <div className="text-right flex-shrink-0 min-w-0">
                            <div className="text-sm font-bold truncate">{sale.total.toLocaleString('pt-AO')} AOA</div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-6 w-6 p-0 mt-1">
                                  <MoreVertical className="h-3 w-3" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="min-w-0">
                                <DropdownMenuItem 
                                  onClick={() => downloadPDF(sale)}
                                  disabled={isPdfDownloading}
                                  className="min-w-0"
                                >
                                  {isPdfDownloading ? (
                                    <>
                                      <Loader2 className="mr-2 h-3 w-3 animate-spin flex-shrink-0" />
                                      <span className="text-xs truncate">Gerando...</span>
                                    </>
                                  ) : (
                                    <>
                                      <Download className="mr-2 h-3 w-3 flex-shrink-0" />
                                      <span className="text-xs truncate">PDF</span>
                                    </>
                                  )}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => editSale(sale)} className="min-w-0">
                                  <Edit className="mr-2 h-3 w-3 flex-shrink-0" />
                                  <span className="text-xs truncate">Editar</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleDeleteClick(sale)}
                                  className="text-red-600 min-w-0"
                                >
                                  <Trash className="mr-2 h-3 w-3 flex-shrink-0" />
                                  <span className="text-xs truncate">Excluir</span>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                        
                        {sale.items?.length > 0 && (
                          <div className="pt-2 border-t border-gray-100 min-w-0">
                            <div className="text-xs text-muted-foreground mb-1">Produtos:</div>
                            <div className="space-y-1 min-w-0">
                              {sale.items.slice(0, 2).map((item, index) => (
                                <div key={index} className="text-xs truncate">
                                  {item.quantity}x {item.product_name}
                                </div>
                              ))}
                              {sale.items.length > 2 && (
                                <div className="text-xs text-muted-foreground truncate">
                                  +{sale.items.length - 2} mais
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Desktop View */}
              <div className="hidden sm:block min-w-0">
                <Table>
                  <TableHeader className="sticky top-0 bg-background z-10">
                    <TableRow>
                      <TableHead className="text-xs min-w-0">Nº Fatura</TableHead>
                      <TableHead className="text-xs min-w-0">Cliente</TableHead>
                      <TableHead className="text-xs min-w-0">Produto(s)</TableHead>
                      <TableHead className="text-xs min-w-0">Data</TableHead>
                      <TableHead className="text-right text-xs min-w-0">Total</TableHead>
                      <TableHead className="text-right text-xs w-20">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-10 text-sm">
                          Carregando...
                        </TableCell>
                      </TableRow>
                    ) : filteredSales.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-10 text-muted-foreground text-sm">
                          Nenhuma venda encontrada para o período selecionado
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredSales.map((sale) => (
                        <TableRow key={sale.id}>
                          <TableCell className="font-medium text-xs min-w-0 truncate">{sale.invoice_number}</TableCell>
                          <TableCell className="text-xs min-w-0">
                            <div className="max-w-[120px] min-w-0">
                              <div className="truncate font-medium">{sale.customer_name}</div>
                              <div className="truncate text-muted-foreground">{sale.customer_location}</div>
                            </div>
                          </TableCell>
                          <TableCell className="text-xs min-w-0">
                            {sale.items?.length > 0 ? (
                              <div className="max-w-[150px] min-w-0">
                                {sale.items.slice(0, 2).map((item, index) => (
                                  <div key={index} className="truncate">
                                    {item.quantity}x {item.product_name}
                                  </div>
                                ))}
                                {sale.items.length > 2 && (
                                  <div className="text-muted-foreground truncate">
                                    +{sale.items.length - 2} mais
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className="text-muted-foreground">Sem produtos</span>
                            )}
                          </TableCell>
                          <TableCell className="text-xs min-w-0 truncate">{formatDateWithTimezone(sale.date)}</TableCell>
                          <TableCell className="text-right text-xs font-medium min-w-0 truncate">{sale.total.toLocaleString('pt-AO')} AOA</TableCell>
                          <TableCell className="text-right w-20">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <span className="sr-only">Abrir menu</span>
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="min-w-0">
                                <DropdownMenuItem 
                                  onClick={() => downloadPDF(sale)}
                                  disabled={isPdfDownloading}
                                  className="min-w-0"
                                >
                                  {isPdfDownloading ? (
                                    <>
                                      <Loader2 className="mr-2 h-4 w-4 animate-spin flex-shrink-0" />
                                      <span className="truncate">Gerando PDF...</span>
                                    </>
                                  ) : (
                                    <>
                                      <Download className="mr-2 h-4 w-4 flex-shrink-0" />
                                      <span className="truncate">Download PDF</span>
                                    </>
                                  )}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => editSale(sale)} className="min-w-0">
                                  <Edit className="mr-2 h-4 w-4 flex-shrink-0" />
                                  <span className="truncate">Editar</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleDeleteClick(sale)}
                                  className="text-red-600 min-w-0"
                                >
                                  <Trash className="mr-2 h-4 w-4 flex-shrink-0" />
                                  <span className="truncate">Excluir</span>
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
          </div>
        </div>
      </div>

      {/* Dialog para adicionar/editar venda */}
      <Dialog open={isAddSaleDialogOpen} onOpenChange={setIsAddSaleDialogOpen}>
        <DialogContent className="w-[95vw] max-w-[700px] max-h-[95vh] overflow-y-auto" style={{ zIndex: 50 }}>
          <DialogHeader className="px-1 sm:px-6">
            <DialogTitle className="text-lg sm:text-xl">{editingSale ? 'Editar Venda' : 'Registar Nova Venda'}</DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              {editingSale ? 'Atualize os detalhes da venda' : 'Adicione os detalhes da venda e itens vendidos'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-3 sm:gap-4 py-2 sm:py-4 px-1 sm:px-6">
            {/* Informações do Cliente */}
            <div className="grid grid-cols-1 gap-3 sm:gap-4">
              <div className="space-y-2">
                <Label htmlFor="customerName" className="text-xs sm:text-sm">Nome do Cliente</Label>
                <Input 
                  id="customerName" 
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Ex: João Silva"
                  className="[font-size:16px] sm:text-sm h-8 sm:h-10"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customerLocation" className="text-xs sm:text-sm">Localização</Label>
                <Input 
                  id="customerLocation" 
                  value={customerLocation}
                  onChange={(e) => setCustomerLocation(e.target.value)}
                  placeholder="Ex: Luanda, Angola"
                  className="[font-size:16px] sm:text-sm h-8 sm:h-10"
                />
              </div>
            </div>

            {/* Data da Venda */}
            <div className="space-y-2">
              <Label htmlFor="date" className="text-xs sm:text-sm">Data da Venda</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className="w-full justify-start text-left font-normal [font-size:16px] sm:text-sm h-8 sm:h-10"
                  >
                    <CalendarIcon className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
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
              <Label className="text-xs sm:text-sm">Tipo de Entrada de Produto</Label>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                <div className="flex items-center space-x-2">
                  <input 
                    type="radio" 
                    id="database" 
                    name="entryType" 
                    checked={!isManualEntry}
                    onChange={() => setIsManualEntry(false)}
                    className="scale-75 sm:scale-100"
                  />
                  <label htmlFor="database" className="text-xs sm:text-sm">Do Banco de Dados</label>
                </div>
                <div className="flex items-center space-x-2">
                  <input 
                    type="radio" 
                    id="manual" 
                    name="entryType" 
                    checked={isManualEntry}
                    onChange={() => setIsManualEntry(true)}
                    className="scale-75 sm:scale-100"
                  />
                  <label htmlFor="manual" className="text-xs sm:text-sm">Entrada Manual</label>
                </div>
              </div>
            </div>

            {/* Adicionar Itens */}
            <div className="space-y-3 sm:space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="text-sm font-medium">Adicionar Item</div>
                {saleItems.length > 0 && (
                  <div className="text-xs text-muted-foreground">
                    {totalItems} {totalItems === 1 ? 'item' : 'itens'} | Total: {totalAmount.toLocaleString('pt-AO')} AOA
                  </div>
                )}
              </div>
              
              {isManualEntry ? (
                <div className="grid grid-cols-1 gap-3 sm:gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="productName" className="text-xs sm:text-sm">Nome do Produto</Label>
                    <Input 
                      id="productName" 
                      value={productName}
                      onChange={(e) => setProductName(e.target.value)}
                      placeholder="Ex: Drone DJI Mavic 3"
                      className="[font-size:16px] sm:text-sm h-8 sm:h-10"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2 sm:gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="quantity" className="text-xs sm:text-sm">Quantidade</Label>
                      <Input 
                        id="quantity" 
                        type="number"
                        min="1"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value === '' ? '' : parseInt(e.target.value) || '')}
                        className="[font-size:16px] sm:text-sm h-8 sm:h-10"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="unitPrice" className="text-xs sm:text-sm">Preço (AOA)</Label>
                      <Input 
                        id="unitPrice" 
                        type="number"
                        min="0"
                        value={unitPrice}
                        onChange={(e) => setUnitPrice(e.target.value === '' ? '' : parseFloat(e.target.value) || '')}
                        className="[font-size:16px] sm:text-sm h-8 sm:h-10"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="profit" className="text-xs sm:text-sm">Lucro (AOA)</Label>
                    <Input 
                      id="profit" 
                      type="number"
                      min="0"
                      value={profit}
                      onChange={(e) => setProfit(e.target.value === '' ? '' : parseFloat(e.target.value) || '')}
                      className="[font-size:16px] sm:text-sm h-8 sm:h-10"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-3 sm:space-y-4">
                  <div className="space-y-2 relative">
                    <Label htmlFor="productSearch" className="text-xs sm:text-sm">Buscar Produto</Label>
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
                        className="w-full pr-10 [font-size:16px] sm:text-sm h-8 sm:h-10"
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
                          <X className="h-3 w-3 sm:h-4 sm:w-4 opacity-70" />
                        </button>
                      )}
                    </div>
                    
                    {productFilter && filteredProducts.length > 0 && !selectedDatabaseProduct && (
                      <div className="absolute z-50 mt-1 max-h-48 sm:max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-xs sm:text-sm shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                        <div className="max-h-48 sm:max-h-60 overflow-y-auto">
                          {filteredProducts.map((product) => (
                            <div
                              key={product.id}
                              className="relative cursor-pointer select-none py-2 px-3 sm:px-4 hover:bg-slate-100 text-xs sm:text-sm"
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
                      <Label htmlFor="planSelect" className="text-xs sm:text-sm">Plano</Label>
                      <div className="relative">
                        <select
                          id="planSelect"
                          value={selectedPlan || ''}
                          onChange={(e) => {
                            console.log('Plano selecionado:', e.target.value);
                            setSelectedPlan(e.target.value);
                          }}
                          className="w-full h-8 sm:h-10 rounded-md border border-input bg-background px-3 py-1 sm:py-2 [font-size:16px] sm:text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                        >
                          <option value="" disabled>Selecione um plano</option>
                          {products
                            .find(p => p.id === selectedDatabaseProduct)?.plans
                            .map((plan) => (
                              <option key={plan.id} value={plan.id}>
                                {plan.name || 'Plano Básico'} - {convertToKwanzas(plan.price, plan.currency || 'EUR').toLocaleString('pt-AO')} AOA
                              </option>
                            ))}
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                          <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4 opacity-50" />
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-2 gap-2 sm:gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="quantity" className="text-xs sm:text-sm">Quantidade</Label>
                      <Input 
                        id="quantity" 
                        type="number"
                        min="1"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value === '' ? '' : parseInt(e.target.value) || '')}
                        className="[font-size:16px] sm:text-sm h-8 sm:h-10"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="profit" className="text-xs sm:text-sm">Lucro (AOA)</Label>
                      <Input 
                        id="profit" 
                        type="number"
                        min="0"
                        value={profit}
                        onChange={(e) => setProfit(e.target.value === '' ? '' : parseFloat(e.target.value) || '')}
                        className="[font-size:16px] sm:text-sm h-8 sm:h-10"
                      />
                    </div>
                  </div>
                </div>
              )}
              
              <Button 
                type="button" 
                              onClick={addItemToSale} 
              className="w-full [font-size:16px] sm:text-sm h-8 sm:h-10"
              disabled={isAddingItem}
                size="sm"
              >
                {isAddingItem ? (
                  <>
                    <Loader2 className="mr-2 h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                    <span className="hidden sm:inline">Adicionando...</span>
                    <span className="sm:hidden">Adicionando</span>
                  </>
                ) : (
                  <>
                    <Plus className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" /> 
                    <span className="hidden sm:inline">Adicionar Item</span>
                    <span className="sm:hidden">Adicionar</span>
                  </>
                )}
              </Button>
            </div>

            {/* Lista de itens - Mobile first */}
            {saleItems.length > 0 && (
              <div className="space-y-2">
                <div className="text-sm font-medium">
                  Itens Adicionados <span className="text-xs font-normal text-muted-foreground">({saleItems.length} {saleItems.length === 1 ? 'item' : 'itens'})</span>
                </div>
                
                {/* Mobile View */}
                <div className="block sm:hidden">
                  <div className="space-y-2">
                    {saleItems.map((item, index) => (
                      <div key={item.id} className="border rounded-lg p-3 bg-gray-50">
                        <div className="flex justify-between items-start gap-2 mb-2">
                          <div className="min-w-0 flex-1">
                            <h4 className="font-medium text-sm truncate">{item.product_name}</h4>
                            <div className="grid grid-cols-2 gap-1 text-xs text-muted-foreground mt-1">
                              <span>Qtd: {item.quantity}</span>
                              <span>Preço: {item.unit_price.toLocaleString('pt-AO')} AOA</span>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <div className="text-sm font-bold">{item.total_price.toLocaleString('pt-AO')} AOA</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <span className="text-xs text-muted-foreground">Lucro:</span>
                            {editingItem?.id === item.id ? (
                              <Input
                                type="number"
                                min="0"
                                value={editingProfit}
                                onChange={(e) => setEditingProfit(parseFloat(e.target.value) || 0)}
                                className="h-6 text-xs w-20"
                              />
                            ) : (
                              <span className="text-xs font-medium">{item.profit?.toLocaleString('pt-AO') || '0'} AOA</span>
                            )}
                          </div>
                          
                          <div className="flex gap-1">
                            {editingItem?.id === item.id ? (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={saveItemEdit}
                                  className="h-6 w-6 p-0 text-green-600"
                                >
                                  <Check className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setEditingItem(null);
                                    setEditingProfit(0);
                                  }}
                                  className="h-6 w-6 p-0 text-red-600"
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </>
                            ) : (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => editItem(item)}
                                  className="h-6 w-6 p-0"
                                >
                                  <Edit className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeItem(item.id)}
                                  className="h-6 w-6 p-0 text-red-600"
                                >
                                  <Trash className="h-3 w-3" />
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {/* Total Mobile */}
                    <div className="border rounded-lg p-3 bg-blue-50 border-blue-200">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-bold text-sm">Total Geral</div>
                          <div className="text-xs text-muted-foreground">
                            Lucro: {saleItems.reduce((acc, item) => acc + (item.profit || 0), 0).toLocaleString('pt-AO')} AOA
                          </div>
                        </div>
                        <div className="text-lg font-bold text-blue-600">
                          {totalAmount.toLocaleString('pt-AO')} AOA
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Desktop View */}
                <div className="hidden sm:block">
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-xs">Produto</TableHead>
                          <TableHead className="text-right text-xs">Qtd</TableHead>
                          <TableHead className="text-right text-xs">Preço Unit.</TableHead>
                          <TableHead className="text-right text-xs">Lucro</TableHead>
                          <TableHead className="text-right text-xs">Total</TableHead>
                          <TableHead className="text-right text-xs">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {saleItems.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell className="text-xs">{item.product_name}</TableCell>
                            <TableCell className="text-right text-xs">{item.quantity}</TableCell>
                            <TableCell className="text-right text-xs">{item.unit_price.toLocaleString('pt-AO')} AOA</TableCell>
                            <TableCell className="text-right text-xs">
                              {editingItem?.id === item.id ? (
                                <Input
                                  type="number"
                                  min="0"
                                  value={editingProfit}
                                  onChange={(e) => setEditingProfit(parseFloat(e.target.value) || 0)}
                                  className="w-24 h-8 text-xs"
                                />
                              ) : (
                                item.profit?.toLocaleString('pt-AO') || '0'
                              )} AOA
                            </TableCell>
                            <TableCell className="text-right text-xs">{item.total_price.toLocaleString('pt-AO')} AOA</TableCell>
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
                          <TableCell colSpan={3} className="text-right font-bold text-xs">Total:</TableCell>
                          <TableCell className="text-right font-bold text-xs">
                            {saleItems.reduce((acc, item) => acc + (item.profit || 0), 0).toLocaleString('pt-AO')} AOA
                          </TableCell>
                          <TableCell className="text-right font-bold text-xs">
                            {totalAmount.toLocaleString('pt-AO')} AOA
                          </TableCell>
                          <TableCell></TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0 px-1 sm:px-6">
            <Button 
              variant="outline" 
              onClick={() => {
                setIsAddSaleDialogOpen(false);
                clearForm();
                setEditingSale(null);
              }}
              className="w-full sm:w-auto [font-size:16px] sm:text-sm h-8 sm:h-10"
              size="sm"
            >
              Cancelar
            </Button>
            <Button 
              type="button" 
              onClick={handleSaveSale}
              disabled={saleItems.length === 0 || !customerName || !customerLocation || !date}
              className="w-full sm:w-auto [font-size:16px] sm:text-sm h-8 sm:h-10"
              size="sm"
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