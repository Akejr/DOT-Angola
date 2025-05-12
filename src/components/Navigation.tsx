import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Menu, CreditCard, ShoppingBag, Package, MoreHorizontal, Plus } from "lucide-react";

const navItems = [
  { id: 1, name: "Gift Card", path: "/" },
  { id: 2, name: "Visa Virtual", path: "/visa-virtual" },
  { id: 3, name: "Importação de produtos", path: "/importacao" },
  { id: 4, name: "Outros serviços", path: "/outros-servicos" },
];

interface NavigationProps {
  onPageChange: (id: number) => void;
}

const Navigation = ({ onPageChange }: NavigationProps) => {
  const [selectedId, setSelectedId] = useState(1);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

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
      {/* Floating Action Menu Mobile - Opção 2 */}
      <div className="md:hidden">
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

// Floating Action Menu para mobile
function FloatingMenuMobile({ selectedId, handleClick }: { selectedId: number, handleClick: (id: number, path: string) => void }) {
  const [open, setOpen] = useState(false);
  const navItems = [
    { id: 1, name: "Gift Card", icon: ShoppingBag, path: "/" },
    { id: 2, name: "Visa Virtual", icon: CreditCard, path: "/visa-virtual" },
    { id: 3, name: "Importação", icon: Package, path: "/importacao" },
    { id: 4, name: "Outros", icon: MoreHorizontal, path: "/outros-servicos" },
  ];
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
      {/* Itens do menu, aparecem quando open=true */}
      {open && (
        <div className="flex flex-col gap-3 mb-2 animate-fade-in-up">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setOpen(false);
                  handleClick(item.id, item.path);
                }}
                className={
                  `flex items-center gap-2 px-4 py-2 rounded-full shadow-lg bg-white border border-gray-200
                  transition-all duration-300 hover:bg-blue-50
                  ${selectedId === item.id ? 'text-dot-brand-blue font-semibold' : 'text-dot-gray-text'}`
                }
                style={{ minWidth: 140 }}
              >
                <Icon className="w-5 h-5" />
                <span className="text-sm">{item.name}</span>
              </button>
            );
          })}
        </div>
      )}
      {/* Botão flutuante principal */}
      <button
        onClick={() => setOpen((v) => !v)}
        className={
          `w-14 h-14 rounded-full bg-dot-brand-blue text-white shadow-xl flex items-center justify-center
          transition-transform duration-300 active:scale-90`
        }
        aria-label="Abrir menu"
      >
        <Plus className={`w-7 h-7 transition-transform duration-300 ${open ? 'rotate-45' : ''}`} />
      </button>
    </div>
  );
}

export default Navigation;
