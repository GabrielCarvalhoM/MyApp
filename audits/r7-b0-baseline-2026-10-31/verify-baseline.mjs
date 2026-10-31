// Read-only by default. --write records this bounded documentation check; never writes Core/frozen artifacts.
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {createHash} from 'node:crypto';
import {execFileSync, spawnSync} from 'node:child_process';
const root=path.resolve(import.meta.dirname,'../..');
process.chdir(root);
const C='2263d1a1a5034eea20e0bd0fa7a8db049f4a2671',G='30164c2c45d6428769f7255fe93ebcf1f9d90ff2',R='f82b7f6917e695b5fb8f277e3b6ea39737e19c35',T='0a0422029b839f293b15ae00e05418a82754415a';
const FZ='7d2da3603e224124696a2290766ec448080f3264',M='39e4e091697c2426f547e112df04706e802dbf41',P='1c2fb97ca47fb0ca3be312298de435f4b8d10311',W='993b258e792ae894a29101e9c0efd95689c5f880';
const A='audits/r7-b0-baseline-2026-10-31/',PK='audits/domain-coaching-r7-b0-readiness-2026-10-30/',FR='CoachingCore/r7/residual-authority/RUNTIME_FREEZE_R7A_RESIDUAL_AUTHORITY.json';
const git=(...a)=>execFileSync('git',a,{maxBuffer:128*1024*1024}),txt=(...a)=>git(...a).toString('utf8').trim(),show=(r,p)=>git('show',r+':'+p),read=p=>fs.readFileSync(p),json=p=>JSON.parse(read(p)),sha=b=>createHash('sha256').update(b).digest('hex');
const canonical=v=>v===null||typeof v!=='object'?JSON.stringify(v):Array.isArray(v)?'['+v.map(canonical).join(',')+']':'{'+Object.keys(v).sort().map(k=>JSON.stringify(k)+':'+canonical(v[k])).join(',')+'}';
const hash=v=>sha(canonical(v)),lines=b=>b.toString('utf8').trim().split('\n').filter(Boolean),checks=[];
const check=(id,ok,detail)=>checks.push({id,pass:!!ok,detail});
const changed=(a,b)=>lines(git('diff','--name-only',a,b)),ancestor=(a,b)=>spawnSync('git',['merge-base','--is-ancestor',a,b]).status===0;
const tree=(ref,p)=>lines(git('ls-tree','-r','-l',ref,'--',p)).map(l=>{const m=l.match(/^\d+ blob ([0-9a-f]+)\s+(\d+)\t(.+)$/);if(!m)throw Error('Unexpected tree record');return{oid:m[1],size:Number(m[2]),path:m[3]};});
function blobs(entries){const results=[];let next=0;while(next<entries.length){const group=[];let total=0;do{const e=entries[next++];group.push(e);total+=e.size;}while(next<entries.length&&total+entries[next].size<96*1024*1024);const input=group.map(e=>e.oid+'\n').join(''),raw=execFileSync('git',['cat-file','--batch'],{input,maxBuffer:128*1024*1024});let at=0;for(const e of group){const end=raw.indexOf(10,at),h=raw.subarray(at,end).toString(),size=Number(h.split(' ')[2]);if(!Number.isFinite(size))throw Error(h);at=end+1;const bytes=raw.subarray(at,at+size);at+=size+1;results.push({...e,equal:fs.existsSync(e.path)&&read(e.path).equals(bytes)});}}return results;}

check('four-original-authorities-reachable',[C,G,R,T].every(c=>ancestor(c,'HEAD')),{closure:C,growth:G,readiness:R,rotation:T});
check('minimal-integration-ancestry',txt('rev-parse',M+'^1')===G&&txt('rev-parse',M+'^2')===T&&txt('rev-parse',G+'^')===C&&txt('rev-parse',T+'^')===P&&txt('rev-parse',P+'^')===R,{integratedAuthority:M,semanticBase:C});
const core=blobs(tree(FZ,'CoachingCore')),coreDrift=core.filter(e=>!e.equal).map(e=>e.path);
check('all-frozen-core-raw-bytes',core.length===459&&!coreDrift.length,{files:core.length,drift:coreDrift,frozenCoreTree:txt('rev-parse',FZ+':CoachingCore')});
const closureCore=blobs(tree(C,'CoachingCore')),closureCoreDrift=closureCore.filter(e=>!e.equal).map(e=>e.path);
check('entire-closed-core-unchanged',!closureCoreDrift.length,{files:closureCore.length,drift:closureCoreDrift,closureCoreTree:txt('rev-parse',C+':CoachingCore')});
const f=json(FR),live=Object.fromEntries(Object.keys(f.files).map(p=>[p,sha(read('CoachingCore/'+p))])),drift=Object.entries(f.files).filter(([p,h])=>live[p]!==h).map(([p])=>p);
check('freeze-record-and-86-file-manifest',read(FR).equals(show(FZ,FR))&&Object.keys(live).length===86&&!drift.length,{freeze:f.revision,freezeRecordSha256:sha(read(FR)),boundFiles:Object.keys(live).length,drift});
const digests={source:hash(Object.fromEntries(Object.entries(live).filter(([p])=>p.startsWith('src/')))),manifest:hash(live),policy:hash(json('CoachingCore/r6/PROGRAM_POLICY_R6.json'))};
check('source-manifest-policy-digests',digests.source===f.sourceDigest&&digests.manifest===f.manifestDigest&&digests.policy===f.policyHash,digests);
const closurePaths=lines(git('diff-tree','--no-commit-id','--name-only','-r',C)),entries=['CURRENT_MISSION.md','MISSION_LEDGER.md'];
check('formal-closure-artifacts-byte-preserved',closurePaths.every(p=>entries.includes(p)?read(p).subarray(0,show(C,p).length).equals(show(C,p)):read(p).equals(show(C,p))),{paths:closurePaths,entryAndLedger:'Exact closure prefixes; all other closure artifacts exact bytes.'});
const conflicts=[...entries,'canon/CANONICAL_INDEX.md','product/PRODUCT_DECISION_REGISTER.md'];
check('four-conflicts-exact-additive-union',conflicts.every(p=>{const b=show('4917489',p),g=show(G,p),t=show(T,p),expected=entries.includes(p)?Buffer.concat([g,t.subarray(b.length)]):Buffer.concat([t.subarray(0,t.length-b.length),g]);return show(M,p).equals(expected)}),conflicts);
const growthPaths=changed(C,G);
check('growth-complete-source-represented',growthPaths.length===11&&growthPaths.every(p=>read(p).includes(show(G,p))),{paths:growthPaths,method:'Every complete approved Growth postimage remains an exact contiguous byte sequence.'});
const reverse=spawnSync('git',['apply','--reverse','--check','audits/growth-layer-2026-10-29/PENDING_CANON_SYNC.patch'],{encoding:'utf8'});
// Prefixes deliberately added by rotation/navigation prevent Git's context-free line-1 reverse hunk.
// Check the exact approved postimages (proved present above) in a disposable alternate Git index.
const temporary=fs.mkdtempSync(path.join(os.tmpdir(),'r7b0-growth-')),temporaryIndex=path.join(temporary,'index'),env={...process.env,GIT_INDEX_FILE:temporaryIndex};
execFileSync('git',['read-tree',G],{env});
const projectedReverse=spawnSync('git',['apply','--cached','--reverse','--check','audits/growth-layer-2026-10-29/PENDING_CANON_SYNC.patch'],{encoding:'utf8',env});
fs.unlinkSync(temporaryIndex);fs.rmdirSync(temporary);
const reverseFailedPaths=[...reverse.stderr.matchAll(/patch failed: ([^:]+):/g)].map(m=>m[1]);
check('growth-patch-on-preserved-postimages',projectedReverse.status===0&&(reverse.status===0||(reverseFailedPaths.length===2&&reverseFailedPaths.every(p=>['canon/CANONICAL_INDEX.md','product/PRODUCT_DECISION_REGISTER.md'].includes(p)))),{approvedPostimagesReverseExit:projectedReverse.status,approvedPostimagesStderr:projectedReverse.stderr.trim(),consolidatedReverseExit:reverse.status,consolidatedReverseStderr:reverse.stderr.trim(),note:'Exact complete Growth postimages remain present. Only approved prepend blocks prevent the unprojected context-free line-1 reverse hunks.'});
const pdr=read('product/PRODUCT_DECISION_REGISTER.md').toString();
check('growth-and-rotation-unique-decision-rows',Array.from({length:11},(_,i)=>124+i).every(i=>(pdr.match(new RegExp('^\\| DR-'+i+' \\|','gm'))||[]).length===1),{decisions:'DR-124–134, exactly one row each'});
const rotationPaths=changed(P,T),navigation=[PK+'AUTHORITY_INDEX.json',PK+'CLAUDE_HANDOFF.md',PK+'DOCUMENT_DRIFT_AUDIT.md'];
check('approved-rotation-content-preserved',rotationPaths.filter(p=>!navigation.includes(p)).every(p=>{const t=show(T,p);if(read(p).equals(t))return true;const b=show(P,p);if(entries.includes(p))return t.subarray(0,b.length).equals(b)&&read(p).includes(t.subarray(b.length));return t.subarray(t.length-b.length).equals(b)&&read(p).includes(t.subarray(0,t.length-b.length));}),{paths:rotationPaths.filter(p=>!navigation.includes(p)),sourceSha256:sha(read('audits/two-week-rotation-policy-2026-10-30/FOUNDER_DECISION.md'))});
const proposalPaths=changed(R,P);
check('historical-proposal-and-original-pack-evidence-unchanged',proposalPaths.every(p=>read(p).equals(show(P,p)))&&['VERIFICATION.json','FIDELITY_REVIEW.md'].every(p=>read(PK+p).equals(show(R,PK+p))),{proposalFiles:proposalPaths.length,originalReadinessEvidenceFiles:2});
const idx=json(PK+'AUTHORITY_INDEX.json'),old=JSON.parse(show(T,PK+'AUTHORITY_INDEX.json')),sourceMap=new Map(idx.sources.map(s=>[s.path,s]));
check('readiness-classifications-and-gap-deferred-categories-preserved',old.sources.every(s=>sourceMap.get(s.path)?.classification===s.classification)&&['open_categories','deferred_categories','founder_choice_boundaries','amendment_order','rotation_decision'].every(k=>canonical(idx[k])===canonical(old[k])),{originalClassifications:old.sources.length,currentSources:idx.sources.length,openCategories:idx.open_categories,deferredCategories:idx.deferred_categories});
const stale=idx.sources.filter(s=>!fs.existsSync(s.path)||sha(read(s.path))!==s.sha256||(s.selectors||[]).some(sel=>!read(s.path).toString().split('\n')[sel.line-1]?.includes(sel.marker))).map(s=>s.path);
check('current-source-hashes-and-selectors',idx.sources.length===450&&!stale.length,{sources:idx.sources.length,stale});
const counts={};for(const s of idx.sources)counts[s.classification]=(counts[s.classification]||0)+1;
check('index-counts-and-status',canonical(counts)===canonical(idx.coverage.counts)&&idx.consolidation.R7A_EXIT_READINESS==='READY'&&idx.consolidation.GROWTH_CANON_SYNC==='COMPLETE'&&idx.rotation_decision.R7_B0_ROTATION_FOUNDER_BLOCKER==='CLOSED'&&idx.consolidation.B0_started===false,{counts,status:idx.consolidation});
const wearableStrategy='product/V1_WEARABLE_EVIDENCE_STRATEGY.md',wearablePublication='audits/v1-healthkit-workoutkit-evidence-2026-10-30/FINAL_DISPOSITION.md';
check('later-approved-wearable-reference-only',idx.external_authorities[0].commit===W&&!ancestor(W,'HEAD')&&!fs.existsSync(wearableStrategy)&&show(W,wearablePublication).toString().includes('PRODUCT_CONSTITUTION_READY'),{commit:W,decisions:'DR-135–147',integrated:false,strategySha256:sha(show(W,wearableStrategy)),publicationSha256:sha(show(W,wearablePublication))});
const orthogonal=['1a6d88988b452faad2e2fb60fd7f2fefd250ceac','e0666d57b35ef85c19d6dfb58159cdf5eead8dfa','3f11f7db5250d1b89dad739a31d7ee4c0046c867',W,'2dbafa3cebb3069b003b17506884f756b3d7e5f3','b715dfd763da28b682428dbe38033d6a21ec45b8'];
check('no-unrelated-or-review-ancestry',orthogonal.every(c=>!ancestor(c,'HEAD')),{separateHeads:orthogonal});
const allowed=new Set([...growthPaths,...changed('4917489',T)]),currentPaths=[...new Set([...changed(C,'HEAD'),...lines(git('diff','--name-only','HEAD')),...lines(git('ls-files','--others','--exclude-standard'))])].sort();
const unexpected=currentPaths.filter(p=>!allowed.has(p)&&![A+'BASELINE_HANDOFF.md',A+'verify-baseline.mjs',A+'VERIFICATION.json'].includes(p));
check('exact-bounded-diff-scope',!unexpected.length,{changedFromFormalClosure:currentPaths,unexpected});
const base=json('audits/domain-coaching-r7a-residual-authority-2026-10-30/BASELINE.json'),own=['CoachingCore/src/','CoachingCore/test/','CoachingCore/scripts/','CoachingCore/r7/residual-authority/','audits/domain-coaching-r7a-residual-authority-2026-10-30/'];
const historicalDrift=base.entries.filter(e=>!own.some(p=>e.path.startsWith(p))&&!entries.includes(e.path)).filter(e=>!fs.existsSync(e.path)||sha(read(e.path))!==e.sha256).map(e=>e.path);
check('historical-closed-history-divergence-only-approved-paths',historicalDrift.every(p=>allowed.has(p)||closurePaths.includes(p)),{baselineFiles:base.entries.length,divergentPaths:historicalDrift,rawHistoricalVerifier:{exit:1,passed:11,total:12,failed:['closed-history']},note:'Raw verifier executed separately; not asserted PASS. Current exact-byte/digest/scope checks replace no frozen rule.'});
const linkFiles=[A+'BASELINE_HANDOFF.md',...navigation.filter(p=>p.endsWith('.md')),'canon/CANONICAL_INDEX.md'],badLinks=[];
for(const p of linkFiles){const text=read(p).toString();for(const m of text.matchAll(/\[[^\]\n]+\]\(([^)]+)\)/g)){const target=m[1];if(/^(https?:|#|mailto:)/.test(target))continue;const local=target.split('#')[0],resolved=path.resolve(path.dirname(p),local),pendingReport=process.argv.includes('--write')&&resolved===path.resolve(A+'VERIFICATION.json');if(local&&!fs.existsSync(resolved)&&!pendingReport)badLinks.push({file:p,target});}}
check('navigation-local-links',!badLinks.length,{files:linkFiles,badLinks});
const whitespace=spawnSync('git',['-c','core.whitespace=blank-at-eol,blank-at-eof,space-before-tab,cr-at-eol','diff','--check',C],{encoding:'utf8'});
check('diff-whitespace-and-no-unresolved-conflicts',whitespace.status===0&&txt('ls-files','-u')===''&&!currentPaths.some(p=>/^(<<<<<<< |=======$|>>>>>>> )/m.test(read(p).toString())),{whitespaceExit:whitespace.status,output:whitespace.stdout.trim()});
const inputPaths=[...new Set([...core.map(e=>e.path),...closurePaths,...growthPaths,...rotationPaths,...proposalPaths,...idx.sources.map(s=>s.path),...navigation,A+'BASELINE_HANDOFF.md',A+'verify-baseline.mjs'])].sort(),inputHashes=Object.fromEntries(inputPaths.map(p=>[p,sha(read(p))]));
const out={revision:'R7B0-BASELINE-VERIFICATION-1',checkedAt:new Date().toISOString(),branch:'baseline/r7-b0',semanticBase:C,integratedAuthorityCommit:M,deliveryCommit:'Resolve the commit containing BASELINE_HANDOFF.md from Git; final report pins the full delivery SHA.',method:'Node standard-library raw bytes + Git objects; independent canonical serializer; no runtime/tests/probes/frozen writers executed.',inputCount:inputPaths.length,inputDigest:hash(inputHashes),inputs:inputHashes,passed:checks.filter(c=>c.pass).length,total:checks.length,checks,B0_started:false};
if(process.argv.includes('--write'))fs.writeFileSync(A+'VERIFICATION.json',JSON.stringify(out,null,2)+'\n');
else if(fs.existsSync(A+'VERIFICATION.json')){const recorded=json(A+'VERIFICATION.json');check('recorded-evidence-inputs-current',recorded.inputDigest===out.inputDigest&&recorded.passed===recorded.total,{recordedDigest:recorded.inputDigest,currentDigest:out.inputDigest});}
console.log(JSON.stringify({head:txt('rev-parse','HEAD'),passed:checks.filter(c=>c.pass).length,total:checks.length,failed:checks.filter(c=>!c.pass).map(c=>({id:c.id,detail:c.detail})),coreFiles:core.length,manifestFiles:Object.keys(live).length,digests,inputCount:inputPaths.length,inputDigest:out.inputDigest}));
process.exitCode=checks.every(c=>c.pass)?0:1;
