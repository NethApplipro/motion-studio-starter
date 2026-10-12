# Adapter le studio à votre marque

## 1. Installer et vérifier
`npm ci`, `npm run setup`, `npm test`, `npm run check`, puis `npm run studio`.
Si Chrome ne se télécharge pas : définir `REMOTION_BROWSER` vers un Chrome/Chromium installé. Pour les planches : installer ffmpeg.

## 2. Changer la marque
`brand/brand.json` pilote le nom, l'URL, la palette, le dégradé et `logoPath` (tracé dans un repère 670×670). `src/components/Logo.tsx` lit ces valeurs. Mettre aussi à jour `brand/logo-mark.svg` si le tracé change : c'est l'asset exportable. Le logo Nova est fictif.
Pour changer la police, fournir des fichiers locaux dans `public/fonts` et adapter `src/lib/fonts.ts`, la charte et la notice de licence. Ne pas seulement changer le nom de police dans le JSON.

## 3. Ajouter des écrans
La maquette Nova n'est pas un produit. Fournir vos captures autorisées dans `references/product-ui`, redessiner les écrans dans `src/components/app/Screens.tsx` et les déclarer dans le catalogue. Garder leur lien avec une preuve réelle.

## 4. Créer un film
`npm run new-film -- mon-film "Mon premier film"` génère la documentation et le code et enregistre les compositions `MonFilm-16x9`, `MonFilm-1x1`, `MonFilm-9x16`.
Commencer par `Étape : ébauche`, `Cible : interne`, `Son : silencieux`, `Formats : 16:9, 1:1, 9:16` dans le brief. Le premier format est le maître. Valider le scénario et la direction, puis modifier composition, schéma et timeline.
Les effets et la musique de prévisualisation se règlent dans le composant ; le mode audio du brief décide de l'encodage final. Le générateur fournit un squelette à développer, pas un film prêt à livrer.

## 5. Vérifier
`npm run check` contrôle les types et rend une image par composition. `npm run qa -- MonFilm 16x9 --preflight` contrôle le travail en cours, puis `npm run render -- MonFilm 16x9 --draft` fournit un aperçu.
Pour une livraison : passer à `Étape : final`, définir la cible réelle, rendre tous les formats, QA finale, déterminisme et revue indépendante. Les tests techniques ne remplacent pas le visionnage.

## 6. Faire évoluer la base
Créer une branche par amélioration, lancer les tests, examiner les images, puis ouvrir une PR. Les modifications de code partagé contrôlent tous les films. Ajouter les nouvelles scènes quand plusieurs films en ont réellement besoin.
