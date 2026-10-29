// R7-A final mutation check (Founder request §16): each mutation removes one piece of the interruption episode model in a temporary copy of
// the current runtime (never in CoachingCore/) and runs the R7-A final tests with the R7-A.2 interruption tests and the R7-A.1 correction and
// composition tests there. Only the new invariants are mutated (the six named in §16 and the pieces they rest on); areas this mission did not
// touch are not. A mutation is caught when at least one test fails. Author check, not a gate. Usage: node mutation-check-r7af.mjs (writes
// mutation-check-r7af.out.json next to this file, or MUT_OUT).
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
const root=path.resolve(import.meta.dirname,'../../..'),cc=path.join(root,'CoachingCore'),TESTS=['test/r7af-episode-identity.test.mjs','test/r7a2-interruption.test.mjs','test/r7a1-correction.test.mjs','test/r7a1-composition.test.mjs'];
const A='src/r6-adaptation.mjs',C='src/r6-composition.mjs';
const MUTATIONS=[
 // §16: remove episode identity.
 ['§16 identity removed: every report is a new interruption',A,"function interruptionEpisode(ctx,{start,end,id=null}){","function interruptionEpisode(ctx,{start,end,id=null}){return {relation:'NEW',episode:ctx.review.event.id,supersedes:null,basis:'FIRST',revision:1};"],
 // §16: treat any later pause as the same pause.
 ['§16 a later interruption after the re-entry is read as the same one',A,"if(!last||afterReentry(ctx,last,start))return {relation:'NEW'","if(last&&afterReentry(ctx,last,start))return {relation:'SAME_BREAK',episode:last.id,supersedes:last.live.eventId,basis:'MUT',revision:2};if(!last)return {relation:'NEW'"],
 // §16: treat every correction as a new pause.
 ['§16 a named correction is read as a new interruption',A,"if(named){","if(named){return {relation:'NEW',episode:ctx.review.event.id,supersedes:null,basis:'MUT',revision:1};"],
 ['§16 the same record again is read as a new interruption',A,"if(last&&id===null&&start===last.live.start&&end===last.live.end)return {relation:'SAME_BREAK'","if(last&&id===null&&start===last.live.start&&end===last.live.end)return {relation:'NEW',x:'SAME_BREAK'"],
 // §16: use report time instead of execution/start time.
 ['§16 the point is the report in force now, not at the start (QE-R7A2-01)',A,"const R=E?E.reports.filter(inForce).at(-1)??E.live:null","const R=E?E.live:null"],
 ['§16 re-entry read from the latest report, not the first (QE-R7A2-01)',A,"start>=e.first.day||trainedBetween","start>=e.live.day||trainedBetween"],
 ['§16 an execution placed by its report time',A,"dayOf=o=>o.localDate??localDate(o.observedAt,tz)","dayOf=o=>o.reportedAt?localDate(o.reportedAt,tz):o.localDate??localDate(o.observedAt,tz)"],
 // §16: share the easy slot between episodes.
 ['§16 a short return adopts any eased slot',C,"own=s=>s.explanation===EASY_SLOT&&(s.easedFor??null)===(a.episode??null)","own=s=>s.explanation===EASY_SLOT"],
 // §16: ignore late pre-pause execution.
 ['§16 late evidence after the return is never confirmed',A,"function staleReturn(ctx){","function staleReturn(ctx){return null;"],
 // The pieces the six rest on.
 ['I9 a correction of an earlier interruption is applied',A,"if(named!==last)return {ask:","if(false)return {ask:"],
 ['I9 a correction reaches back across the earlier re-entry',A,"if(prev&&!afterReentry(ctx,prev,start))return {ask:`This correction","if(false)return {ask:`This correction"],
 ['I9 overlapping days without a name are read as a correction',A,"return {ask:`This interruption shares days","return {relation:'SAME_BREAK',episode:last.id,supersedes:last.live.eventId,basis:'MUT',revision:2,x:`This interruption shares days"],
 ['I2 training between two interruptions is ignored',A,"start>=e.first.day||trainedBetween(ctx,e.live.end,start)","start>=e.first.day"],
 ['P6 the same report replayed is applied again',A,"if(again)return","if(false)return"],
 ['0.6 a correction may start from its own earlier report',A,"filter(e=>e.id!==episode&&e.live.end<start)","filter(e=>e.live.end<start)"],
 ['0.7 a break reported after the later one began is not its point',A,"(late?k===p:inForce(R)","(late?false:inForce(R)"],
 ['P5 an unearned week start after a return is the point',A,"while(point.kind==='WEEK_START'&&R&&!late","while(false&&point.kind==='WEEK_START'&&R&&!late"],
 ['0.8 a stated start time is ignored',A,"startedAt?Date.parse(o.observedAt)<Date.parse(startedAt):dayOf(o)<start","false?0:dayOf(o)<start"],
 ['0.8 a material first-day order is guessed',A,"if(at.material)return {action:'ASK'","if(false)return {action:'ASK'"],
 ['0.8 a last performed date alone is material',A,"material=!!other&&facts(alt)!==facts(base.strength)","material=!!other"],
 ['I6 a late fact that makes the first-day order material is not confirmed',A,"&&!at.material)return null;",")return null;"]
];
const DOCUMENTED={};
const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'r7af-mut-')),results=[];
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
const out={check:'R7AF-MUTATION-1',runAt:new Date().toISOString(),scope:TESTS.join(' + ')+' against single-piece removals of the R7-A final interruption episode model in a temporary copy',caught:results.filter(r=>r.caught).length,applied:results.filter(r=>r.applied).length,total:results.length,documentedSurvivors:results.filter(r=>r.applied&&!r.caught&&r.documented).length,undocumentedSurvivors:results.filter(r=>r.applied&&!r.caught&&!r.documented).length,notApplied:results.filter(r=>!r.applied).length,results};
fs.writeFileSync(path.join(import.meta.dirname,process.env.MUT_OUT??'mutation-check-r7af.out.json'),JSON.stringify(out,null,1)+'\n');
console.log(JSON.stringify({caught:out.caught,applied:out.applied,total:out.total,undocumented:out.undocumentedSurvivors,notApplied:out.notApplied}));
