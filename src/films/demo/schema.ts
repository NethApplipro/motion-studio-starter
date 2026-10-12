import {z} from 'zod';
export const demoSchema = z.object({titres: z.tuple([z.string().max(28), z.string().max(28), z.string().max(28)])});
export type DemoProps = z.infer<typeof demoSchema>;
export const defaultDemo: DemoProps = {titres: ['Une idée.', 'Du mouvement.', 'Votre signature.']};
