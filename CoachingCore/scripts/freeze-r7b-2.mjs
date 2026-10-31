// R7-B fix-cycle freeze (node scripts/freeze-r7b-2.mjs): R7B-RUNTIME-REPERTOIRE-FREEZE-2, the one freeze after the bounded fix cycle that the
// independent reviews of R7B-RUNTIME-REPERTOIRE-FREEZE-1 opened (Founder loop bound: one cycle, one narrow recheck). It binds the same kinds of
// bytes as FREEZE-1 (runtime, tests, fixtures, scripts, conformance matrix, policy identity, catalog binding) and records, on these bytes: the
// suite, the conformance check, the differential regression against the R7-A predecessor (refused on any dose or status finding), an
// informational differential against FREEZE-1, and the bounded mutation probe (refused on an undocumented survivor). It refuses while the
// FREEZE-1 record or a review record of FREEZE-1 differs from its committed bytes, while the policy, the catalog, its schema, the SSCTR r2
// records or the R7-A freeze record differ from the B0 closure, or while the mission files are not append-only. Evidence goes to *_2 files;
// FREEZE-1 and its evidence stay as they were. One FREEZE-2: an existing record is never overwritten.
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {hash} from '../src/value.mjs';
const cc=path.resolve(import.meta.dirname,'..'),repo=path.resolve(cc,'..'),revision='R7B-RUNTIME-REPERTOIRE-FREEZE-2',BASE='c66966e041443b0043c6c01718e840604380c9b9',FREEZE1_COMMIT='4995d58';
const target=path.join(cc,'r7/b/RUNTIME_FREEZE_R7B_2.json');
if(fs.existsSync(target))throw Error('FREEZE-2 exists already ('+target+'); no further freeze in R7-B');
const sha=p=>createHash('sha256').update(fs.readFileSync(path.join(cc,p))).digest('hex'),shaRepo=p=>createHash('sha256').update(fs.readFileSync(path.join(repo,p))).digest('hex');
const refuse=why=>{throw Error('Freeze refused: '+why);};
const git=(...a)=>{const r=spawnSync('git',a,{cwd:repo,encoding:'utf8',maxBuffer:64*1024*1024});if(r.status!==0)refuse('git '+a.join(' ')+': '+r.stderr);return r.stdout;};
const shaAt=(rev,p)=>{const r=spawnSync('git',['show',`${rev}:${p}`],{cwd:repo,encoding:'buffer',maxBuffer:64*1024*1024});if(r.status!==0)refuse(`git show ${rev}:${p}`);return createHash('sha256').update(r.stdout).digest('hex');};
// FREEZE-1 and the reviews that opened the cycle, unchanged.
const F1='CoachingCore/r7/b/RUNTIME_FREEZE_R7B.json',f1=JSON.parse(fs.readFileSync(path.join(repo,F1),'utf8'));
if(shaRepo(F1)!==shaAt(FREEZE1_COMMIT,F1)||f1.revision!=='R7B-RUNTIME-REPERTOIRE-FREEZE-1')refuse('the FREEZE-1 record differs from its commit');
const R='audits/domain-coaching-r7-b-2026-10-31/reviews/',REVIEWS={SSCTR:R+'ssctr/SSCTR_REVIEW_R7B.json',ENGINEERING:R+'engineering/ENGINEERING_REVIEW_R7B.json',QUALITY:R+'quality/QUALITY_REVIEW_R7B.json'};
const reviewsOfFreeze1={};
for(const [gate,p] of Object.entries(REVIEWS)){const committed=git('log','-1','--format=%H','--',p).trim();if(!committed)refuse('review record not committed: '+p);if(shaRepo(p)!==shaAt('HEAD',p))refuse('review record changed: '+p);reviewsOfFreeze1[gate]={record:p,sha256:shaRepo(p),commit:committed};}
reviewsOfFreeze1.SSCTR.gate='BLOCK';reviewsOfFreeze1.ENGINEERING.gate='NOT_READY';reviewsOfFreeze1.QUALITY.gate='NOT_READY';
// Inputs that must equal the B0 closure byte for byte, and append-only mission files.
const UNCHANGED=['CoachingCore/r6/PROGRAM_POLICY_R6.json','CoachingCore/r7/b0/REPERTOIRE_CATALOG_B0.json','CoachingCore/r7/b0/REPERTOIRE_CATALOG_B0.schema.json','CoachingCore/r7/b0/REPERTOIRE_FOUNDATION_B0.md','audits/domain-coaching-r7-b0-2026-10-31/reviews/SSCTR_RECHECK_B0.json','CoachingCore/r7/residual-authority/RUNTIME_FREEZE_R7A_RESIDUAL_AUTHORITY.json','audits/growth-layer-2026-10-29/PENDING_CANON_SYNC.patch'];
const drift=UNCHANGED.filter(p=>shaRepo(p)!==shaAt(BASE,p));if(drift.length)refuse('inputs changed since the B0 closure: '+drift.join(', '));
for(const f of ['CURRENT_MISSION.md','MISSION_LEDGER.md']){const base=spawnSync('git',['show',`${BASE}:${f}`],{cwd:repo,encoding:'buffer'}).stdout,now=fs.readFileSync(path.join(repo,f));if(!base.length||!now.subarray(0,base.length).equals(base))refuse(f+' is not append-only since the B0 closure');}
const policy=JSON.parse(fs.readFileSync(path.join(cc,'r6/PROGRAM_POLICY_R6.json'),'utf8').replace(/^﻿/,''));
if(hash(policy)!=='18ec48f34768a7eebb2aede618db65a77385efebbda0a38d6f03135e5cd96b4c')refuse('policy canonical hash');
// The bound files (FREEZE-1's kinds, plus this script).
const list=[...fs.readdirSync(path.join(cc,'src')).filter(f=>f.endsWith('.mjs')).map(f=>'src/'+f),...fs.readdirSync(path.join(cc,'test')).filter(f=>f.endsWith('.mjs')).map(f=>'test/'+f),'r7/b/fixtures/helpers.mjs','r6/fixtures/dev-authority.mjs','r6/fixtures/profiles.mjs','r6/fixtures/trajectories.mjs','r6/PROGRAM_POLICY_R6.json','r7/b0/REPERTOIRE_CATALOG_B0.json','r7/b0/REPERTOIRE_CATALOG_B0.schema.json','r7/b/CONFORMANCE_R7B.json','scripts/conformance-r7b.mjs','scripts/mutate-r7b.mjs','scripts/regress-r7b.mjs','scripts/freeze-r7b.mjs','scripts/freeze-r7b-2.mjs','scripts/verify-r7b.mjs','package.json','package-lock.json'];
const files=Object.fromEntries(list.sort().map(p=>[p,sha(p)]));
files['../audits/domain-coaching-r7-b0-2026-10-31/reviews/SSCTR_RECHECK_B0.json']=shaRepo('audits/domain-coaching-r7-b0-2026-10-31/reviews/SSCTR_RECHECK_B0.json');
const sourceDigest=hash(Object.fromEntries(Object.entries(files).filter(([p])=>p.startsWith('src/')))),manifestDigest=hash(files);
const deltaFrom=rev=>{const at=p=>shaAt(rev,'CoachingCore/'+p),baseList=git('ls-tree','-r','--name-only',rev,'CoachingCore/src','CoachingCore/test').split('\n').filter(Boolean).map(p=>p.replace(/^CoachingCore\//,''));
 return {changed:Object.keys(files).filter(p=>baseList.includes(p)&&at(p)!==files[p]),added:Object.keys(files).filter(p=>/^(src|test)\//.test(p)&&!baseList.includes(p)),removed:baseList.filter(p=>!files[p])};};
// Evidence on these bytes.
const run=(args,label,timeout=900000)=>{const r=spawnSync(process.execPath,args,{cwd:cc,encoding:'utf8',maxBuffer:256*1024*1024,timeout});if(r.error)refuse(label+': '+r.error.message);return r;};
const t=run(['--test'],'suite'),n=k=>Number(t.stdout.match(new RegExp('ℹ '+k+' (\\d+)'))?.[1]??NaN);
const tests={count:n('tests'),pass:n('pass'),fail:n('fail'),durationMs:n('duration_ms')};if(!(tests.count>0&&tests.fail===0&&tests.pass===tests.count))refuse('suite '+JSON.stringify(tests));
const OUT={conformance:'r7/b/CONFORMANCE_R7B_2.report.json',regression:'r7/b/REGRESSION_R7B_2.json',regressionVsFreeze1:'r7/b/REGRESSION_R7B_2_VS_FREEZE1.json',mutation:'r7/b/MUTATION_R7B_2.json'};
run(['scripts/conformance-r7b.mjs','--write','--out',OUT.conformance],'conformance');const conformance=JSON.parse(fs.readFileSync(path.join(cc,OUT.conformance),'utf8'));if(conformance.result!=='PASS')refuse('conformance '+conformance.problems.slice(0,5).join('; '));
run(['scripts/regress-r7b.mjs','--write','--out',OUT.regression],'regression');const regression=JSON.parse(fs.readFileSync(path.join(cc,OUT.regression),'utf8'));if(regression.doseRises.length||regression.statusDifferences.length)refuse('regression findings against the R7-A predecessor');
run(['scripts/regress-r7b.mjs','--write','--base',git('rev-parse',FREEZE1_COMMIT).trim(),'--out',OUT.regressionVsFreeze1],'regression vs FREEZE-1');const vsF1=JSON.parse(fs.readFileSync(path.join(cc,OUT.regressionVsFreeze1),'utf8'));
run(['scripts/mutate-r7b.mjs','--write','--out',OUT.mutation],'mutation',5400000);const mutation=JSON.parse(fs.readFileSync(path.join(cc,OUT.mutation),'utf8'));
const undocumented=mutation.survived.filter(id=>!mutation.equivalent.some(e=>e.id===id));if(undocumented.length||mutation.invalid.length||!mutation.sourceRestored)refuse('mutation '+JSON.stringify({undocumented,invalid:mutation.invalid,restored:mutation.sourceRestored}));
// The bytes did not move while the evidence ran.
const after=Object.fromEntries(Object.keys(files).filter(p=>!p.startsWith('../')).map(p=>[p,sha(p)]));if(Object.entries(after).some(([p,h])=>files[p]!==h))refuse('bound bytes changed during the evidence runs');
const matrix=JSON.parse(fs.readFileSync(path.join(cc,'r7/b/CONFORMANCE_R7B.json'),'utf8'));
const record={revision,mission:'DOMAIN_COACHING_R7-B',date:new Date().toISOString(),branch:git('rev-parse','--abbrev-ref','HEAD').trim(),baseCommitOfBytes:git('rev-parse','HEAD').trim(),freezeCommit:'the commit that adds this record (resolve with: git log -1 --format=%H -- CoachingCore/r7/b/RUNTIME_FREEZE_R7B_2.json)',
 predecessorFreeze:{freeze:f1.revision,record:F1,sha256:shaRepo(F1),commit:git('rev-parse',FREEZE1_COMMIT).trim(),sourceDigest:f1.sourceDigest,manifestDigest:f1.manifestDigest,superseded:'by this freeze after the bounded fix cycle; it verifies at its own commit'},
 reviewsOfFreeze1,
 loopBound:'audits/domain-coaching-r6-2026-10-26/FOUNDER_LOOP_BOUND.md (task contract): one fix cycle, one narrow recheck per gate; anything still blocking closes R7-B with an explicit blocker',
 fixCycle:{matrixRevision:matrix.revision,findings:matrix.fixCycle.findings.map(f=>({id:f.id,gate:f.gate,severity:f.severity,disposition:f.disposition})),recorded:matrix.fixCycle.recorded.map(f=>({id:f.id,gate:f.gate,disposition:f.disposition,owner:f.owner}))},
 runtimePredecessor:f1.predecessor,
 sourceDigest,manifestDigest,fileCount:Object.keys(files).length,files,
 policy:{revision:policy.revision,canonicalHash:hash(policy),fileSha256:files['r6/PROGRAM_POLICY_R6.json'],unchangedSinceB0:true},
 catalogBinding:{revision:'R7B0-CATALOG-2',sha256:files['r7/b0/REPERTOIRE_CATALOG_B0.json'],schemaSha256:files['r7/b0/REPERTOIRE_CATALOG_B0.schema.json'],records:'audits/domain-coaching-r7-b0-2026-10-31/reviews/SSCTR_RECHECK_B0.json',recordsSha256:files['../audits/domain-coaching-r7-b0-2026-10-31/reviews/SSCTR_RECHECK_B0.json'],coreRecords:f1.catalogBinding.coreRecords,gatedCandidates:f1.catalogBinding.gatedCandidates,failClosed:f1.catalogBinding.failClosed+'; a record bound to the catalog that does not enable vetoes its candidate (QE-R7B-10)'},
 runtimeDelta:{fromPredecessor:deltaFrom(BASE),fromFreeze1:deltaFrom(FREEZE1_COMMIT)},tests,
 evidence:{
  conformance:{report:OUT.conformance,sha256:sha(OUT.conformance),result:conformance.result,entries:conformance.entries,counts:conformance.counts,conditions:conformance.conditions},
  regression:{report:OUT.regression,sha256:sha(OUT.regression),against:'R7-A predecessor '+BASE,corpus:regression.corpus,changed:regression.changed,weeksWithDifference:regression.weeksWithDifference,doseFindings:regression.doseRises.length,statusDifferences:regression.statusDifferences.length},
  regressionVsFreeze1:{report:OUT.regressionVsFreeze1,sha256:sha(OUT.regressionVsFreeze1),against:'FREEZE-1 '+FREEZE1_COMMIT,informational:true,corpus:vsF1.corpus,changed:vsF1.changed,weeksWithDifference:vsF1.weeksWithDifference,relativeRises:vsF1.doseRises.filter(d=>d.kind!=='ENVELOPE').length,envelopeFindings:vsF1.doseRises.filter(d=>d.kind==='ENVELOPE').length},
  mutation:{report:OUT.mutation,sha256:sha(OUT.mutation),mutants:mutation.mutants,killed:mutation.killed,survivedEquivalent:mutation.equivalent}},
 testChanges:{record:'audits/domain-coaching-r7-b-2026-10-31/TEST_CHANGES_R7B.md',sha256:shaRepo('audits/domain-coaching-r7-b-2026-10-31/TEST_CHANGES_R7B.md')},
 declared:'CoachingCore/r7/b/R7B_REVIEW_HANDOFF.md section 4 and CoachingCore/r7/b/R7B_RECHECK_HANDOFF.md',
 unchangedInputs:Object.fromEntries(UNCHANGED.map(p=>[p,shaRepo(p)]))};
if(record.evidence.regressionVsFreeze1.envelopeFindings)refuse('envelope findings in the FREEZE-1 differential');
fs.writeFileSync(target,JSON.stringify(record,null,1)+'\n');
console.log(JSON.stringify({revision,sourceDigest,manifestDigest,fileCount:record.fileCount,tests,conformance:conformance.result,regression:{changed:regression.changed,doseFindings:0},vsFreeze1:{changed:vsF1.changed,relativeRises:record.evidence.regressionVsFreeze1.relativeRises},mutation:{killed:mutation.killed,of:mutation.mutants,equivalent:mutation.equivalent.map(e=>e.id)}},null,1));
