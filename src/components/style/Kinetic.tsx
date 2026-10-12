import React from 'react';
import {useCurrentFrame, useVideoConfig} from 'remotion';
import {PresetName, sp} from '../../lib/motion';

// Briques typographiques des styles recit-cinetique et affiche-cinetique.

/**
 * Phrase qui entre mot à mot : chaque mot monte depuis une ligne de coupe (masque), décalé de `stagger` frames.
 * `**mot**` = couleur d'accent. `outAt` : sortie de toute la phrase vers le haut.
 */
export const KineticText: React.FC<{
	text: string;
	at: number;
	outAt?: number;
	stagger?: number;
	size: number;
	color: string;
	accent: string;
	weight?: number;
	align?: 'left' | 'center';
	preset?: PresetName;
	qa?: 'caption' | 'text';
	style?: React.CSSProperties;
}> = ({text, at, outAt = Infinity, stagger = 3, size, color, accent, weight = 600, align = 'left', preset = 'snappy', qa = 'caption', style}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	if (frame < at) return null;
	const exit = outAt === Infinity ? 0 : sp(frame, fps, outAt, 'snappy');
	if (exit > 0.999) return null;
	const words = text.split(/\s+/).filter(Boolean);
	return (
		<div data-qa={qa} style={{fontSize: size, fontWeight: weight, lineHeight: 1.08, letterSpacing: -size * 0.035, color, textAlign: align, opacity: 1 - exit, transform: `translateY(${-exit * size * 0.5}px)`, ...style}}>
			{words.map((w, i) => {
				const p = sp(frame, fps, at + i * stagger, preset);
				const strong = w.startsWith('**');
				const clean = w.replace(/\*\*/g, '');
				return (
					// Masque par mot : le mot monte sous une ligne de coupe invisible (pas de fondu générique).
					<span key={i} style={{display: 'inline-block', overflow: 'hidden', verticalAlign: 'top', paddingBottom: size * 0.12, marginBottom: -size * 0.12}}>
						<span style={{display: 'inline-block', transform: `translateY(${(1 - p) * 105}%)`, color: strong ? accent : undefined}}>
							{clean}
							{i < words.length - 1 ? ' ' : ''}
						</span>
					</span>
				);
			})}
		</div>
	);
};

/**
 * Mot géant qui claque sur un temps (affiche-cinetique) : entrée par en dessous avec un léger dépassement
 * (`playful`, assumé sur les impacts seulement) et une traînée verticale qui se résorbe.
 */
export const SlamWord: React.FC<{text: string; at: number; outAt?: number; size: number; color: string; qa?: 'caption' | 'text'}> = ({text, at, outAt = Infinity, size, color, qa = 'caption'}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	if (frame < at || frame >= outAt) return null;
	const p = sp(frame, fps, at, 'playful');
	const smear = Math.max(0, 1 - (frame - at) / 5);
	return (
		<div data-qa={qa} style={{fontSize: size, fontWeight: 700, lineHeight: 0.95, letterSpacing: -size * 0.06, color, transform: `translateY(${(1 - p) * size * 0.9}px) scaleY(${1 + smear * 0.18})`, transformOrigin: '50% 100%'}}>
			{text}
		</div>
	);
};
