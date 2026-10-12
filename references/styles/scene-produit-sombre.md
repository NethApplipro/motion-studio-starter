# scene-produit-sombre

**En une phrase :** un film produit premium joué à l'intérieur d'une grande scène presque noire aux coins arrondis, posée sur une ambiance de marque.
**Idéal pour :** lancement de fonctionnalité, écran de salon, ouverture de keynote, vidéo de levée de fonds.
**Source :** film « Spotify » de @brainextends (voir `../sources.md`), adapté.

## Grammaire
- **Mise en page :** la scène occupe ~80 % de la largeur et ~75 % de la hauteur, centrée, légèrement sous le centre ; beaucoup d'espace négatif à l'intérieur.
- **Fond extérieur :** ambiance du dégradé Nova : `#3374FF` lumineux en haut à gauche → `#0E0E52` sur les côtés → presque noir en bas.
- **Intérieur :** fond `#121624`, texte principal blanc, secondaire gris `#9B9DA7`, accent `#3374FF` pour les contrôles et l'emphase.
- **Typographie :** Poppins, tailles de « publicité produit » (pas de titres de présentation énormes), compositions compactes.
- **Mouvement :** `default`/`heavy`, ombres retenues, aucun glow.
- **Son :** pulsation sobre, impacts synchronisés sur les transitions, résolution finale.

## Interdits spécifiques
Légende hors de la scène, watermark, compteur de progression, pied de page décoratif.

## Briques
À créer : `Stage` (scène arrondie + fond d'ambiance). Les écrans de l'app passent en variante sombre dans la scène.
