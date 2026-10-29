// Author record (Founder §3): the baseline this mission captured before any edit, on HISTORICAL-PROJECTION-FREEZE-1 (probes/baseline/), compared
// with the judges' own outputs on that freeze (the engineering judge's qe-r7asm-runs/, the SSCTR's ssctr-r7asm-runs/). Byte identity first; where
// the bytes differ, identity once the instrument's own wall clock (`at`) and runtime label are set aside. Also records the suite and the
// predecessor's read-only verification as captured. Writes probes/baseline/BASELINE_COMPARE.json only. Usage: node baseline-compare-r7asc.mjs
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
const repo=path.resolve(import.meta.dirname,'../../..'),B=path.join(import.meta.dirname,'baseline');
const QE=path.join(repo,'audits/domain-coaching-r7a-state-model-2026-10-28/reviews/qe-r7asm-runs'),SS=path.join(repo,'audits/domain-coaching-r7a-state-model-2026-10-28/reviews/ssctr-r7asm-runs');
const sha=p=>createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const strip=x=>Array.isArray(x)?x.map(strip):x&&typeof x==='object'?Object.fromEntries(Object.entries(x).filter(([k])=>!['at','runtime','root','generatedAt'].includes(k)).map(([k,v])=>[k,strip(v)])):x;
const FINDINGS={'qe-r7asm-Q3-known-row-setup':'QE-R7ASM-01','qe-r7asm-Q3b-known-row-conflict':'QE-R7ASM-01','qe-r7asm-Q12-robustness':'QE-R7ASM-01, QE-R7ASM-03','qe-r7asm-Q4-restart-view':'QE-R7ASM-02','qe-r7asm-Q4b-restart-rows':'QE-R7ASM-02','qe-r7asm-Q11c-reps-identical':'QE-R7ASM-03','qe-r7asm-Q2-correction':'QE-R7ASM-04','qe-r7asm-Q2b-correction-load':'QE-R7ASM-04',
 'ssctr-grid':'F1 (D53, D57)','ssctr-caps':'F1 (D53, D57)','ssctr-trace-b':'F1','ssctr-trace-b2':'F1','ssctr-reps':'F2','ssctr-tick':'F2','ssctr-trace-h25':'F3','ssctr-changes':'E6, return base, R42, NF-R7ASM-3'};
const rows=fs.readdirSync(B).filter(f=>f.endsWith('.out.json')&&/^(qe-r7asm|ssctr)-/.test(f)).sort().map(f=>{
 const name=f.replace(/\.out\.json$/,''),ref=name.startsWith('qe-r7asm-')?path.join(QE,name.replace(/^qe-r7asm-/,'')+'.out.json'):path.join(SS,name.replace(/^ssctr-/,'')+'.out.json');
 if(!fs.existsSync(ref))return {name,reference:null,reproduced:false};
 const bytes=sha(path.join(B,f))===sha(ref),stripped=bytes||JSON.stringify(strip(JSON.parse(fs.readFileSync(path.join(B,f),'utf8'))))===JSON.stringify(strip(JSON.parse(fs.readFileSync(ref,'utf8'))));
 return {name,finding:FINDINGS[name.replace(/\.shard\d$/,'')]??null,reference:path.relative(repo,ref).split(path.sep).join('/'),byteIdentical:bytes,identicalBesidesClockAndLabel:stripped,reproduced:stripped};});
const t=fs.readFileSync(path.join(B,'node-test.on-state-model-freeze.out.txt'),'utf8'),v=JSON.parse(fs.readFileSync(path.join(B,'verify-r7asm.read-only.out.json'),'utf8'));
const out={revision:'R7ASC-BASELINE-COMPARE-1',generatedAt:new Date().toISOString(),runtime:'HISTORICAL-PROJECTION-FREEZE-1 (0db72d0e…), before any edit of this mission',
 summary:{probes:rows.length,reproduced:rows.filter(r=>r.reproduced).length,byteIdentical:rows.filter(r=>r.byteIdentical).length,onlyClockOrLabel:rows.filter(r=>r.reproduced&&!r.byteIdentical).map(r=>r.name),notReproduced:rows.filter(r=>!r.reproduced).map(r=>r.name),
  tests:`${t.match(/ℹ pass (\d+)/)?.[1]}/${t.match(/ℹ tests (\d+)/)?.[1]} (fail ${t.match(/ℹ fail (\d+)/)?.[1]})`,verifyR7asmReadOnly:`${v.passing}/${v.total}`,verifyR7asmFailing:v.failing},
 allReproduced:rows.length>0&&rows.every(r=>r.reproduced),probes:rows};
fs.writeFileSync(path.join(B,'BASELINE_COMPARE.json'),JSON.stringify(out,null,1)+'\n');
console.log(JSON.stringify(out.summary,null,1));
