// Author probe scaffolding (R7-A DECISION AUTHORITY): read-only use of one CoachingCore tree through its public entry points. R7ADA_ROOT selects
// the tree (default: the live CoachingCore); the probes run the same code on the predecessor copy to show what each class measured there.
// Same synthetic intake and review shapes as the reviewers' libraries (qe-r7asc-lib.mjs, ssctr-r7asc-lib.mjs). Writes nothing.
import path from 'node:path';
import {pathToFileURL} from 'node:url';
export const ROOT=process.env.R7ADA_ROOT?path.resolve(process.env.R7ADA_ROOT):path.resolve(import.meta.dirname,'../../../CoachingCore');
export const TREE=path.relative(path.resolve(import.meta.dirname,'../../..'),ROOT).split(path.sep).join('/');
const imp=p=>import(pathToFileURL(path.join(ROOT,p)).href);
export const R=await imp('src/r6-index.mjs'),A=await imp('src/r6-adaptation.mjs'),PG=await imp('src/r6-program.mjs'),V=await imp('src/value.mjs');
const {devAuthority}=await imp('r6/fixtures/dev-authority.mjs');
export const {PROFILES,EDGE_PROFILES}=await imp('r6/fixtures/profiles.mjs');
export const opts={authority:devAuthority()};
export const addDays=(d,n)=>new Date(Date.parse(d+'T00:00:00Z')+n*864e5).toISOString().slice(0,10);
export const elig=d=>({status:'NONCLINICAL_CONFIRMED',assessedAt:d,pain:false,persistentPain:false,injury:false,illness:false,functionalLimitation:false,clinicalConcern:false});
export const OK={performance:'COMPATIBLE',recovery:'COMPATIBLE',effort:'ON_TARGET',nextDayFunction:'NORMAL'};
export const K=(id,sets,reps,kg,convention='TOTAL')=>({id,sets,reps,load:{value:kg,unit:'KG',convention},rir:2,current:true,familiar:true,tolerated:true,observedAt:'2026-10-29'});
export const WJ={athlete:{goals:{run:'REGULAR',strength:'GENERAL'},runExperience:'NONE',strengthExperience:'NOVICE',recent:{runDaysPerWeek:0,runMinutesPerWeek:0,strengthDaysPerWeek:0},knownExercises:[]},schedule:{runDays:[1,3,6],strengthDays:[2,5],runMinutes:30,strengthMinutes:30,longRunDay:6,longRunMinutes:30}};
export const intake=({id,goal='STRENGTH',known=[K('back-squat',3,5,80),K('db-bench-press',3,8,18,'PER_HAND')],athlete={},schedule={}})=>({version:'R6-INTAKE-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:'2026-11-01',startDate:'2026-11-02',weeks:16,learningConsent:true,
 athlete:{id,ageEligible:true,eligibility:elig('2026-11-01'),goals:{run:'PERFORMANCE',strength:goal},runExperience:'INTERMEDIATE',strengthExperience:'INTERMEDIATE',recent:{runDaysPerWeek:3,runMinutesPerWeek:150,longestRunMinutes:70,strengthDaysPerWeek:2},equipment:['DUMBBELLS','BENCH','BARBELL','RACK'],knownExercises:known,exerciseRotationPreference:'FIXED',...athlete},
 schedule:{runDays:[1,3,6],strengthDays:[2,5],runTurn:'AM',strengthTurn:'PM',runMinutes:60,strengthMinutes:60,longRunDay:6,longRunMinutes:100,...schedule}});
let N=0;export const resetIds=()=>{N=0;};
export const at=(p,w,day,hour,x={})=>{const d=addDays(p.weeks[w].startDate,day);return {version:'R6-REVIEW-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:`${d}T${hour}Z`,weekIndex:w,event:{id:`r7ada-${w}-${x.kind??'WEEKLY_REVIEW'}-${N++}`,kind:x.kind??'WEEKLY_REVIEW'},eligibility:elig(d),observations:[],...x};};
export function obs(p,s,{kg=null,set=null,sets=null,noDetails=false,drop=null}={}){const pr=s.prescription,a={completed:true,minutes:pr.durationMinutes};
 if(pr.modality==='STRENGTH'&&!noDetails)a.exercises=pr.exercises.filter(e=>!drop||!drop.includes(e.id)).map(e=>({id:e.id,sets:Array.from({length:sets?.(e.id,e)??e.sets},()=>{const x={load:e.load.mode==='BODYWEIGHT'?{value:0,unit:'BODYWEIGHT',convention:'BODYWEIGHT'}:{value:kg?.(e.id,e)??(e.load.mode==='KNOWN'?e.load.value:20),unit:'KG',convention:e.load.convention},reps:e.reps,rir:e.rir};return set?set(e.id,x,e):x;})}));
 return {eventId:`r7ada-o-${N++}`,athleteId:p.athleteId,sessionId:s.id,observedAt:`${s.date}T${s.turn==='PM'?'19:00:00':'08:00:00'}Z`,actual:a,response:{...OK}};}
export const evaluate=(t,review)=>R.evaluateProgram(t.p,{...review,actualLedger:t.ledger},opts);
export const step=(t,review)=>{const r=evaluate(t,review);if(['UNSUPPORTED','HOLD'].includes(r.status))throw Error(`${review.event.kind}: ${r.status} ${r.reason} ${JSON.stringify(r.errors??'')}`);t.ledger=r.actualLedger??t.ledger;if(r.proposal)t.p=r.proposal;t.last=r;return r;};
export const live=s=>s.prescription&&s.status!=='SKIPPED';
export const SAT=s=>s.sport==='STRENGTH'&&s.day===5,isWJ=s=>s.sport==='RUN'&&s.role==='WALK_JOG';
export const weekly=(t,w,keep=()=>true,o={},hour='21:00:00')=>step(t,at(t.p,w,6,hour,{observations:t.p.weeks[w].sessions.filter(s=>live(s)&&keep(s)).map(s=>obs(t.p,s,typeof o==='function'?o(s):o))}));
/** Prebuilt reports of week w day by day at 21:00; Sunday's (and `extra`) on Sunday 21:00 when `close`, else Monday 06:00 of the next week. */
export function deliver(t,w,reports,{close=false,extra=[]}={}){
 const byDay=new Map();for(const o of reports){const s=t.p.weeks[w].sessions.find(x=>x.id===o.sessionId);if(!byDay.has(s.day))byDay.set(s.day,[]);byDay.get(s.day).push(structuredClone(o));}
 for(const d of [0,1,2,3,4,5])if(byDay.has(d))step(t,at(t.p,w,d,'21:00:00',{observations:byDay.get(d)}));
 const sunday=[...(byDay.get(6)??[]),...structuredClone(extra)];
 if(close)step(t,at(t.p,w,6,'21:00:00',{observations:sunday}));else if(sunday.length)step(t,at(t.p,w+1,0,'06:00:00',{observations:sunday}));
}
export const gen=o=>{const g=R.generateProgram(intake(o),opts);if(!g.program)throw Error(`${o.id}: ${g.status} ${g.reason}`);return {p:g.program,ledger:[]};};
export const start=(id,weeks,o={})=>{const t=gen({id,...o});for(let w=0;w<weeks;w++)weekly(t,w);return t;};
export const copy=t=>({p:structuredClone(t.p),ledger:structuredClone(t.ledger)});
export const brk=(startDate,endDate)=>({kind:'RETURN_AFTER_PAUSE',interruption:{days:Math.round((Date.parse(endDate)-Date.parse(startDate))/864e5)+1,startDate,endDate,reasonCategory:'TRAVEL',reason:'Work travel'}});
export const history=(t,w,day=0,hour='06:00:00')=>A.historicalStateOf(t.p,{asOf:`${addDays(t.p.weeks[w].startDate,day)}T${hour}Z`,actualLedger:t.ledger},opts);
export const historyAt=(t,asOf)=>A.historicalStateOf(t.p,{asOf,actualLedger:t.ledger},opts);
export const hex=(H,id)=>H?.strength?.exercises?.[id]??null;
export const rowsOf=(t,w,pred=()=>true,ids=null)=>t.p.weeks[w].sessions.filter(s=>live(s)&&s.sport==='STRENGTH'&&pred(s)).flatMap(s=>s.prescription.exercises.filter(e=>!ids||ids.includes(e.id)).map(e=>`${s.date} ${e.id} ${e.load.mode}${e.load.value??''} ${e.sets}x${e.reps}@${e.rir}`));
export const runRows=(t,w)=>t.p.weeks[w].sessions.filter(s=>live(s)&&s.sport==='RUN').map(s=>`${s.date} ${s.role}:${s.prescription.durationMinutes}:${s.progression?.dimension??''}=${s.progression?.value??''}${s.prescription.strides?.repetitions?':strides'+s.prescription.strides.repetitions:''}`);
export const wjSteps=(t,w)=>[...new Set((t.p.weeks[w]?.sessions??[]).filter(s=>live(s)&&isWJ(s)).map(s=>s.progression?.value))];
export const record=t=>V.hash(t.ledger.map(o=>({eventId:o.eventId,sessionId:o.sessionId,observedAt:o.observedAt,actual:o.actual,correctionOf:o.correctionOf??null,superseded:!!o.superseded,conflicted:!!o.conflicted})).sort((a,b)=>a.eventId<b.eventId?-1:1));
export const runCore=st=>{if(!st)return null;const {planned,longByWeek,modeHistory,...rest}=st;return rest;};
export const equip=(p,w,day=0,hour='06:00:00')=>({...at(p,w,day,hour,{kind:'EQUIPMENT_CHANGE'}),changes:{equipment:[...p.canonical.athlete.equipment,'BANDS']}});
