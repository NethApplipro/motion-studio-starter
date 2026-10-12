// Images fixes de contrôle (étape « stills » avant tout rendu vidéo) + planche récapitulative.
//   npm run stills -- Demo 9x16                 → 10 images réparties sur le film
//   npm run stills -- Demo 9x16 0 90 200        → images précises (frames)
import {renderStill} from '@remotion/renderer';
import {mkdirSync, rmSync} from 'node:fs';
import {browserExecutable, getComposition, parseArgs, tile} from './lib.mjs';

const {rest} = parseArgs();
const [film = 'Demo', format = '9x16', ...frameArgs] = rest;
const id = `${film}-${format}`;
const dir = `reviews/${film}/${format}/stills`;
rmSync(dir, {recursive: true, force: true});
mkdirSync(dir, {recursive: true});

const {serveUrl, composition} = await getComposition(id);
const n = composition.durationInFrames;
const frames = frameArgs.length ? frameArgs.map(Number) : Array.from({length: 10}, (_, i) => Math.round(((i + 0.5) * (n - 1)) / 10));
const files = [];
for (const frame of frames) {
	const output = `${dir}/f${String(frame).padStart(4, '0')}.jpg`;
	await renderStill({serveUrl, composition, frame, output, imageFormat: 'jpeg', jpegQuality: 90, browserExecutable});
	files.push(output);
	console.log(output);
}
const sheet = `reviews/${film}/${format}/sheet.jpg`;
if (tile(files, sheet, {cols: Math.min(5, files.length), width: format === '16x9' ? 480 : 300})) console.log(`✓ ${sheet}`);
