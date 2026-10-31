// Recheck probes on the fix-cycle delta (FREEZE-1 -> FREEZE-2): new paths only. Read-only against the frozen runtime.
import {record,guard,done,program,reviewed,weekly,review,evaluateProgram,opts,FULL,rows,runs,live,obs,addDays,BAD,correctionOf,strengthIds,templateTypes,qualityRuns,evalAt,apply,summary,A,R,P} from './lib.mjs';

const obsFor=(t,w,pred)=>t.ledger.filter(o=>!o.superseded&&t.p.weeks[w].sessions.some(s=>s.id===o.sessionId&&pred(s)));
const aheadTypes=(p,w,day)=>p.weeks[w].sessions.filter(s=>s.sport==='STRENGTH'&&s.prescription&&s.date>day).map(s=>s.templateType).sort().join(',');
const NOV={id:'n-novice',strengthExperience:'NONE',goals:{run:'REGULAR',strength:'GENERAL'},equipment:['DUMBBELLS','BENCH'],schedule:{strengthDays:[0,2,4,5]},weeks:12};
const GRAD={id:'n-grad',goals:{run:'PERFORMANCE',strength:'NONE'},runExperience:'NOVICE',recent:{runDaysPerWeek:3,runMinutesPerWeek:80,longestRunMinutes:35},schedule:{strengthDays:[],runMinutes:45},weeks:16};

// N1: R7-A A5 on the new block-choice ASK paths. A mid-week review carries a correction that moves this week's PlanningView and a block choice
// (which cannot be applied mid-week). The question is asked; does the factual re-plan still come with it (as withFactualReplan does for every
// other question), and does a later review of the same week re-plan the sessions ahead from the corrected facts?
guard('N1','correction/retraction (A5) on the block-choice ASK path',()=>{
 const base=()=>{const t={p:program(NOV),ledger:[]};for(let w=0;w<5;w++)weekly(t,w);return t;};
 const fixesOf=t=>obsFor(t,4,s=>s.sport==='STRENGTH').map(o=>correctionOf(o,structuredClone(o.actual),`${t.p.weeks[5].startDate}T05:00:00Z`,BAD));
 const day0=t=>t.p.weeks[5].startDate;
 // Control: the correction alone.
 const c=base(),ctl=evaluateProgram(c.p,{...review(c.p,5,{day:0,hour:'06:00:00',observations:fixesOf(c)}),actualLedger:c.ledger},opts);
 // With a block choice in the same review.
 const t=base(),r=evaluateProgram(t.p,{...review(t.p,5,{day:0,hour:'06:00:00',observations:fixesOf(t),choices:[{type:'LADDER_STEP',from:'goblet-squat',to:'kb-goblet-squat'}]}),actualLedger:t.ledger},opts);
 const recorded=(r.actualLedger??[]).some(o=>o.correctionOf);
 apply(t,r);
 // The athlete answers the question by sending the same week's next mid-week review without the choice (no new observation).
 const f=evaluateProgram(t.p,{...review(t.p,5,{day:1,hour:'06:00:00',observations:[]}),actualLedger:t.ledger},opts);
 const after=f.proposal??t.p;
 const h=A.historicalStateOf(after,{asOf:`${addDays(day0(t),1)}T06:00:00Z`,actualLedger:f.actualLedger??t.ledger},opts);
 record('N1','correction/retraction (A5) on the block-choice ASK path',r.status==='ASK'&&!!r.proposal&&/CORE/.test(aheadTypes(r.proposal,5,day0(t))),
  'a review that asks about block choices still proposes the factual re-plan its correction requires (as the same correction alone does); the corrected facts never leave the sessions ahead planned from retracted evidence',
  {control:{...summary(ctl),week5Ahead:ctl.proposal?aheadTypes(ctl.proposal,5,day0(c)):null},withChoice:{...summary(r),proposal:!!r.proposal,correctionRecordedInLedger:recorded},
   followUpMidWeekReview:{...summary(f),proposal:!!f.proposal,week5AheadAfter:aheadTypes(after,5,addDays(day0(t),1)),plannerDensityWeek5:after.stateTrace[5]?.strength?.density??null,historyDensity:h?.state?.strength?.density??null}});
});
guard('N1b','correction/retraction (A5) on the block-choice ASK path (graduation)',()=>{
 const t=reviewed({...GRAD,id:'n-grad-ask'},3);weekly(t,3);
 const longObs=obsFor(t,3,s=>s.role==='LONG')[0],fix=correctionOf(longObs,structuredClone(longObs.actual),`${t.p.weeks[4].startDate}T05:00:00Z`,BAD);
 const r=evaluateProgram(t.p,{...review(t.p,4,{day:0,hour:'06:00:00',observations:[fix],choices:[{offer:'RUN_QUALITY_GRADUATION',decision:'DECLINE'}]}),actualLedger:t.ledger},opts);
 const q4=r.proposal?qualityRuns(r.proposal,4).map(s=>s.id):qualityRuns(t.p,4).map(s=>s.id);
 apply(t,r);const f=evaluateProgram(t.p,{...review(t.p,4,{day:0,hour:'07:00:00',observations:[]}),actualLedger:t.ledger},opts);
 record('N1b','correction/retraction (A5) on the block-choice ASK path (graduation)',r.status==='ASK'&&!!r.proposal&&!q4.length,
  'the withdrawal of a graduation whose qualifying week was corrected comes with the question, not only with a later review',
  {withChoice:{...summary(r),proposal:!!r.proposal,qualityWeek4:q4},followUp:{...summary(f),qualityWeek4After:f.proposal?qualityRuns(f.proposal,4).map(s=>s.id):null,withdrawn:!!f.proposal?.canonical?.athlete?.runGraduationWithdrawn}});
});

// N2: the novice cap started by a context change (QE-R7B-05) when the last two-day week is neither reviewed nor reported. The schedule change
// from week 2 is accepted in week 1; week 1 is skipped (no report, no review); on week 2 day 0 a decision re-plans week 2.
guard('N2','state transition / lazy density start',()=>{
 const make=()=>{const t={p:program({...NOV,id:'n-novice-2d',schedule:{strengthDays:[0,4]}}),ledger:[]};weekly(t,0);
  apply(t,evaluateProgram(t.p,{...review(t.p,1,{day:0,hour:'06:00:00',kind:'SCHEDULE_CHANGE',changes:{strengthDays:[0,2,4,5]}}),actualLedger:t.ledger},opts));return t;};
 const t=make(),plannedAfterChange=templateTypes(t.p,2);
 const out={};
 for(const [k,x] of Object.entries({EXERCISE_SUBSTITUTION:{kind:'EXERCISE_SUBSTITUTION',substitution:{exerciseId:strengthIds(t.p,2).find(id=>R.configurationOf(id)?.pattern==='SQUAT')??strengthIds(t.p,2)[0],reason:'NONCLINICAL_DISCOMFORT_OR_PREFERENCE',nonclinicalConfirmed:true}},EQUIPMENT_CHANGE:{kind:'EQUIPMENT_CHANGE',changes:{equipment:['DUMBBELLS','BENCH','BANDS']}}})){
  const r=evaluateProgram(t.p,{...review(t.p,2,{day:0,hour:'06:00:00',...x}),actualLedger:t.ledger},opts),P2=r.proposal??t.p;
  const h=A.historicalStateOf(P2,{asOf:`${t.p.weeks[2].startDate}T06:00:00Z`,actualLedger:r.actualLedger??t.ledger},opts);
  out[k]={...summary(r),week2:templateTypes(P2,2),week3:templateTypes(P2,3),plannerDensityWeek2:P2.stateTrace[2]?.strength?.density??null,historyDensity:h?.state?.strength?.density??null};
 }
 const c=make();const cw=weekly(c,1,{keep:()=>false});
 record('N2','state transition / lazy density start',Object.values(out).every(v=>/CORE/.test(v.week2)),
  'the cap a context change starts before the first block boundary applies to the first week of that context in every decision path (as the weekly review of week 1 gives)',
  {plannedAtTheChange:plannedAfterChange,decisionsInWeek2:out,controlWeeklyReviewOfWeek1:{action:cw.action,week2:templateTypes(c.p,2),density:c.p.stateTrace[2]?.strength?.density??null}});
});

// N3: the natural-pick replay when the recorded substitute no longer fits (QE-R7B-01 fallback). db-rdl is set aside for SKILL_MISMATCH (the plan
// prescribes kb-deadlift, its previous rung); the kettlebell then goes away (permanent change, and a dated travel window).
guard('N3','reason-based substitution / fallback after the substitute stops fitting',()=>{
 const o={id:'n-sub-eq',equipment:['DUMBBELLS','BENCH','KETTLEBELL'],goals:{run:'PERFORMANCE',strength:'GENERAL'},rotation:'FIXED',weeks:12};
 const out={};
 for(const variant of ['permanent','window']){
  const t=reviewed(o,3);
  const s=apply(t,evaluateProgram(t.p,{...review(t.p,3,{day:1,hour:'06:00:00',kind:'EXERCISE_SUBSTITUTION',substitution:{exerciseId:'db-rdl',reason:'SKILL_MISMATCH'}}),actualLedger:t.ledger},opts));
  const hinge=(p,w)=>[...new Set(p.weeks[w].sessions.filter(x=>live(x)&&x.sport==='STRENGTH').flatMap(x=>x.prescription.exercises.filter(e=>e.pattern==='HINGE'&&e.role==='MAIN').map(e=>e.id)))];
  const before=hinge(t.p,4);
  const ch=variant==='permanent'?{equipment:['DUMBBELLS','BENCH']}:{equipment:['DUMBBELLS','BENCH'],from:t.p.weeks[5].startDate,to:addDays(t.p.weeks[5].startDate,6)};
  const r=evaluateProgram(t.p,{...review(t.p,4,{day:0,hour:'06:00:00',kind:'EQUIPMENT_CHANGE',changes:ch}),actualLedger:t.ledger},opts),P2=r.proposal??t.p;
  const weeks=[4,5,6].map(w=>({week:w,hingeMain:hinge(P2,w)}));
  const above=new Set([...R.ladderNext('db-rdl'),...R.ladderNext('db-rdl').flatMap(R.ladderNext)]);
  out[variant]={substitution:{status:s.status,selected:s.substitutions?.[0]?.selected},week4BeforeChange:before,equipmentChange:{...summary(r),swaps:(r.substitutions??[]).map(x=>`${x.exerciseId}->${x.selected}`)},weeks,aboveSetAsideOnItsLadder:weeks.flatMap(x=>x.hingeMain.filter(id=>above.has(id)).map(id=>`w${x.week}:${id}`)),skillOfReplaced:R.configurationOf('db-rdl').skill};
 }
 const bad=Object.values(out).flatMap(v=>v.aboveSetAsideOnItsLadder);
 record('N3','reason-based substitution / fallback after the substitute stops fitting',!bad.length,
  'after "db-rdl cannot be done with steady technique", no later re-plan prescribes a rung above db-rdl on its own ladder (barbell-rdl, single-leg-rdl-db) in its place; without a fitting lower option it asks',out);
});

// N4: graduation stability (no false withdrawal): executed weeks after the graduation, with an adverse quality session and an unrelated correction.
guard('N4','graduation withdrawal: no false positive',()=>{
 const t=reviewed({...GRAD,id:'n-grad-stable'},3);weekly(t,3);
 const hist=[];
 for(let w=4;w<12;w++){
  const extra=w===6?{o:s=>s.role==='QUALITY'?{response:BAD}:{}}:{};
  if(w===8){const e=obsFor(t,7,s=>s.role==='EASY')[0];const fix=correctionOf(e,{...structuredClone(e.actual),minutes:(e.actual.minutes??20)+5},`${t.p.weeks[8].startDate}T05:00:00Z`);apply(t,evaluateProgram(t.p,{...review(t.p,8,{day:0,hour:'06:00:00',observations:[fix]}),actualLedger:t.ledger},opts));}
  const r=weekly(t,w,extra);hist.push({week:w,action:r.action,graduation:!!t.p.canonical.athlete.runGraduation,withdrawn:(t.p.canonical.athlete.runGraduationWithdrawn??[]).length});
 }
 record('N4','graduation withdrawal: no false positive',hist.every(x=>x.graduation&&!x.withdrawn),
  'a graduation whose qualifying weeks stand is never withdrawn by later executed weeks, a later adverse session or an unrelated correction',hist);
});

// N5: QE-R7B-01 residual, a wider grid: every substitution the runtime applies prescribes its selection in the replaced exercise's slots; for any
// that does not, is the slot's configuration a harder rung of the replaced one?
guard('N5','reason-based substitution / decision vs plan (wider grid)',()=>{
 const grid=[];
 for(const [strength,eq,days] of [['GENERAL',['DUMBBELLS','BENCH','KETTLEBELL'],[0,4]],['STRENGTH',FULL,[0,2,4]],['HYPERTROPHY',['KETTLEBELL','BANDS'],[0,4]],['RUNNING_SUPPORT',[],[0,4]],['HYPERTROPHY',FULL,[0,1,3,4]],['GENERAL',['MACHINES','DUMBBELLS'],[0,2,4]],['STRENGTH',['DUMBBELLS','BENCH'],[0,1,3,4]],['HYPERTROPHY',['DUMBBELLS','BENCH','BANDS','PULL_UP_BAR'],[0,2,4]],['GENERAL',['BANDS','PULL_UP_BAR'],[0,2,4]],['RUNNING_SUPPORT',['DUMBBELLS','KETTLEBELL'],[0,1,3,4]]])
  grid.push({id:`n5-${strength}-${eq.length}-${days.length}`,equipment:eq,goals:{run:'PERFORMANCE',strength},rotation:'FIXED',weeks:12,schedule:{strengthDays:days}});
 let applied=0;const bad=[];
 for(const o of grid){
  const t=reviewed(o,3);
  for(const id of [...new Set(strengthIds(t.p,4,e=>e.role!=='PRACTICE'))])for(const reason of ['SKILL_MISMATCH','NONCLINICAL_DISCOMFORT_OR_PREFERENCE']){
   const r=evaluateProgram(t.p,{...review(t.p,3,{day:1,hour:'06:00:00',kind:'EXERCISE_SUBSTITUTION',substitution:{exerciseId:id,reason,...(reason!=='SKILL_MISMATCH'?{nonclinicalConfirmed:true}:{})}}),actualLedger:t.ledger},opts);
   if(r.status!=='MODIFY')continue;applied++;
   const sel=r.substitutions?.[0]?.selected,pat=R.configurationOf(id).pattern;
   for(const s of t.p.weeks[4].sessions.filter(x=>live(x)&&x.sport==='STRENGTH')){const old=s.prescription.exercises.find(e=>e.id===id);if(!old)continue;
    const nw=r.proposal.weeks[4].sessions.find(x=>x.id===s.id),now=(nw?.prescription?.exercises??[]).filter(e=>e.pattern===pat&&e.role===old.role).map(e=>e.id);
    if(!now.includes(sel)){const above=new Set([...R.ladderNext(id),...R.ladderNext(id).flatMap(R.ladderNext)]);bad.push({program:o.id,replaced:id,reason,selected:sel,slotRole:old.role,prescribed:now,selectedAlsoInSession:(nw?.prescription?.exercises??[]).some(e=>e.id===sel),skill:{replaced:R.configurationOf(id).skill,prescribed:now.map(x=>R.configurationOf(x)?.skill)},harderRung:now.some(x=>above.has(x))});}}
  }
 }
 record('N5','reason-based substitution / decision vs plan (wider grid)',!bad.length,
  'every applied substitution prescribes its selection in the replaced exercise\'s slot (the decision text is what the plan does)',{programs:grid.length,applied,inconsistent:bad.length,harderRung:bad.filter(x=>x.harderRung).length,examples:bad.slice(0,8)});
});

// N6: a graduation offer answer sent with a complete weekly review that is not a block boundary.
guard('N6','block choices off the boundary (graduation answer)',()=>{
 const t=reviewed({...GRAD,id:'n-decline'},1);
 const r=evaluateProgram(t.p,{...review(t.p,1,{observations:t.p.weeks[1].sessions.filter(live).map(s=>obs(t.p,s)),choices:[{offer:'RUN_QUALITY_GRADUATION',decision:'DECLINE'}]}),actualLedger:t.ledger},opts);
 record('N6','block choices off the boundary (graduation answer)',r.status==='ASK',
  'an answer to an offer that is not open (no block boundary) is asked, not dropped (QE-R7B-08 rule: block choices only at the boundary step)',{...summary(r)});
});

done('n-delta');
