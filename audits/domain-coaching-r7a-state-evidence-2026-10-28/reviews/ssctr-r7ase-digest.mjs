// SSCTR R7ASE-SSCTR-r1 digest probe (byte-derived from ssctr-r7ab-digest.mjs; default freeze path changed) (print only). Recomputes the source digest of a CoachingCore tree with the canonical hash() over src/*.mjs
// (directory listing and the freeze's src/ entries), the freeze file sha256, the drift of every frozen file, and the policy canonical hash.
// Usage: node ssctr-r7ab-digest.mjs <CoachingCore dir> [freeze file relative to it]
import fs from 'node:fs';import path from 'node:path';import {createHash} from 'node:crypto';import {pathToFileURL} from 'node:url';
const cc=path.resolve(process.argv[2]),rel=process.argv[3]??'r7/state-evidence/RUNTIME_FREEZE_STATE_EVIDENCE.json';
const {hash}=await import(pathToFileURL(path.join(cc,'src/value.mjs')).href);
const sha=p=>createHash('sha256').update(fs.readFileSync(path.join(cc,p))).digest('hex');
const listed=Object.fromEntries(fs.readdirSync(path.join(cc,'src')).filter(f=>f.endsWith('.mjs')).map(f=>'src/'+f).sort().map(p=>[p,sha(p)]));
const fr=path.join(cc,rel),freezeSha=createHash('sha256').update(fs.readFileSync(fr)).digest('hex'),fz=JSON.parse(fs.readFileSync(fr,'utf8'));
const frozenSrc=Object.fromEntries(Object.keys(fz.files).filter(p=>p.startsWith('src/')).map(p=>[p,sha(p)]));
const mism=Object.entries(fz.files).filter(([p,h])=>!fs.existsSync(path.join(cc,p))||sha(p)!==h).map(([p])=>p);
const nowFiles=[...fs.readdirSync(path.join(cc,'src')).filter(x=>x.endsWith('.mjs')).map(x=>'src/'+x),...fs.readdirSync(path.join(cc,'test')).filter(x=>x.endsWith('.mjs')).map(x=>'test/'+x)],unfrozen=nowFiles.filter(p=>!(p in fz.files));
const policy=JSON.parse(fs.readFileSync(path.join(cc,'r6/PROGRAM_POLICY_R6.json'),'utf8'));
console.log(JSON.stringify({at:new Date().toISOString(),node:process.version,tree:cc.replace(/\\/g,'/').split('/').slice(-4).join('/'),freezeRevision:fz.revision,
 sourceDigestListed:hash(listed),sourceDigestFrozenSrc:hash(frozenSrc),nSrc:Object.keys(listed).length,freezeSourceDigest:fz.sourceDigest,freezeFileSha256:freezeSha,
 nFrozenFiles:Object.keys(fz.files).length,frozenFilesMismatch:mism,unfrozen,policyRevision:fz.policyRevision,policyHashRecorded:fz.policyHash,policyHashRecomputed:hash(policy),
 policyFileSha256:sha('r6/PROGRAM_POLICY_R6.json')}));
