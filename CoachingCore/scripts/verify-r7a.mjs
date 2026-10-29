// DOMAIN_COACHING_R7-A objective verification. Read-only unless --write, which writes only CoachingCore/r7/VERIFICATION_R7A.json.
// It never regenerates evidence and never runs historical verifiers (they rewrite closed missions' evidence).
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {hash} from '../src/value.mjs';
import {TRAJECTORIES} from '../r6/fixtures/trajectories.mjs';
const root=path.resolve(import.meta.dirname,'../..'),abs=p=>path.join(root,p),exists=p=>fs.existsSync(abs(p));
const sha=p=>createHash('sha256').update(fs.readFileSync(abs(p))).digest('hex'),json=p=>JSON.parse(fs.readFileSync(abs(p),'utf8'));
const AUDIT='audits/domain-coaching-r7a-2026-10-27/',R7='CoachingCore/r7/',PROBES=AUDIT+'probes/',REVIEWS=AUDIT+'reviews/';
const freezes=()=>fs.readdirSync(abs(R7)).filter(f=>/^RUNTIME_FREEZE_R7A_\d+\.json$/.test(f)).sort((a,b)=>Number(a.match(/\d+/)[0])-Number(b.match(/\d+/)[0]));
const freeze=()=>json(R7+freezes().at(-1));
const checks=[],check=(id,fn)=>{try{const detail=fn();checks.push({id,pass:detail?.pass!==false,detail});}catch(e){checks.push({id,pass:false,detail:{error:e.message}});}};
// R7-A may change only these baseline files (the runtime delta is also listed by the freeze); mission files only by appending.
const RUNTIME_DELTA=['CoachingCore/src/r6-adaptation.mjs','CoachingCore/src/r6-intake.mjs','CoachingCore/src/r6-prescription.mjs','CoachingCore/src/r6-program.mjs','CoachingCore/src/r6-provenance.mjs'],INSERT_ONLY={'CURRENT_MISSION.md':AUDIT+'snapshots/CURRENT_MISSION.before-r7a-entry.md','MISSION_LEDGER.md':AUDIT+'snapshots/MISSION_LEDGER.before-r7a-entry.md'};
// The single funded-human revalidation queue changes only by the R7-A append its integration record proves (queue-append-only).
const QUEUE='reviews/provisional-sports-science/2026-10-23/HUMAN_REVALIDATION_QUEUE.json',QUEUE_RECORD=AUDIT+'QUEUE_INTEGRATION_R7A.json';
// Outputs of the author instruments for the latest freeze: FREEZE-1 wrote *.AFTER, the second cycle *.CYCLE2.
const TAG=()=>freezes().length>1?'CYCLE2':'AFTER';
const NEW_ALLOWED=[/^CoachingCore\/r7\//,/^CoachingCore\/test\/r7a-[^/]+\.test\.mjs$/,/^CoachingCore\/scripts\/(prepare|regress|freeze|verify|queue)-r7a\.mjs$/];
const walk=(rel,out=[])=>{for(const e of fs.readdirSync(abs(rel),{withFileTypes:true})){const p=path.posix.join(rel,e.name);if(e.name==='node_modules')continue;if(e.isDirectory())walk(p,out);else out.push(p);}return out;};

check('baseline-preserved',()=>{
 const b=json(AUDIT+'BASELINE.json'),changed=b.entries.filter(e=>!exists(e.path)||sha(e.path)!==e.sha256).map(e=>e.path);
 const unexpected=changed.filter(p=>!RUNTIME_DELTA.includes(p)&&!INSERT_ONLY[p]&&p!==QUEUE);
 const insertOnly=Object.entries(INSERT_ONLY).map(([p,snap])=>{const before=fs.readFileSync(abs(snap)),now=fs.readFileSync(abs(p)),base=b.entries.find(e=>e.path===p).sha256;return {file:p,snapshotEqualsBaseline:createHash('sha256').update(before).digest('hex')===base,prefixPreserved:now.subarray(0,before.length).equals(before),appendedBytes:now.length-before.length};});
 const bound=new Set(b.entries.map(e=>e.path)),added=['CoachingCore','product','canon','audits/domain-coaching-r6-2026-10-26','audits/v1-wearable-scope-2026-10-27'].flatMap(d=>walk(d)).filter(p=>!bound.has(p));
 const addedOutsideR7A=added.filter(p=>!NEW_ALLOWED.some(r=>r.test(p)));
 return {pass:!unexpected.length&&insertOnly.every(x=>x.snapshotEqualsBaseline&&x.prefixPreserved)&&!addedOutsideR7A.length,entries:b.entries.length,changed,unexpected,insertOnly,addedFiles:added.length,addedOutsideR7A};
});
check('freeze-current',()=>{
 const f=freeze(),cc=p=>'CoachingCore/'+p,drift=Object.entries(f.files).filter(([p,h])=>!exists(cc(p))||sha(cc(p))!==h).map(([p])=>p);
 const srcNow=fs.readdirSync(abs('CoachingCore/src')).filter(x=>x.endsWith('.mjs')).map(x=>'src/'+x),testNow=fs.readdirSync(abs('CoachingCore/test')).filter(x=>x.endsWith('.mjs')).map(x=>'test/'+x),unfrozen=[...srcNow,...testNow].filter(p=>!(p in f.files));
 return {pass:!drift.length&&!unfrozen.length,revision:f.revision,sourceDigest:f.sourceDigest,drift,unfrozen};
});
check('policy-unchanged',()=>{const p=json('CoachingCore/r6/PROGRAM_POLICY_R6.json'),h=hash(p);return {pass:h==='18ec48f34768a7eebb2aede618db65a77385efebbda0a38d6f03135e5cd96b4c'&&sha('CoachingCore/r6/PROGRAM_POLICY_R6.json')==='a75be1aae3818616888e641c104407926d5f16f213a04137f5b21024ccafe100',policyHash:h,revision:p.revision};});
check('tests',()=>{
 const r=spawnSync(process.execPath,['--test'],{cwd:abs('CoachingCore'),encoding:'utf8',maxBuffer:256*1024*1024}),n=k=>Number(r.stdout.match(new RegExp('ℹ '+k+' (\\d+)'))?.[1]??NaN);
 return {pass:r.status===0&&n('fail')===0,tests:n('tests'),pass_:n('pass'),fail:n('fail'),node:process.version};
});
// Every difference from the R6 closure runtime, named by the R7-A fix that makes it (CoachingCore/r7/README.md, regression section).
const EXPLAINED={
 holdout:{'R6-H05':'QE-R7A-14 projected return ceiling after a time-fitted week','R6-H07':'C07 intake records merge by content','R6-H17':'QE-R7A-02 a same-day session re-planned by the return','R6-H18':'QE-R7A-12 HOLD keeps the repetition target (state only)','R6-H23':'C16 a dated schedule change is asked','R6-H25':'D53 regain after any re-establishment','R6-H26':'D53/D54 rows state the post-return set cap (same visible dose); QE-R7A-02 the return-day session','R6-H29':'C18 a finished race is complete','R6-H30':'C18 a finished race is complete','R6-H32':'C10 the carried record keeps corrections','R6-H35':'D53/D54 rows state the post-return set cap (same visible dose)'},
 profiles:{WALK_JOG_FIVE_DAYS:'QE-R7A-14 projected return ceiling after a time-fitted week'},
 simulations:{T04_STRENGTH12_REPEATED_UNDERPERFORMANCE:'QE-R7A-12',T05_10K8_SHORT_INTERRUPTION:'QE-R7A-02',T08_NOVICE8_MODERATE_INTERRUPTION:'QE-R7A-02',T13_HM16_FATIGUE_SIGNALS:'QE-R7A-12'}
};
check('regression',()=>{
 const g=json(R7+'REGRESSION_R7A.json'),src=Object.entries(g.currentSources).filter(([p,h])=>sha(p)!==h).map(([p])=>p);
 const s=g.summary,unexplained=s.r6FreshHoldout.different.filter(x=>!EXPLAINED.holdout[x]),profiles=s.profiles.different.filter(x=>!EXPLAINED.profiles[x]);
 const trajectories=[...new Set((g.simulations.differences??[]).map(d=>TRAJECTORIES[Number(d.path.split('/')[1])]?.id??d.path))],simulations=trajectories.filter(x=>!EXPLAINED.simulations[x]);
 return {pass:!src.length&&s.r5Corpus.identical===s.r5Corpus.cases&&!profiles.length&&!simulations.length&&!unexplained.length&&JSON.stringify(s.r6FreshHoldout.statusChanged.map(x=>x.split(':')[0]))==='["R6-H23"]',sourcesBoundToCurrentRuntime:!src.length,r5:`${s.r5Corpus.identical}/${s.r5Corpus.cases}`,profiles:`${s.profiles.identical}/${s.profiles.cases}`,simulationTrajectoriesDifferent:trajectories,r6Holdout:`${s.r6FreshHoldout.identical}/${s.r6FreshHoldout.cases}`,unexplained:{holdout:unexplained,profiles,simulations},statusChanged:s.r6FreshHoldout.statusChanged,classification:g.classification};
});
check('class-probes',()=>{
 const a=json(PROBES+`r7a-class-probes.${TAG()}.out.json`).sections,b=json(PROBES+'r7a-class-probes.BEFORE.out.json').sections,routed=['C15_unreviewedWeeks'];
 const after=Object.fromEntries(Object.entries(a).map(([k,v])=>[k,v.error?'ERROR':v.reproduced?'REPRODUCED':'NOT_REPRODUCED'])),before=Object.fromEntries(Object.entries(b).map(([k,v])=>[k,v.error?'ERROR':v.reproduced?'REPRODUCED':'NOT_REPRODUCED']));
 const open=Object.entries(after).filter(([k,v])=>v!=='NOT_REPRODUCED'&&!routed.includes(k)).map(([k])=>k);
 return {pass:!open.length&&a.C03_phaseBoundsAllRowKinds.rowsChecked>0,before,after,routed,open};
});
check('ssctr-instrument',()=>{
 const a=json(PROBES+`ssctr-r12-instrument.${TAG()}.out.json`).sections,b=json(PROBES+'ssctr-r12-instrument.BEFORE.out.json').sections,official=json('audits/domain-coaching-r6-2026-10-26/reviews/ssctr-probe-runtime-d53-r12.out.json').sections;
 const beforeIsOfficial=Object.keys(official).every(k=>JSON.stringify(official[k])===JSON.stringify(b[k]));
 return {pass:beforeIsOfficial&&a.AK_reducedPhaseReestablishment.aboveThePhaseDose.length===0&&a.AI_regainTrajectory.noisyLogs.nextExposureMoreThanOneAbove===0&&a.AH_setsAfterReestablishment.moreThanOneSetAboveTheReestablishment===0,beforeIsOfficialRound12Output:beforeIsOfficial,akAboveThePhaseDose:`${b.AK_reducedPhaseReestablishment.aboveThePhaseDose.length} -> ${a.AK_reducedPhaseReestablishment.aboveThePhaseDose.length}`,aiNoisyNextExposureJumps:`${b.AI_regainTrajectory.noisyLogs.nextExposureMoreThanOneAbove} -> ${a.AI_regainTrajectory.noisyLogs.nextExposureMoreThanOneAbove}`,aiViolationsAsPrescribed:`${b.AI_regainTrajectory.asPrescribed.violationCount} -> ${a.AI_regainTrajectory.asPrescribed.violationCount}`,aiViolationsNoisy:`${b.AI_regainTrajectory.noisyLogs.violationCount} -> ${a.AI_regainTrajectory.noisyLogs.violationCount}`,note:'AI violations after R7-A are the regain-base question Q1, ruled by the SSCTR review'};
});
// Every single-fix revert applies, and each one the R7-A tests do not catch carries a stated reason and its search (DOCUMENTED).
check('mutation-check',()=>{const m=json(PROBES+'mutation-check-r7a.out.json'),open=m.results.filter(r=>!r.caught&&!r.documented).map(r=>r.mutation);return {pass:m.total>0&&m.results.every(r=>r.applied)&&!open.length,caught:m.caught,total:m.total,documentedSurvivors:m.results.filter(r=>!r.caught&&r.documented).map(r=>r.mutation),open};});
// Each judge's review binds the freeze it reviewed: the first review R7A-FREEZE-1, the single narrow re-check the latest freeze.
const REVIEW_SETS=[{freeze:'RUNTIME_FREEZE_R7A_1.json',ssctr:REVIEWS+'ssctr-r7a-review.json',engineering:REVIEWS+'quality-engineering-r7a-review.json'},{freeze:'RUNTIME_FREEZE_R7A_2.json',ssctr:REVIEWS+'ssctr-r7a-recheck.json',engineering:REVIEWS+'quality-engineering-r7a-recheck.json'}];
check('independent-reviews',()=>{
 const latest=freezes().at(-1),sets=REVIEW_SETS.filter(x=>exists(R7+x.freeze)),out={};
 for(const set of sets){
  const f=json(R7+set.freeze),files=Object.fromEntries(Object.entries(f.files).map(([p,h])=>['CoachingCore/'+p,h]));
  // A review binds by the hashes of the runtime files it lists (copies outside CoachingCore/, such as the pre-R7A snapshot, are not the
  // reviewed runtime) or by the freeze's source digest it declares.
  const bound=r=>{const list=r.reviewedFiles??r.reviewed?.files??r.target?.files??{},entries=(Array.isArray(list)?list.map(x=>[x.path??x.file,x.sha256]):Object.entries(list)).filter(([p])=>typeof p==='string'&&p.startsWith('CoachingCore/'));const mismatch=entries.filter(([p,h])=>files[p]!==undefined&&files[p]!==h).map(([p])=>p),digest=r.freezeReviewed?.sourceDigest??r.target?.sourceDigest??r.sourceDigest??null,digestMatches=digest===null?null:digest===f.sourceDigest;return {reviewedFiles:entries.length,digest,digestMatches,mismatch,bound:(entries.some(([p])=>files[p]!==undefined)||digestMatches===true)&&!mismatch.length&&digestMatches!==false};};
  for(const k of ['ssctr','engineering']){const p=set[k];if(!exists(p)){out[set.freeze+':'+k]={present:false};continue;}const r=json(p);out[set.freeze+':'+k]={present:true,file:p,revision:r.revision??null,...bound(r)};}
 }
 return {pass:sets.some(x=>x.freeze===latest)&&Object.values(out).every(x=>x.present&&x.bound),latestFreeze:latest,...out};
});
check('queue-append-only',()=>{
 const b=json(AUDIT+'BASELINE.json').entries.find(e=>e.path===QUEUE),now=sha(QUEUE);
 if(now===b.sha256)return {pass:false,integrated:false,note:'The SSCTR queue items of R7-A are not integrated'};
 const rec=json(QUEUE_RECORD),q=json(QUEUE),back=structuredClone(q);back.items=back.items.slice(0,rec.before.items);back.queue_revision=rec.before.revision;delete back.r7a_queue_addendum;
 const restored=createHash('sha256').update(JSON.stringify(back,null,2)+'\n').digest('hex'),appended=q.items.slice(rec.before.items).map(i=>i.queue_id);
 return {pass:rec.before.sha256===b.sha256&&restored===b.sha256&&rec.after.sha256===now&&appended.length>0&&appended.every(id=>/^HQ-R7A-/.test(id))&&q.funding_trigger.state==='NOT_DECLARED',before:rec.before,after:{items:q.items.length,sha256:now},appended,earlierItemsByteIdentical:restored===b.sha256};
});
check('deliverables',()=>{const list=[R7+'README.md',R7+'CLASS_DISPOSITIONS_R7A.json',R7+'READINESS_R7A.json',R7+'FINAL_REPORT_R7A.md',AUDIT+'FINAL_DISPOSITION.json',QUEUE_RECORD],r=json(R7+'READINESS_R7A.json'),handoff=R7+'R7A_FINAL_HANDOFF.md';const missing=[...list,...(r.verdicts?.R7A_EXIT_READINESS==='READY'?[handoff]:[])].filter(p=>!exists(p));return {pass:!missing.length,missing,exit:r.verdicts?.R7A_EXIT_READINESS??null};});
const out={revision:'R7A-VERIFICATION-1',verifiedAt:new Date().toISOString(),node:process.version,passing:checks.filter(c=>c.pass).length,total:checks.length,checks};
if(process.argv.includes('--write'))fs.writeFileSync(abs(R7+'VERIFICATION_R7A.json'),JSON.stringify(out,null,2)+'\n');
console.log(JSON.stringify({passing:out.passing,total:out.total,failing:checks.filter(c=>!c.pass).map(c=>c.id)}));
