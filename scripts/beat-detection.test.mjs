import {test} from 'node:test';
import assert from 'node:assert/strict';
import {detectBeats} from './beat-detection.mjs';

// Piste synthétique : un coup sourd toutes les 60/bpm secondes à partir de `offset`, sur une nappe continue.
const track = (bpm, offset, seconds = 12, sr = 22050) => {
	const s = new Float32Array(seconds * sr);
	const period = 60 / bpm;
	for (let i = 0; i < s.length; i++) {
		const t = i / sr;
		const k = t - offset;
		const tb = k >= 0 ? k % period : 1;
		s[i] = 0.05 * Math.sin(2 * Math.PI * 220 * t) + (k >= 0 ? Math.sin(2 * Math.PI * (60 + 80 * Math.exp(-tb * 40)) * tb) * Math.exp(-tb * 12) * 0.6 : 0);
	}
	return s;
};

for (const [bpm, offset] of [[120, 0], [100, 0.2], [128, 0.35]]) {
	test(`${bpm} BPM, premier temps à ${offset} s`, () => {
		const g = detectBeats(track(bpm, offset), 22050);
		assert.ok(Math.abs(g.bpm - bpm) <= 1, `tempo détecté ${g.bpm}`);
		const expected = Math.round(offset * 30);
		assert.ok(Math.abs(g.beats.find((b) => b >= expected - 3) - expected) <= 2, `premier temps ${g.beats[0]} au lieu de ${expected}`);
	});
}
