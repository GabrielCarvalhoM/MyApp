// CoachingCore V1 Core Safety & Lifecycle (Founder missions of 2026-11-18, closure and closure-2): the additive freeze record
// (COACHINGCORE-V1-CORE-SAFETY-FREEZE-n). No earlier freeze record, verifier or historical test is edited to accept it: the historical checks
// keep running on their own frozen snapshots, and this verifier declares what this line changed. It binds one commit:
//   (i)   the five earlier freeze records are the bytes the base commit holds (an edited record is no record);
//   (ii)  every tracked file of CoachingCore is the base commit's bytes, except the files this line amends or adds, each declared below: so
//         every file the earlier records bind and this line does not declare is byte-identical, and nothing undeclared changed or appeared;
//   (iii) no untracked file sits in CoachingCore's source, values, tests or scripts;
//   (iv)  (--write / --check) the files this line amends and adds, each by hash, the reviews the freeze rests on and the successor-test ledger.
// The base is the last commit before this line (16577b6, AIF P0), where the V1STR verifier's own preservation check passes; the earlier
// verifiers are not run here (on this line each of them names an amended file, by design, and passes on the commit its own record binds).
//   node scripts/v1core-freeze.mjs --preserved                                (i) to (iii) on the tree here
//   node scripts/v1core-freeze.mjs --write <n> --commit <sha> [--note "..."]  writes v1/RUNTIME_FREEZE_V1CORE_<n>.json (only this file)
//   node scripts/v1core-freeze.mjs --check <n>                                recomputes and compares; exit 1 on drift
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const here=path.dirname(fileURLToPath(import.meta.url)),CC=path.join(here,'..'),ROOT=path.join(CC,'..');
const shaOf=b=>createHash('sha256').update(b).digest('hex'),sha=f=>shaOf(fs.readFileSync(path.join(ROOT,f)));
const git=(...a)=>execFileSync('git',a,{cwd:ROOT,encoding:'utf8',maxBuffer:1<<28}).trim();
const blobSha=(commit,file)=>{try{return shaOf(execFileSync('git',['show',`${commit}:${file}`],{cwd:ROOT,maxBuffer:1<<28}));}catch{return null;}};
const arg=k=>{const i=process.argv.indexOf(k);return i<0?null:process.argv[i+1];};
const digest=o=>createHash('sha256').update(JSON.stringify(o)).digest('hex');
const BASE='16577b6';
const PRIOR=['CoachingCore/v1/RUNTIME_FREEZE_V1_1.json','CoachingCore/v1/RUNTIME_FREEZE_V1RC_1.json','CoachingCore/v1/RUNTIME_FREEZE_V1RWS_2.json','CoachingCore/v1/RUNTIME_FREEZE_V1RFC_1.json','CoachingCore/v1/RUNTIME_FREEZE_V1STR_1.json'];
/** The files of CoachingCore this line amends (each existed at the base). */
const AMENDED=['CoachingCore/src/r5-contract.mjs','CoachingCore/src/r5-learning.mjs','CoachingCore/src/r5-schedule.mjs','CoachingCore/src/r6-adaptation.mjs','CoachingCore/src/r6-index.mjs','CoachingCore/src/r6-legacy.mjs',
 'CoachingCore/src/r6-program.mjs','CoachingCore/src/r6-provenance.mjs','CoachingCore/src/v1-run-format-index.mjs'];
/** The files this line adds: tracked files only, under these paths (the record itself excluded). */
const ADDED=['CoachingCore/src/v1-safety-index.mjs','CoachingCore/src/boundary/report-voices.mjs','CoachingCore/scripts/v1core-freeze.mjs'];
const isMineTest=f=>/^CoachingCore\/test\/v1core-[^/]+\.(test\.)?mjs$/.test(f);
const isRecord=f=>/^CoachingCore\/v1\/RUNTIME_FREEZE_V1CORE_\d+\.json$/.test(f);
/** The reviews a freeze rests on, and the successor ledger, bound by hash in the record (read, never edited). */
const REVIEWS_DIR=['audits/v1-core-safety-lifecycle-2026-11-18/reviews','audits/v1-core-safety-closure-2-2026-11-18/reviews','audits/v1-core-safety-closure-2-2026-11-18/successors'];

function preserved(){
 const out=[],bad=[];
 for(const f of PRIOR){const now=sha(f),then=blobSha(BASE,f);(now===then?out:bad).push(`${f}: ${now===then?'the base bytes':'CHANGED'}`);
  const rec=JSON.parse(fs.readFileSync(path.join(ROOT,f),'utf8')),files=Object.entries(rec.files);let same=0,declared=0,other=[];
  for(const [p] of files){if(!fs.existsSync(path.join(ROOT,p))){other.push(p+' (missing)');continue;}const s=sha(p);if(s===blobSha(BASE,p))same++;else if(AMENDED.includes(p))declared++;else other.push(p);}
  (other.length?bad:out).push(`${rec.revision??f}: ${same}/${files.length} files the base bytes, ${declared} amended by this line${other.length?'; NOT preserved: '+other.join(', '):''}`);}
 // (ii) every tracked file of CoachingCore against the base.
 const changed=git('diff','--name-only',BASE,'--','CoachingCore').split('\n').filter(Boolean),tracked=new Set(git('ls-files','--','CoachingCore').split('\n'));
 const undeclared=changed.filter(f=>!AMENDED.includes(f)&&!ADDED.includes(f)&&!isMineTest(f)&&!isRecord(f));
 (undeclared.length?bad:out).push(undeclared.length?'CHANGED and not declared: '+undeclared.join(', '):`nothing else changed since ${BASE} (${changed.length} files: ${AMENDED.filter(f=>changed.includes(f)).length} amended, the rest added by this line)`);
 for(const f of AMENDED)if(!blobSha(BASE,f))bad.push(f+': NOT a file of the base');
 // (iii) no untracked file in source, values, tests or scripts.
 const untracked=git('ls-files','--others','--exclude-standard','--','CoachingCore/src','CoachingCore/v1','CoachingCore/test','CoachingCore/scripts').split('\n').filter(Boolean);
 (untracked.length?bad:out).push(untracked.length?'UNTRACKED: '+untracked.join(', '):'no untracked file in src, v1, test or scripts');
 return {out,bad,changed,tracked};
}
function filesOf(){
 const list=[...AMENDED,...ADDED,...git('ls-files','--','CoachingCore/test').split('\n').filter(isMineTest),...REVIEWS_DIR.flatMap(d=>git('ls-files','--',d).split('\n').filter(Boolean))].sort();
 return Object.fromEntries(list.map(f=>[f,sha(f)]));
}
const mode=process.argv[2];
if(mode==='--preserved'){const p=preserved();for(const l of p.out)console.log(l);for(const l of p.bad)console.log(l);process.exit(p.bad.length?1:0);}
else if(mode==='--write'||mode==='--check'){
 const n=Number(arg(mode)),file=path.join(CC,'v1',`RUNTIME_FREEZE_V1CORE_${n}.json`);if(!Number.isInteger(n)||n<1){console.error('freeze number');process.exit(2);}
 const p=preserved();if(p.bad.length){for(const l of p.bad)console.error(l);process.exit(1);}
 const files=filesOf();
 if(mode==='--write'){
  const commit=arg('--commit');if(!/^[0-9a-f]{7,40}$/.test(commit??'')){console.error('--commit <sha>');process.exit(2);}
  if(git('rev-parse',commit)!==git('rev-parse','HEAD')){console.error('the commit bound must be HEAD');process.exit(2);}
  if(git('status','--porcelain','--',...Object.keys(files)).length){console.error('the bound files must be committed');process.exit(2);}
  const rec={revision:`COACHINGCORE-V1-CORE-SAFETY-FREEZE-${n}`,mission:'V1 Core Safety & Lifecycle closure and closure-2 (Founder, 2026-11-18)',scope:'synthetic candidate; no real athlete; cross-runtime readiness pending the physical Mac/iPhone revalidation',
   commit:git('rev-parse',commit),base:git('rev-parse',BASE),additiveTo:PRIOR.map(f=>({record:f,sha256:sha(f)})),entryPoint:'CoachingCore/src/v1-safety-index.mjs (V1_CORE_ENGINE)',
   amended:AMENDED.map(f=>({file:f,base:blobSha(BASE,f),now:sha(f)})),preserved:p.out,note:arg('--note')??null,files,fileCount:Object.keys(files).length,filesDigest:digest(files)};
  fs.writeFileSync(file,JSON.stringify(rec,null,1)+'\n');console.log('wrote '+path.relative(ROOT,file));
 }else{
  if(!fs.existsSync(file)){console.error('no record');process.exit(1);}
  const rec=JSON.parse(fs.readFileSync(file,'utf8')),drift=Object.entries(rec.files).filter(([f,h])=>!fs.existsSync(path.join(ROOT,f))||sha(f)!==h).map(([f])=>f),extra=Object.keys(files).filter(f=>!(f in rec.files));
  if(drift.length||extra.length||rec.filesDigest!==digest(rec.files)){console.error('DRIFT: '+[...drift,...extra.map(f=>'new '+f)].join(', '));process.exit(1);}
  console.log(`${rec.revision}: ${rec.fileCount}/${rec.fileCount} files byte-identical; earlier freezes preserved`);
 }
}else{console.error('usage: --preserved | --write <n> --commit <sha> | --check <n>');process.exit(2);}
