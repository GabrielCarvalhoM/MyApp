// The headless synthetic journey (mission §6): the real composed entry point (v1-strength-index.mjs, no options), the headless client, its
// projections, persistence and cold restore in a fresh process. Every check states what the engine answered; none restates a training rule.
// Run: node audits/v1-app-integration-foundation-2026-11-16/harness/journey.mjs  (writes results/journey.json; exit 1 on any failed check)
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {createClient,persist,restore,todayView,weekView,sessionDetail,insightsView,digestOf,bytes,S,ENVELOPE_SCHEMA} from './lib.mjs';
import {athleteA,reportOf,liveSessions,weekFacts,at,ELIG,addDays,notFeeling100WithSign,readiness} from './scenario.mjs';
import * as P from '../../../CoachingCore/src/v1-run-forecast-index.mjs';
import {createCustody,CLIENT_REVIEW_FIELDS} from '../../../CoachingCore/src/boundary/custody.mjs';
import {memoryStore} from '../../../CoachingCore/src/boundary/store.mjs';

const HERE=path.dirname(fileURLToPath(import.meta.url)),OUT=path.join(HERE,'..','results'),WORK=fs.mkdtempSync(path.join(os.tmpdir(),'aif-journey-'));
const checks=[],measures=[],steps={},gates=[];
const check=(step,what,ok,observed)=>{checks.push({step,what,ok:!!ok,observed});if(!ok)console.error(`FAIL [${step}] ${what}: ${JSON.stringify(observed)}`);};
const ms=iso=>Date.parse(iso);
const onMeasure=(op,x)=>measures.push({op,...x});

// 1-3. Synthetic athlete, onboarding normalized by the engine, the hybrid plan.
const intake=athleteA();
check('1','the athlete is synthetic and marked SHADOW_REFERENCE',intake.synthetic===true&&intake.purpose==='SHADOW_REFERENCE',{synthetic:intake.synthetic,purpose:intake.purpose});
{const bad=structuredClone(intake);delete bad.schedule.runDays;delete bad.schedule.strengthDays;const r=S.generateProgram(bad);
 check('2','an intake without training days is not planned: the engine names what is missing',r.status!=='PROPOSED'&&!r.program,{status:r.status,missingInputs:r.missingInputs,errors:r.errors});
 steps.incompleteOnboarding={status:r.status,missingInputs:r.missingInputs??[],errors:r.errors??[]};}
const c=createClient({onMeasure}),g=c.onboard(intake),E=()=>c.envelope;
check('3','the first plan is PROPOSED',g.status==='PROPOSED',g.status);
check('2','the plan carries the engine-normalized intake (canonical)',!!g.program?.canonical,Object.keys(g.program?.canonical??{}).slice(0,12));
check('3','every approved boundary reads ON with no options; pace revision INERT',g.runFormat?.status==='ACTIVE'&&g.runForecast?.status!=='DISABLED'&&g.paceInsights?.status==='ACTIVE'&&g.paceRevision?.status==='INERT'&&g.strengthExtension?.status==='ACTIVE'&&g.strengthExposure?.status==='ACTIVE',
 {runFormat:g.runFormat?.status,runForecast:g.runForecast?.status,paceInsights:g.paceInsights?.status,paceRevision:g.paceRevision?.status,strength:g.strengthExtension?.status,exposure:g.strengthExposure?.status});
check('3','the plan is hybrid: run and strength sessions in week 0',['RUN','STRENGTH'].every(sp=>E().program.weeks[0].sessions.some(s=>s.sport===sp&&s.prescription)),E().program.weeks[0].sessions.map(s=>s.sport+':'+s.role));
steps.plan={weeks:E().program.weeks.length,startDate:E().program.startDate,engine:S.V1_STRENGTH_ENGINE,sizes:{answer:bytes(g),program:bytes(g.program)}};

// 4-5. Today, the week, a run's and a strength session's detail (projections only).
const w0=liveSessions(E(),0),firstRun=w0.find(s=>s.sport==='RUN'),firstStr=w0.find(s=>s.sport==='STRENGTH');
const nowRunDay=ms(at(firstRun.date,'07:00')),today=todayView(E(),{nowMs:nowRunDay}),week=weekView(E(),{nowMs:nowRunDay});
check('4','today shows the run of that day, executable',today.state==='VALID_PLAN'&&today.sessions.some(s=>s.id===firstRun.id&&s.executable),today.sessions);
check('4','the week lists every session of week 0',week.sessions.length===E().program.weeks[0].sessions.length,week.sessions.length);
const runD=sessionDetail(E(),{nowMs:nowRunDay,sessionId:firstRun.id}),strD=sessionDetail(E(),{nowMs:nowRunDay,sessionId:firstStr.id});
check('5','a run detail comes from the format layer (blocks) or the time prescription',runD.status==='AVAILABLE'&&!!runD.run,runD.run?.expression);
check('5','a strength detail lists exercises with sets and load',strD.status==='AVAILABLE'&&strD.strength.exercises.length>0&&strD.strength.exercises.every(e=>Number.isFinite(e.sets)&&e.load),strD.strength?.exercises?.slice(0,2));
steps.views={sizes:{today:bytes(today),week:bytes(week),runDetail:bytes(runD),strengthDetail:bytes(strD),fullAnswer:bytes(g)}};

// 6-8. A run done and reported the same evening; the Sunday review of the rest; the plan as modified by the engine.
const runReport=reportOf(E(),firstRun);
const r1=c.review('WEEKLY_REVIEW',at(firstRun.date),{eligibility:ELIG(firstRun.date),observations:[runReport]},{eventId:'log-run-1'});
check('7','the run report is on record after its review',E().actualLedger.some(o=>o.sessionId===firstRun.id&&!o.fact),{status:r1.status,rows:E().actualLedger.length});
const hashBefore=E().program.hash,wk0=weekFacts(E(),0),r2=c.review('WEEKLY_REVIEW',wk0.asOf,wk0.facts,{eventId:'week-0'});
check('8','the weekly review decides (a status and a reason) and every week-0 session is on record',typeof r2.status==='string'&&typeof r2.reason==='string'&&w0.every(s=>E().actualLedger.some(o=>o.sessionId===s.id)),{status:r2.status,action:r2.action});
steps.modification={status:r2.status,action:r2.action,reason:r2.reason,planChanged:E().program.hash!==hashBefore,proposal:!!r2.proposal};

// 9-10. Forecast, pace insights, strength exposure, as the engine states them.
const ins=insightsView(E());
check('10','forecast, pace insights and exposure each carry a status',!!ins.forecast?.status&&!!ins.paceInsights?.status&&!!ins.strengthExposure?.status,{forecast:ins.forecast?.status,shown:ins.forecast?.shown,insights:ins.paceInsights?.status,exposure:ins.strengthExposure?.status});
check('10','a forecast band is shown only through `shown` (never a lone central time)',(ins.forecast.shown??[]).every(k=>k==='OBSERVED_FORECAST'?!!ins.forecast.observed:k==='PLAN_SCENARIO'?!!ins.forecast.plan:false),ins.forecast.shown);
check('10','pace revision stays INERT',ins.paceRevision==='INERT',ins.paceRevision);
check('10','the strength exposure is descriptive only, planned and executed by primary muscle',ins.strengthExposure.descriptiveOnly===true&&!!ins.strengthExposure.planned&&!!ins.strengthExposure.executed,{descriptiveOnly:ins.strengthExposure.descriptiveOnly,executed:ins.strengthExposure.executed});
steps.insights={forecast:ins.forecast?.status,shown:ins.forecast?.shown,paceInsights:ins.paceInsights?.status,exposure:ins.strengthExposure?.status,sizes:{insightsView:bytes(ins)}};

// 11. Persistence and cold restore in a fresh process: the same next answer as the in-memory continuation.
fs.mkdirSync(WORK,{recursive:true});const file=path.join(WORK,'athlete-a.envelope.json'),saved=persist(E(),file);
const copy=createClient({envelope:E(),onMeasure}),w1=weekFacts(copy.envelope,1),rMem=copy.review('WEEKLY_REVIEW',w1.asOf,w1.facts,{eventId:'week-1'});
const child=JSON.parse(execFileSync(process.execPath,[path.join(HERE,'restore-child.mjs'),file,'1',at(addDays(E().program.startDate,8),'07:00')],{encoding:'utf8'}).trim());
check('11','a fresh process restores the envelope and shows the first screen without an engine call',child.ok&&child.firstViewState==='VALID_PLAN',child);
check('11','the restored process gives the same next answer and the same envelope as the in-memory continuation',child.answer===digestOf(rMem)&&child.envelope===digestOf({...copy.envelope,decisions:copy.envelope.decisions.length}),{child:child.answer,memory:digestOf(rMem)});
{const raw=fs.readFileSync(file,'utf8'),bad=path.join(WORK,'athlete-a.corrupt.json');fs.writeFileSync(bad,raw.replace('"actualLedger":[{','"actualLedger":[{"x":1,'));const o=restore(bad);
 check('11','a corrupted envelope is refused, never planned on',!o.ok&&o.error==='DIGEST_MISMATCH',o);}
{const other=path.join(WORK,'athlete-a.other-engine.json');persist({...E(),engine:P.V1_RUN_FORECAST_ENGINE},other);const o=restore(other);
 check('11','an envelope of another engine version is refused (migration is explicit)',!o.ok&&o.error==='ENVELOPE_OF_ANOTHER_VERSION',o);}
steps.persistence={envelopeBytes:saved.bytes,persistMs:saved.ms,childRestoreMs:child.restoreMs,childFirstViewMs:child.firstViewMs,schema:ENVELOPE_SCHEMA};

// 12. Late correction and deduplication (continuing on the in-memory copy, which is now at week 1).
{const rowsBefore=copy.envelope.actualLedger.length,again=reportOf(E(),firstRun);
 const dd=addDays(E().program.startDate,15),d=copy.review('WEEKLY_REVIEW',at(dd),{eligibility:ELIG(dd),observations:[again]},{eventId:'dup-1'});
 const same=copy.envelope.actualLedger.filter(o=>o.sessionId===firstRun.id&&!o.fact&&!o.superseded);
 check('12','the same report sent again (same event id) does not add a second live row for the session',same.length===1,{status:d.status,liveRows:same.length,rowsBefore,rowsAfter:copy.envelope.actualLedger.length});
 const target=copy.envelope.actualLedger.find(o=>o.sessionId===firstStr.id&&!o.fact&&!o.superseded),day=addDays(E().program.startDate,16);
 const corr={...reportOf(E(),firstStr),eventId:'aif-correction-1',correctionOf:target.eventId,correctedAt:at(day,'09:00'),actual:{...target.actual,minutes:Math.max(10,(target.actual.minutes??40)-10)}};
 const k=copy.review('WEEKLY_REVIEW',at(day),{eligibility:ELIG(day),observations:[corr]},{eventId:'corr-1'});
 const old=copy.envelope.actualLedger.find(o=>o.eventId===target.eventId),now=copy.envelope.actualLedger.filter(o=>o.sessionId===firstStr.id&&!o.fact&&!o.superseded);
 check('12','a late correction keeps the original on record, annotated as superseded, and one live row remains',old?.superseded===true&&now.length===1&&now[0].eventId!==target.eventId,{status:k.status,superseded:old?.superseded,live:now.map(o=>o.eventId)});
 steps.correction={duplicateStatus:d.status,correctionStatus:k.status,supersededBy:old?.supersededBy??null};}

// 13b. A new plan from updated facts, the record carried (restart), built under the strength rules in force.
{const day=addDays(E().program.startDate,18),upd={...athleteA({weeks:8}),asOf:day,startDate:addDays(E().program.startDate,21)};upd.athlete.eligibility=ELIG(day);upd.athlete.pause={reasonCategory:'SCHEDULE',nonclinical:true,weeks:0};
 const r=copy.restart(upd,at(day,'10:00'));
 check('13b','a restart makes a new plan with the record carried, under the strength rules in force',r.status==='PROPOSED'&&r.strengthExtension?.status==='ACTIVE'&&copy.envelope.actualLedger.length>0,{status:r.status,strength:r.strengthExtension?.status,rows:copy.envelope.actualLedger.length});
 steps.restart={status:r.status,strength:r.strengthExtension?.status,forecast:r.runForecast?.status};
 // Open Restart gate, observed (not a check): the new plan reuses the previous plan's session ids; its first report is sent on a clone.
 const probe=createClient({envelope:copy.envelope}),s0=liveSessions(probe.envelope,0)[0],rep0=reportOf(probe.envelope,s0,{tag:'-new-plan'});
 const pr=probe.review('WEEKLY_REVIEW',at(s0.date),{eligibility:ELIG(s0.date),observations:[rep0]},{eventId:'probe-restart'});
 const own=probe.envelope.actualLedger.filter(o=>o.eventId===rep0.eventId),prior=probe.envelope.actualLedger.find(o=>o.sessionId===s0.id&&!o.fact&&o.localDate<probe.envelope.program.startDate);
 gates.push({gate:'RESTART',observed:'after a restart the first report of the new plan has no row of its own; the previous plan row with the same session id is marked conflicted',reproduced:own.length===0&&prior?.conflicted===true,
  detail:{status:pr.status,sessionId:s0.id,newPlanStart:probe.envelope.program.startDate,ownRows:own.length,priorRowDate:prior?.localDate??null,priorRowConflicted:prior?.conflicted===true}});}

// 13. Holds and unavailability: a warning sign holds the plan; nothing is prescribed; the insight surfaces say why; readiness releases it.
{const day=addDays(E().program.startDate,22),h=copy.review('NOT_FEELING_100',at(day,'08:00'),notFeeling100WithSign(day),{eventId:'not-100'});
 const v=todayView(copy.envelope,{nowMs:ms(at(day,'09:00'))}),i=insightsView(copy.envelope);
 check('13','a warning sign is CLINICAL_HUMAN_REQUIRED and the plan view is BLOCKED with no prescription',h.status==='CLINICAL_HUMAN_REQUIRED'&&v.state==='BLOCKED'&&weekView(copy.envelope,{nowMs:ms(at(day,'09:00'))}).sessions.every(s=>!s.executable),{status:h.status,state:v.state});
 check('13','the forecast is unavailable with a reason and the exposure is not applicable while held',i.forecast?.status!=='SHOWN'&&!!(i.forecast?.reason??i.forecast?.status)&&i.strengthExposure?.status!=='ACTIVE',{forecast:i.forecast,exposure:i.strengthExposure});
 const day2=addDays(day,3),rd=copy.review('READINESS_DECLARATION',at(day2,'08:00'),readiness(day2),{eventId:'ready-1'}),v2=todayView(copy.envelope,{nowMs:ms(at(day2,'09:00'))});
 check('13','the readiness declaration releases the hold (the plan view is no longer BLOCKED)',v2.state!=='BLOCKED',{status:rd.status,action:rd.action,state:v2.state});
 steps.hold={held:{status:h.status,forecast:i.forecast?.status,forecastReason:i.forecast?.reason,exposure:i.strengthExposure?.status,exposureReason:i.strengthExposure?.reason},released:{status:rd.status,action:rd.action,state:v2.state}};}

// Authority expiry, observed (not a check): a review dated after the R7B0 records' review_by (2027-04-30) is refused, fail closed.
{const x=createClient({envelope:c.envelope}),day='2027-05-03',r=x.review('WEEKLY_REVIEW',at(day,'08:00'),{eligibility:ELIG(day),observations:[]},{eventId:'probe-expiry'});
 gates.push({gate:'AUTHORITY_EXPIRY',observed:'after the enabling records expire every review is UNSUPPORTED until records renewed by an independent review ship',reproduced:r.status==='UNSUPPORTED',detail:{asOf:day,status:r.status,reason:r.reason}});}

// 14. Version continuity: a plan built without the strength rules is reviewed without them (never adopts them on the way).
{const lower=P.generateProgram(athleteA({id:'aif-athlete-lower'})),c2=createClient();c2.envelope.program=lower.program;c2.envelope.athleteId=lower.program.athleteId;
 for(const k of ['runEvidenceRecord','runFormatRecord','runHistoryRecord'])c2.envelope[k]=lower[k]??[];c2.envelope.presentation={runSessions:lower.runSessions};
 const f=weekFacts(c2.envelope,0),r=c2.review('WEEKLY_REVIEW',f.asOf,f.facts,{eventId:'lower-0'});
 check('14','a plan of the lower entry point is reviewed without the strength rules and says so',r.strengthExtension?.status==='PLAN_BUILT_WITHOUT_THE_RULES',r.strengthExtension?.status);
 steps.versionContinuity={status:r.status,strength:r.strengthExtension?.status};}

// 15. The existing V1CIB custody with the composed engine injected: what it keeps and what it does not.
{const store=memoryStore(),cu=createCustody({store,key:'aif-synthetic-key',now:()=>ms('2026-11-14T12:00:00-03:00'),engine:S}),actor={athleteId:'aif-custody-a'};
 const e=cu.enroll({actor,intake:athleteA({id:'aif-custody-a'}),consents:{COACHING:true,HEALTH_SIGNALS:true,LEARNING:true}}),doc=store.load(actor.athleteId);
 const keys=Object.keys(doc??{}),kept=['runEvidenceRecord','runFormatRecord','runHistoryRecord'].filter(k=>keys.includes(k));
 check('15','custody enrolls with the composed engine injected',e.ok&&e.enrolled,e);
 check('15','custody keeps none of the run extension records (G7: they are recomputed from nothing at each review)',kept.length===0,{documentKeys:keys});
 check('15','custody does not accept a declared race result (runEvidence is not a client review field)',!CLIENT_REVIEW_FIELDS.includes('runEvidence'),CLIENT_REVIEW_FIELDS);
 steps.custody={enrolled:e.enrolled,documentKeys:keys,extensionRecordsKept:kept,acceptsRunEvidence:CLIENT_REVIEW_FIELDS.includes('runEvidence')};}

const failed=checks.filter(x=>!x.ok);
const out={mission:'APPLICATION_INTEGRATION_FOUNDATION',harness:'headless journey',entry:'CoachingCore/src/v1-strength-index.mjs (no options)',engine:S.V1_STRENGTH_ENGINE,node:process.version,flags:process.execArgv,
 checks:{total:checks.length,passed:checks.length-failed.length,failed:failed.length},openGatesObserved:gates,steps,measures,detail:checks};
fs.mkdirSync(OUT,{recursive:true});fs.writeFileSync(path.join(OUT,'journey.json'),JSON.stringify(out,null,1)+'\n');
console.log(`journey: ${out.checks.passed}/${out.checks.total} checks`);for(const x of gates)console.log(`  open gate ${x.gate}: reproduced=${x.reproduced} ${JSON.stringify(x.detail)}`);for(const m of measures)console.log(`  ${m.op.padEnd(9)} ${m.ms.toFixed(1).padStart(7)} ms  rows=${m.ledgerRows??'-'} out=${m.answerBytes}`);
process.exit(failed.length?1:0);
