// Conversion des horodatages caractère par caractère (ElevenLabs « with-timestamps ») en mots, et estimation
// de secours quand aucune voix n'est générée. Fonctions pures, testées.

/** alignment : {characters, character_start_times_seconds, character_end_times_seconds} → [{text, start, end}]. */
export function wordsFromAlignment(alignment) {
	const {characters: ch = [], character_start_times_seconds: st = [], character_end_times_seconds: en = []} = alignment ?? {};
	const words = [];
	let cur = null;
	for (let i = 0; i < ch.length; i++) {
		if (/\s/.test(ch[i])) { if (cur) words.push(cur); cur = null; continue; }
		if (!cur) cur = {text: '', start: st[i], end: en[i]};
		cur.text += ch[i];
		cur.end = en[i];
	}
	if (cur) words.push(cur);
	return words.map((w) => ({text: w.text, start: Math.round(w.start * 1000) / 1000, end: Math.round(w.end * 1000) / 1000}));
}

/** Estimation (mode essai) : débit régulier, pause plus longue après la ponctuation. */
export function estimateWords(text, {wordsPerSecond = 2.6} = {}) {
	const words = [];
	let t = 0.1;
	for (const w of text.split(/\s+/).filter(Boolean)) {
		const d = Math.max(0.18, (w.length / 6) / wordsPerSecond * 1.4);
		words.push({text: w, start: Math.round(t * 1000) / 1000, end: Math.round((t + d) * 1000) / 1000});
		t += d + (/[.,;:!?…]$/.test(w) ? 0.25 : 0.06);
	}
	return words;
}
