// R7-B bounded mutation probe (request §22). Each mutant changes one exact source fragment, runs the R7-B test files that should notice, and
// restores the file byte for byte (checked by SHA-256, and against git at the end). Read-only for the repository unless given --write, which
// writes only CoachingCore/r7/b/MUTATION_R7B.json. Not a general mutation score: a finite set of mutants on the rules the request names.
import fs from 'node:fs';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
// --out <path under CoachingCore> names the report written by --write.
const arg=(k,d)=>{const i=process.argv.indexOf(k);return i>=0&&process.argv[i+1]?process.argv[i+1]:d;};
const root=new URL('..',import.meta.url),sha=b=>createHash('sha256').update(b).digest('hex');
const RUN='test/r7b-running.test.mjs',STR='test/r7b-strength.test.mjs',HYB='test/r7b-hybrid-program.test.mjs',BIND='test/r7b-binding.test.mjs',COND='test/r7b-conditions.test.mjs';
const MUTANTS=[
 {id:'M01',area:'eligibility',what:'quality arrangement ignores the run goal',file:'src/r6-program.mjs',find:"const qualityAllowed=qualityClass&&['RACE','PERFORMANCE'].includes(goal.run.kind)&&",replace:"const qualityAllowed=qualityClass&&",tests:[RUN]},
 {id:'M02',area:'quality gating',what:'two run days open quality',file:'src/r6-program.mjs',find:"['BUILD','SPECIFIC','NEXT_BLOCK','DEVELOPMENT'].includes(context)&&runDays.length>=3&&allows(ctx.authority,'R6-RUN-QUALITY');",replace:"['BUILD','SPECIFIC','NEXT_BLOCK','DEVELOPMENT'].includes(context)&&runDays.length>=2&&allows(ctx.authority,'R6-RUN-QUALITY');",tests:[RUN]},
 {id:'M03',area:'eligibility',what:'graduation ignores adverse reports',file:'src/r6-adaptation.mjs',find:" if(ev.rows.some(r=>['ADVERSE','CONFLICTING'].includes(r.kind)||r.status==='CONFLICTED'))return {week:k,ok:false,why:'ADVERSE_OR_CONFLICTED'};",replace:"",tests:[RUN]},
 {id:'M04',area:'progression',what:'a declined graduation is applied anyway',file:'src/r6-adaptation.mjs',find:"declined=choices.some(x=>x.offer==='RUN_QUALITY_GRADUATION'&&String(x.decision).toUpperCase()==='DECLINE');",replace:"declined=false;",tests:[RUN]},
 {id:'M05',area:'progression',what:'the introduction week holds the released (unexecuted) long run',file:'src/r6-program.mjs',find:"st.long=st0.long===null?null:Math.min(st0.long,st.achieved.long??st0.long);",replace:"st.long=st0.long;",tests:[RUN]},
 {id:'M06',area:'rotation',what:'MAIN rows rotate on the calendar',file:'src/r6-program.mjs',find:"  if(r.role!=='ACCESSORY'||!r.alternatives?.length)continue;",replace:"  if(!r.alternatives?.length)continue;",tests:[STR]},
 {id:'M07',area:'rotation',what:'COACH_DECIDES turns at every block boundary',file:'src/r6-program.mjs',find:"blockStart(i)&&i-last>=rot.everyWeeks",replace:"blockStart(i)",tests:[STR]},
 {id:'M08',area:'interference',what:'CMP.I11 never costs',file:'src/r6-balanced.mjs',find:"  if(cmpI11&&b.s.prescription?.modality==='RUN'",replace:"  if(false&&cmpI11&&b.s.prescription?.modality==='RUN'",tests:[HYB,BIND]},
 {id:'M09',area:'progression',what:'novice density released without executed evidence',file:'src/r6-program.mjs',find:"  const ok=assumeLogged||ids.length>0&&",replace:"  const ok=true||ids.length>0&&",tests:[STR]},
 {id:'M10',area:'eligibility',what:'band and assistance rows carry kilograms',file:'src/r6-prescription.mjs',find:"unit:ordinal?'LEVEL':'BODYWEIGHT'",replace:"unit:ordinal?'KG':'BODYWEIGHT'",tests:[STR,BIND]},
 {id:'M11',area:'progression',what:'familiar bouts count as executed threshold sessions',file:'src/r6-program.mjs',find:"   if(P.quality&&done('QUALITY')&&!smallReferenceStep&&!bouts){",replace:"   if(P.quality&&done('QUALITY')&&!smallReferenceStep){",tests:[RUN]},
 {id:'M12',area:'eligibility',what:'strides optional only for EASY_LOW and NOVICE (the frozen runtime)',file:'src/r6-program.mjs',find:"export const stridesOptional=(sk,rs=null)=>['EASY_LOW','WALK_JOG','RESTART'].includes(sk.cap.run.class)||['NONE','NOVICE'].includes(sk.c.athlete.runExperience)||",replace:"export const stridesOptional=(sk,rs=null)=>sk.cap.run.class==='EASY_LOW'||sk.c.athlete.runExperience==='NOVICE'||false&&",tests:[RUN]},
 {id:'M13',area:'return ceilings',what:'graduation applied in return steps',equivalent:'runRow never activates quality in RETURN or RESTART mode (qualityActive requires EASY), so the mode guard is redundant: no observable dose differs',file:'src/r6-program.mjs',find:"if(grad&&grad.fromWeek<=w+1&&st.mode==='EASY'&&!st.qualityRunner",replace:"if(grad&&grad.fromWeek<=w+1&&!st.qualityRunner",tests:[RUN]},
 {id:'M14',area:'progression',what:'a ladder step may skip its chain',file:'src/r6-adaptation.mjs',find:"&&!inUse.has(y)&&ladderNext(x).includes(y)&&",replace:"&&!inUse.has(y)&&",tests:[STR]},
 {id:'M15',area:'interference',what:'content reduction under a STRENGTH lead',file:'src/r6-program.mjs',find:"allowsCandidate(sk.repertoire??DEFAULT_REPERTOIRE,'B0-C11')&&lead==='RUN'&&(roles.some(",replace:"allowsCandidate(sk.repertoire??DEFAULT_REPERTOIRE,'B0-C11')&&lead!=='JOINT'&&(roles.some(",tests:[HYB]},
 // The fix cycle after the reviews of FREEZE-1 (each mutant undoes one fix; the fix-cycle suite must notice).
 {id:'M16',area:'substitution',what:'a decision applies only where the slot naturally picks its configuration (a rotated variant is never replaced)',file:'src/r7b-repertoire.mjs',find:"d.from!==pick.id&&!located(d))continue;",replace:"d.from!==pick.id)continue;",tests:['test/r7b-review-fixes.test.mjs']},
 {id:'M17',area:'substitution',what:'the replay starts after the set-aside configuration left the slot',file:'src/r7b-repertoire.mjs',find:"natural=setAside.size?optionsFor(true):open;",replace:"natural=open;",tests:['test/r7b-review-fixes.test.mjs']},
 {id:'M18',area:'rotation',what:'rotation counts turns from week 1 over a decided configuration',file:'src/r6-program.mjs',find:"const since=Number.isInteger(r.directive?.since)&&r.directive.since>0?r.directive.since:0;",replace:"const since=0;",tests:['test/r7b-review-fixes.test.mjs']},
 {id:'M19',area:'rotation',what:'a rung below a reached configuration stays a calendar alternative',file:'src/r7b-repertoire.mjs',find:"o.id!==pick.id&&!surpassed.has(o.id)&&",replace:"o.id!==pick.id&&",tests:['test/r7b-review-fixes.test.mjs']},
 {id:'M20',area:'stale state',what:'decisions plan the novice density from the projection',file:'src/r6-adaptation.mjs',find:"if(V.strength.density!==undefined)strength.density=clone(V.strength.density);else delete strength.density;",replace:"",tests:['test/r7b-review-fixes.test.mjs']},
 {id:'M21',area:'correction',what:'a graduation is never re-checked against corrected evidence',file:'src/r6-adaptation.mjs',find:" if(!failed.length)return null;",replace:" if(true)return null;",tests:['test/r7b-review-fixes.test.mjs']},
 {id:'M22',area:'return ceilings',what:'graduation re-entry after a restart skips the established easy weeks',file:'src/r6-program.mjs',find:"st.qualityNeeds=R.qualityRequiresEstablishedEasyWeeks;st.graduatedAt=grad.fromWeek;",replace:"st.qualityNeeds=0;st.graduatedAt=grad.fromWeek;",tests:['test/r7b-review-fixes.test.mjs']},
 {id:'M23',area:'eligibility',what:'a familiar task stays current for ever',file:'src/r6-program.mjs',find:"st.familiarCurrentThrough=Number.isFinite(seenGap)?seenGap+op.return.moderateMaxDays:-1;",replace:"st.familiarCurrentThrough=Infinity;",tests:['test/r7b-review-fixes.test.mjs']},
 {id:'M24',area:'impossible combinations',what:'two changes of one exercise at one boundary are applied',file:'src/r6-adaptation.mjs',find:" if(twice.length)return {ask:",replace:" if(false)return {ask:",tests:['test/r7b-review-fixes.test.mjs']},
 {id:'M25',area:'state transition',what:'a cap a later context starts never enters the state',file:'src/r6-program.mjs',find:"if(ss.density===undefined&&noviceDensityApplies(sk)&&w<firstStrengthBoundary(sk))ss.density={capped:true};",replace:"",tests:['test/r7b-review-fixes.test.mjs']}
];
const results=[];
for(const m of MUTANTS){
 const path=new URL(m.file,root),original=fs.readFileSync(path),text=original.toString('utf8'),n=text.split(m.find).length-1;
 if(n!==1){results.push({id:m.id,area:m.area,what:m.what,result:'INVALID',reason:`fragment occurs ${n} times`});continue;}
 let outcome;
 try{
  fs.writeFileSync(path,text.replace(m.find,m.replace));
  const r=spawnSync(process.execPath,['--test',...m.tests],{cwd:root,encoding:'utf8',timeout:600000});
  const failed=Number((r.stdout.match(/ℹ fail (\d+)/)??[])[1]??'NaN'),passed=Number((r.stdout.match(/ℹ pass (\d+)/)??[])[1]??'NaN');
  outcome={result:failed>0?'KILLED':Number.isFinite(failed)?'SURVIVED':'ERROR',failedTests:failed,passedTests:passed,failing:(r.stdout.match(/^✖ .*$/gm)??[]).slice(0,4)};
 }finally{fs.writeFileSync(path,original);}
 if(sha(fs.readFileSync(path))!==sha(original))throw new Error('restore failed for '+m.file);
 results.push({id:m.id,area:m.area,what:m.what,file:m.file,tests:m.tests,...outcome});
 console.log(m.id,outcome.result,m.what);
}
const clean=spawnSync('git',['diff','--quiet','--','src'],{cwd:root}).status===0;
const report={check:'R7B-MUTATION',mutants:results.length,killed:results.filter(r=>r.result==='KILLED').length,survived:results.filter(r=>r.result==='SURVIVED').map(r=>r.id),equivalent:MUTANTS.filter(m=>m.equivalent&&results.find(r=>r.id===m.id)?.result==='SURVIVED').map(m=>({id:m.id,reason:m.equivalent})),invalid:results.filter(r=>['INVALID','ERROR'].includes(r.result)).map(r=>r.id),sourceRestored:clean,results};
if(process.argv.includes('--write'))fs.writeFileSync(new URL(arg('--out','r7/b/MUTATION_R7B.json'),root),JSON.stringify(report,null,1)+'\n');
console.log(JSON.stringify({mutants:report.mutants,killed:report.killed,survived:report.survived,invalid:report.invalid,sourceRestored:clean}));
