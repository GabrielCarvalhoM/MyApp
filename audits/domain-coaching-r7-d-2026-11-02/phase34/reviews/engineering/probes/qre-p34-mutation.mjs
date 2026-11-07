// QRE R7-D Phase 3.4: targeted mutations complementary to P34-M1..M13 (the author's set). Each mutant is built in its own NEW directory under
// --work (created here, never reused, nothing deleted), from the candidate scratch copy --from; the directed tests run there.
//   node qre-p34-mutation.mjs --from <candidate scratch root> --work <new scratch dir> --out <file> [--only Q01,Q02]
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';

const arg=k=>{const i=process.argv.indexOf(k);return i>=0?process.argv[i+1]:null;};
const from=arg('--from'),work=arg('--work'),outFile=arg('--out'),only=arg('--only')?.split(',')??null;
if(!from||!work||!outFile)throw new Error('--from, --work and --out are required');
if(fs.existsSync(work))throw new Error('--work must be a new directory: '+work);
fs.mkdirSync(work);
const A='CoachingCore/src/r6-adaptation.mjs',C='CoachingCore/src/r6-composition.mjs';
const TESTS=['test/r7d-phase34.test.mjs','test/r7d-phase33.test.mjs','test/r7d-phase32.test.mjs','test/r7d-phase31.test.mjs'];
const COPY=['CoachingCore/package.json','CoachingCore/SHADOW_INPUT_SCHEMA.json','CoachingCore/SHADOW_DECISION_SCHEMA.json','CoachingCore/POLICY_REGISTRY_RUNTIME_BINDINGS.json',
 'CoachingCore/src','CoachingCore/node_modules','CoachingCore/fixtures','CoachingCore/r2/POSITIVE_PRESCRIPTION_REGISTRY.json','CoachingCore/r2/SHADOW_INPUT_R2_SCHEMA.json','CoachingCore/r2/SSCTR_RUNTIME_AUTHORITY.json',
 'CoachingCore/r3/CANONICAL_COACHING_INPUT_R3_SCHEMA.json','CoachingCore/r3/BOUNDED_POLICY_CANDIDATES_R3.json','CoachingCore/r4/PRESCRIPTION_ENVELOPE_REGISTRY.json','CoachingCore/r5/PROGRAM_POLICY_R5.json',
 'CoachingCore/r6/PROGRAM_POLICY_R6.json','CoachingCore/r6/fixtures','CoachingCore/r7/b0','CoachingCore/r7/b/fixtures',...TESTS.map(t=>'CoachingCore/'+t),
 'audits/domain-closure-r3-2026-10-24/reviews/ssctr-records.json','audits/domain-closure-r4-2026-10-25/reviews/ssctr-envelope-review.json','audits/domain-coaching-r5-2026-10-25/reviews/ssctr-policy-review.json',
 'audits/domain-coaching-r6-2026-10-26/reviews/ssctr-policy-review.json','audits/domain-coaching-r7-b0-2026-10-31/reviews/SSCTR_RECHECK_B0.json'];
const MUTANTS=[
 {id:'Q01',file:A,find:'if((by.sport.RUN||by.sport.STRENGTH)&&!appliedBetween(ctx,x.end,start)){',repl:'if((by.sport.RUN||by.sport.STRENGTH)){',defect:'the applied-return guard (QE-R7D-P33-03) removed: an own return is reconstructed across an applied return'},
 {id:'Q02',file:A,find:"o.actual?.completed===true&&!['ADVERSE','CONFLICTING'].includes(kindOf(o))));",repl:'o.actual?.completed===true));',defect:'BR-Q4: a race touch or race with an adverse or conflicting response still re-enters running'},
 {id:'Q03',file:A,find:'rows=(ctx.fullLedger??ctx.ledger).filter(o=>!o.conflicted&&Date.parse(o.observedAt)<cut);',repl:'rows=(ctx.fullLedger??ctx.ledger).filter(o=>!o.conflicted);',defect:'BR-Q4/BR-Q5: a race reported only after the later stop began still re-enters running'},
 {id:'Q04',file:A,find:'rows=(ctx.fullLedger??ctx.ledger).filter(o=>!o.conflicted&&Date.parse(o.observedAt)<cut);',repl:'rows=(ctx.fullLedger??ctx.ledger).filter(o=>Date.parse(o.observedAt)<cut);',defect:'a conflicted race report re-enters running'},
 {id:'Q05',file:A,find:'if(cause)return {decision:episodeClinical(',repl:'if(false&&cause)return {decision:episodeClinical(',defect:'R-F08-1 dropped in the re-read of a recorded return (recordedStop)'},
 {id:'Q06',file:A,find:'  if(g.clinicalCause)return {decision:episodeClinical(g,tz)};\n',repl:'',defect:'R-F08-1 dropped for an earlier separate break whose report in force restates it (separateStop)'},
 {id:'Q07',file:A,find:'return stated??review?.[EPISODE_CLINICAL]??null;',repl:'return review?.[EPISODE_CLINICAL]??stated??null;',defect:'the episode route takes precedence over a clinical reason the review states (reason text only)'},
 {id:'Q08',file:A,find:'day=onDate(x.end,1),asOf=',repl:'day=onDate(x.end,0),asOf=',defect:'BR-Q1.3: the own return point is the last day of x, not the day after it'},
 {id:'Q09',file:A,find:'if(!x||x.inputHash!==b.inputHash)return {decision:',repl:'if(!x)continue;if(x.inputHash!==b.inputHash)return {decision:',defect:'a re-read silently drops an earlier break whose declaration is missing from the record sent (no ASK)'},
 {id:'Q10',file:A,find:'stopInOwnReturn:own.within.get(x.g.identity)??null',repl:'stopInOwnReturn:null',defect:'CF-P34-05 record: a break inside an own return loses its placement there'},
 {id:'Q11',file:A,find:'list.filter(x=>!placed(x)||ownRow(x))',repl:'list.filter(x=>!placed(x))',defect:'the OWN_RETURN break\'s days are not declared to the composition as a known stop'},
 {id:'Q12',file:A,find:"const between=s=>s.date>after&&(s.date<before||!!startedAt&&s.date===before);",repl:"const between=s=>s.date>after&&s.date<=before;",defect:'BR-Q5: a session on the later break\'s first day is a candidate even without a stated start time'},
 {id:'Q13',file:A,find:'material:withOwn.material||history.material};',repl:'material:withOwn.material};',defect:'the same-day strength question ignores the re-entered sport\'s history'},
 {id:'Q14',file:C,find:'const beforeRet=beforeReturn(next,returned(fromWeek))',repl:'const beforeRet=(r=>s=>!!r&&s.date<r.day)(returned(fromWeek))',defect:'SSCTR-P34-F01: a same-day session already past at the return clock is still credited to the ceiling'},
 {id:'Q15',file:C,find:'const beforeRet=beforeReturn(next,returned(fromWeek))',repl:'const beforeRet=beforeReturn(next,fromWeek===w&&returnDay?{day:returnDay,asOf:ctx.asOf}:null)',defect:'SSCTR-P34-F01: the ceiling fix only for the return\'s own composition, not a later re-plan of the return week'},
 {id:'Q16',file:A,find:"asOf=new Date(Date.parse(day+'T00:00:00Z')-tz*60000).toISOString();",repl:"asOf=new Date(Date.parse(day+'T00:00:00Z')).toISOString();",defect:'the own return point ignores the athlete\'s time zone'},
 {id:'Q17',file:A,find:"cut=Date.parse(startedAt??new Date(Date.parse(before+'T00:00:00Z')-tz*60000).toISOString())",repl:"cut=Date.parse(startedAt??new Date(Date.parse(before+'T00:00:00Z')+tz*60000).toISOString())",defect:'the race-key history cut uses the wrong time-zone sign'}
];
const out={mutation:'QRE-P34-MUTATION-1',from,work,tests:TESTS,baseline:null,mutants:[]};
const build=dir=>{for(const p of COPY){const s=path.join(from,p),d=path.join(dir,p);if(!fs.existsSync(s))throw new Error('missing in --from: '+p);fs.mkdirSync(path.dirname(d),{recursive:true});fs.cpSync(s,d,{recursive:true});}};
const test=dir=>{const r=spawnSync(process.execPath,['--test',...TESTS],{cwd:path.join(dir,'CoachingCore'),encoding:'utf8',maxBuffer:64*1024*1024,timeout:900000});const t=r.stdout??'';
 const n=k=>Number((t.match(new RegExp('^ℹ '+k+' (\\d+)','m'))??[])[1]??NaN);
 return {pass:n('pass'),fail:n('fail'),failed:[...t.matchAll(/^✖ (.+?) \(\d/mg)].map(m=>m[1]).filter((x,i,a)=>a.indexOf(x)===i).slice(0,12)};};
const b=path.join(work,'baseline');fs.mkdirSync(b);build(b);out.baseline=test(b);
for(const m of MUTANTS){
 if(only&&!only.includes(m.id))continue;
 const dir=path.join(work,'m-'+m.id);fs.mkdirSync(dir);build(dir);
 const f=path.join(dir,m.file),src=fs.readFileSync(f,'utf8'),count=src.split(m.find).length-1;
 if(count!==1){out.mutants.push({id:m.id,defect:m.defect,applied:false,reason:'find string occurs '+count+' times'});continue;}
 fs.writeFileSync(f,src.replace(m.find,m.repl));
 const r=test(dir);out.mutants.push({id:m.id,file:m.file,defect:m.defect,applied:true,...r,killed:r.fail>0});
 fs.writeFileSync(outFile,JSON.stringify(out,null,1)+'\n');
}
out.summary={applied:out.mutants.filter(m=>m.applied).length,killed:out.mutants.filter(m=>m.killed).length,survived:out.mutants.filter(m=>m.applied&&!m.killed).map(m=>m.id)};
fs.writeFileSync(outFile,JSON.stringify(out,null,1)+'\n');
console.log(JSON.stringify(out.summary));
