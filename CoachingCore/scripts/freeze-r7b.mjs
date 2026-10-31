// R7-B single freeze (node scripts/freeze-r7b.mjs): R7B-RUNTIME-REPERTOIRE-FREEZE-1 binds the runtime, the tests, the R7-B fixtures and scripts,
// the conformance matrix, the policy identity and the catalog binding, with the evidence recorded on those bytes (request §26). It runs the
// suite, the conformance check, the differential regression and the bounded mutation probe itself, and refuses while any fails, while a dose
// finding exists, while a mutant survives that is not documented as equivalent, or while the policy, the catalog, its schema, the SSCTR r2
// records or the R7-A freeze record differ from the B0 closure. One freeze: an existing record is never overwritten. After it the runtime is not
// changed for the reviews.
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {hash} from '../src/value.mjs';
const cc=path.resolve(import.meta.dirname,'..'),repo=path.resolve(cc,'..'),revision='R7B-RUNTIME-REPERTOIRE-FREEZE-1',BASE='c66966e041443b0043c6c01718e840604380c9b9';
const target=path.join(cc,'r7/b/RUNTIME_FREEZE_R7B.json');
if(fs.existsSync(target))throw Error('R7-B has its single freeze already ('+target+'); no further freeze');
const sha=p=>createHash('sha256').update(fs.readFileSync(path.join(cc,p))).digest('hex'),shaRepo=p=>createHash('sha256').update(fs.readFileSync(path.join(repo,p))).digest('hex');
const refuse=why=>{throw Error('Freeze refused: '+why);};
const git=(...a)=>{const r=spawnSync('git',a,{cwd:repo,encoding:'utf8',maxBuffer:64*1024*1024});if(r.status!==0)refuse('git '+a.join(' ')+': '+r.stderr);return r.stdout;};
const atBase=p=>createHash('sha256').update(spawnSync('git',['show',`${BASE}:${p}`],{cwd:repo,encoding:'buffer',maxBuffer:64*1024*1024}).stdout).digest('hex');
// Inputs that must equal the B0 closure byte for byte.
const UNCHANGED=['CoachingCore/r6/PROGRAM_POLICY_R6.json','CoachingCore/r7/b0/REPERTOIRE_CATALOG_B0.json','CoachingCore/r7/b0/REPERTOIRE_CATALOG_B0.schema.json','CoachingCore/r7/b0/REPERTOIRE_FOUNDATION_B0.md','audits/domain-coaching-r7-b0-2026-10-31/reviews/SSCTR_RECHECK_B0.json','CoachingCore/r7/residual-authority/RUNTIME_FREEZE_R7A_RESIDUAL_AUTHORITY.json','audits/growth-layer-2026-10-29/PENDING_CANON_SYNC.patch'];
const drift=UNCHANGED.filter(p=>shaRepo(p)!==atBase(p));if(drift.length)refuse('inputs changed since the B0 closure: '+drift.join(', '));
for(const f of ['CURRENT_MISSION.md','MISSION_LEDGER.md']){const base=spawnSync('git',['show',`${BASE}:${f}`],{cwd:repo,encoding:'buffer'}).stdout,now=fs.readFileSync(path.join(repo,f));if(!base.length||!now.subarray(0,base.length).equals(base))refuse(f+' is not append-only since the B0 closure');}
const policy=JSON.parse(fs.readFileSync(path.join(cc,'r6/PROGRAM_POLICY_R6.json'),'utf8').replace(/^﻿/,''));
if(hash(policy)!=='18ec48f34768a7eebb2aede618db65a77385efebbda0a38d6f03135e5cd96b4c')refuse('policy canonical hash');
// The bound files.
const list=[...fs.readdirSync(path.join(cc,'src')).filter(f=>f.endsWith('.mjs')).map(f=>'src/'+f),...fs.readdirSync(path.join(cc,'test')).filter(f=>f.endsWith('.mjs')).map(f=>'test/'+f),'r7/b/fixtures/helpers.mjs','r6/fixtures/dev-authority.mjs','r6/fixtures/profiles.mjs','r6/fixtures/trajectories.mjs','r6/PROGRAM_POLICY_R6.json','r7/b0/REPERTOIRE_CATALOG_B0.json','r7/b0/REPERTOIRE_CATALOG_B0.schema.json','r7/b/CONFORMANCE_R7B.json','scripts/conformance-r7b.mjs','scripts/mutate-r7b.mjs','scripts/regress-r7b.mjs','scripts/freeze-r7b.mjs','scripts/verify-r7b.mjs','package.json','package-lock.json'];
const files=Object.fromEntries(list.sort().map(p=>[p,sha(p)]));
files['../audits/domain-coaching-r7-b0-2026-10-31/reviews/SSCTR_RECHECK_B0.json']=shaRepo('audits/domain-coaching-r7-b0-2026-10-31/reviews/SSCTR_RECHECK_B0.json');
const sourceDigest=hash(Object.fromEntries(Object.entries(files).filter(([p])=>p.startsWith('src/')))),manifestDigest=hash(files);
// Runtime delta against the predecessor (the B0 closure runtime = R7A-RESIDUAL-AUTHORITY-FREEZE-1's).
const baseList=git('ls-tree','-r','--name-only',BASE,'CoachingCore/src','CoachingCore/test').split('\n').filter(Boolean).map(p=>p.replace(/^CoachingCore\//,''));
const delta={changed:Object.keys(files).filter(p=>baseList.includes(p)&&atBase('CoachingCore/'+p)!==files[p]),added:Object.keys(files).filter(p=>/^(src|test)\//.test(p)&&!baseList.includes(p)),removed:baseList.filter(p=>!files[p])};
// Evidence on these bytes.
const run=(args,label,timeout=900000)=>{const r=spawnSync(process.execPath,args,{cwd:cc,encoding:'utf8',maxBuffer:256*1024*1024,timeout});if(r.error)refuse(label+': '+r.error.message);return r;};
const t=run(['--test'],'suite'),n=k=>Number(t.stdout.match(new RegExp('ℹ '+k+' (\\d+)'))?.[1]??NaN);
const tests={count:n('tests'),pass:n('pass'),fail:n('fail'),durationMs:n('duration_ms')};if(!(tests.count>0&&tests.fail===0&&tests.pass===tests.count))refuse('suite '+JSON.stringify(tests));
const c=run(['scripts/conformance-r7b.mjs','--write'],'conformance');const conformance=JSON.parse(fs.readFileSync(path.join(cc,'r7/b/CONFORMANCE_R7B.report.json'),'utf8'));if(conformance.result!=='PASS')refuse('conformance '+conformance.problems.slice(0,5).join('; '));
const g=run(['scripts/regress-r7b.mjs','--write'],'regression');const regression=JSON.parse(fs.readFileSync(path.join(cc,'r7/b/REGRESSION_R7B.json'),'utf8'));if(regression.doseRises.length||regression.statusDifferences.length)refuse('regression findings');
const m=run(['scripts/mutate-r7b.mjs','--write'],'mutation',3600000);const mutation=JSON.parse(fs.readFileSync(path.join(cc,'r7/b/MUTATION_R7B.json'),'utf8'));
const undocumented=mutation.survived.filter(id=>!mutation.equivalent.some(e=>e.id===id));if(undocumented.length||mutation.invalid.length||!mutation.sourceRestored)refuse('mutation '+JSON.stringify({undocumented,invalid:mutation.invalid,restored:mutation.sourceRestored}));
// The bytes did not move while the evidence ran.
const after=Object.fromEntries(Object.keys(files).filter(p=>!p.startsWith('../')).map(p=>[p,sha(p)]));if(Object.entries(after).some(([p,h])=>files[p]!==h))refuse('bound bytes changed during the evidence runs');
const record={revision,mission:'DOMAIN_COACHING_R7-B',date:new Date().toISOString(),branch:git('rev-parse','--abbrev-ref','HEAD').trim(),baseCommitOfBytes:git('rev-parse','HEAD').trim(),freezeCommit:'the commit that adds this record (resolve with: git log -1 --format=%H -- CoachingCore/r7/b/RUNTIME_FREEZE_R7B.json)',
 predecessor:{freeze:'R7A-RESIDUAL-AUTHORITY-FREEZE-1',runtimeCommit:'7d2da3603e224124696a2290766ec448080f3264',sourceDigest:'e7172eb2e65bfb1da4c102a7efa2bae64bf1c70b06562fd3ce9896defd6dc17d',manifestDigest:'3d214fb53f62e45ca7d99f39f2c562d358719a2264c2de46098d39b318c85125',runtimeEqualAt:BASE},
 sourceDigest,manifestDigest,fileCount:Object.keys(files).length,files,
 policy:{revision:policy.revision,canonicalHash:hash(policy),fileSha256:files['r6/PROGRAM_POLICY_R6.json'],unchangedSinceB0:true},
 catalogBinding:{revision:'R7B0-CATALOG-2',sha256:files['r7/b0/REPERTOIRE_CATALOG_B0.json'],schemaSha256:files['r7/b0/REPERTOIRE_CATALOG_B0.schema.json'],records:'audits/domain-coaching-r7-b0-2026-10-31/reviews/SSCTR_RECHECK_B0.json',recordsSha256:files['../audits/domain-coaching-r7-b0-2026-10-31/reviews/SSCTR_RECHECK_B0.json'],coreRecords:['B0-FIDELITY','B0-C04','B0-C05'],gatedCandidates:['B0-C01','B0-C02','B0-C03','B0-C06','B0-C07','B0-C08','B0-C09','B0-C10','B0-C11','B0-C12'],failClosed:'any other catalog bytes or a missing core record: no program; a missing candidate record: that feature off'},
 runtimeDelta:delta,tests,
 evidence:{conformance:{report:'r7/b/CONFORMANCE_R7B.report.json',sha256:sha('r7/b/CONFORMANCE_R7B.report.json'),result:conformance.result,entries:conformance.entries,counts:conformance.counts,conditions:conformance.conditions},regression:{report:'r7/b/REGRESSION_R7B.json',sha256:sha('r7/b/REGRESSION_R7B.json'),corpus:regression.corpus,changed:regression.changed,weeksWithDifference:regression.weeksWithDifference,doseFindings:regression.doseRises.length,statusDifferences:regression.statusDifferences.length},mutation:{report:'r7/b/MUTATION_R7B.json',sha256:sha('r7/b/MUTATION_R7B.json'),mutants:mutation.mutants,killed:mutation.killed,survivedEquivalent:mutation.equivalent}},
 testChanges:{record:'audits/domain-coaching-r7-b-2026-10-31/TEST_CHANGES_R7B.md',sha256:shaRepo('audits/domain-coaching-r7-b-2026-10-31/TEST_CHANGES_R7B.md')},
 declared:'CoachingCore/r7/b/R7B_REVIEW_HANDOFF.md section 4',
 unchangedInputs:Object.fromEntries(UNCHANGED.map(p=>[p,shaRepo(p)]))};
fs.writeFileSync(target,JSON.stringify(record,null,1)+'\n');
console.log(JSON.stringify({revision,sourceDigest,manifestDigest,fileCount:record.fileCount,tests,conformance:conformance.result,regression:{changed:regression.changed,doseFindings:0},mutation:{killed:mutation.killed,of:mutation.mutants,equivalent:mutation.equivalent.map(e=>e.id)}},null,1));
