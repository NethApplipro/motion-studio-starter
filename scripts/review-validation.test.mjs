import {test} from 'node:test';
import assert from 'node:assert/strict';
import {briefCible, reviewErrors, verdict, reviewMarkdown} from './review-validation.mjs';

const notes = (v, patch = {}) => ({clarte: v, hierarchie: v, rythme: v, mouvement: v, lisibilite: v, marque: v, finition: v, ...patch});
const review = (patch = {}) => ({id: 'Film-9x16', passe: 1, critique: 'motion-critic', cible: 'public', notes: notes(8), defauts: [], ...patch});
const qaOk = {mode: 'final', technicalPassed: true, counts: {erreurs: 0}};

test('un review valide passe le contrôle de forme', () => assert.deepEqual(reviewErrors(review()), []));
test('les notes manquantes, décimales ou hors bornes sont refusées', () => {
	assert.ok(reviewErrors(review({notes: notes(8, {rythme: undefined})})).length);
	assert.ok(reviewErrors(review({notes: notes(8, {rythme: 7.5})})).length);
	assert.ok(reviewErrors(review({notes: notes(8, {rythme: 11})})).length);
	assert.ok(reviewErrors(review({notes: notes(8, {inventé: 9})})).length);
	assert.ok(reviewErrors(review({cible: 'diffusion'})).length);
	assert.ok(reviewErrors(review({defauts: [{t: [1], preuve: 'x', correctif: 'y'}]})).length);
});
test('LIVRABLE exige moyenne ≥ 8 sans critère < 7', () => {
	assert.equal(verdict(review(), qaOk).statut, 'LIVRABLE');
	assert.equal(verdict(review({notes: notes(9, {finition: 6})}), qaOk).note, 'À REPRENDRE');
});
test('7,86 de moyenne : pilote interne accepté, diffusion publique refusée', () => {
	const n = notes(8, {lisibilite: 7});
	const interne = verdict(review({cible: 'interne', notes: n}), qaOk);
	assert.equal(interne.statut, 'PILOTE INTERNE');
	assert.ok(interne.accepte);
	const pub = verdict(review({notes: n}), qaOk);
	assert.equal(pub.statut, 'À REPRENDRE');
	assert.ok(!pub.accepte);
});
test('sans QA finale réussie, aucune note ne suffit', () => {
	assert.ok(!verdict(review({notes: notes(10)}), null).accepte);
	assert.ok(!verdict(review({notes: notes(10)}), {...qaOk, mode: 'preflight'}).accepte);
	assert.ok(!verdict(review({notes: notes(10)}), {mode: 'final', technicalPassed: false, counts: {loudness: 1}}).accepte);
});
test('le markdown affiche le verdict calculé', () => {
	const md = reviewMarkdown(review(), verdict(review(), qaOk));
	assert.match(md, /Verdict : \*\*LIVRABLE\*\*/);
	assert.match(md, /Moyenne\*\* \| \*\*8,00/);
});

const ctx = (patch = {}) => ({id: 'Film-9x16', videoSha256: 'abc', cible: 'public', ...patch});
const qaFinal = (patch = {}) => ({...qaOk, id: 'Film-9x16', videoSha256: 'abc', ...patch});
test('un rapport technique d’un autre film est refusé', () => {
	const v = verdict(review(), qaFinal({id: 'AutreFilm-9x16'}), ctx());
	assert.ok(!v.accepte);
	assert.match(v.raisons.join(), /autre rendu/);
});
test('un rapport technique qui ne porte pas sur le MP4 actuel est refusé', () => {
	assert.match(verdict(review(), qaFinal({videoSha256: 'ancien'}), ctx()).raisons.join(), /MP4 a changé/);
	assert.match(verdict(review(), qaFinal({videoSha256: undefined}), ctx()).raisons.join(), /sans empreinte/);
	assert.match(verdict(review(), qaFinal(), ctx({videoSha256: null})).raisons.join(), /MP4 absent/);
	assert.ok(verdict(review(), qaFinal(), ctx()).accepte);
});
test('la cible vient du brief, pas de la critique', () => {
	const n = notes(8, {lisibilite: 7}); // 7,86 : pilote interne seulement
	const v = verdict(review({cible: 'interne', notes: n}), qaFinal(), ctx({cible: 'public'}));
	assert.ok(!v.accepte);
	assert.match(v.raisons.join(), /le brief fait foi/);
	assert.equal(v.cible, 'public');
	assert.match(verdict(review(), qaFinal(), ctx({cible: null})).raisons.join(), /Cible absente du brief/);
});
test('briefCible lit les deux écritures des briefs', () => {
	assert.equal(briefCible('Cible : interne   (deuxième film)'), 'interne');
	assert.equal(briefCible('| **Cible** | interne (pilote) : passer à « public » exige…'), 'interne');
	assert.equal(briefCible('Cible : public'), 'public');
	assert.equal(briefCible('Aucune cible ici'), null);
	assert.equal(briefCible(null), null);
});
