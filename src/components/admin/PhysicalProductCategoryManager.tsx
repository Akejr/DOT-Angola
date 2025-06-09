import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, Folder, FolderOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { 
  getPhysicalProductCategories, 
  createPhysicalProductCategory, 
  updatePhysicalProductCategory,
  deletePhysicalProductCategory 
} from '@/lib/database';

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

export default function PhysicalProductCategoryManager() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  
  // Formulário
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    parent_id: ''
  });

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    filterCategories();
  }, [allCategories, searchTerm]);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await getPhysicalProductCategories();
      
      // Separar categorias principais e subcategorias
      const mainCategories = data.filter(cat => !cat.parent_id);
      const subcategories = data.filter(cat => cat.parent_id);
      
      // Adicionar subcategorias às categorias principais
      const categoriesWithSubs = mainCategories.map(category => ({
        ...category,
        subcategories: subcategories.filter(sub => sub.parent_id === category.id)
      }));
      
      setCategories(categoriesWithSubs);
      setAllCategories(data);
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
      toast.error('Erro ao carregar categorias');
    } finally {
      setLoading(false);
    }
  };

  const filterCategories = () => {
    if (!searchTerm) {
      setFilteredCategories(allCategories);
      return;
    }

    const filtered = allCategories.filter(category =>
      category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredCategories(filtered);
  };

  const handleOpenForm = (category?: Category) => {
    if (category) {
      setSelectedCategory(category);
      setFormData({
        name: category.name,
        description: category.description || '',
        parent_id: category.parent_id || ''
      });
    } else {
      setSelectedCategory(null);
      setFormData({
        name: '',
        description: '',
        parent_id: ''
      });
    }
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedCategory(null);
    setFormData({
      name: '',
      description: '',
      parent_id: ''
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Nome da categoria é obrigatório');
      return;
    }

    try {
      const categoryData = {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        parent_id: formData.parent_id || null
      };

      if (selectedCategory) {
        await updatePhysicalProductCategory(selectedCategory.id, categoryData);
        toast.success('Categoria atualizada com sucesso!');
      } else {
        await createPhysicalProductCategory(categoryData);
        toast.success('Categoria criada com sucesso!');
      }
      
      handleCloseForm();
      loadCategories();
    } catch (error) {
      console.error('Erro ao salvar categoria:', error);
      toast.error('Erro ao salvar categoria');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta categoria? Isso pode afetar os produtos associados.')) return;

    try {
      await deletePhysicalProductCategory(id);
      toast.success('Categoria excluída com sucesso!');
      loadCategories();
    } catch (error) {
      console.error('Erro ao excluir categoria:', error);
      toast.error('Erro ao excluir categoria');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Categorias de Produtos Físicos</h2>
          <p className="text-gray-600">Gerencie as categorias e subcategorias dos produtos físicos</p>
        </div>
        
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenForm()}>
              <Plus className="w-4 h-4 mr-2" />
              Nova Categoria
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {selectedCategory ? 'Editar Categoria' : 'Nova Categoria'}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Nome da Categoria *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex: Eletrônicos"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Descrição</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Descrição da categoria (opcional)"
                />
              </div>

              <div>
                <Label htmlFor="parent_id">Categoria Pai (Para Subcategorias)</Label>
                <Select 
                  value={formData.parent_id} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, parent_id: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria pai (opcional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Nenhuma (Categoria Principal)</SelectItem>
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
                <Button type="button" variant="outline" onClick={handleCloseForm}>
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

      {/* Barra de pesquisa */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Pesquisar categorias..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Folder className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total de Categorias</p>
              <p className="text-2xl font-bold text-gray-900">{allCategories.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <FolderOpen className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Categorias Principais</p>
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

      {/* Tabela de categorias */}
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
                        onClick={() => handleOpenForm(category)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(category.id)}
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