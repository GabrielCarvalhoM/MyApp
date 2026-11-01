// Probe batch A2: follow-ups of batch A (controls and the natural paths of the A1, A3 and A8 observations). Read-only.
import {record,guard,done,program,reviewed,weekly,review,evaluateProgram,opts,FULL,runs,live,obs,addDays,BAD,correctionOf,strengthIds,templateTypes,qualityRuns,evalAt,apply,summary,A} from './lib.mjs';

const RUN_ONLY={goals:{run:'PERFORMANCE',strength:'NONE'},schedule:{strengthDays:[]}};
const GRAD={id:'e2-grad',...RUN_ONLY,runExperience:'NOVICE',recent:{runDaysPerWeek:3,runMinutesPerWeek:80,longestRunMinutes:35},schedule:{strengthDays:[],runMinutes:45},weeks:16};
const obsFor=(t,w,pred)=>t.ledger.filter(o=>!o.superseded&&t.p.weeks[w].sessions.some(s=>s.id===o.sessionId&&pred(s)));

// A1b: the same graduation, then a purely factual correction (no adverse response): week 3's long run actually lasted 10 minutes, which puts the
// week below the B0-C01 running threshold (60 executed minutes). Control: the identical correction in the boundary review itself refuses graduation.
guard('A1b','stale-state / correction (graduation)',()=>{
 const t=reviewed({...GRAD,id:'e2-grad-min'},3);const g=weekly(t,3);
 const longObs=obsFor(t,3,s=>s.role==='LONG')[0];
 const fix=correctionOf(longObs,{...structuredClone(longObs.actual),minutes:10},`${t.p.weeks[4].startDate}T05:00:00Z`);
 const r=evaluateProgram(t.p,{...review(t.p,4,{day:0,hour:'06:00:00',observations:[fix]}),actualLedger:t.ledger},opts);
 const P2=r.proposal??t.p;
 // Control: same facts known at the boundary review (week 3 reported with the 10-minute long run): no graduation.
 const c=reviewed({...GRAD,id:'e2-grad-min'},3);
 const ctl=evaluateProgram(c.p,{...review(c.p,3,{observations:c.p.weeks[3].sessions.filter(live).map(s=>obs(c.p,s,s.role==='LONG'?{minutes:10}:{}))}),actualLedger:c.ledger},opts);
 // Then the introduction week is executed and reviewed on the corrected record: does anything withdraw the graduation?
 const t2={p:P2,ledger:r.actualLedger??t.ledger};const w4=weekly(t2,4);
 record('A1b','stale-state / correction (graduation)',g.action==='RUN_QUALITY_GRADUATION'&&ctl.action!=='RUN_QUALITY_GRADUATION'&&!qualityRuns(t2.p,5).length,
  'the same facts give the same decision whichever review carries them: a correction that disqualifies a qualifying week withdraws (or re-asks) the graduation; no threshold session stays planned on it',
  {boundaryAction:g.action,controlSameFactsAtBoundary:{action:ctl.action,notYet:(ctl.disclosures??[]).filter(d=>d.id==='RUN_QUALITY_NOT_YET').map(d=>d.weeks)},
   correctionReview:summary(r),graduationKept:!!P2.canonical.athlete.runGraduation,qualityWeek4:qualityRuns(P2,4).map(s=>s.id),
   afterIntroductionWeekReview:{action:w4.action,graduationKept:!!t2.p.canonical.athlete.runGraduation,qualityWeek5:qualityRuns(t2.p,5).map(s=>s.id),qualityWeek6:qualityRuns(t2.p,6).map(s=>s.id)}});
});

// A3b: the natural path of the density reading. A strength-NONE athlete with four days executes weeks 0-3 (reviewed) and does not report or
// review the boundary week 4. In week 5, before any session, a decision re-plans the week (equipment window / substitution / schedule).
// B0-C08 c2: release needs executed evidence of the boundary week; without it the cap holds.
const NOV={id:'e2-novice',strengthExperience:'NONE',goals:{run:'REGULAR',strength:'GENERAL'},equipment:['DUMBBELLS','BENCH'],schedule:{strengthDays:[0,2,4,5]},weeks:12};
guard('A3b','stale-state / projected density release',()=>{
 const base=()=>{const t={p:program(NOV),ledger:[]};for(let w=0;w<4;w++)weekly(t,w);return t;};
 const t=base();
 // Week 4 runs are executed and reported but no strength session is (no evidence for the release), and no weekly review closes week 4.
 const runObs=t.p.weeks[4].sessions.filter(s=>live(s)&&s.sport==='RUN').map(s=>obs(t.p,s));
 const projected=t.p.stateTrace[5].strength.density;
 const variants={
  SCHEDULE_CHANGE:{kind:'SCHEDULE_CHANGE',changes:{strengthMinutes:55}},
  EXERCISE_SUBSTITUTION:{kind:'EXERCISE_SUBSTITUTION',substitution:{exerciseId:strengthIds(t.p,5).find(id=>id!=='dead-bug')??strengthIds(t.p,5)[0],reason:'NONCLINICAL_DISCOMFORT_OR_PREFERENCE',nonclinicalConfirmed:true}},
  EQUIPMENT_CHANGE:{kind:'EQUIPMENT_CHANGE',changes:{equipment:['DUMBBELLS','BENCH','BANDS']}}
 };
 const out={};
 for(const [k,x] of Object.entries(variants)){
  const r=evaluateProgram(t.p,{...review(t.p,5,{day:0,hour:'06:00:00',observations:runObs,...x}),actualLedger:t.ledger},opts);
  const P2=r.proposal??t.p,h=A.historicalStateOf(P2,{asOf:`${t.p.weeks[5].startDate}T06:00:00Z`,actualLedger:r.actualLedger??t.ledger},opts);
  out[k]={...summary(r),week5Templates:templateTypes(P2,5),week6Templates:templateTypes(P2,6),plannerDensityWeek5:P2.stateTrace[5]?.strength?.density??null,historyDensity:h?.state?.strength?.density??null};
 }
 // Control: the weekly review of week 4 with the same facts (no strength executed) keeps the cap.
 const c=base();const cw=weekly(c,4,{keep:s=>s.sport!=='STRENGTH'});
 record('A3b','stale-state / projected density release',Object.values(out).every(v=>/CORE/.test(v.week5Templates)),
  'without executed evidence of the boundary week, every decision plans week 5 under the novice cap (as the weekly review of the same facts does); the planner never starts from the projected release',
  {projectedDensityWeek5:projected,decisions:out,controlWeeklyReview:{action:cw.action,week5Templates:templateTypes(c.p,5),density:c.p.stateTrace[5].strength.density}});
});

// A8b: the consequence of the conflicting pair [LADDER_STEP goblet-squat -> back-squat, MAIN_CHANGE goblet-squat -> leg-press] (A8): the ladder step is
// recorded (ladderReached: back-squat) although the athlete never trains it. Does that unexecuted step make the HIGH-skill back squat admissible later?
const LAD={id:'e2-ladder',equipment:FULL,goals:{run:'PERFORMANCE',strength:'STRENGTH'},rotation:'COACH_DECIDES',weeks:16};
guard('A8b','impossible combinations / phantom ladder reach',()=>{
 const run=choices=>{const t=reviewed(LAD,4);apply(t,evalAt(t,4,{observations:t.p.weeks[4].sessions.filter(live).map(s=>obs(t.p,s)),choices}));weekly(t,5);
  const sub=evalAt(t,6,{day:1,kind:'EXERCISE_SUBSTITUTION',substitution:{exerciseId:'leg-press',reason:'NONCLINICAL_DISCOMFORT_OR_PREFERENCE',nonclinicalConfirmed:true,to:'back-squat'}});
  return {afterBoundary:{week5Squat:strengthIds(t.p,5,e=>e.pattern==='SQUAT'),ladderReached:t.p.canonical.athlete.ladderReached??[]},substitution:{...summary(sub),selected:sub.substitutions?.[0]?.selected??null,week7Squat:sub.proposal?strengthIds(sub.proposal,7,e=>e.pattern==='SQUAT'):null,backSquatRow:sub.proposal?.weeks[7]?.sessions.flatMap(s=>s.prescription?.exercises??[]).find(e=>e.id==='back-squat')?.instructions??null}};};
 const pair=run([{type:'LADDER_STEP',from:'goblet-squat',to:'back-squat'},{type:'MAIN_CHANGE',from:'goblet-squat',to:'leg-press',reason:'DELIBERATE_BLOCK_TRANSITION',purpose:'EQUIPMENT'}]);
 const control=run([{type:'MAIN_CHANGE',from:'goblet-squat',to:'leg-press',reason:'DELIBERATE_BLOCK_TRANSITION',purpose:'EQUIPMENT'}]);
 record('A8b','impossible combinations / phantom ladder reach',pair.substitution.status==='ASK',
  'a ladder step that was never applied or executed grants no HIGH-skill admissibility (B0-C07 c5; B0-C03 c2): back-squat stays inadmissible for an athlete not familiar with it',
  {conflictingPair:pair,controlMainChangeOnly:control});
});

done('a2-state');
