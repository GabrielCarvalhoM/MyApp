// DOMAIN_COACHING_R7-A.1 objective verification. Read-only unless --write, which writes only CoachingCore/r7/a1/VERIFICATION_R7A1.json.
// It re-runs the three read-only R7-A.1 probes (stdout only) and never runs historical verifiers or writers (they rewrite closed evidence).
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {hash} from '../src/value.mjs';
const root=path.resolve(import.meta.dirname,'../..'),abs=p=>path.join(root,p),exists=p=>fs.existsSync(abs(p));
const sha=p=>createHash('sha256').update(fs.readFileSync(abs(p))).digest('hex'),json=p=>JSON.parse(fs.readFileSync(abs(p),'utf8'));
const AUDIT='audits/domain-coaching-r7a1-2026-10-27/',A1='CoachingCore/r7/a1/',PROBES=AUDIT+'probes/',REVIEWS=AUDIT+'reviews/';
const freezes=()=>fs.readdirSync(abs(A1)).filter(f=>/^RUNTIME_FREEZE_R7A1_FREEZE_A\d+\.json$/.test(f)).sort((a,b)=>Number(a.match(/A(\d+)\.json$/)[1])-Number(b.match(/A(\d+)\.json$/)[1]));
const freeze=()=>json(A1+freezes().at(-1)),TAG=()=>'A'+freezes().at(-1).match(/A(\d+)\.json$/)[1];
const checks=[],check=(id,fn)=>{try{const detail=fn();checks.push({id,pass:detail?.pass!==false,detail});}catch(e){checks.push({id,pass:false,detail:{error:e.message}});}};
// R7-A.1 may change only these baseline files; the mission files only after their first R7-A.1 block; new files only where listed.
const RUNTIME_DELTA=['CoachingCore/src/r6-adaptation.mjs','CoachingCore/src/r6-program.mjs','CoachingCore/src/r6-provenance.mjs','CoachingCore/test/r7a-semantic-core.test.mjs'];
const INSERT_ONLY={'CURRENT_MISSION.md':'<!-- DOMAIN_COACHING_R7A1:','MISSION_LEDGER.md':'<!-- DCR7A1-'};
const QUEUE='reviews/provisional-sports-science/2026-10-23/HUMAN_REVALIDATION_QUEUE.json',QUEUE_RECORD=AUDIT+'QUEUE_INTEGRATION_R7A1.json';
const NEW_ALLOWED=[/^CoachingCore\/r7\/a1\//,/^CoachingCore\/r7\/R7A_FINAL_HANDOFF\.md$/,/^CoachingCore\/src\/r6-composition\.mjs$/,/^CoachingCore\/test\/r7a1-[^/]+\.test\.mjs$/,/^CoachingCore\/scripts\/(prepare|regress|freeze|verify|queue)-r7a1\.mjs$/];
const PROTECTED_DIRS=['CoachingCore','product','canon','audits/domain-coaching-r6-2026-10-26','audits/domain-coaching-r7a-2026-10-27','audits/v1-wearable-scope-2026-10-27'];
const walk=(rel,out=[])=>{for(const e of fs.readdirSync(abs(rel),{withFileTypes:true})){const p=path.posix.join(rel,e.name);if(e.name==='node_modules')continue;if(e.isDirectory())walk(p,out);else out.push(p);}return out;};

check('baseline-preserved',()=>{
 const b=json(AUDIT+'BASELINE.json'),changed=b.entries.filter(e=>!exists(e.path)||sha(e.path)!==e.sha256).map(e=>e.path);
 const unexpected=changed.filter(p=>!RUNTIME_DELTA.includes(p)&&!INSERT_ONLY[p]&&p!==QUEUE);
 // The bytes before the first R7-A.1 block are the baseline file (the block's own leading newline may precede its marker).
 const insertOnly=Object.entries(INSERT_ONLY).map(([p,marker])=>{const now=fs.readFileSync(abs(p)),at=now.indexOf(marker),base=b.entries.find(e=>e.path===p).sha256;let prefix=null;for(let n=Math.max(0,at-4);at>=0&&n<=at;n++)if(createHash('sha256').update(now.subarray(0,n)).digest('hex')===base)prefix=n;const tail=prefix===null?null:now.subarray(prefix);return {file:p,prefixPreserved:prefix!==null,prefixBytes:prefix,appendedBytes:tail?.length??null,carriageReturnsAppended:tail?tail.filter(x=>x===13).length:null};});
 const bound=new Set(b.entries.map(e=>e.path)),added=PROTECTED_DIRS.flatMap(d=>walk(d)).filter(p=>!bound.has(p)),addedOutsideR7A1=added.filter(p=>!NEW_ALLOWED.some(r=>r.test(p)));
 return {pass:!unexpected.length&&insertOnly.every(x=>x.prefixPreserved&&x.carriageReturnsAppended===0)&&!addedOutsideR7A1.length,entries:b.entries.length,changed,unexpected,insertOnly,addedFiles:added,addedOutsideR7A1};
});
check('freeze-current',()=>{
 const f=freeze(),cc=p=>'CoachingCore/'+p,drift=Object.entries(f.files).filter(([p,h])=>!exists(cc(p))||sha(cc(p))!==h).map(([p])=>p);
 const now=[...fs.readdirSync(abs('CoachingCore/src')).filter(x=>x.endsWith('.mjs')).map(x=>'src/'+x),...fs.readdirSync(abs('CoachingCore/test')).filter(x=>x.endsWith('.mjs')).map(x=>'test/'+x)],unfrozen=now.filter(p=>!(p in f.files));
 return {pass:!drift.length&&!unfrozen.length,revision:f.revision,sourceDigest:f.sourceDigest,deltaFromR7AFreeze2:f.deltaFromR7AFreeze2,drift,unfrozen};
});
check('policy-unchanged',()=>{const p=json('CoachingCore/r6/PROGRAM_POLICY_R6.json'),h=hash(p);return {pass:h==='18ec48f34768a7eebb2aede618db65a77385efebbda0a38d6f03135e5cd96b4c'&&sha('CoachingCore/r6/PROGRAM_POLICY_R6.json')==='a75be1aae3818616888e641c104407926d5f16f213a04137f5b21024ccafe100',policyHash:h,revision:p.revision};});
check('tests',()=>{
 const r=spawnSync(process.execPath,['--test'],{cwd:abs('CoachingCore'),encoding:'utf8',maxBuffer:256*1024*1024}),n=k=>Number(r.stdout.match(new RegExp('ℹ '+k+' (\\d+)'))?.[1]??NaN);
 return {pass:r.status===0&&n('fail')===0,tests:n('tests'),pass_:n('pass'),fail:n('fail'),node:process.version};
});
// Every difference, named by the fix that makes it: against R7A-FREEZE-2 by the R7-A.1 clause (WEEK_COMPOSITION_CONTRACT.md); against the
// R6 closure by the R7-A fix (CoachingCore/r7/README.md) or the R7-A.1 clause.
const A1_HOLDOUT={'R6-H22':'C3 a re-plan from next week while the week is under way starts next week from the conditional plan of the week as now planned, not from HOLD (accessories 1 -> 2 sets in week 8)','R6-H24':'C3 a change once the week is complete starts next week from the week\'s evidence; an unreported complete week holds (one accessory 2 -> 1 set in weeks 4-5)','R6-H25':'C3 as R6-H22 (repetitions and strides of weeks 3-4)','R6-H26':'C5 a session dated before a return of the same week never counts as done in next week\'s conditional plan (goblet squat enters at the return entry in week 9); the return week\'s totals are the sum of its rows (rows unchanged)','R6-H29':'C4 an event-period conflict skips sessions only: the race-week strength rest on a conflict date keeps its rest (no session to skip; same decision and doses)'};
const R7A_HOLDOUT={'R6-H05':'QE-R7A-14 projected return ceiling after a time-fitted week','R6-H07':'C07 intake records merge by content','R6-H17':'QE-R7A-02 a same-day session re-planned by the return','R6-H18':'QE-R7A-12 HOLD keeps the repetition target (state only)','R6-H23':'C16 a dated schedule change is asked','R6-H25':'D53 regain after any re-establishment','R6-H26':'D53/D54 rows state the post-return set cap (same visible dose); QE-R7A-02 the return-day session','R6-H29':'C18 a finished race is complete','R6-H30':'C18 a finished race is complete','R6-H32':'C10 the carried record keeps corrections','R6-H35':'D53/D54 rows state the post-return set cap (same visible dose)'};
const EXPLAINED={
 againstFreeze2:{holdout:A1_HOLDOUT,profiles:{},simulations:{T05_10K8_SHORT_INTERRUPTION:'C1 an evening return no longer rewrites that morning\'s run (it stays ahead only until its shift ends): 45 instead of 40 minutes, +5 minutes on two later easy runs',T13_HM16_FATIGUE_SIGNALS:'C1 (QE-R7A1-04) an evening local-fatigue report reaches that day\'s unreported PM session: its optional lower-body accessory (calf raise) is removed, so that week gives no gate for it'}},
 againstR6Closure:{holdout:Object.fromEntries([...new Set([...Object.keys(R7A_HOLDOUT),...Object.keys(A1_HOLDOUT)])].map(k=>[k,[R7A_HOLDOUT[k],A1_HOLDOUT[k]].filter(Boolean).join('; ')])),profiles:{WALK_JOG_FIVE_DAYS:'QE-R7A-14 projected return ceiling after a time-fitted week'},simulations:{T04_STRENGTH12_REPEATED_UNDERPERFORMANCE:'QE-R7A-12',T05_10K8_SHORT_INTERRUPTION:'QE-R7A-02; R7-A.1 C1',T08_NOVICE8_MODERATE_INTERRUPTION:'QE-R7A-02',T13_HM16_FATIGUE_SIGNALS:'QE-R7A-12; R7-A.1 C1 (QE-R7A1-04)'}}
};
check('regression',()=>{
 const g=json(A1+'REGRESSION_R7A1.json'),src=Object.entries(g.runtimes.current.sources).filter(([p,h])=>sha(p)!==h).map(([p])=>p);
 const open=(s,E)=>({holdout:s.r6FreshHoldout.different.filter(x=>!E.holdout[x]),profiles:s.profiles.different.filter(x=>!E.profiles[x]),simulations:s.simulations.different.filter(x=>!E.simulations[x])});
 const f2=g.summary.againstFreeze2,r6=g.summary.againstR6Closure,u2=open(f2,EXPLAINED.againstFreeze2),u6=open(r6,EXPLAINED.againstR6Closure),none=u=>Object.values(u).every(l=>!l.length);
 const statusF2=[...f2.r6FreshHoldout.statusChanged,...f2.r5Corpus.statusChanged],statusR6=r6.r6FreshHoldout.statusChanged.map(x=>x.split(':')[0]);
 return {pass:!src.length&&f2.r5Corpus.identical===f2.r5Corpus.cases&&r6.r5Corpus.identical===r6.r5Corpus.cases&&none(u2)&&none(u6)&&!statusF2.length&&JSON.stringify(statusR6)==='["R6-H23"]',sourcesBoundToCurrentRuntime:!src.length,againstFreeze2:{r5:`${f2.r5Corpus.identical}/${f2.r5Corpus.cases}`,profiles:`${f2.profiles.identical}/${f2.profiles.cases}`,simulations:`${f2.simulations.identical}/${f2.simulations.cases}`,r6Holdout:`${f2.r6FreshHoldout.identical}/${f2.r6FreshHoldout.cases}`,statusChanged:statusF2,unexplained:u2},againstR6Closure:{r5:`${r6.r5Corpus.identical}/${r6.r5Corpus.cases}`,profiles:`${r6.profiles.identical}/${r6.profiles.cases}`,simulations:`${r6.simulations.identical}/${r6.simulations.cases}`,r6Holdout:`${r6.r6FreshHoldout.identical}/${r6.r6FreshHoldout.cases}`,statusChanged:r6.r6FreshHoldout.statusChanged,unexplained:u6},explained:EXPLAINED,classification:g.classification};
});
// The R7-A.1 probes are deterministic and print only: re-run each on the current runtime and require its recorded output for this freeze.
const rerun=file=>{const r=spawnSync(process.execPath,[abs(PROBES+file+'.mjs')],{cwd:abs(PROBES),encoding:'utf8',maxBuffer:256*1024*1024});if(r.status!==0)throw Error(file+' failed: '+r.stderr.slice(0,400));const recorded=fs.readFileSync(abs(PROBES+`${file}.${TAG()}.out.json`),'utf8');return {now:JSON.parse(r.stdout),recordedMatches:r.stdout===recorded,before:json(PROBES+file+'.BEFORE.out.json')};};
check('composition-probes',()=>{
 const {now,recordedMatches,before}=rerun('r7a1-composition-probes'),state=o=>Object.fromEntries(Object.entries(o.results).map(([k,v])=>[k,v.error?'ERROR':v.defect?'DEFECT':'NO_DEFECT']));
 const b=state(before),a=state(now),open=Object.keys(a).filter(k=>a[k]!=='NO_DEFECT');
 return {pass:recordedMatches&&before.runtime==='R7A-FREEZE-2'&&now.runtime==='CURRENT'&&Object.values(b).every(v=>v==='DEFECT')&&!open.length,recordedMatches,before:b,after:a,open};
});
// Every pair of same-week changes in both orders, reported on Monday morning and on Thursday evening, compared on the whole plan; context
// records that differ while every row and state agree are listed as representation only.
for(const grid of ['r7a1-handler-grid','r7a1-handler-grid-midweek'])check(grid,()=>{
 const {now,recordedMatches,before}=rerun(grid);
 return {pass:recordedMatches&&now.runtime==='CURRENT'&&now.defects.length===0&&now.errors.length===0&&now.expected.every(x=>x.reason)&&before.defects.length>0,recordedMatches,pairs:now.pairs,same:now.same,representationOnly:now.representationOnly.length,expected:now.expected.map(x=>`${x.program}: ${x.pair}`),defects:`${before.defects.length} -> ${now.defects.length}`,errors:now.errors.length};
});
check('d56-grid',()=>{
 const {now,recordedMatches,before}=rerun('r7a1-d56-grid'),j=now.jumpsAboveLargestPlusOne;
 // The uncovered jumps (accessories no ceiling covers coming back at their full count when the budget is raised) are the R23 class, equal on
 // FREEZE-2; they are sent to the SSCTR, not changed here.
 return {pass:recordedMatches&&now.timelines===before.timelines&&now.cap.trimmedWeeksWithCap>0&&now.cap.riseOrEndAfterTrimmed===0&&j.capped===0&&JSON.stringify(j.uncoveredByExercise)===JSON.stringify(before.jumpsAboveLargestPlusOne.uncoveredByExercise),recordedMatches,timelines:now.timelines,riseOrEndAfterTrimmed:`${before.cap.riseOrEndAfterTrimmed}/${before.cap.trimmedWeeksWithCap} -> ${now.cap.riseOrEndAfterTrimmed}/${now.cap.trimmedWeeksWithCap}`,cappedJumps:`${before.jumpsAboveLargestPlusOne.capped} -> ${j.capped}`,uncoveredJumps:`${before.jumpsAboveLargestPlusOne.uncovered} -> ${j.uncovered}`,uncoveredByExercise:j.uncoveredByExercise};
});
// The representation-only pairs of the grids, each followed by a third change, never differ in a row or state.
check('representation-three-step',()=>{
 const file='r7a1-representation-three-step',r=spawnSync(process.execPath,[abs(PROBES+file+'.mjs')],{cwd:abs(PROBES),encoding:'utf8',maxBuffer:64*1024*1024});if(r.status!==0)throw Error(file+' failed: '+r.stderr.slice(0,400));
 const now=JSON.parse(r.stdout),recordedMatches=r.stdout===fs.readFileSync(abs(PROBES+`${file}.${TAG()}.out.json`),'utf8');
 return {pass:recordedMatches&&now.total>0&&now.diff===0,recordedMatches,sequences:now.total,differing:now.diff};
});
// D58 with the week's other adaptations (R7-A.1 correction cycle): a short return with each same-week adaptation, in both orders and alone,
// on Monday morning and every evening, then the weekly review; no quality run left, one easy slot, and it is the first quality slot run.
check('d58-combinations',()=>{
 const {now,recordedMatches,before}=rerun('r7a1-d58-combinations');
 return {pass:recordedMatches&&now.runtime==='CURRENT'&&now.cases>0&&!now.returnNotApplied.length&&!now.defects.length&&!now.errors.length&&before.defects.length>0,recordedMatches,cases:now.cases,defects:`${before.defects.length} -> ${now.defects.length}`,errors:now.errors.length};
});
// Each material finding of the FREEZE-A1 reviews has a test that fails on a byte-exact FREEZE-A1 copy (recorded run of this test file) and
// passes now (check `tests`).
check('correction-tests-fail-on-freeze-a1',()=>{
 const t='CoachingCore/test/r7a1-correction.test.mjs',rec=fs.readFileSync(abs(PROBES+'r7a1-correction-tests.on-FREEZE-A1.out.txt'),'utf8'),n=k=>Number(rec.match(new RegExp('ℹ '+k+' (\\d+)'))?.[1]??NaN);
 return {pass:rec.includes(sha(t))&&n('tests')>0&&n('fail')===n('tests')&&n('pass')===0,boundToCurrentTestFile:rec.includes(sha(t)),tests:n('tests'),failingOnFreezeA1:n('fail')};
});
// The SSCTR's round-12 instrument (byte copy of the R7-A one) on this freeze equals its output on R7A-FREEZE-2 (R7-A CYCLE2), up to its own path,
// except the named differences, which the comparison sections also list:
// - S9: after the event date is moved, the race statement reads the re-planned runs (25 -> 30 minutes, rule S9 of the SSCTR dossier); its own
//   condition (stated = the longest continuous run before the race) holds;
// - D57 (from FREEZE-A2): the return cap stays on until an executed whole week covers next week's count, so three traces check one more climb
//   week (2 -> 3, still no violation) and one return week's rows show their cap; no count changes.
check('ssctr-instrument',()=>{
 const R7A='audits/domain-coaching-r7a-2026-10-27/probes/',sameScript=sha(PROBES+'ssctr-r12-instrument.mjs')===sha(R7A+'ssctr-r12-instrument.mjs');
 const a=JSON.parse(fs.readFileSync(abs(PROBES+`ssctr-r12-instrument.${TAG()}.out.json`),'utf8').replaceAll('domain-coaching-r7a1-2026-10-27','domain-coaching-r7a-2026-10-27')).sections,c=json(R7A+'ssctr-r12-instrument.CYCLE2.out.json').sections;
 const move=a.V_D47reviews?.goalChange?.moveDate,named=!!move&&move.stated===30&&move.fromSessions===30&&c.V_D47reviews.goalChange.moveDate.stated===25;
 const climbs=[['U_returnSets','traces',1],['U_returnSets','traces',3],['X_D49extras','q4_sixteenWeeks',2]],capped=/ \[cap \d+\]$/,rows=x=>x.AG_neverPerformedDuringReturn?.['s5-d20']?.current?.weeks?.[4]?.rows??[];
 const d57=TAG()!=='A1'&&climbs.every(([s,l,i])=>a[s]?.[l]?.[i]?.climbWeeksChecked===3&&c[s][l][i].climbWeeksChecked===2)&&rows(a).some(r=>capped.test(r))&&JSON.stringify(rows(a).map(r=>r.replace(capped,'')))===JSON.stringify(rows(c));
 const n=structuredClone(a);
 if(named)Object.assign(n.V_D47reviews.goalChange.moveDate,{stated:25,fromSessions:25});
 if(d57){for(const [s,l,i] of climbs)n[s][l][i].climbWeeksChecked=2;n.AG_neverPerformedDuringReturn['s5-d20'].current.weeks[4].rows=[...rows(c)];}
 const listed=[...(named?['V_D47reviews']:[]),...(d57?['U_returnSets','X_D49extras']:[])];
 for(const [k,names] of [['COMPARE_round10Output',listed],['COMPARE_round11Output',[...listed,'COMPARE_round10Output']]]){n[k].different=n[k].different.filter(x=>!names.includes(x));const moved=[...n[k].identical,...names];if(moved.length===c[k].identical.length&&moved.every(x=>c[k].identical.includes(x)))n[k].identical=[...c[k].identical];}
 const different=[...new Set([...Object.keys(n),...Object.keys(c)])].filter(k=>JSON.stringify(n[k])!==JSON.stringify(c[k]));
 return {pass:sameScript&&named&&(TAG()==='A1'||d57)&&!different.length,sameScript,sections:Object.keys(c).length,namedDifferences:[named?'V_D47reviews.goalChange.moveDate stated/fromSessions 25 -> 30 (S9)':null,d57?'U_returnSets traces 1 and 3 and X_D49extras q4 trace 2 check 3 climb weeks instead of 2; AG s5-d20 week 4 rows show their return cap, counts unchanged (D57)':null].filter(Boolean),otherDifferences:different,akAboveThePhaseDose:a.AK_reducedPhaseReestablishment.aboveThePhaseDose.length,ahMoreThanOneSetAbove:a.AH_setsAfterReestablishment.moreThanOneSetAboveTheReestablishment};
});
// Every single-fix revert applies; each one the R7-A and R7-A.1 tests do not catch carries a stated reason (DOCUMENTED); the R7-A survivor is caught.
check('mutation-check',()=>{const m=json(PROBES+(TAG()==='A1'?'mutation-check-r7a1.out.json':`mutation-check-r7a1.${TAG()}.out.json`)),open=m.results.filter(r=>!r.caught&&!r.documented).map(r=>r.mutation),r7aSurvivor=m.results.find(r=>/R7-A survivor/.test(r.mutation));return {pass:m.total>0&&m.results.every(r=>r.applied)&&!open.length&&r7aSurvivor?.caught===true,caught:m.caught,total:m.total,r7aSurvivor:r7aSurvivor?{mutation:r7aSurvivor.mutation,caught:r7aSurvivor.caught,failingTests:r7aSurvivor.failingTests}:null,documentedSurvivors:m.results.filter(r=>!r.caught&&r.documented).map(r=>r.mutation),open};});
// Each judge's review binds the freeze it reviewed by its source digest: the first review FREEZE-A1, the single narrow re-check FREEZE-A2.
const REVIEW_SETS=[{freeze:'RUNTIME_FREEZE_R7A1_FREEZE_A1.json',ssctr:REVIEWS+'ssctr-r7a1-review.json',engineering:REVIEWS+'quality-engineering-r7a1-review.json'},{freeze:'RUNTIME_FREEZE_R7A1_FREEZE_A2.json',ssctr:REVIEWS+'ssctr-r7a1-recheck.json',engineering:REVIEWS+'quality-engineering-r7a1-recheck.json'}];
check('independent-reviews',()=>{
 const latest=freezes().at(-1),sets=REVIEW_SETS.filter(x=>exists(A1+x.freeze)),out={};
 for(const set of sets){const f=json(A1+set.freeze);for(const k of ['ssctr','engineering']){const p=set[k];if(!exists(p)){out[set.freeze+':'+k]={present:false};continue;}const r=json(p),digest=r.freezeReviewed?.sourceDigest??r.sourceDigest??null;out[set.freeze+':'+k]={present:true,file:p,verdict:r.verdict??null,digest,bound:digest===f.sourceDigest};}}
 return {pass:sets.some(x=>x.freeze===latest)&&Object.values(out).every(x=>x.present&&x.bound),latestFreeze:latest,...out};
});
// The single funded-human queue changes only by the R7-A.1 append its integration record proves.
check('queue-append-only',()=>{
 const b=json(AUDIT+'BASELINE.json').entries.find(e=>e.path===QUEUE),now=sha(QUEUE);
 if(now===b.sha256)return {pass:!exists(QUEUE_RECORD),integrated:false,note:'Queue unchanged since the R7-A.1 baseline'};
 const rec=json(QUEUE_RECORD),q=json(QUEUE),back=structuredClone(q);back.items=back.items.slice(0,rec.before.items);back.queue_revision=rec.before.revision;delete back.r7a1_queue_addendum;
 const restored=createHash('sha256').update(JSON.stringify(back,null,2)+'\n').digest('hex'),appended=q.items.slice(rec.before.items).map(i=>i.queue_id);
 return {pass:rec.before.sha256===b.sha256&&restored===b.sha256&&rec.after.sha256===now&&appended.length>0&&appended.every(id=>/^HQ-R7A1-/.test(id))&&q.funding_trigger.state==='NOT_DECLARED',before:rec.before,after:{items:q.items.length,sha256:now},appended,earlierItemsByteIdentical:restored===b.sha256};
});
check('deliverables',()=>{const list=[AUDIT+'WEEK_COMPOSITION_CONTRACT.md',A1+'READINESS_R7A1.json',A1+'FINAL_REPORT_R7A1.md',AUDIT+'FINAL_DISPOSITION.json'],handoff='CoachingCore/r7/R7A_FINAL_HANDOFF.md',r=exists(A1+'READINESS_R7A1.json')?json(A1+'READINESS_R7A1.json'):{},ready=r.verdicts?.R7A_EXIT_READINESS==='READY';const missing=[...list,...(ready?[handoff]:[])].filter(p=>!exists(p)),handoffWithoutReady=!ready&&exists(handoff);return {pass:!missing.length&&!handoffWithoutReady,missing,handoffWithoutReady,exit:r.verdicts?.R7A_EXIT_READINESS??null};});
const out={revision:'R7A1-VERIFICATION-1',verifiedAt:new Date().toISOString(),node:process.version,passing:checks.filter(c=>c.pass).length,total:checks.length,checks};
if(process.argv.includes('--write'))fs.writeFileSync(abs(A1+'VERIFICATION_R7A1.json'),JSON.stringify(out,null,2)+'\n');
console.log(JSON.stringify({passing:out.passing,total:out.total,failing:checks.filter(c=>!c.pass).map(c=>c.id)}));
