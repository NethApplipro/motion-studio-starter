// Détection du tempo et des temps d'une musique, pour caler un film sur une piste sous licence.
// Fonctions pures (testées) ; le CLI est scripts/beats.mjs.

const HOP = 512;

/** Force d'attaque par fenêtre : hausses de l'énergie (log) d'une fenêtre à l'autre, centrées et bornées à 0. */
export function onsetEnvelope(samples, sampleRate) {
	const n = Math.floor(samples.length / HOP);
	const energy = new Float64Array(n);
	for (let i = 0; i < n; i++) {
		let e = 0;
		// Énergie large bande : le kick (le temps) domine ; un filtre aigu ferait ressortir les charlestons des contretemps.
		for (let j = i * HOP; j < (i + 1) * HOP; j++) e += samples[j] * samples[j];
		energy[i] = Math.log(1e-9 + e);
	}
	const onset = new Float64Array(n);
	for (let i = 1; i < n; i++) onset[i] = Math.max(0, energy[i] - energy[i - 1]);
	const mean = onset.reduce((a, b) => a + b, 0) / Math.max(1, n);
	for (let i = 0; i < n; i++) onset[i] = Math.max(0, onset[i] - mean);
	return {onset, hopSeconds: HOP / sampleRate};
}

/**
 * Tempo et phase par peigne : pour chaque tempo candidat (pas de 0,1 BPM) et chaque phase, somme de l'enveloppe
 * (lissée) aux instants des temps. Une légère préférence pour 120 BPM (le tempo du studio) départage le tempo double.
 */
export function detectBeats(samples, sampleRate, {minBpm = 70, maxBpm = 180, fps = 30} = {}) {
	const {onset: raw, hopSeconds} = onsetEnvelope(samples, sampleRate);
	// Lissage sur ±2 fenêtres : tolère le léger flottement d'un batteur ou d'un échantillonnage grossier.
	const onset = raw.map((_, i) => [-2, -1, 0, 1, 2].reduce((a, d) => a + (raw[i + d] ?? 0) * [0.1, 0.2, 0.4, 0.2, 0.1][d + 2], 0));
	const at = (t) => {
		const x = t / hopSeconds;
		const i = Math.floor(x);
		return (onset[i] ?? 0) * (1 - (x - i)) + (onset[i + 1] ?? 0) * (x - i);
	};
	const end = (onset.length - 2) * hopSeconds;
	let best = {score: -Infinity, bpm: 120, offset: 0};
	for (let bpm = minBpm; bpm <= maxBpm + 1e-9; bpm += 0.1) {
		const period = 60 / bpm;
		const prior = Math.exp(-0.5 * Math.log2(bpm / 120) ** 2 / 0.6 ** 2);
		for (let k = 0; k < 48; k++) {
			const offset = (k / 48) * period;
			let score = 0;
			for (let t = offset; t < end; t += period) score += at(t);
			score *= prior;
			if (score > best.score) best = {score, bpm, offset};
		}
	}
	// Affinage de la phase au centième de seconde.
	const period = 60 / best.bpm;
	for (let offset = Math.max(0, best.offset - period / 48); offset <= best.offset + period / 48; offset += 0.002) {
		let score = 0;
		for (let t = offset; t < end; t += period) score += at(t);
		if (score * Math.exp(-0.5 * Math.log2(best.bpm / 120) ** 2 / 0.36) > best.score) best = {...best, score: score * Math.exp(-0.5 * Math.log2(best.bpm / 120) ** 2 / 0.36), offset};
	}
	// Une phase proche d'une période entière équivaut à 0 : le premier temps est au début du morceau.
	if (best.offset > period * 0.9) best.offset = Math.max(0, best.offset - period);
	const bpm = Math.round(best.bpm * 10) / 10;
	const duration = samples.length / sampleRate;
	const beats = [];
	for (let t = best.offset; t < duration; t += 60 / bpm) beats.push(Math.round(t * fps));
	return {bpm, offset: Math.round(best.offset * 1000) / 1000, fps, framesPerBeat: Math.round((60 / bpm) * fps * 100) / 100, beats};
}
