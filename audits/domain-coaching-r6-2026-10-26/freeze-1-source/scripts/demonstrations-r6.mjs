import fs from 'node:fs';
import path from 'node:path';
import {clone,hash} from '../src/value.mjs';
import {generateProgram} from '../src/r6-program.mjs';
import {evaluateProgram} from '../src/r6-adaptation.mjs';
import {simulateProgram} from '../src/r6-simulator.mjs';
import {evidenceFor} from '../src/r6-learning.mjs';
import {r6Authority} from '../src/r6-authority.mjs';
import {evaluateHoldoutCase} from './evaluate-holdout-r6.mjs';
import {devAuthority} from '../r6/fixtures/dev-authority.mjs';
import {PROFILES,EDGE_PROFILES,intake} from '../r6/fixtures/profiles.mjs';
import {TRAJECTORIES} from '../r6/fixtures/trajectories.mjs';

/**
 * Required end-to-end demonstrations A–M. Every demonstration carries the same ten fields the mission asks for.
 * Executions and responses are scripted fixtures (inputs), never predictions.
 */
export const DEMONSTRATION_FIELDS=['initialFacts','uncertainty','generatedProgram','horizons','candidateOptions','selectedOption','reasoning','response','modelUpdate','futureEffect'];
const elig=d=>({status:'NONCLINICAL_CONFIRMED',assessedAt:d,pain:false,persistentPain:false,injury:false,illness:false,functionalLimitation:false,clinicalConcern:false});
const loadText=l=>l.mode==='BODYWEIGHT'?'bodyweight':Number.isFinite(l.value)?`${l.value}kg ${l.convention.toLowerCase()}`:l.mode.toLowerCase();
const sessionView=s=>({id:s.id,day:s.day,date:s.date,role:s.role,optional:!!s.optional,explanation:s.explanation??null,prescription:s.prescription?{family:s.prescription.family,durationMinutes:s.prescription.durationMinutes,effort:s.prescription.effort??null,work:s.prescription.work??null,strides:s.prescription.strides??null,exercises:s.prescription.exercises?.map(e=>({id:e.id,sets:e.sets,reps:e.reps,rir:e.rir,load:e.load}))??null}:null});
const compactWeek=w=>({index:w.index,startDate:w.startDate,phase:w.phase,contextualPriority:w.contextualPriority??null,runMinutes:w.plannedRunMinutes,strengthSets:w.plannedStrengthSets,sessions:w.sessions.filter(s=>s.prescription).map(s=>s.sport==='RUN'?`${s.date} ${s.role}${s.optional?' (optional)':''} ${s.prescription.durationMinutes} min${s.prescription.work?` incl. ${s.prescription.work.repetitions}×${s.prescription.work.workMinutes} min`:''}`:`${s.date} ${s.role}: ${s.prescription.exercises.map(e=>`${e.id} ${e.sets}×${e.reps} RIR${e.rir} ${loadText(e.load)}`).join('; ')}`)});
const programView=r=>r.program?{status:r.status,capability:{run:r.program.capability.run.class,strength:r.program.capability.strength.class},priorityByPhase:r.program.goal.priorityByPhase,staticPriorityRequired:r.program.goal.staticPriorityRequired,phases:r.program.phases.phases,blocks:r.program.blocks.map(b=>({family:b.family,startWeek:b.startWeek,endWeekExclusive:b.endWeekExclusive,intent:b.intent})),weeklyRunMinutes:r.program.weeks.map(w=>w.plannedRunMinutes),weeklyStrengthSets:r.program.weeks.map(w=>w.plannedStrengthSets),negotiation:r.program.negotiation,gaps:r.program.gaps,week1:compactWeek(r.program.weeks[0])}:{status:r.status,reason:r.reason,missingInputs:r.missingInputs,question:r.question??null};
const generationHorizons=r=>{
 const p=r.program;if(!p)return null;
 const w0=p.weeks[0],key=w0.sessions.find(s=>s.key&&s.prescription)??w0.sessions.find(s=>s.prescription);
 return {H0_SESSION:key?sessionView(key):null,H1_WEEK:compactWeek(w0),H2_BLOCK:p.blocks.map(b=>({family:b.family,weeks:`${b.startWeek}–${b.endWeekExclusive-1}`,intent:b.intent})),H3_GOAL_EVENT:{goals:{run:p.canonical.goals.run.kind,strength:p.canonical.goals.strength.kind,event:p.canonical.goals.event??null},priorityByPhase:p.goal.priorityByPhase,peakPlannedRunMinutes:Math.max(...p.weeks.map(w=>w.plannedRunMinutes??0)),lastWeeks:p.weeks.slice(-2).map(compactWeek)}};
};
const arrangementOptions=r=>Object.fromEntries(Object.entries(r.trace?.arrangement??{}).map(([context,a])=>[context,(a.counterfactuals??[]).map(c=>({id:c.id,admissible:c.admissible,preserves:c.preserves,costs:(c.costs??[]).map(x=>`${x.axis} ${x.severity}: ${x.cause}`),horizons:c.horizons,selected:c.selected,reason:c.reason}))]));
const selectedArrangement=r=>Object.fromEntries(Object.entries(r.trace?.arrangement??{}).map(([context,a])=>[context,{selectedId:a.selectedId??null,lead:a.lead,basis:a.basis,reason:a.reason}]));
const cfView=c=>{const {proposalSessions,...rest}=c;return rest;};
const obsView=o=>({sessionId:o.sessionId,observedAt:o.observedAt??o.occurrenceDate??null,source:o.source?.provider??'MANUAL',completed:o.actual?.completed,minutes:o.actual?.minutes??null,exercises:o.actual?.exercises?.map(e=>`${e.id} ${e.sets.length}×${e.sets[0]?.reps??'?'}${e.sets[0]?.load?` @${e.sets[0].load.value}${e.sets[0].load.unit==='KG'?'kg':''}`:''}${Number.isFinite(e.sets[0]?.rir)?` RIR${e.sets[0].rir}`:''}`)??null,response:o.response});
const evidenceView=e=>({direction:e.direction,confidence:e.confidence,informative:e.informativeCount,adverse:e.adverseCount,surplus:e.surplusCount,compatible:e.compatibleCount,partial:e.partialCount,unknownResponse:e.unknownCount,spanDays:Math.round(e.spanDays*10)/10,causal:e.causal,automaticDoseAuthority:e.automaticDoseAuthority});
const stepsOf=s=>s.rows.flatMap(r=>[...r.events,...(r.weekly?[r.weekly]:[])]);
function modelUpdate(all,step){
 const i=all.indexOf(step),prev=all.slice(0,i).reverse().find(x=>x.result.updatedModel)?.result.updatedModel??null,next=step.result.updatedModel??null;
 const ids=new Set((step.review.observations??[]).map(o=>o.eventId)),types=[...new Set((step.result.actualLedger??[]).filter(o=>ids.has(o.eventId)).map(o=>o.context?.sessionType).filter(Boolean))];
 return {learningConsent:next?.purposeAllowed??null,revisionBefore:prev?.revision??0,revisionAfter:next?.revision??null,observationsBefore:prev?.observations.length??0,observationsAfter:next?.observations.length??0,
  provenance:{excluded:(step.result.provenance?.excluded??[]).map(e=>e.reason),duplicates:step.result.provenance?.duplicates?.length??0,conflicts:step.result.provenance?.conflicts?.length??0},
  evidenceAfter:next?Object.fromEntries(types.map(t=>[t,evidenceView(evidenceFor(next,{sessionType:t}))])):{},learnedPatterns:step.result.learnedPatterns??null,populationPriorRetained:next?.populationPriorRetained??null};
}
function futureEffect(step){
 const before=step.programBeforeRef,after=step.result.proposal;
 if(!after)return {proposal:false,effect:'Plan unchanged: '+step.result.reason};
 const shape=w=>hash(w.sessions.map(s=>[s.day,s.role,s.prescription??null]));
 const changed=after.weeks.filter(w=>!before?.weeks[w.index]||shape(before.weeks[w.index])!==shape(w));
 return {proposal:true,adoptedByScriptedAthlete:step.adopted,changedWeeks:changed.map(w=>w.index),firstChanged:changed.slice(0,3).map(w=>({index:w.index,before:before?.weeks[w.index]?compactWeek(before.weeks[w.index]):null,after:compactWeek(w)}))};
}
function fromStep(sim,step,{initialFacts,reasoning,response,extra={}}){
 const res=step.result,selected=(res.counterfactuals??[]).find(c=>c.selected);
 return {initialFacts,uncertainty:sim.initial.uncertainty,generatedProgram:programView(sim.initial),
  decisionPoint:{kind:step.review.event.kind,asOf:step.review.asOf,weekIndex:step.review.weekIndex,status:res.status,action:res.action,reason:res.reason,gates:res.gates??null},
  horizons:res.horizons??null,candidateOptions:(res.counterfactuals??[]).map(cfView),selectedOption:selected?cfView(selected):{action:res.action,status:res.status,reason:res.reason},
  reasoning,response:{fixture:response,observations:(step.review.observations??[]).map(obsView)},modelUpdate:modelUpdate(stepsOf(sim),step),futureEffect:futureEffect(step),...extra};
}
const decisionLine=s=>({weekIndex:s.review.weekIndex,kind:s.review.event.kind,status:s.result.status,action:s.result.action,gates:s.result.gates??null,reason:s.result.reason});

export function buildDemonstrations(options){
 const demos=[];
 const add=(id,title,body)=>{const missing=DEMONSTRATION_FIELDS.filter(f=>!(f in body));if(missing.length)throw Error(`Demonstration ${id} lacks ${missing.join(', ')}`);demos.push({id,title,...body,fixturesAreNotPredictions:true});};
 const sim=id=>{const t=TRAJECTORIES.find(x=>x.id===id);return {t,r:simulateProgram(t.input,t.script,options)};};
 const firstWeekly=r=>stepsOf(r).find(s=>s.review.event.kind==='WEEKLY_REVIEW');
 const generationDemo=(r,firstStep,{initialFacts,reasoning,response,extra={}})=>({initialFacts,uncertainty:r.initial.uncertainty,generatedProgram:programView(r.initial),horizons:generationHorizons(r.initial),candidateOptions:arrangementOptions(r.initial),selectedOption:selectedArrangement(r.initial),reasoning,
  response:firstStep?{fixture:response,observations:(firstStep.review.observations??[]).map(obsView),firstReview:decisionLine(firstStep)}:{fixture:response},modelUpdate:firstStep?modelUpdate(stepsOf(r),firstStep):{note:'No execution yet'},futureEffect:firstStep?futureEffect(firstStep):{note:'Conditional future weeks'},...extra});

 // A — run-first cold start
 const a=sim('T01_HM16_STRONG_ADHERENCE');
 add('A','Cold-start Run-first half marathon → 16-week plan → week 1',generationDemo(a.r,firstWeekly(a.r),{initialFacts:a.t.input,reasoning:'Week 1 matches current running; strength loads are unknown, so the first exposure establishes them by effort; quality starts only after two observed easy weeks; the time goal never sets a pace; later weeks are conditional on executed, non-adverse evidence.',response:'Week 1 executed as planned with compatible responses (scripted)',extra:{peakAndTaper:a.r.finalProgram.weeks.slice(-5).map(compactWeek)}}));
 // B — strength-first cold start with effort-guided establishment
 const bInput=intake('B2-strength-unknown-loads',{weeks:12,athlete:{goals:{run:'REGULAR',strength:'HYPERTROPHY'},runExperience:'INTERMEDIATE',strengthExperience:'INTERMEDIATE',recent:{runDaysPerWeek:2,runMinutesPerWeek:70,longestRunMinutes:40,strengthDaysPerWeek:3},equipment:['DUMBBELLS','BENCH']},schedule:{runDays:[2,5],strengthDays:[0,3,4],runMinutes:40,strengthMinutes:55,longRunDay:5}});
 const b=simulateProgram(bInput,{default:{}},options),bFirst=stepsOf(b).find(s=>s.result.action==='INSTANTIATE_LOGGED_LOADS')??firstWeekly(b);
 add('B','Cold-start Strength-first → effort-guided load establishment → logged loads → progression',generationDemo(b,bFirst,{initialFacts:bInput,reasoning:'Familiar movements with unknown current loads are established by effort in the first exposure (at most two sets, reps in reserve ≥3); logged loads then replace the placeholders; reps progress before load, and only when targets are met with the reserve shown.',response:'Week 1 strength sessions logged with chosen loads and the planned reserve (scripted)',extra:{laterDecisions:stepsOf(b).slice(0,4).map(decisionLine),weeks1to3AfterLogs:b.finalProgram.weeks.slice(1,4).map(compactWeek)}}));
 // C — balanced hybrid without a static priority
 const c=sim('T03_BALANCED12_OVERPERFORMANCE');
 add('C','Cold-start Balanced hybrid without a static priority flag',generationDemo(c.r,firstWeekly(c.r),{initialFacts:c.t.input,reasoning:'Both goals develop, so the lead is JOINT and derived per phase; no priority flag is asked. The arrangement keeps heavy lower-body work off the day before the quality run; where candidates have identical costs the choice is canonical, not a hidden preference.',response:'Week 1 executed as planned (scripted)'}));
 // D — balanced real conflict
 const sharedInput=EDGE_PROFILES.SHARED_SAME_TURN,shared=generateProgram(sharedInput,options);
 const prefInput={...clone(sharedInput),schedule:{...sharedInput.schedule,temporaryPreference:'RUN',sameTurnConfirmed:true}},sharedPref=generateProgram(prefInput,options);
 const corpus=JSON.parse(fs.readFileSync(new URL('../r5/holdout/R5_INDEPENDENT_HOLDOUT.json',import.meta.url),'utf8')),h03=evaluateHoldoutCase(corpus.cases.find(x=>x.caseId==='R5-H03'),options);
 add('D','Balanced real conflict → Pareto and counterfactual selection',{initialFacts:sharedInput,uncertainty:shared.uncertainty,generatedProgram:{withoutPreference:programView(shared),withTemporaryPreference:programView(sharedPref)},
  horizons:Object.fromEntries(Object.entries(arrangementOptions(shared.program?shared:{trace:shared.trace??{}})).map(([k,v])=>[k,v.map(x=>({id:x.id,horizons:x.horizons}))])),
  candidateOptions:{sharedSameShift:arrangementOptions(shared.program?shared:{trace:shared.trace??{}}),r5H03:h03.generation.counterfactuals??null},
  selectedOption:{withoutPreference:shared.program?selectedArrangement(shared):{status:shared.status,question:shared.question??null,reason:shared.reason},withTemporaryPreference:selectedArrangement(sharedPref),r5H03:{selected:h03.generation.program?.selectedScheduleId??null,basis:h03.generation.ranking?.basis??h03.generation.status}},
  reasoning:'Pareto first over ordinal interference and H0–H3 costs; then the lowest worst-case joint harm. When two arrangements trade equal harm in opposite directions, the athlete is asked once; a temporary preference or strong athlete evidence resolves it. Candidate order never decides (R5 H03/H11/H20 root cause).',
  response:{fixture:'The athlete answers the question with a temporary preference for running first on shared shifts'},modelUpdate:{note:'A stated preference is a schedule fact, not learned evidence; the learning model is unchanged'},
  futureEffect:{withTemporaryPreference:sharedPref.program?sharedPref.program.weeks.slice(0,2).map(compactWeek):null,note:'Applies to future weeks of each phase until the athlete changes it'}});
 // E — missed key run
 const e=sim('T10_10K12_SPECIFIC_MISSED_AND_POST_EVENT'),irregular=sim('T02_HM16_IRREGULAR_ADHERENCE');
 const eStep=stepsOf(e.r).find(s=>s.review.event.kind==='MISSED_SESSION'),eLong=stepsOf(irregular.r).find(s=>s.result.gates?.LONG==='HOLD');
 add('E','Missed key run → horizon-preserving adaptation',fromStep(e.r,eStep,{initialFacts:e.t.input,reasoning:'Missed work is recorded as zero, with no debt. In the 10K specific phase a later chosen easy day can host the missed quality session only if no interference is added; otherwise the next comparable step repeats.',response:'The quality run on the specific-phase day was not done (scripted)',extra:{secondEpisode:{name:'Missed long run in the half-marathon build',decision:decisionLine(eLong),futureEffect:futureEffect(eLong)}}}));
 // F — missed key strength session
 const fGen=generateProgram(PROFILES.B_STRENGTH_FIRST,options),fProg=fGen.program,lower=fProg?.weeks[2].sessions.find(s=>s.role==='STRENGTH_LOWER');
 const fReview={version:'R6-REVIEW-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:lower.date+'T21:00:00Z',weekIndex:2,event:{id:'demo-F',kind:'MISSED_SESSION'},eligibility:elig(lower.date),targetSessionId:lower.id};
 const f=evaluateProgram(fProg,fReview,options),fStep={review:fReview,result:f,adopted:false,programBeforeRef:fProg};
 add('F','Missed key strength session → horizon-preserving adaptation',{initialFacts:PROFILES.B_STRENGTH_FIRST,uncertainty:fGen.uncertainty,generatedProgram:programView(fGen),horizons:f.horizons??null,candidateOptions:(f.counterfactuals??[]).map(cfView),selectedOption:cfView((f.counterfactuals??[]).find(x=>x.selected)??{action:f.action,reason:f.reason}),
  reasoning:'Moving the heavy lower session onto the remaining strength day would put heavy legs the evening before the long run (added MODERATE interference), so that counterfactual is rejected; stacking is never valid; the next lower step repeats without debt.',response:{fixture:'The lower-body strength session was not done (scripted)',week:compactWeek(fProg.weeks[2])},modelUpdate:{note:'No execution was observed; zero work is recorded and the learning model gains nothing'},futureEffect:futureEffect(fStep)});
 // G — partial session
 const gStep=stepsOf(irregular.r).find(s=>s.review.weekIndex===6&&s.review.event.kind==='WEEKLY_REVIEW');
 add('G','Partial session → learning update without overreaction',fromStep(irregular.r,gStep,{initialFacts:irregular.t.input,reasoning:'A 60% long run counts only what was done: adherence is informed, the long-run step repeats, nothing regresses and no capacity is inferred from the shortfall.',response:'Long run stopped at 60% of the planned time with otherwise compatible responses (scripted)'}));
 // H — repeated underperformance
 const h=sim('T04_STRENGTH12_REPEATED_UNDERPERFORMANCE'),hSteps=stepsOf(h.r).filter(s=>s.review.event.kind==='WEEKLY_REVIEW'&&s.review.weekIndex>=3&&s.review.weekIndex<=5),hMain=hSteps.find(s=>Object.values(s.result.gates??{}).includes('REGRESS'))??hSteps[0];
 add('H','Repeated underperformance → regression with hysteresis',fromStep(h.r,hMain,{initialFacts:h.t.input,reasoning:'One adverse lower-body session holds; a second comparable adverse response within 14 days regresses one step; the next adverse response at the new dose holds again instead of cascading.',response:'Lower-body sessions harder than intended with reps missed in consecutive weeks (scripted)',extra:{sequence:hSteps.map(decisionLine)}}));
 // I — overperformance
 const i=sim('T03_BALANCED12_OVERPERFORMANCE'),iSteps=stepsOf(i.r),iMain=iSteps.find(s=>Object.values(s.result.gates??{}).includes('EARNED'));
 add('I','Overperformance → earned progression',fromStep(i.r,iMain,{initialFacts:i.t.input,reasoning:'Three or more comparable easier-than-target executions spanning at least a week earn one extra step outside event phases; a single easier session does not.',response:'Quality and long runs reported easier than intended across consecutive weeks (scripted)',extra:{sequence:iSteps.filter(s=>s.review.event.kind==='WEEKLY_REVIEW'&&s.review.weekIndex<=iMain.review.weekIndex).map(decisionLine)}}));
 // J — substitution
 const j=sim('T07_GENERAL8_SCHEDULE_AND_EQUIPMENT'),jStep=stepsOf(j.r).find(s=>s.review.event.kind==='EQUIPMENT_CHANGE');
 add('J','Substitution after an equipment change → valid replacement',fromStep(j.r,jStep,{initialFacts:j.t.input,reasoning:'Same movement intent with the equipment now available, familiar options first; unfamiliar substitutes start with effort-guided establishment; no load is converted between implements; the stimulus change is disclosed.',response:'The athlete reports that only bodyweight and bands are available from now on (scripted)',extra:{substitutions:jStep.result.substitutions??null}}));
 // K — short nonclinical interruption
 const k=sim('T05_10K8_SHORT_INTERRUPTION'),kStep=stepsOf(k.r).find(s=>s.review.event.kind==='RETURN_AFTER_PAUSE');
 add('K','Short nonclinical interruption → re-entry trajectory',fromStep(k.r,kStep,{initialFacts:k.t.input,reasoning:'A short nonclinical break resumes the last completed doses; the first quality slot runs easy; the next step waits for observed execution; the event stays protected.',response:'A one-week nonclinical break (travel), confirmed without pain, injury or illness (scripted)',extra:{reentryWeeks:k.r.finalProgram.weeks.slice(2,6).map(compactWeek)}}));
 // L — event transition
 const l=a.r,lSteps=stepsOf(l),taperStart=l.finalProgram.weeks.findIndex(w=>w.phase==='TAPER'),lStep=lSteps.filter(s=>s.review.event.kind==='WEEKLY_REVIEW'&&s.review.weekIndex===taperStart-1)[0]??lSteps.at(-1);
 add('L','Half-marathon build → taper → race week → race → post-event',fromStep(l,lStep,{initialFacts:a.t.input,reasoning:'Volume falls relative to the achieved peak while frequency and a short race-effort touch remain; strength keeps reduced sets and stops three days before the race; the race is on the event date; the post-event week is easy and optional.',response:'Every build week executed as planned (scripted)',extra:{weeklyRunMinutes:l.summary.runMinutes,eventWeeks:l.finalProgram.weeks.slice(taperStart).map(compactWeek)}}));
 // M — learned athlete-specific pattern
 const mInput={...clone(sharedInput),schedule:{...sharedInput.schedule,temporaryPreference:'STRENGTH',sameTurnConfirmed:true}};
 const m=simulateProgram(mInput,{weeks:Array.from({length:8},(_,x)=>x>=3&&x<=5?{responses:[{sport:'RUN',role:'QUALITY',response:'HARDER'}]}:{})},options),mStep=stepsOf(m).find(s=>s.result.action==='LEARNED_REARRANGEMENT');
 add('M','Athlete-specific learned pattern changes a future valid decision',fromStep(m,mStep,{initialFacts:mInput,reasoning:'Quality runs done straight after strength were adverse on repeated comparable occasions while key runs without that order were compatible; future weeks flip the order on shared shifts at the same doses. This is an association, not causation, and the athlete may restore the preference.',response:'Quality runs after same-shift strength reported harder than intended with impaired recovery in weeks 4–6 (scripted)',extra:{arrangementBefore:m.initial.program?.arrangement??null,arrangementAfter:m.finalProgram?.arrangement??null}}));
 return demos;
}
const main=process.argv[1]&&path.resolve(process.argv[1])===path.resolve(import.meta.filename);
if(main){
 const dev=process.argv.includes('--dev'),options=dev?{authority:devAuthority()}:{},authority=r6Authority(options);
 const demos=buildDemonstrations(options);
 const out={revision:'R6-DEMONSTRATIONS-2',generatedAt:new Date().toISOString(),authority:dev?'DEV_TEST_ONLY':'CURRENT_INDEPENDENT_REVIEW',approvedBoundaries:authority.approved,policyHash:authority.policyHash,fields:DEMONSTRATION_FIELDS,demonstrations:demos};
 const file=new URL(dev?'../r6/DEMONSTRATIONS_R6.dev.json':'../r6/DEMONSTRATIONS_R6.json',import.meta.url);
 fs.writeFileSync(file,JSON.stringify(out,null,2)+'\n');
 console.log(JSON.stringify({demonstrations:demos.map(d=>d.id),authority:out.authority,file:file.pathname.split('/').slice(-2).join('/'),hash:hash(out.demonstrations)}));
}
