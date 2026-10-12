import {useVideoConfig} from 'remotion';

export type FormatKind = 'vertical' | 'square' | 'landscape';

/** Chaque format est recomposé (pas recadré) : les scènes lisent ce hook pour placer leurs éléments. */
export const useFormat = () => {
	const {width, height} = useVideoConfig();
	const ratio = width / height;
	const kind: FormatKind = ratio < 0.8 ? 'vertical' : ratio > 1.2 ? 'landscape' : 'square';
	// u = unité de base : 1 u = 1 px sur un côté court de 1080.
	const u = Math.min(width, height) / 1080;
	return {width, height, kind, u};
};
