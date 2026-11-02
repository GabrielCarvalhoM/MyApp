// R7-C Phase 7 (QE-R7C-10): the Phase 6 mutation sets re-run on the fix, each with the same mutation (the Phase 3 set of 18 and the G02-M4
// equivalence witness, the 8 Phase 4 rules, the 6 SD mutants, the 9 correction-cycle mutants and the 7 Phase 6 mutants; two Phase 6 fragments
// follow the new text with the same mutation: P6-M2, whose guard now reads the unread reports, and P6-M7, whose closed-week branch is now the
// per-report one), plus the Phase 7 mutants, every one of which must be killed: F7-M1..M6 are the Founder's; F7-M7 is the R7C-FREEZE-3 reading
// kept for records without first-recorded clocks (the Engineering's J-M2 there); F7-M8..M11 the clock's own rules. Each Phase 7 mutant runs twice:
// against its own witness test alone (node --test-name-pattern) and against the directed set; it must die by its own witness. The directed tests
// now include test/r7c-phase7.test.mjs. Isolated copy: HEAD's CoachingCore and the audit records its fixtures read are extracted with git archive
// into a temporary directory (node_modules copied from this worktree); each mutant edits exact fragments of that copy (each must occur once), runs
// the named test files there and restores the bytes (checked by SHA-256). The repository is never edited. An unmutated baseline run of every test
// set must pass first. Prints JSON.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {REPO} from './phase3-lib.mjs';
const sha=b=>createHash('sha256').update(b).digest('hex');
const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'r7c-mut7-')),tar=path.join(tmp,'x.tar');
const head=spawnSync('git',['rev-parse','HEAD'],{cwd:REPO,encoding:'utf8'}).stdout.trim();
const ar=spawnSync('git',['archive','--format=tar','-o',tar,head,'CoachingCore','audits/domain-coaching-r7-b0-2026-10-31/reviews','audits/domain-coaching-r6-2026-10-26/reviews/ssctr-policy-review.json','audits/domain-coaching-r5-2026-10-25/reviews/ssctr-policy-review.json'],{cwd:REPO,encoding:'utf8',maxBuffer:1<<28});
if(ar.status!==0)throw Error('git archive: '+ar.stderr);
if(spawnSync('tar',['-xf','x.tar'],{cwd:tmp}).status!==0)throw Error('tar');fs.rmSync(tar);
fs.cpSync(path.join(REPO,'CoachingCore/node_modules'),path.join(tmp,'CoachingCore/node_modules'),{recursive:true});
const core=path.join(tmp,'CoachingCore'),AD='src/r6-adaptation.mjs',CO='src/r6-composition.mjs',LE='src/r6-learning.mjs',PV='src/r6-provenance.mjs';
const R7C=['test/r7c-longitudinal.test.mjs','test/r7c-phase4.test.mjs','test/r7c-phase5.test.mjs','test/r7c-phase5-cc.test.mjs','test/r7c-phase6.test.mjs','test/r7c-phase7.test.mjs'],CLIN=[...R7C,'test/r7b2-clinical-precedence.test.mjs'],RET=[...R7C,'test/r6-adaptation.test.mjs'];
const M=[
 // ---------- G01 (Phase 3 set) ----------
 {id:'G01-M1',rule:'credit the unknown: an elapsed session with no report gates as executed',edits:[[AD,"s.date<asOfLocal?'MISSED':s.date===asOfLocal?'NOT_REPORTED':'PENDING'","s.date<asOfLocal?'COMPLETED':s.date===asOfLocal?'NOT_REPORTED':'PENDING'"]],tests:R7C},
 {id:'G01-M2',rule:'remove the question: unknown is read as the entry (zero)',edits:[[CO,"if(!startDate||!sports.includes('RUN')||first.state.run.mode!=='EASY')return null;","return null;"]],tests:RET},
 {id:'G01-M4',rule:'a proposal travels with the question',edits:[[AD,"const askOf=x=>({action:'ASK',reason:x.ask,missingInputs:x.missingInputs,...(x.question?{question:x.question}:{})});","const askOf=x=>({action:'ASK',reason:x.ask,missingInputs:x.missingInputs,...(x.question?{question:x.question}:{}),proposal:x.weeks?{weeks:x.weeks}:{}});"]],tests:R7C},
 {id:'G01-M5',rule:'the question crosses a declared pause (its days count as unreported)',edits:[[CO,"&&!reported.has(s.id)&&!pauses.some(p=>s.date>=p.start&&s.date<=p.end))","&&!reported.has(s.id))"]],tests:RET},
 {id:'G01-M6',rule:'clinical-first inverted (the precedence point removed)',edits:[[AD,"const clinical=clinicalRoute(kind,review);","const clinical=null;"]],tests:CLIN},
 {id:'G01-M7',rule:'the weekly review re-plans from this week (late evidence rewrites the week it reports)',edits:[[AD,"const projected=composeWeeks(ctx,program,{fromWeek:w+1,start:nextState,","const projected=composeWeeks(ctx,program,{fromWeek:w,start:nextState,"]],tests:R7C},
 {id:'G01-M8',rule:'C15: a re-based plan keeps the instantiation label',edits:[[AD,"const runRebased=allAdvance&&!rebased&&changed>0&&runsChanged(program,projected,w+1);","const runRebased=false;"]],tests:R7C},
 {id:'G01-M9',rule:'R2-05: the novice cap does not start on the facts-only path',edits:[[AD,"if(!hs&&strength.density===undefined&&noviceDensityApplies(skn)&&j<firstStrengthBoundary(skn))strength.density={capped:true};",""]],tests:R7C},
 {id:'G01-M10',rule:'a not-done report is a partial execution',edits:[[AD,"const notDone=o=>o.actual?.completed===false&&","const notDone=o=>false&&o.actual?.completed===false&&"]],tests:R7C},
 {id:'G01-M11',rule:'a moved session keeps its own row (the slot it left holds the gate)',edits:[[AD,"filter(s=>s.prescription&&!(s.status==='SKIPPED'&&s.movedTo&&","filter(s=>s.prescription&&!(false&&s.status==='SKIPPED'&&s.movedTo&&"]],tests:R7C},
 // ---------- G02 (Phase 3 set) ----------
 {id:'G02-M1',rule:'consent and revocation ignored (the model is built and read without consent)',edits:[[AD,"model=updateLearningModel(model,usableBound,{asOf,purposeAllowed:consent,timezoneOffsetMinutes:tz});","model=updateLearningModel({...model,purposeAllowed:true},usableBound,{asOf,purposeAllowed:true,timezoneOffsetMinutes:tz});"],[AD,"if(ctx.consent!==true||!model?.purposeAllowed||!allows(ctx.authority,'R6-PARTIAL-NOISY-LEARNING'))return null;","if(!allows(ctx.authority,'R6-PARTIAL-NOISY-LEARNING'))return null;"]],tests:R7C},
 {id:'G02-M2',rule:'one adverse event is enough',edits:[[AD,"if(e.direction!=='ADVERSE'||!['EMERGING','STRONG'].includes(e.confidence))return null;","if(!(e.adverseCount>=1))return null;"]],tests:R7C},
 {id:'G02-M3',rule:'MIXED evidence is enough',edits:[[AD,"if(e.direction!=='ADVERSE'||!['EMERGING','STRONG'].includes(e.confidence))return null;","if(!['ADVERSE','MIXED'].includes(e.direction)||!['EMERGING','STRONG'].includes(e.confidence))return null;"]],tests:R7C},
 {id:'G02-M4',rule:'expiry ignored (observations of any age count)',edits:[[AD,"const e=evidenceFor(model,{sessionType:'RUN:LONG',phaseClass:'BUILD',plannedHash:target,arrangementId},{asOf:ctx.asOf});","const e=evidenceFor(model,{sessionType:'RUN:LONG',phaseClass:'BUILD',plannedHash:target,arrangementId},{asOf:ctx.asOf,windowDays:36500});"]],tests:R7C},
 {id:'G02-M5',rule:'a new dose (between the executed long run and the step)',edits:[[AD,"return {runState:{...runState,long:now},reason,","return {runState:{...runState,long:now+(step-now)/2},reason,"]],tests:R7C},
 {id:'G02-M6',rule:'learning operates in taper, race week, post-event and return weeks',edits:[[AD,"if(!['BUILD','DEVELOPMENT'].includes(phase)||phaseClassOf(ctx.authority.policy,phase,'EASY')!=='BUILD'||runState?.mode!=='EASY'||!Number.isFinite(runState.long))return null;","if(!Number.isFinite(runState?.long))return null;"]],tests:R7C},
 {id:'G02-M7',rule:'the association becomes automatic dose authority and a cause',edits:[[AD,"causal:false,automaticDoseAuthority:false,basis:'R6-PARTIAL-NOISY-LEARNING'}};","causal:true,automaticDoseAuthority:true,basis:'R6-PARTIAL-NOISY-LEARNING'}};"]],tests:R7C},
 {id:'G02-M8',rule:'comparability: any arrangement pool counts',edits:[[AD,"const e=evidenceFor(model,{sessionType:'RUN:LONG',phaseClass:'BUILD',plannedHash:target,arrangementId},{asOf:ctx.asOf});","const e=evidenceFor(model,{sessionType:'RUN:LONG',phaseClass:'BUILD',plannedHash:target},{asOf:ctx.asOf});"]],tests:R7C}
];
// G02-M4 equivalence witness (not in the 18): expiry removed both from the model's update (normalizeObservations prunes by maximumAgeDays at the
// decision clock) and from the learned query. If the directed expiry test kills this and not G02-M4, the query window alone is redundant.
const WITNESS=[{id:'G02-M4b',rule:'expiry removed from the model update and from the learned query (witness for G02-M4)',edits:[[AD,"const e=evidenceFor(model,{sessionType:'RUN:LONG',phaseClass:'BUILD',plannedHash:target,arrangementId},{asOf:ctx.asOf});","const e=evidenceFor(model,{sessionType:'RUN:LONG',phaseClass:'BUILD',plannedHash:target,arrangementId},{asOf:ctx.asOf,windowDays:36500});"],[LE,"maximumAgeDays:model.policy.maximumAgeDays,timezoneOffsetMinutes});","maximumAgeDays:36500,timezoneOffsetMinutes});"]],tests:R7C}];
// The Phase 4 rules (reported apart; not part of the 18/18 criterion).
const P4=[
 {id:'P4-M1',rule:'P3-02: the gap guard removed',edits:[[AD,"gap=clinical?null:runGapInForce(facts)","gap=null"]],tests:R7C},
 {id:'P4-M2',rule:'P3-02: every proposal counts as planning no run dose',edits:[[AD,"return now.length===was.length&&now.every(","return true||now.length===was.length&&now.every("]],tests:R7C},
 {id:'P4-M3',rule:'P3-02: a KEEP keeps the plan with the question beside it instead of asking',edits:[[AD,"if(!unreported&&d.proposal&&plansNoRunDose(ctx,d.proposal))","if(!unreported&&(!d.proposal||plansNoRunDose(ctx,d.proposal)))"]],tests:R7C},
 {id:'P4-M4',rule:'P3-02: the question carried by an independent change is not pending',edits:[[AD,"const carried=!pendingStatus&&!!result.question;","const carried=false;"]],tests:R7C},
 {id:'P4-M5',rule:'P3-02: a handler\'s own later-week question replaces this week\'s',edits:[[AD,"unreported=d.question?.kind==='UNREPORTED_TRAINING';","unreported=false;"]],tests:R7C},
 {id:'P4-M6',rule:'P3-02: a return report is held by the guard (its declared days ignored)',edits:[[AD,"if(ctx.kind==='RETURN_AFTER_PAUSE'||['CLINICAL_HUMAN_REQUIRED','ASK','HOLD','UNSUPPORTED'].includes(status)","if(['CLINICAL_HUMAN_REQUIRED','ASK','HOLD','UNSUPPORTED'].includes(status)"]],tests:RET},
 {id:'P4-M7',rule:'P3-01: the peaks dependency removed (taper and race week read an empty peak as zero)',edits:[[CO,"&&!peaksDecide(ctx,next,fromWeek,{free,start,sports,completedRuns,unknown,startDate}))return null;",")return null;"]],tests:R7C},
 {id:'P4-M8',rule:'P3-03: the re-base reason states the Phase 3 cause whatever the facts',edits:[[AD,"const why=extraReason??(runRebased?rebaseReason(ctx,projected):","const why=extraReason??(runRebased?'Executed as planned this week; next week’s runs start from what has been executed, which differs from what the plan had assumed for weeks with no executed evidence (they earn nothing), so the plan is re-based, not kept':"]],tests:R7C}
];
// The Phase 5 mutants of SSCTR-SD-01/02/03 (reported apart; each must be killed).
const P5=[
 {id:'SD-M1',rule:'SD-01: the answer clears the pending question without re-planning (the stored doses stay in force)',edits:[[AD,"const moved=viewMovedBy(ctx),answered=!moved&&gapAnsweredBy(ctx),overCeiling=","const moved=viewMovedBy(ctx),answered=false,overCeiling="]],tests:R7C},
 {id:'SD-M2',rule:'SD-01/02: the answer re-plans the following weeks but not the answer week',edits:[[AD,"const replan=composeWeeks(ctx,ctx.program,{fromWeek:ctx.w,uncredited});\n if(replan.ask)return {ask:askOf(replan),origin};\n const changed=changedSessions(ctx.program,replan);if(!changed)return null;","const replan=composeWeeks(ctx,ctx.program,{fromWeek:answered?ctx.w+1:ctx.w,uncredited});\n if(replan.ask)return {ask:askOf(replan),origin};\n const changed=changedSessions(ctx.program,replan);if(!changed)return null;"]],tests:R7C},
 {id:'SD-M3a',rule:'SD-03: a signal the question held is not re-evaluated with the answer',edits:[[AD,"const held=kind==='WEEKLY_REVIEW'&&!gap&&!factual?.ask?heldSignal(review.referenceState,w):null;","const held=null;"]],tests:R7C},
 {id:'SD-M3b',rule:'SD-03: the answer event\'s own signal is dropped (it is decided as a plain review)',edits:[[AD,"||(held&&replayHeld(c,held))||(HANDLERS[kind]??weeklyReview)(c);","||(held&&replayHeld(c,held))||(factual?.reason?weeklyReview:HANDLERS[kind]??weeklyReview)(c);"]],tests:R7C},
 {id:'SD-M3c',rule:'SD-03: the held signal does not travel with the pending question',edits:[[AD,"if(signal)pending.signal=signal;","if(false)pending.signal=signal;"]],tests:R7C},
 {id:'SD-M4',rule:'SD-01: after a known miss the answer re-plans strength only (the stale projected run doses stay)',edits:[[AD,"const replan=composeWeeks(ctx,ctx.program,{fromWeek:ctx.w,uncredited});\n if(replan.ask)return {ask:askOf(replan),origin};\n const changed=changedSessions(ctx.program,replan);if(!changed)return null;","const replan=composeWeeks(ctx,ctx.program,{fromWeek:ctx.w,uncredited,...(answered?{sports:['STRENGTH']}:{})});\n if(replan.ask)return {ask:askOf(replan),origin};\n const changed=changedSessions(ctx.program,replan);if(!changed)return null;"]],tests:R7C}
];
// The correction-cycle mutants (reported apart; each must be killed).
const CC=[
 {id:'CC-M1',rule:'QE-R7C-01: the ceiling trigger removed (an answer a refusal or a clinical route recorded leaves the stale doses valid)',edits:[[AD,"overCeiling=!moved&&!answered&&!ctx.noCeiling&&!!aboveFactsCeiling(ctx)&&!runGapInForce(ctx);","overCeiling=false;"]],tests:R7C},
 {id:'CC-M2',rule:'QE-R7C-02 / C9: the elapsed sessions with no report are credited in the weeks after the answer week',edits:[[AD,"uncredited=answered||overCeiling||recorded?ctx.program","uncredited=false?ctx.program"]],tests:R7C},
 {id:'CC-M3',rule:'QE-R7C-03: a change kept beside the open question drops the held signal',edits:[[AD,"if(pending&&(pendingStatus||carried)&&!clinicalSticky","if(pending&&pendingStatus&&!clinicalSticky"]],tests:R7C},
 {id:'CC-M4',rule:'QE-R7C-04 (QM-2): the held signal is replayed in any week (its week guard removed)',edits:[[AD,"Object.hasOwn(REACTIVE,s.kind??'')&&s.weekIndex===w?s:null;}","Object.hasOwn(REACTIVE,s.kind??'')?s:null;}"]],tests:R7C},
 {id:'CC-M5',rule:'trigger scope: no credited session needed (a cold start is re-planned to the entry)',edits:[[CO,"return credited.length?{ceiling,sessionIds:over.map(s=>s.id),credited:credited.map(s=>s.id)}:null;","return {ceiling,sessionIds:over.map(s=>s.id),credited:credited.map(s=>s.id)};"]],tests:R7C},
 {id:'CC-M6',rule:'trigger scope: a return entry is read (its current demonstration ignored)',edits:[[CO,"||week.startAuthority?.RUN?.provenance===WEEK_START.RETURN_ENTRY||(ctx.base","||(ctx.base"]],tests:R7C},
 {id:'CC-M8',rule:'G01: the ceiling re-plan travels with a question about unknown training (its proposal plans run doses while the question stands)',edits:[[AD,"(factual0?.origin==='CEILING'||factual0?.origin==='RECORDED')&&decision.question?.kind==='UNREPORTED_TRAINING')return","(false&&factual0?.origin==='CEILING'||factual0?.origin==='RECORDED')&&decision.question?.kind==='UNREPORTED_TRAINING')return"]],tests:R7C},
 {id:'CC-M9',rule:'trigger scope: a return report is pre-empted by the ceiling re-plan (the break it declares read as credit)',edits:[[CO,"if(ctx.kind==='RETURN_AFTER_PAUSE'||week","if(week"]],tests:R7C},
 {id:'CC-M7',rule:'trigger scope: a return or restart week is read (its re-entry recipe overridden by the entry)',edits:[[CO,"||(ctx.base??program.stateTrace[w])?.run?.mode!=='EASY')return null;",")return null;"]],tests:R7C}
];
// The Phase 6 mutants of QE-R7C-07 (reported apart; each must be killed). M1-M5 are the Founder's; M6 and M7 cover the G01 guard and the closed weeks.
const ENTRY_GUARD="function answeredOnRecord(ctx){\n if(ctx.kind==='RETURN_AFTER_PAUSE')return false;";
const P6=[
 {id:'P6-M1',rule:'facts a carrier recorded are never reconciled later (the recorded-answer re-plan removed)',edits:[[AD,"const recorded=!moved&&!answered&&!overCeiling&&!ctx.noCeiling&&answeredOnRecord(ctx);","const recorded=false;"]],tests:R7C},
 {id:'P6-M2',rule:'only a known stop is reconciled: an answer with executed runs (EXEC, MIXED, ADVERSE) is ignored',edits:[[AD," if(runGapInForce(ctx))return false;\n const usable=read"," if(runGapInForce(ctx)||[...unread].some(o=>o.actual?.completed===true||Number(o.actual?.minutes)>0))return false;\n const usable=read"]],tests:R7C},
 {id:'P6-M3',rule:'clinical clearance requires the answer re-sent (the reconciliation needs the review to carry reports)',edits:[[AD,ENTRY_GUARD,"function answeredOnRecord(ctx){\n if(ctx.kind==='RETURN_AFTER_PAUSE'||!(Array.isArray(ctx.review.observations)&&ctx.review.observations.length))return false;"]],tests:R7C},
 {id:'P6-M4',rule:'the stale plan stays valid with factual reconciliation debt (the recorded answer re-plans the later weeks only)',edits:[[AD,"const replan=composeWeeks(ctx,ctx.program,{fromWeek:ctx.w,uncredited});","const replan=composeWeeks(ctx,ctx.program,{fromWeek:recorded?ctx.w+1:ctx.w,uncredited});"]],tests:R7C},
 {id:'P6-M5',rule:'the carrier\'s identity enters the factual decision (a refusal\'s pending state blocks the reconciliation)',edits:[[AD,ENTRY_GUARD,"function answeredOnRecord(ctx){\n if(ctx.kind==='RETURN_AFTER_PAUSE'||ctx.review.referenceState?.pending?.status==='HOLD')return false;"]],tests:R7C},
 {id:'P6-M6',rule:'G01: the recorded-answer re-plan travels with a question about unknown training',edits:[[AD,"||factual0?.origin==='RECORDED')&&decision.question?.kind==='UNREPORTED_TRAINING')return","||false&&factual0?.origin==='RECORDED')&&decision.question?.kind==='UNREPORTED_TRAINING')return"]],tests:R7C},
 {id:'P6-M7',rule:'a week a review closed always counts as read, even when its review read no executed run',edits:[[AD,"  if(at?Date.parse(at)>Date.parse(a.evidenceThrough??a.asOf):(legacy??=legacyUnreadWeeks(ctx)).has(j))out.add(o);","  if(false)out.add(o);"]],tests:R7C}
];
// The Phase 7 mutants of QE-R7C-10 (reported apart; each must be killed, and by its own witness, `witness`: a test-name pattern of
// test/r7c-phase7.test.mjs run alone).
const W7=['test/r7c-phase7.test.mjs'],CLOSED="  if(a?.provenance!==WEEK_START.WEEK_EVIDENCE)continue;\n",GATES="const G=Object.entries(program.decisions.find(d=>d.eventId===a.eventId)?.gates??{}).filter(([k])=>Object.values(RUN_GATE_ROLE).includes(k)).map(([,g])=>g);";
const P7=[
 {id:'F7-M1',rule:'visibility inferred from the gate class only (the R7C-FREEZE-3 reading for every report)',edits:[[AD,"  if(at?Date.parse(at)>Date.parse(a.evidenceThrough??a.asOf):(legacy??=legacyUnreadWeeks(ctx)).has(j))out.add(o);","  if((legacy??=legacyUnreadWeeks(ctx)).has(j))out.add(o);"]],tests:R7C,witness:'shortened \\(5\\)'},
 {id:'F7-M2',rule:'HOLD never counts as a review that read a run (a week whose review gave only HOLD run gates is unread)',edits:[[AD,CLOSED,CLOSED+"  {"+GATES+"if(G.length&&G.every(g=>g==='HOLD')){out.add(o);continue;}}\n"]],tests:R7C,witness:'visibility \\(1\\)'},
 {id:'F7-M3',rule:'REGRESS never counts as a review that read a run (a week whose review gave a REGRESS and no executed run gate is unread)',edits:[[AD,CLOSED,CLOSED+"  {"+GATES+"if(G.includes('REGRESS')&&!G.some(g=>['ADVANCE','EARNED'].includes(g))){out.add(o);continue;}}\n"]],tests:R7C,witness:'visibility \\(2\\)'},
 {id:'F7-M4',rule:'temporal visibility ignored: a report recorded after the review counts as present (its observation time stands in for the clock the record first held it at)',edits:[[AD,"const at=utcTimestamp(o.provenance?.firstRecordedAt);","const at=utcTimestamp(o.observedAt);"]],tests:R7C,witness:'visibility \\(3\\)'},
 {id:'F7-M5',rule:'a shortened answer a clinical route recorded is never reconciled (a late report of a run done short stays read)',edits:[[AD,"const unread=unreadRunReports(ctx);if(!unread.size)return false;","const unread=new Set([...unreadRunReports(ctx)].filter(o=>!(o.partial&&o.actual?.completed===true)));if(!unread.size)return false;"]],tests:R7C,witness:'\\(15\\): clinical first'},
 {id:'F7-M6',rule:'a mixed answer a carrier recorded is never reconciled (a closed week holding a report of a run not done keeps its late reports read)',edits:[[AD,"  if(at?Date.parse(at)>Date.parse(a.evidenceThrough??a.asOf):","  if(at?Date.parse(at)>Date.parse(a.evidenceThrough??a.asOf)&&!record.some(x=>x.context?.sport==='RUN'&&x.context.weekIndex===j&&x.actual?.completed===false&&!(Number(x.actual?.minutes)>0)):"]],tests:R7C,witness:'P6-F01 mixed'},
 {id:'F7-M7',rule:'records without first-recorded clocks: REGRESS no longer counts as an executed run in the R7C-FREEZE-3 reading (the Engineering\'s J-M2)',edits:[[AD,"executed=g=>!!g&&keys.some(k=>['ADVANCE','EARNED','REGRESS'].includes(g[k]));","executed=g=>!!g&&keys.some(k=>['ADVANCE','EARNED'].includes(g[k]));"]],tests:R7C,witness:'backward behaviour'},
 {id:'F7-M8',rule:'the clock is taken from the input (a supplied first-recorded clock is trusted)',edits:[[PV,"if(!carried)setFirstRecorded(o,recordArrival?now:null);","if(!carried&&!o.provenance.firstRecordedAt)setFirstRecorded(o,recordArrival?now:null);"]],tests:R7C,witness:'record: '},
 {id:'F7-M9',rule:'one execution keeps the later clock when two agreeing reports merge',edits:[[PV,"setFirstRecorded(previous,firstRecorded(previous,o));","setFirstRecorded(previous,firstRecorded(o));"]],tests:R7C,witness:'record: '},
 {id:'F7-M10',rule:'a correction takes its own clock (not its chain\'s)',edits:[[PV,"setFirstRecorded(o,firstRecorded(o,old,...(quarantined.has(identity)?accepted.filter(x=>x.identity===identity):[])));",""]],tests:R7C,witness:'record: '},
 {id:'F7-M11',rule:'a normalization that records no arrivals keeps the clocks its new rows bring (the learning model holds them)',edits:[[PV,"if(!carried)setFirstRecorded(o,recordArrival?now:null);","if(!carried&&recordArrival)setFirstRecorded(o,now);"]],tests:R7C,witness:'record: '}
];
// `ran`: the named R7-C tests that ran (a test-name pattern that selects none still reports the file itself as one passing test).
const runTests=(files,pattern=null)=>{const r=spawnSync(process.execPath,['--test',...(pattern?['--test-name-pattern',pattern]:[]),...files],{cwd:core,encoding:'utf8',timeout:1800000,maxBuffer:1<<26});const n=k=>Number((r.stdout.match(new RegExp('ℹ '+k+' (\\d+)'))??[])[1]??NaN);return {fail:n('fail'),pass:n('pass'),ran:new Set((r.stdout.match(/^[✔✖] R7-C .*$/gm)??[]).map(l=>l.replace(/ \(\d[\d.]*ms\)$/,''))).size,failing:(r.stdout.match(/^✖ .*$/gm)??[]).filter(l=>!/failing tests/.test(l)).slice(0,5)};};
const baseline={};for(const set of [R7C,CLIN,RET]){const k=set.join('+'),b=runTests(set);baseline[k]=b;if(!(b.fail===0&&b.pass>0))throw Error('baseline fails on the isolated copy: '+k+' '+JSON.stringify(b));}
// The witness patterns must each select at least one test of the unmutated Phase 7 file (a pattern that matches nothing would kill nothing).
const witnessBaseline={};for(const m of P7){const b=runTests(W7,m.witness);witnessBaseline[m.id]={witness:m.witness,ran:b.ran,pass:b.pass,fail:b.fail};if(!(b.ran>0&&b.fail===0))throw Error('witness baseline '+m.id+' selects no test or fails unmutated: '+JSON.stringify(b));}
function mutate(m){
 const files=[...new Set(m.edits.map(([f])=>f))],originals=Object.fromEntries(files.map(f=>[f,fs.readFileSync(path.join(core,f))]));
 const texts=Object.fromEntries(files.map(f=>[f,originals[f].toString('utf8')]));
 const counts=m.edits.map(([f,a])=>texts[f].split(a).length-1);
 if(counts.some(n=>n!==1))return {id:m.id,rule:m.rule,result:'INVALID',reason:'fragment occurrences '+counts.join(',')};
 for(const [f,a,b] of m.edits)texts[f]=texts[f].replace(a,()=>b);
 let o,w=null;try{for(const f of files)fs.writeFileSync(path.join(core,f),texts[f]);o=runTests(m.tests);if(m.witness)w=runTests(W7,m.witness);}finally{for(const f of files)fs.writeFileSync(path.join(core,f),originals[f]);}
 for(const f of files)if(sha(fs.readFileSync(path.join(core,f)))!==sha(originals[f]))throw Error('restore failed '+f);
 const own=w?{witness:m.witness,witnessRan:w.ran,ownWitness:w.ran>0&&w.fail>0?'KILLED':w.ran>0&&Number.isFinite(w.fail)?'SURVIVED':'ERROR',witnessFailing:w.failing}:{};
 return {id:m.id,rule:m.rule,files,tests:m.tests,result:o.fail>0&&(!w||w.fail>0)?'KILLED':Number.isFinite(o.fail)?'SURVIVED':'ERROR',failedTests:o.fail,passedTests:o.pass,failing:o.failing,...own};
}
const results=M.map(mutate),witness=WITNESS.map(mutate),phase4=P4.map(mutate),phase5=P5.map(mutate),correction=CC.map(mutate),phase6=P6.map(mutate),phase7=P7.map(mutate);
const repoUntouched=spawnSync('git',['diff','--quiet','--','CoachingCore/src','CoachingCore/test'],{cwd:REPO}).status===0;
fs.rmSync(tmp,{recursive:true,force:true});
const sum=list=>({mutants:list.length,killed:list.filter(r=>r.result==='KILLED').length,survived:list.filter(r=>r.result==='SURVIVED').map(r=>r.id),invalid:list.filter(r=>['INVALID','ERROR'].includes(r.result)).map(r=>r.id)});
console.log(JSON.stringify({check:'R7C-P7-MUTATION',head,isolatedCopy:true,repoUntouched,baseline,phase3Set:sum(results),equivalenceWitness:sum(witness),phase4Rules:sum(phase4),phase5SD:sum(phase5),correctionCycle:sum(correction),phase6QE07:sum(phase6),phase7QE10:{...sum(phase7),killedByOwnWitness:phase7.filter(r=>r.ownWitness==='KILLED').length},witnessBaseline,results,witness,phase4,phase5,correction,phase6,phase7},null,1));
