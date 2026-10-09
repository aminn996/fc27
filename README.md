# FC27.TN par GameZone

Storefront React pour les demandes de disponibilité EA SPORTS FC 27 en Tunisie.

## État du projet

La vitrine, le catalogue initial, les sélecteurs de version, la validation du formulaire, la FAQ et le schéma Supabase sont en place. La livraison nationale affichée est de `8.000 DT`. Le formulaire appelle `POST /api/orders` et n'affiche une confirmation que si une API répond avec `{ "success": true }`. L'API serveur et l'authentification administrateur restent à connecter à Supabase avant la mise en production.

Les images PS5 Arabe et PS4 Arabe n'existent pas dans le dépôt actuel ; l'interface réutilise provisoirement les visuels de leur plateforme et conserve les deux variantes distinctes dans le catalogue. Ajoutez les fichiers dédiés dans `public/` lorsque disponibles.

## Démarrage

```bash
npm install
npm start
```

Tester et construire :

```bash
npm test -- --watchAll=false
npm run build
```

## Supabase

1. Créer un projet Supabase et renseigner `.env` à partir de `.env.example`.
2. Appliquer `supabase/migrations/001_initial_schema.sql` dans l'éditeur SQL Supabase.
3. Implémenter l'endpoint serveur `POST /api/orders` avec la clé service côté serveur uniquement. Il doit revalider le slug, le prix, la quantité et le téléphone avant d'insérer `orders`, `order_items` et `order_history` dans une transaction.
4. Ne jamais exposer de clé service dans le navigateur. La policy publique ne permet que la lecture des produits actifs ; aucune commande n'est lisible anonymement.

## Déploiement

Le build CRA produit `build/`, déployable sur Vercel comme application statique. Tant que l'endpoint `/api/orders` n'est pas déployé avec le même domaine (ou une URL proxy), le formulaire refusera correctement la demande au lieu d'afficher un faux succès.

## Scripts disponibles

Les scripts `start`, `test` et `build` sont ceux de Create React App.


## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
