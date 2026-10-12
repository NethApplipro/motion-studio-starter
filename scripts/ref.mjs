// Prépare l'analyse d'une vidéo ou d'une image de référence (le « look » qu'on veut atteindre).
//   npm run ref -- ~/Downloads/inspiration.mp4 [nom]
// → references/inbox/<nom>/ : contact.jpg (1 image / 0,5 s), rythme.jpg (bande de 12 images), analyse.md à remplir.
import {copyFileSync, existsSync, mkdirSync, writeFileSync} from 'node:fs';
import path from 'node:path';
import {ffmpeg, ffprobe, parseArgs} from './lib.mjs';

const {rest} = parseArgs();
const [input, nameArg] = rest;
if (!input || !existsSync(input)) throw new Error('Usage : npm run ref -- <vidéo ou image> [nom]');
const name = nameArg ?? path.basename(input).replace(/\.[^.]+$/, '').toLowerCase().replace(/[^a-z0-9]+/g, '-');
const dir = `references/inbox/${name}`;
mkdirSync(dir, {recursive: true});
const isImage = /\.(png|jpe?g|webp|gif)$/i.test(input);

if (isImage) {
	copyFileSync(input, `${dir}/${path.basename(input)}`);
} else {
	const dur = Number(ffprobe(['-show_entries', 'format=duration', '-of', 'csv=p=0', input]));
	const cells = Math.ceil(dur * 2);
	ffmpeg(['-i', input, '-vf', `fps=2,scale=320:-2,tile=6x${Math.ceil(cells / 6)}:padding=4:color=#202020`, '-frames:v', '1', `${dir}/contact.jpg`]);
	ffmpeg(['-i', input, '-vf', `fps=12/${dur},scale=240:-2,tile=12x1:padding=4:color=#202020`, '-frames:v', '1', `${dir}/rythme.jpg`]);
}
writeFileSync(`${dir}/analyse.md`, `# Analyse de référence — ${name}
Source : ${input}${isImage ? '' : ' (voir contact.jpg et rythme.jpg)'}

| Axe | Observation précise | À reprendre pour Nova | À ne pas copier |
|---|---|---|---|
| Palette | | (mapper sur brand/brand.json) | |
| Typographie | tailles, graisses, interlettrage | (en Poppins) | |
| Composition | grille, marges, point focal | | |
| Rythme | durée moyenne d'un plan, événements par temps | | |
| Mouvement | courbes, poids, overshoot, flou | (preset sp/track) | |
| Caméra | zooms, pans, recadrages | | |
| Transitions | comment on passe d'un état à l'autre | | |
| Texture | grain, ombres, profondeur | | |
| Son | | | |

## Grammaire en 5 lignes (à recopier dans le brief, section <direction>)
1.
2.
3.
4.
5.
`);
console.log(`✓ ${dir}/ — remplir analyse.md (ou demander à l'agent de le faire en regardant les images).`);
