// Les workflows GitHub doivent être du YAML valide : un fichier invalide ne démarre jamais, sans échec visible sur la PR
// (cas de codex-review.yml, cassé par « : » dans une commande non entre guillemets).
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readdirSync, readFileSync} from 'node:fs';
import yaml from 'js-yaml';

const dir = '.github/workflows';
for (const file of readdirSync(dir).filter((f) => /\.ya?ml$/.test(f))) {
	test(`${file} est un workflow valide`, () => {
		const doc = yaml.load(readFileSync(`${dir}/${file}`, 'utf8'));
		assert.equal(typeof doc, 'object', 'document vide ou illisible');
		assert.ok(doc.on ?? doc[true], 'déclencheur « on » absent');
		assert.ok(doc.jobs && Object.keys(doc.jobs).length, 'aucun job');
		for (const [name, job] of Object.entries(doc.jobs)) {
			assert.ok(job['runs-on'] || job.uses, `job ${name} sans runs-on`);
			for (const [i, step] of (job.steps ?? []).entries()) assert.ok(step.run || step.uses, `job ${name}, étape ${i} sans run ni uses`);
		}
	});
}
