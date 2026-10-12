import {test} from 'node:test';
import assert from 'node:assert/strict';
import {briefEtape, ciMatrix} from './etape.mjs';

test('sans ligne Étape, le film est en étape finale', () => {
	assert.deepEqual(briefEtape(null), {etape: 'final', declare: false, formatMaitre: '9x16'});
	assert.equal(briefEtape('Formats : 9:16 · 1:1 · 16:9').etape, 'final');
});
test('ébauche reconnue avec ou sans accent, en ligne ou en tableau', () => {
	assert.equal(briefEtape('Étape : ébauche').etape, 'ebauche');
	assert.equal(briefEtape('Etape : ebauche').etape, 'ebauche');
	assert.equal(briefEtape('| **Étape** | ébauche (direction à valider) |').etape, 'ebauche');
	assert.equal(briefEtape('Étape : final').etape, 'final');
});
test('le format maître est le premier de la ligne Formats', () => {
	assert.equal(briefEtape('Formats : 16:9 · 9:16\nÉtape : ébauche').formatMaitre, '16x9');
	assert.equal(briefEtape('| **Formats** | 1x1, 9x16 |').formatMaitre, '1x1');
	assert.equal(briefEtape('Étape : ébauche').formatMaitre, '9x16');
});
test('la CI ne fait qu’un précontrôle du format maître pour une ébauche', () => {
	const etapes = {Pilote: {etape: 'ebauche', formatMaitre: '9x16'}, CoffreFort: {etape: 'final', formatMaitre: '9x16'}};
	assert.deepEqual(ciMatrix(['Pilote', 'CoffreFort'], 'complet', etapes), [
		{film: 'Pilote', format: '9x16', niveau: 'leger'},
		{film: 'CoffreFort', format: '9x16', niveau: 'complet'},
		{film: 'CoffreFort', format: '1x1', niveau: 'complet'},
		{film: 'CoffreFort', format: '16x9', niveau: 'complet'},
	]);
	assert.equal(ciMatrix(['CoffreFort'], 'leger').every((e) => e.niveau === 'leger'), true);
});
