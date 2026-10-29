import fs from 'node:fs';import path from 'node:path';import {createHash} from 'node:crypto';import {pathToFileURL} from 'node:url';
const cc=process.argv[2];
const {hash}=await import(pathToFileURL(path.join(cc,'src/value.mjs')).href);
const sha=p=>createHash('sha256').update(fs.readFileSync(path.join(cc,p))).digest('hex');
const files=Object.fromEntries(fs.readdirSync(path.join(cc,'src')).filter(f=>f.endsWith('.mjs')).map(f=>'src/'+f).sort().map(p=>[p,sha(p)]));
const fr=path.join(cc,'r7/final/RUNTIME_FREEZE_R7A_FINAL.json');
const freezeSha=createHash('sha256').update(fs.readFileSync(fr)).digest('hex');
const fz=JSON.parse(fs.readFileSync(fr,'utf8'));
let mism=[];for(const [p,h] of Object.entries(fz.files)){if(sha(p)!==h)mism.push(p)}
console.log(JSON.stringify({at:new Date().toISOString(),node:process.version,sourceDigest:hash(files),nSrc:Object.keys(files).length,freezeFileSha256:freezeSha,freezeSourceDigest:fz.sourceDigest,policyRevision:fz.policyRevision,policyHash:fz.policyHash,frozenFilesMismatch:mism,nFrozenFiles:Object.keys(fz.files).length}));
