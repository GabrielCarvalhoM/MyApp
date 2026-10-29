// SSCTR R7A1-SSCTR-r2: identity of R7A1-FREEZE-A2 and its delta from R7A1-FREEZE-A1. Read-only.
// Usage: node ssctr-r7a1-recheck-verify.mjs [out.json]
// Checks: (1) every file bound by RUNTIME_FREEZE_R7A1_FREEZE_A2.json matches the working tree; (2) sourceDigest recomputed with src/value.mjs hash
// over the src/ entries (same selection as the r1 check); (3) policy canonical hash recomputed; (4) delta FREEZE-A1 -> FREEZE-A2 by file, from the
// two freeze manifests; (5) the A1->A2 diff file hash.
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {pathToFileURL} from 'node:url';
const HERE=import.meta.dirname,ROOT=path.resolve(HERE,'../../..'),CC=path.join(ROOT,'CoachingCore');
const OUT=process.argv[2]??null;
const EXPECTED_DIGEST='71edc245cfe06a376732ec8054f2e09f277066f2ee4004f34827b2c90a1c4024';
const EXPECTED_POLICY='18ec48f34768a7eebb2aede618db65a77385efebbda0a38d6f03135e5cd96b4c';
const sha=f=>createHash('sha256').update(fs.readFileSync(f)).digest('hex');
const {hash}=await import(pathToFileURL(path.join(CC,'src/value.mjs')).href);
const fileA2=path.join(CC,'r7/a1/RUNTIME_FREEZE_R7A1_FREEZE_A2.json'),fileA1=path.join(CC,'r7/a1/RUNTIME_FREEZE_R7A1_FREEZE_A1.json');
const fa2=JSON.parse(fs.readFileSync(fileA2,'utf8')),fa1=JSON.parse(fs.readFileSync(fileA1,'utf8'));
const out={probe:'R7A1-SSCTR-r2-verify',node:process.version,at:new Date().toISOString()};
out.freezeA2={file:'CoachingCore/r7/a1/RUNTIME_FREEZE_R7A1_FREEZE_A2.json',fileSha256:sha(fileA2),revision:fa2.revision,declaredSourceDigest:fa2.sourceDigest,declaredPolicyHash:fa2.policyHash};
const mism=[];for(const [p,h] of Object.entries(fa2.files)){const f=path.join(CC,p);if(!fs.existsSync(f))mism.push({p,missing:true});else if(sha(f)!==h)mism.push({p,expected:h,actual:sha(f)});}
const live=[...fs.readdirSync(path.join(CC,'src')).filter(f=>f.endsWith('.mjs')).map(f=>'src/'+f),...fs.readdirSync(path.join(CC,'test')).filter(f=>f.endsWith('.mjs')).map(f=>'test/'+f)];
out.freezeA2.filesChecked=Object.keys(fa2.files).length;out.freezeA2.mismatches=mism;out.freezeA2.unboundLiveFiles=live.filter(p=>!fa2.files[p]);
out.freezeA2.recomputedSourceDigest=hash(Object.fromEntries(Object.entries(fa2.files).filter(([p])=>p.startsWith('src/')).map(([p])=>[p,sha(path.join(CC,p))])));
out.freezeA2.sourceDigestMatches=out.freezeA2.recomputedSourceDigest===fa2.sourceDigest&&fa2.sourceDigest===EXPECTED_DIGEST;
const pol=JSON.parse(fs.readFileSync(path.join(CC,'r6/PROGRAM_POLICY_R6.json'),'utf8').replace(/^﻿/,''));
out.policy={revision:pol.revision,recomputedHash:hash(pol),fileSha256:sha(path.join(CC,'r6/PROGRAM_POLICY_R6.json'))};
out.policy.matches=out.policy.recomputedHash===EXPECTED_POLICY&&out.policy.recomputedHash===fa2.policyHash&&fa1.policyHash===fa2.policyHash;
out.freezeA1={file:'CoachingCore/r7/a1/RUNTIME_FREEZE_R7A1_FREEZE_A1.json',fileSha256:sha(fileA1),sourceDigest:fa1.sourceDigest};
const keys=[...new Set([...Object.keys(fa1.files),...Object.keys(fa2.files)])].sort();
out.deltaA1toA2=keys.filter(k=>fa1.files[k]!==fa2.files[k]).map(k=>({path:k,freezeA1:fa1.files[k]??null,freezeA2:fa2.files[k]??null}));
const diffFile=path.resolve(HERE,'../dossier/RUNTIME_DELTA_R7A1_A1_TO_A2.diff');
out.diff={file:'audits/domain-coaching-r7a1-2026-10-27/dossier/RUNTIME_DELTA_R7A1_A1_TO_A2.diff',sha256:sha(diffFile)};
out.verified=mism.length===0&&out.freezeA2.sourceDigestMatches&&out.policy.matches;
const txt=JSON.stringify(out,null,1);if(OUT)fs.writeFileSync(OUT,txt+'\n');console.log(txt);
