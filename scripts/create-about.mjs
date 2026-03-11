// Script de création de la page "À propos" du Climate Contribution Framework
// Structure : Hero → Genèse → Fondateurs → Partenaires → Co-constructeurs → Comité → Timeline → CTA

const pageData = {
  version: "1.0",
  slug: "about",
  title: "À propos — Climate Contribution Framework",
  blocks: [

    // ─────────────────────────────────────────────────────────────
    // BLOC 1 — HERO (8xl)
    // Impact d'entrée sur une page "À propos". Ton : posture, histoire, engagement.
    // ─────────────────────────────────────────────────────────────
    {
      id: "a1b2c3d4-e5f6-7890-abcd-ef1234567801",
      blockType: "blob",
      data: {
        size: "8xl",
        layout: "stack",
        align: "center",
        paddingX: "container-xl",
        paddingY: "9xl",
        headerPaddingX: "container-sm",
        eyebrow: "À propos",
        title: "Un nouveau consortium pour l'action climatique des entreprises.",
        subtitle: "Le Climate Contribution Framework (CCF) a été créé pour répondre à un manque croissant de redevabilité climatique : alors que les entreprises publient de plus en plus leurs émissions et leurs plans de transition, leur contribution globale au Net Zero mondial reste fragmentée, difficile à comparer et sous-évaluée.",
        showContent: "false",
        figureType: "none",
        appearance: "borderBottom",
      },
      innerBlocks: [],
    },

    // ─────────────────────────────────────────────────────────────
    // BLOC 2 — GENÈSE (2xl)
    // Récit de l'origine : le problème que personne ne résolvait.
    // ─────────────────────────────────────────────────────────────
    {
      id: "a1b2c3d4-e5f6-7890-abcd-ef1234567802",
      blockType: "blob",
      data: {
        size: "2xl",
        layout: "stack",
        align: "center",
        paddingX: "container-lg",
        paddingY: "6xl",
        headerPaddingX: "container-md",
        title: "Faire passer le marché des promesses climatiques // aux preuves climatiques.",
        subtitle: "Le cadre a été développé pour capturer tout le spectre de l'action climatique des entreprises — réduire les émissions, déployer des solutions bas carbone et financer des projets climatiques — grâce à une méthodologie transparente, ajustée par secteur et alignée sur les standards existants.",
        showContent: "false",
        figureType: "none",
        appearance: "borderBottom",
      },
      innerBlocks: [],
    },

    // ─────────────────────────────────────────────────────────────
    // BLOC 3 — QUI A INITIÉ LE CADRE (2xl + grid-2)
    // Sweep (co-initiateur) + Mirova Research Center (co-initiateur)
    // ─────────────────────────────────────────────────────────────
    {
      id: "a1b2c3d4-e5f6-7890-abcd-ef1234567803",
      blockType: "blob",
      data: {
        size: "2xl",
        layout: "stack",
        align: "center",
        paddingX: "container-lg",
        paddingY: "5xl",
        headerPaddingX: "container-md",
        eyebrow: "Qui a initié le cadre",
        title: "Co-initié par Sweep et le Mirova Research Center.",
        subtitle: "Ensemble, ces organisations ont combiné science du climat, recherche financière et expertise opérationnelle pour concevoir une méthodologie robuste, transparente et utilisable à grande échelle.",
        showContent: "true",
        contentType: "innerBlocks",
        appearance: "borderBottom",
        gapY: "3xl",
      },
      innerBlocks: [
        {
          id: "a1b2c3d4-e5f6-7890-abcd-ef1234567803a",
          blockType: "blobIterator",
          data: {
            iteratorLayout: "grid-2",
            iteratorGapX: "none",
            iteratorGapY: "none",
            size: "lg",
            appearance: "outlined",
            align: "left",
            paddingX: "none",
            paddingY: "none",
            itemFields: JSON.stringify(["title", "subtitle"]),
            items: JSON.stringify([
              {
                title: "Sweep",
                subtitle: "Plateforme de référence pour la gestion des données de durabilité. Sweep accompagne les grandes entreprises dans la collecte, l'analyse et la communication de leurs données climatiques. Son infrastructure technique est au cœur de l'intégration du CCF dans les systèmes de reporting existants.",
              },
              {
                title: "Mirova Research Center",
                subtitle: "Branche de recherche du gestionnaire d'actifs durable Mirova, le Research Center apporte l'expertise en analyse climatique, financement de la transition et investissement responsable. Il assure la crédibilité académique et financière de la méthodologie CCF.",
              },
            ]),
          },
        },
      ],
    },

    // ─────────────────────────────────────────────────────────────
    // BLOC 4 — PARTENAIRES TECHNIQUES (2xl + grid-2)
    // I Care by BearingPoint + Winrock International
    // ─────────────────────────────────────────────────────────────
    {
      id: "a1b2c3d4-e5f6-7890-abcd-ef1234567804",
      blockType: "blob",
      data: {
        size: "2xl",
        layout: "stack",
        align: "center",
        paddingX: "container-lg",
        paddingY: "5xl",
        headerPaddingX: "container-md",
        eyebrow: "Partenaires techniques",
        title: "Le développement scientifique mené avec des experts de terrain.",
        subtitle: "Le développement méthodologique est conduit avec I Care by BearingPoint et Winrock International. Ces partenaires veillent à ce que le cadre reste ancré dans les dernières avancées de la science climatique et des pratiques d'évaluation.",
        showContent: "true",
        contentType: "innerBlocks",
        appearance: "borderBottom",
        gapY: "3xl",
      },
      innerBlocks: [
        {
          id: "a1b2c3d4-e5f6-7890-abcd-ef1234567804a",
          blockType: "blobIterator",
          data: {
            iteratorLayout: "grid-2",
            iteratorGapX: "none",
            iteratorGapY: "none",
            size: "lg",
            appearance: "outlined",
            align: "left",
            paddingX: "none",
            paddingY: "none",
            itemFields: JSON.stringify(["title", "subtitle"]),
            items: JSON.stringify([
              {
                title: "I Care by BearingPoint",
                subtitle: "Cabinet de conseil en transformation à impact. I Care contribue à la rigueur méthodologique du CCF et à son applicabilité opérationnelle pour les équipes développement durable. Son expertise sectorielle garantit que la pondération des piliers reflète la réalité des entreprises évaluées.",
              },
              {
                title: "Winrock International",
                subtitle: "ONG internationale spécialisée dans le développement durable et la finance climatique, active dans plus de 50 pays. Winrock apporte l'expertise sur les mécanismes de financement carbone et la validation des approches pour les marchés émergents.",
              },
            ]),
          },
        },
      ],
    },

    // ─────────────────────────────────────────────────────────────
    // BLOC 5 — CO-CONSTRUIT AVEC DES ENTREPRISES LEADERS (md + grid-5)
    // Accor, EDF, Equans, Eramet, LVMH, Orange, Klépierre, Renault, Schneider, Veolia
    // ─────────────────────────────────────────────────────────────
    {
      id: "a1b2c3d4-e5f6-7890-abcd-ef1234567805",
      blockType: "blob",
      data: {
        size: "md",
        layout: "stack",
        align: "center",
        paddingX: "container-lg",
        paddingY: "3xl",
        eyebrow: "Co-construit avec des entreprises leaders",
        title: "Dix grandes entreprises. Des secteurs, des défis, une méthode partagée.",
        subtitle: "Ces entreprises ont apporté leur expertise, testé les premières versions de la méthodologie et aidé à garantir sa pertinence pour les stratégies réelles des entreprises.",
        showContent: "true",
        contentType: "innerBlocks",
        appearance: "borderBottom",
        gapY: "xl",
      },
      innerBlocks: [
        {
          id: "a1b2c3d4-e5f6-7890-abcd-ef1234567805a",
          blockType: "blobIterator",
          data: {
            iteratorLayout: "grid-5",
            iteratorGapX: "none",
            iteratorGapY: "none",
            figureType: "image",
            image: "/placeholder.svg",
            paddingX: "none",
            paddingY: "none",
            items: JSON.stringify([{}, {}, {}, {}, {}, {}, {}, {}, {}, {}]),
          },
        },
        {
          id: "a1b2c3d4-e5f6-7890-abcd-ef1234567805b",
          blockType: "blob",
          data: {
            size: "md",
            layout: "stack",
            align: "center",
            showContent: "true",
            contentType: "text",
            contentText: "Accor · EDF · Equans · Eramet · LVMH · Orange · Klépierre · Groupe Renault · Schneider Electric · Veolia",
            paddingY: "none",
          },
          innerBlocks: [],
        },
      ],
    },

    // ─────────────────────────────────────────────────────────────
    // BLOC 6 — GOUVERNANCE (2xl + grid-3)
    // Structure multicouche : opérationnel + technique + observation
    // ─────────────────────────────────────────────────────────────
    {
      id: "a1b2c3d4-e5f6-7890-abcd-ef1234567806",
      blockType: "blob",
      data: {
        size: "2xl",
        layout: "stack",
        align: "center",
        paddingX: "container-lg",
        paddingY: "5xl",
        headerPaddingX: "container-md",
        eyebrow: "Gouvernance",
        title: "Indépendance, rigueur et transparence.",
        subtitle: "Le Climate Contribution Framework est piloté par une structure multicouche conçue pour garantir la crédibilité scientifique, l'indépendance méthodologique, la transparence vis-à-vis des marchés, et l'ouverture aux retours des parties prenantes.",
        showContent: "true",
        contentType: "innerBlocks",
        appearance: "borderBottom",
        gapY: "3xl",
      },
      innerBlocks: [
        {
          id: "a1b2c3d4-e5f6-7890-abcd-ef1234567806a",
          blockType: "blobIterator",
          data: {
            iteratorLayout: "grid-3",
            iteratorGapX: "none",
            iteratorGapY: "none",
            size: "lg",
            markerType: "text",
            markerPosition: "left",
            markerStyle: "ghost",
            appearance: "outlined",
            align: "left",
            paddingX: "none",
            paddingY: "none",
            itemFields: JSON.stringify(["title", "subtitle", "markerContent"]),
            items: JSON.stringify([
              {
                markerContent: "01",
                title: "Équipe opérationnelle",
                subtitle: "La direction opérationnelle est partagée entre Sweep et le Mirova Research Center. Ils supervisent la stratégie, la feuille de route, les partenariats et les processus de consultation publique.",
              },
              {
                markerContent: "02",
                title: "Partenaires techniques",
                subtitle: "I Care by BearingPoint et Winrock International conduisent le développement méthodologique, en ancrant le cadre dans les dernières avancées de la science climatique.",
              },
              {
                markerContent: "03",
                title: "Comité d'observation",
                subtitle: "Un groupe international d'experts issus d'organisations climatiques de premier plan assure une révision externe et fournit des orientations stratégiques indépendantes.",
              },
            ]),
          },
        },
      ],
    },

    // ─────────────────────────────────────────────────────────────
    // BLOC 7 — COMITÉ D'OBSERVATEURS (2xl + grid-2)
    // 10 organisations de référence mondiale
    // ─────────────────────────────────────────────────────────────
    {
      id: "a1b2c3d4-e5f6-7890-abcd-ef1234567807",
      blockType: "blob",
      data: {
        size: "2xl",
        layout: "stack",
        align: "center",
        paddingX: "container-lg",
        paddingY: "5xl",
        headerPaddingX: "container-md",
        eyebrow: "Comité d'observation indépendant",
        title: "Un groupe international d'experts pour garantir l'indépendance scientifique.",
        subtitle: "Le comité n'effectue pas d'évaluations d'entreprises et ne joue aucun rôle commercial dans le processus de notation.",
        showContent: "true",
        contentType: "innerBlocks",
        appearance: "borderBottom",
        gapY: "3xl",
      },
      innerBlocks: [
        {
          id: "a1b2c3d4-e5f6-7890-abcd-ef1234567807a",
          blockType: "blobIterator",
          data: {
            iteratorLayout: "grid-2",
            iteratorGapX: "none",
            iteratorGapY: "none",
            size: "lg",
            appearance: "outlined",
            align: "left",
            paddingX: "none",
            paddingY: "none",
            itemFields: JSON.stringify(["title", "subtitle"]),
            items: JSON.stringify([
              {
                title: "World Business Council for Sustainable Development (WBCSD)",
                subtitle: "Coalition de 200+ entreprises leaders mondiales engagées dans l'accélération de la transition vers un monde durable.",
              },
              {
                title: "Science Based Targets initiative (SBTi)",
                subtitle: "Le standard de référence mondial pour la validation des objectifs de réduction d'émissions alignés sur la science climatique.",
              },
              {
                title: "CERES",
                subtitle: "Organisation à but non lucratif américaine mobilisant les investisseurs et entreprises sur les risques et opportunités liés au développement durable.",
              },
              {
                title: "International Carbon Reduction and Offset Alliance (ICROA)",
                subtitle: "Organisme de gouvernance des marchés volontaires carbone, garant des standards de qualité et d'intégrité.",
              },
              {
                title: "Exponential Roadmap Initiative",
                subtitle: "Initiative visant à accélérer les solutions climatiques capables de réduire les émissions mondiales de moitié d'ici 2030 via des innovations exponentielles.",
              },
              {
                title: "World Benchmarking Alliance",
                subtitle: "Alliance créant des benchmarks publics gratuits pour mesurer et stimuler la contribution des entreprises aux Objectifs de Développement Durable.",
              },
              {
                title: "Oxford Net Zero",
                subtitle: "Programme interdisciplinaire de l'Université d'Oxford analysant les engagements net zéro et produisant des recherches indépendantes sur leur crédibilité.",
              },
              {
                title: "Stockholm Environment Institute",
                subtitle: "Institut de recherche environnementale indépendant, référence internationale sur la politique climatique, l'énergie durable et la gouvernance des ressources.",
              },
              {
                title: "GHG Management Institute",
                subtitle: "Institut spécialisé dans la formation et la recherche sur la mesure, la gestion et la réduction des émissions de gaz à effet de serre.",
              },
              {
                title: "Environmental Defense Fund (EDF)",
                subtitle: "Organisation environnementale américaine de référence, pionnière dans l'élaboration de solutions pragmatiques aux défis climatiques et environnementaux mondiaux.",
              },
            ]),
          },
        },
      ],
    },

    // ─────────────────────────────────────────────────────────────
    // BLOC 8 — MODÈLE DE FINANCEMENT (2xl)
    // Accessible publiquement, financé par philanthropie + sponsors
    // ─────────────────────────────────────────────────────────────
    {
      id: "a1b2c3d4-e5f6-7890-abcd-ef1234567808",
      blockType: "blob",
      data: {
        size: "2xl",
        layout: "stack",
        align: "center",
        paddingX: "container-lg",
        paddingY: "5xl",
        headerPaddingX: "container-md",
        eyebrow: "Modèle de financement",
        title: "Un cadre conçu pour être accessible publiquement.",
        subtitle: "Son développement et sa diffusion sont financés par la philanthropie et les contributions des sponsors soutenant la recherche méthodologique — sans influence sur les règles de notation ou les résultats.",
        showContent: "false",
        figureType: "none",
        appearance: "borderBottom",
      },
      innerBlocks: [],
    },

    // ─────────────────────────────────────────────────────────────
    // BLOC 9 — CTA FINAL (4xl, darkBackground)
    // Conversion : engagement / contact
    // ─────────────────────────────────────────────────────────────
    {
      id: "a1b2c3d4-e5f6-7890-abcd-ef1234567809",
      blockType: "blob",
      data: {
        size: "4xl",
        layout: "stack",
        align: "center",
        paddingY: "7xl",
        headerPaddingX: "container-md",
        title: "Vous souhaitez explorer votre contribution // au Net Zero mondial ?",
        subtitle: "Rejoignez les entreprises qui rendent visible ce que les évaluations classiques ne voient pas encore.",
        buttons: JSON.stringify([
          {
            label: "Lancer le benchmark (3 minutes)",
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
const response = await fetch("http://localhost:3000/api/pages/about", {
  method: "PUT",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(pageData),
});

if (response.ok) {
  const result = await response.json();
  console.log("✅ Page publiée avec succès:", result);
  console.log("🔗 Voir la page : http://localhost:3000/about");
} else {
  const error = await response.text();
  console.error("❌ Erreur lors de la publication:", error);
}
