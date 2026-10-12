// Mode audio d'un film, déclaré dans son brief (ligne « Son : silencieux | effets | mix »). Fonctions pures, testées.
//   silencieux → aucune piste audio dans le MP4 ; le son n'est pas contrôlé (sans objet).
//   effets     → effets ponctuels à niveau fixé dans timeline.ts : AUCUNE normalisation de volume moyen (elle
//                remonterait des clics isolés d'environ 10 dB), seule la crête est contrôlée (≤ -1 dBTP).
//   mix        → musique et/ou voix : normalisation sur la cible du brief (« Volume cible : -14 LUFS », -14 par défaut).
// Sans ligne « Son », le mode est « mix » (comportement historique des films existants).
export const AUDIO_MODES = ['silencieux', 'effets', 'mix'];
const CRETE_MAX = -1; // dBTP, pour tous les modes qui ont du son

export function briefAudio(brief) {
	const m = brief?.match(/\bSon\**\s*[:|]\s*\**\s*(silencieux|effets|mix)\b/i);
	const t = brief?.match(/Volume cible\**\s*[:|]\s*\**\s*(-?\d+(?:[.,]\d+)?)\s*LUFS/i);
	return {mode: m ? m[1].toLowerCase() : 'mix', declare: Boolean(m), cibleLufs: t ? Number(t[1].replace(',', '.')) : -14};
}

/** Arguments audio de l'encodage final (après le rendu Remotion). */
export function audioEncodeArgs(audio) {
	if (audio.mode === 'silencieux') return ['-an'];
	const aac = ['-ar', '48000', '-c:a', 'aac', '-b:a', '192k'];
	// Marge de 0,5 dB sous la crête maximale : l'encodage AAC peut la dépasser légèrement.
	if (audio.mode === 'mix') return ['-af', `loudnorm=I=${audio.cibleLufs}:TP=${CRETE_MAX - 0.5}:LRA=11`, ...aac];
	return aac;
}

/** Codec audio attendu dans le MP4 livré : null = aucune piste. */
export const expectedAudioCodec = (audio) => (audio.mode === 'silencieux' ? null : 'aac');

const finite = (v) => (typeof v === 'number' || (typeof v === 'string' && v.trim() !== '')) && Number.isFinite(Number(v));

/** Défauts de son d'après une mesure loudnorm (input_i, input_tp). */
export function audioLevelIssues(measurement, audio) {
	if (audio.mode === 'silencieux') return [];
	if (!finite(measurement.input_tp)) {
		return [audio.mode === 'effets' ? 'Aucun son mesuré alors que le brief déclare des effets sonores (« Son : effets »).' : 'Mesure loudness absente ou non finie.'];
	}
	const tp = Number(measurement.input_tp);
	if (audio.mode === 'effets') return tp > CRETE_MAX ? [`Crête ${tp} dBTP au-dessus de ${CRETE_MAX} dBTP : baisser le volume des effets dans timeline.ts.`] : [];
	if (!finite(measurement.input_i)) return ['Mesure loudness absente ou non finie.'];
	const i = Number(measurement.input_i);
	return Math.abs(i - audio.cibleLufs) > 1 || tp > CRETE_MAX ? [`${i} LUFS (cible ${audio.cibleLufs} ±1), crête ${tp} dBTP (≤ ${CRETE_MAX}).`] : [];
}
