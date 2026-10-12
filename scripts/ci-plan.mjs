// Plan de CI : quels films contrôler, et à quel niveau, d'après les fichiers modifiés.
//   node scripts/ci-plan.mjs <base> <head> [--mode=leger|complet]  → JSON {mode, matrix: [{film, format}], visual}
// Règles : un fichier propre à un film (films/<slug>/, src/films/<slug>/, reviews/<Film>-*) ne relance que ce film ;
// tout code partagé (briques, capteurs, charte, scripts, dépendances, CI) relance tous les films ;
// la documentation seule ne relance rien. Un film en ébauche (brief « Étape : ébauche ») n'a qu'un précontrôle de son
// format maître, même sur une PR prête (scripts/etape.mjs).
import {execFileSync} from 'node:child_process';
import {existsSync, readdirSync, readFileSync} from 'node:fs';
import {briefEtape, ciMatrix} from './etape.mjs';
import {parseArgs} from './lib.mjs';

const toName = (slug) => slug.split('-').map((s) => s[0].toUpperCase() + s.slice(1)).join('');

/** Fonction pure (testée) : fichiers modifiés + slugs connus → films à contrôler et besoin des tests visuels. */
export function plan(changed, slugs) {
	const films = new Set();
	let shared = false;
	for (const file of changed) {
		const own = file.match(/^(?:src\/films|films)\/([a-z0-9-]+)\//)?.[1];
		const review = file.match(/^reviews\/([A-Z][A-Za-z0-9]*)-(?:9x16|1x1|16x9)\//)?.[1];
		if (own && slugs.includes(own)) films.add(own);
		else if (review) { const slug = slugs.find((s) => toName(s) === review); if (slug) films.add(slug); }
		else if (/^(src\/|scripts\/|brand\/|public\/|tests\/visual\/|package(-lock)?\.json$|remotion\.config\.ts$|tsconfig\.json$|\.nvmrc$|\.github\/workflows\/motion-quality\.yml$)/.test(file)) shared = true;
		// Le reste (docs, references, evals, *.md, autres workflows) ne change aucune image.
	}
	const selected = shared ? slugs : slugs.filter((s) => films.has(s));
	return {films: selected.map(toName), visual: shared || selected.length > 0};
}

if (import.meta.url === `file://${process.argv[1]}`) {
	const {flags, rest} = parseArgs();
	const [base, head = 'HEAD'] = rest;
	const slugs = readdirSync('src/films', {withFileTypes: true}).filter((d) => d.isDirectory()).map((d) => d.name);
	const changed = base ? execFileSync('git', ['diff', '--name-only', `${base}...${head}`], {encoding: 'utf8'}).split('\n').filter(Boolean) : ['package.json'];
	const p = plan(changed, slugs);
	const mode = flags.mode === 'complet' ? 'complet' : 'leger';
	const etapes = Object.fromEntries(slugs.map((s) => {
		const brief = `films/${s}/brief.md`;
		return [toName(s), briefEtape(existsSync(brief) ? readFileSync(brief, 'utf8') : null)];
	}));
	console.log(JSON.stringify({mode, matrix: ciMatrix(p.films, mode, etapes), visual: p.visual}));
}
