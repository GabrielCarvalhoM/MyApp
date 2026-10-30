// Author probe (R7-A RESIDUAL AUTHORITY, Founder request §26): the minimal mutation of the two root causes, the four mutants the request names and
// no others. Each mutant is one exact source replacement (it must occur once) in a temporary copy of CoachingCore; the live tree is never written.
// A mutant is killed by this mission's test file first, else by the full suite (a test counts only if it passes on the unmutated copy).
// Prints JSON only. Usage: node r7ara-mutation.mjs [mutantId ...]
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
const root=path.resolve(import.meta.dirname,'../../..'),core=path.join(root,'CoachingCore'),OWN='test/r7ara-residual-authority.test.mjs';
const MUTANTS=[
 {id:'M1',root:'A5',what:'the canonical correction is bypassed before the handler (no factual re-plan before dispatch)',file:'src/r6-adaptation.mjs',from:'if(!(ctx.ev.pending||ctx.program.weeks[ctx.w].sessions.some(s=>s.prescription&&ctx.ahead(s)))||!viewMovedBy(ctx))return null;',to:'return null;'},
 {id:'M2',root:'A5',what:'the handler decides on the rows planned from the retracted load (a stale planned load resurrects the corrected one)',file:'src/r6-adaptation.mjs',from:'withFactualReplan(factual,decide(factual?.ctx??ctx))',to:'withFactualReplan(factual,decide(ctx))'},
 {id:'M3',root:'E1',what:'the walk/jog exit the evidence projected is the return baseline (no mode is undone)',file:'src/r6-program.mjs',from:'if(mode&&mode!==run.mode){',to:'if(false){'},
 {id:'M4',root:'E1',what:'the EASY dose the evidence released is the return baseline (no long or easy cap)',file:'src/r6-program.mjs',from:"else if(st.mode==='EASY'){\n  const long=",to:"else if(false){\n  const long="},
];
const only=process.argv.slice(2),list=only.length?MUTANTS.filter(m=>only.includes(m.id)):MUTANTS;
const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'r7ara-mut-')),tree=path.join(tmp,'CoachingCore');
const tap=(cwd,files,ignore=[])=>{const r=spawnSync(process.execPath,['--test','--test-reporter=tap',...files],{cwd,encoding:'utf8',maxBuffer:512*1024*1024});const t=[...r.stdout.matchAll(/^\s*(not ok|ok) \d+ - (.+)$/gm)].map(m=>({name:m[2].trim(),pass:m[1]==='ok'})).filter(x=>!/\.test\.mjs$/.test(x.name));return {total:t.length,failing:t.filter(x=>!x.pass&&!ignore.includes(x.name)).map(x=>x.name)};};
const out={probe:'r7ara-mutation',mutants:[]};
try{
 fs.cpSync(core,tree,{recursive:true});
 out.baseline={ownTestFile:tap(tree,[OWN])};
 if(out.baseline.ownTestFile.failing.length)throw Error('the unmutated copy fails its own test file');
 for(const m of list){
  const file=path.join(tree,m.file),src=fs.readFileSync(file,'utf8'),n=src.split(m.from).length-1;
  if(n!==1){out.mutants.push({...m,applied:false,occurrences:n});continue;}
  fs.writeFileSync(file,src.replace(m.from,m.to));
  try{
   let stage='own-test-file',r=tap(tree,[OWN]);
   if(!r.failing.length){stage='full-suite';out.baseline.fullSuite??=(fs.writeFileSync(file,src),tap(tree,[]));fs.writeFileSync(file,src.replace(m.from,m.to));r=tap(tree,[],out.baseline.fullSuite.failing);}
   out.mutants.push({id:m.id,root:m.root,what:m.what,file:m.file,from:m.from,to:m.to,applied:true,killed:r.failing.length>0,stage:r.failing.length?stage:null,testsRun:r.total,failing:r.failing.length,killingTests:r.failing.slice(0,8)});
  }finally{fs.writeFileSync(file,src);}
 }
}finally{fs.rmSync(tmp,{recursive:true,force:true});}
out.summary={mutants:out.mutants.length,applied:out.mutants.filter(m=>m.applied).length,killed:out.mutants.filter(m=>m.killed).length,survivors:out.mutants.filter(m=>m.applied&&!m.killed).map(m=>m.id)};
console.log(JSON.stringify(out,null,1));
