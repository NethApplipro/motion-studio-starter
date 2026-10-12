// Étape d'un film, déclarée dans son brief (ligne « Étape : ébauche | final »). Fonctions pures, testées.
//   ébauche → première version pour valider la direction : un seul format (le premier de la ligne « Formats »),
//             précontrôle et rendu --draft seulement. Jamais diffusée : npm run verdict la refuse toujours.
//   final   → pipeline complet (3 formats, QA finale, critique, verdict). C'est le défaut sans ligne « Étape ».
import {FORMATS} from './lib.mjs';

const toFormat = (s) => s.replace(/\s/g, '').replace(':', 'x');

export function briefEtape(brief) {
	const m = brief?.match(/[ÉE]tape\**\s*[:|]\s*\**\s*([ée]bauche|final)\b/i);
	const etape = m ? (m[1].toLowerCase() === 'final' ? 'final' : 'ebauche') : 'final';
	const line = brief?.match(/Formats?\**\s*[:|]\s*\**([^\n]*)/i)?.[1] ?? '';
	const formats = [...line.matchAll(/\b(9\s*[:x]\s*16|1\s*[:x]\s*1|16\s*[:x]\s*9)\b/g)].map((f) => toFormat(f[1])).filter((f) => FORMATS.includes(f));
	return {etape, declare: Boolean(m), formatMaitre: formats[0] ?? '9x16'};
}

/**
 * Matrice de CI : un film en ébauche n'est contrôlé que dans son format maître, en précontrôle (niveau « leger »),
 * même sur une PR prête ; les autres films suivent le niveau de la PR.
 * etapes : {Film: briefEtape(...)} ; mode : 'leger' | 'complet'.
 */
export function ciMatrix(films, mode, etapes = {}) {
	return films.flatMap((film) => {
		const e = etapes[film];
		if (e?.etape === 'ebauche') return [{film, format: e.formatMaitre, niveau: 'leger'}];
		return FORMATS.map((format) => ({film, format, niveau: mode}));
	});
}

export const MESSAGE_EBAUCHE = 'Ébauche : aucun verdict, aucune diffusion. Pour livrer, passer « Étape : final » dans le brief et suivre le pipeline complet (3 formats, QA finale, critique, verdict).';
