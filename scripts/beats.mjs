// Grille des temps d'une piste musicale (tempo, décalage, frame de chaque temps), pour caler le film dessus.
//   npm run beats -- public/audio/ma-musique.mp3
// → public/audio/ma-musique.beats.json. Dans timeline.ts :
//   import grille from '../../../public/audio/ma-musique.beats.json';  puis  musicBeat(grille, 12)
// Vérifier à l'oreille : un tempo double ou moitié reste possible sur une musique sans batterie (--bpm=… pour forcer).
import {readFileSync, rmSync, writeFileSync} from 'node:fs';
import path from 'node:path';
import {detectBeats} from './beat-detection.mjs';
import {ffmpeg, parseArgs} from './lib.mjs';

const {flags, rest} = parseArgs();
const [file] = rest;
if (!file) throw new Error('Usage : npm run beats -- <fichier audio> [--bpm=120]');
const raw = `${file}.tmp.f32`;
const SR = 22050;
ffmpeg(['-i', file, '-ac', '1', '-ar', String(SR), '-f', 'f32le', raw]);
const buf = readFileSync(raw);
rmSync(raw);
const samples = new Float32Array(buf.buffer, buf.byteOffset, buf.length / 4);
const opts = flags.bpm ? {minBpm: Number(flags.bpm), maxBpm: Number(flags.bpm)} : {};
const grid = detectBeats(samples, SR, opts);
const out = path.join(path.dirname(file), `${path.basename(file, path.extname(file))}.beats.json`);
writeFileSync(out, `${JSON.stringify({source: path.basename(file), ...grid}, null, 2)}\n`);
console.log(`✓ ${out} : ${grid.bpm} BPM, premier temps à ${grid.offset} s, ${grid.beats.length} temps (${grid.framesPerBeat} frames par temps)`);
if (Math.abs(grid.framesPerBeat - 15) > 0.01) console.log('⚠ Tempo différent de 120 BPM : utiliser musicBeat() de src/lib/music.ts plutôt que beat() dans timeline.ts.');
