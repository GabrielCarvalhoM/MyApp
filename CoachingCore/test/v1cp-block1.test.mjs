// V1 Coaching Productization, Block 1 (stabilization): directed tests for the residual defects the R7-D final judgments routed to this mission.
//   A2 (QRE-P5H-F04, K-QRE-P5H-06; holdout shape R7D-H05 s4): a schedule change sent in the last week of the program reached the error path
//       ("Malformed review facts: Cannot read properties of undefined (reading 'sessions')"): scheduleChange planned from week w+1, one past the
//       horizon. The explicit rule: a change with no week left in this program keeps the current weeks and says how to move a session this week.
//       Every review kind sent in the last week must decide without the error path.
//   A1 (QRE-P5H-F01, SSCTR-P5H-O01; shapes R7D-H07, H20, H32, H34): the reason screen asked about body words used in a non-body sense ("back on
//       Wednesday", "on my feet all week"), read a clinical word about another person as the athlete's own ("caring for my mother after her
//       operation"), read the contraction "I'll" as the clinical word "ill", and its question asked for the reason category the athlete had already
//       given, so it never led to its own exit. Now the question names only what is missing (the category, or a yes/no confirmation that the break
//       involved no pain, injury, illness or medical reason of the athlete's own), and that explicit answer resolves an ambiguity. Signs that are
//       the athlete's own are never resolved by it: a clinical word attributed to the athlete, a clinical category or flag stays clinical.
// V1CP_ROOT=<repository root> runs the same file on another copy (the RED evidence on R7D-FREEZE-6). No number is added anywhere.
import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import {pathToFileURL} from 'node:url';

const ROOT=path.resolve(process.env.V1CP_ROOT??path.resolve(import.meta.dirname,'../..'));
const {generateProgram,evaluateProgram,REVIEW_KINDS}=await import(pathToFileURL(path.join(ROOT,'CoachingCore/src/r6-index.mjs')).href).then(async m=>({...m,REVIEW_KINDS:(await import(pathToFileURL(path.join(ROOT,'CoachingCore/src/r6-adaptation.mjs')).href)).REVIEW_KINDS}));
const {screenInterruptionReason}=await import(pathToFileURL(path.join(ROOT,'CoachingCore/src/r6-clinical.mjs')).href);

const ELIG=d=>({status:'NONCLINICAL_CONFIRMED',assessedAt:d,pain:false,persistentPain:false,injury:false,illness:false,functionalLimitation:false,clinicalConcern:false});
const addDays=(d,n)=>new Date(Date.parse(d+'T00:00:00Z')+n*864e5).toISOString().slice(0,10);
const offset=m=>(m<0?'-':'+')+String(Math.floor(Math.abs(m)/60)).padStart(2,'0')+':'+String(Math.abs(m)%60).padStart(2,'0');
const live=s=>!!s?.prescription&&s.status!=='SKIPPED';
const intake=({id,asOf,startDate,weeks,tz,runExperience,strengthExperience,recent,goals,equipment,schedule})=>({version:'R6-INTAKE-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf,startDate,weeks,timezoneOffsetMinutes:tz,
 athlete:{ageEligible:true,eligibility:ELIG(asOf),id,runExperience,strengthExperience,recent,goals,equipment},schedule});
// R7D-H05's athlete: a 4-week general novice block, dumbbells, offset +05:30.
const H05=intake({id:'ath-v1cp-h05',asOf:'2026-11-11',startDate:'2026-11-13',weeks:4,tz:330,runExperience:'NOVICE',strengthExperience:'NOVICE',recent:{runDaysPerWeek:2,runMinutesPerWeek:50,longestRunMinutes:30,strengthDaysPerWeek:1},goals:{run:'GENERAL',strength:'GENERAL'},equipment:['BODYWEIGHT','DUMBBELLS'],schedule:{runDays:[1,4],strengthDays:[0,3],runMinutes:35,strengthMinutes:40}});
// An intermediate 8-week athlete for the reason-screen returns (the interruption sits in week 2).
const R1=intake({id:'ath-v1cp-r1',asOf:'2026-11-07',startDate:'2026-11-09',weeks:8,tz:-180,runExperience:'INTERMEDIATE',strengthExperience:'INTERMEDIATE',recent:{runDaysPerWeek:3,runMinutesPerWeek:120,longestRunMinutes:50,strengthDaysPerWeek:2},goals:{run:'REGULAR',strength:'GENERAL'},equipment:['BODYWEIGHT','DUMBBELLS'],schedule:{runDays:[1,3,5],strengthDays:[0,4],runMinutes:45,strengthMinutes:45,longRunDay:5,longRunMinutes:60}});

const malformed=r=>(r.errors??[]).some(e=>String(e).startsWith('malformed:'))||/Malformed review facts/.test(r.reason??'');
function review(p,at,kind,extra={}){
 const day=addDays(p.startDate,at.week*7+at.day),asOf=`${day}T${at.time}:00${offset(p.timezoneOffsetMinutes??0)}`;
 return {version:'R6-REVIEW-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf,weekIndex:at.week,event:{id:`v1cp-${p.athleteId}-${kind}-${at.week}-${at.day}`,kind},eligibility:ELIG(day),observations:[],...extra};
}

test('A2-1 (H05 s4 shape): a schedule change sent in the last week keeps the current weeks and never reaches the error path',()=>{
 const g=generateProgram(structuredClone(H05));assert.equal(g.status,'PROPOSED',g.reason);
 const p=g.program,last=p.weeks.length-1;
 const r=evaluateProgram(p,review(p,{week:last,day:1,time:'08:00'},'SCHEDULE_CHANGE',{changes:{runDays:[1,5]}}));
 assert.ok(!malformed(r),`the last-week schedule change reached the error path: ${r.reason}`);
 assert.equal(r.status,'KEEP',r.reason);
 assert.equal(r.proposal,null,'nothing is re-planned: no week of this program is left after this one');
 assert.match(r.reason,/last week/i,'the reason names the last week');
 assert.match(r.reason,/unavailable/i,'the reason says how a session this week can still be moved');
});

test('A2-2: a dated schedule change from inside the last week, and the same change earlier, keep their existing behaviour',()=>{
 const g=generateProgram(structuredClone(H05)),p=g.program,last=p.weeks.length-1;
 // Earlier than the last week: rearranged from next week (unchanged rule).
 const early=evaluateProgram(p,review(p,{week:1,day:1,time:'08:00'},'SCHEDULE_CHANGE',{changes:{runDays:[1,5]}}));
 assert.equal(early.action,'REARRANGE_FUTURE_WEEKS',early.reason);
 // Dated after the program: KEEP (unchanged rule).
 const after=evaluateProgram(p,review(p,{week:last,day:1,time:'08:00'},'SCHEDULE_CHANGE',{changes:{runDays:[1,5],from:addDays(p.startDate,p.weeks.length*7+3)}}));
 assert.equal(after.status,'KEEP',after.reason);
});

test('A2-3: every review kind sent in the last week decides without the error path',()=>{
 const g=generateProgram(structuredClone(H05)),p=g.program,last=p.weeks.length-1,run=p.weeks[last].sessions.find(s=>live(s)&&s.sport==='RUN'),str=p.weeks[last].sessions.find(s=>live(s)&&s.sport==='STRENGTH');
 const ex=str.prescription.exercises[0];
 const payload={
  WEEKLY_REVIEW:{},MISSED_SESSION:{targetSessionId:run.id},PARTIAL_SESSION:{targetSessionId:run.id},UNDERPERFORMANCE:{targetSessionId:run.id},OVERPERFORMANCE:{targetSessionId:run.id},
  PROGRESSION_NOT_TOLERATED:{targetSessionId:run.id},PROGRESSION_TOO_EASY:{targetSessionId:run.id},LOCAL_FATIGUE:{signals:{region:'LOWER'}},SYSTEMIC_FATIGUE:{signals:{}},
  SCHEDULE_CHANGE:{changes:{runDays:[1,5]}},UNAVAILABLE_DAY:{changes:{unavailableDates:[run.date]}},DOUBLE_CONFLICT:{changes:{runTurn:'AM'}},EQUIPMENT_CHANGE:{changes:{equipment:['BODYWEIGHT']}},
  GOAL_CHANGE:{changes:{goals:{run:'REGULAR'}}},EVENT_DATE_CHANGE:{changes:{eventDate:addDays(p.startDate,20)}},
  RETURN_AFTER_PAUSE:{interruption:{startDate:addDays(p.startDate,last*7-3),endDate:addDays(p.startDate,last*7),reasonCategory:'TRAVEL',nonclinical:true,reason:'trip'}},
  EVENT_WEEK_CONFLICT:{changes:{unavailableDates:[run.date]}},RECOVERED:{},EXERCISE_SUBSTITUTION:{substitution:{exerciseId:ex.id,reason:'PREFERENCE'}}};
 const failures=[];
 for(const kind of REVIEW_KINDS){
  for(const day of [0,3,6]){
   const r=evaluateProgram(p,review(p,{week:last,day,time:'20:00'},kind,payload[kind]??{}));
   if(malformed(r))failures.push(`${kind} day ${day}: ${r.reason}`);
  }
 }
 assert.deepEqual(failures,[],'no review kind in the last week may reach the error path');
});

// ---------------- A3: per-sport stop (SSCTR-V1CP Q02, option A) ----------------
test('A3 (H28 shape; SSCTR-P5H-O02): a sport with no session planned between two separate breaks reads its own stop; the other keeps today\'s',async()=>{
 const fs=await import('node:fs');
 const client=await import(pathToFileURL(path.join(ROOT,'audits/domain-coaching-r7-d-2026-11-02/harness/lib/client-9.mjs')).href);
 const rt=await client.loadRuntime(path.join(ROOT,'CoachingCore'));
 // The spent holdout is read only, as a regression shape (never evaluated again, nothing written under final2/).
 const H=JSON.parse(fs.readFileSync(path.join(ROOT,'audits/domain-coaching-r7-d-2026-11-02/final2/R7D_FINAL_HOLDOUT_2.json'),'utf8'));
 const t=client.runCase(rt,H.cases.find(c=>c.caseId==='R7D-H28')),s4=t.steps.find(s=>s.stepId==='s4'),d=s4.result.proposal.decisions.at(-1).interruption;
 assert.equal(d.class,'SHORT','running reads the 4-day inventory stop');
 assert.deepEqual(d.classBySport,{RUN:'SHORT',STRENGTH:'MODERATE'});assert.deepEqual(d.stopBySport,{STRENGTH:{start:'2026-12-30',days:18}});
 const next=s4.result.proposal.weeks.flatMap(w=>w.sessions).filter(s=>s.sport==='STRENGTH'&&live(s)&&s.date>='2027-01-17').slice(0,2);
 assert.ok(next.length===2&&next.every(s=>s.prescription.exercises.every(e=>e.sets===1&&e.rir>=4)),'strength enters at the return-entry dose (1 set, RIR 4 or more), then D49');
 assert.match(s4.result.reason,/strength had no session planned between the breaks/);
 // Only lengthens (C-Q02-1): across the corpus no sport's own class is shorter than the stop's class.
 const order=['SHORT','MODERATE','LONG'];
 for(const k of H.cases){const tr=client.runCase(rt,k);for(const st of tr.steps){const dd=st.result?.proposal?.decisions?.at(-1)?.interruption;if(dd?.classBySport)for(const c of Object.values(dd.classBySport))assert.ok(order.indexOf(c)>=order.indexOf(dd.class),k.caseId+' '+st.stepId);}}
});

// ---------------- A1: the reason screen ----------------
const S=(reason,reasonCategory,extra={})=>screenInterruptionReason({reason,reasonCategory,nonclinical:reasonCategory?true:null,...extra});

test('A1-1 (H32; SSCTR-V1CP Q01 (c), QRE-V1CP-01): only the approved collocations are no body mention; every other use is still asked',()=>{
 // Outside the approved list (QRE-V1CP-01): asked, as before V1CP, never read as the adverb by guess.
 for(const r of ['long weekend in the mountains, back on Wednesday','banged my head into the door frame','knocked my head into a beam at work','back at the clinic again','was back in the er','back in a brace for two weeks','back in bed for days','head over the handlebars at the trip'])assert.equal(S(r,'WORK').status,'ASK',r);
 for(const r of ['I will be back home soon','got back from the trip','flew back to the city','estuve de pie todo el dia'])assert.equal(S(r,'TRAVEL').status,'NONCLINICAL',r);
 assert.equal(S('trade show, on my feet all week','WORK').status,'NONCLINICAL');
 assert.equal(S('got back from the trip on Sunday','TRAVEL').status,'NONCLINICAL');
 assert.equal(S('feira de negócios, em pé o dia todo','WORK').status,'NONCLINICAL');
 // The same words used for the body are still asked about, or clinical with a damage verb.
 assert.equal(S('my back was stiff after the flight','TRAVEL').status,'ASK');
 assert.equal(S('came back with a broken ankle','TRAVEL').status,'CLINICAL');
 assert.equal(S('hurt my back moving boxes','MOVING').status,'CLINICAL');
 assert.equal(S('back pain','WORK').status,'CLINICAL');
});

test('A1-2: the contraction "I\'ll" is "I will", never the clinical word "ill"',()=>{
 assert.equal(S("I'll be travelling for work",'WORK').status,'NONCLINICAL');
 assert.equal(S('I’ll be away at a wedding','FAMILY').status,'NONCLINICAL');
 assert.equal(S('I was ill','WORK').status,'CLINICAL','the word itself stays clinical');
});

test('A1-3 (H07): a clinical word about another person is asked once, never the athlete\'s clinical mention; the explicit answer resolves it',()=>{
 const asked=S('caring for my mother after her operation','FAMILY');
 assert.equal(asked.status,'ASK',JSON.stringify(asked));
 assert.equal(asked.basis,'AMBIGUOUS_REASON');
 assert.ok(asked.matched.some(m=>/someone else/.test(m)&&/operation/.test(m)),JSON.stringify(asked.matched));
 const answered=S('caring for my mother after her operation','FAMILY',{clinicalReason:false});
 assert.equal(answered.status,'NONCLINICAL',JSON.stringify(answered));
 assert.equal(S('cuidando da minha mãe depois da operação','FAMILY').status,'ASK');
 assert.equal(S('cuidando da minha mãe depois da operação','FAMILY',{clinicalReason:false}).status,'NONCLINICAL');
 assert.equal(S('mi hijo estuvo enfermo','FAMILY').status,'ASK');
 assert.equal(S('mi hijo estuvo enfermo','FAMILY',{clinicalReason:'no'}).status,'NONCLINICAL');
 // H34: a baby in the family is asked once (postpartum is a clinical category for the person who gave birth), then resolved by the answer.
 assert.equal(S('a new baby in the family','FAMILY').status,'ASK');
 assert.equal(S('a new baby in the family','FAMILY',{clinicalReason:false}).status,'NONCLINICAL');
 // A first-person plural is the athlete (SSCTR-V1CP Q01): "we" stays clinical.
 assert.equal(S('we were all sick at home','FAMILY').status,'CLINICAL');
});

test('A1-3b (SSCTR-V1CP C-Q01-4): the directed cases, in the three V1 languages',()=>{
 const cases=[
  ['my son had the flu, I caught it','FAMILY','CLINICAL'],['my wife and I had covid','FAMILY','CLINICAL'],['we all got sick','FAMILY','CLINICAL'],['visiting my dad in hospital','FAMILY','ASK'],
  ['got back pain','WORK','CLINICAL'],['back from hospital','TRAVEL','CLINICAL'],['my back was killing me','WORK','ASK'],['cut on my feet','WORK','CLINICAL'],
  ['meu filho teve gripe, eu peguei','FAMILY','CLINICAL'],['minha esposa e eu tivemos covid','FAMILY','CLINICAL'],['todos nós ficamos doentes','FAMILY','CLINICAL'],['visitando meu pai no hospital','FAMILY','ASK'],
  ['voltei do hospital','TRAVEL','CLINICAL'],['minhas costas estavam me matando','WORK','ASK'],['cortei o pé','WORK','CLINICAL'],
  ['mi hijo tuvo gripe, me contagió','FAMILY','CLINICAL'],['visitando a mi padre en el hospital','FAMILY','ASK'],['nos enfermamos todos','FAMILY','CLINICAL'],
  ['Had a baby','OTHER_NONCLINICAL','CLINICAL'],['Bitten by a dog','OTHER_NONCLINICAL','CLINICAL'],['mordedura de perro','OTHER_NONCLINICAL','CLINICAL'],['Dog bite','OTHER_NONCLINICAL','ASK']];
 for(const [r,c,e] of cases)assert.equal(S(r,c).status,e,r);
 // H07 becomes NONCLINICAL only on the structured no; a conditioned denial is never resolved by it, and its question names the way out.
 assert.equal(S('caring for my mother after her operation','FAMILY',{clinicalReason:false}).status,'NONCLINICAL');
 const cond=S("didn't feel any pain until I ran",'TRAVEL',{clinicalReason:false});assert.equal(cond.status,'ASK');assert.equal(cond.basis,'CONDITIONED_DENIAL');
 // The confirmation names pregnancy and recent childbirth (asked for a new baby).
 const g=generateProgram(structuredClone(R1)),p=g.program,ask=evaluateProgram(p,review(p,{week:2,day:0,time:'19:00'},'RETURN_AFTER_PAUSE',{interruption:{startDate:addDays(p.startDate,8),endDate:addDays(p.startDate,13),reasonCategory:'FAMILY',nonclinical:true,reason:'a new baby in the family'}}));
 assert.deepEqual(ask.missingInputs,['interruption.clinicalReason']);assert.match(ask.reason,/pregnancy or recent childbirth/);
 // Portuguese 'no' before a place of care is 'in the', never a denial.
 assert.equal(S('fui no médico','WORK').status,'CLINICAL');assert.equal(S('no pain, just work','WORK').status,'NONCLINICAL');
});

test('A1-4: signs that are the athlete\'s own are never resolved by the confirmation',()=>{
 for(const [reason,category] of [['my son had the flu and I caught it','FAMILY'],['I had the flu','TRAVEL'],['estuve enfermo','FAMILY'],['machuquei as costas cuidando da minha mãe','FAMILY'],['I had a baby','FAMILY'],['tive um bebê','FAMILY']])
  assert.equal(S(reason,category,{clinicalReason:false}).status,'CLINICAL',reason);
 assert.equal(S('trip','INJURY',{clinicalReason:false}).status,'CLINICAL','a clinical category stays clinical');
 assert.equal(S('trip','TRAVEL',{clinicalReason:true}).status,'CLINICAL','a clinical yes stays clinical');
 // Without a structured nonclinical category the answer cannot confirm a nonclinical break (reasonScreen): the category is still asked.
 assert.equal(S('caring for my mother after her operation',null,{clinicalReason:false}).status,'ASK');
});

test('A1-5: the return question names only what is missing, and answering it applies the return',()=>{
 const g=generateProgram(structuredClone(R1));assert.equal(g.status,'PROPOSED',g.reason);
 const p=g.program,interruption={startDate:addDays(p.startDate,8),endDate:addDays(p.startDate,13),reasonCategory:'FAMILY',nonclinical:true,reason:'caring for my mother after her operation'};
 const ask=evaluateProgram(p,review(p,{week:2,day:0,time:'19:00'},'RETURN_AFTER_PAUSE',{interruption}));
 assert.equal(ask.status,'ASK',ask.reason);
 assert.deepEqual(ask.missingInputs,['interruption.clinicalReason'],'the category the athlete gave is never asked again');
 assert.match(ask.reason,/own/i);
 const ok=evaluateProgram(p,review(p,{week:2,day:0,time:'19:30'},'RETURN_AFTER_PAUSE',{interruption:{...interruption,clinicalReason:false}}));
 assert.equal(ok.action,'REESTABLISH',ok.reason);
 // With no category, both are asked in one question.
 const both=evaluateProgram(p,review(p,{week:2,day:0,time:'19:00'},'RETURN_AFTER_PAUSE',{interruption:{...interruption,reasonCategory:undefined,nonclinical:undefined}}));
 assert.equal(both.status,'ASK',both.reason);
 assert.deepEqual(both.missingInputs,['interruption.reasonCategory','interruption.clinicalReason']);
 // A missing reason still asks only for the category.
 const none=evaluateProgram(p,review(p,{week:2,day:0,time:'19:00'},'RETURN_AFTER_PAUSE',{interruption:{startDate:interruption.startDate,endDate:interruption.endDate}}));
 assert.deepEqual(none.missingInputs,['interruption.reasonCategory']);
});
