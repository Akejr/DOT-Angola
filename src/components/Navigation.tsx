import { cn } from "@/lib/utils";
import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Menu, CreditCard, ShoppingBag, Package, MoreHorizontal, Plus, Home, Settings, User } from "lucide-react";

// Constantes para armazenamento no localStorage
const STORAGE_KEYS = {
  BUTTON_POSITION: 'dot-mobile-button-position',
  SCROLL_POSITIONS: 'dot-scroll-positions'
};

const navItems = [
  { id: 1, name: "Gift Card", path: "/" },
  { id: 2, name: "Visa Virtual", path: "/visa-virtual" },
  { id: 3, name: "Importação de produtos", path: "/importacao" },
  { id: 4, name: "Transferências", path: "/transferencias" },
];

interface NavigationProps {
  onPageChange: (id: number) => void;
}

const Navigation = ({ onPageChange }: NavigationProps) => {
  const [selectedId, setSelectedId] = useState(1);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Restaurar a posição de scroll quando a página muda
  useEffect(() => {
    // Salvar posição de scroll atual antes de mudar de página
    const saveScrollPosition = () => {
      try {
        const scrollPositions = JSON.parse(localStorage.getItem(STORAGE_KEYS.SCROLL_POSITIONS) || '{}');
        scrollPositions[location.pathname] = window.scrollY;
        localStorage.setItem(STORAGE_KEYS.SCROLL_POSITIONS, JSON.stringify(scrollPositions));
      } catch (error) {
        console.error('Erro ao salvar posição de scroll:', error);
      }
    };

    // Restaurar posição de scroll quando a página carrega
    const restoreScrollPosition = () => {
      try {
        const scrollPositions = JSON.parse(localStorage.getItem(STORAGE_KEYS.SCROLL_POSITIONS) || '{}');
        const savedPosition = scrollPositions[location.pathname];
        
        if (savedPosition !== undefined) {
          // Usar setTimeout para garantir que a página tenha carregado
          setTimeout(() => {
            window.scrollTo(0, savedPosition);
          }, 100);
        }
      } catch (error) {
        console.error('Erro ao restaurar posição de scroll:', error);
      }
    };

    // Adicionar listener para salvar a posição antes de sair da página
    window.addEventListener('beforeunload', saveScrollPosition);
    
    // Salvar a posição quando a localização muda
    saveScrollPosition();
    
    // Restaurar a posição para a nova página
    restoreScrollPosition();

    return () => {
      window.removeEventListener('beforeunload', saveScrollPosition);
    };
  }, [location.pathname]);

  // Atualizar o item selecionado com base na URL atual
  useEffect(() => {
    const currentPath = location.pathname;
    const matchingItem = navItems.find(item => {
      if (item.path === "/") {
        return currentPath === "/"
      }
      return currentPath.startsWith(item.path);
    });
    
    if (matchingItem) {
      setSelectedId(matchingItem.id);
    }
  }, [location.pathname]);

  const handleClick = (id: number, path: string) => {
    setSelectedId(id);
    onPageChange(id);
    navigate(path);
    setIsMenuOpen(false);
  };

  return (
    <nav className="px-2 md:px-6 border-b bg-dot-white relative">
      {/* Floating Menu para Mobile - sempre visível */}
      <div className="block md:hidden">
        <FloatingMenuMobile selectedId={selectedId} handleClick={handleClick} />
      </div>

      {/* Menu Desktop - mantido exatamente igual */}
      <ul className="hidden md:flex justify-center space-x-16">
        {navItems.map((item) => (
          <li key={item.id} className="relative">
            <button 
              onClick={() => handleClick(item.id, item.path)}
              className={cn(
                "text-sm font-medium py-4 block transition-colors duration-300",
                "text-dot-gray-text hover:text-dot-brand-blue",
                selectedId === item.id && "text-dot-brand-blue"
              )}
            >
              {item.name}
            </button>
            <div className={cn(
              "absolute bottom-0 left-0 right-0 h-1 bg-dot-brand-blue rounded-t-full transform transition-transform duration-300",
              selectedId === item.id ? "scale-x-100" : "scale-x-0 hover:scale-x-100"
            )} />
          </li>
        ))}
      </ul>
    </nav>
  );
};

// Floating Action Menu para mobile com opção de arrastar
function FloatingMenuMobile({ selectedId, handleClick }: { selectedId: number, handleClick: (id: number, path: string) => void }) {
  const [open, setOpen] = useState(false);
  const draggableRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  
  // Usar os mesmos itens do menu principal para consistência
  const mobileNavItems = [
    { id: 1, name: "Gift Card", icon: ShoppingBag, path: "/" },
    { id: 2, name: "Visa Virtual", icon: CreditCard, path: "/visa-virtual" },
    { id: 3, name: "Importação", icon: Package, path: "/importacao" },
    { id: 4, name: "Transferências", icon: MoreHorizontal, path: "/transferencias" },
  ];

  useEffect(() => {
    // Criar botão flutuante
    const mobileButton = document.createElement('div');
    mobileButton.id = 'mobile-menu-floating-btn';
    mobileButton.style.position = 'fixed';
    
    // Verificar se estamos em mobile antes de mostrar o botão
    const isMobileDevice = window.innerWidth < 768; // 768px é o breakpoint md do Tailwind
    
    // Só mostrar o botão em dispositivos móveis
    if (!isMobileDevice) {
      return () => {}; // Não fazer nada em desktop
    }
    
    // Tentar recuperar a posição salva do botão
    let savedPosition = null;
    try {
      savedPosition = JSON.parse(localStorage.getItem(STORAGE_KEYS.BUTTON_POSITION) || 'null');
    } catch (error) {
      console.error('Erro ao recuperar posição do botão:', error);
    }
    
    // Aplicar posição salva ou usar padrão
    if (savedPosition && typeof savedPosition === 'object' && 'left' in savedPosition) {
      mobileButton.style.left = savedPosition.left + 'px';
      mobileButton.style.top = savedPosition.top + 'px';
      mobileButton.style.bottom = 'auto';
      mobileButton.style.right = 'auto';
    } else {
      mobileButton.style.bottom = '20px';
      mobileButton.style.right = '20px';
    }
    
    mobileButton.style.width = '60px';
    mobileButton.style.height = '60px';
    mobileButton.style.borderRadius = '50%';
    mobileButton.style.backgroundColor = '#01042D'; // Cor azul principal do site (dot-brand-blue)
    mobileButton.style.color = 'white';
    mobileButton.style.display = 'flex';
    mobileButton.style.alignItems = 'center';
    mobileButton.style.justifyContent = 'center';
    mobileButton.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
    mobileButton.style.border = '2px solid white';
    mobileButton.style.zIndex = '9999';
    mobileButton.style.cursor = 'grab';
    mobileButton.style.touchAction = 'none'; // Prevenir comportamentos padrão de touch
    mobileButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>`;
    
    document.body.appendChild(mobileButton);
    
    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let offsetX = 0;
    let offsetY = 0;
    let startTime = 0;
    
    // Eventos para arrastar o botão
    mobileButton.addEventListener('mousedown', startDrag);
    mobileButton.addEventListener('touchstart', startDrag, { passive: false });
    
    // Funções para manipular eventos durante arrasto
    function handleMove(e: MouseEvent | TouchEvent) {
      if (startX === 0 && startY === 0) return;
      
      e.preventDefault(); // Impedir scroll durante o arrasto
      e.stopPropagation();
      
      let currentX, currentY;
      
      if (e instanceof TouchEvent) {
        currentX = e.touches[0].clientX;
        currentY = e.touches[0].clientY;
      } else {
        currentX = e.clientX;
        currentY = e.clientY;
      }
      
      // Se mover o suficiente, considerar como arrasto
      if (Math.abs(currentX - startX) > 5 || Math.abs(currentY - startY) > 5) {
        isDragging = true;
      }
      
      if (isDragging) {
        const newLeft = offsetX + (currentX - startX);
        const newTop = offsetY + (currentY - startY);
        
        // Limitar às bordas da tela
        const maxX = window.innerWidth - mobileButton.offsetWidth;
        const maxY = window.innerHeight - mobileButton.offsetHeight;
        
        const finalLeft = Math.max(0, Math.min(newLeft, maxX));
        const finalTop = Math.max(0, Math.min(newTop, maxY));
        
        mobileButton.style.left = `${finalLeft}px`;
        mobileButton.style.top = `${finalTop}px`;
        mobileButton.style.bottom = 'auto';
        mobileButton.style.right = 'auto';
        
        // Salvar a posição atual no localStorage
        try {
          localStorage.setItem(STORAGE_KEYS.BUTTON_POSITION, JSON.stringify({
            left: finalLeft,
            top: finalTop
          }));
        } catch (error) {
          console.error('Erro ao salvar posição do botão:', error);
        }
      }
    }
    
    function handleEnd(e: MouseEvent | TouchEvent) {
      // Remover os listeners de movimento e fim
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('touchmove', handleMove);
      document.removeEventListener('mouseup', handleEnd);
      document.removeEventListener('touchend', handleEnd);
      
      // Se o tempo total foi curto e não houve movimento significativo, considerar como clique
      const timeElapsed = Date.now() - startTime;
      
      if (timeElapsed < 200 && !isDragging) {
        // É um clique rápido
        setOpen(prev => !prev);
      }
      
      startX = 0;
      startY = 0;
      isDragging = false;
      mobileButton.style.cursor = 'grab';
    }
    
    function startDrag(e: MouseEvent | TouchEvent) {
      // Inicialmente não está arrastando, apenas clicou
      isDragging = false;
      startTime = Date.now();
      
      // Prevenir todos os comportamentos padrão (scrolling, etc)
      e.preventDefault();
      e.stopPropagation();
      
      if (e instanceof TouchEvent) {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
      } else {
        startX = e.clientX;
        startY = e.clientY;
      }
      
      offsetX = mobileButton.offsetLeft;
      offsetY = mobileButton.offsetTop;
      mobileButton.style.cursor = 'grabbing';
      
      // Adicionar os listeners de movimento e fim
      document.addEventListener('mousemove', handleMove, { passive: false });
      document.addEventListener('touchmove', handleMove, { passive: false });
      document.addEventListener('mouseup', handleEnd);
      document.addEventListener('touchend', handleEnd);
    }
    
    // Limpar ao desmontar
    return () => {
      // Verificar se o botão ainda existe antes de remover
      if (document.getElementById('mobile-menu-floating-btn')) {
        document.body.removeChild(mobileButton);
      }
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('touchmove', handleMove);
      document.removeEventListener('mouseup', handleEnd);
      document.removeEventListener('touchend', handleEnd);
    };
  }, []);
  
  // Fechar o menu quando a localização muda
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);
  
  // Renderizar menu quando aberto
  useEffect(() => {
    const btn = document.getElementById('mobile-menu-floating-btn');
    if (btn) {
      if (open) {
        btn.style.backgroundColor = '#0A1F7E'; // Cor ligeiramente diferente quando aberto
      } else {
        btn.style.backgroundColor = '#01042D'; // Cor azul principal do site (dot-brand-blue)
      }
    }
  }, [open]);

  // Adicionar listener para detectar mudanças no tamanho da tela
  useEffect(() => {
    const handleResize = () => {
      const isMobileDevice = window.innerWidth < 768; // 768px é o breakpoint md do Tailwind
      const btn = document.getElementById('mobile-menu-floating-btn');
      
      if (btn) {
        if (isMobileDevice) {
          btn.style.display = 'flex';  // Mostrar em mobile
        } else {
          btn.style.display = 'none';  // Esconder em desktop
        }
      }
    };
    
    // Verificar inicialmente
    handleResize();
    
    // Adicionar listener para quando a tela mudar de tamanho
    window.addEventListener('resize', handleResize);
    
    // Limpar o listener quando o componente for desmontado
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <>
      {open && (
        <div 
          className="fixed inset-0 bg-black/10 backdrop-blur-sm z-[999]"
          onClick={() => setOpen(false)}
        />
      )}
    
      {open && (
        <div 
          className="fixed z-[9999]"
          style={{
            bottom: `${80}px`,
            right: `${20}px`,
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
          }}
        >
          {mobileNavItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = selectedId === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => {
                  setOpen(false);
                  handleClick(item.id, item.path);
                }}
                style={{
                  backgroundColor: isActive ? '#eef2ff' : 'white',
                  color: isActive ? '#01042D' : '#4b5563', // Cor azul principal nos itens ativos
                  border: `1px solid ${isActive ? '#c7d2fe' : '#e5e7eb'}`,
                  borderRadius: '12px',
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                  minWidth: '160px',
                  fontWeight: isActive ? '600' : '400',
                  fontSize: '14px',
                  transition: 'all 0.2s ease',
                  animationDelay: `${index * 50}ms`,
                  animation: 'floatIn 0.3s ease forwards'
                }}
              >
                <Icon
                  size={18}
                  color={isActive ? '#01042D' : '#6b7280'} // Cor azul principal nos ícones ativos
                />
                {item.name}
              </button>
            );
          })}
        </div>
      )}
      
      <style>
        {`
          @keyframes floatIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}
      </style>
    </>
  );
}

export default Navigation;
