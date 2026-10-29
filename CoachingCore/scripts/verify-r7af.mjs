// DOMAIN_COACHING_R7-A final objective verification. Read-only unless --write, which writes only CoachingCore/r7/final/VERIFICATION_R7AF.json.
// It runs the test suite and reads the evidence the runner recorded on the frozen bytes (audits/domain-coaching-r7a-final-2026-10-28/probes/
// EVIDENCE_RUNS_R7AF.json, each output bound to the source digest it ran on). It never runs historical verifiers or writers. It proves the
// evidence chain; it does not make the mission READY.
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {hash} from '../src/value.mjs';
const root=path.resolve(import.meta.dirname,'../..'),abs=p=>path.join(root,p),exists=p=>fs.existsSync(abs(p));
const sha=p=>createHash('sha256').update(fs.readFileSync(abs(p))).digest('hex'),json=p=>JSON.parse(fs.readFileSync(abs(p),'utf8'));
const AUDIT='audits/domain-coaching-r7a-final-2026-10-28/',FINAL='CoachingCore/r7/final/',PROBES=AUDIT+'probes/',RUNS=PROBES+'runs/',REVIEWS=AUDIT+'reviews/';
const A2='audits/domain-coaching-r7a2-2026-10-28/';
const freezeFile=()=>fs.readdirSync(abs(FINAL)).filter(f=>/^RUNTIME_FREEZE_.*\.json$/.test(f)).sort().at(-1),freeze=()=>json(FINAL+freezeFile());
const checks=[],check=(id,fn)=>{try{const detail=fn();checks.push({id,pass:detail?.pass!==false,detail});}catch(e){checks.push({id,pass:false,detail:{error:e.message}});}};
const run=name=>json(RUNS+name+'.out.json'),same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
// This mission may change only these baseline files; the mission files only after their first R7-A final block; new files only where listed.
const DELTA=['CoachingCore/src/r6-adaptation.mjs','CoachingCore/test/r7a1-composition.test.mjs','CoachingCore/test/r7a2-interruption.test.mjs'];
const INSERT_ONLY={'CURRENT_MISSION.md':'<!-- DOMAIN_COACHING_R7AF:','MISSION_LEDGER.md':'<!-- DCR7AF-'};
const QUEUE='reviews/provisional-sports-science/2026-10-23/HUMAN_REVALIDATION_QUEUE.json',QUEUE_RECORD=AUDIT+'QUEUE_INTEGRATION_R7AF.json';
const NEW_ALLOWED=[/^CoachingCore\/r7\/final\//,/^CoachingCore\/r7\/R7A_FINAL_HANDOFF\.md$/,/^CoachingCore\/test\/r7af-[^/]+\.test\.mjs$/,/^CoachingCore\/scripts\/(prepare|regress|freeze|verify|queue)-r7af\.mjs$/];
const PROTECTED_DIRS=['CoachingCore','product','canon','audits/domain-coaching-r6-2026-10-26','audits/domain-coaching-r7a-2026-10-27','audits/domain-coaching-r7a1-2026-10-27','audits/domain-coaching-r7a2-2026-10-28','audits/v1-wearable-scope-2026-10-27'];
const walk=(rel,out=[])=>{for(const e of fs.readdirSync(abs(rel),{withFileTypes:true})){const p=path.posix.join(rel,e.name);if(e.name==='node_modules')continue;if(e.isDirectory())walk(p,out);else out.push(p);}return out;};

check('baseline-preserved',()=>{
 const b=json(AUDIT+'BASELINE.json'),changed=b.entries.filter(e=>!exists(e.path)||sha(e.path)!==e.sha256).map(e=>e.path);
 const unexpected=changed.filter(p=>!DELTA.includes(p)&&!INSERT_ONLY[p]&&p!==QUEUE);
 const insertOnly=Object.entries(INSERT_ONLY).map(([p,marker])=>{const now=fs.readFileSync(abs(p)),at=now.indexOf(marker),base=b.entries.find(e=>e.path===p).sha256;let prefix=null;for(let n=Math.max(0,at-4);at>=0&&n<=at;n++)if(createHash('sha256').update(now.subarray(0,n)).digest('hex')===base)prefix=n;const unchanged=sha(p)===base;const tail=prefix===null?null:now.subarray(prefix);return {file:p,unchanged,prefixPreserved:unchanged||prefix!==null,prefixBytes:prefix,appendedBytes:tail?.length??null,carriageReturnsAppended:tail?tail.filter(x=>x===13).length:0};});
 const bound=new Set(b.entries.map(e=>e.path)),added=PROTECTED_DIRS.flatMap(d=>walk(d)).filter(p=>!bound.has(p)),addedOutside=added.filter(p=>!NEW_ALLOWED.some(r=>r.test(p)));
 return {pass:!unexpected.length&&insertOnly.every(x=>x.prefixPreserved&&x.carriageReturnsAppended===0)&&!addedOutside.length,entries:b.entries.length,changed,unexpected,insertOnly,addedFiles:added,addedOutside};
});
check('freeze-current',()=>{
 const f=freeze(),cc=p=>'CoachingCore/'+p,drift=Object.entries(f.files).filter(([p,h])=>!exists(cc(p))||sha(cc(p))!==h).map(([p])=>p);
 const now=[...fs.readdirSync(abs('CoachingCore/src')).filter(x=>x.endsWith('.mjs')).map(x=>'src/'+x),...fs.readdirSync(abs('CoachingCore/test')).filter(x=>x.endsWith('.mjs')).map(x=>'test/'+x)],unfrozen=now.filter(p=>!(p in f.files));
 const single=fs.readdirSync(abs(FINAL)).filter(x=>/^RUNTIME_FREEZE_/.test(x));
 return {pass:!drift.length&&!unfrozen.length&&single.length===1&&f.revision==='R7A-FINAL-FREEZE',revision:f.revision,sourceDigest:f.sourceDigest,freezes:single,deltaFromR7A2Freeze1:f.deltaFromR7A2Freeze1,drift,unfrozen};
});
check('policy-unchanged',()=>{const p=json('CoachingCore/r6/PROGRAM_POLICY_R6.json'),h=hash(p);return {pass:h==='18ec48f34768a7eebb2aede618db65a77385efebbda0a38d6f03135e5cd96b4c'&&sha('CoachingCore/r6/PROGRAM_POLICY_R6.json')==='a75be1aae3818616888e641c104407926d5f16f213a04137f5b21024ccafe100',policyHash:h,revision:p.revision};});
check('tests',()=>{
 const r=spawnSync(process.execPath,['--test'],{cwd:abs('CoachingCore'),encoding:'utf8',maxBuffer:256*1024*1024}),n=k=>Number(r.stdout.match(new RegExp('ℹ '+k+' (\\d+)'))?.[1]??NaN);
 return {pass:r.status===0&&n('fail')===0,tests:n('tests'),pass_:n('pass'),fail:n('fail'),node:process.version};
});
// The baseline reproduced the blocker on R7A2-FREEZE-1 before any edit: the judge's outputs, byte for byte.
check('baseline-reproduced',()=>{
 const B=PROBES+'baseline/',eq=(a,b)=>sha(a)===sha(b),v=json(B+'verify-r7a2.readonly.out.json'),t=fs.readFileSync(abs(B+'node-test.out.txt'),'utf8');
 const r=Object.fromEntries(['P17','P19','P20','P21'].map(p=>[p,eq(B+`qe-r7a2-${p}.FREEZE-1.out.json`,A2+`reviews/qe-r7a2-${p}.out.json`)]));
 Object.assign(r,{verifyR7A2:`${v.passing}/${v.total}`,tests:t.match(/ℹ tests (\d+)/)?.[1]+' / fail '+t.match(/ℹ fail (\d+)/)?.[1]});
 return {pass:r.P17&&r.P19&&r.P20&&r.P21&&r.verifyR7A2==='19/19'&&r.tests==='519 / fail 0',...r};
});
// Every recorded probe or grid output ran on the frozen bytes (the digest before and after the run), exited 0 and is the file recorded.
const EXPECTED_RUNS=['qe-P13','qe-P14','qe-P02','qe-P09.seed7','qe-P09.seed1013','qe-P01','qe-P01b','qe-P03','qe-P04','qe-P05','qe-P06','qe-P07','qe-P08','qe-P10','qe-P15','qe-P16','qe2-P17','qe2-P18','qe2-P19','qe2-P20','qe2-P21','ssctr-firstweek',...[0,1,2,3].map(i=>'ssctr-grid.shard'+i),...[0,1,2,3].map(i=>'ssctr-caps.shard'+i),'ssctr-caps-ext.shard0','ssctr-caps-ext.shard1','ssctr-short','ssctr-d58','ssctr-probe',...[0,1,2,3,4,5,6,7].map(i=>'ssctr2-x-firstweek.shard'+i),...['items','sameday','trace-sd','rotation','ceiling','trace-rot'].map(x=>'ssctr2-x-'+x),'ssctr-instrument','r7a1-composition-probes','r7a1-handler-grid','r7a1-handler-grid-midweek','r7a1-d56-grid','r7a1-representation-three-step','r7a1-d58-combinations','r7a2-self-challenge','r7af-self-challenge','r7af-P02-named'];
check('evidence-runs-bound',()=>{
 const f=freeze(),e=json(PROBES+'EVIDENCE_RUNS_R7AF.json'),by=new Map(e.runs.map(r=>[r.name,r]));
 const missing=EXPECTED_RUNS.filter(n=>!by.has(n)),unbound=e.runs.filter(r=>r.sourceDigestStart!==f.sourceDigest||r.sourceDigestEnd!==f.sourceDigest).map(r=>r.name),failed=e.runs.filter(r=>r.exit!==0).map(r=>r.name),changed=e.runs.filter(r=>sha(PROBES+r.output)!==r.outputSha256||sha(r.script)!==r.scriptSha256).map(r=>r.name);
 return {pass:!missing.length&&!unbound.length&&!failed.length&&!changed.length&&exists(RUNS+'ssctr-instrument.data.json'),runs:e.runs.length,missing,unbound,failed,changed};
});
// The blocker on the judges' own probes: QE-R7A2-01 (P17, P19), QE-R7A1-10 through it (P20), QE-R7A2-03 (P21), and QE-R7A1-09/10 (P13, P14).
check('qe-r7a2-01-closed',()=>{
 const p17=run('qe2-P17'),c17=Object.entries(p17.cases).map(([k,c])=>({case:k,b:c.oracle.bRelation,preBreakDose:c.oracle.preBreakDoseRows.length,longs:c.oracle.longRunsAfterB}));
 const p19=run('qe2-P19'),p21=run('qe2-P21').cases.G1.B,p20=run('qe2-P20').cases;
 const ok=c17.every(x=>x.b==='NEW'&&!x.preBreakDose&&x.longs.every(l=>Number(l.split(' ')[1])<=45))&&p19.tally.sameBreakB===0&&p19.tally.preBreakDose===0&&p19.tally.longAbove45===0&&p19.tally.errors===0&&p21.relation==='NEW'&&Object.values(p20).every(c=>c.B.relation==='NEW'&&c.week4Tuesday.role==='EASY'&&c.week4Tuesday.easedFor===c.B.episode);
 return {pass:ok,P17:c17,P19:p19.tally,P20:Object.fromEntries(Object.entries(p20).map(([k,c])=>[k,{B:c.B.relation,week4Tuesday:c.week4Tuesday}])),P21:p21};
});
check('qe-r7a1-09-10-closed',()=>{
 const o=run('qe-P13'),c=Object.entries(o.cases).map(([k,x])=>({case:k,second:x.classOfSecond,aboveExecutedReentry:x.aboveExecutedReentry.length,aboveReentryPlan:x.aboveReentryPlan.length,preBreakDose:[...x.afterSecond.rows,...x.afterSecond.next].filter(r=>/\b3x5@3\/KNOWN/.test(r)).length,runMode:x.afterSecond.runStartOfNext.mode}));
 const p14=run('qe-P14'),tue=wk=>wk.find(r=>r.startsWith('d1AM RUN'));
 const p14ok=/^d1AM RUN EASY EASY:/.test(tue(p14.cases.firstThenSecond.afterReview.next))&&/^d1AM RUN EASY EASY:/.test(tue(p14.cases.secondAlone.afterReview.next));
 return {pass:c.length===3&&c.every(x=>x.second==='REESTABLISH'&&!x.aboveExecutedReentry&&!x.aboveReentryPlan&&!x.preBreakDose&&x.runMode==='RETURN')&&p14ok,P13:c,P14:{firstThenSecond:tue(p14.cases.firstThenSecond.afterReview.next),secondAlone:tue(p14.cases.secondAlone.afterReview.next)}};
});
// P02's successor: a named correction across the week boundary is the same interruption, with the same plan at either clock; the unnamed P02
// is asked at both clocks.
check('p02-correction',()=>{
 const n=run('r7af-P02-named').cases.A1,u=run('qe-P02').cases.A1,recs=[n.correctionSundayNight.record,n.correctionMondayMorning.record];
 return {pass:n.sameFromWeek6===true&&recs.every(r=>r.relation==='SAME_BREAK'&&r.basis==='EXPLICIT'&&r.revision===2)&&n.episodes.every(x=>x===1)&&u.sameFromWeek6===true&&[u.correctionSundayNight.log,u.correctionMondayMorning.log].every(l=>l.at(-1)==='ASK/ASK'),named:{sameFromWeek6:n.sameFromWeek6,records:recs,episodes:n.episodes},unnamed:{sameFromWeek6:u.sameFromWeek6,last:[u.correctionSundayNight.log.at(-1),u.correctionMondayMorning.log.at(-1)]}};
});
// D59: the SSCTR's first-week grid at E = O = B = 0 for NONE, FAMILIAR and KNOWN (cases now asked for a start time are counted apart).
check('d59-first-week-grid',()=>{const o=run('ssctr-firstweek'),c=o.byClass;return {pass:['NONE','FAMILIAR','KNOWN'].every(k=>c[k].E===0&&c[k].O===0&&c[k].B===0),cases:o.cases,skipped:o.skipped?.length??o.skipped,byClass:c};});
check('self-challenge',()=>{const live=run('r7af-self-challenge'),f1=json(PROBES+'r7af-self-challenge.FREEZE-1.out.json');return {pass:live.violations.length===0&&Object.keys(live.cases).length>=40&&f1.violations.length>0&&f1.runtime==='R7A2-FREEZE-1',cases:Object.keys(live.cases).length,violations:live.violations.length,onFreeze1:f1.violations.length};});
// The R7-A final tests on a byte-exact R7A2-FREEZE-1 copy: all but the P3 test fail (R7-A.2 already kept the first break when reports came in order).
check('tests-on-freeze1',()=>{
 const t='CoachingCore/test/r7af-episode-identity.test.mjs',rec=fs.readFileSync(abs(PROBES+'r7af-tests.on-FREEZE-1.out.txt'),'utf8'),n=k=>Number(rec.match(new RegExp('ℹ '+k+' (\\d+)'))?.[1]??NaN);
 const passing=[...rec.matchAll(/^✔ (R7-A final [^(]+)\(/gm)].map(m=>m[1].trim());
 return {pass:rec.includes(sha(t))&&n('tests')>0&&n('fail')===n('tests')-1&&passing.length===1&&passing[0].startsWith('R7-A final P3'),boundToCurrentTestFile:rec.includes(sha(t)),tests:n('tests'),failingOnFreeze1:n('fail'),passingOnFreeze1:passing};
});
check('mutation-check',()=>{const m=json(PROBES+'mutation-check-r7af.out.json'),open=m.results.filter(r=>!r.caught&&!r.documented).map(r=>r.mutation);return {pass:m.total>0&&m.results.every(r=>r.applied)&&!open.length,caught:m.caught,total:m.total,open};});
check('regression',()=>{
 const g=json(FINAL+'REGRESSION_R7AF.json'),src=Object.entries(g.runtimes.current.sources).filter(([p,h])=>sha(p)!==h).map(([p])=>p),s=g.summary;
 return {pass:!src.length&&['r5Corpus','profiles','simulations','r6FreshHoldout'].every(k=>s[k].identical===s[k].cases),sourcesBoundToCurrentRuntime:!src.length,r5:`${s.r5Corpus.identical}/${s.r5Corpus.cases}`,profiles:`${s.profiles.identical}/${s.profiles.cases}`,simulations:`${s.simulations.identical}/${s.simulations.cases}`,r6Holdout:`${s.r6FreshHoldout.identical}/${s.r6FreshHoldout.cases}`,classification:g.classification};
});
// Every other recorded output against the same probe's R7A2-FREEZE-1 output: identical, or a difference named in COMPARE_R7AF_NAMED.json.
check('compared-with-freeze1',()=>{
 const c=json(PROBES+'COMPARE_R7AF.json'),named=exists(PROBES+'COMPARE_R7AF_NAMED.json')?json(PROBES+'COMPARE_R7AF_NAMED.json').named:{},unnamed=c.different.filter(n=>!named[n]),instrumentUnnamed=c.instrument.differentFromFreeze1.filter(s=>!named['ssctr-instrument:'+s]);
 return {pass:!unnamed.length&&!instrumentUnnamed.length,identical:c.identical.length,different:c.different,unnamed,instrumentDifferent:c.instrument.differentFromFreeze1,instrumentUnnamed,named};
});
const REVIEWS_EXPECTED={engineering:REVIEWS+'quality-engineering-r7af-recheck.json',ssctr:REVIEWS+'ssctr-r7af-recheck.json'};
check('independent-reviews',()=>{const f=freeze(),out={};for(const [k,p] of Object.entries(REVIEWS_EXPECTED)){if(!exists(p)){out[k]={present:false};continue;}const r=json(p),digest=r.freezeReviewed?.sourceDigest??r.sourceDigest??null;out[k]={present:true,file:p,verdict:r.verdict??null,digest,bound:digest===f.sourceDigest};}return {pass:Object.values(out).every(x=>x.present&&x.bound),freeze:f.revision,...out};});
check('queue-append-only',()=>{
 const b=json(AUDIT+'BASELINE.json').entries.find(e=>e.path===QUEUE),now=sha(QUEUE);
 if(now===b.sha256)return {pass:!exists(QUEUE_RECORD),integrated:false,note:'Queue unchanged since the R7-A final baseline'};
 const rec=json(QUEUE_RECORD),q=json(QUEUE),back=structuredClone(q);back.items=back.items.slice(0,rec.before.items);back.queue_revision=rec.before.revision;delete back.r7af_queue_addendum;
 const restored=createHash('sha256').update(JSON.stringify(back,null,2)+'\n').digest('hex'),appended=q.items.slice(rec.before.items).map(i=>i.queue_id);
 return {pass:rec.before.sha256===b.sha256&&restored===b.sha256&&rec.after.sha256===now&&appended.length>0&&appended.every(id=>/^HQ-R7AF-/.test(id))&&q.funding_trigger.state==='NOT_DECLARED',before:rec.before,after:{items:q.items.length,sha256:now},appended,earlierItemsByteIdentical:restored===b.sha256};
});
check('deliverables',()=>{const list=[AUDIT+'TASK_CONTRACT.md',AUDIT+'INTERRUPTION_EPISODE_CONTRACT.md',FINAL+'READINESS_R7AF.json',FINAL+'FINAL_REPORT_R7AF.md',AUDIT+'FINAL_DISPOSITION.json'],handoff='CoachingCore/r7/R7A_FINAL_HANDOFF.md',r=exists(FINAL+'READINESS_R7AF.json')?json(FINAL+'READINESS_R7AF.json'):{},ready=r.verdicts?.R7A_EXIT_READINESS==='READY';const missing=[...list,...(ready?[handoff]:[])].filter(p=>!exists(p)),handoffWithoutReady=!ready&&exists(handoff);return {pass:!missing.length&&!handoffWithoutReady,missing,handoffWithoutReady,exit:r.verdicts?.R7A_EXIT_READINESS??null};});
const out={revision:'R7AF-VERIFICATION-1',verifiedAt:new Date().toISOString(),node:process.version,passing:checks.filter(c=>c.pass).length,total:checks.length,checks};
if(process.argv.includes('--write'))fs.writeFileSync(abs(FINAL+'VERIFICATION_R7AF.json'),JSON.stringify(out,null,2)+'\n');
console.log(JSON.stringify({passing:out.passing,total:out.total,failing:checks.filter(c=>!c.pass).map(c=>c.id)}));
