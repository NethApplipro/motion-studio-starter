import React from 'react';
import {Composition, Folder} from 'remotion';
import './lib/fonts';
import {FILMS} from './films/registry';
import {withQA} from './components/QAProbe';
import {Briques, BRIQUES_DURATION} from './studio/Briques';
import {Ecrans, ECRANS_DURATION} from './studio/Ecrans';

// Chaque film est enveloppé par le capteur QA (inactif hors `npm run qa`, sans effet sur l'image).
const WRAPPED = FILMS.map((film) => ({...film, component: withQA(film.component)}));

// Un film = un dossier dans le Studio, décliné en 3 formats recomposés depuis la même timeline.
export const FORMATS = [
	{id: '9x16', width: 1080, height: 1920},
	{id: '1x1', width: 1080, height: 1080},
	{id: '16x9', width: 1920, height: 1080},
] as const;

export const Root: React.FC = () => (
	<>
		{WRAPPED.map((film) => (
			<Folder key={film.id} name={film.id}>
				{FORMATS.map((f) => (
					<Composition
						key={f.id}
						id={`${film.id}-${f.id}`}
						component={film.component}
						schema={film.schema}
						defaultProps={film.defaultProps}
						durationInFrames={film.durationInFrames}
						fps={film.fps}
						width={f.width}
						height={f.height}
					/>
				))}
			</Folder>
		))}
		{/* Planches de référence du studio (pas des films) : catalogue d'écrans et briques de style. */}
		<Folder name="Studio">
			<Composition id="Ecrans" component={Ecrans} durationInFrames={ECRANS_DURATION} fps={30} width={1920} height={1080} />
			<Composition id="Briques" component={Briques} durationInFrames={BRIQUES_DURATION} fps={30} width={1080} height={1080} />
		</Folder>
	</>
);
