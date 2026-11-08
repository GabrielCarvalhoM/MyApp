// R7-D Phase 5, K03 shown on the three units the Phase 4 quality judgment ruled HARNESS_GAP (QRE-P4-H01 F07 P06, QRE-P4-H02 F21 P03, QRE-P4-H03 F12
// CARRIER_CLINICAL): the same runtime runs read by R7D-HARNESS-8 and by R7D-HARNESS-9, on R7D-FREEZE-5 (the evaluated runtime) and on the candidate.
// A development reading only: no --first-evaluation, nothing written under final/, the Phase 4 results and judgments unchanged (PREREG-1 §9; the
// Founder's K03 decision: prospective correction, the earlier holdout's results, evaluation and criteria untouched). Writes one JSON (--out).
//   node phase5-k03-units.mjs --f5 <R7D-FREEZE-5 root> --out <file>
import fs from 'node:fs';import path from 'node:path';import {pathToFileURL} from 'node:url';import {createHash} from 'node:crypto';
const arg=k=>{const i=process.argv.indexOf(k);return i>=0?process.argv[i+1]:null;};
const AUD=path.resolve(import.meta.dirname,'../..'),REPO=path.resolve(AUD,'../..'),f5=arg('--f5'),outFile=arg('--out');
if(!f5||!outFile)throw Error('--f5 <root> --out <file>');if(fs.existsSync(outFile))throw Error('--out exists');
const imp=p=>import(pathToFileURL(path.join(AUD,'harness',p)).href);
const c8=await imp('lib/client.mjs'),c9=await imp('lib/client-9.mjs'),p8=await imp('lib/properties-8.mjs'),p9=await imp('lib/properties-9.mjs'),m8=await imp('lib/metamorphic.mjs'),m9=await imp('lib/metamorphic-9.mjs'),u=await imp('lib/util.mjs');
const corpusPath=path.join(AUD,'final/R7D_FINAL_HOLDOUT.json'),corpus=JSON.parse(fs.readFileSync(corpusPath,'utf8'));
const ctx={policy:JSON.parse(fs.readFileSync(path.join(REPO,'CoachingCore/r6/PROGRAM_POLICY_R6.json'),'utf8')),catalog:JSON.parse(fs.readFileSync(path.join(REPO,'CoachingCore/r7/b0/REPERTOIRE_CATALOG_B0.json'),'utf8'))};
const UNITS=[['R7D-F07','P06','QRE-P4-H01'],['R7D-F21','P03','QRE-P4-H02'],['R7D-F12','CARRIER_CLINICAL','QRE-P4-H03']];
const rows=[];
for(const [label,root] of [['R7D-FREEZE-5',f5],['candidate',REPO]]){
 const rt=await c9.loadRuntime(path.join(root,'CoachingCore'));
 for(const [id,check,finding] of UNITS){
  const k=corpus.cases.find(c=>c.caseId===id),b8=c8.runCase(rt,k),b9=c9.runCase(rt,k),same=u.digestOf(b8.steps.map(s=>s.result))===u.digestOf(b9.steps.map(s=>s.result));
  const read=(b,P,M)=>{if(check.startsWith('CARRIER')){const r=M.runRelations(rt,k,b,ctx,{only:[check]})[check];return {result:(r?.violations??[]).length?'FAIL':r?.units?'PASS':'NOT_EVALUABLE',units:r?.units??0,violations:(r?.violations??[]).map(v=>({at:v.at,issue:v.issue}))};}
   const p=P.evaluateProperties(b,ctx)[check];return {result:p.result,units:p.units,violations:p.violations.map(v=>({at:v.at,issue:v.issue??v.role??null,week:v.week??null})),notEvaluable:p.notEvaluable.map(x=>({at:x.at,week:x.week??null,reason:x.reason}))};};
  rows.push({runtime:label,caseId:id,check,finding,sameRuntimeOutputs:same,harness8:read(b8,p8,m8),harness9:read(b9,p9,m9)});
 }
}
const ok=rows.filter(r=>r.runtime==='R7D-FREEZE-5').every(r=>r.sameRuntimeOutputs&&r.harness8.result==='FAIL'&&r.harness8.violations.length>0&&!r.harness9.violations.length);
const out={probe:'R7D-PHASE5-K03-UNITS-1',note:'Development reading of the three Phase 4 HARNESS_GAP units; the Phase 4 evaluation, its reports and its judgments are unchanged and are never re-graded by this reading.',corpus:{path:path.relative(REPO,corpusPath).split(path.sep).join('/'),sha256:createHash('sha256').update(fs.readFileSync(corpusPath)).digest('hex')},rows,result:ok?'GAPS_REMOVED_ON_R7D_FREEZE_5':'NOT_SHOWN',ran:new Date().toISOString()};
fs.writeFileSync(outFile,JSON.stringify(out,null,1)+'\n',{flag:'wx'});
console.log(JSON.stringify({result:out.result,rows:rows.map(r=>`${r.runtime}:${r.caseId}:${r.check}:${r.harness8.result}(${r.harness8.violations.length})->${r.harness9.result}(${r.harness9.violations.length}) same=${r.sameRuntimeOutputs}`)},null,1));
