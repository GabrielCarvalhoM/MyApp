// COACHING CORE — STATE MODEL CONSUMER CLOSURE objective verification. Read-only unless --write, which writes only CoachingCore/r7/state-consumer/
// VERIFICATION_R7ASC.json. It runs the test suite and reads the evidence recorded on the frozen bytes (the author's and the judges' probes in
// audits/domain-coaching-r7a-state-consumer-2026-10-29/probes/EVIDENCE_RUNS_R7ASC.json, the SSCTR's own regression kit in probes/kit-final/RUNS.json,
// each output bound to the source digest it ran on). It never runs historical verifiers or writers. It proves the evidence chain; it does not make
// the mission READY: only the two independent reviews decide that.
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {hash} from '../src/value.mjs';
const root=path.resolve(import.meta.dirname,'../..'),abs=p=>path.join(root,p),exists=p=>fs.existsSync(abs(p));
const sha=p=>createHash('sha256').update(fs.readFileSync(abs(p))).digest('hex'),json=p=>JSON.parse(fs.readFileSync(abs(p),'utf8'));
const AUDIT='audits/domain-coaching-r7a-state-consumer-2026-10-29/',OUT='CoachingCore/r7/state-consumer/',PROBES=AUDIT+'probes/',RUNS=PROBES+'runs/',KIT=PROBES+'kit-final/',REVIEWS=AUDIT+'reviews/';
const SE_RUNS='audits/domain-coaching-r7a-state-evidence-2026-10-28/reviews/ssctr-r7ase-runs/',HP_RUNS='audits/domain-coaching-r7a-state-model-2026-10-28/reviews/ssctr-r7asm-runs/',QE_HP='audits/domain-coaching-r7a-state-model-2026-10-28/reviews/qe-r7asm-runs/';
const freezeFile=()=>fs.readdirSync(abs(OUT)).filter(f=>/^RUNTIME_FREEZE_.*\.json$/.test(f)).sort().at(-1),freeze=()=>json(OUT+freezeFile());
const checks=[],check=(id,fn)=>{try{const detail=fn();checks.push({id,pass:detail?.pass!==false,detail});}catch(e){checks.push({id,pass:false,detail:{error:e.message}});}};
const run=name=>json(RUNS+name+'.out.json'),kit=name=>json(KIT+name+'.out.json');
const strip=x=>Array.isArray(x)?x.map(strip):x&&typeof x==='object'?Object.fromEntries(Object.entries(x).filter(([k])=>!['at','runtime','root','generatedAt','tree','node'].includes(k)).map(([k,v])=>[k,strip(v)])):x;
// An instrument that prints text (x-trace-rot) is compared in full, byte for byte; a JSON one without its wall clocks and labels.
const outOf=p=>{const t=fs.readFileSync(abs(p),'utf8');try{return {json:strip(JSON.parse(t))};}catch{return {text:t};}};
const sameAs=(name,dir)=>JSON.stringify(outOf(KIT+name+'.out.json'))===JSON.stringify(outOf(dir+name+'.out.json'));
const sumShards=(prefix,n,pick)=>Array.from({length:n},(_,i)=>pick(kit(`${prefix}.shard${i}`))).reduce((a,b)=>a+b,0);
// This mission may change only these baseline files; the mission files only after their first consumer-closure block; new files only where listed.
const DELTA=['CoachingCore/src/r6-adaptation.mjs','CoachingCore/src/r6-program.mjs','CoachingCore/test/r7asm-state-model.test.mjs'];
const INSERT_ONLY={'CURRENT_MISSION.md':'<!-- DOMAIN_COACHING_R7ASC:','MISSION_LEDGER.md':'<!-- DCR7ASC-'};
const QUEUE='reviews/provisional-sports-science/2026-10-23/HUMAN_REVALIDATION_QUEUE.json';
const NEW_ALLOWED=[/^CoachingCore\/r7\/state-consumer\//,/^CoachingCore\/test\/r7asc-[^/]+\.test\.mjs$/,/^CoachingCore\/scripts\/(prepare|regress|freeze|verify)-r7asc\.mjs$/];
const PROTECTED_DIRS=['CoachingCore','product','canon','audits/domain-coaching-r6-2026-10-26','audits/domain-coaching-r7a-2026-10-27','audits/domain-coaching-r7a1-2026-10-27','audits/domain-coaching-r7a2-2026-10-28','audits/domain-coaching-r7a-final-2026-10-28','audits/domain-coaching-r7a-boundary-2026-10-28','audits/domain-coaching-r7a-state-evidence-2026-10-28','audits/domain-coaching-r7a-state-model-2026-10-28','audits/v1-wearable-scope-2026-10-27'];
const walk=(rel,out=[])=>{for(const e of fs.readdirSync(abs(rel),{withFileTypes:true})){const p=path.posix.join(rel,e.name);if(e.name==='node_modules')continue;if(e.isDirectory())walk(p,out);else out.push(p);}return out;};

check('baseline-preserved',()=>{
 const b=json(AUDIT+'BASELINE.json'),changed=b.entries.filter(e=>!exists(e.path)||sha(e.path)!==e.sha256).map(e=>e.path);
 const unexpected=changed.filter(p=>!DELTA.includes(p)&&!INSERT_ONLY[p]);
 const insertOnly=Object.entries(INSERT_ONLY).map(([p,marker])=>{const now=fs.readFileSync(abs(p)),at=now.indexOf(marker),base=b.entries.find(e=>e.path===p).sha256;let prefix=null;for(let n=Math.max(0,at-4);at>=0&&n<=at;n++)if(createHash('sha256').update(now.subarray(0,n)).digest('hex')===base)prefix=n;const unchanged=sha(p)===base;const tail=prefix===null?null:now.subarray(prefix);return {file:p,unchanged,prefixPreserved:unchanged||prefix!==null,prefixBytes:prefix,appendedBytes:tail?.length??null,carriageReturnsAppended:tail?tail.filter(x=>x===13).length:0};});
 const bound=new Set(b.entries.map(e=>e.path)),added=PROTECTED_DIRS.flatMap(d=>walk(d)).filter(p=>!bound.has(p)),addedOutside=added.filter(p=>!NEW_ALLOWED.some(r=>r.test(p)));
 return {pass:!unexpected.length&&insertOnly.every(x=>x.prefixPreserved&&x.carriageReturnsAppended===0)&&!addedOutside.length,entries:b.entries.length,changed,unexpected,insertOnly,addedFiles:added.length,addedOutside};
});
check('freeze-current',()=>{
 const f=freeze(),cc=p=>'CoachingCore/'+p,drift=Object.entries(f.files).filter(([p,h])=>!exists(cc(p))||sha(cc(p))!==h).map(([p])=>p);
 const now=[...fs.readdirSync(abs('CoachingCore/src')).filter(x=>x.endsWith('.mjs')).map(x=>'src/'+x),...fs.readdirSync(abs('CoachingCore/test')).filter(x=>x.endsWith('.mjs')).map(x=>'test/'+x)],unfrozen=now.filter(p=>!(p in f.files));
 const single=fs.readdirSync(abs(OUT)).filter(x=>/^RUNTIME_FREEZE_/.test(x)),digest=hash(Object.fromEntries(Object.keys(f.files).filter(p=>p.startsWith('src/')).map(p=>[p,sha(cc(p))])));
 return {pass:!drift.length&&!unfrozen.length&&single.length===1&&f.revision==='STATE-MODEL-CONSUMER-FREEZE-1'&&digest===f.sourceDigest&&hash(f.files)===f.manifestDigest,revision:f.revision,sourceDigest:f.sourceDigest,recomputed:digest,manifestDigest:f.manifestDigest,freezes:single,delta:f.deltaFromPredecessorFreeze,drift,unfrozen};
});
check('policy-unchanged',()=>{const p=json('CoachingCore/r6/PROGRAM_POLICY_R6.json'),h=hash(p);return {pass:h==='18ec48f34768a7eebb2aede618db65a77385efebbda0a38d6f03135e5cd96b4c'&&sha('CoachingCore/r6/PROGRAM_POLICY_R6.json')==='a75be1aae3818616888e641c104407926d5f16f213a04137f5b21024ccafe100',policyHash:h,revision:p.revision};});
check('tests',()=>{
 const r=spawnSync(process.execPath,['--test'],{cwd:abs('CoachingCore'),encoding:'utf8',maxBuffer:256*1024*1024}),n=k=>Number(r.stdout.match(new RegExp('ℹ '+k+' (\\d+)'))?.[1]??NaN);
 return {pass:r.status===0&&n('fail')===0,tests:n('tests'),passing:n('pass'),fail:n('fail'),node:process.version};
});
// The baseline reproduced the seven findings on HISTORICAL-PROJECTION-FREEZE-1 before any edit: the judges' outputs, byte for byte.
check('baseline-reproduced',()=>{
 const B=PROBES+'baseline/',files=fs.readdirSync(abs(B)).filter(f=>f.endsWith('.out.json')),cmp=json(B+'BASELINE_COMPARE.json');
 return {pass:cmp.allReproduced===true,probes:files.length,compare:cmp.summary??cmp};
});
// Every recorded probe output ran on the frozen bytes (the digest before and after the run), exited 0 and is unchanged since.
const bound=(record,dir,min)=>{const f=freeze(),e=json(record);
 const unbound=e.runs.filter(r=>!r.skipped&&(r.sourceDigestStart!==f.sourceDigest||r.sourceDigestEnd!==f.sourceDigest)).map(r=>r.name);
 const failed=e.runs.filter(r=>!r.skipped&&r.exit!==0).map(r=>r.name),skipped=e.runs.filter(r=>r.skipped).map(r=>r.name);
 const changed=e.runs.filter(r=>!r.skipped&&sha(dir+r.name+'.out.json')!==r.outSha256).map(r=>r.name);
 return {pass:!unbound.length&&!failed.length&&!skipped.length&&!changed.length&&e.runs.length>=min,runs:e.runs.length,unbound,failed,skipped,changed};};
check('evidence-runs-bound',()=>bound(PROBES+'EVIDENCE_RUNS_R7ASC.json',RUNS,50));
check('ssctr-kit-runs-bound',()=>bound(KIT+'RUNS.json',KIT,43));
// QE-R7ASM-01 (blocking) on the judge's own probes: a prescribed KNOWN load never becomes history, whether the record was corrected early or late,
// through a conflict, or read facts-only (Q3, Q3b, Q12a).
check('qe-r7asm-01-closed',()=>{
 const q3=run('qe-r7asm-Q3-known-row-setup'),q3b=run('qe-r7asm-Q3b-known-row-conflict'),q12=run('qe-r7asm-Q12-robustness');
 const v=Object.values(q3.variants).map(x=>({variant:x.variant,sameRecord:x.sameRecordEarlyLate,prescribedKnownLoadBecameHistory:x.prescribedKnownLoadBecameHistory,sameRecordDifferentHistory:x.sameRecordDifferentHistory}));
 const a=q12.a_factsOnly.historical;
 return {pass:v.length===4&&v.every(x=>x.sameRecord&&!x.prescribedKnownLoadBecameHistory&&!x.sameRecordDifferentHistory)&&q3b.sameRecord&&!q3b.prescribedKnownLoadBecameHistory&&!q3b.historiesDiffer&&a.stateLoad===null&&a.lastExecutedLoad===null,
  q3:v,q3b:{sameRecord:q3b.sameRecord,prescribedKnownLoadBecameHistory:q3b.prescribedKnownLoadBecameHistory,historiesDiffer:q3b.historiesDiffer},q12FactsOnly:a};
});
// QE-R7ASM-02 on the judge's own probes: with identical ledgers the plan's run equals history's in a LONG (RESTART) and a MODERATE return, and in
// every later week (Q4, Q4b).
check('qe-r7asm-02-closed',()=>{
 const q4=run('qe-r7asm-Q4-restart-view'),q4b=run('qe-r7asm-Q4b-restart-rows');
 const v=Object.entries(q4.variants).map(([k,x])=>({variant:k,identicalLedgers:x.identicalLedgers,planDiffersWithIdenticalLedgers:x.planDiffersWithIdenticalLedgers,historyEqual:x.historyEqual}));
 return {pass:v.every(x=>x.identicalLedgers&&!x.planDiffersWithIdenticalLedgers&&x.historyEqual)&&q4b.historyAlwaysEqual===true&&!q4b.firstWeekRowsDiffer&&!q4b.firstWeekPlanStateDiffers,q4:v,q4b:{historyAlwaysEqual:q4b.historyAlwaysEqual,firstWeekRowsDiffer:q4b.firstWeekRowsDiffer,firstWeekPlanStateDiffers:q4b.firstWeekPlanStateDiffers}};
});
// QE-R7ASM-03 on the judge's own probes: identical ledgers prescribe identical rows on the REPS_THEN_LOAD goals (Q11c; Q12b on GENERAL and
// RUNNING_SUPPORT).
check('qe-r7asm-03-closed',()=>{
 const q11=run('qe-r7asm-Q11c-reps-identical'),q12=run('qe-r7asm-Q12-robustness');
 const g=Object.fromEntries(Object.entries(q12.b_goals).map(([k,x])=>[k,{identicalLedgers:x.identicalLedgers,historyEqual:x.historyEqual,onlyU:x.onlyU.length,onlyR:x.onlyR.length}]));
 return {pass:q11.identicalLedgers&&q11.historyEqual&&!q11.rowDiff.onlyU.length&&!q11.rowDiff.onlyR.length&&Object.values(g).every(x=>x.identicalLedgers&&x.historyEqual&&!x.onlyU&&!x.onlyR),q11c:{identicalLedgers:q11.identicalLedgers,historyEqual:q11.historyEqual,onlyU:q11.rowDiff.onlyU.length,onlyR:q11.rowDiff.onlyR.length},q12Goals:g};
});
// QE-R7ASM-04 on the judge's own probes: the public reader applies a real correction (correctionOf) and never reads the retracted load (Q2, Q2b).
check('qe-r7asm-04-closed',()=>{
 const q2=run('qe-r7asm-Q2-correction'),q2b=run('qe-r7asm-Q2b-correction-load'),c=q2.cases.find(x=>x.form==='correctionOf');
 const same=JSON.stringify(c.historicalStateOf_onRecordAsReturned)===JSON.stringify(c.historicalStateOf_onRecordWithoutSupersededRows);
 return {pass:c.publicApiIgnoresCorrection===false&&same&&q2b.publicApiReadsRetractedLoad===false,publicApiIgnoresCorrection:c.publicApiIgnoresCorrection,recordAsReturnedEqualsWithoutSuperseded:same,publicApiReadsRetractedLoad:q2b.publicApiReadsRetractedLoad};
});
// F1 (D53, D57) on the SSCTR's own instruments: no covered count comes back more than one set above the largest executed since the break, on the
// restoration grid, the caps grid and its NONE/NOVICE extension; no cap rises or ends after a week whose last exposure was not whole (D56).
check('ssctr-f1-d53-d57-closed',()=>{
 const gB=sumShards('grid',4,o=>o.B.violations),gC=sumShards('grid',4,o=>o.C.violations),gA=sumShards('grid',4,o=>o.A.riseOrEnd),gA2=sumShards('grid',4,o=>o.A2.held);
 const cB=sumShards('caps',4,o=>o.B.violations),cJ=sumShards('caps',4,o=>o.J.covered),cx=[0,1].map(i=>kit('caps-ext.shard'+i)).reduce((n,o)=>n+o.B.violations,0);
 const cU=sumShards('caps',4,o=>Array.isArray(o.unexplained)?o.unexplained.length:(o.causes?.UNEXPLAINED??0));
 return {pass:gB===0&&gC===0&&gA===0&&gA2===0&&cB===0&&cJ===0&&cx===0&&cU===0,grid:{B:gB,C:gC,capRiseOrEndAfterNotWhole:gA,heldAfterWhole:gA2},caps:{B:cB,coveredJumps:cJ,unexplained:cU},capsExtensionB:cx};
});
// F2 on the SSCTR's own probe: every row of the repetition probe stays inside its goal's range (HOLD repeats the dose).
check('ssctr-f2-closed',()=>{
 const o=kit('reps'),rows=[],walkS=(x,out)=>{if(typeof x==='string'){if(/\d+x\d+@/.test(x))out.push(x);return;}if(x&&typeof x==='object')for(const v of Object.values(x))walkS(v,out);};
 const goals=Object.fromEntries(Object.entries(o.goals).map(([g,v])=>{const r=[];walkS(v,r);const [lo,hi]=v.repRange,bad=r.filter(s=>{const m=s.match(/ (\d+)x(\d+)@/);return m&&(Number(m[2])<lo||Number(m[2])>hi);});rows.push(...bad);return [g,{rows:r.length,outOfRange:bad.length}];}));
 return {pass:!rows.length&&Object.values(goals).every(x=>x.rows>0),goals,outOfRange:rows.slice(0,6)};
});
// F3 on the SSCTR's own trace: after the goal change to MAINTAIN (8-8) takes effect, no bench press or lat pulldown row is above 8 repetitions.
check('ssctr-f3-closed',()=>{
 const o=kit('trace-h25'),bad=[];let n=0;
 for(const k of ['stateModel.holdout','stateModel.fullRecord'])for(const st of o[k])for(const r of st.rows??[]){const m=r.match(/^w\d+ (\d{4}-\d{2}-\d{2}) (\S+) \d+x(\d+)@/);if(!m||m[1]<'2027-01-25')continue;n++;if(Number(m[3])>8)bad.push(k+': '+r.slice(0,90));}
 return {pass:n>0&&!bad.length,rowsAfterTheChange:n,aboveTheRange:bad.slice(0,6)};
});
// D56, D58, D59 and the other closed readings: the SSCTR's instruments the consumer closure does not touch are byte-identical to its accepted run
// on STATE-EVIDENCE-FREEZE-1; the first-week grids have no E, O or B in any class.
check('ssctr-d56-d58-d59-preserved',()=>{
 const same=['d58','short','firstweek','f-sameday','x-ceiling','x-rotation','x-sameday','x-trace-rot','caps-ext.shard0','caps-ext.shard1'].map(n=>({n,identical:sameAs(n,SE_RUNS)}));
 const fw=Array.from({length:8},(_,i)=>kit('x-firstweek.shard'+i)),bad=[];
 for(const o of fw)for(const [fam,v] of Object.entries(o.tally))for(const [cls,x] of Object.entries(v))for(const k of ['E','O','B'])if(x[k])bad.push(`${fam}.${cls}.${k}=${x[k]}`);
 return {pass:same.every(x=>x.identical)&&!bad.length,identicalToApprovedRun:same,firstWeekViolations:bad};
});
// The SSCTR instruments that differ from its accepted run differ only in the named classes (grid-explain for the restoration and caps grids,
// which read the same 864 timelines; x-items and x-firstweek: the goal range cut; x-trace-sd and the round-12 sections: the predecessor's changes the
// SSCTR read on it, with NF-R7ASM-1's section back to the accepted reading).
check('ssctr-differences-explained',()=>{
 const ex=[0,1,2,3].map(i=>run('grid-explain.shard'+i)),explained=ex.every(x=>x.allExplained===true);
 const lower=(a,b)=>a.replace(/(\d+)x(\d+)(?=@)/g,'$1xR')===b.replace(/(\d+)x(\d+)(?=@)/g,'$1xR');
 const xi=[],leaves=(x,y,p)=>{if(JSON.stringify(x)===JSON.stringify(y))return;if(x&&y&&typeof x==='object'&&typeof y==='object'){for(const k of new Set([...Object.keys(x),...Object.keys(y)]))leaves(x[k],y[k],p+'.'+k);return;}xi.push({p,x,y});};
 leaves(strip(kit('x-items')),strip(json(SE_RUNS+'x-items.out.json')),'x-items');
 const xiOk=xi.every(d=>typeof d.x==='string'&&typeof d.y==='string'&&lower(d.x,d.y)&&[...d.x.matchAll(/x(\d+)@/g)].every((m,i)=>Number(m[1])<=Number([...d.y.matchAll(/x(\d+)@/g)][i][1])));
 const dropRepsRow=o=>{const c=structuredClone(strip(o));for(const v of Object.values(c.tally??{}))for(const x of Object.values(v))delete x.REPS_ROW;if(c.examples)delete c.examples.REPS_ROW;return c;};
 const fw=Array.from({length:8},(_,i)=>JSON.stringify(dropRepsRow(kit('x-firstweek.shard'+i)))===JSON.stringify(dropRepsRow(json(SE_RUNS+'x-firstweek.shard'+i+'.out.json'))));
 const r12=json(KIT+'r12-instrument.data.json').sections,r12hp=json(HP_RUNS+'r12-instrument.data.json').sections,r12se=json(SE_RUNS+'r12-instrument.data.json').sections;
 const r12diffHp=Object.keys(r12).filter(k=>JSON.stringify(strip(r12[k]))!==JSON.stringify(strip(r12hp[k])));
 return {pass:explained&&xiOk&&fw.every(Boolean)&&sameAs('x-trace-sd',HP_RUNS)&&r12diffHp.length===1&&r12diffHp[0]==='V_D47reviews'&&JSON.stringify(strip(r12.V_D47reviews))===JSON.stringify(strip(r12se.V_D47reviews)),
  grid:ex.map(x=>({timelinesDifferingFromSE:x.timelinesDifferingFromSE,rows:x.rows})),xItems:{differences:xi.length,allRepetitionCutsOnly:xiOk},xFirstweekIdenticalBesidesRepsRow:fw,xTraceSdIdenticalToPredecessor:sameAs('x-trace-sd',HP_RUNS),round12:{differFromPredecessor:r12diffHp,d47BackToApprovedReading:JSON.stringify(strip(r12.V_D47reviews))===JSON.stringify(strip(r12se.V_D47reviews))}};
});
// The earlier blockers stay closed on their judges' own probes (as the state model closure checked them).
check('earlier-blockers-closed',()=>{
 const p51d=run('qe-r7ase-P51d'),IDS=['db-rdl','db-split-squat'];
 const v=Object.entries(p51d.variants).map(([name,x])=>({name,ledgersEqual:x.ledgersEqual,namedAtomsDiffer:x.entryDiff.filter(d=>IDS.some(id=>d.startsWith(id+':'))),rowsEqual:JSON.stringify(x.cells.U.rowsAfterB)===JSON.stringify(x.cells.R6.rowsAfterB)}));
 const p50=['qe-r7ase-P50','qe-r7ase-P50.tz540','qe-r7ase-P50.tz-300'].map(n=>{const o=run(n),w6=o.cells.U.weeks.find(w=>w.week===6),r6=o.cells.R.weeks.find(w=>w.week===6);return {name:n,reestablish:w6.saturdayRows.every(r=>/kind=REESTABLISH/.test(r)),controlAgrees:JSON.stringify(w6.saturdayRows)===JSON.stringify(r6.saturdayRows)};});
 const p40=['qe-r7ab-P40','qe-r7ab-P40.tz540'].map(n=>{const o=run(n);return {name:n,variants:Object.entries(o.variants??{}).map(([k,x])=>({k,entryDiff:x.entryDiff}))};});
 const p40ok=p40.every(x=>x.variants.every(v=>!v.entryDiff||(Array.isArray(v.entryDiff)?!v.entryDiff.length:(v.entryDiff.run===null&&!Object.keys(v.entryDiff.strength??{}).length))));
 return {pass:v.every(x=>x.ledgersEqual&&!x.namedAtomsDiffer.length&&x.rowsEqual)&&p50.every(x=>x.reestablish&&x.controlAgrees)&&p40ok,qeR7ase01:v,qeR7ase02:p50,qeR7ab01:p40ok};
});
check('self-challenge',()=>{const live=run('r7asc-self-challenge'),prior=run('r7asc-self-challenge.PRIOR');
 return {pass:live.totalViolations===0&&live.classesRun>=16&&prior.totalViolations>0,classes:live.classesRun,cases:live.cases,liveViolations:live.totalViolations,priorFreezeViolations:prior.totalViolations,priorByClass:Object.fromEntries(Object.entries(prior.classes).filter(([,c])=>c.violations).map(([k,c])=>[k,c.violations]))};});
// The finding regressions discriminate: on the predecessor's bytes they fail.
check('tests-discriminate',()=>{const t=run('r7asc-tests-on-predecessor'),must=['QE-R7ASM-01','QE-R7ASM-02','QE-R7ASM-03','QE-R7ASM-04','F1','F2','F3'];
 const missing=must.filter(m=>!t.failing.some(n=>n.includes(m)));return {pass:!missing.length,total:t.total,failingOnPredecessor:t.failing.length,findingsWithoutAFailingTest:missing};});
check('mutation-check',()=>{const f=freeze(),m=json(PROBES+'mutation-check-r7asc.out.json'),notApplied=m.results.filter(r=>!r.applied).map(r=>r.mutation);
 const survivors=m.results.filter(r=>r.applied&&!r.caught).map(r=>r.mutation),doc=json(PROBES+'MUTATION_SURVIVORS_R7ASC.json').documented??{};
 const undocumented=survivors.filter(s=>!doc[s]),testsDrift=Object.entries(m.bound.tests).filter(([p,h])=>f.files[p]!==h).map(([p])=>p);
 return {pass:!notApplied.length&&!undocumented.length&&m.bound.sourceDigest===f.sourceDigest&&!testsDrift.length,total:m.total,caught:m.caught,survivors:survivors.length,documented:Object.keys(doc).length,undocumented,boundTo:m.bound.sourceDigest,testsDrift};});
// The regression against HISTORICAL-PROJECTION-FREEZE-1: identical, or a difference whose class is named.
check('regression',()=>{
 const g=json(OUT+'REGRESSION_R7ASC.json'),n=json(OUT+'REGRESSION_R7ASC_NAMED.json');
 const src=Object.entries(g.runtimes.current.sources).filter(([p,h])=>sha(p)!==h).map(([p])=>p);
 return {pass:!src.length&&n.verdict.unclassifiedDifferences===0&&n.source.regression.sha256===sha(OUT+'REGRESSION_R7ASC.json'),sourcesBoundToCurrentRuntime:!src.length,summary:n.summary,classes:n.classes.map(c=>({id:c.id,cases:c.cases.length,risen:c.risen,fallen:c.fallen})),verdict:n.verdict};
});
check('queue-untouched',()=>{const b=json(AUDIT+'BASELINE.json').entries.find(e=>e.path===QUEUE);return {pass:sha(QUEUE)===b.sha256,sha256:sha(QUEUE)};});
check('deliverables',()=>{const list=[AUDIT+'TASK_CONTRACT.md',AUDIT+'STATE_CONSUMER_CONTRACT.md',AUDIT+'CHECKPOINT.md',AUDIT+'FOUNDER_REQUEST.md',AUDIT+'dossier/CONSUMER_AUDIT_R7ASC.md',AUDIT+'dossier/TEST_QUALITY_AUDIT_R7ASC.md',AUDIT+'REVIEW_HANDOFF.md',REVIEWS+'ENGINEERING_REVIEW_BRIEF.md',REVIEWS+'SSCTR_REGRESSION_REVIEW_BRIEF.md',OUT+'REGRESSION_R7ASC.json',OUT+'REGRESSION_R7ASC_NAMED.json','CoachingCore/test/r7asc-state-consumer.test.mjs'];
 const missing=list.filter(p=>!exists(p));return {pass:!missing.length,missing};});
// No independent review has run: this mission stops at the freeze and its briefs (Founder §29).
check('reviews-not-dispatched',()=>{const r=exists(REVIEWS)?fs.readdirSync(abs(REVIEWS)):[];const verdicts=r.filter(f=>/review\.json$|regression\.json$|\.mjs$/.test(f));
 return {pass:!verdicts.length,reviewFiles:r,verdictsPresent:verdicts};});
// The mission files record the frozen state before the reviews, and no readiness verdict (Founder §35).
check('mission-state',()=>{const m=fs.readFileSync(abs('CURRENT_MISSION.md'),'utf8'),at=m.indexOf('<!-- DOMAIN_COACHING_R7ASC:'),mine=m.slice(at).split(/\n(?=<!-- (?!DOMAIN_COACHING_R7ASC))/)[0],blocks=m.slice(at).split(/\n(?=<!-- )/).filter(b=>b.startsWith('<!-- DOMAIN_COACHING_R7ASC:'));
 const frozen=blocks.find(b=>/DCR7ASC-[0-9]+-frozen-r1/.test(b))??'';
 return {pass:/CURRENT_MISSION = STATE_MODEL_CONSUMER_CLOSURE_FROZEN/.test(frozen)&&/NEXT_STEP = INDEPENDENT_REVIEWS/.test(frozen)&&!blocks.some(b=>/R7A_EXIT_READINESS\s*=/.test(b)),blocks:blocks.length,frozenBlock:!!frozen,firstBlockBytes:mine.length};});
const out={revision:'R7ASC-VERIFICATION-1',verifiedAt:new Date().toISOString(),node:process.version,passing:checks.filter(c=>c.pass).length,total:checks.length,freeze:freezeFile(),checks};
if(process.argv.includes('--write'))fs.writeFileSync(abs(OUT+'VERIFICATION_R7ASC.json'),JSON.stringify(out,null,2)+'\n');
console.log(JSON.stringify({passing:out.passing,total:out.total,failing:checks.filter(c=>!c.pass).map(c=>c.id)}));
