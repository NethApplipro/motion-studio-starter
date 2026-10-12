import React from 'react';
import {REMIX} from './remix';

export type IconName = keyof typeof REMIX;

/** Icône Remix (iconographie officielle Nova). */
export const Icon: React.FC<{name: IconName; size?: number; color?: string}> = ({name, size = 20, color = 'currentColor'}) => (
	<svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
		{REMIX[name].map((d) => <path key={d} d={d} />)}
	</svg>
);
