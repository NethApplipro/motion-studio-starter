import React from 'react';
import {useCurrentFrame, useVideoConfig} from 'remotion';
import {C, SANS} from '../lib/brand';
import {sp} from '../lib/motion';

export type Cue = {at: number; text: string};

/** Texte riche minimal : **mot** = couleur d'accent. */
const Rich: React.FC<{text: string}> = ({text}) => (
	<>
		{text.split(/(\*\*[^*]+\*\*)/).map((part, i) =>
			part.startsWith('**') ? <span key={i} style={{color: C.blue}}>{part.slice(2, -2)}</span> : <span key={i}>{part}</span>,
		)}
	</>
);

/**
 * Sous-titres qui se remplacent : l'ancien monte et s'efface, le nouveau arrive par en dessous.
 * `until` : frame où le dernier sous-titre sort.
 */
export const Captions: React.FC<{cues: Cue[]; until: number; x: number; y: number; width: number; size: number; align?: 'left' | 'center'}> = ({cues, until, x, y, width, size, align = 'left'}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	return (
		<>
			{cues.map((cue, i) => {
				const next = cues[i + 1]?.at ?? until;
				if (frame < cue.at || frame > next + 20) return null;
				// Le nouveau sous-titre attend que l'ancien soit presque sorti : jamais deux textes superposés.
				const enter = sp(frame, fps, cue.at + (i ? 6 : 0), 'snappy');
				const exit = sp(frame, fps, next - 4, 'snappy');
				const shift = size * 0.6;
				return (
					<div key={i} data-qa="caption" style={{position: 'absolute', left: x, top: y, width, fontFamily: SANS, fontSize: size, fontWeight: 600, lineHeight: 1.08, letterSpacing: -size * 0.035, color: C.dark, textAlign: align, opacity: enter * (1 - exit), transform: `translateY(${(1 - enter) * shift - exit * shift}px)`}}>
						<Rich text={cue.text} />
					</div>
				);
			})}
		</>
	);
};
