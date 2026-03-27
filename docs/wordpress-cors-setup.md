# Configuration CORS WordPress pour Production

## Problème
Le site Next.js en production (`www.climatecontributionframework.org`) ne peut pas accéder à l'API GraphQL WordPress (`admin.climatecontributionframework.org`) à cause des restrictions CORS.

## Solution 1 : Via Plugin WordPress (Recommandé)

### Installer "WPGraphQL CORS"
1. Se connecter à l'admin WordPress : `https://admin.climatecontributionframework.org/wp-admin`
2. Aller dans **Extensions** → **Ajouter**
3. Rechercher "WPGraphQL CORS" ou "GraphQL CORS"
4. Installer et activer

### OU utiliser "Headless Mode"
Si vous avez déjà le plugin Headless Mode activé :
1. Aller dans **Réglages** → **Headless**
2. Ajouter dans "Allowed Origins" :
   ```
   https://www.climatecontributionframework.org
   https://climatecontributionframework.vercel.app
   ```

## Solution 2 : Code dans functions.php

Si vous préférez ajouter le code manuellement, ajoutez ceci dans le fichier `functions.php` de votre thème WordPress :

```php
/**
 * Enable CORS for Next.js frontend
 */
add_action('graphql_init', function() {
    // List of allowed origins
    $allowed_origins = [
        'https://www.climatecontributionframework.org',
        'https://climatecontributionframework.org',
        'https://climatecontributionframework.vercel.app',
        'http://localhost:3000', // Pour le dev local
    ];

    // Get the origin of the request
    $origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';

    // Check if origin is allowed
    if (in_array($origin, $allowed_origins)) {
        header("Access-Control-Allow-Origin: {$origin}");
        header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
        header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
        header("Access-Control-Allow-Credentials: true");
    }

    // Handle preflight requests
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        status_header(200);
        exit();
    }
});

/**
 * Enable CORS for REST API as well
 */
add_action('rest_api_init', function() {
    remove_filter('rest_pre_serve_request', 'rest_send_cors_headers');
    add_filter('rest_pre_serve_request', function($value) {
        $allowed_origins = [
            'https://www.climatecontributionframework.org',
            'https://climatecontributionframework.org',
            'https://climatecontributionframework.vercel.app',
            'http://localhost:3000',
        ];

        $origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';

        if (in_array($origin, $allowed_origins)) {
            header("Access-Control-Allow-Origin: {$origin}");
            header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
            header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
            header("Access-Control-Allow-Credentials: true");
        }

        return $value;
    });
}, 15);
```

## Solution 3 : Configuration Apache/Nginx

Si vous avez accès au serveur web, vous pouvez configurer CORS au niveau du serveur.

### Apache (.htaccess)
```apache
<IfModule mod_headers.c>
    SetEnvIf Origin "^https?://(www\.)?climatecontributionframework\.(org|vercel\.app)$" ORIGIN=$0
    Header set Access-Control-Allow-Origin "%{ORIGIN}e" env=ORIGIN
    Header set Access-Control-Allow-Methods "GET, POST, OPTIONS"
    Header set Access-Control-Allow-Headers "Content-Type, Authorization, X-Requested-With"
    Header set Access-Control-Allow-Credentials "true"
</IfModule>
```

### Nginx
```nginx
location /graphql {
    if ($http_origin ~* (https?://(www\.)?climatecontributionframework\.(org|vercel\.app))) {
        add_header 'Access-Control-Allow-Origin' "$http_origin" always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS' always;
        add_header 'Access-Control-Allow-Headers' 'Content-Type, Authorization, X-Requested-With' always;
        add_header 'Access-Control-Allow-Credentials' 'true' always;
    }

    if ($request_method = 'OPTIONS') {
        return 204;
    }
}
```

## Vérification

Après avoir appliqué une des solutions :

1. Redéployer le site Next.js sur Vercel (les variables d'environnement ont été mises à jour)
2. Tester l'API depuis la console du navigateur :

```javascript
fetch('https://admin.climatecontributionframework.org/graphql', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ query: '{ __typename }' })
})
.then(r => r.json())
.then(console.log)
```

Si ça fonctionne, vous devriez voir : `{ data: { __typename: "RootQuery" } }`

## Notes importantes

- Les variables d'environnement Vercel ont été corrigées (URLs malformées)
- Un redéploiement est nécessaire pour que les nouvelles variables prennent effet
- La configuration CORS doit être faite côté WordPress (backend), pas Next.js (frontend)
