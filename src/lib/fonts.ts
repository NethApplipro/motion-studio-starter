import {loadFont} from '@remotion/fonts';
import {staticFile} from 'remotion';

// Poppins servie en local (public/fonts) : aucun appel réseau au rendu, rendu identique partout.
export const fontsReady = Promise.all(
	([400, 500, 600, 700] as const).map((w) =>
		loadFont({family: 'Poppins', url: staticFile(`fonts/poppins-latin-${w}-normal.woff2`), weight: String(w)}),
	),
);
