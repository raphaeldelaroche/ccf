// Script d'insertion du bloc "Les trois piliers" dans la page methodologie
// Position cible : index 2 (après "L'équation centrale")

const SLUG = "methodologie";
const API_URL = `http://localhost:3000/api/pages/${SLUG}`;

// ─────────────────────────────────────────────────────────────────
// Nouveau bloc à insérer
// ─────────────────────────────────────────────────────────────────
const newBlock = {
  id: "meth-0002b-tpil-0000-0000-000000000002b",
  blockType: "blob",
  data: {
    size: "2xl",
    layout: "stack",
    align: "center",
    paddingX: "container-lg",
    paddingY: "6xl",
    headerPaddingX: "container-md",
    eyebrow: "Les trois piliers",
    title: "LES TROIS PILIERS",
    showContent: "true",
    contentType: "innerBlocks",
    appearance: "borderBottom",
    gapY: "3xl",
  },
  innerBlocks: [
    {
      id: "meth-0002b-tpil-iter-0000-000000000002b1",
      blockType: "blobIterator",
      data: {
        iteratorLayout: "grid-3",
        iteratorGapX: "md",
        iteratorGapY: "md",
        size: "lg",
        markerType: "none",
        appearance: "outlined",
        align: "left",
        paddingX: "md",
        paddingY: "md",
        itemFields: JSON.stringify([
          "eyebrow",
          "title",
          "subtitle",
          "contentText",
        ]),
        items: JSON.stringify([
          {
            eyebrow: "Pilier A",
            title: "Réduction de l'empreinte carbone",
            subtitle:
              "Le pilier A évalue comment les entreprises décarbonent leurs opérations et leurs chaînes de valeur sur les Scopes 1, 2 et 3, ainsi que l'ambition et les objectifs, les plans d'exécution, l'engagement des fournisseurs et des clients, la gouvernance et l'alignement avec les politiques publiques. Il capture à la fois la performance actuelle et la crédibilité prospective.",
            contentText:
              "Il est composé de cinq sous-piliers : Performance passée et actuelle · Indicateurs et ambition · Stratégie de mise en œuvre et d'engagement · Gouvernance · Politique et influence.",
          },
          {
            eyebrow: "Pilier B",
            title: "Solutions climatiques",
            subtitle:
              "Le pilier B reconnaît les entreprises dont les produits et services permettent d'éviter des émissions ou de générer des émissions négatives au-delà de leur propre empreinte. Il évalue le chiffre d'affaires vert actuel, l'ambition en matière de chiffre d'affaires vert futur et l'ampleur de l'impact via le ratio d'émissions évitées/induites.",
            contentText:
              "Ce pilier intègre l'échelle financière et l'impact réel sur l'atténuation climatique.",
          },
          {
            eyebrow: "Pilier C",
            title: "Financement climatique",
            subtitle:
              "Le pilier C valorise les contributions financières volontaires à l'atténuation climatique — en particulier celles réalisées en dehors de la chaîne de valeur de l'entreprise. Il couvre les résultats d'atténuation en tonnes, le financement climatique hors tonnes et les investissements à bénéfices climatiques secondaires.",
            contentText:
              "Seules les contributions volontaires sont incluses. Des exclusions strictes préviennent tout double comptage avec la décarbonation opérationnelle.",
          },
        ]),
      },
    },
  ],
};

// ─────────────────────────────────────────────────────────────────
// Fetch → insérer → PUT
// ─────────────────────────────────────────────────────────────────
const getResponse = await fetch(API_URL);
if (!getResponse.ok) {
  console.error("❌ Impossible de charger la page:", await getResponse.text());
  process.exit(1);
}

const pageData = await getResponse.json();
const blocks = pageData.blocks ?? [];

console.log(`📄 Page chargée : ${blocks.length} blocs`);
console.log(
  blocks.map((b, i) => `  ${i} | ${b.data?.eyebrow || b.data?.title?.slice(0, 40)}`).join("\n")
);

// Trouver l'index de "L'équation centrale"
const equationIndex = blocks.findIndex((b) => b.id === "meth-0002-equa-0000-0000-000000000002");
if (equationIndex === -1) {
  console.error("❌ Bloc 'L'équation centrale' introuvable.");
  process.exit(1);
}

const insertAt = equationIndex + 1;
const updatedBlocks = [
  ...blocks.slice(0, insertAt),
  newBlock,
  ...blocks.slice(insertAt),
];

console.log(`\n✅ Insertion à l'index ${insertAt} → ${updatedBlocks.length} blocs au total`);

const putResponse = await fetch(API_URL, {
  method: "PUT",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ ...pageData, blocks: updatedBlocks }),
});

if (putResponse.ok) {
  console.log("✅ Page sauvegardée avec succès.");
  console.log(`🔗 http://localhost:3000/methodologie`);
} else {
  const err = await putResponse.text();
  console.error("❌ Erreur lors de la sauvegarde:", err);
}
