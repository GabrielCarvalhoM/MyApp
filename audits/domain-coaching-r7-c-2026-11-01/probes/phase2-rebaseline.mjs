// R7-C Phase 2 re-baseline probe (read-only engineering instrument, development authority of the R7-B test helpers; never gate evidence).
// D1 (H19), D2 (H22, H17), D4 (declared pause vs unknown gap), D5 (H34/H35/H20 consent differential) and the G01 shapes (C15 label, R18, R2-05, CQ-R6-04 H25/H23). Prints JSON; writes nothing.
// Usage: node phase2-rebaseline.mjs <abs CoachingCore>
import path from 'node:path';
import {pathToFileURL} from 'node:url';
const core=process.argv[2];if(!core)throw Error('core missing');
const imp=rel=>import(pathToFileURL(path.join(core,rel)).href);
const H=await imp('r7/b/fixtures/helpers.mjs');
const {evaluateHoldoutCase}=await imp('scripts/evaluate-holdout-r6.mjs');
const {historicalStateOf}=await imp('src/r6-adaptation.mjs');
const {hash,clone}=await imp('src/value.mjs');
const fs=await import('node:fs');
const corpus=JSON.parse(fs.readFileSync(path.join(core,'r6/holdout/R6_INDEPENDENT_HOLDOUT.json'),'utf8'));
const {opts,K,program,weekly,review,evaluateProgram,live,addDays,obs}=H;
const out={};
const runs=(P,w)=>P?.weeks?.[w]?P.weeks[w].sessions.filter(s=>s.sport==='RUN'&&s.prescription&&s.status!=='SKIPPED').map(s=>`${s.role}:${s.prescription.durationMinutes}${s.progression?.ladder?'@'+s.progression.ladder+':'+s.progression.value:''}`):null;
const brief=r=>({status:r.status,action:r.action,reason:String(r.reason??'').slice(0,240),gates:r.gates??null,missing:r.missingInputs??[],learned:r.learnedPatterns??null});
const guard=(k,f)=>{try{out[k]=f();}catch(e){out[k]={error:String(e?.stack??e).slice(0,900)};}};
const caseOf=id=>clone(corpus.cases.find(c=>c.caseId===id));
const runCase=(c,o=opts)=>evaluateHoldoutCase(c,o);

// ---- D1: H19 S4 (third adverse quality with impaired next-day function, mid-week; week-5 weekly review skipped) ----
guard('D1_H19',()=>{
 const c=caseOf('R6-H19'),r=runCase(c);
 const steps=r.steps.map((s,i)=>({step:'S'+(i+1),...brief(s.result)}));
 // the counterfactual: the skipped week-5 weekly review supplied before S4 (no new facts, nothing else changes)
 const c2=caseOf('R6-H19');const s4=c2.steps[3];const asOf5='2027-02-14T19:00:00-03:00';
 c2.steps.splice(3,0,{review:{...clone(c2.steps[1].review),asOf:asOf5,weekIndex:5,event:{id:'cf-w5-weekly',kind:'WEEKLY_REVIEW'},eligibility:{...c2.steps[1].review.eligibility,assessedAt:'2027-02-14'}},observationFacts:[],adoptProposal:true});
 let cf;try{cf=runCase(c2).steps.map((s,i)=>({step:i,...brief(s.result)}));}catch(e){cf={error:String(e.message).slice(0,300)};}
 const last=r.steps.at(-1).result,P=last.proposal;
 return {steps,s4QualityNext:runs(P,7),counterfactualWithWeek5Review:cf};
});
// ---- D2: H22 S2 (moved+executed long run) and H17 S1 (explicit miss recorded as PARTIAL) ----
guard('D2_H22',()=>{const r=runCase(caseOf('R6-H22'));return r.steps.map((s,i)=>({step:'S'+(i+1),...brief(s.result),longRow:(s.result.weekEvidence?.rows??[]).filter(x=>x.role==='LONG').map(x=>({id:x.sessionId,date:x.date,status:x.status}))}));});
guard('D2_H17',()=>{const r=runCase(caseOf('R6-H17'));const s1=r.steps[0].result,q=(s1.weekEvidence?.rows??[]).find(x=>x.role==='QUALITY');const led=s1.actualLedger.find(o=>o.sessionId===q?.sessionId);
 return {s1:brief(s1),qualityRowStatus:q?.status??null,ledgerPartial:led?.partial??null,ledgerActual:led?.actual??null,ledgerKind:led?(led.partial?'PARTIAL':'other'):null,steps:r.steps.map((s,i)=>({step:'S'+(i+1),status:s.result.status,action:s.result.action}))};});

// ---- shared R18 timeline (Phase 1 probe shape) ----
const base={id:'r7c-r18',weeks:12,goals:{run:'PERFORMANCE',strength:'GENERAL'},equipment:H.FULL,knownExercises:[K('back-squat',3,5,82.5)]};
function timeline(mode,{gapFrom=2,gapTo=7}={}){
 const t={p:program(base),ledger:[]};
 for(let w=0;w<gapFrom;w++)weekly(t,w);
 for(let w=gapFrom;w<gapTo;w++){
  if(mode==='EXEC')weekly(t,w);
  else if(mode==='EMPTY'){const r=evaluateProgram(t.p,{...review(t.p,w),actualLedger:t.ledger},opts);t.ledger=r.actualLedger??t.ledger;if(r.proposal)t.p=r.proposal;}
 }
 return t;
}
// ---- G01: R18 weekly after the gap (nothing reported in week 7) ----
guard('G01_R18',()=>{const o={};for(const m of ['EXEC','EMPTY','NONE']){const t=timeline(m);const r=evaluateProgram(t.p,{...review(t.p,7),actualLedger:t.ledger},opts);o[m]={...brief(r),wk8:runs(r.proposal??t.p,8),wk9:runs(r.proposal??t.p,9),state8:(r.proposal??t.p).stateTrace?.[8]?.run?{easy:(r.proposal??t.p).stateTrace[8].run.easy,long:(r.proposal??t.p).stateTrace[8].run.long,q:(r.proposal??t.p).stateTrace[8].run.qualityStep}:null};}return o;});
// ---- D4: declared pause of the same length (weeks 2-6 = 35 days) reported at the start of week 7, vs the unknown gap ----
guard('D4_declaredPause',()=>{
 const o={};
 for(const [name,gapFrom,days] of [['LONG_35d',2,35],['MODERATE_28d',3,28],['SHORT_7d',6,7]]){
  const t={p:program(base),ledger:[]};for(let w=0;w<gapFrom;w++)weekly(t,w);
  const startDate=t.p.weeks[gapFrom].startDate,endDate=addDays(startDate,days-1);
  const r=evaluateProgram(t.p,{...review(t.p,7,{day:0,hour:'07:00:00',kind:'RETURN_AFTER_PAUSE',interruption:{startDate,endDate,days,reasonCategory:'WORK',reason:'work',nonclinical:true}}),actualLedger:t.ledger},opts);
  const P=r.proposal??t.p;
  // unknown-gap control of the same length: nothing reported, a weekly review at the end of week 7 (R18 NONE) and a schedule change at day 0 of week 7
  const u={p:program(base),ledger:[]};for(let w=0;w<gapFrom;w++)weekly(u,w);
  const sc=evaluateProgram(u.p,{...review(u.p,7,{day:0,hour:'07:00:00',kind:'SCHEDULE_CHANGE',changes:{strengthDays:[0,3]}}),actualLedger:u.ledger},opts);
  o[name]={pause:{...brief(r),wk7:runs(P,7),wk8:runs(P,8),wk9:runs(P,9)},unknownScheduleChange:{...brief(sc),wk8:runs(sc.proposal??u.p,8),wk9:runs(sc.proposal??u.p,9)}};
 }
 return o;
});
// ---- C15 label: weekly review of an executed week after unreviewed weeks ----
guard('G01_C15',()=>{
 const ia={id:'c15',weeks:12,goals:{run:{kind:'RACE',event:{kind:'10K',date:addDays('2026-11-02',11*7+6)}},strength:'RUNNING_SUPPORT'},knownExercises:[K('back-squat',3,5,80)],recent:{runDaysPerWeek:3,runMinutesPerWeek:150,longestRunMinutes:70,strengthDaysPerWeek:2},schedule:{runDays:[1,3,6],strengthDays:[0,4],longRunDay:6,runMinutes:60,longRunMinutes:100},equipment:['DUMBBELLS','BENCH','BARBELL','RACK']};
 const t={p:program(ia),ledger:[]};for(let w=0;w<3;w++)weekly(t,w);
 const r=evaluateProgram(t.p,{...review(t.p,7,{observations:t.p.weeks[7].sessions.filter(live).map(s=>obs(t.p,s))}),actualLedger:t.ledger},opts);
 const sc=evaluateProgram(t.p,{...review(t.p,7,{day:0,kind:'SCHEDULE_CHANGE',changes:{strengthDays:[0,3]}}),actualLedger:t.ledger},opts);
 return {weekly:{...brief(r),instantiationOnly:r.instantiationOnly,storedWk8:runs(t.p,8),wk8:runs(r.proposal,8),runChanged:hash(runs(t.p,8))!==hash(runs(r.proposal,8))},schedule:{...brief(sc),wk8:runs(sc.proposal??t.p,8),wk9:runs(sc.proposal??t.p,9)}};
});
// ---- R2-05: novice cap start with week 1 unreviewed ----
guard('G01_R2_05',()=>{
 const NOV={strengthExperience:'NONE',goals:{run:'REGULAR',strength:'GENERAL'},equipment:['DUMBBELLS','BENCH'],schedule:{strengthDays:[0,4]},weeks:12};
 const types=(p,w)=>p.weeks[w].sessions.filter(s=>s.sport==='STRENGTH'&&s.prescription).map(s=>s.templateType).sort().join(',');
 const mk=(name,f)=>{const t={p:program({...NOV,id:'r205-'+name}),ledger:[]};weekly(t,0);const c=evaluateProgram(t.p,{...review(t.p,1,{day:0,hour:'06:00:00',kind:'SCHEDULE_CHANGE',changes:{strengthDays:[0,2,4,5]}}),actualLedger:t.ledger},opts);t.ledger=c.actualLedger??t.ledger;if(c.proposal)t.p=c.proposal;f(t);
  const d=evaluateProgram(t.p,{...review(t.p,2,{day:0,hour:'06:00:00',kind:'EXERCISE_SUBSTITUTION',substitution:{exerciseId:'goblet-squat',reason:'NONCLINICAL_DISCOMFORT_OR_PREFERENCE',nonclinicalConfirmed:true}}),actualLedger:t.ledger},opts);
  return {status:d.status,week2:types(d.proposal??t.p,2),week3:types(d.proposal??t.p,3)};};
 return {skipped:mk('skip',()=>{}),reviewedEmpty:mk('empty',t=>weekly(t,1,{keep:()=>false})),reviewedAll:mk('all',t=>weekly(t,1))};
});
// ---- CQ-R6-04: H25 and H23 ----
guard('G01_H25',()=>{const r=runCase(caseOf('R6-H25'));return r.steps.map((s,i)=>{const P=s.result.proposal;const wk=P?P.weeks.map((x,k)=>k).filter(k=>k>=4&&k<=13).map(k=>`${k}:${(runs(P,k)??[]).map(x=>x.split('@')[0]).join('/')}`):null;return {step:'S'+(i+1),...brief(s.result),runsByWeek:wk,raceWeek:P?.phases?.raceWeek??null};});});
guard('G01_H23',()=>{const r=runCase(caseOf('R6-H23'));return r.steps.map((s,i)=>{const P=s.result.proposal;const wk=P?P.weeks.map((x,k)=>k).filter(k=>k>=4&&k<=10).map(k=>`${k}:${(runs(P,k)??[]).map(x=>x.split('@')[0]).join('/')}`):null;return {step:'S'+(i+1),...brief(s.result),runsByWeek:wk};});});

// ---- D5: H34/H35/H20 with consent ON vs OFF (does any learned pattern change a decision?) ----
guard('D5',()=>{const o={};for(const id of ['R6-H34','R6-H35','R6-H20']){
 const on=caseOf(id),off=caseOf(id);off.intake=clone(off.intake);off.intake.learningConsent=false;
 const a=runCase(on),b=runCase(off);
 o[id]={steps:a.steps.map((s,i)=>{const x=s.result,y=b.steps[i].result;return {step:'S'+(i+1),on:`${x.status}/${x.action}`,off:`${y.status}/${y.action}`,sameProposal:hash(x.proposal?.weeks??null)===hash(y.proposal?.weeks??null),learned:x.learnedPatterns??null,modelEvidence:Object.keys(x.updatedModel?.evidence??x.updatedModel?.patterns??{}).length,gatesOn:x.gates};})};
}return o;});
console.log(JSON.stringify(out,null,1));
