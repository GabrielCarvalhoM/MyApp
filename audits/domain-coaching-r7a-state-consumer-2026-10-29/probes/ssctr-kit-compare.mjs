// Author probe (prints only): the SSCTR's regression kit as re-run here (a folder written by run-ssctr-kit.mjs) against the SSCTR's own runs on
// STATE-EVIDENCE-FREEZE-1 (the freeze it accepted for D53, D56-D59: audits/domain-coaching-r7a-state-evidence-2026-10-28/reviews/ssctr-r7ase-runs)
// and on HISTORICAL-PROJECTION-FREEZE-1 (audits/domain-coaching-r7a-state-model-2026-10-28/reviews/ssctr-r7asm-runs). Per instrument: byte
// identity with each, ignoring wall clocks and runtime labels; for the restoration and caps grids, every violation class summed over the shards.
// Usage: node ssctr-kit-compare.mjs <kitFolder>
import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'../../..'),now=path.resolve(process.argv[2]);
const SE=path.join(root,'audits/domain-coaching-r7a-state-evidence-2026-10-28/reviews/ssctr-r7ase-runs'),HP=path.join(root,'audits/domain-coaching-r7a-state-model-2026-10-28/reviews/ssctr-r7asm-runs');
const read=(dir,n)=>{const p=path.join(dir,n+'.out.json');if(!fs.existsSync(p))return null;try{return JSON.parse(fs.readFileSync(p,'utf8'));}catch{return {unparsed:fs.readFileSync(p,'utf8').slice(0,200)};}};
const strip=x=>Array.isArray(x)?x.map(strip):x&&typeof x==='object'?Object.fromEntries(Object.entries(x).filter(([k])=>!['at','runtime','root','generatedAt','tree','node'].includes(k)).map(([k,v])=>[k,strip(v)])):x;
const same=(a,b)=>a&&b?JSON.stringify(strip(a))===JSON.stringify(strip(b)):null;
const names=JSON.parse(fs.readFileSync(path.join(now,'RUNS.json'),'utf8')).runs.map(r=>r.name);
const sum=(dir,prefix)=>{const agg={};for(let i=0;i<4;i++){const o=read(dir,`${prefix}.shard${i}`);if(!o)return null;for(const [k,v] of Object.entries(o)){if(v&&typeof v==='object'&&!Array.isArray(v))for(const [f,n] of Object.entries(v))if(typeof n==='number')agg[`${k}.${f}`]=(agg[`${k}.${f}`]??0)+n;}}return agg;};
const out={probe:'ssctr-kit-compare',now,instruments:{},grids:{}};
for(const n of names)out.instruments[n]={vsApprovedSE:same(read(now,n),read(SE,n)),vsPredecessor:same(read(now,n),read(HP,n))};
for(const g of ['grid','caps'])out.grids[g]={now:sum(now,g),approvedSE:sum(SE,g),predecessor:sum(HP,g)};
console.log(JSON.stringify(out,null,1));
