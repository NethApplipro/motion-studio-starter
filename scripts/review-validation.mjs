// Règles de verdict, partagées par scripts/verdict.mjs et les tests. Fonctions pures, sans accès disque.
// Le verdict est calculé, jamais écrit à la main : le critique note, le script décide.

export const CRITERES = {
	clarte: 'Clarté du message',
	hierarchie: 'Hiérarchie',
	rythme: 'Rythme',
	mouvement: 'Qualité du mouvement',
	lisibilite: 'Lisibilité (360 px)',
	marque: 'Fidélité à la marque',
	finition: 'Finition',
};

// Seuils. LIVRABLE autorise la diffusion publique ; PILOTE INTERNE seulement un usage interne.
export const SEUILS = {livrable: {moyenne: 8, min: 7}, pilote: {moyenne: 7.5, min: 7}};
export const CIBLES = ['public', 'interne'];

/** Contrôle la forme d'un review.json et renvoie la liste des erreurs (vide si valide). */
export function reviewErrors(r) {
	const e = [];
	if (!r || typeof r !== 'object') return ['review.json absent ou illisible.'];
	if (!/^[A-Z][A-Za-z0-9]*-(9x16|1x1|16x9)$/.test(r.id ?? '')) e.push(`id invalide : ${r.id}`);
	if (!CIBLES.includes(r.cible)) e.push(`cible doit valoir ${CIBLES.join(' ou ')} (reçu : ${r.cible}).`);
	if (!Number.isInteger(r.passe) || r.passe < 1) e.push('passe doit être un entier ≥ 1.');
	if (!r.critique || typeof r.critique !== 'string') e.push('critique : qui a noté (ex. « motion-critic », « Codex », « Nathi »).');
	for (const k of Object.keys(CRITERES)) {
		const v = r.notes?.[k];
		if (!Number.isInteger(v) || v < 1 || v > 10) e.push(`notes.${k} doit être un entier de 1 à 10 (reçu : ${v}).`);
	}
	for (const k of Object.keys(r.notes ?? {})) if (!(k in CRITERES)) e.push(`notes.${k} : critère inconnu.`);
	if (!Array.isArray(r.defauts)) e.push('defauts doit être une liste (les 3 pires défauts, vide seulement si aucun).');
	else r.defauts.forEach((d, i) => {
		if (!Array.isArray(d.t) || d.t.length !== 2 || !d.t.every(Number.isFinite)) e.push(`defauts[${i}].t doit valoir [début, fin] en secondes.`);
		if (!d.preuve) e.push(`defauts[${i}].preuve manquante.`);
		if (!d.correctif) e.push(`defauts[${i}].correctif manquant (fichier et valeur).`);
	});
	return e;
}

export const moyenne = (notes) => {
	const v = Object.keys(CRITERES).map((k) => notes[k]);
	return v.reduce((a, b) => a + b, 0) / v.length;
};

/** Cible déclarée dans le brief d'un film (« Cible : public » ou « | **Cible** | interne … »), ou null. */
export const briefCible = (brief) => brief?.match(/Cible\**\s*[:|]\s*\**\s*(public|interne)\b/i)?.[1]?.toLowerCase() ?? null;

/**
 * Raisons de refuser un rapport technique pour un rendu donné (vide si le rapport vaut pour ce rendu).
 * qa : contenu de reviews/<id>/qa.json (ou null) ; ctx.id : rendu attendu ; ctx.videoSha256 : empreinte du MP4 actuel
 * (null s'il est absent). Un rapport d'un autre film, d'un précontrôle ou d'une ancienne vidéo ne valide rien.
 */
export function qaRaisons(qa, ctx = {}) {
	if (!qa) return ['Validation technique absente : lancer npm run render puis npm run qa (sans --preflight).'];
	if (ctx.id !== undefined && qa.id !== ctx.id) return [`Rapport technique d'un autre rendu (${qa.id ?? 'sans id'}) au lieu de ${ctx.id} : relancer npm run qa.`];
	if (qa.mode !== 'final') return ['Seul un précontrôle a été exécuté : il ne valide jamais une livraison.'];
	if (!qa.technicalPassed) return [`Validation technique en échec : ${Object.entries(qa.counts ?? {}).filter(([, v]) => v).map(([k, v]) => `${k}=${v}`).join(', ')}.`];
	if (ctx.videoSha256 !== undefined) {
		if (ctx.videoSha256 === null) return [`MP4 absent (out/${ctx.id}.mp4) : impossible de vérifier que le rapport porte sur la vidéo livrée.`];
		if (!qa.videoSha256) return ['Rapport technique sans empreinte du MP4 (ancien format) : relancer npm run qa.'];
		if (qa.videoSha256 !== ctx.videoSha256) return ['Le MP4 a changé depuis la validation technique : relancer npm run qa sur la vidéo actuelle.'];
	}
	return [];
}

/**
 * Verdict d'un rendu : technique d'abord (qa final), puis notes.
 * qa : contenu de reviews/<id>/qa.json (ou null s'il manque).
 * ctx (fourni par npm run verdict et npm run eval) : {id, videoSha256, cible} ; cible = cible du brief, qui fait foi.
 */
export function verdict(review, qa, ctx = {}) {
	const raisons = [...qaRaisons(qa, ctx)];
	if ('cible' in ctx) {
		if (!ctx.cible) raisons.push('Cible absente du brief : ajouter « Cible : public » ou « Cible : interne » dans films/<film>/brief.md.');
		else if (review.cible !== ctx.cible) raisons.push(`La critique annonce la cible « ${review.cible} » mais le brief dit « ${ctx.cible} » : le brief fait foi.`);
	}
	const cible = ctx.cible ?? review.cible;
	const m = moyenne(review.notes);
	const min = Math.min(...Object.keys(CRITERES).map((k) => review.notes[k]));
	const note = m >= SEUILS.livrable.moyenne && min >= SEUILS.livrable.min ? 'LIVRABLE' : m >= SEUILS.pilote.moyenne && min >= SEUILS.pilote.min ? 'PILOTE INTERNE' : 'À REPRENDRE';
	if (note === 'À REPRENDRE') raisons.push(`Note insuffisante : moyenne ${m.toFixed(2)}, minimum ${min} (pilote : ≥ ${SEUILS.pilote.moyenne} et aucun < ${SEUILS.pilote.min}).`);
	if (note === 'PILOTE INTERNE' && cible === 'public') raisons.push(`Diffusion publique : moyenne ${m.toFixed(2)} < ${SEUILS.livrable.moyenne} ou un critère < ${SEUILS.livrable.min}.`);
	const statut = raisons.length ? 'À REPRENDRE' : note;
	return {statut, note, moyenne: Math.round(m * 100) / 100, min, cible, accepte: raisons.length === 0, raisons};
}

/** review.md lisible, généré depuis review.json (seule source). */
export function reviewMarkdown(review, v) {
	const rows = Object.entries(CRITERES).map(([k, label]) => `| ${label} | ${review.notes[k]} | ${review.commentaires?.[k] ?? ''} |`).join('\n');
	const fmt = ([a, b]) => `${a.toFixed(1).replace('.', ',')}–${b.toFixed(1).replace('.', ',')} s`;
	const defauts = review.defauts.length ? review.defauts.map((d, i) => `${i + 1}. ${fmt(d.t)} : ${d.preuve} → ${d.correctif}`).join('\n') : 'Aucun.';
	const corriges = review.corriges?.length ? `\n## Corrigé depuis la passe précédente\n${review.corriges.map((c, i) => `${i + 1}. ${c}`).join('\n')}\n` : '';
	const humains = review.commentairesHumains?.length ? `\n## Commentaires de visionnage\n${review.commentairesHumains.map((c) => `- ${c.t.toFixed(1).replace('.', ',')} s (${c.auteur ?? 'relecteur'}) : ${c.texte}`).join('\n')}\n` : '';
	return `<!-- Généré par npm run verdict depuis review.json : modifier le JSON, pas ce fichier. -->
# Critique — ${review.id} (passe ${review.passe})

Critique : ${review.critique}${review.date ? ` · ${review.date}` : ''} · cible : **${review.cible}**

| Critère | Note | Commentaire |
|---|---|---|
${rows}
| **Moyenne** | **${v.moyenne.toFixed(2).replace('.', ',')}** | minimum ${v.min} |
${corriges}
## Défauts restants
${defauts}
${humains}
## Verdict : **${v.statut}**
${v.raisons.length ? v.raisons.map((r) => `- ${r}`).join('\n') : `- Note : ${v.note}. Validation technique finale réussie.`}
${review.controles ? `\nContrôles : ${review.controles}\n` : ''}`;
}
