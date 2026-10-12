# morph-continu

**En une phrase :** une seule forme qui ne coupe jamais : elle change de taille, d'arrondi et de couleur pour devenir chaque élément d'interface, pilotée par un curseur visible.
**Idéal pour :** teaser très « design », montrer 8 à 12 micro-fonctionnalités en 14 s, boucle parfaite pour les réseaux.
**Source :** pattern XML de @twoclipping, repris par des dizaines de créateurs (voir `../prompts/morph-continu-twoclipping.md`).

## Grammaire
- **Mise en page :** carré 1:1 natif (1440×1440 dans l'original), l'élément occupe toujours le centre ; la caméra zoome pour que chaque état remplisse le cadre.
- **Typographie :** une seule police (Poppins 500/600), contenu court à l'intérieur de la forme.
- **Couleur :** fond gris très clair `#ECECF4`, composants blancs et noir `#121624`, **un seul accent** `#3374FF`.
- **Mouvement :** ressorts très amortis, au plus un léger overshoot (`snappy`/`default`). Les deux bords d'un indicateur (onglet, interrupteur) suivent deux ressorts différents : le bord avant s'étire devant le bord arrière.
- **Caméra :** recadre en continu (pas de coupe), suit l'état actif.
- **Transitions :** la forme se transforme ; le contenu s'échange avec un court flou et des timings d'entrée/sortie séparés (sinon les textes se chevauchent).
- **Interaction :** un curseur réalise de vrais clics et glisser-déposer ; pendant un drag, la valeur dépend de la position du curseur ; au relâché, elle repart en ressort.
- **Son :** 120 BPM, 7 mesures = 28 temps ≈ 14 s, **un événement par temps** ; un son d'UI calé sur chaque action.
- **Boucle :** la dernière image = la première (position et vitesse du curseur comprises).

## Adaptation Nova (exemple d'états)
Bouton « Continuer » → loader → coche → pastille « 4 tâches » → carte d'onboarding → barre de progression qu'on fait glisser →
bouton « Signer » → signature tracée → onglets À faire / À venir / Terminé (indicateur liquide) → livret qui s'ouvre →
recherche ⌘K « salaire » → réponse du copilote → toast « Document déposé » → retour au bouton.

## Interdits spécifiques
Easing qui rebondit, particules, glow, dégradés sur l'UI, icônes de tailles différentes, temps morts, mise en page de template.

## Briques
Disponibles dans `src/components/style/Morph.tsx` : `shapeAt` + `MorphShape` (forme x, y, w, h, arrondi par ressorts),
`swap` (échange de contenu sortie-avant-entrée), `splitSpring` (indicateur à deux bords), `cursorAt` + `Cursor`
(position, clics). Les exemples RH sont des pistes illustratives à adapter au produit. Démonstration : composition `Briques`.
