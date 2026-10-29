// DOMAIN_COACHING_R7-A baseline: binds every protected file before the first R7-A runtime edit and copies the R6 closure
// runtime (the source SSCTR round 12 reviewed; never frozen) so later probes can compare against it. Refuses to overwrite.
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../../',import.meta.url));
const out=path.join(root,'audits/domain-coaching-r7a-2026-10-27');
const target=path.join(out,'BASELINE.json'),snapshot=path.join(out,'pre-r7a-source');
if(fs.existsSync(target)||fs.existsSync(snapshot))throw Error('R7-A baseline already exists');
const sha=p=>createHash('sha256').update(fs.readFileSync(path.join(root,p))).digest('hex');
const entries=[];
function walk(rel,skip=()=>false){for(const item of fs.readdirSync(path.join(root,rel),{withFileTypes:true}).sort((a,b)=>a.name<b.name?-1:a.name>b.name?1:0)){const p=path.posix.join(rel,item.name);if(item.name==='node_modules'||skip(p))continue;if(item.isDirectory())walk(p,skip);else entries.push({path:p,sha256:sha(p)});}}
// Protected history and authority: product, canon, the whole CoachingCore tree, the closed R6 audit, the post-R6 scope record and the human queue.
for(const dir of ['CoachingCore','product','canon','audits/domain-coaching-r6-2026-10-26','audits/v1-wearable-scope-2026-10-27'])walk(dir,p=>p==='CoachingCore/scripts/prepare-r7a.mjs');
for(const p of ['AGENTS.md','CLAUDE.md','CURRENT_MISSION.md','MISSION_LEDGER.md','reviews/provisional-sports-science/2026-10-23/HUMAN_REVALIDATION_QUEUE.json'])entries.push({path:p,sha256:sha(p)});
// The runtime as R6 closed it: src, tests, package manifest, the R6 policy and the R6 development fixtures.
const copied={};
const copy=rel=>{const from=path.join(root,rel),to=path.join(snapshot,rel);fs.mkdirSync(path.dirname(to),{recursive:true});fs.copyFileSync(from,to);copied[rel]=sha(rel);};
for(const dir of ['CoachingCore/src','CoachingCore/test','CoachingCore/r6/fixtures'])for(const f of fs.readdirSync(path.join(root,dir)).sort())if(fs.statSync(path.join(root,dir,f)).isFile())copy(path.posix.join(dir,f));
for(const p of ['CoachingCore/package.json','CoachingCore/r6/PROGRAM_POLICY_R6.json'])copy(p);
for(const [rel,digest] of Object.entries(copied))if(createHash('sha256').update(fs.readFileSync(path.join(snapshot,rel))).digest('hex')!==digest)throw Error('Snapshot copy mismatch: '+rel);
fs.writeFileSync(path.join(snapshot,'MANIFEST.json'),JSON.stringify({purpose:'The CoachingCore runtime, tests, R6 policy and dev fixtures as DOMAIN_COACHING_R6 closed them (the runtime SSCTR round 12 reviewed at policy 18ec48f3; never frozen), copied before any R7-A edit',policyHash:'18ec48f34768a7eebb2aede618db65a77385efebbda0a38d6f03135e5cd96b4c',r6ProgramSha256:copied['CoachingCore/src/r6-program.mjs'],createdAt:new Date().toISOString(),files:copied},null,2)+'\n',{flag:'wx'});
fs.writeFileSync(target,JSON.stringify({revision:'R7A-BASELINE-1',capturedAt:new Date().toISOString(),node:process.version,purpose:'Pre-edit binding of protected R6 history, product/canon authority, mission files, the human queue and the CoachingCore tree',entries},null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify({entries:entries.length,snapshotFiles:Object.keys(copied).length,node:process.version}));
