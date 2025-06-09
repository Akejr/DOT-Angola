import React from 'react';

/**
 * Formata a descrição do produto convertendo quebras de linha em parágrafos
 * e texto entre ** em negrito
 */
export function formatDescription(description: string): React.ReactElement {
  if (!description) {
    return <span></span>;
  }

  // Primeiro, processar o texto inteiro para negrito
  const processTextWithBold = (text: string) => {
    // Usar regex mais específica para capturar **texto**
    const parts = text.split(/(\*\*.*?\*\*)/g);
    
    return parts.map((part, index) => {
      // Se a parte começa e termina com **, é negrito
      if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
        const boldText = part.slice(2, -2); // Remove os ** do início e fim
        return <strong key={index} className="font-bold text-gray-900">{boldText}</strong>;
      }
      return part;
    });
  };

  // Dividir por quebras de linha duplas para criar parágrafos
  // Se não houver quebras duplas, usar quebras simples
  let paragraphs = description.split(/\n\s*\n/).filter(para => para.trim());
  
  // Se só há um parágrafo, tentar dividir por quebras simples
  if (paragraphs.length === 1) {
    paragraphs = description.split(/\n/).filter(para => para.trim());
  }

  return (
    <div className="space-y-4">
      {paragraphs.map((paragraph, index) => (
        <p key={index} className="text-gray-600 leading-relaxed">
          {processTextWithBold(paragraph)}
        </p>
      ))}
    </div>
  );
} 