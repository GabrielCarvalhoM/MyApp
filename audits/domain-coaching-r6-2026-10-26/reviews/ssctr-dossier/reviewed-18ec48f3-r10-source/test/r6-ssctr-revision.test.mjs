import test from 'node:test';
import assert from 'node:assert/strict';
import {generateProgram,skeletonOf,buildWeek,runMinutesOf} from '../src/r6-program.mjs';
import {evaluateProgram} from '../src/r6-adaptation.mjs';
import {simulateProgram} from '../src/r6-simulator.mjs';
import {reducedWork} from '../src/r6-prescription.mjs';
import {loadR6Policy} from '../src/r6-authority.mjs';
import {devAuthority} from '../r6/fixtures/dev-authority.mjs';
import {PROFILES,EDGE_PROFILES,intake} from '../r6/fixtures/profiles.mjs';

// Regression checks for the SSCTR review of R6-POLICY-1 (defect ids D01–D33, conditions C5–C11). Development authority only.
const opts={authority:devAuthority()},policy=loadR6Policy();
const without=(...ids)=>({authority:devAuthority(policy.scientificBoundaryIds.filter(x=>!ids.includes(x)))});
const run=wk=>wk.sessions.filter(s=>s.sport==='RUN'&&s.prescription&&s.role!=='RACE'&&s.prescription.family!=='WALK');
const minutes=wk=>run(wk).reduce((n,s)=>n+s.prescription.durationMinutes,0);
const elig=d=>({status:'NONCLINICAL_CONFIRMED',assessedAt:d,pain:false,persistentPain:false,injury:false,illness:false,functionalLimitation:false,clinicalConcern:false});

test('C5/C6/D21: week 1 stays inside reported running, the long run never exceeds the longest current run, and a familiar task fits or waits',()=>{
 for(const [id,input] of Object.entries({...PROFILES,...EDGE_PROFILES})){
  const r=generateProgram(input,opts);if(!r.program)continue;
  const cap=r.program.capability.run,wk=r.program.weeks[0];
  if(['EASY_CURRENT','QUALITY_FAMILIAR','EASY_LOW'].includes(cap.class)){
   assert.ok(minutes(wk)<=cap.weeklyMinutes,`${id}: week 1 ${minutes(wk)} > reported ${cap.weeklyMinutes}`);
   const long=wk.sessions.find(s=>s.role==='LONG');if(long&&Number.isFinite(cap.longestMinutes))assert.ok(long.prescription.durationMinutes<=cap.longestMinutes,`${id}: long ${long.prescription.durationMinutes} > longest ${cap.longestMinutes}`);
  }
  if(cap.class==='EASY_UNKNOWN')assert.ok(run(wk).every(s=>s.prescription.durationMinutes<=policy.operational.establishment.unknownExposureEasyMinutes),`${id}: unknown exposure uses the reviewed entry only`);
  assert.ok(!wk.sessions.some(s=>s.role==='QUALITY'&&s.prescription.calibration?.basis!=='CURRENT_FAMILIAR_TASK'),`${id}: no new intensity in week 1`);
  assert.ok(!wk.sessions.some(s=>s.prescription?.strides),`${id}: no strides in week 1`);
 }
 const familiar=intake('familiar-tight',{weeks:8,athlete:{goals:{run:'PERFORMANCE',strength:'NONE'},runExperience:'INTERMEDIATE',recent:{runDaysPerWeek:3,runMinutesPerWeek:120,longestRunMinutes:50},knownRuns:[{prescription:{modality:'RUN',family:'THRESHOLD',durationMinutes:46,work:{repetitions:3,workMinutes:8,recoveryMinutes:2}},current:true,familiar:true,tolerated:true,observedAt:'2026-10-28'}]},schedule:{runDays:[0,2,5],strengthDays:[],longRunDay:5,runMinutes:60}});
 const w0=generateProgram(familiar,opts).program.weeks[0];assert.ok(minutes(w0)<=120,'the familiar task counts inside the reported minutes');
});
test('D13/D14: quality, strides and set increases follow executed weeks, not the calendar',()=>{
 let p=generateProgram(PROFILES.A_RUN_FIRST_HALF_MARATHON,opts).program,ledger=[];
 for(const w of [0,1,2]){const last=p.weeks[w].sessions.at(-1).date,r=evaluateProgram(p,{version:'R6-REVIEW-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:last+'T21:00:00Z',weekIndex:w,event:{id:'missed-'+w,kind:'WEEKLY_REVIEW'},eligibility:elig(last),observations:[],actualLedger:ledger},opts);ledger=r.actualLedger;if(r.proposal)p=r.proposal;}
 for(const w of [3,4]){assert.ok(!p.weeks[w].sessions.some(s=>s.role==='QUALITY'),'no quality after three missed weeks');assert.ok(!p.weeks[w].sessions.some(s=>s.prescription?.strides),'no strides after three missed weeks');}
 const base=generateProgram(PROFILES.A_RUN_FIRST_HALF_MARATHON,opts).program,sets=wk=>wk.sessions.filter(s=>s.sport==='STRENGTH'&&s.prescription).flatMap(s=>s.prescription.exercises.map(e=>e.sets));
 assert.ok(sets(p.weeks[5]).every((n,i)=>n<=sets(base.weeks[5])[i]),'no set increase after a missed block');
});
test('D17/D18: restart and walk/jog transitions respect the single-run ceiling against completed runs',()=>{
 const r=simulateProgram(EDGE_PROFILES.RESTART_AFTER_PAUSE,{default:{}},opts),weeks=r.finalProgram.weeks;
 for(let i=1;i<weeks.length;i++){
  const prior=weeks.slice(Math.max(0,i-5),i).flatMap(wk=>wk.sessions).filter(s=>runMinutesOf(s)>0).filter(s=>(Date.parse(weeks[i].startDate)-Date.parse(s.date))/86400000<=policy.operational.run.singleRunCeiling.windowDays);
  if(!prior.length)continue;
  const ceiling=Math.max(...prior.map(runMinutesOf))+policy.operational.run.singleRunCeiling.stepMinutes;
  for(const s of run(weeks[i]))assert.ok(s.prescription.durationMinutes<=ceiling,`week ${i} ${s.role} ${s.prescription.durationMinutes} > ceiling ${ceiling}`);
 }
 const lowData=simulateProgram(PROFILES.G_LOW_DATA_NO_WEARABLE,{default:{}},opts).finalProgram.weeks;
 assert.ok(lowData.slice(1).some(wk=>wk.sessions.some(s=>s.role==='WALK_JOG'&&s.prescription.durationMinutes>=20)),'the walk/jog ladder keeps its full session time');
});
test('D18: with no completed run in the window, a reprojection starts from the reviewed entry',()=>{
 const p=generateProgram(PROFILES.A_RUN_FIRST_HALF_MARATHON,opts).program,w=6,last=p.weeks[w].sessions.at(-1).date;
 const r=evaluateProgram(p,{version:'R6-REVIEW-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:last+'T21:00:00Z',weekIndex:w,event:{id:'empty',kind:'WEEKLY_REVIEW'},eligibility:elig(last),observations:[]},opts);
 assert.ok(run(r.proposal.weeks[w+1]).every(s=>s.prescription.durationMinutes<=policy.operational.return.entryRunMinutes),'nothing completed in 30 days: entry only');
});
test('D19/C8: the long run respects its weekly share; a step on a short reference is disclosed and never combined',()=>{
 const S=policy.operational.run.longRunShareOfWeeklyMinutesMax;
 for(const id of ['A_RUN_FIRST_HALF_MARATHON','C_BALANCED_HYBRID','E_EXPERIENCED_RUNNER_NOVICE_STRENGTH']){
  let held=null;
  for(const wk of generateProgram(PROFILES[id],opts).program.weeks){const r=run(wk),long=r.find(s=>s.role==='LONG');if(!long||r.length<3){continue;}const easy=Math.max(...r.filter(s=>s.role==='EASY').map(s=>s.prescription.durationMinutes),0),m=long.prescription.durationMinutes;
   // Within the share, or held at the typical easy run or at the last build week's long run (the cap holds, never shortens).
   assert.ok(m<=S*minutes(wk)+1e-9||m<=easy||held!==null&&m<=held,`${id} week ${wk.index}`);
   if(['TAPER','RACE_WEEK','POST_EVENT'].includes(wk.phase))held=null;
   else if(wk.phase!=='CONSOLIDATION'){if(held!==null)assert.ok(m>=held,`${id} week ${wk.index}: the cap never shortens the long run`);held=m;}}
 }
 const small=generateProgram(intake('short-ref',{weeks:8,athlete:{goals:{run:'REGULAR',strength:'NONE'},runExperience:'INTERMEDIATE',recent:{runDaysPerWeek:3,runMinutesPerWeek:90,longestRunMinutes:35}},schedule:{runDays:[0,2,5],strengthDays:[],longRunDay:5,runMinutes:60}}),opts).program;
 const st=small.stateTrace;for(let w=0;w+1<st.length;w++){const longStep=st[w+1].run.long>st[w].run.long&&st[w].run.long<50,easyStep=st[w+1].run.easy>st[w].run.easy||(st[w+1].run.easyExtra??0)>(st[w].run.easyExtra??0);assert.ok(!(longStep&&easyStep),'week '+w+': two single-session increases');}
 assert.ok(small.weeks.some(wk=>wk.sessions.some(s=>s.role==='LONG'&&/more than 10%/.test(s.explanation??''))),'the over-10% step is disclosed');
});
test('D01/D02/D03: taper and race week derive from executed work; touches and strides need executed work and the quality authority',()=>{
 const work=w=>w.repetitions*w.workMinutes;
 for(const peak of [{repetitions:3,workMinutes:5,recoveryMinutes:2},{repetitions:2,workMinutes:12,recoveryMinutes:3},{repetitions:6,workMinutes:4,recoveryMinutes:2}]){const t=reducedWork(peak,policy.operational.event.taperQualityWorkRange,policy.operational.event.reducedWorkMinimums);assert.ok(work(t)/work(peak)>=0.5&&work(t)/work(peak)<=0.6,JSON.stringify(t));}
 const noQuality=simulateProgram(PROFILES.A_RUN_FIRST_HALF_MARATHON,{default:{missed:[{sport:'RUN',role:'QUALITY'}]}},opts).finalProgram;
 const event=noQuality.weeks.filter(wk=>['TAPER','RACE_WEEK'].includes(wk.phase));
 assert.ok(event.every(wk=>!wk.sessions.some(s=>['QUALITY','RACE_TOUCH'].includes(s.role))),'no executed quality: easy-only taper and race week');
 const offQ=generateProgram(EDGE_PROFILES.TEN_K_EIGHT_WEEKS,without('R6-RUN-QUALITY')).program;
 assert.ok(offQ.weeks.every(wk=>!wk.sessions.some(s=>['QUALITY','RACE_TOUCH'].includes(s.role)||s.prescription?.strides)),'quality authority off: no touch or strides anywhere');
});
test('D30: an exercise unused for more than the moderate return window restarts effort-guided with its last load as a ceiling',()=>{
 const p=generateProgram(PROFILES.C_BALANCED_HYBRID,opts).program,sk=skeletonOf(p,devAuthority()),w=8,state=structuredClone(p.stateTrace[w].strength);
 const known=Object.entries(state.exercises).find(([,e])=>e.mode==='KNOWN');assert.ok(known);known[1].lastWeek=w-6;
 const {week}=buildWeek(sk,w,p.stateTrace[w].run,state,p.weeks.slice(0,w));
 const row=week.sessions.flatMap(s=>s.prescription?.exercises??[]).find(e=>e.id===known[0]);
 assert.equal(row.load.mode,'ESTABLISH');assert.match(row.instructions.join(' '),/do not exceed/);
});
test('D31: strides are optional for easy-low or novice runners',()=>{
 const p=simulateProgram(PROFILES.F_GENERAL_HYBRID,{default:{}},opts).finalProgram;
 const strides=p.weeks.flatMap(wk=>wk.sessions).filter(s=>s.prescription?.strides);
 assert.ok(strides.length,'strides appear after executed easy weeks');assert.ok(strides.every(s=>s.prescription.strides.optional===true));
});
test('D17: the restart to easy switch keeps the restart frequency; extra chosen days return one at a time',()=>{
 const input=intake('restart-five-days',{weeks:16,athlete:{goals:{run:'REGULAR',strength:'NONE'},runExperience:'INTERMEDIATE',recent:{runDaysPerWeek:0,runMinutesPerWeek:0}},schedule:{runDays:[1,3,4,5,6],strengthDays:[],longRunDay:6,runMinutes:90}});
 const weeks=simulateProgram(input,{default:{}},opts).finalProgram.weeks,runDays=wk=>run(wk).length;
 const max=policy.operational.establishment.maxWalkJogDaysPerWeek;
 for(let i=1;i<weeks.length;i++){if(['RACE_WEEK','POST_EVENT'].includes(weeks[i].phase))continue;assert.ok(runDays(weeks[i])-runDays(weeks[i-1])<=1,`week ${i}: run days jump ${runDays(weeks[i-1])}→${runDays(weeks[i])}`);}
 const switchWeek=weeks.findIndex(wk=>wk.sessions.some(s=>s.role==='LONG'));assert.ok(switchWeek>0);assert.ok(runDays(weeks[switchWeek])<=max,'the first easy week keeps the restart frequency');
});
test('D34/D35: the clinical screen splits clauses and reads English, Portuguese and Spanish',async()=>{
 const {screenInterruptionReason}=await import('../src/r6-clinical.mjs');
 const status=(reason,flags={nonclinical:true})=>screenInterruptionReason({reason,...flags}).status;
 for(const reason of ['Not sick - injured on holiday','No pain, injury during work travel','Not ill, injured my knee at work','no fever; sprained ankle on vacation','pain free now after the flu','no pain and injured knee','busy but my knee hurt','Fiquei doente, gripe','Machuquei o tornozelo na viagem','Viagem, mas fiquei gripado','Estuve enfermo con fiebre','Ocupado y enfermo','Familia, estuve con fiebre','Hacía mucho calor y me lesioné la rodilla','Me torcí el tobillo, viaje de trabajo','Vacaciones con dolor de espalda','Busy at work, also had covid'])assert.equal(status(reason),'CLINICAL',reason);
 // Legitimate denials stay nonclinical with a structured category; free text alone asks for the category (SSCTR R3).
 for(const reason of ['No pain or injury, work travel','Work travel, will resume Monday','Viagem de trabalho, sem dor','Viaje de trabajo, sin dolor','sin dolor ni lesión, solo trabajo','sem dor nem lesão, só trabalho','Two weeks of work travel; no clinical reason','no pain and no injury']){assert.equal(status(reason,{nonclinical:true,reasonCategory:'TRAVEL'}),'NONCLINICAL',reason);assert.equal(status(reason),'ASK',reason+' (no category)');}
 assert.equal(screenInterruptionReason({reason:'Flu',reasonCategory:'TRAVEL',nonclinical:true}).status,'CLINICAL','free text can only add a clinical or ask outcome to a nonclinical category');
 assert.equal(status('Holiday',{nonclinical:false}),'ASK');
 const p=generateProgram(PROFILES.A_RUN_FIRST_HALF_MARATHON,opts).program,w=5,day=p.weeks[w].sessions.at(-1).date;
 for(const reason of ['Not sick - injured on holiday','Ocupado y enfermo'])assert.equal(evaluateProgram(p,{version:'R6-REVIEW-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:day+'T21:00:00Z',weekIndex:w,event:{id:'ret-'+reason,kind:'RETURN_AFTER_PAUSE'},eligibility:elig(day),interruption:{days:14,reason,nonclinical:true}},opts).status,'CLINICAL_HUMAN_REQUIRED',reason);
 const base=EDGE_PROFILES.RESTART_AFTER_PAUSE;
 for(const reason of ['Not sick - injured on holiday','Ocupado y enfermo'])assert.equal(generateProgram({...structuredClone(base),athlete:{...structuredClone(base.athlete),pause:{nonclinical:true,weeks:2,reason}}},opts).status,'CLINICAL_HUMAN_REQUIRED',reason);
});
test('D36: observations carry a dose key; quality keys name family, ladder and step',async()=>{
 const {doseKeyOf}=await import('../src/r6-adaptation.mjs');
 const p=generateProgram(PROFILES.A_RUN_FIRST_HALF_MARATHON,opts).program,q=p.weeks.flatMap(w=>w.sessions).find(s=>s.role==='QUALITY');
 assert.match(doseKeyOf(q),/^THRESHOLD:THRESHOLD:\d+$/);
 const w=q.weekIndex,day=p.weeks[w].sessions.at(-1).date,r=evaluateProgram(p,{version:'R6-REVIEW-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:day+'T21:00:00Z',weekIndex:w,event:{id:'dose',kind:'WEEKLY_REVIEW'},eligibility:elig(day),observations:[{eventId:'q1',athleteId:p.athleteId,sessionId:q.id,observedAt:q.date+'T08:00:00Z',actual:{completed:true,minutes:q.prescription.durationMinutes},response:{performance:'COMPATIBLE',recovery:'COMPATIBLE',effort:'ON_TARGET'}}]},opts);
 assert.equal(r.actualLedger.find(o=>o.eventId==='q1').context.doseKey,doseKeyOf(q));
});
test('D37: an unavoidable moderate arrangement cost is disclosed with alternatives',()=>{
 const input=intake('am-strength-pm-run',{weeks:8,athlete:{goals:{run:'PERFORMANCE',strength:'STRENGTH'},runExperience:'INTERMEDIATE',strengthExperience:'EXPERIENCED',recent:{runDaysPerWeek:3,runMinutesPerWeek:150,longestRunMinutes:60},equipment:['BARBELL','RACK','BENCH','DUMBBELLS'],knownExercises:[{id:'back-squat',sets:4,reps:5,load:{value:100,unit:'KG',convention:'TOTAL'},rir:2,current:true,familiar:true,tolerated:true,observedAt:'2026-10-28'},{id:'barbell-rdl',sets:3,reps:6,load:{value:100,unit:'KG',convention:'TOTAL'},rir:2,current:true,familiar:true,tolerated:true,observedAt:'2026-10-28'}]},schedule:{runDays:[1,3,5],strengthDays:[1,3,5],runTurn:'PM',strengthTurn:'AM',runMinutes:60,strengthMinutes:60,longRunDay:5}});
 const r=generateProgram(input,opts);assert.equal(r.status,'PROPOSED');
 const d=r.program.negotiation.filter(n=>n.id==='ARRANGEMENT_COST_DISCLOSED');
 assert.ok(d.length,'disclosed');assert.ok(d.every(n=>n.costs.every(c=>['MODERATE','HIGH'].includes(c.severity))&&n.options.length===3));
});
test('D38/D39: double negation affirms pain; falls in any language are asked',async()=>{
 const {screenInterruptionReason}=await import('../src/r6-clinical.mjs');
 const status=(reason,category=null)=>screenInterruptionReason({reason,nonclinical:true,...(category?{reasonCategory:category}:{})}).status;
 for(const reason of ["On the work trip I couldn't run without pain",'Could not train without pain during the work trip','Never ran without pain on vacation','Não conseguia correr sem dor durante a viagem','Não consegui treinar sem dor no trabalho','No podía correr sin dolor durante el viaje','Nunca corrí sin dolor en vacaciones','Had a car accident on the trip','Acidente de bicicleta na viagem'])for(const c of [null,'TRAVEL'])assert.equal(status(reason,c),'CLINICAL',reason+' '+c);
 for(const reason of ['Caí na viagem','Me caí en el viaje','I fell on the trip','knee was fine'])for(const c of [null,'TRAVEL'])assert.equal(status(reason,c),'ASK',reason+' '+c);
 const p=generateProgram(PROFILES.A_RUN_FIRST_HALF_MARATHON,opts).program,w=5,day=p.weeks[w].sessions.at(-1).date;
 for(const reason of ["On the work trip I couldn't run without pain",'No podía correr sin dolor durante el viaje'])assert.equal(evaluateProgram(p,{version:'R6-REVIEW-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:day+'T21:00:00Z',weekIndex:w,event:{id:'d38-'+reason,kind:'RETURN_AFTER_PAUSE'},eligibility:elig(day),interruption:{days:14,reasonCategory:'TRAVEL',reason,nonclinical:true}},opts).status,'CLINICAL_HUMAN_REQUIRED',reason);
 const base=EDGE_PROFILES.RESTART_AFTER_PAUSE;
 assert.equal(generateProgram({...structuredClone(base),athlete:{...structuredClone(base.athlete),pause:{nonclinical:true,weeks:2,reasonCategory:'TRAVEL',reason:'Não conseguia correr sem dor durante a viagem'}}},opts).status,'CLINICAL_HUMAN_REQUIRED');
});
test('D40/R4: mid-clause without/sem/sin denials are asked; nothing/nada and negated feel/have verbs deny',async()=>{
 const {screenInterruptionReason}=await import('../src/r6-clinical.mjs');
 const status=reason=>screenInterruptionReason({reason,reasonCategory:'WORK',nonclinical:true}).status;
 for(const reason of ['It was hard to run without pain','Struggled to run without pain on the trip','Apenas conseguia correr sem dor','Viagem de trabalho e sem dor',"Didn't feel well on the trip",'Não me senti bem na viagem'])assert.equal(status(reason),'ASK',reason);
 for(const reason of ['nothing clinical, just a busy month',"Didn't feel any pain",'Não senti dor nenhuma','No tuve dolor, solo trabajo','Never had any injury','Not sick, not injured','I had no pain','Viagem de trabalho, sem dor'])assert.equal(status(reason),'NONCLINICAL',reason);
 for(const reason of ["Didn't manage to run without pain",'Was not able to run without pain','Jamás corrí sin dolor','No time and no pain'])assert.equal(status(reason),'CLINICAL',reason);
});
test('D41: a denial in a clause with a time or contrast condition is asked about',async()=>{
 const {screenInterruptionReason}=await import('../src/r6-clinical.mjs');
 const status=reason=>screenInterruptionReason({reason,reasonCategory:'WORK',nonclinical:true}).status;
 for(const reason of ["Didn't feel any pain until I tried to run",'Never had any injury before this trip','Não senti dor até voltar a correr','No tuve dolor hasta que corrí',"Didn't have pain except when running"])assert.equal(status(reason),'ASK',reason);
 for(const reason of ['No pain, only work travel','Sem dor, só trabalho','Sin dolor, solo trabajo','Without pain, just travel'])assert.equal(status(reason),'NONCLINICAL',reason);
});
