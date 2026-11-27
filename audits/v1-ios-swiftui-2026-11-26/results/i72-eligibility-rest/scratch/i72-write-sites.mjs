// RepMile #72 engine replay (read-only; in-memory store; synthetic athlete; no personal data). Extends #68's replay
// (../../i68-report-eligibility/scratch/i68-write-sites.mjs) to the three athlete write sites #68 left: "Não estou 100%" (NOT_FEELING_100),
// the readiness declaration (READINESS_DECLARATION) and the unavailable day (UNAVAILABLE_DAY). Each request is shaped as its Swift view model
// encodes it (ReviewRequest.encode: the engine's own sign set per condition, `warningSignSet`, asked signs only), sent through the real
// integration boundary (CoachingCore createIntegration → custody → engine). For each site: the answer without a screen, with an answered
// screen, and, for the two sign flows, a red-flag sign WITHOUT a screen (does the engine route it before the screen?).
// Usage: node i72-write-sites.mjs <repo root>
const ROOT=process.argv[2];
const {athlete,ELIG}=await import(ROOT+'/CoachingCore/test/v1int-helpers.mjs');
const {warningSignSet}=await import(ROOT+'/ios/Packages/CoachingPresentation/Facade/app-projections.mjs');
const {URGENT_SIGNS}=await import(ROOT+'/CoachingCore/src/v1-f08.mjs');
let seq=0;const newId=p=>`${p}_${String(++seq).padStart(6,'0')}`;
const addDay=(d,n=1)=>new Date(Date.parse(d+'T12:00:00Z')+n*86400000).toISOString().slice(0,10);
let failures=0;const check=(label,cond)=>{console.log(`  ${cond?'PASS':'FAIL'} ${label}`);if(!cond)failures++;};
const U={performance:'UNKNOWN',recovery:'UNKNOWN',effort:'UNKNOWN',nextDayFunction:'UNKNOWN'};
const NONE=day=>ELIG(day);                                   // six "não" + NONCLINICAL_CONFIRMED, as EligibilityForm after the confirmation
const FLAG=(day,k)=>({...ELIG(day),status:undefined,[k]:true});// one flag "sim", never confirmed nonclinical (EligibilityForm clears it)
const PARTIAL=day=>({...ELIG(day),status:undefined,illness:null});
const g=r=>r.decision?.guidance?.level??r.guidance?.level??null;
const ans=r=>r.ok?`status=${r.status} action=${r.action} guidance=${g(r)} recorded=${r.recorded?.length??0} missing=${JSON.stringify(r.decision?.missingInputs??[])} decisionId=${r.decisionId?'yes':'no'}`:`refused ${r.error?.code}`;
const view=t=>{const s=t.api.status({actor:t.actor});return `${s.state} pending=${s.pending?.decisionId?'yes':'no'} holdGuidance=${s.hold?.guidance?.level??'-'}`;};
const state=t=>t.api.status({actor:t.actor}).state;
const allNo=signs=>Object.fromEntries(signs.map(k=>[k,false]));
const set=c=>warningSignSet(c);
// NotFeeling100ViewModel.makeRequest: condition, the asked signs answered, intent; eligibility only when the flow carries it.
const nf=(c,signs,intent,eligibility)=>({kind:'NOT_FEELING_100',wellbeing:{condition:c,warningSigns:signs,...(intent?{intent}:{})},...(eligibility?{eligibility}:{})});
// ReadinessViewModel.request: declaredRecovered, the READINESS set answered, both sports ready, no restriction.
const rd=(signs,eligibility)=>({kind:'READINESS_DECLARATION',readiness:{declaredRecovered:true,warningSigns:signs,sports:{RUN:{ready:true},STRENGTH:{ready:true,restrictions:[]}}},...(eligibility?{eligibility}:{})});
const unavailable=(day,eligibility)=>({kind:'UNAVAILABLE_DAY',changes:{unavailableDates:[day]},...(eligibility?{eligibility}:{})});
function fresh(name){const t=athlete({newId,id:'i72-'+name,weeks:12});const e=t.enroll();if(!e.ok)throw new Error('enroll '+e.error?.code);
 const run=t.sessions(0).find(x=>x.sport==='RUN');return {t,run};}
const endOf=t=>new Date(t.clock-15*60000).toISOString();
const plannedRun=(s,end)=>({sessionId:s.id,occurrenceDate:s.date,observedAt:end,actual:{completed:true,minutes:40,rpe:4},response:{...U,effort:'ON_TARGET'}});
/** A clinical hold on record: a run report with a flag "sim" (replay i68 7). */
function held(name){const {t,run}=fresh(name);t.set(run.date,'20:00');
 const h=t.submit({kind:'WEEKLY_REVIEW',observations:[plannedRun(run,endOf(t))],eligibility:FLAG(run.date,'pain')});
 if(h.status!=='CLINICAL_HUMAN_REQUIRED')throw new Error('hold '+ans(h));const next=addDay(run.date,3);t.set(next,'09:00');return {t,run,day:next};}
const T={};

console.log('=== 1 "Não estou 100%" WITHOUT a screen (shell: requireEligibility=false)');
for(const c of ['MILD_ILLNESS','MINOR_DISCOMFORT','NEED_REST']){const s=set(c);
 {const {t,run}=fresh('nf0'+c);t.set(run.date,'08:00');const r=t.submit(nf(c,allNo(s.warningSigns),s.intents.at(-1),null));console.log(`  ${c}, every sign "não", no screen →`,ans(r));
  check(`${c}: ASK eligibility.currentAssessment, nothing decided`,r.status==='ASK'&&r.decision?.missingInputs?.includes('eligibility.currentAssessment'));T['nf.none.noScreen.'+c]=r.status;}
 for(const k of s.warningSigns){const {t,run}=fresh('nf1'+c+k);t.set(run.date,'08:00');
  const r=t.submit(nf(c,{...allNo(s.warningSigns),[k]:true},s.intents.at(-1),null));const urgent=URGENT_SIGNS.includes(k);
  if(urgent||k===s.warningSigns[0])console.log(`  ${c}, "${k}" sim${urgent?' (URGENT sign)':''}, no screen →`,ans(r),'| view',view(t));
  check(`${c} ${k}: without a screen the engine ASKs the screen (no clinical route, no guidance)`,r.status==='ASK'&&g(r)===null&&r.decision?.missingInputs?.includes('eligibility.currentAssessment'));}
 {const {t,run}=fresh('nf2'+c);t.set(run.date,'08:00');const r=t.submit(nf(c,{chestPainPressureOrTightness:true},null,null));console.log(`  ${c}, only chest pain answered (sim), others unanswered, no intent, no screen →`,ans(r));
  check(`${c}: a lone red flag, no screen: still ASK eligibility`,r.status==='ASK'&&r.decision?.missingInputs?.includes('eligibility.currentAssessment'));}}

console.log('=== 2 "Não estou 100%" WITH the screen (as the flow sends it after #72)');
for(const c of ['MILD_ILLNESS','MINOR_DISCOMFORT','NEED_REST']){const s=set(c);
 {const {t,run}=fresh('nf3'+c);t.set(run.date,'08:00');const r=t.submit(nf(c,allNo(s.warningSigns),s.intents.at(-1),NONE(run.date)));console.log(`  ${c}, every sign "não", screen none applies →`,ans(r),'| view',view(t));T['nf.none.screen.'+c]=r.status;}
 for(const k of URGENT_SIGNS.filter(k=>s.warningSigns.includes(k))){const {t,run}=fresh('nf4'+c+k);t.set(run.date,'08:00');
  const r=t.submit(nf(c,{...allNo(s.warningSigns),[k]:true},s.intents.at(-1),NONE(run.date)));console.log(`  ${c}, "${k}" sim (URGENT), screen none applies →`,ans(r),'| view',view(t));
  check(`${c} ${k} + screen: CLINICAL_HUMAN_REQUIRED, URGENT_CARE_ADVISED, plan BLOCKED`,r.status==='CLINICAL_HUMAN_REQUIRED'&&g(r)==='URGENT_CARE_ADVISED'&&state(t)==='BLOCKED');}
 {const k=s.warningSigns.find(x=>!URGENT_SIGNS.includes(x));const {t,run}=fresh('nf5'+c);t.set(run.date,'08:00');
  const r=t.submit(nf(c,{...allNo(s.warningSigns),[k]:true},s.intents.at(-1),NONE(run.date)));console.log(`  ${c}, "${k}" sim (not urgent), screen none applies →`,ans(r));
  check(`${c} ${k} + screen: CLINICAL, PROFESSIONAL_ASSESSMENT`,r.status==='CLINICAL_HUMAN_REQUIRED'&&g(r)==='PROFESSIONAL_ASSESSMENT');}
 {const {t,run}=fresh('nf6'+c);t.set(run.date,'08:00');const r=t.submit(nf(c,{chestPainPressureOrTightness:true},null,NONE(run.date)));
  console.log(`  ${c}, only chest pain answered (sim), others unanswered, no intent, screen none applies →`,ans(r));
  check(`${c}: a lone urgent sign with the screen routes urgently even with the other signs unanswered`,r.status==='CLINICAL_HUMAN_REQUIRED'&&g(r)==='URGENT_CARE_ADVISED');}
 for(const f of ['illness','pain','clinicalConcern']){const {t,run}=fresh('nf7'+c+f);t.set(run.date,'08:00');
  const r=t.submit(nf(c,{...allNo(s.warningSigns),chestPainPressureOrTightness:true},s.intents.at(-1),FLAG(run.date,f)));
  console.log(`  ${c}, chest pain sim + screen flag "${f}" sim →`,ans(r));T[`nf.urgent.flag.${f}.${c}`]=g(r);
  check(`${c} chest pain + flag ${f}: clinical (the level is the engine's: reported below)`,r.status==='CLINICAL_HUMAN_REQUIRED');}
 {const {t,run}=fresh('nf8'+c);t.set(run.date,'08:00');const r=t.submit(nf(c,allNo(s.warningSigns),s.intents.at(-1),FLAG(run.date,'illness')));
  console.log(`  ${c}, every sign "não", screen flag "illness" sim →`,ans(r));check(`${c}: a flag sim alone: CLINICAL`,r.status==='CLINICAL_HUMAN_REQUIRED');}
 {const {t,run}=fresh('nf9'+c);t.set(run.date,'08:00');const r=t.submit(nf(c,{...allNo(s.warningSigns),chestPainPressureOrTightness:true},s.intents.at(-1),PARTIAL(run.date)));
  console.log(`  ${c}, chest pain sim + screen with one flag unanswered →`,ans(r));T['nf.urgent.partial.'+c]=r.status;
  check(`${c}: chest pain + incomplete screen: ASK (the app never sends an incomplete screen)`,r.status==='ASK');}
 {const {t,run}=fresh('nfA'+c);t.set(run.date,'08:00');const r=t.submit(nf(c,{...allNo(s.warningSigns),chestPainPressureOrTightness:true},s.intents.at(-1),NONE(addDay(run.date,1))));
  console.log(`  ${c}, chest pain sim + screen dated tomorrow →`,ans(r));check(`${c}: a screen dated after the plan's day: ASK`,r.status==='ASK');}}

console.log('=== 3 "Não estou 100%" during a clinical hold');
{const {t,day}=held('nfh');const s=set('MILD_ILLNESS');
 const r=t.submit(nf('MILD_ILLNESS',{...allNo(s.warningSigns),chestPainPressureOrTightness:true},'REST',null));console.log('  hold, chest pain sim, no screen →',ans(r),'| view',view(t));T['nf.hold.noScreen']=`${r.status}/${g(r)}`;
 const r2=t.submit(nf('MILD_ILLNESS',{...allNo(s.warningSigns),chestPainPressureOrTightness:true},'REST',NONE(day)));console.log('  hold, chest pain sim, screen →',ans(r2),'| view',view(t));T['nf.hold.screen']=`${r2.status}/${g(r2)}`;}

console.log('=== 4 readiness declaration after a clinical hold (ReadinessViewModel)');
{const s=set('READINESS');
 {const {t}=held('rd0');const r=t.submit(rd(allNo(s.warningSigns),null));console.log('  every sign "não", no screen →',ans(r),'| view',view(t));
  check('no screen: CLINICAL + eligibility.currentAssessment missing, the hold stands',r.status==='CLINICAL_HUMAN_REQUIRED'&&r.decision?.missingInputs?.includes('eligibility.currentAssessment')&&state(t)==='BLOCKED');}
 {const {t}=held('rd1');const r=t.submit(rd({...allNo(s.warningSigns),breathlessAtRest:true},null));console.log('  breathless at rest sim (URGENT), no screen →',ans(r),'| view',view(t));T['rd.urgent.noScreen']=`${r.status}/${g(r)}`;
  check('urgent sign, no screen: clinical (hold stands); the level is reported',r.status==='CLINICAL_HUMAN_REQUIRED'&&state(t)==='BLOCKED');}
 {const {t,day}=held('rd2');const r=t.submit(rd(allNo(s.warningSigns),NONE(day)));console.log('  every sign "não", screen none applies →',ans(r),'| view',view(t));
  check('screen: the hold is released (MODIFY, READINESS_RESTART)',r.status==='MODIFY'&&r.action==='READINESS_RESTART'&&state(t)!=='BLOCKED');}
 {const {t,day}=held('rd3');const r=t.submit(rd({...allNo(s.warningSigns),breathlessAtRest:true},NONE(day)));console.log('  breathless sim, screen →',ans(r),'| view',view(t));
  check('urgent sign + screen: CLINICAL, URGENT_CARE_ADVISED',r.status==='CLINICAL_HUMAN_REQUIRED'&&g(r)==='URGENT_CARE_ADVISED');}
 {const {t,day}=held('rd4');const r=t.submit(rd(allNo(s.warningSigns),FLAG(day,'pain')));console.log('  every sign "não", screen flag pain sim →',ans(r),'| view',view(t));
  check('a flag sim: CLINICAL, the hold stands',r.status==='CLINICAL_HUMAN_REQUIRED'&&state(t)==='BLOCKED');}
 {const {t,day}=held('rd5');const r=t.submit(rd(allNo(s.warningSigns),PARTIAL(day)));console.log('  every sign "não", screen incomplete →',ans(r));
  check('incomplete screen: the hold stands',r.status!=='MODIFY'&&state(t)==='BLOCKED');}
 {const {t,day}=held('rd6');const r=t.submit(rd(allNo(s.warningSigns),NONE(addDay(day,1))));console.log('  screen dated tomorrow →',ans(r));
  check('a screen after the plan\'s day: the hold stands',r.status!=='MODIFY'&&state(t)==='BLOCKED');}
 {const {t,day}=held('rd7');const p=allNo(s.warningSigns);delete p.gettingWorse;const r=t.submit(rd(p,NONE(day)));console.log('  one sign unanswered, screen →',ans(r));
  check('a sign unanswered: not released',r.status!=='MODIFY'&&state(t)==='BLOCKED');}}

console.log('=== 5 unavailable day (UnavailableDayViewModel)');
{const probe=fresh('u');const day=probe.t.doc().program.weeks[0].startDate;const target=probe.t.sessions(0).find(x=>x.date>day);
 {const {t}=fresh('u0');t.set(day,'08:00');const r=t.submit(unavailable(target.date,null));console.log(`  no screen (day ${target.date}) →`,ans(r),'| view',view(t));
  check('no screen: ASK eligibility (a decisionId but nothing pending: never a proposal)',r.status==='ASK'&&r.decision?.missingInputs?.includes('eligibility.currentAssessment')&&!t.api.status({actor:t.actor}).pending);}
 {const {t}=fresh('u1');t.set(day,'08:00');const r=t.submit(unavailable(target.date,NONE(day)));console.log('  screen →',ans(r),'| view',view(t));
  const st=t.api.status({actor:t.actor});check('screen: MODIFY with a pending decision',r.status==='MODIFY'&&!!st.pending?.decisionId);
  if(st.pending?.decisionId){const a=t.it.accept?t.it.accept({actor:t.actor,clientRequestId:t.rid('acc'),expectedVersion:t.version(),decisionId:st.pending.decisionId}):t.api.accept({actor:t.actor,decisionId:st.pending.decisionId});
   console.log('  accept →',a.ok?`ok status=${a.status}`:`refused ${a.error?.code}`,'| view',view(t));check('the move is applied once accepted',a.ok);}}
 {const {t}=fresh('u2');t.set(day,'08:00');const r=t.submit(unavailable(target.date,FLAG(day,'injury')));console.log('  screen flag injury sim →',ans(r),'| view',view(t));
  check('a flag sim: CLINICAL, nothing pending',r.status==='CLINICAL_HUMAN_REQUIRED'&&!t.api.status({actor:t.actor}).pending);}
 {const {t}=fresh('u3');t.set(day,'08:00');const r=t.submit(unavailable(target.date,NONE(addDay(day,1))));console.log('  screen dated tomorrow →',ans(r));check('a future screen: ASK',r.status==='ASK');}}

console.log('=== summary');console.log('  '+JSON.stringify(T));
console.log(failures?`RESULT: ${failures} FAILED`:'RESULT: ALL PASS');process.exitCode=failures?1:0;
