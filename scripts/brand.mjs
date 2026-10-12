// Charte lue depuis brand/brand.json (seule source), pour les scripts Node.
import {readFileSync} from 'node:fs';

export default JSON.parse(readFileSync(new URL('../brand/brand.json', import.meta.url), 'utf8'));
