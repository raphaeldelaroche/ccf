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

const gutterOptions: Record<string, string> = { auto: "Auto (selon la taille)", ...allSizes };

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
  }
};

// ─── Field types ──────────────────────────────────────────────────────────────

export interface ShowIfCondition {
  field: string;
  value: string | string[] | boolean;
}

interface BaseField {
  label: string;
  inheritable?: boolean;
  showIf?: ShowIfCondition | ShowIfCondition[];
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

interface RepeaterField extends BaseField {
  type: "repeater";
  fields: Record<string, Field>;
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
      title:        { type: "text", label: "Titre", inheritable: true },
      emphasisText: { type: "text", label: "Texte en emphase", inheritable: true },
      eyebrow:      { type: "text",     label: "Sur-titre", inheritable: true },
      eyebrowTheme: { type: "dropdown", label: "Thème du sur-titre",  options: colorOptions, inheritable: true },
      subtitle:     { type: "text", label: "Sous-titre", inheritable: true },
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
        },
        inheritable: true,
      },
      markerContent: {
        type: "text",
        label: "Contenu du marqueur",
        showIf: { field: "markerType", value: "text" },
        inheritable: true,
      },
      markerIcon: {
        type: "icon",
        label: "Icône du marqueur",
        options: iconOptions,
        showIf: { field: "markerType", value: "icon" },
        inheritable: true,
      },
      markerPosition: {
        type: "dropdown",
        label: "Position",
        options: {
          top: "Haut",
          left: "Gauche",
          right: "Droite",
        },
        showIf: { field: "markerType", value: ["text", "icon"] },
        inheritable: true,
      },
      markerStyle: {
        type: "dropdown",
        label: "Style",
        options: {
          default: "Default",
          ghost: "Transparent",
          secondary: "Secondaire",
        },
        showIf: { field: "markerType", value: ["text", "icon"] },
        inheritable: true,
      },
      markerSize: {
        type: "dropdown",
        label: "Taille",
        options: sizeOptions,
        showIf: { field: "markerType", value: ["text", "icon"] },
        inheritable: true,
      },
      markerTheme: {
        type: "dropdown",
        label: "Couleur",
        options: colorOptions,
        showIf: { field: "markerType", value: ["text", "icon"] },
        inheritable: true,
      },
      markerRounded: {
        type: "dropdown",
        label: "Forme",
        options: {
          "rounded-square": "Carré arrondi",
          "rounded-full": "Rond",
        },
        showIf: { field: "markerType", value: ["text", "icon"] },
        inheritable: true,
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
        },
        inheritable: true,
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
        inheritable: true,
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
      },
      image: {
        type: "image",
        label: "Image",
        showIf: { field: "figureType", value: "image" },
        inheritable: true,
      },
      video: {
        type: "video",
        label: "Vidéo",
        showIf: { field: "figureType", value: "video" },
        inheritable: true,
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
          default: "Avant le contenu",
          after:  "Après le contenu",
          before: "Avant le contenu",
        },
        inheritable: true,
      },
      buttons: {
        type: "repeater",
        label: "Boutons",
        inheritable: true,
        fields: {
          label: { type: "text", label: "Label" },
          linkType: {
            type: "dropdown",
            label: "Type de lien",
            options: { 
              internal: "Lien interne", 
              external: "Lien externe",
              custom: "Action personnalisée" 
            },
          },
          internalHref: { 
            type: "text", 
            label: "Page interne", 
            showIf: { field: "linkType", value: "internal" } 
          },
          externalHref: { 
            type: "text", 
            label: "URL externe", 
            showIf: { field: "linkType", value: "external" } 
          },
          customAction: { 
            type: "dropdown", 
            label: "Action", 
            options: { 
              action1: "Custom action 1", 
              action2: "Custom action 2" 
            },
            showIf: { field: "linkType", value: "custom" } 
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
            } 
          },
          theme:         { type: "dropdown", label: "Thème",    options: colorOptions },
          opensInNewTab: { type: "checkbox", label: "Ouvrir dans un nouvel onglet" },
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
      },
      contentType: {
        type: "dropdown",
        label: "Type de contenu",
        options: {
          text: "Texte",
          innerBlocks: "Blocs imbriqués",
        },
        showIf: { field: "showContent", value: true },
        inheritable: true,
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
      },
      innerBlocks: {
        type: "innerBlocks",
        label: "Blocs imbriqués",
        showIf: [
          { field: "showContent", value: true },
          { field: "contentType", value: "innerBlocks" },
        ],
      },
    },
  },

  layout: {
    label: "Disposition",
    fields: {
      size: { type: "dropdown", label: "Taille", options: allSizes, inheritable: true },
      layout: {
        type: "dropdown",
        label: "Disposition",
        options: {
          stack: "En pile",
          row:   "En ligne",
          bar:   "En barre",
        },
        inheritable: true,
      },
      direction: {
        type: "dropdown",
        label: "Direction",
        options: {
          default: "Par défaut",
          reverse: "Inversé",
        },
        inheritable: true,
      },
      align: {
        type: "dropdown",
        label: "Alignement",
        options: {
          left:   "Gauche",
          center: "Centré",
          right:  "Droite",
        },
        inheritable: true,
      },
    },
  },

  spacing: {
    label: "Espacement",
    fields: {
      paddingX: { type: "dropdown", label: "Espacement horizontal", options: gutterOptions, inheritable: true },
      paddingY: { type: "dropdown", label: "Espacement vertical",   options: gutterOptions, inheritable: true },
      gutter:   { type: "dropdown", label: "Espacement interne",    options: gutterOptions, inheritable: true },
    },
  },

  style: {
    label: "Style",
    fields: {
      appearance: {
        type: "dropdown",
        label: "Apparence",
        options: {
          default: "Par défaut",
          card: "Carte",
          cardElevated: "Carte élevée",
          glassmorphism: "Glassmorphism",
          outlined: "Contour",
          minimal: "Minimal",
        },
        inheritable: true,
      },
      theme: {
        type: "dropdown",
        label: "Thème",
        options: colorOptions,
        inheritable: true,
      },
      backgroundType: {
        type: "dropdown",
        label: "Arrière-plan",
        options: {
          color:  "Couleur",
          image:  "Image",
          custom: "Personnalisé",
          none:   "Aucun",
        },
        inheritable: true,
      },
      backgroundColor: {
        type: "dropdown",
        label: "Couleur",
        options: colorOptions,
        showIf: { field: "backgroundType", value: "color" },
        inheritable: true,
      },
      backgroundImage: {
        type: "image",
        label: "Image",
        showIf: { field: "backgroundType", value: "image" },
        inheritable: true,
      },
      backgroundStyle: {
        type: "dropdown",
        label: "Style",
        options: {
          style1: "Style 1",
          style2: "Style 2",
        },
        showIf: { field: "backgroundType", value: "custom" },
        inheritable: true,
      },
    },
  },

  separator: {
    label: "Séparateur",
    fields: {
      showSeparator: { type: "checkbox", label: "Activer le séparateur", inheritable: true },
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
      },
      separatorColor: {
        type: "dropdown",
        label: "Couleur",
        options: colorOptions,
        showIf: { field: "showSeparator", value: true },
        inheritable: true,
      },
    },
  },

  seo: {
    label: "SEO",
    fields: {
      titleAs: { type: "dropdown", label: "Balise du titre", options: tagOptions, inheritable: true },
      eyebrowAs: { type: "dropdown", label: "Balise du sur-titre", options: tagOptions, inheritable: true },
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
    gutter: withItemFieldCondition(fieldSections.spacing.fields.gutter, "gutter"),

    // Style fields
    theme: withItemFieldCondition(fieldSections.style.fields.theme, "theme"),
    appearance: withItemFieldCondition(fieldSections.style.fields.appearance, "appearance"),
    backgroundType: withItemFieldCondition(fieldSections.style.fields.backgroundType, "backgroundType"),
    backgroundColor: withItemFieldCondition(fieldSections.style.fields.backgroundColor, "backgroundColor"),
    backgroundImage: withItemFieldCondition(fieldSections.style.fields.backgroundImage, "backgroundImage"),
    backgroundStyle: withItemFieldCondition(fieldSections.style.fields.backgroundStyle, "backgroundStyle"),

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