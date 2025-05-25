import { useEffect } from 'react';
import { PageMetadata, mergeMetadata, updateDocumentMetadata } from '@utils/seo';
import type { Optional } from '@/types';

/**
 * Interface for the usePageMetadata hook parameters
 */
export interface UsePageMetadataProps {
  readonly metadata: Optional<Partial<PageMetadata>>;
}

/**
 * Custom hook for managing page metadata with SEO best practices
 *
 * @param props - Hook parameters containing page-specific metadata
 */
export function usePageMetadata({ metadata }: UsePageMetadataProps): void {
  useEffect(() => {
    const finalMetadata = mergeMetadata(metadata || {});
    updateDocumentMetadata(finalMetadata);
  }, [metadata]);
}
