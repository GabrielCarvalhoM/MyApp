// R7-B bounded mutation probe (request §22). Each mutant changes one exact source fragment, runs the R7-B test files that should notice, and
// restores the file byte for byte (checked by SHA-256, and against git at the end). Read-only for the repository unless given --write, which
// writes only CoachingCore/r7/b/MUTATION_R7B.json. Not a general mutation score: a finite set of mutants on the rules the request names.
import fs from 'node:fs';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
const root=new URL('..',import.meta.url),sha=b=>createHash('sha256').update(b).digest('hex');
const RUN='test/r7b-running.test.mjs',STR='test/r7b-strength.test.mjs',HYB='test/r7b-hybrid-program.test.mjs',BIND='test/r7b-binding.test.mjs',COND='test/r7b-conditions.test.mjs';
const MUTANTS=[
 {id:'M01',area:'eligibility',what:'quality arrangement ignores the run goal',file:'src/r6-program.mjs',find:"const qualityAllowed=qualityClass&&['RACE','PERFORMANCE'].includes(goal.run.kind)&&",replace:"const qualityAllowed=qualityClass&&",tests:[RUN]},
 {id:'M02',area:'quality gating',what:'two run days open quality',file:'src/r6-program.mjs',find:"['BUILD','SPECIFIC','NEXT_BLOCK','DEVELOPMENT'].includes(context)&&runDays.length>=3&&allows(ctx.authority,'R6-RUN-QUALITY');",replace:"['BUILD','SPECIFIC','NEXT_BLOCK','DEVELOPMENT'].includes(context)&&runDays.length>=2&&allows(ctx.authority,'R6-RUN-QUALITY');",tests:[RUN]},
 {id:'M03',area:'eligibility',what:'graduation ignores adverse reports',file:'src/r6-adaptation.mjs',find:" if(run.some(r=>['ADVERSE','CONFLICTING'].includes(r.kind)||r.status==='CONFLICTED'))return {week:k,ok:false,why:'ADVERSE_OR_CONFLICTED'};",replace:"",tests:[RUN]},
 {id:'M04',area:'progression',what:'a declined graduation is applied anyway',file:'src/r6-adaptation.mjs',find:"declined=choices.some(x=>x.offer==='RUN_QUALITY_GRADUATION'&&String(x.decision).toUpperCase()==='DECLINE');",replace:"declined=false;",tests:[RUN]},
 {id:'M05',area:'progression',what:'the introduction week holds the released (unexecuted) long run',file:'src/r6-program.mjs',find:"st.long=st0.long===null?null:Math.min(st0.long,st.achieved.long??st0.long);",replace:"st.long=st0.long;",tests:[RUN]},
 {id:'M06',area:'rotation',what:'MAIN rows rotate on the calendar',file:'src/r6-program.mjs',find:"  if(r.role!=='ACCESSORY'||!r.alternatives?.length)continue;",replace:"  if(!r.alternatives?.length)continue;",tests:[STR]},
 {id:'M07',area:'rotation',what:'COACH_DECIDES turns at every block boundary',file:'src/r6-program.mjs',find:"blockStart(i)&&i-last>=rot.everyWeeks",replace:"blockStart(i)",tests:[STR]},
 {id:'M08',area:'interference',what:'CMP.I11 never costs',file:'src/r6-balanced.mjs',find:"  if(cmpI11&&b.s.prescription?.modality==='RUN'",replace:"  if(false&&cmpI11&&b.s.prescription?.modality==='RUN'",tests:[HYB,BIND]},
 {id:'M09',area:'progression',what:'novice density released without executed evidence',file:'src/r6-program.mjs',find:"  const ok=assumeLogged||ids.length>0&&",replace:"  const ok=true||ids.length>0&&",tests:[STR]},
 {id:'M10',area:'eligibility',what:'band and assistance rows carry kilograms',file:'src/r6-prescription.mjs',find:"unit:ordinal?'LEVEL':'BODYWEIGHT'",replace:"unit:ordinal?'KG':'BODYWEIGHT'",tests:[STR,BIND]},
 {id:'M11',area:'progression',what:'familiar bouts count as executed threshold sessions',file:'src/r6-program.mjs',find:"   if(P.quality&&done('QUALITY')&&!smallReferenceStep&&!bouts){",replace:"   if(P.quality&&done('QUALITY')&&!smallReferenceStep){",tests:[RUN]},
 {id:'M12',area:'eligibility',what:'strides optional only for EASY_LOW and NOVICE (the frozen runtime)',file:'src/r6-program.mjs',find:"export const stridesOptional=(sk,rs=null)=>['EASY_LOW','WALK_JOG','RESTART'].includes(sk.cap.run.class)||['NONE','NOVICE'].includes(sk.c.athlete.runExperience)||",replace:"export const stridesOptional=(sk,rs=null)=>sk.cap.run.class==='EASY_LOW'||sk.c.athlete.runExperience==='NOVICE'||false&&",tests:[RUN]},
 {id:'M13',area:'return ceilings',what:'graduation applied in return steps',file:'src/r6-program.mjs',find:"if(grad&&grad.fromWeek<=w+1&&st.mode==='EASY'&&!st.qualityRunner",replace:"if(grad&&grad.fromWeek<=w+1&&!st.qualityRunner",tests:[RUN]},
 {id:'M14',area:'progression',what:'a ladder step may skip its chain',file:'src/r6-adaptation.mjs',find:"&&!inUse.has(y)&&ladderNext(x).includes(y)&&",replace:"&&!inUse.has(y)&&",tests:[STR]},
 {id:'M15',area:'interference',what:'content reduction under a STRENGTH lead',file:'src/r6-program.mjs',find:"allowsCandidate(sk.repertoire??DEFAULT_REPERTOIRE,'B0-C11')&&lead==='RUN'&&roles.some(",replace:"allowsCandidate(sk.repertoire??DEFAULT_REPERTOIRE,'B0-C11')&&lead!=='JOINT'&&roles.some(",tests:[HYB]}
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
const report={check:'R7B-MUTATION',mutants:results.length,killed:results.filter(r=>r.result==='KILLED').length,survived:results.filter(r=>r.result==='SURVIVED').map(r=>r.id),invalid:results.filter(r=>['INVALID','ERROR'].includes(r.result)).map(r=>r.id),sourceRestored:clean,results};
if(process.argv.includes('--write'))fs.writeFileSync(new URL('r7/b/MUTATION_R7B.json',root),JSON.stringify(report,null,1)+'\n');
console.log(JSON.stringify({mutants:report.mutants,killed:report.killed,survived:report.survived,invalid:report.invalid,sourceRestored:clean}));
