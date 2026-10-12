# camera-continue

**En une phrase :** un seul plan-séquence lent sur un bureau (ou un écran d'ordinateur), sans aucune coupe : la caméra pousse, recule et panoramique, avec un léger flou de mouvement et du grain.
**Idéal pour :** back-office RH (création d'un parcours d'onboarding, livret, entretiens), démo de 30 à 60 s, teaser du site.
**Source :** teaser HyperFrames de @jake11moran (voir `../sources.md`).

## Grammaire
- **Rythme :** mouvements de caméra de 1,5 à 3 s sur des courbes douces (ease-in-out), environ **deux fois plus lents** que le réflexe par défaut.
- **Cadre :** un seul espace continu (bureau macOS ou écran du back-office), les fenêtres arrivent et partent par la caméra.
- **Texture :** flou de mouvement sur les déplacements rapides, grain léger.
- **Curseur :** grand curseur macOS, gestes lents et précis.
- **Texte :** grandes lignes qui entrent mot à mot, puis se réduisent et se placent.
- **Son :** optionnel ; peut être muet avec sous-titres.

## Adaptation Nova
Captures `references/product-ui/BO_*` (back-office) recomposées en vraies fenêtres : la caméra part de l'éditeur de parcours
(`BO_03`), suit l'ajout d'une action de signature (`BO_04`), programme l'envoi (`BO_08`), puis traverse l'écran vers le
téléphone du salarié qui reçoit la tâche (`FO_50`).

## Interdits spécifiques
Coupes franches, mouvements secs, zooms rapides.

## Briques
Disponibles : `cameraAt` + `CameraRig` et `Window` (`src/components/style/Camera.tsx`, plans clés en ease-in-out), flou de
mouvement par sous-images `MotionBlur` (`src/components/style/MotionBlur.tsx`). Démonstration : composition `Briques`.
