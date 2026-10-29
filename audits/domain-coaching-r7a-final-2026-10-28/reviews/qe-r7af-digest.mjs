// QE R7AF judge: recompute the canonical source digest of CoachingCore/src/*.mjs (read-only), as in scripts/freeze-r7af.mjs,
// plus the freeze file sha256 and a check of every file hash bound by the freeze.
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
const root=path.resolve(import.meta.dirname,'../../../CoachingCore');
import {pathToFileURL} from 'node:url';
const {hash}=await import(pathToFileURL(path.join(root,'src/value.mjs')).href);
const sha=p=>createHash('sha256').update(fs.readFileSync(path.join(root,p))).digest('hex');
const src=Object.fromEntries(fs.readdirSync(path.join(root,'src')).filter(f=>f.endsWith('.mjs')).sort().map(f=>['src/'+f,sha('src/'+f)]));
const freezePath='r7/final/RUNTIME_FREEZE_R7A_FINAL.json';
const fz=JSON.parse(fs.readFileSync(path.join(root,freezePath),'utf8'));
const mismatches=Object.entries(fz.files).filter(([p,h])=>!fs.existsSync(path.join(root,p))||sha(p)!==h).map(([p])=>p);
const extraSrc=Object.keys(src).filter(p=>!(p in fz.files));
console.log(JSON.stringify({at:new Date().toISOString(),sourceDigest:hash(src),freezeSourceDigest:fz.sourceDigest,match:hash(src)===fz.sourceDigest,freezeFileSha256:sha(freezePath),boundFiles:Object.keys(fz.files).length,mismatches,extraSrc},null,1));
