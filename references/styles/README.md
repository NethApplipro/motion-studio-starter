# Bibliothèque de styles

Une fiche = une **direction artistique nommée** qu'on peut citer dans un brief (« style : morph-continu »).
Nommer un style est plus fiable que le décrire : la fiche fixe la grammaire (mise en page, typo, mouvement,
caméra, transitions, son) et les interdits, déjà traduits dans la charte Nova.

| Fiche | En une phrase | Idéal pour | Rythme |
|---|---|---|---|
| [`editorial-clair`](editorial-clair.md) | Fond clair, téléphone héros, sous-titres éditoriaux | Démo produit grand public, LinkedIn | posé (événement / 2-3 s) |
| [`morph-continu`](morph-continu.md) | Une seule forme qui ne coupe jamais et devient chaque écran, pilotée au curseur | Teaser « Dribbble », fonctionnalités UI | rapide (événement / temps) |
| [`scene-produit-sombre`](scene-produit-sombre.md) | Grande scène sombre arrondie au centre, ambiance de marque autour | Lancement premium, salon, keynote | moyen |
| [`lancement-tech`](lancement-tech.md) | Chaque transition démontre une fonction : flux, branches, données en mouvement | Copilote IA, intégrations SIRH, API | rapide |
| [`camera-continue`](camera-continue.md) | Un seul plan-séquence lent sur un bureau ou un écran, sans coupe | Back-office RH, démo longue, site web | lent (mouvements de 1,5 à 3 s) |
| [`recit-cinetique`](recit-cinetique.md) | Deux actes de couleur (problème sombre / solution claire), phrases mot par mot, mots géants, profondeur, démo qui se construit | Film de présentation 30–60 s, site, salon | rapide (événement / s) |
| [`affiche-cinetique`](affiche-cinetique.md) | Typographie géante qui claque sur le temps, slogans, aucun écran | Accroche réseaux, annonce, recrutement | très rapide |

## Comment s'en servir
1. Dans le brief, section `<direction>` : `Style : morph-continu` (+ ajustements éventuels).
2. Pour une pièce importante, demander **3 directions** (3 fiches différentes) en images fixes avant de construire
   (étape 3 du skill `motion-reel`). On choisit sur pièce, pas sur description.
3. Pour un look qui n'existe pas encore : `npm run ref -- ma-reference.mp4`, analyser, puis créer une nouvelle fiche
   en copiant `_modele.md`. La bibliothèque s'enrichit à chaque film.

Sources : voir [`../sources.md`](../sources.md) et [`../prompts/`](../prompts/).

Les exemples de scénarios sont illustratifs, hérités du studio source ; ils ne décrivent pas des fonctionnalités réelles de Nova. Remplacer les faits par ceux de votre brief.
