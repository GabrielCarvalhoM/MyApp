// R7-B test fixtures (DOMAIN_COACHING_R7-B). Synthetic, development authority for the R6 boundaries (r6/fixtures/dev-authority.mjs); the
// repertoire authority is the real one (the bound catalog and its SSCTR r2 records) unless a test passes another.
import assert from 'node:assert/strict';
import {generateProgram,evaluateProgram} from '../../../src/r6-index.mjs';
import {devAuthority} from '../../../r6/fixtures/dev-authority.mjs';

export const opts={authority:devAuthority()};
export const addDays=(d,n)=>new Date(Date.parse(d+'T00:00:00Z')+n*864e5).toISOString().slice(0,10);
export const elig=d=>({status:'NONCLINICAL_CONFIRMED',assessedAt:d,pain:false,persistentPain:false,injury:false,illness:false,functionalLimitation:false,clinicalConcern:false});
export const OK={performance:'COMPATIBLE',recovery:'COMPATIBLE',effort:'ON_TARGET',nextDayFunction:'NORMAL'};
export const K=(id,sets,reps,kg,convention='TOTAL')=>({id,sets,reps,load:{value:kg,unit:'KG',convention},rir:2,current:true,familiar:true,tolerated:true,observedAt:'2026-10-29'});
export const FULL=['BARBELL','RACK','BENCH','DUMBBELLS','KETTLEBELL','MACHINES','BANDS','PULL_UP_BAR'];
/** An onboarding-like intake; every field can be overridden. */
export function intake({id='r7b',weeks=12,goals={run:'PERFORMANCE',strength:'GENERAL'},runExperience='INTERMEDIATE',strengthExperience='INTERMEDIATE',recent={runDaysPerWeek:3,runMinutesPerWeek:150,longestRunMinutes:60,strengthDaysPerWeek:2},equipment=['DUMBBELLS','BENCH'],knownExercises=[],knownRuns=[],rotation='FIXED',event=null,pause=null,schedule={},athlete={}}={}){
 return {version:'R6-INTAKE-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:'2026-11-01',startDate:'2026-11-02',weeks,learningConsent:true,
  athlete:{id,ageEligible:true,eligibility:elig('2026-11-01'),goals,runExperience,strengthExperience,recent,equipment,knownExercises,knownRuns,exerciseRotationPreference:rotation,...(event?{event}:{}),...(pause?{pause}:{}),...athlete},
  schedule:{runDays:[1,3,6],strengthDays:[0,4],runTurn:'AM',strengthTurn:'PM',runMinutes:60,strengthMinutes:60,longRunDay:6,longRunMinutes:90,...schedule}};
}
export const gen=(o,options=opts)=>generateProgram(intake(o),options);
export function program(o,options=opts){const g=gen(o,options);assert.ok(g.program,`${o.id}: ${g.status} ${g.reason} ${JSON.stringify(g.errors??[])}`);return g.program;}
let N=0;
export const review=(p,w,{day=6,hour='21:00:00',kind='WEEKLY_REVIEW',...x}={})=>{const d=addDays(p.weeks[w].startDate,day);return {version:'R6-REVIEW-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:`${d}T${hour}Z`,weekIndex:w,event:{id:`r7b-${w}-${kind}-${N++}`,kind},eligibility:elig(d),observations:[],...x};};
/** A report of session s executed as prescribed (a chosen load logged at `kg(e)` or 20 kg), with an optional response override. */
export function obs(p,s,{kg=null,response=null,minutes=null,actual=null}={}){
 const pr=s.prescription,a={completed:true,minutes:minutes??pr.durationMinutes};
 if(pr.modality==='STRENGTH')a.exercises=pr.exercises.map(e=>({id:e.id,sets:Array.from({length:e.sets},()=>({load:e.load.mode==='BODYWEIGHT'?{value:0,unit:'BODYWEIGHT',convention:'BODYWEIGHT'}:{value:e.load.mode==='KNOWN'?e.load.value:kg?.(e)??20,unit:'KG',convention:e.load.convention},reps:e.reps,rir:e.rir}))}));
 return {eventId:`r7b-o-${N++}`,athleteId:p.athleteId,sessionId:s.id,observedAt:`${s.date}T${s.turn==='PM'?'19:00:00':'08:00:00'}Z`,actual:actual??a,response:{...OK,...(response??{})}};
}
export const live=s=>s.prescription&&s.status!=='SKIPPED';
/** One weekly review with the week's live sessions executed (keep filters, o(s) gives obs options); returns the result and updates t. */
export function weekly(t,w,{keep=()=>true,o=()=>({}),extra={},options=opts}={}){
 const r=evaluateProgram(t.p,{...review(t.p,w,{observations:t.p.weeks[w].sessions.filter(s=>live(s)&&keep(s)).map(s=>obs(t.p,s,o(s))),...extra}),actualLedger:t.ledger},options);
 assert.ok(!['UNSUPPORTED','HOLD'].includes(r.status),`week ${w}: ${r.status} ${r.reason} ${JSON.stringify(r.errors??[])}`);
 t.ledger=r.actualLedger??t.ledger;if(r.proposal)t.p=r.proposal;t.last=r;return r;
}
export const reviewed=(o,weeks=0,options=opts)=>{const t={p:program(o,options),ledger:[]};for(let w=0;w<weeks;w++)weekly(t,w,{options});return t;};
export const rows=(p,w)=>p.weeks[w].sessions.filter(live).flatMap(s=>(s.prescription.exercises??[]).map(e=>({s,e})));
export const runs=(p,w)=>p.weeks[w].sessions.filter(s=>live(s)&&s.sport==='RUN');
export {generateProgram,evaluateProgram};
