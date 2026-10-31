// Probe batch A: state transitions and stale-state resurrection on the frozen R7-B runtime (engineering judge, read-only).
import {record,guard,done,program,reviewed,weekly,review,evaluateProgram,opts,FULL,rows,runs,live,obs,addDays,BAD,correctionOf,strengthIds,templateTypes,qualityRuns,evalAt,apply,summary,A,P,R} from './lib.mjs';

const RUN_ONLY={goals:{run:'PERFORMANCE',strength:'NONE'},schedule:{strengthDays:[]}};
const GRAD={id:'e-grad',...RUN_ONLY,runExperience:'NOVICE',recent:{runDaysPerWeek:3,runMinutesPerWeek:80,longestRunMinutes:35},schedule:{strengthDays:[],runMinutes:45},weeks:16};
const obsFor=(t,w,pred)=>t.ledger.filter(o=>!o.superseded&&t.p.weeks[w].sessions.some(s=>s.id===o.sessionId&&pred(s)));

// A1: graduation decided at the week-3 boundary; on the Monday of the introduction week the athlete corrects week 3's long-run report to an
// adverse response. The qualifying evidence no longer holds (B0-C01 c3). Does the threshold session stay planned on the retracted evidence?
guard('A1','stale-state / correction',()=>{
 const t=reviewed(GRAD,3);const g=weekly(t,3);
 const graduated=g.action==='RUN_QUALITY_GRADUATION';
 const longObs=obsFor(t,3,s=>s.role==='LONG')[0];
 const at=`${t.p.weeks[4].startDate}T06:00:00Z`;
 const fix=correctionOf(longObs,{...structuredClone(longObs.actual)},`${t.p.weeks[4].startDate}T05:00:00Z`,BAD);
 const r=evaluateProgram(t.p,{...review(t.p,4,{day:0,hour:'06:00:00',observations:[fix]}),actualLedger:t.ledger},opts);
 const P2=r.proposal??t.p;
 const q4=qualityRuns(P2,4).map(s=>s.id),q5=qualityRuns(P2,5).map(s=>s.id);
 const h=A.historicalStateOf(P2,{asOf:at,actualLedger:r.actualLedger??t.ledger},opts);
 const stillGraduated=!!P2.canonical.athlete.runGraduation;
 record('A1','stale-state / correction',graduated&&!stillGraduated&&!q4.length,
  'after a correction makes a qualifying week adverse, the graduation is re-assessed: no threshold session planned on retracted evidence (or an ASK)',
  {boundaryAction:g.action,correctionReview:summary(r),graduationStillInContext:stillGraduated,qualityWeek4:q4,qualityWeek5:q5,historicalQualityRunner:h?.state?.run?.qualityRunner??null,correctedObservationAccepted:(r.provenance?.superseded??[]).map(x=>x.eventId)});
});

// A2: the correction arrives in the boundary review itself (A5: the correction applies before the decision).
guard('A2','correction before block-boundary step',()=>{
 const t=reviewed(GRAD,3);
 const longObs=obsFor(t,2,s=>s.role==='LONG')[0];
 const fix=correctionOf(longObs,{...structuredClone(longObs.actual)},`${addDays(t.p.weeks[3].startDate,6)}T20:00:00Z`,BAD);
 const wk=t.p.weeks[3].sessions.filter(live).map(s=>obs(t.p,s));
 const r=evaluateProgram(t.p,{...review(t.p,3,{observations:[...wk,fix]}),actualLedger:t.ledger},opts);
 record('A2','correction before block-boundary step',r.action!=='RUN_QUALITY_GRADUATION'&&!(r.proposal?.canonical?.athlete?.runGraduation),
  'a same-review correction of a qualifying week to adverse prevents graduation',{result:summary(r),notYet:(r.disclosures??[]).filter(d=>d.id==='RUN_QUALITY_NOT_YET').map(d=>d.weeks)});
});

// A3: novice density released at the first boundary on executed evidence; the boundary week's strength reports are then corrected to adverse.
const NOV={id:'e-novice',strengthExperience:'NONE',goals:{run:'REGULAR',strength:'GENERAL'},equipment:['DUMBBELLS','BENCH'],schedule:{strengthDays:[0,2,4,5]},weeks:12};
guard('A3','stale-state / novice density',()=>{
 const t={p:program(NOV),ledger:[]};for(let w=0;w<5;w++)weekly(t,w);
 const released=t.p.stateTrace[5].strength.density?.capped===false,before=templateTypes(t.p,5);
 const fixes=obsFor(t,4,s=>s.sport==='STRENGTH').map(o=>correctionOf(o,structuredClone(o.actual),`${t.p.weeks[5].startDate}T05:00:00Z`,BAD));
 const r=evaluateProgram(t.p,{...review(t.p,5,{day:0,hour:'06:00:00',observations:fixes}),actualLedger:t.ledger},opts);
 const P2=r.proposal??t.p,after=templateTypes(P2,5);
 const h=A.historicalStateOf(P2,{asOf:`${t.p.weeks[5].startDate}T06:00:00Z`,actualLedger:r.actualLedger??t.ledger},opts);
 record('A3','stale-state / novice density',released&&/CORE/.test(after),
  'after the boundary week is corrected to adverse, the release evidence is gone: week 5 is planned under the cap again (planner and reducer agree)',
  {releasedBefore:released,week5Before:before,correctionReview:summary(r),week5After:after,plannerDensity:P2.stateTrace[5].strength.density??null,historicalDensity:h?.state?.strength?.density??null});
});

// A4: a strength-NONE athlete with two strength days (no cap needed) moves to four days in week 1, before the first block boundary.
guard('A4','state transition / novice density',()=>{
 const t={p:program({...NOV,id:'e-novice-2d',schedule:{strengthDays:[0,4]}}),ledger:[]};weekly(t,0);
 const r=evaluateProgram(t.p,{...review(t.p,1,{day:0,hour:'06:00:00',kind:'SCHEDULE_CHANGE',changes:{strengthDays:[0,2,4,5]}}),actualLedger:t.ledger},opts);
 const P2=r.proposal??t.p;
 record('A4','state transition / novice density',['2','3','4'].every(w=>/CORE/.test(templateTypes(P2,+w))),
  'B0-C08: strength class NONE keeps at most two full templates until the first block boundary, whatever the day count is changed to before it',
  {result:summary(r),week2:templateTypes(P2,2),week3:templateTypes(P2,3),week4:templateTypes(P2,4),noviceTemplates:!!P2.noviceTemplates,density:P2.stateTrace[2]?.strength?.density??null});
});

// A5/A6: familiar repeated bouts lapse after an interruption (B0-C02 c5) and are withdrawn after repeated adverse responses (c3); a later
// context change (schedule) re-plans from the PlanningView. Neither state may come back from the context.
const BOUTS_TASK={category:'VO2_STYLE',current:true,familiar:true,tolerated:true,observedAt:'2026-10-28',prescription:{modality:'RUN',family:'VO2_STYLE_INTERVALS',durationMinutes:40,warmupMinutes:12,cooldownMinutes:8,work:{repetitions:4,workMinutes:3,recoveryMinutes:2}},target:{method:'PACE',construct:'FIELD_SESSION_TARGET',paceSecondsPerKm:255,provenance:'Athlete report of the last three track sessions'},history:{sameTaskExposures:6,response:'TOLERATED'},conditions:{comparable:true}};
const BOUTS={id:'e-bouts',...RUN_ONLY,recent:{runDaysPerWeek:4,runMinutesPerWeek:180,longestRunMinutes:70},knownRuns:[BOUTS_TASK],schedule:{strengthDays:[],runDays:[1,3,5,6]},weeks:12};
const bouts=(p,from)=>p.weeks.slice(from).flatMap(w=>runs(p,w.index).filter(s=>s.prescription.family==='FAMILIAR_REPEATED_BOUTS').map(s=>s.id));
guard('A5','stale-state / familiar bouts lapse',()=>{
 const t=reviewed({...BOUTS,id:'e-bouts-lapse'},3);
 const ret=apply(t,evalAt(t,4,{day:3,kind:'RETURN_AFTER_PAUSE',interruption:{days:4,reasonCategory:'TRAVEL',nonclinical:true}}));
 weekly(t,4,{keep:s=>s.day>3});weekly(t,5);
 const sc=apply(t,evalAt(t,6,{day:0,hour:'06:00:00',kind:'SCHEDULE_CHANGE',changes:{runMinutes:65}}));
 const h=A.historicalStateOf(t.p,{asOf:`${t.p.weeks[7].startDate}T06:00:00Z`,actualLedger:t.ledger},opts);
 record('A5','stale-state / familiar bouts lapse',ret.action==='REESTABLISH'&&!bouts(t.p,6).length,
  'after an interruption the familiar status lapses; a later re-plan never brings the bouts back',
  {returnAction:ret.action,scheduleChange:summary(sc),boutsFromWeek6:bouts(t.p,6),lapsedInPlannerState:t.p.stateTrace.slice(6).map(s=>!!s.run.familiarBoutsLapsed),lapsedInHistory:h?.state?.run?.familiarBoutsLapsed??null});
});
guard('A6','stale-state / familiar bouts withdrawal',()=>{
 const t=reviewed({...BOUTS,id:'e-bouts-withdraw'},2);
 weekly(t,2,{o:s=>s.role==='QUALITY'?{response:BAD}:{}});weekly(t,3,{o:s=>s.role==='QUALITY'?{response:BAD}:{}});
 const withdrawnAt4=!bouts(t.p,4).slice(0,1).length;
 weekly(t,4);
 const sc=apply(t,evalAt(t,5,{day:0,hour:'06:00:00',kind:'SCHEDULE_CHANGE',changes:{runMinutes:65}}));
 record('A6','stale-state / familiar bouts withdrawal',withdrawnAt4&&!bouts(t.p,5).length,
  'withdrawn after repeated adverse responses; a later re-plan never brings the bouts back',{withdrawnAt4,scheduleChange:summary(sc),boutsFromWeek5:bouts(t.p,5)});
});

// A7: a configuration set aside for SKILL_MISMATCH must never come back: not offered again on its ladder, not accepted as a ladder step or a MAIN change.
const LAD={id:'e-ladder',equipment:FULL,goals:{run:'PERFORMANCE',strength:'STRENGTH'},rotation:'COACH_DECIDES',weeks:16};
guard('A7','stale-state / set-aside configuration',()=>{
 const t=reviewed(LAD,4);
 const step=apply(t,evalAt(t,4,{observations:t.p.weeks[4].sessions.filter(live).map(s=>obs(t.p,s)),choices:[{type:'LADDER_STEP',from:'goblet-squat',to:'back-squat'}]}));
 const usedBack=strengthIds(t.p,5).includes('back-squat');
 weekly(t,5);
 const sub=apply(t,evalAt(t,6,{day:1,kind:'EXERCISE_SUBSTITUTION',substitution:{exerciseId:'back-squat',reason:'SKILL_MISMATCH'}}));
 const after=strengthIds(t.p,7);
 for(let w=6;w<8;w++)weekly(t,w);
 const bIdx=t.p.blocks.find(b=>['BUILD','DEVELOPMENT','NEXT_BLOCK'].includes(b.family)&&b.startWeek>5)?.endWeekExclusive-1;
 const boundaryObs=t.p.weeks[8].sessions.filter(live).map(s=>obs(t.p,s));
 const offer=evaluateProgram(t.p,{...review(t.p,8,{observations:boundaryObs}),actualLedger:t.ledger},opts);
 const reoffered=(offer.offers??[]).filter(o=>o.to==='back-squat');
 const accept=evaluateProgram(t.p,{...review(t.p,8,{observations:boundaryObs,choices:[{type:'LADDER_STEP',from:'goblet-squat',to:'back-squat'}]}),actualLedger:t.ledger},opts);
 const main=evaluateProgram(t.p,{...review(t.p,8,{observations:boundaryObs,choices:[{type:'MAIN_CHANGE',from:'goblet-squat',to:'back-squat',reason:'ATHLETE_PREFERENCE'}]}),actualLedger:t.ledger},opts);
 const acceptedPlan=accept.proposal?strengthIds(accept.proposal,9):null,mainPlan=main.proposal?strengthIds(main.proposal,9):null;
 record('A7','stale-state / set-aside configuration',!reoffered.length&&accept.status!=='MODIFY'&&main.status!=='MODIFY',
  'back-squat, set aside for SKILL_MISMATCH, is never offered again and a ladder step or MAIN change to it is refused or asked',
  {ladderStep:step.action,usedBackSquatWeek5:usedBack,substitution:{...summary(sub),selected:sub.substitutions?.[0]?.selected},week7:after,boundaryWeek:8,blockEndWeek:bIdx,
   reoffered,acceptLadder:{...summary(accept),week9:acceptedPlan,recorded:(accept.proposal?.canonical?.athlete?.strengthSelections??[]).slice(-1)},
   acceptMain:{...summary(main),week9:mainPlan,recorded:(main.proposal?.canonical?.athlete?.strengthSelections??[]).slice(-1)}});
});

// A8: choice order at one boundary: a ladder step and a MAIN change of the same exercise, both orders; two MAIN changes of one exercise.
guard('A8','determinism / impossible combinations',()=>{
 const t=reviewed({...LAD,id:'e-order'},4);
 const boundaryObs=t.p.weeks[4].sessions.filter(live).map(s=>obs(t.p,s));
 const at=choices=>evaluateProgram(t.p,{...review(t.p,4,{observations:boundaryObs,choices}),actualLedger:t.ledger},opts);
 const L={type:'LADDER_STEP',from:'goblet-squat',to:'back-squat'},M={type:'MAIN_CHANGE',from:'goblet-squat',to:'leg-press',reason:'DELIBERATE_BLOCK_TRANSITION',purpose:'EQUIPMENT'},M2={type:'MAIN_CHANGE',from:'goblet-squat',to:'kb-goblet-squat',reason:'ATHLETE_PREFERENCE'};
 const lm=at([L,M]),ml=at([M,L]),mm=at([M,M2]),mm2=at([M2,M]);
 const view=r=>({...summary(r),week5Squat:r.proposal?strengthIds(r.proposal,5,e=>e.pattern==='SQUAT'):null,ladderReached:r.proposal?.canonical?.athlete?.ladderReached??null,selections:(r.proposal?.canonical?.athlete?.strengthSelections??[]).map(s=>`${s.from}->${s.to}:${s.reason}`)});
 record('A8','determinism / impossible combinations',lm.status===ml.status&&mm.status==='ASK'&&mm2.status==='ASK'&&lm.status==='ASK',
  'two changes of one exercise at one boundary are asked in either order (the same outcome whatever the order)',{ladderThenMain:view(lm),mainThenLadder:view(ml),mainThenMain2:view(mm),main2ThenMain:view(mm2)});
});

// A9: block choices sent in a mid-week review of the boundary week, and with another review kind at the boundary: refused or asked, not dropped.
guard('A9','impossible combinations / choices off the boundary step',()=>{
 const t=reviewed({...LAD,id:'e-midweek'},4);
 const mid=evaluateProgram(t.p,{...review(t.p,4,{day:2,hour:'06:00:00',observations:[],choices:[{type:'LADDER_STEP',from:'goblet-squat',to:'back-squat'}]}),actualLedger:t.ledger},opts);
 const missed=t.p.weeks[4].sessions.find(s=>live(s)&&s.sport==='RUN');
 const other=evaluateProgram(t.p,{...review(t.p,4,{kind:'MISSED_SESSION',targetSessionId:missed.id,observations:t.p.weeks[4].sessions.filter(s=>live(s)&&s.id!==missed.id).map(s=>obs(t.p,s)),choices:[{type:'MAIN_CHANGE',from:'goblet-squat',to:'leg-press',reason:'ATHLETE_PREFERENCE'}]}),actualLedger:t.ledger},opts);
 const bogus=evaluateProgram(t.p,{...review(t.p,4,{observations:t.p.weeks[4].sessions.filter(live).map(s=>obs(t.p,s)),choices:[{type:'LADDER_JUMP',from:'goblet-squat',to:'front-squat'}]}),actualLedger:t.ledger},opts);
 const notArray=evaluateProgram(t.p,{...review(t.p,4,{observations:t.p.weeks[4].sessions.filter(live).map(s=>obs(t.p,s)),choices:{type:'LADDER_STEP',from:'goblet-squat',to:'back-squat'}}),actualLedger:t.ledger},opts);
 const usedBack=r=>r.proposal?strengthIds(r.proposal,5).includes('back-squat')||strengthIds(r.proposal,5).includes('leg-press'):false;
 record('A9','impossible combinations / choices off the boundary step',[mid,other,bogus,notArray].every(r=>r.status==='ASK'||r.status==='HOLD'),
  'a block choice that cannot be applied in this review is refused or asked; it is never planned and never silently dropped',
  {midWeek:summary(mid),missedSessionKind:{...summary(other),applied:usedBack(other)},unknownChoiceType:{...summary(bogus),applied:usedBack(bogus)},choicesNotAList:{...summary(notArray),applied:usedBack(notArray)},anyPlanned:[mid,other,bogus,notArray].some(usedBack)});
});

done('a-state');
