// R7-D Phase 3.3 evidence manifest (consumed by the reviews and by CoachingCore/scripts/freeze-r7d-4.mjs). On the committed runtime bytes it runs the
// whole suite, the Phase 3.3, 3.2 and 3.1 directed tests and the three R7-B conformance checks (read-only). It runs the Phase 3.3 directed tests and
// the two Phase 3.2 assertions updated in this phase on R7D-FREEZE-3 (RED for F01), and the two assertions as they stood at R7D-FREEZE-3 on a copy of
// the candidate (they encoded "any recorded session ends the stop"). It reads the outputs the phase produced on the same bytes (F01 witness,
// mutation, harness validation 5, diagnostic and generated regressions, differential versus R7D-FREEZE-3) and checks the authorities the phase leaves
// untouched. It writes one JSON manifest and never writes elsewhere in the repository.
// No deletion of any kind: R7D-FREEZE-3 and the candidate are each copied into a NEW directory it creates under --work-parent (mkdtemp); the
// --d3 root is only read.
//   node phase33-run-evidence.mjs --d3 <R7D-FREEZE-3 root> --out <file> --work-parent <scratch dir>
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {pathToFileURL} from 'node:url';

const arg=k=>{const i=process.argv.indexOf(k);return i>=0?process.argv[i+1]:null;};
const out=arg('--out'),d3=arg('--d3'),parent=arg('--work-parent');if(!out||!d3||!parent)throw Error('--d3 <R7D-FREEZE-3 root> --out <file> --work-parent <scratch dir>');
const AUD=path.resolve(import.meta.dirname,'../..'),REPO=path.resolve(AUD,'../..'),CC=path.join(REPO,'CoachingCore'),D3=path.join(path.resolve(d3),'CoachingCore');
if(!fs.statSync(parent).isDirectory()||path.resolve(parent).startsWith(REPO))throw Error('--work-parent must be an existing directory outside the repository');
const fresh=tag=>fs.mkdtempSync(path.join(path.resolve(parent),`r7d-p33-ev-${tag}-`));
const sha=p=>createHash('sha256').update(fs.readFileSync(p)).digest('hex'),rel=p=>path.relative(REPO,p).split(path.sep).join('/');
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const run=(args,cwd=CC)=>spawnSync(process.execPath,args,{cwd,encoding:'utf8',maxBuffer:1<<28,timeout:1800000});
const git=args=>spawnSync('git',args,{cwd:REPO,encoding:'utf8',maxBuffer:1<<28});
const counts=r=>{const n=k=>Number(r.stdout.match(new RegExp('ℹ '+k+' (\\d+)'))?.[1]??NaN);return {tests:n('tests'),pass:n('pass'),fail:n('fail'),failed:[...new Set([...r.stdout.matchAll(/^✖ ([^\n]*?) \(\d/gm)].map(m=>m[1]))]};};
const problems=[],need=(ok,msg)=>{if(!ok)problems.push(msg);};
const RECORDS=['audits/domain-coaching-r6-2026-10-26/reviews/ssctr-policy-review.json','audits/domain-coaching-r7-b0-2026-10-31/reviews/SSCTR_RECHECK_B0.json','audits/domain-closure-r3-2026-10-24/reviews/ssctr-records.json','audits/domain-closure-r4-2026-10-25/reviews/ssctr-envelope-review.json','audits/domain-coaching-r5-2026-10-25/reviews/ssctr-policy-review.json'];
const copyRuntime=(fromCC,fromRepo,tag)=>{const w=fresh(tag);fs.cpSync(fromCC,path.join(w,'CoachingCore'),{recursive:true,filter:p=>!/[\\/]\.git([\\/]|$)/.test(p)});for(const r of RECORDS){const src=path.join(fromRepo,r);if(fs.existsSync(src)){fs.mkdirSync(path.dirname(path.join(w,r)),{recursive:true});fs.copyFileSync(src,path.join(w,r));}}return path.join(w,'CoachingCore');};
// The runtime bytes the evidence is about, and what differs from R7D-FREEZE-3.
const src=Object.fromEntries(fs.readdirSync(path.join(CC,'src')).filter(f=>f.endsWith('.mjs')).sort().map(f=>['CoachingCore/src/'+f,sha(path.join(CC,'src',f))]));
const f3=read(path.join(CC,'r7/d/RUNTIME_FREEZE_R7D_3.json')),changedSource=Object.keys(src).filter(p=>f3.files[p]!==src[p]);
need(changedSource.length===1&&changedSource[0]==='CoachingCore/src/r6-adaptation.mjs','only r6-adaptation.mjs differs from R7D-FREEZE-3: '+changedSource.join(', '));
need(Object.keys(f3.files).filter(p=>p.startsWith('CoachingCore/src/')).every(p=>src[p]),'a source file of R7D-FREEZE-3 is missing');
// 1. The whole suite, then the directed tests (Phase 3.3; Phase 3.2 with its two updated T4 assertions; Phase 3.1).
const suite=counts(run(['--test']));
need(suite.tests>0&&suite.fail===0&&suite.pass===suite.tests,'suite '+JSON.stringify(suite));
const TEST='test/r7d-phase33.test.mjs',P32='test/r7d-phase32.test.mjs',P31='test/r7d-phase31.test.mjs';
const dr=counts(run(['--test',TEST])),d32=counts(run(['--test',P32])),d31=counts(run(['--test',P31]));
const fileRow=(f,c)=>({file:'CoachingCore/'+f,sha256:sha(path.join(CC,f)),tests:c.tests,pass:c.pass,fail:c.fail});
const directed=fileRow(TEST,dr),directed32=fileRow(P32,d32),directed31=fileRow(P31,d31);
need(directed.tests===14&&directed.fail===0&&directed.pass===directed.tests,'Phase 3.3 directed tests '+JSON.stringify(directed));
need(directed32.tests===17&&directed32.fail===0&&directed32.pass===directed32.tests,'Phase 3.2 directed tests '+JSON.stringify(directed32));
need(directed31.tests===14&&directed31.fail===0&&directed31.pass===directed31.tests,'Phase 3.1 directed tests '+JSON.stringify(directed31));
// 2. Conformance (R7-B, R7-B.1, R7-B.2), read-only.
const conformance=Object.fromEntries(['conformance-r7b','conformance-r7b1','conformance-r7b2'].map(s=>{const r=run([`scripts/${s}.mjs`]);let j=null;try{j=JSON.parse(r.stdout);}catch{}need(j?.result==='PASS',s+': '+(j?JSON.stringify(j.problems).slice(0,300):'no JSON'));return [s,{result:j?.result??null,sha256:sha(path.join(CC,'scripts',s+'.mjs'))}];}));
// 3. RED on R7D-FREEZE-3: the Phase 3.3 directed tests and the Phase 3.2 file as updated here, on a copy of the superseded bytes.
need(Object.entries(f3.files).filter(([p])=>p.startsWith('CoachingCore/src/')).every(([p,h])=>fs.existsSync(path.join(path.resolve(d3),p))&&sha(path.join(path.resolve(d3),p))===h),'--d3 does not hold the R7D-FREEZE-3 source bytes');
const redCC=copyRuntime(D3,path.resolve(d3),'d3');
for(const f of [TEST,P32])fs.copyFileSync(path.join(CC,f),path.join(redCC,f));
const UPDATED=[['R7-D Phase 3.2 T4: separate breaks with nothing trained between them','the two sessions between the breaks: the whole stop, TRAINING_NOT_REESTABLISHED'],['R7-D Phase 3.2 T4: separate breaks with unreported training between them','answered done: MODERATE either way, the answer decides the record']];
const F01_WITNESSES=['R7-D Phase 3.3 T1 (F01 witness)','R7-D Phase 3.3 T1: thirty days','R7-D Phase 3.3 T4: a week between the breaks with a session missed or partial','R7-D Phase 3.3 T5','R7-D Phase 3.3 T6','R7-D Phase 3.3 T3: the late form'];
const CHARACTERIZATION=['R7-D Phase 3.3 T2 (characterization)','R7-D Phase 3.3 T7','R7-D Phase 3.3 T8'];
const r3=counts(run(['--test',TEST],redCC));
const red={directedOnFreeze3:{tests:r3.tests,pass:r3.pass,fail:r3.fail,failed:r3.failed,passing:r3.tests-r3.fail},
 updatedAssertions:UPDATED.map(([title,what])=>{const x=counts(run(['--test','--test-name-pattern',title,P32],redCC)),c=counts(run(['--test','--test-name-pattern',title,P32]));return {file:'CoachingCore/'+P32,test:title,now:what,updatedOnFreeze3:{tests:x.tests,fail:x.fail},updatedOnCandidate:{tests:c.tests,fail:c.fail}};})};
need(F01_WITNESSES.every(w=>red.directedOnFreeze3.failed.some(x=>x.startsWith(w))),'the F01 witness tests fail on R7D-FREEZE-3');
need(CHARACTERIZATION.every(w=>!red.directedOnFreeze3.failed.some(x=>x.startsWith(w))),'the characterization tests pass on R7D-FREEZE-3');
need(red.updatedAssertions.every(u=>u.updatedOnFreeze3.tests===1&&u.updatedOnFreeze3.fail===1),'each updated assertion fails on R7D-FREEZE-3');
need(red.updatedAssertions.every(u=>u.updatedOnCandidate.tests===1&&u.updatedOnCandidate.fail===0),'each updated assertion passes on the candidate');
// The two assertions as they stood at R7D-FREEZE-3, on a copy of the candidate: they encoded "any recorded session between the breaks ends the stop".
const candCC=copyRuntime(CC,REPO,'cand');
const old=git(['show',`${f3.commit}:CoachingCore/${P32}`]).stdout;need(old.length>0,'the Phase 3.2 test file at R7D-FREEZE-3');fs.writeFileSync(path.join(candCC,P32),old);
red.assertionsAsAtFreeze3=UPDATED.map(([title])=>{const x=counts(run(['--test','--test-name-pattern',title,P32],candCC));return {file:'CoachingCore/'+P32,atCommit:f3.commit,test:title,onCandidate:{tests:x.tests,fail:x.fail}};});
need(red.assertionsAsAtFreeze3.every(a=>a.onCandidate.tests===1&&a.onCandidate.fail===1),'each assertion as it stood at R7D-FREEZE-3 fails on the candidate');
// 4. Outputs the phase produced on these bytes.
const outputs={
 witnessRed:'phase33/probes/out/f01-witness.R7D-FREEZE-3.json',
 witnessCandidate:'phase33/probes/out/f01-witness.candidate.json',
 mutation:'phase33/evidence/MUTATION_PHASE33.json',
 validation:'harness/validation/HARNESS_VALIDATION_R7D_5.json',
 diagnosticRegression:'phase33/regression/diagnostic/RUN_REPORT.json',
 generatedRegression:'phase33/regression/generated/RUN_REPORT.json',
 differential:'phase33/evidence/DIFFERENTIAL_VS_R7D_FREEZE_3.json'
};
const O={};for(const [k,p] of Object.entries(outputs)){const f=path.join(AUD,p);need(fs.existsSync(f),'missing '+p);if(fs.existsSync(f))O[k]={path:rel(f),sha256:sha(f),json:read(f)};}
const wr=O.witnessRed?.json,wc=O.witnessCandidate?.json,mu=O.mutation?.json,va=O.validation?.json,dg=O.diagnosticRegression?.json,gr=O.generatedRegression?.json,df=O.differential?.json;
need(wr?.verdict?.RED===true&&wc?.verdict?.RED===false,'the F01 witness is RED on R7D-FREEZE-3 and not on the candidate');
need(wc&&Object.values(wc.verdict.reentryRecognized).every(Boolean),'the re-entry controls (E1-E3) are recognized on the candidate');
need(mu&&mu.summary.killed===mu.summary.mutants&&mu.summary.mutants>=8&&mu.mutants.every(m=>m.killed)&&mu.scratchRestored===true,'every mutant killed by its own witness');
need(mu&&Object.entries(mu.sources).every(([p,h])=>src[p]===h)&&mu.testFileSha256===directed.sha256,'mutation ran on these bytes and this test file');
need(va&&va.validation==='R7D-HARNESS-VALIDATION-5'&&va.summary.noFalseBlock==='PASS'&&va.summary.coverage==='COVERED'&&va.summary.sensitivity.length===14&&va.summary.sensitivity.every(s=>s.result==='DETECTED_AND_CLEAN_ON_CANDIDATE')&&va.summary.notFired.length===0,'harness validation 5');
need(va&&Object.entries(va.runs[0].runtime.source.files).filter(([p])=>p.startsWith('CoachingCore/src/')).every(([p,h])=>src[p]===h),'harness validation ran on these bytes');
for(const [k,r] of [['diagnosticRegression',dg],['generatedRegression',gr]]){
 need(r&&Object.entries(r.runtimeSource.files).filter(([p])=>p.startsWith('CoachingCore/src/')).every(([p,h])=>src[p]===h),k+' ran on these source bytes');
 need(r&&r.harness==='R7D-HARNESS-5'&&Object.values(r.summary.properties).every(p=>p.violations===0)&&r.summary.harnessErrors===0,k+': a property violation or a harness error');
}
const variant=dg?.summary.relations.VARIANT;need(variant&&variant.failingCases.every(c=>['R7D-D02','R7D-D06','R7D-D14','R7D-D16'].includes(c)),'diagnostic VARIANT failures outside the triaged set');
need(dg&&Object.entries(dg.summary.relations).filter(([k])=>k!=='VARIANT').every(([,v])=>v.violations===0),'diagnostic regression: a metamorphic violation');
need(df&&df.unexplained.length===0&&df.differingCases.every(c=>c.trigger),'differential: a difference outside the F01 family');
// 5. Authorities the phase leaves untouched.
const {r6Authority}=await import(pathToFileURL(path.join(CC,'src/r6-authority.mjs')).href),A=r6Authority();
const queuePath=path.join(REPO,'reviews/provisional-sports-science/2026-10-23/HUMAN_REVALIDATION_QUEUE.json');
const authority={policy:{path:'CoachingCore/r6/PROGRAM_POLICY_R6.json',sha256:sha(path.join(CC,'r6/PROGRAM_POLICY_R6.json')),canonicalHash:A.policyHash,boundariesEnabled:Object.keys(A.approved).length},
 catalog:{path:'CoachingCore/r7/b0/REPERTOIRE_CATALOG_B0.json',sha256:sha(path.join(CC,'r7/b0/REPERTOIRE_CATALOG_B0.json'))},
 r6Records:{path:'audits/domain-coaching-r6-2026-10-26/reviews/ssctr-policy-review.json',sha256:sha(path.join(REPO,'audits/domain-coaching-r6-2026-10-26/reviews/ssctr-policy-review.json'))},
 b0Records:{path:'audits/domain-coaching-r7-b0-2026-10-31/reviews/SSCTR_RECHECK_B0.json',sha256:sha(path.join(REPO,'audits/domain-coaching-r7-b0-2026-10-31/reviews/SSCTR_RECHECK_B0.json'))},
 humanQueue:{path:rel(queuePath),sha256:sha(queuePath),items:read(queuePath).items.length},
 productAndCanonUnchangedSinceFreeze3:git(['diff','--quiet',f3.commit,'--','product','canon']).status===0};
need(authority.policy.sha256==='a75be1aae3818616888e641c104407926d5f16f213a04137f5b21024ccafe100','policy bytes changed');
need(authority.policy.canonicalHash==='18ec48f34768a7eebb2aede618db65a77385efebbda0a38d6f03135e5cd96b4c'&&authority.policy.boundariesEnabled===10,'policy canonical hash or R6 boundaries');
need(authority.catalog.sha256==='ceee276a424ee7575b4477a2bc429de2e8cd854e3cb82ac767776492cdcb92f9','catalog bytes changed');
for(const k of ['r6Records','b0Records'])need(f3.files[authority[k].path]===undefined||f3.files[authority[k].path]===authority[k].sha256,k+' changed');
need(authority.humanQueue.items===233&&f3.files[authority.humanQueue.path]===authority.humanQueue.sha256,'the human revalidation queue changed before the authorized append');
need(authority.productAndCanonUnchangedSinceFreeze3,'product/ or canon/ changed since R7D-FREEZE-3');
need(!fs.existsSync(path.join(AUD,'final')),'a final holdout exists');
const report={evidence:'R7D-PHASE33-EVIDENCE-1',created:new Date().toISOString(),node:process.version,runtimeSource:src,changedSourceVsFreeze3:changedSource,suite,directed,directed32,directed31,conformance,red,
 scratch:{freeze3Copy:redCC,candidateCopy:candCC,note:'new directories under --work-parent; nothing deleted'},
 outputs:Object.fromEntries(Object.entries(O).map(([k,v])=>[k,{path:v.path,sha256:v.sha256}])),
 results:{witness:{freeze3:wr?.verdict??null,candidate:wc?.verdict??null},mutation:mu?.summary??null,validation:va?.summary??null,
  diagnosticRegression:dg?{properties:Object.fromEntries(Object.entries(dg.summary.properties).map(([k,p])=>[k,{result:p.result,units:p.units,violations:p.violations}])),relations:Object.fromEntries(Object.entries(dg.summary.relations).map(([k,v])=>[k,{units:v.units,violations:v.violations,failingCases:v.failingCases}])),corpusErrors:dg.summary.corpusErrors}:null,
  generatedRegression:gr?{properties:Object.fromEntries(Object.entries(gr.summary.properties).map(([k,p])=>[k,{result:p.result,units:p.units,violations:p.violations}]))}:null,
  differential:df?{cases:df.cases,same:df.same,differing:df.differing,unexplained:df.unexplained,differingCases:df.differingCases,casesWithF01Trigger:df.casesWithF01Trigger,reentryControls:df.reentryControls}:null},
 authority,finalHoldoutExists:fs.existsSync(path.join(AUD,'final')),problems,result:problems.length?'FAIL':'PASS'};
fs.writeFileSync(out,JSON.stringify(report,null,1)+'\n');
console.log(JSON.stringify({result:report.result,problems,suite,directed,directed32,directed31,conformance:Object.fromEntries(Object.entries(conformance).map(([k,v])=>[k,v.result])),red:{directedOnFreeze3:red.directedOnFreeze3.fail+'/'+red.directedOnFreeze3.tests+' fail',updatedOnFreeze3:red.updatedAssertions.map(u=>u.updatedOnFreeze3.fail),asAtFreeze3OnCandidate:red.assertionsAsAtFreeze3.map(a=>a.onCandidate.fail)}},null,1));
process.exitCode=problems.length?1:0;
