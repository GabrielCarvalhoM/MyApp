// RepMile #68 engine replay (read-only; in-memory store; synthetic athlete; no personal data). Every RepMileUI athlete write site, with the
// request shaped exactly as its Swift view model encodes it (ReviewRequest.encode, AthleteObservation.encode), sent through the real
// integration boundary (CoachingCore createIntegration → custody → engine). Usage: node i68-write-sites.mjs <repo root>
const ROOT=process.argv[2];
const {athlete,ELIG}=await import(ROOT+'/CoachingCore/test/v1int-helpers.mjs');
const {loggedEntries}=await import(ROOT+'/ios/Packages/CoachingPresentation/Facade/app-projections.mjs');
let seq=0;const newId=p=>`${p}_${String(++seq).padStart(6,'0')}`;
const addDay=(d,n=1)=>new Date(Date.parse(d+'T12:00:00Z')+n*86400000).toISOString().slice(0,10);
let failures=0;const check=(label,cond)=>{console.log(`  ${cond?'PASS':'FAIL'} ${label}`);if(!cond)failures++;};
const U={performance:'UNKNOWN',recovery:'UNKNOWN',effort:'UNKNOWN',nextDayFunction:'UNKNOWN'};
// The six flags nil-free and confirmed, as EligibilityForm produces it after "Nenhum destes se aplica"; assessedAt = the plan's today.
const NONE=day=>ELIG(day);
const NO_SIGNS={feverOrChills:false,chestPainPressureOrTightness:false,breathlessAtRest:false,palpitationsAtRest:false,faintingOrDizziness:false,painThatChangesMovement:false,swelling:false,injuryFromFallOrImpact:false};
const ans=r=>r.ok?`ok status=${r.status} recorded=${r.recorded?.length??0} missing=${JSON.stringify(r.decision?.missingInputs??[])} view=${r.view?.state??'-'}`:`refused ${r.error?.code}`;
const state=t=>t.api.status({actor:t.actor}).state;

// ---- Swift builders (one line each, as the view models build them) ----
// RunReportViewModel.makeObservation (planned): sessionId, the session's date, observedAt = the recording's end, the athlete's statements.
const plannedRun=(s,end)=>({sessionId:s.id,occurrenceDate:s.date,observedAt:end,actual:{completed:true,minutes:40,rpe:4},response:{...U,effort:'ON_TARGET'}});
// RunReportViewModel.makeObservation (unplanned): sport-tagged actual, effort UNKNOWN.
const unplannedRun=(day,end)=>({occurrenceDate:day,observedAt:end,actual:{completed:true,minutes:30,rpe:3,sport:'RUN'},response:U});
// StrengthLogViewModel.observation (planned): only stated sets, load as typed; response UNKNOWN.
const plannedStrength=(s,end)=>({sessionId:s.id,occurrenceDate:s.date,observedAt:end,actual:{completed:true,minutes:45,
 exercises:s.prescription.exercises.map(e=>({id:e.id,sets:Array.from({length:e.sets},()=>({reps:e.reps??8}))}))},response:U});
const unplannedStrength=(day,end)=>({occurrenceDate:day,observedAt:end,actual:{completed:true,minutes:30,exercises:[],sport:'STRENGTH'},response:U});
const report=(obs,eligibility)=>({kind:'WEEKLY_REVIEW',observations:[obs],...(eligibility?{eligibility}:{})});
const unavailable=(day,eligibility)=>({kind:'UNAVAILABLE_DAY',changes:{unavailableDates:[day]},...(eligibility?{eligibility}:{})});
const notFeeling=(eligibility)=>({kind:'NOT_FEELING_100',wellbeing:{condition:'MILD_ILLNESS',warningSigns:{...NO_SIGNS},intent:'REST'},...(eligibility?{eligibility}:{})});
const readiness=(eligibility)=>({kind:'READINESS_DECLARATION',readiness:{declaredRecovered:true,warningSigns:{...NO_SIGNS},sports:{RUN:{ready:true},STRENGTH:{ready:true,restrictions:[]}}},...(eligibility?{eligibility}:{})});

function fresh(name){const t=athlete({newId,id:'i68-'+name,weeks:12});const e=t.enroll();if(!e.ok)throw new Error('enroll '+e.error?.code);
 const run=t.sessions(0).find(x=>x.sport==='RUN'),str=t.sessions(0).find(x=>x.sport==='STRENGTH');return {t,run,str};}
const endOf=t=>new Date(t.clock-15*60000).toISOString();
const kept=(t,r)=>r.ok&&(r.recorded??[]).length>0;

console.log('=== 1 run report, planned (RunReportViewModel)');
{const {t,run}=fresh('run-nil');t.set(run.date,'20:00');const r=t.submit(report(plannedRun(run,endOf(t)),null));console.log('  eligibility nil →',ans(r));
 check('nil: ASK eligibility.currentAssessment, nothing recorded',r.ok&&r.status==='ASK'&&r.recorded?.length===0&&r.decision?.missingInputs?.includes('eligibility.currentAssessment'));
 const r2=t.submit(report(plannedRun(run,endOf(t)),NONE(run.date)));console.log('  screen today (all no) →',ans(r2));
 check('screen dated today: recorded',kept(t,r2));
 check('the ATHLETE voice exists afterwards',loggedEntries(t.rows()).some(x=>x.sessionId===run.id&&x.voices.some(v=>v.channel==='ATHLETE')));}

console.log('=== 2 run report, unplanned (RunReportViewModel)');
{const {t,run}=fresh('urun');t.set(run.date,'20:00');const r=t.submit(report(unplannedRun(run.date,endOf(t)),null));console.log('  nil →',ans(r));
 check('nil: ASK, nothing recorded',r.ok&&r.status==='ASK'&&r.recorded?.length===0);
 const r2=t.submit(report(unplannedRun(run.date,endOf(t)),NONE(run.date)));console.log('  screen →',ans(r2));check('screen: recorded',kept(t,r2));}

console.log('=== 3 strength log, planned (StrengthLogViewModel)');
{const {t,str}=fresh('str');t.set(str.date,'20:00');const r=t.submit(report(plannedStrength(str,endOf(t)),null));console.log('  nil →',ans(r));
 check('nil: ASK, nothing recorded',r.ok&&r.status==='ASK'&&r.recorded?.length===0);
 const r2=t.submit(report(plannedStrength(str,endOf(t)),NONE(str.date)));console.log('  screen →',ans(r2));check('screen: recorded',kept(t,r2));}

console.log('=== 4 strength log, unplanned (StrengthLogViewModel)');
{const {t,str}=fresh('ustr');t.set(str.date,'20:00');const r=t.submit(report(unplannedStrength(str.date,endOf(t)),null));console.log('  nil →',ans(r));
 check('nil: ASK, nothing recorded',r.ok&&r.status==='ASK'&&r.recorded?.length===0);
 const r2=t.submit(report(unplannedStrength(str.date,endOf(t)),NONE(str.date)));console.log('  screen →',ans(r2));check('screen: recorded',kept(t,r2));}

console.log('=== 5 unavailable day (UnavailableDayViewModel)');
{const {t,run}=fresh('unav');const day=t.doc().program.weeks[0].startDate;t.set(day,'08:00');const target=t.sessions(0).find(x=>x.date>day)??run;
 const r=t.submit(unavailable(target.date,null));console.log(`  nil (day ${target.date}) →`,ans(r),'pending=',!!r.decisionId||!!r.pending);
 const a=t.api.status({actor:t.actor});console.log('  view after:',a.state,'pending:',JSON.stringify(a.pending?.decisionId??null));
 check('nil: classified (recorded below)',true);globalThis.UNAV={status:r.status,missing:r.decision?.missingInputs};
 const {t:t2}=fresh('unav2');t2.set(day,'08:00');const r2=t2.submit(unavailable(target.date,NONE(day)));console.log('  screen →',ans(r2));globalThis.UNAV2={status:r2.status};}

console.log('=== 6 "Não estou 100%" from the shell (NotFeeling100ViewModel requireEligibility=false)');
{const {t,run}=fresh('nf');t.set(run.date,'08:00');const r=t.submit(notFeeling(null));console.log('  nil →',ans(r));globalThis.NF={status:r.status,missing:r.decision?.missingInputs};
 const {t:t2}=fresh('nf2');t2.set(run.date,'08:00');const r2=t2.submit(notFeeling(NONE(run.date)));console.log('  screen →',ans(r2));}

console.log('=== 7 readiness declaration (ReadinessViewModel) after a clinical hold');
{const {t,run}=fresh('rd');t.set(run.date,'20:00');const h=t.submit(report(plannedRun(run,endOf(t)),{...NONE(run.date),status:undefined,pain:true}));
 console.log('  run report with a flag "sim" →',ans(h),'state=',state(t));
 check('a "yes" flag: CLINICAL_HUMAN_REQUIRED, the report not recorded, the plan view BLOCKED',h.ok&&h.status==='CLINICAL_HUMAN_REQUIRED'&&h.recorded?.length===0&&state(t)==='BLOCKED');
 const next=addDay(run.date,3);t.set(next,'09:00');const r=t.submit(readiness(null));console.log('  readiness nil →',ans(r),'state=',state(t));globalThis.RD={status:r.status,missing:r.decision?.missingInputs};
 const r2=t.submit(readiness(NONE(next)));console.log('  readiness with screen →',ans(r2),'action=',r2.action??r2.decision?.action,'state=',state(t));}

console.log('=== 7b symptom stop + a flag "sim" in the same report (FixtureCoaching gate order)');
{const {t,run}=fresh('stopyes');t.set(run.date,'20:00');const o=plannedRun(run,endOf(t));o.actual={completed:false,minutes:12,rpe:8,stop:{reason:'SYMPTOM'}};o.response={...U,effort:'HARDER'};
 const r=t.submit(report(o,{...NONE(run.date),status:undefined,pain:true}));console.log('  stop SYMPTOM + pain "sim" →',ans(r),'warningSignScreen=',r.warningSignScreen?.status??null,'state=',state(t));
 check('CLINICAL_HUMAN_REQUIRED, nothing recorded, plan BLOCKED, AND the warning-sign screen REQUIRED (the app shows both; no capture holds both, so fixture mode shows the clinical route only)',r.ok&&r.status==='CLINICAL_HUMAN_REQUIRED'&&r.recorded?.length===0&&r.warningSignScreen?.status==='REQUIRED'&&state(t)==='BLOCKED');}

console.log('=== 8 window and reuse (the athlete channel never carries a screen on record)');
{const {t,run}=fresh('win');t.set(run.date,'20:00');const s=t.submit({kind:'WEEKLY_REVIEW',eligibility:NONE(run.date)});console.log('  screen alone →',ans(s));
 const r=t.submit(report(plannedRun(run,endOf(t)),null));console.log('  same day, report without screen →',ans(r));
 check('a screen answered earlier the same day is not reused for the athlete\'s report (ASK)',r.ok&&r.status==='ASK'&&r.recorded?.length===0);}
for(const [gap,expect] of [[0,'KEEP'],[14,'recorded'],[15,'ASK']]){const {t,run}=fresh('gap'+gap);t.set(run.date,'20:00');
 const r=t.submit(report(plannedRun(run,endOf(t)),NONE(addDay(run.date,-gap))));console.log(`  screen assessed ${gap} day(s) before →`,ans(r));
 check(`assessedAt ${gap} days before: ${expect==='ASK'?'ASK':'recorded'}`,expect==='ASK'?r.status==='ASK':kept(t,r));}
{const {t,run}=fresh('future');t.set(run.date,'20:00');const r=t.submit(report(plannedRun(run,endOf(t)),NONE(addDay(run.date,1))));console.log('  screen dated tomorrow →',ans(r));check('a screen dated after the report day: ASK',r.status==='ASK');}
{const {t,run}=fresh('partial');t.set(run.date,'20:00');const r=t.submit(report(plannedRun(run,endOf(t)),{...NONE(run.date),injury:null}));console.log('  one flag null →',ans(r));check('a flag left null (nil ≠ false): ASK',r.status==='ASK');}
{const {t,run}=fresh('nostatus');t.set(run.date,'20:00');const r=t.submit(report(plannedRun(run,endOf(t)),{...NONE(run.date),status:undefined}));console.log('  all no, not confirmed →',ans(r));check('six "não" without NONCLINICAL_CONFIRMED: ASK',r.status==='ASK');}

console.log('=== summary');
console.log('  UNAVAILABLE_DAY nil →',JSON.stringify(globalThis.UNAV),'| with screen →',JSON.stringify(globalThis.UNAV2));
console.log('  NOT_FEELING_100 nil →',JSON.stringify(globalThis.NF));
console.log('  READINESS_DECLARATION nil →',JSON.stringify(globalThis.RD));
console.log(failures?`RESULT: ${failures} FAILED`:'RESULT: ALL PASS');process.exitCode=failures?1:0;
