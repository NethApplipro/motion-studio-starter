import React, {useId} from 'react';
import {BRAND, SANS} from '../lib/brand';

// Symbole fictif configurable depuis la charte.
export const MARK_PATH = BRAND.logoPath;

/** draw 0→1 : tracé progressif. color 'gradient' = dégradé de marque, sinon couleur pleine. */
export const LogoMark: React.FC<{size: number; color?: string; draw?: number}> = ({size, color = 'white', draw = 1}) => {
	const id = useId().replace(/:/g, '');
	return (
		<svg width={size} height={size} viewBox="0 0 670 670" fill="none">
			{color === 'gradient' ? (
				<defs>
					<linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
						{BRAND.logoGradient.map((c, i) => (
							<stop key={c} offset={[0, 0.55, 1][i]} stopColor={c} />
						))}
					</linearGradient>
				</defs>
			) : null}
			<path d={MARK_PATH} stroke={color === 'gradient' ? `url(#${id})` : color} strokeWidth={50} strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - draw} />
		</svg>
	);
};

/** Logo complet : symbole + « Nova » en Poppins Medium. word 0→1 : révélation du mot. */
export const Logo: React.FC<{size: number; color?: string; textColor?: string; draw?: number; word?: number}> = ({size, color = 'white', textColor, draw = 1, word = 1}) => (
	<div style={{display: 'flex', alignItems: 'center', gap: size * 0.3, color: textColor ?? (color === 'gradient' ? BRAND.colors.black : color), fontFamily: SANS}}>
		<LogoMark size={size} color={color} draw={draw} />
		<div style={{fontSize: size * 0.78, fontWeight: 500, letterSpacing: -size * 0.01, lineHeight: 1, clipPath: `inset(0 ${(1 - word) * 100}% 0 0)`}}>{BRAND.name}</div>
	</div>
);
