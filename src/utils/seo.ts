/**
 * Types for page metadata
 */
export interface PageMetadata {
  title: string;
  description: string;
  keywords?: string[];
  canonicalUrl?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogUrl?: string;
  twitterCard?: 'summary' | 'summary_large_image';
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  noIndex?: boolean;
}

/**
 * Default site metadata to use as fallback
 */
export const defaultMetadata: PageMetadata = {
  title: 'Chess Game - React App',
  description: 'Play and enjoy chess with this modern web application.',
  keywords: ['chess', 'game', 'react', 'typescript', 'vite'],
  ogTitle: 'Chess Game - React App',
  ogDescription: 'Play and enjoy chess with this modern web application.',
  twitterCard: 'summary_large_image',
};

/**
 * Merges default metadata with page-specific metadata
 * @param pageMetadata - Page-specific metadata
 * @returns Combined metadata
 */
export function mergeMetadata(pageMetadata: Partial<PageMetadata>): PageMetadata {
  // Ensure keywords is always an array, even if undefined in pageMetadata
  const mergedKeywords = pageMetadata.keywords
    ? [...(defaultMetadata.keywords || []), ...pageMetadata.keywords]
    : defaultMetadata.keywords || [];

  return {
    ...defaultMetadata,
    ...pageMetadata,
    // Special handling for keywords to ensure it's always an array
    keywords: mergedKeywords,
  };
}

/**
 * Updates document title and meta tags based on provided metadata
 * @param metadata - The metadata to apply to the document
 */
export function updateDocumentMetadata(metadata: PageMetadata): void {
  // Update document title
  document.title = metadata.title;

  // Update meta description
  let metaDescription = document.querySelector('meta[name="description"]');
  if (!metaDescription) {
    metaDescription = document.createElement('meta');
    metaDescription.setAttribute('name', 'description');
    document.head.appendChild(metaDescription);
  }
  metaDescription.setAttribute('content', metadata.description);

  // Update meta keywords
  if (metadata.keywords && metadata.keywords.length > 0) {
    let metaKeywords = document.querySelector('meta[name="keywords"]');
    if (!metaKeywords) {
      metaKeywords = document.createElement('meta');
      metaKeywords.setAttribute('name', 'keywords');
      document.head.appendChild(metaKeywords);
    }
    metaKeywords.setAttribute('content', metadata.keywords.join(', '));
  }

  // Update canonical URL
  if (metadata.canonicalUrl) {
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', metadata.canonicalUrl);
  }

  // Update Open Graph tags
  updateMetaTag('og:title', metadata.ogTitle ?? metadata.title);
  updateMetaTag('og:description', metadata.ogDescription ?? metadata.description);
  if (metadata.ogImage) updateMetaTag('og:image', metadata.ogImage);
  if (metadata.ogUrl) updateMetaTag('og:url', metadata.ogUrl);

  // Update Twitter Card tags
  if (metadata.twitterCard) updateMetaTag('twitter:card', metadata.twitterCard);
  updateMetaTag('twitter:title', metadata.twitterTitle ?? metadata.ogTitle ?? metadata.title);
  updateMetaTag(
    'twitter:description',
    metadata.twitterDescription ?? metadata.ogDescription ?? metadata.description
  );
  if (metadata.twitterImage) updateMetaTag('twitter:image', metadata.twitterImage);

  // Update robots meta tag if noIndex is true
  if (metadata.noIndex) {
    updateMetaTag('robots', 'noindex, nofollow');
  } else {
    updateMetaTag('robots', 'index, follow');
  }
}

/**
 * Helper function to update or create a meta tag
 * @param name The name or property attribute of the meta tag
 * @param content The content to set
 */
function updateMetaTag(name: string, content: string): void {
  const isOpenGraph = name.startsWith('og:');
  const isTwitterCard = name.startsWith('twitter:');

  const selector =
    isOpenGraph || isTwitterCard ? `meta[property="${name}"]` : `meta[name="${name}"]`;

  let metaTag = document.querySelector(selector);

  if (!metaTag) {
    metaTag = document.createElement('meta');
    if (isOpenGraph || isTwitterCard) {
      metaTag.setAttribute('property', name);
    } else {
      metaTag.setAttribute('name', name);
    }
    document.head.appendChild(metaTag);
  }

  metaTag.setAttribute('content', content);
}
