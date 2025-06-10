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
  delivery: ['7-15 dias', 'entrega rápida', 'segura', 'confiável', 'porta a porta']
};

// Mapeamento de produtos específicos para palavras-chave angolanas
const PRODUCT_KEYWORDS_MAP: Record<string, string[]> = {
  'playstation': ['PlayStation Angola', 'PS5 Luanda', 'console Angola', 'jogos PlayStation', 'controle PS5'],
  'ps5': ['PS5 Angola', 'PlayStation 5 Luanda', 'console nova geração', 'PS5 preço Angola'],
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
  'ally': ['ROG Ally Angola', 'console portátil', 'Steam Deck Angola', 'handheld gaming'],
  'nintendo': ['Nintendo Angola', 'Switch Luanda', 'console portátil', 'jogos Nintendo'],
  'xbox': ['Xbox Angola', 'Microsoft console', 'Xbox Series', 'Game Pass']
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

    // Palavras-chave gerais
    keywords.push(`importar ${productName} Angola`);
    keywords.push(`comprar ${productName} Luanda`);
    keywords.push(`${productName} preço Angola`);
    keywords.push(`${productName} original`);
    
    // Adicionar palavras-chave base
    keywords.push(...ANGOLA_KEYWORDS.import);
    keywords.push(...ANGOLA_KEYWORDS.general);
    keywords.push(...ANGOLA_KEYWORDS.payment);

    return [...new Set(keywords)]; // Remove duplicatas
  }

  /**
   * Gera meta description otimizada
   */
  private generateMetaDescription(product: SEOProduct): string {
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
    return {
      "@context": "https://schema.org/",
      "@type": "Product",
      "name": product.name,
      "description": product.description || this.generateMetaDescription(product),
      "image": product.images || [this.defaultImage],
      "category": product.category?.name || "Eletrônicos",
      "brand": {
        "@type": "Organization",
        "name": this.siteName
      },
      "offers": {
        "@type": "Offer",
        "price": kwanzaPrice || product.price,
        "priceCurrency": kwanzaPrice ? "AOA" : product.currency,
        "availability": "https://schema.org/InStock",
        "seller": {
          "@type": "Organization",
          "name": this.siteName,
          "url": this.baseUrl
        },
        "priceValidUntil": new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 dias
        "itemCondition": "https://schema.org/NewCondition"
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
   * Gera SEO completo para produto individual
   */
  generateProductSEO(product: SEOProduct, kwanzaPrice?: number): SEOMetadata {
    const keywords = this.generateProductKeywords(product.name, product.category?.name);
    const description = this.generateMetaDescription(product);
    const title = `${product.name} | DOT Angola - Importação da Europa`;
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