// Voix off d'un film depuis films/<slug>/voix.json (seule source du texte dit ET des sous-titres parlés).
//   npm run voice -- coffre-fort            → ElevenLabs (clé ELEVENLABS_API_KEY et ELEVENLABS_VOICE_ID dans .env)
//   npm run voice -- coffre-fort --essai    → sans clé : silence de la bonne durée et minutage estimé, pour monter le film
// Écrit public/voice/<slug>/<id>.mp3 et src/films/<slug>/voix.generated.ts (minutage mot par mot, importé par le film).
// Appel réseau ici seulement, jamais pendant le rendu. Re-lancer après chaque changement de texte.
import {existsSync, mkdirSync, readFileSync, writeFileSync} from 'node:fs';
import {ffmpeg, ffprobe, parseArgs} from './lib.mjs';
import {estimateWords, wordsFromAlignment} from './voice-alignment.mjs';

try { process.loadEnvFile?.('.env'); } catch {}
const {flags, rest} = parseArgs();
const [slug] = rest;
if (!slug) throw new Error('Usage : npm run voice -- <slug> [--essai]');
const spec = JSON.parse(readFileSync(`films/${slug}/voix.json`, 'utf8'));
const key = process.env.ELEVENLABS_API_KEY;
const voiceId = spec.voix || process.env.ELEVENLABS_VOICE_ID;
const essai = flags.essai === true;
if (!essai && (!key || !voiceId)) {
	console.error('✗ ELEVENLABS_API_KEY et ELEVENLABS_VOICE_ID (ou "voix" dans voix.json) sont requis. Sans clé : --essai.');
	process.exit(1);
}
const out = `public/voice/${slug}`;
mkdirSync(out, {recursive: true});
const lines = [];
for (const line of spec.lignes) {
	const file = `${out}/${line.id}.mp3`;
	let words;
	if (essai) {
		words = estimateWords(line.texte);
		ffmpeg(['-f', 'lavfi', '-i', 'anullsrc=r=44100:cl=mono', '-t', String(words.at(-1).end + 0.3), '-c:a', 'libmp3lame', '-b:a', '64k', file]);
	} else {
		const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/with-timestamps?output_format=mp3_44100_128`, {
			method: 'POST',
			headers: {'xi-api-key': key, 'Content-Type': 'application/json'},
			body: JSON.stringify({text: line.texte, model_id: spec.modele ?? 'eleven_multilingual_v2', voice_settings: spec.reglages}),
		});
		if (!res.ok) throw new Error(`ElevenLabs ${res.status} pour « ${line.id} » : ${(await res.text()).slice(0, 300)}`);
		const data = await res.json();
		writeFileSync(file, Buffer.from(data.audio_base64, 'base64'));
		words = wordsFromAlignment(data.alignment);
	}
	const duration = Number(ffprobe(['-show_entries', 'format=duration', '-of', 'csv=p=0', file]));
	lines.push({id: line.id, at: line.at, src: `voice/${slug}/${line.id}.mp3`, duration: Math.round(duration * 1000) / 1000, texte: line.texte, words});
	console.log(`✓ ${file} (${duration.toFixed(2)} s, ${words.length} mots)`);
}
const ts = `// Généré par npm run voice -- ${slug}${essai ? ' --essai' : ''}. Ne pas modifier : changer films/${slug}/voix.json et relancer.
import type {VoiceLine} from '../../components/Voice';

export const VOIX_ESSAI = ${essai};
export const VOIX: VoiceLine[] = ${JSON.stringify(lines, null, '\t')};
`;
writeFileSync(`src/films/${slug}/voix.generated.ts`, ts);
if (essai) console.log('⚠ Mode essai : voix muette et minutage estimé. Ne pas livrer en cible « public ».');
if (!existsSync('public/audio/LICENCES.md')) console.log('⚠ Penser à consigner la voix dans public/audio/LICENCES.md.');
