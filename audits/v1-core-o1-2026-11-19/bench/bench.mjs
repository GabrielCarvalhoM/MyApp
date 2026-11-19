// O-1 Conflict Evidence: Node regression benchmark (copied unchanged from audits/v1-core-ncc-2026-11-19/bench/bench.mjs), base FREEZE-5 (f40fbe1) vs this tree, interleaved
// in one process. Not an iPhone measurement. Copied from audits/v1-core-sec-r2-2026-11-19/bench/bench.mjs (the hybrid 8-week journey with a restart
// at week 5; a restart from a record with every run of weeks 0-2 corrected; the normalizer micro-bench), plus a merged-history normalizer bench
// (every session reported by the athlete and the watch: the parts carry the activity this line indexes; re-read; a late batch dated earlier).
//   node --expose-gc audits/v1-core-ncc-2026-11-19/bench/bench.mjs <baseRoot> [rounds=5]   (baseRoot: a checkout of e704180 with node_modules)
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
// Normalizer micro-bench (the changed function): a small batch (6 reports), a 240-row history with 120 corrections (a third refused), and a
// re-synchronization of that history with nothing new; each timed 200 times per round, interleaved. Heap delta over the corrected history.
const norm={base:(await import(pathToFileURL(path.join(base,'CoachingCore','src','r6-provenance.mjs')).href)).normalizeObservations,candidate:(await import(pathToFileURL(path.join(cand,'CoachingCore','src','r6-provenance.mjs')).href)).normalizeObservations};
const U={performance:'UNKNOWN',recovery:'UNKNOWN',effort:'UNKNOWN',nextDayFunction:'UNKNOWN'},day=i=>new Date(Date.parse('2026-09-01T00:00:00Z')+i*864e5).toISOString().slice(0,10);
const rep=(i,extra={})=>({athleteId:'b',sessionId:'s'+i,eventId:'e'+i,observedAt:day(i)+'T09:00:00Z',reportedAt:day(i)+'T12:00:00Z',context:{sport:i%3?'RUN':'STRENGTH',sessionType:'RUN_EASY'},response:U,actual:{completed:true,minutes:40},source:{provider:'MANUAL'},...extra});
const small=Array.from({length:6},(_,i)=>rep(i)),hist=Array.from({length:120},(_,i)=>rep(i));
const fixes=Array.from({length:120},(_,i)=>({...rep(i),eventId:i%3===0?'e'+((i+1)%120):'c'+i,correctionOf:'e'+i,correctedAt:day(i)+'T20:00:00Z',reportedAt:day(i)+'T20:00:00Z',actual:{completed:true,minutes:35}}));
const opt=asOf=>({athleteId:'b',asOf,maximumAgeDays:36500});
const time=(f,n=200)=>{const t=[];for(let i=0;i<n;i++){const t0=performance.now();f();t.push(performance.now()-t0);}return t;};
const nacc={base:{small:[],history:[],resync:[],bytes:0,heap:0},candidate:{small:[],history:[],resync:[],bytes:0,heap:0}};
for(let n=0;n<rounds;n++)for(const k of n%2?['candidate','base']:['base','candidate']){const N=norm[k],a=nacc[k];
 a.small.push(...time(()=>N(small,opt('2026-09-08T00:00:00Z'))));
 a.history.push(...time(()=>N([...hist,...fixes],opt('2027-01-01T00:00:00Z')),50));
 const kept=(r=>[...r.accepted,...r.supersededRows])(N([...hist,...fixes],opt('2027-01-01T00:00:00Z')));a.bytes=Buffer.byteLength(JSON.stringify(kept));
 a.resync.push(...time(()=>N([],{...opt('2027-01-02T00:00:00Z'),prior:kept}),50));
 globalThis.gc?.();const h0=process.memoryUsage().heapUsed;const keep=[];for(let i=0;i<20;i++)keep.push(N([...hist,...fixes],opt('2027-01-01T00:00:00Z')));a.heap=Math.round((process.memoryUsage().heapUsed-h0)/20/1024);keep.length=0;}
const nstat=v=>({n:v.length,medianMs:+q(v,0.5).toFixed(3),p95Ms:+q(v,0.95).toFixed(3)});
out.normalizer=Object.fromEntries(Object.entries(nacc).map(([k,v])=>[k,{small:nstat(v.small),correctedHistory:nstat(v.history),resync:nstat(v.resync),keptBytes:v.bytes,heapKiBPerRun:v.heap}]));
out.normalizer.ratio={small:ratio(out.normalizer.base.small.medianMs,out.normalizer.candidate.small.medianMs),correctedHistory:ratio(out.normalizer.base.correctedHistory.medianMs,out.normalizer.candidate.correctedHistory.medianMs),resync:ratio(out.normalizer.base.resync.medianMs,out.normalizer.candidate.resync.medianMs),keptBytes:ratio(out.normalizer.base.keptBytes,out.normalizer.candidate.keptBytes)};
// Merged history (F2 bytes, F1 order): 120 sessions, each an athlete report and a watch report of one activity (merged, parts kept); the kept
// record re-read with nothing new; then a late batch of 40 watch re-syncs (new event ids, same activities) reported before the record's reports.
const W=i=>({...rep(i,{eventId:'w'+i,reportedAt:day(i)+'T12:30:00Z',source:{provider:'HEALTHKIT',activityId:'hk'+i,quality:'WEARABLE_FULL'},canonicalActivityId:'hk'+i,actual:{completed:true,minutes:41}})});
const merged=[...hist,...Array.from({length:120},(_,i)=>W(i))],late=Array.from({length:40},(_,i)=>({...W(i),eventId:'w'+i+'-late',reportedAt:day(i)+'T11:00:00Z'}));
const macc={base:{merge:[],reread:[],late:[],bytes:0},candidate:{merge:[],reread:[],late:[],bytes:0}};
for(let n=0;n<rounds;n++)for(const k of n%2?['candidate','base']:['base','candidate']){const N=norm[k],a=macc[k];
 a.merge.push(...time(()=>N(merged,opt('2027-01-01T00:00:00Z')),50));
 const kept=(r=>[...r.accepted,...r.supersededRows])(N(merged,opt('2027-01-01T00:00:00Z')));a.bytes=Buffer.byteLength(JSON.stringify(kept));
 a.reread.push(...time(()=>N([],{...opt('2027-01-02T00:00:00Z'),prior:kept}),50));
 a.late.push(...time(()=>N(late,{...opt('2027-01-02T00:00:00Z'),prior:kept}),50));}
out.mergedHistory=Object.fromEntries(Object.entries(macc).map(([k,v])=>[k,{merge:nstat(v.merge),reread:nstat(v.reread),lateBatch:nstat(v.late),keptBytes:v.bytes}]));
out.mergedHistory.ratio={merge:ratio(out.mergedHistory.base.merge.medianMs,out.mergedHistory.candidate.merge.medianMs),reread:ratio(out.mergedHistory.base.reread.medianMs,out.mergedHistory.candidate.reread.medianMs),lateBatch:ratio(out.mergedHistory.base.lateBatch.medianMs,out.mergedHistory.candidate.lateBatch.medianMs),keptBytes:ratio(out.mergedHistory.base.keptBytes,out.mergedHistory.candidate.keptBytes)};
console.log(JSON.stringify(out,null,1));
