import { useEffect } from 'react';
import { PageMetadata, mergeMetadata, updateDocumentMetadata } from '@utils/seo'; // Assuming @utils is an alias for src/utils

/**
 * Custom hook for managing page metadata with SEO best practices
 *
 * @param metadata - Page-specific metadata
 */
export function usePageMetadata(metadata: Partial<PageMetadata>): void {
  useEffect(() => {
    // Merge with default metadata and update document
    const finalMetadata = mergeMetadata(metadata);
    updateDocumentMetadata(finalMetadata);

    // No cleanup needed as we're not creating anything that needs to be disposed
  }, [metadata]);
}
