# Backup Production - 2026-03-15

## Description

Sauvegarde complète des pages en production avant le déploiement du nouveau système responsive.

## Contenu

- `home.json` - Page d'accueil (28.7 KB)
- `about.json` - Page À propos (12.6 KB)
- `methodology.json` - Page Méthodologie (23.1 KB)
- `resources.json` - Page Ressources (23.1 KB)

## Date de sauvegarde

**15 mars 2026, 22:22**

## Source

Production Vercel : https://climatecontributionframework.vercel.app

## Dernières mises à jour en prod

- `home`: 2026-03-14T17:45:38.020Z
- `about`: 2026-03-13T10:22:08.822Z
- `methodology`: 2026-03-13T10:03:20.504Z
- `resources`: 2026-03-13T09:59:47.727Z

## Format

JSON au format ancien système (champs au niveau racine, avant migration responsive).

## Restauration

Pour restaurer une page en production :

```bash
# Exemple pour la page "about"
curl -X PUT https://climatecontributionframework.vercel.app/api/pages/about \
  -H "Content-Type: application/json" \
  -H "X-User-Role: engineer" \
  -d @backup/prod-2026-03-15/about.json
```

## Notes

Ce backup a été créé automatiquement avant le déploiement du système responsive (migration de l'ancien format vers le nouveau format avec objet `responsive`).
