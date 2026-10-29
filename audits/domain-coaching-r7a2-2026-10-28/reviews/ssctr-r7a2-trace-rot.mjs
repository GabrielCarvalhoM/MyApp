// SSCTR R7A2-SSCTR-r1 trace (own instrument): the rotation case ro-EVERY_6_WEEKS-FAMILIAR-RUNNING_SUPPORT-14 of ssctr-r7a2-rotation.mjs, with
// db-step-up's rows and state by week, and whether any exercise in use was in the return steps that week. Read-only, synthetic, prints only.
import path from 'node:path';
import {pathToFileURL} from 'node:url';
const here=import.meta.dirname,CC=path.resolve(here,'../../../CoachingCore');
const load=rel=>import(pathToFileURL(path.join(CC,rel)).href);
const R=await load('src/r6-index.mjs'),{devAuthority}=await load('r6/fixtures/dev-authority.mjs'),opts={authority:devAuthority()};
const addDays=(d,n)=>new Date(Date.parse(d+'T00:00:00Z')+n*864e5).toISOString().slice(0,10);
const elig=d=>({status:'NONCLINICAL_CONFIRMED',assessedAt:d,pain:false,persistentPain:false,injury:false,illness:false,functionalLimitation:false,clinicalConcern:false});
const OK={performance:'COMPATIBLE',recovery:'COMPATIBLE',effort:'ON_TARGET',nextDayFunction:'NORMAL'};
let N=0;
const intake={version:'R6-INTAKE-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:'2026-11-01',startDate:'2026-11-02',weeks:16,learningConsent:true,
 athlete:{id:'ro-trace',ageEligible:true,eligibility:elig('2026-11-01'),goals:{run:'PERFORMANCE',strength:'RUNNING_SUPPORT'},runExperience:'INTERMEDIATE',strengthExperience:'INTERMEDIATE',recent:{runDaysPerWeek:3,runMinutesPerWeek:120,longestRunMinutes:50,strengthDaysPerWeek:2},equipment:['DUMBBELLS','BENCH','BARBELL','RACK'],knownExercises:[],exerciseRotationPreference:'EVERY_6_WEEKS'},
 schedule:{runDays:[1,4,6],strengthDays:[0,3],runTurn:'AM',strengthTurn:'PM',runMinutes:50,strengthMinutes:40,longRunDay:6,longRunMinutes:80}};
const at=(p,w,day,hour,x)=>{const d=addDays(p.weeks[w].startDate,day);return {version:'R6-REVIEW-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:`${d}T${hour}Z`,weekIndex:w,event:{id:`rt-${N++}`,kind:x.kind},eligibility:elig(d),observations:[],...x};};
function obs(p,s){const pr=s.prescription,actual={completed:true,minutes:pr.durationMinutes};if(pr.modality==='STRENGTH')actual.exercises=pr.exercises.map(e=>({id:e.id,sets:Array.from({length:e.sets},()=>({load:{value:e.load.mode==='KNOWN'?e.load.value:e.load.mode==='BODYWEIGHT'?0:20,unit:e.load.mode==='BODYWEIGHT'?'BODYWEIGHT':'KG',convention:e.load.convention},reps:e.reps,rir:e.rir}))}));return {eventId:`rt-o-${N++}`,athleteId:p.athleteId,sessionId:s.id,observedAt:s.date+(s.turn==='PM'?'T19:00:00Z':'T08:00:00Z'),actual,response:{...OK}};}
const ev=(t,x)=>{const r=R.evaluateProgram(t.p,{...x,actualLedger:t.ledger},opts);t.ledger=r.actualLedger??t.ledger;if(r.proposal)t.p=r.proposal;return r;};
const live=s=>s.prescription&&s.status!=='SKIPPED';
const weekly=(t,w,keep=()=>true)=>ev(t,at(t.p,w,6,'21:00:00',{kind:'WEEKLY_REVIEW',observations:t.p.weeks[w].sessions.filter(s=>live(s)&&keep(s)).map(s=>obs(t.p,s))}));
const t={p:R.generateProgram(intake,opts).program,ledger:[]},X='db-step-up',lines=[];
const show=w=>{const st=t.p.stateTrace[w]?.strength?.exercises??{},rows=t.p.weeks[w].sessions.filter(s=>s.sport==='STRENGTH'&&live(s)).flatMap(s=>s.prescription.exercises.map(e=>`d${s.day} ${e.id}:${e.sets}@${e.rir}/${e.exposure?.kind}`));lines.push(`w${w} ${X}=${JSON.stringify(st[X]?{rs:st[X].returnStep,lp:st[X].lastPerformed,ceil:st[X].setCeiling,rc:st[X].regainCap}:null)} inReturn=[${Object.entries(st).filter(([,e])=>Number.isInteger(e.returnStep)).map(([k,e])=>k+':'+e.returnStep).join(',')}] rows: ${rows.join(', ')}`);};
for(let w=0;w<6;w++){show(w);weekly(t,w);}
const W=6,bStart=addDays(t.p.weeks[W].startDate,4),bEnd=addDays(bStart,13),report=addDays(bEnd,1);show(W);weekly(t,W,s=>s.date<bStart);
weekly(t,7,()=>false);const rw=8;ev(t,at(t.p,rw,(Date.parse(report)-Date.parse(t.p.weeks[rw].startDate))/864e5,'06:00:00',{kind:'RETURN_AFTER_PAUSE',interruption:{days:14,startDate:bStart,endDate:bEnd,reasonCategory:'TRAVEL',reason:'Work travel'}}));
for(let w=rw;w<15;w++){show(w);weekly(t,w,s=>s.date>=report);}
console.log(lines.join('\n'));
