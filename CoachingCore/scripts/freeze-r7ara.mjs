// COACHING CORE — R7-A RESIDUAL AUTHORITY single freeze (node scripts/freeze-r7ara.mjs): binds the runtime, tests and policy both rechecks will
// read, on the same bytes, together with the evidence recorded on those bytes before the freeze (Founder request §30: source digest, manifest,
// branch, commit, runtime delta, targeted tests, properties, mutation, regressions) and the Cloud git state (§31). There is one freeze,
// R7A-RESIDUAL-AUTHORITY-FREEZE-1: an existing freeze file is never overwritten and a second one is refused. The freeze is refused while the suite
// fails, while any recorded evidence ran on other bytes or failed without a named cause, while a pre-freeze gate (§29) is open, or while closed
// history differs from its baseline. The delta is stated against R7A-DECISION-AUTHORITY-FREEZE-1 (the byte-exact copy in
// audits/domain-coaching-r7a-residual-authority-2026-10-30/decision-authority-freeze-source). After it the runtime is not changed.
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {hash} from '../src/value.mjs';
const cc=path.resolve(import.meta.dirname,'..'),repo=path.resolve(cc,'..'),revision='R7A-RESIDUAL-AUTHORITY-FREEZE-1';
const dir=path.join(cc,'r7/residual-authority'),target=path.join(dir,'RUNTIME_FREEZE_R7A_RESIDUAL_AUTHORITY.json');
const AUDIT='audits/domain-coaching-r7a-residual-authority-2026-10-30/',PROBES=AUDIT+'probes/',BASE_BRANCH='claude/trusting-euler-04la8t',BRANCH='claude/r7a-residual-authority-closure';
if(fs.existsSync(dir)&&fs.readdirSync(dir).some(f=>/^RUNTIME_FREEZE_/.test(f)))throw Error('The residual authority closure has its single freeze already; no further freeze (Founder request §30)');
const shaAt=p=>createHash('sha256').update(fs.readFileSync(p)).digest('hex'),sha=p=>shaAt(path.join(cc,p)),shaRepo=p=>shaAt(path.join(repo,p)),json=p=>JSON.parse(fs.readFileSync(path.join(repo,p),'utf8'));
const refuse=why=>{throw Error('Freeze refused: '+why);};
const git=(...a)=>{const r=spawnSync('git',a,{cwd:repo,encoding:'utf8'});if(r.status!==0)refuse('git '+a.join(' ')+': '+r.stderr);return r.stdout.replace(/\n$/,'');};
// The bound files: runtime, tests, policy, dev fixtures, package.json (as R7A-DECISION-AUTHORITY-FREEZE-1 binds them).
const files=Object.fromEntries([...fs.readdirSync(path.join(cc,'src')).filter(f=>f.endsWith('.mjs')).map(f=>'src/'+f),...fs.readdirSync(path.join(cc,'test')).filter(f=>f.endsWith('.mjs')).map(f=>'test/'+f),'r6/PROGRAM_POLICY_R6.json','r6/fixtures/dev-authority.mjs','r6/fixtures/profiles.mjs','r6/fixtures/trajectories.mjs','package.json'].sort().map(p=>[p,sha(p)]));
const policy=JSON.parse(fs.readFileSync(path.join(cc,'r6/PROGRAM_POLICY_R6.json'),'utf8').replace(/^﻿/,''));
const pf=json(AUDIT+'decision-authority-freeze-source/MANIFEST.json'),prior=p=>pf.files['CoachingCore/'+p];
const changed=Object.keys(files).filter(p=>prior(p)!==undefined&&prior(p)!==files[p]),added=Object.keys(files).filter(p=>prior(p)===undefined),removed=Object.keys(pf.files).map(p=>p.replace(/^CoachingCore\//,'')).filter(p=>!files[p]);
const sourceDigest=hash(Object.fromEntries(Object.entries(files).filter(([p])=>p.startsWith('src/'))));
const manifestDigest=hash(files);
// Closed history: every file the baseline bound before the first edit is unchanged, except this mission's own runtime, tests, scripts and folders,
// and the mission files, which are append-only (checked against the baseline commit).
const baseline=json(AUDIT+'BASELINE.json'),ownPrefixes=['CoachingCore/src/','CoachingCore/test/','CoachingCore/scripts/','CoachingCore/r7/residual-authority/',AUDIT];
const drift=baseline.entries.filter(e=>!ownPrefixes.some(p=>e.path.startsWith(p))&&!['CURRENT_MISSION.md','MISSION_LEDGER.md'].includes(e.path)).filter(e=>!fs.existsSync(path.join(repo,e.path))||shaRepo(e.path)!==e.sha256).map(e=>e.path);
if(drift.length)refuse('closed history differs from the baseline: '+drift.slice(0,20).join(', '));
const ownEdits=baseline.entries.filter(e=>ownPrefixes.some(p=>e.path.startsWith(p))&&(!fs.existsSync(path.join(repo,e.path))||shaRepo(e.path)!==e.sha256)).map(e=>e.path);
const notInScope=ownEdits.filter(p=>!(Object.keys(files).map(f=>'CoachingCore/'+f).includes(p)));
if(notInScope.length)refuse('baseline files changed outside the runtime and tests: '+notInScope.join(', '));
const baseCommit=pf.baselineCommit??git('rev-parse',BASE_BRANCH);
for(const f of ['CURRENT_MISSION.md','MISSION_LEDGER.md']){const base=spawnSync('git',['show',`${baseCommit}:${f}`],{cwd:repo,encoding:'buffer'}).stdout,now=fs.readFileSync(path.join(repo,f));if(!base.length||!now.subarray(0,base.length).equals(base))refuse(f+' is not an append-only extension of '+baseCommit);}
const pred=pf.freeze;if(shaRepo(pred.file)!==pred.fileSha256)refuse('R7A-DECISION-AUTHORITY-FREEZE-1 freeze file changed');
const growth='audits/growth-layer-2026-10-29/PENDING_CANON_SYNC.patch';if(shaRepo(growth)!=='6b737179873535dac0ebc950aa0637866ea2c32df396cf9b93a80654940820d6')refuse('the Growth Layer patch changed');
// The suite, on these bytes.
const t=spawnSync(process.execPath,['--test','--test-reporter=spec'],{cwd:cc,encoding:'utf8',maxBuffer:256*1024*1024}),n=k=>Number(t.stdout.match(new RegExp('ℹ '+k+' (\\d+)'))?.[1]??NaN);
const tests={tests:n('tests'),pass:n('pass'),fail:n('fail'),node:process.version};
if(t.status!==0||tests.fail!==0||!(tests.pass>0))refuse('the suite does not pass on these bytes: '+JSON.stringify(tests));
// The finding regressions and properties of this mission, and the earlier ones they must not break, by name, in the passing suite.
const NAMES=['QE-R7ADA-01: a correction','QE-R7ADA-01 last day','QE-R7ADA-01 robustness','QE-R7ADA-02 / EASY return factual ceiling','SSCTR F4-X','P1 factual correction globality','P2 a retracted value','P3 return factual ceiling','P4 execution promotes','SSCTR F4','P6 walk/jog ceiling','P7 execution promotion','QE-R7ASC-01','QE-R7ASC-02','QE-R7ASC-03','QE-R7ASC-04','HOLD (Founder 1.3)','MAINTAIN (Founder §23)'];
const passed=[...t.stdout.matchAll(/^✔ (.+?) \(\d/gm)].map(m=>m[1]),properties=Object.fromEntries(NAMES.map(k=>[k,passed.filter(x=>x.startsWith(k)).length]));
if(Object.values(properties).some(v=>!v))refuse('a finding regression, property or preserved test is not in the passing suite: '+JSON.stringify(properties));
// The evidence recorded before the freeze, each run bound to this source digest; the only failing run is the kit's named R6-H35 runner error.
const ev=json(PROBES+'EVIDENCE_RUNS_R7ARA.json'),NAMED_FAILURE=['kit/regression'],key=r=>r.group+'/'+r.name;
const evBad=ev.runs.filter(r=>r.sourceDigestStart!==sourceDigest||r.sourceDigestEnd!==sourceDigest||r.exit!==0&&!NAMED_FAILURE.includes(key(r))).map(key);
const evDrift=ev.runs.filter(r=>shaRepo(r.output)!==r.outSha256).map(key);
if(evBad.length||evDrift.length)refuse('evidence runs not bound to '+sourceDigest+', failed without a named cause, or changed after their run: '+JSON.stringify({evBad,evDrift}));
const REQUIRED_GROUPS=['suite','kit','findings','asc','r7asc-qe','judges','self-challenge','tests','regression','mutation'];
const missingGroups=REQUIRED_GROUPS.filter(g=>!ev.runs.some(r=>r.group===g));if(missingGroups.length)refuse('evidence groups missing: '+missingGroups.join(', '));
const out_=(g,name)=>json(ev.runs.find(r=>r.group===g&&r.name===name).output);
// The pre-freeze gates (§29), read from the reviewers' own probes on both trees.
const Q01=out_('findings','Q01.cand'),Q01p=out_('findings','Q01.pred'),Q01b=out_('findings','Q01b.cand'),Q01bp=out_('findings','Q01b.pred');
const Q06c=out_('findings','Q06c.cand'),Q06cp=out_('findings','Q06c.pred'),Q06=out_('findings','Q06.cand'),Q06b=out_('findings','Q06b.cand');
const C=out_('findings','ssctr-continuous.cand'),Cp=out_('findings','ssctr-continuous.pred'),M=out_('findings','ssctr-walkjog-matrix.cand'),WJ=out_('asc','walkjog.cand');
// Q06's remaining flags are the two declared readings (RESIDUAL_AUTHORITY_CONTRACT.md): W-ADVERSE (OBS-2, W2 unchanged) and the moderate E-RELEASED
// cell, whose first long run is a row inside the pause, planned before it (the rows after the report are return step 0).
const q06Other=Q06.cases.filter(c=>c.violation&&!(c.shape==='W-ADVERSE'||c.shape==='E-RELEASED'&&c.days===17&&(c.r?.firstRows??[]).every(x=>x.dim==='RETURN_STEP'&&x.value<=1))).map(c=>`${c.shape} ${c.A??c.k??''} ${c.days}`);
// Q06b's remaining easy flags are the eased first quality slot after a short break (D58, its progression is the quality step) and its quality flags
// the quality ladder (E1-B1); no long run and no easy-minutes run is above the last executed.
const q06bOther=Q06b.cases.filter(c=>c.shape==='EASY_SHORT').filter(c=>{const last=c.lastExecuted,lastLong=last.find(x=>x.role==='LONG')?.minutes,lastEasy=Math.max(...last.filter(x=>x.role==='EASY'&&x.dim==='EASY_MINUTES').map(x=>x.minutes));
 return c.return.first.some(x=>x.role==='LONG'&&x.minutes>lastLong||x.role==='EASY'&&x.dim==='EASY_MINUTES'&&x.minutes>lastEasy);}).map(c=>'k='+c.k).concat(Q06b.cases.filter(c=>c.shape==='WALKJOG_EXIT_SHORT'&&c.aboveLastCompleted.continuousMinutes).map(c=>'exit '+c.days));
const sc=out_('self-challenge','cand'),scp=out_('self-challenge','pred'),mut=json(PROBES+'runs/mutation.out.json'),tp=json(PROBES+'runs/tests-on-predecessor.out.json');
const MUST_FAIL_ON_PREDECESSOR=NAMES.slice(0,8);
const gates={
 'QE-R7ADA-01':Q01.summary.violations.length===0&&Q01.summary.errors===0&&Q01b.summary.violations.length===0,
 'QE-R7ADA-02':Q06c.summary.violations.length===0&&!q06Other.length&&!q06bOther.length,
 'F4-X':C.totals.ladderViewAbove===0&&C.totals.durationViewAbove===0,
 EASY_RETURN_FACTUAL_CEILING:Q06c.cases.filter(c=>c.shape==='EASY_SHORT').every(c=>!c.violation)&&['E1.easy-short','E1.easy-moderate','E1.easy-repeated-pause'].every(k=>sc.classes[k]?.violations===0),
 F4_LADDER:M.totals.entryAbove===0&&M.totals.spanAbove===0&&M.totals.continuousInSpan===0&&WJ.totals.aboveRecipeAfterSecondReturn===0,
 reproducedOnPredecessor:Q01p.summary.violations.length>0&&Q01bp.summary.violations.length>0&&Q06cp.summary.violations.length>0&&Cp.totals.ladderViewAbove>0,
 testsFailOnPredecessor:MUST_FAIL_ON_PREDECESSOR.every(k=>tp.failing.some(x=>x.startsWith(k)))&&tp.passingNames.some(x=>x.startsWith('P4 execution promotes')),
 selfChallenge:sc.total.violations===0,
 mutation:mut.summary.mutants===4&&mut.summary.killed===4&&!mut.summary.survivors.length};
if(Object.values(gates).some(v=>!v))refuse('a pre-freeze gate is open: '+JSON.stringify({gates,q06Other,q06bOther}));
// Every difference against the predecessor has a named cause (§27).
const named=json(PROBES+'NAMED_DIFFERENCES_R7ARA.json');
if(named.unnamed.length)refuse('differences without a named cause: '+JSON.stringify(named.unnamed));
const reg=json('CoachingCore/r7/residual-authority/REGRESSION_R7ARA.json'),regDrift=Object.entries(reg.runtimes.current.sources).filter(([p,h])=>shaRepo(p)!==h).map(([p])=>p);
if(regDrift.length)refuse('the regression ran on other sources: '+regDrift.join(', '));
// The Cloud git state (§31), recorded before the freeze commit.
const gitState={branch:git('branch','--show-current'),head:git('rev-parse','HEAD'),base:{branch:BASE_BRANCH,commit:git('rev-parse',BASE_BRANCH)},statusShort:git('status','--short').split('\n').filter(Boolean),diffStat:git('diff','--stat').split('\n').filter(Boolean)};
if(gitState.branch!==BRANCH)refuse('not on the Cloud session branch: '+gitState.branch);
// The session's checkpoint commits since the baseline (pushed so the work survives the container) touch only this mission's own paths and the
// append-only mission files; the frozen bytes are those of the working tree, checked above.
if(spawnSync('git',['merge-base','--is-ancestor',gitState.base.commit,gitState.head],{cwd:repo}).status!==0)refuse('the baseline commit is not an ancestor of HEAD: '+gitState.head);
const committed=git('diff','--name-only',gitState.base.commit,gitState.head).split('\n').filter(Boolean),foreign=committed.filter(p=>!ownPrefixes.some(x=>p.startsWith(x))&&!['CURRENT_MISSION.md','MISSION_LEDGER.md'].includes(p));
if(foreign.length)refuse('commits since the baseline touch other paths: '+foreign.join(', '));
gitState.commitsSinceBase=git('log','--format=%H %s',`${gitState.base.commit}..${gitState.head}`).split('\n').filter(Boolean);
const bind=p=>({path:p,sha256:shaRepo(p)});
const out={revision,frozenAt:new Date().toISOString(),node:process.version,
 sourceRevision:{baseline:AUDIT+'BASELINE.json',baselineSha256:shaRepo(AUDIT+'BASELINE.json'),predecessor:pred.revision,predecessorSourceDigest:pred.sourceDigest,predecessorManifestDigest:pred.manifestDigest,predecessorFreezeFile:{path:pred.file,sha256:pred.fileSha256},predecessorCommits:{freeze:'d4631cd03fb27bbc1857532500748476ab764987',handoff:'5434b3265f5634d1e7c796426cd9d8415b3b1af2'}},
 git:gitState,
 policyRevision:policy.revision,policyHash:hash(policy),policyFileSha256:files['r6/PROGRAM_POLICY_R6.json'],sourceDigest,manifestDigest,runtimeFiles:Object.keys(files).filter(p=>p.startsWith('src/')),files,
 deltaFromPredecessorFreeze:{changed,added,removed,baseline:AUDIT+'decision-authority-freeze-source/MANIFEST.json',priorFreezeSourceDigest:pred.sourceDigest},
 tests:{...tests,findingRegressionsAndProperties:properties,onPredecessor:{...bind(PROBES+'runs/tests-on-predecessor.out.json'),total:tp.total,passing:tp.passing,failing:tp.failing.length}},
 preFreezeGates:{...gates,declaredReadings:{q06:'W-ADVERSE (OBS-2: W2 reads any complete execution, consistent with HOLD; SSCTR question) and E-RELEASED moderate 17 days (its first long run is a row inside the pause, planned before it; the rows after the report are return step 0)',q06b:'the easy flags are the eased first quality slot after a short break (D58), the quality flags the quality ladder (E1-B1)'},
  findings:{Q01:{candidate:Q01.summary.violations.length,predecessor:Q01p.summary.violations.length,cells:Q01.summary.cases},Q01b:{candidate:Q01b.summary.violations.length,predecessor:Q01bp.summary.violations.length,cells:Q01b.summary.cases},Q06c:{candidate:Q06c.summary.violations.length,predecessor:Q06cp.summary.violations.length,cells:Q06c.summary.cases},continuous:{candidate:{ladder:C.totals.ladderViewAbove,duration:C.totals.durationViewAbove,weekly:C.totals.weeklyAboveExecutedAndPrior},predecessor:{ladder:Cp.totals.ladderViewAbove,duration:Cp.totals.durationViewAbove,weekly:Cp.totals.weeklyAboveExecutedAndPrior},cells:C.totals.cells},walkjogMatrix:M.totals},
  selfChallenge:{candidate:sc.total,predecessor:scp.total},mutation:mut.summary,namedDifferences:named.summary,closedHistory:{baselineFilesChecked:baseline.entries.length,drift:0,growthPatch:'unchanged, not applied',missionFiles:'append-only against '+baseCommit}},
 evidence:{
  probes:{...bind(PROBES+'EVIDENCE_RUNS_R7ARA.json'),runs:ev.runs.length,boundTo:sourceDigest,namedFailure:NAMED_FAILURE},
  comparison:bind(PROBES+'COMPARISON_R7ARA.json'),namedDifferences:bind(PROBES+'NAMED_DIFFERENCES_R7ARA.json'),mutation:bind(PROBES+'runs/mutation.out.json'),
  regression:{...bind('CoachingCore/r7/residual-authority/REGRESSION_R7ARA.json'),summary:reg.summary},
  documents:['FOUNDER_REQUEST.md','TASK_CONTRACT.md','RESIDUAL_AUTHORITY_CONTRACT.md'].map(p=>bind(AUDIT+p))},
 rule:'The runtime is frozen: both rechecks read these bytes, and no reviewer runs in the session that froze it (Founder request §32). The rechecks are narrow (§33, §34): QE-R7ADA-01 and QE-R7ADA-02 with the A/B/E properties they touch; F4-X, the EASY return ceiling, F1-F4, D53/D56-D59, HOLD and MAINTAIN. A finding outside the two root causes does not reopen phase A by itself (§35).'};
fs.mkdirSync(dir,{recursive:true});
fs.writeFileSync(target,JSON.stringify(out,null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify({revision,sourceDigest,manifestDigest,policyHash:out.policyHash,files:Object.keys(files).length,tests,changed,added,removed,git:{branch:gitState.branch,head:gitState.head}}));
