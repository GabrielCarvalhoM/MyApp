// R7-A boundary mutation check (Founder request §18): each mutation removes or weakens one piece of the week-start authority model in a
// temporary copy of the current runtime (never in CoachingCore/) and runs this mission's tests with the R7-A final episode tests, the R7-A.2
// interruption tests and the R6 adaptation tests there. Only this semantics is mutated: the five §18 examples and the pieces they rest on. A
// mutation is caught when at least one test fails; a survivor is either documented here with its reason or reported. Author check, not a
// gate. Usage: node mutation-check-r7ab.mjs (writes mutation-check-r7ab.out.json next to this file, or MUT_OUT).
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
const root=path.resolve(import.meta.dirname,'../../..'),cc=path.join(root,'CoachingCore');
const TESTS=['test/r7ab-week-start-authority.test.mjs','test/r7af-episode-identity.test.mjs','test/r7a2-interruption.test.mjs','test/r6-adaptation.test.mjs'];
const A='src/r6-adaptation.mjs',C='src/r6-composition.mjs',P='src/r6-program.mjs';
const MUTATIONS=[
 // §18 examples.
 ['§18 PROJECTED treated as HISTORICAL: a conditional start always holds',A,":v===WEEK_START.CONDITIONAL_PLAN&&k>0&&asAssumed(k-1,sport,recorded?part.premise:undefined)&&carried()?'COMPLETED_SESSIONS':'PROJECTED';",":'COMPLETED_SESSIONS';"],
 ['§18 evidence check removed: the week before always executed as assumed',A,"const asAssumed=(j,sport,premise)=>{","const asAssumed=(j,sport,premise)=>{return true;"],
 ['§18 any stored start authoritative: no walk-back',A,"while(point.kind==='WEEK_START'&&k>0&&!authorityAt(k,true).historical)","while(false)"],
 ['§18 promoted at the week boundary: a conditional start holds once the week before is over',A,"const asAssumed=(j,sport,premise)=>{","const asAssumed=(j,sport,premise)=>{return Date.parse(onDate(program.weeks[j].startDate,7)+'T00:00:00Z')<=until;"],
 ['§18 temporal contradiction ignored',A,"if(crossed.length&&changedSessions(program,{weeks:next.weeks})>0)return {action:'ASK'","if(false)return {action:'ASK'"],
 // The pieces the five rest on: the premise.
 ['premise rows ignored: a later adaptation keeps the projection',A,"if(premise!==undefined&&premise!==premiseOf(r.week,sport))return false;",""],
 ['gates ignored: any execution counts',A,"if(Object.entries(r.gates).some(([key,g])=>runKeys.has(key)===(sport==='RUN')&&!['ADVANCE','EARNED'].includes(g)))return false;",""],
 ['HOLD accepted as executed (only a regression fails)',A,"&&!['ADVANCE','EARNED'].includes(g)))return false;","&&g==='REGRESS'))return false;"],
 ['load check removed',A,"return !(d.adopted&&assumed!==null&&d.value<assumed-1e-9);","return true;"],
 ['load judged on the row plan only (an effort-guided row always passes)',A,"const assumed=u.mode==='KNOWN'&&Number.isFinite(u.value)?u.value:Number.isFinite(ss[id]?.load)?ss[id].load:null","const assumed=u.mode==='KNOWN'&&Number.isFinite(u.value)?u.value:null"],
 // The clock and the base.
 ['decision clock ignored: a start set at or after the cut counts',A,"const decidedBefore=part=>part.provenance===WEEK_START.INTAKE||","const decidedBefore=part=>true||"],
 ['held value from a projected start accepted inside a return',A,"const carried=()=>!returning(state)||reviewOf(k-1).whole||of(k-1).historical;","const carried=()=>true;"],
 ['a week counts as executed in full with any report',A,"whole:ev.rows.every(r=>r.status==='COMPLETED')","whole:ev.rows.every(r=>r.status!=='MISSED'&&r.status!=='NOT_REPORTED')"],
 ['the walk-back only after a return (R7-A.2 boundary 3 restored)',A,"while(point.kind==='WEEK_START'&&k>0&&!authorityAt(k,true).historical)","while(point.kind==='WEEK_START'&&R&&!late&&R.day<weekOf(k).startDate&&!authorityAt(k,true).historical)"],
 ['the start a return replaced read with the return\'s authority',A,"const week=program.weeks[k],replaced=point&&!!week.startBeforeReturn","const week=program.weeks[k],replaced=false"],
 // The record: who sets it.
 ['the evidence rule recorded as a projection',C,"const nextAuthority=rebased?next.weeks[fromWeek+1].startAuthority:fromEvidence?anchoredStart(WEEK_START.WEEK_EVIDENCE,by):projectedStart(first.week,by);","const nextAuthority=rebased?next.weeks[fromWeek+1].startAuthority:projectedStart(first.week,by);"],
 ['a kept start promoted by any composition (QE-R7AF-01 reintroduced)',C,"place(fromWeek,first.week.sessions,first.state,start?startAuth:next.weeks[fromWeek].startAuthority)","place(fromWeek,first.week.sessions,first.state,start?startAuth:anchoredStart(WEEK_START.WEEK_EVIDENCE,by))"],
 ['a strength-only change replaces the run part of the record',C,"const ownAuthority=(i,auth)=>all?auth:","const ownAuthority=(i,auth)=>true?auth:"],
 ['every generated week recorded as the intake',P,"startAuthority:i===0?anchoredStart(WEEK_START.INTAKE,{asOf:c.asOf}):projectedStart(projected[i-1])","startAuthority:anchoredStart(WEEK_START.INTAKE,{asOf:c.asOf})"],
 ['the weekly review records its start as a projection',A,"startAuthority:rebased?program.weeks[w+1].startAuthority:anchoredStart(WEEK_START.WEEK_EVIDENCE,{eventId:ctx.review.event.id,asOf})","startAuthority:rebased?program.weeks[w+1].startAuthority:projectedStart(program.weeks[w],{eventId:ctx.review.event.id,asOf})"],
 ['the return entry recorded as a projection',A,"startAuthority:anchoredStart(WEEK_START.RETURN_ENTRY,{eventId:review.event.id,asOf:ctx.asOf})","startAuthority:projectedStart(program.weeks[w],{eventId:review.event.id,asOf:ctx.asOf})"]
];
// Survivors whose behaviour equals the unmutated runtime's on every path, with the reason.
const DOCUMENTED={
 'decision clock ignored: a start set at or after the cut counts':'Equivalent on reachable paths (a guard for I7): a week start at or before the interruption\'s week is set before that week begins (the review of the week before, or a re-plan from an earlier week). A decision made in the interruption\'s week keeps that week\'s start (start null, so its authority with it), re-plans only later weeks, or, as a return of that week, keeps it as the start it replaced (startBeforeReturn, with the authority it had). So no start the state point can read was set at or after the cut.'
};
const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'r7ab-mut-')),results=[];
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
const out={check:'R7AB-MUTATION-1',runAt:new Date().toISOString(),scope:TESTS.join(' + ')+' against single-piece removals of the R7-A boundary week-start authority model in a temporary copy',caught:results.filter(r=>r.caught).length,applied:results.filter(r=>r.applied).length,total:results.length,documentedSurvivors:results.filter(r=>r.applied&&!r.caught&&r.documented).length,undocumentedSurvivors:results.filter(r=>r.applied&&!r.caught&&!r.documented).map(r=>r.mutation),notApplied:results.filter(r=>!r.applied).map(r=>r.mutation),results};
fs.writeFileSync(path.join(import.meta.dirname,process.env.MUT_OUT??'mutation-check-r7ab.out.json'),JSON.stringify(out,null,1)+'\n');
console.log(JSON.stringify({caught:out.caught,applied:out.applied,total:out.total,documented:out.documentedSurvivors,undocumented:out.undocumentedSurvivors,notApplied:out.notApplied}));
