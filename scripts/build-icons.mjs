// Génère src/components/app/remix.ts à partir du paquet remixicon (iconographie officielle Nova).
// Ajouter un nom d'icône dans ICONS puis : node scripts/build-icons.mjs
import {readFileSync, writeFileSync, readdirSync} from 'node:fs';
import {join} from 'node:path';

const ICONS = {
	home: 'home-5-line', homeFill: 'home-5-fill', book: 'book-open-line', news: 'newspaper-line', chat: 'chat-3-line',
	tools: 'apps-2-line', user: 'user-line', bell: 'notification-3-line', doc: 'file-text-line', pen: 'quill-pen-line',
	link: 'external-link-line', check: 'check-line', arrow: 'arrow-right-line', back: 'arrow-left-s-line',
	search: 'search-line', mail: 'mail-line', spark: 'sparkling-2-fill', pdf: 'file-pdf-2-line', lock: 'safe-2-line',
	folder: 'folder-line', upload: 'upload-cloud-2-line', onboarding: 'layout-left-line', interview: 'user-voice-line', form: 'survey-line', contacts: 'contacts-book-line',
};

const root = 'node_modules/remixicon/icons';
const index = new Map();
for (const dir of readdirSync(root)) for (const f of readdirSync(join(root, dir))) index.set(f.replace('.svg', ''), join(root, dir, f));

const out = {};
for (const [key, name] of Object.entries(ICONS)) {
	const file = index.get(name);
	if (!file) throw new Error(`Icône introuvable : ${name}`);
	const svg = readFileSync(file, 'utf8');
	out[key] = [...svg.matchAll(/<path d="([^"]+)"/g)].map((m) => m[1]);
}
writeFileSync('src/components/app/remix.ts', `// Fichier généré par scripts/build-icons.mjs — Remix Icon (Apache 2.0).\nexport const REMIX = ${JSON.stringify(out, null, '\t')} as const;\n`);
console.log(`${Object.keys(out).length} icônes écrites`);
