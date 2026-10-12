# recit-cinetique

**En une phrase :** récit produit en deux actes de couleur : le problème sur fond de marque sombre, la solution sur fond clair, avec des phrases écrites mot par mot, des mots-clés géants, de la profondeur et une démonstration qui se construit sous les yeux.
**Idéal pour :** film de présentation de 30 à 60 s (site, LinkedIn, salon, levée de fonds), lancement d'une offre.
**Référence :** film Trellis analysé dans `references/inbox/trellis/analyse.md` (niveau visé par le studio).

## Grammaire
- **Structure :** acte 1 problème (question au spectateur, chiffres qui s'emballent, tout s'accumule) → pivot (un mot géant, coupe) → logo → acte 2 solution (démonstration) → preuve (résultats réels) → logo + CTA cliqué.
- **Couleur :** acte 1 `#0E0E52` plein + grille fine à 4 % ; acte 2 `#F7F7FF`. Accent `#3374FF`. **Rouge `#CC2936` réservé aux badges d'alerte.**
- **Typographie :** Poppins. Phrases de 40 à 60 px qui entrent **mot par mot** (chaque mot : flou 12 px → 0, opacité 0,4 → 1, décalage 8 px → 0, ressort `snappy`, 3 frames entre deux mots). Mots-clés géants (200 à 320 px) qui entrent flous et se posent nets.
- **Profondeur :** 3 plans (avant flou 6–10 px, milieu net, arrière flou 4–6 px), parallaxe, caméra qui pousse/recule (`track` preset `heavy`).
- **Flou de mouvement :** sur tout déplacement rapide (rendu en sous-images).
- **Démonstration :** liste numérotée à gauche, workflow à droite qui s'assemble carte par carte (connecteurs verticaux qui se dessinent), synchronisés.
- **Preuve :** 3 puces ✓ autour d'une phrase courte, uniquement des chiffres réels.
- **Clôture :** logo, bouton CTA, curseur qui clique.
- **Son :** musique rythmée sous licence, impacts sur chaque mot géant et chaque chiffre, whoosh sur les mouvements de caméra.

## Exemple Nova (45 s)
Acte 1 : « Combien de nouveaux salariés accueillez-vous cette année ? » → mails, PDF et messages qui volent en profondeur →
compteur 3 → 12 → 40 → tout tombe dans un dossier, badge rouge qui grimpe → « Et combien se sentent attendus le premier jour ? » →
« … » → « Stop. » → logo Nova.
Acte 2 : « Le point d'entrée du salarié » + app en perspective → « Un nouveau salarié **arrive lundi** » → liste à gauche
(1. Il reçoit son parcours · 2. Il dépose ses documents · 3. Il signe son contrat · 4. Il pose sa question au copilote) +
workflow du back-office qui se construit à droite → mots géants « parcours / documents / réponses » avec écrans → téléphone,
ordinateur RH et tablette reliés → « 100 000+ collaborateurs accompagnés » → logo + « Demander une démo » cliqué.

## Interdits spécifiques
KPI inventés, argot, plus d'une couleur d'accent hors badges, coupes franches en dehors du pivot.

## Briques
- Disponibles : `KineticText` (phrase mot par mot, `Kinetic.tsx`), `SlamWord` (mot géant), `cameraAt`/`CameraRig`
  (`Camera.tsx`), `Cursor` (`Morph.tsx`), `MotionBlur`. Démonstration : composition `Briques`.
- Encore à créer : `DepthLayer` (flou de profondeur), `Counter` + `Badge`, `FlyingCard` (trajectoire 3D + chute dans un
  dossier), `WorkflowBuilder` (liste + cartes connectées), `OrbitRing`, `PerspectiveScreen` (écran incliné en 3D).
