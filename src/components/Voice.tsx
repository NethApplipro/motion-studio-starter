import React from 'react';
import {Audio, Sequence, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {SANS} from '../lib/brand';

// Voix off et sous-titres parlés depuis la même source (films/<slug>/voix.json → voix.generated.ts).
export type VoiceLine = {id: string; at: number; src: string; duration: number; texte: string; words: {text: string; start: number; end: number}[]};

/** Lecture des répliques, chacune à sa frame. */
export const VoiceOver: React.FC<{lines: VoiceLine[]; volume?: number}> = ({lines, volume = 1}) => (
	<>
		{lines.map((l) => (
			<Sequence key={l.id} from={l.at} layout="none">
				<Audio src={staticFile(l.src)} volume={volume} />
			</Sequence>
		))}
	</>
);

/**
 * Sous-titre de la réplique en cours : les mots déjà dits sont pleins, les suivants atténués (lecture guidée).
 * Le texte affiché est exactement le texte dit.
 */
export const SpokenCaptions: React.FC<{lines: VoiceLine[]; x: number; y: number; width: number; size: number; color: string; accent: string}> = ({lines, x, y, width, size, color, accent}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const line = lines.find((l) => frame >= l.at && frame < l.at + (l.duration + 0.4) * fps);
	if (!line) return null;
	const t = (frame - line.at) / fps;
	return (
		<div data-qa="caption" style={{position: 'absolute', left: x, top: y, width, fontFamily: SANS, fontSize: size, fontWeight: 600, lineHeight: 1.1, letterSpacing: -size * 0.03, color}}>
			{line.words.map((w, i) => (
				<span key={i} style={{opacity: t >= w.start ? 1 : 0.28, color: t >= w.start && t < w.end ? accent : color}}>
					{w.text}
					{i < line.words.length - 1 ? ' ' : ''}
				</span>
			))}
		</div>
	);
};
