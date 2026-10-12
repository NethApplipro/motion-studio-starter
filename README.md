# Motion Studio Starter

Studio de motion design réutilisable en **Remotion + React + TypeScript**, pour créer des films avec du code et les améliorer avec un agent ou manuellement.

Base issue de [applipro-motion-studio](https://github.com/NethApplipro/applipro-motion-studio), commit `b6b6c8f`. Ce dépôt est indépendant : les modifications n'affectent pas le studio d'origine. Les films, captures, logo et anciens verdicts Applipro ont été retirés. **Nova est une marque fictive.**

## Démarrer
Node 22 recommandé (`.nvmrc`). ffmpeg complet recommandé pour les planches et l'analyse sonore ; Chrome headless est installé par le setup.

```bash
git clone https://github.com/NethApplipro/motion-studio-starter.git
cd motion-studio-starter
npm ci
npm run setup
npm run studio
```

Le Studio propose `Demo` dans trois formats, `Briques` pour explorer les animations et `Ecrans` pour voir une maquette fictive. La démo est pédagogique, sans son et en mode ébauche ; ce n'est pas un film commercial validé.

```bash
npm test
npm run check
npm run render -- Demo 16x9 --draft
npm run qa -- Demo 16x9 --preflight
```

## Faire son premier film
1. Suivre [le guide de prise en main](docs/PRISE-EN-MAIN.md).
2. Personnaliser `brand/brand.json` (nom, URL, palette et tracé du logo). La clé `blue` désigne l'accent, sa valeur peut être changée.
3. Déposer ses captures autorisées dans `references/product-ui/` ; remplacer la maquette dans `src/components/app/`.
4. Créer le projet : `npm run new-film -- mon-film "Mon premier film"`.
5. Remplir `films/mon-film/brief.md`, choisir le son et le format maître, valider le storyboard avant d'animer.
6. Ajouter ses images de contrôle à `scripts/visual-targets.mjs`.

Avec un agent : « Lis AGENTS.md. Prépare un film pour ma marque, en ébauche, sans voix ni musique. Propose trois directions sur le même passage avant de coder. »

## Base technique conservée
- Ressorts déterministes, typographie cinétique, morphing, curseur, caméra, flou de mouvement, téléphone, icônes.
- Trois formats recomposés : 16:9, 1:1, 9:16 ; réglages des films via Zod.
- Rendu MP4, stills, déterminisme, QA automatique et avertissements de temps de lecture.
- Modes audio silencieux, effets seuls et mix ; outils optionnels de voix et de rythme.
- Mode ébauche, verdict de livraison relié au fichier vidéo, revue humaine et tests visuels.
- Instructions Codex/Claude, fiches de style, briefs, évaluations, workflows CI et Docker.

## Qualité et livraison
`npm run render -- MonFilm`, puis `npm run qa -- MonFilm` pour contrôler les MP4. `npm run critic` prépare les supports de critique ; une personne ou une session indépendante remplit les notes, puis `npm run verdict -- MonFilm` calcule le verdict. Ne jamais inventer une note pour rendre la CI verte. L'ébauche est volontairement refusée par le verdict.

`npm run visual` compare les références ; `npm run visual -- --update` les remplace **explicitement après examen**. Ne pas accepter une différence sans regarder les images. Voir `tests/visual/README.md` pour l'environnement initial. Le workflow « Références visuelles » prépare des références homogènes sur Linux.

## Transmettre et améliorer
Ton ami peut forker le dépôt pour travailler sur son compte, ou recevoir sa propriété via les paramètres GitHub. Aucun compte ni secret de l'auteur ne doit être transmis. Voir [TRANSFERT.md](docs/TRANSFERT.md).

## Licence et services optionnels
Le code propre au studio est sous licence MIT : utilisation, adaptation et redistribution autorisées avec conservation de la notice. Les dépendances et ressources tierces gardent leurs licences : voir [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md). **La licence Remotion est distincte** : vérifier https://www.remotion.dev/docs/license pour son usage.

Aucune clé API nécessaire pour les rendus locaux. ElevenLabs et la relecture Codex sont facultatifs et peuvent entraîner des coûts ; `.env.example` ne contient que des exemples. Ne jamais committer les vraies clés.
