// R7-D Phase 3.4 evidence manifest (consumed by the reviews and by CoachingCore/scripts/freeze-r7d-5.mjs). On the committed runtime bytes it runs the
// whole suite, the Phase 3.4, 3.3, 3.2 and 3.1 directed tests and the three R7-B conformance checks (read-only). It runs the Phase 3.4 directed tests
// and the assertions updated in this phase on R7D-FREEZE-4 (RED), and the updated assertions as they stood at R7D-FREEZE-4 on a copy of the candidate.
// It reads the outputs the phase produced on the same bytes (witness, mutation, harness validation 6, diagnostic and generated regressions,
// differential versus R7D-FREEZE-4) and checks the authorities the phase leaves untouched. It writes one JSON manifest and nothing else in the
// repository. No deletion of any kind: R7D-FREEZE-4 and the candidate are each copied into a NEW directory under --work-parent (mkdtemp); --d4 is
// only read.
//   node phase34-run-evidence.mjs --d4 <R7D-FREEZE-4 root> --out <file> --work-parent <scratch dir>
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {pathToFileURL} from 'node:url';

const arg=k=>{const i=process.argv.indexOf(k);return i>=0?process.argv[i+1]:null;};
const out=arg('--out'),d4=arg('--d4'),parent=arg('--work-parent');if(!out||!d4||!parent)throw Error('--d4 <R7D-FREEZE-4 root> --out <file> --work-parent <scratch dir>');
const AUD=path.resolve(import.meta.dirname,'../..'),REPO=path.resolve(AUD,'../..'),CC=path.join(REPO,'CoachingCore'),D4=path.join(path.resolve(d4),'CoachingCore');
if(!fs.statSync(parent).isDirectory()||path.resolve(parent).startsWith(REPO))throw Error('--work-parent must be an existing directory outside the repository');
const fresh=tag=>fs.mkdtempSync(path.join(path.resolve(parent),`r7d-p34-ev-${tag}-`));
const sha=p=>createHash('sha256').update(fs.readFileSync(p)).digest('hex'),rel=p=>path.relative(REPO,p).split(path.sep).join('/');
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const run=(args,cwd=CC)=>spawnSync(process.execPath,args,{cwd,encoding:'utf8',maxBuffer:1<<28,timeout:1800000});
const git=args=>spawnSync('git',args,{cwd:REPO,encoding:'utf8',maxBuffer:1<<28});
const counts=r=>{const n=k=>Number(r.stdout.match(new RegExp('ℹ '+k+' (\\d+)'))?.[1]??NaN);return {tests:n('tests'),pass:n('pass'),fail:n('fail'),failed:[...new Set([...r.stdout.matchAll(/^✖ ([^\n]*?) \(\d/gm)].map(m=>m[1]))]};};
const problems=[],need=(ok,msg)=>{if(!ok)problems.push(msg);};
const RECORDS=['audits/domain-coaching-r6-2026-10-26/reviews/ssctr-policy-review.json','audits/domain-coaching-r7-b0-2026-10-31/reviews/SSCTR_RECHECK_B0.json','audits/domain-closure-r3-2026-10-24/reviews/ssctr-records.json','audits/domain-closure-r4-2026-10-25/reviews/ssctr-envelope-review.json','audits/domain-coaching-r5-2026-10-25/reviews/ssctr-policy-review.json'];
const copyRuntime=(fromCC,fromRepo,tag)=>{const w=fresh(tag);fs.cpSync(fromCC,path.join(w,'CoachingCore'),{recursive:true,filter:p=>!/[\\/]\.git([\\/]|$)/.test(p)});for(const r of RECORDS){const src=path.join(fromRepo,r);if(fs.existsSync(src)){fs.mkdirSync(path.dirname(path.join(w,r)),{recursive:true});fs.copyFileSync(src,path.join(w,r));}}return path.join(w,'CoachingCore');};
// The runtime bytes the evidence is about, and what differs from R7D-FREEZE-4.
const src=Object.fromEntries(fs.readdirSync(path.join(CC,'src')).filter(f=>f.endsWith('.mjs')).sort().map(f=>['CoachingCore/src/'+f,sha(path.join(CC,'src',f))]));
const f4=read(path.join(CC,'r7/d/RUNTIME_FREEZE_R7D_4.json')),changedSource=Object.keys(src).filter(p=>f4.files[p]!==src[p]);
need(changedSource.join('|')==='CoachingCore/src/r6-adaptation.mjs|CoachingCore/src/r6-composition.mjs','only r6-adaptation.mjs and r6-composition.mjs differ from R7D-FREEZE-4: '+changedSource.join(', '));
// 1. The whole suite, then the directed tests.
const suite=counts(run(['--test']));
need(suite.tests>0&&suite.fail===0&&suite.pass===suite.tests,'suite '+JSON.stringify(suite));
const T34='test/r7d-phase34.test.mjs',T33='test/r7d-phase33.test.mjs',T32='test/r7d-phase32.test.mjs',T31='test/r7d-phase31.test.mjs';
const fileRow=(f,c)=>({file:'CoachingCore/'+f,sha256:sha(path.join(CC,f)),tests:c.tests,pass:c.pass,fail:c.fail});
const directed={p34:fileRow(T34,counts(run(['--test',T34]))),p33:fileRow(T33,counts(run(['--test',T33]))),p32:fileRow(T32,counts(run(['--test',T32]))),p31:fileRow(T31,counts(run(['--test',T31])))};
for(const [k,n] of [['p33',14],['p32',17],['p31',14]])need(directed[k].tests===n&&directed[k].fail===0,`${k} directed tests `+JSON.stringify(directed[k]));
need(directed.p34.tests>=14&&directed.p34.fail===0&&directed.p34.pass===directed.p34.tests,'Phase 3.4 directed tests '+JSON.stringify(directed.p34));
// 2. Conformance (R7-B, R7-B.1, R7-B.2), read-only.
const conformance=Object.fromEntries(['conformance-r7b','conformance-r7b1','conformance-r7b2'].map(s=>{const r=run([`scripts/${s}.mjs`]);let j=null;try{j=JSON.parse(r.stdout);}catch{}need(j?.result==='PASS',s+': '+(j?JSON.stringify(j.problems).slice(0,300):'no JSON'));return [s,{result:j?.result??null,sha256:sha(path.join(CC,'scripts',s+'.mjs'))}];}));
// 3. RED on R7D-FREEZE-4: the Phase 3.4 directed tests and the updated assertions, on a copy of the superseded bytes.
need(Object.entries(f4.files).filter(([p])=>p.startsWith('CoachingCore/src/')).every(([p,h])=>fs.existsSync(path.join(path.resolve(d4),p))&&sha(path.join(path.resolve(d4),p))===h),'--d4 does not hold the R7D-FREEZE-4 source bytes');
const redCC=copyRuntime(D4,path.resolve(d4),'d4');
for(const f of [T34,T33,T32])fs.copyFileSync(path.join(CC,f),path.join(redCC,f));
// --test-name-pattern reads a regular expression: titles are escaped so a parenthesis matches itself.
const pattern=t=>t.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
const UPDATED=[[T33,'R7-D Phase 3.3 T4: a week between the breaks with a session missed or partial'],[T33,'R7-D Phase 3.3 T4: unreported sessions in a week between the breaks'],[T33,'R7-D Phase 3.3 T4: a conflicted report in a week between the breaks'],[T33,'R7-D Phase 3.3 T5'],[T32,'R7-D Phase 3.2 T5 (F08 unchanged, characterization)']];
const CHARACTERIZATION=['R7-D Phase 3.4 T4: isolated sessions','R7-D Phase 3.4 T4 (disclosed residual)','R7-D Phase 3.4 T9','R7-D Phase 3.4 T11','R7-D Phase 3.4 T12 (R-F08-1, control)','R7-D Phase 3.4 T14: optional walks'];
const r4=counts(run(['--test',T34],redCC));
const red={directedOnFreeze4:{tests:r4.tests,pass:r4.pass,fail:r4.fail,failed:r4.failed,passing:r4.tests-r4.fail},
 updatedAssertions:UPDATED.map(([file,title])=>{const x=counts(run(['--test','--test-name-pattern',pattern(title),file],redCC)),c=counts(run(['--test','--test-name-pattern',pattern(title),file]));return {file:'CoachingCore/'+file,test:title,updatedOnFreeze4:{tests:x.tests,fail:x.fail},updatedOnCandidate:{tests:c.tests,fail:c.fail}};})};
need(red.directedOnFreeze4.fail>=8,'the Phase 3.4 witness tests fail on R7D-FREEZE-4');
need(CHARACTERIZATION.every(w=>!red.directedOnFreeze4.failed.some(x=>x.startsWith(w))),'the characterization tests pass on R7D-FREEZE-4');
need(red.updatedAssertions.every(u=>u.updatedOnFreeze4.tests>=1&&u.updatedOnFreeze4.fail>=1),'each updated assertion fails on R7D-FREEZE-4');
need(red.updatedAssertions.every(u=>u.updatedOnCandidate.tests>=1&&u.updatedOnCandidate.fail===0),'each updated assertion passes on the candidate');
// The updated assertions as they stood at R7D-FREEZE-4, on a copy of the candidate.
const candCC=copyRuntime(CC,REPO,'cand');
for(const f of [T33,T32]){const old=git(['show',`${f4.commit}:CoachingCore/${f}`]).stdout;need(old.length>0,'the test file at R7D-FREEZE-4: '+f);fs.writeFileSync(path.join(candCC,f),old);}
red.assertionsAsAtFreeze4=UPDATED.map(([file,title])=>{const x=counts(run(['--test','--test-name-pattern',pattern(title),file],candCC));return {file:'CoachingCore/'+file,atCommit:f4.commit,test:title,onCandidate:{tests:x.tests,fail:x.fail}};});
need(red.assertionsAsAtFreeze4.every(a=>a.onCandidate.tests>=1&&a.onCandidate.fail>=1),'each assertion as it stood at R7D-FREEZE-4 fails on the candidate');
// 4. Outputs the phase produced on these bytes.
const outputs={witnessRed:'phase34/probes/out/p34-witness.R7D-FREEZE-4.json',witnessCandidate:'phase34/probes/out/p34-witness.candidate.json',mutation:'phase34/evidence/MUTATION_PHASE34.json',validation:'harness/validation/HARNESS_VALIDATION_R7D_6.json',
 diagnosticRegression:'phase34/regression/diagnostic/RUN_REPORT.json',generatedRegression:'phase34/regression/generated/RUN_REPORT.json',differential:'phase34/evidence/DIFFERENTIAL_VS_R7D_FREEZE_4.json'};
const O={};for(const [k,p] of Object.entries(outputs)){const f=path.join(AUD,p);need(fs.existsSync(f),'missing '+p);if(fs.existsSync(f))O[k]={path:rel(f),sha256:sha(f),json:read(f)};}
const wr=O.witnessRed?.json,wc=O.witnessCandidate?.json,mu=O.mutation?.json,va=O.validation?.json,dg=O.diagnosticRegression?.json,gr=O.generatedRegression?.json,df=O.differential?.json;
need(wr?.verdict?.RED===true&&wc?.verdict?.RED===false,'the witness is RED on R7D-FREEZE-4 and not on the candidate');
need(wr?.verdict?.controlsHold===true&&wc?.verdict?.controlsHold===true,'the witness controls hold on both runtimes');
need(mu&&mu.summary.killed===mu.summary.mutants&&mu.summary.mutants>=8&&mu.mutants.every(m=>m.killed)&&mu.scratchRestored===true,'every mutant killed by its own witness');
need(mu&&Object.entries(mu.sources).every(([p,h])=>src[p]===h)&&mu.testFileSha256===directed.p34.sha256,'mutation ran on these bytes and this test file');
need(va&&va.validation==='R7D-HARNESS-VALIDATION-6'&&va.summary.noFalseBlock==='PASS'&&va.summary.coverage==='COVERED'&&va.summary.sensitivity.every(s=>s.result==='DETECTED_AND_CLEAN_ON_CANDIDATE')&&va.summary.notFired.length===0,'harness validation 6');
need(va&&Object.entries(va.runs[0].runtime.source.files).filter(([p])=>p.startsWith('CoachingCore/src/')).every(([p,h])=>src[p]===h),'harness validation ran on these bytes');
for(const [k,r] of [['diagnosticRegression',dg],['generatedRegression',gr]]){
 need(r&&Object.entries(r.runtimeSource.files).filter(([p])=>p.startsWith('CoachingCore/src/')).every(([p,h])=>src[p]===h),k+' ran on these source bytes');
 need(r&&r.harness==='R7D-HARNESS-6'&&Object.values(r.summary.properties).every(p=>p.violations===0)&&r.summary.harnessErrors===0,k+': a property violation or a harness error');
}
const variant=dg?.summary.relations.VARIANT;need(variant&&variant.failingCases.every(c=>['R7D-D02','R7D-D06','R7D-D14','R7D-D16'].includes(c)),'diagnostic VARIANT failures outside the triaged set');
need(dg&&Object.entries(dg.summary.relations).filter(([k])=>k!=='VARIANT').every(([,v])=>v.violations===0),'diagnostic regression: a metamorphic violation');
need(df&&df.unexplained.length===0,'differential: a difference outside the phase\'s triggers');
// 5. Authorities the phase leaves untouched.
const {r6Authority}=await import(pathToFileURL(path.join(CC,'src/r6-authority.mjs')).href),A=r6Authority();
const queuePath=path.join(REPO,'reviews/provisional-sports-science/2026-10-23/HUMAN_REVALIDATION_QUEUE.json');
const authority={policy:{path:'CoachingCore/r6/PROGRAM_POLICY_R6.json',sha256:sha(path.join(CC,'r6/PROGRAM_POLICY_R6.json')),canonicalHash:A.policyHash,boundariesEnabled:Object.keys(A.approved).length},
 catalog:{path:'CoachingCore/r7/b0/REPERTOIRE_CATALOG_B0.json',sha256:sha(path.join(CC,'r7/b0/REPERTOIRE_CATALOG_B0.json'))},
 r6Records:{path:'audits/domain-coaching-r6-2026-10-26/reviews/ssctr-policy-review.json',sha256:sha(path.join(REPO,'audits/domain-coaching-r6-2026-10-26/reviews/ssctr-policy-review.json'))},
 b0Records:{path:'audits/domain-coaching-r7-b0-2026-10-31/reviews/SSCTR_RECHECK_B0.json',sha256:sha(path.join(REPO,'audits/domain-coaching-r7-b0-2026-10-31/reviews/SSCTR_RECHECK_B0.json'))},
 humanQueue:{path:rel(queuePath),sha256:sha(queuePath),items:read(queuePath).items.length},
 productAndCanonUnchangedSinceFreeze4:git(['diff','--quiet',f4.commit,'--','product','canon']).status===0};
need(authority.policy.sha256==='a75be1aae3818616888e641c104407926d5f16f213a04137f5b21024ccafe100','policy bytes changed');
need(authority.policy.canonicalHash==='18ec48f34768a7eebb2aede618db65a77385efebbda0a38d6f03135e5cd96b4c'&&authority.policy.boundariesEnabled===10,'policy canonical hash or R6 boundaries');
need(authority.catalog.sha256==='ceee276a424ee7575b4477a2bc429de2e8cd854e3cb82ac767776492cdcb92f9','catalog bytes changed');
for(const k of ['r6Records','b0Records'])need(f4.files[authority[k].path]===undefined||f4.files[authority[k].path]===authority[k].sha256,k+' changed');
need(authority.humanQueue.items===234&&f4.files[authority.humanQueue.path]===authority.humanQueue.sha256,'the human revalidation queue changed before the authorized append');
need(authority.productAndCanonUnchangedSinceFreeze4,'product/ or canon/ changed since R7D-FREEZE-4');
need(!fs.existsSync(path.join(AUD,'final')),'a final holdout exists');
const report={evidence:'R7D-PHASE34-EVIDENCE-1',created:new Date().toISOString(),node:process.version,runtimeSource:src,changedSourceVsFreeze4:changedSource,suite,directed,conformance,red,
 scratch:{note:'new directories under --work-parent; nothing deleted'},
 outputs:Object.fromEntries(Object.entries(O).map(([k,v])=>[k,{path:v.path,sha256:v.sha256}])),
 results:{witness:{freeze4:wr?.verdict??null,candidate:wc?.verdict??null},mutation:mu?.summary??null,validation:va?.summary??null,
  diagnosticRegression:dg?{properties:Object.fromEntries(Object.entries(dg.summary.properties).map(([k,p])=>[k,{result:p.result,units:p.units,violations:p.violations}])),relations:Object.fromEntries(Object.entries(dg.summary.relations).map(([k,v])=>[k,{units:v.units,violations:v.violations,failingCases:v.failingCases}])),corpusErrors:dg.summary.corpusErrors}:null,
  generatedRegression:gr?{properties:Object.fromEntries(Object.entries(gr.summary.properties).map(([k,p])=>[k,{result:p.result,units:p.units,violations:p.violations}]))}:null,
  differential:df?{cases:df.cases,same:df.same,differing:df.differing,unexplained:df.unexplained,differingCases:df.differingCases,byTrigger:df.byTrigger}:null},
 authority,finalHoldoutExists:fs.existsSync(path.join(AUD,'final')),problems,result:problems.length?'FAIL':'PASS'};
fs.writeFileSync(out,JSON.stringify(report,null,1)+'\n');
console.log(JSON.stringify({result:report.result,problems,suite,directed,conformance:Object.fromEntries(Object.entries(conformance).map(([k,v])=>[k,v.result])),red:{directedOnFreeze4:red.directedOnFreeze4.fail+'/'+red.directedOnFreeze4.tests+' fail',updatedOnFreeze4:red.updatedAssertions.map(u=>u.updatedOnFreeze4.fail),asAtFreeze4OnCandidate:red.assertionsAsAtFreeze4.map(a=>a.onCandidate.fail)}},null,1));
process.exitCode=problems.length?1:0;
