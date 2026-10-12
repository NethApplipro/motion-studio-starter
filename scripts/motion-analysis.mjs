// Analyse du mouvement et du rythme, partagée par scripts/qa.mjs et les tests. Fonctions pures.
import jpeg from 'jpeg-js';

// --- Trajectoires (sauts et arrêts brusques) ------------------------------------------------------
// Un ressort démarre vite et s'arrête en douceur : sa vitesse décroît au plus d'environ moitié par frame.
// Un saut (élément téléporté) ou un arrêt sec (interpolation linéaire bornée, valeur codée en dur) casse cette continuité.
export const SACCADE = {
	saut: 0.25, // fraction du petit côté parcourue en une frame : au-delà, l'œil voit une coupe, pas un mouvement
	sautFlou: 0.6, // même limite pour un élément sous MotionBlur : le flou rend lisibles les déplacements rapides
	vitesseMin: 8, // px/frame (en 1080) : en dessous, un arrêt n'est pas perceptible
	ratioArret: 0.25, // vitesse(t) / vitesse(t-1) : en dessous, l'élément pile net
	opaciteMin: 0.05,
};

/**
 * series : {nom: [[frame, x, y, opacité, flou 0|1], …]} (frames croissantes).
 * Renvoie les défauts {type: 'saccade', frame, detail}. Seules les frames consécutives et visibles sont comparées.
 */
export function saccades(series, {width, height}) {
	const short = Math.min(width, height);
	const u = short / 1080;
	const out = [];
	for (const [name, pts] of Object.entries(series)) {
		for (let i = 1; i < pts.length; i++) {
			const [f, x, y, o, flou] = pts[i];
			const [pf, px, py, po] = pts[i - 1];
			if (f !== pf + 1 || o < SACCADE.opaciteMin || po < SACCADE.opaciteMin) continue;
			const v = Math.hypot(x - px, y - py);
			const limite = (flou ? SACCADE.sautFlou : SACCADE.saut) * short;
			if (v > limite) {
				out.push({type: 'saccade', frame: f, detail: `« ${name} » parcourt ${Math.round(v)} px en une frame (frame ${pf} → ${f}, limite ${Math.round(limite)} px${flou ? ' avec flou' : ' sans flou : envelopper dans MotionBlur ou ralentir'}).`});
				continue;
			}
			const prev = pts[i - 2];
			if (!prev || prev[0] !== pf - 1 || prev[3] < SACCADE.opaciteMin) continue;
			const pv = Math.hypot(px - prev[1], py - prev[2]);
			if (pv > SACCADE.vitesseMin * u && v < SACCADE.ratioArret * pv) {
				out.push({type: 'saccade', frame: f, detail: `« ${name} » s'arrête net : ${pv.toFixed(0)} px/frame puis ${v.toFixed(1)} px/frame (frame ${f}).`});
			}
		}
	}
	return out;
}

// --- Activité de l'image (densité d'événements) -----------------------------------------------------
const BLOCK = 8; // la luminance est moyennée par blocs de 8 × 8 px
const TILE = 16; // l'activité est la moyenne d'écart par tuile de 16 × 16 blocs ; on garde la tuile la plus active

/** Image JPEG → grille de luminance moyennée (Float32Array) + dimensions. */
export function lumaGrid(buffer) {
	const {width, height, data} = jpeg.decode(buffer, {useTArray: true, formatAsRGBA: true});
	const gw = Math.floor(width / BLOCK);
	const gh = Math.floor(height / BLOCK);
	const grid = new Float32Array(gw * gh);
	for (let gy = 0; gy < gh; gy++) {
		for (let gx = 0; gx < gw; gx++) {
			let sum = 0;
			for (let y = gy * BLOCK; y < (gy + 1) * BLOCK; y += 2) {
				for (let x = gx * BLOCK; x < (gx + 1) * BLOCK; x += 2) {
					const i = (y * width + x) * 4;
					sum += 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
				}
			}
			grid[gy * gw + gx] = sum / ((BLOCK / 2) * (BLOCK / 2));
		}
	}
	return {grid, gw, gh};
}

/** Activité entre deux grilles : écart moyen de la tuile la plus active (0–255), divisé par l'écart en frames. */
export function activity(a, b, gap = 1) {
	if (!a || !b || a.gw !== b.gw || a.gh !== b.gh) return 0;
	let best = 0;
	for (let ty = 0; ty < a.gh; ty += TILE) {
		for (let tx = 0; tx < a.gw; tx += TILE) {
			let sum = 0;
			let n = 0;
			for (let y = ty; y < Math.min(ty + TILE, a.gh); y++) {
				for (let x = tx; x < Math.min(tx + TILE, a.gw); x++) {
					sum += Math.abs(a.grid[y * a.gw + x] - b.grid[y * b.gw + x]);
					n++;
				}
			}
			best = Math.max(best, sum / n);
		}
	}
	return best / gap;
}

// Au-dessus de ce seuil (écart moyen de luminance par frame sur la tuile la plus active), il se passe quelque chose
// de visible : un texte qui entre, une carte qui bouge, une coche. La dérive lente d'un fond reste en dessous.
export const SEUIL_ACTIVITE = 1.5;

/**
 * Plages calmes trop longues. points : [[frame, activité], …] (frames croissantes).
 * maxGap en secondes : 4 par défaut (règle « un événement toutes les 2 à 4 s »), moins pour les styles rapides.
 */
export function calmSpans(points, {fps, maxGap = 4, seuil = SEUIL_ACTIVITE}) {
	const out = [];
	let start = points[0]?.[0] ?? 0;
	for (let i = 0; i <= points.length; i++) {
		const active = i < points.length && points[i][1] >= seuil;
		if (!active && i < points.length) continue;
		const end = i < points.length ? points[i][0] : points.at(-1)[0];
		const span = (end - start) / fps;
		if (span > maxGap) out.push({type: 'densiteEvenements', frame: start, detail: `Rien de visible ne se passe de ${(start / fps).toFixed(1)} s à ${(end / fps).toFixed(1)} s (${span.toFixed(1)} s, maximum ${maxGap} s pour ce film).`});
		if (i < points.length) start = points[i][0];
	}
	return out;
}
