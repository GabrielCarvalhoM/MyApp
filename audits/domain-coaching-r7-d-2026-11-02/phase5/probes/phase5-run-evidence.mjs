// R7-D Phase 5 evidence runner: the evidence manifest the freeze binds (phase5/evidence/EVIDENCE_PHASE5.json, never overwritten). It runs, on the
// working-tree candidate: the whole suite; the Phase 5 directed tests T42-T47 and the in-suite T39-T41; the RED run of T42-T47 on R7D-FREEZE-5 (exactly
// the four finding tests T42-T45 fail, the controls T46-T47 pass); the three R7-B conformance checks (read-only); and the differential, witness-grid
// and K03 probes, each into a new file under phase5/evidence/. It binds the mutation evidence and the harness validation 9 already written. Nothing
// is written under CoachingCore/ or final/.
//   node phase5-run-evidence.mjs --f5 <R7D-FREEZE-5 root> --mutation <phase5/evidence/MUTATION_PHASE5.json> --validation <harness/validation/HARNESS_VALIDATION_R7D_9.json>
import fs from 'node:fs';import path from 'node:path';import {spawnSync} from 'node:child_process';import {createHash} from 'node:crypto';import {pathToFileURL} from 'node:url';
const arg=k=>{const i=process.argv.indexOf(k);return i>=0?process.argv[i+1]:null;};
const HERE=import.meta.dirname,AUD=path.resolve(HERE,'../..'),REPO=path.resolve(AUD,'../..'),CC=path.join(REPO,'CoachingCore'),EV=path.join(AUD,'phase5/evidence');
const f5=arg('--f5'),mutation=arg('--mutation'),validation=arg('--validation');if(!f5||!mutation||!validation)throw Error('--f5 --mutation --validation');
const target=path.join(EV,'EVIDENCE_PHASE5.json');if(fs.existsSync(target))throw Error('exists: '+target);fs.mkdirSync(EV,{recursive:true});
const rel=p=>path.relative(REPO,path.resolve(p)).split(path.sep).join('/'),sha=p=>createHash('sha256').update(fs.readFileSync(p)).digest('hex'),problems=[],need=(ok,msg)=>{if(!ok)problems.push(msg);};
const node=(args,{cwd=CC,env={}}={})=>{const r=spawnSync(process.execPath,args,{cwd,encoding:'utf8',maxBuffer:1<<28,timeout:1800000,env:{...process.env,...env}});return {status:r.status,out:(r.stdout??'')+(r.stderr??'')};};
const counts=o=>({tests:Number(o.match(/ℹ tests (\d+)/)?.[1]??NaN),pass:Number(o.match(/ℹ pass (\d+)/)?.[1]??NaN),fail:Number(o.match(/ℹ fail (\d+)/)?.[1]??NaN),failed:[...new Set([...o.matchAll(/^✖ (R7-D Phase \d T\d+)/gm)].map(m=>m[1]))].sort()});
const runtimeSource=Object.fromEntries(fs.readdirSync(path.join(CC,'src')).filter(f=>f.endsWith('.mjs')).sort().map(f=>['CoachingCore/src/'+f,sha(path.join(CC,'src',f))]));
const {r6Authority}=await import(pathToFileURL(path.join(CC,'src/r6-authority.mjs')).href),A=r6Authority();
const authority={policy:{path:'CoachingCore/r6/PROGRAM_POLICY_R6.json',sha256:sha(path.join(CC,'r6/PROGRAM_POLICY_R6.json')),canonicalHash:A.policyHash,approvedBoundaries:Object.keys(A.approved).length},catalog:{path:'CoachingCore/r7/b0/REPERTOIRE_CATALOG_B0.json',sha256:sha(path.join(CC,'r7/b0/REPERTOIRE_CATALOG_B0.json'))}};
// 1. Suite and directed tests on the candidate.
const suite={...counts(node(['--test']).out),node:process.version};need(suite.tests>0&&suite.fail===0&&suite.pass===suite.tests,'suite '+JSON.stringify(suite));
const p5=counts(node(['--test','test/r7d-phase5.test.mjs']).out),cq=counts(node(['--test','test/r7d-phase4-cq41.test.mjs']).out);
need(p5.tests===6&&p5.fail===0,'T42-T47 on the candidate '+JSON.stringify(p5));need(cq.tests===3&&cq.fail===0,'T39-T41 on the candidate '+JSON.stringify(cq));
// 2. RED on R7D-FREEZE-5: exactly the four finding tests fail.
const red=counts(node(['--test','test/r7d-phase5.test.mjs'],{env:{R7D_P5_ROOT:f5}}).out),RED_EXPECTED=['R7-D Phase 5 T42','R7-D Phase 5 T43','R7-D Phase 5 T44','R7-D Phase 5 T45'];
need(JSON.stringify(red.failed)===JSON.stringify(RED_EXPECTED)&&red.pass===2,'RED on R7D-FREEZE-5 '+JSON.stringify(red));
// 3. Conformance (read-only).
const conformance=Object.fromEntries(['conformance-r7b','conformance-r7b1','conformance-r7b2'].map(s=>{const r=node([`scripts/${s}.mjs`]);let j=null;try{j=JSON.parse(r.out);}catch{}need(j?.result==='PASS',s+' not PASS');return [s,j?.result??'NO_JSON'];}));
// 4. Probes into new files.
const probe=(script,name,extra=[])=>{const out=path.join(EV,name),r=node([path.join(HERE,script),...extra,'--out',out],{cwd:HERE});need(r.status===0&&fs.existsSync(out),script+' failed: '+r.out.slice(-400));return out;};
const differential=probe('phase5-differential.mjs','DIFFERENTIAL_PHASE5.json',['--base',f5]),grid=probe('phase5-witness-grid.mjs','WITNESS_GRID_PHASE5.json',['--f5',f5]),k03=probe('phase5-k03-units.mjs','K03_PHASE4_UNITS.json',['--f5',f5]);
const D=JSON.parse(fs.readFileSync(differential,'utf8')),G=JSON.parse(fs.readFileSync(grid,'utf8')),K=JSON.parse(fs.readFileSync(k03,'utf8')),M=JSON.parse(fs.readFileSync(mutation,'utf8')),V=JSON.parse(fs.readFileSync(validation,'utf8'));
need(D.result==='PASS'&&!D.unexplained.length,'differential not PASS');need(!G.summary.qre.candidate.p03Failing.length&&G.summary.wd49.controlBSame,'witness grid');need(K.result==='GAPS_REMOVED_ON_R7D_FREEZE_5','K03 units');
need(M.summary.phase5.survived.length===0&&!M.summary.phase5.notApplied.length&&M.summary.cq41.killedAsExpected===M.summary.cq41.mutants,'mutation '+JSON.stringify(M.summary));
const vs=V.summary;need(vs.noFalseBlock==='PASS'&&vs.instrumentFix==='FALSE_BLOCK_REMOVED'&&vs.instrumentFix9==='FALSE_BLOCKS_REMOVED'&&vs.reachability==='REACHED'&&vs.coverage==='COVERED'&&vs.sensitivity.every(x=>x.result==='DETECTED_AND_CLEAN_ON_CANDIDATE')&&vs.witnessesFired===vs.witnesses,'validation 9 '+JSON.stringify({noFalseBlock:vs.noFalseBlock,instrumentFix9:vs.instrumentFix9,reachability:vs.reachability,notFired:vs.notFired}));
const outputs=Object.fromEntries([['differential',differential],['witnessGrid',grid],['k03Units',k03],['mutation',mutation],['validation9',validation]].map(([k,p])=>[k,{path:rel(p),sha256:sha(p)}]));
const ev={evidence:'R7D-EVIDENCE-PHASE5',runtimeSource,authority,suite,directed:{phase5:p5,cq41InSuite:cq},red:{onRuntime:'R7D-FREEZE-5 (bytes of cc0b56f)',...red,expectedFailing:RED_EXPECTED},conformance,
 results:{differential:{cases:D.cases,same:D.same,differing:D.differing,byKind:Object.fromEntries(Object.entries(D.byKind).map(([k,v])=>[k,v.length])),unexplained:D.unexplained.length},witnessGrid:G.summary,k03:K.result,mutation:M.summary,validation9:{noFalseBlock:vs.noFalseBlock,instrumentFix:vs.instrumentFix,instrumentFix9:vs.instrumentFix9,reachability:vs.reachability,coverage:vs.coverage,carrierUnits:vs.carrierUnits,sensitivity:`${vs.sensitivity.filter(x=>x.result==='DETECTED_AND_CLEAN_ON_CANDIDATE').length}/${vs.sensitivity.length}`,witnesses:`${vs.witnessesFired}/${vs.witnesses}`,retired:vs.retired??[]}},
 outputs,problems,result:problems.length?'FAIL':'PASS',ran:new Date().toISOString(),node:process.version};
fs.writeFileSync(target,JSON.stringify(ev,null,1)+'\n',{flag:'wx'});
console.log(JSON.stringify({result:ev.result,problems,suite:`${suite.pass}/${suite.tests}`,directed:`${p5.pass}/${p5.tests} + ${cq.pass}/${cq.tests}`,red:red.failed,conformance,results:ev.results.differential,validation9:ev.results.validation9},null,1));
process.exitCode=problems.length?1:0;
