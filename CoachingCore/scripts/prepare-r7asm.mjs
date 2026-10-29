// COACHING CORE — STATE MODEL CLOSURE (HistoricalState vs PlanningProjection) baseline: binds every protected file before the first edit of
// this mission and copies the STATE-EVIDENCE-FREEZE-1 runtime (the version both state evidence judges reviewed) so later probes and the
// regression can compare against it. Refuses to overwrite.
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../../',import.meta.url));
const out=path.join(root,'audits/domain-coaching-r7a-state-model-2026-10-28');
const target=path.join(out,'BASELINE.json'),snapshot=path.join(out,'state-evidence-freeze-source');
if(fs.existsSync(target)||fs.existsSync(snapshot))throw Error('State model baseline already exists');
const sha=p=>createHash('sha256').update(fs.readFileSync(path.join(root,p))).digest('hex');
// The runtime must still be STATE-EVIDENCE-FREEZE-1, byte for byte, before anything is copied.
const FREEZE='CoachingCore/r7/state-evidence/RUNTIME_FREEZE_STATE_EVIDENCE.json',freeze=JSON.parse(fs.readFileSync(path.join(root,FREEZE),'utf8'));
const drift=Object.entries(freeze.files).filter(([rel,digest])=>sha('CoachingCore/'+rel)!==digest).map(([rel])=>rel);
if(drift.length)throw Error('The runtime is not STATE-EVIDENCE-FREEZE-1: '+drift.join(', '));
const entries=[];
function walk(rel,skip=()=>false){for(const item of fs.readdirSync(path.join(root,rel),{withFileTypes:true}).sort((a,b)=>a.name<b.name?-1:a.name>b.name?1:0)){const p=path.posix.join(rel,item.name);if(item.name==='node_modules'||skip(p))continue;if(item.isDirectory())walk(p,skip);else entries.push({path:p,sha256:sha(p)});}}
// Protected history and authority: product, canon, the whole CoachingCore tree (R6 to state evidence artifacts included), the closed R6 and
// R7-A mission audits (state evidence included), the post-R6 scope record and the human queue.
for(const dir of ['CoachingCore','product','canon','audits/domain-coaching-r6-2026-10-26','audits/domain-coaching-r7a-2026-10-27','audits/domain-coaching-r7a1-2026-10-27','audits/domain-coaching-r7a2-2026-10-28','audits/domain-coaching-r7a-final-2026-10-28','audits/domain-coaching-r7a-boundary-2026-10-28','audits/domain-coaching-r7a-state-evidence-2026-10-28','audits/v1-wearable-scope-2026-10-27'])walk(dir,p=>p==='CoachingCore/scripts/prepare-r7asm.mjs');
for(const p of ['AGENTS.md','CLAUDE.md','CURRENT_MISSION.md','MISSION_LEDGER.md','reviews/provisional-sports-science/2026-10-23/HUMAN_REVALIDATION_QUEUE.json'])entries.push({path:p,sha256:sha(p)});
// The runtime both state evidence judges reviewed: every file STATE-EVIDENCE-FREEZE-1 binds.
const copied={};
const copy=rel=>{const from=path.join(root,rel),to=path.join(snapshot,rel);fs.mkdirSync(path.dirname(to),{recursive:true});fs.copyFileSync(from,to);copied[rel]=sha(rel);};
for(const rel of Object.keys(freeze.files).sort())copy('CoachingCore/'+rel);
for(const [rel,digest] of Object.entries(copied))if(createHash('sha256').update(fs.readFileSync(path.join(snapshot,rel))).digest('hex')!==digest)throw Error('Snapshot copy mismatch: '+rel);
fs.writeFileSync(path.join(snapshot,'MANIFEST.json'),JSON.stringify({purpose:'The CoachingCore runtime, tests, R6 policy and dev fixtures exactly as STATE-EVIDENCE-FREEZE-1 binds them (the version both state evidence judges reviewed), copied before any edit of the state model mission',freeze:{revision:freeze.revision,file:FREEZE,fileSha256:sha(FREEZE),sourceDigest:freeze.sourceDigest},policyHash:freeze.policyHash,createdAt:new Date().toISOString(),files:copied},null,2)+'\n',{flag:'wx'});
fs.writeFileSync(target,JSON.stringify({revision:'R7ASM-BASELINE-1',capturedAt:new Date().toISOString(),node:process.version,purpose:'Pre-edit binding of protected R6 to state evidence history, product/canon authority, mission files, the human queue and the CoachingCore tree',freeze:{revision:freeze.revision,sourceDigest:freeze.sourceDigest},entries},null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify({entries:entries.length,snapshotFiles:Object.keys(copied).length,freeze:freeze.revision,node:process.version}));
