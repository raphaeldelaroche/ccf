# Scripts de migration

## Migration icon fields (string keys → IconData objects)

### Contexte

Le système d'icônes a été remplacé par IconifyPicker qui utilise des objets `IconData` complets au lieu de références string :

**Ancien format (string key)** :
```json
{
  "markerType": "icon",
  "markerIcon": "heart"
}
```

**Nouveau format (IconData object)** :
```json
{
  "markerType": "icon",
  "markerIcon": {
    "name": "heart",
    "collection": "lucide",
    "metadata": { "size": 24, "strokeWidth": 2 },
    "iconObject": { "type": "svg", "props": {...} }
  }
}
```

### Usage

```bash
# Preview des changements (dry-run)
npx tsx scripts/migrate-icon-fields.ts --dry-run

# Appliquer la migration
npx tsx scripts/migrate-icon-fields.ts
```

### Ce que fait le script

1. **Scan** : Parcourt toutes les pages Redis
2. **Backup** : Crée automatiquement un backup (`backup:icon-migration:{date}`)
3. **Conversion** : Convertit les string keys en objets IconData complets
4. **Récursion** : Gère les innerBlocks et items d'Iterator
5. **Fallback** : Conserve les clés inconnues (non présentes dans `iconOptions`)

### Restauration

En cas de problème, restaurer depuis le backup Redis :

```bash
# Lister les backups
redis-cli KEYS "backup:icon-migration:*"

# Restaurer une page (exemple)
redis-cli HGET backup:icon-migration:2026-03-24 page:{id}
```

---

## Migration responsive (string → objet)

### Contexte

Le système responsive du Blob a été refactoré pour utiliser un format objet au lieu de strings :

**Ancien format (string)** :
```json
{
  "layout": "stack md:row lg:bar",
  "marker": "top md:left",
  "size": "md lg:xl"
}
```

**Nouveau format (objet)** :
```json
{
  "responsive": {
    "base": { "layout": "stack", "marker": "top", "size": "md" },
    "md": { "layout": "row", "marker": "left" },
    "lg": { "layout": "bar", "size": "xl" }
  }
}
```

**Note** : Le breakpoint `xs` a été renommé en `base` pour clarifier qu'il s'agit des valeurs mobile-first par défaut (sans préfixe CSS).

### Utilisation

#### 1. Simulation (dry-run)

Teste la migration sans modifier les données en base :

```bash
npx tsx scripts/migrate-responsive-to-object.ts --dry-run
```

Cette commande affiche :
- Quelles pages seront modifiées
- Combien de blocs par page
- Un résumé détaillé

#### 2. Migration réelle

Applique les modifications en base de données :

```bash
npx tsx scripts/migrate-responsive-to-object.ts
```

**⚠️ Important** : Cette commande modifie directement Redis. Assurez-vous d'avoir :
- Testé avec `--dry-run` d'abord
- Vérifié que `.env.local` pointe vers le bon environnement
- Fait une sauvegarde si nécessaire

### Que fait le script ?

1. **Scan** : Liste toutes les pages en Redis (`page:*`)
2. **Analyse** : Pour chaque page, parcourt récursivement tous les blocs et innerBlocks
3. **Détection** : Identifie les champs avec syntaxe responsive string (`"stack md:row"`)
4. **Conversion** : Transforme en objet `responsive` avec clés par breakpoint (`base`, `sm`, `md`, etc.)
5. **Normalisation** : Extrait les champs non-responsive (title, markerType, etc.) de l'objet `responsive` vers la racine de `data`
6. **Migration xs → base** : Renomme les anciennes clés `xs` en `base` pour cohérence
7. **Sauvegarde** : Met à jour la page en Redis (sauf en mode dry-run)

### Champs migrés

Le script détecte et migre automatiquement ces champs :

- `layout`, `direction`, `marker`, `markerPosition`
- `actions`, `align`, `figureWidth`
- `size`, `gapX`, `gapY`
- `paddingX`, `paddingY`, `headerPaddingX`, `headerPaddingY`
- `figureBleed`

### Exemples de sortie

#### Dry-run avec pages à migrer

```
🚀 Démarrage de la migration responsive...
Mode: DRY RUN (simulation)

📄 3 page(s) trouvée(s)

✨ home: Migration nécessaire
   - 5 bloc(s) analysé(s)
   ✓ (simulation - non sauvegardé)

✓  about: Déjà au bon format

✨ contact: Migration nécessaire
   - 3 bloc(s) analysé(s)
   ✓ (simulation - non sauvegardé)

============================================================
📊 RÉSUMÉ DE LA MIGRATION
============================================================
Pages migrées:     2
Pages inchangées:  1
Erreurs:           0
Total:             3

⚠️  Mode DRY RUN actif - aucune modification n'a été sauvegardée
   Pour appliquer les changements, exécutez sans --dry-run
```

#### Migration réelle

```
🚀 Démarrage de la migration responsive...
Mode: PRODUCTION

📄 3 page(s) trouvée(s)

✨ home: Migration nécessaire
   - 5 bloc(s) analysé(s)
   ✓ Sauvegardé

✓  about: Déjà au bon format

✨ contact: Migration nécessaire
   - 3 bloc(s) analysé(s)
   ✓ Sauvegardé

============================================================
📊 RÉSUMÉ DE LA MIGRATION
============================================================
Pages migrées:     2
Pages inchangées:  1
Erreurs:           0
Total:             3

✅ Migration terminée avec succès!
```

### Sécurité

- ✅ **Idempotent** : Peut être exécuté plusieurs fois sans danger
- ✅ **Détection automatique** : Ne migre que les pages qui en ont besoin
- ✅ **Metadata** : Ajoute `migratedAt` timestamp dans `meta`
- ✅ **Préservation** : Garde toutes les autres données intactes
- ✅ **Récursif** : Traite aussi les innerBlocks (profondeur illimitée)

### Environnements

Le script utilise les variables d'environnement de `.env.local` :

- **Local** : Redis local via `REDIS_URL`
- **Production** : Redis Vercel via variables Vercel

⚠️ **Vérifiez toujours** quel environnement est configuré avant de lancer la migration réelle !

### Dépannage

#### "Erreur de connexion Redis"

Vérifiez que `.env.local` contient `REDIS_URL` :

```bash
npx vercel env pull .env.local
```

#### "Pages déjà au bon format"

Les pages ont déjà été migrées, rien à faire !

#### Restaurer une page

Si nécessaire, vous pouvez restaurer manuellement depuis Redis :

```bash
# Voir la valeur actuelle
redis-cli get "page:home"

# Restaurer depuis une backup (si vous en aviez fait)
redis-cli set "page:home" "$(cat backup-home.json)"
```

### Après la migration

Une fois la migration terminée :

1. Testez l'éditeur sur quelques pages
2. Vérifiez que les breakpoints responsive fonctionnent
3. Le script peut être supprimé si tout fonctionne
