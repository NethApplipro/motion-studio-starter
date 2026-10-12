import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readingWarnings, wordCount} from './reading-time.mjs';

const fps = 30;
// Un texte lisible (opacité 1) de la frame a à la frame b incluse.
const seq = (n, fn) => Array.from({length: n}, (_, frame) => ({frame, textes: fn(frame)}));

test('compte les mots, apostrophes et traits d’union compris', () => {
	assert.equal(wordCount('Le premier jour commence avant le premier jour.'), 8);
	assert.equal(wordCount("Aujourd'hui, c'est prêt-à-porter !"), 3);
	assert.equal(wordCount(''), 0);
});
test('un texte de 4 mots affiché 2 s est trop court (seuil 2,7 s)', () => {
	const w = readingWarnings(seq(120, (f) => (f < 60 ? {a: {texte: 'Un livret toujours vivant', o: 1}} : {})), {fps});
	assert.equal(w.length, 1);
	assert.equal(w[0].duree, 2);
	assert.equal(w[0].requis, 2.7);
});
test('le même texte affiché 3 s passe', () => {
	assert.deepEqual(readingWarnings(seq(120, (f) => (f < 90 ? {a: {texte: 'Un livret toujours vivant', o: 1}} : {})), {fps}), []);
});
test('seul le temps réellement lisible compte (opacité ≥ 0,9)', () => {
	const w = readingWarnings(seq(120, (f) => ({a: {texte: 'Un livret toujours vivant', o: f < 40 ? 0.5 : f < 100 ? 1 : 0}})), {fps});
	assert.equal(w.length, 1);
	assert.equal(w[0].duree, 2);
});
test('un autre texte lisible en même temps allonge le temps requis', () => {
	const seul = readingWarnings(seq(90, () => ({a: {texte: 'Vos actualités', o: 1}})), {fps});
	assert.deepEqual(seul, []);
	const deux = readingWarnings(seq(90, () => ({a: {texte: 'Vos actualités', o: 1}, b: {texte: 'à portée de main pour tous', o: 1}})), {fps});
	assert.ok(deux.some((x) => x.cle === 'a' && x.concurrents === 6));
});
test('échantillonnage : la durée tient compte du pas', () => {
	const samples = [0, 5, 10, 15, 20, 25].map((frame) => ({frame, textes: {a: {texte: 'Deux mots', o: 1}}}));
	assert.deepEqual(readingWarnings(samples, {fps: 10, step: 5}), []); // 3 s ≥ 2,1 s
});
