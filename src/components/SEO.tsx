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

const BASE_URL = 'https://dotangola.com';
const DEFAULT_IMAGE = `${BASE_URL}/images/DOTLOGO PRINCIPAL.jpg`;

export function SEO({ 
  title, 
  description = 'O melhor da tecnologia em Angola. Gift cards internacionais e cartões Visa Virtual com os melhores preços.', 
  image = DEFAULT_IMAGE,
  type = 'website'
}: SEOProps) {
  const location = useLocation();
  const { id } = useParams<{ id: string }>();
  const [giftCard, setGiftCard] = useState<GiftCard | null>(null);
  const [pageMetadata, setPageMetadata] = useState<SEOProps>({
    title,
    description,
    image,
    type
  });

  useEffect(() => {
    const loadGiftCard = async () => {
      if (location.pathname.startsWith('/gift-card/') && id) {
        try {
          const card = await getGiftCardById(id);
          setGiftCard(card);
          if (card) {
            const cardImage = card.image_url ? (card.image_url.startsWith('http') ? card.image_url : `${BASE_URL}${card.image_url}`) : DEFAULT_IMAGE;
            setPageMetadata({
              title: `${card.name} | DOT ANGOLA`,
              description: card.description || `Compre ${card.name} com o melhor preço em Angola.`,
              image: cardImage,
              type: 'product'
            });
          }
        } catch (error) {
          console.error('Erro ao carregar gift card para SEO:', error);
        }
      }
    };

    if (!title && !description && !image) {
      loadGiftCard();
    }
  }, [id, location.pathname, title, description, image]);

  const siteTitle = pageMetadata.title || 'DOT ANGOLA - O melhor da tecnologia em Angola';
  const absoluteImageUrl = pageMetadata.image?.startsWith('http') ? pageMetadata.image : `${BASE_URL}${pageMetadata.image}`;
  const canonicalUrl = `${BASE_URL}${location.pathname}`;

  return (
    <Helmet>
      <title>{siteTitle}</title>
      <meta name="description" content={pageMetadata.description} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={pageMetadata.type} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={siteTitle} />
      <meta property="og:description" content={pageMetadata.description} />
      <meta property="og:image" content={absoluteImageUrl} />
      <meta property="og:site_name" content="DOT ANGOLA" />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={canonicalUrl} />
      <meta name="twitter:title" content={siteTitle} />
      <meta name="twitter:description" content={pageMetadata.description} />
      <meta name="twitter:image" content={absoluteImageUrl} />
      
      {/* Outros metadados importantes */}
      <meta name="robots" content="index, follow" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="theme-color" content="#01042D" />
      <link rel="canonical" href={canonicalUrl} />
      
      {/* Keywords para SEO */}
      <meta name="keywords" content="gift cards Angola, comprar gift cards Angola, gift card Steam Angola, gift card Spotify Angola, gift card Netflix Angola, cartão presente Angola, tecnologia Angola, DOT Angola, gift card PlayStation Angola, gift card Xbox Angola, gift card Google Play Angola, gift card Amazon Angola, gift card Apple Angola" />
    </Helmet>
  );
}

export default SEO; 