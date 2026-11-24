// QRE BC R1 probe 2: wall time of the boundary consumers the line touches (admission loop, custody evolves/sameReport on merges and kept
// voices, kindOf, the run-format notDecided rule), base and candidate interleaved in one process. Synthetic. Read-only.
// Usage: node p02-bench-boundary.mjs <base CoachingCore> <candidate CoachingCore> [n=12]
import path from 'node:path';
import {pathToFileURL} from 'node:url';
const [A,B]=process.argv.slice(2,4).map(p=>path.resolve(p)),N=Number(process.argv[4]??12);
const load=async cc=>({H:await import(pathToFileURL(path.join(cc,'test/v1int-helpers.mjs')).href)});
const trees={base:await load(A),cand:await load(B)};
function journey({H},tag){const {athlete,ELIG,U}=H;const t=athlete({id:tag});t.enroll();const ss=t.sessions(0).filter(s=>s.sport==='RUN');let ops=0;
 for(const run of ss){t.set(run.date,'21:00');t.screen(ELIG(run.date));ops++;
  t.clock+=60e3;t.import([t.watch(run,{endTime:'07:45'})]);ops++;                                              // device voice
  t.clock+=60e3;t.weekly(run.date,[t.form(run,{actual:{minutes:t.form(run).actual.minutes+20},response:{recovery:'ADVERSE'}})]);ops++; // disputed: kept voice
  t.clock+=60e3;t.import([t.watch(run,{activityId:'HK2-'+run.id,endTime:'08:10'})]);ops++;}                   // second fragment
 const strs=t.sessions(0).filter(s=>s.sport==='STRENGTH');for(const s of strs){t.set(s.date,'20:00');t.weekly(s.date,[t.form(s)]);ops++;}
 t.clock+=86400e3;t.weekly(ss.at(-1).date,[]);ops++;return {ops,bytes:t.store.raw(tag).length};}
const times={base:[],cand:[]},bytes={};
for(let i=0;i<N;i++)for(const k of i%2?['cand','base']:['base','cand']){const t0=performance.now();const r=journey(trees[k],`bench-${k}-${i}`);times[k].push((performance.now()-t0)/r.ops);bytes[k]=r.bytes;}
const q=(a,p)=>{const s=[...a].sort((x,y)=>x-y);return s[Math.min(s.length-1,Math.floor(p*s.length))];};
const row=k=>({n:times[k].length,perOpMedianMs:+q(times[k],0.5).toFixed(2),perOpP95Ms:+q(times[k],0.95).toFixed(2),recordBytes:bytes[k]});
const out={base:row('base'),cand:row('cand')};out.ratio={median:+(out.cand.perOpMedianMs/out.base.perOpMedianMs).toFixed(3),p95:+(out.cand.perOpP95Ms/out.base.perOpP95Ms).toFixed(3),bytes:+(out.cand.recordBytes/out.base.recordBytes).toFixed(3)};
console.log(JSON.stringify(out,null,1));
