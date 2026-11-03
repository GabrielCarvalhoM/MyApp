// R7-D Phase 3.1 engineering check: adversarial mutants of the interruption-persistence delta (r6-adaptation.mjs), beyond the author's six.
// Each mutant is applied to a scratch copy of CoachingCore; the directed file (test/r7d-phase31.test.mjs) runs first; a mutant it does not kill
// runs against the whole suite when --full is given. A mutant that survives everything is a test gap (it may still be behaviour-neutral: the
// persistence probe says which).
//   node qe31-mutation.mjs --root <dir holding CoachingCore and the records it reads> --work <empty scratch dir> --out <file> [--full] [--only ID,ID]
// It never writes under --root.
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';

const arg=k=>{const i=process.argv.indexOf(k);return i>=0?process.argv[i+1]:null;};
const root=path.resolve(arg('--root')),work=path.resolve(arg('--work')),outFile=arg('--out'),full=process.argv.includes('--full'),only=arg('--only')?.split(',')??null;
const F='src/r6-adaptation.mjs',TEST='test/r7d-phase31.test.mjs';
const M=[
 {id:'QM31-01',what:'the clinical-flag early return does not keep the break it declares',from:"return recipe',keep({}));",to:"return recipe',{});"},
 {id:'QM31-02',what:'the eligibility question does not keep the break it declares',from:"unknown is neither clearance nor illness',keep({missingInputs:missing}));",to:"unknown is neither clearance nor illness',{missingInputs:missing});"},
 {id:'QM31-03',what:'the post-race eligibility question does not keep the break it declares',from:"before the next steps',keep({missingInputs:['eligibility.assessedOnOrAfterRace']}));",to:"before the next steps',{missingInputs:['eligibility.assessedOnOrAfterRace']});"},
 {id:'QM31-04',what:'a standing clinical route or a generic RECOVERED question does not keep the break it declares',from:"(guard.status==='HOLD'?x=>x:keep)",to:"(x=>x)"},
 {id:'QM31-05',what:'a row declared after the decision clock is read',from:"&&Date.parse(r.declaredAt)<=at&&",to:"&&"},
 {id:'QM31-06',what:'a return decided at the same instant as the declaration does not apply it',from:"d.action==='REESTABLISH'&&Date.parse(d.asOf)>=Date.parse(latest.declaredAt)",to:"d.action==='REESTABLISH'&&Date.parse(d.asOf)>Date.parse(latest.declaredAt)"},
 {id:'QM31-07',what:'an early return keeps only the new row and drops the carried record',from:"actualLedger:[...clone(input.actualLedger??[]),declared]",to:"actualLedger:[declared]"},
 {id:'QM31-08',what:'declared-break rows are passed to execution normalization',from:"clone(review.actualLedger.filter(o=>!isDeclaration(o)))",to:"clone(review.actualLedger)"},
 {id:'QM31-09',what:'the evidence reducer (canonicalRecord) reads declared-break rows',from:"filter(o=>o&&typeof o==='object'&&!isDeclaration(o)),op=authority.policy.operational;",to:"filter(o=>o&&typeof o==='object'),op=authority.policy.operational;"},
 {id:'QM31-10',what:'another athlete\'s row is read',from:"carried.filter(r=>r.athleteId===program.athleteId&&typeof r.eventId==='string'",to:"carried.filter(r=>typeof r.eventId==='string'"},
 {id:'QM31-11',what:'a row whose facts do not match its hash is read',from:"&&r.inputHash===hash(r.interruption));",to:");"},
 {id:'QM31-12',what:'a break that begins after its review is recorded',from:"if(isoDay(i.startDate)&&i.startDate>localDate(asOf,program.timezoneOffsetMinutes??0)||startedAt&&Date.parse(startedAt)>Date.parse(asOf))return null;",to:""},
 {id:'QM31-13',what:'a template of empty fields is recorded',from:"if(!statesBreak(review)||carried.some",to:"if(!declaresBreak(review)||carried.some"},
 {id:'QM31-14',what:'a replay of the same report adds a second row',from:"||carried.some(r=>r.eventId===review.event.id))return null;",to:")return null;"},
 {id:'QM31-15',what:'the applying return is not named by the report that declared the break',from:"if(retained)ctx.declaredBy=",to:"if(false)ctx.declaredBy="},
 {id:'QM31-16',what:'the decision path does not carry the rows it read (they vanish after one decision)',from:"...n.supersededRows,...clone(carried),...(declared?[declared]:[])]",to:"...n.supersededRows,...(declared?[declared]:[])]"},
 {id:'QM31-17',what:'a review with a template interruption reads the kept break instead of asking about its own template',from:"const retained=asOf&&!declaresBreak(input)?",to:"const retained=asOf&&!statesBreak(input)?"}
];
fs.rmSync(path.join(work,'CoachingCore'),{recursive:true,force:true});
fs.cpSync(path.join(root,'CoachingCore'),path.join(work,'CoachingCore'),{recursive:true});
if(fs.existsSync(path.join(root,'audits'))&&!fs.existsSync(path.join(work,'audits')))fs.cpSync(path.join(root,'audits'),path.join(work,'audits'),{recursive:true,filter:p=>!/domain-coaching-r7-d-2026-11-02/.test(p)});
const cc=path.join(work,'CoachingCore'),file=path.join(cc,F),orig=fs.readFileSync(file,'utf8');
const run=args=>{const r=spawnSync(process.execPath,['--test',...args],{cwd:cc,encoding:'utf8',maxBuffer:1<<28,timeout:1800000});const n=k=>Number(r.stdout.match(new RegExp('ℹ '+k+' (\\d+)'))?.[1]??NaN);return {tests:n('tests'),pass:n('pass'),fail:n('fail'),failed:[...new Set([...r.stdout.matchAll(/^✖ ([^\n]*?) \(\d/gm)].map(m=>m[1].slice(0,120)))]};};
const results=[];
try{
 const baseline=run([TEST]);
 for(const m of M){
  if(only&&!only.includes(m.id))continue;
  const n=orig.split(m.from).length-1;
  if(n!==1){results.push({...m,applied:false,occurrences:n});continue;}
  fs.writeFileSync(file,orig.replace(m.from,m.to));
  const directed=run([TEST]);
  const suite=directed.fail>0||!full?null:run([]);
  fs.writeFileSync(file,orig);
  results.push({id:m.id,what:m.what,applied:true,directed:{tests:directed.tests,fail:directed.fail,failed:directed.failed},suite:suite?{tests:suite.tests,fail:suite.fail,failed:suite.failed}:null,
   verdict:directed.fail>0?'KILLED_BY_DIRECTED':suite?(suite.fail>0?'KILLED_BY_SUITE':'SURVIVED_SUITE'):'SURVIVED_DIRECTED (suite not run)'});
  console.error(m.id,results.at(-1).verdict);
 }
 const out={probe:'qe31-mutation',root,baseline,mutants:results,summary:{mutants:results.length,killedByDirected:results.filter(r=>r.verdict==='KILLED_BY_DIRECTED').map(r=>r.id),killedBySuite:results.filter(r=>r.verdict==='KILLED_BY_SUITE').map(r=>r.id),survived:results.filter(r=>/^SURVIVED/.test(r.verdict??'')).map(r=>r.id)}};
 if(outFile)fs.writeFileSync(outFile,JSON.stringify(out,null,1)+'\n');
 console.log(JSON.stringify(out.summary,null,1));
}finally{fs.writeFileSync(file,orig);}
