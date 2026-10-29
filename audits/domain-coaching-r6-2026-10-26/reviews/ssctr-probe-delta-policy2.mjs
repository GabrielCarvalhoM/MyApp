// SSCTR R6 delta probe (R6-POLICY-2, hash a7570f2e...). Reviewer-authored; DEV_TEST_ONLY authority enables every boundary.
import fs from 'node:fs';
import path from 'node:path';
import {generateProgram} from '../../../CoachingCore/src/r6-program.mjs';
import {evaluateProgram} from '../../../CoachingCore/src/r6-adaptation.mjs';
import {screenInterruptionReason} from '../../../CoachingCore/src/r6-clinical.mjs';
import {devAuthority} from '../../../CoachingCore/r6/fixtures/dev-authority.mjs';
import {PROFILES,EDGE_PROFILES,intake} from '../../../CoachingCore/r6/fixtures/profiles.mjs';

const ALL=devAuthority();
const el=d=>({status:'NONCLINICAL_CONFIRMED',assessedAt:d,pain:false,persistentPain:false,injury:false,illness:false,functionalLimitation:false,clinicalConcern:false});
const R={COMPATIBLE:{performance:'COMPATIBLE',recovery:'COMPATIBLE',effort:'ON_TARGET',nextDayFunction:'NORMAL'}};
let n=0;
const end=(p,w)=>new Date(Date.parse(p.weeks[w].startDate+'T00:00:00Z')+6*86400000).toISOString().slice(0,10);
const obs=(p,s,{actual=null,logs=null}={})=>{const o={eventId:`d2-${s.id}-${n++}`,athleteId:p.athleteId,sessionId:s.id,observedAt:s.date+(s.turn==='PM'?'T19:00:00Z':'T08:00:00Z'),actual:actual?actual(s):{completed:true,minutes:s.prescription.durationMinutes},response:R.COMPATIBLE,source:{provider:'MANUAL'}};if(logs&&s.sport==='STRENGTH')o.actual.exercises=logs(s);return o;};
const review=(p,w,kind,date,extra={})=>({version:'R6-REVIEW-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:date+'T21:00:00Z',weekIndex:w,event:{id:`d2-${kind}-${w}-${n++}`,kind},eligibility:el(date),...extra});
const week=(p,w,ledger,opt={})=>{const observations=p.weeks[w].sessions.filter(s=>s.prescription&&s.role!=='RACE'&&(!opt.skip||!opt.skip(s))).map(s=>obs(p,s,opt));const r=evaluateProgram(p,{...review(p,w,'WEEKLY_REVIEW',end(p,w),{observations,actualLedger:ledger}),...(opt.eligibility?{eligibility:opt.eligibility(end(p,w))}:{})},{authority:ALL});return {r,p:r.proposal??p,ledger:r.actualLedger??ledger};};
const out={probe:'R6-SSCTR-DELTA-POLICY2',authority:'DEV_TEST_ONLY'};

// 1. Clinical screen battery (English, Portuguese, Spanish, punctuation, negation scope, mixed language).
const PHRASES=[
 ['Not sick - injured on holiday',{nonclinical:true}],['No pain, injury during work travel',{nonclinical:true}],['No pain or injury, work travel',{nonclinical:true}],
 ['Not ill, injured my knee at work',{}],['no fever; sprained ankle on vacation',{nonclinical:true}],['pain free now after the flu',{nonclinical:true}],
 ['Work travel, will resume Monday',{}],['My mother was ill, I was caring for her',{nonclinical:true}],['Viagem de trabalho, sem dor',{nonclinical:true}],
 ['Fiquei doente, gripe',{nonclinical:true}],['Machuquei o tornozelo na viagem',{nonclinical:true}],
 ['Estuve enfermo con fiebre',{nonclinical:true}],['Ocupado y enfermo',{nonclinical:true}],['Familia, estuve con fiebre',{nonclinical:true}],['Hacía mucho calor y me lesioné la rodilla',{nonclinical:true}],['Me torcí el tobillo, viaje de trabajo',{nonclinical:true}],['Vacaciones con dolor de espalda',{nonclinical:true}],
 ['Busy at work, also had covid',{nonclinical:true}],['Holiday',{nonclinical:true}],['Holiday',{nonclinical:false}],[null,{nonclinical:true,reasonCategory:'TRAVEL'}],['Flu',{reasonCategory:'TRAVEL',nonclinical:true}]
];
out.SCREEN=PHRASES.map(([reason,flags])=>{const r=screenInterruptionReason({reason,...flags});return {reason,flags,status:r.status,basis:r.basis,matched:r.matched};});

// 2. End-to-end: return review and intake pause with phrases the screen classified NONCLINICAL although they name a clinical cause.
{
 let p=generateProgram(PROFILES.C_BALANCED_HYBRID,{authority:ALL}).program,ledger=[];
 for(const w of [0,1,2,3]){const x=week(p,w,ledger);p=x.p;ledger=x.ledger;}
 const w=5,date=p.weeks[w].startDate;
 const ret=(reason,extra={})=>{const r=evaluateProgram(p,review(p,w,'RETURN_AFTER_PAUSE',date,{interruption:{days:14,reason,nonclinical:true,...extra},actualLedger:ledger}),{authority:ALL});return {reason,status:r.status,missing:r.missingInputs};};
 out.RETURN_E2E=['Not sick - injured on holiday','Ocupado y enfermo','Hacía mucho calor y me lesioné la rodilla','Work travel, will resume Monday'].map(x=>ret(x));
 out.RETURN_ELIGIBILITY_BEFORE_END=(()=>{const r=evaluateProgram(p,{...review(p,w,'RETURN_AFTER_PAUSE',date,{interruption:{days:14,reason:'Work travel',reasonCategory:'WORK',nonclinical:true,endDate:date},actualLedger:ledger}),eligibility:el(new Date(Date.parse(date+'T00:00:00Z')-10*86400000).toISOString().slice(0,10))},{authority:ALL});return {status:r.status,missing:r.missingInputs};})();
 const base=PROFILES.C_BALANCED_HYBRID;
 out.INTAKE_E2E=['Not sick - injured on holiday','Ocupado y enfermo','Vacation'].map(reason=>{const g=generateProgram({...base,athlete:{...base.athlete,pause:{nonclinical:true,weeks:6,reason}}},{authority:ALL});return {reason,status:g.status,missing:g.missingInputs};});
}
// 3. Taper work-minute fraction (governing quantity) for event profiles.
{
 const rows={};
 for(const [name,input] of [['A',PROFILES.A_RUN_FIRST_HALF_MARATHON],['TEN_K',EDGE_PROFILES.TEN_K_EIGHT_WEEKS],['E',PROFILES.E_EXPERIENCED_RUNNER_NOVICE_STRENGTH]]){
  const p=generateProgram(input,{authority:ALL}).program,t=p.weeks.findIndex(w=>w.phase==='TAPER');
  const q=w=>p.weeks[w].sessions.find(s=>s.role==='QUALITY')?.prescription.work;
  const peak=p.weeks.slice(0,t).map((_,i)=>q(i)).filter(Boolean).at(-1),tq=q(t),wm=x=>x?x.repetitions*x.workMinutes:null;
  rows[name]={peak,taper:tq,workFraction:peak&&tq?Math.round(wm(tq)/wm(peak)*100)/100:null,range:ALL.policy.operational.event.taperQualityWorkRange};
 }
 out.TAPER_WORK_FRACTION=rows;
}
// 4. Long-run decreases outside consolidation/taper/race/post-event/return in the conditional plan (tremor).
{
 const rows={};
 for(const [name,input] of Object.entries({...PROFILES,...EDGE_PROFILES})){
  const g=generateProgram(input,{authority:ALL});if(!g.program)continue;
  const L=g.program.weeks.map(w=>({w:w.index,phase:w.phase,long:w.sessions.find(s=>s.role==='LONG')?.prescription.durationMinutes??null}));
  const drops=L.slice(1).filter((x,i)=>x.long!==null&&L[i].long!==null&&x.long<L[i].long&&!['CONSOLIDATION','TAPER','RACE_WEEK','POST_EVENT','NEXT_BLOCK'].includes(x.phase)&&L[i].phase!=='CONSOLIDATION');
  if(drops.length)rows[name]=drops.map(x=>`w${x.w} ${x.phase} ${L[x.w-1].long}->${x.long}`);
 }
 out.LONG_RUN_DROPS_OUTSIDE_PLANNED_REDUCTIONS=rows;
}
// 5. Unknown logged RIR: does strength progression stall indefinitely?
{
 let p=generateProgram(PROFILES.B_STRENGTH_FIRST,{authority:ALL}).program,ledger=[];const trail=[];
 const logs=s=>s.prescription.exercises.map(e=>({id:e.id,sets:Array.from({length:e.sets},()=>({reps:e.reps,load:{value:e.load.value??20,unit:'KG',convention:e.load.convention}}))}));
 for(let w=0;w<6;w++){const x=week(p,w,ledger,{logs});p=x.p;ledger=x.ledger;const sq=p.weeks[w+1]?.sessions.flatMap(s=>s.prescription?.exercises??[]).find(e=>e.id==='back-squat');trail.push({w:w+1,gate:x.r.gates?.['back-squat'],squat:sq?`${sq.sets}x${sq.reps}@${sq.load.value}`:null,question:x.r.nextObservation?.slice(0,140)});}
 out.UNKNOWN_RIR_TRAIL=trail;
}
// 6. Cold-start same-day pairing disclosure (strength and quality run on the same chosen day, different shifts).
{
 const sd=intake('probe-sameday',{weeks:8,athlete:{goals:{run:'PERFORMANCE',strength:'STRENGTH'},runExperience:'INTERMEDIATE',strengthExperience:'INTERMEDIATE',recent:{runDaysPerWeek:3,runMinutesPerWeek:120,longestRunMinutes:50,strengthDaysPerWeek:2},equipment:['BARBELL','RACK','BENCH','DUMBBELLS'],knownExercises:[{id:'back-squat',sets:3,reps:5,load:{value:80,unit:'KG',convention:'TOTAL'},rir:2,current:true,familiar:true,tolerated:true,observedAt:'2026-10-27'},{id:'barbell-rdl',sets:3,reps:6,load:{value:85,unit:'KG',convention:'TOTAL'},rir:2,current:true,familiar:true,tolerated:true,observedAt:'2026-10-29'}]},schedule:{runDays:[1,3,6],strengthDays:[0,3],runTurn:'PM',strengthTurn:'AM',longRunDay:6,runMinutes:50,strengthMinutes:50,longRunMinutes:80}});
 const g=generateProgram(sd,{authority:ALL});
 const arr=g.trace?.arrangement?Object.fromEntries(Object.entries(g.trace.arrangement).map(([k,v])=>[k,{basis:v.basis,selected:v.selectedId,costs:v.counterfactuals.find(c=>c.selected)?.costs?.map(x=>x.axis+':'+x.severity+':'+x.cause)}])):null;
 out.COLD_START_SAME_DAY={status:g.status,arrangement:arr,negotiation:(g.program?.negotiation??g.negotiation??[]).map(x=>x.id+': '+(x.detail??'').slice(0,160)),week3:g.program?.weeks[3].sessions.filter(s=>s.prescription).map(s=>`${s.day}${s.turn??''}:${s.role}:${s.prescription.family}`)};
}
// 7. Runtime single-run ceiling: long runs executed at 40 of 60 planned minutes (partial) for three weeks.
{
 let p=generateProgram(PROFILES.A_RUN_FIRST_HALF_MARATHON,{authority:ALL}).program,ledger=[];const trail=[];
 for(let w=0;w<5;w++){const x=week(p,w,ledger,{actual:s=>s.role==='LONG'?{completed:false,minutes:40}:{completed:true,minutes:s.prescription.durationMinutes}});p=x.p;ledger=x.ledger;trail.push({w:w+1,longPlannedNext:p.weeks[w+1]?.sessions.find(s=>s.role==='LONG')?.prescription.durationMinutes,gateLong:x.r.gates?.LONG});}
 out.CEILING_WITH_SHORT_LONG_RUNS={intakeLongest:60,executedLong:40,trail,note:'Intake-reported longest (60) stays a reference for 30 days from intake; afterwards only executed runs count.'};
}
// 8. Post-event redevelopment with a post-race eligibility assessment.
{
 let p=generateProgram(EDGE_PROFILES.TEN_K_EIGHT_WEEKS,{authority:ALL}).program,ledger=[];
 const pe=p.weeks.findIndex(w=>w.phase==='POST_EVENT'),race=p.weeks[pe-1].sessions.find(s=>s.role==='RACE').date;
 for(let w=0;w<pe;w++){const x=week(p,w,ledger);p=x.p;ledger=x.ledger;}
 const x=week(p,pe,ledger,{eligibility:d=>el(race)});
 out.POST_EVENT_WITH_POST_RACE_ELIGIBILITY={status:x.r.status,action:x.r.action,nextWeek:x.p.weeks[pe+1]?.sessions.filter(s=>s.prescription&&s.sport==='RUN').map(s=>`${s.role}:${s.prescription.durationMinutes}${s.prescription.work?`(${s.prescription.work.repetitions}x${s.prescription.work.workMinutes})`:''}`)};
}
fs.writeFileSync(path.join(import.meta.dirname,'ssctr-probe-delta-policy2.out.json'),JSON.stringify(out,null,2)+'\n');
console.log(JSON.stringify(out,null,1));
