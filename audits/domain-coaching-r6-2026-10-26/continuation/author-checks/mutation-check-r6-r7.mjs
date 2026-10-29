import fs from 'node:fs';import {execFileSync} from 'node:child_process';
const muts=[
 ['src/r6-adaptation.mjs',"CLINICAL_KEYS.some(k=>isYes(el[k]))","CLINICAL_KEYS.some(k=>el[k]===true)",'R6 review'],
 ['src/r6-intake.mjs',"CLINICAL_KEYS.some(k=>isYes(e[k]))","CLINICAL_KEYS.some(k=>e[k]===true)",'R6 intake'],
 ['src/r6-legacy.mjs',"some(k=>isYes(el0[k])))v={...v,clinical:true};","some(k=>false))v={...v,clinical:true};",'R6 legacy gen'],
 ['src/r6-legacy.mjs',"'clinicalConcern'].some(k=>isYes(el?.[k]));","'clinicalConcern'].some(k=>el?.[k]===true);",'R6 legacy rev'],
 ['src/r6-clinical.mjs',"(at.every(i=>damageNegated(t,i))?negated:clinical)","(clinical)",'R7 negation'],
 ['src/r6-clinical.mjs'," baby bebe crash crashed collision bite slipped escorreguei escorregou resbale resbalo\n","\n",'R7 ambiguous'],
];
for(const [f,a,b,label] of muts){
 const orig=fs.readFileSync(f,'utf8');if(orig.split(a).length!==2){console.log(label,'PATTERN NOT UNIQUE');continue;}
 fs.writeFileSync(f,orig.replace(a,b));
 let out='';try{out=execFileSync(process.execPath,['--test','test/r6-ssctr-r7-fixes.test.mjs'],{encoding:'utf8'});}catch(e){out=e.stdout;}
 fs.writeFileSync(f,orig);
 const fails=[...new Set((out.match(/^✖ .*$/mg)??[]).map(l=>l.slice(2,50)))];
 console.log(label.padEnd(14),fails.join(' | ')||'NO FAILURE');
}
