import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

interface StreamingSEOProps {
  productName: string;
  price?: number;
  currency?: string;
  image?: string;
  customTitle?: string;
  customDescription?: string;
  customKeywords?: string[];
}

const BASE_URL = 'https://dotangola.com';
const DEFAULT_IMAGE = `${BASE_URL}/images/DOTLOGO PRINCIPAL.jpg`;

export function StreamingSEO({ 
  productName, 
  price, 
  currency = 'EUR',
  image = DEFAULT_IMAGE,
  customTitle,
  customDescription,
  customKeywords
}: StreamingSEOProps) {
  const location = useLocation();
  const lowerName = productName.toLowerCase();
  
  // Gerar título específico para streaming se não fornecido
  const generateStreamingTitle = () => {
    if (customTitle) return customTitle;
    
    const streamingTitles = {
      'netflix': `Netflix | DOT Angola`,
      'prime-video': `Prime Video | DOT Angola`,
      'prime video': `Prime Video | DOT Angola`,
      'tvexpress': `TVExpress | DOT Angola`,
      'tv express': `TVExpress | DOT Angola`,
      'my-family-cinema': `My Family Cinema | DOT Angola`,
      'my family cinema': `My Family Cinema | DOT Angola`,
      'spotify': `Spotify Premium | DOT Angola`,
      'free-fire': `Free Fire Diamantes | DOT Angola`,
      'free fire': `Free Fire Diamantes | DOT Angola`,
      'hbo-max': `HBO Max | DOT Angola`,
      'hbo max': `HBO Max | DOT Angola`,
      'globo-play': `Globo Play | DOT Angola`,
      'globo play': `Globo Play | DOT Angola`,
      'disney': `Disney Plus | DOT Angola`,
      'disney+': `Disney Plus | DOT Angola`,
      'youtube': `YouTube Premium | DOT Angola`,
      'paramount': `Paramount Plus | DOT Angola`
    };
    
    for (const [service, title] of Object.entries(streamingTitles)) {
      if (lowerName.includes(service)) {
        return title;
      }
    }
    
    return `${productName} | DOT Angola`;
  };
  
  // Gerar descrição específica para streaming se não fornecida
  const generateStreamingDescription = () => {
    if (customDescription) return customDescription;
    
    const streamingDescriptions = {
      'netflix': `Assista Netflix em Angola com o melhor preço. Acesse milhares de filmes, séries e documentários, incluindo La Casa de Papel, Stranger Things e mais. Pague em Kwanzas, entrega imediata. Disponível para toda Angola: Luanda, Benguela, Huambo. Gift card Netflix original com garantia.`,
      'prime-video': `Amazon Prime Video Angola - Assista filmes e séries exclusivas com o melhor preço. Acesse The Boys, O Senhor dos Anéis e muito mais. Pague em Kwanzas, ativação imediata. Disponível para toda Angola: Luanda, Benguela, Huambo. Gift card Prime Video original.`,
      'prime video': `Amazon Prime Video Angola - Assista filmes e séries exclusivas com o melhor preço. Acesse The Boys, O Senhor dos Anéis e muito mais. Pague em Kwanzas, ativação imediata. Disponível para toda Angola: Luanda, Benguela, Huambo. Gift card Prime Video original.`,
      'tvexpress': `TVExpress Angola - Assista todos os jogos de futebol ao vivo com qualidade HD. Todas as ligas europeias, Premier League, La Liga e mais. Pague em Kwanzas, ativação imediata. Disponível para toda Angola: Luanda, Benguela, Huambo. Streaming desportivo original.`,
      'tv express': `TVExpress Angola - Assista todos os jogos de futebol ao vivo com qualidade HD. Todas as ligas europeias, Premier League, La Liga e mais. Pague em Kwanzas, ativação imediata. Disponível para toda Angola: Luanda, Benguela, Huambo. Streaming desportivo original.`,
      'my-family-cinema': `My Family Cinema Angola - Filmes e séries para toda família com o melhor preço. Conteúdo em português e internacional. Pague em Kwanzas, ativação imediata. Disponível para toda Angola: Luanda, Benguela, Huambo. Streaming familiar original.`,
      'my family cinema': `My Family Cinema Angola - Filmes e séries para toda família com o melhor preço. Conteúdo em português e internacional. Pague em Kwanzas, ativação imediata. Disponível para toda Angola: Luanda, Benguela, Huambo. Streaming familiar original.`,
      'spotify': `Spotify Premium Angola - Música sem limite e sem anúncios. Acesse milhões de músicas, podcasts e playlists. Pague em Kwanzas, ativação imediata. Disponível para toda Angola: Luanda, Benguela, Huambo. Gift card Spotify original.`,
      'free-fire': `Free Fire Diamantes Angola - Compre diamantes para Free Fire com o melhor preço. Skins exclusivas, personagens e armas. Pague em Kwanzas, entrega imediata. Disponível para toda Angola: Luanda, Benguela, Huambo. Diamantes Free Fire originais.`,
      'free fire': `Free Fire Diamantes Angola - Compre diamantes para Free Fire com o melhor preço. Skins exclusivas, personagens e armas. Pague em Kwanzas, entrega imediata. Disponível para toda Angola: Luanda, Benguela, Huambo. Diamantes Free Fire originais.`,
      'hbo-max': `HBO Max Angola - Assista séries e filmes HBO originais. Game of Thrones, House of the Dragon e blockbusters. Pague em Kwanzas, ativação imediata. Disponível para toda Angola: Luanda, Benguela, Huambo. Gift card HBO Max original.`,
      'hbo max': `HBO Max Angola - Assista séries e filmes HBO originais. Game of Thrones, House of the Dragon e blockbusters. Pague em Kwanzas, ativação imediata. Disponível para toda Angola: Luanda, Benguela, Huambo. Gift card HBO Max original.`,
      'globo-play': `Globo Play Angola - Novelas, séries e filmes brasileiros. Acesse conteúdo da Globo com qualidade HD. Pague em Kwanzas, ativação imediata. Disponível para toda Angola: Luanda, Benguela, Huambo. Streaming brasileiro original.`,
      'globo play': `Globo Play Angola - Novelas, séries e filmes brasileiros. Acesse conteúdo da Globo com qualidade HD. Pague em Kwanzas, ativação imediata. Disponível para toda Angola: Luanda, Benguela, Huambo. Streaming brasileiro original.`,
      'disney': `Disney Plus Angola - Filmes e séries Disney, Marvel, Star Wars e Pixar. Conteúdo para toda família. Pague em Kwanzas, ativação imediata. Disponível para toda Angola: Luanda, Benguela, Huambo. Gift card Disney+ original.`,
      'disney+': `Disney Plus Angola - Filmes e séries Disney, Marvel, Star Wars e Pixar. Conteúdo para toda família. Pague em Kwanzas, ativação imediata. Disponível para toda Angola: Luanda, Benguela, Huambo. Gift card Disney+ original.`,
      'youtube': `YouTube Premium Angola - Vídeos sem anúncios e YouTube Music incluído. Acesse conteúdo premium offline. Pague em Kwanzas, ativação imediata. Disponível para toda Angola: Luanda, Benguela, Huambo. Assinatura YouTube Premium original.`,
      'paramount': `Paramount Plus Angola - Séries e filmes Paramount originais. Acesse conteúdo exclusivo com qualidade HD. Pague em Kwanzas, ativação imediata. Disponível para toda Angola: Luanda, Benguela, Huambo. Gift card Paramount+ original.`
    };
    
    for (const [service, description] of Object.entries(streamingDescriptions)) {
      if (lowerName.includes(service)) {
        return description;
      }
    }
    
    return `${productName} Angola - Assista ao melhor entretenimento digital com o melhor preço. Pague em Kwanzas, ativação imediata. Disponível para toda Angola: Luanda, Benguela, Huambo. Gift card original com garantia.`;
  };
  
  // Gerar palavras-chave específicas para streaming
  const generateStreamingKeywords = () => {
    if (customKeywords) return customKeywords;
    
    const baseKeywords = [
      `${productName} Angola`,
      `como pagar ${productName} Angola`,
      `${productName} preço Angola`,
      `${productName} Kwanza`,
      `${productName} Luanda`,
      `${productName} funciona Angola`,
      `${productName} barato Angola`,
      `${productName} assinatura Angola`,
      `como ter ${productName} Angola`,
      `formas de pagamento ${productName} Angola`,
      `pagar ${productName} em Angola`,
      `ativar ${productName} Angola`,
      `gift card ${productName} Angola`,
      'streaming Angola',
      'assistir online Angola',
      'entretenimento digital Angola',
      'serviços de streaming Angola',
      'TV online Angola',
      'filmes online Angola',
      'séries Angola',
      'streaming barato Angola',
      'como pagar streaming Angola',
      'formas de pagamento streaming Angola',
      'Angola', 'Luanda', 'Benguela', 'Huambo', 'Lubango', 'Cabinda',
      'Kwanza', 'Kz', 'pagamento', 'dinheiro', 'preço Angola'
    ];
    
    // Adicionar palavras-chave específicas do serviço
    const serviceKeywords = {
      'netflix': ['Netflix Angola', 'Netflix Luanda', 'Netflix Kwanza', 'La Casa de Papel Angola', 'séries Netflix Angola'],
      'prime-video': ['Prime Video Angola', 'Amazon Prime Angola', 'Prime Video Luanda', 'The Boys Angola'],
      'prime video': ['Prime Video Angola', 'Amazon Prime Angola', 'Prime Video Luanda', 'The Boys Angola'],
      'tvexpress': ['TVExpress Angola', 'TVExpress futebol', 'TVExpress jogos', 'futebol ao vivo Angola'],
      'tv express': ['TVExpress Angola', 'TVExpress futebol', 'TVExpress jogos', 'futebol ao vivo Angola'],
      'spotify': ['Spotify Angola', 'Spotify Premium Angola', 'música streaming Angola', 'Spotify Luanda'],
      'free-fire': ['Free Fire Angola', 'diamantes Free Fire Angola', 'Free Fire Luanda', 'Free Fire skins Angola'],
      'free fire': ['Free Fire Angola', 'diamantes Free Fire Angola', 'Free Fire Luanda', 'Free Fire skins Angola'],
      'disney': ['Disney Plus Angola', 'Disney+ Angola', 'Marvel Angola', 'Star Wars Angola'],
      'disney+': ['Disney Plus Angola', 'Disney+ Angola', 'Marvel Angola', 'Star Wars Angola']
    };
    
    let specificKeywords = [];
    for (const [service, keywords] of Object.entries(serviceKeywords)) {
      if (lowerName.includes(service)) {
        specificKeywords = keywords;
        break;
      }
    }
    
    return [...baseKeywords, ...specificKeywords];
  };
  
  const title = generateStreamingTitle();
  const description = generateStreamingDescription();
  const keywords = generateStreamingKeywords();
  const canonicalUrl = `${BASE_URL}${location.pathname}`;
  const absoluteImageUrl = image.startsWith('http') ? image : `${BASE_URL}${image}`;
  
  // Gerar dados estruturados para streaming
  const structuredData = {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": productName,
    "description": description,
    "category": "Entretenimento Digital",
    "brand": {
      "@type": "Organization",
      "name": "DOT ANGOLA"
    },
    "offers": {
      "@type": "Offer",
      "price": price || 0,
      "priceCurrency": currency === 'EUR' ? 'AOA' : currency,
      "availability": "https://schema.org/InStock",
      "validFrom": new Date().toISOString(),
      "priceValidUntil": new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      "seller": {
        "@type": "Organization",
        "name": "DOT ANGOLA",
        "url": BASE_URL,
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
    "additionalProperty": [
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

  return (
    <Helmet>
      {/* Títulos e descrições */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords.join(', ')} />
      
      {/* Meta tags para Angola específicas */}
      <meta name="geo.region" content="AO" />
      <meta name="geo.country" content="Angola" />
      <meta name="geo.placename" content="Luanda" />
      <meta name="language" content="pt-AO" />
      <meta name="target-country" content="Angola" />
      <meta name="target-audience" content="Angola" />
      <meta name="distribution" content="local" />
      <meta name="coverage" content="Angola" />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content="product" />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={absoluteImageUrl} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={title} />
      <meta property="og:site_name" content="DOT ANGOLA" />
      <meta property="og:locale" content="pt_AO" />
      <meta property="product:price:amount" content={price?.toString() || "0"} />
      <meta property="product:price:currency" content={currency === 'EUR' ? 'AOA' : currency} />
      <meta property="product:availability" content="in stock" />
      <meta property="product:condition" content="new" />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={canonicalUrl} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={absoluteImageUrl} />
      <meta name="twitter:image:alt" content={title} />
      <meta name="twitter:site" content="@dotangola" />
      <meta name="twitter:creator" content="@dotangola" />
      
      {/* Otimizações para SEO */}
      <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      <meta name="googlebot" content="index, follow" />
      <meta name="bingbot" content="index, follow" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="theme-color" content="#01042D" />
      <meta httpEquiv="content-language" content="pt-AO" />
      <meta name="rating" content="general" />
      <meta name="revisit-after" content="7 days" />
      
      {/* Links canônicos e alternativos */}
      <link rel="canonical" href={canonicalUrl} />
      <link rel="alternate" hrefLang="pt-ao" href={canonicalUrl} />
      <link rel="alternate" hrefLang="pt" href={canonicalUrl} />
      <link rel="alternate" hrefLang="x-default" href={canonicalUrl} />
      
      {/* Meta tags para performance */}
      <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
      <meta name="format-detection" content="telephone=yes" />
      <meta name="format-detection" content="address=yes" />
      <meta name="format-detection" content="email=yes" />
      
      {/* Dados estruturados JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData)
        }}
      />
      
      {/* Schema.org adicional para organização */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "DOT ANGOLA",
            "url": BASE_URL,
            "logo": `${BASE_URL}/images/DOTLOGO PRINCIPAL.jpg`,
            "description": "Especialistas em entretenimento digital e gift cards para Angola",
            "address": {
              "@type": "PostalAddress",
              "addressCountry": "AO",
              "addressRegion": "Luanda"
            },
            "sameAs": [
              "https://www.facebook.com/dotangola",
              "https://www.instagram.com/dotangola"
            ],
            "contactPoint": {
              "@type": "ContactPoint",
              "contactType": "customer service",
              "areaServed": "AO",
              "availableLanguage": "Portuguese"
            }
          })
        }}
      />
      
      {/* FAQ Schema para streaming */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              {
                "@type": "Question",
                "name": `Como pagar ${productName} em Angola?`,
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": `Você pode pagar ${productName} em Angola através da DOT Angola usando Kwanzas. Oferecemos gift cards originais com ativação imediata e garantia.`
                }
              },
              {
                "@type": "Question",
                "name": `${productName} funciona em Angola?`,
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": `Sim, ${productName} funciona perfeitamente em Angola. Nossos gift cards são originais e funcionam em todo o território angolano.`
                }
              },
              {
                "@type": "Question",
                "name": `Qual o preço do ${productName} em Angola?`,
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": `O preço do ${productName} em Angola varia conforme o plano escolhido. Oferecemos os melhores preços do mercado em Kwanzas com ativação imediata.`
                }
              }
            ]
          })
        }}
      />
    </Helmet>
  );
}

export default StreamingSEO; 