// Synthétise tous les sons du studio en WAV 16 bits / 48 kHz (aucune banque de sons, aucun droit à gérer).
// Sortie : public/audio/*.wav. Relancer après modification : npm run sfx
import {writeFileSync, mkdirSync} from 'node:fs';

const SR = 48000;
const OUT = 'public/audio';
mkdirSync(OUT, {recursive: true});

// Bruit seedé : le même fichier à chaque génération.
let seed = 1234;
const noise = () => {
	seed = (seed * 1664525 + 1013904223) >>> 0;
	return seed / 2147483648 - 1;
};

const wav = (name, samples) => {
	const n = samples.length;
	const buf = Buffer.alloc(44 + n * 2);
	buf.write('RIFF', 0);
	buf.writeUInt32LE(36 + n * 2, 4);
	buf.write('WAVEfmt ', 8);
	buf.writeUInt32LE(16, 16);
	buf.writeUInt16LE(1, 20);
	buf.writeUInt16LE(1, 22);
	buf.writeUInt32LE(SR, 24);
	buf.writeUInt32LE(SR * 2, 28);
	buf.writeUInt16LE(2, 32);
	buf.writeUInt16LE(16, 34);
	buf.write('data', 36);
	buf.writeUInt32LE(n * 2, 40);
	for (let i = 0; i < n; i++) buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, samples[i])) * 32767), 44 + i * 2);
	writeFileSync(`${OUT}/${name}`, buf);
	console.log(`${name}  ${(n / SR).toFixed(2)} s`);
};

const make = (dur, fn) => Float32Array.from({length: Math.round(dur * SR)}, (_, i) => fn(i / SR));
const env = (t, a, d) => (t < a ? t / a : Math.exp(-(t - a) / d));
const lowpass = (x, k) => {
	let y = 0;
	return x.map((v) => (y += k * (v - y)));
};

// Clic d'interface : impulsion courte filtrée.
wav('click.wav', make(0.06, (t) => (Math.sin(2 * Math.PI * 2400 * t) * 0.5 + noise() * 0.5) * env(t, 0.0008, 0.008) * 0.8));

// Pops : sinus avec chute de hauteur.
const pop = (f0) => make(0.18, (t) => Math.sin(2 * Math.PI * f0 * t * (1 - t * 1.6)) * env(t, 0.002, 0.04) * 0.7);
wav('pop.wav', pop(620));
wav('pop-2.wav', pop(760));

// Ticks de validation : trois hauteurs montantes (do, mi, sol) façon « checklist qui avance ».
[1046.5, 1318.5, 1568].forEach((f, i) =>
	wav(`tick-${i + 1}.wav`, make(0.35, (t) => (Math.sin(2 * Math.PI * f * t) + 0.3 * Math.sin(2 * Math.PI * f * 2 * t)) * env(t, 0.003, 0.08) * 0.45)),
);

// Thump : grave court pour l'arrivée du téléphone.
wav('thump.wav', make(0.5, (t) => Math.sin(2 * Math.PI * (55 + 90 * Math.exp(-t * 30)) * t) * env(t, 0.003, 0.12) * 0.9));

// Whoosh / swish : bruit filtré avec enveloppe en cloche.
const whoosh = (dur, k, amp) => {
	const raw = make(dur, () => noise());
	const f = lowpass(raw, k);
	return f.map((v, i) => v * Math.sin((Math.PI * i) / f.length) ** 2 * amp);
};
wav('whoosh.wav', whoosh(0.55, 0.08, 2.2));
wav('swish.wav', whoosh(0.3, 0.2, 1.4));

// Chime de fin : accord majeur avec harmoniques douces.
wav('chime.wav', make(2.2, (t) => [523.25, 659.25, 783.99, 1046.5].reduce((a, f, i) => a + Math.sin(2 * Math.PI * f * t) * env(t, 0.004 + i * 0.01, 0.9) * 0.18, 0)));

// Nappe musicale 120 BPM, 15 s : kick doux sur les temps, charleston sur les contretemps, accord tenu.
const BPM = 120;
const spb = 60 / BPM;
const chords = [
	[220, 277.18, 329.63],
	[196, 246.94, 293.66],
	[174.61, 220, 261.63],
	[196, 246.94, 293.66],
];
wav('bed.wav', make(15, (t) => {
	const b = t / spb;
	const tb = (b % 1) * spb;
	const kick = Math.sin(2 * Math.PI * (48 + 70 * Math.exp(-tb * 40)) * tb) * Math.exp(-tb * 9) * 0.55;
	const off = ((b + 0.5) % 1) * spb;
	const n = noise();
	const hat = n * Math.exp(-off * 60) * 0.06;
	const chord = chords[Math.floor(b / 8) % 4];
	const pad = chord.reduce((a, f) => a + Math.sin(2 * Math.PI * f * t) + 0.25 * Math.sin(2 * Math.PI * f * 2.003 * t), 0) * 0.045 * Math.min(1, t / 1.5);
	return kick + hat + pad;
}));

// Grille des temps, pour caler les animations sur la musique.
writeFileSync(`${OUT}/beats.json`, JSON.stringify({bpm: BPM, fps: 30, framesPerBeat: 15, beats: Array.from({length: 30}, (_, i) => i * 15)}, null, 2));
console.log('beats.json');
