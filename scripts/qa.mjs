// Capteurs automatiques : le film ne sort que si tous les compteurs sont à zéro.
//   npm run qa -- Demo                 → 3 formats
//   npm run qa -- Demo 9x16 --preflight --step=3 → précontrôle échantillonné, sans MP4
//   npm run qa -- MonFilm 1x1 --jobs=4      → 4 frames rendues en parallèle (défaut : nombre de cœurs, 4 au plus)
//   npm run qa -- MonFilm --loop              → ajoute le test de boucle (première = dernière image (test strict))
// Écrit reviews/<Film>-<format>/qa.json et qa.md. Code de sortie 1 si un compteur n'est pas à zéro.
import {renderFrames, renderStill} from '@remotion/renderer';
import os from 'node:os';
import {qaOptions, videoIssues} from './qa-validation.mjs';
import {audioLevelIssues, briefAudio, expectedAudioCodec} from './audio-mode.mjs';
import {readingWarnings} from './reading-time.mjs';
import {createHash} from 'node:crypto';
import {existsSync, mkdirSync, readFileSync, writeFileSync} from 'node:fs';
import {browserExecutable, filmSlug, FORMATS, ffmpeg, ffprobe, getComposition, parseArgs, sha256File} from './lib.mjs';
import {activity, calmSpans, lumaGrid, saccades, SEUIL_ACTIVITE} from './motion-analysis.mjs';

const {flags, rest} = parseArgs();
const [film = 'Demo', ...only] = rest;
const formats = only.length ? only : FORMATS;
const {preflight, step} = qaOptions(flags, formats);
// Onglets en parallèle : --jobs=N, sinon autant que de cœurs (4 au plus, la mémoire suit vite).
const jobs = Number(flags.jobs ?? Math.max(1, Math.min(4, os.cpus().length)));
// Réglages propres au film (films/<slug>/qa.json), ex. {"maxGapSeconds": 2} pour un style rapide.
const filmQa = existsSync(`films/${filmSlug(film)}/qa.json`) ? JSON.parse(readFileSync(`films/${filmSlug(film)}/qa.json`, 'utf8')) : {};
const maxGap = Number(filmQa.maxGapSeconds ?? 4);
// Mode audio du brief (« Son : silencieux | effets | mix ») : décide de la piste attendue et du contrôle du son.
const briefPath = `films/${filmSlug(film)}/brief.md`;
const audio = briefAudio(existsSync(briefPath) ? readFileSync(briefPath, 'utf8') : null);

// Chaque compteur, avec la consigne de correction donnée à l'agent.
const COUNTERS = {
	erreurs: 'Erreur JavaScript pendant le rendu : lire le message, corriger le composant concerné.',
	texteHorsCadre: "Un texte important sort de l'image : revoir la table LAYOUT du format (position, largeur, taille).",
	texteHorsZoneSure: "Un texte important est sous l'interface des réseaux (9:16 : 220 px en haut, 420 px en bas, 150 px à droite) ou trop près du bord : le déplacer dans LAYOUT.",
	texteTropPetit: 'Texte illisible sur téléphone : sous-titres ≥ 58 px, autres textes ≥ 30 px (en 1080).',
	chevauchement: "Deux textes visibles se superposent : décaler les timings d'entrée/sortie (timeline.ts) ou les positions.",
	couleurHorsCharte: 'Couleur absente de brand/brand.json : utiliser C.<couleur> (src/lib/brand.ts), jamais une couleur en dur.',
	tempsMort: "Image figée plus de 4 s : ajouter un événement (règle : un événement toutes les 2 à 4 s).",
	densiteEvenements: "Passage trop calme (seule une dérive lente bouge) : ajouter un événement visible dans timeline.ts, ou régler maxGapSeconds dans films/<slug>/qa.json si le style le justifie.",
	saccade: "Mouvement cassé (saut, déplacement trop rapide sans flou, ou arrêt sec) : utiliser sp()/track() au lieu d'une interpolation linéaire bornée, envelopper les sorties rapides dans <MotionBlur> (src/components/style), ou ralentir le ressort.",
	nonDeterministe: "La même frame rendue deux fois diffère : chercher Math.random, Date, état React, transition CSS.",
	boucle: "La dernière image ne rejoint pas la première : aligner l'état final sur l'état initial.",
	fichierVideo: 'Le MP4 ne respecte pas la fiche technique : relancer npm run render (H.264, yuv420p bt709, AAC, durée exacte).',
	loudness: 'Son hors cible (-14 LUFS ±1, crête ≤ -1 dBTP) : relancer npm run render, vérifier les volumes dans timeline.ts.',
};

let failed = false;
for (const format of formats) {
	const id = `${film}-${format}`;
	const {serveUrl, composition} = await getComposition(id);
	const {durationInFrames: n, fps} = composition;
	const counts = Object.fromEntries(Object.keys(COUNTERS).map((k) => [k, 0]));
	const details = [];
	if (preflight) { counts.fichierVideo = null; counts.loudness = null; }
	if (audio.mode === 'silencieux') counts.loudness = null;
	if (!flags.loop) counts.boucle = null;
	// Les trajectoires exigent des frames consécutives : en précontrôle échantillonné, lancer --step=1 pour les voir.
	if (step > 1) counts.saccade = null;
	const add = (type, frame, detail) => {
		counts[type]++;
		if (details.filter((d) => d.type === type).length < 12) details.push({type, frame, t: frame === null ? null : +(frame / fps).toFixed(2), detail});
	};

	const frames = [];
	for (let f = 0; f < n; f += step) frames.push(f);
	if (frames.at(-1) !== n - 1) frames.push(n - 1);

	// Rendu des frames en parallèle dans un seul navigateur (jobs onglets) : chaque frame arrive avec son image et le
	// rapport du capteur ; l'analyse se fait ensuite dans l'ordre des frames.
	const rendered = new Map();
	const reports = new Map();
	let done = 0;
	await renderFrames({
		serveUrl, composition, inputProps: composition.props ?? {}, frames, outputDir: null, imageFormat: 'jpeg', jpegQuality: 80,
		concurrency: jobs, browserExecutable, logLevel: 'error', muted: true, envVariables: {REMOTION_QA: '1'},
		onStart: () => {},
		onFrameUpdate: () => process.stdout.write(`\r${id} : ${++done}/${frames.length} frames (${jobs} en parallèle)`),
		onBrowserLog: (log) => {
			if (log.text.startsWith('QA:')) {
				const r = JSON.parse(log.text.slice(3));
				reports.set(r.frame, r);
			} else if (log.type === 'error') add('erreurs', null, log.text.slice(0, 300));
		},
		onFrameBuffer: (buffer, frame) => {
			rendered.set(frame, {hash: createHash('sha1').update(buffer).digest('hex'), grid: lumaGrid(buffer)});
		},
	}).catch((e) => add('erreurs', null, String(e.message ?? e).slice(0, 300)));
	process.stdout.write('\n');

	const hashes = [];
	const trajectoires = {};
	const lectures = [];
	const activite = [];
	let prevGrid = null;
	let prevFrame = null;
	let lastIssues = new Map();
	let measured = 0;
	for (const frame of frames) {
		const image = rendered.get(frame);
		hashes.push({frame, hash: image?.hash ?? null});
		// Un même défaut présent sur plusieurs frames consécutives compte une seule fois.
		const report = reports.get(frame);
		if (report?.measured) measured++;
		for (const [name, [x, y, o, flou]] of Object.entries(report?.motion ?? {})) (trajectoires[name] ??= []).push([frame, x, y, o, flou]);
		lectures.push({frame, textes: report?.textes ?? {}});
		if (image) {
			activite.push([frame, prevGrid ? +activity(prevGrid, image.grid, frame - prevFrame).toFixed(2) : SEUIL_ACTIVITE]);
			prevGrid = image.grid;
			prevFrame = frame;
		}
		const current = new Map();
		for (const issue of report?.issues ?? []) {
			const key = `${issue.type}|${issue.detail.replace(/\d+(\.\d+)? px/g, '')}`;
			current.set(key, issue);
			if (!lastIssues.has(key)) add(issue.type, frame, issue.detail);
		}
		lastIssues = current;
	}
	// Garde-fou : un capteur qui n'a rien mesuré ne doit jamais afficher « zéro défaut ».
	if (measured < frames.length) add('erreurs', null, `Capteur QA : ${frames.length - measured} frame(s) non mesurée(s) sur ${frames.length}. Vérifier que le film passe par withQA (src/Root.tsx).`);

	// Temps mort : images identiques sur plus de 4 s.
	let runStart = 0;
	for (let i = 1; i <= hashes.length; i++) {
		if (i < hashes.length && hashes[i].hash && hashes[i].hash === hashes[runStart].hash) continue;
		const span = (hashes[i - 1].frame - hashes[runStart].frame) / fps;
		if (span > 4) add('tempsMort', hashes[runStart].frame, `Image identique de ${(hashes[runStart].frame / fps).toFixed(1)} s à ${(hashes[i - 1].frame / fps).toFixed(1)} s (${span.toFixed(1)} s).`);
		runStart = i;
	}

	// Densité d'événements : la première frame compte comme un événement (l'image apparaît).
	for (const issue of calmSpans(activite, {fps, maxGap})) add(issue.type, issue.frame, issue.detail);
	if (step === 1) for (const issue of saccades(trajectoires, composition)) add(issue.type, issue.frame, issue.detail);

	// Plusieurs positions, après parcours du film : contrôle aussi le rendu sans sonde QA.
	for (const index of [...new Set([0, Math.floor(hashes.length / 2), hashes.length - 1])]) {
		const sample = hashes[index];
		try {
			const again = await renderStill({serveUrl, composition, frame: sample.frame, output: null, imageFormat: 'jpeg', jpegQuality: 80, browserExecutable});
			if (!sample.hash || createHash('sha1').update(again.buffer).digest('hex') !== sample.hash) add('nonDeterministe', sample.frame, 'Deux rendus de la même frame diffèrent.');
		} catch (error) { add('erreurs', sample.frame, `Déterminisme : ${error.message}`); }
	}

	// Boucle : test strict d'égalité des images aux extrémités, pas une mesure de fluidité.
	if (flags.loop) {
		const first = hashes[0].hash;
		const last = hashes.at(-1).hash;
		if (!first || !last || last !== first) add('boucle', n - 1, 'Dernière image différente de la première.');
	}

	// Le contrôle de travail ignore explicitement le MP4 ; la validation finale l'exige.
	const video = `out/${id}.mp4`;
	let videoNote = preflight ? 'NON CONTRÔLÉ (précontrôle de travail)' : video;
	if (!preflight) {
		if (!existsSync(video)) {
			add('fichierVideo', null, `MP4 absent : ${video}. Lancer npm run render -- ${film} ${format}.`);
			counts.loudness = null;
			videoNote = 'ABSENT';
		} else {
			try {
				const probe = JSON.parse(ffprobe(['-count_frames', '-show_streams', '-of', 'json', video]));
				for (const detail of videoIssues(probe, composition, expectedAudioCodec(audio))) add('fichierVideo', null, detail);
			} catch (error) { add('fichierVideo', null, `Inspection impossible : ${error.message}`); }
			if (audio.mode !== 'silencieux') try {
				// Mesure seule (loudnorm en analyse) : le mode décide de ce qui est contrôlé (crête seule pour « effets »).
				const log = ffmpeg(['-nostats', '-loglevel', 'info', '-i', video, '-vn', '-af', `loudnorm=I=${audio.cibleLufs}:TP=-1:print_format=json`, '-c:a', 'pcm_s16le', '-f', 'null', '-'], {capture: true});
				const measurement = JSON.parse(log.slice(log.lastIndexOf('{'), log.lastIndexOf('}') + 1));
				for (const detail of audioLevelIssues(measurement, audio)) add('loudness', null, detail);
			} catch (error) { add('loudness', null, `Mesure impossible : ${error.message}`); }
		}
	}

	// Temps de lecture : avertissement à examiner au visionnage, jamais compté dans les défauts.
	const avertissements = readingWarnings(lectures, {fps, step}).map((w) => ({...w, detail: `« ${w.texte} » lisible ${String(w.duree).replace('.', ',')} s à partir de ${String(w.debut).replace('.', ',')} s ; repère indicatif ${String(w.requis).replace('.', ',')} s (${w.mots} mot(s)${w.concurrents ? ` + ${w.concurrents} mot(s) d'autres textes visibles` : ''}).`}));
	const total = Object.values(counts).reduce((a, b) => a + b, 0);
	failed ||= total > 0;
	const dir = `reviews/${id}`;
	const reportName = preflight ? 'preflight' : 'qa';
	mkdirSync(dir, {recursive: true});
	// Empreinte du MP4 contrôlé : le verdict refuse ce rapport si la vidéo a changé depuis.
	const videoSha256 = preflight ? null : sha256File(video);
	writeFileSync(`${dir}/${reportName}.json`, JSON.stringify({id, mode: preflight ? 'preflight' : 'final', technicalPassed: !preflight && total === 0, step, framesChecked: frames.length, counts, details, avertissements, audio, video: videoNote, videoSha256,
		series: {fps, maxGap, seuilActivite: SEUIL_ACTIVITE, activite, trajectoires}}));
	const table = Object.entries(counts).map(([k, v]) => `| ${v === null ? '—' : v === 0 ? '✅' : '❌'} | ${k} | ${v ?? 'non contrôlé'} |`).join('\n');
	const list = details.map((d) => `- **${d.type}**${d.t === null ? '' : ` à ${d.t} s (frame ${d.frame})`} : ${d.detail}\n  → ${COUNTERS[d.type]}`).join('\n');
	const md = `# QA — ${id}\n\n${preflight ? '**PRÉCONTRÔLE — ne valide pas une livraison.**' : '**VALIDATION TECHNIQUE — critique visuelle et sonore séparée obligatoire.**'}\n\n${total === 0 ? '**Aucun défaut détecté dans les contrôles exécutés.**' : `**${total} défaut(s).** Corriger le plus grave, relancer \`npm run qa -- ${film} ${format}\`.`}\n\n| | Compteur | Valeur |\n|---|---|---|\n${table}\n\nFrames contrôlées : ${frames.length} (une sur ${step}). Fichier vidéo : ${videoNote}. Plage calme maximale autorisée : ${maxGap} s.\n${list ? `\n## Détails\n${list}\n` : ''}${avertissements.length ? `\n## Avertissements (non bloquants) : temps de lecture\nRepère indicatif : 1,5 s + 0,3 s par mot, autres textes visibles compris. À juger au visionnage.\n${avertissements.map((a) => `- ${a.detail}`).join('\n')}\n` : ''}\nSon : mode « ${audio.mode} »${audio.declare ? '' : ' (par défaut, non déclaré dans le brief)'}${audio.mode === 'mix' ? `, cible ${audio.cibleLufs} LUFS` : ''}.\n`;
	writeFileSync(`${dir}/${reportName}.md`, md);
	if (list) console.log(list);
	console.log(`${total === 0 ? '✓' : '✗'} ${id} : ${Object.entries(counts).filter(([, v]) => v).map(([k, v]) => `${k}=${v}`).join(', ') || (preflight ? 'précontrôle réussi, MP4 non contrôlé' : 'contrôles techniques réussis')} → ${dir}/${reportName}.md`);
}
process.exit(failed ? 1 : 0);
