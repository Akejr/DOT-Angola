import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Header from '@/components/Header';
import Navigation from '@/components/Navigation';
import PhysicalProductsSection from '@/components/PhysicalProductsSection';
import { 
  getPhysicalProductCategories, 
  getPhysicalProductsByCategory 
} from '@/lib/database';
import { ChevronLeft, Package, ShoppingCart, Star } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  description?: string;
  parent_id?: string;
  subcategories?: Category[];
  product_count?: number;
}

interface PhysicalProduct {
  id: string;
  name: string;
  description: string;
  slug?: string;
  price: number;
  currency: string;
  images: string[];
  category_id: string;
  subcategory_id?: string;
  is_featured: boolean;
  is_active: boolean;
  category?: {
    id: string;
    name: string;
  };
}

export default function CategoryPage() {
  const { categorySlug } = useParams<{ categorySlug: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirecionar para a página de importação com parâmetro de categoria
    if (categorySlug) {
      navigate(`/importacao?categoria=${categorySlug}`, { replace: true });
    } else {
      navigate('/importacao', { replace: true });
    }
  }, [categorySlug, navigate]);

  // Mostrar loading enquanto redireciona
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
        <p className="text-gray-600 mt-4 text-lg">Redirecionando...</p>
      </div>
    </div>
  );
} 