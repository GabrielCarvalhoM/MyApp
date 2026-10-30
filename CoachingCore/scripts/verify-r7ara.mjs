// COACHING CORE — R7-A RESIDUAL AUTHORITY objective verification. Read-only unless --write, which writes only CoachingCore/r7/residual-authority/
// VERIFICATION_R7ARA.json; --tests also runs the suite. It reads the freeze record (R7A-RESIDUAL-AUTHORITY-FREEZE-1) and proves the chain: the bound
// bytes, the digests, closed history, the evidence bound to the digest. It does not make the mission READY: only the two narrow rechecks decide that.
// Usage: node scripts/verify-r7ara.mjs [--tests] [--write]
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {hash} from '../src/value.mjs';
const cc=path.resolve(import.meta.dirname,'..'),repo=path.resolve(cc,'..'),AUDIT='audits/domain-coaching-r7a-residual-authority-2026-10-30/',dir=path.join(cc,'r7/residual-authority');
const shaRepo=p=>createHash('sha256').update(fs.readFileSync(path.join(repo,p))).digest('hex'),json=p=>JSON.parse(fs.readFileSync(path.join(repo,p),'utf8')),exists=p=>fs.existsSync(path.join(repo,p));
const freezes=fs.readdirSync(dir).filter(f=>/^RUNTIME_FREEZE_/.test(f)),F=json('CoachingCore/r7/residual-authority/RUNTIME_FREEZE_R7A_RESIDUAL_AUTHORITY.json');
const checks=[],check=(id,ok,detail=null)=>checks.push({id,ok:!!ok,...(detail===null?{}:{detail})});
check('single-freeze',freezes.length===1&&F.revision==='R7A-RESIDUAL-AUTHORITY-FREEZE-1',freezes);
const drift=Object.entries(F.files).filter(([p,h])=>!exists('CoachingCore/'+p)||shaRepo('CoachingCore/'+p)!==h).map(([p])=>p);
const extra=[...fs.readdirSync(path.join(cc,'src')).filter(f=>f.endsWith('.mjs')).map(f=>'src/'+f),...fs.readdirSync(path.join(cc,'test')).filter(f=>f.endsWith('.mjs')).map(f=>'test/'+f)].filter(p=>!F.files[p]);
check('bound-files',!drift.length&&!extra.length,{drift,unbound:extra});
const live=Object.fromEntries(Object.keys(F.files).map(p=>[p,exists('CoachingCore/'+p)?shaRepo('CoachingCore/'+p):null]));
check('source-digest',hash(Object.fromEntries(Object.entries(live).filter(([p])=>p.startsWith('src/'))))===F.sourceDigest,F.sourceDigest);
check('manifest-digest',hash(live)===F.manifestDigest,F.manifestDigest);
const pf=json(AUDIT+'decision-authority-freeze-source/MANIFEST.json');
check('predecessor-freeze-immutable',shaRepo(pf.freeze.file)===pf.freeze.fileSha256&&F.sourceRevision.predecessorFreezeFile.sha256===pf.freeze.fileSha256,pf.freeze.fileSha256);
const copyDrift=Object.entries(pf.files).filter(([p,h])=>shaRepo(AUDIT+'decision-authority-freeze-source/'+p)!==h).map(([p])=>p);
check('predecessor-copy-intact',!copyDrift.length,{files:Object.keys(pf.files).length,drift:copyDrift});
const base=json(AUDIT+'BASELINE.json'),own=['CoachingCore/src/','CoachingCore/test/','CoachingCore/scripts/','CoachingCore/r7/residual-authority/',AUDIT];
const histDrift=base.entries.filter(e=>!own.some(p=>e.path.startsWith(p))&&!['CURRENT_MISSION.md','MISSION_LEDGER.md'].includes(e.path)).filter(e=>!exists(e.path)||shaRepo(e.path)!==e.sha256).map(e=>e.path);
check('closed-history',!histDrift.length,{baselineFiles:base.entries.length,drift:histDrift.slice(0,20)});
check('growth-patch-unapplied',shaRepo('audits/growth-layer-2026-10-29/PENDING_CANON_SYNC.patch')==='6b737179873535dac0ebc950aa0637866ea2c32df396cf9b93a80654940820d6');
const appendOnly=['CURRENT_MISSION.md','MISSION_LEDGER.md'].map(f=>{const b=spawnSync('git',['show',`${F.git.base.commit}:${f}`],{cwd:repo,encoding:'buffer'}).stdout,n=fs.readFileSync(path.join(repo,f));return {f,ok:b.length>0&&n.subarray(0,b.length).equals(b)};});
check('mission-files-append-only',appendOnly.every(x=>x.ok),appendOnly);
const ev=json(AUDIT+'probes/EVIDENCE_RUNS_R7ARA.json'),key=r=>r.group+'/'+r.name,named=F.evidence.probes.namedFailure??[];
const evBad=ev.runs.filter(r=>r.exit!==0&&!named.includes(key(r))||r.sourceDigestStart!==F.sourceDigest||r.sourceDigestEnd!==F.sourceDigest||shaRepo(r.output)!==r.outSha256).map(key);
check('evidence-bound',!evBad.length,{runs:ev.runs.length,bad:evBad,namedFailure:named});
const binds=[{path:F.sourceRevision.baseline,sha256:F.sourceRevision.baselineSha256},F.evidence.probes,F.evidence.comparison,F.evidence.namedDifferences,F.evidence.direction,F.evidence.mutation,F.evidence.regression,F.tests.onPredecessor,...F.evidence.documents],bindBad=binds.filter(b=>shaRepo(b.path)!==b.sha256).map(b=>b.path);
check('evidence-bindings',!bindBad.length,{bound:binds.length,changed:bindBad});
const reviews=exists(AUDIT+'reviews')?fs.readdirSync(path.join(repo,AUDIT,'reviews')):[];
check('reviews-not-dispatched',reviews.every(f=>['ENGINEERING_RECHECK_BRIEF.md','SSCTR_RECHECK_BRIEF.md'].includes(f)),reviews);
if(process.argv.includes('--tests')){const t=spawnSync(process.execPath,['--test','--test-reporter=spec'],{cwd:cc,encoding:'utf8',maxBuffer:256*1024*1024}),n=k=>Number(t.stdout.match(new RegExp('ℹ '+k+' (\\d+)'))?.[1]??NaN);
 check('suite',t.status===0&&n('fail')===0&&n('pass')===F.tests.pass,{tests:n('tests'),pass:n('pass'),fail:n('fail'),frozen:F.tests.pass});}
const out={revision:'R7ARA-VERIFICATION-1',freeze:F.revision,sourceDigest:F.sourceDigest,manifestDigest:F.manifestDigest,node:process.version,at:new Date().toISOString(),passed:checks.filter(c=>c.ok).length,total:checks.length,checks};
if(process.argv.includes('--write'))fs.writeFileSync(path.join(dir,'VERIFICATION_R7ARA.json'),JSON.stringify(out,null,1)+'\n');
console.log(JSON.stringify({passed:out.passed,total:out.total,failed:checks.filter(c=>!c.ok).map(c=>c.id)}));
process.exitCode=checks.every(c=>c.ok)?0:1;
