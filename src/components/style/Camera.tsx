import React from 'react';
import {Easing, interpolate} from 'remotion';

// Briques du style camera-continue (references/styles/camera-continue.md) : un seul plan-séquence lent.

export type CameraShot = {at: number; x: number; y: number; zoom: number; rotate?: number};

/**
 * Caméra à plans clés : entre deux plans, mouvement ease-in-out de `duration` frames (1,5 à 3 s dans la fiche).
 * Interpolation douce plutôt que ressort : une caméra lourde ne dépasse jamais sa cible.
 * (x, y) = point du décor placé au centre du cadre.
 */
export const cameraAt = (frame: number, shots: CameraShot[], duration = 60) => {
	let cur = shots[0];
	for (let i = 1; i < shots.length; i++) {
		const s = shots[i];
		if (frame < s.at) break;
		const p = interpolate(frame, [s.at, s.at + duration], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.bezier(0.65, 0, 0.35, 1)});
		cur = {at: s.at, x: cur.x + (s.x - cur.x) * p, y: cur.y + (s.y - cur.y) * p, zoom: cur.zoom * Math.pow(s.zoom / cur.zoom, p), rotate: (cur.rotate ?? 0) + ((s.rotate ?? 0) - (cur.rotate ?? 0)) * p};
	}
	return cur;
};

/** Décor filmé : tout ce qui est dans `children` est en coordonnées du décor, la caméra le cadre. */
export const CameraRig: React.FC<{shot: CameraShot; width: number; height: number; children: React.ReactNode}> = ({shot, width, height, children}) => (
	<div style={{position: 'absolute', inset: 0, overflow: 'hidden'}}>
		<div data-motion="camera" style={{position: 'absolute', left: 0, top: 0, width: 0, height: 0, transform: `translate(${width / 2}px, ${height / 2}px) rotate(${shot.rotate ?? 0}deg) scale(${shot.zoom}) translate(${-shot.x}px, ${-shot.y}px)`, transformOrigin: '0 0'}}>
			{children}
		</div>
	</div>
);

/** Fenêtre type macOS (barre de titre + pastilles) pour recomposer une capture du back-office. */
export const Window: React.FC<{x: number; y: number; w: number; h: number; title: string; chrome: {bar: string; border: string; dots: [string, string, string]; title: string; background: string}; children?: React.ReactNode}> = ({x, y, w, h, title, chrome, children}) => (
	<div style={{position: 'absolute', left: x, top: y, width: w, height: h, borderRadius: 14, overflow: 'hidden', background: chrome.background, border: `1px solid ${chrome.border}`, boxShadow: '0 30px 80px -30px rgba(14,14,82,.35)'}}>
		<div style={{height: 40, background: chrome.bar, borderBottom: `1px solid ${chrome.border}`, display: 'flex', alignItems: 'center', gap: 8, padding: '0 14px'}}>
			{chrome.dots.map((c, i) => <span key={i} style={{width: 12, height: 12, borderRadius: 6, background: c}} />)}
			<span style={{flex: 1, textAlign: 'center', fontSize: 13, color: chrome.title, marginRight: 52}}>{title}</span>
		</div>
		<div style={{position: 'absolute', top: 40, left: 0, right: 0, bottom: 0}}>{children}</div>
	</div>
);
