// Script de création de la page "La méthode" du Climate Contribution Framework
// Source : guides/project/METHODOLOGY.md (version mars 2026)
// Structure :
//   Hero → L'équation → Pilier A → Pilier B → Pilier C →
//   Le scoring → Pondération sectorielle → Outils →
//   Les 3 résultats → Qui utilise → CTA

const pageData = {
  version: "1.0",
  slug: "methodology",
  title: "La méthode — Climate Contribution Framework",
  blocks: [

    // BLOC 1 — HERO (8xl)
    // Le CCF n'est pas un framework de plus — c'est une couche de connexion.
    {
      id: "meth-0001-hero-0000-0000-000000000001",
      blockType: "blob",
      data: {
        size: "8xl",
        layout: "stack",
        align: "center",
        paddingX: "container-xl",
        paddingY: "9xl",
        headerPaddingX: "container-sm",
        eyebrow: "La méthode",
        title: "Un cadre scientifique et ajusté par secteur // pour mesurer la contribution climatique // des entreprises.",
        subtitle: "Le Climate Contribution Framework ne remplace pas les méthodologies existantes. Il s'appuie sur elles — en connectant des scores, notations et certifications hétérogènes en un indicateur unique, équitable et comparable de la contribution des entreprises au zéro émission net mondial.",
        showContent: "false",
        figureType: "none",
        appearance: "borderBottom",
      },
      innerBlocks: [],
    },

    // BLOC 2 — L'ÉQUATION CENTRALE (2xl + grid-3)
    // Score CCF = A×α + B×β + C×γ — les 3 variables expliquées
    {
      id: "meth-0002-equa-0000-0000-000000000002",
      blockType: "blob",
      data: {
        size: "2xl",
        layout: "stack",
        align: "center",
        paddingX: "container-lg",
        paddingY: "6xl",
        headerPaddingX: "container-md",
        eyebrow: "L'équation centrale",
        title: "Score CCF = A × α + B × β + C × γ",
        subtitle: "Trois piliers non substituables, pondérés par secteur et combinés en un score unique. Aucun pilier ne compense les autres. La somme α + β + γ représente la matérialité climatique globale du secteur — entre 10 et 100.",
        showContent: "true",
        contentType: "innerBlocks",
        appearance: "borderBottom",
        gapY: "3xl",
      },
      innerBlocks: [
        {
          id: "meth-0002-equa-iter-0000-000000000002a",
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
                title: "A, B, C — Scores des piliers (0–100)",
                subtitle: "Chaque pilier produit un score normalisé entre 0 et 100. Il reflète la performance effective de l'entreprise, ajustée par la qualité des données et la rigueur du référentiel source.",
              },
              {
                title: "α, β, γ — Coefficients sectoriels",
                subtitle: "Trois coefficients calibrés pour chaque secteur. Ils déterminent le poids relatif de chaque pilier en fonction de la matérialité climatique réelle de l'activité de l'entreprise.",
              },
              {
                title: "α + β + γ — Potentiel contributif du secteur",
                subtitle: "La somme des coefficients, entre 10 et 100, indique jusqu'où un secteur peut agir sur le climat. Un potentiel de 96 signifie une responsabilité et une capacité d'action maximales.",
              },
            ]),
          },
        },
      ],
    },

    // BLOC 3 — PILIER A : RÉDUCTION DE L'EMPREINTE CARBONE (2xl + grid-3)
    // 5 sous-piliers : performance, ambition, exécution, gouvernance, politique
    {
      id: "meth-0003-pila-0000-0000-000000000003",
      blockType: "blob",
      data: {
        size: "2xl",
        layout: "stack",
        align: "center",
        paddingX: "container-lg",
        paddingY: "6xl",
        headerPaddingX: "container-md",
        eyebrow: "Pilier A",
        title: "Réduction de l'empreinte carbone.",
        subtitle: "Le pilier A évalue comment les entreprises décarbonent leurs opérations et leurs chaînes de valeur — sur les Scopes 1, 2 et 3. Il capture à la fois la performance actuelle et la crédibilité prospective des engagements pris.",
        showContent: "true",
        contentType: "innerBlocks",
        appearance: "borderBottom",
        gapY: "3xl",
      },
      innerBlocks: [
        {
          id: "meth-0003-pila-iter-0000-000000000003a",
          blockType: "blobIterator",
          data: {
            iteratorLayout: "grid-3",
            iteratorGapX: "md",
            iteratorGapY: "md",
            size: "lg",
            markerType: "text",
            markerPosition: "left",
            markerStyle: "ghost",
            appearance: "outlined",
            align: "left",
            paddingX: "md",
            paddingY: "md",
            itemFields: JSON.stringify(["title", "subtitle", "markerContent"]),
            items: JSON.stringify([
              {
                markerContent: "A1",
                title: "Performance passée et actuelle",
                subtitle: "Niveau d'émissions réelles sur les Scopes 1, 2 et 3. Base indispensable pour mesurer les progrès accomplis et la crédibilité de toute trajectoire déclarée.",
              },
              {
                markerContent: "A2",
                title: "Indicateurs et ambition",
                subtitle: "Objectifs chiffrés, horizons temporels, alignement sur les scénarios 1,5 °C. Ce sous-pilier évalue si l'ambition déclarée est à la hauteur du potentiel du secteur.",
              },
              {
                markerContent: "A3",
                title: "Stratégie d'exécution et d'engagement",
                subtitle: "Plans concrets de mise en œuvre, mobilisation de la chaîne de valeur amont et aval. L'ambition sans plan d'exécution ne produit pas de score élevé.",
              },
              {
                markerContent: "A4",
                title: "Gouvernance",
                subtitle: "Ancrage institutionnel de la stratégie climatique : responsabilités au niveau du Conseil, mécanismes de suivi, intégration dans les rémunérations.",
              },
              {
                markerContent: "A5",
                title: "Politique et influence",
                subtitle: "Alignement entre les positions publiques de l'entreprise, son lobbying et ses objectifs climatiques. La cohérence entre discours et influence compte.",
              },
            ]),
          },
        },
      ],
    },

    // BLOC 4 — PILIER B : SOLUTIONS CLIMATIQUES (2xl + grid-3)
    // Revenus verts + ambition + émissions évitées / ratio d'impact
    {
      id: "meth-0004-pilb-0000-0000-000000000004",
      blockType: "blob",
      data: {
        size: "2xl",
        layout: "stack",
        align: "center",
        paddingX: "container-lg",
        paddingY: "6xl",
        headerPaddingX: "container-md",
        eyebrow: "Pilier B",
        title: "Solutions climatiques.",
        subtitle: "Le pilier B reconnaît les entreprises dont les produits et services permettent d'éviter des émissions — ou d'en générer des négatives — au-delà de leur propre empreinte. Il intègre à la fois l'échelle financière et l'impact réel d'atténuation produit dans la chaîne de valeur des clients.",
        showContent: "true",
        contentType: "innerBlocks",
        appearance: "borderBottom",
        gapY: "3xl",
      },
      innerBlocks: [
        {
          id: "meth-0004-pilb-iter-0000-000000000004a",
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
                title: "Chiffre d'affaires vert actuel",
                subtitle: "Part des revenus générés par des produits ou services à bénéfice climatique démontré. Mesure l'exposition financière réelle de l'entreprise à la transition bas-carbone.",
              },
              {
                title: "Ambition de revenus verts futurs",
                subtitle: "Objectifs chiffrés de croissance de la part verte du portefeuille. Évalue la trajectoire stratégique, pas seulement l'état actuel.",
              },
              {
                title: "Émissions évitées et ratio d'impact",
                subtitle: "Émissions que les solutions de l'entreprise permettent d'éviter chez ses clients, rapportées aux émissions induites par sa propre activité. Plus ce ratio est élevé, plus la contribution climatique nette est réelle.",
              },
            ]),
          },
        },
      ],
    },

    // BLOC 5 — PILIER C : FINANCEMENT CLIMATIQUE (2xl + grid-3)
    // Contributions volontaires hors chaîne de valeur.
    {
      id: "meth-0005-pilc-0000-0000-000000000005",
      blockType: "blob",
      data: {
        size: "2xl",
        layout: "stack",
        align: "center",
        paddingX: "container-lg",
        paddingY: "6xl",
        headerPaddingX: "container-md",
        eyebrow: "Pilier C",
        title: "Financement climatique.",
        subtitle: "Le pilier C valorise les contributions financières volontaires à l'atténuation climatique — réalisées en dehors de la chaîne de valeur de l'entreprise. Seules les contributions volontaires sont incluses. Des exclusions strictes préviennent tout double comptage avec la décarbonation opérationnelle.",
        showContent: "true",
        contentType: "innerBlocks",
        appearance: "borderBottom",
        gapY: "3xl",
      },
      innerBlocks: [
        {
          id: "meth-0005-pilc-iter-0000-000000000005a",
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
                title: "Résultats d'atténuation en tonnes",
                subtitle: "Crédits carbone de haute intégrité, certifiés par des standards reconnus (ICVCM, Gold Standard, VCS). L'unité de mesure la plus directe de la contribution climatique financée.",
              },
              {
                title: "Financement climatique hors tonnes",
                subtitle: "Mécénat climatique, fonds dédiés à la transition, obligations vertes. Des instruments qui accélèrent la transition sans être comptabilisés en tonnes de CO₂ équivalent.",
              },
              {
                title: "Investissements à bénéfices secondaires",
                subtitle: "Investissements dont le bénéfice climatique est indirect mais documenté. Permettent de valoriser un engagement financier élargi, avec des coefficients de crédibilité adaptés.",
              },
            ]),
          },
        },
      ],
    },

    // BLOC 6 — LE FONCTIONNEMENT DU SCORING (2xl + grid-2)
    // Kit de Traduction : référentiels → 0–100
    // Deux facteurs de crédibilité : framework (70%) + qualité éval (30%)
    {
      id: "meth-0006-scor-0000-0000-000000000006",
      blockType: "blob",
      data: {
        size: "2xl",
        layout: "stack",
        align: "center",
        paddingX: "container-lg",
        paddingY: "6xl",
        headerPaddingX: "container-md",
        eyebrow: "Le fonctionnement du scoring",
        title: "Des référentiels externes // vers des scores comparables.",
        subtitle: "Chaque sous-pilier est évalué à partir des résultats de référentiels externes reconnus. Ces résultats — scores, notations, labels, ratios, certifications — sont convertis sur une échelle normalisée de 0 à 100 via le Kit de Traduction, puis ajustés par deux facteurs de crédibilité. Si plusieurs référentiels s'appliquent au même périmètre, le score le plus élevé est retenu.",
        showContent: "true",
        contentType: "innerBlocks",
        appearance: "borderBottom",
        gapY: "3xl",
      },
      innerBlocks: [
        {
          id: "meth-0006-scor-iter-0000-000000000006a",
          blockType: "blobIterator",
          data: {
            iteratorLayout: "grid-2",
            iteratorGapX: "md",
            iteratorGapY: "none",
            size: "lg",
            markerType: "text",
            markerPosition: "left",
            markerStyle: "ghost",
            appearance: "outlined",
            align: "left",
            paddingX: "md",
            paddingY: "md",
            itemFields: JSON.stringify(["title", "subtitle", "markerContent"]),
            items: JSON.stringify([
              {
                markerContent: "70 %",
                title: "Score du référentiel d'évaluation",
                subtitle: "Mesure l'exhaustivité et la transparence de la méthodologie sous-jacente du référentiel source. Les frameworks internationaux de référence — SBTi, ACT, TPI — bénéficient des coefficients les plus élevés. Ce facteur pèse 70 % dans l'ajustement de crédibilité.",
              },
              {
                markerContent: "30 %",
                title: "Score de qualité de l'évaluation",
                subtitle: "Mesure la robustesse des données, l'indépendance de la démarche et le niveau d'assurance externe. Données auto-déclarées, vérifiées par un tiers, certifiées — chaque niveau de rigueur produit un coefficient différent. Ce facteur pèse 30 %.",
              },
            ]),
          },
        },
      ],
    },

    // BLOC 7 — PONDÉRATION SECTORIELLE (2xl + grid-3)
    // 3 critères : intensité émissions / capacité solutions / solidité financière
    {
      id: "meth-0007-pond-0000-0000-000000000007",
      blockType: "blob",
      data: {
        size: "2xl",
        layout: "stack",
        align: "center",
        paddingX: "container-lg",
        paddingY: "6xl",
        headerPaddingX: "container-md",
        eyebrow: "Pondération sectorielle",
        title: "Garantir l'équité // entre les secteurs.",
        subtitle: "Différents secteurs jouent des rôles fondamentalement distincts dans la transition climatique. Le CCF dérive des coefficients sectoriels spécifiques pour chaque pilier, à partir de classifications d'activités couvrant plus de 100 sous-secteurs. Cette approche concentre l'évaluation sur les leviers les plus matériels — et prévient toute compensation entre des piliers structurellement différents.",
        showContent: "true",
        contentType: "innerBlocks",
        appearance: "borderBottom",
        gapY: "3xl",
      },
      innerBlocks: [
        {
          id: "meth-0007-pond-iter-0000-000000000007a",
          blockType: "blobIterator",
          data: {
            iteratorLayout: "grid-3",
            iteratorGapX: "md",
            iteratorGapY: "none",
            size: "lg",
            markerType: "text",
            markerPosition: "left",
            markerStyle: "ghost",
            appearance: "outlined",
            align: "left",
            paddingX: "md",
            paddingY: "md",
            itemFields: JSON.stringify(["title", "subtitle", "markerContent"]),
            items: JSON.stringify([
              {
                markerContent: "α",
                title: "Intensité des émissions",
                subtitle: "Le poids du pilier Réduction est proportionnel à l'intensité carbone du secteur sur les Scopes 1, 2 et 3. Plus un secteur émet, plus la décarbonation de ses opérations est matérielle.",
              },
              {
                markerContent: "β",
                title: "Capacité à déployer des solutions",
                subtitle: "Le poids du pilier Solutions reflète le potentiel technologique du secteur à produire des biens ou services permettant d'éviter des émissions chez d'autres acteurs. Un fabricant de batteries a un β structurellement plus élevé qu'un prestataire de services.",
              },
              {
                markerContent: "γ",
                title: "Solidité financière",
                subtitle: "Le poids du pilier Financement intègre les marges nettes sectorielles et la responsabilité historique. Il traduit la capacité — et l'obligation — de contribuer financièrement à l'atténuation au-delà de sa propre chaîne de valeur.",
              },
            ]),
          },
        },
      ],
    },

    // BLOC 8 — OUTILS DE MISE EN ŒUVRE (2xl + grid-2)
    // Kit de Traduction + Approche Simplifiée CCF
    {
      id: "meth-0008-outl-0000-0000-000000000008",
      blockType: "blob",
      data: {
        size: "2xl",
        layout: "stack",
        align: "center",
        paddingX: "container-lg",
        paddingY: "6xl",
        headerPaddingX: "container-md",
        eyebrow: "Outils de mise en œuvre",
        title: "Rendre le cadre opérationnel // pour toutes les entreprises.",
        subtitle: "Deux outils assurent l'adoption à grande échelle du CCF — quelle que soit la maturité de reporting de l'entreprise. Ensemble, ils permettent au CCF d'intégrer pratiquement n'importe quelle méthodologie d'évaluation climatique existante.",
        showContent: "true",
        contentType: "innerBlocks",
        appearance: "borderBottom",
        gapY: "3xl",
      },
      innerBlocks: [
        {
          id: "meth-0008-outl-iter-0000-000000000008a",
          blockType: "blobIterator",
          data: {
            iteratorLayout: "grid-2",
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
                title: "Kit de Traduction",
                subtitle: "Un système de conversion qui transforme des résultats hétérogènes — scores numériques, niveaux, labels, ratios — en résultats normalisés de 0 à 100. Il permet de rendre directement comparables des évaluations issues de référentiels de nature très différente.",
              },
              {
                title: "Approche Simplifiée CCF",
                subtitle: "Une évaluation par matrice de maturité structurée, destinée aux entreprises non encore couvertes par des référentiels externes. Elle garantit une applicabilité universelle tout en appliquant des pondérations de crédibilité plus faibles — et crée une trajectoire de progression documentée.",
              },
            ]),
          },
        },
      ],
    },

    // BLOC 9 — LES TROIS RÉSULTATS (2xl + grid-3)
    // Potentiel contributif · Contribution effective · Performance contributive
    {
      id: "meth-0009-resu-0000-0000-000000000009",
      blockType: "blob",
      data: {
        size: "2xl",
        layout: "stack",
        align: "center",
        paddingX: "container-lg",
        paddingY: "6xl",
        headerPaddingX: "container-md",
        eyebrow: "Trois résultats",
        title: "Ce que le CCF produit // pour chaque entreprise.",
        subtitle: "Le CCF transforme l'ensemble des données agrégées en trois indicateurs complémentaires, présentés dans un scorecard compact. Ils mettent en évidence deux axes prioritaires : renforcer l'action — élever l'ambition et l'exécution — et améliorer la démonstration via la transparence et les évaluations tierces.",
        showContent: "true",
        contentType: "innerBlocks",
        appearance: "borderBottom",
        gapY: "3xl",
      },
      innerBlocks: [
        {
          id: "meth-0009-resu-iter-0000-000000000009a",
          blockType: "blobIterator",
          data: {
            iteratorLayout: "grid-3",
            iteratorGapX: "md",
            iteratorGapY: "none",
            size: "lg",
            markerType: "text",
            markerPosition: "left",
            markerStyle: "ghost",
            appearance: "outlined",
            align: "left",
            paddingX: "md",
            paddingY: "md",
            itemFields: JSON.stringify(["title", "subtitle", "markerContent"]),
            items: JSON.stringify([
              {
                markerContent: "01",
                title: "Potentiel contributif",
                subtitle: "La matérialité climatique ajustée par secteur : α + β + γ. Ce que l'entreprise pourrait contribuer au maximum, compte tenu de son activité. Ce potentiel ne varie pas selon ses efforts — il dépend uniquement de son secteur.",
              },
              {
                markerContent: "02",
                title: "Contribution effective",
                subtitle: "La performance réelle sur les trois piliers, ajustée par la robustesse méthodologique des évaluations mobilisées. C'est la mesure de ce que l'entreprise fait concrètement — pas ce qu'elle prévoit de faire.",
              },
              {
                markerContent: "03",
                title: "Performance contributive",
                subtitle: "Le ratio entre la contribution effective et le potentiel contributif. Un indicateur d'ambition : il met en évidence l'écart entre ce que l'entreprise fait et ce que son secteur lui permet de faire.",
              },
            ]),
          },
        },
      ],
    },

    // BLOC 10 — QUI UTILISE CES RÉSULTATS (2xl + grid-3)
    // Entreprises · Investisseurs · Décideurs publics et ONG
    {
      id: "meth-0010-audi-0000-0000-000000000010",
      blockType: "blob",
      data: {
        size: "2xl",
        layout: "stack",
        align: "center",
        paddingX: "container-lg",
        paddingY: "6xl",
        headerPaddingX: "container-md",
        eyebrow: "À qui s'adressent ces résultats",
        title: "Des données utilisables // pour les marchés et les décideurs.",
        subtitle: "Le CCF a été conçu pour produire des résultats actionnables — pas seulement des scores. Chaque audience dispose d'un angle d'utilisation distinct, adapté à ses besoins de décision.",
        showContent: "true",
        contentType: "innerBlocks",
        appearance: "borderBottom",
        gapY: "3xl",
      },
      innerBlocks: [
        {
          id: "meth-0010-audi-iter-0000-000000000010a",
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
                title: "Les entreprises",
                subtitle: "Pour planifier, rendre compte et prioriser les actions à fort impact contributif. Le scorecard CCF identifie les leviers les moins exploités et oriente les efforts vers ce qui compte le plus pour le secteur.",
              },
              {
                title: "Les investisseurs",
                subtitle: "Pour identifier les leaders climatiques réels et allouer les capitaux en cohérence. La comparabilité intersectorielle du CCF permet une analyse de portefeuille robuste, au-delà des seules trajectoires de réduction d'empreinte.",
              },
              {
                title: "Les décideurs publics et ONG",
                subtitle: "Pour compléter les obligations de reporting par une référence indépendante, robuste et comparable. Le CCF offre une lecture agrégée de l'action climatique réelle des entreprises, à l'échelle d'un secteur ou d'une économie.",
              },
            ]),
          },
        },
      ],
    },

    // BLOC 11 — CTA FINAL (4xl, darkBackground)
    {
      id: "meth-0011-cta0-0000-0000-000000000011",
      blockType: "blob",
      data: {
        size: "4xl",
        layout: "stack",
        align: "center",
        paddingY: "7xl",
        headerPaddingX: "container-md",
        title: "Vous souhaitez comprendre // votre rôle dans la transition // vers le zéro émission net ?",
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
const response = await fetch("http://localhost:3000/api/pages/methodology", {
  method: "PUT",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(pageData),
});

if (response.ok) {
  const result = await response.json();
  console.log("✅ Page publiée avec succès:", result);
  console.log("🔗 Voir la page : http://localhost:3000/methodology");
} else {
  const error = await response.text();
  console.error("❌ Erreur lors de la publication:", error);
}
