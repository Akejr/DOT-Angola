import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { seoService } from '@/lib/seoService';

interface DynamicSEOProps {
  seoData?: {
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
  };
  customTitle?: string;
  customDescription?: string;
  customImage?: string;
  customKeywords?: string[];
}

const BASE_URL = 'https://dotangola.com';
const DEFAULT_IMAGE = `${BASE_URL}/images/import.png`;

export function DynamicSEO({ 
  seoData, 
  customTitle, 
  customDescription, 
  customImage,
  customKeywords 
}: DynamicSEOProps) {
  const location = useLocation();

  // Usar dados personalizados se fornecidos, senão usar seoData, senão usar padrões
  const title = customTitle || seoData?.title || 'DOT ANGOLA - Importação de Produtos da Europa';
  const description = customDescription || seoData?.description || 'Importamos produtos originais da Europa para Angola com garantia e entrega segura.';
  const keywords = customKeywords || seoData?.keywords || ['importação Angola', 'produtos Europa', 'DOT Angola', 'eletrônicos Angola'];
  const canonicalUrl = seoData?.canonicalUrl || `${BASE_URL}${location.pathname}`;
  const ogTitle = seoData?.ogTitle || title;
  const ogDescription = seoData?.ogDescription || description;
  const ogImage = customImage || seoData?.ogImage || DEFAULT_IMAGE;
  const twitterTitle = seoData?.twitterTitle || title;
  const twitterDescription = seoData?.twitterDescription || description;

  // Garantir que a imagem seja uma URL absoluta
  const absoluteImageUrl = ogImage.startsWith('http') 
    ? ogImage 
    : ogImage.startsWith('/') 
      ? `${BASE_URL}${ogImage}`
      : `${BASE_URL}/${ogImage}`;

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
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={ogTitle} />
      <meta property="og:description" content={ogDescription} />
      <meta property="og:image" content={absoluteImageUrl} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={ogTitle} />
      <meta property="og:site_name" content="DOT ANGOLA" />
      <meta property="og:locale" content="pt_AO" />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={canonicalUrl} />
      <meta name="twitter:title" content={twitterTitle} />
      <meta name="twitter:description" content={twitterDescription} />
      <meta name="twitter:image" content={absoluteImageUrl} />
      <meta name="twitter:image:alt" content={twitterTitle} />
      <meta name="twitter:site" content="@dotangola" />
      <meta name="twitter:creator" content="@dotangola" />
      
      {/* Otimizações para SEO */}
      <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      <meta name="googlebot" content="index, follow" />
      <meta name="bingbot" content="index, follow" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="theme-color" content="#01042D" />
      <meta httpEquiv="content-language" content="pt-AO" />
      
      {/* Links canônicos e alternativos */}
      <link rel="canonical" href={canonicalUrl} />
      <link rel="alternate" hrefLang="pt-ao" href={canonicalUrl} />
      <link rel="alternate" hrefLang="pt" href={canonicalUrl} />
      
      {/* Meta tags para performance */}
      <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
      <meta name="format-detection" content="telephone=yes" />
      <meta name="format-detection" content="address=yes" />
      
      {/* Preconnect para melhorar performance */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      
      {/* Dados estruturados JSON-LD */}
      {seoData?.structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(seoData.structuredData)
          }}
        />
      )}
      
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
            "description": "Especialistas em importação de produtos eletrônicos da Europa para Angola",
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
    </Helmet>
  );
}

export default DynamicSEO; 