// DOMAIN_COACHING_R7-A.2 objective verification. Read-only unless --write, which writes only CoachingCore/r7/a2/VERIFICATION_R7A2.json.
// It runs the test suite and reads the evidence the runner recorded on the frozen bytes (audits/domain-coaching-r7a2-2026-10-28/probes/
// EVIDENCE_RUNS_R7A2.json, each output bound to the source digest it ran on). It never runs historical verifiers or writers. It proves the
// evidence chain; it does not make the mission READY.
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {hash} from '../src/value.mjs';
const root=path.resolve(import.meta.dirname,'../..'),abs=p=>path.join(root,p),exists=p=>fs.existsSync(abs(p));
const sha=p=>createHash('sha256').update(fs.readFileSync(abs(p))).digest('hex'),json=p=>JSON.parse(fs.readFileSync(abs(p),'utf8'));
const AUDIT='audits/domain-coaching-r7a2-2026-10-28/',A2='CoachingCore/r7/a2/',PROBES=AUDIT+'probes/',RUNS=PROBES+'runs/',REVIEWS=AUDIT+'reviews/';
const A1R='audits/domain-coaching-r7a1-2026-10-27/reviews/',A1P='audits/domain-coaching-r7a1-2026-10-27/probes/';
const freezeFile=()=>fs.readdirSync(abs(A2)).filter(f=>/^RUNTIME_FREEZE_R7A2_FREEZE_\d+\.json$/.test(f)).sort().at(-1),freeze=()=>json(A2+freezeFile());
const checks=[],check=(id,fn)=>{try{const detail=fn();checks.push({id,pass:detail?.pass!==false,detail});}catch(e){checks.push({id,pass:false,detail:{error:e.message}});}};
const run=name=>json(RUNS+name+'.out.json'),same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
// R7-A.2 may change only these baseline files; the mission files only after their first R7-A.2 block; new files only where listed.
const RUNTIME_DELTA=['CoachingCore/src/r6-adaptation.mjs','CoachingCore/src/r6-composition.mjs','CoachingCore/src/r6-program.mjs'];
const INSERT_ONLY={'CURRENT_MISSION.md':'<!-- DOMAIN_COACHING_R7A2:','MISSION_LEDGER.md':'<!-- DCR7A2-'};
const QUEUE='reviews/provisional-sports-science/2026-10-23/HUMAN_REVALIDATION_QUEUE.json',QUEUE_RECORD=AUDIT+'QUEUE_INTEGRATION_R7A2.json';
const NEW_ALLOWED=[/^CoachingCore\/r7\/a2\//,/^CoachingCore\/r7\/R7A_FINAL_HANDOFF\.md$/,/^CoachingCore\/test\/r7a2-[^/]+\.test\.mjs$/,/^CoachingCore\/scripts\/(prepare|regress|freeze|verify|queue)-r7a2\.mjs$/];
const PROTECTED_DIRS=['CoachingCore','product','canon','audits/domain-coaching-r6-2026-10-26','audits/domain-coaching-r7a-2026-10-27','audits/domain-coaching-r7a1-2026-10-27','audits/v1-wearable-scope-2026-10-27'];
const walk=(rel,out=[])=>{for(const e of fs.readdirSync(abs(rel),{withFileTypes:true})){const p=path.posix.join(rel,e.name);if(e.name==='node_modules')continue;if(e.isDirectory())walk(p,out);else out.push(p);}return out;};

check('baseline-preserved',()=>{
 const b=json(AUDIT+'BASELINE.json'),changed=b.entries.filter(e=>!exists(e.path)||sha(e.path)!==e.sha256).map(e=>e.path);
 const unexpected=changed.filter(p=>!RUNTIME_DELTA.includes(p)&&!INSERT_ONLY[p]&&p!==QUEUE);
 const insertOnly=Object.entries(INSERT_ONLY).map(([p,marker])=>{const now=fs.readFileSync(abs(p)),at=now.indexOf(marker),base=b.entries.find(e=>e.path===p).sha256;let prefix=null;for(let n=Math.max(0,at-4);at>=0&&n<=at;n++)if(createHash('sha256').update(now.subarray(0,n)).digest('hex')===base)prefix=n;const tail=prefix===null?null:now.subarray(prefix);return {file:p,prefixPreserved:prefix!==null,prefixBytes:prefix,appendedBytes:tail?.length??null,carriageReturnsAppended:tail?tail.filter(x=>x===13).length:null};});
 const bound=new Set(b.entries.map(e=>e.path)),added=PROTECTED_DIRS.flatMap(d=>walk(d)).filter(p=>!bound.has(p)),addedOutsideR7A2=added.filter(p=>!NEW_ALLOWED.some(r=>r.test(p)));
 return {pass:!unexpected.length&&insertOnly.every(x=>x.prefixPreserved&&x.carriageReturnsAppended===0)&&!addedOutsideR7A2.length,entries:b.entries.length,changed,unexpected,insertOnly,addedFiles:added,addedOutsideR7A2};
});
check('freeze-current',()=>{
 const f=freeze(),cc=p=>'CoachingCore/'+p,drift=Object.entries(f.files).filter(([p,h])=>!exists(cc(p))||sha(cc(p))!==h).map(([p])=>p);
 const now=[...fs.readdirSync(abs('CoachingCore/src')).filter(x=>x.endsWith('.mjs')).map(x=>'src/'+x),...fs.readdirSync(abs('CoachingCore/test')).filter(x=>x.endsWith('.mjs')).map(x=>'test/'+x)],unfrozen=now.filter(p=>!(p in f.files));
 const single=fs.readdirSync(abs(A2)).filter(x=>/^RUNTIME_FREEZE_R7A2_/.test(x));
 return {pass:!drift.length&&!unfrozen.length&&single.length===1,revision:f.revision,sourceDigest:f.sourceDigest,freezes:single,deltaFromR7A1FreezeA2:f.deltaFromR7A1FreezeA2,drift,unfrozen};
});
check('policy-unchanged',()=>{const p=json('CoachingCore/r6/PROGRAM_POLICY_R6.json'),h=hash(p);return {pass:h==='18ec48f34768a7eebb2aede618db65a77385efebbda0a38d6f03135e5cd96b4c'&&sha('CoachingCore/r6/PROGRAM_POLICY_R6.json')==='a75be1aae3818616888e641c104407926d5f16f213a04137f5b21024ccafe100',policyHash:h,revision:p.revision};});
check('tests',()=>{
 const r=spawnSync(process.execPath,['--test'],{cwd:abs('CoachingCore'),encoding:'utf8',maxBuffer:256*1024*1024}),n=k=>Number(r.stdout.match(new RegExp('ℹ '+k+' (\\d+)'))?.[1]??NaN);
 return {pass:r.status===0&&n('fail')===0,tests:n('tests'),pass_:n('pass'),fail:n('fail'),node:process.version};
});
// The baseline reproduced the three blockers on R7A1-FREEZE-A2 before any edit: the judges' outputs, byte for byte.
check('baseline-reproduced',()=>{
 const B=PROBES+'baseline/',eq=(a,b)=>sha(a)===sha(b),v=json(B+'verify-r7a1.readonly.out.json'),t=fs.readFileSync(abs(B+'node-test.out.txt'),'utf8');
 const r={P13:eq(B+'qe-a2-P13.FREEZE-A2.out.json',A1R+'qe-a2-P13.A2.out.json'),P14:eq(B+'qe-a2-P14.FREEZE-A2.out.json',A1R+'qe-a2-P14.A2.out.json'),firstWeek:eq(B+'ssctr-r7a1-recheck-firstweek.FREEZE-A2.out.json',A1R+'ssctr-r7a1-recheck-firstweek.A2.out.json'),verifyR7A1:`${v.passing}/${v.total}`,tests:t.match(/ℹ tests (\d+)/)?.[1]+' / fail '+t.match(/ℹ fail (\d+)/)?.[1]};
 return {pass:r.P13&&r.P14&&r.firstWeek&&r.verifyR7A1==='17/17'&&r.tests==='505 / fail 0',...r};
});
// Every recorded probe or grid output ran on the frozen bytes (the digest before and after the run), exited 0 and is the file recorded.
const EXPECTED_RUNS=['qe-P13','qe-P14','qe-P02','qe-P09.seed7','qe-P09.seed1013','qe-P01','qe-P01b','qe-P03','qe-P04','qe-P05','qe-P06','qe-P07','qe-P08','qe-P10','qe-P15','qe-P16','ssctr-firstweek','ssctr-grid.shard0','ssctr-grid.shard1','ssctr-grid.shard2','ssctr-grid.shard3','ssctr-caps.shard0','ssctr-caps.shard1','ssctr-caps.shard2','ssctr-caps.shard3','ssctr-caps-ext.shard0','ssctr-caps-ext.shard1','ssctr-short','ssctr-d58','ssctr-probe','ssctr-instrument','r7a1-composition-probes','r7a1-handler-grid','r7a1-handler-grid-midweek','r7a1-d56-grid','r7a1-representation-three-step','r7a1-d58-combinations','r7a2-self-challenge'];
check('evidence-runs-bound',()=>{
 const f=freeze(),e=json(PROBES+'EVIDENCE_RUNS_R7A2.json'),by=new Map(e.runs.map(r=>[r.name,r]));
 const missing=EXPECTED_RUNS.filter(n=>!by.has(n)),unbound=e.runs.filter(r=>r.sourceDigestStart!==f.sourceDigest||r.sourceDigestEnd!==f.sourceDigest).map(r=>r.name),failed=e.runs.filter(r=>r.exit!==0).map(r=>r.name),changed=e.runs.filter(r=>sha(PROBES+r.output)!==r.outputSha256||sha(r.script)!==r.scriptSha256).map(r=>r.name);
 const data=exists(RUNS+'ssctr-instrument.data.json');
 return {pass:!missing.length&&!unbound.length&&!failed.length&&!changed.length&&data,runs:e.runs.length,missing,unbound,failed,changed,instrumentData:data};
});
// QE-R7A1-09 and QE-R7A1-10 on the judge's own probes.
check('qe-r7a1-09-closed',()=>{
 const o=run('qe-P13'),c=Object.entries(o.cases).map(([k,x])=>({case:k,second:x.classOfSecond,aboveExecutedReentry:x.aboveExecutedReentry.length,aboveReentryPlan:x.aboveReentryPlan.length,preBreakDose:[...x.afterSecond.rows,...x.afterSecond.next].filter(r=>/\b3x5@3\/KNOWN/.test(r)).length,runMode:x.afterSecond.runStartOfNext.mode,returnStep:Object.values(x.afterSecond.startOfNext).some(e=>Number.isInteger(e.returnStep))}));
 return {pass:c.length===3&&c.every(x=>x.second==='REESTABLISH'&&!x.aboveExecutedReentry&&!x.aboveReentryPlan&&!x.preBreakDose&&x.runMode==='RETURN'&&x.returnStep),cases:c};
});
check('qe-r7a1-10-closed',()=>{
 const o=run('qe-P14'),f=o.cases.firstThenSecond,a=o.cases.secondAlone,tue=wk=>wk.find(r=>r.startsWith('d1AM RUN'));
 const r={afterReturnSlots:f.afterReturn.easy,afterReviewSlots:f.afterReview.easy,nextTuesday:tue(f.afterReview.next),aloneNextTuesday:tue(a.afterReview.next)};
 return {pass:/^d1AM RUN EASY EASY:/.test(r.nextTuesday)&&/^d1AM RUN EASY EASY:/.test(r.aloneNextTuesday)&&f.afterReview.easy.length===2&&f.afterReview.easy.some(x=>x.startsWith('w4:')),...r};
});
// D59: the SSCTR's first-week grid at E = O = B = 0 for NONE and FAMILIAR and O = 0 for KNOWN (here all three classes), same cases as before.
check('d59-first-week-grid',()=>{
 const o=run('ssctr-firstweek'),b=json(PROBES+'baseline/ssctr-r7a1-recheck-firstweek.FREEZE-A2.out.json'),c=o.byClass;
 return {pass:o.cases===b.cases&&o.cases===306&&same(o.skipped,b.skipped)&&['NONE','FAMILIAR','KNOWN'].every(k=>c[k].E===0&&c[k].O===0&&c[k].B===0&&c[k].exercises===b.byClass[k].exercises),cases:o.cases,byClass:c,before:b.byClass};
});
// The engineering judge's other R7-A.1 probes: unchanged, except P06's named row (D59: the entry keeps the rep target executed before the break).
check('qe-probes',()=>{
 const id=['P01','P01b','P02','P03','P04','P05','P07','P08','P10','P15','P16'],identical=Object.fromEntries(id.map(p=>[p,sha(RUNS+'qe-'+p+'.out.json')===sha(A1R+'qe-a2-'+p+'.A2.out.json')]));
 const p6=run('qe-P06'),p6a=json(A1R+'qe-a2-P06.A2.out.json'),D59ROW=/db-calf-raise:1x7@4\/ESTABLISH,dead-bug:1x7@4\/BODYWEIGHT/;
 const n6=structuredClone(p6);for(const c of Object.values(n6.cases))for(const r of Object.values(c))if(Array.isArray(r?.monday))r.monday=r.monday.map(x=>x.replace('db-calf-raise:1x7@4/ESTABLISH,dead-bug:1x7@4/BODYWEIGHT','db-calf-raise:1x5@4/ESTABLISH,dead-bug:1x5@4/BODYWEIGHT'));
 const p6named=same(n6,p6a)&&JSON.stringify(p6).match(new RegExp(D59ROW.source,'g'))?.length>0;
 const p9=['seed7','seed1013'].map(s=>{const o=run('qe-P09.'+s);return {seed:s,sequences:o.sequences,errors:o.errors.length,violations:Object.fromEntries(Object.entries(o.violations).map(([k,v])=>[k,v.length])),refusals:[...new Set(o.refusals.flatMap(r=>r.errors??[]).map(e=>e.replace(/^w\d+-str-d\d+:/,'')))],identicalToA2:sha(RUNS+'qe-P09.'+s+'.out.json')===sha(A1R+'qe-a2-P09.'+s+'.A2.out.json')};});
 const p9ok=p9.every(x=>x.sequences===2500&&!x.errors&&['O1','O2','O3','O4','O6','O7'].every(k=>x.violations[k]===0)&&x.refusals.every(e=>e==='phaseDose:glute-bridge:accessory'));
 return {pass:Object.values(identical).every(Boolean)&&p6named&&p9ok,identical,P06:{namedDifference:'RETURN_MODERATE rows: an accessory first executed in the break week keeps its executed rep target (7) at the entry (SSCTR D59; was the goal’s 5)',holds:p6named},P09:p9};
});
// The SSCTR's R7-A.1 grids: the short grid, the D58 readings and the probe unchanged; the restoration grid, the cap causes and the instrument
// with no violation and no unexplained cap.
const merge=parts=>{const m=(a,b)=>{if(typeof a==='number'&&typeof b==='number')return a+b;if(Array.isArray(a)&&Array.isArray(b))return [...a,...b];if(a&&b&&typeof a==='object'&&typeof b==='object'){const o={};for(const k of new Set([...Object.keys(a),...Object.keys(b)]))o[k]=k in a&&k in b?m(a[k],b[k]):a[k]??b[k];return o;}return a===b?a:[a,b].flat();};return parts.reduce(m);};
check('ssctr-grids',()=>{
 const unchanged={short:sha(RUNS+'ssctr-short.out.json')===sha(A1R+'ssctr-r7a1-recheck-short.A2.out.json'),d58:sha(RUNS+'ssctr-d58.out.json')===sha(A1R+'ssctr-r7a1-recheck-d58.A2.out.json'),probe:sha(RUNS+'ssctr-probe.out.json')===sha(A1R+'ssctr-r7a1-recheck-probe.A2.out.json')};
 const g=merge([0,1,2,3].map(i=>run('ssctr-grid.shard'+i))),ga=json(A1R+'ssctr-r7a1-recheck-grid.A2.out.json');
 const grid={timelines:g.timelines,skipped:g.skipped.length,riseOrEnd:g.A.riseOrEnd,held:g.A2.held,B:g.B.violations,C:g.C.violations,U:g.U.jumps,Ubefore:ga.U.jumps,capWeeksLastNotWhole:`${ga.A.capWeeksLastNotWhole} -> ${g.A.capWeeksLastNotWhole}`,heldAtReturnCeiling:`${ga.A2.heldAtReturnCeiling} -> ${g.A2.heldAtReturnCeiling}`,longCaps:`${ga.L.weeks} -> ${g.L.weeks}`};
 const caps=merge([0,1,2,3].map(i=>run('ssctr-caps.shard'+i))),ext=merge([0,1].map(i=>run('ssctr-caps-ext.shard'+i))),ca=json(A1R+'ssctr-r7a1-recheck-caps.out.json');
 const capsR={timelines:caps.timelines,extTimelines:ext.timelines,binding:`${ca.binding} -> ${caps.binding}`,unexplained:caps.unexplained.length,extUnexplained:ext.unexplained.length,B:caps.B.violations,extB:ext.B.violations,J:caps.J.jumps,Jbefore:ca.J.jumps};
 // The round-12 instrument (a byte copy) against its R7A1-FREEZE-A2 output, up to the folder it runs from.
 const sections=(p,dir)=>JSON.parse(fs.readFileSync(abs(p),'utf8').replaceAll(dir,'X')).sections,ia=sections(A1P+'ssctr-r12-instrument.A2.out.json','domain-coaching-r7a1-2026-10-27/probes'),ib=sections(RUNS+'ssctr-instrument.data.json','domain-coaching-r7a2-2026-10-28/probes'),diffSections=Object.keys({...ia,...ib}).filter(k=>!same(ia[k],ib[k]));
 const scriptSame=sha(PROBES+'ssctr-r12-instrument.mjs')===sha(A1P+'ssctr-r12-instrument.mjs');
 return {pass:Object.values(unchanged).every(Boolean)&&grid.timelines===864&&!grid.skipped&&!grid.riseOrEnd&&!grid.held&&!grid.B&&!grid.C&&grid.U===grid.Ubefore&&capsR.timelines===864&&capsR.extTimelines===360&&!capsR.unexplained&&!capsR.extUnexplained&&!capsR.B&&!capsR.extB&&capsR.J===capsR.Jbefore&&scriptSame&&!diffSections.length,unchanged,restorationGrid:grid,caps:capsR,instrument:{byteCopy:scriptSame,sections:Object.keys(ib).length,differentFromA2:diffSections}};
});
// The R7-A.1 author probes: unchanged, except named R7-A.2 consequences.
check('r7a1-author-probes',()=>{
 const id=Object.fromEntries(['r7a1-composition-probes','r7a1-representation-three-step','r7a1-d58-combinations'].map(p=>[p,sha(RUNS+p+'.out.json')===sha(A1P+p+'.A2.out.json')]));
 const D59=s=>s.replaceAll('db-calf-raise:1x7@4/ESTABLISH,dead-bug:1x7@4/BODYWEIGHT','db-calf-raise:1x5@4/ESTABLISH,dead-bug:1x5@4/BODYWEIGHT').replaceAll('db-split-squat:1x5@4/ESTABLISH,dead-bug:1x7@4/BODYWEIGHT','db-split-squat:1x5@4/ESTABLISH,dead-bug:1x5@4/BODYWEIGHT').replaceAll('db-split-squat:1x7@4/ESTABLISH,dead-bug:1x7@4/BODYWEIGHT','db-split-squat:1x5@4/ESTABLISH,dead-bug:1x5@4/BODYWEIGHT');
 const grid=name=>{const o=JSON.parse(D59(fs.readFileSync(abs(RUNS+name+'.out.json'),'utf8'))),a=json(A1P+name+'.A2.out.json');return {o,a};};
 const g1=grid('r7a1-handler-grid'),mon=same(g1.o,g1.a);
 // Evening grid: the two pairs a return and a report of the week's earlier sessions form in both orders (C4 reading, R7-A.2 §5): rows equal,
 // next week's start differs only by what that return read.
 const g2=grid('r7a1-handler-grid-midweek'),named=g2.o.defects.filter(d=>d.program==='race'&&d.day===6&&['RETURN_SHORT x PARTIAL_REPORTS','RETURN_SHORT x WEEKLY_REPORTS'].includes(d.pair)&&!d.weekDiffers&&d.nextStartDiffers);
 const n2=structuredClone(g2.o);n2.defects=n2.defects.filter(d=>!named.includes(d));n2.same+=named.length;n2.defects=n2.defects.filter(d=>!(d.program==='race'&&d.day===6&&/RETURN_SHORT x (PARTIAL|WEEKLY)_REPORTS/.test(d.pair)));
 const eve=same({...n2,defects:n2.defects},g2.a)&&named.length===2&&g2.o.defects.length===2;
 const d56=run('r7a1-d56-grid'),d56a=json(A1P+'r7a1-d56-grid.A2.out.json');
 const d56ok=d56.timelines===d56a.timelines&&d56.cap.riseOrEndAfterTrimmed===0&&same(d56.jumpsAboveLargestPlusOne,d56a.jumpsAboveLargestPlusOne);
 return {pass:Object.values(id).every(Boolean)&&mon&&eve&&d56ok,identical:id,mondayGrid:{equalUpToD59Reps:mon,pairs:g1.o.pairs,defects:g1.o.defects.length},eveningGrid:{equalUpToNamed:eve,pairs:g2.o.pairs,defects:g2.o.defects.map(d=>`${d.program} d${d.day} ${d.pair} weekDiffers=${d.weekDiffers}`),named:'A return reads the record as reported at its own clock (INTERRUPTION_CONTRACT §5): reported after the return, the week’s earlier sessions change only what it read'},d56Grid:{timelines:d56.timelines,trimmedWeeksWithCap:`${d56a.cap.trimmedWeeksWithCap} -> ${d56.cap.trimmedWeeksWithCap}`,riseOrEndAfterTrimmed:d56.cap.riseOrEndAfterTrimmed,jumps:d56.jumpsAboveLargestPlusOne,holds:d56ok}};
});
check('self-challenge',()=>{const live=run('r7a2-self-challenge'),f2=json(PROBES+'r7a2-self-challenge.FREEZE-A2.out.json');return {pass:live.violations.length===0&&Object.keys(live.cases).length>=40&&f2.violations.length>0&&f2.runtime==='R7A1-FREEZE-A2',cases:Object.keys(live.cases).length,violations:live.violations.length,onFreezeA2:f2.violations.length};});
// The R7-A.2 tests fail on a byte-exact R7A1-FREEZE-A2 copy (recorded run of the current test file).
check('tests-fail-on-freeze-a2',()=>{
 const t='CoachingCore/test/r7a2-interruption.test.mjs',rec=fs.readFileSync(abs(PROBES+'r7a2-tests.on-FREEZE-A2.out.txt'),'utf8'),n=k=>Number(rec.match(new RegExp('ℹ '+k+' (\\d+)'))?.[1]??NaN);
 return {pass:rec.includes(sha(t))&&n('tests')>0&&n('fail')===n('tests')&&n('pass')===0,boundToCurrentTestFile:rec.includes(sha(t)),tests:n('tests'),failingOnFreezeA2:n('fail')};
});
check('mutation-check',()=>{const m=json(PROBES+'mutation-check-r7a2.out.json'),open=m.results.filter(r=>!r.caught&&!r.documented).map(r=>r.mutation);return {pass:m.total>0&&m.results.every(r=>r.applied)&&!open.length,caught:m.caught,total:m.total,documentedSurvivors:m.results.filter(r=>!r.caught&&r.documented).map(r=>r.mutation),open};});
// Regression against R7A1-FREEZE-A2: every difference named.
const NAMED={'R6-H17':'State at the break (SSCTR D59): the Monday exposures before the Wednesday break keep their last performed date and db-calf-raise its last executed whole count (2 after the block set) as the ceiling of a later return; rows and statuses unchanged'};
check('regression',()=>{
 const g=json(A2+'REGRESSION_R7A2.json'),src=Object.entries(g.runtimes.current.sources).filter(([p,h])=>sha(p)!==h).map(([p])=>p),s=g.summary;
 const facts=g.r6FreshHoldout.filter(x=>!x.identical).every(x=>x.differences.every(d=>/\/strength\/exercises\/[^/]+\/(lastPerformed|lastExecutedSets)$/.test(d.path)));
 const unnamed=s.r6FreshHoldout.different.filter(x=>!NAMED[x]);
 return {pass:!src.length&&s.r5Corpus.identical===s.r5Corpus.cases&&s.profiles.identical===s.profiles.cases&&s.simulations.identical===s.simulations.cases&&!unnamed.length&&facts&&!s.r6FreshHoldout.statusChanged.length,sourcesBoundToCurrentRuntime:!src.length,r5:`${s.r5Corpus.identical}/${s.r5Corpus.cases}`,profiles:`${s.profiles.identical}/${s.profiles.cases}`,simulations:`${s.simulations.identical}/${s.simulations.cases}`,r6Holdout:`${s.r6FreshHoldout.identical}/${s.r6FreshHoldout.cases}`,named:NAMED,differencesAreStateFactsOnly:facts,unnamed,classification:g.classification};
});
const REVIEWS_EXPECTED={engineering:REVIEWS+'quality-engineering-r7a2-recheck.json',ssctr:REVIEWS+'ssctr-r7a2-recheck.json'};
check('independent-reviews',()=>{const f=freeze(),out={};for(const [k,p] of Object.entries(REVIEWS_EXPECTED)){if(!exists(p)){out[k]={present:false};continue;}const r=json(p),digest=r.freezeReviewed?.sourceDigest??r.sourceDigest??null;out[k]={present:true,file:p,verdict:r.verdict??null,digest,bound:digest===f.sourceDigest};}return {pass:Object.values(out).every(x=>x.present&&x.bound),freeze:f.revision,...out};});
check('queue-append-only',()=>{
 const b=json(AUDIT+'BASELINE.json').entries.find(e=>e.path===QUEUE),now=sha(QUEUE);
 if(now===b.sha256)return {pass:!exists(QUEUE_RECORD),integrated:false,note:'Queue unchanged since the R7-A.2 baseline'};
 const rec=json(QUEUE_RECORD),q=json(QUEUE),back=structuredClone(q);back.items=back.items.slice(0,rec.before.items);back.queue_revision=rec.before.revision;delete back.r7a2_queue_addendum;
 const restored=createHash('sha256').update(JSON.stringify(back,null,2)+'\n').digest('hex'),appended=q.items.slice(rec.before.items).map(i=>i.queue_id);
 return {pass:rec.before.sha256===b.sha256&&restored===b.sha256&&rec.after.sha256===now&&appended.length>0&&appended.every(id=>/^HQ-R7A2-/.test(id))&&q.funding_trigger.state==='NOT_DECLARED',before:rec.before,after:{items:q.items.length,sha256:now},appended,earlierItemsByteIdentical:restored===b.sha256};
});
check('deliverables',()=>{const list=[AUDIT+'TASK_CONTRACT.md',AUDIT+'INTERRUPTION_CONTRACT.md',A2+'READINESS_R7A2.json',A2+'FINAL_REPORT_R7A2.md',AUDIT+'FINAL_DISPOSITION.json'],handoff='CoachingCore/r7/R7A_FINAL_HANDOFF.md',r=exists(A2+'READINESS_R7A2.json')?json(A2+'READINESS_R7A2.json'):{},ready=r.verdicts?.R7A_EXIT_READINESS==='READY';const missing=[...list,...(ready?[handoff]:[])].filter(p=>!exists(p)),handoffWithoutReady=!ready&&exists(handoff);return {pass:!missing.length&&!handoffWithoutReady,missing,handoffWithoutReady,exit:r.verdicts?.R7A_EXIT_READINESS??null};});
const out={revision:'R7A2-VERIFICATION-1',verifiedAt:new Date().toISOString(),node:process.version,passing:checks.filter(c=>c.pass).length,total:checks.length,checks};
if(process.argv.includes('--write'))fs.writeFileSync(abs(A2+'VERIFICATION_R7A2.json'),JSON.stringify(out,null,2)+'\n');
console.log(JSON.stringify({passing:out.passing,total:out.total,failing:checks.filter(c=>!c.pass).map(c=>c.id)}));
