// R7-D metamorphic relations (pre-registered in PREREGISTRATION_R7D.md §5). Each one builds a mechanical variant of a case, runs it through the
// same C3 client and compares canonical views (ids, hashes, free text dropped). Relations are derived from the authorities (AEOS §14, Scenario
// Lab §5, C3), never from the cases.
import {clone,digestOf,canonicalJson,addDays,localDate} from './util.mjs';
import {runCase,live} from './client.mjs';
import {stepView,generationView,planWindow,decisionView} from './canonical.mjs';

export const RELATIONS={
 DETERMINISM:{property:'P13',blocking:true,desc:'The same case run twice gives byte-identical decisions'},
 PERMUTE_OBSERVATIONS:{property:'P13',blocking:true,desc:'Reports in reverse order within each decision'},
 DUPLICATE_SECOND_SOURCE:{property:'P13',blocking:true,desc:'Each completed report also arrives from a second device with the same values'},
 RENAME_OPAQUE_IDS:{property:'P13',blocking:true,desc:'Athlete, event, report and activity ids and provider names renamed'},
 LOAD_CONVENTION_EQUIVALENT:{property:'P13',blocking:true,desc:'A known dumbbell-pair load given PER_HAND instead of TOTAL (or the reverse), same mass'},
 RESEND:{property:'P05',blocking:true,desc:'Every decision re-sends the previous decision\'s reports (same ids)'},
 CARRIER_CLINICAL:{property:'P05',blocking:true,desc:'An answer to UNREPORTED_TRAINING recorded by a clinical substitution, then qualified clearance; compared at the first eligible decision'},
 CARRIER_HOLD:{property:'P05',blocking:true,desc:'An answer in the program\'s last week recorded by a refused schedule change (HOLD); compared at the next decision'},
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
 const review=r=>({...r,event:{...r.event,id:R(r.event.id)},observations:(r.observations??[]).map(o=>({...o,eventId:R(o.eventId),...(o.correctionOf?{correctionOf:R(o.correctionOf)}:{}),...(o.source?{source:{...o.source,...(o.source.provider?{provider:R(o.source.provider)}:{}),...(o.source.activityId?{activityId:R(o.source.activityId)}:{})}}:{})}))});
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
  const next=kase.timeline[i+1]??probeStep(kase,base,i);
  const baseCase={...kase,timeline:[...kase.timeline.slice(0,i+1),next,...kase.timeline.slice(i+2)]};
  const varCase={...kase,timeline:[...kase.timeline.slice(0,i),carrierStep,{...clone(next),...(relation==='CARRIER_CLINICAL'?{clearance:'QUALIFIED_CLEARANCE'}:{})},...kase.timeline.slice(i+2)]};
  const A=kase.timeline[i+1]?base:runCase(rt,baseCase),B=runCase(rt,varCase);
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
 if(want('CONSENT_OFF'))out.CONSENT_OFF=consent(rt,kase,base);
 if(want('CLOCKLESS_CONTROL'))out.CLOCKLESS_CONTROL=clockless(rt,kase,base);
 if(want('CALENDAR_SHIFT'))out.CALENDAR_SHIFT=shift(rt,kase,base);
 if(want('VARIANT'))out.VARIANT=variants(rt,kase,base);
 return out;
}
