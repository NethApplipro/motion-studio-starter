import {test} from 'node:test';
import assert from 'node:assert/strict';
import {baselineAction} from './visual-baseline.mjs';

test('une référence absente fait échouer le test au lieu d’être créée', () => {
	assert.equal(baselineAction({update: false, exists: false}), 'missing');
});
test('une référence présente est comparée', () => assert.equal(baselineAction({update: false, exists: true}), 'compare'));
test('--update réécrit la référence, présente ou non', () => {
	assert.equal(baselineAction({update: true, exists: true}), 'write');
	assert.equal(baselineAction({update: true, exists: false}), 'write');
});
