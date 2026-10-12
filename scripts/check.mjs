// Vérification rapide avant de committer : types + une image rendue par composition.
//   npm run check
import {renderStill} from '@remotion/renderer';
import {spawnSync} from 'node:child_process';
import {mkdirSync} from 'node:fs';
import {browserExecutable, getBundle, listCompositions} from './lib.mjs';

const tsc = spawnSync(process.platform === 'win32' ? 'npx.cmd' : 'npx', ['tsc', '--noEmit'], {stdio: 'inherit', shell: process.platform === 'win32'});
if (tsc.status !== 0) process.exit(1);
console.log('✓ types');

const serveUrl = await getBundle();
const comps = await listCompositions();
mkdirSync('out/.check', {recursive: true});
for (const composition of comps) {
	const frame = Math.floor(composition.durationInFrames * 0.6);
	await renderStill({serveUrl, composition, frame, output: `out/.check/${composition.id}.jpg`, imageFormat: 'jpeg', browserExecutable});
	console.log(`✓ ${composition.id} (frame ${frame})`);
}
console.log(`✓ ${comps.length} compositions rendues sans erreur`);
