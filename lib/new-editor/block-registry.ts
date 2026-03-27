/**
 * Registry des blocs pour le nouveau système d'éditeur
 * Contient 3 types: Blob, BlobIterator et ButtonTooltip
 */

import type { LucideIcon } from 'lucide-react';
import type { FormDataValue } from '@/types/editor';
import { Box, LayoutGrid, HelpCircle, AlignLeft, SeparatorHorizontal, List, MessageCircleQuestion, Mail } from 'lucide-react';
import { BlockType } from './block-types';
import fieldSections, { type Field as BlobField, type FieldSection } from '@/lib/blob-fields';
import { IteratorBlockDefinition } from '@/lib/blob-iterator-definition';
import { buttonTooltipFields } from '@/lib/button-tooltip-fields';
import { faqFields } from '@/lib/faq-fields';
import { formFieldSections } from '@/lib/form-fields';

export interface BlockDefinition {
  label: string;
  icon: LucideIcon;
  description: string;
  allowedInnerBlocks: BlockType[] | 'all';
  sections: Record<string, FieldSection> | Record<string, BlobField[]>;
  defaultValues?: Record<string, FormDataValue>;
  initialValues?: Record<string, FormDataValue>;
}

export const BLOCK_REGISTRY: Record<BlockType, BlockDefinition> = {
  blob: {
    label: 'Blob',
    icon: Box,
    description: 'Composant flexible pour tout type de contenu',
    allowedInnerBlocks: 'all', // Peut contenir n'importe quel bloc (récursif)
    sections: fieldSections,
    initialValues: {
      // Non-responsive fields (stored directly in data)
      markerType: 'none',
      figureType: 'none',
      showContent: false,
      contentType: 'text',
      // Responsive fields (will be stored in responsive.base by BlobInspector)
      responsive: {
        base: {
          size: 'md',
          layout: 'stack',
          align: 'left',
          direction: 'default',
          marker: 'top',
          actions: 'after',
        }
      }
    },
  },

  blobIterator: {
    label: 'Blob Iterator',
    icon: LayoutGrid,
    description: 'Collection de blobs avec layout responsive',
    allowedInnerBlocks: [], // Ne peut pas contenir de blocs imbriqués (items gérés différemment)
    sections: {}, // On gérera les sections dans l'inspector
    defaultValues: IteratorBlockDefinition.defaultValues,
    initialValues: {
      iteratorLayout: 'grid-3',
      iteratorGapX: 'md',
      iteratorGapY: 'md',
      itemFields: [
        'title',
        'emphasisText',
        'eyebrow',
        'eyebrowTheme',
        'subtitle',
        'markerContent',
        'markerIcon',
        'image',
        'video',
        'buttons',
        'contentText',
      ],
    },
  },

  buttonTooltip: {
    label: 'Button Tooltip',
    icon: HelpCircle,
    description: 'Boutons avec tooltips interactifs',
    allowedInnerBlocks: [], // Pas de blocs imbriqués
    sections: buttonTooltipFields,
    initialValues: {
      layout: 'horizontal',
      spacing: 'md',
      align: 'left',
      variant: 'default',
      size: 'default',
      tooltips: '[]',
    },
  },

  paragraph: {
    label: 'Paragraphe',
    icon: AlignLeft,
    description: 'Bloc de texte simple',
    allowedInnerBlocks: [],
    sections: {},
    initialValues: {
      text: '',
      appearance: '',
    },
  },

  divider: {
    label: 'Séparateur',
    icon: SeparatorHorizontal,
    description: 'Ligne de séparation horizontale ou verticale',
    allowedInnerBlocks: [],
    sections: {},
    initialValues: {
      orientation: 'horizontal',
      label: '',
      spacingBefore: 'auto',
      spacingAfter: 'auto',
    },
  },

  list: {
    label: 'Liste',
    icon: List,
    description: 'Liste d\'éléments avec icône',
    allowedInnerBlocks: [],
    sections: {},
    initialValues: {
      items: '[]',
      icon: 'arrowRight',
    },
  },

  faq: {
    label: 'FAQ',
    icon: MessageCircleQuestion,
    description: 'Questions et réponses avec accordion',
    allowedInnerBlocks: [], // Pas de blocs imbriqués
    sections: faqFields,
    initialValues: {
      faqItems: '[]',
      accordionType: 'single',
      collapsible: true,
      spacing: 'md',
    },
  },

  form: {
    label: 'Formulaire',
    icon: Mail,
    description: 'Formulaire Gravity Forms configurable',
    allowedInnerBlocks: [], // Pas de blocs imbriqués
    sections: formFieldSections,
    initialValues: {
      formId: 1,
      successMessage: 'Thank you for your submission! We will get back to you soon.',
      debug: true, // Activé temporairement pour debug
    },
  },
};

/**
 * Vérifie si un type de bloc peut contenir un autre type
 */
export function canContainBlock(
  parentType: BlockType,
  childType: BlockType
): boolean {
  const parentDef = BLOCK_REGISTRY[parentType];

  if (parentDef.allowedInnerBlocks === 'all') {
    return true;
  }

  return parentDef.allowedInnerBlocks.includes(childType);
}

/**
 * Récupère la définition complète d'un bloc
 */
export function resolveBlockSections(blockType: BlockType): Record<string, FieldSection> | Record<string, BlobField[]> {
  const definition = BLOCK_REGISTRY[blockType];
  return definition.sections;
}

/**
 * Crée un nouveau bloc avec des valeurs par défaut
 */
export function createNewBlock(blockType: BlockType): { blockType: BlockType; data: Record<string, FormDataValue> } {
  const definition = BLOCK_REGISTRY[blockType];

  return {
    blockType,
    data: {
      ...definition.defaultValues,
      ...definition.initialValues,
    },
  };
}
