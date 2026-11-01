// R7B1-ENG-r2 judge probe J1u (the cycle moved the unrecognised-choices question after the facts): J1 with unrecognised choices only. Read-only; PROBE_ROOT=<tree> runs it on
// another runtime (e.g. a git archive of FREEZE-2) to label origin. For each case:
// - control: the same review without the choice; alone: the correction alone in a mid-week weekly review (the factual re-plan reference);
// - J1a (A5 carry): a review that records a correction moving the view never answers without the factual re-plan; an ASK carries exactly
//   the re-plan the correction alone gives for the sessions ahead;
// - J1b (clinical first): when the control routes to a human, the review with the choice also does, and proposes nothing;
// - J1c (path independence, no stale state): the ASK applied, then the same review again without the choice, gives the control's plan;
// - J1d (no resurrection): a later mid-week review with nothing new keeps that plan.
import {record,guard,done,program,reviewed,weekly,review,evaluateProgram,opts,live,addDays,BAD,correctionOf,apply,summary,A,LABEL} from './lib.mjs';

const NOV={id:'j1-novice',strengthExperience:'NONE',goals:{run:'REGULAR',strength:'GENERAL'},equipment:['DUMBBELLS','BENCH'],schedule:{strengthDays:[0,2,4,5]},weeks:12};
const GRAD={id:'j1-grad',goals:{run:'PERFORMANCE',strength:'NONE'},runExperience:'NOVICE',recent:{runDaysPerWeek:3,runMinutesPerWeek:80,longestRunMinutes:35},schedule:{strengthDays:[],runMinutes:45},weeks:16};
const obsFor=(t,w,pred)=>t.ledger.filter(o=>!o.superseded&&!o.correctionOf&&t.p.weeks[w].sessions.some(s=>s.id===o.sessionId&&pred(s)));
const aheadOf=(p,w,day)=>JSON.stringify(p.weeks.slice(w).map(x=>x.sessions.filter(s=>s.date>=day).map(s=>[s.id,s.status,s.prescription??null])));
const canon=p=>JSON.stringify({sel:(p.canonical.athlete.strengthSelections??[]).map(({decidedBy,...x})=>x),eq:p.canonical.athlete.equipment,win:p.canonical.equipmentWindows??[],sched:p.canonical.schedule,goals:p.canonical.goals,grad:p.canonical.athlete.runGraduation?{from:p.canonical.athlete.runGraduation.fromWeek}:null,withdrawn:(p.canonical.athlete.runGraduationWithdrawn??[]).length});
const CHOICES={unknown:[{type:'LADDER_JUMP',from:'goblet-squat',to:'front-squat'}],mixed:[{type:'LADDER_STEP',from:'goblet-squat',to:'kb-goblet-squat'},{type:'SOMETHING_ELSE'}],nullEntry:[null],ladder:[{type:'LADDER_STEP',from:'goblet-squat',to:'kb-goblet-squat'}],main:[{type:'MAIN_CHANGE',from:'goblet-squat',to:'box-squat-bodyweight',reason:'ATHLETE_PREFERENCE'}],decline:[{offer:'RUN_QUALITY_GRADUATION',decision:'DECLINE'}],accept:[{offer:'RUN_QUALITY_GRADUATION',decision:'ACCEPT'}]};

function scenarios(){
 const out=[];
 // A: strength novice; week 4 (the first block boundary) corrected to adverse in week 5: the cap holds again (factual re-plan of week 5 ahead).
 {const t0=reviewed(NOV,5),w=5,day=t0.p.weeks[5].startDate,at=`${day}T05:00:00Z`;
  const fixes=t=>obsFor(t,4,s=>s.sport==='STRENGTH').map(o=>correctionOf(o,structuredClone(o.actual),at,BAD));
  const sub=id=>t0.p.weeks[5].sessions.filter(s=>live(s)&&s.sport==='STRENGTH'&&s.date>day).flatMap(s=>s.prescription.exercises.filter(e=>e.role!=='PRACTICE').map(e=>e.id))[0]??'goblet-squat';
  const target=t0.p.weeks[5].sessions.find(s=>live(s)&&s.date>day);
  const kinds=[
   ['WEEKLY_REVIEW-midweek',{}],['LOCAL_FATIGUE',{kind:'LOCAL_FATIGUE',signals:{region:'UPPER'}}],['SYSTEMIC_FATIGUE',{kind:'SYSTEMIC_FATIGUE'}],['PARTIAL_SESSION',{kind:'PARTIAL_SESSION'}],
   ['RECOVERED',{kind:'RECOVERED'}],['UNDERPERFORMANCE',{kind:'UNDERPERFORMANCE'}],['MISSED_SESSION',{kind:'MISSED_SESSION',targetSessionId:target?.id}],
   ['UNAVAILABLE_DAY',{kind:'UNAVAILABLE_DAY',changes:{unavailableDates:[addDays(day,2)]}}],['SCHEDULE_CHANGE',{kind:'SCHEDULE_CHANGE',changes:{strengthDays:[0,2,4]}}],
   ['EQUIPMENT_CHANGE',{kind:'EQUIPMENT_CHANGE',changes:{equipment:['DUMBBELLS','BENCH','KETTLEBELL']}}],['EQUIPMENT_WINDOW',{kind:'EQUIPMENT_CHANGE',changes:{equipment:['DUMBBELLS'],from:addDays(day,7),to:addDays(day,13)}}],
   ['GOAL_CHANGE',{kind:'GOAL_CHANGE',changes:{goals:{strength:'HYPERTROPHY'}}}],
   ['SUBSTITUTION-pref',{kind:'EXERCISE_SUBSTITUTION',substitution:{exerciseId:sub(),reason:'NONCLINICAL_DISCOMFORT_OR_PREFERENCE',nonclinicalConfirmed:true}}],
   ['SUBSTITUTION-mismatch',{kind:'EXERCISE_SUBSTITUTION',substitution:{exerciseId:sub(),reason:'SKILL_MISMATCH'}}],
   ['SUBSTITUTION-pain',{kind:'EXERCISE_SUBSTITUTION',substitution:{exerciseId:sub(),reason:'SKILL_MISMATCH',pain:true}}],
   ['RETURN-clinical',{kind:'RETURN_AFTER_PAUSE',interruption:{days:2,reason:'Flu illness',nonclinical:true}}],
   ['DOUBLE_CONFLICT',{kind:'DOUBLE_CONFLICT',changes:{}}]];
  out.push({name:'A-strength-novice',t0,w,day,at,fixes,kinds,choices:['unknown','mixed','nullEntry']});}
 // B: run graduation; week 3 (a qualifying week) corrected in week 4: the graduation is withdrawn (factual state before any decision).
 {const t0=reviewed(GRAD,4),w=4,day=t0.p.weeks[4].startDate,at=`${day}T05:00:00Z`;
  const fixes=t=>obsFor(t,3,s=>s.role==='LONG').map(o=>correctionOf(o,structuredClone(o.actual),at,BAD));
  const kinds=[['WEEKLY_REVIEW-midweek',{}],['LOCAL_FATIGUE',{kind:'LOCAL_FATIGUE',signals:{region:'LOWER'}}],['SCHEDULE_CHANGE',{kind:'SCHEDULE_CHANGE',changes:{runMinutes:50}}],['GOAL_CHANGE',{kind:'GOAL_CHANGE',changes:{goals:{run:'REGULAR'}}}],['RETURN-clinical',{kind:'RETURN_AFTER_PAUSE',interruption:{days:2,reason:'Flu illness',nonclinical:true}}]];
  out.push({name:'B-graduation',t0,w,day,at,fixes,kinds,choices:['unknown','mixed']});}
 return out;
}

const cases=[],J1a=[],J1b=[],J1c=[],J1d=[];
for(const sc of scenarios())for(const [kn,kx] of sc.kinds)for(const cn of sc.choices)for(const withFix of [true,false])guard('J1-'+sc.name,'block-choice paths',()=>{
 const t=structuredClone(sc.t0),obs=withFix?sc.fixes(t):[],base={day:0,hour:'06:00:00',...kx,observations:obs};
 const ctl=evaluateProgram(t.p,{...review(t.p,sc.w,base),actualLedger:t.ledger},opts);
 const r=evaluateProgram(t.p,{...review(t.p,sc.w,{...base,choices:CHOICES[cn]}),actualLedger:t.ledger},opts);
 const alone=withFix?evaluateProgram(t.p,{...review(t.p,sc.w,{day:0,hour:'06:00:00',observations:obs}),actualLedger:t.ledger},opts):null;
 const recorded=(r.actualLedger??[]).some(o=>o.correctionOf);
 const x={scenario:sc.name,kind:kn,choice:cn,correction:withFix,control:{status:ctl.status,action:ctl.action,proposal:!!ctl.proposal},withChoice:{status:r.status,action:r.action,proposal:!!r.proposal,reason:String(r.reason??'').slice(0,140),recorded},alone:alone?{status:alone.status,action:alone.action,proposal:!!alone.proposal}:null};
 cases.push(x);
 // J1a: a correction that moves the view never leaves the review without its factual re-plan, whatever is asked.
 if(recorded&&alone?.proposal&&r.status!=='CLINICAL_HUMAN_REQUIRED'){
  const ok=!!r.proposal&&(r.status!=='ASK'||aheadOf(r.proposal,sc.w,sc.day)===aheadOf(alone.proposal,sc.w,sc.day));
  if(!ok)J1a.push({...x,note:r.proposal?'the question carries another plan than the factual re-plan':'the factual re-plan is dropped'});
 }
 // J1b: the clinical route comes first and proposes nothing.
 if(ctl.status==='CLINICAL_HUMAN_REQUIRED'&&(r.status!=='CLINICAL_HUMAN_REQUIRED'||r.proposal))J1b.push({...x,note:'the block-choice question pre-empts the clinical route'+(r.proposal?' and carries a prescription proposal':''),referencePending:r.referenceState?.pending?.status??null});
 // J1c/J1d: the question applied, then the same review again without the choice (the correction is already recorded) equals the control.
 if(r.status==='ASK'&&!['ASK','HOLD','UNSUPPORTED','CLINICAL_HUMAN_REQUIRED'].includes(ctl.status)&&ctl.proposal){
  const c=structuredClone(t);apply(c,r);
  const f=evaluateProgram(c.p,{...review(c.p,sc.w,{...base,observations:[]}),actualLedger:c.ledger},opts),fin=f.proposal??c.p;
  const same=aheadOf(fin,sc.w,sc.day)===aheadOf(ctl.proposal,sc.w,sc.day)&&canon(fin)===canon(ctl.proposal);
  if(!same)J1c.push({...x,followUp:{status:f.status,action:f.action,proposal:!!f.proposal},sameAhead:aheadOf(fin,sc.w,sc.day)===aheadOf(ctl.proposal,sc.w,sc.day),sameCanonical:canon(fin)===canon(ctl.proposal)});
  apply(c,f);const g=evaluateProgram(c.p,{...review(c.p,sc.w,{day:1,hour:'06:00:00',observations:[]}),actualLedger:c.ledger},opts);
  if(g.proposal&&aheadOf(g.proposal,sc.w,addDays(sc.day,2))!==aheadOf(c.p,sc.w,addDays(sc.day,2)))J1d.push({...x,later:{status:g.status,action:g.action}});
 }
});
const by=k=>Object.fromEntries(Object.entries(cases.reduce((m,c)=>{const key=c[k];(m[key]??=[]).push(c);return m;},{})).map(([key,v])=>[key,v.length]));
record('J1a','A5: the block-choice question keeps the factual re-plan',!J1a.length,'every review that records a correction moving the view proposes the factual re-plan; an ASK carries exactly the re-plan of the correction alone',{cases:cases.length,failures:J1a.length,examples:J1a.slice(0,8)});
record('J1b','clinical first on the block-choice path',!J1b.length,'when the same review without the choice routes to a human (substitution pain, clinical interruption), the review with the choice routes too and proposes nothing',{failures:J1b.length,examples:J1b.slice(0,8)});
record('J1c','path independence after the question (no stale state)',!J1c.length,'the question applied, then the same review again without the choice, gives the same plan and canonical facts as the review without the choice',{failures:J1c.length,examples:J1c.slice(0,8)});
record('J1d','no resurrection after the answer',!J1d.length,'a later mid-week review with nothing new keeps the corrected plan',{failures:J1d.length,examples:J1d.slice(0,5)});
record('J1-matrix','block-choice matrix (information)',true,'every case evaluated',{label:LABEL,cases:cases.length,byKind:by('kind'),statusWithChoice:by('withChoice'),all:cases.map(c=>`${c.scenario}|${c.kind}|${c.choice}|${c.correction?'fix':'nofix'}: ctl=${c.control.status}/${c.control.action}${c.control.proposal?'+P':''} r=${c.withChoice.status}/${c.withChoice.action}${c.withChoice.proposal?'+P':''}${c.alone?` alone=${c.alone.status}${c.alone.proposal?'+P':''}`:''}`)});
done('j1u-unrecognised-choices');
