import { Button } from "@/components/ui/button";
import { CheckIcon, Loader } from "lucide-react";
import { useState, useEffect } from "react";
import { Category } from "@/types/supabase";
import { getCategories, countGiftCardsByCategory } from "@/lib/database";

interface FilterSectionProps {
  onCategorySelect: (categoryId: string | null) => void;
  selectedCategory: string | null;
}

const FilterSection = ({ onCategorySelect, selectedCategory }: FilterSectionProps) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryCountMap, setCategoryCountMap] = useState<Map<string, number>>(new Map());

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoading(true);
        const categoriesData = await getCategories();
        setCategories(categoriesData);
        
        // Carregar contagem real de gift cards por categoria
        const countMap = await countGiftCardsByCategory();
        setCategoryCountMap(countMap);
      } catch (error) {
        console.error("Erro ao carregar categorias:", error);
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, []);

  // Adicionar ouvinte para o evento de mudança de categoria
  useEffect(() => {
    const handleCategoryChange = (event: any) => {
      const { categoryId, categoryName } = event.detail;
      console.log(`FilterSection: Recebeu evento de categoria alterada: ${categoryId || 'todas'} (${categoryName || ''})`);
      
      // Apenas atualiza se o evento veio de outro componente
      if (categoryId !== selectedCategory) {
        // Chama o callback sem disparar novo evento
        // Isso é necessário para que o HomeLayout atualize seu estado
        onCategorySelect(categoryId);
      }
    };
    
    window.addEventListener('categoryChanged', handleCategoryChange);
    
    return () => {
      window.removeEventListener('categoryChanged', handleCategoryChange);
    };
  }, [selectedCategory, onCategorySelect]);

  const handleCategoryClick = (categoryId: string) => {
    console.log(`FilterSection: Clicou na categoria ${categoryId}`);
    
    // Se estiver clicando na mesma categoria, desmarca
    if (selectedCategory === categoryId) {
      onCategorySelect(null);
      
      // Disparar evento para notificar outros componentes
      const event = new CustomEvent('categoryChanged', { 
        detail: { 
          categoryId: null,
          categoryName: null 
        } 
      });
      window.dispatchEvent(event);
    } else {
      // Seleciona nova categoria
      onCategorySelect(categoryId);
      
      // Buscar o nome da categoria
      const category = categories.find(c => c.id === categoryId);
      if (category) {
        // Disparar evento para notificar outros componentes
        const event = new CustomEvent('categoryChanged', { 
          detail: { 
            categoryId: categoryId,
            categoryName: category.name 
          } 
        });
        window.dispatchEvent(event);
      }
    }
  };

  const clearFilters = () => {
    onCategorySelect(null);
    
    // Disparar evento para notificar outros componentes
    const event = new CustomEvent('categoryChanged', { 
      detail: { 
        categoryId: null,
        categoryName: null 
      } 
    });
    window.dispatchEvent(event);
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-dot-dark-text">Filtros</h2>
        <Button 
          variant="link" 
          className="text-sm text-dot-brand-blue hover:text-blue-700 transition-colors duration-300"
          onClick={clearFilters}
          disabled={!selectedCategory}
        >
          Limpar todos
        </Button>
      </div>
      
      <div className="mb-8">
        <h3 className="text-sm font-medium mb-3 text-dot-dark-text">Categorias</h3>
        
        {loading ? (
          <div className="flex justify-center items-center py-4">
            <Loader className="h-6 w-6 text-gray-400 animate-spin" />
          </div>
        ) : categories.length > 0 ? (
          <ul className="space-y-3">
            {categories.map((category) => (
              <li 
                key={category.id} 
                className="flex items-center justify-between group cursor-pointer category-button"
                onClick={() => handleCategoryClick(category.id)}
                data-category-id={category.id}
                data-category-name={category.name}
              >
                <div className="flex items-center">
                  <span className="text-sm font-medium text-dot-dark-text group-hover:text-dot-brand-blue transition-colors duration-300">
                    {category.name}
                  </span>
                  <span className="text-xs text-dot-gray-text ml-2">
                    ({categoryCountMap.get(category.id) || 0})
                  </span>
                </div>
                <div className={`
                  h-5 w-5 border rounded-md flex items-center justify-center 
                  transition-all duration-300
                  ${selectedCategory === category.id 
                    ? 'bg-dot-brand-blue border-dot-brand-blue' 
                    : 'border-gray-300 group-hover:border-dot-brand-blue'}
                `}>
                  {selectedCategory === category.id && (
                    <CheckIcon className="h-3 w-3 text-white" />
                  )}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500 py-2">Nenhuma categoria encontrada</p>
        )}
      </div>
      
      <Button 
        className="w-full mt-8 bg-dot-brand-blue hover:bg-blue-600 text-white transition-colors duration-300"
        onClick={clearFilters}
        disabled={!selectedCategory}
      >
        Limpar Filtros
      </Button>
    </div>
  );
};

export default FilterSection;
