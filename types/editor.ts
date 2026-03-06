/**
 * Valeur générique d'un champ de formulaire
 */
export type FormDataValue = string | boolean | string[] | Array<Record<string, unknown>>;

/**
 * Représente un bloc dans l'éditeur avec sa hiérarchie
 */
export interface BlockNode {
  /** Identifiant unique du bloc */
  id: string

  /** Type de bloc (BlobBlock, BlobSection, BlobIterator, etc.) */
  blockType: string

  /** Données du formulaire pour ce bloc */
  data: Record<string, FormDataValue>

  /** Blocs enfants (récursif) */
  innerBlocks?: BlockNode[]

  /** Métadonnées optionnelles */
  meta?: {
    collapsed?: boolean
    locked?: boolean
    visible?: boolean
  }
}

/**
 * Données d'une page complète
 */
export interface PageData {
  /** Version du format de données */
  version: string

  /** Slug de la page (utilisé pour le nom de fichier) */
  slug: string

  /** Titre de la page */
  title: string

  /** Blocs de la page */
  blocks: BlockNode[]

  /** Métadonnées optionnelles */
  meta?: {
    createdAt?: string
    updatedAt?: string
    author?: string
  }
}

/**
 * Sélection courante dans l'éditeur
 */
export interface EditorSelection {
  /** ID du bloc sélectionné */
  blockId: string | null

  /** Chemin vers le bloc dans l'arborescence */
  path: (string | number)[]
}

/**
 * État de l'éditeur
 */
export interface EditorState {
  /** Blocs de la page courante */
  blocks: BlockNode[]

  /** Bloc actuellement sélectionné */
  selectedBlockId: string | null

  /** Page courante */
  currentPage: string | null

  /** Indicateur de sauvegarde */
  isSaving: boolean

  /** Dernier enregistrement */
  lastSaved: Date | null
}

/**
 * Props communes pour les composants de l'éditeur
 */
export interface EditorContextProps {
  blocks: BlockNode[]
  selectedBlockId: string | null
  onSelectBlock: (blockId: string | null) => void
  onUpdateBlock: (blockId: string, data: Partial<Record<string, FormDataValue>>) => void
  onInsertBlock: (parentId: string | null, blockType: string, index?: number) => void
  onDeleteBlock: (blockId: string) => void
  onMoveBlock: (blockId: string, direction: "up" | "down") => void
}

/**
 * Erreur de validation de structure
 */
export interface ValidationError {
  blockId: string
  error: string
  path?: (string | number)[]
}
