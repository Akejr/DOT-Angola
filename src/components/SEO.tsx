import { Helmet } from 'react-helmet-async';
import { useLocation, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getGiftCardById } from '@/lib/database';
import { GiftCard } from '@/types/supabase';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  type?: string;
}

export function SEO({ 
  title, 
  description = 'O melhor da tecnologia em Angola. Gift cards internacionais e cartões Visa Virtual com os melhores preços.', 
  image = '/images/sczs.png',
  type = 'website'
}: SEOProps) {
  const siteTitle = title ? `${title} | DOT ANGOLA` : 'DOT ANGOLA - O melhor da tecnologia em Angola';
  
  return (
    <Helmet>
      <title>{siteTitle}</title>
      <meta name="description" content={description} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={siteTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={siteTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      
      {/* Outros metadados importantes */}
      <meta name="robots" content="index, follow" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="theme-color" content="#01042D" />
      <link rel="canonical" href={window.location.href} />
      
      {/* Keywords para SEO */}
      <meta name="keywords" content="gift cards Angola, comprar gift cards Angola, gift card Steam Angola, gift card Spotify Angola, gift card Netflix Angola, cartão presente Angola, tecnologia Angola, DOT Angola, gift card PlayStation Angola, gift card Xbox Angola, gift card Google Play Angola, gift card Amazon Angola, gift card Apple Angola" />
    </Helmet>
  );
}

const SEOComponent = () => {
  const location = useLocation();
  const { id } = useParams<{ id: string }>();
  const [giftCard, setGiftCard] = useState<GiftCard | null>(null);
  const path = location.pathname;

  const defaultTitle = 'DOT ANGOLA - O melhor da tecnologia em Angola';
  const defaultDescription = 'DOT ANGOLA oferece gift cards internacionais, cartões presente e cartões virtuais VISA com os melhores preços. A sua loja de tecnologia em Angola.';
  const defaultImage = '/og-image.jpg';

  useEffect(() => {
    const loadGiftCard = async () => {
      if (path.startsWith('/gift-card/') && id) {
        try {
          const card = await getGiftCardById(id);
          setGiftCard(card);
        } catch (error) {
          console.error('Erro ao carregar gift card para SEO:', error);
        }
      }
    };

    loadGiftCard();
  }, [path, id]);

  const getPageMetadata = () => {
    // Se estiver na página de detalhes do gift card e tiver os dados carregados
    if (path.startsWith('/gift-card/') && giftCard) {
      const cardImage = giftCard.image_url || defaultImage;
      return {
        title: `${giftCard.name} | DOT ANGOLA`,
        description: `${giftCard.description || `Compre ${giftCard.name} com o melhor preço em Angola.`}`,
        image: cardImage,
        url: `https://dotangola.com/gift-card/${giftCard.slug || giftCard.id}`
      };
    }

    switch (path) {
      case '/':
        return {
          title: defaultTitle,
          description: defaultDescription,
          image: defaultImage,
          url: 'https://dotangola.com'
        };
      case '/visa-virtual':
        return {
          title: 'Cartão Virtual VISA | DOT ANGOLA',
          description: 'Solicite seu cartão virtual VISA internacional na DOT ANGOLA. Aceito em milhares de lojas online em todo o mundo.',
          image: defaultImage,
          url: 'https://dotangola.com/visa-virtual'
        };
      case '/sobre-nos':
        return {
          title: 'Sobre Nós | DOT ANGOLA',
          description: 'Conheça a DOT ANGOLA, sua parceira confiável para tecnologia, cartões presente e cartões virtuais em Angola.',
          image: defaultImage,
          url: 'https://dotangola.com/sobre-nos'
        };
      case '/contato':
        return {
          title: 'Contato | DOT ANGOLA',
          description: 'Entre em contato com a DOT ANGOLA. Estamos aqui para ajudar com suas dúvidas sobre tecnologia, cartões presente e cartões virtuais.',
          image: defaultImage,
          url: 'https://dotangola.com/contato'
        };
      case '/privacidade':
        return {
          title: 'Política de Privacidade | DOT ANGOLA',
          description: 'Conheça nossa política de privacidade e como protegemos seus dados pessoais na DOT ANGOLA.',
          image: defaultImage,
          url: 'https://dotangola.com/privacidade'
        };
      case '/termos':
        return {
          title: 'Termos e Condições | DOT ANGOLA',
          description: 'Leia nossos termos e condições de uso dos serviços de tecnologia, cartões presente e cartões virtuais na DOT ANGOLA.',
          image: defaultImage,
          url: 'https://dotangola.com/termos'
        };
      default:
        return {
          title: defaultTitle,
          description: defaultDescription,
          image: defaultImage,
          url: `https://dotangola.com${path}`
        };
    }
  };

  const { title, description, image, url } = getPageMetadata();

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={url} />
      <meta property="twitter:title" content={title} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={image} />

      {/* Keywords para SEO */}
      <meta name="keywords" content="gift cards Angola, comprar gift cards Angola, gift card Steam Angola, gift card Spotify Angola, gift card Netflix Angola, cartão presente Angola, tecnologia Angola, DOT Angola, gift card PlayStation Angola, gift card Xbox Angola, gift card Google Play Angola, gift card Amazon Angola, gift card Apple Angola" />

      {/* Canonical URL */}
      <link rel="canonical" href={url} />
    </Helmet>
  );
};

export default SEOComponent; 