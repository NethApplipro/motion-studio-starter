import {test} from 'node:test';
import assert from 'node:assert/strict';
import {plan} from './ci-plan.mjs';

const slugs = ['premier-jour', 'coffre-fort'];
test('un fichier du film coffre-fort ne relance que ce film', () => {
	assert.deepEqual(plan(['src/films/coffre-fort/timeline.ts', 'films/coffre-fort/brief.md'], slugs), {films: ['CoffreFort'], visual: true});
	assert.deepEqual(plan(['reviews/CoffreFort-1x1/review.json'], slugs), {films: ['CoffreFort'], visual: true});
});
test('le code partagé relance tous les films', () => {
	for (const f of ['src/components/style/Morph.tsx', 'scripts/qa.mjs', 'brand/brand.json', 'package-lock.json', 'src/films/registry.ts']) {
		assert.deepEqual(plan([f], slugs).films, ['PremierJour', 'CoffreFort'], f);
	}
});
test('la documentation seule ne relance rien', () => {
	assert.deepEqual(plan(['README.md', 'docs/BRIEFER.md', 'references/styles/morph-continu.md', 'evals/RESULTATS.md', '.github/workflows/codex-review.yml'], slugs), {films: [], visual: false});
});
