// R7-A.2 mutation check (Founder request §17): each mutation removes one piece of the new interruption model in a temporary copy of the
// current runtime (never in CoachingCore/) and runs the R7-A.2 tests with the R7-A.1 correction and composition tests there. Only the new
// invariants are mutated; areas this mission did not touch are not. A mutation is caught when at least one test fails. Author check, not a
// gate. Usage: node mutation-check-r7a2.mjs (writes mutation-check-r7a2.out.json next to this file, or MUT_OUT).
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
const root=path.resolve(import.meta.dirname,'../../..'),cc=path.join(root,'CoachingCore'),TESTS=['test/r7a2-interruption.test.mjs','test/r7a1-correction.test.mjs','test/r7a1-composition.test.mjs'];
const P='src/r6-program.mjs',A='src/r6-adaptation.mjs',C='src/r6-composition.mjs';
const MUTATIONS=[
 ['I1 identity ignored: every report is a new break',A,"if(!last||start>=last.day)return {relation:'NEW'","if(true)return {relation:'NEW'"],
 ['I2/I3 every later report read as a correction of the earlier break',A,"if(!last||start>=last.day)return {relation:'NEW'","if(!last)return {relation:'NEW'"],
 ['I2 a correction may reach back across an earlier re-entry',A,"if(end>=last.start&&!(before&&start<before.day))","if(end>=last.start)"],
 ['I1 a late report of an earlier break is applied as a new break',A,"return {ask:`This interruption ends before","return {relation:'NEW',episode:ctx.review.event.id,supersedes:null,x:`This interruption ends before"],
 ['I4 start of the break week instead of the state at the break',A,"const strength=strengthAtBreak(skp,point.state.strength,usedInWeek(view.weeks[p]),{ALL:'HOLD',...gates},{performed});","const strength=clone(point.state.strength);"],
 ['I3 an earlier return of the break week is never its starting point',A,"if(b.day>=week.startDate&&b.day<=start&&b.entry&&","if(false&&"],
 ['I3/I6 a return reported after the break began is its starting point',A,"if(b.day>=week.startDate&&b.day<=start&&b.entry&&","if(b.day>=week.startDate&&b.entry&&"],
 ['I5 a first exposure before the break is ignored',P,"if(!ex)ex=ss.exercises[id]=setUp(u,{entryWeek,returningWeek});else","if(!ex)continue;else"],
 ['I6 an unexecuted session on the break\'s first day belongs to the week before it',A,"const sessions=week.sessions.filter(s=>after(s)&&(s.date<start||executed.has(s.id)));","const sessions=week.sessions.filter(s=>after(s)&&(s.date<=start||executed.has(s.id)));"],
 ['I4 a session executed before the break is read by its planned date only',A,"const sessions=week.sessions.filter(s=>after(s)&&(s.date<start||executed.has(s.id)));","const sessions=week.sessions.filter(s=>after(s)&&s.date<start);"],
 ['I4 the window starts at the week start even after a return of that week',A,"after=point.asOf?s=>!beforeReturn(program,{day:point.day,asOf:point.asOf})(s):()=>true","after=()=>true"],
 ['I6 a conflicted report executes a session before the break',A,"executed=new Set(ledger.filter(o=>!o.conflicted).map(o=>o.sessionId))","executed=new Set(ledger.map(o=>o.sessionId))"],
 ['I2/I9 a newer report of the same break eases a second slot after its slot was run',A,"if(cls==='SHORT'&&!slotRun)base=","if(cls==='SHORT')base="],
 ['I6 an execution observed after the break began counts',A,"ledger=(ctx.fullLedger??ctx.ledger).filter(o=>(o.localDate??localDate(o.observedAt,tz))<start)","ledger=(ctx.fullLedger??ctx.ledger)"],
 ['I7 the ceiling read without the logged target',P,"if(!Number.isInteger(ex.returnStep)&&advancedGate(k)&&whole.length)ex.lastExecutedSets=Math.max(...whole);","if(!Number.isInteger(ex.returnStep)&&whole.length)ex.lastExecutedSets=Math.max(...whole);"],
 ['I7 exposures before the break earn their week\'s transition',A,"const strength=strengthAtBreak(skp,point.state.strength,usedInWeek(view.weeks[p]),{ALL:'HOLD',...gates},{performed});","const strength=advanceStrength(skp,point.state.strength,p,usedInWeek(view.weeks[p]),{ALL:'HOLD',...gates},{},{performed});"],
 ['I9 a short return adopts any eased slot',C,"own=s=>s.explanation===EASY_SLOT&&(s.easedFor??null)===(a.episode??null)","own=s=>s.explanation===EASY_SLOT"],
 ['I9 the eased slot carries no break',C,"a.episode?{easedFor:a.episode}:{}","{}"],
 ['I9 a separate break strips the earlier break\'s adaptations',A,"&&(a.episode??a.eventId)===ep.episode)","&&true)"]
];
const DOCUMENTED={};
const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'r7a2-mut-')),results=[];
try{
 const copyDir=rel=>fs.cpSync(path.join(cc,rel),path.join(tmp,'CoachingCore',rel),{recursive:true});
 for(const rel of ['src','r6/fixtures'])copyDir(rel);
 fs.mkdirSync(path.join(tmp,'CoachingCore/test'),{recursive:true});
 for(const t of TESTS)fs.copyFileSync(path.join(cc,t),path.join(tmp,'CoachingCore',t));
 fs.copyFileSync(path.join(cc,'r6/PROGRAM_POLICY_R6.json'),path.join(tmp,'CoachingCore/r6/PROGRAM_POLICY_R6.json'));
 fs.copyFileSync(path.join(cc,'package.json'),path.join(tmp,'CoachingCore/package.json'));
 const run=()=>{const r=spawnSync(process.execPath,['--test',...TESTS],{cwd:path.join(tmp,'CoachingCore'),encoding:'utf8',maxBuffer:64*1024*1024});const failed=[...r.stdout.matchAll(/^✖ (.+?) \(\d/gm)].map(m=>m[1]).filter(n=>n!=='failing tests:');return {code:r.status,failed:[...new Set(failed)]};};
 const clean=run();if(clean.code!==0)throw Error('The unmutated copy fails: '+clean.failed.join('; '));
 for(const [name,file,from,to] of MUTATIONS){
  const f=path.join(tmp,'CoachingCore',file),orig=fs.readFileSync(f,'utf8');
  if(orig.split(from).length!==2){results.push({mutation:name,file,applied:false,reason:'anchor not found exactly once'});continue;}
  fs.writeFileSync(f,orig.replace(from,()=>to));
  const r=run();fs.writeFileSync(f,orig);
  results.push({mutation:name,file,applied:true,caught:r.code!==0,failingTests:r.failed,...(r.code===0&&DOCUMENTED[name]?{documented:DOCUMENTED[name]}:{})});
 }
}finally{fs.rmSync(tmp,{recursive:true,force:true});}
const out={check:'R7A2-MUTATION-1',runAt:new Date().toISOString(),scope:TESTS.join(' + ')+' against single-piece removals of the R7-A.2 interruption model in a temporary copy',caught:results.filter(r=>r.caught).length,applied:results.filter(r=>r.applied).length,total:results.length,documentedSurvivors:results.filter(r=>r.applied&&!r.caught&&r.documented).length,undocumentedSurvivors:results.filter(r=>r.applied&&!r.caught&&!r.documented).length,notApplied:results.filter(r=>!r.applied).length,results};
fs.writeFileSync(path.join(import.meta.dirname,process.env.MUT_OUT??'mutation-check-r7a2.out.json'),JSON.stringify(out,null,1)+'\n');
console.log(JSON.stringify({caught:out.caught,applied:out.applied,total:out.total,undocumented:out.undocumentedSurvivors,notApplied:out.notApplied}));
