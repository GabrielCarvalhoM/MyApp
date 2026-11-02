// R7-D Phase 3 evidence manifest (consumed by CoachingCore/scripts/freeze-r7d.mjs). On the committed runtime bytes it runs the directed tests and
// the three R7-B conformance checks (read-only), reads the outputs the phase produced on the same bytes (mutation, harness validation, diagnostic
// and generated regressions, differential, F03-B athlete probe) and checks the authorities the phase must leave untouched (policy bytes and
// canonical hash with all ten R6 boundaries enabled, catalog and B0 records, human queue). It writes one JSON manifest; it never writes elsewhere.
//   node phase3-run-evidence.mjs --out <file>
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {pathToFileURL} from 'node:url';

const arg=k=>{const i=process.argv.indexOf(k);return i>=0?process.argv[i+1]:null;};
const out=arg('--out');if(!out)throw Error('--out <file>');
const AUD=path.resolve(import.meta.dirname,'../..'),REPO=path.resolve(AUD,'../..'),CC=path.join(REPO,'CoachingCore'),P3=path.join(AUD,'phase3');
const sha=p=>createHash('sha256').update(fs.readFileSync(p)).digest('hex'),rel=p=>path.relative(REPO,p).split(path.sep).join('/');
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const run=(args,cwd=CC)=>spawnSync(process.execPath,args,{cwd,encoding:'utf8',maxBuffer:1<<28,timeout:1800000});
const problems=[],need=(ok,msg)=>{if(!ok)problems.push(msg);};
// The runtime bytes the evidence is about.
const src=Object.fromEntries(fs.readdirSync(path.join(CC,'src')).filter(f=>f.endsWith('.mjs')).sort().map(f=>['CoachingCore/src/'+f,sha(path.join(CC,'src',f))]));
// 1. Directed tests.
const t=run(['--test','test/r7d-phase3.test.mjs']),num=k=>Number(t.stdout.match(new RegExp('ℹ '+k+' (\\d+)'))?.[1]??NaN);
const directed={file:'CoachingCore/test/r7d-phase3.test.mjs',sha256:sha(path.join(CC,'test/r7d-phase3.test.mjs')),tests:num('tests'),pass:num('pass'),fail:num('fail')};
need(directed.tests>0&&directed.fail===0&&directed.pass===directed.tests,'directed tests '+JSON.stringify(directed));
// 2. Conformance (R7-B, R7-B.1, R7-B.2), read-only.
const conformance=Object.fromEntries(['conformance-r7b','conformance-r7b1','conformance-r7b2'].map(s=>{const r=run([`scripts/${s}.mjs`]);let j=null;try{j=JSON.parse(r.stdout);}catch{}need(j?.result==='PASS',s+': '+(j?JSON.stringify(j.problems).slice(0,300):'no JSON'));return [s,{result:j?.result??null,sha256:createHash('sha256').update(r.stdout).digest('hex')}];}));
// 3. Outputs the phase produced on these bytes.
const outputs={
 mutation:'evidence/MUTATION_PHASE3.json',
 validation:'../harness/validation/HARNESS_VALIDATION_R7D_2.json',
 diagnosticRegression:'regression/diagnostic/RUN_REPORT.json',
 generatedRegression:'regression/generated/RUN_REPORT.json',
 differential:'evidence/DIFFERENTIAL_VS_R7C_FREEZE_4.json',
 f03bAthlete:'evidence/F03B_ATHLETE_PROBE.json'
};
const O={};for(const [k,p] of Object.entries(outputs)){const f=path.join(P3,p);need(fs.existsSync(f),'missing '+p);if(fs.existsSync(f))O[k]={path:rel(f),sha256:sha(f),json:read(f)};}
const mu=O.mutation?.json,va=O.validation?.json,dr=O.diagnosticRegression?.json,gr=O.generatedRegression?.json,df=O.differential?.json,ap=O.f03bAthlete?.json;
need(mu&&mu.summary.killed===mu.summary.mutants&&mu.mutants.every(m=>m.killed),'every mutant killed by its own witness');
need(mu&&Object.entries(mu.sources).every(([p,h])=>src[p]===h),'mutation ran on these source bytes');
need(va&&va.summary.noFalseBlock==='PASS'&&va.summary.p05Coverage==='COVERED'&&va.summary.sensitivity.every(s=>s.result==='DETECTED_AND_CLEAN_ON_CANDIDATE')&&va.summary.notFired.length===0,'harness validation');
for(const [k,r] of [['diagnosticRegression',dr],['generatedRegression',gr]]){
 need(r&&Object.entries(r.runtimeSource.files).filter(([p])=>p.startsWith('CoachingCore/src/')).every(([p,h])=>src[p]===h),k+' ran on these source bytes');
 need(r&&Object.values(r.summary.properties).every(p=>p.violations===0)&&r.summary.harnessErrors===0,k+': a property violation or a harness error');
}
// VARIANT is the author's oracle (domain-judged); its four failures are the ones the Phase 2 triage classified (D02, D06, D16 premise; D14 F11).
const variant=dr?.summary.relations.VARIANT;need(variant&&variant.failingCases.every(c=>['R7D-D02','R7D-D06','R7D-D14','R7D-D16'].includes(c)),'diagnostic VARIANT failures outside the triaged set');
need(dr&&Object.entries(dr.summary.relations).filter(([k])=>k!=='VARIANT').every(([,v])=>v.violations===0),'diagnostic regression: a metamorphic violation');
need(df&&df.unexplained.length===0,'differential: an unexplained difference');
need(ap&&ap.runs.every(r=>!r.violations.length&&r.monotoneSettings),'F03-B athlete probe');
// 4. Authorities the phase leaves untouched.
const {r6Authority}=await import(pathToFileURL(path.join(CC,'src/r6-authority.mjs')).href),A=r6Authority();
const authority={policy:{path:'CoachingCore/r6/PROGRAM_POLICY_R6.json',sha256:sha(path.join(CC,'r6/PROGRAM_POLICY_R6.json')),canonicalHash:A.policyHash,boundariesEnabled:Object.keys(A.approved).length},
 catalog:{path:'CoachingCore/r7/b0/REPERTOIRE_CATALOG_B0.json',sha256:sha(path.join(CC,'r7/b0/REPERTOIRE_CATALOG_B0.json'))},
 r6Records:{path:'audits/domain-coaching-r6-2026-10-26/reviews/ssctr-policy-review.json',sha256:sha(path.join(REPO,'audits/domain-coaching-r6-2026-10-26/reviews/ssctr-policy-review.json'))},
 b0Records:{path:'audits/domain-coaching-r7-b0-2026-10-31/reviews/SSCTR_RECHECK_B0.json',sha256:sha(path.join(REPO,'audits/domain-coaching-r7-b0-2026-10-31/reviews/SSCTR_RECHECK_B0.json'))},
 humanQueue:{path:'reviews/provisional-sports-science/2026-10-23/HUMAN_REVALIDATION_QUEUE.json',sha256:sha(path.join(REPO,'reviews/provisional-sports-science/2026-10-23/HUMAN_REVALIDATION_QUEUE.json'))}};
need(authority.policy.sha256==='a75be1aae3818616888e641c104407926d5f16f213a04137f5b21024ccafe100','policy bytes changed');
need(authority.policy.canonicalHash==='18ec48f34768a7eebb2aede618db65a77385efebbda0a38d6f03135e5cd96b4c'&&authority.policy.boundariesEnabled===10,'policy canonical hash or R6 boundaries');
need(authority.catalog.sha256==='ceee276a424ee7575b4477a2bc429de2e8cd854e3cb82ac767776492cdcb92f9','catalog bytes changed');
const report={evidence:'R7D-PHASE3-EVIDENCE-1',created:new Date().toISOString(),node:process.version,runtimeSource:src,directed,conformance,
 outputs:Object.fromEntries(Object.entries(O).map(([k,v])=>[k,{path:v.path,sha256:v.sha256}])),
 results:{mutation:mu?.summary??null,validation:va?.summary??null,diagnosticRegression:dr?{properties:Object.fromEntries(Object.entries(dr.summary.properties).map(([k,p])=>[k,{result:p.result,units:p.units,violations:p.violations}])),relations:Object.fromEntries(Object.entries(dr.summary.relations).map(([k,v])=>[k,{units:v.units,violations:v.violations,failingCases:v.failingCases}])),corpusErrors:dr.summary.corpusErrors}:null,
  generatedRegression:gr?{properties:Object.fromEntries(Object.entries(gr.summary.properties).map(([k,p])=>[k,{result:p.result,units:p.units,violations:p.violations}]))}:null,
  differential:df?{cases:df.cases,same:df.same,differing:df.differing,unexplained:df.unexplained,byTrigger:df.byTrigger}:null,
  f03bAthlete:ap?ap.runs.map(r=>({goal:r.goal,athlete:r.athlete,computedMachineValues:r.violations.length,monotoneSettings:r.monotoneSettings,questionWeeks:r.questionWeeks,finalSettings:r.finalSettings})):null},
 authority,problems,result:problems.length?'FAIL':'PASS'};
fs.writeFileSync(out,JSON.stringify(report,null,1)+'\n');
console.log(JSON.stringify({result:report.result,problems,directed,conformance:Object.fromEntries(Object.entries(conformance).map(([k,v])=>[k,v.result])),authority:{policyCanonical:A.policyHash.slice(0,12),boundaries:authority.policy.boundariesEnabled}},null,1));
process.exitCode=problems.length?1:0;
