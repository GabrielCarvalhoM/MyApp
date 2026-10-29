// SSCTR R7A1-SSCTR-r1: identity of R7A1-FREEZE-A1 and of the byte-exact R7A-FREEZE-2 comparator (freeze2-source/). Read-only.
// Usage: node ssctr-r7a1-verify.mjs [out.json]
// Checks: (1) every file bound by RUNTIME_FREEZE_R7A1_FREEZE_A1.json matches the working tree; (2) sourceDigest recomputed with src/value.mjs hash
// over the src/ entries, as freeze-r7a1.mjs states it; (3) policy canonical hash recomputed; (4) the FREEZE-2 snapshot matches its manifest and
// its digest; (5) the delta FREEZE-2 -> FREEZE-A1 by file.
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {pathToFileURL} from 'node:url';
const HERE=import.meta.dirname,ROOT=path.resolve(HERE,'../../..'),CC=path.join(ROOT,'CoachingCore'),F2=path.resolve(HERE,'../freeze2-source');
const OUT=process.argv[2]??null;
const sha=f=>createHash('sha256').update(fs.readFileSync(f)).digest('hex');
const {hash}=await import(pathToFileURL(path.join(CC,'src/value.mjs')).href);
const freezeFile=path.join(CC,'r7/a1/RUNTIME_FREEZE_R7A1_FREEZE_A1.json');
const fa1=JSON.parse(fs.readFileSync(freezeFile,'utf8'));
const out={probe:'R7A1-SSCTR-r1-verify',node:process.version,at:new Date().toISOString()};
out.freezeA1={file:'CoachingCore/r7/a1/RUNTIME_FREEZE_R7A1_FREEZE_A1.json',fileSha256:sha(freezeFile),revision:fa1.revision,declaredSourceDigest:fa1.sourceDigest,declaredPolicyHash:fa1.policyHash};
const mism=[];for(const [p,h] of Object.entries(fa1.files)){const f=path.join(CC,p);if(!fs.existsSync(f))mism.push({p,missing:true});else if(sha(f)!==h)mism.push({p,expected:h,actual:sha(f)});}
// Files the freeze would bind today (same selection as freeze-r7a1.mjs) but that it does not list.
const live=[...fs.readdirSync(path.join(CC,'src')).filter(f=>f.endsWith('.mjs')).map(f=>'src/'+f),...fs.readdirSync(path.join(CC,'test')).filter(f=>f.endsWith('.mjs')).map(f=>'test/'+f)];
out.freezeA1.filesChecked=Object.keys(fa1.files).length;out.freezeA1.mismatches=mism;out.freezeA1.unboundLiveFiles=live.filter(p=>!fa1.files[p]);
out.freezeA1.recomputedSourceDigest=hash(Object.fromEntries(Object.entries(fa1.files).filter(([p])=>p.startsWith('src/')).map(([p])=>[p,sha(path.join(CC,p))])));
out.freezeA1.sourceDigestMatches=out.freezeA1.recomputedSourceDigest===fa1.sourceDigest&&fa1.sourceDigest==='2de8681f13e5cb499df6a5a3dc443d52877850528ceb298b598d03de6ec2141a';
const pol=JSON.parse(fs.readFileSync(path.join(CC,'r6/PROGRAM_POLICY_R6.json'),'utf8').replace(/^﻿/,''));
out.policy={revision:pol.revision,recomputedHash:hash(pol),fileSha256:sha(path.join(CC,'r6/PROGRAM_POLICY_R6.json'))};
out.policy.matches=out.policy.recomputedHash==='18ec48f34768a7eebb2aede618db65a77385efebbda0a38d6f03135e5cd96b4c'&&out.policy.recomputedHash===fa1.policyHash;
const man=JSON.parse(fs.readFileSync(path.join(F2,'MANIFEST.json'),'utf8'));
const m2=[];for(const [p,h] of Object.entries(man.files)){const f=path.join(F2,p);if(!fs.existsSync(f))m2.push({p,missing:true});else if(sha(f)!==h)m2.push({p,expected:h,actual:sha(f)});}
const f2src=Object.fromEntries(Object.entries(man.files).filter(([p])=>p.startsWith('CoachingCore/src/')).map(([p,h])=>[p.replace(/^CoachingCore\//,''),h]));
out.freeze2Snapshot={manifest:'audits/domain-coaching-r7a1-2026-10-27/freeze2-source/MANIFEST.json',filesChecked:Object.keys(man.files).length,mismatches:m2,
 recomputedSourceDigest:hash(f2src),declared:man.freeze.sourceDigest};
out.freeze2Snapshot.matches=m2.length===0&&out.freeze2Snapshot.recomputedSourceDigest===man.freeze.sourceDigest&&man.freeze.sourceDigest==='f56ae974762523b1efacd9ad7a9046cc7f6b7d33e42a7c2c955e758ef0f7821c';
const prior=p=>man.files['CoachingCore/'+p];
const keys=[...new Set([...Object.keys(fa1.files),...Object.keys(man.files).map(p=>p.replace(/^CoachingCore\//,''))])].sort();
out.delta=keys.filter(k=>prior(k)!==fa1.files[k]).map(k=>({path:k,freeze2:prior(k)??null,freezeA1:fa1.files[k]??null}));
const diffFile=path.resolve(HERE,'../dossier/RUNTIME_DELTA_R7A1.diff');
out.diff={file:'audits/domain-coaching-r7a1-2026-10-27/dossier/RUNTIME_DELTA_R7A1.diff',sha256:sha(diffFile)};
out.verified=mism.length===0&&out.freezeA1.sourceDigestMatches&&out.policy.matches&&out.freeze2Snapshot.matches;
const txt=JSON.stringify(out,null,1);if(OUT)fs.writeFileSync(OUT,txt+'\n');console.log(txt);
