export type Currency = 'EUR' | 'BRL' | 'KWZ';
export type DeliveryMethod = 'code' | 'manual_activation';

export interface GiftCardPlan {
  id?: string;
  name: string;
  price: number;
  currency: Currency;
  description?: string;
  original_price?: number;
  has_discount?: boolean;
  discount_percentage?: number;
}

export interface GiftCard {
  id: string;
  name: string;
  description: string;
  image_url: string;
  is_featured: boolean;
  delivery_method: DeliveryMethod;
  created_at: string;
  updated_at: string;
  gift_card_categories?: {
    categories: Category;
  }[];
  plans: GiftCardPlan[];
  original_price?: number;
  currency?: Currency;
  slug?: string;
  has_discount?: boolean;
  discount_percentage?: number;
}

export type Category = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  created_at: string;
  updated_at: string;
};

export interface GiftCardCategory {
  gift_card_id: string;
  category_id: string;
}

export interface ExchangeRate {
  id: string;
  currency: Currency;
  rate: number;
  updated_at: string;
}

export interface Session {
  id: string;
  user_id: string;
  start_time: string;
  end_time: string | null;
  ip_address: string;
}

export interface DashboardStats {
  total_gift_cards: number;
  total_sales: number;
  sales_today: number;
  sales_this_week: number;
  sales_this_month: number;
  sales_percent_change: number;
  popular_categories: { name: string; count: number }[];
  users_today: number;
  users_this_week: number;
  users_this_month: number;
  users_this_year: number;
  total_users: number;
  user_percent_change: number;
}

export type Order = {
  id: number;
  user_id: string;
  gift_card_id: number;
  quantity: number;
  total_price: number;
  status: 'pending' | 'completed' | 'cancelled';
  created_at: string;
};

export interface ImportRequest {
  id: string;
  created_at: string;
  updated_at: string;
  product_name: string;
  product_link: string | null;
  has_images: boolean;
  images: string[] | null;
  urgency_level: 'urgent' | 'not-urgent';
  full_name: string;
  email: string;
  phone: string;
  address: string;
  province: string;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  notes?: string | null;
} 

export interface SaleItem {
  id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  profit?: number;
}

export interface Sale {
  id: string;
  customer_name: string;
  customer_location: string;
  date: string;
  items: SaleItem[];
  total: number;
  profit?: number;
  invoice_number: string;
  created_at?: string;
} 