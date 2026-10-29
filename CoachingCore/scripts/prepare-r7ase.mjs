// COACHING CORE — STATE EVIDENCE MODEL (value-scoped fact vs projection) baseline: binds every protected file before the first edit of this
// mission and copies the R7A-BOUNDARY-FINAL-FREEZE runtime (the version both R7-A boundary judges re-checked) so later probes and the
// regression can compare against it. Refuses to overwrite.
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../../',import.meta.url));
const out=path.join(root,'audits/domain-coaching-r7a-state-evidence-2026-10-28');
const target=path.join(out,'BASELINE.json'),snapshot=path.join(out,'boundary-freeze-source');
if(fs.existsSync(target)||fs.existsSync(snapshot))throw Error('State evidence baseline already exists');
const sha=p=>createHash('sha256').update(fs.readFileSync(path.join(root,p))).digest('hex');
// The runtime must still be R7A-BOUNDARY-FINAL-FREEZE, byte for byte, before anything is copied.
const FREEZE='CoachingCore/r7/boundary/RUNTIME_FREEZE_R7A_BOUNDARY.json',freeze=JSON.parse(fs.readFileSync(path.join(root,FREEZE),'utf8'));
const drift=Object.entries(freeze.files).filter(([rel,digest])=>sha('CoachingCore/'+rel)!==digest).map(([rel])=>rel);
if(drift.length)throw Error('The runtime is not R7A-BOUNDARY-FINAL-FREEZE: '+drift.join(', '));
const entries=[];
function walk(rel,skip=()=>false){for(const item of fs.readdirSync(path.join(root,rel),{withFileTypes:true}).sort((a,b)=>a.name<b.name?-1:a.name>b.name?1:0)){const p=path.posix.join(rel,item.name);if(item.name==='node_modules'||skip(p))continue;if(item.isDirectory())walk(p,skip);else entries.push({path:p,sha256:sha(p)});}}
// Protected history and authority: product, canon, the whole CoachingCore tree (R6 to R7-A boundary artifacts included), the closed R6, R7-A,
// R7-A.1, R7-A.2, R7-A final and R7-A boundary audits, the post-R6 scope record and the human queue.
for(const dir of ['CoachingCore','product','canon','audits/domain-coaching-r6-2026-10-26','audits/domain-coaching-r7a-2026-10-27','audits/domain-coaching-r7a1-2026-10-27','audits/domain-coaching-r7a2-2026-10-28','audits/domain-coaching-r7a-final-2026-10-28','audits/domain-coaching-r7a-boundary-2026-10-28','audits/v1-wearable-scope-2026-10-27'])walk(dir,p=>p==='CoachingCore/scripts/prepare-r7ase.mjs');
for(const p of ['AGENTS.md','CLAUDE.md','CURRENT_MISSION.md','MISSION_LEDGER.md','reviews/provisional-sports-science/2026-10-23/HUMAN_REVALIDATION_QUEUE.json'])entries.push({path:p,sha256:sha(p)});
// The runtime both R7-A boundary judges re-checked: every file R7A-BOUNDARY-FINAL-FREEZE binds.
const copied={};
const copy=rel=>{const from=path.join(root,rel),to=path.join(snapshot,rel);fs.mkdirSync(path.dirname(to),{recursive:true});fs.copyFileSync(from,to);copied[rel]=sha(rel);};
for(const rel of Object.keys(freeze.files).sort())copy('CoachingCore/'+rel);
for(const [rel,digest] of Object.entries(copied))if(createHash('sha256').update(fs.readFileSync(path.join(snapshot,rel))).digest('hex')!==digest)throw Error('Snapshot copy mismatch: '+rel);
fs.writeFileSync(path.join(snapshot,'MANIFEST.json'),JSON.stringify({purpose:'The CoachingCore runtime, tests, R6 policy and dev fixtures exactly as R7A-BOUNDARY-FINAL-FREEZE binds them (the version both R7-A boundary judges re-checked), copied before any edit of the state evidence mission',freeze:{revision:freeze.revision,file:FREEZE,fileSha256:sha(FREEZE),sourceDigest:freeze.sourceDigest},policyHash:freeze.policyHash,createdAt:new Date().toISOString(),files:copied},null,2)+'\n',{flag:'wx'});
fs.writeFileSync(target,JSON.stringify({revision:'R7ASE-BASELINE-1',capturedAt:new Date().toISOString(),node:process.version,purpose:'Pre-edit binding of protected R6 to R7-A boundary history, product/canon authority, mission files, the human queue and the CoachingCore tree',freeze:{revision:freeze.revision,sourceDigest:freeze.sourceDigest},entries},null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify({entries:entries.length,snapshotFiles:Object.keys(copied).length,freeze:freeze.revision,node:process.version}));
