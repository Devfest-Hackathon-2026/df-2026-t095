/**
 * 評価ベンチマークを人が確認するためのローカル画面です。
 * npm run eval:review で起動し、127.0.0.1 だけで受け付けます。
 * `--data=<path>` で別のファイルを、`--port=<n>` で別のポートを指定できます。
 */
import { createServer } from 'node:http';
import { readFile, rename, writeFile } from 'node:fs/promises';
import { extname, resolve, sep } from 'node:path';
import { localCatalog } from '../lib/catalog.ts';
import { diverseResults, rankPlaces } from '../lib/discovery.ts';
import { applyReview, reviewCandidateIds } from '../lib/benchmark-review.ts';
import { qualities } from '../lib/places.ts';

const option = (name, fallback) =>
  process.argv.find(value => value.startsWith(`--${name}=`))?.split('=')[1] ?? fallback;
const dataPath = resolve(option('data', 'data/discovery-benchmark.json'));
const port = Number(option('port', 5199));
const origin = `http://127.0.0.1:${port}`;
const imageRoot = resolve('public/images');

const catalog = await localCatalog();
const byId = new Map(catalog.map(place => [place.id, place]));
const qualityLabel = id => qualities.find(quality => quality.id === id)?.label ?? id;
const loadQueries = async () => JSON.parse(await readFile(dataPath, 'utf8'));

async function saveQueries(queries) {
  const temporary = `${dataPath}.${process.pid}.tmp`;
  await writeFile(temporary, `${JSON.stringify(queries, null, 2)}\n`);
  await rename(temporary, dataPath);
}

const card = place => ({
  id: place.id,
  name: place.name,
  location: [place.city, place.country].filter(Boolean).join('・'),
  image: place.image || '',
  description: place.description || '',
});

function shownCandidates(query) {
  const source = byId.get(query.sourceId);
  const ranked = source
    ? diverseResults(rankPlaces(source, query.preferences, query.destination, catalog)).map(
        place => place.id,
      )
    : [];
  return reviewCandidateIds(query, ranked).filter(id => byId.has(id));
}

function describe(query) {
  const source = byId.get(query.sourceId);
  return {
    id: query.id,
    reviewed: query.reviewed,
    destination: query.destination,
    preferences: query.preferences.map(qualityLabel),
    source: source
      ? card(source)
      : { id: query.sourceId, name: query.sourceId, location: '', image: '', description: '' },
    candidates: shownCandidates(query).map(id => ({
      ...card(byId.get(id)),
      grade: query.judgements[id] ?? null,
    })),
  };
}

const page = `<!doctype html>
<html lang="ja"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>ベンチマークの確認</title>
<style>
:root{--green:#2d6048;--ink:#233d32;--muted:#64746a;--line:#dfe5dc;--paper:#f7f9f6;--mint:#e8efe6}
*{box-sizing:border-box}body{margin:0;background:var(--paper);color:var(--ink);font:16px/1.75 "Noto Sans JP",sans-serif}
main{max-width:1120px;margin:0 auto;padding:24px 16px 64px}h1{font-size:24px;margin:0}h2{font-size:18px;margin:0}
.top{display:flex;justify-content:space-between;align-items:baseline;gap:16px;flex-wrap:wrap}.muted{color:var(--muted);font-size:14px}
.scale{margin:12px 0 24px;padding:12px 16px;background:#fff;border:1px solid var(--line);border-radius:8px;font-size:14px}
.source{display:flex;gap:16px;padding:16px;background:#fff;border:1px solid var(--line);border-radius:12px;margin-bottom:24px}
.source img{width:200px;height:140px;object-fit:cover;border-radius:8px;flex-shrink:0}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:16px}
.card{background:#fff;border:1px solid var(--line);border-radius:12px;overflow:hidden;display:flex;flex-direction:column}
.card img,.empty{width:100%;height:160px;object-fit:cover;background:var(--mint);display:block}
.body{padding:12px 16px 16px;display:flex;flex-direction:column;gap:8px;flex:1}.body p{margin:0;font-size:14px;line-height:1.7}
.tag{align-self:flex-start;padding:0 8px;border-radius:4px;background:var(--mint);font-size:12px}
.grades{display:grid;grid-template-columns:repeat(3,1fr);gap:4px;margin-top:auto}
.grades button{min-height:44px;border:1px solid var(--line);background:#fff;border-radius:8px;font:inherit;font-size:14px;cursor:pointer;color:var(--ink)}
.grades button[aria-pressed=true]{background:var(--green);border-color:var(--green);color:#fff}
.actions{display:flex;gap:8px;margin-top:24px;align-items:center;flex-wrap:wrap}
.actions button{min-height:48px;padding:0 20px;border-radius:8px;border:1px solid var(--line);background:#fff;font:inherit;cursor:pointer;color:var(--ink)}
.actions .primary{background:var(--green);border-color:var(--green);color:#fff;font-weight:600}
.actions .primary:disabled{opacity:.5;cursor:not-allowed}#message{font-size:14px}
@media(max-width:600px){.source{flex-direction:column}.source img{width:100%}}
</style></head><body><main>
<div class="top"><h1>ベンチマークの確認</h1><span id="progress" class="muted"></span></div>
<div class="scale">選んだ特徴について、出発点と候補を比べて採点します。<strong>2</strong> 近い ／ <strong>1</strong> 一部近い ／ <strong>0</strong> 近くない。「仮の値」は人が確認していない初期値です。</div>
<div id="app"></div></main>
<script>
const h=(tag,props={},...children)=>{const node=Object.assign(document.createElement(tag),props);node.append(...children.flat());return node;};
const labels={0:'0 近くない',1:'1 一部近い',2:'2 近い'};
let cases=[],index=0,grades={},touched=new Set();
function photo(place){return place.image?h('img',{src:place.image,alt:'',loading:'lazy'}):h('div',{className:'empty'});}
function render(){
 const item=cases[index];const done=cases.filter(c=>c.reviewed).length;
 document.getElementById('progress').textContent='確認済み '+done+' / '+cases.length+' ・ '+(index+1)+' 件目（'+item.id+'）';
 const missing=item.candidates.filter(c=>grades[c.id]===null||grades[c.id]===undefined).length;
 const save=h('button',{className:'primary',disabled:missing>0,textContent:item.reviewed?'修正を保存して次へ':'確認済みにして次へ',onclick:submit});
 document.getElementById('app').replaceChildren(
  h('section',{className:'source'},photo(item.source),h('div',{},
   h('span',{className:'muted',textContent:'出発点'+(item.reviewed?'・確認済み':'')}),h('h2',{textContent:item.source.name}),
   h('p',{className:'muted',textContent:item.source.location}),
   h('p',{textContent:'選んだ特徴：'+item.preferences.join('、')}),h('p',{className:'muted',textContent:'探す地域：'+item.destination}))),
  h('div',{className:'grid'},item.candidates.map(c=>h('article',{className:'card'},photo(c),h('div',{className:'body'},
   h('h2',{textContent:c.name}),h('p',{className:'muted',textContent:c.location}),h('p',{textContent:c.description}),
   !item.reviewed&&!touched.has(c.id)?h('span',{className:'tag',textContent:c.grade===null?'未評価':'仮の値'}):'',
   h('div',{className:'grades',role:'group',ariaLabel:c.name+' の評価'},[2,1,0].map(g=>h('button',{textContent:labels[g],ariaPressed:String(grades[c.id]===g),onclick(){grades[c.id]=g;touched.add(c.id);render();}}))))))),
  h('div',{className:'actions'},h('button',{textContent:'前へ',disabled:index===0,onclick(){go(index-1);}}),save,h('button',{textContent:'スキップ',disabled:index===cases.length-1,onclick(){go(index+1);}}),
   h('span',{id:'message',textContent:missing?'未評価の候補が '+missing+' 件あります。':''})));
}
function go(next){index=next;grades=Object.fromEntries(cases[index].candidates.map(c=>[c.id,c.grade]));touched=new Set();render();scrollTo(0,0);}
async function submit(){
 const item=cases[index];const response=await fetch('/api/cases/'+encodeURIComponent(item.id),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({judgements:grades})});
 const data=await response.json();if(!response.ok){document.getElementById('message').textContent=data.error;return;}
 cases[index]=data.case;const next=cases.findIndex((c,i)=>i>index&&!c.reviewed);
 if(next>=0)go(next);else{go(index);document.getElementById('message').textContent='これより後に未確認のケースはありません。';}
}
fetch('/api/cases').then(r=>r.json()).then(data=>{cases=data;const first=cases.findIndex(c=>!c.reviewed);go(first>=0?first:0);});
</script></body></html>`;

const send = (response, status, body, type = 'application/json; charset=utf-8') => {
  response.writeHead(status, { 'Content-Type': type, 'Cache-Control': 'no-store' });
  response.end(typeof body === 'string' || Buffer.isBuffer(body) ? body : JSON.stringify(body));
};

async function readBody(request) {
  const chunks = [];
  let size = 0;
  for await (const chunk of request) {
    size += chunk.length;
    if (size > 65536) throw new Error('送信内容が大きすぎます。');
    chunks.push(chunk);
  }
  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}

const imageTypes = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
};

async function handle(request, response) {
  const url = new URL(request.url, origin);
  if (request.method === 'GET' && url.pathname === '/')
    return send(response, 200, page, 'text/html; charset=utf-8');
  if (request.method === 'GET' && url.pathname === '/api/cases')
    return send(response, 200, (await loadQueries()).map(describe));
  if (request.method === 'GET' && url.pathname.startsWith('/images/')) {
    const file = resolve(imageRoot, decodeURIComponent(url.pathname.slice('/images/'.length)));
    const type = imageTypes[extname(file).toLowerCase()];
    if (!type || !file.startsWith(imageRoot + sep))
      return send(response, 404, { error: 'not found' });
    return send(response, 200, await readFile(file), type);
  }
  const match = url.pathname.match(/^\/api\/cases\/([^/]+)$/);
  if (request.method === 'POST' && match) {
    if (![origin, `http://localhost:${port}`].includes(request.headers.origin)) {
      return send(response, 403, { error: 'この画面から操作してください。' });
    }
    const id = decodeURIComponent(match[1]);
    const queries = await loadQueries();
    const target = queries.find(query => query.id === id);
    if (!target) return send(response, 404, { error: 'ケースが見つかりません。' });
    const { judgements } = await readBody(request);
    const updated = applyReview(queries, id, judgements ?? {}, shownCandidates(target));
    await saveQueries(updated);
    return send(response, 200, { case: describe(updated.find(query => query.id === id)) });
  }
  return send(response, 404, { error: 'not found' });
}

createServer((request, response) => {
  handle(request, response).catch(error =>
    send(response, 400, { error: String(error.message).slice(0, 200) }),
  );
}).listen(port, '127.0.0.1', () => console.log(`ベンチマークの確認画面: ${origin}`));
