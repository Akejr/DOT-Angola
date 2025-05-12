import { Construction } from "lucide-react";

const UnderConstruction = () => {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center bg-dot-light-gray rounded-lg p-8">
      <Construction className="h-16 w-16 text-dot-brand-blue mb-4" />
      <h2 className="text-2xl font-bold text-dot-dark-text mb-2">Em construção...</h2>
      <p className="text-dot-gray-text text-center max-w-md">
        Estamos trabalhando para trazer o melhor conteúdo para você. 
        Volte em breve para conferir as novidades!
      </p>
    </div>
  );
};

export default UnderConstruction; 