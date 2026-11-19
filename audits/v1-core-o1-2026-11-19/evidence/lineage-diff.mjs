// O-1 evidence: compares two lineage-dump.mjs outputs (base, candidate) row by row and prints each field that differs.
// Usage: node lineage-diff.mjs base.jsonl candidate.jsonl
import fs from 'node:fs';
const [a,b]=process.argv.slice(2).map(f=>fs.readFileSync(f,'utf8').trim().split('\n').map(l=>JSON.parse(l)));
if(a.length!==b.length)throw new Error('row counts differ');
let rows=0;
for(let i=0;i<a.length;i++){
 const x=a[i],y=b[i];if(x.family!==y.family||x.name!==y.name)throw new Error('row order differs at '+i);
 const diff=Object.keys(x).filter(k=>JSON.stringify(x[k])!==JSON.stringify(y[k]));
 if(diff.length){rows++;console.log(`${x.family} | ${x.name}`);for(const k of diff)console.log(`   ${k}: ${JSON.stringify(x[k])} -> ${JSON.stringify(y[k])}`);}
}
console.log(`${rows} of ${a.length} rows differ`);
