import { useState } from 'react';
import { fixAllGiftCardSlugs } from '@/lib/database';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export function FixSlugsButton() {
  const [isFixing, setIsFixing] = useState(false);

  const handleFixSlugs = async () => {
    try {
      setIsFixing(true);
      await fixAllGiftCardSlugs();
      toast.success('Slugs corrigidos com sucesso!');
    } catch (error) {
      console.error('Erro ao corrigir slugs:', error);
      toast.error('Erro ao corrigir slugs');
    } finally {
      setIsFixing(false);
    }
  };

  return (
    <Button
      onClick={handleFixSlugs}
      disabled={isFixing}
      variant="outline"
      size="sm"
    >
      {isFixing ? 'Corrigindo slugs...' : 'Corrigir slugs'}
    </Button>
  );
} 