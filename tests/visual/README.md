# Références visuelles

Les images de l'ancien studio ont été supprimées : elles représentaient les films et interfaces Applipro.
Les cibles du starter sont dans `scripts/visual-targets.mjs` : Demo (trois formats), Briques et Ecrans.

Créer les premières références avec le workflow GitHub « Références visuelles » ; il rend les images sur Linux avec le navigateur installé par `npm run setup`, les committe, puis lance la qualité motion. Regarder les images avant d'approuver une modification. Utiliser le même environnement pour les comparaisons futures.

Une référence absente fait échouer le test normal. `npm run visual -- --update` est le seul moyen explicite de créer/remplacer les références ; ne jamais s'en servir pour cacher une régression. Un écart d'anticrénelage entre macOS et Linux peut demander une comparaison dans la CI.
