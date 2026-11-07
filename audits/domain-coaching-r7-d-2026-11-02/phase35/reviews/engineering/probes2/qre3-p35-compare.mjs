// QRE R7-D Phase 3.5 recheck (QRE-R7D-PHASE35-CHECK-r2, Q1): case-by-case comparison of runtime probe outputs (qre2-p35-runtime.mjs, or any
// probe whose output is {cases:{id:...}}), ignoring only the `root` and `label` fields. Lists the cases that differ, are missing, or are equal.
//   node qre3-p35-compare.mjs --a <file> --b <file> [--name <label>] [--show id,id] [--out <file>]
import fs from 'node:fs';
const arg=k=>{const i=process.argv.indexOf(k);return i>=0?process.argv[i+1]:null;};
const A=JSON.parse(fs.readFileSync(arg('--a'),'utf8')),B=JSON.parse(fs.readFileSync(arg('--b'),'utf8')),name=arg('--name')??'compare',outFile=arg('--out');
const show=(arg('--show')??'').split(',').filter(Boolean);
const canon=v=>JSON.stringify(v,(k,x)=>x&&typeof x==='object'&&!Array.isArray(x)?Object.fromEntries(Object.keys(x).sort().map(y=>[y,x[y]])):x);
const ids=[...new Set([...Object.keys(A.cases),...Object.keys(B.cases)])];
const rows=ids.map(id=>({id,inA:id in A.cases,inB:id in B.cases,same:id in A.cases&&id in B.cases&&canon(A.cases[id])===canon(B.cases[id])}));
// For a differing case, the top-level keys whose values differ (one level down for nested objects such as unnamed/named/later).
const where=id=>{const a=A.cases[id]??{},b=B.cases[id]??{},out=[];
 for(const k of new Set([...Object.keys(a),...Object.keys(b)])){if(canon(a[k])===canon(b[k]))continue;
  if(a[k]&&b[k]&&typeof a[k]==='object'&&!Array.isArray(a[k])){for(const j of new Set([...Object.keys(a[k]),...Object.keys(b[k])]))if(canon(a[k][j])!==canon(b[k][j]))out.push(k+'.'+j);}
  else out.push(k);}
 return out;};
const report={probe:'QRE3-P35-COMPARE-1',name,a:{file:arg('--a'),label:A.label,probe:A.probe},b:{file:arg('--b'),label:B.label,probe:B.probe},
 cases:ids.length,same:rows.filter(r=>r.same).length,differing:rows.filter(r=>r.inA&&r.inB&&!r.same).map(r=>({id:r.id,where:where(r.id)})),
 onlyInA:rows.filter(r=>!r.inB).map(r=>r.id),onlyInB:rows.filter(r=>!r.inA).map(r=>r.id),
 shown:Object.fromEntries(show.map(id=>[id,{a:A.cases[id]??null,b:B.cases[id]??null}]))};
const text=JSON.stringify(report,null,1);
if(outFile)fs.writeFileSync(outFile,text+'\n');
console.log(JSON.stringify({name,cases:report.cases,same:report.same,differing:report.differing.map(d=>d.id+' ['+d.where.join(',')+']'),onlyInA:report.onlyInA,onlyInB:report.onlyInB}));
