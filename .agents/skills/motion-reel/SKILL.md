---
name: motion-reel
description: Produire un film motion design pour votre marque (démo produit, annonce, post réseau, teaser) de l'idée au MP4 livré en 3 formats, avec directions artistiques comparées, étapes validées et boucle de critique. Utiliser dès qu'on demande une vidéo, une animation, un reel, un teaser ou une démo animée.
---

# motion-reel — pipeline de production

Lire `AGENTS.md` d'abord. Chaque étape a une **gate** : s'arrêter, montrer le résultat (images, tableau) et attendre la
validation avant de continuer, sauf si l'utilisateur a demandé un « run complet », le **mode express** ou une **ébauche**
(voir plus bas).

1. **Brief.** `npm run new-film -- <slug> "Titre"`. Remplir `films/<slug>/brief.md` (balises inputs / direction / structure /
   faits / start). Si la demande est trop courte, ne pas inventer : poser au maximum 5 questions ciblées (style ou référence,
   concept, texte de fin, durée et formats, écrans à montrer) en s'appuyant sur `docs/BRIEFER.md`. Séparer les faits produit des choix créatifs.
   **Gate : brief validé.**
2. **Référence.** Si une vidéo ou une image est fournie : `npm run ref -- <fichier>`, regarder `contact.jpg` et `rythme.jpg`,
   remplir `references/inbox/<nom>/analyse.md` (palette, typo, composition, rythme, mouvement, caméra, transitions, texture,
   son, à ne pas copier). Reprendre la grammaire visuelle, jamais le contenu. Si le look est réutilisable, créer une fiche
   dans `references/styles/` à partir de `_modele.md`.
3. **Trois directions.** Pour toute pièce destinée à être diffusée : proposer **3 directions vraiment différentes**
   (hiérarchie, typo, structure, langage de mouvement, pas seulement les couleurs), chacune adossée à une fiche de
   `references/styles/`. Pour chacune, construire 1 image clé du moment le plus important (composition temporaire dans
   `src/films/<slug>/`) et la rendre avec `npm run stills`. Présenter les 3 images côte à côte avec 2 lignes d'intention chacune.
   **Gate : une direction choisie** (ou un mélange explicite). Supprimer ensuite les compositions temporaires.
4. **Shot list.** `films/<slug>/shotlist.md` : temps forts calés sur 120 BPM (frames multiples de 15), texte exact à l'écran,
   écran de l'app montré (doit exister dans `references/product-ui/`), mouvement et son pour chaque plan.
   Écrire `style-guide.md` à partir de la fiche choisie. **Gate : shot list validée.**
5. **Construction.** Coder `timeline.ts` (toutes les frames et les sons), `schema.ts` (textes et réglages exposés dans le Studio),
   et la composition. Réutiliser `src/components/` et `src/lib/` ; ajouter les briques manquantes indiquées dans la fiche de
   style (en composants réutilisables, pas dans le film). Mise en page par format via une table `LAYOUT` et `useFormat()`.
6. **Stills.** `npm run check`, puis `npm run stills -- <Film> 9x16` et sur 1x1 et 16x9. Regarder chaque image : texte coupé,
   chevauchements, écrans vides, éléments hors cadre. Corriger. **Gate : images fixes validées.**
7. **Capteurs puis premier montage.** `npm run qa -- <Film> 9x16 --preflight` : boucle de correction jusqu'à zéro (le pire défaut à chaque
   tour, 5 tours maximum, arrêt si un tour ne progresse pas, cf. `AGENTS.md`). Puis `npm run render -- <Film> 9x16 --draft`
   et critique **par un regard séparé** (sous-agent `motion-critic` ou passe dédiée) avec `reviews/CRITIC.md` :
   corriger les 3 pires défauts, re-rendre. 3 passes au maximum. Les compteurs `saccade` et `densiteEvenements`
   du rapport QA signalent les mouvements cassés et les passages trop calmes : les traiter avant la critique.
8. **Son et formats.** Vérifier le calage des sons dans `timeline.ts`. `npm run render -- <Film>` (3 formats, qualité finale),
   puis `npm run qa -- <Film>` (contrôle aussi les MP4 : format, frames, son) jusqu'à zéro, `npm run critic` sur chacun.
9. **Livraison.** MP4 dans `out/` ; `reviews/<Film>-<format>/review.json` écrit par le critique, puis
   `npm run verdict -- <Film>` (calcule LIVRABLE / PILOTE INTERNE / À REPRENDRE selon la cible du brief et régénère
   `review.md`) ; `npm run review-page -- <Film>` pour la relecture humaine ; nouvelles lignes dans `reviews/JOURNAL.md`
   (un défaut vu deux fois → corriger le studio) ; commit des sources.
   Résumer à l'utilisateur le verdict calculé, ce qui est livré et ce qui reste à valider (musique sous licence, voix off).

## Mode express (post rapide, retouche, déclinaison)
Déclenché par « mode express », « vite fait » ou une demande de moins de 10 s sans enjeu de diffusion large.
1. **Brief minimal** : `npm run new-film`, remplir `brief.md` avec ce qui est donné ; au plus 2 questions si le texte de fin
   ou l'écran à montrer manque, sinon aucune. Cible `interne` par défaut.
2. **Une seule direction** : la fiche de style la plus proche, sans images comparées. Shot list en tableau dans `brief.md`.
3. **Construction** avec les briques existantes uniquement (`src/components/`, `src/components/style/`).
4. **Contrôles inchangés** : `npm run qa -- <Film> <format> --preflight` à zéro, `npm run render`, `npm run qa` final,
   critique séparée et `npm run verdict`. Le mode express supprime les gates, **jamais les contrôles**.
5. Montrer le MP4 et le verdict en une fois. Passer en pipeline complet si la cible devient `public`.

## Mode ébauche (valider une direction avant de tout construire)
Déclenché par « Étape : ébauche » dans le brief, ou par « ébauche », « première version », « premier jet ».
But : montrer vite une première version pour décider si la direction est la bonne. **Une ébauche n'est jamais diffusée.**
1. **Brief complet** (faits, textes exacts, écrans réels, style) avec la ligne `Étape : ébauche`. Le fond ne se brade pas :
   charte, écrans du catalogue, chiffres sourcés, aucun nom de client.
2. **Un seul format** : le format maître, premier de la ligne `Formats` du brief. Une seule direction, celle du brief.
3. **Contrôles réduits** : `npm run qa -- <Film> <format> --preflight` à zéro (textes coupés, trop petits, hors charte :
   quelques minutes), puis `npm run render -- <Film> <format> --draft`. On saute la QA finale, la critique, le verdict,
   le déterminisme et les tests visuels (le film n'est pas encore ajouté à `scripts/visual-targets.mjs`).
4. **Livrer** le MP4 `out/<Film>-<format>.draft.mp4` avec 3 à 5 images clés, et 3 questions de direction au plus.
   Ne jamais présenter l'ébauche comme validée : `npm run verdict` la refuse toujours.
5. Travailler sur une branche avec une PR en brouillon. La CI ne fait que le précontrôle du format maître d'une ébauche,
   même sur une PR prête.
6. **Passer en final** quand la direction est validée : `Étape : final` dans le brief, les autres formats, les tests
   visuels, puis le pipeline complet (étapes 5 à 9) avec tous les contrôles.

## Garde-fous
- Marquer avec `data-qa="caption"` ou `data-qa="text"` tout texte qui doit être lu, sinon les capteurs ne le voient pas.
- Ne jamais déclarer un contrôle réussi sans l'avoir exécuté.
- Ne jamais inventer d'écran, de fonctionnalité, de client, de logo tiers ni de chiffre.
- Ne jamais utiliser le nom ou le logo d'un client (ex. Eiffage) sans accord écrit : « votre entreprise » ou un prénom.
- Si un asset manque (logo SVG, capture d'écran, musique), le dire et s'arrêter plutôt que d'improviser.
