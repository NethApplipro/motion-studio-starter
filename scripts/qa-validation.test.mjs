import {test} from 'node:test';
import assert from 'node:assert/strict';
import {qaOptions, videoIssues} from './qa-validation.mjs';

test('la livraison exige toutes les frames ; le précontrôle autorise un échantillon', () => {
	assert.deepEqual(qaOptions({}, ['9x16']), {preflight: false, step: 1});
	assert.deepEqual(qaOptions({preflight: true}, ['1x1']), {preflight: true, step: 5});
	assert.throws(() => qaOptions({step: '5'}, ['9x16']));
});
test('les options dangereuses ou mal orthographiées sont refusées', () => {
	for (const step of ['0', '-1', 'NaN', 'Infinity', '1.5', '']) assert.throws(() => qaOptions({preflight: true, step}, ['9x16']));
	assert.throws(() => qaOptions({preflight: 'false'}, ['9x16']));
	assert.throws(() => qaOptions({prefligth: true}, ['9x16']));
	assert.throws(() => qaOptions({}, ['portrait']));
	for (const jobs of ['0', '-2', '1.5', 'beaucoup', '64']) assert.throws(() => qaOptions({jobs}, ['9x16']));
	assert.doesNotThrow(() => qaOptions({jobs: '4'}, ['9x16']));
});
const composition = {width: 1080, height: 1920, fps: 30, durationInFrames: 450};
const video = {codec_type: 'video', codec_name: 'h264', width: 1080, height: 1920, pix_fmt: 'yuv420p', color_range: 'tv', color_space: 'bt709', avg_frame_rate: '30000/1000', nb_read_frames: '450'};
const probe = (changes = {}) => ({streams: [{codec_type: 'audio', codec_name: 'aac'}, {...video, ...changes}]});
test('les champs JSON et les cadences équivalentes sont reconnus indépendamment de leur ordre', () => {
	assert.deepEqual(videoIssues(probe(), composition), []);
});
for (const [key, value] of Object.entries({codec_name: 'hevc', width: 540, height: 960, pix_fmt: 'yuvj420p', color_range: 'pc', color_space: 'bt2020nc', avg_frame_rate: '0/0', nb_read_frames: '449'})) {
	test(`une vidéo avec ${key} incorrect est refusée`, () => assert.ok(videoIssues(probe({[key]: value}), composition).length));
}
test('les flux manquants échouent', () => {
	assert.ok(videoIssues({}, composition).length);
	assert.ok(videoIssues({streams: [video]}, composition).some((s) => s.includes('Audio')));
});
test('un film silencieux ne doit pas avoir de piste audio', () => {
	const sansAudio = {streams: [video]};
	assert.deepEqual(videoIssues(sansAudio, composition, null), []);
	assert.ok(videoIssues(probe(), composition, null).some((s) => s.includes('silencieux')));
});
