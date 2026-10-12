# Comment briefer pour obtenir un film moderne (et pas un « film d'IA »)

« Fais-moi une vidéo du coffre-fort » **marche**, mais donne un résultat moyen : l'agent comble les trous avec ses
réflexes par défaut (titre centré, fondus, logo à la fin). Plus le brief verrouille de décisions, plus le film est
singulier. Les 6 leviers, du plus important au moins important :

## 1. Une référence visuelle (le levier n°1)
Nommer un style de `references/styles/` (« style : morph-continu ») **ou** fournir une vidéo/image :
`npm run ref -- inspiration.mp4`. Montrer vaut mieux que décrire : « moderne », « premium », « dynamique » ne veulent
rien dire pour un agent ; une référence, si.

## 2. Un concept-dispositif
Une seule idée visuelle qui tient tout le film. Exemples : « une forme qui ne coupe jamais et devient chaque écran »,
« le chaos de mails est aspiré dans le téléphone », « un seul plan-séquence sur le back-office ». Sans dispositif,
on obtient une suite de cartons.

## 3. Une structure calée sur le temps, avec le texte verrouillé
Durée, tempo (120 BPM = 1 temps toutes les 0,5 s, un repère et non une contrainte), et pour chaque tranche : ce qu'on voit +
le texte exact à l'écran. Pour une première version qui valide la direction, ajouter `Étape : ébauche` (format
maître seul, le premier de la ligne `Formats`). Préciser le son : `Son : silencieux`, `effets` ou `mix`. Un film sans son se rythme par le montage,
les mouvements et les temps de lecture (environ 1,5 s + 0,3 s par mot).
Le texte que vous écrivez ne sera pas réécrit.

## 4. Une liste d'interdits
Ce que vous ne voulez surtout pas. Les interdits par défaut sont dans `AGENTS.md` ; ajoutez les vôtres
(« pas de téléphone », « pas de musique électro », « pas de fond blanc »).

## 5. Des garde-fous d'exactitude
Faits produit à utiliser (et seulement eux), ce qui n'est pas encore livré, noms de clients interdits.

## 6. Le livrable et la validation
Formats, durée exacte, usage (LinkedIn, salon, site), et **« montre-moi 3 directions en images fixes avant de construire »**
pour toute pièce importante.

---

## Gabarit à copier-coller (recommandé)
```xml
<inputs>
Film : <nom court>. Formats : 9:16 + 1:1. Durée : 15 s. Usage : LinkedIn.
Écrans réels à utiliser : FO_40 (coffre-fort), FO_12 (page paie). Pas d'autre écran.
</inputs>

<direction>
Style : morph-continu (references/styles/morph-continu.md), mais sur fond clair #F7F7FF.
Concept : un document PDF entre dans le coffre-fort et devient chaque document RH du salarié.
Interdits en plus des défauts : pas de cadenas cliché, pas de son de coffre-fort.
</direction>

<structure>
120 BPM, 30 temps.
0–3 s : « Votre fiche de paie ? » le PDF tombe, le curseur le saisit.
3–9 s : il se range dans le coffre-fort, devient contrat, attestation, mutuelle (un par temps).
9–12 s : recherche « paie mars » → le document s'ouvre.
12–15 s : « Tous vos documents RH. Toujours là. » + logo.
</structure>

<faits>
Coffre-fort = espace RH personnel accessible dans la durée (fiches de paie, contrat, documents RH).
Ne pas citer de client.
</faits>

<start>
Montre-moi 3 directions en images fixes (3 styles différents) avant d'écrire le film.
</start>
```

## Version courte (si vous êtes pressé)
> « Film coffre-fort RH, 15 s, 9:16. Style morph-continu. Concept : un PDF qui devient chaque document RH.
> Texte de fin : “Tous vos documents RH. Toujours là.” Montre-moi 3 directions avant de construire. »

Ces 3 phrases suffisent à éviter 80 % des résultats génériques : un style nommé, un dispositif, une validation.
