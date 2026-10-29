// Author's mutation check for the round-11 fix (D53). Each mutation removes one part of the fix, runs the round-11 to round-7
// regression tests and the engineering-fix tests, then restores the source byte for byte (sha256 checked before and after).
// Run from CoachingCore/ only while no judge or probe is reading the runtime, and never after FREEZE-2:
// node ../audits/domain-coaching-r6-2026-10-26/continuation/author-checks/mutation-check-r11.mjs
import fs from 'node:fs';import {execFileSync} from 'node:child_process';import {createHash} from 'node:crypto';
const sha=f=>createHash('sha256').update(fs.readFileSync(f)).digest('hex');
const SRC=fs.readdirSync('src').filter(f=>f.startsWith('r6-')).map(f=>'src/'+f),before=Object.fromEntries(SRC.map(f=>[f,sha(f)]));
const muts=[
 ['src/r6-program.mjs',[["if(Number.isInteger(u.sets))ex.regainCap=u.sets;}","}"]],'D53 cap not set'],
 ['src/r6-program.mjs',[["Number.isInteger(ex?.regainCap)?ex.regainCap:Infinity","Infinity"]],'D53 cap ignored'],
 ['src/r6-program.mjs',[["if(executed&&unreduced)ex.regainCap++;","if(executed)ex.regainCap++;"]],'D53 reduced weeks'],
 ['src/r6-program.mjs',[["ex.regainCap>=Math.max(g.maxSets,Number.isInteger(ex.priorSets)?ex.priorSets:0,Number.isInteger(ex.sets)?ex.sets:0)","ex.regainCap>=(Number.isInteger(ex.sets)?ex.sets:0)"]],'D53 ends early'],
 ['src/r6-program.mjs',[["delete n.returnLogged;delete n.regainCap;","delete n.returnLogged;"]],'D53 return keeps'],
];
const tests=['test/r6-ssctr-r11-fixes.test.mjs','test/r6-ssctr-r10-fixes.test.mjs','test/r6-ssctr-r9-fixes.test.mjs','test/r6-ssctr-r8-fixes.test.mjs','test/r6-ssctr-r7-fixes.test.mjs','test/r6-engineering-fixes.test.mjs'];
let caught=0;
for(const [f,pairs,label] of muts){
 const orig=fs.readFileSync(f,'utf8');if(pairs.some(([a])=>orig.split(a).length!==2)){console.log(label.padEnd(20),'PATTERN NOT UNIQUE');continue;}
 let text=orig;for(const [a,b] of pairs)text=text.replace(a,()=>b);fs.writeFileSync(f,text);
 let out='';try{out=execFileSync(process.execPath,['--test',...tests],{encoding:'utf8'});}catch(e){out=e.stdout;}
 fs.writeFileSync(f,orig);if(sha(f)!==before[f])throw new Error(label+': '+f+' not restored byte for byte');
 const failed=(out.match(/^✖ .*$/mg)??[]).filter(l=>!l.includes('failing tests')).map(l=>l.slice(2,90));
 if(failed.length)caught++;
 console.log(label.padEnd(20),failed.join(' | ')||'NO FAILURE (test does not catch it)');
}
const after=Object.fromEntries(SRC.map(f=>[f,sha(f)])),restored=SRC.every(f=>after[f]===before[f]);
console.log(JSON.stringify({mutations:muts.length,caught,sourcesRestoredByteIdentical:restored}));
if(!restored)process.exitCode=1;
