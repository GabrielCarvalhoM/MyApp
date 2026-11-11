// CoachingCore V1 Final Closure: representative journeys of the V1 scope (Founder request of 2026-11-11, step C). Synthetic athletes only; the scripted
// athlete does every session unless the journey says otherwise. Output: one compact record per journey (what was planned week by week, what was
// decided, the invariants), written as JSON and as a text table a reviewer can read. It shows what the software does; it approves nothing.
// Usage: node scripts/v1fc-journeys.mjs [outDir]   (default: ../audits/coachingcore-v1-final-closure-2026-11-11/evidence)
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {fileURLToPath} from 'node:url';
import {simulateProgram} from '../src/r6-simulator.mjs';
import {generateProgram} from '../src/v1-index.mjs';
import {intake,PROFILES,EDGE_PROFILES} from '../r6/fixtures/profiles.mjs';
import {eventExtensionAuthority,devEventExtension} from '../src/v1-events.mjs';
import {createCustody} from '../src/boundary/custody.mjs';
import {memoryStore,fileStore} from '../src/boundary/store.mjs';
import {createBoundary} from '../src/boundary/api.mjs';
import {signsFor,WARNING_SIGNS,READINESS_SIGNS} from '../src/v1-f08.mjs';

const here=path.dirname(fileURLToPath(import.meta.url));
// The default authority throughout (the reviewed R6 policy and catalog records). The 5K and the marathon need their own independent record; until it
// exists they run here under the development extension authority, and every such journey says so.
const ext=eventExtensionAuthority(),extOn=Object.keys(ext.approved).length===2,opts=extOn?{}:{eventExtension:devEventExtension()},EXT_NOTE=extOn?'INDEPENDENT_RECORD':'DEV_EXTENSION_AUTHORITY_PENDING_RECORD';
const five=(over={},sched={})=>intake('j-5k',{weeks:12,athlete:{goals:{run:{kind:'RACE',event:{kind:'5K',date:'2027-01-17'}},strength:'MAINTAIN'},runExperience:'INTERMEDIATE',strengthExperience:'INTERMEDIATE',recent:{runDaysPerWeek:3,runMinutesPerWeek:110,longestRunMinutes:45},...over},schedule:{runDays:[0,2,5],strengthDays:[1,3],runMinutes:50,strengthMinutes:40,longRunDay:5,longRunMinutes:70,...sched}});
const mar=(over={},sched={},date='2027-01-31')=>intake('j-mar',{weeks:16,athlete:{goals:{run:{kind:'RACE',event:{kind:'MARATHON',date}},strength:'MAINTAIN'},runExperience:'EXPERIENCED',strengthExperience:'INTERMEDIATE',recent:{runDaysPerWeek:5,runMinutesPerWeek:360,longestRunMinutes:150},...over},schedule:{runDays:[0,1,3,4,6],strengthDays:[2],runMinutes:90,strengthMinutes:35,longRunDay:6,longRunMinutes:210,...sched}});
const BEGINNER=intake('j-beginner',{weeks:8,athlete:{goals:{run:'REGULAR',strength:'GENERAL'},runExperience:'NONE',strengthExperience:'NONE',recent:{runDaysPerWeek:0,runMinutesPerWeek:0,strengthDaysPerWeek:0},equipment:['DUMBBELLS','BENCH']},schedule:{runDays:[1,3,5],strengthDays:[0,4],runMinutes:35,strengthMinutes:35,longRunDay:5}});
const JOURNEYS=[
 ['01 beginner in both sports (start running: walk/jog; strength from zero)',BEGINNER,{}],
 ['02 uneven: novice runner, experienced lifter',PROFILES.D_NOVICE_RUNNER_EXPERIENCED_STRENGTH,{}],
 ['03 uneven: experienced runner (10K), new to strength',PROFILES.E_EXPERIENCED_RUNNER_NOVICE_STRENGTH,{}],
 ['04 balanced hybrid: performance running and strength',PROFILES.C_BALANCED_HYBRID,{}],
 ['05 running first: half marathon',PROFILES.A_RUN_FIRST_HALF_MARATHON,{}],
 ['06 strength first: hypertrophy, running kept regular',PROFILES.B_STRENGTH_FIRST,{}],
 ['07 10K in eight weeks',EDGE_PROFILES.TEN_K_EIGHT_WEEKS,{}],
 ['08 5K, intermediate runner (specific preparation) ['+EXT_NOTE+']',five(),{}],
 ['09 5K, beginner on walk/jog (completion) ['+EXT_NOTE+']',five({runExperience:'NONE',strengthExperience:'NONE',recent:{runDaysPerWeek:0,runMinutesPerWeek:0}},{runDays:[1,3,5],runMinutes:35,longRunMinutes:undefined}),{}],
 ['10 marathon, eligible athlete (block) ['+EXT_NOTE+']',mar(),{}],
 ['11 marathon goal, runner whose projection stays below 150 (preparatory plan) ['+EXT_NOTE+']',mar({runExperience:'INTERMEDIATE',recent:{runDaysPerWeek:4,runMinutesPerWeek:240,longestRunMinutes:110}},{runDays:[0,2,4,6],strengthDays:[1,3],runMinutes:75,longRunMinutes:200},'2027-02-14'),{}],
 ['12 marathon goal, absolute beginner (ordinary beginner plan) ['+EXT_NOTE+']',intake('j-mar-beg',{weeks:12,athlete:{goals:{run:{kind:'RACE',event:{kind:'MARATHON',date:'2027-10-10'}},strength:'GENERAL'},runExperience:'NONE',strengthExperience:'NONE',recent:{runDaysPerWeek:0,runMinutesPerWeek:0}},schedule:{runDays:[1,3,5],strengthDays:[2,4],runMinutes:40,strengthMinutes:30,longRunDay:5}}),{}],
 ['13 balanced hybrid, one long run missed in week 3 (no debt)',PROFILES.C_BALANCED_HYBRID,{weeks:{3:{missed:[{sport:'RUN',role:'LONG'}]}}}],
 ['14 balanced hybrid, one strength session done in part in week 2',PROFILES.C_BALANCED_HYBRID,{weeks:{2:{partial:[{sport:'STRENGTH',day:undefined}]}}}],
 ['15 half marathon, a hard week (adverse responses to the quality run in weeks 5 and 6)',PROFILES.A_RUN_FIRST_HALF_MARATHON,{weeks:{5:{responses:[{sport:'RUN',role:'QUALITY',response:'HARDER'}]},6:{responses:[{sport:'RUN',role:'QUALITY',response:'HARDER'}]}}}],
 ['16 low data, no watch (nothing invented)',PROFILES.G_LOW_DATA_NO_WEARABLE,{}],
];
const week=w=>{const R=w.sessions.filter(s=>s.sport==='RUN'&&s.prescription),S=w.sessions.filter(s=>s.sport==='STRENGTH'&&s.prescription),q=R.find(s=>s.prescription.work&&s.prescription.family!=='WALK_JOG');
 return {index:w.index,phase:w.phase,runs:R.length,runMinutes:R.filter(s=>s.role!=='RACE').reduce((n,s)=>n+s.prescription.durationMinutes,0),long:w.sessions.find(s=>s.role==='LONG')?.prescription?.durationMinutes??null,
  runFamilies:[...new Set(R.map(s=>s.prescription.family))],quality:q?`${q.prescription.family} ${q.prescription.work.repetitions}x${q.prescription.work.workMinutes}'/${q.prescription.work.recoveryMinutes}'`:null,
  race:R.find(s=>s.role==='RACE')?{window:R.find(s=>s.role==='RACE').prescription.durationMinutes,completion:R.find(s=>s.role==='RACE').prescription.completion===true}:null,
  strengthSessions:S.length,strengthSets:S.reduce((n,s)=>n+s.prescription.exercises.reduce((m,e)=>m+e.sets,0),0),
  topLoads:S.flatMap(s=>s.prescription.exercises).filter(e=>Number.isFinite(e.load?.value)&&e.load.value>0).slice(0,2).map(e=>`${e.id} ${e.sets}x${e.reps}@${e.load.value}`),sameDay:w.sessions.filter(s=>s.prescription).reduce((m,s)=>m.set(s.day,(m.get(s.day)??0)+1),new Map())};};
function simulated(name,input,script){
 const g=generateProgram(input,opts);
 if(g.status!=='PROPOSED')return {name,status:g.status,reason:g.reason,missingInputs:g.missingInputs??[],scope:g.scope??null};
 const r=simulateProgram(input,script,opts),f=r.finalProgram,p0=r.initial.program;
 return {name,status:'PROPOSED',runClass:p0.capability.run.class,strengthClass:p0.capability.strength.class,goal:{run:p0.goal.run.kind,event:p0.goal.run.event?.kind??null,context:p0.canonical.goals.contextEvent?{kind:p0.canonical.goals.contextEvent.kind,unmet:(p0.canonical.goals.contextEvent.unmet??[]).map(u=>u.id)}:null,strength:p0.goal.strength.kind,lead:p0.goal.baseLead},
  notes:(r.initial.negotiation??[]).map(n=>n.id),weeks:f.weeks.map(week).map(w=>({...w,doubleDays:[...w.sameDay.values()].filter(n=>n>1).length,sameDay:undefined})),
  decisions:r.summary.decisions,actions:r.summary.actions,invariants:r.invariants,invariantsHold:Object.values(r.invariants).every(Boolean),unexplained:r.decisions.filter(d=>d.status==='MODIFY'&&!d.reason).length};
}
/** Custody journeys (the V1 engine behind the app boundary): availability change, a missing answer, a hold, persistence across a server restart. */
function custodyJourneys(){
 const START='2026-11-09',addDays=(d,n)=>new Date(Date.parse(d+'T00:00:00Z')+n*864e5).toISOString().slice(0,10),at=(w,d,hm)=>Date.parse(`${addDays(START,w*7+d)}T${hm}:00-03:00`),out=[];
 const HYBRID=()=>({version:'R6-INTAKE-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:'2026-11-07',startDate:START,weeks:8,timezoneOffsetMinutes:-180,athlete:{id:'j',ageEligible:true,eligibility:{status:'NONCLINICAL_CONFIRMED',assessedAt:'2026-11-07',pain:false,persistentPain:false,injury:false,illness:false,functionalLimitation:false,clinicalConcern:false},goals:{run:'PERFORMANCE',strength:'GENERAL'},runExperience:'INTERMEDIATE',strengthExperience:'INTERMEDIATE',recent:{runDaysPerWeek:3,runMinutesPerWeek:120,longestRunMinutes:45,strengthDaysPerWeek:2},equipment:['DUMBBELLS','BENCH']},schedule:{runDays:[1,3,5],strengthDays:[0,4],runTurn:'AM',strengthTurn:'PM',runMinutes:50,strengthMinutes:45,longRunDay:5}});
 const mk=(store)=>{const clock={t:at(-1,5,'12:00')},custody=createCustody({store,key:'v1fc-journeys-key-not-a-secret',now:()=>clock.t}),api=createBoundary({custody,now:()=>clock.t});return {clock,custody,api};};
 const actor={athleteId:'ath-journey'},elig=c=>({status:'NONCLINICAL_CONFIRMED',assessedAt:new Date(c.t).toISOString(),pain:false,persistentPain:false,injury:false,illness:false,functionalLimitation:false,clinicalConcern:false});
 let n=0;const rid=()=>`j-${++n}`,live=s=>!!s.prescription&&s.status!=='SKIPPED';
 const ver=s=>s.custody.read({actor}).doc.version,reports=(s,w)=>s.custody.read({actor}).doc.program.weeks[w].sessions.filter(x=>live(x)&&!x.optional).map(x=>({sessionId:x.id,occurredOn:x.date,completed:true,minutes:x.prescription.durationMinutes,...(x.sport==='STRENGTH'?{exercises:x.prescription.exercises.map(e=>({id:e.id,sets:Array.from({length:e.sets},()=>({reps:e.reps,...(Number.isFinite(e.rir)?{rir:e.rir}:{})}))}))}:{}),response:{performance:'COMPATIBLE',recovery:'COMPATIBLE',effort:'ON_TARGET',nextDayFunction:'NORMAL'}}));
 const row=(step,r)=>({step,status:r.status??(r.ok?'OK':r.error?.code),action:r.action??null,adoption:r.adoption??null,offer:r.offer?.kind??null,unavailable:r.unavailable?.capability??null,state:r.view?.state??r.state??null,executable:r.view?.week?.sessions.filter(x=>x.executable).length??null});
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'v1fc-journeys-')),s=mk(fileStore(dir)),steps=[];
 steps.push(row('onboard',s.api.onboard({actor,intake:HYBRID(),consents:{COACHING:true,HEALTH_SIGNALS:true,LEARNING:false},clientRequestId:rid()})));
 s.clock.t=at(0,6,'20:00');steps.push(row('week 0 done: weekly check-in',s.api.weeklyCheckIn({actor,clientRequestId:rid(),expectedVersion:ver(s),eligibility:elig(s.clock),reports:reports(s,0)})));
 s.clock.t=at(1,0,'08:00');const ch=s.api.updateAvailability({actor,clientRequestId:rid(),expectedVersion:ver(s),eligibility:elig(s.clock),changes:{runDays:[0,2,4]}});steps.push(row('availability: run days moved (waits for the athlete)',ch));
 steps.push(row('athlete accepts the change',s.api.accept({actor,decisionId:ch.decisionId,expectedVersion:ver(s)})));
 s.clock.t=at(1,2,'08:00');steps.push(row('a report with a screen that is too old (a question, nothing executable)',s.api.logRun({actor,clientRequestId:rid(),expectedVersion:ver(s),eligibility:{...elig(s.clock),assessedAt:'2026-10-01'},sessionId:'x',occurredOn:addDays(START,9),completed:true,minutes:30})));
 // Persistence: a new server process over the same files continues the same record.
 const s2=mk(fileStore(dir));s2.clock.t=at(1,6,'20:00');steps.push(row('server restarted; week 1 check-in continues on the stored record',s2.api.weeklyCheckIn({actor,clientRequestId:rid(),expectedVersion:ver(s2),eligibility:elig(s2.clock),reports:reports(s2,1)})));
 s2.clock.t=at(2,1,'08:00');const NO=c=>Object.fromEntries(signsFor(c).map(x=>[x,false]));
 steps.push(row('"not 100%", every sign no (V1: plan kept, typed unavailability)',s2.api.notFeeling100({actor,clientRequestId:rid(),expectedVersion:ver(s2),eligibility:elig(s2.clock),wellbeing:{condition:'NEED_REST',warningSigns:NO('NEED_REST'),intent:'REST',days:3}})));
 steps.push(row('"not 100%" with a warning sign (hold; no prescription)',s2.api.notFeeling100({actor,clientRequestId:rid(),expectedVersion:ver(s2),eligibility:elig(s2.clock),wellbeing:{condition:'MILD_ILLNESS',warningSigns:{...NO('MILD_ILLNESS'),[WARNING_SIGNS.W7]:true},intent:'REST',days:4}})));
 s2.clock.t=at(2,3,'08:00');steps.push(row('a session report during the hold (recorded; still held)',s2.api.logRun({actor,clientRequestId:rid(),expectedVersion:ver(s2),eligibility:elig(s2.clock),...reports(s2,2)[0]})));
 const today=addDays(START,17),again={...HYBRID(),asOf:today,startDate:addDays(START,21),athlete:{...HYBRID().athlete,eligibility:{...HYBRID().athlete.eligibility,assessedAt:today},pause:{nonclinical:true,reasonCategory:'SCHEDULE'}}};
 steps.push(row('a new plan asked during the hold (never a release)',s2.api.restart({actor,intake:again,expectedVersion:ver(s2)})));steps.at(-1).state=s2.api.plan({actor}).view.state;
 s2.clock.t=at(2,5,'09:00');steps.push(row('readiness declaration, both sports (conservative restart)',s2.api.declareReadiness({actor,clientRequestId:rid(),expectedVersion:ver(s2),eligibility:elig(s2.clock),readiness:{declaredRecovered:true,warningSigns:Object.fromEntries(READINESS_SIGNS.map(x=>[x,false])),sports:{RUN:{ready:true},STRENGTH:{ready:true,restrictions:[]}}}})));
 out.push({name:'17 through the app boundary: availability change, missing answer, restart of the server, "not 100%", hold, new plan under hold, readiness',steps,recordVerifies:s2.custody.verify(s2.custody.read({actor}).doc)===null,rows:s2.custody.read({actor}).doc.rows.length});
 // Missing data at onboarding.
 const t=mk(memoryStore()),u=EDGE_PROFILES.ELIGIBILITY_UNKNOWN;
 out.push({name:'18 missing data at onboarding (eligibility not answered) and a current clinical flag',steps:[row('onboard, eligibility unknown',t.api.onboard({actor:{athleteId:'ath-unknown'},intake:{...u,startDate:START,athlete:{...u.athlete}},consents:{COACHING:true},clientRequestId:rid()})),row('onboard, pain reported',t.api.onboard({actor:{athleteId:'ath-pain'},intake:{...EDGE_PROFILES.CLINICAL_PAIN,startDate:START},consents:{COACHING:true},clientRequestId:rid()}))]});
 return out;
}
const text=j=>{if(j.steps)return `## ${j.name}\n`+j.steps.map(s=>`  - ${s.step}: ${s.status}${s.action?' / '+s.action:''}${s.adoption?' ['+s.adoption+']':''}${s.unavailable?' [unavailable: '+s.unavailable+']':''} → ${s.state??'-'}${s.executable!==null?' ('+s.executable+' executable this week)':''}`).join('\n')+(j.recordVerifies!==undefined?`\n  record verifies: ${j.recordVerifies}, rows: ${j.rows}`:'')+'\n';
 if(j.status!=='PROPOSED')return `## ${j.name}\n  ${j.status}: ${j.reason}\n`;
 return `## ${j.name}\n  run ${j.runClass}, strength ${j.strengthClass}; goal run ${j.goal.run}${j.goal.event?' '+j.goal.event:''}${j.goal.context?' (context '+j.goal.context.kind+(j.goal.context.unmet.length?': '+j.goal.context.unmet.join(', '):'')+')':''}, strength ${j.goal.strength}, lead ${j.goal.lead}\n  notes: ${j.notes.join(', ')||'-'}\n`+
  j.weeks.map(w=>`  w${String(w.index).padStart(2)} ${w.phase.padEnd(13)} run ${String(w.runs)}x ${String(w.runMinutes).padStart(3)}' long ${String(w.long??'-').padStart(3)} ${(w.quality??w.runFamilies.join('+')).padEnd(34)}${w.race?(w.race.completion?'RACE completion ':'RACE effort '):''}| strength ${w.strengthSessions}x ${String(w.strengthSets).padStart(2)} sets ${w.topLoads.join(', ')}${w.doubleDays?' | double days '+w.doubleDays:''}`).join('\n')+
  `\n  decisions ${JSON.stringify(j.decisions)} actions ${JSON.stringify(j.actions)}\n  invariants hold: ${j.invariantsHold}${j.invariantsHold?'':' '+JSON.stringify(j.invariants)}\n`;};
export function buildJourneys(){return [...JOURNEYS.map(([name,input,script])=>simulated(name,input,script)),...custodyJourneys()];}
if(process.argv[1]&&fileURLToPath(import.meta.url)===path.resolve(process.argv[1])){
 const out=path.resolve(process.argv[2]??path.join(here,'..','..','audits','coachingcore-v1-final-closure-2026-11-11','evidence'));fs.mkdirSync(out,{recursive:true});
 const all=buildJourneys();
 fs.writeFileSync(path.join(out,'JOURNEYS_V1FC.json'),JSON.stringify({generatedBy:'CoachingCore/scripts/v1fc-journeys.mjs',eventExtension:EXT_NOTE,journeys:all},null,1)+'\n');
 fs.writeFileSync(path.join(out,'JOURNEYS_V1FC.txt'),`CoachingCore V1 Final Closure: representative journeys (synthetic; event extension: ${EXT_NOTE})\n\n`+all.map(text).join('\n'));
 console.log(all.length+' journeys → '+out);
}
