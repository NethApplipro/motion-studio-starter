// Contrôles automatiques d'un film produit par un agent (évals du skill, voir evals/README.md).
//   npm run eval -- <slug>      ex. npm run eval -- coffre-fort
// Ne juge pas la qualité créative (critique et lecture humaine) : vérifie que le pipeline a été suivi.
import {build} from 'esbuild';
import {existsSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync} from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {FORMATS, parseArgs, sha256File} from './lib.mjs';
import {briefCible, reviewErrors, verdict} from './review-validation.mjs';
import {TARGETS} from './visual-targets.mjs';

const {rest} = parseArgs();
const [slug] = rest;
if (!slug) throw new Error('Usage : npm run eval -- <slug>');
const Name = slug.split('-').map((s) => s[0].toUpperCase() + s.slice(1)).join('');
const read = (p) => (existsSync(p) ? readFileSync(p, 'utf8') : null);
const results = [];
const check = (label, ok, detail = '') => results.push({label, ok, detail});

// 1. Documents de préparation.
const brief = read(`films/${slug}/brief.md`);
check('brief.md rempli', Boolean(brief) && !/<titre du film>|\(ex\. /.test(brief), brief ? '' : 'absent');
const cible = briefCible(brief);
check('cible déclarée (public ou interne)', Boolean(cible));
check('shotlist.md présente', Boolean(read(`films/${slug}/shotlist.md`)?.match(/\|\s*\d/)));

// 2. Code du film.
const dir = `src/films/${slug}`;
const sources = existsSync(dir) ? readdirSync(dir).filter((f) => /\.tsx?$/.test(f) && !f.includes('.generated.')).map((f) => read(`${dir}/${f}`)).join('\n') : '';
check('film enregistré dans registry.ts', read('src/films/registry.ts')?.includes(`'./${slug}/`) ?? false);
const hex = [...sources.matchAll(/#[0-9a-fA-F]{6}\b/g)].map((m) => m[0].toUpperCase()).filter((h) => h !== '#FFFFFF');
check('aucune couleur codée en dur', hex.length === 0, hex.join(', '));
check('aucune source non déterministe', !/Math\.random|Date\.now|new Date|setTimeout|requestAnimationFrame/.test(sources));
const catalog = read('src/components/app/catalog.ts') ?? '';
const screens = [...sources.matchAll(/\b(\w+Screen)\b/g)].map((m) => m[1]).filter((s, i, a) => a.indexOf(s) === i);
const unknown = screens.filter((s) => !catalog.includes(s));
check('écrans montrés présents dans le catalogue', unknown.length === 0, unknown.join(', '));

// 3. Chronologie : chaque son tombe dans le film.
try {
	const tmp = mkdtempSync(path.join(os.tmpdir(), 'eval-'));
	await build({entryPoints: [`${dir}/timeline.ts`], bundle: true, format: 'esm', platform: 'node', outfile: `${tmp}/t.mjs`, logLevel: 'silent'});
	const {DURATION, SFX = []} = await import(pathToFileURL(`${tmp}/t.mjs`).href);
	rmSync(tmp, {recursive: true, force: true});
	const outside = SFX.filter((s) => s.at < 0 || s.at >= DURATION);
	check('sons calés dans la durée du film', outside.length === 0, outside.map((s) => `${s.file}@${s.at}`).join(', '));
} catch (error) { check('timeline.ts lisible', false, error.message.slice(0, 160)); }

// 4. Tests visuels.
check('film ajouté aux tests visuels (scripts/visual-targets.mjs)', Object.keys(TARGETS).some((id) => id.startsWith(`${Name}-`)));

// 5. Contrôles et verdict, pour chaque format rendu.
const rendered = FORMATS.filter((f) => existsSync(`out/${Name}-${f}.mp4`));
check('au moins un format rendu', rendered.length > 0);
for (const f of rendered) {
	const id = `${Name}-${f}`;
	const qa = JSON.parse(read(`reviews/${id}/qa.json`) ?? 'null');
	check(`${id} : QA finale réussie`, qa?.mode === 'final' && qa.technicalPassed === true, qa ? JSON.stringify(Object.fromEntries(Object.entries(qa.counts).filter(([, v]) => v)) ) : 'qa.json absent');
	const review = JSON.parse(read(`reviews/${id}/review.json`) ?? 'null');
	// Même règle que npm run verdict : cible public → chaque format critiqué ; interne → au moins un (contrôlé plus bas).
	if (!review) { check(`${id} : critique écrite`, cible !== 'public', 'review.json absent (accepté pour une cible interne)'); continue; }
	const errors = reviewErrors(review);
	check(`${id} : review.json valide`, errors.length === 0, errors.join(' ; '));
	check(`${id} : critique par un regard séparé`, !/fabricant|moi-même/i.test(review.critique ?? ''), review.critique);
	if (!errors.length) {
		const v = verdict(review, qa, {id, videoSha256: sha256File(`out/${id}.mp4`), cible});
		check(`${id} : verdict accepté (${v.statut})`, v.accepte, v.raisons.join(' ; '));
	}
}

check('au moins un format critiqué', rendered.some((f) => existsSync(`reviews/${Name}-${f}/review.json`)));

const ok = results.filter((r) => r.ok).length;
const md = `# Éval automatique — ${slug}\n\n${ok}/${results.length} contrôles réussis.\n\n| | Contrôle | Détail |\n|---|---|---|\n${results.map((r) => `| ${r.ok ? '✅' : '❌'} | ${r.label} | ${r.detail ?? ''} |`).join('\n')}\n`;
writeFileSync(`reviews/eval-${slug}.md`, md);
console.log(md);
process.exit(ok === results.length ? 0 : 1);
