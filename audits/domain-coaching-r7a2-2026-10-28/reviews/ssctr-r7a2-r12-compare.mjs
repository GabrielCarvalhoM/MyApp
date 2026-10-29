// SSCTR R7A2-SSCTR-r1: compares my round-12 instrument output on R7A2-FREEZE-1 (runs/r12-instrument.data.json) with my own R7A1-FREEZE-A2
// output (audits/domain-coaching-r7a1-2026-10-27/reviews/ssctr-r7a1-recheck-instrument.A2.out.json), section by section, with folder paths
// normalized. Prints only.
import fs from 'node:fs';
import path from 'node:path';
const here=import.meta.dirname,root=path.resolve(here,'../../..');
const norm=s=>s.replace(/audits[\\/]+domain-coaching-r7a[12]?-?[^"\\/]*[\\/]+(reviews|probes)[\\/]+/g,'<folder>/').replace(/ssctr-r7a[12]-(recheck-)?instrument[^"]*?\.json|r12-instrument\.data\.json|runs\/r12-instrument\.data\.json/g,'<out>').replace(/ssctr-r7a2-r12-instrument\.mjs|ssctr-r7a1-instrument\.mjs/g,'<instrument>');
const a=JSON.parse(fs.readFileSync(path.join(root,'audits/domain-coaching-r7a1-2026-10-27/reviews/ssctr-r7a1-recheck-instrument.A2.out.json'),'utf8'));
const b=JSON.parse(fs.readFileSync(path.join(here,'runs/r12-instrument.data.json'),'utf8'));
const keys=[...new Set([...Object.keys(a),...Object.keys(b)])];
const out={probe:'R7A2-SSCTR-r1-R12-COMPARE',sections:keys.length,equal:[],different:[]};
for(const k of keys){const x=norm(JSON.stringify(a[k]??null)),y=norm(JSON.stringify(b[k]??null));if(x===y)out.equal.push(k);else{let i=0;while(i<x.length&&x[i]===y[i])i++;out.different.push({section:k,firstDiffAt:i,a2:x.slice(Math.max(0,i-120),i+200),f1:y.slice(Math.max(0,i-120),i+200)});}}
console.log(JSON.stringify(out,null,1));
