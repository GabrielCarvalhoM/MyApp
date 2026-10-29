import fs from 'node:fs';import {execFileSync} from 'node:child_process';
const muts=[
 ['src/r6-program.mjs',"if(planned!==null&&log.load>planned+1e-9&&advanced===false)return","if(false)return",'D44'],
 ['src/r6-adaptation.mjs',"const keepOk=allAdvance&&!changed&&!pendingMoved","const keepOk=allAdvance&&!changed",'pending carried'],
 ['src/r6-program.mjs',":Number.isInteger(ex?.returnStep)&&Number.isFinite(ex?.load)?ex.load:null;",":null;",'return ceiling'],
 ['src/r6-program.mjs',"source:'PLANNED_ESTABLISHMENT',...(entryWeek?{returnStep:0}:{})};\n  const family","source:'PLANNED_ESTABLISHMENT'};\n  const family",'entry week'],
 ['src/r6-program.mjs',"if(near(ex?.pendingLoad)||near(log.earlier))","if(near(ex?.pendingLoad))",'same-week'],
];
for(const [f,a,b,label] of muts){
 const orig=fs.readFileSync(f,'utf8');if(orig.split(a).length!==2){console.log(label,'PATTERN NOT UNIQUE');continue;}
 fs.writeFileSync(f,orig.replace(a,b));
 let out='';try{out=execFileSync(process.execPath,['--test','test/r6-ssctr-r7-fixes.test.mjs'],{encoding:'utf8'});}catch(e){out=e.stdout;}
 fs.writeFileSync(f,orig);
 console.log(label.padEnd(16),(out.match(/^✖ .*$/mg)??[]).filter(l=>!l.includes('failing tests')).map(l=>l.slice(2,60)).join(' | ')||'NO FAILURE (test does not catch it)');
}
