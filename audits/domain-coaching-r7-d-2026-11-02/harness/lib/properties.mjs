// R7-D automated property oracles (P01–P14 as pre-registered in PREREGISTRATION_R7D.md). Each one reads only the case inputs, the decisions the
// runtime returned and two bound authorities read as data: the policy's single-run ceiling (operational.run.singleRunCeiling,
// operational.return.entryRunMinutes) and the R7B0-CATALOG-2 configurations. Results per case: PASS / FAIL / NOT_EVALUABLE / NOT_APPLICABLE,
// with every unit counted. Never imports the runtime.
import {addDays,dayGap,localDate,canonicalJson} from './util.mjs';
import {live} from './client.mjs';

export const PROPERTY_META={
 P01:{name:'Clinical first',type:'AUTOMATED',blocking:'SAFETY_BLOCKER'},
 P02:{name:'Eligibility and scope',type:'AUTOMATED',blocking:'SAFETY_BLOCKER'},
 P03:{name:'Unknown is neither executed nor zero',type:'AUTOMATED',blocking:'GENERALIZATION_BLOCKER (SAFETY_BLOCKER when a dose rises)'},
 P04:{name:'Validity is marked',type:'AUTOMATED',blocking:'SAFETY_BLOCKER'},
 P05:{name:'Carrier independence',type:'AUTOMATED (metamorphic)',blocking:'GENERALIZATION_BLOCKER (SAFETY_BLOCKER above the ceiling, race touch or taper quality)'},
 P06:{name:'Single-run ceiling (D18)',type:'AUTOMATED',blocking:'SAFETY_BLOCKER'},
 P07:{name:'Phase preserved near the race',type:'AUTOMATED + DOMAIN_JUDGED (completion race)',blocking:'SAFETY_BLOCKER'},
 P08:{name:'Return never above executed and tolerated',type:'AUTOMATED (run) + DOMAIN_JUDGED (strength, identity)',blocking:'SAFETY_BLOCKER'},
 P09:{name:'Progression earned',type:'AUTOMATED (gate evidence) + DOMAIN_JUDGED (step size)',blocking:'GENERALIZATION_BLOCKER'},
 P10:{name:'History',type:'AUTOMATED',blocking:'GENERALIZATION_BLOCKER'},
 P11:{name:'Repertoire',type:'AUTOMATED',blocking:'GENERALIZATION_BLOCKER (SAFETY_BLOCKER outside eligibility)'},
 P12:{name:'Hybrid composition',type:'AUTOMATED (days, turns) + DOMAIN_JUDGED (interference)',blocking:'GENERALIZATION_BLOCKER'},
 P13:{name:'Determinism and equivalences',type:'AUTOMATED (metamorphic + record clock)',blocking:'GENERALIZATION_BLOCKER (DIRECT_RUNTIME_DELTA)'},
 P14:{name:'Learning inside its envelope',type:'AUTOMATED (consent) + metamorphic',blocking:'GENERALIZATION_BLOCKER'}
};
const PENDING=['ASK','HOLD','UNSUPPORTED','CLINICAL_HUMAN_REQUIRED'];
const VALID='VALID_WITHIN_CURRENT_BOUNDED_SCOPE',RECON='REQUIRES_RECONCILIATION';
const FLAGS=['pain','persistentPain','injury','illness','functionalLimitation','clinicalConcern'];
const yes=v=>v===true||['TRUE','YES','Y','SIM','1'].includes(String(v).trim().toUpperCase());
export const CLINICAL_CATEGORIES=['ILLNESS','INJURY','PAIN','MEDICAL','SURGERY','PREGNANCY','POSTPARTUM','CLINICAL'];
const RUN_FAMILY_TO_CATALOG={WALK:'RUN.WALK',WALK_JOG:'RUN.WALK_JOG',EASY:'RUN.EASY',LONG:'RUN.LONG',THRESHOLD:'RUN.THRESHOLD',TEN_K_SPECIFIC:'RUN.EVENT_SPECIFIC',HALF_MARATHON_SPECIFIC:'RUN.EVENT_SPECIFIC',RACE_TOUCH:'RUN.RACE_TOUCH',RACE:'RUN.RACE',FAMILIAR_REPEATED_BOUTS:'RUN.FAMILIAR_REPEATED_BOUTS',SHAKEOUT:'RUN.EASY',RECOVERY_EASY:'RUN.EASY'};
const SKILL_RANK={LOW:0,MODERATE:1,HIGH:2};

function prop(id){return {id,...PROPERTY_META[id],units:0,violations:[],notEvaluable:[],observations:[]};}
const unit=(p,ok,v)=>{p.units++;if(!ok)p.violations.push(v);};
function finish(p){p.result=p.violations.length?'FAIL':p.units?'PASS':p.notEvaluable.length?'NOT_EVALUABLE':'NOT_APPLICABLE';return p;}

export function classifyEligibility(el){
 if(!el||typeof el!=='object')return 'UNKNOWN';
 const status=typeof el.status==='string'?el.status.trim().toUpperCase():el.status;
 if(FLAGS.some(k=>yes(el[k]))||['CLINICAL','PAIN_OR_INJURY'].includes(status))return 'CLINICAL';
 if(status!=='NONCLINICAL_CONFIRMED'||FLAGS.some(k=>typeof el[k]!=='boolean')||typeof el.assessedAt!=='string')return 'UNKNOWN';
 return 'CONFIRMED';
}
export function scopeOf(intake){
 const a=intake?.athlete??{},ev=a.event??(typeof a.goals?.run==='object'?a.goals.run.event:null);
 const special=(Array.isArray(a.specialPopulation)?a.specialPopulation:a.specialPopulation?[a.specialPopulation]:[]).map(x=>String(x).toUpperCase());
 if(ev&&ev.kind&&!['10K','HALF_MARATHON'].includes(String(ev.kind).toUpperCase()))return 'OUT_OF_SCOPE_EVENT';
 if(Number.isFinite(a.ageYears)&&a.ageYears<18)return 'OUT_OF_SCOPE_AGE';
 if(special.some(x=>['PREGNANCY','POSTPARTUM','ELITE','ADOLESCENT'].includes(x)))return 'OUT_OF_SCOPE_POPULATION';
 return 'IN_SCOPE';
}
/** Plans in force: the generated program, then the plan after each decision. */
function plans(trace){
 const out=[];
 if(trace.generation?.program)out.push({at:'GENERATE',stepIndex:-1,plan:trace.generation.program,valid:true,asOfLocal:trace.intake?.asOf??null});
 trace.steps.forEach((s,i)=>out.push({at:s.stepId,stepIndex:i,plan:s.planAfter,valid:s.result.planValidity?.status===VALID,asOfLocal:s.asOfLocal,step:s}));
 return out;
}
const ledgerAt=(trace,i)=>i<0?[]:(trace.steps[i].result.actualLedger??trace.steps[i].ledgerBefore??[]);
function sentObservations(trace,upTo){
 const m=new Map();
 for(let i=0;i<=upTo&&i<trace.steps.length;i++)for(const o of trace.steps[i].review.observations??[])m.set(o.eventId,o);
 return m;
}

// ---------- P01 clinical first ----------
function p01(trace){
 const p=prop('P01');
 if(trace.generation?.status==='CLINICAL_HUMAN_REQUIRED')unit(p,!trace.generation.program,{at:'GENERATE',issue:'PROGRAM_WITH_CLINICAL_ROUTE'});
 for(const s of trace.steps){
  const r=s.result;
  if(r.status==='CLINICAL_HUMAN_REQUIRED')unit(p,!r.proposal&&r.planValidity?.status===RECON,{at:s.stepId,issue:'PRESCRIPTION_WITH_CLINICAL_ROUTE',proposal:!!r.proposal,validity:r.planValidity?.status});
  if(s.refBefore?.pending?.status==='CLINICAL_HUMAN_REQUIRED'&&!s.clearance)unit(p,r.status==='CLINICAL_HUMAN_REQUIRED'&&!r.proposal,{at:s.stepId,issue:'CLINICAL_ROUTE_NOT_STICKY',status:r.status});
 }
 return finish(p);
}
// ---------- P02 eligibility and scope ----------
function p02(trace){
 const p=prop('P02'),g=trace.generation,intake=trace.intake;
 if(g){
  const cls=classifyEligibility(intake?.athlete?.eligibility),scope=scopeOf(intake);
  if(cls!=='CONFIRMED'||scope!=='IN_SCOPE'){
   unit(p,g.status!=='PROPOSED',{at:'GENERATE',issue:'PRESCRIBED_DESPITE_'+(cls!=='CONFIRMED'?cls:scope),status:g.status});
   const expected=cls==='CLINICAL'?['CLINICAL_HUMAN_REQUIRED',...(scope!=='IN_SCOPE'?['UNSUPPORTED']:[])]:scope!=='IN_SCOPE'?['UNSUPPORTED',...(cls==='UNKNOWN'?['ASK']:[])]:['ASK'];
   unit(p,expected.includes(g.status),{at:'GENERATE',issue:'ROUTE_MISMATCH',eligibility:cls,scope,expected,status:g.status});
  }
 }
 for(const s of trace.steps){
  if(s.refBefore?.pending?.status==='CLINICAL_HUMAN_REQUIRED'&&!s.clearance)continue; // P01 owns a standing clinical route
  const r=s.result,cls=classifyEligibility(s.review.eligibility);
  if(cls==='CLINICAL')unit(p,r.status==='CLINICAL_HUMAN_REQUIRED'&&!r.proposal,{at:s.stepId,issue:'CLINICAL_FLAG_NOT_ROUTED',status:r.status});
  else if(cls==='UNKNOWN')unit(p,r.planValidity?.status!==VALID&&r.status!=='CLINICAL_HUMAN_REQUIRED',{at:s.stepId,issue:r.status==='CLINICAL_HUMAN_REQUIRED'?'UNKNOWN_READ_AS_CLINICAL':'UNKNOWN_ELIGIBILITY_VALID_PLAN',status:r.status});
  if(cls!=='CONFIRMED')continue;
  const i=s.review.interruption;
  if(i&&(CLINICAL_CATEGORIES.includes(String(i.reasonCategory??'').toUpperCase())||i.clinicalReason===true)){
   if(s.kind==='RETURN_AFTER_PAUSE')unit(p,r.status==='CLINICAL_HUMAN_REQUIRED'&&!r.proposal,{at:s.stepId,issue:'CLINICAL_BREAK_NOT_ROUTED',status:r.status});
   else unit(p,r.planValidity?.status!==VALID,{at:s.stepId,issue:'CLINICAL_BREAK_VALID_PLAN',status:r.status});
  }
  const sub=s.review.substitution;
  if(sub&&(yes(sub.pain)||yes(sub.injury)))unit(p,r.status==='CLINICAL_HUMAN_REQUIRED'&&!r.proposal,{at:s.stepId,issue:'PAINFUL_SUBSTITUTION_NOT_ROUTED',status:r.status});
 }
 return finish(p);
}
// ---------- P03 unknown is neither executed nor zero ----------
function p03(trace,ctx){
 const p=prop('P03');
 trace.steps.forEach((s,i)=>{
  const sent=sentObservations(trace,i),ledger=s.result.actualLedger;
  if(Array.isArray(ledger))for(const row of ledger){
   const ids=[row.eventId,...Object.keys(row.provenance?.inputHashes??{})],src=ids.map(id=>sent.get(id)).find(Boolean);
   unit(p,!!src,{at:s.stepId,issue:'RECORD_ROW_WITHOUT_REPORT',eventId:row.eventId,sessionId:row.sessionId});
   if(src&&!row.superseded)unit(p,src.actual?.completed===row.actual?.completed||sent.get(row.eventId)?.actual?.completed===row.actual?.completed,{at:s.stepId,issue:'COMPLETED_FLAG_CHANGED',eventId:row.eventId});
  }
  // A review never credits a week's role it has no report of.
  if(s.kind==='WEEKLY_REVIEW'&&s.result.gates){
   const rows=(ledger??s.ledgerBefore??[]).filter(r=>!r.superseded&&(r.context?.weekIndex??weekOfSession(r.sessionId))===s.weekIndex);
   for(const [key,gate] of Object.entries(s.result.gates)){
    if(!['ADVANCE','EARNED'].includes(gate))continue;
    const reported=rows.some(r=>r.context?.role===key||(r.actual?.exercises??[]).some(e=>e.id===key)||r.context?.sessionType?.endsWith(':'+key));
    unit(p,reported,{at:s.stepId,issue:'CREDIT_WITHOUT_REPORT',key,gate,week:s.weekIndex});
   }
  }
  // (d) A VALID plan never rests a run dose on unknown training: when the dose window of a week holds no completed run (record, intake,
  // demonstration) while elapsed planned runs in it have no report and no declared break, the dose depends on unknown training and the
  // coach asks (SSCTR-SD-R7C-r2: neither credit nor zero). Walk/jog, restart and return weeks follow their own recipe (C7 CC-F05; ceiling
  // re-plan scope) and are not checked here.
  if(s.result.planValidity?.status===VALID&&ctx?.policy){
   const breaks=trace.steps.slice(0,i+1).map(x=>x.review.interruption).filter(b=>b&&typeof b.startDate==='string').map(b=>({from:b.startDate,to:typeof b.endDate==='string'?b.endDate:s.asOfLocal}));
   const reported=new Set((ledger??s.ledgerBefore??[]).map(r=>r.sessionId));
   const targets=[s.weekIndex,...(s.kind==='WEEKLY_REVIEW'&&s.asOfLocal>=addDays(s.planAfter.weeks[s.weekIndex].startDate,6)?[s.weekIndex+1]:[])];
   for(const k of targets){
    const wk=s.planAfter.weeks[k];if(!wk)continue;
    const mode=s.planAfter.stateTrace?.[k]?.run?.mode;
    if(['WALK_JOG','RESTART','RETURN'].includes(mode))continue;
    if(!wk.sessions.some(x=>capped(x)&&(k>s.weekIndex||x.date>=s.asOfLocal)))continue;
    if(ceilingFor(trace,i,wk.startDate,ctx.policy))continue;
    const C=ctx.policy.operational.run.singleRunCeiling,from=addDays(wk.startDate,-C.windowDays);
    const unknown=s.planBefore.weeks.flatMap(w=>w.sessions).filter(x=>capped(x)&&x.date>=from&&x.date<wk.startDate&&x.date<s.asOfLocal&&!reported.has(x.id)&&!breaks.some(b=>x.date>=b.from&&x.date<=b.to)).map(x=>x.id);
    unit(p,unknown.length===0,{at:s.stepId,issue:'RUN_DOSE_PLANNED_ON_UNKNOWN_TRAINING',week:k,mode:mode??null,unreported:unknown.slice(0,6),count:unknown.length});
   }
  }
  const q=s.result.question;
  if(q?.kind==='UNREPORTED_TRAINING'){
   const reported=new Set((ledger??s.ledgerBefore??[]).filter(r=>!r.superseded).map(r=>r.sessionId));
   const asked=q.unreported?.sessionIds??[];
   unit(p,asked.every(id=>!reported.has(id)),{at:s.stepId,issue:'QUESTION_ASKS_ABOUT_REPORTED_SESSION',sessions:asked.filter(id=>reported.has(id))});
  }
 });
 return finish(p);
}
const weekOfSession=id=>{const m=/^w(\d+)-/.exec(String(id));return m?Number(m[1]):null;};
// ---------- P04 validity is marked ----------
function p04(trace){
 const p=prop('P04');
 for(const s of trace.steps){
  const r=s.result,pendingish=PENDING.includes(r.status)||!!r.question||!!r.referenceState?.pending;
  if(pendingish)unit(p,r.planValidity?.status===RECON,{at:s.stepId,issue:'PENDING_BUT_VALID',status:r.status,question:r.question?.kind??null});
  else if(r.planValidity?.status!==VALID)p.observations.push({at:s.stepId,issue:'RECONCILIATION_WITHOUT_PENDING',status:r.status});
 }
 return finish(p);
}
// ---------- P06 single-run ceiling ----------
function runRefs(trace,stepIndex){
 const refs=[],a=trace.intake?.athlete??{},tz=trace.intake?.timezoneOffsetMinutes??0;
 if(Number.isFinite(a.recent?.longestRunMinutes)&&trace.intake?.asOf)refs.push({date:trace.intake.asOf,minutes:a.recent.longestRunMinutes,source:'INTAKE_LONGEST'});
 for(const k of a.knownRuns??[])if(k?.current!==false&&k?.tolerated!==false&&Number.isFinite(k?.prescription?.durationMinutes)&&typeof k.observedAt==='string')refs.push({date:k.observedAt.slice(0,10),minutes:k.prescription.durationMinutes,source:'KNOWN_RUN'});
 for(const h of trace.intake?.history??[])if(h?.sport==='RUN'&&Number.isFinite(h.durationMinutes)&&typeof h.startedAt==='string')refs.push({date:localDate(h.startedAt,tz),minutes:h.durationMinutes,source:'HISTORY'});
 for(let i=0;i<=stepIndex;i++){const d=trace.steps[i].review.currentDemonstration;if(d&&d.sport==='RUN'&&d.completed!==false&&Number.isFinite(d.minutes)&&typeof d.observedAt==='string')refs.push({date:localDate(d.observedAt,tz),minutes:d.minutes,source:'DEMONSTRATION'});}
 for(const r of ledgerAt(trace,stepIndex)){
  if(r.superseded||r.actual?.completed!==true||r.context?.sport!=='RUN')continue;
  const minutes=r.context?.family==='WALK_JOG'&&Number.isFinite(r.context?.runMinutes)?r.context.runMinutes:r.actual?.minutes;
  if(Number.isFinite(minutes)&&typeof r.localDate==='string')refs.push({date:r.localDate,minutes,source:'RECORD'});
 }
 return refs;
}
export function ceilingFor(trace,stepIndex,weekStart,policy){
 const C=policy.operational.run.singleRunCeiling,from=addDays(weekStart,-C.windowDays),to=addDays(weekStart,-1);
 const inWindow=runRefs(trace,stepIndex).filter(r=>r.date>=from&&r.date<=to);
 if(!inWindow.length)return null;
 const best=inWindow.reduce((a,b)=>b.minutes>a.minutes?b:a);
 return {ceiling:best.minutes+C.stepMinutes,reference:best};
}
const capped=s=>live(s)&&s.sport==='RUN'&&s.role!=='RACE'&&!['WALK','WALK_JOG'].includes(s.prescription?.family)&&Number.isFinite(s.prescription?.durationMinutes);
function p06(trace,ctx){
 const p=prop('P06'),policy=ctx.policy;
 const check=(at,stepIndex,plan,week,fromDate)=>{
  const w=plan.weeks[week];if(!w)return;
  const runs=w.sessions.filter(s=>capped(s)&&(!fromDate||s.date>=fromDate));
  if(!runs.length)return;
  const c=ceilingFor(trace,stepIndex,w.startDate,policy);
  if(!c){p.notEvaluable.push({at,week,reason:'NO_RUN_REFERENCE_IN_WINDOW'});return;}
  for(const s of runs)unit(p,s.prescription.durationMinutes<=c.ceiling,{at,week,sessionId:s.id,role:s.role,minutes:s.prescription.durationMinutes,ceiling:c.ceiling,reference:c.reference});
 };
 if(trace.generation?.program)check('GENERATE',-1,trace.generation.program,0,null);
 trace.steps.forEach((s,i)=>{
  if(s.result.planValidity?.status!==VALID)return;
  check(s.stepId,i,s.planAfter,s.weekIndex,s.asOfLocal);
  if(s.kind==='WEEKLY_REVIEW'&&s.asOfLocal>=addDays(s.planAfter.weeks[s.weekIndex].startDate,6))check(s.stepId,i,s.planAfter,s.weekIndex+1,null);
 });
 return finish(p);
}
// ---------- P07 phase near the race ----------
function raceDateTimeline(trace){
 const a=trace.intake?.athlete??{},ev=a.event??(typeof a.goals?.run==='object'?a.goals.run.event:null);
 let date=ev?.date??null,changed=false;const at=[{stepIndex:-1,date,changed}];
 trace.steps.forEach((s,i)=>{
  const ch=s.review.changes??{};
  if(s.kind==='EVENT_DATE_CHANGE'&&typeof ch.eventDate==='string'){date=ch.eventDate;changed=true;}
  if(s.kind==='GOAL_CHANGE'){const g=ch.goals?.run,e=ch.event??(typeof g==='object'?g.event:null);if(e?.date){date=e.date;changed=true;}else if(g&&(typeof g==='string'||g.kind!=='RACE')){date=null;changed=true;}}
  at.push({stepIndex:i,date,changed});
 });
 return at;
}
function p07(trace,ctx){
 const p=prop('P07'),g=trace.generation?.program,E=ctx.policy.operational.event;
 if(!g)return finish(p);
 // Race-window strength dose (policy operational.event; SSCTR D54): in race week and post-event weeks every strength row is at most the
 // phase's sets with at least its reps in reserve, and race-week strength stays the stated number of days before the race.
 for(const x of plans(trace)){
  if(x.at!=='GENERATE'&&!x.valid)continue;
  const race=raceDateTimeline(trace)[x.stepIndex+1]?.date??null;
  for(const w of x.plan.weeks){
   if(!['RACE_WEEK','POST_EVENT'].includes(w.phase))continue;
   const maxSets=w.phase==='RACE_WEEK'?E.raceWeekStrengthSets:E.postEventStrengthSets;
   for(const s of w.sessions.filter(s=>live(s)&&s.sport==='STRENGTH'&&(x.stepIndex<0||s.date>=x.asOfLocal))){
    for(const e of s.prescription.exercises??[])unit(p,e.sets<=maxSets&&(!Number.isFinite(e.rir)||e.rir>=E.raceWeekStrengthMinimumRir),{at:x.at,issue:'RACE_WINDOW_STRENGTH_ABOVE_PHASE_DOSE',week:w.index,phase:w.phase,sessionId:s.id,exercise:e.id,sets:e.sets,rir:e.rir,phaseDose:{sets:maxSets,minimumRir:E.raceWeekStrengthMinimumRir}});
    if(w.phase==='RACE_WEEK'&&race&&s.date<=race)unit(p,dayGap(s.date,race)>=E.raceWeekStrengthMinDaysBeforeRace,{at:x.at,issue:'RACE_WEEK_STRENGTH_TOO_CLOSE_TO_RACE',sessionId:s.id,date:s.date,race});
   }
  }
 }
 const timeline=raceDateTimeline(trace),genTaper=g.weeks.filter(w=>w.phase==='TAPER').map(w=>w.index),genPost=g.weeks.filter(w=>w.phase==='POST_EVENT').map(w=>w.index);
 for(const x of plans(trace)){
  if(x.at!=='GENERATE'&&!x.valid)continue;
  const t=timeline[x.stepIndex+1];if(!t?.date)continue;
  const k=Math.floor(dayGap(x.plan.startDate,t.date)/7),w=x.plan.weeks[k];
  if(!w)continue;
  unit(p,w.phase==='RACE_WEEK',{at:x.at,issue:'RACE_WEEK_PHASE_LOST',week:k,phase:w.phase});
  unit(p,w.sessions.some(s=>s.sport==='RUN'&&s.role==='RACE'&&s.date===t.date&&live(s)),{at:x.at,issue:'RACE_SESSION_MISSING',date:t.date});
  if(!t.changed){
   for(const ti of genTaper)unit(p,x.plan.weeks[ti]?.phase==='TAPER',{at:x.at,issue:'TAPER_REPLACED',week:ti,phase:x.plan.weeks[ti]?.phase});
   for(const pi of genPost)unit(p,x.plan.weeks[pi]?.phase==='POST_EVENT',{at:x.at,issue:'POST_EVENT_REPLACED',week:pi,phase:x.plan.weeks[pi]?.phase});
  }
 }
 return finish(p);
}
// ---------- P08 return ----------
function p08(trace){
 const p=prop('P08'),tz=trace.intake?.timezoneOffsetMinutes??0;
 trace.steps.forEach((s,i)=>{
  if(s.kind!=='RETURN_AFTER_PAUSE'||s.result.planValidity?.status!==VALID||!s.adopted)return;
  const it=s.review.interruption??{},breakStart=typeof it.startDate==='string'?it.startDate:s.asOfLocal;
  const before=(s.result.actualLedger??s.ledgerBefore??[]).filter(r=>!r.superseded&&r.context?.sport==='RUN'&&r.actual?.completed===true&&r.response?.recovery!=='ADVERSE'&&typeof r.localDate==='string'&&r.localDate<breakStart&&Number.isFinite(r.actual?.minutes)).map(r=>r.actual.minutes);
  const d=s.review.currentDemonstration;
  if(d&&d.sport==='RUN'&&d.completed!==false&&d.response!=='ADVERSE'&&Number.isFinite(d.minutes))before.push(d.minutes);
  if(!before.length){p.notEvaluable.push({at:s.stepId,reason:'NO_EXECUTED_TOLERATED_RUN'});return;}
  const max=Math.max(...before),plan=s.planAfter;
  let week=s.weekIndex,runs=plan.weeks[week]?.sessions.filter(x=>capped(x)&&x.date>=s.asOfLocal)??[];
  if(!runs.length){week++;runs=plan.weeks[week]?.sessions.filter(capped)??[];}
  for(const x of runs)unit(p,x.prescription.durationMinutes<=max,{at:s.stepId,week,sessionId:x.id,minutes:x.prescription.durationMinutes,executedTolerated:max});
 });
 return finish(p);
}
// ---------- P09 progression earned ----------
function p09(trace){
 const p=prop('P09');
 for(const s of trace.steps){
  if(s.kind!=='WEEKLY_REVIEW'||!s.result.gates)continue;
  const rows=(s.result.actualLedger??s.ledgerBefore??[]).filter(r=>!r.superseded&&(r.context?.weekIndex??weekOfSession(r.sessionId))===s.weekIndex);
  for(const [key,gate] of Object.entries(s.result.gates)){
   if(!['ADVANCE','EARNED'].includes(gate))continue;
   const mine=rows.filter(r=>r.context?.role===key||(r.actual?.exercises??[]).some(e=>e.id===key));
   if(!mine.length)continue; // P03 owns credit without any report
   unit(p,mine.some(r=>r.actual?.completed===true&&r.response?.recovery!=='ADVERSE'&&r.response?.performance!=='UNDER'),{at:s.stepId,issue:'PROGRESSION_WITHOUT_FAVOURABLE_EXECUTION',key,gate,week:s.weekIndex});
  }
 }
 return finish(p);
}
// ---------- P10 history ----------
const rx=s=>canonicalJson({role:s.role,status:s.status??'PLANNED',date:s.date,p:s.prescription??null});
function p10(trace){
 const p=prop('P10');
 trace.steps.forEach((s,i)=>{
  if(s.adopted){
   const after=new Map(s.planAfter.weeks.flatMap(w=>w.sessions).map(x=>[x.id,x]));
   for(const x of s.planBefore.weeks.flatMap(w=>w.sessions).filter(x=>x.date<s.asOfLocal)){const y=after.get(x.id);unit(p,!!y&&rx(x)===rx(y),{at:s.stepId,issue:'PAST_SESSION_REWRITTEN',sessionId:x.id});}
   const d0=s.planBefore.decisions??[],d1=s.planAfter.decisions??[];
   unit(p,canonicalJson(d1.slice(0,d0.length))===canonicalJson(d0),{at:s.stepId,issue:'DECISION_HISTORY_REWRITTEN'});
  }
  const out=s.result.actualLedger;if(!Array.isArray(out))return;
  const byId=new Map(out.map(r=>[r.eventId,r])),corrected=new Set((s.review.observations??[]).map(o=>o.correctionOf).filter(Boolean));
  for(const r of s.ledgerBefore??[]){
   const y=byId.get(r.eventId);
   unit(p,!!y,{at:s.stepId,issue:'RECORD_ROW_DROPPED',eventId:r.eventId});
   if(!y)continue;
   const same=canonicalJson({a:r.actual,o:r.observedAt,s:r.sessionId})===canonicalJson({a:y.actual,o:y.observedAt,s:y.sessionId});
   unit(p,same,{at:s.stepId,issue:'RECORD_ROW_REWRITTEN',eventId:r.eventId});
   if(!r.superseded&&y.superseded)unit(p,corrected.has(r.eventId),{at:s.stepId,issue:'SUPERSEDED_WITHOUT_CORRECTION',eventId:r.eventId});
   const c0=r.provenance?.firstRecordedAt,c1=y.provenance?.firstRecordedAt;
   if(c0)unit(p,!!c1&&Date.parse(c1)<=Date.parse(c0),{at:s.stepId,issue:'FIRST_RECORDED_CLOCK_MOVED',eventId:r.eventId,before:c0,after:c1});
  }
 });
 return finish(p);
}
// ---------- P11 repertoire ----------
function equipmentTimeline(trace){
 const base=trace.intake?.athlete?.equipment??['BODYWEIGHT'],changes=[];
 return {at:(stepIndex,date)=>{
  let eq=base;
  for(let i=0;i<=stepIndex;i++){const s=trace.steps[i];if(s.kind!=='EQUIPMENT_CHANGE'||!Array.isArray(s.review.changes?.equipment))continue;const c=s.review.changes,from=c.from??s.asOfLocal,to=c.to??null;if(date>=from&&(!to||date<=to))eq=c.equipment;}
  return new Set([...eq,'BODYWEIGHT']);
 },changes};
}
function p11(trace,ctx){
 const p=prop('P11'),catalog=ctx.catalog,configs=new Map(catalog.strength.configurations.map(c=>[c.id,c])),families=new Set(catalog.run.families.map(f=>f.id));
 const a=trace.intake?.athlete??{},exp=a.strengthExperience??'NOVICE',maxSkill=['INTERMEDIATE','EXPERIENCED'].includes(exp)?1:0;
 const familiar=new Set([...(a.knownExercises??[]).filter(k=>k?.familiar!==false).map(k=>k.id),...(trace.intake?.history??[]).flatMap(h=>(h.exercises??[]).map(e=>e.id))]);
 const eq=equipmentTimeline(trace),seen=new Set();
 for(const x of plans(trace)){
  const ladder=new Set(trace.steps.slice(0,x.stepIndex+1).flatMap(s=>(s.review.choices??[]).filter(c=>c.type==='LADDER_STEP').map(c=>c.to)));
  for(const s of x.plan.weeks.flatMap(w=>w.sessions).filter(live)){
   if(x.stepIndex>=0&&s.date<x.asOfLocal)continue;
   if(s.sport==='RUN'){unit(p,families.has(RUN_FAMILY_TO_CATALOG[s.prescription.family]),{at:x.at,issue:'RUN_FAMILY_OUTSIDE_CATALOG',sessionId:s.id,family:s.prescription.family});continue;}
   for(const e of s.prescription.exercises??[]){
    const key=`${x.at}|${s.id}|${e.id}`;if(seen.has(key))continue;seen.add(key);
    const c=configs.get(e.id);
    unit(p,!!c,{at:x.at,issue:'EXERCISE_OUTSIDE_CATALOG',sessionId:s.id,exercise:e.id});
    if(!c)continue;
    const have=eq.at(x.stepIndex,s.date);
    unit(p,c.eq.every(q=>have.has(q)),{at:x.at,issue:'EQUIPMENT_NOT_AVAILABLE',sessionId:s.id,exercise:e.id,needs:c.eq,has:[...have]});
    const rank=SKILL_RANK[c.skill]??0,ok=rank<=maxSkill||familiar.has(e.id)||ladder.has(e.id);
    unit(p,ok,{at:x.at,issue:'SKILL_OUTSIDE_ELIGIBILITY',sessionId:s.id,exercise:e.id,skill:c.skill,experience:exp});
   }
  }
 }
 return finish(p);
}
// ---------- P12 composition ----------
function scheduleTimeline(trace){
 const s0=trace.intake?.schedule??{};
 return (stepIndex,date,weekStart)=>{
  let sch={runDays:s0.runDays??[],strengthDays:s0.strengthDays??[],sameTurnConfirmed:s0.sameTurnConfirmed===true},prev=null;
  for(let i=0;i<=stepIndex;i++){
   const s=trace.steps[i];if(!['SCHEDULE_CHANGE','DOUBLE_CONFLICT'].includes(s.kind))continue;
   const c=s.review.changes??{},from=c.from??null,to=c.to??null;
   if(from&&(date<from||(to&&date>to)))continue;
   const next={runDays:c.runDays??sch.runDays,strengthDays:c.strengthDays??sch.strengthDays,sameTurnConfirmed:c.sameTurnConfirmed??sch.sameTurnConfirmed};
   // A permanent change without a window applies from the next week; the week of the change keeps either set of days.
   if(!from&&weekStart&&s.asOfLocal>=weekStart&&s.asOfLocal<addDays(weekStart,7))prev={runDays:[...new Set([...sch.runDays,...next.runDays])],strengthDays:[...new Set([...sch.strengthDays,...next.strengthDays])],sameTurnConfirmed:sch.sameTurnConfirmed||next.sameTurnConfirmed};
   else if(!from&&weekStart&&s.asOfLocal>=addDays(weekStart,7))continue;
   sch=next;
  }
  return prev??sch;
 };
}
function p12(trace){
 const p=prop('P12'),sched=scheduleTimeline(trace);
 for(const x of plans(trace)){
  for(const w of x.plan.weeks){
   const sessions=w.sessions.filter(live).filter(s=>x.stepIndex<0||s.date>=x.asOfLocal);
   const movedIds=new Set(w.sessions.filter(s=>s.movedTo).map(s=>s.movedTo));
   for(const s of sessions){
    if(s.role==='RACE')continue;
    const sc=sched(x.stepIndex,s.date,w.startDate),own=s.sport==='RUN'?sc.runDays:sc.strengthDays,other=s.sport==='RUN'?sc.strengthDays:sc.runDays;
    if(own.includes(s.day))unit(p,true);
    else if(movedIds.has(s.id)&&other.includes(s.day))p.observations.push({at:x.at,issue:'MOVED_ONTO_OTHER_SPORT_DAY',sessionId:s.id});
    else unit(p,false,{at:x.at,issue:'SESSION_ON_UNCHOSEN_DAY',sessionId:s.id,sport:s.sport,day:s.day,chosen:own});
   }
   const byDay=new Map();for(const s of sessions){if(!s.turn)continue;const k=s.date+'|'+s.turn;byDay.set(k,[...(byDay.get(k)??[]),s]);}
   // Same turn needs the athlete's confirmation (UXS ONB-21): either given, or requested by the plan itself (a BACK_TO_BACK_CONFIRMATION
   // negotiation item naming that day), which a consumer must surface (recorded as an observation).
   const requested=new Set((x.plan.negotiation??[]).filter(n=>n?.id==='BACK_TO_BACK_CONFIRMATION').flatMap(n=>n.days??[]));
   for(const [k,list] of byDay){
    if(new Set(list.map(s=>s.sport)).size<2)continue;
    const sc=sched(x.stepIndex,k.split('|')[0],w.startDate),day=list[0].day;
    if(sc.sameTurnConfirmed===true)unit(p,true);
    else if(requested.has(day)){unit(p,true);p.observations.push({at:x.at,issue:'SAME_TURN_CONFIRMATION_REQUESTED',date:k});}
    else unit(p,false,{at:x.at,issue:'SAME_TURN_WITHOUT_CONFIRMATION',date:k});
   }
  }
 }
 return finish(p);
}
// ---------- P13 record clock and integrity (the metamorphic part is aggregated by the harness) ----------
function p13(trace){
 const p=prop('P13');
 for(const s of trace.steps)for(const r of s.result.actualLedger??[])unit(p,typeof r.provenance?.firstRecordedAt==='string',{at:s.stepId,issue:'RECORD_ROW_WITHOUT_CLOCK',eventId:r.eventId});
 for(const v of trace.integrity??[])unit(p,false,{at:v.stepId,issue:v.issue});
 for(const e of trace.runtimeErrors??[])unit(p,false,{at:e.at,issue:'RUNTIME_EXCEPTION',message:e.message});
 return finish(p);
}
// ---------- P14 learning consent ----------
function p14(trace){
 const p=prop('P14');let consent=trace.intake?.learningConsent===true;
 for(const s of trace.steps){
  if(typeof s.review.learningConsent==='boolean')consent=s.review.learningConsent;
  const m=s.result.updatedModel;
  if(!consent&&m)unit(p,m.purposeAllowed!==true&&!(s.result.learnedPatterns??[]).length,{at:s.stepId,issue:'LEARNING_WITHOUT_CONSENT',purposeAllowed:m.purposeAllowed,learned:s.result.learnedPatterns??null});
 }
 return finish(p);
}
export function evaluateProperties(trace,ctx){
 return {P01:p01(trace),P02:p02(trace),P03:p03(trace,ctx),P04:p04(trace),P06:p06(trace,ctx),P07:p07(trace,ctx),P08:p08(trace),P09:p09(trace),P10:p10(trace),P11:p11(trace,ctx),P12:p12(trace),P13:p13(trace),P14:p14(trace)};
}
export {VALID,RECON};
