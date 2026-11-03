// R7-D Phase 3.2 evidence manifest (consumed by the reviews and by CoachingCore/scripts/freeze-r7d-3.mjs). On the committed runtime bytes it runs
// the whole suite, the Phase 3.2 and Phase 3.1 directed tests and the three R7-B conformance checks (read-only). It runs the Phase 3.2 directed
// tests and the two frozen assertions updated in this phase on R7D-FREEZE-2 (RED for F02), and the two assertions as they stood at R7D-FREEZE-2 on
// a scratch copy of the candidate (they encoded last-write-wins). It reads the outputs the phase produced on the same bytes (F02 witness, mutation,
// harness validation 4, diagnostic and generated regressions, differential versus R7D-FREEZE-2) and checks the authorities the phase leaves
// untouched. It writes one JSON manifest and never writes elsewhere in the repository (the R7D-FREEZE-2 copy is restored after the RED run).
//   node phase32-run-evidence.mjs --d2 <R7D-FREEZE-2 root> --out <file> [--work <scratch dir>]
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {pathToFileURL} from 'node:url';

const arg=k=>{const i=process.argv.indexOf(k);return i>=0?process.argv[i+1]:null;};
const out=arg('--out'),d2=arg('--d2');if(!out||!d2)throw Error('--d2 <R7D-FREEZE-2 root> --out <file>');
const AUD=path.resolve(import.meta.dirname,'../..'),REPO=path.resolve(AUD,'../..'),CC=path.join(REPO,'CoachingCore'),D2=path.join(path.resolve(d2),'CoachingCore');
const work=path.resolve(arg('--work')??fs.mkdtempSync(path.join(os.tmpdir(),'r7d-p32-ev-')));
const sha=p=>createHash('sha256').update(fs.readFileSync(p)).digest('hex'),rel=p=>path.relative(REPO,p).split(path.sep).join('/');
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const run=(args,cwd=CC)=>spawnSync(process.execPath,args,{cwd,encoding:'utf8',maxBuffer:1<<28,timeout:1800000});
const git=args=>spawnSync('git',args,{cwd:REPO,encoding:'utf8',maxBuffer:1<<28});
const counts=r=>{const n=k=>Number(r.stdout.match(new RegExp('ℹ '+k+' (\\d+)'))?.[1]??NaN);return {tests:n('tests'),pass:n('pass'),fail:n('fail'),failed:[...new Set([...r.stdout.matchAll(/^✖ ([^\n]*?) \(\d/gm)].map(m=>m[1]))]};};
const problems=[],need=(ok,msg)=>{if(!ok)problems.push(msg);};
// The runtime bytes the evidence is about, and what differs from R7D-FREEZE-2.
const src=Object.fromEntries(fs.readdirSync(path.join(CC,'src')).filter(f=>f.endsWith('.mjs')).sort().map(f=>['CoachingCore/src/'+f,sha(path.join(CC,'src',f))]));
const f2=read(path.join(CC,'r7/d/RUNTIME_FREEZE_R7D_2.json')),changedSource=Object.keys(src).filter(p=>f2.files[p]!==src[p]);
need(changedSource.length===1&&changedSource[0]==='CoachingCore/src/r6-adaptation.mjs','only r6-adaptation.mjs differs from R7D-FREEZE-2: '+changedSource.join(', '));
need(Object.keys(f2.files).filter(p=>p.startsWith('CoachingCore/src/')).every(p=>src[p]),'a source file of R7D-FREEZE-2 is missing');
// 1. The whole suite, then the directed tests (Phase 3.2, and Phase 3.1 with its updated T6).
const suite=counts(run(['--test']));
need(suite.tests>0&&suite.fail===0&&suite.pass===suite.tests,'suite '+JSON.stringify(suite));
const TEST='test/r7d-phase32.test.mjs',P31='test/r7d-phase31.test.mjs';
const dr=counts(run(['--test',TEST])),d31=counts(run(['--test',P31]));
const directed={file:'CoachingCore/'+TEST,sha256:sha(path.join(CC,TEST)),tests:dr.tests,pass:dr.pass,fail:dr.fail};
const directed31={file:'CoachingCore/'+P31,sha256:sha(path.join(CC,P31)),tests:d31.tests,pass:d31.pass,fail:d31.fail};
need(directed.tests===17&&directed.fail===0&&directed.pass===directed.tests,'Phase 3.2 directed tests '+JSON.stringify(directed));
need(directed31.tests===14&&directed31.fail===0&&directed31.pass===directed31.tests,'Phase 3.1 directed tests '+JSON.stringify(directed31));
// 2. Conformance (R7-B, R7-B.1, R7-B.2), read-only.
const conformance=Object.fromEntries(['conformance-r7b','conformance-r7b1','conformance-r7b2'].map(s=>{const r=run([`scripts/${s}.mjs`]);let j=null;try{j=JSON.parse(r.stdout);}catch{}need(j?.result==='PASS',s+': '+(j?JSON.stringify(j.problems).slice(0,300):'no JSON'));return [s,{result:j?.result??null,sha256:createHash('sha256').update(fs.readFileSync(path.join(CC,'scripts',s+'.mjs'))).digest('hex')}];}));
// 3. RED on R7D-FREEZE-2: the Phase 3.2 directed tests and the two frozen assertions as updated here, on the superseded bytes (restored after).
need(Object.entries(f2.files).filter(([p])=>p.startsWith('CoachingCore/src/')).every(([p,h])=>fs.existsSync(path.join(path.resolve(d2),p))&&sha(path.join(path.resolve(d2),p))===h),'--d2 does not hold the R7D-FREEZE-2 source bytes');
const UPDATED=[['test/r7d-phase31.test.mjs','R7-D Phase 3.1 T6: a newer declaration of the break replaces a recorded one not applied yet'],['test/r7a1-composition.test.mjs','R7-A.1 C4/C5: a waiting or event-conflict day carries no session in either order']];
const F02_WITNESSES=['R7-D Phase 3.2 T1 (F02 witness)','R7-D Phase 3.2 T1: a partial newer declaration','R7-D Phase 3.2 T4: separate breaks whose days touch or overlap','R7-D Phase 3.2 T6: an applied break and a later new one','R7-D Phase 3.2 T5: clinical first comes before the relation question'];
const saved=new Map();for(const f of [TEST,...UPDATED.map(u=>u[0])]){const p=path.join(D2,f);saved.set(p,fs.existsSync(p)?fs.readFileSync(p):null);fs.copyFileSync(path.join(CC,f),p);}
let red;
try{
 const r=counts(run(['--test',TEST],D2));
 const u=UPDATED.map(([f,title])=>{const x=counts(run(['--test','--test-name-pattern',title,f],D2)),c=counts(run(['--test','--test-name-pattern',title,f]));return {file:'CoachingCore/'+f,test:title,updatedOnFreeze2:{tests:x.tests,fail:x.fail},updatedOnCandidate:{tests:c.tests,fail:c.fail}};});
 red={directedOnFreeze2:{tests:r.tests,pass:r.pass,fail:r.fail,failed:r.failed,passing:r.tests-r.fail},updatedAssertions:u};
}finally{for(const [p,b] of saved)if(b===null)fs.rmSync(p,{force:true});else fs.writeFileSync(p,b);}
need(F02_WITNESSES.every(w=>red.directedOnFreeze2.failed.some(x=>x.startsWith(w))),'the F02 witness tests fail on R7D-FREEZE-2');
// The two assertions as they stood at R7D-FREEZE-2 (they encoded a newer unnamed declaration replacing a kept break), on a scratch copy of the candidate.
fs.rmSync(path.join(work,'CoachingCore'),{recursive:true,force:true});
fs.cpSync(CC,path.join(work,'CoachingCore'),{recursive:true,filter:p=>!/[\\/]\.git([\\/]|$)/.test(p)});
for(const rec of ['audits/domain-coaching-r6-2026-10-26/reviews/ssctr-policy-review.json','audits/domain-coaching-r7-b0-2026-10-31/reviews/SSCTR_RECHECK_B0.json']){fs.mkdirSync(path.dirname(path.join(work,rec)),{recursive:true});fs.copyFileSync(path.join(REPO,rec),path.join(work,rec));}
const titlesAtFreeze2={'test/r7d-phase31.test.mjs':'R7-D Phase 3.1 T6: a newer declaration of the break replaces a recorded one not applied yet; the earlier decisions stay as they were','test/r7a1-composition.test.mjs':'R7-A.1 C4/C5: a waiting or event-conflict day carries no session in either order'};
red.assertionsAsAtFreeze2=UPDATED.map(([f])=>{const old=git(['show',`${f2.commit}:CoachingCore/${f}`]).stdout;fs.writeFileSync(path.join(work,'CoachingCore',f),old);const x=counts(run(['--test','--test-name-pattern',titlesAtFreeze2[f],f],path.join(work,'CoachingCore')));return {file:'CoachingCore/'+f,atCommit:f2.commit,test:titlesAtFreeze2[f],onCandidate:{tests:x.tests,fail:x.fail}};});
need(red.assertionsAsAtFreeze2.every(a=>a.onCandidate.tests===1&&a.onCandidate.fail===1),'each assertion as it stood at R7D-FREEZE-2 fails on the candidate (it encoded last-write-wins)');
need(red.updatedAssertions.every(u=>u.updatedOnCandidate.tests===1&&u.updatedOnCandidate.fail===0),'each updated assertion passes on the candidate');
// 4. Outputs the phase produced on these bytes.
const outputs={
 witnessRed:'phase32/probes/out/f02-witness.R7D-FREEZE-2.json',
 witnessCandidate:'phase32/probes/out/f02-witness.candidate.json',
 mutation:'phase32/evidence/MUTATION_PHASE32.json',
 validation:'harness/validation/HARNESS_VALIDATION_R7D_4.json',
 diagnosticRegression:'phase32/regression/diagnostic/RUN_REPORT.json',
 generatedRegression:'phase32/regression/generated/RUN_REPORT.json',
 differential:'phase32/evidence/DIFFERENTIAL_VS_R7D_FREEZE_2.json'
};
const O={};for(const [k,p] of Object.entries(outputs)){const f=path.join(AUD,p);need(fs.existsSync(f),'missing '+p);if(fs.existsSync(f))O[k]={path:rel(f),sha256:sha(f),json:read(f)};}
const wr=O.witnessRed?.json,wc=O.witnessCandidate?.json,mu=O.mutation?.json,va=O.validation?.json,dg=O.diagnosticRegression?.json,gr=O.generatedRegression?.json,df=O.differential?.json;
need(wr?.verdict?.RED===true&&wc?.verdict?.RED===false,'the F02 witness is RED on R7D-FREEZE-2 and not on the candidate');
need(mu&&mu.summary.killed===mu.summary.mutants&&mu.summary.mutants>=7&&mu.mutants.every(m=>m.killed),'every mutant killed by its own witness');
need(mu&&Object.entries(mu.sources).every(([p,h])=>src[p]===h)&&mu.testFileSha256===directed.sha256,'mutation ran on these bytes and this test file');
need(va&&va.validation==='R7D-HARNESS-VALIDATION-4'&&va.summary.noFalseBlock==='PASS'&&va.summary.coverage==='COVERED'&&va.summary.sensitivity.length===13&&va.summary.sensitivity.every(s=>s.result==='DETECTED_AND_CLEAN_ON_CANDIDATE')&&va.summary.notFired.length===0,'harness validation 4');
need(va&&Object.entries(va.runs[0].runtime.source.files).filter(([p])=>p.startsWith('CoachingCore/src/')).every(([p,h])=>src[p]===h),'harness validation ran on these bytes');
for(const [k,r] of [['diagnosticRegression',dg],['generatedRegression',gr]]){
 need(r&&Object.entries(r.runtimeSource.files).filter(([p])=>p.startsWith('CoachingCore/src/')).every(([p,h])=>src[p]===h),k+' ran on these source bytes');
 need(r&&r.harness==='R7D-HARNESS-4'&&Object.values(r.summary.properties).every(p=>p.violations===0)&&r.summary.harnessErrors===0,k+': a property violation or a harness error');
}
const variant=dg?.summary.relations.VARIANT;need(variant&&variant.failingCases.every(c=>['R7D-D02','R7D-D06','R7D-D14','R7D-D16'].includes(c)),'diagnostic VARIANT failures outside the triaged set');
need(dg&&Object.entries(dg.summary.relations).filter(([k])=>k!=='VARIANT').every(([,v])=>v.violations===0),'diagnostic regression: a metamorphic violation');
need(df&&df.unexplained.length===0&&df.differingCases.every(c=>c.corpus==='HARNESS_DEV_4'&&c.trigger),'differential: a difference outside the F02 family');
// 5. Authorities the phase leaves untouched.
const {r6Authority}=await import(pathToFileURL(path.join(CC,'src/r6-authority.mjs')).href),A=r6Authority();
const queuePath=path.join(REPO,'reviews/provisional-sports-science/2026-10-23/HUMAN_REVALIDATION_QUEUE.json');
const authority={policy:{path:'CoachingCore/r6/PROGRAM_POLICY_R6.json',sha256:sha(path.join(CC,'r6/PROGRAM_POLICY_R6.json')),canonicalHash:A.policyHash,boundariesEnabled:Object.keys(A.approved).length},
 catalog:{path:'CoachingCore/r7/b0/REPERTOIRE_CATALOG_B0.json',sha256:sha(path.join(CC,'r7/b0/REPERTOIRE_CATALOG_B0.json'))},
 r6Records:{path:'audits/domain-coaching-r6-2026-10-26/reviews/ssctr-policy-review.json',sha256:sha(path.join(REPO,'audits/domain-coaching-r6-2026-10-26/reviews/ssctr-policy-review.json'))},
 b0Records:{path:'audits/domain-coaching-r7-b0-2026-10-31/reviews/SSCTR_RECHECK_B0.json',sha256:sha(path.join(REPO,'audits/domain-coaching-r7-b0-2026-10-31/reviews/SSCTR_RECHECK_B0.json'))},
 humanQueue:{path:rel(queuePath),sha256:sha(queuePath),items:read(queuePath).items.length},
 productAndCanonUnchangedSinceFreeze2:git(['diff','--quiet',f2.commit,'--','product','canon']).status===0};
need(authority.policy.sha256==='a75be1aae3818616888e641c104407926d5f16f213a04137f5b21024ccafe100','policy bytes changed');
need(authority.policy.canonicalHash==='18ec48f34768a7eebb2aede618db65a77385efebbda0a38d6f03135e5cd96b4c'&&authority.policy.boundariesEnabled===10,'policy canonical hash or R6 boundaries');
need(authority.catalog.sha256==='ceee276a424ee7575b4477a2bc429de2e8cd854e3cb82ac767776492cdcb92f9','catalog bytes changed');
for(const k of ['r6Records','b0Records'])need(f2.files[authority[k].path]===undefined||f2.files[authority[k].path]===authority[k].sha256,k+' changed');
need(authority.humanQueue.items===233&&(f2.files[authority.humanQueue.path]===undefined||f2.files[authority.humanQueue.path]===authority.humanQueue.sha256),'the human revalidation queue changed');
need(authority.productAndCanonUnchangedSinceFreeze2,'product/ or canon/ changed since R7D-FREEZE-2');
need(!fs.existsSync(path.join(AUD,'final')),'a final holdout exists');
const report={evidence:'R7D-PHASE32-EVIDENCE-1',created:new Date().toISOString(),node:process.version,runtimeSource:src,changedSourceVsFreeze2:changedSource,suite,directed,directed31,conformance,red,
 outputs:Object.fromEntries(Object.entries(O).map(([k,v])=>[k,{path:v.path,sha256:v.sha256}])),
 results:{witness:{freeze2:wr?.verdict??null,candidate:wc?.verdict??null},mutation:mu?.summary??null,validation:va?.summary??null,
  diagnosticRegression:dg?{properties:Object.fromEntries(Object.entries(dg.summary.properties).map(([k,p])=>[k,{result:p.result,units:p.units,violations:p.violations}])),relations:Object.fromEntries(Object.entries(dg.summary.relations).map(([k,v])=>[k,{units:v.units,violations:v.violations,failingCases:v.failingCases}])),corpusErrors:dg.summary.corpusErrors}:null,
  generatedRegression:gr?{properties:Object.fromEntries(Object.entries(gr.summary.properties).map(([k,p])=>[k,{result:p.result,units:p.units,violations:p.violations}]))}:null,
  differential:df?{cases:df.cases,same:df.same,differing:df.differing,unexplained:df.unexplained,differingCases:df.differingCases,casesWithFamilyTrigger:df.casesWithFamilyTrigger}:null},
 authority,finalHoldoutExists:fs.existsSync(path.join(AUD,'final')),problems,result:problems.length?'FAIL':'PASS'};
fs.writeFileSync(out,JSON.stringify(report,null,1)+'\n');
console.log(JSON.stringify({result:report.result,problems,suite,directed,directed31,conformance:Object.fromEntries(Object.entries(conformance).map(([k,v])=>[k,v.result])),red:{directedOnFreeze2:red.directedOnFreeze2.fail+'/'+red.directedOnFreeze2.tests+' fail',updatedOnFreeze2:red.updatedAssertions.map(u=>u.updatedOnFreeze2.fail),asAtFreeze2OnCandidate:red.assertionsAsAtFreeze2.map(a=>a.onCandidate.fail)}},null,1));
process.exitCode=problems.length?1:0;
