// Test de déterminisme : la même image doit être identique au pixel près,
// qu'on la rende seule ou après d'autres images (aucun état caché entre deux frames).
//   npm run determinism -- Demo-9x16 230
import {renderStill} from '@remotion/renderer';
import {createHash} from 'node:crypto';
import {mkdirSync, readFileSync} from 'node:fs';
import {browserExecutable, getComposition, parseArgs} from './lib.mjs';

const {rest} = parseArgs();
const [id = 'Demo-9x16', frameArg] = rest;
mkdirSync('out/.determinism', {recursive: true});
const {serveUrl, composition} = await getComposition(id);
const frame = frameArg ? Number(frameArg) : Math.floor(composition.durationInFrames / 2);
const shot = async (f, name) => {
	const output = `out/.determinism/${id}-${name}.png`;
	await renderStill({serveUrl, composition, frame: f, output, imageFormat: 'png', browserExecutable});
	return createHash('sha256').update(readFileSync(output)).digest('hex');
};
const a = await shot(frame, 'a');
await shot(composition.durationInFrames - 1, 'fin'); // on rend autre chose entre les deux
const b = await shot(frame, 'b');
const ok = a === b;
console.log(`${id} frame ${frame} : ${ok ? 'DÉTERMINISTE ✓' : 'NON DÉTERMINISTE ✗'}\n${a}\n${b}`);
process.exit(ok ? 0 : 1);
