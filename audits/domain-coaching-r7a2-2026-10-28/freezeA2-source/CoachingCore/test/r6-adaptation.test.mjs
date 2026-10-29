import test from 'node:test';
import assert from 'node:assert/strict';
import {hash} from '../src/value.mjs';
import {generateProgram} from '../src/r6-program.mjs';
import {evaluateProgram} from '../src/r6-adaptation.mjs';
import {devAuthority} from '../r6/fixtures/dev-authority.mjs';
import {PROFILES,EDGE_PROFILES} from '../r6/fixtures/profiles.mjs';

const opts={authority:devAuthority()};
const elig=d=>({status:'NONCLINICAL_CONFIRMED',assessedAt:d,pain:false,persistentPain:false,injury:false,illness:false,functionalLimitation:false,clinicalConcern:false});
const fresh=()=>generateProgram(PROFILES.A_RUN_FIRST_HALF_MARATHON,opts).program;
// Strength sessions log every planned set (known loads as planned, chosen loads at a stated 20 kg); the dose steps only on logged sets.
const logsFor=s=>s.sport==='STRENGTH'?{exercises:s.prescription.exercises.map(e=>({id:e.id,sets:Array.from({length:e.sets},()=>({reps:e.reps,load:e.load.mode==='BODYWEIGHT'?{value:0,unit:'BODYWEIGHT',convention:'BODYWEIGHT'}:{value:e.load.value??20,unit:'KG',convention:e.load.convention},rir:e.rir}))}))}:{};
const obs=(p,s,{response={performance:'COMPATIBLE',recovery:'COMPATIBLE',effort:'ON_TARGET'},completed=true,minutes=null,id=null,at=null,logs=true}={})=>({eventId:id??'e-'+s.id,athleteId:p.athleteId,sessionId:s.id,observedAt:at??s.date+'T09:00:00Z',actual:{completed,minutes:minutes??s.prescription.durationMinutes,...(logs&&completed?logsFor(s):{})},response,source:{provider:'MANUAL'}});
const lastDay=(p,w)=>p.weeks[w].sessions.at(-1).date;
const onDay=(d,n)=>new Date(Date.parse(d+'T00:00:00Z')+n*86400000).toISOString().slice(0,10);
const review=(p,w,kind,extra={},day=null)=>{const d=day??lastDay(p,w);return {version:'R6-REVIEW-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:d+'T21:00:00Z',weekIndex:w,event:{id:`t-${w}-${kind}-${d}`,kind},eligibility:elig(d),...extra};};
const all=(p,w,filter=()=>true,o={})=>p.weeks[w].sessions.filter(s=>s.prescription&&filter(s)).map(s=>obs(p,s,o));
const longOf=(p,w)=>p.weeks[w].sessions.find(s=>s.role==='LONG').prescription.durationMinutes;

test('Adaptation: executed as planned → KEEP; the official plan and completed work are never changed',()=>{
 const p=fresh(),ask=evaluateProgram(p,review(p,0,'WEEKLY_REVIEW',{observations:all(p,0)}),opts);
 // A load chosen once by effort is asked about before it becomes a number (SSCTR D45); the athlete confirms it.
 const asked=ask.loadQuestions.filter(q=>q.reason==='ESTABLISHMENT_LOG_UNCONFIRMED'),conv=id=>p.weeks[0].sessions.flatMap(s=>s.prescription?.exercises??[]).find(e=>e.id===id).load.convention;
 assert.ok(asked.length>0);
 const r=evaluateProgram(p,review(p,0,'WEEKLY_REVIEW',{observations:all(p,0),loadConfirmations:asked.map(q=>({exerciseId:q.exerciseId,value:q.logged,unit:'KG',convention:conv(q.exerciseId)}))}),opts);
 assert.deepEqual(r.loadQuestions,[]);
 assert.equal(r.status,'KEEP');assert.equal(r.applied,false);assert.deepEqual(r.officialPlanState,r.appliedState);
 // Week 1 establishes loads by effort: logging them only instantiates the placeholders.
 assert.equal(r.action,'INSTANTIATE_LOGGED_LOADS');assert.equal(r.instantiationOnly,true);
 const p2=r.proposal,r2=evaluateProgram(p2,review(p2,1,'WEEKLY_REVIEW',{observations:all(p2,1),actualLedger:r.actualLedger}),opts);
 assert.equal(r2.status,'KEEP');assert.ok(r2.counterfactuals.some(c=>c.id==='KEEP'&&c.selected),'executed as planned with logged loads → KEEP');
 const unlogged=evaluateProgram(p2,review(p2,1,'WEEKLY_REVIEW',{observations:p2.weeks[1].sessions.filter(s=>s.prescription).map(s=>obs(p2,s,{logs:false})),actualLedger:r.actualLedger}),opts);
 assert.ok(Object.entries(unlogged.gates).filter(([k])=>!['LONG','EASY','QUALITY'].includes(k)).every(([,g])=>g==='HOLD'),'completion flags alone never step strength (SSCTR D16)');
});
test('Adaptation: a missed long run is zero work, no debt; only that step repeats (H0–H3 traced)',()=>{
 let p=fresh();p=evaluateProgram(p,review(p,0,'WEEKLY_REVIEW',{observations:all(p,0)}),opts).proposal??p;
 const r=evaluateProgram(p,review(p,1,'WEEKLY_REVIEW',{observations:all(p,1,s=>s.role!=='LONG')}),opts);
 assert.equal(r.status,'MODIFY');assert.equal(r.gates.LONG,'HOLD');assert.equal(r.gates.EASY,'ADVANCE');
 assert.equal(longOf(r.proposal,2),longOf(p,1));assert.ok(longOf(r.proposal,2)<longOf(p,2));
 assert.ok(r.proposal.weeks[2].plannedRunMinutes<=p.weeks[2].plannedRunMinutes,'no compensation');
 for(const h of ['H0_SESSION','H1_WEEK','H2_BLOCK','H3_GOAL_EVENT'])assert.ok(r.horizons[h]);
 assert.ok(r.counterfactuals.some(c=>c.id==='KEEP'&&!c.selected));
});
test('Adaptation: mid-week reviews never gate next week as if future sessions were missed',()=>{
 const p=fresh(),tue=p.weeks[2].sessions.find(s=>s.day===1);
 const r=evaluateProgram(p,{...review(p,2,'MISSED_SESSION',{targetSessionId:tue.id},tue.date)},opts);
 assert.equal(r.status,'KEEP');assert.equal(r.proposal,null);
});
test('Adaptation: a missed key run in the specific phase moves only to a later chosen day without added interference',()=>{
 const p=generateProgram(EDGE_PROFILES.TEN_K_EIGHT_WEEKS,opts).program,w=4,q=p.weeks[w].sessions.find(s=>s.role==='QUALITY');
 const r=evaluateProgram(p,review(p,w,'MISSED_SESSION',{targetSessionId:q.id},q.date),opts);
 assert.equal(r.action,'MOVE');
 const moved=r.proposal.weeks[w].sessions.find(s=>s.moved?.from===q.id);
 assert.ok(moved&&moved.date>q.date&&p.schedule.runDays.includes(moved.day));
 assert.ok(r.counterfactuals.some(c=>c.id==='STACK_OR_CATCH_UP'&&!c.admissible));
});
test('Adaptation: repeated adverse responses regress one step, then hysteresis holds',()=>{
 let p=generateProgram(PROFILES.B_STRENGTH_FIRST,opts).program,ledger=[],model=null;const actions=[];
 const bad={performance:'UNDER',recovery:'ADVERSE',effort:'HARDER'};
 for(let w=0;w<6;w++){
  const o=all(p,w,()=>true).map(x=>p.weeks[w].sessions.find(s=>s.id===x.sessionId).role==='STRENGTH_LOWER'&&w>=3?{...x,response:bad}:x);
  const r=evaluateProgram(p,review(p,w,'WEEKLY_REVIEW',{observations:o,actualLedger:ledger,athleteModel:model}),opts);
  actions.push(r.gates?.['back-squat']??null);ledger=r.actualLedger;model=r.updatedModel;if(r.proposal)p=r.proposal;
 }
 assert.deepEqual(actions.slice(3),['HOLD','REGRESS','HOLD']);
});
test('Adaptation: repeated easier executions earn one step, never two; walk/jog never earns (SSCTR D11/D12)',()=>{
 const easier={performance:'OVER',recovery:'COMPATIBLE',effort:'EASIER'};
 let p=generateProgram(PROFILES.G_LOW_DATA_NO_WEARABLE,opts).program,ledger=[];const walkJog=[];
 for(let w=0;w<3;w++){const r=evaluateProgram(p,review(p,w,'WEEKLY_REVIEW',{observations:all(p,w,()=>true).map(x=>p.weeks[w].sessions.find(s=>s.id===x.sessionId).sport==='RUN'&&w>=1?{...x,response:easier}:x),actualLedger:ledger}),opts);walkJog.push(r.gates?.WALK_JOG);ledger=r.actualLedger;if(r.proposal)p=r.proposal;}
 assert.deepEqual(walkJog,['ADVANCE','ADVANCE','ADVANCE']);
 p=generateProgram(PROFILES.C_BALANCED_HYBRID,opts).program;ledger=[];const long=[];let earned=null;
 for(let w=0;w<9&&!earned;w++){const r=evaluateProgram(p,review(p,w,'WEEKLY_REVIEW',{observations:all(p,w).map(x=>p.weeks[w].sessions.find(s=>s.id===x.sessionId).role==='LONG'&&w>=1?{...x,response:easier}:x),actualLedger:ledger}),opts);long.push(r.gates?.LONG);ledger=r.actualLedger;if(r.gates?.LONG==='EARNED')earned={w,before:p,after:r.proposal};if(r.proposal)p=r.proposal;}
 assert.ok(earned,'repeated comparable surplus earns: '+long.join(','));assert.equal(long.filter(g=>g==='EARNED').length,1);
 const L=(prog,w)=>prog.stateTrace[w].run.long; // planned state, before any consolidation reduction
 assert.ok(L(earned.after,earned.w+1)-L(earned.before,earned.w)<=5,'EARNED never adds more than one long-run step');
 for(let w=0;w+1<earned.after.stateTrace.length;w++)assert.ok(earned.after.stateTrace[w+1].run.long-earned.after.stateTrace[w].run.long<=5,'one step per week at most');
});
test('Adaptation: local fatigue removes only optional local work; systemic convergence removes remaining hard work',()=>{
 const p=fresh(),w=5,day=p.weeks[w].sessions[0].date;
 const local=evaluateProgram(p,review(p,w,'LOCAL_FATIGUE',{signals:{region:'LOWER'}},day),opts);
 assert.equal(local.action,'REDUCE');
 const changed=local.proposal.weeks[w].sessions.filter((s,i)=>hash(s)!==hash(p.weeks[w].sessions[i]));
 assert.ok(changed.every(s=>s.sport==='STRENGTH'&&s.prescription.exercises.every(e=>e.role==='MAIN'||e.region!=='LOWER')));
 const systemic=evaluateProgram(p,review(p,w,'SYSTEMIC_FATIGUE',{},day),opts);
 assert.ok(systemic.proposal.weeks[w].sessions.filter(s=>s.date>day).every(s=>s.role!=='QUALITY'));
});
test('Adaptation: equipment loss substitutes by movement intent, establishes unfamiliar work and converts no load',()=>{
 const p=fresh(),w=3,r=evaluateProgram(p,review(p,w,'EQUIPMENT_CHANGE',{changes:{equipment:['BODYWEIGHT'],from:p.weeks[w+1].startDate,to:lastDay(p,w+1)}}),opts);
 assert.equal(r.action,'SUBSTITUTE');
 const s=r.proposal.weeks[w+1].sessions.filter(x=>x.sport==='STRENGTH'&&x.prescription);
 assert.ok(s.every(x=>x.prescription.exercises.every(e=>e.equipment.length===0)));
 assert.ok(s.flatMap(x=>x.prescription.exercises).every(e=>e.load.value===undefined||e.load.mode==='KNOWN'));
 assert.ok(r.substitutions.length&&r.substitutions.every(x=>x.selected&&x.pattern));
 // After a temporary window the original exercises return, never above the dose planned before the change.
 const ids=wk=>wk.sessions.filter(x=>x.sport==='STRENGTH'&&x.prescription).flatMap(x=>x.prescription.exercises.map(e=>e.id)).sort();
 assert.deepEqual(ids(r.proposal.weeks[w+2]),ids(p.weeks[w+2]),'window ends');
 const sets=wk=>wk.sessions.filter(x=>x.sport==='STRENGTH'&&x.prescription).flatMap(x=>x.prescription.exercises.map(e=>e.sets));
 assert.ok(sets(r.proposal.weeks[w+2]).every((n,i)=>n<=sets(p.weeks[w+2])[i]));
});
test('Adaptation: a substitution persists through later weekly reviews (SSCTR D27)',()=>{
 let p=fresh(),w=3;const r=evaluateProgram(p,review(p,w,'EQUIPMENT_CHANGE',{changes:{equipment:['BODYWEIGHT']}},p.weeks[w].startDate),opts);
 assert.equal(r.action,'SUBSTITUTE');p=r.proposal;
 const next=evaluateProgram(p,review(p,w,'WEEKLY_REVIEW',{observations:all(p,w),actualLedger:r.actualLedger}),opts),q=next.proposal??p;
 for(const wk of q.weeks.slice(w+1))for(const s of wk.sessions.filter(x=>x.sport==='STRENGTH'&&x.prescription))assert.ok(s.prescription.exercises.every(e=>e.equipment.length===0),'week '+wk.index+' keeps bodyweight-only work');
 assert.deepEqual(q.canonical.athlete.equipment,['BODYWEIGHT']);
});
test('Adaptation: a schedule change re-arranges future weeks on the new chosen days only',()=>{
 const p=fresh(),r=evaluateProgram(p,review(p,3,'SCHEDULE_CHANGE',{changes:{runDays:[0,2,5],longRunDay:5,strengthDays:[1,3]}}),opts);
 assert.equal(r.action,'REARRANGE_FUTURE_WEEKS');
 for(const wk of r.proposal.weeks.slice(4))for(const s of wk.sessions.filter(x=>x.prescription&&x.role!=='RACE'))assert.ok((s.sport==='RUN'?[0,2,5]:[1,3]).includes(s.day));
 assert.deepEqual(r.proposal.weeks.slice(0,4).map(w=>w.sessions.map(s=>s.id)),p.weeks.slice(0,4).map(w=>w.sessions.map(s=>s.id)));
});
test('Adaptation: an event date change re-plans phases; a date outside the horizon asks for a new program',()=>{
 const p=fresh(),r=evaluateProgram(p,review(p,2,'EVENT_DATE_CHANGE',{changes:{eventDate:'2027-02-07'}}),opts);
 assert.equal(r.action,'REPLAN_FUTURE_PHASES');assert.ok(r.proposal.weeks.some(w=>w.phase==='RACE_WEEK'&&w.sessions.some(s=>s.role==='RACE'&&s.date==='2027-02-07')));
 assert.equal(evaluateProgram(p,review(p,2,'EVENT_DATE_CHANGE',{changes:{eventDate:'2027-06-01'}}),opts).status,'ASK');
});
test('Adaptation: nonclinical return is staged from current evidence; clinical or unknown cause is never given a recipe',()=>{
 const p=fresh(),w=5;
 const moderate=evaluateProgram(p,review(p,w,'RETURN_AFTER_PAUSE',{interruption:{days:18,reasonCategory:'TRAVEL',nonclinical:true}}),opts);
 assert.equal(moderate.action,'REESTABLISH');
 const entry=moderate.proposal.weeks[w+1],step=moderate.proposal.weeks[w+2];
 assert.ok(entry.sessions.every(s=>s.role!=='QUALITY'));assert.ok(entry.plannedRunMinutes<step.plannedRunMinutes);
 assert.ok(entry.sessions.filter(s=>s.sport==='STRENGTH'&&s.prescription).every(s=>s.prescription.exercises.every(e=>e.sets===1&&e.rir>=4)));
 const demo=evaluateProgram(p,review(p,w,'RETURN_AFTER_PAUSE',{interruption:{days:18,reasonCategory:'TRAVEL',nonclinical:true},currentDemonstration:{observedAt:lastDay(p,w),sport:'RUN',family:'EASY',minutes:30,completed:true,effort:'CONVERSATIONAL',response:'COMPATIBLE',ordinaryFunction:'COMPATIBLE',nextDayFunction:'NORMAL'}}),opts);
 assert.ok(demo.proposal.weeks[w+1].plannedRunMinutes>entry.plannedRunMinutes,'a current demonstration replaces the generic entry');
 assert.equal(evaluateProgram(p,review(p,w,'RETURN_AFTER_PAUSE',{interruption:{days:18,reason:'knee injury'}}),opts).status,'CLINICAL_HUMAN_REQUIRED');
 assert.equal(evaluateProgram(p,review(p,w,'RETURN_AFTER_PAUSE',{interruption:{days:18}}),opts).status,'ASK');
 const short=evaluateProgram(p,review(p,w,'RETURN_AFTER_PAUSE',{interruption:{days:6,reasonCategory:'WORK'}}),opts);
 assert.ok(!short.proposal.weeks[w+1].sessions.some(s=>s.role==='QUALITY'),'first quality slot after a short break runs easy');
});
test('Adaptation: clinical flags route to a human and stay sticky through generic recovered labels',()=>{
 const p=fresh(),clinical=evaluateProgram(p,review(p,3,'WEEKLY_REVIEW',{eligibility:{...elig(lastDay(p,3)),pain:true}}),opts);
 assert.equal(clinical.status,'CLINICAL_HUMAN_REQUIRED');assert.equal(clinical.proposal,null);
 const after=evaluateProgram(p,review(p,4,'RECOVERED',{referenceState:clinical.referenceState}),opts);
 assert.equal(after.status,'CLINICAL_HUMAN_REQUIRED');
});
test('Adaptation: invalid chronology, missing timezone or stale eligibility hold or ask rather than guess',()=>{
 const p=fresh();
 assert.equal(evaluateProgram(p,{...review(p,2,'WEEKLY_REVIEW'),asOf:'2026-11-20T21:00:00'},opts).status,'HOLD');
 assert.equal(evaluateProgram(p,{...review(p,2,'WEEKLY_REVIEW'),weekIndex:5},opts).status,'HOLD');
 assert.equal(evaluateProgram(p,{...review(p,2,'WEEKLY_REVIEW'),eligibility:elig('2026-10-01')},opts).status,'ASK');
 assert.equal(evaluateProgram({...p,hash:'tampered'},review(p,2,'WEEKLY_REVIEW'),opts).status,'HOLD');
});
test('Adaptation: duplicates, conflicts and future facts never double-count or change a past decision',()=>{
 const p=fresh(),w=0,long=p.weeks[w].sessions.find(s=>s.role==='LONG');
 const base=all(p,w),watch={...obs(p,long,{id:'watch-1',response:{performance:'UNKNOWN',recovery:'UNKNOWN',effort:'UNKNOWN'}}),source:{provider:'WEARABLE:X',activityId:'a1',quality:'WEARABLE_FULL'}};
 const future=obs(p,p.weeks[1].sessions[0],{id:'future-1'});
 const r=evaluateProgram(p,review(p,w,'WEEKLY_REVIEW',{observations:[...base,watch,future]}),opts);
 assert.equal(r.actualLedger.filter(o=>o.sessionId===long.id).length,1);
 assert.ok(r.provenance.excluded.some(e=>e.reason==='FUTURE_OBSERVATION'));
 const conflict={...obs(p,long,{id:'watch-2',completed:false,minutes:10}),source:{provider:'WEARABLE:X',activityId:'a2'}};
 const c=evaluateProgram(p,review(p,w,'WEEKLY_REVIEW',{observations:[...base,conflict]}),opts);
 assert.equal(c.gates.LONG,'HOLD');assert.ok(c.provenance.conflicts.length);
});
test('Adaptation: a goal or date change with nothing new asks for it; the same goal again keeps the plan',()=>{
 const p=fresh(),d=p.weeks[1].startDate;
 const none=evaluateProgram(p,review(p,1,'EVENT_DATE_CHANGE',{},d),opts);assert.equal(none.status,'ASK');assert.deepEqual(none.missingInputs,['changes.eventDate']);
 const same=evaluateProgram(p,review(p,1,'GOAL_CHANGE',{changes:{goals:{run:p.canonical.goals.run.kind,strength:p.canonical.goals.strength.kind}}},d),opts);
 assert.equal(same.status,'KEEP');assert.equal(same.proposal,null);
 const moved=evaluateProgram(p,review(p,1,'EVENT_DATE_CHANGE',{changes:{eventDate:new Date(Date.parse(p.canonical.goals.event.date+'T00:00:00Z')-7*86400000).toISOString().slice(0,10)}},d),opts);
 assert.equal(moved.status,'MODIFY');assert.equal(moved.action,'REPLAN_FUTURE_PHASES');
});
test('Adaptation: a selected KEEP is always an admissible counterfactual, including weeks with logged loads that change nothing',async()=>{
 const {simulateProgram}=await import('../src/r6-simulator.mjs');
 const r=simulateProgram(PROFILES.A_RUN_FIRST_HALF_MARATHON,{default:{}},opts);
 for(const d of r.decisions)for(const c of d.counterfactuals.filter(x=>x.selected))assert.equal(c.admissible,true,`${d.kind} w${d.weekIndex} selected ${c.id}`);
});
test('Adaptation: a learned rearrangement applies and records the week’s gates, so hysteresis sees its regression',async()=>{
 const {simulateProgram}=await import('../src/r6-simulator.mjs');
 const sh=EDGE_PROFILES.SHARED_SAME_TURN,input={...structuredClone(sh),schedule:{...sh.schedule,temporaryPreference:'STRENGTH',sameTurnConfirmed:true}};
 const r=simulateProgram(input,{weeks:Array.from({length:8},(_,x)=>x>=3&&x<=5?{responses:[{sport:'RUN',role:'QUALITY',response:'HARDER'}]}:{})},opts);
 const learned=r.decisions.find(d=>d.action==='LEARNED_REARRANGEMENT');
 assert.ok(learned,'pattern learned');assert.equal(learned.gates.QUALITY,'REGRESS');
 const next=r.decisions.find(d=>d.kind==='WEEKLY_REVIEW'&&d.weekIndex===learned.weekIndex+1);
 assert.equal(next.gates.QUALITY,'HOLD','one regression per trend: the next adverse response holds');
 assert.ok(r.finalProgram.decisions.some(d=>d.action==='LEARNED_REARRANGEMENT'&&d.gates?.QUALITY==='REGRESS'),'recorded in the program decision log');
});
test('Adaptation: interruption reasons are screened by category and whole words; illness never gets a nonclinical recipe (SSCTR D08)',()=>{
 const p=fresh(),w=5,ret=interruption=>evaluateProgram(p,review(p,w,'RETURN_AFTER_PAUSE',{interruption}),opts);
 assert.equal(ret({days:18,reason:'Flu illness',nonclinical:true}).status,'CLINICAL_HUMAN_REQUIRED');
 assert.equal(ret({days:18,reason:'Sick with a fever',nonclinical:true,clinicalReason:false}).status,'CLINICAL_HUMAN_REQUIRED');
 assert.equal(ret({days:18,reasonCategory:'ILLNESS',nonclinical:true}).status,'CLINICAL_HUMAN_REQUIRED');
 assert.equal(ret({days:18,reasonCategory:'WORK',reason:'Work travel, will resume'}).action,'REESTABLISH','"will" is not "ill"');
 assert.equal(ret({days:18,reasonCategory:'TRAVEL',reason:'Two weeks of work travel; no clinical reason'}).action,'REESTABLISH','an explicit denial is not a clinical mention');
 assert.equal(ret({days:18,reason:'Work travel, will resume'}).status,'ASK','free text alone never confirms a nonclinical break (SSCTR R3)');
 for(const reason of ['personal reasons','knee felt weird','life happened',undefined])assert.equal(ret({days:18,reason,nonclinical:true}).status,'ASK',String(reason));
});
test('Adaptation: return eligibility must postdate the interruption; only a conversational easy run counts as a demonstration (SSCTR C6, D09)',()=>{
 const p=fresh(),w=5,day=lastDay(p,w),entry=evaluateProgram(p,review(p,w,'RETURN_AFTER_PAUSE',{interruption:{days:18,reasonCategory:'TRAVEL'}}),opts).proposal.weeks[w+1].plannedRunMinutes;
 const early=evaluateProgram(p,review(p,w,'RETURN_AFTER_PAUSE',{interruption:{days:18,reasonCategory:'TRAVEL',endDate:day},eligibility:elig(onDay(day,-3))}),opts);
 assert.equal(early.status,'ASK');assert.deepEqual(early.missingInputs,['eligibility.assessedOnOrAfterInterruptionEnd']);
 const base={observedAt:day,minutes:35,completed:true,effort:'CONVERSATIONAL',response:'COMPATIBLE',ordinaryFunction:'COMPATIBLE',nextDayFunction:'NORMAL'};
 const withDemo=demo=>evaluateProgram(p,review(p,w,'RETURN_AFTER_PAUSE',{interruption:{days:18,reasonCategory:'TRAVEL'},currentDemonstration:demo}),opts).proposal.weeks[w+1].plannedRunMinutes;
 assert.equal(withDemo({...base,sport:'STRENGTH',family:'FULL_BODY'}),entry,'a strength session is not a running demonstration');
 assert.equal(withDemo({...base,sport:'RUN',family:'THRESHOLD'}),entry,'a hard run is not an easy demonstration');
 assert.equal(withDemo({...base,sport:'RUN',family:'EASY',nextDayFunction:'IMPAIRED'}),entry,'impaired next-day function disqualifies');
 assert.equal(withDemo({...base,sport:'RUN',family:'EASY',observedAt:onDay(day,-30)}),entry,'a run before the interruption is not current');
 assert.ok(withDemo({...base,sport:'RUN',family:'EASY'})>entry);
});
test('Adaptation: after the race, redevelopment waits for an eligibility check dated on or after race day (SSCTR D04)',async()=>{
 const {simulateProgram}=await import('../src/r6-simulator.mjs');
 const r=simulateProgram(PROFILES.A_RUN_FIRST_HALF_MARATHON,{default:{}},opts),p=r.finalProgram,raceWeek=p.phases.raceWeek,race=p.weeks[raceWeek].sessions.find(s=>s.role==='RACE').date;
 const post=raceWeek+1,day=lastDay(p,post),before=evaluateProgram(p,{...review(p,post,'WEEKLY_REVIEW',{},day),eligibility:elig(onDay(race,-2))},opts);
 assert.equal(before.status,'ASK');assert.deepEqual(before.missingInputs,['eligibility.assessedOnOrAfterRace']);
 const after=evaluateProgram(p,review(p,post,'WEEKLY_REVIEW',{},day),opts);assert.notEqual(after.status,'ASK');
});
