// QE R7ASE independent digest (read-only): recomputes the canonical source digest of CoachingCore/src/*.mjs the same way
// scripts/freeze-r7ase.mjs does (hash() of the {"src/<f>": sha256} map), plus the freeze file SHA-256 and the policy file SHA-256.
// Writes nothing; prints one JSON line. Usage: node qe-r7ase-digest.mjs [label]
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
const repo=path.resolve(import.meta.dirname,'../../..');
const cc=path.join(repo,'CoachingCore');
const canonical=v=>{if(v===null||typeof v!=='object')return JSON.stringify(v);if(Array.isArray(v))return '['+v.map(canonical).join(',')+']';return '{'+Object.keys(v).sort().map(k=>JSON.stringify(k)+':'+canonical(v[k])).join(',')+'}';};
const hash=v=>createHash('sha256').update(canonical(v)).digest('hex');
const sha=p=>createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const src=Object.fromEntries(fs.readdirSync(path.join(cc,'src')).filter(f=>f.endsWith('.mjs')).sort().map(f=>['src/'+f,sha(path.join(cc,'src',f))]));
const freezeFile=path.join(cc,'r7/state-evidence/RUNTIME_FREEZE_STATE_EVIDENCE.json');
const fr=JSON.parse(fs.readFileSync(freezeFile,'utf8'));
const testsNow=Object.fromEntries(fs.readdirSync(path.join(cc,'test')).filter(f=>f.endsWith('.mjs')).sort().map(f=>['test/'+f,sha(path.join(cc,'test',f))]));
const allFrozenMatch=Object.entries(fr.files).every(([p,h])=>fs.existsSync(path.join(cc,p))&&sha(path.join(cc,p))===h);
const mismatches=Object.entries(fr.files).filter(([p,h])=>!fs.existsSync(path.join(cc,p))||sha(path.join(cc,p))!==h).map(([p])=>p);
const extraSrcOrTest=[...Object.keys(src),...Object.keys(testsNow)].filter(p=>!(p in fr.files));
console.log(JSON.stringify({label:process.argv[2]||'',at:new Date().toISOString(),sourceDigest:hash(src),frozenSourceDigest:fr.sourceDigest,
 digestMatchesFreeze:hash(src)===fr.sourceDigest,freezeFileSha256:sha(freezeFile),policyFileSha256:sha(path.join(cc,'r6/PROGRAM_POLICY_R6.json')),
 frozenPolicyFileSha256:fr.policyFileSha256,policyHash:fr.policyHash,allFrozenFilesMatch:allFrozenMatch,mismatches,extraSrcOrTest,srcCount:Object.keys(src).length}));
