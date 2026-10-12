// Page de relecture humaine d'un film : les formats côte à côte, lecture synchronisée, verdict, compteurs QA,
// courbe d'activité et commentaires horodatés.
//   npm run review-page -- Demo                       → reviews/Demo/index.html (ouvrir dans un navigateur)
//   npm run review-page -- Demo --import=commentaires.json → ajoute les commentaires exportés aux review.json
// Les commentaires restent dans le navigateur jusqu'à l'export (bouton « Exporter ») ; l'import les rend visibles
// dans review.md au prochain npm run verdict, et donc pour l'agent qui corrige.
import {existsSync, mkdirSync, readFileSync, writeFileSync} from 'node:fs';
import {activitySvg} from './charts.mjs';
import {FORMATS, parseArgs} from './lib.mjs';
import {reviewErrors, verdict} from './review-validation.mjs';
import brand from './brand.mjs';

const {flags, rest} = parseArgs();
const [film] = rest;
if (!film) throw new Error('Usage : npm run review-page -- <Film> [--import=fichier.json]');
const read = (p) => (existsSync(p) ? JSON.parse(readFileSync(p, 'utf8')) : null);

if (flags.import) {
	const comments = JSON.parse(readFileSync(flags.import, 'utf8'));
	if (!Array.isArray(comments)) throw new Error('Fichier attendu : la liste exportée par la page de relecture.');
	let added = 0;
	for (const format of FORMATS) {
		const path = `reviews/${film}-${format}/review.json`;
		const mine = comments.filter((c) => c.format === format && Number.isFinite(c.t) && typeof c.texte === 'string' && c.texte.trim());
		if (!mine.length) continue;
		const review = read(path);
		if (!review) { console.warn(`⚠ ${path} absent : ${mine.length} commentaire(s) ${format} ignoré(s). Faire critiquer ce format d'abord.`); continue; }
		const seen = new Set((review.commentairesHumains ?? []).map((c) => `${c.t}|${c.texte}`));
		const fresh = mine.filter((c) => !seen.has(`${c.t}|${c.texte}`)).map(({t, texte, auteur}) => ({t: Math.round(t * 10) / 10, texte: texte.trim(), auteur: auteur || 'relecteur'}));
		review.commentairesHumains = [...(review.commentairesHumains ?? []), ...fresh].sort((a, b) => a.t - b.t);
		writeFileSync(path, `${JSON.stringify(review, null, 2)}\n`);
		added += fresh.length;
	}
	console.log(`✓ ${added} commentaire(s) ajouté(s). Lancer npm run verdict -- ${film} pour régénérer review.md.`);
	process.exit(0);
}

const C = brand.colors;
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'})[c]);
const panels = [];
for (const format of FORMATS) {
	const id = `${film}-${format}`;
	const video = [`out/${id}.mp4`, `out/${id}.draft.mp4`].find(existsSync);
	const qa = read(`reviews/${id}/qa.json`) ?? read(`reviews/${id}/preflight.json`);
	const review = read(`reviews/${id}/review.json`);
	const v = review && !reviewErrors(review).length ? verdict(review, qa?.mode === 'final' ? qa : null) : null;
	const counts = qa ? Object.entries(qa.counts).map(([k, n]) => `<li class="${n === null ? 'na' : n ? 'ko' : 'ok'}">${esc(k)} <b>${n ?? '—'}</b></li>`).join('') : '<li class="na">QA non lancée</li>';
	const n = qa?.series?.activite?.at(-1)?.[0] + 1 || 1;
	panels.push(`<section class="panel f${format}" data-format="${format}">
<header><h2>${format.replace('x', ':')}</h2>${v ? `<span class="badge ${v.accepte ? (v.statut === 'LIVRABLE' ? 'ok' : 'warn') : 'ko'}">${esc(v.statut)} · ${String(v.moyenne).replace('.', ',')}</span>` : '<span class="badge na">non critiqué</span>'}</header>
${video ? `<video src="../../${video}" preload="metadata" playsinline muted></video>` : `<div class="missing">Pas de MP4 : npm run render -- ${film} ${format}</div>`}
<details><summary>QA ${qa ? (qa.mode === 'final' ? 'finale' : 'précontrôle') : ''}</summary><ul class="counts">${counts}</ul></details>
${qa?.series ? `<div class="chart">${activitySvg(qa.series, n, `Activité ${format}`)}</div>` : ''}
${v?.raisons?.length ? `<ul class="reasons">${v.raisons.map((r) => `<li>${esc(r)}</li>`).join('')}</ul>` : ''}
</section>`);
}

const html = `<!doctype html>
<html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Relecture ${esc(film)}</title>
<style>
@font-face{font-family:Poppins;font-weight:400;src:url(../../public/fonts/poppins-latin-400-normal.woff2)}
@font-face{font-family:Poppins;font-weight:600;src:url(../../public/fonts/poppins-latin-600-normal.woff2)}
:root{--bg:${C.white};--ink:${C.dark};--muted:${C.grey60};--line:${C.grey10};--card:#fff;--accent:${C.blue};--ok:${C.green};--warn:${C.orange};--ko:${C.red}}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font:15px/1.5 Poppins,system-ui,sans-serif}
main{max-width:1400px;margin:0 auto;padding:24px 16px 120px}
h1{font-size:28px;font-weight:600;letter-spacing:-.02em;margin:0 0 4px}.sub{color:var(--muted);margin:0 0 20px}
.bar{position:sticky;top:0;z-index:2;background:var(--bg);display:flex;flex-wrap:wrap;gap:12px;align-items:center;padding:12px 0;border-bottom:1px solid var(--line);margin-bottom:20px}
button{font:inherit;font-weight:600;border:0;border-radius:10px;padding:8px 14px;background:var(--accent);color:#fff;cursor:pointer}
button.ghost{background:transparent;color:var(--accent);border:1px solid var(--line)}
input[type=range]{flex:1;min-width:200px;accent-color:var(--accent)}.time{font-variant-numeric:tabular-nums;min-width:70px}
.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:16px;align-items:start}
.panel{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:14px}
.panel header{display:flex;justify-content:space-between;align-items:center;margin-bottom:10px}.panel h2{font-size:16px;margin:0}
video{width:100%;border-radius:10px;background:#000;display:block}.missing{padding:40px 12px;text-align:center;color:var(--muted);border:1px dashed var(--line);border-radius:10px}
.badge{font-size:12px;font-weight:600;border-radius:99px;padding:3px 10px}.badge.ok{background:${C.green20};color:var(--ok)}.badge.warn{background:#fdf0e6;color:var(--warn)}.badge.ko{background:#f9e4e6;color:var(--ko)}.badge.na{background:${C.grey05};color:var(--muted)}
details{margin-top:10px}summary{cursor:pointer;color:var(--muted);font-size:13px}.counts{list-style:none;padding:0;margin:8px 0 0;display:grid;grid-template-columns:1fr 1fr;gap:2px 12px;font-size:12px}
.counts b{float:right}.counts .ko{color:var(--ko)}.counts .ok{color:var(--muted)}.counts .na{color:${C.grey40}}
.chart{margin-top:10px}.chart svg{width:100%;height:auto;border-radius:8px}.reasons{font-size:12px;color:var(--ko);padding-left:18px}
.comments{margin-top:24px;background:var(--card);border:1px solid var(--line);border-radius:16px;padding:16px}
.comments h2{font-size:16px;margin:0 0 10px}.add{display:flex;flex-wrap:wrap;gap:8px}.add textarea{flex:1 1 320px;min-height:44px;font:inherit;padding:8px 10px;border:1px solid var(--line);border-radius:10px}
.add select,.add input{font:inherit;padding:8px;border:1px solid var(--line);border-radius:10px}
.list{list-style:none;padding:0;margin:14px 0 0}.list li{display:flex;gap:10px;align-items:baseline;padding:8px 0;border-top:1px solid var(--line)}
.list .t{font-weight:600;color:var(--accent);cursor:pointer;font-variant-numeric:tabular-nums}.list .x{margin-left:auto;background:none;color:var(--muted);padding:0 6px}
@media (max-width:600px){.counts{grid-template-columns:1fr}}
</style></head><body><main>
<h1>Relecture — ${esc(film)}</h1>
<p class="sub">Les formats se lisent ensemble. Commenter un moment : mettre en pause, écrire, « Ajouter ». Puis « Exporter » et <code>npm run review-page -- ${esc(film)} --import=&lt;fichier&gt;</code>.</p>
<div class="bar"><button id="play">Lecture</button><input id="seek" type="range" min="0" max="1000" value="0"><span class="time" id="time">0,0 s</span>
<button class="ghost" id="slow">Vitesse 1×</button><button class="ghost" id="step">+1 frame</button></div>
<div class="grid">${panels.join('\n')}</div>
<section class="comments"><h2>Commentaires horodatés</h2>
<div class="add"><select id="fmt">${FORMATS.map((f) => `<option>${f}</option>`).join('')}</select><input id="author" placeholder="Auteur" size="10">
<textarea id="text" placeholder="Ce qui ne va pas à cet instant, et ce qu'il faudrait"></textarea><button id="add">Ajouter</button><button class="ghost" id="export">Exporter</button></div>
<ul class="list" id="list"></ul></section>
</main>
<script>
const KEY = 'relecture-${film}';
const videos = [...document.querySelectorAll('video')];
const lead = videos[0];
const seek = document.getElementById('seek');
const time = document.getElementById('time');
const fmt = (t) => t.toFixed(1).replace('.', ',') + ' s';
let rate = 1;
const load = () => { try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; } };
const save = (c) => { try { localStorage.setItem(KEY, JSON.stringify(c)); } catch {} };
let comments = load();
const sync = (t) => videos.forEach((v) => { if (Math.abs(v.currentTime - t) > 0.04) v.currentTime = t; });
document.getElementById('play').onclick = (e) => {
	if (!lead) return;
	if (lead.paused) { sync(lead.currentTime); videos.forEach((v) => { v.playbackRate = rate; v.play(); }); e.target.textContent = 'Pause'; }
	else { videos.forEach((v) => v.pause()); e.target.textContent = 'Lecture'; }
};
document.getElementById('slow').onclick = (e) => { rate = rate === 1 ? 0.25 : rate === 0.25 ? 0.5 : 1; videos.forEach((v) => (v.playbackRate = rate)); e.target.textContent = 'Vitesse ' + String(rate).replace('.', ',') + '×'; };
document.getElementById('step').onclick = () => { if (!lead) return; videos.forEach((v) => v.pause()); sync(Math.min(lead.duration || 0, lead.currentTime + 1 / 30)); };
seek.oninput = () => { if (lead && lead.duration) sync((seek.value / 1000) * lead.duration); };
if (lead) lead.ontimeupdate = () => { time.textContent = fmt(lead.currentTime); if (lead.duration) seek.value = (lead.currentTime / lead.duration) * 1000; };
const render = () => {
	const list = document.getElementById('list');
	list.innerHTML = '';
	comments.slice().sort((a, b) => a.t - b.t).forEach((c) => {
		const li = document.createElement('li');
		const t = document.createElement('span'); t.className = 't'; t.textContent = fmt(c.t) + ' · ' + c.format; t.onclick = () => sync(c.t);
		const txt = document.createElement('span'); txt.textContent = (c.auteur ? c.auteur + ' : ' : '') + c.texte;
		const x = document.createElement('button'); x.className = 'x'; x.textContent = '×'; x.title = 'Retirer';
		x.onclick = () => { comments = comments.filter((o) => o !== c); save(comments); render(); };
		li.append(t, txt, x); list.append(li);
	});
};
document.getElementById('add').onclick = () => {
	const texte = document.getElementById('text').value.trim();
	if (!texte) return;
	comments.push({format: document.getElementById('fmt').value, t: Math.round((lead ? lead.currentTime : 0) * 10) / 10, texte, auteur: document.getElementById('author').value.trim()});
	save(comments); document.getElementById('text').value = ''; render();
};
document.getElementById('export').onclick = () => {
	const a = document.createElement('a');
	a.href = URL.createObjectURL(new Blob([JSON.stringify(comments, null, 2)], {type: 'application/json'}));
	a.download = 'commentaires-${film}.json'; a.click();
};
render();
</script></body></html>`;
mkdirSync(`reviews/${film}`, {recursive: true});
writeFileSync(`reviews/${film}/index.html`, html);
console.log(`✓ reviews/${film}/index.html (ouvrir dans un navigateur depuis le dossier du dépôt)`);
