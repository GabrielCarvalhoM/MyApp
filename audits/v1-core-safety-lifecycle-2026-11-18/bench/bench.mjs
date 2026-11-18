// Core Safety & Lifecycle: Node regression benchmark, base vs candidate, interleaved in one process (the same load hits both). Not an iPhone
// measurement. A hybrid 8-week journey (the AIF athlete, every session reported, a two-voice run each week, a restart at week 5) is replayed on
// each tree; review latency (median, p95) and the record size are compared.
//   node audits/v1-core-safety-lifecycle-2026-11-18/bench/bench.mjs <baseRoot> [rounds=5]   (baseRoot: a git archive of 16577b6 with node_modules)
import path from 'node:path';
import {pathToFileURL} from 'node:url';
const here=path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Z]:)/,'$1')),cand=path.resolve(here,'..','..','..'),base=process.argv[2],rounds=Number(process.argv[3]??5);
const load=async(root,entry)=>({S:await import(pathToFileURL(path.join(root,'CoachingCore','src',entry)).href),H:await import(pathToFileURL(path.join(root,'CoachingCore','test','v1core-helpers.mjs')).href)});
const trees={base:await load(base,'v1-strength-index.mjs'),candidate:await load(cand,'v1-safety-index.mjs')};
function journey({S,H}){const c=H.client(S),t=[];c.onboard(H.athleteA({weeks:8,id:'bench'}));
 const rev=(k,a,f,e)=>{const t0=performance.now();c.review(k,a,f,e);t.push(performance.now()-t0);};
 for(let w=0;w<8;w++){if(w===5){const day=H.addDays(c.env.program.startDate,w*7),u={...H.athleteA({weeks:8,id:'bench'}),asOf:day,startDate:H.addDays(day,1)};u.athlete.eligibility=H.ELIG(day);u.athlete.pause={reasonCategory:'SCHEDULE',nonclinical:true,weeks:0};c.restart(u,H.at(day,'09:00'));}
  const wk=w>=5?w-5:w;if(!c.env.program.weeks[wk])break;const day=H.addDays(c.env.program.startDate,wk*7+6),obs=H.liveSessions(c.env,wk).map(s=>H.reportOf(c.env,s,{tag:'-'+w}));
  const run=obs.find(o=>o.actual&&o.actual.completed&&!o.actual.exercises);
  if(run){const {response:_r,...b}=run;obs.push({sessionId:run.sessionId,occurrenceDate:run.occurrenceDate,eventId:'ath-'+w,actual:{completed:true,rpe:6},response:{performance:'COMPATIBLE',recovery:'COMPATIBLE',effort:'ON_TARGET',nextDayFunction:'NORMAL'}});}
  rev('WEEKLY_REVIEW',H.at(day),{eligibility:H.ELIG(day),observations:obs},'w'+w);}
 return {t,bytes:Buffer.byteLength(JSON.stringify(c.env.actualLedger))};}
const q=(xs,p)=>{const s=[...xs].sort((a,b)=>a-b);return s[Math.min(s.length-1,Math.ceil(p*s.length)-1)];};
const acc={base:{t:[],bytes:0},candidate:{t:[],bytes:0}};
for(let r=0;r<rounds;r++)for(const k of r%2?['candidate','base']:['base','candidate']){const x=journey(trees[k]);acc[k].t.push(...x.t);acc[k].bytes=x.bytes;}
const out=Object.fromEntries(Object.entries(acc).map(([k,v])=>[k,{reviews:v.t.length,medianMs:+q(v.t,0.5).toFixed(1),p95Ms:+q(v.t,0.95).toFixed(1),maxMs:+Math.max(...v.t).toFixed(1),recordBytes:v.bytes}]));
out.ratio={median:+(out.candidate.medianMs/out.base.medianMs).toFixed(3),p95:+(out.candidate.p95Ms/out.base.p95Ms).toFixed(3),recordBytes:+(out.candidate.recordBytes/out.base.recordBytes).toFixed(3)};
console.log(JSON.stringify(out,null,1));
