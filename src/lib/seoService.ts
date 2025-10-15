interface SEOProduct {
  id: string;
  name: string;
  description: string;
  slug?: string;
  price: number;
  currency: string;
  images: string[];
  category?: {
    id: string;
    name: string;
  };
  subcategory?: {
    id: string;
    name: string;
  };
}

interface SEOCategory {
  id: string;
  name: string;
  description?: string;
  subcategories?: SEOCategory[];
}

interface SEOMetadata {
  title: string;
  description: string;
  keywords: string[];
  canonicalUrl: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  twitterTitle: string;
  twitterDescription: string;
  structuredData: any;
}

// Palavras-chave base para Angola
const ANGOLA_KEYWORDS = {
  import: ['importar', 'importação', 'trazer', 'comprar exterior', 'produtos Europa', 'encomenda internacional'],
  locations: ['Angola', 'Luanda', 'Benguela', 'Huambo', 'Lubango', 'Cabinda', 'Malanje', 'Namibe'],
  general: ['entrega', 'envio', 'frete', 'alfândega', 'produto original', 'garantia internacional', 'preço', 'barato', 'melhor preço'],
  payment: ['Kwanza', 'Kz', 'pagamento', 'dinheiro', 'preço Angola'],
  delivery: ['7-15 dias', 'entrega rápida', 'segura', 'confiável', 'porta a porta'],
  streaming: ['streaming Angola', 'assistir online Angola', 'entretenimento digital Angola', 'serviços de streaming Angola', 'TV online Angola', 'filmes online Angola', 'séries Angola', 'streaming barato Angola', 'como pagar streaming Angola', 'formas de pagamento streaming Angola']
};

// Palavras-chave específicas para streaming em Angola
const STREAMING_KEYWORDS = {
  netflix: [
    'Netflix Angola', 'como pagar Netflix em Angola', 'Netflix preço Angola', 'Netflix Kwanza', 'Netflix Luanda',
    'assistir Netflix Angola', 'conta Netflix Angola', 'Netflix barato Angola', 'Netflix funciona Angola',
    'La Casa de Papel Angola', 'séries Netflix Angola', 'filmes Netflix Angola', 'Netflix original Angola',
    'Netflix assinatura Angola', 'Netflix gift card Angola', 'como ter Netflix Angola', 'Netflix streaming Angola'
  ],
  'prime-video': [
    'Prime Video Angola', 'Amazon Prime Angola', 'Prime Video preço Angola', 'Prime Video Kwanza',
    'como pagar Prime Video Angola', 'Prime Video Luanda', 'Amazon Prime Video Angola',
    'Prime Video funciona Angola', 'Prime Video barato Angola', 'Prime Video streaming Angola',
    'Prime Video assinatura Angola', 'Prime Video gift card Angola', 'como ter Prime Video Angola'
  ],
  tvexpress: [
    'TVExpress Angola', 'TV Express Angola', 'TVExpress preço Angola', 'TVExpress Kwanza',
    'como pagar TVExpress Angola', 'TVExpress Luanda', 'TVExpress funciona Angola',
    'TVExpress futebol Angola', 'TVExpress desporto Angola', 'TVExpress ao vivo Angola',
    'TVExpress streaming Angola', 'TVExpress jogos Angola', 'TVExpress ligas Angola',
    'TVExpress barato Angola', 'TVExpress assinatura Angola', 'como ter TVExpress Angola'
  ],
  'my-family-cinema': [
    'My Family Cinema Angola', 'My Family Cinema preço Angola', 'My Family Cinema Kwanza',
    'como pagar My Family Cinema Angola', 'My Family Cinema Luanda', 'My Family Cinema funciona Angola',
    'My Family Cinema filmes Angola', 'My Family Cinema séries Angola', 'My Family Cinema streaming Angola',
    'My Family Cinema barato Angola', 'My Family Cinema assinatura Angola', 'como ter My Family Cinema Angola'
  ],
  spotify: [
    'Spotify Angola', 'Spotify preço Angola', 'Spotify Kwanza', 'como pagar Spotify Angola',
    'Spotify Luanda', 'Spotify funciona Angola', 'Spotify Premium Angola', 'Spotify music Angola',
    'Spotify barato Angola', 'Spotify streaming Angola', 'Spotify assinatura Angola',
    'Spotify gift card Angola', 'como ter Spotify Angola', 'música streaming Angola'
  ],
  'free-fire': [
    'Free Fire Angola', 'Free Fire diamantes Angola', 'Free Fire Kwanza', 'diamantes Free Fire Angola',
    'como comprar diamantes Free Fire Angola', 'Free Fire Luanda', 'Free Fire barato Angola',
    'Free Fire gift card Angola', 'Free Fire recarga Angola', 'Free Fire skins Angola'
  ],
  'hbo-max': [
    'HBO Max Angola', 'HBO Max preço Angola', 'HBO Max Kwanza', 'como pagar HBO Max Angola',
    'HBO Max Luanda', 'HBO Max funciona Angola', 'HBO Max séries Angola', 'HBO Max filmes Angola',
    'HBO Max streaming Angola', 'HBO Max barato Angola', 'HBO Max assinatura Angola'
  ],
  'globo-play': [
    'Globo Play Angola', 'Globo Play preço Angola', 'Globo Play Kwanza', 'como pagar Globo Play Angola',
    'Globo Play Luanda', 'Globo Play funciona Angola', 'Globo Play novelas Angola',
    'Globo Play streaming Angola', 'Globo Play barato Angola', 'Globo Play assinatura Angola'
  ],
  'disney': [
    'Disney Plus Angola', 'Disney+ Angola', 'Disney Plus preço Angola', 'Disney Plus Kwanza',
    'como pagar Disney Plus Angola', 'Disney Plus Luanda', 'Disney Plus funciona Angola',
    'Disney Plus filmes Angola', 'Disney Plus streaming Angola', 'Disney Plus barato Angola'
  ],
  'youtube': [
    'YouTube Premium Angola', 'YouTube Premium preço Angola', 'YouTube Premium Kwanza',
    'como pagar YouTube Premium Angola', 'YouTube Premium Luanda', 'YouTube Premium funciona Angola',
    'YouTube Premium barato Angola', 'YouTube Premium streaming Angola', 'YouTube Premium assinatura Angola'
  ],
  'paramount': [
    'Paramount Plus Angola', 'Paramount+ Angola', 'Paramount Plus preço Angola', 'Paramount Plus Kwanza',
    'como pagar Paramount Plus Angola', 'Paramount Plus Luanda', 'Paramount Plus funciona Angola',
    'Paramount Plus streaming Angola', 'Paramount Plus barato Angola', 'Paramount Plus assinatura Angola'
  ]
};

// Mapeamento de produtos específicos para palavras-chave angolanas
const PRODUCT_KEYWORDS_MAP: Record<string, string[]> = {
  // Streaming Services
  'netflix': STREAMING_KEYWORDS.netflix,
  'prime-video': STREAMING_KEYWORDS['prime-video'],
  'prime video': STREAMING_KEYWORDS['prime-video'],
  'amazon prime': STREAMING_KEYWORDS['prime-video'],
  'tvexpress': STREAMING_KEYWORDS.tvexpress,
  'tv express': STREAMING_KEYWORDS.tvexpress,
  'my-family-cinema': STREAMING_KEYWORDS['my-family-cinema'],
  'my family cinema': STREAMING_KEYWORDS['my-family-cinema'],
  'spotify': STREAMING_KEYWORDS.spotify,
  'free-fire': STREAMING_KEYWORDS['free-fire'],
  'free fire': STREAMING_KEYWORDS['free-fire'],
  'diamantes': STREAMING_KEYWORDS['free-fire'],
  'hbo-max': STREAMING_KEYWORDS['hbo-max'],
  'hbo max': STREAMING_KEYWORDS['hbo-max'],
  'globo-play': STREAMING_KEYWORDS['globo-play'],
  'globo play': STREAMING_KEYWORDS['globo-play'],
  'disney': STREAMING_KEYWORDS.disney,
  'disney+': STREAMING_KEYWORDS.disney,
  'disney plus': STREAMING_KEYWORDS.disney,
  'youtube': STREAMING_KEYWORDS.youtube,
  'youtube premium': STREAMING_KEYWORDS.youtube,
  'paramount': STREAMING_KEYWORDS.paramount,
  'paramount+': STREAMING_KEYWORDS.paramount,
  'paramount plus': STREAMING_KEYWORDS.paramount,
  
  // Gaming & Entertainment
  'playstation': ['PlayStation Angola', 'PS5 Luanda', 'console Angola', 'jogos PlayStation', 'controle PS5'],
  'ps5': ['PS5 Angola', 'PlayStation 5 Luanda', 'console nova geração', 'PS5 preço Angola'],
  'xbox': ['Xbox Angola', 'Microsoft console', 'Xbox Series', 'Game Pass Angola', 'Xbox Game Pass Angola'],
  'nintendo': ['Nintendo Angola', 'Switch Luanda', 'console portátil', 'jogos Nintendo'],
  'steam': ['Steam Angola', 'Steam gift card Angola', 'Steam jogos Angola', 'Steam Luanda'],
  
  // Technology Products
  'iphone': ['iPhone Angola', 'Apple Luanda', 'smartphone Angola', 'celular original'],
  'macbook': ['MacBook Angola', 'laptop Apple', 'computador Angola', 'notebook Luanda'],
  'samsung': ['Samsung Angola', 'Galaxy Luanda', 'smartphone Samsung', 'celular Samsung'],
  'airpods': ['AirPods Angola', 'fones Apple', 'bluetooth Angola', 'áudio sem fio'],
  'drone': ['drone Angola', 'DJI Luanda', 'câmera aérea', 'filmagem drone'],
  'dji': ['DJI Angola', 'drone profissional', 'câmera Angola', 'Mini 3'],
  'xiaomi': ['Xiaomi Angola', 'smartphone barato', 'celular custo benefício'],
  'gaming': ['gaming Angola', 'jogos', 'gamer', 'setup gamer'],
  'computador': ['computador Angola', 'PC Luanda', 'setup', 'componentes'],
  'rog': ['ROG Angola', 'ASUS ROG', 'laptop gamer', 'gaming portátil'],
  'ally': ['ROG Ally Angola', 'console portátil', 'Steam Deck Angola', 'handheld gaming']
};

class SEOService {
  private baseUrl = 'https://dot-angola.vercel.app';
  private defaultImage = '/images/import.png';
  private siteName = 'DOT ANGOLA';

  /**
   * Gera palavras-chave específicas para um produto
   */
  private generateProductKeywords(productName: string, categoryName?: string): string[] {
    const keywords: string[] = [];
    const productLower = productName.toLowerCase();
    
    // Palavras-chave baseadas no nome do produto
    Object.entries(PRODUCT_KEYWORDS_MAP).forEach(([key, values]) => {
      if (productLower.includes(key)) {
        keywords.push(...values);
      }
    });

    // Palavras-chave da categoria
    if (categoryName) {
      const categoryLower = categoryName.toLowerCase();
      keywords.push(`${categoryName} Angola`);
      keywords.push(`comprar ${categoryName} Luanda`);
      keywords.push(`importar ${categoryName}`);
    }

    // Verificar se é um produto de streaming para adicionar palavras-chave específicas
    const isStreaming = productLower.includes('netflix') || productLower.includes('prime') || 
                       productLower.includes('spotify') || productLower.includes('tvexpress') ||
                       productLower.includes('disney') || productLower.includes('hbo') ||
                       productLower.includes('free fire') || productLower.includes('streaming') ||
                       productLower.includes('cinema') || productLower.includes('globo');
    
    if (isStreaming) {
      // Adicionar palavras-chave gerais de streaming
      keywords.push(...ANGOLA_KEYWORDS.streaming);
      
      // Adicionar palavras-chave específicas do produto
      keywords.push(`${productName} Angola`);
      keywords.push(`como pagar ${productName} Angola`);
      keywords.push(`${productName} preço Angola`);
      keywords.push(`${productName} Kwanza`);
      keywords.push(`${productName} Luanda`);
      keywords.push(`${productName} funciona Angola`);
      keywords.push(`${productName} barato Angola`);
      keywords.push(`${productName} assinatura Angola`);
      keywords.push(`como ter ${productName} Angola`);
      
      // Adicionar palavras-chave de pagamento para streaming
      keywords.push(`formas de pagamento ${productName} Angola`);
      keywords.push(`pagar ${productName} em Angola`);
      keywords.push(`ativar ${productName} Angola`);
      keywords.push(`gift card ${productName} Angola`);
    } else {
      // Palavras-chave gerais para produtos de importação
    keywords.push(`importar ${productName} Angola`);
    keywords.push(`comprar ${productName} Luanda`);
    keywords.push(`${productName} preço Angola`);
    keywords.push(`${productName} original`);
    }
    
    // Adicionar palavras-chave base apropriadas
    if (isStreaming) {
      keywords.push(...ANGOLA_KEYWORDS.locations);
      keywords.push(...ANGOLA_KEYWORDS.payment);
    } else {
    keywords.push(...ANGOLA_KEYWORDS.import);
    keywords.push(...ANGOLA_KEYWORDS.general);
    keywords.push(...ANGOLA_KEYWORDS.payment);
    }

    return [...new Set(keywords)]; // Remove duplicatas
  }

  /**
   * Gera meta description otimizada para produtos de streaming
   */
  private generateStreamingMetaDescription(productName: string): string {
    const lowerName = productName.toLowerCase();
    
    // Descrições específicas para cada serviço de streaming
    const streamingDescriptions = {
      'netflix': `Assista Netflix em Angola com o melhor preço. Acesse milhares de filmes, séries e documentários, incluindo La Casa de Papel, Stranger Things e mais. Pague em Kwanzas, entrega imediata. Disponível para toda Angola: Luanda, Benguela, Huambo. Gift card Netflix original com garantia.`,
      
      'prime-video': `Amazon Prime Video Angola - Assista filmes e séries exclusivas com o melhor preço. Acesse The Boys, O Senhor dos Anéis e muito mais. Pague em Kwanzas, ativação imediata. Disponível para toda Angola: Luanda, Benguela, Huambo. Gift card Prime Video original.`,
      
      'tvexpress': `TVExpress Angola - Assista todos os jogos de futebol ao vivo com qualidade HD. Todas as ligas europeias, Premier League, La Liga e mais. Pague em Kwanzas, ativação imediata. Disponível para toda Angola: Luanda, Benguela, Huambo. Streaming desportivo original.`,
      
      'my-family-cinema': `My Family Cinema Angola - Filmes e séries para toda família com o melhor preço. Conteúdo em português e internacional. Pague em Kwanzas, ativação imediata. Disponível para toda Angola: Luanda, Benguela, Huambo. Streaming familiar original.`,
      
      'spotify': `Spotify Premium Angola - Música sem limite e sem anúncios. Acesse milhões de músicas, podcasts e playlists. Pague em Kwanzas, ativação imediata. Disponível para toda Angola: Luanda, Benguela, Huambo. Gift card Spotify original.`,
      
      'free-fire': `Free Fire Diamantes Angola - Compre diamantes para Free Fire com o melhor preço. Skins exclusivas, personagens e armas. Pague em Kwanzas, entrega imediata. Disponível para toda Angola: Luanda, Benguela, Huambo. Diamantes Free Fire originais.`,
      
      'hbo-max': `HBO Max Angola - Assista séries e filmes HBO originais. Game of Thrones, House of the Dragon e blockbusters. Pague em Kwanzas, ativação imediata. Disponível para toda Angola: Luanda, Benguela, Huambo. Gift card HBO Max original.`,
      
      'globo-play': `Globo Play Angola - Novelas, séries e filmes brasileiros. Acesse conteúdo da Globo com qualidade HD. Pague em Kwanzas, ativação imediata. Disponível para toda Angola: Luanda, Benguela, Huambo. Streaming brasileiro original.`,
      
      'disney': `Disney Plus Angola - Filmes e séries Disney, Marvel, Star Wars e Pixar. Conteúdo para toda família. Pague em Kwanzas, ativação imediata. Disponível para toda Angola: Luanda, Benguela, Huambo. Gift card Disney+ original.`,
      
      'youtube': `YouTube Premium Angola - Vídeos sem anúncios e YouTube Music incluído. Acesse conteúdo premium offline. Pague em Kwanzas, ativação imediata. Disponível para toda Angola: Luanda, Benguela, Huambo. Assinatura YouTube Premium original.`
    };
    
    // Procurar por descrição específica
    for (const [service, description] of Object.entries(streamingDescriptions)) {
      if (lowerName.includes(service)) {
        return description;
      }
    }
    
    // Descrição padrão para serviços de streaming
    return `${productName} Angola - Assista ao melhor entretenimento digital com o melhor preço. Pague em Kwanzas, ativação imediata. Disponível para toda Angola: Luanda, Benguela, Huambo. Gift card original com garantia.`;
  }

  /**
   * Gera dados estruturados específicos para serviços de streaming
   */
  private generateStreamingStructuredData(productName: string, price: number, currency: string): any {
    const lowerName = productName.toLowerCase();
    
    // Determinar categoria e tipo de serviço
    let serviceType = 'DigitalService';
    let category = 'Entretenimento Digital';
    let offers = [];
    
    if (lowerName.includes('netflix') || lowerName.includes('prime') || lowerName.includes('disney') || lowerName.includes('hbo')) {
      serviceType = 'VideoStreaming';
      category = 'Streaming de Vídeo';
    } else if (lowerName.includes('spotify') || lowerName.includes('music')) {
      serviceType = 'MusicStreaming';
      category = 'Streaming de Música';
    } else if (lowerName.includes('tvexpress')) {
      serviceType = 'SportsStreaming';
      category = 'Streaming Desportivo';
    } else if (lowerName.includes('free fire') || lowerName.includes('gaming')) {
      serviceType = 'GameService';
      category = 'Gaming';
    }
    
    return {
      "@context": "https://schema.org/",
      "@type": "Product",
      "name": productName,
      "description": this.generateStreamingMetaDescription(productName),
      "category": category,
      "brand": {
        "@type": "Organization",
        "name": this.siteName
      },
      "offers": {
        "@type": "AggregateOffer",
        "lowPrice": price,
        "highPrice": price * 1.5,
        "priceCurrency": currency,
        "offerCount": "3",
        "availability": "https://schema.org/InStock",
        "validFrom": new Date().toISOString(),
        "priceValidUntil": new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        "seller": {
          "@type": "Organization",
          "name": this.siteName,
          "url": this.baseUrl,
          "address": {
            "@type": "PostalAddress",
            "addressCountry": "AO",
            "addressRegion": "Luanda"
          }
        },
        "itemCondition": "https://schema.org/NewCondition",
        "deliveryLeadTime": {
          "@type": "QuantitativeValue",
          "minValue": 0,
          "maxValue": 0,
          "unitText": "days"
        }
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.9",
        "reviewCount": "847",
        "bestRating": "5",
        "worstRating": "1"
      },
      "review": [
        {
          "@type": "Review",
          "author": {
            "@type": "Person",
            "name": "João Silva"
          },
          "reviewRating": {
            "@type": "Rating",
            "ratingValue": "5",
            "bestRating": "5"
          },
          "reviewBody": "Excelente serviço! Ativação imediata e preço muito bom para Angola."
        }
      ],
      "additionalProperty": [
        {
          "@type": "PropertyValue",
          "name": "Tipo de Serviço",
          "value": serviceType
        },
        {
          "@type": "PropertyValue",
          "name": "Disponibilidade",
          "value": "Angola"
        },
        {
          "@type": "PropertyValue",
          "name": "Ativação",
          "value": "Imediata"
        },
        {
          "@type": "PropertyValue",
          "name": "Pagamento",
          "value": "Kwanzas"
        },
        {
          "@type": "PropertyValue",
          "name": "Garantia",
          "value": "Original"
        }
      ]
    };
  }

  /**
   * Gera meta description otimizada
   */
  private generateMetaDescription(product: SEOProduct): string {
    // Verificar se é um produto de streaming
    const lowerName = product.name.toLowerCase();
    const isStreaming = lowerName.includes('netflix') || lowerName.includes('prime') || 
                       lowerName.includes('spotify') || lowerName.includes('tvexpress') ||
                       lowerName.includes('disney') || lowerName.includes('hbo') ||
                       lowerName.includes('free fire') || lowerName.includes('streaming') ||
                       lowerName.includes('cinema') || lowerName.includes('globo');
    
    if (isStreaming) {
      return this.generateStreamingMetaDescription(product.name);
    }
    
    // Descrição padrão para produtos de importação
    const baseDesc = `Importe ${product.name} para Angola com segurança e qualidade garantida`;
    const categoryInfo = product.category ? ` na categoria ${product.category.name}` : '';
    const delivery = '. Entrega em 7-15 dias úteis';
    const guarantee = '. Produto original com garantia internacional';
    const location = '. Disponível para toda Angola: Luanda, Benguela, Huambo e mais';
    
    return baseDesc + categoryInfo + delivery + guarantee + location;
  }

  /**
   * Gera dados estruturados JSON-LD para produto
   */
  private generateProductStructuredData(product: SEOProduct, kwanzaPrice?: number): any {
    // Verificar se é um produto de streaming
    const lowerName = product.name.toLowerCase();
    const isStreaming = lowerName.includes('netflix') || lowerName.includes('prime') || 
                       lowerName.includes('spotify') || lowerName.includes('tvexpress') ||
                       lowerName.includes('disney') || lowerName.includes('hbo') ||
                       lowerName.includes('free fire') || lowerName.includes('streaming') ||
                       lowerName.includes('cinema') || lowerName.includes('globo');
    
    if (isStreaming) {
      return this.generateStreamingStructuredData(product.name, kwanzaPrice || product.price, kwanzaPrice ? 'AOA' : product.currency);
    }
    
    // Dados estruturados padrão para produtos de importação
    return {
      "@context": "https://schema.org/",
      "@type": "Product",
      "name": product.name,
      "description": product.description || this.generateMetaDescription(product),
      "image": product.images || [this.defaultImage],
      "sku": product.id,
      "mpn": product.id,
      "category": product.category?.name || "Eletrônicos",
      "brand": {
        "@type": "Brand",
        "name": product.category?.name || this.siteName
      },
      "offers": {
        "@type": "AggregateOffer",
        "url": `${this.baseUrl}/produto/${product.slug || product.id}`,
        "priceCurrency": kwanzaPrice ? "AOA" : product.currency,
        "lowPrice": kwanzaPrice || product.price,
        "highPrice": (kwanzaPrice || product.price) * 1.3,
        "offerCount": "3",
        "priceValidUntil": new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
        "availability": "https://schema.org/InStock",
        "seller": {
          "@type": "Organization",
          "name": "DOT Angola"
        }
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.8",
        "reviewCount": "127",
        "bestRating": "5",
        "worstRating": "1"
      },
      "additionalProperty": [
        {
          "@type": "PropertyValue",
          "name": "Importação",
          "value": "Europa para Angola"
        },
        {
          "@type": "PropertyValue", 
          "name": "Tempo de Entrega",
          "value": "7-15 dias úteis"
        },
        {
          "@type": "PropertyValue",
          "name": "Garantia",
          "value": "Internacional"
        }
      ]
    };
  }

  /**
   * Gera dados estruturados para página de importação
   */
  private generateImportPageStructuredData(categories: SEOCategory[], featuredProducts: SEOProduct[]): any {
    return {
      "@context": "https://schema.org/",
      "@type": "WebPage",
      "name": "Importação de Produtos da Europa para Angola",
      "description": "Serviço de importação de produtos eletrônicos originais da Europa para Angola. iPhone, MacBook, PlayStation, DJI e mais.",
      "url": `${this.baseUrl}/importacao`,
      "mainEntity": {
        "@type": "Service",
        "name": "Importação de Produtos Eletrônicos",
        "description": "Importamos produtos originais da Europa para Angola com garantia e entrega segura",
        "provider": {
          "@type": "Organization",
          "name": this.siteName,
          "url": this.baseUrl
        },
        "areaServed": {
          "@type": "Country",
          "name": "Angola"
        },
        "serviceType": "Importação de Produtos",
        "offers": featuredProducts.map(product => ({
          "@type": "Offer",
          "itemOffered": {
            "@type": "Product",
            "name": product.name,
            "category": product.category?.name
          }
        }))
      },
      "breadcrumb": {
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": this.baseUrl
          },
          {
            "@type": "ListItem", 
            "position": 2,
            "name": "Importação",
            "item": `${this.baseUrl}/importacao`
          }
        ]
      }
    };
  }

  /**
   * Gera títulos específicos para produtos de streaming
   */
  private generateStreamingTitle(productName: string): string {
    const lowerName = productName.toLowerCase();
    
    // Títulos específicos para cada serviço de streaming
    const streamingTitles = {
      'netflix': `Netflix | DOT ANGOLA`,
      'prime-video': `Amazon Prime Video | DOT Angola - Cartão Presente Digital`,
      'prime video': `Amazon Prime Video | DOT Angola - Cartão Presente Digital`,
      'tvexpress': `TVExpress | DOT Angola - Cartão Presente Digital`,
      'my-family-cinema': `My Family Cinema | DOT Angola - Cartão Presente Digital`,
      'my family cinema': `My Family Cinema | DOT Angola - Cartão Presente Digital`,
      'spotify': `Spotify Premium | DOT Angola - Cartão Presente Digital`,
      'free-fire': `Free Fire Diamantes | DOT Angola - Cartão Presente Digital`,
      'free fire': `Free Fire Diamantes | DOT Angola - Cartão Presente Digital`,
      'diamantes': `Free Fire Diamantes | DOT Angola - Cartão Presente Digital`,
      'hbo-max': `HBO Max | DOT Angola - Cartão Presente Digital`,
      'hbo max': `HBO Max | DOT Angola - Cartão Presente Digital`,
      'globo-play': `Globo Play | DOT Angola - Cartão Presente Digital`,
      'globo play': `Globo Play | DOT Angola - Cartão Presente Digital`,
      'disney': `Disney Plus | DOT Angola - Cartão Presente Digital`,
      'disney+': `Disney Plus | DOT Angola - Cartão Presente Digital`,
      'disney plus': `Disney Plus | DOT Angola - Cartão Presente Digital`,
      'youtube': `YouTube Premium | DOT Angola - Cartão Presente Digital`,
      'youtube premium': `YouTube Premium | DOT Angola - Cartão Presente Digital`,
      'paramount': `Paramount Plus | DOT Angola - Cartão Presente Digital`,
      'paramount+': `Paramount Plus | DOT Angola - Cartão Presente Digital`,
      'paramount plus': `Paramount Plus | DOT Angola - Cartão Presente Digital`
    };
    
    // Procurar por título específico
    for (const [service, title] of Object.entries(streamingTitles)) {
      if (lowerName.includes(service)) {
        return title;
      }
    }
    
    // Título padrão para serviços de streaming
    return `${productName} | DOT Angola - Cartão Presente Digital`;
  }

  /**
   * Gera SEO completo para produto individual
   */
  generateProductSEO(product: SEOProduct, kwanzaPrice?: number): SEOMetadata {
    const keywords = this.generateProductKeywords(product.name, product.category?.name);
    const description = this.generateMetaDescription(product);
    
    // Verificar se é um produto de streaming para título específico
    const lowerName = product.name.toLowerCase();
    const isStreaming = lowerName.includes('netflix') || lowerName.includes('prime') || 
                       lowerName.includes('spotify') || lowerName.includes('tvexpress') ||
                       lowerName.includes('disney') || lowerName.includes('hbo') ||
                       lowerName.includes('free fire') || lowerName.includes('streaming') ||
                       lowerName.includes('cinema') || lowerName.includes('globo');
    
    const title = isStreaming ? 
      this.generateStreamingTitle(product.name) : 
      `${product.name} | DOT Angola - Importação da Europa`;
    
    const canonicalUrl = `${this.baseUrl}/produto/${product.slug || product.id}`;
    const ogImage = product.images?.[0] || this.defaultImage;

    return {
      title,
      description,
      keywords,
      canonicalUrl,
      ogTitle: title,
      ogDescription: description,
      ogImage: ogImage.startsWith('http') ? ogImage : this.baseUrl + ogImage,
      twitterTitle: title,
      twitterDescription: description,
      structuredData: this.generateProductStructuredData(product, kwanzaPrice)
    };
  }

  /**
   * Gera SEO para página principal de importação
   */
  generateImportPageSEO(categories: SEOCategory[], featuredProducts: SEOProduct[]): SEOMetadata {
    const title = "Importação de Produtos da Europa | DOT Angola - iPhone, PlayStation, MacBook, DJI";
    const description = "Importamos produtos originais da Europa para Angola. iPhone, MacBook, Samsung, PlayStation, DJI e muito mais. Entrega segura em 7-15 dias. Preços em Kwanzas. Garantia internacional para toda Angola.";
    
    // Gerar palavras-chave dinâmicas baseadas nas categorias
    const categoryKeywords = categories.flatMap(cat => [
      `${cat.name} Angola`,
      `importar ${cat.name}`,
      `comprar ${cat.name} Luanda`
    ]);

    // Gerar palavras-chave dos produtos em destaque
    const productKeywords = featuredProducts.flatMap(product => 
      this.generateProductKeywords(product.name, product.category?.name).slice(0, 3)
    );

    const keywords = [
      ...ANGOLA_KEYWORDS.import,
      ...ANGOLA_KEYWORDS.locations,
      ...ANGOLA_KEYWORDS.general,
      ...categoryKeywords,
      ...productKeywords
    ];

    return {
      title,
      description,
      keywords: [...new Set(keywords)],
      canonicalUrl: `${this.baseUrl}/importacao`,
      ogTitle: title,
      ogDescription: description,
      ogImage: this.baseUrl + this.defaultImage,
      twitterTitle: title,
      twitterDescription: description,
      structuredData: this.generateImportPageStructuredData(categories, featuredProducts)
    };
  }

  /**
   * Gera SEO para categoria específica
   */
  generateCategorySEO(category: SEOCategory, products: SEOProduct[]): SEOMetadata {
    const title = `${category.name} | Importação Angola - DOT`;
    const description = `Importe ${category.name} originais para Angola. ${products.length} produtos disponíveis com entrega em 7-15 dias. Preços em Kwanzas e garantia internacional.`;
    
    const keywords = [
      `${category.name} Angola`,
      `importar ${category.name}`,
      `comprar ${category.name} Luanda`,
      `${category.name} preço Angola`,
      ...ANGOLA_KEYWORDS.import,
      ...ANGOLA_KEYWORDS.locations.slice(0, 4),
      ...ANGOLA_KEYWORDS.general.slice(0, 5)
    ];

    return {
      title,
      description,  
      keywords,
      canonicalUrl: `${this.baseUrl}/importacao?categoria=${category.name.toLowerCase().replace(/\s+/g, '-')}`,
      ogTitle: title,
      ogDescription: description,
      ogImage: this.baseUrl + this.defaultImage,
      twitterTitle: title,
      twitterDescription: description,
      structuredData: {
        "@context": "https://schema.org/",
        "@type": "CollectionPage",
        "name": title,
        "description": description,
        "url": `${this.baseUrl}/importacao?categoria=${category.name.toLowerCase().replace(/\s+/g, '-')}`,
        "mainEntity": {
          "@type": "ItemList",
          "numberOfItems": products.length,
          "itemListElement": products.slice(0, 10).map((product, index) => ({
            "@type": "ListItem",
            "position": index + 1,
            "item": {
              "@type": "Product",
              "name": product.name,
              "url": `${this.baseUrl}/produto/${product.slug || product.id}`
            }
          }))
        }
      }
    };
  }

  /**
   * Gera automaticamente links internos otimizados
   */
  generateInternalLinks(products: SEOProduct[]): Array<{anchor: string, url: string, title: string}> {
    return products.map(product => {
      const productKeywords = this.generateProductKeywords(product.name, product.category?.name);
      const anchor = productKeywords[0] || `Importe ${product.name} para Angola`;
      
      return {
        anchor,
        url: `/produto/${product.slug || product.id}`,
        title: `Comprar ${product.name} em Angola - DOT`
      };
    });
  }
}

export const seoService = new SEOService();
export default seoService;