// Author probe (R7-A DECISION AUTHORITY): runs the two independent reviewers' own probes, unmodified and from their own folder, against one
// CoachingCore tree and reads each blocker's violation signal from their output. Usage:
//   node reproduce-blockers-r7ada.mjs [predecessor|live] [label]
// predecessor (default) = the byte-exact STATE-MODEL-CONSUMER-FREEZE-1 copy (state-consumer-freeze-source); live = CoachingCore/.
// Writes only runs/<label>/ (each probe's stdout, and BLOCKERS.json). For the predecessor it also compares every output with the run the
// reviewer cited, the `root`/`runtime` field (the reviewer's machine path) set aside.
import fs from 'node:fs';
import path from 'node:path';
import {spawn} from 'node:child_process';
import {createHash} from 'node:crypto';
const here=import.meta.dirname,repo=path.resolve(here,'../../..'),REV=path.join(repo,'audits/domain-coaching-r7a-state-consumer-2026-10-29/reviews');
const target=process.argv[2]??'predecessor',label=process.argv[3]??target;
const ROOT=target==='live'?path.join(repo,'CoachingCore'):path.join(here,'../state-consumer-freeze-source/CoachingCore');
const outDir=path.join(here,'runs',label);fs.mkdirSync(outDir,{recursive:true});
const sha=b=>createHash('sha256').update(b).digest('hex');
const qe=(name,script,env={})=>({name,script:path.join(REV,script),env:{QE_ROOT:ROOT,...env},cited:path.join(REV,'qe-r7asc-runs',name+'.out.json')});
const ss=(name,script)=>({name,script:path.join(REV,script),env:{SSCTR_CC:ROOT},cited:path.join(REV,'ssctr-r7asc-runs',name+'.out.json')});
const JOBS=[qe('P01','qe-r7asc-P01-stale-known-row-adoption.mjs'),qe('P01.w3kg24','qe-r7asc-P01-stale-known-row-adoption.mjs',{QE_W3KG:'24'}),qe('P01b','qe-r7asc-P01b-stale-known-row-robustness.mjs'),
 qe('P02','qe-r7asc-P02-run-view-e10.mjs'),qe('P02b','qe-r7asc-P02b-run-view-sweep.mjs'),qe('P05','qe-r7asc-P05-reentry-run-gate.mjs'),qe('P05b','qe-r7asc-P05b-reentry-basis.mjs'),
 qe('P07','qe-r7asc-P07-goal-change-two-readings.mjs'),ss('walkjog','ssctr-r7asc-walkjog-probe.mjs'),ss('walkjog-trace','ssctr-r7asc-walkjog-trace.mjs')];
const run=j=>new Promise(res=>{const t0=Date.now(),p=spawn(process.execPath,[j.script],{cwd:repo,env:{...process.env,...j.env}}),o=[],e=[];p.stdout.on('data',d=>o.push(d));p.stderr.on('data',d=>e.push(d));
 p.on('close',code=>{const stdout=Buffer.concat(o);fs.writeFileSync(path.join(outDir,j.name+'.out.json'),stdout);res({...j,exit:code,seconds:Math.round((Date.now()-t0)/1000),stdout,stderr:Buffer.concat(e).toString().slice(0,2000)});});});
const results=[];{const queue=[...JOBS];await Promise.all(Array.from({length:Number(process.env.CONC??5)},async()=>{while(queue.length)results.push(await run(queue.shift()));}));}
const by=Object.fromEntries(results.map(r=>[r.name,r]));
const parse=n=>{try{return JSON.parse(by[n].stdout.toString());}catch{return null;}};
const strip=o=>{if(!o)return o;const c=structuredClone(o);delete c.root;delete c.runtime;return c;};
const compare=Object.fromEntries(results.map(r=>{let cited=null;try{cited=JSON.parse(fs.readFileSync(r.cited,'utf8'));}catch{}return [r.name,{exit:r.exit,seconds:r.seconds,outSha256:sha(r.stdout),identicalToReviewerRunExceptRoot:cited?JSON.stringify(strip(cited))===JSON.stringify(strip(parse(r.name))):null}];}));
const P01=parse('P01'),P01k=parse('P01.w3kg24'),P01b=parse('P01b'),P02=parse('P02'),P02b=parse('P02b'),P05=parse('P05'),P05b=parse('P05b'),P07=parse('P07'),WJ=parse('walkjog');
const sweep=p=>p.cases_.filter(c=>c.identicalLedgers&&c.historyEqual&&(c.rowsDiffer||c.uAheadOfHistory.length)).map(c=>`k=${c.k} ${c.shape}: ${c.planDims.join(',')}`);
const blockers={
 'QE-R7ASC-01':{signal:'identical record, HistoricalState differs with when the correction reached the plan (stale KNOWN row adopted as history)',
  P01:P01.variants.map(v=>({variant:v.variant,sameRecord:v.sameRecordEarlyLate,sameHistoryAtWeek4:v.sameHistoryAtWeek4})),P01_24kg:P01k.variants.map(v=>({variant:v.variant,sameRecord:v.sameRecordEarlyLate,sameHistoryAtWeek4:v.sameHistoryAtWeek4})),
  P01b:{neverReviewed:{sameRecord:P01b.i_week3NeverReviewed.sameRecord,sameHistory:P01b.i_week3NeverReviewed.sameHistory},conflict:{sameRecord:P01b.ii_conflictTrigger.sameRecord,sameHistoryWeek3:P01b.ii_conflictTrigger.sameHistoryWeek3}}},
 'QE-R7ASC-02':{signal:'identical ledgers and identical history, yet the plan two weeks on differs or runs ahead of history (projected run progress used as earned)',
  P02:Object.fromEntries(['a_easy','b_walkjog','c_walkjogLongReturn'].map(k=>[k,{identicalLedgers:P02[k].identicalLedgers,historyEqual:P02[k].historyEqual,rowsDiffer:P02[k].rowsDiffer}])),
  P02b:Object.fromEntries(Object.entries(P02b.profiles).map(([k,v])=>[k,{cases:v.cases,violating:sweep(v)}])),
  // The finding's mechanism (QE review §QE-R7ASC-02: "U's plan is ahead of its own history"): cells with identical ledgers where the plan of the
  // unreviewed cell runs ahead of its own history. Listed beside the literal criterion, with each literal cell's rows, so its direction is visible.
  mechanism:Object.fromEntries(Object.entries(P02b.profiles).map(([k,v])=>[k,{planAheadOfHistory:v.cases_.filter(c=>c.identicalLedgers&&c.uAheadOfHistory.length).map(c=>`k=${c.k} ${c.shape}: ${c.uAheadOfHistory.join(',')}`)}])),
  literalCells:Object.values(P02b.profiles).flatMap(v=>v.cases_.filter(c=>c.identicalLedgers&&c.historyEqual&&(c.rowsDiffer||c.uAheadOfHistory.length)).map(c=>({k:c.k,shape:c.shape,planDims:c.planDims,uAheadOfHistory:c.uAheadOfHistory,U:c.U.rows,R:c.R.rows})))},
 'QE-R7ASC-03':{signal:'a missed long run in a RETURN week still steps the return; the return week is credited before its Sunday run exists',
  P05:Object.fromEntries(['MODERATE','LONG'].map(k=>[k,{missedLongStillSteps:P05.cases[k].missedLongStillSteps,creditedBeforeSundayExists:P05.cases[k].creditedBeforeSundayExists,missedGate:P05.cases[k].MISSED.closingReview.gates,nextWeekRunRowsMissed:P05.cases[k].MISSED.nextWeekRunRows,nextWeekRunRowsExec:P05.cases[k].EXEC.nextWeekRunRows}])),
  P05b:Object.fromEntries(Object.entries(P05b.cells).map(([k,v])=>[k,{basis:v.basis,run:v.run}]))},
 'QE-R7ASC-04':{signal:'identical record; week 5 dose depends on whether an unrelated equipment statement re-composed the week (two goal contexts)',P07:P07.summary},
 F4:{signal:'a walk/jog return after a HOLD or consolidation week resumes above the last step run (SHORT) or one below it (MODERATE)',walkjog:WJ.totals}};
const present={
 'QE-R7ASC-01':[...P01.variants,...P01k.variants].some(v=>v.sameRecordEarlyLate&&!v.sameHistoryAtWeek4)||(P01b.i_week3NeverReviewed.sameRecord&&!P01b.i_week3NeverReviewed.sameHistory)||(P01b.ii_conflictTrigger.sameRecord&&!P01b.ii_conflictTrigger.sameHistoryWeek3),
 'QE-R7ASC-02':Object.values(P02b.profiles).some(v=>sweep(v).length>0)||['a_easy','b_walkjog'].some(k=>P02[k].identicalLedgers&&P02[k].historyEqual&&P02[k].rowsDiffer),
 'QE-R7ASC-03':['MODERATE','LONG'].some(k=>P05.cases[k].missedLongStillSteps||P05.cases[k].creditedBeforeSundayExists)||P05b.cells.SUNDAY_PENDING.basis?.RUN==='COMPLETED_SESSIONS',
 'QE-R7ASC-04':P07.summary.pairsWithDivergence.length>0,
 F4:WJ.totals.aboveRecipeAfterSecondReturn>0};
// QE-R7ASC-02 by its mechanism alone (the plan of an unreviewed cell ahead of its own history), beside `present`, which applies the literal sweep.
const presentByMechanism={'QE-R7ASC-02':Object.values(P02b.profiles).some(v=>v.cases_.some(c=>c.identicalLedgers&&c.uAheadOfHistory.length))||['a_easy','b_walkjog'].some(k=>P02[k].identicalLedgers&&P02[k].historyEqual&&P02[k].rowsDiffer)};
const record={probe:'reproduce-blockers-r7ada',target,root:path.relative(repo,ROOT).split(path.sep).join('/'),node:process.version,ranAt:new Date().toISOString(),present,presentByMechanism,blockers,runs:compare};
fs.writeFileSync(path.join(outDir,'BLOCKERS.json'),JSON.stringify(record,null,1)+'\n');
console.log(JSON.stringify({target,present,runs:Object.fromEntries(Object.entries(compare).map(([k,v])=>[k,`exit ${v.exit}, ${v.seconds}s, identical ${v.identicalToReviewerRunExceptRoot}`]))},null,1));
