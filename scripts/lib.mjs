// Outils partagés par tous les scripts : navigateur, ffmpeg, bundle et compositions.
// Fonctionne sous macOS, Linux, Windows, Codex et Claude Code, sans ffmpeg installé (Remotion embarque le sien).
import {bundle} from '@remotion/bundler';
import {getCompositions, RenderInternals, selectComposition} from '@remotion/renderer';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {existsSync, readFileSync} from 'node:fs';
import path from 'node:path';

const isWin = process.platform === 'win32';

// --- Navigateur headless -----------------------------------------------------------------
// Ordre : REMOTION_BROWSER, CHROME_PATH, Chromium Playwright local, sinon celui que Remotion télécharge
// (npm run setup le prépare).
const BROWSER_CANDIDATES = [
	process.env.REMOTION_BROWSER,
	process.env.CHROME_PATH,
	'/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell',
];
export const browserExecutable = BROWSER_CANDIDATES.find((p) => p && existsSync(p)) ?? null;

// --- ffmpeg / ffprobe -----------------------------------------------------------------------
// ffmpeg système s'il existe (ou variables FFMPEG / FFPROBE), sinon le binaire embarqué par Remotion.
const hasSystem = (bin) => spawnSync(bin, ['-version'], {stdio: 'ignore'}).status === 0;
const SYSTEM = {
	ffmpeg: process.env.FFMPEG ?? (hasSystem('ffmpeg') ? 'ffmpeg' : null),
	ffprobe: process.env.FFPROBE ?? (hasSystem('ffprobe') ? 'ffprobe' : null),
};

const bundled = (type) => {
	const binary = RenderInternals.getExecutablePath({type, indent: false, logLevel: 'error', binariesDirectory: null});
	RenderInternals.makeFileExecutableIfItIsNot(binary);
	const lib = path.dirname(RenderInternals.getExecutablePath({type: 'compositor', indent: false, logLevel: 'error', binariesDirectory: null}));
	const env = {...process.env};
	if (process.platform === 'darwin') env.DYLD_LIBRARY_PATH = lib;
	else if (isWin) env.PATH = `${lib};${process.env.PATH}`;
	else env.LD_LIBRARY_PATH = lib;
	return {binary, env};
};

const run = (type, args, {capture = false} = {}) => {
	const {binary, env} = SYSTEM[type] ? {binary: SYSTEM[type], env: process.env} : bundled(type);
	const res = spawnSync(binary, args, {encoding: 'utf8', env, stdio: capture ? 'pipe' : ['ignore', 'inherit', 'inherit'], maxBuffer: 64 * 1024 * 1024});
	if (res.status !== 0) throw new Error(`${type} a échoué (${binary} ${args.join(' ')})\n${res.stderr ?? res.error ?? ''}`);
	return `${res.stdout ?? ''}${res.stderr ?? ''}`;
};
/** true si un ffmpeg complet est disponible (planches, critique). Le binaire Remotion suffit pour rendre et normaliser le son. */
export const hasFullFfmpeg = Boolean(SYSTEM.ffmpeg);
export const FFMPEG_HINT = 'Installer ffmpeg pour les planches : macOS « brew install ffmpeg » · Windows « winget install ffmpeg » · Linux/Codex « apt-get install -y ffmpeg ».';
export const ffmpeg = (args, opts) => run('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', ...args], opts);
export const ffprobe = (args) => run('ffprobe', ['-v', 'error', ...args], {capture: true}).trim();

// --- Bundle et compositions ----------------------------------------------------------------
let served;
export const getBundle = async () => (served ??= await bundle({entryPoint: path.resolve('src/index.ts')}));

export const getComposition = async (id, inputProps = {}) => {
	const serveUrl = await getBundle();
	const composition = await selectComposition({serveUrl, id, inputProps, browserExecutable});
	return {serveUrl, composition};
};

export const listCompositions = async () => getCompositions(await getBundle(), {browserExecutable});

export const FORMATS = ['9x16', '1x1', '16x9'];

/** Demo → demo (dossier films/<slug>/ et src/films/<slug>/). */
export const filmSlug = (film) => film.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();

/** Lit `--cle=valeur` et les arguments positionnels. */
export const parseArgs = (argv = process.argv.slice(2)) => {
	const flags = {};
	const rest = [];
	for (const a of argv) {
		const m = a.match(/^--([^=]+)(?:=(.*))?$/);
		if (m) flags[m[1]] = m[2] ?? true;
		else rest.push(a);
	}
	return {flags, rest};
};

/** Assemble des images en planche (grille), quel que soit leur nombre. */
export const tile = (files, output, {cols = 5, width = 360} = {}) => {
	if (!hasFullFfmpeg) {
		console.warn(`⚠ planche non générée (ffmpeg complet absent), images séparées disponibles. ${FFMPEG_HINT}`);
		return false;
	}
	const inputs = files.flatMap((f) => ['-i', f]);
	const scaled = files.map((_, i) => `[${i}]scale=${width}:-2,setsar=1[v${i}]`).join(';');
	const pos = files.map((_, i) => {
		const c = i % cols;
		const r = Math.floor(i / cols);
		const x = c ? Array.from({length: c}, () => 'w0').join('+') : '0';
		const y = r ? Array.from({length: r}, () => 'h0').join('+') : '0';
		return `${x}_${y}`;
	});
	const stack = files.length === 1 ? `[v0]null` : `${files.map((_, i) => `[v${i}]`).join('')}xstack=inputs=${files.length}:layout=${pos.join('|')}:fill=#202020`;
	ffmpeg([...inputs, '-filter_complex', `${scaled};${stack}`, '-frames:v', '1', output]);
	return true;
};

/** Empreinte SHA-256 d'un fichier, ou null s'il n'existe pas (relie un rapport QA au MP4 exact qu'il a contrôlé). */
export const sha256File = (path) => (existsSync(path) ? createHash('sha256').update(readFileSync(path)).digest('hex') : null);
