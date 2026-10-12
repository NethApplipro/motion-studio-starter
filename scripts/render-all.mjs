// Rendu d'un film dans ses 3 formats, puis traitement du son selon le brief (« Son : silencieux | effets | mix »,
// voir scripts/audio-mode.mjs) : aucune piste, effets à niveau fixé, ou mix normalisé sur la cible du brief.
//   npm run render -- Demo            → les 3 formats
//   npm run render -- Demo 9x16       → un seul format
//   npm run render -- Demo --draft    → aperçu rapide (moitié de la résolution, CRF 28)
import {renderMedia} from '@remotion/renderer';
import {existsSync, mkdirSync, readFileSync, renameSync, rmSync} from 'node:fs';
import {audioEncodeArgs, briefAudio} from './audio-mode.mjs';
import {browserExecutable, ffmpeg, filmSlug, FORMATS, getComposition, parseArgs} from './lib.mjs';

const {flags, rest} = parseArgs();
const [film = 'Demo', ...only] = rest;
const formats = only.length ? only : FORMATS;
const draft = Boolean(flags.draft);
const briefPath = `films/${filmSlug(film)}/brief.md`;
const audio = briefAudio(existsSync(briefPath) ? readFileSync(briefPath, 'utf8') : null);
console.log(`Son : ${audio.mode}${audio.declare ? '' : ' (par défaut)'}`);
mkdirSync('out', {recursive: true});

for (const format of formats) {
	const id = `${film}-${format}`;
	const {serveUrl, composition} = await getComposition(id);
	const suffix = draft ? '.draft' : '';
	const raw = `out/.${id}${suffix}.raw.mp4`;
	const tmp = `out/.${id}${suffix}.tmp.mp4`;
	const final = `out/${id}${suffix}.mp4`;
	let last = -1;
	await renderMedia({
		serveUrl, composition, codec: 'h264', crf: draft ? 28 : 16, pixelFormat: 'yuv420p', colorSpace: 'bt709', scale: draft ? 0.5 : 1,
		outputLocation: raw, browserExecutable, muted: audio.mode === 'silencieux',
		onProgress: ({progress}) => {
			const pct = Math.floor(progress * 10) * 10;
			if (pct !== last) console.log(`${id} ${(last = pct)}%`);
		},
	});
	// Encodage final dans un fichier temporaire : un rendu raté n'écrase jamais une bonne version.
	ffmpeg(['-i', raw, '-c:v', 'copy', ...audioEncodeArgs(audio), '-movflags', '+faststart', tmp]);
	renameSync(tmp, final);
	rmSync(raw, {force: true});
	console.log(`✓ ${final}`);
}
