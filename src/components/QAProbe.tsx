import React, {useLayoutEffect, useRef} from 'react';
import {continueRender, delayRender, useCurrentFrame, useVideoConfig} from 'remotion';
import brand from '../../brand/brand.json';

// Capteur QA : actif seulement quand le rendu est lancé par `npm run qa` (variable REMOTION_QA).
// Il mesure la page à chaque frame et publie un rapport via console.log (préfixe « QA: »).
// Il ne dessine rien : l'image rendue est identique avec ou sans lui.
//
// Marquer les textes importants dans les films :
//   data-qa="caption"  → sous-titre / titre (taille mini 58 px en 1080, zone sûre obligatoire)
//   data-qa="text"     → autre texte qui doit être lu (taille mini 30 px en 1080, zone sûre obligatoire)
//   data-qa="ui"       → texte d'un écran d'app qui porte un fait du brief (état, consigne) : mini 24 px en 1080,
//                        dans le cadre ; la zone sûre ne s'applique pas (l'écran est un décor qui peut déborder)
//   data-motion="nom"  → élément dont la trajectoire est suivie (sauts, arrêts brusques). Les textes data-qa sont
//                        suivis automatiquement. Un nom par élément : « telephone », « carte-2 »…

// Lu à chaque frame (et non au chargement) : Remotion injecte les variables d'environnement au rendu.
const qaEnabled = () => typeof process !== 'undefined' && process.env.REMOTION_QA === '1';

const hexes = [...new Set((JSON.stringify(brand).match(/#[0-9a-fA-F]{6}\b/g) ?? []).map((h) => h.toUpperCase()))];
const PALETTE = [...hexes, '#FFFFFF', '#000000'].map((h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16), h] as const);

const parseColor = (c: string): [number, number, number, number] | null => {
	const m = c.match(/rgba?\(([^)]+)\)/);
	if (!m) return null;
	const p = m[1].split(/[ ,/]+/).filter(Boolean).map(Number);
	return [p[0], p[1], p[2], p[3] ?? 1];
};
const offPalette = (rgb: [number, number, number, number]) =>
	rgb[3] > 0.04 && !PALETTE.some(([r, g, b]) => Math.abs(r - rgb[0]) + Math.abs(g - rgb[1]) + Math.abs(b - rgb[2]) <= 12);
const toHex = (rgb: number[]) => `#${rgb.slice(0, 3).map((v) => Math.round(v).toString(16).padStart(2, '0')).join('').toUpperCase()}`;

const describe = (el: Element) => {
	const text = (el.textContent ?? '').trim().replace(/\s+/g, ' ').slice(0, 50);
	return `<${el.tagName.toLowerCase()}${el.getAttribute('data-qa') ? ` data-qa=${el.getAttribute('data-qa')}` : ''}>${text ? ` « ${text} »` : ''}`;
};

// Sous MotionBlur, les enfants sont rendus plusieurs fois (une copie par sous-image) : on ne mesure que la première.
const isBlurCopy = (el: Element) => {
	const blur = el.closest('[data-motion-blur]');
	const first = blur?.firstElementChild?.firstElementChild;
	return Boolean(blur && first && !first.contains(el));
};

const effectiveOpacity = (el: Element, stop: Element) => {
	let o = 1;
	for (let n: Element | null = el; n && n !== stop.parentElement; n = n.parentElement) o *= Number(getComputedStyle(n).opacity);
	return o;
};

export const QAProbe: React.FC<{children: React.ReactNode}> = ({children}) => {
	const frame = useCurrentFrame();
	const {width, height} = useVideoConfig();
	const ref = useRef<HTMLDivElement>(null);

	useLayoutEffect(() => {
		if (!qaEnabled() || !ref.current) return;
		const handle = delayRender('QA probe');
		const root = ref.current;
		document.fonts.ready.then(() => {
			const box = root.getBoundingClientRect();
			// Pendant la mesure, Remotion peut garder le film hors écran : toutes les positions sont relatives à `box`.
			const u = Math.min(width, height) / 1080;
			const vertical = height / width > 1.2;
			const safe = vertical
				? {l: 60 * u, r: width - 150 * u, t: 220 * u, b: height - 420 * u}
				: {l: width * 0.04, r: width * 0.96, t: height * 0.04, b: height * 0.96};
			const issues: {type: string; detail: string}[] = [];
			const texts: {el: Element; r: DOMRect}[] = [];

			root.querySelectorAll('[data-qa]').forEach((el) => {
				if (isBlurCopy(el) || effectiveOpacity(el, root) < 0.6) return;
				const scale = (el as HTMLElement).offsetWidth ? (el as HTMLElement).getBoundingClientRect().width / (el as HTMLElement).offsetWidth : 1;
				const size = parseFloat(getComputedStyle(el).fontSize) * scale;
				const range = document.createRange();
				range.selectNodeContents(el);
				// Une boîte par ligne, resserrée sur la hauteur des lettres (la boîte de police mesure ~1,5 × la taille
				// du texte et se chevauche entre deux lignes même quand les lettres ne se touchent pas).
				const lines = [...range.getClientRects()]
					.filter((q) => q.width > 1 && q.height > 1)
					.map((q) => {
						const h = Math.min(q.height, size * 0.95);
						return new DOMRect(q.x - box.x, q.y - box.y + (q.height - h) / 2, q.width, h);
					});
				if (!lines.length) return;
				const r = new DOMRect(
					Math.min(...lines.map((q) => q.left)),
					Math.min(...lines.map((q) => q.top)),
					Math.max(...lines.map((q) => q.right)) - Math.min(...lines.map((q) => q.left)),
					Math.max(...lines.map((q) => q.bottom)) - Math.min(...lines.map((q) => q.top)),
				);
				lines.forEach((q) => texts.push({el, r: q}));
				const px = (v: number) => `${Math.round(v)} px`;
				const kind = el.getAttribute('data-qa');
				if (r.left < -1 || r.top < -1 || r.right > width + 1 || r.bottom > height + 1) {
					issues.push({type: 'texteHorsCadre', detail: `${describe(el)} sort du cadre (x ${px(r.left)}→${px(r.right)}, y ${px(r.top)}→${px(r.bottom)}, cadre ${width}×${height}).`});
				} else if (kind !== 'ui' && (r.left < safe.l - 1 || r.top < safe.t - 1 || r.right > safe.r + 1 || r.bottom > safe.b + 1)) {
					issues.push({type: 'texteHorsZoneSure', detail: `${describe(el)} déborde de la zone sûre (texte y ${px(r.top)}→${px(r.bottom)}, x ${px(r.left)}→${px(r.right)} ; zone y ${px(safe.t)}→${px(safe.b)}, x ${px(safe.l)}→${px(safe.r)}).`});
				}
				const min = (kind === 'caption' ? 58 : kind === 'ui' ? 24 : 30) * u;
				if (size < min - 0.5) issues.push({type: 'texteTropPetit', detail: `${describe(el)} fait ${size.toFixed(1)} px, minimum ${min.toFixed(0)} px.`});
			});
			for (let i = 0; i < texts.length; i++) {
				for (let j = i + 1; j < texts.length; j++) {
					const a = texts[i].r;
					const b = texts[j].r;
					const w = Math.min(a.right, b.right) - Math.max(a.left, b.left);
					const h = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
					if (w > 2 && h > 2 && texts[i].el !== texts[j].el && !texts[i].el.contains(texts[j].el) && !texts[j].el.contains(texts[i].el)) {
						issues.push({type: 'chevauchement', detail: `${describe(texts[i].el)} chevauche ${describe(texts[j].el)} (${Math.round(w)}×${Math.round(h)} px).`});
					}
				}
			}

			const seen = new Set<string>();
			root.querySelectorAll('*').forEach((el) => {
				const cs = getComputedStyle(el);
				if (cs.display === 'none' || cs.visibility === 'hidden') return;
				const checks: [string, string][] = [['fond', cs.backgroundColor]];
				if ([...el.childNodes].some((n) => n.nodeType === 3 && n.textContent?.trim())) checks.push(['texte', cs.color]);
				if (parseFloat(cs.borderTopWidth) > 0 && cs.borderTopStyle !== 'none') checks.push(['bordure', cs.borderTopColor]);
				if (el instanceof SVGElement) {
					checks.push(['remplissage SVG', cs.fill], ['trait SVG', cs.stroke]);
					if (el.tagName === 'stop') checks.push(['dégradé SVG', cs.getPropertyValue('stop-color')]);
				}
				for (const [what, value] of checks) {
					const rgb = parseColor(value);
					if (!rgb || !offPalette(rgb)) continue;
					const key = `${what}${toHex(rgb)}${describe(el)}`;
					if (seen.has(key)) continue;
					seen.add(key);
					issues.push({type: 'couleurHorsCharte', detail: `${what} ${toHex(rgb)} sur ${describe(el)} n'est pas dans brand/brand.json.`});
				}
			});

			// Trajectoires : centre de chaque élément suivi, avec son opacité effective (pour ignorer les éléments invisibles).
			const motion: Record<string, [number, number, number, number]> = {};
			const counts = new Map<string, number>();
			root.querySelectorAll('[data-motion], [data-qa]').forEach((el) => {
				if (isBlurCopy(el)) return;
				const base = el.getAttribute('data-motion') ?? `${el.getAttribute('data-qa')}:${(el.textContent ?? '').trim().slice(0, 24)}`;
				const n = counts.get(base) ?? 0;
				counts.set(base, n + 1);
				const r = el.getBoundingClientRect();
				if (!r.width || !r.height) return;
				motion[n ? `${base}#${n}` : base] = [Math.round((r.x + r.width / 2 - box.x) * 10) / 10, Math.round((r.y + r.height / 2 - box.y) * 10) / 10, Math.round(effectiveOpacity(el, root) * 100) / 100, el.closest('[data-motion-blur]') ? 1 : 0];
			});

			// Textes à lire (caption, text) : contenu complet et opacité effective, pour le temps de lecture (avertissement).
			const textes: Record<string, {texte: string; o: number}> = {};
			const vus = new Map<string, number>();
			root.querySelectorAll('[data-qa="caption"], [data-qa="text"]').forEach((el) => {
				if (isBlurCopy(el)) return;
				const texte = (el.textContent ?? '').trim().replace(/\s+/g, ' ');
				if (!texte) return;
				const n = vus.get(texte) ?? 0;
				vus.set(texte, n + 1);
				textes[n ? `${texte}#${n}` : texte] = {texte, o: Math.round(effectiveOpacity(el, root) * 100) / 100};
			});

			console.log(`QA:${JSON.stringify({frame, issues, motion, textes, measured: box.width === width && box.height === height})}`);
			continueRender(handle);
		});
	}, [frame, width, height]);

	return (
		// Taille explicite : le conteneur parent peut être de taille nulle au moment de la mesure.
		<div ref={ref} style={{position: 'absolute', left: 0, top: 0, width, height}}>
			{children}
		</div>
	);
};

/** Enveloppe un film avec le capteur QA (utilisé par Root pour toutes les compositions). */
export const withQA = <P extends object>(Film: React.FC<P>): React.FC<P> => {
	const Wrapped: React.FC<P> = (props) => (
		<QAProbe>
			<Film {...props} />
		</QAProbe>
	);
	Wrapped.displayName = `QA(${Film.displayName ?? Film.name})`;
	return Wrapped;
};
