// R7-D freeze-3 verifier (read-only): node scripts/verify-r7d-3.mjs [--suite] [--write]. It checks R7D-FREEZE-3 against the working tree:
//  - every bound file hashes as recorded and as committed at the record's commit;
//  - the source and manifest digests recompute;
//  - the evidence, review, authorization and PREREG-4 records hash as bound;
//  - the authorities the phase left untouched are still untouched (policy bytes, canonical hash and the ten R6 boundaries, catalog);
//  - the predecessor R7D-FREEZE-2 record is unchanged;
//  - the human queue still starts with the items this freeze bound (append-only);
//  - no final holdout exists; V1 authority is NO.
// With --suite it re-runs the suite (the count must equal the record's, zero failures) and the three conformance checks. With --write it writes
// only CoachingCore/r7/d/VERIFICATION_R7D_3.json.
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {pathToFileURL} from 'node:url';
import {hash} from '../src/value.mjs';

const cc=path.resolve(import.meta.dirname,'..'),repo=path.resolve(cc,'..'),REC='CoachingCore/r7/d/RUNTIME_FREEZE_R7D_3.json';
const sha=p=>createHash('sha256').update(fs.readFileSync(path.join(repo,p))).digest('hex'),checks=[],check=(id,ok,detail=null)=>checks.push({id,result:ok?'PASS':'FAIL',...(detail!==null?{detail}:{})});
const rec=JSON.parse(fs.readFileSync(path.join(repo,REC),'utf8'));
check('record',rec.revision==='R7D-FREEZE-3',{revision:rec.revision,sha256:sha(REC)});
// The queue is bound as it was at the freeze; later appends by its owner are allowed and checked separately (queue-append-only).
const Q=rec.humanRevalidationQueue.path,bound=Object.entries(rec.files).filter(([p])=>p!==Q);
const changed=bound.filter(([p,h])=>!fs.existsSync(path.join(repo,p))||sha(p)!==h).map(([p])=>p);
check('files-current',!changed.length,changed.length?{changed:changed.slice(0,20)}:{files:Object.keys(rec.files).length});
const atCommit=Object.entries(rec.files).filter(([p,h])=>{const r=spawnSync('git',['show',`${rec.commit}:${p}`],{cwd:repo,encoding:'buffer',maxBuffer:1<<28});return r.status!==0||createHash('sha256').update(r.stdout).digest('hex')!==h;}).map(([p])=>p);
check('files-committed',!atCommit.length,atCommit.length?{differ:atCommit.slice(0,20)}:{commit:rec.commit});
check('digests',hash(Object.fromEntries(Object.entries(rec.files).filter(([p])=>p.startsWith('CoachingCore/src/'))))===rec.sourceDigest&&hash(rec.files)===rec.manifestDigest,{sourceDigest:rec.sourceDigest,manifestDigest:rec.manifestDigest});
for(const [id,b] of [['evidence',rec.evidence],['review-ssctr',rec.reviews.ssctr],['review-engineering',rec.reviews.engineering],['authorization',rec.authorization],['prereg-4',rec.instruments.prereg],['predecessor',{path:rec.predecessor.record,sha256:rec.predecessor.sha256}]])check(id,fs.existsSync(path.join(repo,b.path))&&sha(b.path)===b.sha256,{path:b.path});
for(const [k,o] of Object.entries(rec.evidence.outputs))check('evidence-output:'+k,fs.existsSync(path.join(repo,o.path))&&sha(o.path)===o.sha256);
check('reviews-pass',['ACCEPT','ACCEPT_WITH_CONDITIONS'].includes(rec.reviews.ssctr.disposition)&&['READY','READY_WITH_CONDITIONS'].includes(rec.reviews.engineering.verdict),{ssctr:rec.reviews.ssctr.disposition,engineering:rec.reviews.engineering.verdict});
const {r6Authority}=await import(pathToFileURL(path.join(cc,'src/r6-authority.mjs')).href),A=r6Authority();
check('authorities',sha('CoachingCore/r6/PROGRAM_POLICY_R6.json')==='a75be1aae3818616888e641c104407926d5f16f213a04137f5b21024ccafe100'&&A.policyHash===rec.evidence.authority.policy.canonicalHash&&Object.keys(A.approved).length===10&&sha('CoachingCore/r7/b0/REPERTOIRE_CATALOG_B0.json')==='ceee276a424ee7575b4477a2bc429de2e8cd854e3cb82ac767776492cdcb92f9',{policyCanonicalHash:A.policyHash,boundaries:Object.keys(A.approved).length});
// The queue as this freeze bound it is a prefix of the queue now.
const q=JSON.parse(fs.readFileSync(path.join(repo,Q),'utf8')),qb=JSON.parse(spawnSync('git',['show',`${rec.commit}:${Q}`],{cwd:repo,encoding:'utf8',maxBuffer:1<<28}).stdout);
check('queue-append-only',JSON.stringify(q.items.slice(0,qb.items.length))===JSON.stringify(qb.items)&&qb.items.length===rec.humanRevalidationQueue.items,{boundItems:qb.items.length,items:q.items.length,boundSha256:rec.humanRevalidationQueue.sha256});
check('no-final-holdout',!fs.existsSync(path.join(repo,'audits/domain-coaching-r7-d-2026-11-02/final'))&&rec.finalHoldoutExists===false);
check('v1-authority',rec.V1_COACHING_AUTHORITY_READY==='NO');
if(process.argv.includes('--suite')){
 const r=spawnSync(process.execPath,['--test'],{cwd:cc,encoding:'utf8',maxBuffer:1<<28,timeout:1800000}),n=k=>Number(r.stdout.match(new RegExp('ℹ '+k+' (\\d+)'))?.[1]??NaN);
 check('suite',n('tests')===rec.tests.count&&n('fail')===0&&n('pass')===n('tests'),{tests:n('tests'),pass:n('pass'),fail:n('fail'),recorded:rec.tests.count});
 for(const s of ['conformance-r7b','conformance-r7b1','conformance-r7b2']){const x=spawnSync(process.execPath,[`scripts/${s}.mjs`],{cwd:cc,encoding:'utf8',maxBuffer:1<<28});let j=null;try{j=JSON.parse(x.stdout);}catch{}check(s,j?.result==='PASS');}
}
const out={verification:'R7D-FREEZE-3',record:REC,recordSha256:sha(REC),ran:new Date().toISOString(),node:process.version,checks,result:checks.every(c=>c.result==='PASS')?'PASS':'FAIL'};
if(process.argv.includes('--write'))fs.writeFileSync(path.join(cc,'r7/d/VERIFICATION_R7D_3.json'),JSON.stringify(out,null,1)+'\n');
console.log(JSON.stringify({result:out.result,passed:checks.filter(c=>c.result==='PASS').length,checks:checks.length,failed:checks.filter(c=>c.result!=='PASS').map(c=>c.id)},null,1));
process.exitCode=out.result==='PASS'?0:1;
