import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {BRAND, C, SANS} from '../lib/brand';
import {Cursor, cursorAt, MorphShape, shapeAt, splitSpring} from '../components/style/Morph';
import {KineticText, SlamWord} from '../components/style/Kinetic';
import {cameraAt, CameraRig, Window} from '../components/style/Camera';

// Démonstration des briques de style (1080 × 1080, 3 × 60 frames). Sert de documentation vivante pour les agents
// (npm run stills -- Briques 1x1) et de base aux tests visuels (npm run visual).
const Label: React.FC<{children: React.ReactNode}> = ({children}) => (
	<div style={{position: 'absolute', left: 60, top: 50, fontSize: 24, fontWeight: 600, color: C.grey60}}>{children}</div>
);

export const Briques: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const part = Math.floor(frame / 60);
	const f = frame % 60;
	if (part === 0) {
		const s = shapeAt(f, fps, {x: 540, y: 560, w: 260, h: 260, r: 40}, [{at: 10, to: {x: 540, y: 560, w: 720, h: 420, r: 28}}, {at: 34, to: {x: 540, y: 560, w: 760, h: 120, r: 60}}]);
		const [a, b] = splitSpring(f, fps, [400, 470], [{at: 14, to: [560, 630]}]);
		const cur = cursorAt(f, fps, {x: 860, y: 860}, [{at: 2, x: 600, y: 600}], [12]);
		return (
			<AbsoluteFill style={{background: C.grey05, fontFamily: SANS}}>
				<Label>MorphShape · splitSpring · Cursor</Label>
				<MorphShape s={s} background="#FFFFFF" shadow="0 24px 60px -30px rgba(14,14,82,.28)" />
				<div style={{position: 'absolute', left: 120, width: 14, top: a, height: b - a, borderRadius: 7, background: C.blue}} />
				<Cursor x={cur.x} y={cur.y} press={cur.press} size={48} color={C.black} outline="#FFFFFF" ring={C.blue} />
			</AbsoluteFill>
		);
	}
	if (part === 1) {
		return (
			<AbsoluteFill style={{background: C.dark, fontFamily: SANS, padding: 80, justifyContent: 'center'}}>
				<Label>KineticText · SlamWord</Label>
				<KineticText text="Une phrase qui entre **mot** à mot." at={60} size={72} color={C.white} accent={C.blue} />
				<div style={{height: 60}} />
				<SlamWord text="NON." at={90} size={220} color={C.blue} />
			</AbsoluteFill>
		);
	}
	const shot = cameraAt(f, [{at: 0, x: 900, y: 600, zoom: 0.55}, {at: 10, x: 760, y: 470, zoom: 1.1}], 45);
	const chrome = {bar: C.white, border: C.grey10, dots: [C.red, C.orange, C.green] as [string, string, string], title: C.grey60, background: '#FFFFFF'};
	return (
		<AbsoluteFill style={{background: C.grey05, fontFamily: SANS}}>
			<CameraRig shot={shot} width={1080} height={1080}>
				<Window x={300} y={200} w={1200} h={800} title={`${BRAND.name} · back-office`} chrome={chrome}>
					<div style={{padding: 40, fontSize: 40, fontWeight: 600, color: C.dark}}>Votre projet</div>
				</Window>
			</CameraRig>
			<Label>CameraRig · Window</Label>
		</AbsoluteFill>
	);
};
export const BRIQUES_DURATION = 180;
