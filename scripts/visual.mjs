// Tests visuels de régression : quelques images de référence par composition, comparées pixel à pixel.
//   npm run visual              → compare à tests/visual/baseline/ (code de sortie 1 si une image a changé)
//   npm run visual -- --update  → réécrit les références (après avoir REGARDÉ les différences)
// Une référence absente fait échouer le test : elle ne se crée qu'avec --update (voir scripts/visual-baseline.mjs).
// Les images sont rendues au quart de la résolution : assez pour voir une mise en page cassée, une couleur ou un
// écran changé, assez petit pour être versionné. Différences dans tests/visual/diff/ (non versionné).
import {renderStill} from '@remotion/renderer';
import {existsSync, mkdirSync, readFileSync, rmSync, writeFileSync} from 'node:fs';
import pixelmatch from 'pixelmatch';
import {PNG} from 'pngjs';
import {browserExecutable, getBundle, listCompositions, parseArgs} from './lib.mjs';
import {TARGETS} from './visual-targets.mjs';
import {baselineAction} from './visual-baseline.mjs';

// Tolérance : anticrénelage et versions de Chrome bougent quelques pixels ; une régression en bouge des milliers.
const SEUIL_PIXEL = 0.1;
const MAX_RATIO = 0.004;

const {flags} = parseArgs();
const update = flags.update === true;
const dirs = {base: 'tests/visual/baseline', actual: 'tests/visual/actual', diff: 'tests/visual/diff'};
for (const d of [dirs.actual, dirs.diff]) rmSync(d, {recursive: true, force: true});
for (const d of Object.values(dirs)) mkdirSync(d, {recursive: true});

const serveUrl = await getBundle();
const comps = new Map((await listCompositions()).map((c) => [c.id, c]));
const failures = [];
for (const [id, frames] of Object.entries(TARGETS)) {
	const composition = comps.get(id);
	if (!composition) { failures.push(`${id} : composition introuvable (renommée ? mettre TARGETS à jour).`); continue; }
	for (const frame of frames) {
		const name = `${id}-f${String(frame).padStart(4, '0')}.png`;
		const actual = `${dirs.actual}/${name}`;
		await renderStill({serveUrl, composition, frame, output: actual, imageFormat: 'png', scale: 0.25, browserExecutable, logLevel: 'error'});
		const base = `${dirs.base}/${name}`;
		const action = baselineAction({update, exists: existsSync(base)});
		if (action === 'write') {
			writeFileSync(base, readFileSync(actual));
			console.log(`↻ ${name}`);
			continue;
		}
		if (action === 'missing') {
			failures.push(`${name} : référence absente. La créer dans la CI : workflow « Références visuelles » (lancement manuel ou commit contenant [maj-references-visuelles]), puis regarder l'image ajoutée.`);
			continue;
		}
		const a = PNG.sync.read(readFileSync(base));
		const b = PNG.sync.read(readFileSync(actual));
		if (a.width !== b.width || a.height !== b.height) { failures.push(`${name} : taille ${b.width}×${b.height} au lieu de ${a.width}×${a.height}.`); continue; }
		const diff = new PNG({width: a.width, height: a.height});
		const n = pixelmatch(a.data, b.data, diff.data, a.width, a.height, {threshold: SEUIL_PIXEL});
		const ratio = n / (a.width * a.height);
		if (ratio > MAX_RATIO) {
			writeFileSync(`${dirs.diff}/${name}`, PNG.sync.write(diff));
			failures.push(`${name} : ${(ratio * 100).toFixed(2)} % des pixels ont changé (diff : ${dirs.diff}/${name}).`);
		} else console.log(`✓ ${name}${n ? ` (${(ratio * 100).toFixed(2)} %)` : ''}`);
	}
}
if (failures.length) {
	console.log(`\n✗ ${failures.length} image(s) différente(s) :\n- ${failures.join('\n- ')}\nSi le changement est voulu : regarder tests/visual/diff/, puis npm run visual -- --update.`);
	process.exit(1);
}
console.log('✓ aucune régression visuelle');
