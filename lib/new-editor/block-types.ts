import type { FormDataValue } from '@/types/editor';

/**
 * Types pour le nouveau système d'éditeur
 * Supporte 3 types de blocs: Blob, BlobIterator et ButtonTooltip
 */

export type BlockType = 'blob' | 'blobIterator' | 'buttonTooltip' | 'paragraph' | 'divider' | 'list' | 'faq' | 'form';

export interface BlockNode {
  id: string;
  blockType: BlockType;
  data: Record<string, FormDataValue>;
  innerBlocks?: BlockNode[];
}

export interface EditorState {
  blocks: BlockNode[];
  selectedBlockId: string | null;
  currentPage: string;
}
