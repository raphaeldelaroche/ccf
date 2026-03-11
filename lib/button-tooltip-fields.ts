import type { FieldSection } from './blob-fields'

/**
 * Définitions des champs pour le bloc ButtonTooltip
 */

export const buttonTooltipFields: Record<string, FieldSection> = {
  tooltips: {
    label: "Tooltips",
    fields: {
      tooltips: {
        type: "repeater",
        label: "Liste des tooltips",
        fields: {
          label: {
            type: "text",
            label: "Label du bouton"
          },
          content: {
            type: "textarea",
            label: "Contenu du tooltip"
          },
          linkLabel: {
            type: "text",
            label: "Label du lien (optionnel)"
          },
          linkUrl: {
            type: "text",
            label: "URL du lien (optionnel)"
          },
        },
      },
    },
  },
  configuration: {
    label: "Configuration",
    fields: {
      layout: {
        type: "dropdown",
        label: "Disposition",
        options: {
          horizontal: "Horizontale",
          vertical: "Verticale",
        },
      },
      spacing: {
        type: "dropdown",
        label: "Espacement",
        options: {
          xs: "Extra petit",
          sm: "Petit",
          md: "Moyen",
          lg: "Grand",
          xl: "Extra grand",
          "2xl": "2X Grand",
        },
      },
      align: {
        type: "dropdown",
        label: "Alignement",
        options: {
          left: "Gauche",
          center: "Centre",
          right: "Droite",
        },
      },
    },
  },
  buttonStyle: {
    label: "Style des boutons",
    fields: {
      variant: {
        type: "dropdown",
        label: "Variante",
        options: {
          default: "Défaut",
          secondary: "Secondaire",
          outline: "Contour",
          ghost: "Fantôme",
          link: "Lien",
        },
      },
      size: {
        type: "dropdown",
        label: "Taille",
        options: {
          default: "Défaut",
          sm: "Petit",
          lg: "Grand",
          icon: "Icône",
        },
      },
    },
  },
}
