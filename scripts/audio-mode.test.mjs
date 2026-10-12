import {test} from 'node:test';
import assert from 'node:assert/strict';
import {audioEncodeArgs, audioLevelIssues, briefAudio, expectedAudioCodec} from './audio-mode.mjs';

test('le mode audio se lit dans le brief, mix par défaut', () => {
	assert.deepEqual(briefAudio('Son : effets'), {mode: 'effets', declare: true, cibleLufs: -14});
	assert.equal(briefAudio('| **Son** | silencieux |').mode, 'silencieux');
	assert.deepEqual(briefAudio('Son : mix\nVolume cible : -16 LUFS'), {mode: 'mix', declare: true, cibleLufs: -16});
	assert.deepEqual(briefAudio('Aucune ligne son'), {mode: 'mix', declare: false, cibleLufs: -14});
	assert.equal(briefAudio(null).mode, 'mix');
});
test('seul le mode mix normalise le volume moyen ; silencieux retire la piste', () => {
	assert.deepEqual(audioEncodeArgs({mode: 'silencieux'}), ['-an']);
	assert.ok(!audioEncodeArgs({mode: 'effets'}).some((a) => String(a).includes('loudnorm')));
	assert.ok(audioEncodeArgs({mode: 'mix', cibleLufs: -16}).some((a) => String(a).includes('loudnorm=I=-16')));
	assert.equal(expectedAudioCodec({mode: 'silencieux'}), null);
	assert.equal(expectedAudioCodec({mode: 'effets'}), 'aac');
});
test('effets : seule la crête compte, pas le volume moyen', () => {
	assert.deepEqual(audioLevelIssues({input_i: '-33', input_tp: '-9'}, {mode: 'effets'}), []);
	assert.equal(audioLevelIssues({input_i: '-33', input_tp: '-0.5'}, {mode: 'effets'}).length, 1);
	assert.match(audioLevelIssues({input_i: '-inf', input_tp: '-inf'}, {mode: 'effets'})[0], /Aucun son/);
});
test('mix : cible du brief ±1 LUFS et crête ≤ -1 dBTP', () => {
	assert.deepEqual(audioLevelIssues({input_i: '-14.4', input_tp: '-1.4'}, {mode: 'mix', cibleLufs: -14}), []);
	assert.equal(audioLevelIssues({input_i: '-14.4', input_tp: '-1.4'}, {mode: 'mix', cibleLufs: -16}).length, 1);
	assert.equal(audioLevelIssues({input_i: '-14', input_tp: '-0.9'}, {mode: 'mix', cibleLufs: -14}).length, 1);
	assert.equal(audioLevelIssues({input_i: 'NaN', input_tp: '-2'}, {mode: 'mix', cibleLufs: -14}).length, 1);
});
test('silencieux : le son n’est pas contrôlé', () => assert.deepEqual(audioLevelIssues({}, {mode: 'silencieux'}), []));
