// R7-D Phase 3.2 engineering check (R7D-ENGINEERING-PHASE32-CHECK-1): the judge's own mutants of the Phase 3.2 runtime delta, beyond the author's
// eight. Each is applied to a scratch copy (never to the repository); the Phase 3.2 and 3.1 directed files run first, and a mutant they do not
// kill runs the whole suite. A mutant the whole suite does not kill is a TEST_GAP (reported, not a runtime finding by itself).
//   node qe-p32-mutants.mjs --cc <scratch CoachingCore (with node_modules and the five review records beside it)> --out <file> [--only ID,ID]
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';

const arg=k=>{const i=process.argv.indexOf(k);return i>=0?process.argv[i+1]:null;};
const cc=path.resolve(arg('--cc')),out=arg('--out'),only=arg('--only')?.split(',')??null;
if(!cc||!out)throw Error('--cc <dir> --out <file>');
const F=path.join(cc,'src/r6-adaptation.mjs');
const M=[
 {id:'QM32-01',what:'exact replay never joins (the facts key ignored)',from:"if(a!==b&&(keys[a]===keys[b]||names[a]&&",to:"if(a!==b&&(false||names[a]&&"},
 {id:'QM32-02',what:'two reports naming the same episode are not joined',from:"names[a]===reports[b].eventId||names[a]===names[b])",to:"names[a]===reports[b].eventId)"},
 {id:'QM32-03',what:'an applied-replay or applied-correction group counts as unnamed',from:"named:!!name||applied,",to:"named:!!name,"},
 {id:'QM32-04',what:'touching days no longer reach the stop (only overlap does)',from:"if(x.end>=onDate(start,-1)){",to:"if(x.end>=start){"},
 {id:'QM32-05',what:'the replay check ignores the separate breaks a return recorded',from:"||(again.interruption?.separateBreaks??[]).some(b=>b.inputHash===hash(i))",to:""},
 {id:'QM32-06',what:'a conflicted report between two breaks counts as reported',from:"const reported=new Set((ctx.fullLedger??ctx.ledger).filter(o=>!o.conflicted).map(o=>o.sessionId)),stops",to:"const reported=new Set((ctx.fullLedger??ctx.ledger).map(o=>o.sessionId)),stops"},
 {id:'QM32-07',what:'sessions inside a recorded return’s stop are asked as unreported',from:"&&!stops.some(b=>s.date>=b.start&&s.date<=b.end)",to:""},
 {id:'QM32-08',what:'the head is the latest declared, not the latest ending',from:"const head=open.reduce((m,g)=>!m||end(g)>end(m)||end(g)===end(m)&&Date.parse(g.live.declaredAt)>=Date.parse(m.live.declaredAt)?g:m,null);",to:"const head=open.reduce((m,g)=>!m||Date.parse(g.live.declaredAt)>=Date.parse(m.live.declaredAt)?g:m,null);"},
 {id:'QM32-09',what:'a declaration at the same instant as a return is not applied by it',from:"const applied=r=>program.decisions.some(d=>d.action==='REESTABLISH'&&Date.parse(d.asOf)>=Date.parse(r.declaredAt));",to:"const applied=r=>program.decisions.some(d=>d.action==='REESTABLISH'&&Date.parse(d.asOf)>Date.parse(r.declaredAt));"},
 {id:'QM32-10',what:'an earlier separate break with an unclear or missing reason is not asked',from:"if(screen.status==='ASK')return {decision:{action:'ASK',reason:`${who}: ${screen.basis",to:"if(false)return {decision:{action:'ASK',reason:`${who}: ${screen.basis"},
 {id:'QM32-11',what:'the first break must be named too',from:"const unresolved=groups.filter((g,k)=>k>0&&!g.named);",to:"const unresolved=groups.filter((g,k)=>k>=0&&!g.named);"},
 {id:'QM32-12',what:'applied declarations are read again (double application)',from:"const reports=readable.filter(r=>!applied(r)).map(",to:"const reports=readable.filter(r=>true).map("},
 {id:'QM32-13',what:'an earlier separate break with invalid facts is read without asking',from:"if(f.invalid)return {decision:{action:'ASK',reason:`${who}: its facts",to:"if(false)return {decision:{action:'ASK',reason:`${who}: its facts"},
 {id:'QM32-14',what:'the review’s own re-sent facts are not read over the kept row (the record row stands)',from:"if(mine){mine.own=true;mine.i=input.interruption;}",to:"if(mine){mine.own=true;}"},
 {id:'QM32-15',what:'the relation is asked only for weekly reviews and return reports',from:"const keptAsk=kept?.ask==='INTERRUPTION_RELATION'?relationAsk(kept,kind,tz)",to:"const keptAsk=kept?.ask==='INTERRUPTION_RELATION'&&['WEEKLY_REVIEW','RETURN_AFTER_PAUSE'].includes(kind)?relationAsk(kept,kind,tz)"},
 {id:'QM32-16',what:'notApplied is not recorded on the return',from:"if(kept?.excluded?.length)ctx.notApplied=kept.excluded;",to:""},
 {id:'QM32-17',what:'with no break open, the other applied group is read instead of the review’s own',from:"if(open.length<=1){const g=open[0]??latest(groups);",to:"if(open.length<=1){const g=open[0]??groups[0];"},
 {id:'QM32-18',what:'separate breaks are added up (days summed, never one continuous stop)',from:"return {start,end:H.end,days:start===H.start?H.days:dayGap(start,H.end)+1,",to:"return {start,end:H.end,days:start===H.start?H.days:H.days+list.filter(x=>place.has(x.g)).reduce((s,x)=>s+x.days,0),"}
];
const run=args=>{const r=spawnSync(process.execPath,['--test',...args],{cwd:cc,encoding:'utf8',maxBuffer:1<<27,timeout:1800000});const n=k=>Number(r.stdout.match(new RegExp('ℹ '+k+' (\\d+)'))?.[1]??NaN);return {tests:n('tests'),pass:n('pass'),fail:n('fail'),failed:[...new Set([...r.stdout.matchAll(/^✖ ([^\n]*?) \(\d/gm)].map(m=>m[1]))].slice(0,12)};};
const DIRECTED=['test/r7d-phase32.test.mjs','test/r7d-phase31.test.mjs'];
const src=fs.readFileSync(F,'utf8'),results=[];
try{
 for(const m of M){
  if(only&&!only.includes(m.id))continue;
  const n=src.split(m.from).length-1;
  if(n!==1){results.push({id:m.id,what:m.what,applied:false,occurrences:n});continue;}
  fs.writeFileSync(F,src.replace(m.from,m.to));
  const d=run(DIRECTED);let s=null;
  if(d.fail===0)s=run([]);
  results.push({id:m.id,what:m.what,applied:true,directed:d,suite:s,killedBy:d.fail>0?'DIRECTED':s?.fail>0?'SUITE':null,survived:d.fail===0&&!(s?.fail>0)});
  fs.writeFileSync(F,src);
  console.log(m.id,results.at(-1).killedBy??'SURVIVED');
 }
}finally{fs.writeFileSync(F,src);}
fs.writeFileSync(out,JSON.stringify({probe:'R7D-ENG-P32-MUTANTS-1',cc,results,summary:{mutants:results.length,killedDirected:results.filter(r=>r.killedBy==='DIRECTED').map(r=>r.id),killedSuiteOnly:results.filter(r=>r.killedBy==='SUITE').map(r=>r.id),survived:results.filter(r=>r.survived).map(r=>r.id),notApplied:results.filter(r=>!r.applied).map(r=>r.id)}},null,1)+'\n');
