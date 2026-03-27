# Self-Assessment Email Flow - Documentation

## Vue d'ensemble

Ce système permet aux utilisateurs de recevoir un lien personnalisé par email après avoir complété le self-assessment. Le lien les dirige vers leur rapport avec pré-remplissage automatique du formulaire de demande de scorecard.

## Architecture du flux

```
1. User remplit le Self-Assessment Form
   ↓
2. Soumission à Gravity Forms (Entry créée avec ID)
   ↓
3. Email automatique envoyé par Gravity Forms
   Contient: http://site.com/api/report-link/{entry_id}
   ↓
4. User clique sur le lien
   ↓
5. API route récupère l'entry via GraphQL
   ↓
6. Génération du JWT token avec les données
   ↓
7. Redirection vers /self-assessment-report?token=xxx
   ↓
8. Page report décode le token et affiche le rapport
   ↓
9. Cookie créé pour persistance
   ↓
10. CTA "Request full scorecard" → /self-assessment-request?token=xxx
   ↓
11. Formulaire pré-rempli avec sector, size, geography
   ↓
12. User complète firstname, lastname, company et soumet
```

## Fichiers créés/modifiés

### Nouveaux fichiers

1. **`/lib/self-assessment/token-utils.ts`**
   - Génération de tokens JWT signés
   - Décodage et validation des tokens
   - Durée de validité : 30 jours

2. **`/lib/self-assessment/cookie-utils.ts`**
   - Stockage du token en cookie (7 jours)
   - Récupération du token
   - Permet pré-remplissage même sans lien URL

3. **`/app/api/report-link/[entryId]/route.ts`**
   - Route API publique accessible depuis les emails
   - Récupère l'entry Gravity Forms via GraphQL
   - Génère le JWT token
   - Redirige vers la page report

4. **`/app/self-assessment-request/page.tsx`**
   - Nouvelle page pour le formulaire de demande
   - Décode le token pour pré-remplir
   - Utilise le composant ScorecardRequestForm

5. **`/docs/self-assessment-email-flow.md`**
   - Cette documentation

### Fichiers modifiés

1. **`/app/self-assessment-report/page.tsx`**
   - Gère maintenant les tokens JWT en plus du param sector
   - Stocke le token en cookie
   - CTA modifié pour passer le token à self-assessment-request

2. **`/components/self-assessment-report/scorecard-request-form.tsx`**
   - Accepte les props `initialSector`, `initialSize`, `initialGeography`
   - Pré-remplit les champs si fournis
   - Champs restent modifiables

3. **`/Local Sites/.../create-self-assessment-form.php`**
   - Notification email mise à jour
   - Inclut le lien : `http://site.com/api/report-link/{entry_id}`

4. **`.env.local`**
   - Ajout de `JWT_SECRET`
   - Ajout de `NEXT_PUBLIC_SITE_URL`

## Variables d'environnement

Ajoutées dans `.env.local` :

```env
# JWT Secret pour les tokens Self-Assessment
JWT_SECRET="ccf_self_assessment_jwt_secret_key_8f3e2b1c4d5a6e7f9g0h1i2j3k4l5m6n"

# URL du site pour les redirections
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

**⚠️ IMPORTANT** : En production, générez une nouvelle clé JWT sécurisée et ajoutez-la dans les variables d'environnement Vercel/hébergeur.

## Configuration Gravity Forms

### Étape 1 : Mettre à jour le formulaire Self-Assessment

1. Ouvrir dans le navigateur :
   ```
   http://climate-contribution-framework.local/create-self-assessment-form.php
   ```

2. Si le formulaire existe déjà, cliquer sur "Update Form" pour mettre à jour la notification email

3. Vérifier que la notification "User Notification - Report Link" contient :
   ```
   Subject: Your Climate Contribution Potential Report is Ready

   Body:
   Hello,

   Thank you for completing the Climate Contribution Framework self-assessment!

   Your personalized report is now ready. Click the link below to view your climate contribution potential:

   👉 View My Report: http://climate-contribution-framework.local/api/report-link/{entry_id}

   This link will remain valid for 30 days.
   ```

4. **⚠️ Supprimer le fichier PHP après utilisation** pour raisons de sécurité

### Étape 2 : Vérifier le mapping des champs

Le formulaire Gravity Forms (Form ID: 3) doit avoir :
- **Field 1** : Sector (Select)
- **Field 3** : Company Size (Select/Radio)
- **Field 5** : Geography (Select/Radio)
- **Field 6** : Email

## Test en local

### 1. Tester la génération de token (sans email)

1. Démarrer le serveur Next.js :
   ```bash
   pnpm dev
   ```

2. Créer manuellement un lien de test :
   ```
   http://localhost:3000/api/report-link/1
   ```
   (Remplacer `1` par un ID d'entry existant dans Gravity Forms)

3. Vérifier :
   - La redirection vers `/self-assessment-report?token=xxx`
   - L'affichage du rapport avec le bon secteur
   - Le cookie créé dans DevTools
   - Le lien CTA contient le token

### 2. Tester le pré-remplissage

1. Copier le token depuis l'URL du rapport

2. Naviguer vers :
   ```
   http://localhost:3000/self-assessment-request?token=xxx
   ```

3. Vérifier que les champs sont pré-remplis :
   - Sector
   - Company Size
   - Geography

4. Vérifier que les champs restent modifiables

### 3. Tester le flux complet avec email

1. Remplir le formulaire self-assessment :
   ```
   http://localhost:3000/self-assessment
   ```

2. Vérifier l'email reçu (vérifier dans WordPress/MailHog/service mail local)

3. Cliquer sur le lien dans l'email

4. Vérifier tout le flux jusqu'à la soumission finale

## Structure des données

### JWT Token Payload

```typescript
{
  sector: "technology",           // ID du secteur
  size: "pme",                   // Taille de l'entreprise
  geography: "europe",           // Zone géographique
  email: "user@example.com",     // Email de l'utilisateur
  entryId: 123,                  // ID de l'entry Gravity Forms (optionnel)
  iat: 1234567890,              // Timestamp de création (auto)
  exp: 1237159890,              // Timestamp d'expiration (auto)
  iss: "ccf-self-assessment",   // Issuer (auto)
  aud: "ccf-report"             // Audience (auto)
}
```

### Cookie

- **Nom** : `ccf_assessment_token`
- **Durée** : 7 jours
- **SameSite** : Lax
- **Secure** : true (en production)

## GraphQL Query utilisée

```graphql
query GetEntry($id: ID!) {
  gfEntry(id: $id, idType: DATABASE_ID) {
    ... on GfSubmittedEntry {
      databaseId
      formFields {
        nodes {
          ... on TextField {
            id
            databaseId
            value
          }
          ... on SelectField {
            id
            databaseId
            value
          }
          ... on EmailField {
            id
            databaseId
            emailValues {
              value
            }
          }
        }
      }
    }
  }
}
```

## Gestion des erreurs

### Token invalide ou expiré

Si le token est invalide ou a expiré (>30 jours), l'utilisateur voit :

```
Invalid or Expired Link

This report link is invalid or has expired.
Please check your email for a valid link or take the assessment again.

[Take the self-assessment again]
```

### Entry non trouvée

Si l'entry ID n'existe pas dans WordPress :

```
Entry not found (404)
```

L'API renvoie une erreur 404.

### Token manquant

Si aucun token ni secteur n'est fourni :

```
Invalid Report Link

This report link is missing the required information.
Please check your email for the correct link.

[Take the self-assessment again]
```

## Déploiement en production

### 1. Variables d'environnement

Ajouter dans Vercel/hébergeur :

```env
JWT_SECRET="[GÉNÉRER_UNE_NOUVELLE_CLÉ_SÉCURISÉE]"
NEXT_PUBLIC_SITE_URL="https://votre-domaine-production.com"
```

**Générer une clé sécurisée** :
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 2. Mettre à jour le lien dans l'email

Dans le script PHP, remplacer :
```
http://climate-contribution-framework.local/api/report-link/{entry_id}
```

Par :
```
https://votre-domaine-production.com/api/report-link/{entry_id}
```

### 3. Build et déploiement

```bash
pnpm build
# Vérifier qu'il n'y a pas d'erreurs TypeScript

# Déployer
git add .
git commit -m "feat: add self-assessment email flow with JWT tokens"
git push
```

## Rétrocompatibilité

Le système reste compatible avec l'ancien format :
```
/self-assessment-report?sector=technology
```

Cette URL fonctionne toujours mais ne bénéficie pas du pré-remplissage.

## Sécurité

1. **JWT signé** : Les tokens sont signés et ne peuvent pas être falsifiés
2. **Expiration** : Tokens valides 30 jours
3. **Cookies sécurisés** : Secure flag en production
4. **Validation** : Tous les tokens sont validés avant utilisation
5. **HTTPS** : En production, toutes les communications passent par HTTPS

## Troubleshooting

### Le lien dans l'email ne fonctionne pas

- Vérifier que le serveur Next.js est démarré
- Vérifier la variable `NEXT_PUBLIC_SITE_URL`
- Vérifier que l'entry existe dans WordPress

### Le rapport n'affiche pas les bonnes données

- Vérifier le mapping des champs (Field IDs 1, 3, 5, 6)
- Vérifier que les données sont bien dans l'entry WordPress
- Regarder les logs dans la console de l'API route

### Le formulaire n'est pas pré-rempli

- Vérifier que le token est présent dans l'URL
- Vérifier dans DevTools que le cookie existe
- Vérifier que les props sont bien passées au composant

### Token expiré trop rapidement

- Les tokens durent 30 jours par défaut
- Les cookies durent 7 jours
- Modifier dans `token-utils.ts` si besoin

## Support

Pour toute question ou problème, consulter :
- Les logs de l'API route : `/app/api/report-link/[entryId]/route.ts`
- Les logs du navigateur (DevTools Console)
- Les entrées Gravity Forms dans WordPress Admin
