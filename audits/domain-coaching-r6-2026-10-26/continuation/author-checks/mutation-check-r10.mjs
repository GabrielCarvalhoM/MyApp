// Author's mutation check for the round-10 fix (D52). Each mutation removes one part of the fix, runs the round-10, round-9, round-8
// and round-7 regression tests and the engineering-fix tests, then restores the source byte for byte (sha256 checked before and after).
// Run from CoachingCore/ only while no judge or probe is reading the runtime, and never after FREEZE-2:
// node ../audits/domain-coaching-r6-2026-10-26/continuation/author-checks/mutation-check-r10.mjs
import fs from 'node:fs';import {execFileSync} from 'node:child_process';import {createHash} from 'node:crypto';
const sha=f=>createHash('sha256').update(fs.readFileSync(f)).digest('hex');
const SRC=fs.readdirSync('src').filter(f=>f.startsWith('r6-')).map(f=>'src/'+f),before=Object.fromEntries(SRC.map(f=>[f,sha(f)]));
const muts=[
 ['src/r6-program.mjs',[["if(fresh){if(!on)continue;ex={","if(fresh){ex={"]],'D52A not performed'],
 ['src/r6-program.mjs',[["if(fresh){if(!assumeLogged&&!u.practice&&ex.mode==='FROM_LOG'&&!adoption?.adopted&&!adoption?.pending)continue;ss.exercises[u.id]=ex;}","if(fresh)ss.exercises[u.id]=ex;"]],'D52A needs a log'],
 ['src/r6-program.mjs',[["else if(on&&reestablishes(ex,u)){","else if(reestablishes(ex,u)){"]],'D52A re-est done'],
 ['src/r6-program.mjs',[["if(entryWeek){strengthState=clone(strengthState);for(const u of usedNow)","strengthState=clone(strengthState);for(const u of usedNow)"],["source:'PLANNED_ESTABLISHMENT',returnStep:0};}","source:'PLANNED_ESTABLISHMENT',...(entryWeek?{returnStep:0}:{})};"]],'D52A same week'],
 ['src/r6-program.mjs',[["if(on&&!assumeLogged&&ex.mode==='FROM_LOG'&&!Number.isFinite(ex.pendingLoad))ex.unlogged=true;else if(on)delete ex.unlogged;",""]],'D52A unlogged mark'],
 ['src/r6-program.mjs',[["if(ex.unlogged&&ex.mode==='FROM_LOG'){","if(false){"]],'D52A unlogged row'],
 ['src/r6-adaptation.mjs',[["if(r.sport!=='STRENGTH'||!['COMPLETED','PARTIAL'].includes(r.status))continue;","if(r.sport!=='STRENGTH')continue;"]],'D52 missed counts'],
 ['src/r6-adaptation.mjs',[["for(const r of ev.rows.filter(x=>x.status!=='CONFLICTED'))for(const [id,l]","for(const r of ev.rows)for(const [id,l]"]],'conflicted log'],
 ['src/r6-program.mjs',[["if(on&&!(ex.lastPerformed>=on))ex.lastPerformed=on;","{const d=used.filter(x=>x.id===u.id).map(x=>x.date).sort().at(-1);if(d)ex.lastPerformed=d;}"]],'D52B prescribed'],
 ['src/r6-program.mjs',[["...(typeof k.observedAt==='string'?{lastPerformed:k.observedAt.slice(0,10)}:{})",""]],'D52B known clock'],
 ['src/r6-program.mjs',[["dayGap(ex.lastPerformed,date)>op.return.moderateMaxDays","(Math.floor(dayGap(sk.c.startDate,date)/7)-Math.floor(dayGap(sk.c.startDate,ex.lastPerformed)/7)-1)*7>op.return.moderateMaxDays"]],'D52B whole weeks'],
];
const tests=['test/r6-ssctr-r10-fixes.test.mjs','test/r6-ssctr-r9-fixes.test.mjs','test/r6-ssctr-r8-fixes.test.mjs','test/r6-ssctr-r7-fixes.test.mjs','test/r6-engineering-fixes.test.mjs'];
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
