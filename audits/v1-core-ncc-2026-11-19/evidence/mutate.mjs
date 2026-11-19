// Normalization Consistency: RED on the FREEZE-4 normalizer and the mutants of this line's changes, each run against the focal test file.
// Usage: node mutate.mjs <CoachingCore root> [test file, default test/v1core-ncc-normalization-consistency.test.mjs]
// Run it on a byte-identical extract or a worktree nobody else is reading: it swaps src/r6-provenance.mjs per variant and restores the candidate
// bytes at the end (checked by hash). The FREEZE-4 bytes are read with `git show e704180:CoachingCore/src/r6-provenance.mjs` when the root is in
// a repository, else from FREEZE4_SRC. Prints one line per variant: killed (some test fails) or SURVIVED, with the failing test names.
import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';import {spawnSync,execFileSync} from 'node:child_process';
const root=path.resolve(process.argv[2]??'.'),testFile=process.argv[3]??'test/v1core-ncc-normalization-consistency.test.mjs',file=path.join(root,'src/r6-provenance.mjs');
const base=fs.readFileSync(file,'utf8'),sha=s=>crypto.createHash('sha256').update(s).digest('hex'),baseSha=sha(base);
const freeze4=process.env.FREEZE4_SRC?fs.readFileSync(process.env.FREEZE4_SRC,'utf8'):execFileSync('git',['show','e704180:CoachingCore/src/r6-provenance.mjs'],{cwd:root,encoding:'utf8'});
const sub=(s,a,b)=>{if(!s.includes(a))throw new Error('mutant anchor missing: '+a.slice(0,60));return s.split(a).join(b);};
const V={
 'FREEZE-4 (RED)':()=>freeze4,
 'F1: no record-first order':s=>sub(s,'rows.sort((a,b)=>group(a)-group(b)||','rows.sort((a,b)=>'),
 'F1: carried first, history not first':s=>sub(s,'const group=r=>r.prior?(r.o.superseded===true?0:1):2;','const group=r=>r.prior?0:1;'),
 'F1: no correction-before-report rule':s=>sub(s,'||Date.parse(corrected)<availability(old)',''),
 'F2: parts keep no activity':s=>sub(s,',...(o.provenance?.activityId?{activityId:o.provenance.activityId}:{})})','})'),
 'F2: parts\' activities not indexed':s=>sub(s,'for(const id of [activityId,...Object.values(isObject(row.provenance?.parts)?row.provenance.parts:{}).map(p=>isObject(p)?p.activityId:null)])','for(const id of [activityId])'),
 'F2: conflict flagged on the history row':s=>sub(s,'boundTo=bound&&!accepted.includes(bound)?accepted.find(x=>x.identity===bound.identity)??bound:bound','boundTo=bound'),
 'F3: own flag read as a conflict to resolve':s=>sub(sub(sub(sub(sub(s,'!!holder&&holder!==old&&!heldBefore||live','!!holder&&holder!==old&&!quarantined.has(identity)||live'),'(heldBefore?accepted','(quarantined.has(identity)?accepted'),'if(holder&&holder!==old&&!heldBefore)','if(holder&&holder!==old&&!quarantined.has(identity))'),'if(heldBefore){for(const row of accepted.filter(x=>x.identity===identity))retire(row);quarantined.delete(identity);if(o.conflicted===true)quarantined.add(identity);}','if(quarantined.has(identity)){for(const row of accepted.filter(x=>x.identity===identity))retire(row);quarantined.delete(identity);}'),'dropsIdentity||admit&&heldBefore?','dropsIdentity||admit&&quarantined.has(identity)?'),
 'F3: resolved quarantine not restored for a correction still in conflict':s=>sub(s,'quarantined.delete(identity);if(o.conflicted===true)quarantined.add(identity);}','quarantined.delete(identity);}'),
};
const env={...process.env};delete env.NODE_TEST_CONTEXT;
const out=[];
try{
 for(const [name,f] of Object.entries(V)){
  fs.writeFileSync(file,f(base));
  const r=spawnSync(process.execPath,['--test','--test-reporter=spec',testFile],{cwd:root,encoding:'utf8',env});
  const failed=[...new Set((r.stdout.split('failing tests:')[1]??'').split('\n').filter(l=>/^✖ /.test(l)).map(l=>l.replace(/^✖ /,'').replace(/ \([\d.]+ms\)$/,'')))];
  const pass=Number(/ℹ pass (\d+)/.exec(r.stdout)?.[1]),fail=Number(/ℹ fail (\d+)/.exec(r.stdout)?.[1]);
  out.push({variant:name,killed:fail>0,pass,fail,failed});
  console.log(`${fail>0?'killed  ':'SURVIVED'} ${name}: ${pass} pass, ${fail} fail`);for(const t of failed)console.log('   ✖ '+t);
 }
}finally{fs.writeFileSync(file,base);if(sha(fs.readFileSync(file,'utf8'))!==baseSha)throw new Error('candidate bytes not restored');}
console.log('candidate bytes restored ('+baseSha.slice(0,12)+')');
if(process.env.OUT)fs.writeFileSync(process.env.OUT,JSON.stringify({candidateSha256:baseSha,testFile,variants:out},null,1)+'\n');
process.exitCode=out.slice(1).every(v=>v.killed)&&out[0].killed?0:1;
