// R7D-HARNESS-9 (R7-D Phase 5, R7D-PREREG-8 Δ48; the Founder's K03 decision): copied from lib/metamorphic.mjs (never edited). Two hunks differ: it
// runs cases through lib/client-9.mjs, and the two carriers (CARRIER_CLINICAL, CARRIER_HOLD) compare at a probe decision placed one minute after
// the answer, in both runs, before the author's next step (QRE-P4-H03: the next step of the timeline came a week later with facts written relative
// to the plan in force, which the two runs no longer shared, and the carried run had also lost the answer week's own review). The author's later
// steps then follow in both runs and are compared as before. Every other relation is R7D-HARNESS-8's.
// R7-D metamorphic relations (pre-registered in PREREGISTRATION_R7D.md §5). Each one builds a mechanical variant of a case, runs it through the
// same C3 client and compares canonical views (ids, hashes, free text dropped). Relations are derived from the authorities (AEOS §14, Scenario
// Lab §5, C3), never from the cases.
import {clone,digestOf,canonicalJson,addDays,localDate} from './util.mjs';
import {runCase,live} from './client-9.mjs';
import {stepView,generationView,planWindow,decisionView} from './canonical.mjs';
import {statedBreakOf,appliesReturn} from './properties.mjs';

export const RELATIONS={
 DETERMINISM:{property:'P13',blocking:true,desc:'The same case run twice gives byte-identical decisions'},
 PERMUTE_OBSERVATIONS:{property:'P13',blocking:true,desc:'Reports in reverse order within each decision'},
 DUPLICATE_SECOND_SOURCE:{property:'P13',blocking:true,desc:'Each completed report also arrives from a second device with the same values'},
 RENAME_OPAQUE_IDS:{property:'P13',blocking:true,desc:'Athlete, event, report and activity ids and provider names renamed'},
 LOAD_CONVENTION_EQUIVALENT:{property:'P13',blocking:true,desc:'A known dumbbell-pair load given PER_HAND instead of TOTAL (or the reverse), same mass'},
 RESEND:{property:'P05',blocking:true,desc:'Every decision re-sends the previous decision\'s reports (same ids)'},
 CARRIER_CLINICAL:{property:'P05',blocking:true,desc:'An answer to UNREPORTED_TRAINING recorded by a clinical substitution, then qualified clearance; compared at the first eligible decision'},
 CARRIER_HOLD:{property:'P05',blocking:true,desc:'An answer in the program\'s last week recorded by a refused schedule change (HOLD); compared at the next decision'},
 RESTATE_DECLARED_BREAK:{property:'P17',blocking:true,desc:'A stated break its own decision did not apply, stated again with every later review that states none until a return is recorded: identical decisions (no repetition is ever needed)'},
 INSERT_NEWER_BREAK:{property:'P18',blocking:true,desc:'A review that applied a return reading a kept break, sent again with a newer break that names none: its relation is unresolved, so no return is applied and the plan is not valid (no last-write-wins, no join)'},
 CONSENT_OFF:{property:'P14',blocking:'LEARNING_NOISE cases only',desc:'Learning consent off from the start'},
 CLOCKLESS_CONTROL:{property:'C3 legacy',blocking:false,desc:'The carried record loses provenance.firstRecordedAt (pre-FREEZE-4 records); differences are C3 consumer conditions'},
 CALENDAR_SHIFT:{property:'P15 (PROPOSED_ONLY)',blocking:false,desc:'Every date one week earlier; decisions compared without dates'},
 VARIANT:{property:'author',blocking:'DOMAIN (author oracle)',desc:'The author\'s own variant and expected relation'}
};

const allViews=(trace,{dates=true}={})=>({gen:generationView(trace,{dates}),steps:trace.steps.map(s=>({id:s.stepId,...stepView(s,{scope:'ALL',dates})})),stopped:trace.stopped});
function firstDiff(a,b){
 if(canonicalJson(a.gen)!==canonicalJson(b.gen))return {at:'GENERATE'};
 const n=Math.max(a.steps.length,b.steps.length);
 for(let i=0;i<n;i++){const x=a.steps[i],y=b.steps[i];if(!x||!y)return {at:(x??y).id,issue:'STEP_COUNT'};if(canonicalJson(x)!==canonicalJson(y))return {at:x.id,decisionA:x.decision,decisionB:y.decision,planEqual:canonicalJson(x.plan)===canonicalJson(y.plan),phasesEqual:canonicalJson(x.phases)===canonicalJson(y.phases)};}
 return null;
}
const result=(relation,extra)=>({relation,...RELATIONS[relation],...extra});
const stepsWithObs=trace=>trace.steps.filter(s=>(s.review.observations??[]).length);

function determinism(rt,kase,base){
 const again=runCase(rt,kase),dig=t=>digestOf({g:t.generation,s:t.steps.map(s=>s.result),e:t.runtimeErrors});
 return result('DETERMINISM',{applicable:true,units:1,violations:dig(again)===dig(base)?[]:[{issue:'NON_DETERMINISTIC',diff:firstDiff(allViews(base),allViews(again))}]});
}
function compareWhole(relation,rt,kase,base,hooks,{dates=true}={}){
 const v=runCase(rt,kase,hooks),d=firstDiff(allViews(base,{dates}),allViews(v,{dates}));
 return result(relation,{applicable:true,units:1,violations:d?[{issue:'DECISIONS_DIFFER',...d}]:[],variantErrors:[...v.corpusErrors,...v.runtimeErrors]});
}
function permute(rt,kase,base){
 if(!base.steps.some(s=>(s.review.observations??[]).length>1))return result('PERMUTE_OBSERVATIONS',{applicable:false});
 return compareWhole('PERMUTE_OBSERVATIONS',rt,kase,base,{review:r=>({...r,observations:[...(r.observations??[])].reverse()})});
}
function duplicate(rt,kase,base){
 if(!stepsWithObs(base).length)return result('DUPLICATE_SECOND_SOURCE',{applicable:false});
 return compareWhole('DUPLICATE_SECOND_SOURCE',rt,kase,base,{review:r=>({...r,observations:(r.observations??[]).flatMap(o=>o.actual?.completed===true&&!o.correctionOf?[o,{...clone(o),eventId:o.eventId+'~dev2',source:{provider:'R7D_SECOND_DEVICE',activityId:'dev2-'+o.eventId,quality:'WEARABLE_FULL'}}]:[o])})});
}
function rename(rt,kase,base){
 const R=x=>typeof x==='string'?'rn~'+x:x;
 const intake=i=>{const x=clone(i);x.athlete.id=R(x.athlete.id);for(const h of x.history??[]){h.activityId=R(h.activityId);h.provider=R(h.provider);}if(x.athlete.wearableCapabilities?.provider)x.athlete.wearableCapabilities.provider=R(x.athlete.wearableCapabilities.provider);return x;};
 // R7D-HARNESS-4: an interruption's episodeId names a report (its event id) or an identity the athlete chose: an opaque id, renamed the same way, as
 // a report's correctionOf is (HARNESS-3 left it as sent, so a correction that named its report stopped naming it in the variant).
 const named=r=>r.interruption&&typeof r.interruption==='object'&&!Array.isArray(r.interruption)&&typeof r.interruption.episodeId==='string'?{interruption:{...r.interruption,episodeId:R(r.interruption.episodeId)}}:{};
 const review=r=>({...r,...named(r),event:{...r.event,id:R(r.event.id)},observations:(r.observations??[]).map(o=>({...o,eventId:R(o.eventId),...(o.correctionOf?{correctionOf:R(o.correctionOf)}:{}),...(o.source?{source:{...o.source,...(o.source.provider?{provider:R(o.source.provider)}:{}),...(o.source.activityId?{activityId:R(o.source.activityId)}:{})}}:{})}))});
 return compareWhole('RENAME_OPAQUE_IDS',rt,kase,base,{intake,review});
}
function convention(rt,kase,base,catalog){
 const conv=new Map(catalog.strength.configurations.map(c=>[c.id,c.conv]));
 const flips=(kase.intake.athlete.knownExercises??[]).filter(k=>conv.get(k.id)==='PER_HAND'&&['TOTAL','PER_HAND'].includes(k.load?.convention)&&k.load?.unit==='KG');
 if(!flips.length)return result('LOAD_CONVENTION_EQUIVALENT',{applicable:false});
 const intake=i=>{const x=clone(i);for(const k of x.athlete.knownExercises??[])if(conv.get(k.id)==='PER_HAND'&&k.load?.unit==='KG'){if(k.load.convention==='PER_HAND'){k.load={...k.load,value:k.load.value*2,convention:'TOTAL'};}else if(k.load.convention==='TOTAL'){k.load={...k.load,value:k.load.value/2,convention:'PER_HAND'};}}return x;};
 // Scope set by the policy (operational.strength.loadUnits: a load is "kept as reported"; smallestIncrement differs by convention): the same
 // mass must start the plan, and routing, validity, questions, sessions, sets and reps must match at every decision; the flipped exercises'
 // later load values follow their own convention's increment and are reported as a difference (harness validation HV-01), not a violation.
 const ids=new Set(flips.map(k=>k.id)),v=runCase(rt,kase,{intake});
 const mask=views=>({...views,gen:views.gen&&{...views.gen,plan:views.gen.plan?.map(s=>s.week>0?maskRx(s,ids):s)},steps:views.steps.map(s=>({...s,plan:s.plan?.map(x=>maskRx(x,ids))}))});
 const strict=firstDiff(allViews(base),allViews(v)),d=firstDiff(mask(allViews(base)),mask(allViews(v)));
 return result('LOAD_CONVENTION_EQUIVALENT',{applicable:true,units:1,violations:d?[{issue:'DECISIONS_DIFFER',...d}]:[],differences:strict&&!d?[{issue:'LATER_LOAD_VALUES_FOLLOW_STATED_CONVENTION',...strict,policy:'operational.strength.loadUnits + smallestIncrement'}]:[],variantErrors:[...v.corpusErrors,...v.runtimeErrors]});
}
const maskRx=(s,ids)=>s.rx?.exercises?{...s,rx:{...s.rx,exercises:s.rx.exercises.map(e=>ids.has(e.id)&&e.load?.mode==='KNOWN'?{...e,load:{mode:'KNOWN',masked:true}}:e)}}:s;
function resend(rt,kase,base){
 if(base.steps.length<2||!stepsWithObs(base).length)return result('RESEND',{applicable:false});
 // Only reports the previous decision recorded are re-sent: a decision that returned before reading reports (a standing clinical route, an
 // eligibility flag) recorded nothing, and sending those reports later is a first delivery, not a re-send (C3, R5).
 let previous=[];
 return compareWhole('RESEND',rt,kase,base,{review:(r,{st})=>{
  const recorded=new Set((st.last?.actualLedger??[]).flatMap(x=>[x.eventId,...Object.keys(x.provenance?.inputHashes??{})]));
  const again=previous.filter(p=>recorded.has(p.eventId)&&!(r.observations??[]).some(o=>o.eventId===p.eventId));
  previous=clone(r.observations??[]);
  return {...r,observations:[...again,...(r.observations??[])]};
 }});
}
const planCentric=(s,scope='WINDOW')=>{const v=stepView(s,{scope});return {decision:{validity:v.decision.validity,question:v.decision.question,pending:v.decision.pending},plan:v.plan,phases:v.phases};};
/** Steps that answer a pending UNREPORTED_TRAINING question in the base run. */
const answerSteps=base=>base.steps.map((s,i)=>({s,i})).filter(({s})=>s.pendingQuestionBefore?.kind==='UNREPORTED_TRAINING'&&((s.review.observations??[]).length||s.review.interruption)&&s.result.status!=='CLINICAL_HUMAN_REQUIRED'&&s.refBefore?.pending?.status!=='CLINICAL_HUMAN_REQUIRED');
function probeStep(kase,base,i){
 const s=base.steps[i],day=Math.round((Date.parse(s.asOfLocal+'T00:00:00Z')-Date.parse(base.steps[i].planAfter.weeks[s.weekIndex].startDate+'T00:00:00Z'))/864e5);
 const at=day<6?{week:s.weekIndex,day:day+1,time:'07:00'}:{week:s.weekIndex,day:6,time:'23:30'};
 return {stepId:`${kase.timeline[i].stepId}~probe`,at,event:{kind:'WEEKLY_REVIEW'},note:'harness probe: the first eligible decision after the answer'};
}
/** R7D-HARNESS-9: the probe one minute after answer step s (index i), as an explicit timestamp in the athlete's offset; and a step's clock. */
const zoned=(ms,tz)=>{const d=new Date(ms+tz*60000).toISOString().slice(0,19),a=Math.abs(tz);return `${d}${tz<0?'-':'+'}${String(Math.floor(a/60)).padStart(2,'0')}:${String(a%60).padStart(2,'0')}`;};
function probeAfter(kase,s,i){const tz=kase.intake?.timezoneOffsetMinutes??0;return {stepId:`${kase.timeline[i].stepId}~probe`,at:zoned(Date.parse(s.asOf)+60000,tz),event:{kind:'WEEKLY_REVIEW'},note:'harness probe (R7D-HARNESS-9): the first eligible decision, one minute after the answer'};}
function stepAt(step,s){const at=step.at;if(typeof at==='string')return at;const start=s.planBefore.startDate,tz=s.planBefore.timezoneOffsetMinutes??0,day=addDays(start,at.week*7+at.day);return zoned(Date.parse(`${day}T${at.time}:00Z`)-tz*60000,tz);}
function carrier(relation,rt,kase,base){
 const list=answerSteps(base),out=[],units={n:0};
 for(const {s,i} of list){
  const program=s.planBefore,lastWeek=program.weeks.length-1;
  let carrierStep;
  const original=kase.timeline[i];
  if(relation==='CARRIER_CLINICAL'){
   const strength=program.weeks.slice(s.weekIndex).flatMap(w=>w.sessions).find(x=>live(x)&&x.sport==='STRENGTH'&&x.date>=s.asOfLocal)??program.weeks[s.weekIndex].sessions.find(x=>live(x)&&x.sport==='STRENGTH');
   if(!strength){out.push({at:original.stepId,applicable:false,reason:'NO_STRENGTH_SESSION_FOR_A_SUBSTITUTION'});continue;}
   carrierStep={...clone(original),event:{kind:'EXERCISE_SUBSTITUTION',substitution:{exerciseRef:{week:strength.weekIndex,day:strength.day},reason:'SKILL_MISMATCH',pain:true}}};
  }else{
   if(s.weekIndex!==lastWeek){continue;}
   const days=program.schedule?.strengthDays??[];
   carrierStep={...clone(original),event:{kind:'SCHEDULE_CHANGE',changes:{strengthDays:days.length?days.map(d=>(d+1)%7):[0]}}};
  }
  // R7D-HARNESS-9 (QRE-P4-H03): the first eligible decision is a probe one minute after the answer, in both runs, before any session elapses.
  const next=probeAfter(kase,s,i),after=kase.timeline[i+1];
  if(after&&!(Date.parse(stepAt(after,s))>Date.parse(next.at))){out.push({at:original.stepId,applicable:false,reason:'NEXT_STEP_WITHIN_A_MINUTE_OF_THE_ANSWER'});continue;}
  const baseCase={...kase,timeline:[...kase.timeline.slice(0,i+1),next,...kase.timeline.slice(i+1)]};
  const varCase={...kase,timeline:[...kase.timeline.slice(0,i),carrierStep,{...clone(next),...(relation==='CARRIER_CLINICAL'?{clearance:'QUALIFIED_CLEARANCE'}:{})},...kase.timeline.slice(i+1)]};
  const A=runCase(rt,baseCase),B=runCase(rt,varCase);
  const carrierResult=B.steps[i]?.result;
  units.n++;
  const routed=relation==='CARRIER_CLINICAL'?carrierResult?.status==='CLINICAL_HUMAN_REQUIRED':carrierResult?.status==='HOLD';
  if(!routed){out.push({at:original.stepId,applicable:false,reason:'CARRIER_DID_NOT_ROUTE',status:carrierResult?.status});units.n--;continue;}
  const a=A.steps[i+1],b=B.steps[i+1];
  if(!a||!b){out.push({at:original.stepId,applicable:true,violation:{issue:'FIRST_ELIGIBLE_DECISION_MISSING',a:!!a,b:!!b}});continue;}
  // C3: the recorded answer is applied by the first eligible decision "as the same answer delivered directly": the plan, its validity and any
  // question are compared, not the label (KEEP after a direct re-plan, MODIFY when the re-plan happens one decision later).
  const va=planCentric(a),vb=planCentric(b),same=canonicalJson(va)===canonicalJson(vb);
  const later=same?firstDiff({gen:null,steps:A.steps.slice(i+2).map(x=>({id:x.stepId,...planCentric(x,'ALL')}))},{gen:null,steps:B.steps.slice(i+2).map(x=>({id:x.stepId,...planCentric(x,'ALL')}))}):null;
  out.push({at:original.stepId,applicable:true,firstEligible:next.stepId,...(same&&!later?{}:{violation:{issue:same?'LATER_DECISIONS_DIFFER':'FIRST_ELIGIBLE_DECISION_DIFFERS',direct:{decision:va.decision,plan:va.plan},carried:{decision:vb.decision,plan:vb.plan},later}})});
 }
 const applicable=out.filter(x=>x.applicable);
 return result(relation,{applicable:applicable.length>0,units:applicable.length,violations:applicable.filter(x=>x.violation).map(x=>({at:x.at,...x.violation})),notApplicable:out.filter(x=>!x.applicable)});
}
/**
 * R7D-HARNESS-3 (R7D-PREREG-3, P17): a stated break that its own decision did not apply (a question, a refusal, a clinical route, another event's
 * question) is a fact the athlete never has to state again. The variant states it again, as the same interruption object, with every later review
 * that states none of its own, until the variant's plan records a return at or after the declaration, or a later review states a break of its
 * own (the variant then stops: that review states its own break; R7D-PREREG-4). Every later decision of the two runs must be identical in what it decides: validity, question, pending state, the
 * whole plan and its phases. Ids and free text are not compared (the interruption is named by its first report in one run, by its restatement in
 * the other).
 */
function restate(rt,kase,base){
 // R7D-PREREG-4 addendum (QE-R7D-P32-01; B4 read over declarations): a stated correction of a break a return already applied (its episodeId names a
 // recorded return's episode or event) is not restated when another break is stated in its window (from the last return before it to the next
 // one). Kept, such a correction is not read and the other break is applied (listed as notApplied, which P18(a) accounts for); stated again, it is
 // asked (a correction across a kept break). The two differ by design, so this relation does not hold there; P18 measures that path. Excluded units
 // are listed. A newer stated break no longer ends the window by replacing the older one (Phase 3.2): the variant stops at it only because the
 // review then states a break of its own.
 const all=base.steps.map((s,i)=>({s,i,brk:statedBreakOf(s.review,s.asOfLocal)})).filter(x=>x.brk&&!appliesReturn(x.s));
 const named=(s,brk)=>{const n=typeof brk.episodeId==='string'?brk.episodeId:null;return !!n&&(s.planBefore?.decisions??[]).some(d=>d.action==='REESTABLISH'&&(d.interruption?.episode===n||d.eventId===n));};
 const bounds=i=>{let from=0,to=base.steps.length-1;for(let m=i-1;m>=0;m--)if(appliesReturn(base.steps[m])){from=m+1;break;}for(let m=i+1;m<base.steps.length;m++)if(appliesReturn(base.steps[m])){to=m;break;}return [from,to];};
 const across=({s,i,brk})=>{if(!named(s,brk))return false;const [from,to]=bounds(i);return base.steps.slice(from,to+1).some((t,k)=>from+k!==i&&!!statedBreakOf(t.review,t.asOfLocal));};
 const excluded=all.filter(across).map(x=>({at:x.s.stepId,reason:'B4_CORRECTION_ACROSS_KEPT_BREAK'})),units=all.filter(x=>!across(x));
 if(!units.length)return result('RESTATE_DECLARED_BREAK',{applicable:false,...(excluded.length?{excluded}:{})});
 const out=[];
 for(const {s,i,brk} of units){
  const clock=Date.parse(s.asOf);let done=false;
  const v=runCase(rt,kase,{review:(r,{step,st})=>{
   const k=kase.timeline.indexOf(step);if(k<=i||done)return r;
   if(st.program.decisions.some(d=>d.action==='REESTABLISH'&&Date.parse(d.asOf)>=clock)){done=true;return r;}
   if(r.interruption!==undefined&&r.interruption!==null){if(statedBreakOf(r,localDate(r.asOf,st.program.timezoneOffsetMinutes??0)))done=true;return r;}
   return {...r,interruption:clone(brk)};
  }});
  const view=t=>({gen:null,steps:t.steps.slice(i+1).map(x=>({id:x.stepId,...planCentric(x,'ALL')}))}),d=firstDiff(view(base),view(v));
  out.push({at:s.stepId,applicable:true,...(d?{violation:{issue:'DECISIONS_DIFFER',...d}}:{}),variantErrors:[...v.corpusErrors,...v.runtimeErrors]});
 }
 return result('RESTATE_DECLARED_BREAK',{applicable:true,units:out.length,violations:out.filter(x=>x.violation).map(x=>({at:x.at,...x.violation})),variantErrors:out.flatMap(x=>x.variantErrors),...(excluded.length?{excluded}:{})});
}
// R7D-HARNESS-4 (P18 metamorphic, R7D-PREREG-4): a newer break that names no break (seven days ending the day before; a work trip, nonclinical)
// stated in a review that applied a return reading a break the record kept (the review states none of its own). The newer break's relation to
// the kept one is unresolved: the variant decision applies no return and is not VALID, whatever the dates (F02: R7D-FREEZE-2 re-entered from it).
function insertNewer(rt,kase,base){
 const units=base.steps.map((s,i)=>({s,i})).filter(({s})=>appliesReturn(s)&&(s.review.interruption===undefined||s.review.interruption===null));
 if(!units.length)return result('INSERT_NEWER_BREAK',{applicable:false});
 const out=[];
 for(const {s,i} of units){
  const newer={startDate:addDays(s.asOfLocal,-7),endDate:addDays(s.asOfLocal,-1),days:7,reasonCategory:'WORK',reason:'Work trip, a newer break',nonclinical:true};
  const v=runCase(rt,kase,{review:(r,{step})=>kase.timeline.indexOf(step)===i?{...r,interruption:clone(newer)}:r}),t=v.steps[i];
  const ok=!!t&&!appliesReturn(t)&&t.result.planValidity?.status!=='VALID_WITHIN_CURRENT_BOUNDED_SCOPE';
  out.push({at:s.stepId,applicable:true,...(ok?{}:{violation:{issue:'NEWER_BREAK_REPLACED_OR_JOINED',status:t?.result.status??null,action:t?.result.action??null}}),variantErrors:[...v.corpusErrors,...v.runtimeErrors]});
 }
 return result('INSERT_NEWER_BREAK',{applicable:true,units:out.length,violations:out.filter(x=>x.violation).map(x=>({at:x.at,...x.violation})),variantErrors:out.flatMap(x=>x.variantErrors)});
}
function clockless(rt,kase,base){
 if(base.steps.length<2)return result('CLOCKLESS_CONTROL',{applicable:false});
 const strip=st=>{st.ledger=st.ledger.map(r=>{if(!r.provenance?.firstRecordedAt)return r;const {firstRecordedAt,...prov}=r.provenance;return {...r,provenance:prov};});};
 const v=runCase(rt,kase,{carry:strip}),d=firstDiff(allViews(base),allViews(v));
 return result('CLOCKLESS_CONTROL',{applicable:true,units:1,violations:[],differences:d?[d]:[]});
}
function consent(rt,kase,base){
 if(kase.intake.learningConsent!==true||base.steps.length<2)return result('CONSENT_OFF',{applicable:false});
 const off={...kase,intake:{...clone(kase.intake),learningConsent:false},timeline:kase.timeline.map(s=>{const x=clone(s);delete x.learningConsent;return x;})};
 const v=runCase(rt,off),d=firstDiff(allViews(base),allViews(v)),noise=(kase.coverageTags??[]).includes('LEARNING_NOISE');
 return result('CONSENT_OFF',{applicable:true,units:noise?1:0,violations:noise&&d?[{issue:'NOISE_CHANGED_DECISIONS',...d}]:[],differences:d?[d]:[],noiseCase:noise});
}
const ISO_DAY=/^\d{4}-\d{2}-\d{2}$/,ISO_TS=/^\d{4}-\d{2}-\d{2}T/;
function shiftDates(v,days){
 if(typeof v==='string'){if(ISO_DAY.test(v))return addDays(v,days);if(ISO_TS.test(v)&&Number.isFinite(Date.parse(v))){const m=/(Z|[+-]\d{2}:\d{2})$/.exec(v);return addDays(v.slice(0,10),days)+v.slice(10);}return v;}
 if(Array.isArray(v))return v.map(x=>shiftDates(x,days));
 if(v&&typeof v==='object')return Object.fromEntries(Object.entries(v).map(([k,x])=>[k,shiftDates(x,days)]));
 return v;
}
function shift(rt,kase,base){
 const shifted={...kase,intake:shiftDates(kase.intake,-7),timeline:kase.timeline.map(s=>{const x=shiftDates(s,-7);x.at=typeof s.at==='string'?shiftDates(s.at,-7):s.at;return x;})};
 const v=runCase(rt,shifted),d=firstDiff(allViews(base,{dates:false}),allViews(v,{dates:false}));
 return result('CALENDAR_SHIFT',{applicable:true,units:1,violations:[],differences:d?[d]:[]});
}
const runMinutesIn=(plan,step)=>planWindow(plan,{fromWeek:step.weekIndex,toWeek:step.weekIndex+1,fromDate:step.asOfLocal}).filter(s=>s.sport==='RUN'&&s.status!=='SKIPPED'&&s.rx).reduce((n,s)=>n+(s.rx.minutes??0),0);
function variants(rt,kase,base){
 const list=(kase.metamorphicRelations??[]).filter(r=>r.relation==='VARIANT');
 if(!list.length)return result('VARIANT',{applicable:false});
 const out=[];
 for(const [n,r] of list.entries()){
  const v={...kase,intake:r.variant?.intakePatch?deepMerge(clone(kase.intake),r.variant.intakePatch):kase.intake,timeline:r.variant?.timeline??kase.timeline};
  const t=runCase(rt,v),a=base.steps.find(s=>s.stepId===r.compareAtStep),b=t.steps.find(s=>s.stepId===r.compareAtStep);
  if(!a||!b){out.push({index:n,compareAtStep:r.compareAtStep,evaluable:false,reason:!a?'STEP_NOT_IN_BASE_RUN':'STEP_NOT_IN_VARIANT_RUN',variantErrors:[...t.corpusErrors,...t.runtimeErrors]});continue;}
  let ok;
  if(r.expect==='SAME_PLAN')ok=canonicalJson(stepView(a))===canonicalJson(stepView(b));
  else if(r.expect==='NOT_HIGHER_RUN_LOAD')ok=runMinutesIn(b.planAfter,b)<=runMinutesIn(a.planAfter,a);
  else if(r.expect==='NOT_LOWER_RUN_LOAD')ok=runMinutesIn(b.planAfter,b)>=runMinutesIn(a.planAfter,a);
  out.push({index:n,compareAtStep:r.compareAtStep,expect:r.expect,evaluable:ok!==undefined,ok,base:{decision:decisionView(a.result),runMinutes:runMinutesIn(a.planAfter,a)},variant:{decision:decisionView(b.result),runMinutes:runMinutesIn(b.planAfter,b)}});
 }
 const ev=out.filter(x=>x.evaluable);
 return result('VARIANT',{applicable:true,units:ev.length,violations:ev.filter(x=>!x.ok),details:out});
}
function deepMerge(a,b){for(const [k,v] of Object.entries(b)){if(v&&typeof v==='object'&&!Array.isArray(v)&&a[k]&&typeof a[k]==='object'&&!Array.isArray(a[k]))deepMerge(a[k],v);else a[k]=clone(v);}return a;}

export function runRelations(rt,kase,base,ctx,{only=null}={}){
 const want=r=>!only||only.includes(r),out={};
 if(base.stopped==='CORPUS_ERROR')return out;
 if(want('DETERMINISM'))out.DETERMINISM=determinism(rt,kase,base);
 if(!base.generation?.program)return out;
 if(want('PERMUTE_OBSERVATIONS'))out.PERMUTE_OBSERVATIONS=permute(rt,kase,base);
 if(want('DUPLICATE_SECOND_SOURCE'))out.DUPLICATE_SECOND_SOURCE=duplicate(rt,kase,base);
 if(want('RENAME_OPAQUE_IDS'))out.RENAME_OPAQUE_IDS=rename(rt,kase,base);
 if(want('LOAD_CONVENTION_EQUIVALENT'))out.LOAD_CONVENTION_EQUIVALENT=convention(rt,kase,base,ctx.catalog);
 if(want('RESEND'))out.RESEND=resend(rt,kase,base);
 if(want('CARRIER_CLINICAL'))out.CARRIER_CLINICAL=carrier('CARRIER_CLINICAL',rt,kase,base);
 if(want('CARRIER_HOLD'))out.CARRIER_HOLD=carrier('CARRIER_HOLD',rt,kase,base);
 if(want('RESTATE_DECLARED_BREAK'))out.RESTATE_DECLARED_BREAK=restate(rt,kase,base);
 if(want('INSERT_NEWER_BREAK'))out.INSERT_NEWER_BREAK=insertNewer(rt,kase,base);
 if(want('CONSENT_OFF'))out.CONSENT_OFF=consent(rt,kase,base);
 if(want('CLOCKLESS_CONTROL'))out.CLOCKLESS_CONTROL=clockless(rt,kase,base);
 if(want('CALENDAR_SHIFT'))out.CALENDAR_SHIFT=shift(rt,kase,base);
 if(want('VARIANT'))out.VARIANT=variants(rt,kase,base);
 return out;
}
