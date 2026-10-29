// Reviewer-owned probe scaffolding (QE, STATE-MODEL-CONSUMER-FREEZE-1). Read-only use of the frozen runtime; writes nothing.
// QE_ROOT selects the CoachingCore root (default: the live freeze, ../../../CoachingCore). Same synthetic intake shape as the predecessor
// judge's qe-r7asm-lib.mjs, so cells are comparable; history is read on the record AS evaluateProgram RETURNS IT (the canonical input).
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import fs from 'node:fs';
const NEAR=path.resolve(import.meta.dirname,'../../../CoachingCore');
const ROOT=process.env.QE_ROOT?path.resolve(process.env.QE_ROOT):(fs.existsSync(path.join(NEAR,'src/r6-index.mjs'))?NEAR:'C:/Users/carva/Desktop/myApp/MyApp/CoachingCore');
const imp=p=>import(pathToFileURL(path.join(ROOT,p)).href);
export const R=await imp('src/r6-index.mjs');
export const A=await imp('src/r6-adaptation.mjs');
export const PG=await imp('src/r6-program.mjs');
export const V=await imp('src/value.mjs');
const {devAuthority}=await imp('r6/fixtures/dev-authority.mjs');
export const opts={authority:devAuthority()};
export const ROOT_USED=ROOT;
export const addDays=(d,n)=>new Date(Date.parse(d+'T00:00:00Z')+n*864e5).toISOString().slice(0,10);
export const elig=d=>({status:'NONCLINICAL_CONFIRMED',assessedAt:d,pain:false,persistentPain:false,injury:false,illness:false,functionalLimitation:false,clinicalConcern:false});
export const OK={performance:'COMPATIBLE',recovery:'COMPATIBLE',effort:'ON_TARGET',nextDayFunction:'NORMAL'};
export const K=(id,sets,reps,kg,convention='TOTAL')=>({id,sets,reps,load:{value:kg,unit:'KG',convention},rir:2,current:true,familiar:true,tolerated:true,observedAt:'2026-10-29'});
export const intake=({id,schedule={},athlete={},weeks=16,tz=null})=>({version:'R6-INTAKE-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:'2026-11-01',startDate:'2026-11-02',weeks,learningConsent:true,...(tz===null?{}:{timezoneOffsetMinutes:tz}),
 athlete:{id,ageEligible:true,eligibility:elig('2026-11-01'),goals:{run:'PERFORMANCE',strength:'STRENGTH'},runExperience:'INTERMEDIATE',strengthExperience:'INTERMEDIATE',recent:{runDaysPerWeek:3,runMinutesPerWeek:150,longestRunMinutes:70,strengthDaysPerWeek:2},equipment:['DUMBBELLS','BENCH','BARBELL','RACK'],knownExercises:[K('back-squat',3,5,80),K('db-bench-press',3,8,18,'PER_HAND')],exerciseRotationPreference:'FIXED',...athlete},
 schedule:{runDays:[1,3,6],strengthDays:[2,5],runTurn:'AM',strengthTurn:'PM',runMinutes:60,strengthMinutes:60,longRunDay:6,longRunMinutes:100,...schedule}});
let N=0;export const uid=p=>`${p}-${N++}`;export const resetIds=()=>{N=0;};
/** The record a cell holds, as facts: every row (live, superseded, conflicted) by id, session, clocks, payload and correction chain. */
export const recordOf=t=>t.ledger.map(o=>({eventId:o.eventId,sessionId:o.sessionId,observedAt:o.observedAt,actual:o.actual,response:o.response,source:o.source??null,correctionOf:o.correctionOf??null,correctedAt:o.correctedAt??null,reportedAt:o.reportedAt??null,superseded:!!o.superseded,conflicted:!!o.conflicted})).sort((a,b)=>a.eventId<b.eventId?-1:a.eventId>b.eventId?1:0);
export const at=(p,w,day,hour,x={})=>{const d=addDays(p.weeks[w].startDate,day);return {version:'R6-REVIEW-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:`${d}T${hour}Z`,weekIndex:w,event:{id:uid(`qe7sc-${w}-${x.kind??'WEEKLY_REVIEW'}`),kind:x.kind??'WEEKLY_REVIEW'},eligibility:elig(d),observations:[],...x};};
/** A report of session s as prescribed; kg(id,e) picks the logged load; set(id,x) edits each set; actual replaces the report; noDetails drops exercises; sets forces a set count. */
export function obs(p,s,{kg=null,set=null,actual=null,noDetails=false,only=null,drop=null,sets=null,reps=null}={}){const pr=s.prescription,a={completed:true,minutes:pr.durationMinutes};
 if(pr.modality==='STRENGTH'&&!noDetails)a.exercises=pr.exercises.filter(e=>(!only||only.includes(e.id))&&(!drop||!drop.includes(e.id))).map(e=>({id:e.id,sets:Array.from({length:sets?.(e.id,e)??e.sets},()=>{const x={load:e.load.mode==='BODYWEIGHT'?{value:0,unit:'BODYWEIGHT',convention:'BODYWEIGHT'}:{value:kg?.(e.id,e)??(e.load.mode==='KNOWN'?e.load.value:20),unit:'KG',convention:e.load.convention},reps:reps?.(e.id,e)??e.reps,rir:e.rir};return set?set(e.id,x):x;})}));
 return {eventId:uid('qe7sc-o'),athleteId:p.athleteId,sessionId:s.id,observedAt:`${s.date}T${s.turn==='PM'?'19:00:00':'08:00:00'}Z`,actual:actual??a,response:{...OK}};}
export const evaluate=(t,review)=>R.evaluateProgram(t.p,{...review,actualLedger:t.ledger},opts);
export const step=(t,review,{allow=false}={})=>{const r=evaluate(t,review);if(!allow&&['UNSUPPORTED','HOLD'].includes(r.status))throw Error(`${review.event.kind}: ${r.status} ${r.reason} ${JSON.stringify(r.errors??'')}`);t.ledger=r.actualLedger??t.ledger;if(r.proposal)t.p=r.proposal;t.last=r;return r;};
export const live=s=>s.prescription&&s.status!=='SKIPPED';
export const SAT=s=>s.sport==='STRENGTH'&&s.day===5,WED=s=>s.sport==='STRENGTH'&&s.day===2,RUN=s=>s.sport==='RUN';
export const weekly=(t,w,keep=()=>true,o={},hour='21:00:00')=>step(t,at(t.p,w,6,hour,{observations:t.p.weeks[w].sessions.filter(s=>live(s)&&keep(s)).map(s=>obs(t.p,s,typeof o==='function'?o(s):o))}));
export const start=(id,weeks,o={})=>{const g=R.generateProgram(intake({id,...o}),opts);if(!g.program)throw Error(`${id}: ${g.status} ${g.reason}`);const t={p:g.program,ledger:[]};for(let w=0;w<weeks;w++)weekly(t,w);return t;};
export const copy=t=>({p:structuredClone(t.p),ledger:structuredClone(t.ledger)});
export const brk=(startDate,endDate,extra={})=>({kind:'RETURN_AFTER_PAUSE',interruption:{days:Math.round((Date.parse(endDate)-Date.parse(startDate))/864e5)+1,startDate,endDate,reasonCategory:'TRAVEL',reason:'Work travel',...extra}});
/** HistoricalState on the record exactly as evaluateProgram returned it (the input contract of historicalStateOf on this freeze). */
// historicalStateOf exists from HISTORICAL-PROJECTION-FREEZE-1 on; on an older root these readers return a placeholder.
const NO_HISTORY={state:{run:{},strength:{exercises:{}}},strength:{exercises:{}},run:{},basis:null,unavailable:true};
export const history=(t,w,day=0,hour='06:00:00')=>A.historicalStateOf?A.historicalStateOf(t.p,{asOf:`${addDays(t.p.weeks[w].startDate,day)}T${hour}Z`,actualLedger:t.ledger},opts):NO_HISTORY;
export const historyAt=(t,asOf)=>A.historicalStateOf?A.historicalStateOf(t.p,{asOf,actualLedger:t.ledger},opts):NO_HISTORY;
export const hex=(H,id)=>H?.strength?.exercises?.[id];
export const rowsOf=(t,w,pred,ids=null)=>t.p.weeks[w].sessions.filter(s=>live(s)&&pred(s)).flatMap(s=>s.prescription.exercises.filter(e=>!ids||ids.includes(e.id)).map(e=>({id:e.id,date:s.date,mode:e.load.mode,value:e.load.value??null,reps:e.reps,sets:e.sets,rir:e.rir,kind:e.exposure?.kind??null})));
export const fmtRow=r=>`${r.date} ${r.id} ${r.kind} ${r.mode}${r.value??''} ${r.sets}x${r.reps}@RIR${r.rir}`;
export const logsOf=(t,id)=>t.ledger.filter(o=>!o.superseded&&!o.conflicted&&o.logs?.[id]).map(o=>({eventId:o.eventId,sessionId:o.sessionId,day:o.localDate,load:o.logs[id].load,reps:o.logs[id].reps,unitUnknown:o.logs[id].unitUnknown}));
/** The internal reducer's reading (the decisions' own HistoricalState): a what-if SHORT return in week w; its entry is stateAtBreak's state. */
export function reducerEntry(t,w,ids){const c=copy(t),d0=c.p.weeks[w].startDate,r=R.evaluateProgram(c.p,{...at(c.p,w,3,'06:00:00',brk(addDays(d0,1),addDays(d0,2))),actualLedger:c.ledger},opts);
 const e=r.proposal?.decisions.at(-1)?.interruption?.entry?.strength?.exercises??{};return {status:r.status,entry:Object.fromEntries(ids.map(id=>[id,e[id]?{mode:e[id].mode,load:e[id].load??null,reps:e[id].reps??null,loadTick:e[id].loadTick??null,pendingLoad:e[id].pendingLoad??null,unlogged:!!e[id].unlogged,source:e[id].source??null}:null]))};}
/** Deliver prebuilt observations of week w one session-day at a time (day d at 21:00, weekIndex w), Sunday's the next morning at weekIndex w+1. */
export function deliverPerDay(t,w,reports,{closeSunday=false}={}){
 const byDay=new Map();for(const o of reports){const s=t.p.weeks[w].sessions.find(x=>x.id===o.sessionId);if(!s)throw Error('no session '+o.sessionId);if(!byDay.has(s.day))byDay.set(s.day,[]);byDay.get(s.day).push(structuredClone(o));}
 for(const d of [...byDay.keys()].sort((a,b)=>a-b)){
  if(d<6||closeSunday)step(t,at(t.p,w,d,'21:00:00',{observations:byDay.get(d)}));
  else step(t,at(t.p,w+1,0,'06:00:00',{observations:byDay.get(d)}));
 }
}
