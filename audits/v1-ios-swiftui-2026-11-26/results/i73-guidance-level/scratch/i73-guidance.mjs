// RepMile #73 engine replay (read-only; in-memory store; synthetic athlete; no personal data). Which guidance level the app shows for each
// clinical answer of the frozen CoachingCore. Each request is shaped as its Swift view model encodes it (as in i72-write-sites.mjs) and sent
// through the integration boundary as front A's host does: `integration.submit`, then the plan view the host facade appends (api.mjs `done`).
// `shown` mirrors RepMileUI exactly (Features/Adapt/ClinicalGuidance.swift + the view models' outcome mapping):
//   - a clinical route = ok and (status CLINICAL_HUMAN_REQUIRED or view.state BLOCKED);
//   - its level = URGENT if view.lastDecision (only when it is this answer's own decisionId) or view.hold says URGENT_CARE_ADVISED, else
//     PROFESSIONAL (an unknown or missing level included); the plan view (Today, session detail) = view.hold's level.
// The engine's own level (`decision.guidance.level`, not in the frozen Swift port) is printed beside it: the app must never show less.
// Usage: node i73-guidance.mjs <repo root>
const ROOT=process.argv[2];
const {athlete,ELIG}=await import(ROOT+'/CoachingCore/test/v1int-helpers.mjs');
const {warningSignSet}=await import(ROOT+'/ios/Packages/CoachingPresentation/Facade/app-projections.mjs');
const {URGENT_SIGNS}=await import(ROOT+'/CoachingCore/src/v1-f08.mjs');
let seq=0;const newId=p=>`${p}_${String(++seq).padStart(6,'0')}`;
const addDay=(d,n=1)=>new Date(Date.parse(d+'T12:00:00Z')+n*86400000).toISOString().slice(0,10);
let failures=0;const check=(label,cond)=>{console.log(`  ${cond?'PASS':'FAIL'} ${label}`);if(!cond)failures++;};
const rows=[];const row=(c,a,surface,note='')=>{rows.push({c,engine:engineLevel(a),shown:surface,note});};
const URG='URGENT_CARE_ADVISED';
// ---- the app's mapping (mirror of ClinicalGuidance.swift) ----
const routes=a=>a.ok&&(a.status==='CLINICAL_HUMAN_REQUIRED'||a.view?.state==='BLOCKED');
const levelOf=levels=>levels.includes(URG)?'URGENT':'PROFESSIONAL';
const answerLevel=a=>{if(!routes(a))return null;const l=a.view?.lastDecision;
 const own=l&&a.decisionId&&l.decisionId===a.decisionId?l.guidance?.level:undefined;return levelOf([own,a.view?.hold?.guidance?.level]);};
const planLevel=v=>v&&(v.hold||v.state==='BLOCKED')?levelOf([v.hold?.guidance?.level]):null;
const nfShown=a=>{if(!a.ok)return 'failed';const l=answerLevel(a);if(l)return 'blocked('+l+')';return {ASK:'needsAnswers',KEEP:'kept',MODIFY:'modified'}[a.status]??'failed';};
const rdShown=(a,hold)=>{if(a.status==='ASK'||a.view?.state==='NEEDS_INPUT')return 'needsAnswers';
 if(a.ok&&(a.action==='READINESS_RESTART'||a.view?.state==='RETURNING'))return 'returning';return 'stillBlocked('+(answerLevel(a)??planLevel(a.view)??hold??'PROFESSIONAL')+')';};
const engineLevel=a=>a?.decision?.guidance?.level??'-';
// ---- requests as the Swift view models encode them ----
const host=(t,r)=>{if(!r.ok)return r;const v=t.api.plan({actor:t.actor});return {...r,...(v.ok?{view:v.view}:{})};};
const allNo=s=>Object.fromEntries(s.map(k=>[k,false]));
const FLAG=(day,k)=>({...ELIG(day),status:undefined,[k]:true});
const nf=(c,signs,intent,eligibility)=>({kind:'NOT_FEELING_100',wellbeing:{condition:c,warningSigns:signs,...(intent?{intent}:{})},...(eligibility?{eligibility}:{})});
const rd=(signs,eligibility)=>({kind:'READINESS_DECLARATION',readiness:{declaredRecovered:true,warningSigns:signs,sports:{RUN:{ready:true},STRENGTH:{ready:true,restrictions:[]}}},...(eligibility?{eligibility}:{})});
const U={performance:'UNKNOWN',recovery:'UNKNOWN',effort:'ON_TARGET',nextDayFunction:'UNKNOWN'};
const runReport=(t,run,eligibility)=>({kind:'WEEKLY_REVIEW',observations:[{sessionId:run.id,occurrenceDate:run.date,observedAt:new Date(t.clock-15*60000).toISOString(),actual:{completed:true,minutes:40,rpe:4},response:U}],eligibility});
function fresh(name){const t=athlete({newId,id:'i73-'+name,weeks:12});const e=t.enroll();if(!e.ok)throw new Error('enroll '+e.error?.code);return {t,run:t.sessions(0).find(x=>x.sport==='RUN')};}
const submit=(t,rv)=>host(t,t.submit(rv));
/** A professional-assessment hold: a run report with the screen flag "pain" yes. */
function held(name){const {t,run}=fresh(name);t.set(run.date,'20:00');const h=submit(t,runReport(t,run,FLAG(run.date,'pain')));
 if(h.status!=='CLINICAL_HUMAN_REQUIRED')throw new Error('hold '+h.status);const day=addDay(run.date,3);t.set(day,'09:00');return {t,run,day};}
/** An urgent hold: "Não estou 100%" with chest pain and the screen. */
function urgentHold(name){const {t,run}=fresh(name);t.set(run.date,'08:00');const s=warningSignSet('MILD_ILLNESS');
 const a=submit(t,nf('MILD_ILLNESS',{...allNo(s.warningSigns),chestPainPressureOrTightness:true},'REST',ELIG(run.date)));
 if(answerLevel(a)!=='URGENT')throw new Error('urgent hold');const day=addDay(run.date,3);t.set(day,'09:00');return {t,run,day};}

console.log('=== 1 "Não estou 100%": urgent sign + complete screen (each condition, each urgent sign it asks)');
for(const c of ['MILD_ILLNESS','MINOR_DISCOMFORT','NEED_REST']){const s=warningSignSet(c);
 for(const k of URGENT_SIGNS.filter(k=>s.warningSigns.includes(k))){const {t,run}=fresh('u'+c+k);t.set(run.date,'08:00');
  const a=submit(t,nf(c,{...allNo(s.warningSigns),[k]:true},s.intents.at(-1),ELIG(run.date)));const shown=nfShown(a);
  check(`${c} ${k}: engine ${engineLevel(a)}, app ${shown}, Today ${planLevel(t.api.plan({actor:t.actor}).view)}`,engineLevel(a)===URG&&shown==='blocked(URGENT)'&&planLevel(t.api.plan({actor:t.actor}).view)==='URGENT');
  if(c==='MILD_ILLNESS'&&k===URGENT_SIGNS[0]){row(`NF ${c}, ${k} sim, screen complete`,a,shown);rows.push({c:'Today / session detail after it (plan view)',engine:a.view.hold.guidance.level+' (hold)',shown:'banner '+planLevel(t.api.plan({actor:t.actor}).view)});}}
 {const {t,run}=fresh('l'+c);t.set(run.date,'08:00');const a=submit(t,nf(c,{chestPainPressureOrTightness:true},null,ELIG(run.date)));
  check(`${c}: chest pain alone (others unanswered, no intent) + screen: app ${nfShown(a)}`,nfShown(a)==='blocked(URGENT)');}}

console.log('=== 2 "Não estou 100%": non-urgent sign + complete screen');
for(const c of ['MILD_ILLNESS','MINOR_DISCOMFORT','NEED_REST']){const s=warningSignSet(c);
 for(const k of s.warningSigns.filter(k=>!URGENT_SIGNS.includes(k))){const {t,run}=fresh('p'+c+k);t.set(run.date,'08:00');
  const a=submit(t,nf(c,{...allNo(s.warningSigns),[k]:true},s.intents.at(-1),ELIG(run.date)));const shown=nfShown(a);
  check(`${c} ${k}: engine ${engineLevel(a)}, app ${shown}`,engineLevel(a)==='PROFESSIONAL_ASSESSMENT'&&shown==='blocked(PROFESSIONAL)');
  if(c==='MILD_ILLNESS'&&k==='feverOrChills')row(`NF ${c}, ${k} sim, screen complete`,a,shown);}
 {const {t,run}=fresh('m'+c);t.set(run.date,'08:00');const k=s.warningSigns.find(x=>!URGENT_SIGNS.includes(x));
  const a=submit(t,nf(c,{...allNo(s.warningSigns),[k]:true,breathlessAtRest:true},s.intents.at(-1),ELIG(run.date)));
  check(`${c}: ${k} + breathless at rest: engine ${engineLevel(a)}, app ${nfShown(a)} (the higher level)`,nfShown(a)==='blocked(URGENT)');
  if(c==='MILD_ILLNESS')row(`NF ${c}, ${k} + breathlessAtRest sim, screen complete`,a,nfShown(a));}}

console.log('=== 3 "Não estou 100%" during a hold, urgent sign');
{const {t,day}=held('h1');const s=warningSignSet('MILD_ILLNESS');
 const a=submit(t,nf('MILD_ILLNESS',{...allNo(s.warningSigns),chestPainPressureOrTightness:true},'REST',ELIG(day)));
 check(`hold + chest pain + screen (the app always sends it): engine ${engineLevel(a)}, app ${nfShown(a)}, Today ${planLevel(t.api.plan({actor:t.actor}).view)}`,nfShown(a)==='blocked(URGENT)'&&planLevel(t.api.plan({actor:t.actor}).view)==='URGENT');
 row('NF during a hold, chest pain sim, screen complete',a,nfShown(a));}
{const {t}=held('h2');const s=warningSignSet('MILD_ILLNESS');
 const a=submit(t,nf('MILD_ILLNESS',{...allNo(s.warningSigns),chestPainPressureOrTightness:true},'REST',null));
 check(`hold + chest pain WITHOUT a screen (never sent by the app since #72): engine ${engineLevel(a)}, app ${nfShown(a)} = the engine's`,nfShown(a)==='blocked(PROFESSIONAL)'&&engineLevel(a)==='PROFESSIONAL_ASSESSMENT');
 row('NF during a hold, chest pain sim, NO screen (not sent by the app)',a,nfShown(a),'engine residual #79');}

console.log('=== 4 readiness declaration during a hold');
{const s=warningSignSet('READINESS');
 for(const k of URGENT_SIGNS.filter(k=>s.warningSigns.includes(k))){const {t,day}=held('r'+k);const a=submit(t,rd({...allNo(s.warningSigns),[k]:true},ELIG(day)));
  check(`${k} + screen: engine ${engineLevel(a)}, app ${rdShown(a,'PROFESSIONAL')}`,rdShown(a,'PROFESSIONAL')==='stillBlocked(URGENT)');
  if(k==='breathlessAtRest')row(`Readiness during a hold, ${k} sim, screen complete`,a,rdShown(a,'PROFESSIONAL'));}
 {const {t,day}=held('rg');const a=submit(t,rd({...allNo(s.warningSigns),gettingWorse:true},ELIG(day)));
  check(`gettingWorse + screen: engine ${engineLevel(a)}, app ${rdShown(a,'PROFESSIONAL')}`,rdShown(a,'PROFESSIONAL')==='stillBlocked(PROFESSIONAL)');row('Readiness during a hold, gettingWorse sim, screen complete',a,rdShown(a,'PROFESSIONAL'));}
 {const {t,day}=urgentHold('ru');const a=submit(t,rd(allNo(s.warningSigns),ELIG(day)));
  check(`urgent hold, every sign "não" + screen: app ${rdShown(a,'URGENT')}`,rdShown(a,'URGENT')==='returning');row('Readiness during an urgent hold, every sign não, screen complete',a,rdShown(a,'URGENT'));}}

console.log('=== 5 residuals of the engine (#79): the app shows the engine\'s level, never a level it did not give');
{const {t,run}=fresh('f');t.set(run.date,'08:00');const s=warningSignSet('MILD_ILLNESS');
 const a=submit(t,nf('MILD_ILLNESS',{...allNo(s.warningSigns),chestPainPressureOrTightness:true},'REST',FLAG(run.date,'illness')));
 check(`chest pain + screen flag "illness" sim: engine ${engineLevel(a)}, app ${nfShown(a)}`,nfShown(a)==='blocked(PROFESSIONAL)');
 row('NF, chest pain sim + screen flag illness sim',a,nfShown(a),'engine residual #79 (F2)');}
{const {t,day}=urgentHold('d');const s=warningSignSet('MILD_ILLNESS');
 const a=submit(t,nf('MILD_ILLNESS',{...allNo(s.warningSigns),feverOrChills:true},'REST',ELIG(day)));const v=t.api.plan({actor:t.actor}).view;
 console.log(`  urgent hold, then fever + screen: engine ${engineLevel(a)}, app ${nfShown(a)}, hold.guidance now ${v.hold?.guidance?.level} → Today ${planLevel(v)}`);
 rows.push({c:'Urgent hold, then NF fever sim + screen',engine:`${engineLevel(a)}; hold.guidance becomes ${v.hold?.guidance?.level}`,shown:`${nfShown(a)}; Today ${planLevel(v)}`,note:'engine: the hold takes the latest decision\'s level (views.mjs:58), reported to #79'});}

console.log('=== 6 report and unavailable day under a hold');
{const {t,day}=urgentHold('rr');const run=t.sessions(0).find(x=>x.sport==='RUN'&&x.date<=day)??t.sessions(0).find(x=>x.sport==='RUN');
 const a=submit(t,runReport(t,run,ELIG(day)));
 console.log(`  urgent hold, a run report (screen none applies): status ${a.status}, engine ${engineLevel(a)}, app ${answerLevel(a)??'no route'}`);
 rows.push({c:'Urgent hold, then a run report (screen none applies)',engine:`${a.status} ${engineLevel(a)}; hold ${a.view?.hold?.guidance?.level??'-'}`,shown:answerLevel(a)?'banner '+answerLevel(a):'no route',note:''});}
{const {t,run}=fresh('uv');t.set(run.date,'20:00');const a=submit(t,runReport(t,run,FLAG(run.date,'injury')));
 check(`run report, screen flag injury sim: app ${answerLevel(a)}`,answerLevel(a)==='PROFESSIONAL');row('Run report, screen flag injury sim',a,'banner '+answerLevel(a));}

console.log('=== table');
console.log('| Case | Engine level (decision) | App shows | Note |\n|---|---|---|---|');
for(const r of rows)console.log(`| ${r.c} | ${r.engine} | ${r.shown} | ${r.note??''} |`);
console.log(failures?`RESULT: ${failures} FAILED`:'RESULT: ALL PASS');process.exitCode=failures?1:0;
