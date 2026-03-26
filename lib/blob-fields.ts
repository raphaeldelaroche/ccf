import { getAppearanceOptions } from "@/config/blob-appearances";
import { getBackgroundOptions } from "@/config/blob-backgrounds";

// ─── Sizes ───────────────────────────────────────────────────────────────────

export const SIZES = [
  "xs", "sm", "md", "lg", "xl",
  "2xl", "3xl", "4xl", "5xl", "6xl",
  "7xl", "8xl", "9xl", "10xl",
] as const;

export type Size = (typeof SIZES)[number];

// ─── Colors ──────────────────────────────────────────────────────────────────

export const COLORS = [
  "red", "orange", "amber", "yellow", "lime", "green", "emerald",
  "teal", "cyan", "sky", "blue", "indigo", "violet", "purple",
  "fuchsia", "pink", "rose", "brand"
] as const;

export type Color = (typeof COLORS)[number];

export const colorOptions: Record<string, string> = Object.fromEntries(
  COLORS.map((c) => [c, c])
);

// ─── Tags ───────────────────────────────────────────────────────────────────

export const TAGS = ["div", "h1", "h2", "h3", "h4", "h5", "h6"] as const;

export type Tag = (typeof TAGS)[number];

export const tagOptions: Record<Tag, Tag> = Object.fromEntries(
  TAGS.map((t) => [t, t])
) as Record<Tag, Tag>;

// ─── Option helpers (répétitifs) ──────────────────────────────────────────────

const allSizes: Record<string, string> = Object.fromEntries(SIZES.map((s) => [s, s]));

const sizeOptions: Record<string, string> = { auto: "Auto (selon la taille)", ...allSizes };

const gapOptions: Record<string, string> = { auto: "Auto (selon la taille)", none: "Aucun (0)", ...allSizes };

const paddingXOptions: Record<string, string> = { 
  auto: "Auto (selon la taille)", 
  none: "Aucun (0)",
  ...allSizes,
  "container-sm": "Container SM",
  "container-md": "Container MD",
  "container-lg": "Container LG",
  "container-xl": "Container XL",
  "container-2xl": "Container 2XL"
};

// ─── Icon options (3 icônes de test au format IconData) ──────────────────────

export interface IconObject {
  type: string;
  props: {
    [key: string]: string | number | IconObject[] | undefined;
    children?: IconObject[];
  };
}

export interface IconData {
  name: string;
  collection: string;
  metadata: {
    size: number;
    strokeWidth: number;
  };
  iconObject: IconObject;
}

export const iconOptions: Record<string, IconData> = {
  star: {
    name: "star",
    collection: "lucide",
    metadata: { size: 24, strokeWidth: 2 },
    iconObject: {
      type: "svg",
      props: {
        width: 24,
        height: 24,
        viewBox: "0 0 24 24",
        children: [{
          type: "path",
          props: {
            d: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
          }
        }]
      }
    }
  },
  asterisk: {
    name: "asterisk",
    collection: "lucide",
    metadata: { size: 24, strokeWidth: 2 },
    iconObject: {
      type: "svg",
      props: {
        width: 24,
        height: 24,
        viewBox: "0 0 24 24",
        children: [{
          type: "path",
          props: {
            d: "M12 2v20M5 12h14M6.22 6.22l11.31 11.31M17.78 6.22l-11.31 11.31"
          }
        }]
      }
    }
  },
  heart: {
    name: "heart",
    collection: "lucide",
    metadata: { size: 24, strokeWidth: 2 },
    iconObject: {
      type: "svg",
      props: {
        width: 24,
        height: 24,
        viewBox: "0 0 24 24",
        children: [{
          type: "path",
          props: {
            d: "M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
          }
        }]
      }
    }
  },
  checkCircle: {
    name: "checkCircle",
    collection: "lucide",
    metadata: { size: 24, strokeWidth: 2 },
    iconObject: {
      type: "svg",
      props: {
        width: 24,
        height: 24,
        viewBox: "0 0 24 24",
        children: [
          {
            type: "path",
            props: {
              d: "M22 11.08V12a10 10 0 1 1-5.93-9.14"
            }
          },
          {
            type: "path",
            props: {
              d: "M22 4L12 14.01l-3-3"
            }
          }
        ]
      }
    }
  },
  arrowRight: {
    name: "arrowRight",
    collection: "lucide",
    metadata: { size: 24, strokeWidth: 2 },
    iconObject: {
      type: "svg",
      props: {
        width: 24,
        height: 24,
        viewBox: "0 0 24 24",
        children: [{
          type: "path",
          props: {
            d: "M5 12h14M12 5l7 7-7 7"
          }
        }]
      }
    }
  },
};

// ─── Field types ──────────────────────────────────────────────────────────────

export interface ShowIfCondition {
  field: string;
  value: string | string[] | boolean;
}

interface BaseField {
  label: string;
  inheritable?: boolean;
  /** Whether this field supports responsive breakpoint values */
  responsive?: boolean;
  showIf?: ShowIfCondition | ShowIfCondition[];
  /** Key into CompatibilityState for compat-aware option resolution in the inspector */
  compatKey?: "marker" | "align" | "figureWidth" | "actions";
  /** Label for the implicit empty ("") option prepended to compat/dropdown options */
  emptyLabel?: string;
  /** Category for copy-style / copy-content feature */
  copyCategory?: 'style' | 'content';
}

interface TextField extends BaseField {
  type: "text";
}

interface TextareaField extends BaseField {
  type: "textarea";
  rows?: number;
}

interface DropdownField extends BaseField {
  type: "dropdown";
  options: Record<string, string>;
}

interface CheckboxField extends BaseField {
  type: "checkbox";
}

export interface RepeaterLayout {
  inline: string[];
  groups: Array<{ key: string; label: string; fields: string[] }>;
}

interface RepeaterField extends BaseField {
  type: "repeater";
  fields: Record<string, Field>;
  layout?: RepeaterLayout;
}

interface IconField extends BaseField {
  type: "icon";
  options: Record<string, IconData>;
}

interface ImageField extends BaseField {
  type: "image";
}

interface VideoField extends BaseField {
  type: "video";
}

interface MultiSelectField extends BaseField {
  type: "multiselect";
  options: Record<string, string>;
}

interface InnerBlocksField extends BaseField {
  type: "innerBlocks";
  allowedBlocks?: string[];
}

export type Field = TextField | TextareaField | DropdownField | CheckboxField | RepeaterField | IconField | ImageField | VideoField | MultiSelectField | InnerBlocksField;

export interface FieldSection {
  label: string;
  fields: Record<string, Field>;
}

// ─── Field sections ───────────────────────────────────────────────────────────

const fieldSections: Record<string, FieldSection> = {
  header: {
    label: "Textes",
    fields: {
      title:        { type: "text", label: "Titre", inheritable: true, copyCategory: "content" },
      emphasisText: { type: "text", label: "Texte en emphase", inheritable: true, copyCategory: "content" },
      eyebrow:      { type: "text",     label: "Sur-titre", inheritable: true, copyCategory: "content" },
      eyebrowTheme: { type: "dropdown", label: "Thème du sur-titre",  options: colorOptions, inheritable: true, copyCategory: "style" },
      subtitle:     { type: "text", label: "Sous-titre", inheritable: true, copyCategory: "content" },
    },
  },

  marker: {
    label: "Marqueur",
    fields: {
      markerType: {
        type: "dropdown",
        label: "Type",
        options: {
          none: "Aucun",
          text: "Texte",
          icon: "Icône",
          image: "Image",
        },
        inheritable: true,
        copyCategory: "content",
      },
      markerContent: {
        type: "text",
        label: "Contenu du marqueur",
        showIf: { field: "markerType", value: "text" },
        inheritable: true,
        copyCategory: "content",
      },
      markerIcon: {
        type: "icon",
        label: "Icône du marqueur",
        options: iconOptions,
        showIf: { field: "markerType", value: "icon" },
        inheritable: true,
        copyCategory: "content",
      },
      markerImage: {
        type: "image",
        label: "Image du marqueur",
        showIf: { field: "markerType", value: "image" },
        inheritable: true,
        copyCategory: "content",
      },
      markerPosition: {
        type: "dropdown",
        label: "Position",
        options: {
          top: "Haut",
          left: "Gauche",
          right: "Droite",
        },
        showIf: { field: "markerType", value: ["text", "icon", "image"] },
        compatKey: "marker",
        inheritable: true,
        responsive: true,
        copyCategory: "style",
      },
      markerStyle: {
        type: "dropdown",
        label: "Style",
        options: {
          default: "Default",
          ghost: "Transparent",
          secondary: "Secondaire",
          outline: "Outline",
        },
        showIf: { field: "markerType", value: ["text", "icon", "image"] },
        inheritable: true,
        copyCategory: "style",
      },
      markerSize: {
        type: "dropdown",
        label: "Taille",
        options: sizeOptions,
        showIf: { field: "markerType", value: ["text", "icon", "image"] },
        inheritable: true,
        responsive: true,
        copyCategory: "style",
      },
      markerWidth: {
        type: "dropdown",
        label: "Largeur",
        options: {
          default: "Carrée (défaut)",
          auto: "Auto (hug)",
        },
        showIf: { field: "markerType", value: ["text", "icon", "image"] },
        inheritable: true,
        responsive: true,
        copyCategory: "style",
      },
      markerTheme: {
        type: "dropdown",
        label: "Couleur",
        options: colorOptions,
        showIf: { field: "markerType", value: ["text", "icon", "image"] },
        inheritable: true,
        copyCategory: "style",
      },
      markerRounded: {
        type: "dropdown",
        label: "Forme",
        options: {
          "rounded-square": "Carré arrondi",
          "rounded-full": "Rond",
        },
        showIf: { field: "markerType", value: ["text", "icon", "image"] },
        inheritable: true,
        copyCategory: "style",
      },
    },
  },

  figure: {
    label: "Figure",
    fields: {
      figureType: {
        type: "dropdown",
        label: "Type",
        options: {
          none:  "Aucun",
          image: "Image",
          video: "Vidéo",
          innerBlocks: "Blocs imbriqués",
        },
        inheritable: true,
        copyCategory: "content",
      },
      figureWidth: {
        type: "dropdown",
        label: "Largeur",
        options: {
          "1/2": "1/2",
          "1/3": "1/3",
          "2/3": "2/3",
          "1/4": "1/4",
          "3/4": "3/4",
        },
        showIf: { field: "figureType", value: ["image", "video"] },
        compatKey: "figureWidth",
        emptyLabel: "Par défaut",
        inheritable: true,
        responsive: true,
        copyCategory: "style",
      },
      figureBleed: {
        type: "dropdown",
        label: "Débordement",
        options: {
          none: "Aucun",
          full: "Plein",
        },
        showIf: { field: "figureType", value: ["image", "video"] },
        inheritable: true,
        responsive: true,
        copyCategory: "style",
      },
      image: {
        type: "image",
        label: "Image",
        showIf: { field: "figureType", value: "image" },
        inheritable: true,
        copyCategory: "content",
      },
      video: {
        type: "video",
        label: "Vidéo",
        showIf: { field: "figureType", value: "video" },
        inheritable: true,
        copyCategory: "content",
      },
    },
  },

  buttons: {
    label: "Boutons",
    fields: {
      actions: {
        type: "dropdown",
        label: "Position des boutons",
        options: {
          after:  "Après le contenu",
          before: "Avant le contenu",
        },
        compatKey: "actions",
        emptyLabel: "Par défaut",
        inheritable: true,
        responsive: true,
        copyCategory: "style",
      },
      buttons: {
        type: "repeater",
        label: "Boutons",
        inheritable: true,
        layout: {
          inline: ["label"],
          groups: [
            {
              key: "link",
              label: "Lien",
              fields: ["linkType", "internalHref", "externalHref", "customAction", "opensInNewTab"],
            },
            {
              key: "style",
              label: "Style",
              fields: ["variant", "theme", "iconType", "icon"],
            },
          ],
        },
        fields: {
          label: { type: "text", label: "Label", copyCategory: "content" },
          linkType: {
            type: "dropdown",
            label: "Type de lien",
            options: {
              internal: "Lien interne",
              external: "Lien externe",
              custom: "Action personnalisée"
            },
            copyCategory: "content",
          },
          internalHref: {
            type: "text",
            label: "Page interne",
            showIf: { field: "linkType", value: "internal" },
            copyCategory: "content",
          },
          externalHref: {
            type: "text",
            label: "URL externe",
            showIf: { field: "linkType", value: "external" },
            copyCategory: "content",
          },
          customAction: {
            type: "dropdown",
            label: "Action",
            options: {
              action1: "Custom action 1",
              action2: "Custom action 2"
            },
            showIf: { field: "linkType", value: "custom" },
            copyCategory: "content",
          },
          variant: {
            type: "dropdown",
            label: "Variante",
            options: {
              default: "Par défaut",
              outline: "Contour",
              secondary: "Secondaire",
              ghost: "Discret",
              link: "Lien"
            },
            copyCategory: "style",
          },
          theme:         { type: "dropdown", label: "Thème",    options: colorOptions, copyCategory: "style" },
          opensInNewTab: { type: "checkbox", label: "Ouvrir dans un nouvel onglet", copyCategory: "content" },
          iconType: {
            type: "dropdown",
            label: "Type d'icône",
            options: {
              none: "Aucun",
              left: "Icône à gauche",
              right: "Icône à droite",
            },
            copyCategory: "style",
          },
          icon: {
            type: "icon",
            label: "Icône",
            options: iconOptions,
            showIf: { field: "iconType", value: ["left", "right"] },
            copyCategory: "content",
          },
        },
      },
    },
  },

  content: {
    label: "Contenu",
    fields: {
      showContent: {
        type: "checkbox",
        label: "Insérer du contenu",
        inheritable: true,
        copyCategory: "content",
      },
      contentType: {
        type: "dropdown",
        label: "Type de contenu",
        options: {
          text: "Texte",
          innerBlocks: "Blocs imbriqués",
        },
        showIf: [
          { field: "showContent", value: true },
          { field: "figureType", value: ["none", "image", "video"] },
        ],
        inheritable: true,
        copyCategory: "content",
      },
      contentText: {
        type: "textarea",
        label: "Texte du contenu",
        rows: 6,
        showIf: [
          { field: "showContent", value: true },
          { field: "contentType", value: "text" },
        ],
        inheritable: true,
        copyCategory: "content",
      },
      fontSize: {
        type: "dropdown",
        label: "Taille de police",
        options: allSizes,
        showIf: [
          { field: "showContent", value: true },
          { field: "contentType", value: "text" },
        ],
        inheritable: true,
        copyCategory: "style",
      },
      innerBlocks: {
        type: "innerBlocks",
        label: "Blocs imbriqués",
        showIf: [
          { field: "showContent", value: true },
          { field: "contentType", value: "innerBlocks" },
        ],
        copyCategory: "content",
      },
    },
  },

  layout: {
    label: "Disposition",
    fields: {
      size: { type: "dropdown", label: "Taille", options: allSizes, inheritable: true, responsive: true, copyCategory: "style" },
      layout: {
        type: "dropdown",
        label: "Disposition",
        options: {
          stack: "En pile",
          row:   "En ligne",
          bar:   "En barre",
        },
        inheritable: true,
        responsive: true,
        copyCategory: "style",
      },
      direction: {
        type: "dropdown",
        label: "Direction",
        options: {
          default: "Par défaut",
          reverse: "Inversé",
        },
        inheritable: true,
        responsive: true,
        copyCategory: "style",
      },
      align: {
        type: "dropdown",
        label: "Alignement",
        options: {
          left:   "Gauche",
          center: "Centré",
          right:  "Droite",
        },
        compatKey: "align",
        inheritable: true,
        responsive: true,
        copyCategory: "style",
      },
    },
  },

  spacing: {
    label: "Espacement",
    fields: {
      paddingX: { type: "dropdown", label: "Espacement horizontal", options: paddingXOptions, inheritable: true, responsive: true, copyCategory: "style" },
      paddingY: { type: "dropdown", label: "Espacement vertical",   options: gapOptions, inheritable: true, responsive: true, copyCategory: "style" },
      headerPaddingX: { type: "dropdown", label: "Header X", options: paddingXOptions, inheritable: true, responsive: true, copyCategory: "style" },
      headerPaddingY: { type: "dropdown", label: "Header Y", options: paddingXOptions, inheritable: true, responsive: true, copyCategory: "style" },
      gapX: { type: "dropdown", label: "Espacement interne X", options: gapOptions, inheritable: true, responsive: true, copyCategory: "style" },
      gapY: { type: "dropdown", label: "Espacement interne Y", options: gapOptions, inheritable: true, responsive: true, copyCategory: "style" },
    },
  },

  style: {
    label: "Style",
    fields: {
      appearance: {
        type: "multiselect",
        label: "Apparence",
        options: getAppearanceOptions(),
        inheritable: true,
        copyCategory: "style",
      },
      theme: {
        type: "dropdown",
        label: "Thème",
        options: colorOptions,
        inheritable: true,
        copyCategory: "style",
      },
      background: {
        type: "multiselect",
        label: "Arrière-plan",
        options: getBackgroundOptions(),
        inheritable: true,
        copyCategory: "style",
      },
    },
  },

  separator: {
    label: "Séparateur",
    fields: {
      showSeparator: { type: "checkbox", label: "Activer le séparateur", inheritable: true, copyCategory: "style" },
      separatorType: {
        type: "dropdown",
        label: "Type",
        options: {
          line: "Ligne",
          dot:  "Point",
          wave: "Vague",
        },
        showIf: { field: "showSeparator", value: true },
        inheritable: true,
        copyCategory: "style",
      },
      separatorPosition: {
        type: "dropdown",
        label: "Position",
        options: {
          afterTitle: "Après le titre",
          afterSubtitle: "Après le sous-titre",
        },
        showIf: { field: "showSeparator", value: true },
        inheritable: true,
        copyCategory: "style",
      },
      separatorColor: {
        type: "dropdown",
        label: "Couleur",
        options: colorOptions,
        showIf: { field: "showSeparator", value: true },
        inheritable: true,
        copyCategory: "style",
      },
    },
  },

  seo: {
    label: "SEO",
    fields: {
      titleAs: { type: "dropdown", label: "Balise du titre", options: tagOptions, inheritable: true, copyCategory: "content" },
      eyebrowAs: { type: "dropdown", label: "Balise du sur-titre", options: tagOptions, inheritable: true, copyCategory: "content" },
    },
  },
};

export default fieldSections;

// ─── Helper functions for field reusability ──────────────────────────────────

/**
 * Crée tous les champs nécessaires pour un blob item (utilisé dans Iterator)
 * Inclut TOUS les champs de blob-fields, rendant l'Iterator feature-complete
 *
 * Les champs sont affichés dans les items uniquement si leur clé EST dans itemFields.
 * Si un champ a déjà un showIf (ex: markerContent → markerType), les conditions
 * sont composées en AND logique grâce à composeShowIf.
 */
export function createBlobItemFields(): Record<string, Field> {
  return {
    // Header fields
    title: withItemFieldCondition(fieldSections.header.fields.title, "title"),
    emphasisText: withItemFieldCondition(fieldSections.header.fields.emphasisText, "emphasisText"),
    eyebrow: withItemFieldCondition(fieldSections.header.fields.eyebrow, "eyebrow"),
    eyebrowTheme: withItemFieldCondition(fieldSections.header.fields.eyebrowTheme, "eyebrowTheme"),
    subtitle: withItemFieldCondition(fieldSections.header.fields.subtitle, "subtitle"),

    // Marker fields
    markerType: withItemFieldCondition(fieldSections.marker.fields.markerType, "markerType"),
    markerContent: withItemFieldCondition(fieldSections.marker.fields.markerContent, "markerContent"),
    markerIcon: withItemFieldCondition(fieldSections.marker.fields.markerIcon, "markerIcon"),
    markerImage: withItemFieldCondition(fieldSections.marker.fields.markerImage, "markerImage"),
    markerPosition: withItemFieldCondition(fieldSections.marker.fields.markerPosition, "markerPosition"),
    markerStyle: withItemFieldCondition(fieldSections.marker.fields.markerStyle, "markerStyle"),
    markerSize: withItemFieldCondition(fieldSections.marker.fields.markerSize, "markerSize"),
    markerTheme: withItemFieldCondition(fieldSections.marker.fields.markerTheme, "markerTheme"),
    markerRounded: withItemFieldCondition(fieldSections.marker.fields.markerRounded, "markerRounded"),

    // Figure fields
    figureType: withItemFieldCondition(fieldSections.figure.fields.figureType, "figureType"),
    figureWidth: withItemFieldCondition(fieldSections.figure.fields.figureWidth, "figureWidth"),
    figureBleed: withItemFieldCondition(fieldSections.figure.fields.figureBleed, "figureBleed"),
    image: withItemFieldCondition(fieldSections.figure.fields.image, "image"),
    video: withItemFieldCondition(fieldSections.figure.fields.video, "video"),

    // Buttons fields
    actions: withItemFieldCondition(fieldSections.buttons.fields.actions, "actions"),
    buttons: withItemFieldCondition(fieldSections.buttons.fields.buttons, "buttons"),

    // Content fields
    showContent: withItemFieldCondition(fieldSections.content.fields.showContent, "showContent"),
    contentText: withItemFieldCondition(fieldSections.content.fields.contentText, "contentText"),
    fontSize: withItemFieldCondition(fieldSections.content.fields.fontSize, "fontSize"),

    // Layout fields
    size: withItemFieldCondition(fieldSections.layout.fields.size, "size"),
    layout: withItemFieldCondition(fieldSections.layout.fields.layout, "layout"),
    direction: withItemFieldCondition(fieldSections.layout.fields.direction, "direction"),
    align: withItemFieldCondition(fieldSections.layout.fields.align, "align"),

    // Spacing fields
    paddingX: withItemFieldCondition(fieldSections.spacing.fields.paddingX, "paddingX"),
    paddingY: withItemFieldCondition(fieldSections.spacing.fields.paddingY, "paddingY"),
    gapX: withItemFieldCondition(fieldSections.spacing.fields.gapX, "gapX"),
    gapY: withItemFieldCondition(fieldSections.spacing.fields.gapY, "gapY"),

    // Style fields
    theme: withItemFieldCondition(fieldSections.style.fields.theme, "theme"),
    appearance: withItemFieldCondition(fieldSections.style.fields.appearance, "appearance"),
    background: withItemFieldCondition(fieldSections.style.fields.background, "background"),

    // Separator fields
    showSeparator: withItemFieldCondition(fieldSections.separator.fields.showSeparator, "showSeparator"),
    separatorType: withItemFieldCondition(fieldSections.separator.fields.separatorType, "separatorType"),
    separatorPosition: withItemFieldCondition(fieldSections.separator.fields.separatorPosition, "separatorPosition"),
    separatorColor: withItemFieldCondition(fieldSections.separator.fields.separatorColor, "separatorColor"),

    // SEO fields
    titleAs: withItemFieldCondition(fieldSections.seo.fields.titleAs, "titleAs"),
    eyebrowAs: withItemFieldCondition(fieldSections.seo.fields.eyebrowAs, "eyebrowAs"),
  };
}

/**
 * Compose une nouvelle condition showIf avec les conditions existantes du champ.
 * Si le champ a déjà un showIf, retourne un tableau (AND logique).
 * Préserve les conditions originales (ex: markerContent → markerType === "text").
 */
function composeShowIf(field: Field, newCondition: ShowIfCondition): ShowIfCondition | ShowIfCondition[] {
  if (!field.showIf) return newCondition;
  const existing = Array.isArray(field.showIf) ? field.showIf : [field.showIf];
  return [...existing, newCondition];
}

/**
 * Crée un champ visible dans la config partagée (itérateur) :
 * affiché quand la clé N'EST PAS dans itemFields (= elle est héritée/partagée).
 */
export function withSharedFieldCondition(
  field: Field,
  fieldKey: string
): Field {
  return {
    ...field,
    showIf: composeShowIf(field, { field: "itemFields", value: `!${fieldKey}` }),
  };
}

/**
 * Crée un champ visible dans les items (repeater) :
 * affiché quand la clé EST dans itemFields (= elle est gérée par item).
 */
export function withItemFieldCondition(
  field: Field,
  fieldKey: string
): Field {
  return {
    ...field,
    showIf: composeShowIf(field, { field: "itemFields", value: fieldKey }),
  };
}

/**
 * Génère automatiquement les options du multiselect itemFields
 * en parcourant toutes les sections et en filtrant les champs avec inheritable: true
 *
 * Mapping des labels de sections pour l'affichage dans le multiselect
 */
const sectionLabelsMap: Record<string, string> = {
  header: "TEXTES",
  marker: "MARQUEUR",
  figure: "FIGURE",
  buttons: "BOUTONS",
  content: "CONTENU",
  layout: "DISPOSITION",
  spacing: "ESPACEMENT",
  style: "STYLE",
  separator: "SÉPARATEUR",
  seo: "SEO",
}

export function generateItemFieldsOptions(): Record<string, string> {
  const options: Record<string, string> = {}

  // Parcourir toutes les sections
  for (const [sectionKey, section] of Object.entries(fieldSections)) {
    const inheritableFields: Array<{ key: string; label: string }> = []

    // Filtrer les champs héritables de cette section
    for (const [fieldKey, field] of Object.entries(section.fields)) {
      if (field.inheritable) {
        inheritableFields.push({ key: fieldKey, label: field.label })
      }
    }

    // Si la section contient des champs héritables, ajouter un header de section
    if (inheritableFields.length > 0) {
      const sectionLabel = sectionLabelsMap[sectionKey] || section.label.toUpperCase()
      options[`section:${sectionKey}`] = `──── ${sectionLabel} ────`

      // Ajouter chaque champ héritable avec indentation
      for (const { key, label } of inheritableFields) {
        options[key] = `  ↳ ${label}`
      }
    }
  }

  return options
}