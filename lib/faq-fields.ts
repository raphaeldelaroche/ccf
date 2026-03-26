import type { FieldSection } from './blob-fields'

/**
 * Définitions des champs pour le bloc FAQ
 * Utilise un repeater pour les questions/réponses
 */

export const faqFields: Record<string, FieldSection> = {
  content: {
    label: "Contenu",
    fields: {
      faqItems: {
        type: "repeater",
        label: "Questions et réponses",
        fields: {
          question: {
            type: "text",
            label: "Question"
          },
          answer: {
            type: "textarea",
            label: "Réponse",
            rows: 4
          },
        },
      },
    },
  },
  configuration: {
    label: "Configuration",
    fields: {
      accordionType: {
        type: "dropdown",
        label: "Type d'accordion",
        options: {
          single: "Un seul item ouvert à la fois",
          multiple: "Plusieurs items ouverts simultanément",
        },
      },
      collapsible: {
        type: "checkbox",
        label: "Permettre de tout fermer",
      },
    },
  },
  style: {
    label: "Style",
    fields: {
      spacing: {
        type: "dropdown",
        label: "Espacement",
        options: {
          none: "Aucun",
          sm: "Petit",
          md: "Moyen",
          lg: "Grand",
          xl: "Extra grand",
        },
      },
    },
  },
}
