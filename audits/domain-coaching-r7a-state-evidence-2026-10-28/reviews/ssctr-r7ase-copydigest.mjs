// SSCTR R7ASE-SSCTR-r1 copy digest probe (print only). Recomputes the canonical source digest of a CoachingCore copy and its drift against
// a freeze file given by absolute or repo-relative path. Usage: node ssctr-r7ase-copydigest.mjs <CoachingCore copy dir> <freeze file path>
import fs from 'node:fs';import path from 'node:path';import {createHash} from 'node:crypto';import {pathToFileURL} from 'node:url';
const cc=path.resolve(process.argv[2]),fr=path.resolve(process.argv[3]);
const {hash}=await import(pathToFileURL(path.join(cc,'src/value.mjs')).href);
const sha=p=>createHash('sha256').update(fs.readFileSync(path.join(cc,p))).digest('hex');
const listed=Object.fromEntries(fs.readdirSync(path.join(cc,'src')).filter(f=>f.endsWith('.mjs')).map(f=>'src/'+f).sort().map(p=>[p,sha(p)]));
const fz=JSON.parse(fs.readFileSync(fr,'utf8'));
const mism=Object.entries(fz.files).filter(([p,h])=>!fs.existsSync(path.join(cc,p))||sha(p)!==h).map(([p])=>p);
console.log(JSON.stringify({at:new Date().toISOString(),node:process.version,tree:cc.replace(/\\/g,'/').split('/').slice(-3).join('/'),freezeRevision:fz.revision,
 sourceDigestListed:hash(listed),freezeSourceDigest:fz.sourceDigest,freezeFileSha256:createHash('sha256').update(fs.readFileSync(fr)).digest('hex'),
 nFrozenFiles:Object.keys(fz.files).length,mismatch:mism}));
