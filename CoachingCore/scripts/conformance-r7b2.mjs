// R7-B.2 conformance delta check (read-only unless given --write, which writes only the report named by --out, default
// r7/b2/CONFORMANCE_R7B2_DELTA.report.json). The delta r7/b2/CONFORMANCE_R7B2_DELTA.json has exactly one entry (TASK_CONTRACT §7 G6): it names a
// rule of the base matrix (B0-C06 condition 8) and SSCTR D08, is IMPLEMENTED, names the blockers it closes, and every consumer (file#name) and test
// (file::title) it lists exists. The base matrix and the R7-B.1 delta are checked by scripts/conformance-r7b.mjs and scripts/conformance-r7b1.mjs.
import fs from 'node:fs';
const arg=(k,d)=>{const i=process.argv.indexOf(k);return i>=0&&process.argv[i+1]?process.argv[i+1]:d;};
const root=new URL('..',import.meta.url),read=p=>fs.readFileSync(new URL(p,root),'utf8');
const base=JSON.parse(read('r7/b/CONFORMANCE_R7B.json')),delta=JSON.parse(read('r7/b2/CONFORMANCE_R7B2_DELTA.json')),ids=new Set(base.entries.map(e=>e.id)),problems=[];
if(delta.catalogSha256!==base.catalogSha256)problems.push('catalog binding differs from the base matrix');
if(delta.entries.length!==1)problems.push('the R7-B.2 delta has one entry, found '+delta.entries.length);
for(const e of delta.entries){
 if(!ids.has(e.id))problems.push('not a base rule: '+e.id);
 if(e.id!=='SSCTR:B0-C06#c8'||!(e.ssctr??[]).some(x=>/D08/.test(x)))problems.push('the entry maps B0-C06 condition 8 and D08: '+e.id);
 if(e.status!=='IMPLEMENTED')problems.push('status: '+e.id);
 for(const b of ['QE-R7B1-04','R7B2-CAND-01','R7B2-CAND-02'])if(!(e.closes??[]).includes(b))problems.push(`closes: ${e.id} does not name ${b}`);
 if(!(e.consumers??[]).length||!(e.tests??[]).length)problems.push('no consumer or test: '+e.id);
 for(const c of e.consumers??[]){const i=c.indexOf('#'),file=c.slice(0,i),name=c.slice(i+1);if(!fs.existsSync(new URL(file,root))||!read(file).includes(name))problems.push(`consumer not found: ${e.id} → ${c}`);}
 for(const t of e.tests??[]){const [file,title]=t.split('::');if(!fs.existsSync(new URL(file,root))||!read(file).includes(title))problems.push(`test not found: ${e.id} → ${t}`);}
}
const blockers=[...new Set(delta.entries.flatMap(e=>e.closes))].sort();
const report={check:'R7B2-CONFORMANCE-DELTA',revision:delta.revision,entries:delta.entries.length,blockers,problems,result:problems.length?'FAIL':'PASS'};
if(process.argv.includes('--write'))fs.writeFileSync(new URL(arg('--out','r7/b2/CONFORMANCE_R7B2_DELTA.report.json'),root),JSON.stringify(report,null,1)+'\n');
console.log(JSON.stringify(report,null,1));
process.exitCode=problems.length?1:0;
