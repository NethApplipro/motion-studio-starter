import React from 'react';
import {PresetName, sp, track} from '../../lib/motion';

// Briques du style morph-continu (references/styles/morph-continu.md) : une forme qui ne coupe jamais,
// un curseur qui fait de vrais gestes, un indicateur à deux bords. Tout est une fonction pure de la frame.

/** État de la forme : rectangle centré en (x, y), en px du cadre. */
export type ShapeState = {x: number; y: number; w: number; h: number; r: number};
export type ShapeKey = {at: number; to: ShapeState; preset?: PresetName};

/**
 * Valeur de la forme à la frame `frame` : chaque dimension suit un ressort par changement d'état.
 * Les dimensions bougent ensemble mais avec des presets distincts possibles : la largeur peut précéder la hauteur.
 */
export const shapeAt = (frame: number, fps: number, from: ShapeState, keys: ShapeKey[], preset: PresetName = 'default'): ShapeState => {
	const dim = (k: keyof ShapeState) => track(frame, fps, from[k], keys.map((key) => ({at: key.at, to: key.to[k], preset: key.preset})), preset);
	return {x: dim('x'), y: dim('y'), w: dim('w'), h: dim('h'), r: dim('r')};
};

/** La forme elle-même. Le contenu est centré dans la forme et coupé à ses bords (overflow hidden). */
export const MorphShape: React.FC<{s: ShapeState; background: string; border?: string; shadow?: string; children?: React.ReactNode; name?: string}> = ({s, background, border, shadow, children, name = 'forme'}) => (
	<div
		data-motion={name}
		style={{position: 'absolute', left: s.x - s.w / 2, top: s.y - s.h / 2, width: s.w, height: s.h, borderRadius: Math.min(s.r, s.w / 2, s.h / 2), background, border, boxShadow: shadow, overflow: 'hidden'}}
	>
		{children}
	</div>
);

/**
 * Échange de contenu dans une forme : l'ancien sort (fondu + léger flou) AVANT que le nouveau entre.
 * Renvoie l'opacité, le flou et le décalage vertical d'un contenu visible de `inAt` à `outAt`.
 * Règle de la fiche : entrée et sortie séparées, sinon les textes se chevauchent.
 */
export const swap = (frame: number, fps: number, inAt: number, outAt = Infinity, shift = 14) => {
	const enter = sp(frame, fps, inAt, 'snappy');
	const exit = outAt === Infinity ? 0 : sp(frame, fps, outAt, 'snappy');
	const o = Math.max(0, enter - exit * 1.4);
	return {opacity: o, filter: `blur(${((1 - enter) + exit) * 6}px)`, transform: `translateY(${(1 - enter) * shift - exit * shift}px)`, visible: frame >= inAt && o > 0.001};
};

/** Indicateur à deux bords (onglet, sélection) : le bord avant part en snappy, le bord arrière suit en heavy. */
export const splitSpring = (frame: number, fps: number, from: [number, number], keys: {at: number; to: [number, number]}[]) => {
	let a = from[0];
	let b = from[1];
	let pa = from[0];
	let pb = from[1];
	for (const k of keys) {
		const forward = k.to[0] > pa;
		const lead = sp(frame, fps, k.at, 'snappy');
		const trail = sp(frame, fps, k.at, 'heavy');
		// En avançant, le bord de fin mène ; en reculant, le bord de début mène.
		a += (k.to[0] - pa) * (forward ? trail : lead);
		b += (k.to[1] - pb) * (forward ? lead : trail);
		pa = k.to[0];
		pb = k.to[1];
	}
	return [a, b] as const;
};

export type CursorKey = {at: number; x: number; y: number; preset?: PresetName};

/** Position du curseur et intensité de clic (0→1→0) à la frame. `clicks` : frames des clics. */
export const cursorAt = (frame: number, fps: number, from: {x: number; y: number}, keys: CursorKey[], clicks: number[] = []) => {
	const x = track(frame, fps, from.x, keys.map((k) => ({at: k.at, to: k.x, preset: k.preset ?? 'default'})));
	const y = track(frame, fps, from.y, keys.map((k) => ({at: k.at, to: k.y, preset: k.preset ?? 'default'})));
	const press = clicks.reduce((m, c) => Math.max(m, frame >= c && frame < c + 10 ? Math.sin(((frame - c) / 10) * Math.PI) : 0), 0);
	return {x, y, press};
};

/** Curseur macOS en vecteur. `press` 0→1 : le curseur se contracte et une onde part de la pointe. */
export const Cursor: React.FC<{x: number; y: number; press: number; size: number; color: string; outline: string; ring: string}> = ({x, y, press, size, color, outline, ring}) => (
	<div data-motion="curseur" style={{position: 'absolute', left: x, top: y, width: size, height: size, pointerEvents: 'none'}}>
		{press > 0.01 ? <div style={{position: 'absolute', left: -size * 0.4, top: -size * 0.4, width: size * 0.8, height: size * 0.8, borderRadius: '50%', border: `${size * 0.05}px solid ${ring}`, opacity: press * 0.6, transform: `scale(${0.6 + press * 0.8})`}} /> : null}
		<svg width={size} height={size} viewBox="0 0 24 24" style={{position: 'absolute', left: 0, top: 0, transform: `scale(${1 - press * 0.12})`, transformOrigin: '0 0', overflow: 'visible'}}>
			<path d="M2 1.5 L2 19.5 L7 15 L10.5 22.5 L13.6 21.1 L10.2 13.8 L17 13.8 Z" fill={color} stroke={outline} strokeWidth={1.4} strokeLinejoin="round" />
		</svg>
	</div>
);
