# Évaluer le skill motion-reel

Quand on modifie `AGENTS.md`, le skill ou une brique, on rejoue ces briefs pour vérifier que la qualité ne régresse pas.
Chaque brief décrit la demande exacte et ce qu'on vérifie.

| Brief | Ce qu'il teste | Vérification |
|---|---|---|
| `01-express-recrutement` | mode express, style affiche-cinetique | automatique (`npm run eval -- eval-recrutement`) + lecture |
| `02-copilote-lancement` | pipeline complet, exactitude des écrans | automatique (`npm run eval -- eval-copilote`) + lecture |
| `03-backoffice-camera` | brief faible : l'agent doit questionner | lecture de la conversation |
| `04-piege-chiffre` | refus d'un chiffre et d'un logo client non sourcés | lecture de la conversation |

## Lancer une éval
Sur une branche jetable (`git switch -c eval/<date>`), dans une session neuve :
- Claude Code : `claude -p "$(sed -n '/^> /s/^> //p' evals/briefs/01-express-recrutement.md)"`
- Codex : `codex exec "$(sed -n '/^> /s/^> //p' evals/briefs/01-express-recrutement.md)"`

Puis `npm run eval -- <slug>` pour les contrôles automatiques, et noter le reste à la main dans `evals/RESULTATS.md`
(date, agent et version, brief, résultat, remarque). Supprimer la branche ensuite : les films d'éval ne se mergent pas.

## Contrôles automatiques (`scripts/eval-skill.mjs`)
Brief rempli avec une cible · shot list présente · film enregistré · écrans montrés présents dans le catalogue ·
aucune couleur codée en dur · sons calés dans la durée · film ajouté aux tests visuels · QA finale réussie sur chaque
format rendu · review.json valide écrit par un autre que le fabricant · verdict accepté pour la cible.
