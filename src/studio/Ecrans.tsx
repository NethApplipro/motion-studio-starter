import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {C, SANS} from '../lib/brand';
import {Phone} from '../components/Phone';
import {SCREENS} from '../components/app/catalog';

/** Planche du catalogue : une frame par écran, tous ses états côte à côte (1920 × 1080). */
export const Ecrans: React.FC = () => {
	const entry = SCREENS[Math.min(useCurrentFrame(), SCREENS.length - 1)];
	const n = entry.states.length;
	const scale = Math.min(1, 1650 / (n * 440));
	return (
		<AbsoluteFill style={{background: C.grey05, fontFamily: SANS, color: C.dark}}>
			<div style={{position: 'absolute', left: 60, top: 36, fontSize: 30, fontWeight: 600}}>{entry.label}</div>
			<div style={{position: 'absolute', right: 60, top: 44, fontSize: 18, color: C.grey60}}>references/product-ui/{entry.capture}</div>
			{entry.states.map((state, i) => {
				const x = 960 + (i - (n - 1) / 2) * 470 * scale;
				return (
					<React.Fragment key={state.label}>
						<Phone scale={scale * 0.98} style={{left: x, top: 560}}>
							<entry.component {...state.props} />
						</Phone>
						<div style={{position: 'absolute', left: x - 200, width: 400, top: 1010, textAlign: 'center', fontSize: 20, color: C.grey60}}>{state.label}</div>
					</React.Fragment>
				);
			})}
		</AbsoluteFill>
	);
};
export const ECRANS_DURATION = SCREENS.length;
