// Temps de lecture des textes marqués (data-qa="caption" ou "text") : AVERTISSEMENT, jamais bloquant.
// Seuil indicatif de départ : 1,5 s + 0,3 s par mot, en comptant aussi les mots des autres textes lisibles au même
// moment (le regard doit tout lire). Seul le temps où le texte est réellement lisible compte : opacité effective ≥ 0,9.
// Limites connues : un texte qui s'écrit mot à mot dans un conteneur déjà opaque est compté dès le premier mot ;
// le jugement final du rythme reste au visionnage.
export const LECTURE = {base: 1.5, parMot: 0.3, opaciteMin: 0.9};

export const wordCount = (t) => (String(t ?? '').match(/[\p{L}\p{N}]+(?:['’-][\p{L}\p{N}]+)*/gu) ?? []).length;

/**
 * samples : [{frame, textes: {cle: {texte, o}}}] dans l'ordre des frames ; step : écart entre deux frames échantillonnées.
 * Renvoie [{cle, texte, debut, duree, requis, mots, concurrents}] pour chaque passage lisible trop court.
 */
export function readingWarnings(samples, {fps, step = 1, ...opts} = {}) {
	const {base, parMot, opaciteMin} = {...LECTURE, ...opts};
	const runs = new Map(); // cle → passage en cours {debut, fin, texte, concurrents}
	const warnings = [];
	const close = (cle, run) => {
		const duree = (run.fin - run.debut + step) / fps;
		const mots = wordCount(run.texte);
		const requis = base + parMot * (mots + run.concurrents);
		if (duree + 1e-9 < requis) warnings.push({cle, texte: run.texte, debut: +(run.debut / fps).toFixed(2), duree: +duree.toFixed(2), requis: +requis.toFixed(2), mots, concurrents: run.concurrents});
	};
	for (const {frame, textes = {}} of samples) {
		const lisibles = Object.entries(textes).filter(([, v]) => v.o >= opaciteMin);
		const total = lisibles.reduce((a, [, v]) => a + wordCount(v.texte), 0);
		const presents = new Set(lisibles.map(([k]) => k));
		for (const [cle, run] of runs) if (!presents.has(cle)) { close(cle, run); runs.delete(cle); }
		for (const [cle, v] of lisibles) {
			const autres = total - wordCount(v.texte);
			const run = runs.get(cle);
			if (run && frame - run.fin <= step) { run.fin = frame; run.concurrents = Math.max(run.concurrents, autres); }
			else { if (run) close(cle, run); runs.set(cle, {debut: frame, fin: frame, texte: v.texte, concurrents: autres}); }
		}
	}
	for (const [cle, run] of runs) close(cle, run);
	return warnings;
}
