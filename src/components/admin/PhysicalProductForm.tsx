import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { Upload, X, Plus } from 'lucide-react';
import ImageUpload from './ImageUpload';
import { 
  createPhysicalProduct, 
  updatePhysicalProduct,
  getPhysicalProductCategories 
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

interface Category {
  id: string;
  name: string;
  description?: string;
  parent_id?: string;
  subcategories?: Category[];
}

interface PhysicalProductFormProps {
  product?: PhysicalProduct | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function PhysicalProductForm({ 
  product, 
  onSuccess, 
  onCancel 
}: PhysicalProductFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    currency: 'EUR',
    images: [] as string[],
    category_id: '',
    subcategory_id: '',
    is_featured: false,
    is_active: true
  });
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(true);

  useEffect(() => {
    loadCategories();
    
    if (product) {
      setFormData({
        name: product.name,
        description: product.description,
        price: product.price.toString(),
        currency: product.currency,
        images: product.images,
        category_id: product.category_id,
        subcategory_id: product.subcategory_id || '',
        is_featured: product.is_featured,
        is_active: product.is_active
      });
    }
  }, [product]);

  useEffect(() => {
    if (formData.category_id) {
      const selectedCategory = categories.find(c => c.id === formData.category_id);
      setSubcategories(selectedCategory?.subcategories || []);
      
      // Limpar subcategoria se mudou a categoria
      if (formData.subcategory_id) {
        const subcategoryExists = selectedCategory?.subcategories?.some(
          sub => sub.id === formData.subcategory_id
        );
        if (!subcategoryExists) {
          setFormData(prev => ({ ...prev, subcategory_id: '' }));
        }
      }
    } else {
      setSubcategories([]);
    }
  }, [formData.category_id, categories]);

  const loadCategories = async () => {
    try {
      setLoadingCategories(true);
      const data = await getPhysicalProductCategories();
      setCategories(data);
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
      toast.error('Erro ao carregar categorias');
    } finally {
      setLoadingCategories(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (imageUrl: string) => {
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, imageUrl]
    }));
  };

  const handleImageRemove = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast.error('Nome do produto é obrigatório');
      return false;
    }
    
    if (!formData.description.trim()) {
      toast.error('Descrição do produto é obrigatória');
      return false;
    }
    
    if (!formData.price || parseFloat(formData.price) <= 0) {
      toast.error('Preço deve ser maior que zero');
      return false;
    }
    
    if (!formData.category_id) {
      toast.error('Categoria é obrigatória');
      return false;
    }
    
    if (formData.images.length === 0) {
      toast.error('Pelo menos uma imagem é obrigatória');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      setLoading(true);
      
      const productData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        currency: formData.currency,
        images: formData.images,
        category_id: formData.category_id,
        subcategory_id: formData.subcategory_id || null,
        is_featured: formData.is_featured,
        is_active: formData.is_active
      };

      if (product) {
        await updatePhysicalProduct(product.id, productData);
        toast.success('Produto físico atualizado com sucesso!');
      } else {
        await createPhysicalProduct(productData);
        toast.success('Produto físico criado com sucesso!');
      }
      
      onSuccess();
    } catch (error) {
      console.error('Erro ao salvar produto físico:', error);
      toast.error('Erro ao salvar produto físico');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Nome do produto */}
        <div>
          <Label htmlFor="name">Nome do Produto *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="Ex: iPhone 15 Pro Max"
            required
          />
        </div>

        {/* Preço */}
        <div>
          <Label htmlFor="price">Preço (EUR) *</Label>
          <div className="flex space-x-2">
            <Input
              id="price"
              type="number"
              step="0.01"
              min="0"
              value={formData.price}
              onChange={(e) => handleInputChange('price', e.target.value)}
              placeholder="99.99"
              required
              className="flex-1"
            />
            <Select 
              value={formData.currency} 
              onValueChange={(value) => handleInputChange('currency', value)}
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
        </div>
      </div>

      {/* Descrição */}
      <div>
        <Label htmlFor="description">Descrição *</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          placeholder="Descreva o produto detalhadamente..."
          rows={4}
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Categoria */}
        <div>
          <Label htmlFor="category">Categoria *</Label>
          {loadingCategories ? (
            <div className="text-sm text-gray-500">Carregando categorias...</div>
          ) : (
            <Select 
              value={formData.category_id} 
              onValueChange={(value) => handleInputChange('category_id', value)}
            >
              <SelectTrigger>
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
          )}
        </div>

        {/* Subcategoria */}
        <div>
          <Label htmlFor="subcategory">Subcategoria</Label>
          <Select 
            value={formData.subcategory_id} 
            onValueChange={(value) => handleInputChange('subcategory_id', value)}
            disabled={!formData.category_id || subcategories.length === 0}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione uma subcategoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Nenhuma</SelectItem>
              {subcategories.map((subcategory) => (
                <SelectItem key={subcategory.id} value={subcategory.id}>
                  {subcategory.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Imagens */}
      <div>
        <Label>Imagens do Produto *</Label>
        <div className="space-y-4">
          <ImageUpload onUpload={handleImageUpload} folder="products" />
          
          {formData.images.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {formData.images.map((image, index) => (
                <div key={index} className="relative group">
                  <img
                    src={image}
                    alt={`Imagem ${index + 1}`}
                    className="w-full h-24 object-cover rounded-lg border"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleImageRemove(index)}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Opções */}
      <div className="flex space-x-6">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="is_featured"
            checked={formData.is_featured}
            onCheckedChange={(checked) => handleInputChange('is_featured', checked)}
          />
          <Label htmlFor="is_featured">Produto em destaque</Label>
        </div>
        
        <div className="flex items-center space-x-2">
          <Checkbox
            id="is_active"
            checked={formData.is_active}
            onCheckedChange={(checked) => handleInputChange('is_active', checked)}
          />
          <Label htmlFor="is_active">Produto ativo</Label>
        </div>
      </div>

      {/* Botões */}
      <div className="flex justify-end space-x-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Salvando...' : (product ? 'Atualizar' : 'Criar')} Produto
        </Button>
      </div>
    </form>
  );
} 