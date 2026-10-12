import {test} from 'node:test';
import assert from 'node:assert/strict';
import {estimateWords, wordsFromAlignment} from './voice-alignment.mjs';

test('les caractères horodatés deviennent des mots', () => {
	const text = 'Tout est prêt.';
	const characters = [...text];
	const start = characters.map((_, i) => i * 0.05);
	const words = wordsFromAlignment({characters, character_start_times_seconds: start, character_end_times_seconds: start.map((s) => s + 0.05)});
	assert.deepEqual(words.map((w) => w.text), ['Tout', 'est', 'prêt.']);
	assert.equal(words[1].start, 0.25);
	assert.equal(words[2].end, 0.7);
});
test('l’estimation garde l’ordre et ajoute une pause après la ponctuation', () => {
	const w = estimateWords('Bonjour. Tout est prêt');
	assert.equal(w.length, 4);
	for (let i = 1; i < w.length; i++) assert.ok(w[i].start >= w[i - 1].end);
	assert.ok(w[1].start - w[0].end > w[2].start - w[1].end);
});
