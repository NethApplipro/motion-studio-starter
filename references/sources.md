# D'où vient chaque règle du studio

Relevé à partir des 11 posts X envoyés le 05–06/10/2026 et des dépôts qu'ils citent. ✅ = intégré, ◐ = partiel, ✗ = non utilisé.

## Posts X
| # | Source | Ce qui en a été tiré | Où c'est dans le studio | |
|---|---|---|---|---|
| 1 | @0xMovez — « How to build motion design studio with Opus 5.5 » | « Le prompt pèse 10 %, l'environnement 90 % ». Rendu en fonction pure du temps, aléatoire seedé (mulberry32), H.264 CRF 16, looks bannis, une seule couleur d'accent, un événement toutes les 2–4 s, son synthétisé calé sur une grille de temps à -14 LUFS, boucle d'autocritique (planche contact, notes, corriger les 3 pires défauts jusqu'à 8+), presets de ressort snappy/default/heavy/playful, `track()` qui additionne un ressort par cible, tests ffmpeg (planche, 360 px, boucle, déterminisme), empaquetage en skill `motion-reel` | `AGENTS.md`, `src/lib/motion.ts`, `scripts/sfx.mjs`, `scripts/critic.mjs`, `scripts/determinism.mjs`, `reviews/CRITIC.md`, `.agents/skills/motion-reel/` | ✅ |
| 2 | @tobiadonadon_ — « Stop making your web apps look like AI slop » | Processus de designer : explorer **3 directions vraiment différentes**, comparer, rejeter, puis construire ; le texte s'écrit avec la mise en page (pas de lorem ipsum) ; détection des patterns génériques | Étape « 3 directions » du skill, interdits « look IA » dans `AGENTS.md` | ✅ |
| 3 | @dravenip — guide complet Claude Code | CLAUDE.md court et ciblé, plan avant exécution, donner à l'agent un moyen de vérifier son travail, Git obligatoire | `AGENTS.md` (court), `npm run check`, gates du skill | ◐ |
| 4 | @bloggersarvesh — SEO local avec ChatGPT Astra | Hors sujet motion | — | ✗ |
| 5 | @p4nthera_ — galerie prompt-motion.com | 226 vidéos Opus 5.5 avec leurs prompts. Site bloqué depuis l'environnement de construction : à consulter à la main pour alimenter `styles/` | À faire : ajouter des fiches à partir de la galerie | ◐ |
| 6 | @eng_khairallah1 — équipe d'agents avec Opus 5.5 | Orchestrateur + spécialistes + critique en lecture seule, plafonds de budget | Idée pour plus tard (un agent « critique » séparé) | ✗ |
| 7 | @0xwhrrari — « Motion Engineering » | 5 couches DIRECTOR / REFERENCE / TIMELINE / RENDERER / CRITIC ; brief qui sépare faits produit et choix créatifs ; histoire en beats et en états d'UI ; exigence de « seekabilité » ; formats **recomposés, pas recadrés** ; 6 gates de validation ; arborescence brief / style-guide / shotlist / reviews / out | `films/_template/`, `src/lib/format.ts` (LAYOUT par format), gates du skill, `references/styles/_modele.md` | ✅ |
| 8 | @viktoroddy — motionsites.ai | Bibliothèque de prompts de sites web animés (web design, pas vidéo) | — | ✗ |
| 9 | @neropursue — dépôt de 475+ démos Opus 5.5 avec prompts | Corpus de prompts réels : lu et exploité (513 entrées, licence MIT) | `references/prompts/`, fiches `morph-continu` et `lancement-tech` | ✅ |
| 10 | @0xCodila — « How to get money for creating motion design » | Route Remotion, trio brief / style-guide / storyboard, histoire de 15 s en 4 temps, ressort mass 1 / stiffness 180 / damping 22, son synthétisé, vérification durée/dimensions/fps/audio, version verticale recomposée, skill `motion-reel`, licence Remotion | Choix de Remotion, preset `default`, film pilote, `README.md` | ✅ |
| 11 | @triptitips — 8 sites d'inspiration design (navbar.gallery, 60fps.design…) | Inspiration de micro-interactions (60fps.design) | À consulter pour la fiche `morph-continu` | ◐ |
| PDF | Capture « How to Build AI Motion Design Studio » (@0xCodila, d'après Nate Parrott) | Les décisions visuelles deviennent des **réglages modifiables** (curseurs) ; un seul moteur pour l'aperçu et l'export | Schémas zod → panneau « Props » de `npm run studio` | ✅ |

## Dépôts GitHub lus (via les posts 1 et 9)
| Dépôt | Apport | Où |
|---|---|---|
| [yihui-dev/awesome-opus5-5-videos](https://github.com/yihui-dev/awesome-opus5-5-videos) (MIT) | 513 prompts réels ; les plus détaillés sur des films produit ont servi aux fiches de style | `references/prompts/`, `references/styles/` |
| [buildwithhanif/claude-animation-skill](https://github.com/buildwithhanif/claude-animation-skill) (MIT) | « Une bible de détails » (base → texture → bord pour chaque surface), test de déterminisme dans le désordre, rendu par étapes qui n'écrase jamais un bon fichier | `scripts/determinism.mjs`, `render-all.mjs` (fichier temporaire) |
| [JohnHeibel/ClaudeAnimationBase](https://github.com/JohnHeibel/ClaudeAnimationBase) | Storyboard avant code, planches contact pour s'autocorriger, le niveau de raisonnement règle le degré de détail | Gates du skill, conseil d'effort dans `CLAUDE.md` |
| [heygen-com/hyperframes](https://github.com/heygen-com/hyperframes) | Alternative à Remotion (HTML → vidéo) ; non retenue pour garder un seul moteur | — | — |

## Films cités dans les fiches de style
- `scene-produit-sombre` : film « Spotify » de @brainextends (corpus MIT, fiche `brainextends-606193`).
- `camera-continue` : teaser HyperFrames de @jake11moran (fiche `jake11moran-414633`).
- `affiche-cinetique` : bumper TechHalla (fiche `techhalla-498547`).

## Références vidéo analysées
| Référence | Apport | Où |
|---|---|---|
| Film produit Trellis (MP4 fourni le 09/10/2026, 63 s) | Niveau visé : récit en 2 actes de couleur, phrases mot par mot, mots géants, profondeur et flou de mouvement, démo qui se construit, 3 coupes seulement | `references/inbox/trellis/analyse.md`, `references/styles/recit-cinetique.md` |

## Contributions d'agents
| Date | Agent | Apport |
|---|---|---|
| 2026-10-09 | Codex (branche `codex/fiabiliser-studio-motion`, fusionnée) | Précontrôle `--preflight` séparé de la validation finale, MP4 obligatoire et contrôlé en JSON (BT.709, frames décodées), tests `npm test`, CI GitHub sur les 3 formats, marge sonore -1,5 dBTP avant AAC, durée du flux vidéo dans `critic` |
