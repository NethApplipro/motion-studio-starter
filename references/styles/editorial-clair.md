# editorial-clair (style du film pilote « Premier jour »)

**En une phrase :** fond clair, un téléphone héros qui ne quitte jamais l'écran, des sous-titres éditoriaux qui racontent.
**Idéal pour :** démo produit lisible par tous, LinkedIn, site.
**Référence dans le studio :** `src/films/premier-jour/` (rendu : 7,9/10 en passe 2).

## Grammaire
- **Mise en page :** sous-titre en haut à gauche (9:16) ou à gauche (16:9) ; téléphone grand (×1,95 en 9:16) qui déborde en bas.
- **Typographie :** sous-titres Poppins 600, 76 px en 1080, interlettrage -3,5 % ; un mot-clé peut passer en bleu (`**mot**`).
- **Couleur :** fond `#F7F7FF`, texte `#0E0E52`, accent `#3374FF` dans l'UI seulement ; dégradé de marque pour la clôture.
- **Mouvement :** téléphone en `heavy` (poids), micro-UI en `snappy`, aucun rebond.
- **Caméra :** quasi fixe ; léger push-in (×1,035) sur le moment clé.
- **Transitions :** écrans qui glissent dans le téléphone (push horizontal), tap visible avant chaque action.
- **Son :** nappe à 120 BPM, ticks montants sur les validations, chime sur le logo.

## Concept-dispositif
Le problème (chaos de mails/PDF) est **aspiré** dans le téléphone, puis l'app le résout écran par écran.

## Interdits spécifiques
Plus de 3 écrans d'app en 15 s ; sous-titres de plus de 8 mots.

## Briques
`Phone`, `Tap`, `Captions`, `ChaosCard`, `HomeScreen`, `OnboardingScreen`, `CopilotScreen`, `Logo`.
