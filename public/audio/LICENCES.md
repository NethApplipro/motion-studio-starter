# Sons et musiques : origine et droits

Tout fichier audio de `public/` doit figurer ici avant une diffusion publique (cible `public`).

| Fichier | Origine | Droits | Diffusion publique |
|---|---|---|---|
| `bed.wav` | Synthèse maison (`scripts/sfx.mjs`), 120 BPM | Création du studio | Oui, mais nappe provisoire : à remplacer par une musique sous licence pour une pièce phare |
| `click.wav`, `pop.wav`, `pop-2.wav`, `tick-*.wav`, `thump.wav`, `whoosh.wav`, `swish.wav`, `chime.wav` | Synthèse maison (`scripts/sfx.mjs`) | Création du studio | Oui |

## Ajouter une musique sous licence
1. Copier le fichier dans `public/audio/` et ajouter une ligne ici (titre, auteur, plateforme, n° ou lien de licence, usages couverts).
2. `npm run beats -- public/audio/<fichier>` : grille des temps → `<fichier>.beats.json`.
3. Dans `timeline.ts`, caler les événements avec `musicBeat(grille, n)` (`src/lib/music.ts`) au lieu de `beat(n)`.

## Voix off
`npm run voice -- <slug>` (ElevenLabs) : consigner ici la voix utilisée et le plan ElevenLabs (l'usage commercial dépend du plan).
