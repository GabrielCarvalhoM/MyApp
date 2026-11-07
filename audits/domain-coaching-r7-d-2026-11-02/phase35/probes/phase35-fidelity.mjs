// R7-D Phase 3.5 fidelity (SSCTR CFR2-03 and QRE CQ2-1: nothing else changes): every probe whose 46934a0 output the Phase 3.4 rechecks pinned
// (`phase34/reviews/*/probes2/out/*`) is run on a scratch root holding the candidate, and each case is compared with its pinned output. A case may
// differ only when it is one of the closure cases the SSCTR and QRE records name (the stated expectations), or, for the harness probe, only in the
// harness's own result fields under R7D-HARNESS-7 (R7D-PREREG-6 Δ27: P18 units and the QH4 false block). Anything else is UNEXPECTED and fails.
//   node phase35-fidelity.mjs --root <scratch root holding CoachingCore and this audit folder> --label <name> --out <file> --outdir <dir>
// Read-only on the repository: it writes only --out and the probe outputs under --outdir.
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
const arg=k=>{const i=process.argv.indexOf(k);return i>=0?process.argv[i+1]:null;};
const root=arg('--root'),label=arg('--label')??'candidate',out=arg('--out'),outdir=arg('--outdir');if(!root||!out||!outdir)throw Error('--root <dir> --label <name> --out <file> --outdir <dir>');
const AUD=path.resolve(import.meta.dirname,'../..'),REPO=path.resolve(AUD,'../..'),P34='audits/domain-coaching-r7-d-2026-11-02/phase34';
if(path.resolve(root).startsWith(REPO))throw Error('--root must be a scratch copy outside the repository');
const S2=`${P34}/reviews/ssctr/probes2/out`,E2=`${P34}/reviews/engineering/probes2/out`;
// The closure cases, as the records state them (SSCTR-R7D-P34-RECHECK-r2 F01/F02 closures; QRE-R7D-PHASE34-CHECK-r2 QRE2-P34-01 requiredFix).
const CU=['SY1_strengthAndShakeoutAdverse_systemic','LC1_lengthOnlySentMonWk7','LC1d_sameWithItsDatesStated','CU1_correctionUncoversMondayUnreported','CU3_correctionUncoversSundayUnreported','CU2_correctionMovesAWeekIn','CU2a_answeredAskedOnly_V1','CU2a_answeredAskedOnly_all'];
const R0=['R04_answer_declaration','R04_answer_weeklyReview','R04_answer_returnReport','R07_late_lift_answer_holidayDeclaration','R07_late_lift_answer_holidayInWeeklyReview','R07_late_lift_answer_holidayReturnReport','R07_late_lift_answer_holidayThenTrip','R04_escape_holidayRestatedUnchanged'];
const probes=[
 {id:'p34-recheck',script:`${P34}/reviews/ssctr/probes/p34-recheck.mjs`,pinned:`${S2}/p34-recheck.CANDIDATE-46934a0.json`,expected:[]},
 {id:'p34-recheck-detectors',script:`${P34}/reviews/ssctr/probes/p34-recheck-detectors.mjs`,pinned:`${S2}/p34-recheck-detectors.CANDIDATE-46934a0.json`,expected:[]},
 {id:'p34-ssctr',script:`${P34}/policy/ssctr-probes/p34-ssctr.mjs`,pinned:`${S2}/p34-ssctr.CANDIDATE-46934a0.json`,expected:[]},
 {id:'p34-ceiling',script:`${P34}/policy/ssctr-probes/p34-ceiling.mjs`,pinned:`${S2}/p34-ceiling.CANDIDATE-46934a0.json`,expected:[]},
 {id:'p34-recheck2',script:`${P34}/reviews/ssctr/probes2/p34-recheck2.mjs`,pinned:`${S2}/p34-recheck2.CANDIDATE-46934a0.json`,expected:CU},
 {id:'p34-recheck2-detectors',script:`${P34}/reviews/ssctr/probes2/p34-recheck2-detectors.mjs`,pinned:`${S2}/p34-recheck2-detectors.CANDIDATE-46934a0.json`,expected:['SY1_strengthAndShakeoutAdverse_systemic','CU3_correctionUncoversSundayUnreported']},
 {id:'qre2-p34-runtime',script:`${P34}/reviews/engineering/probes2/qre2-p34-runtime.mjs`,pinned:`${E2}/qre2-p34-runtime.candidate.json`,expected:R0},
 {id:'qre2-p34-harness',script:`${P34}/reviews/engineering/probes2/qre2-p34-harness.mjs`,pinned:`${E2}/qre2-p34-harness.candidate.json`,expected:[],harness:true,instrumentFields:['results','fails','P18']}];
fs.mkdirSync(outdir,{recursive:true});
const report={probe:'R7D-PHASE35-FIDELITY-1',label,runtimeSource:Object.fromEntries(fs.readdirSync(path.join(root,'CoachingCore/src')).filter(f=>f.endsWith('.mjs')).sort().map(f=>['CoachingCore/src/'+f,createHash('sha256').update(fs.readFileSync(path.join(root,'CoachingCore/src',f))).digest('hex')])),baseline:'the pinned 46934a0 outputs of the Phase 3.4 rechecks',probes:{},unexpected:[]};
for(const p of probes){
 const args=p.harness?[path.join(root,p.script),path.join(root,'audits/domain-coaching-r7-d-2026-11-02/harness'),root,'--label',label]:[path.join(root,p.script),root,'--label',label];
 const r=spawnSync(process.execPath,args,{cwd:root,encoding:'utf8',maxBuffer:1<<28,timeout:1800000});
 let got;try{got=JSON.parse(r.stdout);}catch{report.probes[p.id]={error:(r.stderr||'').split('\n').slice(0,6).join(' | ')};report.unexpected.push(p.id+': no output');continue;}
 fs.writeFileSync(path.join(outdir,`${p.id}.${label}.json`),JSON.stringify(got,null,1)+'\n');
 const pin=JSON.parse(fs.readFileSync(path.join(REPO,p.pinned),'utf8')),keys=[...new Set([...Object.keys(pin.cases??{}),...Object.keys(got.cases??{})])];
 const changed=keys.filter(k=>JSON.stringify(pin.cases?.[k])!==JSON.stringify(got.cases?.[k]));
 const fieldsOf=k=>Object.keys({...(pin.cases?.[k]??{}),...(got.cases?.[k]??{})}).filter(f=>JSON.stringify(pin.cases?.[k]?.[f])!==JSON.stringify(got.cases?.[k]?.[f]));
 const instrumentOnly=k=>!!p.instrumentFields&&fieldsOf(k).every(f=>p.instrumentFields.includes(f));
 const bad=changed.filter(k=>!p.expected.includes(k)&&!instrumentOnly(k));
 report.probes[p.id]={cases:keys.length,changed,expectedClosure:changed.filter(k=>p.expected.includes(k)),instrumentOnly:changed.filter(k=>!p.expected.includes(k)&&instrumentOnly(k)).map(k=>({caseId:k,fields:fieldsOf(k)})),missingExpected:p.expected.filter(k=>!changed.includes(k)),unexpected:bad};
 report.unexpected.push(...bad.map(k=>`${p.id}: ${k}`),...p.expected.filter(k=>!changed.includes(k)).map(k=>`${p.id}: ${k} did not change`));
}
report.result=report.unexpected.length?'FAIL':'PASS';
fs.writeFileSync(out,JSON.stringify(report,null,1)+'\n');
console.log(JSON.stringify({result:report.result,unexpected:report.unexpected,probes:Object.fromEntries(Object.entries(report.probes).map(([k,v])=>[k,{cases:v.cases,changed:v.changed?.length,instrumentOnly:v.instrumentOnly?.length}]))}));
process.exitCode=report.unexpected.length?1:0;
