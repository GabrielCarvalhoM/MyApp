// Independent integrity implementation; no imports from the runtime serializer or verifier.
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
const root=path.resolve(import.meta.dirname,'../../..'),audit='audits/domain-coaching-r7a-residual-authority-2026-10-30/';
const file='CoachingCore/r7/residual-authority/RUNTIME_FREEZE_R7A_RESIDUAL_AUTHORITY.json';
const read=p=>fs.readFileSync(path.join(root,p)),json=p=>JSON.parse(read(p).toString('utf8').replace(/^\uFEFF/,''));
const sha=b=>createHash('sha256').update(b).digest('hex');
function serial(v){if(v===null||typeof v!=='object')return JSON.stringify(v);if(Array.isArray(v))return '['+v.map(serial).join(',')+']';return '{'+Object.keys(v).sort().map(k=>JSON.stringify(k)+':'+serial(v[k])).join(',')+'}';}
const hash=v=>sha(serial(v)),git=(...a)=>execFileSync('git',a,{cwd:root,maxBuffer:128*1024*1024}),rev=r=>git('rev-parse',r).toString().trim();
const F=json(file),live=Object.fromEntries(Object.keys(F.files).map(p=>[p,sha(read('CoachingCore/'+p))]));
const commits=['7d2da3603e224124696a2290766ec448080f3264',rev('4917489')];
const atCommits=Object.fromEntries(commits.map(c=>[c,Object.fromEntries(Object.keys(F.files).map(p=>[p,sha(git('show',c+':CoachingCore/'+p))]))]));
const policy=json('CoachingCore/r6/PROGRAM_POLICY_R6.json'),pred=json(audit+'decision-authority-freeze-source/MANIFEST.json');
const predLive=Object.fromEntries(Object.keys(pred.files).map(p=>[p,sha(read(audit+'decision-authority-freeze-source/'+p))]));
const evidence=json(audit+'probes/EVIDENCE_RUNS_R7ARA.json'),equal=(a,b)=>serial(a)===serial(b);
const checks={
 freezeIdentity:F.revision==='R7A-RESIDUAL-AUTHORITY-FREEZE-1',bound86:Object.keys(live).length===86&&equal(live,F.files),
 sourceDigest:hash(Object.fromEntries(Object.entries(live).filter(([p])=>p.startsWith('src/'))))===F.sourceDigest&&F.sourceDigest==='e7172eb2e65bfb1da4c102a7efa2bae64bf1c70b06562fd3ce9896defd6dc17d',
 manifestDigest:hash(live)===F.manifestDigest&&F.manifestDigest==='3d214fb53f62e45ca7d99f39f2c562d358719a2264c2de46098d39b318c85125',
 policyDigest:hash(policy)==='18ec48f34768a7eebb2aede618db65a77385efebbda0a38d6f03135e5cd96b4c',
 committedBytes:Object.values(atCommits).every(v=>equal(v,live)),
 freezeRecordImmutable:commits.every(c=>read(file).equals(git('show',c+':'+file))),
 predecessorCopy:equal(predLive,pred.files),predecessorFreeze:sha(read(pred.freeze.file))===pred.freeze.fileSha256,
 evidence146:evidence.runs.length===146&&evidence.runs.every(r=>sha(read(r.output))===r.outSha256&&r.sourceDigestStart===F.sourceDigest&&r.sourceDigestEnd===F.sourceDigest),
 noUnboundSourceOrTests:['src','test'].every(d=>fs.readdirSync(path.join(root,'CoachingCore',d)).filter(f=>f.endsWith('.mjs')).every(f=>Object.hasOwn(live,d+'/'+f)))
};
const out={at:new Date().toISOString(),node:process.version,checks,allPassed:Object.values(checks).every(Boolean),sourceDigest:F.sourceDigest,manifestDigest:F.manifestDigest,policyDigest:hash(policy),policyFileSha256:sha(read('CoachingCore/r6/PROGRAM_POLICY_R6.json')),boundFiles:Object.keys(live).length,commits,handoffChanges:git('diff','--name-only',...commits).toString().trim().split('\n'),head:rev('HEAD'),branch:git('branch','--show-current').toString().trim(),refs:Object.fromEntries(['origin/claude/r7a-residual-authority-closure','origin/claude/trusting-euler-04la8t','origin/review/r7ada-decision-authority-engineering','origin/review/r7ada-decision-authority-ssctr'].map(r=>[r,rev(r)]))};
console.log(JSON.stringify(out,null,2));process.exitCode=out.allPassed?0:1;
