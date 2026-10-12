import {test} from 'node:test';
import assert from 'node:assert/strict';
import jpeg from 'jpeg-js';
import {activity, calmSpans, lumaGrid, saccades} from './motion-analysis.mjs';

const size = {width: 1080, height: 1920};
// Ressort critique 0 → 600 px : départ vif, arrivée douce.
const spring = (n, to = 600) => Array.from({length: n}, (_, f) => {
	const t = f / 30;
	const w = 18;
	return [f, 100, to * (1 - (1 + w * t) * Math.exp(-w * t)), 1, 0];
});

test('un ressort ne déclenche aucune saccade', () => assert.deepEqual(saccades({carte: spring(40)}, size), []));
test('une téléportation est détectée, sauf si l’élément est invisible', () => {
	const pts = [[0, 100, 100, 1, 0], [1, 100, 100, 1, 0], [2, 100, 900, 1, 0]];
	assert.equal(saccades({carte: pts}, size).length, 1);
	assert.equal(saccades({carte: pts.map((p) => [...p.slice(0, 3), 0, 0])}, size).length, 0);
});
test('un déplacement rapide est toléré sous flou de mouvement', () => {
	const pts = [[0, 100, 100, 1, 1], [1, 100, 450, 1, 1]];
	assert.equal(saccades({tel: pts}, size).length, 0);
	assert.equal(saccades({tel: pts.map((p) => [...p.slice(0, 4), 0])}, size).length, 1);
});
test('un arrêt sec (interpolation linéaire bornée) est détecté', () => {
	const pts = Array.from({length: 12}, (_, f) => [f, 100, Math.min(f, 8) * 40, 1, 0]);
	const found = saccades({carte: pts}, size);
	assert.equal(found.length, 1);
	assert.equal(found[0].frame, 9);
});
test('des frames non consécutives ne sont pas comparées', () => {
	assert.deepEqual(saccades({carte: [[0, 0, 0, 1, 0], [5, 0, 900, 1, 0]]}, size), []);
});

const img = (paint) => {
	const width = 256;
	const height = 256;
	const data = Buffer.alloc(width * height * 4, 240);
	paint(data, width);
	return jpeg.encode({data, width, height}, 95).data;
};
const square = (x0) => img((d, w) => {
	for (let y = 40; y < 104; y++) for (let x = x0; x < x0 + 64; x++) for (let c = 0; c < 3; c++) d[(y * w + x) * 4 + c] = 20;
});
test('une forme qui bouge produit de l’activité, une image identique aucune', () => {
	const a = lumaGrid(square(20));
	assert.ok(activity(a, lumaGrid(square(20))) < 0.5);
	assert.ok(activity(a, lumaGrid(square(60))) > 5);
	assert.ok(activity(a, lumaGrid(square(60)), 5) < activity(a, lumaGrid(square(60)), 1));
});
test('une plage calme plus longue que maxGap est signalée', () => {
	const pts = Array.from({length: 300}, (_, f) => [f, f < 10 || f > 200 ? 3 : 0.2]);
	const spans = calmSpans(pts, {fps: 30, maxGap: 4});
	assert.equal(spans.length, 1);
	assert.equal(spans[0].frame, 9);
	assert.equal(calmSpans(pts, {fps: 30, maxGap: 8}).length, 0);
});
