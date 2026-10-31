// R7-B.1 conformance delta check (read-only unless given --write, which writes only the report named by --out, default
// r7/b1/CONFORMANCE_R7B1_DELTA.report.json). Every entry of r7/b1/CONFORMANCE_R7B1_DELTA.json names a rule of the base matrix (or an R7-A invariant,
// kind R7A_INVARIANT), is IMPLEMENTED, names the blockers it closes, and every consumer (file#name) and test (file::title) it lists exists. The base
// matrix itself is checked by scripts/conformance-r7b.mjs.
import fs from 'node:fs';
const arg=(k,d)=>{const i=process.argv.indexOf(k);return i>=0&&process.argv[i+1]?process.argv[i+1]:d;};
const root=new URL('..',import.meta.url),read=p=>fs.readFileSync(new URL(p,root),'utf8');
const base=JSON.parse(read('r7/b/CONFORMANCE_R7B.json')),delta=JSON.parse(read('r7/b1/CONFORMANCE_R7B1_DELTA.json')),ids=new Set(base.entries.map(e=>e.id)),problems=[];
if(delta.catalogSha256!==base.catalogSha256)problems.push('catalog binding differs from the base matrix');
for(const e of delta.entries){
 if(!ids.has(e.id)&&e.kind!=='R7A_INVARIANT')problems.push('not a base rule: '+e.id);
 if(e.status!=='IMPLEMENTED')problems.push('status: '+e.id);
 if(!(e.closes??[]).length)problems.push('closes nothing: '+e.id);
 if(!(e.consumers??[]).length||!(e.tests??[]).length)problems.push('no consumer or test: '+e.id);
 for(const c of e.consumers??[]){const [file,name]=c.split('#');if(!fs.existsSync(new URL(file,root))||!read(file).includes(name))problems.push(`consumer not found: ${e.id} → ${c}`);}
 for(const t of e.tests??[]){const [file,title]=t.split('::');if(!fs.existsSync(new URL(file,root))||!read(file).includes(title))problems.push(`test not found: ${e.id} → ${t}`);}
}
const blockers=[...new Set(delta.entries.flatMap(e=>e.closes))].sort();
const report={check:'R7B1-CONFORMANCE-DELTA',revision:delta.revision,entries:delta.entries.length,blockers,problems,result:problems.length?'FAIL':'PASS'};
if(process.argv.includes('--write'))fs.writeFileSync(new URL(arg('--out','r7/b1/CONFORMANCE_R7B1_DELTA.report.json'),root),JSON.stringify(report,null,1)+'\n');
console.log(JSON.stringify(report,null,1));
process.exitCode=problems.length?1:0;
