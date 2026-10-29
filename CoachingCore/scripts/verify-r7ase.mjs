// COACHING CORE — STATE EVIDENCE MODEL objective verification. Read-only unless --write, which writes only CoachingCore/r7/state-evidence/
// VERIFICATION_R7ASE.json. It runs the test suite and reads the evidence the runner recorded on the frozen bytes (audits/domain-coaching-r7a-
// state-evidence-2026-10-28/probes/EVIDENCE_RUNS_R7ASE.json, each output bound to the source digest it ran on). It never runs historical
// verifiers or writers. It proves the evidence chain; it does not make the mission READY.
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {hash} from '../src/value.mjs';
const root=path.resolve(import.meta.dirname,'../..'),abs=p=>path.join(root,p),exists=p=>fs.existsSync(abs(p));
const sha=p=>createHash('sha256').update(fs.readFileSync(abs(p))).digest('hex'),json=p=>JSON.parse(fs.readFileSync(abs(p),'utf8'));
const AUDIT='audits/domain-coaching-r7a-state-evidence-2026-10-28/',OUT='CoachingCore/r7/state-evidence/',PROBES=AUDIT+'probes/',RUNS=PROBES+'runs/',REVIEWS=AUDIT+'reviews/';
const AB='audits/domain-coaching-r7a-boundary-2026-10-28/';
const freezeFile=()=>fs.readdirSync(abs(OUT)).filter(f=>/^RUNTIME_FREEZE_.*\.json$/.test(f)).sort().at(-1),freeze=()=>json(OUT+freezeFile());
const checks=[],check=(id,fn)=>{try{const detail=fn();checks.push({id,pass:detail?.pass!==false,detail});}catch(e){checks.push({id,pass:false,detail:{error:e.message}});}};
const run=name=>json(RUNS+name+'.out.json');
// This mission may change only these baseline files; the mission files only after their first state-evidence block; new files only where listed.
const DELTA=['CoachingCore/src/r6-adaptation.mjs','CoachingCore/src/r6-composition.mjs','CoachingCore/src/r6-program.mjs','CoachingCore/test/r7ab-week-start-authority.test.mjs'];
const INSERT_ONLY={'CURRENT_MISSION.md':'<!-- DOMAIN_COACHING_R7ASE:','MISSION_LEDGER.md':'<!-- DCR7ASE-'};
const QUEUE='reviews/provisional-sports-science/2026-10-23/HUMAN_REVALIDATION_QUEUE.json',QUEUE_RECORD=AUDIT+'QUEUE_INTEGRATION_R7ASE.json';
const NEW_ALLOWED=[/^CoachingCore\/r7\/state-evidence\//,/^CoachingCore\/r7\/R7A_FINAL_HANDOFF\.md$/,/^CoachingCore\/test\/r7ase-[^/]+\.test\.mjs$/,/^CoachingCore\/scripts\/(prepare|regress|freeze|verify|queue)-r7ase\.mjs$/];
const PROTECTED_DIRS=['CoachingCore','product','canon','audits/domain-coaching-r6-2026-10-26','audits/domain-coaching-r7a-2026-10-27','audits/domain-coaching-r7a1-2026-10-27','audits/domain-coaching-r7a2-2026-10-28','audits/domain-coaching-r7a-final-2026-10-28','audits/domain-coaching-r7a-boundary-2026-10-28','audits/v1-wearable-scope-2026-10-27'];
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
 const single=fs.readdirSync(abs(OUT)).filter(x=>/^RUNTIME_FREEZE_/.test(x)),digest=hash(Object.fromEntries(Object.keys(f.files).filter(p=>p.startsWith('src/')).map(p=>[p,sha(cc(p))])));
 return {pass:!drift.length&&!unfrozen.length&&single.length===1&&f.revision==='STATE-EVIDENCE-FREEZE-1'&&digest===f.sourceDigest,revision:f.revision,sourceDigest:f.sourceDigest,recomputed:digest,freezes:single,deltaFromR7ABoundaryFreeze:f.deltaFromR7ABoundaryFreeze,drift,unfrozen};
});
check('policy-unchanged',()=>{const p=json('CoachingCore/r6/PROGRAM_POLICY_R6.json'),h=hash(p);return {pass:h==='18ec48f34768a7eebb2aede618db65a77385efebbda0a38d6f03135e5cd96b4c'&&sha('CoachingCore/r6/PROGRAM_POLICY_R6.json')==='a75be1aae3818616888e641c104407926d5f16f213a04137f5b21024ccafe100',policyHash:h,revision:p.revision};});
check('tests',()=>{
 const r=spawnSync(process.execPath,['--test'],{cwd:abs('CoachingCore'),encoding:'utf8',maxBuffer:256*1024*1024}),n=k=>Number(r.stdout.match(new RegExp('ℹ '+k+' (\\d+)'))?.[1]??NaN);
 return {pass:r.status===0&&n('fail')===0,tests:n('tests'),pass_:n('pass'),fail:n('fail'),node:process.version};
});
// The baseline reproduced the blocker on R7A-BOUNDARY-FINAL-FREEZE before any edit: the judge's outputs, byte for byte.
check('baseline-reproduced',()=>{
 const B=PROBES+'baseline/',v=json(B+'verify-r7ab.read-only.out.json'),t=fs.readFileSync(abs(B+'node-test.on-boundary-freeze.out.txt'),'utf8');
 const same=n=>sha(B+`qe-r7ab-${n}.on-boundary-freeze.out.json`)===sha(AB+`reviews/qe-r7ab-${n}.out.json`);
 const r={P40:same('P40'),P40b:same('P40b'),P40c:same('P40c'),P41:same('P41'),P47b:same('P47b'),verifyR7AB:`${v.passing}/${v.total}`,tests:t.match(/ℹ tests (\d+)/)?.[1]+' / fail '+t.match(/ℹ fail (\d+)/)?.[1]};
 return {pass:r.P40&&r.P40b&&r.P40c&&r.P41&&r.P47b&&r.verifyR7AB==='17/17'&&r.tests==='540 / fail 0',...r};
});
// Every recorded probe or grid output ran on the frozen bytes (the digest before and after the run), exited 0 and is the file recorded.
const EXPECTED_RUNS=[...json(AB+'probes/EVIDENCE_RUNS_R7AB.json').runs.map(r=>r.name).filter(n=>n!=='r7ab-self-challenge.FINAL'),
 ...['P30b','P30c','P40','P40.tz540','P40.tz-300','P40.tz-600','P40b','P40c','P41','P44','P45','P45b','P46.F1','P46.F3','P47','P47b'].map(p=>'qe7ab-'+p),'ssctr7ab-b-probe','r7ase-self-challenge','r7ase-self-challenge.BOUNDARY'];
check('evidence-runs-bound',()=>{
 const f=freeze(),e=json(PROBES+'EVIDENCE_RUNS_R7ASE.json'),names=new Set(e.runs.map(r=>r.name));
 const missing=EXPECTED_RUNS.filter(n=>!names.has(n)),unbound=e.runs.filter(r=>r.sourceDigestStart!==f.sourceDigest||r.sourceDigestEnd!==f.sourceDigest).map(r=>r.name),failed=e.runs.filter(r=>r.exit!==0).map(r=>r.name),changed=e.runs.filter(r=>sha(RUNS+r.name+'.out.json')!==r.outSha256).map(r=>r.name);
 return {pass:!missing.length&&!unbound.length&&!failed.length&&!changed.length&&exists(RUNS+'ssctr-instrument.data.json'),runs:e.runs.length,expected:EXPECTED_RUNS.length,missing,unbound,failed,changed};
});
// QE-R7AB-01 on the judge's own probes: in P40 (four time zones) the unreviewed cell's first interruption starts where its reviewed control
// starts, value for value as the probe reports them; P40c's moderate ceiling is the load lifted; P41 holds no count never executed; P47b's
// local-fatigue review gives the control's state.
check('qe-r7ab-01-closed',()=>{
 const p40=['qe7ab-P40','qe7ab-P40.tz540','qe7ab-P40.tz-300','qe7ab-P40.tz-600'].map(n=>({name:n,...Object.fromEntries(Object.entries(run(n).variants).map(([k,v])=>[k,{entryDiff:v.entryDiff,uRdl:v.cells.U.entry.strength['db-rdl']}]))}));
 const p40ok=p40.every(x=>Object.entries(x).filter(([k])=>k!=='name').every(([,v])=>v.entryDiff.run===null&&!Object.keys(v.entryDiff.strength).length));
 const c=run('qe7ab-P40c').cells,p40c={U:c.U.entry['db-rdl'].load,R:c.R.entry['db-rdl'].load,Usplit:c.U.entry['db-split-squat'].load};
 const p41=run('qe7ab-P41').entryDiffUvsR.filter(x=>/lastExecutedSets/.test(x)),p47b=run('qe7ab-P47b'),p47ok=['db-rdl','db-split-squat'].every(k=>p47b.withLocalFatigue[k]===p47b.control[k]);
 return {pass:p40ok&&p40c.U===p40c.R&&p40c.U===20&&!p41.length&&p47ok,P40:p40,P40c:p40c,P41lastExecutedSetsDiffs:p41,P47b:{control:p47b.control,withLocalFatigue:p47b.withLocalFatigue}};
});
// The earlier blockers stay closed on the judges' probes: QE-R7AF-01 (P30c, P30b), QE-R7A2-01 (P17, P19, P20, P21), QE-R7A1-09/10 (P13,
// P14), and identity in the R7-A final judge's 216-cell order and timing grid at four time zones.
check('earlier-blockers-closed',()=>{
 const c=run('qe7af-P30c'),p30c=Object.entries(c.cases).map(([k,x])=>({case:k,stateAt:x.stateAt,equalsStoredByA:x.startEqualsStoredByA,run:x.start.run}));
 const b=run('qe7af-P30b'),p30b={tally:b.tally,runAhead:b.cells.filter(x=>x.runAhead).length};
 const p17=run('qe2-P17'),c17=Object.values(p17.cases).every(c=>c.oracle.bRelation==='NEW'&&!c.oracle.preBreakDoseRows.length&&c.oracle.longRunsAfterB.every(l=>Number(l.split(' ')[1])<=45));
 const p19=run('qe2-P19').tally,p20=Object.values(run('qe2-P20').cases).every(c=>c.B.relation==='NEW'&&c.week4Tuesday.role==='EASY'),p21=run('qe2-P21').cases.G1.B.relation==='NEW';
 const p13=Object.values(run('qe-P13').cases).every(x=>x.classOfSecond==='REESTABLISH'&&!x.aboveExecutedReentry.length&&!x.aboveReentryPlan.length&&![...x.afterSecond.rows,...x.afterSecond.next].some(r=>/\b3x5@3\/KNOWN/.test(r)));
 const p31=['qe7af-P31','qe7af-P31.tz540','qe7af-P31.tz-300','qe7af-P31.tz-600'].map(n=>({name:n,...run(n).tally.byOracle,cells:run(n).tally.cells})),identity=p31.every(x=>x.V1===0&&x.V2===0&&x.V4===0&&x.V5===0&&x.cells===216);
 const okP30c=p30c.every(x=>x.stateAt.startsWith('RETURN/w5')&&!x.equalsStoredByA);
 return {pass:okP30c&&b.tally.runStepAhead===0&&c17&&p19.sameBreakB===0&&p19.preBreakDose===0&&p19.longAbove45===0&&p19.errors===0&&p20&&p21&&p13&&identity,P30c:p30c,P30b:p30b,P17:c17,P19:p19,P20:p20,P21:p21,P13:p13,P31:p31};
});
// D59: the SSCTR's first-week grid at E = O = B = 0 for NONE, FAMILIAR and KNOWN.
check('d59-first-week-grid',()=>{const o=run('ssctr-firstweek'),c=o.byClass;return {pass:['NONE','FAMILIAR','KNOWN'].every(k=>c[k].E===0&&c[k].O===0&&c[k].B===0),cases:o.cases,byClass:c};});
check('self-challenge',()=>{const live=run('r7ase-self-challenge'),bf=run('r7ase-self-challenge.BOUNDARY');return {pass:live.violations.length===0&&live.summary.classes>=12&&bf.violations.length>0&&bf.runtime==='QE_LIVE_ROOT',classes:live.summary.classes,violations:live.violations.length,onBoundaryFreeze:bf.violations.length};});
// This mission's tests on a byte-exact R7A-BOUNDARY-FINAL-FREEZE copy: recorded once (the file's digest is in the record).
check('tests-on-boundary-freeze',()=>{
 const t='CoachingCore/test/r7ase-state-evidence.test.mjs',rec=fs.readFileSync(abs(PROBES+'r7ase-tests.on-boundary-freeze.out.txt'),'utf8'),n=k=>Number(rec.match(new RegExp('ℹ '+k+' (\\d+)'))?.[1]??NaN);
 return {pass:rec.includes(sha(t))&&n('tests')>0&&n('fail')>0,boundToCurrentTestFile:rec.includes(sha(t)),tests:n('tests'),failingOnBoundaryFreeze:n('fail'),passingOnBoundaryFreeze:[...rec.matchAll(/^✔ (State evidence [^(]+)\(/gm)].map(m=>m[1].trim())};
});
check('mutation-check',()=>{const m=json(PROBES+'mutation-check-r7ase.out.json'),open=m.results.filter(r=>!r.caught&&!r.documented).map(r=>r.mutation);return {pass:m.total>0&&m.results.every(r=>r.applied)&&!open.length,caught:m.caught,total:m.total,documented:m.documentedSurvivors,open};});
// The regression against R7A-BOUNDARY-FINAL-FREEZE: identical, or a difference named in REGRESSION_R7ASE_NAMED.json.
check('regression',()=>{
 const g=json(OUT+'REGRESSION_R7ASE.json'),named=json(PROBES+'REGRESSION_R7ASE_NAMED.json').named,src=Object.entries(g.runtimes.current.sources).filter(([p,h])=>sha(p)!==h).map(([p])=>p),s=g.summary;
 const unnamed=['r5Corpus','profiles','simulations','r6FreshHoldout'].flatMap(k=>s[k].different.filter(id=>!named[id]).map(id=>k+':'+id)),statusChanged=['r5Corpus','r6FreshHoldout'].flatMap(k=>s[k].statusChanged);
 return {pass:!src.length&&!unnamed.length&&!statusChanged.length,sourcesBoundToCurrentRuntime:!src.length,r6:`${s.r6FreshHoldout.identical}/${s.r6FreshHoldout.cases}`,r5:`${s.r5Corpus.identical}/${s.r5Corpus.cases}`,profiles:`${s.profiles.identical}/${s.profiles.cases}`,simulations:`${s.simulations.identical}/${s.simulations.cases}`,different:['r5Corpus','profiles','simulations','r6FreshHoldout'].flatMap(k=>s[k].different),unnamed,statusChanged};
});
// Every other recorded output against the same probe's R7A-BOUNDARY-FINAL-FREEZE output: identical, or a difference named in COMPARE_R7ASE_NAMED.json.
check('compared-with-boundary-freeze',()=>{
 const c=json(PROBES+'COMPARE_R7ASE.json'),named=exists(PROBES+'COMPARE_R7ASE_NAMED.json')?json(PROBES+'COMPARE_R7ASE_NAMED.json').named:{},unnamed=c.summary.different.filter(n=>!named[n]);
 return {pass:!unnamed.length&&!c.summary.uncompared.length&&!c.summary.failed.length,identical:c.summary.identical,different:c.summary.different,unnamed,uncompared:c.summary.uncompared};
});
const REVIEWS_EXPECTED={engineering:REVIEWS+'quality-engineering-r7ase-review.json',ssctr:REVIEWS+'ssctr-r7ase-regression.json'};
check('independent-reviews',()=>{const f=freeze(),out={};for(const [k,p] of Object.entries(REVIEWS_EXPECTED)){if(!exists(p)){out[k]={present:false};continue;}const r=json(p),digest=r.freezeReviewed?.sourceDigest??r.sourceDigest??null;out[k]={present:true,file:p,verdict:r.verdict??null,digest,bound:digest===f.sourceDigest};}return {pass:Object.values(out).every(x=>x.present&&x.bound),...out};});
check('queue-append-only',()=>{
 const b=json(AUDIT+'BASELINE.json').entries.find(e=>e.path===QUEUE),now=sha(QUEUE);
 if(now===b.sha256)return {pass:!exists(QUEUE_RECORD),integrated:false,note:'Queue unchanged since the state evidence baseline'};
 const rec=json(QUEUE_RECORD),q=json(QUEUE),back=structuredClone(q);back.items=back.items.slice(0,rec.before.items);back.queue_revision=rec.before.revision;delete back.r7ase_queue_addendum;
 const restored=createHash('sha256').update(JSON.stringify(back,null,2)+'\n').digest('hex'),appended=q.items.slice(rec.before.items).map(i=>i.queue_id);
 return {pass:rec.before.sha256===b.sha256&&restored===b.sha256&&rec.after.sha256===now&&appended.length>0&&appended.every(id=>/^HQ-R7ASE-/.test(id))&&q.funding_trigger.state==='NOT_DECLARED',before:rec.before,after:{items:q.items.length,sha256:now},appended,earlierItemsByteIdentical:restored===b.sha256};
});
check('deliverables',()=>{const list=[AUDIT+'TASK_CONTRACT.md',AUDIT+'STATE_EVIDENCE_CONTRACT.md',OUT+'READINESS_R7ASE.json',OUT+'FINAL_REPORT_R7ASE.md',AUDIT+'FINAL_DISPOSITION.json'],handoff='CoachingCore/r7/R7A_FINAL_HANDOFF.md',r=exists(OUT+'READINESS_R7ASE.json')?json(OUT+'READINESS_R7ASE.json'):{},ready=r.verdicts?.R7A_EXIT_READINESS==='READY';const missing=[...list,...(ready?[handoff]:[])].filter(p=>!exists(p)),handoffWithoutReady=!ready&&exists(handoff);return {pass:!missing.length&&!handoffWithoutReady,missing,handoffWithoutReady,exit:r.verdicts?.R7A_EXIT_READINESS??null};});
const out={revision:'R7ASE-VERIFICATION-1',verifiedAt:new Date().toISOString(),node:process.version,passing:checks.filter(c=>c.pass).length,total:checks.length,checks};
if(process.argv.includes('--write'))fs.writeFileSync(abs(OUT+'VERIFICATION_R7ASE.json'),JSON.stringify(out,null,2)+'\n');
console.log(JSON.stringify({passing:out.passing,total:out.total,failing:checks.filter(c=>!c.pass).map(c=>c.id)}));
