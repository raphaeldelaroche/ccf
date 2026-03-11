// Script de création de la page "Ressources" du Climate Contribution Framework
// Source : guides/project/RESOURCES-CONTENT.md
// Structure :
//   Hero → Le White Paper → FAQ → CTA final

const pageData = {
  version: "1.0",
  slug: "resources",
  title: "Ressources — Climate Contribution Framework",
  blocks: [

    // BLOC 1 — HERO (8xl)
    {
      id: "reso-0001-hero-0000-0000-000000000001",
      blockType: "blob",
      data: {
        size: "8xl",
        layout: "stack",
        align: "center",
        paddingX: "container-xl",
        paddingY: "9xl",
        headerPaddingX: "container-sm",
        eyebrow: "Ressources",
        title: "Publications, méthodologie // et mises à jour.",
        subtitle: "Que vous soyez une entreprise, un investisseur, un décideur public ou un analyste, ces ressources vous permettent de comprendre comment la contribution est mesurée — et comment le cadre évolue.",
        showContent: "false",
        figureType: "none",
        appearance: "borderBottom",
      },
      innerBlocks: [],
    },

    // BLOC 2 — LE WHITE PAPER (2xl + grid-3 + boutons)
    {
      id: "reso-0002-whhp-0000-0000-000000000002",
      blockType: "blob",
      data: {
        size: "2xl",
        layout: "stack",
        align: "center",
        paddingX: "container-lg",
        paddingY: "6xl",
        headerPaddingX: "container-md",
        eyebrow: "Le White Paper",
        title: "La méthodologie complète // dans un document de référence.",
        subtitle: "Le White Paper présente l'architecture complète du Climate Contribution Framework — du raisonnement fondateur jusqu'aux perspectives de développement.",
        buttons: JSON.stringify([
          {
            label: "Télécharger le White Paper",
            variant: "default",
            theme: "default",
            linkType: "internal",
            internalHref: "",
            opensInNewTab: "false",
          },
          {
            label: "Lire le résumé exécutif",
            variant: "ghost",
            theme: "default",
            linkType: "internal",
            internalHref: "",
            opensInNewTab: "false",
          },
        ]),
        showContent: "true",
        contentType: "innerBlocks",
        appearance: "borderBottom",
        gapY: "3xl",
      },
      innerBlocks: [
        {
          id: "reso-0002-whhp-iter-0000-000000000002a",
          blockType: "blobIterator",
          data: {
            iteratorLayout: "grid-3",
            iteratorGapX: "md",
            iteratorGapY: "none",
            size: "lg",
            markerType: "none",
            appearance: "outlined",
            align: "left",
            paddingX: "md",
            paddingY: "md",
            itemFields: JSON.stringify(["title", "subtitle"]),
            items: JSON.stringify([
              {
                title: "Le passage de la réduction à la contribution",
                subtitle: "Le raisonnement qui fonde le CCF : pourquoi mesurer uniquement l'empreinte carbone est insuffisant pour rendre compte de l'action climatique réelle des entreprises.",
              },
              {
                title: "L'architecture en trois piliers",
                subtitle: "Description complète des piliers A (Réduction), B (Solutions) et C (Financement), leur périmètre, leurs sous-piliers et les référentiels sources mobilisés.",
              },
              {
                title: "Le système de scoring et la pondération sectorielle",
                subtitle: "Fonctionnement du Kit de Traduction, des coefficients de crédibilité et des coefficients sectoriels α, β, γ — avec exemples chiffrés.",
              },
              {
                title: "Les trois résultats clés",
                subtitle: "Potentiel contributif, contribution effective et performance contributive : comment ils sont calculés, comment les lire et comment les comparer.",
              },
              {
                title: "Les limites du cadre",
                subtitle: "Les périmètres exclus, les hypothèses de calibration sectorielle et les points de vigilance méthodologiques documentés par les auteurs.",
              },
              {
                title: "Les développements futurs",
                subtitle: "Les axes d'évolution prévus : extension sectorielle, intégration de nouveaux référentiels, amélioration de la granularité des scores et gouvernance du cadre.",
              },
            ]),
          },
        },
      ],
    },

    // BLOC 3 — FAQ (2xl + grid-2 outlined, 7 questions)
    {
      id: "reso-0003-faqq-0000-0000-000000000003",
      blockType: "blob",
      data: {
        size: "2xl",
        layout: "stack",
        align: "center",
        paddingX: "container-lg",
        paddingY: "6xl",
        headerPaddingX: "container-md",
        eyebrow: "FAQ",
        title: "Questions fréquentes.",
        subtitle: "Les questions les plus posées sur le Climate Contribution Framework — sa portée, son fonctionnement et ses relations avec les référentiels existants.",
        showContent: "true",
        contentType: "innerBlocks",
        appearance: "borderBottom",
        gapY: "3xl",
      },
      innerBlocks: [
        {
          id: "reso-0003-faqq-iter-0000-000000000003a",
          blockType: "blobIterator",
          data: {
            iteratorLayout: "grid-2",
            iteratorGapX: "md",
            iteratorGapY: "md",
            size: "lg",
            markerType: "none",
            appearance: "outlined",
            align: "left",
            paddingX: "md",
            paddingY: "md",
            itemFields: JSON.stringify(["title", "subtitle"]),
            items: JSON.stringify([
              {
                title: "Que mesure le CCF ?",
                subtitle: "Un cadre multidimensionnel qui évalue les réductions d'émissions dans la chaîne de valeur, les émissions évitées par les produits et services, le financement climatique et l'influence sur les politiques publiques. Il capture les impacts directs et indirects pour refléter l'intégralité du spectre de l'action climatique.",
              },
              {
                title: "Comment le CCF garantit-il une comparaison équitable entre secteurs ?",
                subtitle: "Le CCF applique une pondération ajustée au contexte selon le secteur d'activité, la géographie, la taille de l'entreprise et les marges bénéficiaires. Les secteurs à fort impact sont évalués sur des plages de contribution plus larges. Cette approche permet des comparaisons entre pairs tout en reflétant les rôles structurellement différents dans la transition.",
              },
              {
                title: "Quel est le lien entre le CCF et les référentiels existants ?",
                subtitle: "Le CCF est conçu pour compléter — non remplacer — des référentiels comme SBTi ou le GHG Protocol. Il comble les lacunes actuelles en intégrant les impacts indirects et le financement climatique, en s'alignant sur les méthodologies de meilleures pratiques et en fournissant un benchmark unifié couvrant plusieurs référentiels.",
              },
              {
                title: "Qui développe le CCF ?",
                subtitle: "L'initiative est portée par Sweep et le Mirova Research Center. Le développement méthodologique est réalisé avec I Care by BearingPoint et Winrock International. Un groupe d'entreprises sponsor soutient le projet, et un comité d'observateurs indépendant composé d'experts des principales organisations climatiques assure la supervision.",
              },
              {
                title: "Quel est le lien entre le CCF et la plateforme Sweep ?",
                subtitle: "Le CCF définit la méthodologie d'évaluation de la contribution. Sweep fournit la technologie pour l'opérationnaliser : collecte et consolidation des données, application de la méthodologie, calcul des trois indicateurs, simulation de scénarios et planification des actions. Le cadre fixe les règles, Sweep fournit le moteur digital.",
              },
              {
                title: "Quelle est l'ambition à long terme du CCF ?",
                subtitle: "Établir le CCF comme référence mondiale pour la contribution climatique des entreprises, en intégrant et en s'appuyant sur les référentiels existants. À terme, l'objectif est d'influencer les politiques publiques afin que chaque entreprise soit tenue de définir et de publier un Plan de Contribution.",
              },
              {
                title: "Le CCF est-il accessible au public ?",
                subtitle: "Oui. Le CCF est conçu pour être accessible à tous — son développement et sa diffusion étant financés par la philanthropie. Le White Paper, la documentation méthodologique et les mises à jour sont disponibles librement.",
              },
            ]),
          },
        },
      ],
    },

    // BLOC 4 — CTA FINAL (4xl, darkBackground)
    {
      id: "reso-0004-cta0-0000-0000-000000000004",
      blockType: "blob",
      data: {
        size: "4xl",
        layout: "stack",
        align: "center",
        paddingY: "7xl",
        headerPaddingX: "container-md",
        title: "Vous souhaitez comprendre // comment votre entreprise // pourrait être évaluée ?",
        subtitle: "Démarrez le benchmark en 3 minutes ou téléchargez le White Paper pour explorer la méthodologie dans le détail.",
        buttons: JSON.stringify([
          {
            label: "Démarrer le benchmark (3 minutes)",
            variant: "default",
            theme: "red",
            linkType: "internal",
            internalHref: "",
            opensInNewTab: "false",
          },
          {
            label: "Télécharger le White Paper",
            variant: "ghost",
            theme: "red",
            linkType: "internal",
            internalHref: "",
            opensInNewTab: "false",
          },
        ]),
        showContent: "false",
        figureType: "none",
        markerType: "none",
        appearance: "darkBackground",
      },
      innerBlocks: [],
    },
  ],

  meta: {
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
};

// ─────────────────────────────────────────────────────────────────
// Publication via API
// ─────────────────────────────────────────────────────────────────
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

const res = await fetch(`${BASE_URL}/api/pages/${pageData.slug}`, {
  method: "PUT",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(pageData),
});

if (!res.ok) {
  const text = await res.text();
  console.error("❌ Erreur lors de la publication :", res.status, text);
  process.exit(1);
}

const data = await res.json();
console.log("✅ Page publiée avec succès:", data);
console.log(`🔗 Voir la page : ${BASE_URL}/${pageData.slug}`);
