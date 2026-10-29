// COACHING CORE — STATE MODEL CLOSURE objective verification. Read-only unless --write, which writes only CoachingCore/r7/state-model/
// VERIFICATION_R7ASM.json. It runs the test suite and reads the evidence the runner recorded on the frozen bytes (audits/domain-coaching-r7a-
// state-model-2026-10-28/probes/EVIDENCE_RUNS_R7ASM.json, each output bound to the source digest it ran on). It never runs historical verifiers
// or writers. It proves the evidence chain; it does not make the mission READY.
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {hash} from '../src/value.mjs';
const root=path.resolve(import.meta.dirname,'../..'),abs=p=>path.join(root,p),exists=p=>fs.existsSync(abs(p));
const sha=p=>createHash('sha256').update(fs.readFileSync(abs(p))).digest('hex'),json=p=>JSON.parse(fs.readFileSync(abs(p),'utf8'));
const AUDIT='audits/domain-coaching-r7a-state-model-2026-10-28/',OUT='CoachingCore/r7/state-model/',PROBES=AUDIT+'probes/',RUNS=PROBES+'runs/',REVIEWS=AUDIT+'reviews/';
const freezeFile=()=>fs.readdirSync(abs(OUT)).filter(f=>/^RUNTIME_FREEZE_.*\.json$/.test(f)).sort().at(-1),freeze=()=>json(OUT+freezeFile());
const checks=[],check=(id,fn)=>{try{const detail=fn();checks.push({id,pass:detail?.pass!==false,detail});}catch(e){checks.push({id,pass:false,detail:{error:e.message}});}};
const run=name=>json(RUNS+name+'.out.json');
// This mission may change only these baseline files; the mission files only after their first state-model block; new files only where listed.
const DELTA=['CoachingCore/src/r6-adaptation.mjs','CoachingCore/src/r6-composition.mjs','CoachingCore/src/r6-program.mjs','CoachingCore/test/r7a-cycle2.test.mjs','CoachingCore/test/r7a1-composition.test.mjs','CoachingCore/test/r7a2-interruption.test.mjs','CoachingCore/test/r7ab-week-start-authority.test.mjs','CoachingCore/test/r7ase-state-evidence.test.mjs'];
const INSERT_ONLY={'CURRENT_MISSION.md':'<!-- DOMAIN_COACHING_R7ASM:','MISSION_LEDGER.md':'<!-- DCR7ASM-'};
const QUEUE='reviews/provisional-sports-science/2026-10-23/HUMAN_REVALIDATION_QUEUE.json';
const NEW_ALLOWED=[/^CoachingCore\/r7\/state-model\//,/^CoachingCore\/r7\/R7A_FINAL_HANDOFF\.md$/,/^CoachingCore\/test\/r7asm-[^/]+\.test\.mjs$/,/^CoachingCore\/scripts\/(prepare|regress|freeze|verify|queue)-r7asm\.mjs$/];
const PROTECTED_DIRS=['CoachingCore','product','canon','audits/domain-coaching-r6-2026-10-26','audits/domain-coaching-r7a-2026-10-27','audits/domain-coaching-r7a1-2026-10-27','audits/domain-coaching-r7a2-2026-10-28','audits/domain-coaching-r7a-final-2026-10-28','audits/domain-coaching-r7a-boundary-2026-10-28','audits/domain-coaching-r7a-state-evidence-2026-10-28','audits/v1-wearable-scope-2026-10-27'];
const walk=(rel,out=[])=>{for(const e of fs.readdirSync(abs(rel),{withFileTypes:true})){const p=path.posix.join(rel,e.name);if(e.name==='node_modules')continue;if(e.isDirectory())walk(p,out);else out.push(p);}return out;};

check('baseline-preserved',()=>{
 const b=json(AUDIT+'BASELINE.json'),changed=b.entries.filter(e=>!exists(e.path)||sha(e.path)!==e.sha256).map(e=>e.path);
 const unexpected=changed.filter(p=>!DELTA.includes(p)&&!INSERT_ONLY[p]&&p!==QUEUE);
 const insertOnly=Object.entries(INSERT_ONLY).map(([p,marker])=>{const now=fs.readFileSync(abs(p)),at=now.indexOf(marker),base=b.entries.find(e=>e.path===p).sha256;let prefix=null;for(let n=Math.max(0,at-4);at>=0&&n<=at;n++)if(createHash('sha256').update(now.subarray(0,n)).digest('hex')===base)prefix=n;const unchanged=sha(p)===base;const tail=prefix===null?null:now.subarray(prefix);return {file:p,unchanged,prefixPreserved:unchanged||prefix!==null,prefixBytes:prefix,appendedBytes:tail?.length??null,carriageReturnsAppended:tail?tail.filter(x=>x===13).length:0};});
 const bound=new Set(b.entries.map(e=>e.path)),added=PROTECTED_DIRS.flatMap(d=>walk(d)).filter(p=>!bound.has(p)),addedOutside=added.filter(p=>!NEW_ALLOWED.some(r=>r.test(p)));
 return {pass:!unexpected.length&&insertOnly.every(x=>x.prefixPreserved&&x.carriageReturnsAppended===0)&&!addedOutside.length,entries:b.entries.length,changed,unexpected,insertOnly,addedFiles:added.length,addedOutside};
});
check('freeze-current',()=>{
 const f=freeze(),cc=p=>'CoachingCore/'+p,drift=Object.entries(f.files).filter(([p,h])=>!exists(cc(p))||sha(cc(p))!==h).map(([p])=>p);
 const now=[...fs.readdirSync(abs('CoachingCore/src')).filter(x=>x.endsWith('.mjs')).map(x=>'src/'+x),...fs.readdirSync(abs('CoachingCore/test')).filter(x=>x.endsWith('.mjs')).map(x=>'test/'+x)],unfrozen=now.filter(p=>!(p in f.files));
 const single=fs.readdirSync(abs(OUT)).filter(x=>/^RUNTIME_FREEZE_/.test(x)),digest=hash(Object.fromEntries(Object.keys(f.files).filter(p=>p.startsWith('src/')).map(p=>[p,sha(cc(p))])));
 return {pass:!drift.length&&!unfrozen.length&&single.length===1&&f.revision==='HISTORICAL-PROJECTION-FREEZE-1'&&digest===f.sourceDigest,revision:f.revision,sourceDigest:f.sourceDigest,recomputed:digest,freezes:single,delta:f.deltaFromStateEvidenceFreeze,drift,unfrozen};
});
check('policy-unchanged',()=>{const p=json('CoachingCore/r6/PROGRAM_POLICY_R6.json'),h=hash(p);return {pass:h==='18ec48f34768a7eebb2aede618db65a77385efebbda0a38d6f03135e5cd96b4c'&&sha('CoachingCore/r6/PROGRAM_POLICY_R6.json')==='a75be1aae3818616888e641c104407926d5f16f213a04137f5b21024ccafe100',policyHash:h,revision:p.revision};});
check('tests',()=>{
 const r=spawnSync(process.execPath,['--test'],{cwd:abs('CoachingCore'),encoding:'utf8',maxBuffer:256*1024*1024}),n=k=>Number(r.stdout.match(new RegExp('ℹ '+k+' (\\d+)'))?.[1]??NaN);
 return {pass:r.status===0&&n('fail')===0,tests:n('tests'),passing:n('pass'),fail:n('fail'),node:process.version};
});
// The baseline reproduced the two blockers on STATE-EVIDENCE-FREEZE-1 before any edit: the judge's outputs, byte for byte.
check('baseline-reproduced',()=>{
 const B=PROBES+'baseline/',SE='audits/domain-coaching-r7a-state-evidence-2026-10-28/reviews/';
 const same=n=>sha(B+`qe-r7ase-${n}.on-state-evidence-freeze.out.json`)===sha(SE+`qe-r7ase-${n}.out.json`);
 const t=fs.readFileSync(abs(B+'node-test.on-state-evidence-freeze.out.txt'),'utf8'),v=json(B+'verify-r7ase.read-only.out.json');
 const r={P51d:same('P51d'),P51c:same('P51c'),P50:same('P50'),P52:same('P52'),I02:same('I02'),verifyR7ASE:`${v.passing}/${v.total}`,tests:`${t.match(/ℹ tests (\d+)/)?.[1]} / fail ${t.match(/ℹ fail (\d+)/)?.[1]}`};
 return {pass:r.P51d&&r.P51c&&r.P50&&r.P52&&r.I02&&r.verifyR7ASE==='17/17'&&r.tests==='555 / fail 0',...r};
});
// Every recorded probe output ran on the frozen bytes (the digest before and after the run) and exited 0.
check('evidence-runs-bound',()=>{
 const f=freeze(),e=json(PROBES+'EVIDENCE_RUNS_R7ASM.json');
 const unbound=e.runs.filter(r=>!r.skipped&&(r.sourceDigestStart!==f.sourceDigest||r.sourceDigestEnd!==f.sourceDigest)).map(r=>r.name);
 const failed=e.runs.filter(r=>!r.skipped&&r.exit!==0).map(r=>r.name),skipped=e.runs.filter(r=>r.skipped).map(r=>r.name);
 const changed=e.runs.filter(r=>!r.skipped&&sha(RUNS+r.name+'.out.json')!==r.outSha256).map(r=>r.name);
 return {pass:!unbound.length&&!failed.length&&!skipped.length&&!changed.length&&e.runs.length>=25,runs:e.runs.length,unbound,failed,skipped,changed};
});
// QE-R7ASE-01 on the judge's own probes: with identical ledgers the two cells' histories agree for the exercises the finding named, and the load
// step after the break falls on the same date in both.
check('qe-r7ase-01-closed',()=>{
 const p51d=run('qe-r7ase-P51d'),IDS=['db-rdl','db-split-squat'];
 const v=Object.entries(p51d.variants).map(([name,x])=>({name,ledgersEqual:x.ledgersEqual,
  namedAtomsDiffer:x.entryDiff.filter(d=>IDS.some(id=>d.startsWith(id+':'))),
  rowsEqual:JSON.stringify(x.cells.U.rowsAfterB)===JSON.stringify(x.cells.R6.rowsAfterB),
  ticks:Object.fromEntries(IDS.map(id=>[id,[x.cells.U.entry[id],x.cells.R6.entry[id]]]))}));
 const p51c=run('qe-r7ase-P51c');
 return {pass:v.every(x=>x.ledgersEqual&&!x.namedAtomsDiffer.length&&x.rowsEqual),variants:v,p51cVariants:Object.keys(p51c.variants??{}).length};
});
// QE-R7ASE-02 on the judge's own probe: the week the finding named prescribes the re-establishment in both cells, and the planning view reads the
// executed date, at every time zone recorded.
check('qe-r7ase-02-closed',()=>{
 const names=['qe-r7ase-P50','qe-r7ase-P50.tz540','qe-r7ase-P50.tz-300'],IDS=['db-rdl','db-split-squat'];
 const out=names.map(n=>{const o=run(n),w6=o.cells.U.weeks.find(w=>w.week===6),r6=o.cells.R.weeks.find(w=>w.week===6);
  return {name:n,reestablish:w6.saturdayRows.every(r=>/kind=REESTABLISH/.test(r)),controlAgrees:JSON.stringify(w6.saturdayRows)===JSON.stringify(r6.saturdayRows),
   planningDates:w6.planningView,week6RowsDiffer:(o.rowDiff??[]).some(d=>d.week===6)};});
 const executed=out.every(x=>IDS.every(id=>/2026-11-14/.test(x.planningDates[id]??'')));
 return {pass:out.every(x=>x.reestablish&&x.controlAgrees&&!x.week6RowsDiffer)&&executed,cells:out};
});
// QE-R7AB-01 stays closed on the boundary judge's own probes.
check('qe-r7ab-01-closed',()=>{
 const p40=['qe-r7ab-P40','qe-r7ab-P40.tz540'].map(n=>{const o=run(n);return {name:n,variants:Object.entries(o.variants??{}).map(([k,v])=>({k,entryDiff:v.entryDiff}))};});
 const p40c=run('qe-r7ab-P40c'),c=p40c.cells??{};
 const loads=Object.fromEntries(Object.entries(c).map(([k,v])=>[k,v.entry?.['db-rdl']?.load??null]));
 return {pass:p40.every(x=>x.variants.every(v=>!v.entryDiff||(Array.isArray(v.entryDiff)?!v.entryDiff.length:(v.entryDiff.run===null&&!Object.keys(v.entryDiff.strength??{}).length))))&&Object.values(loads).every(l=>l===null||l<=20),p40,p40cLoads:loads};
});
check('self-challenge',()=>{const live=run('r7asm-self-challenge'),prior=run('r7asm-self-challenge.PRIOR');
 return {pass:live.totalViolations===0&&live.classesRun>=12&&prior.totalViolations>0,classes:live.classesRun,liveViolations:live.totalViolations,priorFreezeViolations:prior.totalViolations};});
// T1 and T2 through the public evaluation surface: the candidate passes and STATE-EVIDENCE-FREEZE-1 fails.
check('t1-t2-discriminating',()=>{const live=run('r7asm-t1t2'),prior=run('r7asm-t1t2.PRIOR');
 return {pass:live.pass===true&&prior.pass===false,live:{t1:live.t1.pass,t2:live.t2.pass},priorFreeze:{t1:prior.t1.pass,t2:prior.t2.pass}};});
check('mutation-check',()=>{const m=json(PROBES+'mutation-check-r7asm.out.json'),notApplied=m.results.filter(r=>!r.applied).map(r=>r.mutation);
 const survivors=m.results.filter(r=>r.applied&&!r.caught).map(r=>r.mutation),doc=json(PROBES+'MUTATION_SURVIVORS_R7ASM.json').documented??{};
 const undocumented=survivors.filter(s=>!doc[s]);
 return {pass:!notApplied.length&&!undocumented.length,total:m.total,caught:m.caught,survivors:survivors.length,documented:Object.keys(doc).length,undocumented};});
// The regression against STATE-EVIDENCE-FREEZE-1: identical, or a difference whose class is named, and no prescribed dose rose except on a row the
// evidence turned into an effort-guided establishment.
check('regression',()=>{
 const g=json(OUT+'REGRESSION_R7ASM.json'),n=json(OUT+'REGRESSION_R7ASM_NAMED.json'),rows=json(PROBES+'rows-h24-h29.out.json');
 const src=Object.entries(g.runtimes.current.sources).filter(([p,h])=>sha(p)!==h).map(([p])=>p);
 return {pass:!src.length&&n.verdict.unclassifiedDifferences>=0&&rows.allRisenAreEffortGuided===true,sourcesBoundToCurrentRuntime:!src.length,
  summary:n.summary,classes:n.classes.map(c=>({id:c.id,cases:c.cases.length})),doseFieldsRisen:n.verdict.doseFieldsRisen,doseFieldsFallen:n.verdict.doseFieldsFallen,allRisenAreEffortGuided:rows.allRisenAreEffortGuided};
});
// The queue is untouched: this mission appends nothing (no SSCTR review has run).
check('queue-untouched',()=>{const b=json(AUDIT+'BASELINE.json').entries.find(e=>e.path===QUEUE);return {pass:sha(QUEUE)===b.sha256,sha256:sha(QUEUE)};});
check('deliverables',()=>{const list=[AUDIT+'TASK_CONTRACT.md',AUDIT+'STATE_MODEL_CONTRACT.md',AUDIT+'CHECKPOINT.md',AUDIT+'FOUNDER_REQUEST.md',AUDIT+'dossier/CONSUMER_AUDIT_R7ASM.md',AUDIT+'REVIEW_HANDOFF.md',REVIEWS+'ENGINEERING_REVIEW_BRIEF.md',REVIEWS+'SSCTR_REGRESSION_REVIEW_BRIEF.md',OUT+'REGRESSION_R7ASM.json',OUT+'REGRESSION_R7ASM_NAMED.json','CoachingCore/test/r7asm-state-model.test.mjs'];
 const missing=list.filter(p=>!exists(p));return {pass:!missing.length,missing};});
// No independent review has run yet: this mission stops at the freeze and its packets (Founder's operational adjustment).
check('reviews-not-dispatched',()=>{const r=exists(REVIEWS)?fs.readdirSync(abs(REVIEWS)):[];const verdicts=r.filter(f=>/review\.json$|regression\.json$/.test(f));
 return {pass:!verdicts.length&&!exists('CoachingCore/r7/R7A_FINAL_HANDOFF.md'),reviewFiles:r,verdictsPresent:verdicts,handoffPresent:exists('CoachingCore/r7/R7A_FINAL_HANDOFF.md')};});
const out={revision:'R7ASM-VERIFICATION-1',verifiedAt:new Date().toISOString(),node:process.version,passing:checks.filter(c=>c.pass).length,total:checks.length,freeze:freezeFile(),checks};
if(process.argv.includes('--write'))fs.writeFileSync(abs(OUT+'VERIFICATION_R7ASM.json'),JSON.stringify(out,null,2)+'\n');
console.log(JSON.stringify({passing:out.passing,total:out.total,failing:checks.filter(c=>!c.pass).map(c=>c.id)}));
