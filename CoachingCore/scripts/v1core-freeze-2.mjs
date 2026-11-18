// CoachingCore V1 Core Safety, CORE-C2-F01 restart sizing fix (Founder mission of 2026-11-18): the additive successor freeze record
// COACHINGCORE-V1-CORE-SAFETY-FREEZE-2 (v1/RUNTIME_FREEZE_V1CORE_2.json). Nothing earlier is edited to accept it. `scripts/v1core-freeze.mjs`
// stays the verifier of FREEZE-1 and is not run with n=2: on this line its own preservation step names src/v1-f08.mjs and this script, by
// design, as COACHINGCORE-V1-CORE-SAFETY-FREEZE-1's base (16577b6) does not hold them. This verifier binds one commit:
//   (i)   the six earlier freeze records are the bytes the base commit (d92aa88, closure-2's last) holds;
//   (ii)  every file COACHINGCORE-V1-CORE-SAFETY-FREEZE-1 binds is the hash that record states (47/47: the fix touches none of them);
//   (iii) every tracked file of CoachingCore is the base bytes, except the one file this line amends and the files it adds, each declared;
//   (iv)  no untracked file sits anywhere in CoachingCore (QRE-F01-05: not only source, values, tests and scripts);
//   (v)   (--write / --check) the amended and added files, each by hash; the reviews the freeze rests on, the candidate record, the evidence
//         and the successor ledger (QRE-F01-05 (b)). --write refuses unless every required review is committed (QRE-F01-05 (a)); --check
//         also re-reads the record's own fields: the base, the earlier records' hashes, the amended file's hashes, the commit (an ancestor of HEAD).
//   node scripts/v1core-freeze-2.mjs --preserved                              (i) to (iv) on the tree here
//   node scripts/v1core-freeze-2.mjs --write --commit <sha> [--note "..."]    writes v1/RUNTIME_FREEZE_V1CORE_2.json (only this file)
//   node scripts/v1core-freeze-2.mjs --check                                  recomputes and compares; exit 1 on drift
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
const BASE='d92aa88',RECORD='CoachingCore/v1/RUNTIME_FREEZE_V1CORE_2.json',CORE1='CoachingCore/v1/RUNTIME_FREEZE_V1CORE_1.json';
const PRIOR=['CoachingCore/v1/RUNTIME_FREEZE_V1_1.json','CoachingCore/v1/RUNTIME_FREEZE_V1RC_1.json','CoachingCore/v1/RUNTIME_FREEZE_V1RWS_2.json','CoachingCore/v1/RUNTIME_FREEZE_V1RFC_1.json','CoachingCore/v1/RUNTIME_FREEZE_V1STR_1.json',CORE1];
/** The one file of CoachingCore this line amends (it existed at the base). */
const AMENDED=['CoachingCore/src/v1-f08.mjs'];
/** The files this line adds (the record itself excluded). */
const ADDED=['CoachingCore/test/v1core-c2f01-restart-sizing.test.mjs','CoachingCore/test/v1core-c2f01-freeze.test.mjs','CoachingCore/scripts/v1core-freeze-2.mjs'];
/** The reviews this freeze rests on, bound by hash (read, never edited). */
const AUDIT='audits/v1-core-c2-f01-2026-11-18',REVIEWS_DIR=[AUDIT+'/reviews',AUDIT+'/evidence'],RECORDS=[AUDIT+'/CANDIDATE.md',AUDIT+'/CYCLE1.md',AUDIT+'/F01_SUCCESSOR_LEDGER.json'];
/** The reviews a write requires, committed (QRE-F01-05 (a)). */
const REQUIRED=[AUDIT+'/reviews/qre/QRE_F01_R1.md',AUDIT+'/reviews/ssctr/SSCTR_F01_R1.md',AUDIT+'/reviews/ssctr/SSCTR_F01_R1.json'];

function preserved(){
 const out=[],bad=[];
 for(const f of PRIOR){const now=sha(f),then=blobSha(BASE,f);(now===then?out:bad).push(`${f}: ${now===then?'the base bytes':'CHANGED'}`);}
 // (ii) FREEZE-1's own bound files, by the hashes it states.
 const one=JSON.parse(fs.readFileSync(path.join(ROOT,CORE1),'utf8')),drift=Object.entries(one.files).filter(([f,h])=>!fs.existsSync(path.join(ROOT,f))||sha(f)!==h).map(([f])=>f);
 (drift.length?bad:out).push(`${one.revision}: ${Object.keys(one.files).length-drift.length}/${Object.keys(one.files).length} bound files byte-identical${drift.length?'; DRIFT: '+drift.join(', '):''}`);
 // Every file an earlier record binds: the base bytes, or declared amended here.
 for(const f of PRIOR.slice(0,5)){const rec=JSON.parse(fs.readFileSync(path.join(ROOT,f),'utf8')),files=Object.keys(rec.files);let same=0,declared=0;const other=[];
  for(const p of files){if(!fs.existsSync(path.join(ROOT,p))){other.push(p+' (missing)');continue;}const s=sha(p);if(s===blobSha(BASE,p))same++;else if(AMENDED.includes(p))declared++;else other.push(p);}
  (other.length?bad:out).push(`${rec.revision??f}: ${same}/${files.length} files the base bytes, ${declared} amended by this line${other.length?'; NOT preserved: '+other.join(', '):''}`);}
 // (iii) every tracked file of CoachingCore against the base.
 const changed=git('diff','--name-only',BASE,'--','CoachingCore').split('\n').filter(Boolean);
 const undeclared=changed.filter(f=>!AMENDED.includes(f)&&!ADDED.includes(f)&&f!==RECORD);
 (undeclared.length?bad:out).push(undeclared.length?'CHANGED and not declared: '+undeclared.join(', '):`nothing else changed since ${BASE} (${changed.length} files: ${AMENDED.filter(f=>changed.includes(f)).length} amended, the rest added by this line)`);
 for(const f of AMENDED)if(!blobSha(BASE,f))bad.push(f+': NOT a file of the base');
 // (iv) no untracked file in source, values, tests or scripts.
 const untracked=git('ls-files','--others','--exclude-standard','--','CoachingCore',AUDIT).split('\n').filter(Boolean);
 (untracked.length?bad:out).push(untracked.length?'UNTRACKED: '+untracked.join(', '):'no untracked file in CoachingCore or '+AUDIT);
 return {out,bad};
}
function filesOf(){
 const list=[...AMENDED,...ADDED,CORE1,...RECORDS,...REVIEWS_DIR.flatMap(d=>git('ls-files','--',d).split('\n').filter(Boolean))].sort();
 return Object.fromEntries(list.map(f=>[f,sha(f)]));
}
const mode=process.argv[2],file=path.join(ROOT,RECORD);
if(mode==='--preserved'){const p=preserved();for(const l of p.out)console.log(l);for(const l of p.bad)console.log(l);process.exit(p.bad.length?1:0);}
else if(mode==='--write'||mode==='--check'){
 const p=preserved();if(p.bad.length){for(const l of p.bad)console.error(l);process.exit(1);}
 const files=filesOf();
 if(mode==='--write'){
  const commit=arg('--commit');if(!/^[0-9a-f]{7,40}$/.test(commit??'')){console.error('--commit <sha>');process.exit(2);}
  if(git('rev-parse',commit)!==git('rev-parse','HEAD')){console.error('the commit bound must be HEAD');process.exit(2);}
  const absent=REQUIRED.filter(f=>!(f in files)||!git('ls-files','--',f));if(absent.length){console.error('required reviews not committed: '+absent.join(', '));process.exit(2);}
  if(git('status','--porcelain','--',...Object.keys(files)).length){console.error('the bound files must be committed');process.exit(2);}
  const rec={revision:'COACHINGCORE-V1-CORE-SAFETY-FREEZE-2',mission:'CORE-C2-F01 restart sizing fix (Founder, 2026-11-18)',scope:'synthetic candidate; no real athlete; cross-runtime readiness pending the physical Mac/iPhone revalidation',
   commit:git('rev-parse',commit),base:git('rev-parse',BASE),additiveTo:PRIOR.map(f=>({record:f,sha256:sha(f)})),entryPoint:'CoachingCore/src/v1-safety-index.mjs (V1_CORE_ENGINE)',
   amended:AMENDED.map(f=>({file:f,base:blobSha(BASE,f),now:sha(f)})),preserved:p.out,note:arg('--note')??null,files,fileCount:Object.keys(files).length,filesDigest:digest(files)};
  fs.writeFileSync(file,JSON.stringify(rec,null,1)+'\n');console.log('wrote '+RECORD);
 }else{
  if(!fs.existsSync(file)){console.error('no record');process.exit(1);}
  const rec=JSON.parse(fs.readFileSync(file,'utf8')),drift=Object.entries(rec.files).filter(([f,h])=>!fs.existsSync(path.join(ROOT,f))||sha(f)!==h).map(([f])=>f),extra=Object.keys(files).filter(f=>!(f in rec.files));
  if(drift.length||extra.length||rec.filesDigest!==digest(rec.files)){console.error('DRIFT: '+[...drift,...extra.map(f=>'new '+f)].join(', '));process.exit(1);}
  const ancestor=(()=>{try{execFileSync('git',['merge-base','--is-ancestor',rec.commit,'HEAD'],{cwd:ROOT});return true;}catch{return false;}})();
  const meta=[rec.revision==='COACHINGCORE-V1-CORE-SAFETY-FREEZE-2'||'revision',rec.base===git('rev-parse',BASE)||'base',ancestor||'commit not an ancestor of HEAD',
   JSON.stringify(rec.additiveTo)===JSON.stringify(PRIOR.map(f=>({record:f,sha256:sha(f)})))||'additiveTo',JSON.stringify(rec.amended)===JSON.stringify(AMENDED.map(f=>({file:f,base:blobSha(BASE,f),now:sha(f)})))||'amended',
   REQUIRED.every(f=>f in rec.files)||'required reviews'].filter(x=>x!==true);
  if(meta.length){console.error('RECORD FIELDS: '+meta.join(', '));process.exit(1);}
  console.log(`${rec.revision}: ${rec.fileCount}/${rec.fileCount} files byte-identical; earlier freezes preserved`);
 }
}else{console.error('usage: --preserved | --write --commit <sha> | --check');process.exit(2);}
