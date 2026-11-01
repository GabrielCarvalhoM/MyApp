// R7-C Phase 3, step 1: the four full-suite failures on the R7-C Phase 2 bytes (f69abc1), reproduced on R7-C and on R7B2-FREEZE-1, each in three
// variants of the same facts: UNREPORTED (the failing fixture: elapsed sessions with no report at all), KNOWN_MISS (the same sessions reported
// as not done) and, where it adds information, EXECUTED. Question per failure: is the test's own invariant kept on R7-C when the miss is known,
// and does the unknown version give the typed question with no proposal? Read-only; prints JSON.
// Usage: node phase3-suite-dispositions.mjs
import {REPO,R7B2_FREEZE_1,extract,load,brief} from './phase3-lib.mjs';
const x=extract(R7B2_FREEZE_1);
const NOW=await load(REPO),B2=await load(x.root);
const out={baseline:{freeze:'R7B2-FREEZE-1',commit:x.commit},current:'working tree (R7-C)'};
const guard=(k,f)=>{try{out[k]=f();}catch(e){out[k]={error:String(e?.stack??e).slice(0,1200)};}};
const notDone=(rt,p,s)=>({eventId:`p3-nd-${s.id}`,athleteId:p.athleteId,sessionId:s.id,observedAt:`${s.date}T${s.turn==='PM'?'19:00:00':'08:00:00'}Z`,actual:{completed:false},response:{}});
const runRows=(p,w)=>p.weeks[w].sessions.filter(s=>s.sport==='RUN'&&s.prescription&&s.status!=='SKIPPED').map(s=>`${s.role}:${s.prescription.durationMinutes}${s.prescription.family&&s.prescription.family!=='EASY'?':'+s.prescription.family:''}${s.prescription.strides?':strides':''}`);
const intense=p=>p.weeks.flatMap(w=>w.sessions).filter(s=>s.weekIndex>0&&s.prescription&&(s.role==='QUALITY'||s.role==='RACE_TOUCH'||s.prescription.strides)).map(s=>s.id);

// ---------- F1: QRE-R6-04 (test/r6-engineering-fixes.test.mjs:94) ----------
const elig=d=>({status:'NONCLINICAL_CONFIRMED',assessedAt:d,pain:false,persistentPain:false,injury:false,illness:false,functionalLimitation:false,clinicalConcern:false});
const SQUAT={id:'back-squat',sets:3,reps:5,load:{value:80,unit:'KG',convention:'TOTAL'},rir:2,current:true,familiar:true,tolerated:true,observedAt:'2026-10-29'};
function intakeF1({id='t-athlete',asOf='2026-11-01',startDate='2026-11-02',weeks=8,athlete={},schedule={},...rest}={}){
 return {version:'R6-INTAKE-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf,startDate,weeks,learningConsent:true,...rest,
  athlete:{id,ageEligible:true,eligibility:elig(asOf),goals:{run:'PERFORMANCE',strength:'STRENGTH'},runExperience:'INTERMEDIATE',strengthExperience:'INTERMEDIATE',recent:{runDaysPerWeek:3,runMinutesPerWeek:120,longestRunMinutes:50,strengthDaysPerWeek:2},equipment:['DUMBBELLS','BENCH','BARBELL','RACK'],
   knownExercises:[SQUAT,{id:'db-bench-press',sets:3,reps:8,load:{value:18,unit:'KG',convention:'PER_HAND'},rir:2,current:true,familiar:true,tolerated:true,observedAt:'2026-10-29'}],...athlete},
  schedule:{runDays:[1,3,6],strengthDays:[0,4],runTurn:'AM',strengthTurn:'PM',runMinutes:50,strengthMinutes:50,longRunDay:6,longRunMinutes:80,...schedule}};
}
const F1_INPUT=intakeF1({id:'t-gate',weeks:12,athlete:{goals:{run:{kind:'RACE',event:{kind:'10K',date:'2026-12-07'}},strength:'MAINTAIN'},recent:{runDaysPerWeek:4,runMinutesPerWeek:160,longestRunMinutes:60}},schedule:{runDays:[1,3,5,6],strengthDays:[2],longRunDay:6,runMinutes:50,longRunMinutes:80}});
/** Every week reviewed at its end: strength executed as prescribed; runs UNREPORTED (no report) or KNOWN_MISS (reported not done). */
function f1Loop(rt,variant){
 const {H}=rt,t={p:rt.generateProgram(F1_INPUT,rt.opts).program,ledger:[]},weeks=[];
 for(let w=0;w<t.p.weeks.length;w++){
  const live=t.p.weeks[w].sessions.filter(H.live),obs=[...live.filter(s=>s.sport!=='RUN').map(s=>H.obs(t.p,s)),...(variant==='KNOWN_MISS'?live.filter(s=>s.sport==='RUN').map(s=>notDone(rt,t.p,s)):[])];
  const r=rt.evaluateProgram(t.p,{...H.review(t.p,w,{observations:obs}),actualLedger:t.ledger},rt.opts);
  t.ledger=r.actualLedger??t.ledger;if(r.proposal)t.p=r.proposal;weeks.push({w,...brief(r)});
 }
 return {statuses:weeks.map(x=>`${x.w}:${x.status}/${x.action}${x.question?'/'+x.question.kind:''}`),firstAsk:weeks.find(x=>x.status==='ASK')??null,intense:intense(t.p),easyWeeksDoneMax:Math.max(...t.p.stateTrace.map(st=>st.run.easyWeeksDone??0)),runsByWeek:t.p.weeks.map((_,k)=>`${k}:${runRows(t.p,k).join('/')}`),lastPlanValidity:weeks.at(-1).planValidity,runLedger:t.ledger.filter(o=>o.context?.sport==='RUN').length};
}
guard('F1_QRE_R6_04',()=>{
 const sim=rt=>{const s=rt.simulateProgram(F1_INPUT,{default:{missed:[{sport:'RUN'}]}},rt.opts),dec=s.rows.map(r=>r.weekly?.result).filter(Boolean);
  return {testAssertions:{runLedger:s.actualLedger.filter(o=>o.context?.sport==='RUN').length,intense:intense(s.finalProgram),easyWeeksDoneAllZero:s.finalProgram.stateTrace.every(st=>(st.run.easyWeeksDone??0)===0)},statuses:dec.map((r,i)=>`${i}:${r.status}`),invariants:s.invariants};};
 const loops={};for(const [n,rt] of [['B2',B2],['R7C',NOW]])for(const v of ['UNREPORTED','KNOWN_MISS'])loops[`${n}_${v}`]=f1Loop(rt,v);
 return {simulatorAsInTest:{B2:sim(B2),R7C:sim(NOW)},loops,
  knownMissR7CEqualsUnreportedB2:{runs:JSON.stringify(loops.R7C_KNOWN_MISS.runsByWeek)===JSON.stringify(loops.B2_UNREPORTED.runsByWeek),intense:JSON.stringify(loops.R7C_KNOWN_MISS.intense)===JSON.stringify(loops.B2_UNREPORTED.intense)}};
});

// ---------- F2: D18 (test/r6-ssctr-revision.test.mjs:51) ----------
guard('F2_D18',()=>{
 const entry=NOW.opts.authority.policy.operational.return.entryRunMinutes;
 const one=(rt,variant)=>{
  const p=rt.generateProgram(rt.PROFILES.A_RUN_FIRST_HALF_MARATHON,rt.opts).program,w=6,last=p.weeks[w].sessions.at(-1).date;
  let t={p,ledger:[]};
  // EMPTY_REVIEWED: the r12 weekly-review contract path, every elapsed week reviewed with unreported sessions reviewed as missed.
  if(variant==='EMPTY_REVIEWED')for(let k=0;k<w;k++){const r=rt.evaluateProgram(t.p,{...rt.H.review(t.p,k),actualLedger:t.ledger},rt.opts);t.ledger=r.actualLedger??t.ledger;if(r.proposal)t.p=r.proposal;}
  const obs=variant==='KNOWN_MISS'?t.p.weeks.slice(0,w+1).flatMap(x=>x.sessions).filter(s=>s.sport==='RUN'&&s.prescription&&s.status!=='SKIPPED'&&s.date<=last).map(s=>notDone(rt,t.p,s)):[];
  const r=rt.evaluateProgram(t.p,{version:'R6-REVIEW-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:last+'T21:00:00Z',weekIndex:w,event:{id:'empty',kind:'WEEKLY_REVIEW'},eligibility:elig(last),observations:obs,actualLedger:t.ledger},rt.opts);
  const wk=r.proposal?.weeks[w+1];
  return {...brief(r),week7:wk?runRows(r.proposal,w+1):null,d18EntryOnly:wk?wk.sessions.filter(s=>s.sport==='RUN'&&s.prescription&&s.role!=='RACE'&&s.prescription.family!=='WALK').every(s=>s.prescription.durationMinutes<=entry):null};
 };
 const o={entryRunMinutes:entry};for(const [n,rt] of [['B2',B2],['R7C',NOW]])for(const v of ['UNREPORTED','EMPTY_REVIEWED','KNOWN_MISS'])o[`${n}_${v}`]=one(rt,v);
 o.knownMissR7CEqualsUnreportedB2=JSON.stringify(o.R7C_KNOWN_MISS.week7)===JSON.stringify(o.B2_UNREPORTED.week7);
 return o;
});

// ---------- F3: SSCTR F3 on R6-H25 (test/r7asc-state-consumer.test.mjs:232) ----------
guard('F3_H25',()=>{
 const hi=NOW.opts.authority.policy.operational.strength.goalDoses.MAINTAIN.repRange[1];
 const f3=(P)=>{if(!P)return {proposal:false};const rows=P.weeks.slice(7).flatMap(w=>w.sessions.filter(s=>s.prescription&&s.status!=='SKIPPED'&&s.sport==='STRENGTH').flatMap(s=>s.prescription.exercises.filter(e=>['bench-press','lat-pulldown'].includes(e.id)).map(e=>({w:w.index,id:e.id,reps:e.reps,mode:e.load.mode,value:e.load.value??null}))));
  return {proposal:true,goal:P.goal.strength.kind,rows:rows.length,repsWithinMaintain:rows.every(x=>x.reps<=hi),neverAbove70:rows.every(x=>x.mode!=='KNOWN'||x.value<=70),rowsDigest:JSON.stringify(rows)};};
 const base=()=>NOW.clone(NOW.corpus.cases.find(c=>c.caseId==='R6-H25'));
 // Facts for the elapsed run (and, EXECUTED, strength) sessions not yet reported at each step, resolved on the program that step sees.
 const factsFor=(rt,P,asOf,from,variant)=>{const day=asOf.slice(0,10);return P.weeks.flatMap(x=>x.sessions).filter(s=>s.prescription&&s.status!=='SKIPPED'&&s.date<day&&s.weekIndex>=from&&(variant==='EXECUTED'||s.sport==='RUN')).map(s=>variant==='EXECUTED'?{weekIndex:s.weekIndex,sport:s.sport,role:s.role,day:s.day,completed:true,actualStimulus:'AS_PRESCRIBED',response:{performance:'COMPATIBLE',recovery:'COMPATIBLE',effort:'ON_TARGET',nextDayFunction:'NORMAL'}}:{weekIndex:s.weekIndex,sport:s.sport,role:s.role,day:s.day,completed:false});};
 const variantCase=(rt,variant)=>{
  if(variant==='UNREPORTED')return base();
  const c=base(),g=rt.generateProgram(c.intake,rt.opts).program;
  c.steps[0].observationFacts=factsFor(rt,g,c.steps[0].review.asOf,0,variant);
  const first=rt.evaluateHoldoutCase({...rt.clone(c),steps:[c.steps[0]]},rt.opts),P1=first.steps[0].result.proposal;
  if(!P1)return c;
  const key=f=>[f.weekIndex,f.sport,f.role,f.day].join(':'),done=new Set(c.steps[0].observationFacts.map(key));
  c.steps[1].observationFacts=factsFor(rt,P1,c.steps[1].review.asOf,0,variant).filter(f=>!done.has(key(f)));
  return c;
 };
 const o={maintainRepHigh:hi};
 for(const [n,rt] of [['B2',B2],['R7C',NOW]])for(const v of ['UNREPORTED','KNOWN_MISS','EXECUTED']){const r=rt.evaluateHoldoutCase(variantCase(rt,v),rt.opts);o[`${n}_${v}`]={steps:r.steps.map((s,i)=>({step:'S'+(i+1),...brief(s.result)})),f3:f3(r.steps.at(-1).result.proposal)};}
 o.knownMissR7CEqualsUnreportedB2={f3Rows:o.R7C_KNOWN_MISS.f3.rowsDigest===o.B2_UNREPORTED.f3.rowsDigest};
 return o;
});

// ---------- F4: request §19 (test/r7b-hybrid-program.test.mjs:85) ----------
guard('F4_S19',()=>{
 const one=(rt,variant)=>{
  const {H}=rt,longOf=(p,w)=>H.runs(p,w).find(s=>s.role==='LONG')?.prescription.durationMinutes;
  const m=H.reviewed({id:'h-prog-missed',goals:{run:'PERFORMANCE',strength:'GENERAL'},weeks:12},0);let last=null;const weeks=[];
  for(let w=0;w<5;w++){last=H.weekly(m,w,variant==='KNOWN_MISS'?{o:()=>({actual:{completed:false}})}:{keep:()=>false});weeks.push(`${w}:${last.status}/${last.action}${last.question?'/'+last.question.kind:''}`);}
  const block=(last.disclosures??[]).find(d=>d.id==='BLOCK_REVIEW')??null;
  return {weeks,long1:longOf(m.p,1),long5:longOf(m.p,5),state5Long:m.p.stateTrace[5].run.long,blockReview:block?{held:block.held}:null,lastMissing:last.missingInputs??[]};
 };
 const o={};for(const [n,rt] of [['B2',B2],['R7C',NOW]])for(const v of ['UNREPORTED','KNOWN_MISS'])o[`${n}_${v}`]=one(rt,v);
 o.knownMissR7CEqualsUnreportedB2={block:JSON.stringify(o.R7C_KNOWN_MISS.blockReview)===JSON.stringify(o.B2_UNREPORTED.blockReview),long:o.R7C_KNOWN_MISS.long5===o.B2_UNREPORTED.long5&&o.R7C_KNOWN_MISS.state5Long===o.B2_UNREPORTED.state5Long};
 return o;
});
x.cleanup();
console.log(JSON.stringify(out,null,1));
