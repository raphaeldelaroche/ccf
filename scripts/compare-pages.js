#!/usr/bin/env node
/**
 * Comparaison complète de toutes les pages entre production et local
 *
 * Note: This script uses Node.js built-in modules and is not part of the Next.js build.
 * It's a standalone utility script for comparing production vs local data.
 */

import fs from 'fs';

// Chargement des données
const pages = ['home', 'about', 'methodology', 'resources'];
const data = {};

pages.forEach(page => {
  try {
    data[page] = {
      prod: JSON.parse(fs.readFileSync(`/tmp/prod-${page}.json`, 'utf8')),
      local: JSON.parse(fs.readFileSync(`/tmp/local-${page}.json`, 'utf8'))
    };
  } catch (e) {
    console.error(`Erreur chargement ${page}:`, e.message);
  }
});

// Fonction pour extraire tous les textes d'un objet
function extractTexts(obj, path = '', texts = []) {
  if (typeof obj === 'string' && obj.trim()) {
    // Champs textuels à comparer
    const textFields = ['title', 'subtitle', 'eyebrow', 'contentText', 'markerContent', 'emphasisText', 'label'];
    const fieldName = path.split('.').pop();

    // Ignorer les champs techniques
    const skipFields = ['id', 'blockType', 'linkType', 'image', 'video', 'variant', 'theme',
                        'customAction', 'opensInNewTab', 'internalHref', 'externalHref',
                        'appearance', 'markerIcon', 'markerType', 'contentType', 'figureType',
                        'layout', 'direction', 'align', 'size', 'gapX', 'gapY', 'paddingX',
                        'paddingY', 'slug', 'version', 'createdAt', 'updatedAt', 'markerSize',
                        'markerStyle', 'markerRounded', 'markerTheme', 'eyebrowTheme', 'titleAs',
                        'eyebrowAs', 'figureWidth', 'figureBleed', 'headerPaddingX', 'headerPaddingY',
                        'actions', 'showContent', 'containerLayout', 'iteratorLayout', 'iteratorGapX',
                        'iteratorGapY', 'markerPosition'];

    if (textFields.includes(fieldName) && !skipFields.includes(fieldName) && !path.includes('responsive')) {
      texts.push({ path, value: obj, field: fieldName });
    }
  } else if (Array.isArray(obj)) {
    obj.forEach((item, index) => {
      extractTexts(item, `${path}[${index}]`, texts);
    });
  } else if (typeof obj === 'object' && obj !== null) {
    for (const key in obj) {
      extractTexts(obj[key], path ? `${path}.${key}` : key, texts);
    }
  }
  return texts;
}

// Fonction pour parser les buttons JSON
function parseButtons(buttonStr) {
  try {
    const buttons = JSON.parse(buttonStr);
    return buttons.map(b => b.label).join(' | ');
  } catch {
    return buttonStr;
  }
}

console.log('═══════════════════════════════════════════════════════════════');
console.log('   COMPARAISON PRODUCTION vs LOCAL - TOUTES LES PAGES');
console.log('═══════════════════════════════════════════════════════════════\n');

const reports = {};

pages.forEach(page => {
  if (!data[page]) {
    console.log(`⚠️  Page "${page}" : Données manquantes\n`);
    return;
  }

  const { prod, local } = data[page];

  console.log(`\n┌─────────────────────────────────────────────────────────────┐`);
  console.log(`│  PAGE: ${page.toUpperCase().padEnd(52)} │`);
  console.log(`└─────────────────────────────────────────────────────────────┘`);

  console.log(`\n📊 Métadonnées:`);
  console.log(`   Production:`);
  console.log(`     - Mise à jour: ${prod.meta?.updatedAt || 'N/A'}`);
  console.log(`     - Nombre de blocs: ${prod.blocks?.length || 0}`);
  console.log(`   Local:`);
  console.log(`     - Mise à jour: ${local.meta?.updatedAt || 'N/A'}`);
  console.log(`     - Nombre de blocs: ${local.blocks?.length || 0}`);

  // Extraction des textes
  const prodTexts = extractTexts(prod);
  const localTexts = extractTexts(local);

  console.log(`\n📝 Contenus textuels:`);
  console.log(`   Production: ${prodTexts.length} champs textuels`);
  console.log(`   Local: ${localTexts.length} champs textuels`);

  // Comparaison
  const differences = [];
  const missing = [];

  // Créer une map des textes de production par path
  const prodMap = new Map(prodTexts.map(t => [t.path, t.value]));
  const localMap = new Map(localTexts.map(t => [t.path, t.value]));

  // Vérifier les modifications
  localTexts.forEach(localText => {
    const prodValue = prodMap.get(localText.path);

    if (prodValue === undefined) {
      // Nouveau contenu en local (pas en prod)
      if (localText.value && localText.value.length > 0) {
        missing.push({
          path: localText.path,
          field: localText.field,
          local: localText.value
        });
      }
    } else if (prodValue !== localText.value) {
      // Contenu modifié
      let prodDisplay = prodValue;
      let localDisplay = localText.value;

      // Parse buttons pour affichage
      if (localText.field === 'buttons') {
        prodDisplay = parseButtons(prodValue);
        localDisplay = parseButtons(localText.value);
      }

      differences.push({
        path: localText.path,
        field: localText.field,
        prod: prodDisplay,
        local: localDisplay
      });
    }
  });

  // Vérifier les contenus supprimés
  prodTexts.forEach(prodText => {
    if (!localMap.has(prodText.path) && prodText.value && prodText.value.length > 0) {
      missing.push({
        path: prodText.path,
        field: prodText.field,
        prod: prodText.value
      });
    }
  });

  if (differences.length === 0 && missing.length === 0) {
    console.log(`\n✅ VERDICT: Aucune modification éditoriale\n`);
    console.log(`   Tous les contenus textuels sont identiques.`);
    reports[page] = { status: 'identical', differences: [], missing: [] };
  } else {
    hasChanges = true;
    console.log(`\n⚠️  VERDICT: Différences détectées\n`);

    if (differences.length > 0) {
      console.log(`   🔄 Modifications (${differences.length}):`);
      differences.slice(0, 5).forEach(diff => {
        console.log(`\n   • ${diff.field} (${diff.path})`);
        console.log(`     Prod:  "${diff.prod.substring(0, 80)}${diff.prod.length > 80 ? '...' : ''}"`);
        console.log(`     Local: "${diff.local.substring(0, 80)}${diff.local.length > 80 ? '...' : ''}"`);
      });
      if (differences.length > 5) {
        console.log(`\n   ... et ${differences.length - 5} autre(s) modification(s)`);
      }
    }

    if (missing.length > 0) {
      console.log(`\n   ➕ Contenus ajoutés/supprimés (${missing.length}):`);
      missing.slice(0, 3).forEach(item => {
        console.log(`\n   • ${item.field} (${item.path})`);
        if (item.prod) console.log(`     Supprimé en local: "${item.prod.substring(0, 60)}..."`);
        if (item.local) console.log(`     Ajouté en local: "${item.local.substring(0, 60)}..."`);
      });
      if (missing.length > 3) {
        console.log(`\n   ... et ${missing.length - 3} autre(s)`);
      }
    }

    reports[page] = {
      status: 'modified',
      differences,
      missing,
      diffCount: differences.length,
      missingCount: missing.length
    };
  }
});

// Rapport final
console.log('\n\n═══════════════════════════════════════════════════════════════');
console.log('   RAPPORT FINAL');
console.log('═══════════════════════════════════════════════════════════════\n');

const modifiedPages = Object.entries(reports).filter(([_, r]) => r.status === 'modified');

if (modifiedPages.length === 0) {
  console.log('✅ RÉSULTAT: Toutes les pages sont identiques\n');
  console.log('   L\'éditrice n\'a effectué AUCUNE modification de contenu.');
  console.log('   Vous pouvez pusher en production en toute sécurité.\n');
} else {
  console.log(`⚠️  RÉSULTAT: ${modifiedPages.length} page(s) modifiée(s)\n`);

  modifiedPages.forEach(([page, report]) => {
    console.log(`   📄 ${page}:`);
    console.log(`      - ${report.diffCount} modification(s)`);
    console.log(`      - ${report.missingCount} ajout(s)/suppression(s)`);
  });

  console.log('\n   ⚠️  ATTENTION: Vérifiez ces modifications avant de pusher.');
  console.log('   Les contenus de l\'éditrice pourraient être écrasés.\n');
}

console.log('═══════════════════════════════════════════════════════════════\n');
