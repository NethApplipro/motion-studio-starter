# affiche-cinetique

**En une phrase :** une affiche de rue qui bouge : typographie géante qui claque sur chaque temps, slogans courts dans un ordre verrouillé, aucun écran d'app.
**Idéal pour :** accroche de 6 à 20 s pour les réseaux, annonce d'événement, recrutement, campagne « marque ».
**Source :** bumper TechHalla (voir `../sources.md`), transposé dans la charte.

## Grammaire
- **Système typographique :** Poppins 700 pour les slogans géants (1 à 4 mots, interlettrage -4 à -8 %),
  Poppins 500 pour les lignes secondaires empilées, Poppins 400 en petit pour les « miettes » (étiquettes ≤ 18 caractères).
- **Palette stricte :** `#0E0E52` (fond), `#3374FF` (impact), blanc `#F7F7FF` (texte lisible) — aucune autre teinte.
- **Mouvement :** entrées qui claquent par en dessous avec un léger overshoot (`playful` assumé sur les impacts seulement), traînée sur l'impact, stabilisation nette.
- **Structure :** messages dans un ordre verrouillé, un par temps fort ; ouverture à froid en moins de 2,5 s.
- **Boucle :** la dernière image = la première.

## Exemple Nova
« TROIS MAILS. » → « DEUX PDF. » → « ET “TU VERRAS LUNDI” ? » → « NON. » → « APPLIPRO » → « example.com ».

## Interdits spécifiques
Polices script, dégradés, plus de 4 mots par slogan, slogans adoucis ou ajoutés.

## Briques
Disponibles dans `src/components/style/Kinetic.tsx` : `KineticText` (phrase mot à mot sous masque, `**mot**` = accent) et `SlamWord` (mot géant qui claque sur le temps). Démonstration : composition `Briques`.
