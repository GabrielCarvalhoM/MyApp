// Author's mutation check for the round-9 fixes (D50, D51). Each mutation removes one part of a fix, runs the round-9, round-8 and
// round-7 regression tests, then restores the source byte for byte. Run from CoachingCore/ only while no judge or probe is reading
// the runtime, and never after FREEZE-2: node ../audits/domain-coaching-r6-2026-10-26/continuation/author-checks/mutation-check-r9.mjs
import fs from 'node:fs';import {execFileSync} from 'node:child_process';
const muts=[
 ['src/r6-program.mjs',"const held=P.longHeldByShare===true;","const held=false;",'D50 held step'],
 ['src/r6-program.mjs',"progression:{...long.progression,heldBy:'LONG_RUN_SHARE'},","",'D50 held marker'],
 ['src/r6-program.mjs',"   if(waitLong&&otherStep)st.long=longBefore;","",'D50 long waits'],
 ['src/r6-program.mjs',"if(finished&&!used.some(u=>Number.isInteger(ss.exercises[u.id]?.returnStep)))for(","if(false)for(",'D51 return end'],
];
for(const [f,a,b,label] of muts){
 const orig=fs.readFileSync(f,'utf8');if(orig.split(a).length!==2){console.log(label.padEnd(18),'PATTERN NOT UNIQUE');continue;}
 fs.writeFileSync(f,orig.replace(a,()=>b));
 let out='';try{out=execFileSync(process.execPath,['--test','test/r6-ssctr-r9-fixes.test.mjs','test/r6-ssctr-r8-fixes.test.mjs','test/r6-ssctr-r7-fixes.test.mjs'],{encoding:'utf8'});}catch(e){out=e.stdout;}
 fs.writeFileSync(f,orig);
 console.log(label.padEnd(18),(out.match(/^✖ .*$/mg)??[]).filter(l=>!l.includes('failing tests')).map(l=>l.slice(2,70)).join(' | ')||'NO FAILURE (test does not catch it)');
}
