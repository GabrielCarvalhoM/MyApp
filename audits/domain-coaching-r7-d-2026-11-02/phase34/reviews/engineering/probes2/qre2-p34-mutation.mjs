// QRE R7-D Phase 3.4 recheck (QRE-R7D-PHASE34-CHECK-r2): targeted mutations of candidate 46934a0's bounded-cycle code. Each mutant is built in its own
// NEW directory under --work (created here, never reused, nothing deleted) from the candidate scratch copy --from; the four directed files run there.
//   node qre2-p34-mutation.mjs --from <candidate scratch root> --work <new scratch dir> --out <file> [--only N01,N02]
// Sets: CQ2-* repeat the author's M18-M23 on an independent copy (each must fail its witness test); Q* are the r1 survivors re-applied to the new bytes;
// N* are new mutants of the five runtime changes.
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
 // CQ-2 on an independent copy (the author's M18-M23 strings); witness = the test that must fail.
 {id:'CQ2-M18',witness:'T27',file:A,find:"o.actual?.completed===true&&!o.partial&&!['ADVERSE','CONFLICTING'].includes(kindOf(o))",repl:'o.actual?.completed===true&&!o.partial',defect:'QRE Q02: an adverse or conflicting race touch or race still re-enters running'},
 {id:'CQ2-M19',witness:'T27',file:A,find:'rows=(ctx.fullLedger??ctx.ledger).filter(o=>!o.conflicted&&Date.parse(o.observedAt)<cut);',repl:'rows=(ctx.fullLedger??ctx.ledger).filter(o=>!o.conflicted);',defect:'QRE Q03: a race observed after the later stop began re-enters running'},
 {id:'CQ2-M20',witness:'T28',file:A,find:'if(!x||x.inputHash!==b.inputHash)return {decision:',repl:'if(!x)continue;if(x.inputHash!==b.inputHash)return {decision:',defect:'QRE Q09: a missing declaration is dropped silently'},
 {id:'CQ2-M21',witness:'T29',file:A,find:'const between=s=>s.date>after&&(s.date<before||!!startedAt&&s.date===before);',repl:'const between=s=>s.date>after&&s.date<=before;',defect:'QRE Q12: a session on the later break\'s first day counts without a start time'},
 {id:'CQ2-M22',witness:'T30',file:A,find:'stopInOwnReturn:own.within.get(x.g.identity)??null',repl:'stopInOwnReturn:null',defect:'QRE Q10: stopInOwnReturn lost'},
 {id:'CQ2-M23',witness:'T26',file:A,find:'const first=head.start??onDate(head.end,-(head.days-1));',repl:'const first=head.start;',defect:'QRE-P34-01 reverted'},
 // r1 survivors and kills re-applied to the new bytes.
 {id:'Q01',file:A,find:'if((by.sport.RUN||by.sport.STRENGTH)&&!appliedBetween(ctx,x.end,start,H.g.identity)){',repl:'if((by.sport.RUN||by.sport.STRENGTH)){',defect:'the applied-return guard removed'},
 {id:'Q04',file:A,find:'rows=(ctx.fullLedger??ctx.ledger).filter(o=>!o.conflicted&&Date.parse(o.observedAt)<cut);',repl:'rows=(ctx.fullLedger??ctx.ledger).filter(o=>Date.parse(o.observedAt)<cut);',defect:'a conflicted race report re-enters running (the request: not reachable, asked as unreported first)'},
 {id:'Q11',file:A,find:'list.filter(x=>!placed(x)||ownRow(x))',repl:'list.filter(x=>!placed(x))',defect:'the OWN_RETURN break\'s days not declared to the composition as a known stop'},
 {id:'Q13',file:A,find:'material:withOwn.material||history.material};',repl:'material:withOwn.material};',defect:'the same-day strength question ignores the re-entered sport\'s history'},
 {id:'Q14',file:C,find:'const beforeRet=beforeReturn(next,returned(fromWeek))',repl:'const beforeRet=(r=>s=>!!r&&s.date<r.day)(returned(fromWeek))',defect:'ceiling: a same-day session already past at the return clock is credited'},
 {id:'Q15',file:C,find:'const beforeRet=beforeReturn(next,returned(fromWeek))',repl:'const beforeRet=beforeReturn(next,fromWeek===w&&returnDay?{day:returnDay,asOf:ctx.asOf}:null)',defect:'ceiling fix only for the return\'s own composition'},
 // New: the five runtime changes of the cycle.
 {id:'N01',file:A,find:'RUN:required(x)&&(!gated(x)||d.RUN===true)&&raced(x)',repl:'RUN:(!gated(x)||d.RUN===true)&&raced(x)',defect:'F03: a week with only optional runs (no gated run, no race key) re-enters running'},
 {id:'N02',file:A,find:'RUN:required(x)&&(!gated(x)||d.RUN===true)&&raced(x)',repl:'RUN:required(x)&&raced(x)',defect:'F03: the reducer\'s gated completion is no longer required when the week holds a race key'},
 {id:'N03',file:A,find:'if(r.material&&!by.sport.STRENGTH){',repl:'if(r.material){',defect:'F04: asked even when strength re-entered by its own week'},
 {id:'N04',file:A,find:'question:{episodeId:b.g.identity,startDate:r.sub.start}',repl:'question:{episodeId:H.g.identity,startDate:r.sub.start}',defect:'F04: the question names the latest break, not the earlier one'},
 {id:'N05',file:A,find:'startedAt,startBreak:at,continuous',repl:'startedAt,startBreak:H,continuous',defect:'F04: the question names the own return\'s head, not the break that starts its stop (R03 shape)'},
 {id:'N06',file:A,find:'if(r.material&&!by.sport.STRENGTH){',repl:'if(r.material&&!by.sport.RUN){',defect:'F04: the condition reads the wrong sport'},
 {id:'N07',file:A,find:'!appliedBetween(ctx,x.end,start,H.g.identity)',repl:'!appliedBetween(ctx,x.end,start,x.g.identity)',defect:'F01: the guard excepts the earlier break, not the break being read'},
 {id:'N08',file:A,find:'const first=head.start??onDate(head.end,-(head.days-1));',repl:'const first=head.start??onDate(head.end,-head.days);',defect:'QRE-P34-01: the first day one day early'},
 {id:'N09',file:A,find:"o.actual?.completed===true&&!o.partial&&!['ADVERSE','CONFLICTING'].includes(kindOf(o))",repl:"o.actual?.completed===true&&(!o.partial||s.role==='RACE_TOUCH')&&!['ADVERSE','CONFLICTING'].includes(kindOf(o))",defect:'F02: a partial race touch still counts'},
 {id:'N10',file:A,find:"o.actual?.completed===true&&!o.partial&&!['ADVERSE','CONFLICTING'].includes(kindOf(o))",repl:"o.actual?.completed===true&&(!o.partial||s.role==='RACE')&&!['ADVERSE','CONFLICTING'].includes(kindOf(o))",defect:'F02: a partial race still counts (the race\'s minutes are exempt: possibly equivalent)'}
];
const out={mutation:'QRE2-P34-MUTATION-1',from,work,tests:TESTS,baseline:null,mutants:[]};
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
 const r=test(dir),witnessFailed=m.witness?r.failed.some(x=>x.startsWith('R7-D Phase 3.4 '+m.witness+' ')):null;
 out.mutants.push({id:m.id,file:m.file,defect:m.defect,applied:true,...r,killed:r.fail>0,...(m.witness?{witness:m.witness,witnessFailed}:{})});
 fs.writeFileSync(outFile,JSON.stringify(out,null,1)+'\n');
}
out.summary={applied:out.mutants.filter(m=>m.applied).length,killed:out.mutants.filter(m=>m.killed).length,survived:out.mutants.filter(m=>m.applied&&!m.killed).map(m=>m.id),notApplied:out.mutants.filter(m=>!m.applied).map(m=>m.id),
 cq2WitnessFailed:out.mutants.filter(m=>m.witness).map(m=>m.id+':'+m.witnessFailed)};
fs.writeFileSync(outFile,JSON.stringify(out,null,1)+'\n');
console.log(JSON.stringify(out.summary));
