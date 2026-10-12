// Prépare la machine (à lancer une fois après npm install, ou dans le script de setup d'un environnement Codex).
// Vérifie Node, prépare le navigateur headless de Remotion et génère les sons.
import {copyFileSync, mkdirSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {browserExecutable} from './lib.mjs';

mkdirSync('public/fonts', {recursive:true});
for (const w of [400,500,600,700]) copyFileSync(`node_modules/@fontsource/poppins/files/poppins-latin-${w}-normal.woff2`, `public/fonts/poppins-latin-${w}-normal.woff2`);

const major = Number(process.versions.node.split('.')[0]);
if (major < 20) throw new Error(`Node ${process.versions.node} détecté : Node 20+ requis (22 recommandé).`);
const npx = process.platform === 'win32' ? 'npx.cmd' : 'npx';
const sh = process.platform === 'win32';

if (browserExecutable) console.log(`✓ navigateur local : ${browserExecutable}`);
else {
	console.log('… téléchargement du navigateur headless de Remotion');
	const r = spawnSync(npx, ['remotion', 'browser', 'ensure'], {stdio: 'inherit', shell: sh});
	if (r.status !== 0) console.warn('⚠ échec du téléchargement : définir REMOTION_BROWSER vers un Chrome/Chromium local.');
}
spawnSync(process.execPath, ['scripts/sfx.mjs'], {stdio: 'inherit'});
console.log('✓ prêt : npm run studio (aperçu) · npm run check (vérification) · npm run render -- <Film>');
