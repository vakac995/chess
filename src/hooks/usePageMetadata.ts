import { useEffect } from 'react';
import { PageMetadata, mergeMetadata, updateDocumentMetadata } from '@utils/seo';

/**
 * Custom hook for managing page metadata with SEO best practices
 *
 * @param metadata - Page-specific metadata
 */
export function usePageMetadata(metadata: Partial<PageMetadata>): void {
  useEffect(() => {
    const finalMetadata = mergeMetadata(metadata);
    updateDocumentMetadata(finalMetadata);
  }, [metadata]);
}
