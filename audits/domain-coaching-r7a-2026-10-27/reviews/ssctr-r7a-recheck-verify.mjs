// SSCTR R7A-SSCTR-r2 (single narrow re-check): identity of R7A-FREEZE-2 and of the FREEZE-1 reconstruction used as the comparator.
// Read-only. Usage: node ssctr-r7a-recheck-verify.mjs <F1_BASE> [out.json]
//   <F1_BASE> is a scratch copy whose CoachingCore/ holds src/, test/, r6/ and package.json of the current tree with
//   dossier/RUNTIME_DELTA_R7A_CYCLE2.diff reverse-applied (git apply -R -p1, LF kept). This script checks it against RUNTIME_FREEZE_R7A_1.json.
// Checks: (1) every file bound by RUNTIME_FREEZE_R7A_2.json matches the working tree; (2) sourceDigest recomputed with src/value.mjs hash;
// (3) policy canonical hash recomputed; (4) the FREEZE-1 -> FREEZE-2 manifest delta; (5) the reconstruction equals FREEZE-1 for every src file.
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {pathToFileURL} from 'node:url';
const HERE=import.meta.dirname,ROOT=path.resolve(HERE,'../../..'),CC=path.join(ROOT,'CoachingCore');
const F1=process.argv[2]?path.join(process.argv[2],'CoachingCore'):null,OUT=process.argv[3]??null;
const sha=f=>createHash('sha256').update(fs.readFileSync(f)).digest('hex');
const {hash}=await import(pathToFileURL(path.join(CC,'src/value.mjs')).href);
const fr2=JSON.parse(fs.readFileSync(path.join(CC,'r7/RUNTIME_FREEZE_R7A_2.json'),'utf8'));
const fr1=JSON.parse(fs.readFileSync(path.join(CC,'r7/RUNTIME_FREEZE_R7A_1.json'),'utf8'));
const out={probe:'R7A-SSCTR-r2-verify',node:process.version,at:new Date().toISOString()};
out.freeze2={file:'CoachingCore/r7/RUNTIME_FREEZE_R7A_2.json',fileSha256:sha(path.join(CC,'r7/RUNTIME_FREEZE_R7A_2.json')),revision:fr2.revision,declaredSourceDigest:fr2.sourceDigest,declaredPolicyHash:fr2.policyHash};
const mism=[];for(const [p,h] of Object.entries(fr2.files)){const f=path.join(CC,p);if(!fs.existsSync(f))mism.push({p,missing:true});else if(sha(f)!==h)mism.push({p,expected:h,actual:sha(f)});}
out.freeze2.filesChecked=Object.keys(fr2.files).length;out.freeze2.mismatches=mism;
out.freeze2.recomputedSourceDigest=hash(Object.fromEntries(Object.entries(fr2.files).filter(([p])=>p.startsWith('src/')).map(([p])=>[p,sha(path.join(CC,p))])));
out.freeze2.sourceDigestMatches=out.freeze2.recomputedSourceDigest===fr2.sourceDigest&&fr2.sourceDigest==='f56ae974762523b1efacd9ad7a9046cc7f6b7d33e42a7c2c955e758ef0f7821c';
const pol=JSON.parse(fs.readFileSync(path.join(CC,'r6/PROGRAM_POLICY_R6.json'),'utf8').replace(/^﻿/,''));
out.policy={revision:pol.revision,recomputedHash:hash(pol),fileSha256:sha(path.join(CC,'r6/PROGRAM_POLICY_R6.json'))};
out.policy.matches=out.policy.recomputedHash==='18ec48f34768a7eebb2aede618db65a77385efebbda0a38d6f03135e5cd96b4c'&&out.policy.recomputedHash===fr2.policyHash&&fr1.policyHash===fr2.policyHash;
const keys=[...new Set([...Object.keys(fr1.files),...Object.keys(fr2.files)])].sort();
out.delta=keys.filter(k=>fr1.files[k]!==fr2.files[k]).map(k=>({path:k,freeze1:fr1.files[k]??null,freeze2:fr2.files[k]??null}));
out.freeze1={file:'CoachingCore/r7/RUNTIME_FREEZE_R7A_1.json',fileSha256:sha(path.join(CC,'r7/RUNTIME_FREEZE_R7A_1.json')),sourceDigest:fr1.sourceDigest};
out.diff={file:'audits/domain-coaching-r7a-2026-10-27/dossier/RUNTIME_DELTA_R7A_CYCLE2.diff',sha256:sha(path.join(HERE,'../dossier/RUNTIME_DELTA_R7A_CYCLE2.diff'))};
if(F1){
 const m1=[];for(const [p,h] of Object.entries(fr1.files)){const f=path.join(F1,p);if(!fs.existsSync(f))m1.push({p,missing:true});else if(sha(f)!==h)m1.push({p,expected:h,actual:sha(f)});}
 out.reconstruction={base:'<scratch>/CoachingCore (FREEZE-2 tree with the cycle-2 diff reverse-applied)',filesChecked:Object.keys(fr1.files).length,mismatches:m1,
  recomputedSourceDigest:hash(Object.fromEntries(Object.entries(fr1.files).filter(([p])=>p.startsWith('src/')).map(([p])=>[p,sha(path.join(F1,p))])))};
 out.reconstruction.equalsFreeze1=m1.length===0&&out.reconstruction.recomputedSourceDigest===fr1.sourceDigest;
}
out.verified=mism.length===0&&out.freeze2.sourceDigestMatches&&out.policy.matches&&(!F1||out.reconstruction.equalsFreeze1);
const txt=JSON.stringify(out,null,1);if(OUT)fs.writeFileSync(OUT,txt+'\n');console.log(txt);
