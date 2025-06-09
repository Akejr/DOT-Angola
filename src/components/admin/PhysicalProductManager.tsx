import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, Package, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import PhysicalProductForm from './PhysicalProductForm';
import { 
  getPhysicalProducts, 
  deletePhysicalProduct, 
  updatePhysicalProduct,
  getExchangeRates 
} from '@/lib/database';

interface PhysicalProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  images: string[];
  category_id: string;
  subcategory_id?: string;
  is_featured: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  category?: {
    id: string;
    name: string;
  };
  subcategory?: {
    id: string;
    name: string;
  };
}

export default function PhysicalProductManager() {
  const [products, setProducts] = useState<PhysicalProduct[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<PhysicalProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<PhysicalProduct | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [exchangeRates, setExchangeRates] = useState<any[]>([]);

  useEffect(() => {
    loadProducts();
    loadExchangeRates();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, searchTerm]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await getPhysicalProducts();
      setProducts(data);
    } catch (error) {
      console.error('Erro ao carregar produtos físicos:', error);
      toast.error('Erro ao carregar produtos físicos');
    } finally {
      setLoading(false);
    }
  };

  const loadExchangeRates = async () => {
    try {
      const rates = await getExchangeRates();
      setExchangeRates(rates);
    } catch (error) {
      console.error('Erro ao carregar taxas de câmbio:', error);
    }
  };

  const filterProducts = () => {
    if (!searchTerm) {
      setFilteredProducts(products);
      return;
    }

    const filtered = products.filter(product =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category?.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredProducts(filtered);
  };

  const handleEdit = (product: PhysicalProduct) => {
    setSelectedProduct(product);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este produto físico?')) return;

    try {
      await deletePhysicalProduct(id);
      toast.success('Produto físico excluído com sucesso!');
      loadProducts();
    } catch (error) {
      console.error('Erro ao excluir produto físico:', error);
      toast.error('Erro ao excluir produto físico');
    }
  };

  const handleToggleFeatured = async (product: PhysicalProduct) => {
    try {
      await updatePhysicalProduct(product.id, {
        is_featured: !product.is_featured
      });
      toast.success('Produto atualizado com sucesso!');
      loadProducts();
    } catch (error) {
      console.error('Erro ao atualizar produto:', error);
      toast.error('Erro ao atualizar produto');
    }
  };

  const handleToggleActive = async (product: PhysicalProduct) => {
    try {
      await updatePhysicalProduct(product.id, {
        is_active: !product.is_active
      });
      toast.success('Status do produto atualizado!');
      loadProducts();
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast.error('Erro ao atualizar status');
    }
  };

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    setSelectedProduct(null);
    loadProducts();
  };

  const convertPriceToKwanzas = (price: number, currency: string) => {
    const rate = exchangeRates.find(r => r.currency === currency);
    if (rate) {
      const priceInKwanzas = price * rate.rate;
      return priceInKwanzas.toLocaleString('pt-AO', { maximumFractionDigits: 0 }) + " Kz";
    }
    return "Preço indisponível";
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Produtos Físicos</h2>
          <p className="text-gray-600">Gerencie os produtos físicos da loja</p>
        </div>
        
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setSelectedProduct(null)}>
              <Plus className="w-4 h-4 mr-2" />
              Novo Produto
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {selectedProduct ? 'Editar Produto Físico' : 'Novo Produto Físico'}
              </DialogTitle>
            </DialogHeader>
            <PhysicalProductForm 
              product={selectedProduct}
              onSuccess={handleFormSuccess}
              onCancel={() => setIsFormOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Barra de pesquisa */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Pesquisar produtos físicos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Package className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total de Produtos</p>
              <p className="text-2xl font-bold text-gray-900">{products.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Eye className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Produtos Ativos</p>
              <p className="text-2xl font-bold text-gray-900">
                {products.filter(p => p.is_active).length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <EyeOff className="h-8 w-8 text-red-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Produtos Inativos</p>
              <p className="text-2xl font-bold text-gray-900">
                {products.filter(p => !p.is_active).length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Package className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Em Destaque</p>
              <p className="text-2xl font-bold text-gray-900">
                {products.filter(p => p.is_featured).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabela de produtos */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Produto</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Preço (EUR)</TableHead>
              <TableHead>Preço (KWZ)</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  Carregando produtos...
                </TableCell>
              </TableRow>
            ) : filteredProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  Nenhum produto encontrado
                </TableCell>
              </TableRow>
            ) : (
              filteredProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      {product.images.length > 0 && (
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-10 h-10 rounded-lg object-cover"
                        />
                      )}
                      <div>
                        <div className="font-medium">{product.name}</div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {product.description}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{product.category?.name}</div>
                      {product.subcategory && (
                        <div className="text-sm text-gray-500">
                          {product.subcategory.name}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>€{product.price.toFixed(2)}</TableCell>
                  <TableCell>
                    {convertPriceToKwanzas(product.price, product.currency)}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col space-y-1">
                      <Badge variant={product.is_active ? "default" : "secondary"}>
                        {product.is_active ? 'Ativo' : 'Inativo'}
                      </Badge>
                      {product.is_featured && (
                        <Badge variant="outline">Destaque</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(product)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleFeatured(product)}
                        className={product.is_featured ? "bg-purple-100" : ""}
                      >
                        <Package className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleActive(product)}
                        className={product.is_active ? "bg-green-100" : "bg-red-100"}
                      >
                        {product.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(product.id)}
                        className="text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
} 