# Rendre ailleurs que sur son ordinateur

Un film de 15 s se rend en 1 à 2 min par format sur un portable récent ; la validation finale (`npm run qa`, chaque frame)
prend environ 1 min par format (mesuré sur 2 cœurs : 50 s pour 420 frames en 1:1). Au-delà de quelques films par semaine, ou pour des films de 30 à 60 s, déporter le rendu.

## Option 1 : serveur Hetzner + Docker (recommandé, infra existante)
Le `Dockerfile` du dépôt fige navigateur, polices et ffmpeg : le rendu est identique d'une machine à l'autre
(condition du test `determinism` et des tests visuels).

```bash
docker build -t motion-studio .
docker run --rm -v "$PWD/out:/app/out" -v "$PWD/reviews:/app/reviews" motion-studio npm run render -- Demo
docker run --rm -v "$PWD/out:/app/out" -v "$PWD/reviews:/app/reviews" motion-studio npm run qa -- Demo
```
- **Coolify** : créer une ressource « Dockerfile » depuis ce dépôt, sans port exposé, et lancer les commandes ci-dessus
  comme tâches planifiées ou manuelles ; monter `out/` et `reviews/` sur un volume persistant.
- **Parallélisme** : les 3 formats sont indépendants, lancer un conteneur par format
  (`npm run render -- Demo 9x16`, etc.). Prévoir 2 vCPU et 4 Go de RAM par conteneur.
- Statut : `Dockerfile` écrit d'après la documentation Remotion, **non testé** dans l'environnement où il a été rédigé
  (pas de Docker disponible). Premier lancement : vérifier `npm run check` dans le conteneur.

## Option 2 : Remotion Lambda (AWS)
Rendu découpé en morceaux parallèles sur AWS Lambda : un film de 60 s en moins d'une minute.
- Paquet `@remotion/lambda` (même version que `remotion`), compte AWS, rôle IAM, `npx remotion lambda functions deploy`
  puis `npx remotion lambda sites create src/index.ts`.
- Les scripts `qa`, `critic` et `verdict` restent locaux (ou dans le conteneur) : Lambda ne fait que le rendu.
- Licence : vérifier sur https://www.remotion.dev/docs/license les conditions d'usage de Lambda pour votre effectif et votre usage.

## Ce qui ne change pas
Le verdict se calcule toujours avec `npm run qa` (final) puis `npm run verdict`, quel que soit l'endroit du rendu.
