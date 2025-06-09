import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, Package, Eye, EyeOff, Folder, FolderOpen, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import ImageUpload from './ImageUpload';
import { 
  getPhysicalProducts, 
  deletePhysicalProduct, 
  updatePhysicalProduct,
  createPhysicalProduct,
  getPhysicalProductCategories,
  createPhysicalProductCategory,
  updatePhysicalProductCategory,
  deletePhysicalProductCategory,
  getExchangeRates 
} from '@/lib/database';

interface PhysicalProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  weight?: number;
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

interface Category {
  id: string;
  name: string;
  description?: string;
  parent_id?: string;
  created_at: string;
  updated_at: string;
  parent?: {
    id: string;
    name: string;
  };
  subcategories?: Category[];
  product_count?: number;
}

export default function PhysicalProductsManager() {
  // Estados para produtos
  const [products, setProducts] = useState<PhysicalProduct[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<PhysicalProduct[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<PhysicalProduct | null>(null);
  const [isProductFormOpen, setIsProductFormOpen] = useState(false);
  
  // Estados para categorias
  const [categories, setCategories] = useState<Category[]>([]);
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [isCategoryFormOpen, setIsCategoryFormOpen] = useState(false);
  
  // Estados gerais
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categorySearchTerm, setCategorySearchTerm] = useState('');
  const [exchangeRates, setExchangeRates] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('products');
  
  // Estados do formulário de produto
  const [productFormData, setProductFormData] = useState({
    name: '',
    description: '',
    price: '',
    currency: 'EUR',
    weight: '',
    images: [] as string[],
    category_id: '',
    subcategory_id: '',
    is_featured: false,
    is_active: true
  });
  
  // Estados do formulário de categoria
  const [categoryFormData, setCategoryFormData] = useState({
    name: '',
    description: '',
    parent_id: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, searchTerm]);

  useEffect(() => {
    filterCategories();
  }, [allCategories, categorySearchTerm]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [productsData, categoriesData, ratesData] = await Promise.all([
        getPhysicalProducts(),
        getPhysicalProductCategories(),
        getExchangeRates()
      ]);
      
      setProducts(productsData as unknown as PhysicalProduct[]);
      setCategories(categoriesData as unknown as Category[]);
      setAllCategories((categoriesData as unknown as Category[]).flatMap(cat => [cat, ...(cat.subcategories || [])]));
      setExchangeRates(ratesData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
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

  const filterCategories = () => {
    if (!categorySearchTerm) {
      setFilteredCategories(allCategories);
      return;
    }

    const filtered = allCategories.filter(category =>
      category.name.toLowerCase().includes(categorySearchTerm.toLowerCase()) ||
      category.description?.toLowerCase().includes(categorySearchTerm.toLowerCase())
    );
    setFilteredCategories(filtered);
  };

  // =============== FUNÇÕES DE PRODUTO ===============
  
  const handleOpenProductForm = (product?: PhysicalProduct) => {
    if (product) {
      setSelectedProduct(product);
      setProductFormData({
        name: product.name,
        description: product.description,
        price: product.price.toString(),
        currency: product.currency,
        weight: product.weight?.toString() || '',
        images: product.images,
        category_id: product.category_id,
        subcategory_id: product.subcategory_id || '',
        is_featured: product.is_featured,
        is_active: product.is_active
      });
    } else {
      setSelectedProduct(null);
      setProductFormData({
        name: '',
        description: '',
        price: '',
        currency: 'EUR',
        weight: '',
        images: [],
        category_id: '',
        subcategory_id: '',
        is_featured: false,
        is_active: true
      });
    }
    setIsProductFormOpen(true);
  };

  const handleCloseProductForm = () => {
    setIsProductFormOpen(false);
    setSelectedProduct(null);
    setProductFormData({
      name: '',
      description: '',
      price: '',
      currency: 'EUR',
      weight: '',
      images: [],
      category_id: '',
      subcategory_id: '',
      is_featured: false,
      is_active: true
    });
  };

  const handleSubmitProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!productFormData.name.trim()) {
      toast.error('Nome do produto é obrigatório');
      return;
    }
    
    if (!productFormData.description.trim()) {
      toast.error('Descrição do produto é obrigatória');
      return;
    }
    
    if (!productFormData.price || parseFloat(productFormData.price) <= 0) {
      toast.error('Preço deve ser maior que zero');
      return;
    }
    
    if (!productFormData.category_id) {
      toast.error('Categoria é obrigatória');
      return;
    }
    
    if (productFormData.images.length === 0) {
      toast.error('Pelo menos uma imagem é obrigatória');
      return;
    }

    try {
      const data = {
        name: productFormData.name.trim(),
        description: productFormData.description.trim(),
        price: parseFloat(productFormData.price),
        currency: productFormData.currency,
        weight: productFormData.weight ? parseFloat(productFormData.weight) : null,
        images: productFormData.images,
        category_id: productFormData.category_id,
        subcategory_id: productFormData.subcategory_id || null,
        is_featured: productFormData.is_featured,
        is_active: productFormData.is_active
      };

      if (selectedProduct) {
        await updatePhysicalProduct(selectedProduct.id, data);
        toast.success('Produto atualizado com sucesso!');
      } else {
        await createPhysicalProduct(data);
        toast.success('Produto criado com sucesso!');
      }
      
      handleCloseProductForm();
      loadData();
    } catch (error) {
      console.error('Erro ao salvar produto:', error);
      toast.error('Erro ao salvar produto');
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este produto físico?')) return;

    try {
      await deletePhysicalProduct(id);
      toast.success('Produto excluído com sucesso!');
      loadData();
    } catch (error) {
      console.error('Erro ao excluir produto:', error);
      toast.error('Erro ao excluir produto');
    }
  };

  const handleToggleProductFeatured = async (product: PhysicalProduct) => {
    try {
      await updatePhysicalProduct(product.id, {
        is_featured: !product.is_featured
      });
      toast.success('Produto atualizado com sucesso!');
      loadData();
    } catch (error) {
      console.error('Erro ao atualizar produto:', error);
      toast.error('Erro ao atualizar produto');
    }
  };

  const handleToggleProductActive = async (product: PhysicalProduct) => {
    try {
      await updatePhysicalProduct(product.id, {
        is_active: !product.is_active
      });
      toast.success('Status do produto atualizado!');
      loadData();
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast.error('Erro ao atualizar status');
    }
  };

  // =============== FUNÇÕES DE CATEGORIA ===============
  
  const handleOpenCategoryForm = (category?: Category) => {
    if (category) {
      setSelectedCategory(category);
      setCategoryFormData({
        name: category.name,
        description: category.description || '',
        parent_id: category.parent_id || ''
      });
    } else {
      setSelectedCategory(null);
      setCategoryFormData({
        name: '',
        description: '',
        parent_id: ''
      });
    }
    setIsCategoryFormOpen(true);
  };

  const handleCloseCategoryForm = () => {
    setIsCategoryFormOpen(false);
    setSelectedCategory(null);
    setCategoryFormData({
      name: '',
      description: '',
      parent_id: ''
    });
  };

  const handleSubmitCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!categoryFormData.name.trim()) {
      toast.error('Nome da categoria é obrigatório');
      return;
    }

    try {
      const data = {
        name: categoryFormData.name.trim(),
        description: categoryFormData.description.trim() || null,
        parent_id: categoryFormData.parent_id || null
      };

      if (selectedCategory) {
        await updatePhysicalProductCategory(selectedCategory.id, data);
        toast.success('Categoria atualizada com sucesso!');
      } else {
        await createPhysicalProductCategory(data);
        toast.success('Categoria criada com sucesso!');
      }
      
      handleCloseCategoryForm();
      loadData();
    } catch (error) {
      console.error('Erro ao salvar categoria:', error);
      toast.error('Erro ao salvar categoria');
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta categoria? Isso pode afetar os produtos associados.')) return;

    try {
      await deletePhysicalProductCategory(id);
      toast.success('Categoria excluída com sucesso!');
      loadData();
    } catch (error) {
      console.error('Erro ao excluir categoria:', error);
      toast.error('Erro ao excluir categoria');
    }
  };

  // =============== FUNÇÕES AUXILIARES ===============
  
  const convertPriceToKwanzas = (price: number, currency: string) => {
    const rate = exchangeRates.find(r => r.currency === currency);
    if (rate) {
      const priceInKwanzas = price * rate.rate;
      return priceInKwanzas.toLocaleString('pt-AO', { maximumFractionDigits: 0 }) + " Kz";
    }
    return "Preço indisponível";
  };

  const handleImageUpload = (imageUrl: string) => {
    setProductFormData(prev => ({
      ...prev,
      images: [...prev.images, imageUrl]
    }));
  };

  const handleImageRemove = (index: number) => {
    setProductFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const subcategories = categories.find(c => c.id === productFormData.category_id)?.subcategories || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Produtos Físicos</h2>
          <p className="text-gray-600">Gerencie produtos físicos e suas categorias</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="products" className="flex items-center">
            <Package className="w-4 h-4 mr-2" />
            Produtos ({products.length})
          </TabsTrigger>
          <TabsTrigger value="categories" className="flex items-center">
            <Folder className="w-4 h-4 mr-2" />
            Categorias ({allCategories.length})
          </TabsTrigger>
        </TabsList>

        {/* =============== ABA DE PRODUTOS =============== */}
        <TabsContent value="products" className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Pesquisar produtos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Button onClick={() => handleOpenProductForm()}>
              <Plus className="w-4 h-4 mr-2" />
              Novo Produto
            </Button>
          </div>

          {/* Estatísticas de Produtos */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <Package className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total</p>
                  <p className="text-2xl font-bold text-gray-900">{products.length}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <Eye className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Ativos</p>
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
                  <p className="text-sm font-medium text-gray-600">Inativos</p>
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
                  <p className="text-sm font-medium text-gray-600">Destaque</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {products.filter(p => p.is_featured).length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Tabela de Produtos */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produto</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Preço (EUR)</TableHead>
                  <TableHead>Preço (KWZ)</TableHead>
                  <TableHead>Peso</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      Carregando produtos...
                    </TableCell>
                  </TableRow>
                ) : filteredProducts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
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
                        {product.weight ? `${product.weight} kg` : '-'}
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
                            onClick={() => handleOpenProductForm(product)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleProductFeatured(product)}
                            className={product.is_featured ? "bg-purple-100" : ""}
                          >
                            <Package className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleProductActive(product)}
                            className={product.is_active ? "bg-green-100" : "bg-red-100"}
                          >
                            {product.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteProduct(product.id)}
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
        </TabsContent>

        {/* =============== ABA DE CATEGORIAS =============== */}
        <TabsContent value="categories" className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Pesquisar categorias..."
                value={categorySearchTerm}
                onChange={(e) => setCategorySearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Button onClick={() => handleOpenCategoryForm()}>
              <Plus className="w-4 h-4 mr-2" />
              Nova Categoria
            </Button>
          </div>

          {/* Estatísticas de Categorias */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <Folder className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total</p>
                  <p className="text-2xl font-bold text-gray-900">{allCategories.length}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <FolderOpen className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Principais</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {allCategories.filter(c => !c.parent_id).length}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <Folder className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Subcategorias</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {allCategories.filter(c => c.parent_id).length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Tabela de Categorias */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Produtos</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      Carregando categorias...
                    </TableCell>
                  </TableRow>
                ) : filteredCategories.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      Nenhuma categoria encontrada
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCategories.map((category) => (
                    <TableRow key={category.id}>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {category.parent_id ? (
                            <Folder className="w-4 h-4 text-purple-500" />
                          ) : (
                            <FolderOpen className="w-4 h-4 text-blue-500" />
                          )}
                          <span className="font-medium">{category.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={category.parent_id ? "secondary" : "default"}>
                          {category.parent_id ? 'Subcategoria' : 'Principal'}
                        </Badge>
                        {category.parent && (
                          <div className="text-sm text-gray-500 mt-1">
                            Pai: {category.parent.name}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600">
                          {category.description || 'Sem descrição'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{category.product_count || 0}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenCategoryForm(category)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteCategory(category.id)}
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
        </TabsContent>
      </Tabs>

      {/* =============== MODAL FORMULÁRIO PRODUTO =============== */}
      <Dialog open={isProductFormOpen} onOpenChange={setIsProductFormOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedProduct ? 'Editar Produto Físico' : 'Novo Produto Físico'}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmitProduct} className="space-y-8">
            {/* Seção 1: Informações Básicas */}
            <div className="bg-gray-50 p-6 rounded-lg space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Package className="w-5 h-5 mr-2 text-blue-600" />
                Informações Básicas
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                    Nome do Produto *
                  </Label>
                  <Input
                    id="name"
                    value={productFormData.name}
                    onChange={(e) => setProductFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Ex: iPhone 15 Pro Max 256GB"
                    required
                    className="mt-1"
                  />
                  <p className="text-xs text-gray-500 mt-1">Nome completo e descritivo do produto</p>
                </div>

                <div>
                  <Label htmlFor="category" className="text-sm font-medium text-gray-700">
                    Categoria *
                  </Label>
                  <Select 
                    value={productFormData.category_id} 
                    onValueChange={(value) => setProductFormData(prev => ({ ...prev, category_id: value, subcategory_id: '' }))}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500 mt-1">Categoria principal do produto</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="subcategory" className="text-sm font-medium text-gray-700">
                    Subcategoria
                  </Label>
                  <Select 
                    value={productFormData.subcategory_id || "none"} 
                    onValueChange={(value) => setProductFormData(prev => ({ ...prev, subcategory_id: value === "none" ? "" : value }))}
                    disabled={!productFormData.category_id || subcategories.length === 0}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Selecione uma subcategoria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Nenhuma</SelectItem>
                      {subcategories.map((subcategory) => (
                        <SelectItem key={subcategory.id} value={subcategory.id}>
                          {subcategory.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500 mt-1">Subcategoria específica (opcional)</p>
                </div>

                <div>
                  <Label htmlFor="description" className="text-sm font-medium text-gray-700">
                    Descrição Breve *
                  </Label>
                  <Input
                    id="description_brief"
                    value={productFormData.description}
                    onChange={(e) => setProductFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Descrição resumida do produto"
                    required
                    className="mt-1"
                    maxLength={100}
                  />
                  <p className="text-xs text-gray-500 mt-1">Máximo 100 caracteres</p>
                </div>
              </div>
            </div>

            {/* Seção 2: Preços e Especificações */}
            <div className="bg-gray-50 p-6 rounded-lg space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Package className="w-5 h-5 mr-2 text-green-600" />
                Preços e Especificações
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <Label htmlFor="price" className="text-sm font-medium text-gray-700">
                    Preço *
                  </Label>
                  <div className="flex space-x-2 mt-1">
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      min="0"
                      value={productFormData.price}
                      onChange={(e) => setProductFormData(prev => ({ ...prev, price: e.target.value }))}
                      placeholder="99.99"
                      required
                      className="flex-1"
                    />
                    <Select 
                      value={productFormData.currency} 
                      onValueChange={(value) => setProductFormData(prev => ({ ...prev, currency: value }))}
                    >
                      <SelectTrigger className="w-20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="EUR">EUR</SelectItem>
                        <SelectItem value="BRL">BRL</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {productFormData.price && (
                    <p className="text-xs text-green-600 mt-1">
                      ≈ {convertPriceToKwanzas(parseFloat(productFormData.price), productFormData.currency)}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="weight" className="text-sm font-medium text-gray-700">
                    Peso (kg)
                  </Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.01"
                    min="0"
                    value={productFormData.weight}
                    onChange={(e) => setProductFormData(prev => ({ ...prev, weight: e.target.value }))}
                    placeholder="2.5"
                    className="mt-1"
                  />
                  <p className="text-xs text-gray-500 mt-1">Peso em quilogramas (opcional)</p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="is_featured"
                      checked={productFormData.is_featured}
                      onCheckedChange={(checked) => setProductFormData(prev => ({ ...prev, is_featured: !!checked }))}
                    />
                    <Label htmlFor="is_featured" className="text-sm font-medium text-gray-700">
                      Produto em destaque
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="is_active"
                      checked={productFormData.is_active}
                      onCheckedChange={(checked) => setProductFormData(prev => ({ ...prev, is_active: !!checked }))}
                    />
                    <Label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                      Produto ativo
                    </Label>
                  </div>
                </div>
              </div>
            </div>

            {/* Seção 3: Descrição Detalhada */}
            <div className="bg-gray-50 p-6 rounded-lg space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Edit className="w-5 h-5 mr-2 text-purple-600" />
                Descrição Detalhada
              </h3>
              
              <div>
                <Label htmlFor="description_detailed" className="text-sm font-medium text-gray-700">
                  Descrição Completa *
                </Label>
                <Textarea
                  id="description_detailed"
                  value={productFormData.description}
                  onChange={(e) => setProductFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Descreva o produto detalhadamente: características, especificações técnicas, compatibilidade, dimensões, conteúdo da embalagem, etc."
                  rows={5}
                  required
                  className="mt-1 resize-none"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Descrição completa que será exibida na página do produto
                </p>
              </div>
            </div>

            {/* Seção 4: Galeria de Imagens */}
            <div className="bg-gray-50 p-6 rounded-lg space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Package className="w-5 h-5 mr-2 text-orange-600" />
                Galeria de Imagens *
              </h3>
              
              <div className="space-y-6">
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-3 block">
                    Adicionar Nova Imagem
                  </Label>
                  <ImageUpload onUpload={handleImageUpload} folder="products" />
                  <p className="text-xs text-gray-500 mt-2">
                    Recomendado: Imagens em alta resolução (mínimo 800x800px). 
                    A primeira imagem será usada como principal.
                  </p>
                </div>
                
                {productFormData.images.length > 0 && (
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-3 block">
                      Imagens do Produto ({productFormData.images.length})
                    </Label>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                      {productFormData.images.map((image, index) => (
                        <div key={index} className="relative group bg-white p-2 rounded-lg border shadow-sm">
                          <img
                            src={image}
                            alt={`Imagem ${index + 1}`}
                            className="w-full h-20 object-cover rounded-md"
                          />
                          {index === 0 && (
                            <Badge className="absolute -top-1 -left-1 text-xs bg-blue-600">
                              Principal
                            </Badge>
                          )}
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 rounded-full p-0"
                            onClick={() => handleImageRemove(index)}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Arraste as imagens para reordenar. A primeira será a imagem principal.
                    </p>
                  </div>
                )}
                
                {productFormData.images.length === 0 && (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 text-sm">
                      Nenhuma imagem adicionada ainda. 
                      <br />
                      Adicione pelo menos uma imagem para o produto.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <Button type="button" variant="outline" onClick={handleCloseProductForm}>
                Cancelar
              </Button>
              <Button type="submit">
                {selectedProduct ? 'Atualizar' : 'Criar'} Produto
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* =============== MODAL FORMULÁRIO CATEGORIA =============== */}
      <Dialog open={isCategoryFormOpen} onOpenChange={setIsCategoryFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedCategory ? 'Editar Categoria' : 'Nova Categoria'}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmitCategory} className="space-y-4">
            <div>
              <Label htmlFor="category_name">Nome da Categoria *</Label>
              <Input
                id="category_name"
                value={categoryFormData.name}
                onChange={(e) => setCategoryFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ex: Eletrônicos"
                required
              />
            </div>

            <div>
              <Label htmlFor="category_description">Descrição</Label>
              <Input
                id="category_description"
                value={categoryFormData.description}
                onChange={(e) => setCategoryFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Descrição da categoria (opcional)"
              />
            </div>

            <div>
              <Label htmlFor="parent_id">Categoria Pai (Para Subcategorias)</Label>
              <Select 
                value={categoryFormData.parent_id || "none"} 
                onValueChange={(value) => setCategoryFormData(prev => ({ ...prev, parent_id: value === "none" ? "" : value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria pai (opcional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhuma (Categoria Principal)</SelectItem>
                  {categories.map((category) => (
                    <SelectItem 
                      key={category.id} 
                      value={category.id}
                      disabled={selectedCategory?.id === category.id}
                    >
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end space-x-4">
              <Button type="button" variant="outline" onClick={handleCloseCategoryForm}>
                Cancelar
              </Button>
              <Button type="submit">
                {selectedCategory ? 'Atualizar' : 'Criar'} Categoria
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
} 