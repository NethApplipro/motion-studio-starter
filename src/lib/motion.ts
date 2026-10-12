import {interpolate, spring, Easing} from 'remotion';

// Presets de ressort. Règle du studio : pas de rebond sauf "playful".
export const PRESETS = {
	snappy: {damping: 30, stiffness: 320, mass: 0.7},
	default: {damping: 26, stiffness: 180, mass: 1},
	heavy: {damping: 34, stiffness: 110, mass: 1.6},
	playful: {damping: 13, stiffness: 190, mass: 0.9},
} as const;
export type PresetName = keyof typeof PRESETS;

/** Ressort 0 → 1 qui démarre à la frame `start`. Fonction pure du temps. */
export const sp = (frame: number, fps: number, start: number, preset: PresetName = 'default') =>
	spring({frame: frame - start, fps, config: PRESETS[preset]});

export type Key = {at: number; to: number; preset?: PresetName};

/**
 * Valeur animée par une suite de cibles : un ressort par changement de cible, additionnés.
 * N'importe quelle frame se calcule directement, sans simuler les précédentes.
 */
export const track = (frame: number, fps: number, from: number, keys: Key[], preset: PresetName = 'default') => {
	let v = from;
	let prev = from;
	for (const k of keys) {
		v += (k.to - prev) * sp(frame, fps, k.at, k.preset ?? preset);
		prev = k.to;
	}
	return v;
};

/** Interpolation bornée avec easing doux (pour les fondus et les compteurs). */
export const ease = (frame: number, [a, b]: [number, number], [from, to]: [number, number] = [0, 1]) =>
	interpolate(frame, [a, b], [from, to], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
		easing: Easing.bezier(0.22, 1, 0.36, 1),
	});

/** Générateur pseudo-aléatoire seedé (mulberry32) : même seed, même film. */
export const mulberry32 = (seed: number) => () => {
	let t = (seed += 0x6d2b79f5);
	t = Math.imul(t ^ (t >>> 15), t | 1);
	t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
	return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

/** 120 BPM à 30 fps = un temps toutes les 15 frames. */
export const BEAT = 15;
export const beat = (n: number) => n * BEAT;
