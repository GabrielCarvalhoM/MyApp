import test from 'node:test';
import assert from 'node:assert/strict';
import {generateProgram,evaluateProgram} from '../src/r6-index.mjs';
import {devAuthority} from '../r6/fixtures/dev-authority.mjs';

/** Regression tests for the SSCTR round-10 binding defect D52 (reviews/ssctr-policy-review.json, R6-SSCTR-POLICY-r10, probe section Z). */
const opts={authority:devAuthority()},OP=opts.authority.policy.operational,RET=OP.return,EST=OP.establishment.effortGuidedLoad;
const elig=d=>({status:'NONCLINICAL_CONFIRMED',assessedAt:d,pain:false,persistentPain:false,injury:false,illness:false,functionalLimitation:false,clinicalConcern:false});
const addDays=(d,n)=>new Date(Date.parse(d+'T00:00:00Z')+n*864e5).toISOString().slice(0,10);
const gap=(a,b)=>(Date.parse(b)-Date.parse(a))/864e5;
const SQUAT={id:'back-squat',sets:3,reps:5,load:{value:80,unit:'KG',convention:'TOTAL'},rir:2,current:true,familiar:true,tolerated:true,observedAt:'2026-10-29'};
const BENCH={id:'db-bench-press',sets:3,reps:8,load:{value:18,unit:'KG',convention:'PER_HAND'},rir:2,current:true,familiar:true,tolerated:true,observedAt:'2026-10-29'};
const FULL=['DUMBBELLS','BENCH','BARBELL','RACK'];
/** The probe-Z intake: three run days, strength on Monday and Thursday. */
function intake({id,weeks=16,athlete={},schedule={}}){
 return {version:'R6-INTAKE-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:'2026-11-01',startDate:'2026-11-02',weeks,learningConsent:true,
  athlete:{id,ageEligible:true,eligibility:elig('2026-11-01'),goals:{run:'PERFORMANCE',strength:'STRENGTH'},runExperience:'INTERMEDIATE',strengthExperience:'INTERMEDIATE',recent:{runDaysPerWeek:3,runMinutesPerWeek:120,longestRunMinutes:50,strengthDaysPerWeek:2},equipment:FULL,knownExercises:[SQUAT,BENCH],...athlete},
  schedule:{runDays:[1,3,6],strengthDays:[0,4],runTurn:'AM',strengthTurn:'PM',runMinutes:50,strengthMinutes:50,longRunDay:6,longRunMinutes:80,...schedule}};
}
let N=0;
const review=(p,w,{day=6,kind='WEEKLY_REVIEW',...x}={})=>{const d=addDays(p.weeks[w].startDate,day);return {version:'R6-REVIEW-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:d+'T21:00:00Z',weekIndex:w,event:{id:`t10-${kind}-${w}-${N++}`,kind},eligibility:elig(d),...x};};
/** An execution report that logs every planned set (20 kg for a row with no stated load); `details:false` reports completion only. */
function obs(p,s,{details=true,load=null}={}){
 const pr=s.prescription,actual={completed:true,minutes:pr.durationMinutes};
 if(pr.modality==='STRENGTH'&&details)actual.exercises=pr.exercises.map(e=>({id:e.id,sets:Array.from({length:e.sets},()=>({reps:e.reps,rir:e.rir,load:e.load.mode==='BODYWEIGHT'?{value:0,unit:'BODYWEIGHT',convention:'BODYWEIGHT'}:{value:e.load.mode==='KNOWN'?e.load.value:load??20,unit:'KG',convention:e.load.convention}}))}));
 return {eventId:`t10-${p.athleteId}-${s.id}-${N++}`,athleteId:p.athleteId,sessionId:s.id,observedAt:s.date+(s.turn==='PM'?'T19:00:00Z':'T08:00:00Z'),actual,response:{performance:'COMPATIBLE',recovery:'COMPATIBLE',effort:'ON_TARGET',nextDayFunction:'NORMAL'}};
}
/** Weekly reviews of weeks [from, to) with the sessions `keep` selects executed (`details(s)` false reports completion only). */
function run(p,ledger,from,to,keep=()=>true,{details=()=>true}={}){
 for(let w=from;w<to;w++){const o=p.weeks[w].sessions.filter(s=>s.prescription&&keep(s,w)).map(s=>obs(p,s,{details:details(s,w)}));const r=evaluateProgram(p,review(p,w,{observations:o,actualLedger:ledger}),opts);assert.ok(['KEEP','MODIFY'].includes(r.status),`week ${w}: ${r.status} ${r.reason}`);ledger=r.actualLedger;if(r.proposal)p=r.proposal;}
 return {p,ledger};
}
const rowsOf=(p,w,id)=>p.weeks[w].sessions.filter(s=>s.sport==='STRENGTH'&&s.prescription).flatMap(s=>s.prescription.exercises.filter(e=>e.id===id).map(e=>({...e,date:s.date})));
const PROGRESSION=/Use the load you logged last time|add the smallest available increment|Add \d+ reps per set|Use the load you established last time/;
/** The effort-guided establishment row: at most the establishment set count at RIR >= 3, the ramp-up, no load, no progression rule. */
function assertEstablishment(row,label){
 assert.ok(row,`${label}: no exposure`);
 assert.equal(row.load.mode,'ESTABLISH',`${label}: ${row.sets}x${row.reps} ${row.load.mode} | ${row.instructions.join(' | ')}`);
 assert.ok(row.sets<=EST.sets&&row.rir>=EST.minimumRir,`${label}: ${row.sets} sets at RIR ${row.rir}`);
 assert.equal(row.load.value,undefined,`${label}: a load is stated`);
 assert.ok(row.instructions.some(t=>/^Ramp up/.test(t)),`${label}: no ramp-up`);
 assert.ok(!row.instructions.some(t=>PROGRESSION.test(t)),`${label}: progression or log rule ${row.instructions.join(' | ')}`);
}

// ---------- (A) a prescription that was not executed establishes nothing ----------
/** Probe Z1: the first (establishment) exposure of a loaded exercise is missed; every other session of the weeks is executed. */
function missedFirstExposure(pref,known,runGoal){
 let p=generateProgram(intake({id:`t10-z1-${pref}`,athlete:{goals:{run:runGoal,strength:'HYPERTROPHY'},knownExercises:known,exerciseRotationPreference:pref}}),opts).program;
 const first={};for(const wk of p.weeks)for(const s of wk.sessions)for(const e of s.prescription?.exercises??[])if(!(e.id in first))first[e.id]={w:wk.index,mode:e.load.mode,date:s.date};
 const cand=Object.entries(first).filter(([,f])=>f.mode==='ESTABLISH'),[id,f]=cand.find(([,x])=>x.w>=1)??cand[0];
 assert.equal(rowsOf(p,f.w,id).length,1,`${pref}: ${id} has one exposure in week ${f.w}`);
 ({p}=run(p,[],0,f.w+4,s=>!(s.date===f.date&&s.sport==='STRENGTH')));
 const w=[f.w+1,f.w+2,f.w+3,f.w+4].find(x=>rowsOf(p,x,id).length);
 return {p,id,f,w,row:w===undefined?null:rowsOf(p,w,id)[0]};
}
test('SSCTR D52: strength — a missed first establishment exposure establishes nothing; the next exposure is the establishment row again (every 2 weeks, coach decides, fixed)',()=>{
 for(const [pref,known,runGoal] of [['EVERY_2_WEEKS',[SQUAT,BENCH],'PERFORMANCE'],['COACH_DECIDES',[SQUAT,BENCH],'PERFORMANCE'],['FIXED',[],'REGULAR']]){
  const {p,id,f,w,row}=missedFirstExposure(pref,known,runGoal);
  assertEstablishment(row,`${pref} ${id} after the missed ${f.date}`);
  assert.equal(p.stateTrace[w].strength.exercises[id],undefined,`${pref}: ${id} has a state although it was never performed`);
 }
});
test('SSCTR D52: strength — later sessions of the week repeat the establishment of an exercise first set up that week',()=>{
 const input=intake({id:'t10-same-week',weeks:8,athlete:{goals:{run:'REGULAR',strength:'STRENGTH'},strengthExperience:'NONE',knownExercises:[SQUAT],exerciseRotationPreference:'FIXED'},schedule:{strengthMinutes:45}});
 const p0=generateProgram(input,opts).program,twice=[...new Set(p0.weeks[0].sessions.flatMap(s=>s.prescription?.exercises??[]).map(e=>e.id))].filter(id=>rowsOf(p0,0,id).length>1&&rowsOf(p0,0,id)[0].load.mode==='ESTABLISH');
 assert.ok(twice.length>0,'some exercise is established twice in week 0');
 for(const id of twice)for(const row of rowsOf(p0,0,id))assertEstablishment(row,`week 0 ${row.date} ${id}`);
 const id=twice[0],[mon,thu]=rowsOf(p0,0,id).map(r=>r.date);
 // Monday missed, Thursday logged: the first log waits for confirmation (SSCTR D45) and the next row never points to a log.
 const a=run(p0,[],0,1,s=>!(s.sport==='STRENGTH'&&s.date===mon)).p,next=rowsOf(a,1,id)[0];
 assert.equal(next.load.mode,'FROM_LOG');assert.ok(next.instructions[0].startsWith('Ramp up'),next.instructions.join(' | '));assert.ok(!next.instructions.some(t=>/Use the load you logged last time/.test(t)));
 assert.equal(a.stateTrace[1].strength.exercises[id].lastPerformed,thu);
 // Both missed: nothing is established.
 const b=run(p0,[],0,1,s=>s.sport!=='STRENGTH').p;
 assertEstablishment(rowsOf(b,1,id)[0],`${id} after a week without strength`);assert.equal(b.stateTrace[1].strength.exercises[id],undefined);
 // Both logged at the same load: the second log confirms the first (SSCTR D45) and the next row states it.
 const c=run(p0,[],0,1).p,known=rowsOf(c,1,id)[0];
 assert.equal(known.load.mode,'KNOWN');assert.equal(known.load.value,20);
});
test('SSCTR D52: strength — a bodyweight exercise whose first exposures were missed starts again at its first-exposure dose',()=>{
 const p0=generateProgram(intake({id:'t10-bodyweight',weeks:8,athlete:{goals:{run:'REGULAR',strength:'HYPERTROPHY'},knownExercises:[],exerciseRotationPreference:'FIXED'}}),opts).program;
 const ids=[...new Set(p0.weeks[0].sessions.flatMap(s=>s.prescription?.exercises??[]).filter(e=>e.load.mode==='BODYWEIGHT').map(e=>e.id))];assert.ok(ids.length,'a bodyweight exercise in week 0');
 const {p}=run(p0,[],0,1,s=>s.sport!=='STRENGTH');
 for(const id of ids){const row=rowsOf(p,1,id)[0];if(!row)continue;assert.equal(row.establishment,true,`${id}: not at its first-exposure dose`);assert.ok(row.sets<=2);assert.equal(p.stateTrace[1].strength.exercises[id],undefined);}
});
test('SSCTR D52: strength — a conflicted execution report performs and confirms nothing until it is corrected',()=>{
 const p0=generateProgram(intake({id:'t10-conflict',weeks:8,athlete:{goals:{run:'REGULAR',strength:'HYPERTROPHY'},knownExercises:[SQUAT],exerciseRotationPreference:'FIXED'}}),opts).program;
 const [mon,thu]=p0.weeks[0].sessions.filter(s=>s.sport==='STRENGTH'&&s.prescription),both=mon.prescription.exercises.map(e=>e.id).filter(id=>thu.prescription.exercises.some(e=>e.id===id)&&rowsOf(p0,0,id)[0].load.mode==='ESTABLISH'),only=mon.prescription.exercises.filter(e=>e.load.mode==='ESTABLISH'&&!thu.prescription.exercises.some(x=>x.id===e.id)).map(e=>e.id);
 assert.ok(both.length&&only.length,'exercises on both days and on Monday only');
 // Monday reported twice under one event id with different loads: a conflict that quarantines the session.
 const a=obs(p0,mon),b={...obs(p0,mon,{load:30}),eventId:a.eventId},rest=p0.weeks[0].sessions.filter(s=>s.prescription&&s!==mon).map(s=>obs(p0,s));
 const r=evaluateProgram(p0,review(p0,0,{observations:[...rest,a,b]}),opts);
 assert.equal(r.weekEvidence.rows.find(x=>x.sessionId===mon.id).status,'CONFLICTED');const p=r.proposal;
 for(const id of only){assertEstablishment(rowsOf(p,1,id)[0],`${id} after a conflicted report`);assert.equal(p.stateTrace[1].strength.exercises[id],undefined);}
 // The known lift of the conflicted session keeps its clock and its load where the last usable evidence left them.
 const squat=p.stateTrace[1].strength.exercises['back-squat'];assert.equal(squat.lastPerformed,SQUAT.observedAt);assert.equal(squat.load,SQUAT.load.value);
 // Thursday's log alone is a first establishment log: it waits for confirmation; the conflicted Monday log does not confirm it (SSCTR D45).
 for(const id of both){const st=p.stateTrace[1].strength.exercises[id];assert.equal(st.mode,'FROM_LOG',id);assert.equal(st.pendingLoad,20);assert.equal(st.lastPerformed,thu.date);assert.equal(rowsOf(p,1,id)[0].load.mode,'FROM_LOG');}
});
test('SSCTR D52: strength — a session completed without a logged load establishes no load; the next exposure is the establishment row again',()=>{
 const p0=generateProgram(intake({id:'t10-no-details',weeks:8,athlete:{goals:{run:'REGULAR',strength:'HYPERTROPHY'},knownExercises:[],exerciseRotationPreference:'FIXED'}}),opts).program;
 const ids=[...new Set(p0.weeks[0].sessions.flatMap(s=>s.prescription?.exercises??[]).filter(e=>e.load.mode==='ESTABLISH').map(e=>e.id))];assert.ok(ids.length);
 const {p}=run(p0,[],0,1,()=>true,{details:s=>s.sport!=='STRENGTH'});
 for(const id of ids){const row=rowsOf(p,1,id)[0];if(!row)continue;assertEstablishment(row,`${id} after a completion report without loads`);assert.equal(p.stateTrace[1].strength.exercises[id],undefined);}
});

// ---------- (B) the resume clock counts calendar days from the last executed exposure ----------
/** Probe Z2: runs executed throughout, every strength session missed in weeks 4-8, FIXED selection. */
function skippedStrength(){
 let p=generateProgram(intake({id:'t10-z2',athlete:{exerciseRotationPreference:'FIXED'}}),opts).program,ledger=[];
 ({p,ledger}=run(p,ledger,0,4));
 const last=rowsOf(p,3,'back-squat').at(-1).date;
 ({p,ledger}=run(p,ledger,4,9,s=>s.sport!=='STRENGTH'));
 return {p,ledger,last};
}
test('SSCTR D52: strength — five weeks of skipped strength sessions re-establish a known lift by effort, counted in calendar days from its last performance',()=>{
 const {p,last}=skippedStrength();
 for(let w=4;w<=9;w++){
  const row=rowsOf(p,w,'back-squat')[0],days=gap(last,row.date),st=p.stateTrace[w].strength.exercises['back-squat'];
  assert.equal(st.lastPerformed,last,`week ${w}: the clock counts from the last performance`);
  if(days>RET.moderateMaxDays){assert.equal(row.load.mode,'ESTABLISH',`week ${w}: ${days} days`);assert.match(row.instructions.join(' '),/Not done for more than 28 days.*do not exceed/);}
  else assert.equal(row.load.mode,'KNOWN',`week ${w}: ${days} days`);
 }
 assert.ok(gap(last,rowsOf(p,9,'back-squat')[0].date)>RET.moderateMaxDays);
});
test('SSCTR D52: strength — a missed re-establishment re-establishes nothing; one performed without a logged load leaves the next exposure effort-guided under the earlier ceiling',()=>{
 let {p,ledger}=skippedStrength();
 // Week 9: the re-establishment row was planned after a missed one in week 8 (above); the state still holds the known dose.
 const st9=p.stateTrace[9].strength.exercises['back-squat'];assert.equal(st9.mode,'KNOWN');
 // Week 9 completed without loads: performed, so the clock restarts, but no load is established.
 ({p,ledger}=run(p,ledger,9,10,()=>true,{details:s=>s.sport!=='STRENGTH'}));
 const st10=p.stateTrace[10].strength.exercises['back-squat'],row10=rowsOf(p,10,'back-squat')[0];
 assert.equal(st10.lastPerformed,rowsOf(p,9,'back-squat')[0].date);assert.equal(st10.unlogged,true);
 assert.equal(row10.load.mode,'ESTABLISH');assert.match(row10.instructions.join(' '),new RegExp(`No usable load was logged.*do not exceed ${st9.load} kg`));
 assert.ok(!row10.instructions.some(t=>/Use the load you/.test(t)));
 // Week 10 logged below the ceiling: that load is adopted and the sets come back one at a time.
 ({p,ledger}=run(p,ledger,10,11));
 const row11=rowsOf(p,11,'back-squat')[0];assert.equal(row11.load.mode,'KNOWN');assert.ok(row11.load.value<=st9.load);assert.equal(p.stateTrace[11].strength.exercises['back-squat'].unlogged,undefined);
});
test('SSCTR D52: strength — a known dose skipped from the first week counts its resume clock from the day it was observed',()=>{
 let p=generateProgram(intake({id:'t10-known-clock',athlete:{knownExercises:[SQUAT],exerciseRotationPreference:'FIXED'}}),opts).program;
 assert.equal(p.stateTrace[0].strength.exercises['back-squat'].lastPerformed,SQUAT.observedAt);
 ({p}=run(p,[],0,5,s=>s.sport!=='STRENGTH'));
 for(let w=0;w<=5;w++){const row=rowsOf(p,w,'back-squat')[0],days=gap(SQUAT.observedAt,row.date);assert.equal(row.load.mode,days>RET.moderateMaxDays?'ESTABLISH':'KNOWN',`week ${w}: ${days} days`);}
 assert.ok(gap(SQUAT.observedAt,rowsOf(p,5,'back-squat')[0].date)>RET.moderateMaxDays);
});

// ---------- after a return (probe Z3) ----------
/** Probe Y2/Z3 timeline: weeks before the pause executed and reviewed; a nonclinical TRAVEL pause from the Monday of week s for d days;
 * the return review on the day it ends; then every later week executed (sessions dated inside the pause excluded) and reviewed. */
// R7-B (audits/domain-coaching-r7-b-2026-10-31/TEST_CHANGES_R7B.md): an optional schedule, default unchanged, so the D52 witnesses can use a timeline
// in which a loaded accessory rotates under the DR-134/B0-C06 cadence.
function returnTimeline({pref,s,d,schedule={strengthDays:[0,4],runDays:[1,2,3],longRunDay:3}}){
 const p0=generateProgram(intake({id:`t10-z3-${pref}-${s}-${d}-${schedule.strengthDays.join('')}`,athlete:{goals:{run:'PERFORMANCE',strength:'HYPERTROPHY'},exerciseRotationPreference:pref},schedule}),opts).program;
 const done=new Map(),record=(P,w,keep)=>{for(const x of P.weeks[w].sessions)if(x.prescription&&keep(x))for(const e of x.prescription.exercises??[])done.set(e.id,[...(done.get(e.id)??[]),x.date]);};
 let p=p0,ledger=[];
 for(let w=0;w<s;w++){record(p,w,()=>true);({p,ledger}=run(p,ledger,w,w+1));}
 const abs=s*7+d,rw=Math.floor(abs/7),rday=abs%7,from=p.weeks[s].startDate,after=addDays(p.weeks[rw].startDate,rday);
 const r0=evaluateProgram(p,review(p,rw,{day:rday,kind:'RETURN_AFTER_PAUSE',interruption:{days:d,reasonCategory:'TRAVEL',nonclinical:true},actualLedger:ledger}),opts);
 assert.equal(r0.action,'REESTABLISH');p=r0.proposal;ledger=r0.actualLedger;
 const ew=p.decisions.at(-1).fromWeek,live=x=>!(x.date>=from&&x.date<=after);
 for(let w=ew;w<p.weeks.length-1;w++){record(p,w,live);({p,ledger}=run(p,ledger,w,w+1,live));}
 const lastRet=p.stateTrace.findLastIndex(t=>Object.values(t.strength.exercises).some(e=>Number.isInteger(e.returnStep)));
 // The first exposure after the return of each exercise not used during it, with its last performance before the pause.
 const used=new Set(p.weeks.slice(ew,lastRet+1).flatMap(w=>w.sessions.filter(live).flatMap(x=>x.prescription?.exercises??[]).map(e=>e.id))),firstBack=[];
 for(let w=lastRet+1;w<p.weeks.length;w++)for(const x of p.weeks[w].sessions)for(const e of x.prescription?.exercises??[]){if(used.has(e.id))continue;used.add(e.id);firstBack.push({w,id:e.id,row:e,date:x.date,last:(done.get(e.id)??[]).filter(t=>t<from).at(-1)??null});}
 return {p,ew,lastRet,firstBack};
}
test('SSCTR D52: after a return, an exercise first prescribed in a session dated inside the pause establishes by effort, and one last done more than 28 days earlier re-establishes (strength)',()=>{
 // R7-B: the two EVERY_2_WEEKS timelines on three strength days are where a loaded accessory rotates under the B0-C06 cadence (the R6 cadence
 // rotated db-step-up in the four original timelines; under B0-C06 those bring back only bodyweight exercises, still checked below).
 const S3={strengthDays:[0,2,4],runDays:[1,3,6],longRunDay:6};
 for(const [pref,s,d,schedule] of [['COACH_DECIDES',4,15],['EVERY_6_WEEKS',5,15],['COACH_DECIDES',7,12],['EVERY_6_WEEKS',7,13],['EVERY_2_WEEKS',2,15,S3],['EVERY_2_WEEKS',3,12,S3]]){
  const {firstBack,lastRet,ew}=returnTimeline({pref,s,d,...(schedule?{schedule}:{})});
  assert.ok(lastRet>=ew,`${pref} s${s} d${d}: the return has steps`);assert.ok(firstBack.length,`${pref} s${s} d${d}: a loaded exercise comes back after the return`);
  for(const f of firstBack){
   const label=`${pref} s${s} d${d} w${f.w} ${f.id} (last ${f.last??'never'})`;
   assert.ok(!f.row.instructions.some(t=>/Use the load you logged last time/.test(t)),label);
   // Bodyweight: a never-performed exercise starts at its first-exposure dose; its resume after 28 days stays open (R17).
   if(f.row.load.mode==='BODYWEIGHT'){if(f.last===null){assert.equal(f.row.establishment,true,label);assert.ok(f.row.sets<=2,label);}continue;}
   if(f.last===null)assertEstablishment(f.row,label);
   else if(gap(f.last,f.date)>RET.moderateMaxDays){assert.equal(f.row.load.mode,'ESTABLISH',label);assert.match(f.row.instructions.join(' '),/Not done for more than 28 days/,label);}
  }
 }
 const S3w={strengthDays:[0,2,4],runDays:[1,3,6],longRunDay:6},loaded=f=>f.row.load.mode!=='BODYWEIGHT';
 const pause=returnTimeline({pref:'EVERY_2_WEEKS',s:2,d:15,schedule:S3w}).firstBack.find(f=>loaded(f)&&f.last===null);assert.ok(pause,'a loaded exercise first prescribed inside the pause comes back after the return');assertEstablishment(pause.row,pause.id);
 const late=returnTimeline({pref:'EVERY_2_WEEKS',s:3,d:12,schedule:S3w}).firstBack.find(f=>loaded(f)&&f.last&&gap(f.last,f.date)>RET.moderateMaxDays);assert.ok(late,'a loaded exercise comes back more than 28 days after its last performance');assert.equal(late.row.load.mode,'ESTABLISH');assert.match(late.row.instructions.join(' '),/Not done for more than 28 days/);
});

// ---------- substitution (probe Z4) ----------
test('SSCTR D52: an unfamiliar substitute whose first establishment exposure was missed establishes at its next exposure',()=>{
 let p=generateProgram(intake({id:'t10-z4',weeks:12,athlete:{exerciseRotationPreference:'FIXED'}}),opts).program,ledger=[];
 ({p,ledger}=run(p,ledger,0,3));
 const r0=evaluateProgram(p,review(p,3,{day:0,kind:'EQUIPMENT_CHANGE',changes:{equipment:['DUMBBELLS','BENCH'],from:p.weeks[4].startDate,to:addDays(p.weeks[6].startDate,6)},actualLedger:ledger}),opts);
 assert.equal(r0.action,'SUBSTITUTE');p=r0.proposal;ledger=r0.actualLedger;
 const sub=p.weeks[4].sessions.flatMap(s=>s.prescription?.exercises??[]).find(e=>e.load.mode==='ESTABLISH'&&e.role==='MAIN');assert.ok(sub,'an unfamiliar main substitute');
 const firstDate=rowsOf(p,4,sub.id)[0].date;
 ({p,ledger}=run(p,ledger,3,6,s=>!(s.date===firstDate&&s.sport==='STRENGTH')));
 assertEstablishment(rowsOf(p,5,sub.id)[0],`${sub.id} after its missed first exposure ${firstDate}`);
 assert.equal(p.stateTrace[5].strength.exercises[sub.id],undefined);
 // Week 5 logged: the first log waits for confirmation and the next row chooses the load by effort (SSCTR D45, D48).
 const row6=rowsOf(p,6,sub.id)[0];assert.equal(row6.load.mode,'FROM_LOG');assert.ok(row6.instructions[0].startsWith('Ramp up'));assert.ok(!row6.instructions.some(t=>/Use the load you logged last time/.test(t)));
});
