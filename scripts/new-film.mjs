// Crée un nouveau film à partir des gabarits et l'enregistre dans le Studio.
//   npm run new-film -- coffre-fort "Coffre-fort RH"
// → films/coffre-fort/ (brief, style, shot list) + src/films/coffre-fort/ (timeline, schéma, composition)
import {cpSync, existsSync, mkdirSync, readFileSync, writeFileSync} from 'node:fs';
import {parseArgs} from './lib.mjs';

const {rest} = parseArgs();
const [slug, ...titleParts] = rest;
if (!slug || !/^[a-z0-9-]+$/.test(slug)) throw new Error('Usage : npm run new-film -- <slug-en-minuscules> "Titre"');
const title = titleParts.join(' ') || slug;
const Name = slug.split('-').map((s) => s[0].toUpperCase() + s.slice(1)).join('');
const camel = Name[0].toLowerCase() + Name.slice(1);
const src = `src/films/${slug}`;
if (existsSync(src)) throw new Error(`${src} existe déjà`);

cpSync('films/_template', `films/${slug}`, {recursive: true});
for (const f of ['brief.md', 'style-guide.md', 'shotlist.md']) {
	const p = `films/${slug}/${f}`;
	writeFileSync(p, readFileSync(p, 'utf8').replaceAll('<titre du film>', title).replaceAll('<film>', title));
}

mkdirSync(src, {recursive: true});
writeFileSync(`${src}/timeline.ts`, `import {beat} from '../../lib/motion';

// Chronologie du film (30 fps, 120 BPM → 1 temps = 15 frames). Une frame = un nombre, ici seulement.
export const FPS = 30;
export const DURATION = 450; // 15 s

export const T = {
	titre: beat(1),
	fin: beat(26),
} as const;

export const SFX: {at: number; file: string; volume: number}[] = [
	{at: T.titre, file: 'pop.wav', volume: 0.5},
	{at: T.fin, file: 'chime.wav', volume: 0.6},
];
`);
writeFileSync(`${src}/schema.ts`, `import {z} from 'zod';

// Réglages modifiables en direct dans Remotion Studio (panneau « Props »).
export const ${camel}Schema = z.object({
	titre: z.string(),
	ressort: z.enum(['snappy', 'default', 'heavy', 'playful']),
	musique: z.boolean(),
	effets: z.boolean(),
});
export type ${Name}Props = z.infer<typeof ${camel}Schema>;

export const default${Name}: ${Name}Props = {
	titre: ${JSON.stringify(title)},
	ressort: 'default',
	musique: false,
	effets: false,
};
`);
writeFileSync(`${src}/${Name}.tsx`, `import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, SANS} from '../../lib/brand';
import {useFormat} from '../../lib/format';
import {sp} from '../../lib/motion';
import {Logo} from '../../components/Logo';
import {${Name}Props} from './schema';
import {SFX, T} from './timeline';

// Squelette : remplacer par la shot list validée (films/${slug}/shotlist.md).
export const ${Name}: React.FC<${Name}Props> = (p) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const {u} = useFormat();
	const titre = sp(frame, fps, T.titre, 'snappy');
	const fin = sp(frame, fps, T.fin, p.ressort);
	return (
		<AbsoluteFill style={{background: C.white, fontFamily: SANS, alignItems: 'center', justifyContent: 'center'}}>
			<div style={{fontSize: 90 * u, fontWeight: 600, color: C.dark, letterSpacing: -3 * u, opacity: titre * (1 - fin), transform: \`translateY(\${(1 - titre) * 40 * u}px)\`}}>{p.titre}</div>
			<div style={{position: 'absolute', opacity: fin}}><Logo size={90 * u} color="gradient" /></div>
			{p.musique ? <Audio src={staticFile('audio/bed.wav')} volume={0.5} /> : null}
			{p.effets && SFX.map((s, i) => (
				<Sequence key={i} from={s.at} layout="none">
					<Audio src={staticFile(\`audio/\${s.file}\`)} volume={s.volume} />
				</Sequence>
			))}
		</AbsoluteFill>
	);
};
`);

const reg = 'src/films/registry.ts';
let r = readFileSync(reg, 'utf8');
r = r.replace(
	"\n// Registre des films.",
	`\nimport {${Name}} from './${slug}/${Name}';\nimport {default${Name}, ${camel}Schema} from './${slug}/schema';\nimport {DURATION as ${Name}_DURATION, FPS as ${Name}_FPS} from './${slug}/timeline';\n\n// Registre des films.`,
);
r = r.replace('\t// <new-film>', `\t{id: '${Name}', component: ${Name}, schema: ${camel}Schema, defaultProps: default${Name}, durationInFrames: ${Name}_DURATION, fps: ${Name}_FPS},\n\t// <new-film>`);
writeFileSync(reg, r);
console.log(`✓ films/${slug}/ et ${src}/ créés, compositions ${Name}-9x16 / -1x1 / -16x9 enregistrées.
Étapes suivantes : remplir films/${slug}/brief.md, puis suivre .agents/skills/motion-reel/SKILL.md.`);
