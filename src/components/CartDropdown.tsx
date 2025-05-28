import { useRef, useEffect } from 'react';
import { X, ShoppingBag, Minus, Plus, AlertCircle, Package, ChevronDown } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { getExchangeRates } from '@/lib/database';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function CartDropdown({ onClose }: { onClose: () => void }) {
  const { items, removeItem, updateQuantity, totalItems, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [totalInKwanzas, setTotalInKwanzas] = useState<number | null>(null);
  const [exchangeRates, setExchangeRates] = useState<Array<{currency: string, rate: number}>>([]);
  const [showPurchaseOptions, setShowPurchaseOptions] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Converter preço total para Kwanzas
  useEffect(() => {
    const convertToKwanzas = async () => {
      try {
        const rates = await getExchangeRates();
        setExchangeRates(rates);
        
        // Calcular o total em Kwanzas considerando cada moeda
        let kwanzaTotal = 0;
        
        for (const item of items) {
          // Selecionar o preço correto (do plano selecionado ou do original)
          const price = item.selectedPlan ? item.selectedPlan.price : item.giftCard.original_price;
          const currency = item.selectedPlan ? item.selectedPlan.currency : item.giftCard.currency;
          
          // Se já estiver em Kwanzas, não é necessário converter
          if (currency === 'KWZ') {
            kwanzaTotal += price * item.quantity;
            continue;
          }
          
          // Caso contrário, converter usando a taxa correspondente
          const rate = rates.find(r => r.currency === currency);
          if (rate) {
            const itemTotal = price * item.quantity * rate.rate;
            kwanzaTotal += itemTotal;
          }
        }
        
        setTotalInKwanzas(kwanzaTotal);
      } catch (error) {
        console.error('Erro ao converter para Kwanzas:', error);
      }
    };
    
    if (items.length > 0) {
      convertToKwanzas();
    } else {
      setTotalInKwanzas(0);
    }
  }, [items]);

  // Detectar clique fora do dropdown para fechá-lo
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  // Formatar número como valor monetário em Kwanzas
  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-AO', {
      maximumFractionDigits: 0
    });
  };

  // Enviar mensagem para o WhatsApp com os detalhes do pedido
  const handleSendToWhatsApp = async () => {
    try {
      setLoading(true);
      
      // Número de telefone para enviar a mensagem
      const phoneNumber = "+244931343433";
      
      // Construir mensagem com detalhes do pedido
      let message = "Olá, gostaria de comprar os seguintes gift cards:\n\n";
      
      // Adicionar cada item ao pedido
      items.forEach(item => {
        const price = item.selectedPlan ? item.selectedPlan.price : item.giftCard.original_price;
        const currency = item.selectedPlan ? item.selectedPlan.currency : item.giftCard.currency;
        const planName = item.selectedPlan ? ` (Plano: ${item.selectedPlan.name})` : '';
          
        message += `• ${item.quantity}x ${item.giftCard.name}${planName}\n  Preço: ${price} ${currency}\n`;
      });
      
      // Adicionar o valor total
      if (totalInKwanzas) {
        message += `\nValor Total: ${formatCurrency(totalInKwanzas)} Kz`;
      }
      
      // Codificar a mensagem para URL
      const encodedMessage = encodeURIComponent(message);
      
      // URL do WhatsApp
      const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
      
      // Abrir URL do WhatsApp
      window.open(whatsappUrl, '_blank');
      
      // Limpar o carrinho após o envio
      clearCart();
      onClose();
      
    } catch (error) {
      console.error('Erro ao enviar para WhatsApp:', error);
    } finally {
      setLoading(false);
    }
  };

  // Redirecionar para página de checkout BAI Direto
  const handleBaiDirectoPurchase = () => {
    onClose();
    navigate('/checkout-cart');
  };

  return (
    <div 
      ref={dropdownRef}
      className="absolute top-14 right-0 w-80 sm:w-96 bg-white rounded-xl shadow-lg border border-gray-200 z-50 overflow-hidden"
    >
      <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-blue-50 to-white">
        <h3 className="font-semibold text-gray-800 flex items-center">
          <ShoppingBag className="w-4 h-4 mr-2 text-blue-600" />
          Carrinho ({totalItems})
        </h3>
        <button 
          onClick={onClose}
          className="p-1 rounded-full hover:bg-gray-100"
        >
          <X className="w-4 h-4 text-gray-500" />
        </button>
      </div>

      <div className="max-h-80 overflow-y-auto">
        {items.length === 0 ? (
          <div className="p-8 text-center">
            <ShoppingBag className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500">Seu carrinho está vazio</p>
          </div>
        ) : (
          <div>
            {items.map((item) => {
              // Selecionar o preço correto (do plano selecionado ou do original)
              const price = item.selectedPlan ? item.selectedPlan.price : item.giftCard.original_price;
              const currency = item.selectedPlan ? item.selectedPlan.currency : item.giftCard.currency;
              
              return (
                <div 
                  key={`${item.giftCard.id}-${item.selectedPlan?.id || 'default'}`} 
                  className="p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex">
                    <div className="flex-shrink-0 mr-3">
                      <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden">
                        {item.giftCard.image_url ? (
                          <img 
                            src={item.giftCard.image_url} 
                            alt={item.giftCard.name}
                            className="w-12 h-12 object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 flex items-center justify-center">
                            <ShoppingBag className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{item.giftCard.name}</p>
                      
                      {item.selectedPlan && (
                        <div className="flex items-center mt-1 text-xs text-blue-600">
                          <Package className="w-3 h-3 mr-1" />
                          <span>{item.selectedPlan.name}</span>
                        </div>
                      )}
                      
                      <p className="text-sm text-gray-600 mt-1">
                        {(price * (exchangeRates.find(r => r.currency === currency)?.rate || 0)).toLocaleString('pt-AO', { 
                          maximumFractionDigits: 0 
                        })} Kz
                      </p>
                      
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center border border-gray-200 rounded-md">
                          <button 
                            onClick={() => updateQuantity(item.giftCard.id, item.quantity - 1)}
                            className="px-2 py-1 text-gray-600 hover:bg-gray-100"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-2 py-1 text-sm text-gray-700">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.giftCard.id, item.quantity + 1)}
                            className="px-2 py-1 text-gray-600 hover:bg-gray-100"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <button 
                          onClick={() => removeItem(item.giftCard.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="p-4 bg-gray-50 border-t border-gray-100">
        <div className="flex justify-between mb-2">
          <span className="text-sm text-gray-600">Total:</span>
          <span className="text-sm font-semibold text-gray-900">
            {totalInKwanzas ? `${formatCurrency(totalInKwanzas)} Kz` : 'Calculando...'}
          </span>
        </div>
        
        {/* Botão para mostrar opções de compra */}
        <button 
          onClick={() => setShowPurchaseOptions(!showPurchaseOptions)}
          disabled={items.length === 0}
          className={`w-full mt-2 py-3 px-4 rounded-lg text-white font-medium flex items-center justify-center ${
            items.length === 0 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          <span className="flex items-center">
            Finalizar Compra
            <ChevronDown 
              className={`w-4 h-4 ml-1.5 transition-transform ${showPurchaseOptions ? 'rotate-180' : ''}`}
            />
          </span>
        </button>

        {/* Opções de compra */}
        <div 
          className={`overflow-hidden transition-all duration-300 ${
            showPurchaseOptions ? 'max-h-20 opacity-100 mt-3' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="grid grid-cols-1 gap-2">
            <button 
              onClick={handleSendToWhatsApp}
              disabled={items.length === 0 || loading}
              className="bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded-lg font-medium text-sm flex items-center justify-center transition-colors"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              ) : (
                <svg viewBox="0 0 24 24" className="w-4 h-4 mr-2 fill-current" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.6 6.32A7.85 7.85 0 0 0 12.05 4c-4.38 0-7.93 3.56-7.93 7.93a7.9 7.9 0 0 0 1.07 3.96L4 20l4.19-1.1a7.9 7.9 0 0 0 3.8.96h.01c4.38 0 7.94-3.55 7.94-7.93 0-2.12-.83-4.12-2.34-5.61zm-5.55 12.18h-.01a6.55 6.55 0 0 1-3.35-.92l-.24-.14-2.5.65.67-2.43-.16-.25a6.59 6.59 0 0 1-1.01-3.49c0-3.64 2.96-6.6 6.61-6.6a6.57 6.57 0 0 1 6.6 6.6c-.01 3.64-2.97 6.58-6.61 6.58zm3.63-4.93c-.2-.1-1.18-.58-1.36-.64-.18-.07-.32-.1-.45.1-.13.2-.5.64-.62.77-.11.13-.23.15-.43.05-.2-.1-.85-.31-1.62-.99-.6-.54-1-1.2-1.12-1.4-.11-.2-.01-.31.09-.41.09-.09.2-.23.3-.35.1-.12.13-.2.2-.33.07-.13.03-.24-.01-.34-.05-.1-.45-1.08-.62-1.47-.16-.4-.33-.33-.45-.34-.12-.01-.25-.01-.38-.01-.13 0-.34.05-.52.25-.18.2-.68.67-.68 1.63 0 .96.7 1.89.8 2.02.1.13 1.37 2.1 3.32 2.94.47.2.83.32 1.11.41.47.15.89.13 1.23.08.37-.06 1.15-.47 1.32-.93.16-.46.16-.85.12-.93-.05-.1-.18-.15-.38-.25z" />
                </svg>
              )}
              WhatsApp
            </button>
            
            <button 
              onClick={handleBaiDirectoPurchase}
              disabled={items.length === 0}
              className="bg-gradient-to-r from-blue-950 via-blue-800 to-blue-600 hover:from-blue-900 hover:to-blue-700 text-white py-2 px-3 rounded-lg font-medium text-sm flex items-center justify-center transition-all relative"
            >
              BAI DIRETO
              <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-[9px] px-1 py-0.5 rounded-full font-bold">BETA</span>
            </button>
          </div>
        </div>
        
        <div className="mt-3 text-xs text-gray-500 flex items-start">
          <AlertCircle className="w-3 h-3 mr-1 flex-shrink-0 mt-0.5" />
          <p>Escolha sua forma de pagamento preferida acima.</p>
        </div>
      </div>
    </div>
  );
} 