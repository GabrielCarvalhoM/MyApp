import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../../',import.meta.url));
const out=path.join(root,'audits/domain-coaching-r6-2026-10-26');
fs.mkdirSync(out,{recursive:true});
const target=path.join(out,'BASELINE.json');
if(fs.existsSync(target))throw Error('Baseline already exists');
const entries=[];
function walk(rel){for(const item of fs.readdirSync(path.join(root,rel),{withFileTypes:true})){if(item.name==='node_modules'||item.name.startsWith('r6')||item.name==='prepare-r6.mjs')continue;const p=path.posix.join(rel,item.name);if(item.isDirectory())walk(p);else entries.push({path:p,sha256:createHash('sha256').update(fs.readFileSync(path.join(root,p))).digest('hex')});}}
for(const dir of ['CoachingCore','product','canon'])walk(dir);
for(const p of ['AGENTS.md','CLAUDE.md','CURRENT_MISSION.md','MISSION_LEDGER.md'])entries.push({path:p,sha256:createHash('sha256').update(fs.readFileSync(path.join(root,p))).digest('hex')});
fs.writeFileSync(target,JSON.stringify({revision:'R6-BASELINE-1',capturedAt:new Date().toISOString(),node:process.version,entries},null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify({entries:entries.length,node:process.version}));
