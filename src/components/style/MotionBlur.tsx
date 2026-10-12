import React from 'react';
import {useCurrentFrame} from 'remotion';
import {CameraMotionBlur} from '@remotion/motion-blur';

const AtFrame: React.FC<{render: (frame: number) => React.ReactNode}> = ({render}) => <>{render(useCurrentFrame())}</>;

/**
 * Flou de mouvement par sous-images (obturateur de caméra). `render(frame)` dessine la couche à une frame donnée,
 * éventuellement fractionnaire : toutes les positions doivent être calculées DEPUIS ce paramètre (pas depuis une
 * variable calculée plus haut), sinon toutes les sous-images sont identiques et rien n'est flou.
 * À n'activer que pendant les déplacements rapides : le coût de rendu est multiplié par `samples`.
 * Le capteur QA ne mesure que la première sous-image et tolère les déplacements rapides des éléments floutés.
 */
export const MotionBlur: React.FC<{active: boolean; render: (frame: number) => React.ReactNode; samples?: number; shutterAngle?: number}> = ({active, render, samples = 16, shutterAngle = 180}) => {
	const frame = useCurrentFrame();
	if (!active) return <>{render(frame)}</>;
	return (
		<div data-motion-blur="" style={{position: 'absolute', inset: 0}}>
			<CameraMotionBlur samples={samples} shutterAngle={shutterAngle}>
				<AtFrame render={render} />
			</CameraMotionBlur>
		</div>
	);
};
