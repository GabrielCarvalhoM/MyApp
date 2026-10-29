// QE judge (R7-A) shared probe helpers. Read-only use of the frozen runtime; the pre-R7A runtime is copied byte-exact into the OS temp
// directory (never into the repo). DEV_TEST_ONLY authority from CoachingCore/r6/fixtures/dev-authority.mjs. Synthetic data only.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {pathToFileURL,fileURLToPath} from 'node:url';
const here=path.dirname(fileURLToPath(import.meta.url));
export const ROOT=path.resolve(here,'../../..');
const CC=path.join(ROOT,'CoachingCore');
const load=rel=>import(pathToFileURL(path.join(CC,rel)).href);
export const cur={...(await load('src/r6-index.mjs')),...(await load('src/r6-program.mjs')),...(await load('src/r6-intake.mjs')),...(await load('src/r6-provenance.mjs'))};
export const {devAuthority}=await load('r6/fixtures/dev-authority.mjs');
export const opts={authority:devAuthority()};
export const OP=opts.authority.policy.operational;
let preCache=null;
/** The R6 closure runtime (pre-R7A), rebuilt from the byte-exact snapshot into a temp folder. */
export async function pre(){
 if(preCache)return preCache;
 const snap=path.join(ROOT,'audits/domain-coaching-r7a-2026-10-27/pre-r7a-source'),manifest=JSON.parse(fs.readFileSync(path.join(snap,'MANIFEST.json'),'utf8'));
 const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'qe-r7a-pre-'));
 for(const [rel,digest] of Object.entries(manifest.files)){const b=fs.readFileSync(path.join(snap,rel));if(createHash('sha256').update(b).digest('hex')!==digest)throw Error('snapshot drift '+rel);fs.mkdirSync(path.dirname(path.join(tmp,rel)),{recursive:true});fs.writeFileSync(path.join(tmp,rel),b);}
 const L=rel=>import(pathToFileURL(path.join(tmp,'CoachingCore',rel)).href);
 preCache={...(await L('src/r6-index.mjs')),...(await L('src/r6-program.mjs')),tmp};
 return preCache;
}
export const addDays=(d,n)=>new Date(Date.parse(d+'T00:00:00Z')+n*864e5).toISOString().slice(0,10);
export const elig=d=>({status:'NONCLINICAL_CONFIRMED',assessedAt:d,pain:false,persistentPain:false,injury:false,illness:false,functionalLimitation:false,clinicalConcern:false});
export const OK={performance:'COMPATIBLE',recovery:'COMPATIBLE',effort:'ON_TARGET',nextDayFunction:'NORMAL'};
export const SQUAT={id:'back-squat',sets:3,reps:5,load:{value:80,unit:'KG',convention:'TOTAL'},rir:2,current:true,familiar:true,tolerated:true,observedAt:'2026-10-29'};
export const BENCH={id:'db-bench-press',sets:3,reps:8,load:{value:18,unit:'KG',convention:'PER_HAND'},rir:2,current:true,familiar:true,tolerated:true,observedAt:'2026-10-29'};
export const intake=({id,weeks=12,athlete={},schedule={},...rest})=>({version:'R6-INTAKE-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:'2026-11-01',startDate:'2026-11-02',weeks,learningConsent:true,...rest,
 athlete:{id,ageEligible:true,eligibility:elig('2026-11-01'),goals:{run:'PERFORMANCE',strength:'STRENGTH'},runExperience:'INTERMEDIATE',strengthExperience:'INTERMEDIATE',recent:{runDaysPerWeek:3,runMinutesPerWeek:120,longestRunMinutes:50,strengthDaysPerWeek:2},equipment:['DUMBBELLS','BENCH','BARBELL','RACK'],knownExercises:[SQUAT,BENCH],...athlete},
 schedule:{runDays:[1,3,6],strengthDays:[0,4],runTurn:'AM',strengthTurn:'PM',runMinutes:50,strengthMinutes:50,longRunDay:6,longRunMinutes:80,...schedule}});
let N=0;
export const review=(p,w,{day=6,kind='WEEKLY_REVIEW',hour='21',...x}={})=>{const d=addDays(p.weeks[w].startDate,day);return {version:'R6-REVIEW-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:`${d}T${hour}:00:00Z`,weekIndex:w,event:{id:`qe-${w}-${kind}-${N++}`,kind},eligibility:elig(d),...x};};
/** An as-prescribed execution report; over[exerciseId] = {load|reps|rir|noReps|noRir|sets(count)}. */
export function obs(p,s,{over={},eventId=null,source=null,minutes=null,observedAt=null,only=null}={}){
 const pr=s.prescription,actual={completed:true,minutes:minutes??pr.durationMinutes};
 if(pr.modality==='STRENGTH')actual.exercises=pr.exercises.filter(e=>!only||only.includes(e.id)).map(e=>{const o=over[e.id]??{};const ld=o.load!==undefined?o.load:{value:e.load.mode==='KNOWN'?e.load.value:e.load.mode==='BODYWEIGHT'?0:20,unit:e.load.mode==='BODYWEIGHT'?'BODYWEIGHT':'KG',convention:e.load.convention};return {id:e.id,sets:Array.from({length:o.sets??e.sets},()=>{const set={};if(ld!==null)set.load=ld;if(!o.noReps)set.reps=o.reps??e.reps;if(!o.noRir)set.rir=o.rir??e.rir;return set;})};});
 return {eventId:eventId??`qe-${p.athleteId}-${s.id}-${N++}`,athleteId:p.athleteId,sessionId:s.id,observedAt:observedAt??s.date+(s.turn==='PM'?'T19:00:00Z':'T08:00:00Z'),actual,response:{...OK},...(source?{source}:{})};
}
export const rows=(P,w)=>(P.weeks[w]?.sessions??[]).filter(s=>s.sport==='STRENGTH'&&s.prescription&&s.status!=='SKIPPED').flatMap(s=>s.prescription.exercises.map(e=>({s,e})));
export const fmt=(s,e)=>`${s.date} d${s.day} ${s.id} ${e.id} ${e.sets}x${e.reps}@${e.rir} ${e.load.mode}${e.load.value!=null?' '+e.load.value:''} kind=${e.exposure?.kind??'-'} phase=${e.exposure?.phase??'-'}/${e.exposure?.phaseBasis??'-'}`;
/** Weekly-reviewed timeline driven by a runtime R (cur or pre). act(p,w,s): 'EXEC'|'MISS'; over(p,w,s) per-exercise overrides. */
export function timeline(R,ia,{weeks=12,act=()=>'EXEC',over=()=>({}),until=null,extra={},reviewed=()=>true,start=null}={}){
 let p=start??R.generateProgram(intake({weeks,...ia}),opts).program;if(!p)throw Error('no program '+ia.id);
 let ledger=[];const log=[];
 for(let w=0;w<(until??p.weeks.length-1);w++){
  if(extra[w]){const r=R.evaluateProgram(p,{...extra[w](p),actualLedger:ledger},opts);log.push(`${w}+:${r.status}/${r.action}`);ledger=r.actualLedger??ledger;if(r.proposal)p=r.proposal;}
  if(!reviewed(w))continue;
  const list=p.weeks[w].sessions.filter(s=>s.prescription&&s.status!=='SKIPPED'&&act(p,w,s)!=='MISS').map(s=>obs(p,s,{over:over(p,w,s)}));
  const r=R.evaluateProgram(p,review(p,w,{observations:list,actualLedger:ledger}),opts);log.push(`${w}:${r.status}/${r.action}`);
  ledger=r.actualLedger??ledger;if(r.proposal)p=r.proposal;
 }
 return {P:p,log,ledger};
}
export const out=(name,obj)=>{const s=JSON.stringify({probe:name,...obj},null,1);console.log(s);return obj;};
