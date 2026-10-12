import type React from 'react';
import type {z} from 'zod';
import {Demo} from './demo/Demo';
import {defaultDemo, demoSchema} from './demo/schema';
import {DURATION, FPS} from './demo/timeline';


// Registre des films. `npm run new-film` ajoute une entrée ici automatiquement.
export type FilmEntry = {
 id: string; component: React.FC<any>; schema: z.ZodObject<any>;
 defaultProps: Record<string, unknown>; durationInFrames: number; fps: number;
};
export const FILMS: FilmEntry[] = [
 {id: 'Demo', component: Demo, schema: demoSchema, defaultProps: defaultDemo, durationInFrames: DURATION, fps: FPS},
	// <new-film>
];
