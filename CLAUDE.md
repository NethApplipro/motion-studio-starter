@AGENTS.md

## Spécifique à Claude Code
- Le skill `motion-reel` est disponible via `.claude/skills` (lien vers `.agents/skills`). Sous Windows, si le lien
  symbolique n'est pas restauré par git, lire directement `.agents/skills/motion-reel/SKILL.md`.
- Effort : `high` pour construire un film, `medium` pour les retouches, `xhigh` pour une pièce phare.
- Après chaque rendu, déléguer la critique au sous-agent `motion-critic` (lecture seule) plutôt que de se noter soi-même :
  il écrit `review.json`, puis `npm run verdict` calcule le statut. Ne jamais recopier ni reformuler un verdict à la main.
- Pour faire tourner la boucle de correction sans intervention, utiliser la commande d'objectif de Claude Code si ta
  version la propose (ex. « /goal npm run qa -- Demo 9x16 --preflight affiche tous les compteurs à 0, 5 tours maximum »),
  en respectant la règle d'arrêt d'`AGENTS.md`.
