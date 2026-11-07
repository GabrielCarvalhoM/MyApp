// R7-D Phase 3.5 evidence manifest (consumed by the reviews and by CoachingCore/scripts/freeze-r7d-5.mjs). On the committed runtime bytes it runs the
// whole suite, the R7-D directed tests (Phases 3.5, 3.4, 3.3, 3.2, 3.1) and the three R7-B conformance checks (read-only); it runs the Phase 3.5
// directed tests on a copy of candidate 46934a0 (RED: exactly the finding tests fail there, nine since the bounded cycle; the adequacy tests, four, pass); and it binds the
// outputs the phase produced on the same source bytes (mutation, harness validation 7, the diagnostic and generated regressions, the differential
// against 46934a0, the fidelity of the Phase 3.4 rechecks' pinned probes), checking that each one names these bytes. It also checks the authorities
// the phase leaves untouched. It writes one JSON manifest and nothing else in the repository. No deletion of any kind: copies go into NEW directories
// under --work-parent (mkdtemp); --c46 is only read.
// Since the bounded cycle (QRE-R7D-PHASE35-CHECK-r1 NOT_READY, QRE-P35-01) it also runs the Phase 3.5 directed tests on a copy of 8e78b8a, the
// candidate the first checks judged: exactly T36 fails there, every other test passes; and it binds the differential against 8e78b8a, where only
// the DUPLICATE trigger explains a difference.
//   node phase35-run-evidence.mjs --c46 <46934a0 root> --c8e <8e78b8a root> --out <file> --work-parent <scratch dir>
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {pathToFileURL} from 'node:url';

const arg=k=>{const i=process.argv.indexOf(k);return i>=0?process.argv[i+1]:null;};
const out=arg('--out'),c46=arg('--c46'),c8e=arg('--c8e'),parent=arg('--work-parent');if(!out||!c46||!c8e||!parent)throw Error('--c46 <46934a0 root> --c8e <8e78b8a root> --out <file> --work-parent <scratch dir>');
const AUD=path.resolve(import.meta.dirname,'../..'),REPO=path.resolve(AUD,'../..'),CC=path.join(REPO,'CoachingCore'),P35=path.join(AUD,'phase35');
if(!fs.statSync(parent).isDirectory()||path.resolve(parent).startsWith(REPO))throw Error('--work-parent must be an existing directory outside the repository');
const fresh=tag=>fs.mkdtempSync(path.join(path.resolve(parent),`r7d-p35-ev-${tag}-`));
const sha=p=>createHash('sha256').update(fs.readFileSync(p)).digest('hex'),rel=p=>path.relative(REPO,p).split(path.sep).join('/'),read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const run=(args,cwd=CC)=>spawnSync(process.execPath,args,{cwd,encoding:'utf8',maxBuffer:1<<28,timeout:1800000});
const git=args=>spawnSync('git',args,{cwd:REPO,encoding:'utf8',maxBuffer:1<<28});
const counts=r=>{const n=k=>Number(r.stdout.match(new RegExp('ℹ '+k+' (\\d+)'))?.[1]??NaN);return {tests:n('tests'),pass:n('pass'),fail:n('fail'),failed:[...new Set([...r.stdout.matchAll(/^✖ ([^\n]*?) \(\d/gm)].map(m=>m[1]))]};};
const problems=[],need=(ok,msg)=>{if(!ok)problems.push(msg);};
const RECORDS=['audits/domain-coaching-r6-2026-10-26/reviews/ssctr-policy-review.json','audits/domain-coaching-r7-b0-2026-10-31/reviews/SSCTR_RECHECK_B0.json','audits/domain-closure-r3-2026-10-24/reviews/ssctr-records.json','audits/domain-closure-r4-2026-10-25/reviews/ssctr-envelope-review.json','audits/domain-coaching-r5-2026-10-25/reviews/ssctr-policy-review.json'];
const LEAN=['src','test','r7','r6/fixtures','r6/PROGRAM_POLICY_R6.json','r5/PROGRAM_POLICY_R5.json','r4/PRESCRIPTION_ENVELOPE_REGISTRY.json','r3/BOUNDED_POLICY_CANDIDATES_R3.json','package.json','POLICY_REGISTRY_RUNTIME_BINDINGS.json','SHADOW_DECISION_SCHEMA.json','SHADOW_INPUT_SCHEMA.json'];
/** A lean copy of a runtime (the paths the directed tests and probes read) and the review records, into a new directory. */
const copyRuntime=(fromCC,fromRepo,tag,{audit=false}={})=>{const w=fresh(tag);for(const p of LEAN){const s=path.join(fromCC,p);if(fs.existsSync(s)){fs.mkdirSync(path.dirname(path.join(w,'CoachingCore',p)),{recursive:true});fs.cpSync(s,path.join(w,'CoachingCore',p),{recursive:true});}}
 for(const r of RECORDS){const s=path.join(fromRepo,r);if(fs.existsSync(s)){fs.mkdirSync(path.dirname(path.join(w,r)),{recursive:true});fs.copyFileSync(s,path.join(w,r));}}
 if(audit)fs.cpSync(AUD,path.join(w,rel(AUD)),{recursive:true});return w;};
// The runtime bytes the evidence is about, and what differs from R7D-FREEZE-4 and from 46934a0.
const src=Object.fromEntries(fs.readdirSync(path.join(CC,'src')).filter(f=>f.endsWith('.mjs')).sort().map(f=>['CoachingCore/src/'+f,sha(path.join(CC,'src',f))]));
const f4=read(path.join(CC,'r7/d/RUNTIME_FREEZE_R7D_4.json')),changedSource=Object.keys(src).filter(p=>f4.files[p]!==src[p]);
need(changedSource.join('|')==='CoachingCore/src/r6-adaptation.mjs|CoachingCore/src/r6-composition.mjs','only r6-adaptation.mjs and r6-composition.mjs differ from R7D-FREEZE-4: '+changedSource.join(', '));
const at46=p=>{const r=spawnSync('git',['show',`46934a0:${p}`],{cwd:REPO,encoding:'buffer',maxBuffer:1<<28});return r.status===0?createHash('sha256').update(r.stdout).digest('hex'):null;};
const changedSince46=Object.keys(src).filter(p=>at46(p)!==src[p]);
need(changedSince46.join('|')==='CoachingCore/src/r6-adaptation.mjs','only r6-adaptation.mjs differs from 46934a0: '+changedSince46.join(', '));
// 1. The whole suite, then the directed tests.
const suite=counts(run(['--test']));
need(suite.tests>0&&suite.fail===0&&suite.pass===suite.tests,'suite '+JSON.stringify(suite));
const T={p35:'test/r7d-phase35.test.mjs',p34:'test/r7d-phase34.test.mjs',p33:'test/r7d-phase33.test.mjs',p32:'test/r7d-phase32.test.mjs',p31:'test/r7d-phase31.test.mjs'};
const fileRow=(f,c)=>({file:'CoachingCore/'+f,sha256:sha(path.join(CC,f)),tests:c.tests,pass:c.pass,fail:c.fail});
const directed=Object.fromEntries(Object.entries(T).map(([k,f])=>[k,fileRow(f,counts(run(['--test',f])))]));
for(const [k,n] of [['p35',13],['p34',40],['p33',14],['p32',17],['p31',14]])need(directed[k].tests===n&&directed[k].fail===0,`${k} directed tests `+JSON.stringify(directed[k]));
need(['p34','p33','p32','p31'].every(k=>git(['diff','--quiet','46934a0','HEAD','--','CoachingCore/'+T[k]]).status===0),'an existing directed test file changed since 46934a0');
// 2. Conformance (R7-B, R7-B.1, R7-B.2), read-only.
const conformance=Object.fromEntries(['conformance-r7b','conformance-r7b1','conformance-r7b2'].map(s=>{const r=run([`scripts/${s}.mjs`]);let j=null;try{j=JSON.parse(r.stdout);}catch{}need(j?.result==='PASS',s+': '+(j?JSON.stringify(j.problems).slice(0,300):'no JSON'));return [s,{result:j?.result??null,sha256:sha(path.join(CC,'scripts',s+'.mjs'))}];}));
// 3. RED on 46934a0: the Phase 3.5 directed tests on a copy of the candidate the rechecks judged.
const C46=path.join(path.resolve(c46),'CoachingCore');
need(Object.keys(src).every(p=>{const h=at46(p);return !!h&&fs.existsSync(path.join(path.resolve(c46),p))&&sha(path.join(path.resolve(c46),p))===h;}),'--c46 does not hold the 46934a0 source bytes');
const redRoot=copyRuntime(C46,path.resolve(c46),'c46'),redCC=path.join(redRoot,'CoachingCore');fs.copyFileSync(path.join(CC,T.p35),path.join(redCC,T.p35));
const rv=counts(run(['--test',T.p35],redCC));
const FINDING=['R7-D Phase 3.5 T31','R7-D Phase 3.5 T32','R7-D Phase 3.5 T33','R7-D Phase 3.5 T36','R7-D Phase 3.5 T38'],ADEQUACY=['R7-D Phase 3.5 T34','R7-D Phase 3.5 T35','R7-D Phase 3.5 T37'];
const red={on46934a0:{tests:rv.tests,pass:rv.pass,fail:rv.fail,failed:rv.failed},
 findingTestsFail:rv.failed.length===9&&rv.failed.every(x=>FINDING.some(w=>x.startsWith(w))),adequacyTestsPass:!rv.failed.some(x=>ADEQUACY.some(w=>x.startsWith(w)))&&rv.pass===4};
need(red.findingTestsFail,'exactly the nine finding tests (T31, T32 x3, T33 x3, T36, T38) fail on 46934a0: '+rv.failed.join(' | '));
need(red.adequacyTestsPass,'the four adequacy tests (T34, T35 x2, T37) pass on 46934a0');
// 3b. The bounded cycle: on 8e78b8a (the candidate the first checks judged) exactly T36 (QRE-P35-01) fails.
const at8e=p=>{const r=spawnSync('git',['show',`8e78b8a:${p}`],{cwd:REPO,encoding:'buffer',maxBuffer:1<<28});return r.status===0?createHash('sha256').update(r.stdout).digest('hex'):null;};
need(Object.keys(src).every(p=>{const h=at8e(p);return !!h&&fs.existsSync(path.join(path.resolve(c8e),p))&&sha(path.join(path.resolve(c8e),p))===h;}),'--c8e does not hold the 8e78b8a source bytes');
const cyRoot=copyRuntime(path.join(path.resolve(c8e),'CoachingCore'),path.resolve(c8e),'c8e'),cyCC=path.join(cyRoot,'CoachingCore');fs.copyFileSync(path.join(CC,T.p35),path.join(cyCC,T.p35));
const cy=counts(run(['--test',T.p35],cyCC));
red.boundedCycleOn8e78b8a={tests:cy.tests,pass:cy.pass,fail:cy.fail,failed:cy.failed,onlyT36Fails:cy.fail===1&&cy.failed.length===1&&cy.failed[0].startsWith('R7-D Phase 3.5 T36')};
need(red.boundedCycleOn8e78b8a.onlyT36Fails,'exactly T36 fails on 8e78b8a: '+cy.failed.join(' | '));
// 4. Outputs the phase produced on these bytes; each must name them.
const outputs={mutation:'phase35/evidence/MUTATION_PHASE35.json',validation:'harness/validation/HARNESS_VALIDATION_R7D_7.json',devCases:'harness/validation/DEV_CASES_R7D_7.json',
 diagnosticRegression:'phase35/regression/diagnostic/RUN_REPORT.json',generatedRegression:'phase35/regression/generated/RUN_REPORT.json',differential:'phase35/evidence/DIFFERENTIAL_VS_46934A0.json',differentialVs8e78b8a:'phase35/evidence/DIFFERENTIAL_VS_8E78B8A.json',fidelity:'phase35/evidence/FIDELITY_PHASE35.json'};
const O={};for(const [k,p] of Object.entries(outputs)){const f=path.join(AUD,p);need(fs.existsSync(f),'missing '+p);if(fs.existsSync(f))O[k]={path:rel(f),sha256:sha(f),json:read(f)};}
const sameSrc=files=>!!files&&Object.keys(src).every(p=>files[p]===src[p]);
const mu=O.mutation?.json,va=O.validation?.json,dg=O.diagnosticRegression?.json,gr=O.generatedRegression?.json,df=O.differential?.json,fi=O.fidelity?.json;
need(mu?.source?.sha256===src['CoachingCore/src/r6-adaptation.mjs']&&mu?.summary?.survived?.length===0&&mu?.scratchRestored===true&&mu?.baseline?.fail===0,'mutation: every mutant killed on these bytes');
need(sameSrc(va?.runs?.[0]?.runtime?.source?.files)&&va?.summary?.noFalseBlock==='PASS'&&va?.summary?.coverage==='COVERED'&&va?.summary?.notFired?.length===0&&va?.summary?.sensitivity?.every(r=>r.result==='DETECTED_AND_CLEAN_ON_CANDIDATE'),'harness validation 7 on these bytes: no false block, coverage, every witness, every sensitivity row');
need(va?.devCorpusSha256&&O.devCases,'the development corpus of validation 7');
for(const [k,r] of [['diagnostic',dg],['generated',gr]])need(sameSrc(r?.runtimeSource?.files)&&r?.harness==='R7D-HARNESS-7'&&Object.values(r?.summary?.properties??{}).every(p=>p.violations===0)&&r?.summary?.harnessErrors===0,k+' regression on these bytes with no property violation');
need(sameSrc(df?.candidateSource)&&df?.unexplained?.length===0,'differential against 46934a0 on these bytes: nothing unexplained');
const d8=O.differentialVs8e78b8a?.json;
need(sameSrc(d8?.candidateSource)&&d8?.unexplained?.length===0&&(d8?.differingCases??[]).every(r=>(r.kinds??[]).includes('DUPLICATE')),'differential against 8e78b8a on these bytes: every difference explained by the DUPLICATE trigger');
need(sameSrc(fi?.runtimeSource)&&fi?.result==='PASS','fidelity of the pinned Phase 3.4 probes on these bytes');
// 5. Authorities the phase leaves untouched: the policy, catalog and records since R7D-FREEZE-4; the human queue since the Phase 3.4 append (235
// items, QUEUE_INTEGRATION_R7D_P34.json: this phase authorizes no append); product/ and canon/; the earlier freeze records.
const quiet=paths=>git(['diff','--quiet',f4.commit,'HEAD','--',...paths]).status===0;
const {r6Authority}=await import(pathToFileURL(path.join(CC,'src/r6-authority.mjs')).href),A=r6Authority();
const QUEUE='reviews/provisional-sports-science/2026-10-23/HUMAN_REVALIDATION_QUEUE.json',qi=read(path.join(AUD,'phase34/QUEUE_INTEGRATION_R7D_P34.json'));
const authority={policy:{path:'CoachingCore/r6/PROGRAM_POLICY_R6.json',sha256:sha(path.join(CC,'r6/PROGRAM_POLICY_R6.json')),canonicalHash:A.policyHash,boundariesEnabled:Object.keys(A.approved).length},
 catalog:{path:'CoachingCore/r7/b0/REPERTOIRE_CATALOG_B0.json',sha256:sha(path.join(CC,'r7/b0/REPERTOIRE_CATALOG_B0.json'))},
 r6Records:{path:RECORDS[0],sha256:sha(path.join(REPO,RECORDS[0]))},b0Records:{path:RECORDS[1],sha256:sha(path.join(REPO,RECORDS[1]))},
 humanQueue:{path:QUEUE,sha256:sha(path.join(REPO,QUEUE)),items:read(path.join(REPO,QUEUE)).items.length,integration:{path:'audits/domain-coaching-r7-d-2026-11-02/phase34/QUEUE_INTEGRATION_R7D_P34.json',queueSha256After:qi.queueSha256After}},
 productAndCanonUnchangedSinceFreeze4:quiet(['product','canon']),earlierFreezeRecordsUnchanged:git(['diff','--quiet','3edf3c5','HEAD','--','CoachingCore/r7/d/RUNTIME_FREEZE_R7D_1.json','CoachingCore/r7/d/RUNTIME_FREEZE_R7D_2.json','CoachingCore/r7/d/RUNTIME_FREEZE_R7D_3.json','CoachingCore/r7/d/RUNTIME_FREEZE_R7D_4.json','CoachingCore/r7/d/VERIFICATION_R7D_4.json']).status===0};
need(authority.policy.sha256==='a75be1aae3818616888e641c104407926d5f16f213a04137f5b21024ccafe100','policy bytes changed');
need(authority.policy.canonicalHash==='18ec48f34768a7eebb2aede618db65a77385efebbda0a38d6f03135e5cd96b4c'&&authority.policy.boundariesEnabled===10,'policy canonical hash or R6 boundaries');
need(authority.catalog.sha256==='ceee276a424ee7575b4477a2bc429de2e8cd854e3cb82ac767776492cdcb92f9','catalog bytes changed');
need(quiet(['audits/domain-coaching-r7-b0-2026-10-31/reviews','audits/domain-coaching-r6-2026-10-26/reviews','CoachingCore/r6','CoachingCore/r5','CoachingCore/r7/b0','CoachingCore/r7/b/fixtures']),'an input changed since R7D-FREEZE-4 (policy, catalog, records, fixtures)');
need(authority.humanQueue.items===235&&authority.humanQueue.sha256===qi.queueSha256After,'the human revalidation queue changed since the Phase 3.4 append');
need(authority.productAndCanonUnchangedSinceFreeze4,'product/ or canon/ changed since R7D-FREEZE-4');
need(authority.earlierFreezeRecordsUnchanged,'an earlier R7-D freeze record changed');
need(!fs.existsSync(path.join(AUD,'final')),'no final holdout folder exists');
const report={evidence:'R7D-PHASE35-EVIDENCE-1',created:new Date().toISOString(),commit:git(['rev-parse','HEAD']).stdout.trim(),runtimeSource:src,changedFromFreeze4:changedSource,changedFrom46934a0:changedSince46,suite,directed,conformance,red,
 outputs:Object.fromEntries(Object.entries(O).map(([k,o])=>[k,{path:o.path,sha256:o.sha256}])),
 results:{mutation:mu?.summary??null,validation:va?.summary?{noFalseBlock:va.summary.noFalseBlock,coverage:va.summary.coverage,p17Units:va.summary.p17Units,p18Units:va.summary.p18Units,witnesses:`${va.summary.witnessesFired}/${va.summary.witnesses}`,sensitivity:`${va.summary.sensitivity.filter(r=>r.result==='DETECTED_AND_CLEAN_ON_CANDIDATE').length}/${va.summary.sensitivity.length}`,notEvaluableOnCandidate:va.summary.notEvaluableOnCandidate}:null,
  regressions:{diagnostic:dg?{cases:dg.corpus.cases,corpusErrors:dg.summary.corpusErrors}:null,generated:gr?{cases:gr.corpus.cases,corpusErrors:gr.summary.corpusErrors}:null},differential:df?{cases:df.cases,same:df.same,differing:df.differing,unexplained:df.unexplained,byTrigger:df.byTrigger}:null,differentialVs8e78b8a:d8?{cases:d8.cases,same:d8.same,differing:d8.differing,unexplained:d8.unexplained,byTrigger:d8.byTrigger}:null,fidelity:fi?{result:fi.result,probes:Object.fromEntries(Object.entries(fi.probes).map(([k,v])=>[k,{cases:v.cases,expectedClosure:v.expectedClosure,instrumentOnly:v.instrumentOnly}]))}:null},
 authority,finalHoldoutExists:fs.existsSync(path.join(AUD,'final')),problems,result:problems.length?'FAIL':'PASS'};
fs.writeFileSync(out,JSON.stringify(report,null,1)+'\n');
console.log(JSON.stringify({result:report.result,problems,suite,directed:Object.fromEntries(Object.entries(directed).map(([k,v])=>[k,`${v.pass}/${v.tests}`])),red:red.on46934a0},null,1));
process.exitCode=problems.length?1:0;
