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
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {hash} from '../src/value.mjs';
const N=(()=>{const i=process.argv.indexOf('--revision');return i>=0?process.argv[i+1]:'1';})();if(!['1','2'].includes(N))throw Error('--revision 1|2');
const cc=path.resolve(import.meta.dirname,'..'),repo=path.resolve(cc,'..'),revision='R7C-FREEZE-'+N;
const F1={revision:'R7C-FREEZE-1',commit:'1890f66356455112907d757032a8b1cd2de29c00',record:'CoachingCore/r7/c/RUNTIME_FREEZE_R7C_1.json'};
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
 ...ls(`${AUD}/probes`),...ls(`${AUD}/probes/b2-copy`),...ls(`${AUD}/reviews/ssctr/probes/sd`),...(N==='2'?['CoachingCore/package.json','CoachingCore/package-lock.json',...ls(`${AUD}/reviews/engineering/probes`)]:[])];
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
const outOf=name=>{const j=ev.jobs.find(x=>x.name===name);if(!j||j.exit!==0&&!['neighbors-r7b2-vs-R7B2-FREEZE-1','differential-regress-r7b2-vs-R7B2-FREEZE-1'].includes(name))refuse('evidence job '+name+' missing or failed');if(shaRepo(j.output)!==j.sha256)refuse('evidence output changed: '+j.output);return JSON.parse(fs.readFileSync(path.join(repo,j.output),'utf8'));};
const sd=outOf('adversarial-sd'),g01=outOf('adversarial-g01'),g02=outOf('adversarial-g02'),full=outOf('full-suite');
if(sd.summary.total!==0)refuse('SD grid violations '+sd.summary.total);
if(g01.violations.length||g01.p1.failed.length)refuse('G01 grid violations');
if(shaRepo(ev.jobs.find(x=>x.name==='adversarial-g02').output)!==shaRepo(`${AUD}/probes/out/adversarial-g02.R7C-P4-39115ed.json`))refuse('G02 differs from Phase 4');
if(full.fail!==0)refuse('evidence full suite has failures');
const clinical=ev.jobs.filter(j=>j.name.startsWith('b2-copy/')).map(j=>{if(!j.output||shaRepo(j.output)!==j.sha256)refuse(j.name+' output missing or changed');const o=JSON.parse(fs.readFileSync(path.join(repo,j.output),'utf8'));
 const fail=j.name==='b2-copy/adversarial'?o.failed:(o.results??[]).filter(r=>r.verdict!=='PASS').length;if(fail!==0||j.name!=='b2-copy/adversarial'&&!(o.results??[]).length)refuse(j.name+' has failures or no results');return {name:j.name,output:j.output,sha256:j.sha256,...(j.name==='b2-copy/adversarial'?{checks:o.checks,failed:o.failed}:{pass:o.results.length})};});
// The SSCTR semantic disposition that authorized the legacy split, and the conditions its acceptance binds to this record (SSCTR-SD-R7C-r2:
// C2, C3, C8 and C9 as binding consumer conditions, C7 the disclosures).
const SSCTR=`${AUD}/reviews/ssctr/SSCTR_SEMANTIC_REDISPOSITION_R7C.json`,ss=JSON.parse(fs.readFileSync(path.join(repo,SSCTR),'utf8'));
if(ss.revision!=='SSCTR-SD-R7C-r2'||ss.semanticDisposition!=='ACCEPT_R7C_UNKNOWN_SEMANTICS')refuse('the SSCTR semantic disposition is not ACCEPT_R7C_UNKNOWN_SEMANTICS (r2)');
const bindingConditions=['C2','C3','C7','C8','C9'].map(id=>{const c=ss.conditions.find(x=>x.id===id);if(!c)refuse('SSCTR condition missing: '+id);return {id,binding:c.binding,text:c.text};});
const sum=x=>x&&{mutants:x.mutants,killed:x.killed,survived:x.survived,invalid:x.invalid};
if(N==='2'&&!(mu.correctionCycle?.mutants>0&&mu.correctionCycle.killed===mu.correctionCycle.mutants))refuse('correction-cycle mutation adequacy');
if(mu.phase5SD.killed!==mu.phase5SD.mutants||mu.phase4Rules.killed!==mu.phase4Rules.mutants||mu.equivalenceWitness.killed!==1||mu.phase3Set.killed<17||mu.phase3Set.survived.some(id=>id!=='G02-M4'))refuse('mutation adequacy');
// R7C-FREEZE-2: the predecessor's reviews and the cycle's delta from it.
const reviewOf=(p,verdict)=>({path:p,sha256:shaRepo(p),verdict});
const cycle=N==='2'?(()=>{const E=`${AUD}/reviews/engineering/ENGINEERING_REVIEW_R7C.json`,S=`${AUD}/reviews/ssctr/SSCTR_FINAL_RECHECK_R7C.json`,e=JSON.parse(fs.readFileSync(path.join(repo,E),'utf8')),f=JSON.parse(fs.readFileSync(path.join(repo,S),'utf8'));
 if(e.freeze?.commit!==F1.commit||e.verdict!=='NOT_READY')refuse('the Engineering review is not the NOT_READY review of R7C-FREEZE-1');
 return {predecessorReviews:{engineering:reviewOf(E,e.verdict),ssctrFinal:reviewOf(S,f.gate)},findings:e.findings.map(x=>({id:x.id,severity:x.severity})),
  delta:{src:git('diff','--name-only',F1.commit,'HEAD','--','CoachingCore/src').split('\n').filter(Boolean),test:git('diff','--name-status',F1.commit,'HEAD','--','CoachingCore/test').split('\n').filter(Boolean)}};})():null;
const record={revision,mission:'DOMAIN_COACHING_R7-C Phase 5'+(N==='2'?' (single correction cycle)':''),commit:head,predecessor:N==='2'?{revision:F1.revision,commit:F1.commit,record:F1.record,sha256:shaRepo(F1.record),base:{revision:'R7B2-FREEZE-1',commit:B2_FREEZE}}:{revision:'R7B2-FREEZE-1',commit:B2_FREEZE},created:new Date().toISOString(),
 delta:{src:deltaSrc,test:deltaTest},files,sourceDigest,manifestDigest,tests,conformance,
 evidence:{manifest:{path:evPath,sha256:shaRepo(evPath),head:ev.head},mutation:{path:muPath,sha256:shaRepo(muPath),head:mu.head,phase3Set:sum(mu.phase3Set),equivalenceWitness:sum(mu.equivalenceWitness),phase4Rules:sum(mu.phase4Rules),phase5SD:sum(mu.phase5SD),...(N==='2'?{correctionCycle:sum(mu.correctionCycle)}:{})},sdGrid:sd.summary,g01:{gridA:g01.gridA,gridB:g01.gridB,p1:g01.p1,violations:g01.violations.length},g02:'identical to R7C-P4-39115ed',clinical},
 semanticDisposition:{record:ss.revision,path:SSCTR,sha256:shaRepo(SSCTR),disposition:ss.semanticDisposition},bindingConditions,
 unchangedSince:{commit:B2_CLOSURE,paths:UNCHANGED},appendOnly:['CURRENT_MISSION.md','MISSION_LEDGER.md'],
 ...(cycle?{correctionCycle:cycle}:{}),
 verifier:`node CoachingCore/scripts/verify-r7c.mjs${N==='2'?' --revision 2':''} (read-only; --suite also re-runs the suite; --write writes only CoachingCore/r7/c/VERIFICATION_R7C_${N}.json)`};
fs.mkdirSync(path.dirname(target),{recursive:true});
fs.writeFileSync(target,JSON.stringify(record,null,1)+'\n');
console.log(JSON.stringify({revision,commit:head,sourceDigest,manifestDigest,files:Object.keys(files).length,tests},null,1));
