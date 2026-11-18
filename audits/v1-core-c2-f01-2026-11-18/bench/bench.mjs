// CORE-C2-F01: Node regression benchmark, base (d92aa88, COACHINGCORE-V1-CORE-SAFETY-FREEZE-1 line) vs this tree, interleaved in one process.
// Not an iPhone measurement. The fix touches only the restart intake, so two things are timed: the closure's hybrid 8-week journey (every
// review, a restart at week 5) and a restart from a record that holds a correction of every run of weeks 0 to 2 (the F01 shape, 12 replaced rows).
//   node audits/v1-core-c2-f01-2026-11-18/bench/bench.mjs <baseRoot> [rounds=5]   (baseRoot: a git archive of d92aa88 with node_modules)
import path from 'node:path';
import {pathToFileURL} from 'node:url';
const here=path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Z]:)/,'$1')),cand=path.resolve(here,'..','..','..'),base=process.argv[2],rounds=Number(process.argv[3]??5);
const load=async root=>({S:await import(pathToFileURL(path.join(root,'CoachingCore','src','v1-safety-index.mjs')).href),H:await import(pathToFileURL(path.join(root,'CoachingCore','test','v1core-helpers.mjs')).href)});
const trees={base:await load(base),candidate:await load(cand)};
function journey({S,H}){const c=H.client(S),t=[],r=[];c.onboard(H.athleteA({weeks:8,id:'bench'}));
 const rev=(k,a,f,e)=>{const t0=performance.now();c.review(k,a,f,e);t.push(performance.now()-t0);};
 for(let w=0;w<8;w++){if(w===5){const day=H.addDays(c.env.program.startDate,w*7),u={...H.athleteA({weeks:8,id:'bench'}),asOf:day,startDate:H.addDays(day,1)};u.athlete.eligibility=H.ELIG(day);u.athlete.pause={reasonCategory:'SCHEDULE',nonclinical:true,weeks:0};const t0=performance.now();c.restart(u,H.at(day,'09:00'));r.push(performance.now()-t0);}
  const wk=w>=5?w-5:w;if(!c.env.program.weeks[wk])break;const day=H.addDays(c.env.program.startDate,wk*7+6),obs=H.liveSessions(c.env,wk).map(s=>H.reportOf(c.env,s,{tag:'-'+w}));
  rev('WEEKLY_REVIEW',H.at(day),{eligibility:H.ELIG(day),observations:obs},'w'+w);}
 return {t,r,bytes:Buffer.byteLength(JSON.stringify(c.env.actualLedger))};}
/** The F01 shape: weeks 0 to 2 reported and every run corrected; then the restart is timed (the record is restored through JSON each time). */
function corrected({S,H}){const c=H.client(S),p=(c.onboard(H.athleteA({weeks:8,id:'bench-f01'})),c.env.program);
 for(const w of [0,1,2]){const d=H.addDays(p.startDate,w*7+6);c.review('WEEKLY_REVIEW',H.at(d),{eligibility:H.ELIG(d),observations:H.liveSessions(c.env,w).map(s=>H.reportOf(c.env,s,{tag:'-'+w}))},'w'+w);
  const runs=c.env.actualLedger.filter(o=>!o.fact&&!o.superseded&&o.context?.sport==='RUN'&&o.localDate>=H.addDays(p.startDate,w*7));
  c.review('WEEKLY_REVIEW',H.at(d,'22:00'),{eligibility:H.ELIG(d),observations:runs.map(o=>({eventId:o.eventId+'-fix',athleteId:o.athleteId,sessionId:o.sessionId,occurrenceDate:o.localDate,actual:{...o.actual},response:o.response,correctionOf:o.eventId,correctedAt:H.at(d,'21:00')}))},'fix'+w);}
 const kept=JSON.stringify(c.env.actualLedger),day=H.addDays(p.startDate,24),u={...H.athleteA({weeks:8,id:'bench-f01'}),asOf:day,startDate:H.addDays(day,3)};u.athlete.eligibility=H.ELIG(day);u.athlete.pause={reasonCategory:'SCHEDULE',nonclinical:true,weeks:0};
 const t=[];for(let i=0;i<8;i++){const t0=performance.now();S.restartProgram({intake:structuredClone(u),record:JSON.parse(kept),referenceState:c.env.referenceState,asOf:H.at(day,'10:00'),athleteId:p.athleteId,runEvidenceRecord:c.env.runEvidenceRecord,runFormatRecord:c.env.runFormatRecord,runHistoryRecord:c.env.runHistoryRecord});t.push(performance.now()-t0);}
 return {t};}
const q=(xs,p)=>{const s=[...xs].sort((a,b)=>a-b);return s[Math.min(s.length-1,Math.ceil(p*s.length)-1)];};
const acc={base:{t:[],r:[],f:[],bytes:0},candidate:{t:[],r:[],f:[],bytes:0}};
for(let n=0;n<rounds;n++)for(const k of n%2?['candidate','base']:['base','candidate']){const x=journey(trees[k]),y=corrected(trees[k]);acc[k].t.push(...x.t);acc[k].r.push(...x.r);acc[k].f.push(...y.t);acc[k].bytes=x.bytes;}
const stat=v=>({n:v.length,medianMs:+q(v,0.5).toFixed(1),p95Ms:+q(v,0.95).toFixed(1)});
const out=Object.fromEntries(Object.entries(acc).map(([k,v])=>[k,{reviews:stat(v.t),journeyRestart:stat(v.r),correctedRestart:stat(v.f),recordBytes:v.bytes}]));
const ratio=(a,b)=>+(b/a).toFixed(3);
out.ratio={reviewMedian:ratio(out.base.reviews.medianMs,out.candidate.reviews.medianMs),reviewP95:ratio(out.base.reviews.p95Ms,out.candidate.reviews.p95Ms),correctedRestartMedian:ratio(out.base.correctedRestart.medianMs,out.candidate.correctedRestart.medianMs),correctedRestartP95:ratio(out.base.correctedRestart.p95Ms,out.candidate.correctedRestart.p95Ms),recordBytes:ratio(out.base.recordBytes,out.candidate.recordBytes)};
console.log(JSON.stringify(out,null,1));
