// Calage sur une musique réelle (grille produite par npm run beats). Pour la nappe de synthèse à 120 BPM,
// beat() de motion.ts suffit ; pour une piste sous licence, le tempo et le premier temps viennent de la grille.
export type BeatGrid = {bpm: number; offset: number; fps: number; framesPerBeat: number; beats: number[]};

/** Frame du n-ième temps de la musique (au-delà de la grille détectée, extrapolée au même tempo). */
export const musicBeat = (grid: BeatGrid, n: number) =>
	n < grid.beats.length ? grid.beats[n] : Math.round(grid.offset * grid.fps + n * grid.framesPerBeat);

/** Temps le plus proche d'une frame : pour recaler un événement existant sur la musique. */
export const nearestBeat = (grid: BeatGrid, frame: number) =>
	grid.beats.reduce((best, b) => (Math.abs(b - frame) < Math.abs(best - frame) ? b : best), grid.beats[0] ?? 0);
