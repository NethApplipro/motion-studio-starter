# Studio motion Nova — instructions pour les agents (Codex, Claude Code, Cursor…)

Ce dépôt fabrique des films personnalisables **en code** (Remotion + React) : l'agent écrit le programme,
le programme dessine chaque image, le moteur de rendu en fait un MP4, la boucle de critique décide s'il sort.
Ce fichier est la source unique des règles. `CLAUDE.md` l'importe.

## Pour toute demande de vidéo
Lire et suivre **`.agents/skills/motion-reel/SKILL.md`** (pipeline en 9 étapes avec validations, ou **mode express**
pour un post rapide : moins de gates, mêmes contrôles ; ou **ébauche** pour valider une direction : `Étape : ébauche`
dans le brief, un seul format, précontrôle et rendu `--draft`, jamais diffusée ni soumise au verdict).
Avant de proposer une direction artistique, lire **`references/styles/README.md`** (bibliothèque de styles nommés).
Un brief faible se renforce avec **`docs/BRIEFER.md`**.

## Installation et commandes
Node 20+ (22 recommandé, voir `.nvmrc`). ffmpeg complet recommandé, pas obligatoire.
```bash
npm install && npm run setup        # navigateur headless + sons
npm run check                       # types + une image rendue par composition (à lancer avant chaque commit)
npm run studio                      # aperçu interactif, réglages modifiables dans « Props »
npm run new-film -- <slug> "Titre"  # crée films/<slug>/ + src/films/<slug>/ et l'enregistre
npm run stills -- <Film> <format> [frames…]   # images de contrôle → reviews/<Film>/<format>/
npm run render -- <Film> [formats…] [--draft] # MP4 → out/ (H.264 CRF 16, son selon le mode du brief)
npm run qa -- <Film> [formats…] [--loop]  # capteurs automatiques, doivent tous être à 0
npm run critic -- out/<Film>-<format>.mp4     # planches, traînées (motion.jpg), courbes (activite.svg, vitesses.svg)
npm run verdict -- <Film> [formats…]          # verdict CALCULÉ depuis qa.json + review.json, régénère review.md
npm run review-page -- <Film> [--import=f]    # page de relecture humaine (formats côte à côte, commentaires horodatés)
npm run visual [-- --update]                  # tests visuels de régression (tests/visual/baseline/)
npm run beats -- <musique>                    # grille des temps d'une musique sous licence → <musique>.beats.json
npm run voice -- <slug> [--essai]             # voix off ElevenLabs + minutage mot à mot (films/<slug>/voix.json)
npm run eval -- <slug>                        # contrôles automatiques du pipeline (évals du skill, evals/)
npm run determinism -- <Film>-<format> [frame]
npm run ref -- <vidéo|image> [nom]  # prépare l'analyse d'une référence → references/inbox/<nom>/
npm run sfx                         # régénère les sons de synthèse
npm run icons                       # régénère les icônes Remix (liste dans scripts/build-icons.mjs)
```
Formats : `9x16` (1080×1920), `1x1` (1080×1080), `16x9` (1920×1080). Ids : `<Film>-<format>`, ex. `Demo-9x16`.

### Environnement cloud (Codex cloud, CI)
Script de setup : `npm ci && npm run setup`. Ajouter `apt-get install -y ffmpeg` si l'image le permet (sinon le
ffmpeg embarqué par Remotion rend et normalise le son, mais ne génère pas les planches). Si le téléchargement du
navigateur est bloqué, définir `REMOTION_BROWSER` (ou `CHROME_PATH`) vers un Chrome/Chromium local.
Vérifier son travail avec `npm run check`, puis `npm run stills` et regarder les images produites.
CI (`.github/workflows/motion-quality.yml`) : seuls les films touchés par la PR sont contrôlés (`scripts/ci-plan.mjs` ;
le code partagé relance tous les films, la doc seule aucun). PR en brouillon → précontrôle ; PR prête ou lancement
manuel → rendu, QA finale, déterminisme et verdict. `npm run qa` rend plusieurs images en parallèle (`--jobs=N`).
Références des tests visuels : toujours rendues par la CI (`.github/workflows/visual-references.yml`, lancement manuel ou
commit contenant `[maj-references-visuelles]`), jamais depuis un autre navigateur ; regarder ce qui change avant d'accepter.

## Organisation
| Chemin | Rôle |
|---|---|
| `brand/brand.json` | Seule source de la charte : Poppins, palette officielle, dégradé, baseline. Jamais de couleur en dur ailleurs. |
| `brand/logo-mark.svg`, `src/components/Logo.tsx` | Symbole fictif configurable (`logoPath`), animable avec `draw`. |
| `references/product-ui/` | Captures autorisées de votre produit. La maquette initiale est explicitement fictive. |
| `references/styles/` | Fiches de style nommées (grammaire de mouvement, typo, caméra, interdits). |
| `references/prompts/` | Prompts de films réels annotés (sources créditées). |
| `references/sources.md` | D'où vient chaque règle du studio. |
| `films/<film>/` | `brief.md`, `style-guide.md`, `shotlist.md` : écrits et validés AVANT le code. |
| `src/films/<film>/` | `timeline.ts` (toutes les frames et les sons), `schema.ts` (réglages zod), composition. |
| `src/films/registry.ts` | Registre des films (mis à jour par `new-film`). |
| `src/components/` | Téléphone, tap, sous-titres, logo, cartes, voix off (`Voice.tsx`), écrans de l'app (`app/`). |
| `src/components/app/catalog.ts` | Catalogue des écrans redessinés : capture d'origine + états animables. Tout écran montré y figure. |
| `src/components/style/` | Briques des styles : `Morph.tsx` (forme, curseur, indicateur à deux bords), `Kinetic.tsx` (mot à mot, mot qui claque), `Camera.tsx` (plan-séquence, fenêtre), `MotionBlur.tsx` (flou de mouvement). |
| `src/studio/` | Compositions de référence du dossier « Studio » : `Ecrans` (catalogue) et `Briques` (démonstration des briques). |
| `tests/visual/baseline/` | Images de référence des tests visuels (cibles dans `scripts/visual-targets.mjs`). |
| `public/audio/LICENCES.md` | Origine et droits de chaque son ; obligatoire avant une diffusion publique. |
| `evals/` | Briefs d'évaluation du skill et journal des résultats. |
| `docs/RENDU-DISTRIBUE.md`, `Dockerfile` | Rendre sur un serveur (Hetzner/Coolify) ou sur AWS Lambda. |
| `src/lib/` | `motion.ts` (sp, track, presets, mulberry32, BEAT), `music.ts` (musicBeat), `format.ts` (useFormat), `brand.ts`, `fonts.ts`. |
| `scripts/` | Outils en Node, multiplateformes. `lib.mjs` = navigateur, ffmpeg, bundle. |
| `reviews/` | `CRITIC.md` (grille), `JOURNAL.md` (mémoire des défauts), `qa.md` et `review.md` par rendu. Les images générées ne sont pas versionnées. |
| `src/components/QAProbe.tsx` | Capteur QA (mesures dans le navigateur pendant `npm run qa`). |

## Règles de rendu (non négociables)
- Chaque image est une **fonction pure du temps** (`useCurrentFrame`). Interdit : transitions CSS, `setTimeout`, `requestAnimationFrame`, `Math.random()`, `Date`, état React qui évolue entre deux frames.
- Aléatoire : `mulberry32(seed)` uniquement.
- Mouvement : `sp()` / `track()` avec les presets `snappy`, `default`, `heavy`, `playful`. `track()` additionne un ressort par changement de cible : toute frame se calcule directement.
- Polices et sons servis depuis `public/`. Aucun appel réseau pendant le rendu.
- Les 3 formats sont **recomposés** via `useFormat()` (table `LAYOUT` par format), jamais recadrés.
- Toute la chronologie d'un film vit dans `timeline.ts`. La grille de 120 BPM (1 temps = 15 frames à 30 fps) est un **repère** :
  les textes et les actions importantes peuvent respirer hors de la grille ; rien n'impose des coupes sur chaque temps.
  Avec une musique sous licence : `npm run beats`, puis `musicBeat(grille, n)` au lieu de `beat(n)`.
- Déplacement de plus d'un quart du cadre en une frame : `<MotionBlur render={(f) => …}>`, positions calculées depuis `f`.
- Un nouvel écran se dessine d'après sa capture et s'ajoute au catalogue (`src/components/app/catalog.ts`) avant d'être filmé.
- Un nouveau film s'ajoute aux tests visuels (`scripts/visual-targets.mjs`, 3 à 5 frames) ; un changement visuel voulu se
  valide en regardant `tests/visual/diff/`, puis en régénérant les références dans la CI. Une référence absente fait
  échouer `npm run visual` : elle n'est jamais créée en silence.
- Ne jamais mettre `will-change` sur un élément que la caméra agrandit (texte flou).

## Règles de style
- Charte : Poppins · accent unique `#3374FF` · texte `#0E0E52` · fond `#F7F7FF` · icônes Remix · dégradé de marque réservé aux moments forts (clôture, révélation).
- Interdits par défaut (« look IA ») : titre centré sur un dégradé dès l'ouverture, fondus enchaînés partout, glow, particules gratuites, labels dans les coins, plusieurs couleurs d'accent, tout qui apparaît en même temps, dashboards génériques, texte minuscule.
- Un événement visible toutes les 2 à 4 s (ou sur chaque temps pour un style rapide). Pas de temps mort.
- Chaque transition **montre une fonctionnalité** (l'état A devient l'état B) au lieu de remplacer une carte par une autre.
- Texte lisible à 360 px de large : sous-titres de 58 px minimum en 1080.
- Chiffres et affirmations : uniquement depuis des sources produit vérifiables (brief). Jamais de nom ni de logo client sans accord écrit.

## Capteurs automatiques (`npm run qa`)
Un film ne sort que si **tous les compteurs de la validation finale sont à zéro** (`reviews/<Film>-<format>/qa.md`, code de sortie 1 sinon ;
le précontrôle `--preflight` écrit `preflight.md` et ne valide jamais une livraison) :
erreurs · texteHorsCadre · texteHorsZoneSure · texteTropPetit · chevauchement · couleurHorsCharte · tempsMort ·
densiteEvenements · saccade · nonDeterministe · boucle (avec `--loop`) · fichierVideo (H.264, yuv420p bt709, AAC, 30 fps,
nombre exact de frames, piste audio selon le mode) · loudness (selon le mode).
- `densiteEvenements` : plage où rien de visible ne change plus longtemps que `maxGapSeconds` (4 s par défaut,
  réglable par film dans `films/<slug>/qa.json`, ex. 2 s pour morph-continu).
- `saccade` : élément suivi qui saute (plus d'un quart du petit côté en une frame sans flou) ou s'arrête net.
  Contrôlé seulement sur des frames consécutives (validation finale, ou `--preflight --step=1`).
- Marquer les éléments clés `data-motion="nom"` (téléphone, cartes, forme, curseur) ; les textes `data-qa` sont suivis d'office.
- **Son** (`scripts/audio-mode.mjs`), déclaré dans le brief : `Son : silencieux` (aucune piste audio ; son sans objet),
  `Son : effets` (effets ponctuels à niveau fixé dans `timeline.ts`, aucune normalisation de volume moyen, crête ≤ -1 dBTP),
  `Son : mix` (musique et/ou voix, normalisée sur `Volume cible : -14 LUFS` du brief, -14 par défaut). Sans ligne `Son`, mode mix.
  Le film doit rester compréhensible sans son dans tous les cas.
- **Temps de lecture** (avertissement, jamais bloquant) : chaque texte `caption`/`text` doit rester lisible (opacité ≥ 0,9)
  au moins 1,5 s + 0,3 s par mot, mots des autres textes visibles compris. Repère indicatif à juger au visionnage ;
  les dépassements sont listés dans `qa.md` (section « Avertissements »), pas comptés dans les défauts.
- Les mesures viennent de `src/components/QAProbe.tsx`, qui enveloppe chaque film (sans effet sur l'image).
- **Marquer les textes qui doivent être lus** : `data-qa="caption"` (sous-titres, titres : ≥ 58 px en 1080),
  `data-qa="text"` (autres textes importants : ≥ 30 px) ou `data-qa="ui"` (texte d'écran d'app qui porte un fait du
  brief, un état ou une consigne : ≥ 24 px, sans contrainte de zone sûre). Les textes purement décoratifs ne sont pas marqués.
- Zone sûre : 9:16 → 220 px en haut, 420 px en bas, 150 px à droite (interface TikTok/Reels/Shorts), 60 px à gauche ;
  autres formats → 4 % de chaque côté.
- Chaque défaut du rapport donne la frame, la preuve et la consigne de correction.

## Verdict (calculé, jamais déclaré)
`npm run verdict -- <Film>` lit `qa.json` (QA finale) et `review.json` (notes du critique) et décide :
**LIVRABLE** (QA à zéro, moyenne ≥ 8, aucun critère < 7 : diffusion publique) · **PILOTE INTERNE** (QA à zéro,
moyenne ≥ 7,5, aucun critère < 7 : usage interne seulement) · **À REPRENDRE**. La cible (`public` / `interne`) vient du
brief (`films/<slug>/brief.md`, ligne « Cible ») et fait foi : une critique qui annonce une autre cible est refusée.
Le rapport technique doit porter sur ce rendu (`qa.json` → `id`) et sur le MP4 actuel (`qa.json` → `videoSha256`) :
un rapport d'un autre film ou d'une vidéo modifiée depuis ne valide rien. Cible `public` : chaque format visionné et LIVRABLE. `review.md` est généré : ne jamais l'écrire à la main.

## Boucle de correction (objectif + règle d'arrêt)
Objectif : `npm run qa` (validation finale) à zéro sur les 3 formats **et** `npm run verdict` accepté pour la cible du brief.
Pendant le travail, chaque tour utilise le précontrôle rapide : lire `preflight.md`, corriger **le défaut le plus grave**,
relancer `npm run qa -- <Film> <format> --preflight`. Une fois à zéro : `npm run render`, puis `npm run qa -- <Film>` (toutes les frames, MP4).
Exception : un film en ébauche (`Étape : ébauche` dans le brief) vise seulement le précontrôle à zéro sur son format
maître ; `npm run verdict` le refuse toujours, et il repasse en `Étape : final` avant toute livraison.
Arrêt : objectif atteint · 5 tours · ou un tour sans progrès (même défaut, même compteur) → s'arrêter et expliquer le blocage.
Ne jamais déclarer réussi un contrôle qui n'a pas été exécuté. Un rendu n'est pas une validation.

## Fabricant et vérificateur séparés (rôles des agents)
Celui qui fabrique ne se note pas. Répartition recommandée :
| Rôle | Agent | Comment |
|---|---|---|
| Fabriquer (brief → MP4) | Claude Code | skill `motion-reel`, regarde les stills et planches pour juger la composition |
| Critiquer chaque rendu | sous-agent `motion-critic` | lecture seule, écrit `review.json`, puis `npm run verdict` |
| Relire le code de chaque PR | Codex | workflow `.github/workflows/codex-review.yml` (secret `OPENAI_API_KEY`), consignes `.github/codex/prompts/review.md` |
| Visionner et commenter | humain | `npm run review-page`, commentaires importés dans `review.json` |
Les rôles s'inversent sans problème (Codex fabrique, Claude relit) : la règle est seulement que fabricant et
vérificateur soient deux sessions distinctes.

## Journal (`reviews/JOURNAL.md`)
Chaque défaut trouvé y est consigné (date, cause, correction du film, correction du studio).
**Un défaut qui revient deux fois se corrige dans le studio** (règle, capteur ou brique), pas seulement dans le film.

## Boucle qualité (résumé)
`stills` → regarder → corriger → `qa --preflight` (zéro) → `render --draft` → `critic` + note `CRITIC.md` → corriger les 3 pires défauts →
re-rendre. Livrable si qa = 0 et moyenne ≥ 8 sans critère < 7. Consigner dans `reviews/<id>/review.md` et `JOURNAL.md`.
Terminer par `npm test`, `npm run check`, `npm run render`, `npm run qa` (final), `npm run determinism`, `npm run visual`
et `npm run verdict`.

## Git
Committer les sources, jamais `out/`. Messages de commit en français, au présent (« Ajouter le film coffre-fort »).

## Licence et secrets
Remotion possède sa propre licence : vérifier les conditions applicables à votre usage (https://www.remotion.dev/docs/license).
Clés API (ElevenLabs…) dans `.env`, jamais dans un prompt ni dans git. Musiques et voix : consigner l'origine et la
licence dans `public/audio/LICENCES.md` avant toute diffusion publique.

## Précontrôle et validation finale
`npm run qa -- <Film> --preflight [--step=N]` sert à corriger les compositions avant le MP4.
Il écrit `preflight.md/json`, ignore explicitement vidéo et son et ne valide aucune livraison.
`npm run qa -- <Film>` exige les MP4 et contrôle toutes les frames. Les rapports finaux restent `qa.md/json`.
Lancer `npm test` après toute modification des contrôles. Un contrôle non exécuté apparaît « non contrôlé ».

## Adaptation du starter
La marque Nova et les écrans de démonstration sont fictifs. Modifier `brand/brand.json`, remplacer les écrans et écrire un brief avant un film client. Ne jamais réutiliser des notes de critique comme preuve pour un nouveau rendu. Pour les changements techniques du starter : tests + types + rendu de contrôle ; le verdict artistique reste réservé aux films destinés à être livrés. La démo reste une ébauche. La préparation des références visuelles est décrite dans `tests/visual/README.md` ; les régénérer et les examiner dans votre CI avant de changer de navigateur.
