// T1 and T2 (Founder §18) expressed through the public evaluation surface only (`generateProgram`/`evaluateProgram`), so the same file runs on
// STATE-EVIDENCE-FREEZE-1 and on this mission's candidate: the baseline must fail and the candidate must pass. Read-only; synthetic data;
// DEV_TEST_ONLY authority; prints a JSON verdict. SM_ROOT points at a CoachingCore copy (default: the live one).
import path from 'node:path';
import {pathToFileURL,fileURLToPath} from 'node:url';
const here=path.dirname(fileURLToPath(import.meta.url)),repo=path.resolve(here,'../../..');
const root=process.env.SM_ROOT?path.resolve(repo,process.env.SM_ROOT):path.join(repo,'CoachingCore');
const L=rel=>import(pathToFileURL(path.join(root,rel)).href);
const {generateProgram,evaluateProgram}=await L('src/r6-index.mjs'),{devAuthority}=await L('r6/fixtures/dev-authority.mjs');
const opts={authority:devAuthority()};
const addDays=(d,n)=>new Date(Date.parse(d+'T00:00:00Z')+n*864e5).toISOString().slice(0,10);
const elig=d=>({status:'NONCLINICAL_CONFIRMED',assessedAt:d,pain:false,persistentPain:false,injury:false,illness:false,functionalLimitation:false,clinicalConcern:false});
const OK={performance:'COMPATIBLE',recovery:'COMPATIBLE',effort:'ON_TARGET',nextDayFunction:'NORMAL'};
const K=(id,sets,reps,kg,convention='TOTAL')=>({id,sets,reps,load:{value:kg,unit:'KG',convention},rir:2,current:true,familiar:true,tolerated:true,observedAt:'2026-10-29'});
const intake=id=>({version:'R6-INTAKE-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:'2026-11-01',startDate:'2026-11-02',weeks:16,learningConsent:true,
 athlete:{id,ageEligible:true,eligibility:elig('2026-11-01'),goals:{run:'PERFORMANCE',strength:'STRENGTH'},runExperience:'INTERMEDIATE',strengthExperience:'INTERMEDIATE',recent:{runDaysPerWeek:3,runMinutesPerWeek:150,longestRunMinutes:70,strengthDaysPerWeek:2},equipment:['DUMBBELLS','BENCH','BARBELL','RACK'],knownExercises:[K('back-squat',3,5,80),K('db-bench-press',3,8,18,'PER_HAND')],exerciseRotationPreference:'FIXED'},
 schedule:{runDays:[1,3,6],strengthDays:[2,5],runTurn:'AM',strengthTurn:'PM',runMinutes:60,strengthMinutes:60,longRunDay:6,longRunMinutes:100}});
let N=0;
const at=(p,w,day,hour,x={})=>{const d=addDays(p.weeks[w].startDate,day);return {version:'R6-REVIEW-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:`${d}T${hour}Z`,weekIndex:w,event:{id:`sm-${w}-${N++}`,kind:x.kind??'WEEKLY_REVIEW'},eligibility:elig(d),observations:[],...x};};
function obs(p,s,{set=null}={}){const pr=s.prescription,a={completed:true,minutes:pr.durationMinutes};
 if(pr.modality==='STRENGTH')a.exercises=pr.exercises.map(e=>({id:e.id,sets:Array.from({length:e.sets},()=>{const x={load:e.load.mode==='BODYWEIGHT'?{value:0,unit:'BODYWEIGHT',convention:'BODYWEIGHT'}:{value:e.load.mode==='KNOWN'?e.load.value:20,unit:'KG',convention:e.load.convention},reps:e.reps,rir:e.rir};return set?set(e.id,x):x;})}));
 return {eventId:`sm-o-${N++}`,athleteId:p.athleteId,sessionId:s.id,observedAt:`${s.date}T${s.turn==='PM'?'19:00:00':'08:00:00'}Z`,actual:a,response:{...OK}};}
const live=s=>s.prescription&&s.status!=='SKIPPED',SAT=s=>s.sport==='STRENGTH'&&s.day===5;
const ev=(t,review)=>{const r=evaluateProgram(t.p,{...review,actualLedger:t.ledger},opts);t.ledger=r.actualLedger??t.ledger;if(r.proposal)t.p=r.proposal;t.last=r;return r;};
const weekly=(t,w,keep=()=>true,o={})=>ev(t,at(t.p,w,6,'21:00:00',{observations:t.p.weeks[w].sessions.filter(s=>live(s)&&keep(s)).map(s=>obs(t.p,s,typeof o==='function'?o(s):o))}));
const perDay=(t,w,keep)=>{for(const s of t.p.weeks[w].sessions.filter(s=>live(s)&&keep(s)&&s.day<6))ev(t,at(t.p,w,s.day,'21:00:00',{observations:[obs(t.p,s)]}));
 ev(t,at(t.p,w+1,0,'06:00:00',{observations:t.p.weeks[w].sessions.filter(s=>live(s)&&keep(s)&&s.day===6).map(s=>obs(t.p,s))}));};
const start=(id,weeks)=>{const g=generateProgram(intake(id),opts);if(!g.program)throw Error(g.status+' '+g.reason);const t={p:g.program,ledger:[]};for(let w=0;w<weeks;w++)weekly(t,w);return t;};
const brk=(s,e)=>({kind:'RETURN_AFTER_PAUSE',interruption:{days:Math.round((Date.parse(e)-Date.parse(s))/864e5)+1,startDate:s,endDate:e,reasonCategory:'TRAVEL',reason:'Work travel'}});
const IDS=['db-rdl','db-split-squat'];
const out={probe:'R7ASM-T1T2',root:process.env.SM_ROOT??'LIVE',t1:{},t2:{}};

// T1 (QE-R7ASE-01): weeks 0-4 reviewed, then two development weeks executed but for Saturday's lift and never reviewed, so the plan runs two
// steps ahead for the Saturday-only exercises and stores a tick at the new load. Week 7's Saturday lift is then done at that projected load but
// falls short (3 of 5 reps) and the week is reviewed. A short break in week 8 shows the dose the return resumes.
{
 const t=start('sm-t1',5);perDay(t,5,s=>!SAT(s));perDay(t,6,s=>!SAT(s));
 out.t1.storedTick=Object.fromEntries(IDS.map(id=>[id,t.p.stateTrace[7].strength.exercises[id].loadTick]));
 out.t1.storedLoad=Object.fromEntries(IDS.map(id=>[id,t.p.stateTrace[7].strength.exercises[id].load]));
 weekly(t,7,()=>true,s=>SAT(s)?{set:(id,x)=>IDS.includes(id)?{...x,reps:3}:x}:{});
 const d0=t.p.weeks[8].startDate,r=ev(t,at(t.p,8,3,'06:00:00',brk(addDays(d0,1),addDays(d0,2))));
 out.t1.returnStatus=r.status+'/'+r.action;
 const B=t.p.decisions.filter(x=>x.action==='REESTABLISH').at(-1);
 out.t1.entry=Object.fromEntries(IDS.map(id=>[id,{load:B?.interruption?.entry?.strength?.exercises?.[id]?.load??null,loadTick:B?.interruption?.entry?.strength?.exercises?.[id]?.loadTick??null}]));
 // The Saturday rows after the break: the next load step must wait for a successful exposure at the lifted load.
 out.t1.rowsAfter=[8,9,10].flatMap(w=>(t.p.weeks[w]?.sessions??[]).filter(s=>live(s)&&SAT(s)).flatMap(s=>s.prescription.exercises.filter(e=>e.id==='db-rdl').map(e=>`${s.date} ${e.sets}x${e.reps} ${e.load.mode}${e.load.value??''}`)));
 out.t1.pass=IDS.every(id=>out.t1.entry[id].loadTick===0&&out.t1.entry[id].load===out.t1.storedLoad[id]);
}
// T2 (QE-R7ASE-02): weeks 0-1 reviewed; week 2 executed but for Saturday's lift and never reviewed (so week 3 projects a later last-performed
// date); weeks 3-6 reviewed with that Saturday missed every time. On 2026-12-19, 35 days after the last real exposure, D52 must re-establish.
{
 const t=start('sm-t2',2);perDay(t,2,s=>!SAT(s));
 for(let w=3;w<=6;w++)weekly(t,w,s=>!SAT(s));
 out.t2.lifted=Object.fromEntries(IDS.map(id=>[id,t.ledger.filter(o=>o.logs?.[id]&&Number.isFinite(o.logs[id].load)).map(o=>`${o.localDate}:${o.logs[id].load}`)]));
 out.t2.planningLastPerformed=Object.fromEntries(IDS.map(id=>[id,t.p.stateTrace[6].strength.exercises[id].lastPerformed]));
 out.t2.saturdayRows=(t.p.weeks[6]?.sessions??[]).filter(s=>live(s)&&SAT(s)).flatMap(s=>s.prescription.exercises.filter(e=>IDS.includes(e.id)).map(e=>({id:e.id,date:s.date,mode:e.load.mode,value:e.load.value??null,kind:e.exposure?.kind??null})));
 out.t2.pass=out.t2.saturdayRows.length>0&&out.t2.saturdayRows.every(r=>r.kind==='REESTABLISH'&&r.mode==='ESTABLISH');
}
out.pass=out.t1.pass&&out.t2.pass;
console.log(JSON.stringify(out,null,1));
