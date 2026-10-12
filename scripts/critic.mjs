// Batterie de contrôles avant livraison d'un rendu.
//   npm run critic -- out/Demo-9x16.mp4
// Produit dans reviews/<id>/ : planche contact (1 image / 0,5 s), bande de 12 images, test téléphone 360 px,
// test de boucle (première vs dernière image) et fiche technique (durée, format, loudness).
// Sans ffmpeg complet : images séparées dans reviews/<id>/frames/ au lieu des planches.
// Ensuite : lire reviews/CRITIC.md et noter le film.
import {existsSync, mkdirSync, readFileSync, rmSync, writeFileSync} from 'node:fs';
import path from 'node:path';
import {activitySvg, speedSvg} from './charts.mjs';
import {FFMPEG_HINT, ffmpeg, ffprobe, hasFullFfmpeg, parseArgs} from './lib.mjs';

const {rest} = parseArgs();
const [video] = rest;
if (!video) throw new Error('Usage : npm run critic -- out/<Film>-<format>.mp4');
const id = path.basename(video, '.mp4').replace(/\.draft$/, '');
const dir = `reviews/${id}`;
mkdirSync(dir, {recursive: true});

const dur = Number(ffprobe(['-select_streams', 'v:0', '-show_entries', 'stream=duration', '-of', 'csv=p=0', video]));
if (!Number.isFinite(dur) || dur <= 0) throw new Error('Durée vidéo absente ou invalide.');
const info = ffprobe(['-select_streams', 'v:0', '-show_entries', 'stream=codec_name,width,height,pix_fmt,r_frame_rate', '-of', 'csv=p=0', video]);
let images;

if (hasFullFfmpeg) {
	const cells = Math.ceil(dur * 2);
	ffmpeg(['-i', video, '-vf', `fps=2,scale=240:-2,tile=6x${Math.ceil(cells / 6)}:padding=4:color=#202020`, '-frames:v', '1', `${dir}/contact.jpg`]);
	ffmpeg(['-i', video, '-vf', `fps=12/${dur},scale=200:-2,tile=12x1:padding=4:color=#202020`, '-frames:v', '1', `${dir}/strip.jpg`]);
	ffmpeg(['-i', video, '-vf', `fps=1,scale=360:-2,tile=5x${Math.ceil(dur / 5)}:padding=4:color=#202020`, '-frames:v', '1', `${dir}/phone-360.jpg`]);
	ffmpeg(['-i', video, '-frames:v', '1', `${dir}/.first.png`]);
	ffmpeg(['-sseof', '-0.5', '-i', video, '-update', '1', `${dir}/.last.png`]);
	ffmpeg(['-i', `${dir}/.first.png`, '-i', `${dir}/.last.png`, '-filter_complex', '[0]scale=360:-2[a];[1]scale=360:-2[b];[a][b]hstack', `${dir}/loop.jpg`]);
	rmSync(`${dir}/.first.png`);
	rmSync(`${dir}/.last.png`);
	// Traînées : chaque case superpose les 8 dernières frames. Un mouvement fluide laisse une traînée régulière,
	// un saut laisse deux images séparées, un élément immobile reste net.
	ffmpeg(['-i', video, '-vf', `tmix=frames=8,fps=2,scale=240:-2,tile=6x${Math.ceil(cells / 6)}:padding=4:color=#202020`, '-frames:v', '1', `${dir}/motion.jpg`]);
	images = 'contact.jpg, strip.jpg, phone-360.jpg, loop.jpg, motion.jpg';
} else {
	console.warn(`⚠ ffmpeg complet absent : images séparées au lieu des planches. ${FFMPEG_HINT}`);
	const frames = `${dir}/frames`;
	rmSync(frames, {recursive: true, force: true});
	mkdirSync(frames, {recursive: true});
	for (let t = 0; t < dur; t += 0.5) {
		ffmpeg(['-ss', t.toFixed(2), '-i', video, '-frames:v', '1', '-vf', 'scale=360:-2', `${frames}/t${t.toFixed(1).padStart(5, '0')}.jpg`]);
	}
	images = 'frames/ (une image toutes les 0,5 s, 360 px de large = test téléphone)';
}

// Loudness via loudnorm (disponible dans tous les ffmpeg, y compris celui de Remotion).
const log = ffmpeg(['-nostats', '-loglevel', 'info', '-i', video, '-vn', '-af', 'loudnorm=I=-14:TP=-1:print_format=json', '-c:a', 'pcm_s16le', '-f', 'null', '-'], {capture: true});
const json = JSON.parse(log.slice(log.lastIndexOf('{'), log.lastIndexOf('}') + 1));
const tech = `# Fiche technique — ${id}
- Fichier : ${video}
- Durée : ${dur.toFixed(2)} s
- Vidéo (codec, largeur, hauteur, pix_fmt, fps) : ${info}
- Loudness : ${json.input_i} LUFS intégrés · crête ${json.input_tp} dBTP (cible -14 LUFS, crête ≤ -1 dBTP)
- Images : ${images}
`;
// Courbes d'activité et de vitesse depuis le dernier rapport QA (final de préférence).
const report = [`${dir}/qa.json`, `${dir}/preflight.json`].find(existsSync);
let charts = 'aucune (lancer npm run qa avant npm run critic)';
if (report) {
	const qa = JSON.parse(readFileSync(report, 'utf8'));
	const n = Math.round(dur * (qa.series?.fps ?? 30));
	writeFileSync(`${dir}/activite.svg`, activitySvg(qa.series, n, `Activité — ${id}`));
	writeFileSync(`${dir}/vitesses.svg`, speedSvg(qa.series, n, `Vitesses — ${id}`));
	charts = `activite.svg, vitesses.svg (depuis ${path.basename(report)}, une frame sur ${qa.step})`;
}
writeFileSync(`${dir}/tech.md`, `${tech}- Courbes : ${charts}\n`);
console.log(tech);
