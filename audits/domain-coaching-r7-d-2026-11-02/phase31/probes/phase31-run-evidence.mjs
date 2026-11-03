// R7-D Phase 3.1 evidence manifest (consumed by the reviews and by CoachingCore/scripts/freeze-r7d-2.mjs). On the committed runtime bytes it runs
// the whole suite, the directed tests and the three R7-B conformance checks (read-only); it runs the directed tests and the two updated frozen
// assertions on R7D-FREEZE-1 (RED for the dropped break); it reads the outputs the phase produced on the same bytes (mutation, harness
// validation 3, diagnostic and generated regressions, differential versus R7D-FREEZE-1) and checks the authorities the phase leaves untouched.
// It writes one JSON manifest and never writes elsewhere (the R7D-FREEZE-1 copy is restored after the RED run).
//   node phase31-run-evidence.mjs --d1 <R7D-FREEZE-1 root> --out <file>
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {pathToFileURL} from 'node:url';

const arg=k=>{const i=process.argv.indexOf(k);return i>=0?process.argv[i+1]:null;};
const out=arg('--out'),d1=arg('--d1');if(!out||!d1)throw Error('--d1 <R7D-FREEZE-1 root> --out <file>');
const AUD=path.resolve(import.meta.dirname,'../..'),REPO=path.resolve(AUD,'../..'),CC=path.join(REPO,'CoachingCore'),P31=path.join(AUD,'phase31'),D1=path.join(path.resolve(d1),'CoachingCore');
const sha=p=>createHash('sha256').update(fs.readFileSync(p)).digest('hex'),rel=p=>path.relative(REPO,p).split(path.sep).join('/');
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const run=(args,cwd=CC)=>spawnSync(process.execPath,args,{cwd,encoding:'utf8',maxBuffer:1<<28,timeout:1800000});
const counts=r=>{const n=k=>Number(r.stdout.match(new RegExp('ℹ '+k+' (\\d+)'))?.[1]??NaN);return {tests:n('tests'),pass:n('pass'),fail:n('fail'),failed:[...new Set([...r.stdout.matchAll(/^✖ ([^\n]*?) \(\d/gm)].map(m=>m[1]))]};};
const problems=[],need=(ok,msg)=>{if(!ok)problems.push(msg);};
// The runtime bytes the evidence is about, and what differs from R7D-FREEZE-1.
const src=Object.fromEntries(fs.readdirSync(path.join(CC,'src')).filter(f=>f.endsWith('.mjs')).sort().map(f=>['CoachingCore/src/'+f,sha(path.join(CC,'src',f))]));
const f1=read(path.join(CC,'r7/d/RUNTIME_FREEZE_R7D_1.json')),changedSource=Object.keys(src).filter(p=>f1.files[p]!==src[p]);
need(changedSource.length===1&&changedSource[0]==='CoachingCore/src/r6-adaptation.mjs','only r6-adaptation.mjs differs from R7D-FREEZE-1: '+changedSource.join(', '));
need(Object.keys(f1.files).filter(p=>p.startsWith('CoachingCore/src/')).every(p=>src[p]),'a source file of R7D-FREEZE-1 is missing');
// 1. The whole suite, then the directed tests.
const suite=counts(run(['--test']));
need(suite.tests>0&&suite.fail===0&&suite.pass===suite.tests,'suite '+JSON.stringify(suite));
const TEST='test/r7d-phase31.test.mjs',dr=counts(run(['--test',TEST]));
const directed={file:'CoachingCore/'+TEST,sha256:sha(path.join(CC,TEST)),tests:dr.tests,pass:dr.pass,fail:dr.fail};
need(directed.tests===14&&directed.fail===0&&directed.pass===directed.tests,'directed tests '+JSON.stringify(directed));
// 2. Conformance (R7-B, R7-B.1, R7-B.2), read-only.
const conformance=Object.fromEntries(['conformance-r7b','conformance-r7b1','conformance-r7b2'].map(s=>{const r=run([`scripts/${s}.mjs`]);let j=null;try{j=JSON.parse(r.stdout);}catch{}need(j?.result==='PASS',s+': '+(j?JSON.stringify(j.problems).slice(0,300):'no JSON'));return [s,{result:j?.result??null,sha256:createHash('sha256').update(r.stdout).digest('hex')}];}));
// 3. RED on R7D-FREEZE-1: the directed tests and the two frozen assertions updated in this phase, run on the superseded bytes (restored after).
need(Object.entries(f1.files).filter(([p])=>p.startsWith('CoachingCore/src/')).every(([p,h])=>fs.existsSync(path.join(path.resolve(d1),p))&&sha(path.join(path.resolve(d1),p))===h),'--d1 does not hold the R7D-FREEZE-1 source bytes');
const UPDATED=[['test/r7a1-composition.test.mjs','R7-A.1 C4/C5: a waiting or event-conflict day carries no session in either order'],['test/r7c-phase5-cc.test.mjs','R7-C QE-R7C-01: an answer a clinical route recorded is applied after clearance']];
const saved=new Map();for(const f of [TEST,...UPDATED.map(u=>u[0])]){const p=path.join(D1,f);saved.set(p,fs.existsSync(p)?fs.readFileSync(p):null);fs.copyFileSync(path.join(CC,f),p);}
let red;
try{
 const r=counts(run(['--test',TEST],D1));
 const u=UPDATED.map(([f,title])=>{const x=counts(run(['--test','--test-name-pattern',title,f],D1)),c=counts(run(['--test','--test-name-pattern',title,f]));return {file:'CoachingCore/'+f,test:title,onFreeze1:{tests:x.tests,fail:x.fail},onCandidate:{tests:c.tests,fail:c.fail}};});
 red={directedOnFreeze1:{tests:r.tests,pass:r.pass,fail:r.fail,passing:r.tests-r.fail,failed:r.failed},updatedAssertions:u};
}finally{for(const [p,b] of saved)if(b===null)fs.rmSync(p,{force:true});else fs.writeFileSync(p,b);}
need(red.directedOnFreeze1.fail>=13,'the directed tests fail on R7D-FREEZE-1 (all but the characterization test)');
need(red.updatedAssertions.every(u=>u.onFreeze1.tests===1&&u.onFreeze1.fail===1&&u.onCandidate.tests===1&&u.onCandidate.fail===0),'each updated frozen assertion fails on R7D-FREEZE-1 and passes on the candidate');
// 4. Outputs the phase produced on these bytes.
const outputs={
 mutation:'phase31/evidence/MUTATION_PHASE31.json',
 validation:'harness/validation/HARNESS_VALIDATION_R7D_3.json',
 diagnosticRegression:'phase31/regression/diagnostic/RUN_REPORT.json',
 generatedRegression:'phase31/regression/generated/RUN_REPORT.json',
 differential:'phase31/evidence/DIFFERENTIAL_VS_R7D_FREEZE_1.json'
};
const O={};for(const [k,p] of Object.entries(outputs)){const f=path.join(AUD,p);need(fs.existsSync(f),'missing '+p);if(fs.existsSync(f))O[k]={path:rel(f),sha256:sha(f),json:read(f)};}
const mu=O.mutation?.json,va=O.validation?.json,dg=O.diagnosticRegression?.json,gr=O.generatedRegression?.json,df=O.differential?.json;
need(mu&&mu.summary.killed===mu.summary.mutants&&mu.summary.mutants>=4&&mu.mutants.every(m=>m.killed),'every mutant killed by its own witness');
need(mu&&Object.entries(mu.sources).every(([p,h])=>src[p]===h)&&mu.testFileSha256===directed.sha256,'mutation ran on these bytes and this test file');
need(va&&va.summary.noFalseBlock==='PASS'&&va.summary.coverage==='COVERED'&&va.summary.sensitivity.length===10&&va.summary.sensitivity.every(s=>s.result==='DETECTED_AND_CLEAN_ON_CANDIDATE')&&va.summary.notFired.length===0,'harness validation 3');
need(va&&Object.entries(va.runs[0].runtime.source.files).filter(([p])=>p.startsWith('CoachingCore/src/')).every(([p,h])=>src[p]===h),'harness validation ran on these bytes');
for(const [k,r] of [['diagnosticRegression',dg],['generatedRegression',gr]]){
 need(r&&Object.entries(r.runtimeSource.files).filter(([p])=>p.startsWith('CoachingCore/src/')).every(([p,h])=>src[p]===h),k+' ran on these source bytes');
 need(r&&r.harness==='R7D-HARNESS-3'&&Object.values(r.summary.properties).every(p=>p.violations===0)&&r.summary.harnessErrors===0,k+': a property violation or a harness error');
}
const variant=dg?.summary.relations.VARIANT;need(variant&&variant.failingCases.every(c=>['R7D-D02','R7D-D06','R7D-D14','R7D-D16'].includes(c)),'diagnostic VARIANT failures outside the triaged set');
need(dg&&Object.entries(dg.summary.relations).filter(([k])=>k!=='VARIANT').every(([,v])=>v.violations===0),'diagnostic regression: a metamorphic violation');
need(df&&df.unexplained.length===0&&df.differingCases.every(c=>c.corpus==='HARNESS_DEV_3'&&c.trigger),'differential: a difference outside the interruption-persistence family');
// 5. Authorities the phase leaves untouched (the queue append comes later, in the freeze-closing sequence).
const {r6Authority}=await import(pathToFileURL(path.join(CC,'src/r6-authority.mjs')).href),A=r6Authority();
const authority={policy:{path:'CoachingCore/r6/PROGRAM_POLICY_R6.json',sha256:sha(path.join(CC,'r6/PROGRAM_POLICY_R6.json')),canonicalHash:A.policyHash,boundariesEnabled:Object.keys(A.approved).length},
 catalog:{path:'CoachingCore/r7/b0/REPERTOIRE_CATALOG_B0.json',sha256:sha(path.join(CC,'r7/b0/REPERTOIRE_CATALOG_B0.json'))},
 r6Records:{path:'audits/domain-coaching-r6-2026-10-26/reviews/ssctr-policy-review.json',sha256:sha(path.join(REPO,'audits/domain-coaching-r6-2026-10-26/reviews/ssctr-policy-review.json'))},
 b0Records:{path:'audits/domain-coaching-r7-b0-2026-10-31/reviews/SSCTR_RECHECK_B0.json',sha256:sha(path.join(REPO,'audits/domain-coaching-r7-b0-2026-10-31/reviews/SSCTR_RECHECK_B0.json'))},
 humanQueue:{path:'reviews/provisional-sports-science/2026-10-23/HUMAN_REVALIDATION_QUEUE.json',sha256:sha(path.join(REPO,'reviews/provisional-sports-science/2026-10-23/HUMAN_REVALIDATION_QUEUE.json')),items:read(path.join(REPO,'reviews/provisional-sports-science/2026-10-23/HUMAN_REVALIDATION_QUEUE.json')).items.length}};
need(authority.policy.sha256==='a75be1aae3818616888e641c104407926d5f16f213a04137f5b21024ccafe100','policy bytes changed');
need(authority.policy.canonicalHash==='18ec48f34768a7eebb2aede618db65a77385efebbda0a38d6f03135e5cd96b4c'&&authority.policy.boundariesEnabled===10,'policy canonical hash or R6 boundaries');
need(authority.catalog.sha256==='ceee276a424ee7575b4477a2bc429de2e8cd854e3cb82ac767776492cdcb92f9','catalog bytes changed');
for(const k of ['r6Records','b0Records'])need(f1.files[authority[k].path]===undefined||f1.files[authority[k].path]===authority[k].sha256,k+' changed');
need(!fs.existsSync(path.join(AUD,'final')),'a final holdout exists');
const report={evidence:'R7D-PHASE31-EVIDENCE-1',created:new Date().toISOString(),node:process.version,runtimeSource:src,changedSourceVsFreeze1:changedSource,suite,directed,conformance,red,
 outputs:Object.fromEntries(Object.entries(O).map(([k,v])=>[k,{path:v.path,sha256:v.sha256}])),
 results:{mutation:mu?.summary??null,validation:va?.summary??null,
  diagnosticRegression:dg?{properties:Object.fromEntries(Object.entries(dg.summary.properties).map(([k,p])=>[k,{result:p.result,units:p.units,violations:p.violations}])),relations:Object.fromEntries(Object.entries(dg.summary.relations).map(([k,v])=>[k,{units:v.units,violations:v.violations,failingCases:v.failingCases}])),corpusErrors:dg.summary.corpusErrors}:null,
  generatedRegression:gr?{properties:Object.fromEntries(Object.entries(gr.summary.properties).map(([k,p])=>[k,{result:p.result,units:p.units,violations:p.violations}]))}:null,
  differential:df?{cases:df.cases,same:df.same,differing:df.differing,unexplained:df.unexplained,differingCases:df.differingCases}:null},
 authority,finalHoldoutExists:fs.existsSync(path.join(AUD,'final')),problems,result:problems.length?'FAIL':'PASS'};
fs.writeFileSync(out,JSON.stringify(report,null,1)+'\n');
console.log(JSON.stringify({result:report.result,problems,suite,directed,conformance:Object.fromEntries(Object.entries(conformance).map(([k,v])=>[k,v.result])),red:{directedOnFreeze1:red.directedOnFreeze1.fail+'/'+red.directedOnFreeze1.tests+' fail',updated:red.updatedAssertions.map(u=>u.onFreeze1.fail+'/'+u.onCandidate.fail)}},null,1));
process.exitCode=problems.length?1:0;
