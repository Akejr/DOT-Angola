import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { GiftCard, GiftCardPlan } from '@/types/supabase';

// Interface para item do carrinho
export interface CartItem {
  giftCard: GiftCard;
  quantity: number;
  selectedPlan?: GiftCardPlan;
}

// Interface para o contexto do carrinho
interface CartContextType {
  items: CartItem[];
  addItem: (giftCard: GiftCard, quantity: number, selectedPlan?: GiftCardPlan) => void;
  removeItem: (giftCardId: string) => void;
  updateQuantity: (giftCardId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  cartOpen: boolean;
  setCartOpen: (open: boolean) => void;
}

// Criar o contexto
const CartContext = createContext<CartContextType | undefined>(undefined);

// Provider do contexto
export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const [cartOpen, setCartOpen] = useState(false);

  // Carregar carrinho do localStorage ao iniciar
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        setItems(parsedCart);
      } catch (error) {
        console.error('Erro ao carregar carrinho do localStorage:', error);
      }
    }
  }, []);

  // Salvar carrinho no localStorage quando muda
  useEffect(() => {
    if (items.length > 0) {
      localStorage.setItem('cart', JSON.stringify(items));
    } else {
      localStorage.removeItem('cart');
    }
    
    // Calcular totais
    const itemCount = items.reduce((count, item) => count + item.quantity, 0);
    setTotalItems(itemCount);
    
    const price = items.reduce((sum, item) => {
      // Usar o preço do plano selecionado se disponível, senão usar o preço original
      const itemPrice = item.selectedPlan 
        ? item.selectedPlan.price * item.quantity
        : item.giftCard.original_price * item.quantity;
      return sum + itemPrice;
    }, 0);
    setTotalPrice(price);
  }, [items]);

  // Adicionar item ao carrinho
  const addItem = (giftCard: GiftCard, quantity: number, selectedPlan?: GiftCardPlan) => {
    setItems(currentItems => {
      // Verificar se o item já existe no carrinho com o mesmo plano
      const existingItemIndex = currentItems.findIndex(
        item => item.giftCard.id === giftCard.id && 
                ((!item.selectedPlan && !selectedPlan) || 
                 (item.selectedPlan?.id === selectedPlan?.id))
      );

      if (existingItemIndex > -1) {
        // Atualizar quantidade se já existe
        const updatedItems = [...currentItems];
        updatedItems[existingItemIndex].quantity += quantity;
        return updatedItems;
      } else {
        // Adicionar novo item
        return [...currentItems, { giftCard, quantity, selectedPlan }];
      }
    });
    
    // Abrir o carrinho automaticamente quando adiciona um item
    setCartOpen(true);
  };

  // Remover item do carrinho
  const removeItem = (giftCardId: string) => {
    setItems(currentItems => 
      currentItems.filter(item => item.giftCard.id !== giftCardId)
    );
  };

  // Atualizar quantidade de um item
  const updateQuantity = (giftCardId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(giftCardId);
      return;
    }
    
    setItems(currentItems => 
      currentItems.map(item => 
        item.giftCard.id === giftCardId 
          ? { ...item, quantity } 
          : item
      )
    );
  };

  // Limpar carrinho
  const clearCart = () => {
    setItems([]);
    localStorage.removeItem('cart');
  };

  return (
    <CartContext.Provider 
      value={{ 
        items, 
        addItem, 
        removeItem, 
        updateQuantity, 
        clearCart, 
        totalItems,
        totalPrice,
        cartOpen,
        setCartOpen
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

// Hook para usar o contexto do carrinho
export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart deve ser usado dentro de um CartProvider');
  }
  return context;
} 