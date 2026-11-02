// R7-C freeze verifier (node scripts/verify-r7c.mjs [--suite] [--write]): read-only check of R7C-FREEZE-1 (CoachingCore/r7/c/RUNTIME_FREEZE_R7C_1.json).
// - files: every bound file's SHA-256 now equals the record, and equals the file at the record's commit (git show);
// - digests: the source and manifest digests recompute;
// - inputs: the policy, catalog, B0 records, human queue, product/ and canon/ are unchanged since the R7-B.2 closure; CURRENT_MISSION.md and
//   MISSION_LEDGER.md are append-only since then;
// - evidence: the bound evidence manifest and mutation outputs still have their recorded SHA-256;
// - with --suite, the suite re-runs and must match the record (count, zero failures).
// Prints JSON. Writes nothing unless given --write, which writes only CoachingCore/r7/c/VERIFICATION_R7C_1.json.
// --revision 2 checks R7C-FREEZE-2 (RUNTIME_FREEZE_R7C_2.json) the same way, plus its predecessor record and reviews by SHA-256; --write then
// writes only CoachingCore/r7/c/VERIFICATION_R7C_2.json.
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {hash} from '../src/value.mjs';
const N=(()=>{const i=process.argv.indexOf('--revision');return i>=0?process.argv[i+1]:'1';})();if(!['1','2'].includes(N))throw Error('--revision 1|2');
const cc=path.resolve(import.meta.dirname,'..'),repo=path.resolve(cc,'..');
const rec=JSON.parse(fs.readFileSync(path.join(cc,`r7/c/RUNTIME_FREEZE_R7C_${N}.json`),'utf8')),checks=[];
const check=(id,ok,detail=null)=>checks.push({id,result:ok?'PASS':'FAIL',...(detail?{detail}:{})});
const shaRepo=p=>fs.existsSync(path.join(repo,p))?createHash('sha256').update(fs.readFileSync(path.join(repo,p))).digest('hex'):null;
const shaAt=(rev,p)=>{const r=spawnSync('git',['show',`${rev}:${p}`],{cwd:repo,encoding:'buffer',maxBuffer:1<<28});return r.status===0?createHash('sha256').update(r.stdout).digest('hex'):null;};
const now=Object.entries(rec.files).filter(([p,s])=>shaRepo(p)!==s).map(([p])=>p);check('files-current',!now.length,now.length?now.slice(0,10):null);
const atCommit=Object.entries(rec.files).filter(([p,s])=>shaAt(rec.commit,p)!==s).map(([p])=>p);check('files-at-commit',!atCommit.length,atCommit.length?atCommit.slice(0,10):null);
check('source-digest',hash(Object.fromEntries(Object.entries(rec.files).filter(([p])=>p.startsWith('CoachingCore/src/'))))===rec.sourceDigest);
check('manifest-digest',hash(rec.files)===rec.manifestDigest);
check('inputs-unchanged',spawnSync('git',['diff','--quiet',rec.unchangedSince.commit,'--',...rec.unchangedSince.paths],{cwd:repo}).status===0);
for(const f of rec.appendOnly){const base=spawnSync('git',['show',`${rec.unchangedSince.commit}:${f}`],{cwd:repo,encoding:'buffer'}).stdout,cur=fs.readFileSync(path.join(repo,f));check('append-only:'+f,base.length>0&&cur.subarray(0,base.length).equals(base));}
check('semantic-disposition',shaRepo(rec.semanticDisposition.path)===rec.semanticDisposition.sha256&&rec.semanticDisposition.disposition==='ACCEPT_R7C_UNKNOWN_SEMANTICS');
check('binding-conditions',['C2','C3','C7','C8','C9'].every(id=>rec.bindingConditions?.some(c=>c.id===id&&c.text)));
check('evidence-manifest',shaRepo(rec.evidence.manifest.path)===rec.evidence.manifest.sha256);
check('evidence-mutation',shaRepo(rec.evidence.mutation.path)===rec.evidence.mutation.sha256);
if(rec.correctionCycle){check('predecessor-record',shaRepo(rec.predecessor.record)===rec.predecessor.sha256);for(const [k,r] of Object.entries(rec.correctionCycle.predecessorReviews))check('predecessor-review:'+k,shaRepo(r.path)===r.sha256);check('correction-cycle-mutants',rec.evidence.mutation.correctionCycle?.killed===rec.evidence.mutation.correctionCycle?.mutants&&rec.evidence.mutation.correctionCycle.mutants>0);}
if(process.argv.includes('--suite')){const r=spawnSync(process.execPath,['--test'],{cwd:cc,encoding:'utf8',maxBuffer:1<<28,timeout:1800000}),n=k=>Number(r.stdout.match(new RegExp('ℹ '+k+' (\\d+)'))?.[1]??NaN);check('suite',n('tests')===rec.tests.count&&n('fail')===0&&n('pass')===rec.tests.count,{tests:n('tests'),pass:n('pass'),fail:n('fail')});}
const report={check:`R7C-FREEZE-${N}-VERIFICATION`,revision:rec.revision,commit:rec.commit,ran:new Date().toISOString(),checks,result:checks.every(c=>c.result==='PASS')?'PASS':'FAIL'};
if(process.argv.includes('--write'))fs.writeFileSync(path.join(cc,`r7/c/VERIFICATION_R7C_${N}.json`),JSON.stringify(report,null,1)+'\n');
console.log(JSON.stringify(report,null,1));
