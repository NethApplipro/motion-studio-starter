import React from 'react';
import {C} from '../lib/brand';

export const PHONE_W = 390;
export const PHONE_H = 844;

/** Coque de téléphone en code. Le contenu est dessiné en coordonnées iPhone (390 × 844). */
export const Phone: React.FC<{children: React.ReactNode; scale: number; style?: React.CSSProperties}> = ({children, scale, style}) => {
	const bezel = 12;
	return (
		<div data-motion="telephone" style={{position: 'absolute', width: PHONE_W + bezel * 2, height: PHONE_H + bezel * 2, marginLeft: -(PHONE_W / 2 + bezel), marginTop: -(PHONE_H / 2 + bezel), transformOrigin: 'center', ...style, transform: `${style?.transform ?? ''} scale(${scale})`}}>
			<div style={{position: 'absolute', inset: 0, borderRadius: 58, background: C.black, boxShadow: '0 40px 80px -30px rgba(14,30,62,.45), 0 12px 30px -12px rgba(14,30,62,.3)'}} />
			<div style={{position: 'absolute', inset: bezel, borderRadius: 46, overflow: 'hidden', background: 'white'}}>
				{children}
				<div style={{position: 'absolute', top: 11, left: '50%', width: 120, height: 34, marginLeft: -60, borderRadius: 20, background: C.black}} />
			</div>
		</div>
	);
};

/** Indicateur de tap : un cercle qui se contracte puis s'ouvre en onde. p 0→1. */
export const Tap: React.FC<{x: number; y: number; p: number}> = ({x, y, p}) => {
	if (p <= 0 || p >= 1) return null;
	const press = Math.min(1, p * 3);
	const ring = Math.max(0, (p - 0.3) / 0.7);
	return (
		<div style={{position: 'absolute', left: x, top: y, pointerEvents: 'none'}}>
			<div style={{position: 'absolute', width: 44, height: 44, marginLeft: -22, marginTop: -22, borderRadius: 99, background: C.black, opacity: (1 - ring) * 0.22, transform: `scale(${1 - press * 0.25})`}} />
			<div style={{position: 'absolute', width: 44, height: 44, marginLeft: -22, marginTop: -22, borderRadius: 99, border: `2px solid ${C.black}`, transform: `scale(${1 + ring * 1.2})`, opacity: (1 - ring) * 0.3}} />
		</div>
	);
};
