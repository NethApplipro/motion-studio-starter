// Courbes SVG lisibles par un agent comme par un humain, depuis les séries enregistrées par npm run qa.
//   activite.svg : activité de l'image par frame, seuil d'événement, grille des temps (120 BPM), plages calmes.
//   vitesses.svg : vitesse des éléments suivis (px/frame) : un ressort donne une cloche, un arrêt sec une falaise.
import brand from './brand.mjs';

const C = brand.colors;
const W = 1200;
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'})[c]);

const frame = (title, n, fps, h, body, yLabel) => {
	const grid = [];
	for (let f = 0; f <= n; f += 15) {
		const x = 50 + (f / n) * (W - 70);
		const bar = f % 60 === 0;
		grid.push(`<line x1="${x}" x2="${x}" y1="30" y2="${h - 30}" stroke="${bar ? C.grey20 : C.grey10}" stroke-width="1"/>`);
		if (bar) grid.push(`<text x="${x}" y="${h - 12}" font-size="12" fill="${C.grey60}" text-anchor="middle">${(f / fps).toFixed(0)} s</text>`);
	}
	return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${h}" font-family="Poppins, system-ui, sans-serif">
<rect width="${W}" height="${h}" fill="#FFFFFF"/>
<text x="50" y="20" font-size="14" font-weight="600" fill="${C.dark}">${esc(title)}</text>
<text x="${W - 20}" y="20" font-size="12" fill="${C.grey60}" text-anchor="end">${esc(yLabel)} · lignes verticales = temps (120 BPM)</text>
${grid.join('\n')}
${body}
</svg>`;
};

/** series : bloc `series` de qa.json / preflight.json. n : nombre de frames du film. */
export function activitySvg(series, n, title) {
	const h = 260;
	const {activite = [], seuilActivite = 1.5, maxGap = 4, fps = 30} = series ?? {};
	const max = Math.max(seuilActivite * 4, ...activite.map(([, a]) => a));
	const x = (f) => 50 + (f / Math.max(1, n - 1)) * (W - 70);
	const y = (a) => h - 30 - (Math.min(a, max) / max) * (h - 70);
	const path = activite.map(([f, a], i) => `${i ? 'L' : 'M'}${x(f).toFixed(1)},${y(a).toFixed(1)}`).join('');
	const calm = [];
	let start = activite[0]?.[0] ?? 0;
	for (let i = 0; i <= activite.length; i++) {
		if (i < activite.length && activite[i][1] < seuilActivite) continue;
		const end = i < activite.length ? activite[i][0] : activite.at(-1)?.[0] ?? 0;
		if ((end - start) / fps > maxGap) calm.push(`<rect x="${x(start)}" y="30" width="${x(end) - x(start)}" height="${h - 60}" fill="${C.red}" opacity="0.12"/>`);
		if (i < activite.length) start = activite[i][0];
	}
	const body = `${calm.join('')}
<line x1="50" x2="${W - 20}" y1="${y(seuilActivite)}" y2="${y(seuilActivite)}" stroke="${C.orange}" stroke-dasharray="6 4"/>
<text x="${W - 20}" y="${y(seuilActivite) - 6}" font-size="11" fill="${C.orange}" text-anchor="end">seuil d'événement</text>
<path d="${path}" fill="none" stroke="${C.blue}" stroke-width="2"/>`;
	return frame(title ?? 'Activité de l’image', n, fps, h, body, 'écart de luminance par frame');
}

export function speedSvg(series, n, title) {
	const {trajectoires = {}, fps = 30} = series ?? {};
	const curves = Object.entries(trajectoires)
		.map(([name, pts]) => {
			const v = [];
			for (let i = 1; i < pts.length; i++) if (pts[i][0] === pts[i - 1][0] + 1 && pts[i][3] > 0.05) v.push([pts[i][0], Math.hypot(pts[i][1] - pts[i - 1][1], pts[i][2] - pts[i - 1][2])]);
			return {name, v, peak: Math.max(0, ...v.map(([, s]) => s))};
		})
		.filter((c) => c.peak > 2)
		.sort((a, b) => b.peak - a.peak)
		.slice(0, 6);
	const h = 300;
	const palette = [C.blue, C.dark, C.green, C.orange, C.grey60, C.red];
	const max = Math.max(10, ...curves.map((c) => c.peak));
	const x = (f) => 50 + (f / Math.max(1, n - 1)) * (W - 70);
	const y = (s) => h - 30 - (s / max) * (h - 80);
	const lines = curves.map((c, i) => `<path d="${c.v.map(([f, s], j) => `${j && c.v[j - 1][0] === f - 1 ? 'L' : 'M'}${x(f).toFixed(1)},${y(s).toFixed(1)}`).join('')}" fill="none" stroke="${palette[i]}" stroke-width="2"/>
<text x="${60 + i * 190}" y="44" font-size="12" fill="${palette[i]}">■ ${esc(c.name.slice(0, 24))}</text>`);
	const body = curves.length ? lines.join('\n') : `<text x="${W / 2}" y="${h / 2}" font-size="14" fill="${C.grey60}" text-anchor="middle">Aucune trajectoire : lancer npm run qa avec --step=1 et marquer les éléments clés data-motion="nom".</text>`;
	return frame(title ?? 'Vitesse des éléments suivis', n, fps, h, body, 'px par frame');
}
