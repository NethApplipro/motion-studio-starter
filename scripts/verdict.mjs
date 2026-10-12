// Verdict de livraison calculé (et non déclaré) à partir de qa.json (technique) et review.json (critique).
//   npm run verdict -- Demo            → 3 formats
//   npm run verdict -- Demo 9x16       → un format (utilisé en CI, un job par format)
// Régénère reviews/<id>/review.md depuis review.json. Code de sortie 1 si un format n'est pas livrable pour sa cible.
// Règles : scripts/review-validation.mjs. La cible vient du brief (films/<slug>/brief.md), jamais des critiques.
// Le rapport technique doit porter sur ce rendu et sur le MP4 actuel (empreinte SHA-256 enregistrée par npm run qa).
// Cible « public » → chaque format doit être visionné et LIVRABLE.
// Film en ébauche (« Étape : ébauche » dans le brief) → toujours refusé : une ébauche ne se livre pas.
// Cible « interne » → au moins un format visionné (PILOTE INTERNE accepté), les autres doivent passer la QA finale.
import {existsSync, readFileSync, writeFileSync} from 'node:fs';
import {filmSlug, FORMATS, parseArgs, sha256File} from './lib.mjs';
import {briefEtape, MESSAGE_EBAUCHE} from './etape.mjs';
import {briefCible, qaRaisons, reviewErrors, reviewMarkdown, verdict} from './review-validation.mjs';

const {rest} = parseArgs();
const [film, ...only] = rest;
if (!film) throw new Error('Usage : npm run verdict -- <Film> [formats…]');
const formats = only.length ? only : FORMATS;
const read = (p) => (existsSync(p) ? JSON.parse(readFileSync(p, 'utf8')) : null);

const reviews = Object.fromEntries(FORMATS.map((f) => [f, read(`reviews/${film}-${f}/review.json`)]).filter(([, r]) => r));
let failed = false;
const fail = (msg) => { failed = true; console.log(`✗ ${msg}`); };

if (!Object.keys(reviews).length) fail(`${film} : aucun review.json. Faire critiquer un rendu (sous-agent motion-critic ou passe dédiée).`);
for (const [f, r] of Object.entries(reviews)) {
	const errors = reviewErrors(r);
	if (r.id !== `${film}-${f}`) errors.push(`id ${r.id} ne correspond pas au dossier ${film}-${f}.`);
	if (errors.length) { fail(`${film}-${f}/review.json invalide :\n  - ${errors.join('\n  - ')}`); delete reviews[f]; }
}
const briefPath = `films/${filmSlug(film)}/brief.md`;
const brief = existsSync(briefPath) ? readFileSync(briefPath, 'utf8') : null;
if (briefEtape(brief).etape === 'ebauche') {
	console.log(`✗ ${film} : ${MESSAGE_EBAUCHE}`);
	process.exit(1);
}
const cible = briefCible(brief);
if (!cible) fail(`${film} : cible absente de ${briefPath} (« Cible : public » ou « Cible : interne »).`);

for (const f of formats) {
	const id = `${film}-${f}`;
	const qa = read(`reviews/${id}/qa.json`);
	const ctx = {id, videoSha256: sha256File(`out/${id}.mp4`), cible};
	const review = reviews[f];
	if (review) {
		const v = verdict(review, qa, ctx);
		writeFileSync(`reviews/${id}/review.md`, reviewMarkdown(review, v));
		if (v.accepte) console.log(`✓ ${id} : ${v.statut} (moyenne ${v.moyenne}, cible ${v.cible})`);
		else fail(`${id} : ${v.statut}\n  - ${v.raisons.join('\n  - ')}`);
		continue;
	}
	if (cible !== 'interne') { fail(`${id} : jamais visionné. Une diffusion publique exige une critique par format.`); continue; }
	const raisons = qaRaisons(qa, ctx);
	if (raisons.length) fail(`${id} : ${raisons.join(' ')} (npm run qa -- ${film} ${f}).`);
	else console.log(`⚠ ${id} : QA finale réussie, format non visionné (accepté pour un usage interne).`);
}
process.exit(failed ? 1 : 0);
