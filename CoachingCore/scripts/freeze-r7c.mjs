// R7-C freeze (node scripts/freeze-r7c.mjs): R7C-FREEZE-1, DOMAIN_COACHING_R7-C Phase 5, on top of R7B2-FREEZE-1 (commit 1a1c728). Lean form of the
// R7-B.2 freeze (scripts/freeze-r7b2.mjs): it binds the committed bytes (every src and test file, the fixtures, the policy and catalog, the scripts
// and the R7-C probes that make the evidence) by SHA-256, with a source digest and a manifest digest (canonical hash, src/value.mjs), and records on
// these bytes the suite (zero failures required) and the three conformance checks (PASS required, run read-only). It binds, by SHA-256, the R7-C
// evidence outputs made on the same runtime bytes: the evidence manifest (probes/phase5-run-evidence.mjs) and the mutation run
// (probes/phase5-mutation.mjs), whose results must hold (G01 SD grid 0 violations, G02 identical to Phase 4, clinical probes PASS, conformance PASS,
// every SD mutant killed, the Phase 3 set 17/18 with G02-M4 equivalent and its witness killed, the Phase 4 rules 8/8). It binds the SSCTR semantic
// disposition that authorized the legacy split (SSCTR-SD-R7C-r2, ACCEPT_R7C_UNKNOWN_SEMANTICS) and carries the conditions its acceptance binds to
// this record: C2, C3, C8 and C9 (consumer conditions) and C7 (disclosures).
// It refuses when the bound bytes are not committed, when the policy, catalog, B0 records, human queue, product/ or canon/ changed since the R7-B.2
// closure, or when CURRENT_MISSION.md or MISSION_LEDGER.md is not append-only since then. One record: an existing record is never overwritten.
// It writes only CoachingCore/r7/c/RUNTIME_FREEZE_R7C_1.json. Usage: node scripts/freeze-r7c.mjs --evidence <manifest> --mutation <mutation json>
// --revision 2 (R7C-FREEZE-2, the single correction cycle after the Engineering review of R7C-FREEZE-1): the same checks on the corrected bytes,
// plus package.json and package-lock.json (QE-R7C-06) and the Engineering reproduction probes among the bound files, every correction-cycle
// mutant killed, and the predecessor's reviews (SSCTR final recheck, Engineering review) bound by SHA-256 with the cycle's delta from
// R7C-FREEZE-1. It writes only CoachingCore/r7/c/RUNTIME_FREEZE_R7C_2.json.
// --revision 3 (R7C-FREEZE-3, DOMAIN_COACHING_R7-C Phase 6, QE-R7C-07): the same checks on the Phase 6 bytes, plus the Engineering recheck
// probes among the bound files; the evidence of probes/phase6-run-evidence.mjs (the recheck's recorder-independence grid with 0 of 160 cells
// failing, the differential against R7C-FREEZE-2 with no differing scenario) and of probes/phase6-mutation.mjs (every Phase 6 and correction-
// cycle mutant killed); the predecessor's rechecks (Engineering NOT_READY on QE-R7C-07, SSCTR-CC-R7C-r4) bound by SHA-256 with the phase's delta
// from R7C-FREEZE-2, the classified test updates and the r4 condition updates. It writes only CoachingCore/r7/c/RUNTIME_FREEZE_R7C_3.json.
// --revision 4 (R7C-FREEZE-4, DOMAIN_COACHING_R7-C Phase 7, QE-R7C-10): the same checks on the Phase 7 bytes, plus the Engineering Phase 6 and the
// SSCTR Phase 6 and CC probes among the bound files; the evidence of probes/phase7-run-evidence.mjs (recorder independence 0 failing on the
// original 160 cells, the shortened 280, the SSCTR mixed scope 768 and CC2 1,200; no stale valid and no full-dose or shortened failure in the
// 1,536 trajectories; the differential against R7C-FREEZE-3 with only the declared family differing and never beyond the timely facts; history
// with no violation) and of probes/phase7-mutation.mjs (every earlier set as before and every Phase 7 mutant killed by its own witness); the
// predecessor's reviews (Engineering NOT_READY on QE-R7C-10, SSCTR-P6-R7C-r5) bound by SHA-256 with the phase's delta from R7C-FREEZE-3 (no
// existing test changed), the evidence-visibility metadata it adds and its backward behaviour, and the r5 conditions. It writes only
// CoachingCore/r7/c/RUNTIME_FREEZE_R7C_4.json.
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {hash} from '../src/value.mjs';
const N=(()=>{const i=process.argv.indexOf('--revision');return i>=0?process.argv[i+1]:'1';})();if(!['1','2','3','4'].includes(N))throw Error('--revision 1|2|3|4');
const cc=path.resolve(import.meta.dirname,'..'),repo=path.resolve(cc,'..'),revision='R7C-FREEZE-'+N;
const F1={revision:'R7C-FREEZE-1',commit:'1890f66356455112907d757032a8b1cd2de29c00',record:'CoachingCore/r7/c/RUNTIME_FREEZE_R7C_1.json'};
const F2={revision:'R7C-FREEZE-2',commit:'a10cec04071be97e409f11a4f831f13eae0c9769',record:'CoachingCore/r7/c/RUNTIME_FREEZE_R7C_2.json'};
const F3={revision:'R7C-FREEZE-3',commit:'08c6db352d102e2b33ed7e834cff980248b90299',record:'CoachingCore/r7/c/RUNTIME_FREEZE_R7C_3.json'};
// R7C-FREEZE-4 (QE-R7C-10): the evidence-visibility metadata the phase adds, and what records written before it get (the Founder's condition for
// new metadata: no dose, no authority, factual evidence visibility only, deterministic, explicit backward behaviour).
const P7_METADATA={field:'provenance.firstRecordedAt',writtenBy:'evaluateProgram (normalizeObservations with recordArrival): the clock of the decision whose input first carried a report of that execution into the completed-work record; never taken from the input; carried unchanged; one execution (an agreeing duplicate, a correction and what it corrects) keeps the earliest',readBy:'answeredOnRecord / unreadRunReports only: a report of a week a review closed is unread by it when the record first held it after that review\'s clock (evidenceThrough)',notReadBy:['the evidence reducer and HistoricalState','the learning model (normalizations without recordArrival keep no clock)','any dose, gate or authority'],
 whyNeeded:'Without it a late report and an on-time report of a run done short are the same canonical facts (same ledger rows, timestamps, gates and stored states; only the review\'s reason text differs), so no rule on the existing structures can read the first as unread and the second as read (QE-R7C-10 requires both).',
 backwardBehaviour:'A record written before R7C-FREEZE-4 carries no first-recorded clock: for such a report the R7C-FREEZE-3 reading stands (legacyUnreadWeeks: the gate-class rule, sound for full-dose and adverse answers; a shortened late answer on such a record reads as on R7C-FREEZE-3). Nothing is migrated: the arrival of those reports was never recorded and is not invented.'};
// The Phase 6 test updates, each classified before it was made (no assertion changed): the P51 history's fixture pin.
const P6_TEST_UPDATES=[{commit:'dca3f94',classification:'EXPECTED_SEMANTIC_UPDATE',scope:'fixture only; no assertion changed',files:['CoachingCore/test/r7asm-state-model.test.mjs','CoachingCore/test/r7asc-state-consumer.test.mjs'],tests:['T1 (QE-R7ASE-01)','T6','T6b','T7c','S3'],
 reason:'Their P51 history (weeks 2-4 kept by KEEP reviews, weeks 5-6 reported day by day and never reviewed) leaves the plan for week 7 resting on projection over its whole run window; under the Phase 6 invariant that is the state of an answer a refusal or a clinical route recorded, so week 7\'s first decision re-plans it from the facts (answeredOnRecord) and the plan no longer runs ahead. The pin (week 4\'s review adopts a back squat logged 2.5 kg above the plan, an evidence anchor that read the week\'s runs) restores the premise; the assertions are unchanged and pass on R7C-FREEZE-2 bytes too. The original history is pinned by test/r7c-phase6.test.mjs (reach).'}];
const B2_FREEZE='1a1c7286adc8b08d16f97dea86f4973fe33e5a95',B2_CLOSURE='baa2cb1',AUD='audits/domain-coaching-r7-c-2026-11-01';
const arg=k=>{const i=process.argv.indexOf(k);return i>=0?process.argv[i+1]:null;};
const target=path.join(cc,`r7/c/RUNTIME_FREEZE_R7C_${N}.json`);
if(fs.existsSync(target))throw Error(revision+' exists already ('+target+'); it is never overwritten');
const refuse=why=>{throw Error('Freeze refused: '+why);};
const git=(...a)=>{const r=spawnSync('git',a,{cwd:repo,encoding:'utf8',maxBuffer:1<<26});if(r.status!==0)refuse('git '+a.join(' ')+': '+r.stderr);return r.stdout;};
const shaRepo=p=>createHash('sha256').update(fs.readFileSync(path.join(repo,p))).digest('hex');
const head=git('rev-parse','HEAD').trim();
// Inputs unchanged since the R7-B.2 closure; mission and ledger append-only since then.
const UNCHANGED=['CoachingCore/r6','CoachingCore/r5','CoachingCore/r7/b0','CoachingCore/r7/b/fixtures','audits/domain-coaching-r7-b0-2026-10-31/reviews','reviews/provisional-sports-science/2026-10-23/HUMAN_REVALIDATION_QUEUE.json','product','canon'];
if(spawnSync('git',['diff','--quiet',B2_CLOSURE,'HEAD','--',...UNCHANGED],{cwd:repo}).status!==0)refuse('an input changed since the R7-B.2 closure');
for(const f of ['CURRENT_MISSION.md','MISSION_LEDGER.md']){const base=spawnSync('git',['show',`${B2_CLOSURE}:${f}`],{cwd:repo,encoding:'buffer'}).stdout,now=fs.readFileSync(path.join(repo,f));if(!base.length||!now.subarray(0,base.length).equals(base))refuse(f+' is not append-only since the R7-B.2 closure');}
// The bound files.
const ls=d=>fs.readdirSync(path.join(repo,d)).filter(f=>f.endsWith('.mjs')).map(f=>`${d}/${f}`);
const list=[...ls('CoachingCore/src'),...ls('CoachingCore/test'),'CoachingCore/r7/b/fixtures/helpers.mjs','CoachingCore/r6/fixtures/dev-authority.mjs','CoachingCore/r6/fixtures/profiles.mjs','CoachingCore/r6/PROGRAM_POLICY_R6.json','CoachingCore/r7/b0/REPERTOIRE_CATALOG_B0.json','CoachingCore/r6/holdout/R6_INDEPENDENT_HOLDOUT.json','audits/domain-coaching-r7-b0-2026-10-31/reviews/SSCTR_RECHECK_B0.json',
 ...['conformance-r7b','conformance-r7b1','conformance-r7b2','neighbors-r7b2','regress-r7b2','evaluate-holdout-r6','freeze-r7c','verify-r7c'].map(s=>`CoachingCore/scripts/${s}.mjs`),
 ...ls(`${AUD}/probes`),...ls(`${AUD}/probes/b2-copy`),...ls(`${AUD}/reviews/ssctr/probes/sd`),...(N!=='1'?['CoachingCore/package.json','CoachingCore/package-lock.json',...ls(`${AUD}/reviews/engineering/probes`),...(['3','4'].includes(N)?ls(`${AUD}/reviews/engineering/probes/recheck`):[])]:[]),
 ...(N==='4'?[...ls(`${AUD}/reviews/engineering/probes/phase6`),...ls(`${AUD}/reviews/ssctr/probes/phase6`),...ls(`${AUD}/reviews/ssctr/probes/cc`)]:[])];
const missing=list.filter(p=>!fs.existsSync(path.join(repo,p)));if(missing.length)refuse('bound files missing: '+missing.join(', '));
const files=Object.fromEntries([...new Set(list)].sort().map(p=>[p,shaRepo(p)]));
// Committed bytes only: every bound file is in HEAD with the same bytes as on disk.
const shaHead=p=>{const r=spawnSync('git',['show',`${head}:${p}`],{cwd:repo,encoding:'buffer',maxBuffer:1<<28});return r.status===0?createHash('sha256').update(r.stdout).digest('hex'):null;};
const uncommitted=Object.entries(files).filter(([p,s])=>shaHead(p)!==s).map(([p])=>p);if(uncommitted.length)refuse('bound files differ from HEAD (commit first): '+uncommitted.slice(0,10).join(', '));
const sourceDigest=hash(Object.fromEntries(Object.entries(files).filter(([p])=>p.startsWith('CoachingCore/src/')))),manifestDigest=hash(files);
const deltaSrc=git('diff','--name-only',B2_FREEZE,'HEAD','--','CoachingCore/src').split('\n').filter(Boolean),deltaTest=git('diff','--name-status',B2_FREEZE,'HEAD','--','CoachingCore/test').split('\n').filter(Boolean);
// Evidence on these bytes: the suite and the conformance checks (read-only; their stdout is the report).
const run=(args,label,cwd=cc)=>{const r=spawnSync(process.execPath,args,{cwd,encoding:'utf8',maxBuffer:1<<28,timeout:1800000});if(r.error)refuse(label+': '+r.error.message);return r;};
const t=run(['--test'],'suite'),n=k=>Number(t.stdout.match(new RegExp('ℹ '+k+' (\\d+)'))?.[1]??NaN);
const tests={count:n('tests'),pass:n('pass'),fail:n('fail'),durationMs:n('duration_ms'),node:process.version};
if(!(tests.count>0&&tests.fail===0&&tests.pass===tests.count))refuse('suite '+JSON.stringify(tests));
const conformance=Object.fromEntries(['conformance-r7b','conformance-r7b1','conformance-r7b2'].map(s=>{const r=run([`scripts/${s}.mjs`],s);let j;try{j=JSON.parse(r.stdout);}catch{refuse(s+': no JSON');}if(j.result!=='PASS')refuse(s+': '+JSON.stringify(j.problems).slice(0,300));return [s,{result:j.result,sha256:createHash('sha256').update(r.stdout).digest('hex')}];}));
// The R7-C evidence outputs, made on the same runtime bytes.
const evPath=arg('--evidence'),muPath=arg('--mutation');if(!evPath||!muPath)refuse('give --evidence <manifest> and --mutation <mutation json>');
const ev=JSON.parse(fs.readFileSync(path.join(repo,evPath),'utf8')),mu=JSON.parse(fs.readFileSync(path.join(repo,muPath),'utf8'));
for(const [label,commit] of [['evidence',ev.head],['mutation',mu.head]])if(spawnSync('git',['diff','--quiet',commit,'HEAD','--','CoachingCore/src','CoachingCore/test'],{cwd:repo}).status!==0)refuse(`${label} was made on other runtime or test bytes (${commit})`);
const outOf=name=>{const j=ev.jobs.find(x=>x.name===name);if(!j||j.exit!==0&&!['neighbors-r7b2-vs-R7B2-FREEZE-1','differential-regress-r7b2-vs-R7B2-FREEZE-1','differential-regress-r7b2-stamp-neutral-vs-R7B2-FREEZE-1'].includes(name))refuse('evidence job '+name+' missing or failed');if(shaRepo(j.output)!==j.sha256)refuse('evidence output changed: '+j.output);return JSON.parse(fs.readFileSync(path.join(repo,j.output),'utf8'));};
const sd=outOf('adversarial-sd'),g01=outOf('adversarial-g01'),g02=outOf('adversarial-g02'),full=outOf('full-suite');
if(sd.summary.total!==0)refuse('SD grid violations '+sd.summary.total);
if(g01.violations.length||g01.p1.failed.length)refuse('G01 grid violations');
if(shaRepo(ev.jobs.find(x=>x.name==='adversarial-g02').output)!==shaRepo(`${AUD}/probes/out/adversarial-g02.R7C-P4-39115ed.json`))refuse('G02 differs from Phase 4');
if(full.fail!==0)refuse('evidence full suite has failures');
const clinical=ev.jobs.filter(j=>j.name.startsWith('b2-copy/')).map(j=>{if(!j.output||shaRepo(j.output)!==j.sha256)refuse(j.name+' output missing or changed');const o=JSON.parse(fs.readFileSync(path.join(repo,j.output),'utf8'));
 const fail=j.name==='b2-copy/adversarial'?o.failed:(o.results??[]).filter(r=>r.verdict!=='PASS').length;if(fail!==0||j.name!=='b2-copy/adversarial'&&!(o.results??[]).length)refuse(j.name+' has failures or no results');return {name:j.name,output:j.output,sha256:j.sha256,...(j.name==='b2-copy/adversarial'?{checks:o.checks,failed:o.failed}:{pass:o.results.length})};});
// R7C-FREEZE-3: QE-R7C-07's recorder independence (the Engineering recheck's own grid, rc-p4, run on these bytes; the probe names the runtime it
// loads F2 by default, here the worktree) and the differential against R7C-FREEZE-2.
const qe07=N==='3'?(()=>{const job=name=>ev.jobs.find(x=>x.name===name),ri=outOf('recorder-independence'),s=ri.summary?.F2,df=outOf('phase6-differential-vs-R7C-FREEZE-2');
 if(!s||s.cells!==160||s.RIfail!==0)refuse('recorder independence '+JSON.stringify(s));
 if(df.base?.commit!==F2.commit||df.generationFailures!==0||df.differing.length!==0)refuse('the differential against R7C-FREEZE-2 differs: '+df.differing.map(d=>d.scenario).slice(0,5).join(', '));
 return {recorderIndependence:{output:job('recorder-independence').output,sha256:job('recorder-independence').sha256,cells:s.cells,failures:s.RIfail,byAnswer:s.byV,predecessor:{revision:F2.revision,failures:72,source:`${AUD}/reviews/engineering/ENGINEERING_RECHECK_R7C.md`}},
  differentialVsFreeze2:{output:job('phase6-differential-vs-R7C-FREEZE-2').output,sha256:job('phase6-differential-vs-R7C-FREEZE-2').sha256,scenarios:df.scenarios,families:df.families,differing:0}};})():null;
// R7C-FREEZE-4: QE-R7C-10's recorder independence on every grid the reviews named (the Engineering's original 160 cells, shortened 280 and
// trajectories; the SSCTR's mixed scope 768 and CC2 1,200, P6-F01), the differential against R7C-FREEZE-3 (only the declared QE-R7C-10 family may
// differ, and never beyond the timely facts) and the history probe; the reach, late-reporter and refire probes are bound as measured.
const qe10=N==='4'?(()=>{const job=name=>{const j=ev.jobs.find(x=>x.name===name);return {output:j.output,sha256:j.sha256};};
 const ri=outOf('recorder-independence').summary?.F2,sh=outOf('recorder-independence-shortened').summary?.F4,tr=outOf('recorder-independence-trajectories').summary?.F4;
 const ms=outOf('ssctr-mixed-scope'),cc2=outOf('ssctr-cc2').grid?.HEAD,df=outOf('phase7-differential-vs-R7C-FREEZE-3'),hi=outOf('history');
 if(!ri||ri.cells!==160||ri.RIfail!==0)refuse('recorder independence (160) '+JSON.stringify(ri));
 if(!sh||sh.cells!==280||sh.fail!==0||sh.staleValid!==0)refuse('recorder independence, shortened (280) '+JSON.stringify(sh));
 // Trajectories: no stale projection valid anywhere, and no failing trajectory for a full-dose or shortened answer. R7C-FREEZE-3's own
 // non-full-dose differences (known stops and LONGONE recorded on day 1: the carrier path asks, REQUIRES_RECONCILIATION, where the direct path
 // is valid; never a stale valid plan) are recorded as measured, never above R7C-FREEZE-3's count.
 const TRAJ_ANSWERS=['EXEC','MIXED','ADVERSE','EASYONLY','PARTIAL','SHORT'],F3_TRAJ={trajectories:1536,failedTrajectories:90,staleValid:54,byV:{SHORT:54,MISS:30,LONGONE:6}};
 if(!tr||tr.trajectories!==1536||tr.staleValid!==0||TRAJ_ANSWERS.some(V=>tr.byV?.[V])||Object.entries(tr.byV??{}).some(([V,n])=>n>(F3_TRAJ.byV[V]??0)))refuse('recorder independence, trajectories '+JSON.stringify(tr).slice(0,400));
 const notD=Object.values(ms.byV??{}).reduce((n,v)=>n+v.notD,0),mixedCells=Object.values(ms.byV??{}).reduce((n,v)=>n+v.cells,0);
 if(mixedCells!==768||notD!==0||ms.errors?.length)refuse('SSCTR mixed scope: '+mixedCells+' cells, '+notD+' recorder-dependent');
 if(!cc2||cc2.cells!==1200||cc2.validNotD!==0||cc2.errors!==0)refuse('SSCTR CC2: '+JSON.stringify({cells:cc2?.cells,validNotD:cc2?.validNotD}));
 if(df.base?.commit!==F3.commit||df.generationFailures!==0||df.unexpectedDiffering?.length||df.beyondTimely?.length)refuse('the differential against R7C-FREEZE-3: '+JSON.stringify({unexpected:df.unexpectedDiffering,beyondTimely:df.beyondTimely?.length}));
 if(!(hi.checked>0)||hi.violations?.length!==0||hi.unsupported!==0)refuse('history '+JSON.stringify(hi).slice(0,300));
 // regress-r7b2 against R7B2-FREEZE-1 with each step's ledger digest ignoring the first-recorded clock: it must read exactly as Phase 6's did.
 const P6_REGRESS=`${AUD}/probes/out/differential-regress-r7b2-vs-R7B2-FREEZE-1.R7C-P6-fb75d5b.json`,semantic=x=>JSON.stringify(x,(k,v)=>/^(head|commit|ran|created|base)$/.test(k)?undefined:v);
 const rn=outOf('differential-regress-r7b2-stamp-neutral-vs-R7B2-FREEZE-1');if(semantic(rn)!==semantic(JSON.parse(fs.readFileSync(path.join(repo,P6_REGRESS),'utf8'))))refuse('the stamp-neutral regress differential does not read as Phase 6\'s');
 return {recorderIndependence:{original:{...job('recorder-independence'),cells:ri.cells,failures:ri.RIfail,byAnswer:ri.byV},shortened:{...job('recorder-independence-shortened'),cells:sh.cells,failures:sh.fail,staleValid:sh.staleValid,predecessor:{revision:F3.revision,failures:28}},
  trajectories:{...job('recorder-independence-trajectories'),trajectories:tr.trajectories,staleValid:tr.staleValid,failedTrajectories:tr.failedTrajectories,failingByAnswer:tr.byV??{},fullDoseAndShortenedFailing:0,predecessor:{revision:F3.revision,...F3_TRAJ}},mixedScopeP6F01:{...job('ssctr-mixed-scope'),cells:mixedCells,recorderDependent:0,predecessor:{revision:F3.revision,recorderDependent:16}},
  cc2:{...job('ssctr-cc2'),cells:cc2.cells,validNotD:0,predecessor:{revision:F3.revision,validNotD:18}}},
  differentialVsFreeze3:{...job('phase7-differential-vs-R7C-FREEZE-3'),scenarios:df.scenarios,families:df.families,expectedToDiffer:df.expectedToDiffer,differing:df.differing.length,beyondTimely:0},
  history:{...job('history'),recordedReplansChecked:hi.checked,violations:0,unsupported:0},
  regressStampNeutral:{...job('differential-regress-r7b2-stamp-neutral-vs-R7B2-FREEZE-1'),asPhase6:{path:P6_REGRESS,sha256:shaRepo(P6_REGRESS)},byTag:rn.byTag,note:'scripts/regress-r7b2.mjs digests the carried record at every step; that digest changes with the new first-recorded clock alone, so its own output differs from Phase 6\'s while the stamp-neutral form reads identically'},
  measured:{reach:job('reach-vs-R7C-FREEZE-3'),lateReporter:job('late-reporter-vs-R7C-FREEZE-3'),directRefire:job('direct-refire-vs-R7C-FREEZE-3')}};})():null;
// The SSCTR semantic disposition that authorized the legacy split, and the conditions its acceptance binds to this record (SSCTR-SD-R7C-r2:
// C2, C3, C8 and C9 as binding consumer conditions, C7 the disclosures).
const SSCTR=`${AUD}/reviews/ssctr/SSCTR_SEMANTIC_REDISPOSITION_R7C.json`,ss=JSON.parse(fs.readFileSync(path.join(repo,SSCTR),'utf8'));
if(ss.revision!=='SSCTR-SD-R7C-r2'||ss.semanticDisposition!=='ACCEPT_R7C_UNKNOWN_SEMANTICS')refuse('the SSCTR semantic disposition is not ACCEPT_R7C_UNKNOWN_SEMANTICS (r2)');
const bindingConditions=['C2','C3','C7','C8','C9'].map(id=>{const c=ss.conditions.find(x=>x.id===id);if(!c)refuse('SSCTR condition missing: '+id);return {id,binding:c.binding,text:c.text};});
const sum=x=>x&&{mutants:x.mutants,killed:x.killed,survived:x.survived,invalid:x.invalid};
if(N!=='1'&&!(mu.correctionCycle?.mutants>0&&mu.correctionCycle.killed===mu.correctionCycle.mutants))refuse('correction-cycle mutation adequacy');
if(['3','4'].includes(N)&&!(mu.phase6QE07?.mutants>0&&mu.phase6QE07.killed===mu.phase6QE07.mutants))refuse('Phase 6 (QE-R7C-07) mutation adequacy');
// R7C-FREEZE-4: every Phase 7 mutant killed, and each by its own witness (a test-name pattern run alone), not only by some other test.
if(N==='4'&&!(mu.phase7QE10?.mutants>0&&mu.phase7QE10.killed===mu.phase7QE10.mutants&&mu.phase7QE10.killedByOwnWitness===mu.phase7QE10.mutants))refuse('Phase 7 (QE-R7C-10) mutation adequacy '+JSON.stringify(mu.phase7QE10));
if(mu.phase5SD.killed!==mu.phase5SD.mutants||mu.phase4Rules.killed!==mu.phase4Rules.mutants||mu.equivalenceWitness.killed!==1||mu.phase3Set.killed<17||mu.phase3Set.survived.some(id=>id!=='G02-M4'))refuse('mutation adequacy');
// R7C-FREEZE-2: the predecessor's reviews and the cycle's delta from it.
const reviewOf=(p,verdict)=>({path:p,sha256:shaRepo(p),verdict});
const cycle=N==='2'?(()=>{const E=`${AUD}/reviews/engineering/ENGINEERING_REVIEW_R7C.json`,S=`${AUD}/reviews/ssctr/SSCTR_FINAL_RECHECK_R7C.json`,e=JSON.parse(fs.readFileSync(path.join(repo,E),'utf8')),f=JSON.parse(fs.readFileSync(path.join(repo,S),'utf8'));
 if(e.freeze?.commit!==F1.commit||e.verdict!=='NOT_READY')refuse('the Engineering review is not the NOT_READY review of R7C-FREEZE-1');
 return {predecessorReviews:{engineering:reviewOf(E,e.verdict),ssctrFinal:reviewOf(S,f.gate)},findings:e.findings.map(x=>({id:x.id,severity:x.severity})),
  delta:{src:git('diff','--name-only',F1.commit,'HEAD','--','CoachingCore/src').split('\n').filter(Boolean),test:git('diff','--name-status',F1.commit,'HEAD','--','CoachingCore/test').split('\n').filter(Boolean)}};})():null;
// R7C-FREEZE-3: the predecessor's rechecks (Engineering NOT_READY on QE-R7C-07, SSCTR-CC-R7C-r4), the phase's delta from R7C-FREEZE-2, its
// classified test updates and the r4 condition updates (C3's r4 clause, C7, C9 and C10 as r4 records them).
const phase6=N==='3'?(()=>{const E=`${AUD}/reviews/engineering/ENGINEERING_RECHECK_R7C.json`,S=`${AUD}/reviews/ssctr/SSCTR_CC_RECHECK_R7C.json`,e=JSON.parse(fs.readFileSync(path.join(repo,E),'utf8')),s4=JSON.parse(fs.readFileSync(path.join(repo,S),'utf8'));
 if(e.freeze?.commit!==F2.commit||e.verdict!=='NOT_READY'||!e.findings.some(x=>x.id==='QE-R7C-07'&&x.severity==='BLOCKER'))refuse('the Engineering recheck is not the NOT_READY recheck of R7C-FREEZE-2 on QE-R7C-07');
 if(s4.revision!=='SSCTR-CC-R7C-r4')refuse('the SSCTR recheck is not SSCTR-CC-R7C-r4');
 for(const u of P6_TEST_UPDATES)if(spawnSync('git',['merge-base','--is-ancestor',u.commit,'HEAD'],{cwd:repo}).status!==0)refuse('test update commit not in HEAD: '+u.commit);
 return {blocker:'QE-R7C-07',predecessorReviews:{engineering:reviewOf(E,e.verdict),ssctrRecheck:reviewOf(S,s4.gate)},findings:e.findings.map(x=>({id:x.id,severity:x.severity})),
  delta:{src:git('diff','--name-only',F2.commit,'HEAD','--','CoachingCore/src').split('\n').filter(Boolean),test:git('diff','--name-status',F2.commit,'HEAD','--','CoachingCore/test').split('\n').filter(Boolean)},
  testUpdates:P6_TEST_UPDATES,conditionUpdates:{record:s4.revision,path:S,sha256:shaRepo(S),conditions:s4.conditions.map(c=>({id:c.id,binding:c.binding,status:c.status,...(c.text?{text:c.text}:{})}))}};})():null;
// R7C-FREEZE-4: the predecessor's reviews (Engineering NOT_READY on QE-R7C-10, SSCTR-P6-R7C-r5), the phase's delta from R7C-FREEZE-3 (no test
// update: no existing test or fixture changed), the metadata it adds, and the r5 conditions as they stand (C3's single final text is the SSCTR's to
// set on these bytes; until then the r5 record governs).
const phase7=N==='4'?(()=>{const E=`${AUD}/reviews/engineering/PHASE6_REVIEW_R7C.json`,S=`${AUD}/reviews/ssctr/SSCTR_PHASE6_RECHECK_R7C.json`,e=JSON.parse(fs.readFileSync(path.join(repo,E),'utf8')),s5=JSON.parse(fs.readFileSync(path.join(repo,S),'utf8'));
 if(e.freeze?.commit!==F3.commit||e.verdict!=='NOT_READY'||!e.findings.some(x=>x.id==='QE-R7C-10'&&x.severity==='BLOCKER'))refuse('the Engineering review is not the NOT_READY review of R7C-FREEZE-3 on QE-R7C-10');
 if(s5.revision!=='SSCTR-P6-R7C-r5')refuse('the SSCTR recheck is not SSCTR-P6-R7C-r5');
 const testDelta=git('diff','--name-status',F3.commit,'HEAD','--','CoachingCore/test').split('\n').filter(Boolean);
 if(testDelta.some(l=>!/^A\tCoachingCore\/test\/r7c-phase7\.test\.mjs$/.test(l)))refuse('a test other than test/r7c-phase7.test.mjs changed since R7C-FREEZE-3: '+testDelta.join(', '));
 return {blocker:'QE-R7C-10',alsoClosing:'SSCTR P6-F01 (same cause)',predecessorReviews:{engineering:reviewOf(E,e.verdict),ssctrRecheck:reviewOf(S,s5.gate)},findings:e.findings.map(x=>({id:x.id,severity:x.severity})),
  delta:{src:git('diff','--name-only',F3.commit,'HEAD','--','CoachingCore/src').split('\n').filter(Boolean),test:testDelta},testUpdates:[],metadata:P7_METADATA,
  conditionUpdates:{record:s5.revision,path:S,sha256:shaRepo(S),conditions:s5.conditions.map(c=>({id:c.id,binding:c.binding,status:c.status,...(c.text?{text:c.text}:{})}))}};})():null;
const record={revision,mission:N==='4'?'DOMAIN_COACHING_R7-C Phase 7 (QE-R7C-10)':N==='3'?'DOMAIN_COACHING_R7-C Phase 6 (QE-R7C-07)':'DOMAIN_COACHING_R7-C Phase 5'+(N==='2'?' (single correction cycle)':''),commit:head,
 predecessor:N==='4'?{revision:F3.revision,commit:F3.commit,record:F3.record,sha256:shaRepo(F3.record),base:{revision:'R7B2-FREEZE-1',commit:B2_FREEZE}}:N==='3'?{revision:F2.revision,commit:F2.commit,record:F2.record,sha256:shaRepo(F2.record),base:{revision:'R7B2-FREEZE-1',commit:B2_FREEZE}}:N==='2'?{revision:F1.revision,commit:F1.commit,record:F1.record,sha256:shaRepo(F1.record),base:{revision:'R7B2-FREEZE-1',commit:B2_FREEZE}}:{revision:'R7B2-FREEZE-1',commit:B2_FREEZE},created:new Date().toISOString(),
 delta:{src:deltaSrc,test:deltaTest},files,sourceDigest,manifestDigest,tests,conformance,
 evidence:{manifest:{path:evPath,sha256:shaRepo(evPath),head:ev.head},mutation:{path:muPath,sha256:shaRepo(muPath),head:mu.head,phase3Set:sum(mu.phase3Set),equivalenceWitness:sum(mu.equivalenceWitness),phase4Rules:sum(mu.phase4Rules),phase5SD:sum(mu.phase5SD),...(N!=='1'?{correctionCycle:sum(mu.correctionCycle)}:{}),...(['3','4'].includes(N)?{phase6QE07:sum(mu.phase6QE07)}:{}),...(N==='4'?{phase7QE10:{...sum(mu.phase7QE10),killedByOwnWitness:mu.phase7QE10.killedByOwnWitness}}:{})},sdGrid:sd.summary,g01:{gridA:g01.gridA,gridB:g01.gridB,p1:g01.p1,violations:g01.violations.length},g02:'identical to R7C-P4-39115ed',clinical,...(qe07??{}),...(qe10??{})},
 semanticDisposition:{record:ss.revision,path:SSCTR,sha256:shaRepo(SSCTR),disposition:ss.semanticDisposition},bindingConditions,
 unchangedSince:{commit:B2_CLOSURE,paths:UNCHANGED},appendOnly:['CURRENT_MISSION.md','MISSION_LEDGER.md'],
 ...(cycle?{correctionCycle:cycle}:{}),...(phase6?{phase6}:{}),...(phase7?{phase7}:{}),
 verifier:`node CoachingCore/scripts/verify-r7c.mjs${N!=='1'?' --revision '+N:''} (read-only; --suite also re-runs the suite; --write writes only CoachingCore/r7/c/VERIFICATION_R7C_${N}.json)`};
fs.mkdirSync(path.dirname(target),{recursive:true});
fs.writeFileSync(target,JSON.stringify(record,null,1)+'\n');
console.log(JSON.stringify({revision,commit:head,sourceDigest,manifestDigest,files:Object.keys(files).length,tests},null,1));
