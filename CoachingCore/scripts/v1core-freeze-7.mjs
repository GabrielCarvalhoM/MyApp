// CoachingCore V1 Safety Continuity & Execution Occurrence Closure, SEC-O1-01b/c + C-O1-2 (P0), SEC-O1-02/QRE-O1-02 + SEC-O1-03 (P1) (Founder mission of
// 2026-11-20): the additive successor freeze record COACHINGCORE-V1-CORE-SAFETY-FREEZE-7 (v1/RUNTIME_FREEZE_V1CORE_7.json). Nothing earlier is edited.
// scripts/v1core-freeze-6.mjs stays the verifier of FREEZE-6: on this line its --check and --preserved name this line's files, by design. Same
// checks as that verifier (see its header), with base 48e428f (FREEZE-6's line), the eleven earlier records, and two amended files.
//   node scripts/v1core-freeze-7.mjs --preserved | --write --commit <sha> [--note "..."] | --check
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
const BASE='48e428f',REVISION='COACHINGCORE-V1-CORE-SAFETY-FREEZE-7',RECORD='CoachingCore/v1/RUNTIME_FREEZE_V1CORE_7.json';
const CORE1='CoachingCore/v1/RUNTIME_FREEZE_V1CORE_1.json',CORE2='CoachingCore/v1/RUNTIME_FREEZE_V1CORE_2.json',CORE3='CoachingCore/v1/RUNTIME_FREEZE_V1CORE_3.json',CORE4='CoachingCore/v1/RUNTIME_FREEZE_V1CORE_4.json',CORE5='CoachingCore/v1/RUNTIME_FREEZE_V1CORE_5.json',CORE6='CoachingCore/v1/RUNTIME_FREEZE_V1CORE_6.json';
const PRIOR=['CoachingCore/v1/RUNTIME_FREEZE_V1_1.json','CoachingCore/v1/RUNTIME_FREEZE_V1RC_1.json','CoachingCore/v1/RUNTIME_FREEZE_V1RWS_2.json','CoachingCore/v1/RUNTIME_FREEZE_V1RFC_1.json','CoachingCore/v1/RUNTIME_FREEZE_V1STR_1.json',CORE1,CORE2,CORE3,CORE4,CORE5,CORE6];
/** The one file of CoachingCore this line amends (it existed at the base). */
const AMENDED=['CoachingCore/src/r6-provenance.mjs','CoachingCore/src/v1-f08.mjs'];
/** The files this line adds (the record itself excluded). */
const ADDED=['CoachingCore/test/v1core-sc-safety-continuity.test.mjs','CoachingCore/test/v1core-sc-successors.test.mjs','CoachingCore/test/v1core-sc-freeze.test.mjs','CoachingCore/scripts/v1core-freeze-7.mjs'];
const AUDIT='audits/v1-core-sc-2026-11-20',DIRS=[AUDIT+'/reviews',AUDIT+'/evidence',AUDIT+'/bench'],RECORDS=[AUDIT+'/CANDIDATE.md',AUDIT+'/SUCCESSOR_LEDGER.json'],OPTIONAL=[AUDIT+'/CYCLE1.md'];
const REQUIRED=[AUDIT+'/reviews/ssctr',AUDIT+'/reviews/security',AUDIT+'/reviews/qre'];

function preserved(){
 const out=[],bad=[];
 for(const f of PRIOR){const now=sha(f),then=blobSha(BASE,f);(now===then?out:bad).push(`${f}: ${now===then?'the base bytes':'CHANGED'}`);}
 // (ii) FREEZE-1's to FREEZE-4's own bound files, by the hashes they state: unchanged, or a file declared amended here.
 const byFreeze4=Object.fromEntries(JSON.parse(fs.readFileSync(path.join(ROOT,CORE4),'utf8')).amended.map(a=>[a.file,a.now]));
 for(const f of [CORE1,CORE2,CORE3,CORE4,CORE5,CORE6]){const rec=JSON.parse(fs.readFileSync(path.join(ROOT,f),'utf8')),all=Object.entries(rec.files);
  const drift=all.filter(([p,h])=>!fs.existsSync(path.join(ROOT,p))||sha(p)!==h),mine=drift.filter(([p])=>AMENDED.includes(p)),earlier=drift.filter(([p])=>!AMENDED.includes(p)&&f!==CORE4&&fs.existsSync(path.join(ROOT,p))&&byFreeze4[p]===sha(p));
  const other=drift.filter(x=>!mine.includes(x)&&!earlier.includes(x)).map(([p])=>p);
  (other.length?bad:out).push(`${rec.revision}: ${all.length-drift.length}/${all.length} bound files byte-identical, ${mine.length} amended by this line${earlier.length?', '+earlier.length+' amended by FREEZE-4 (its bytes)':''}${other.length?'; DRIFT: '+other.join(', '):''}`);}
 // Every file an earlier record binds: the base bytes, or declared amended here.
 for(const f of PRIOR.slice(0,5)){const rec=JSON.parse(fs.readFileSync(path.join(ROOT,f),'utf8')),files=Object.keys(rec.files);let same=0,declared=0;const other=[];
  for(const p of files){if(!fs.existsSync(path.join(ROOT,p))){other.push(p+' (missing)');continue;}const s=sha(p);if(s===blobSha(BASE,p))same++;else if(AMENDED.includes(p))declared++;else other.push(p);}
  (other.length?bad:out).push(`${rec.revision??f}: ${same}/${files.length} files the base bytes, ${declared} amended by this line${other.length?'; NOT preserved: '+other.join(', '):''}`);}
 // (iii) every tracked file of CoachingCore against the base, the working tree included.
 const changed=git('diff','--name-only',BASE,'--','CoachingCore').split('\n').filter(Boolean);
 const undeclared=changed.filter(f=>!AMENDED.includes(f)&&!ADDED.includes(f)&&f!==RECORD);
 (undeclared.length?bad:out).push(undeclared.length?'CHANGED and not declared: '+undeclared.join(', '):`nothing else changed since ${BASE} (${changed.length} files: ${AMENDED.filter(f=>changed.includes(f)).length} amended, the rest added by this line)`);
 for(const f of AMENDED)if(!blobSha(BASE,f))bad.push(f+': NOT a file of the base');
 // (iv) no untracked file.
 const untracked=git('ls-files','--others','--exclude-standard','--','CoachingCore',AUDIT).split('\n').filter(Boolean);
 (untracked.length?bad:out).push(untracked.length?'UNTRACKED: '+untracked.join(', '):'no untracked file in CoachingCore or '+AUDIT);
 return {out,bad};
}
function filesOf(){
 const list=[...AMENDED,...ADDED,CORE1,CORE2,CORE3,CORE4,CORE5,CORE6,...[...RECORDS,...OPTIONAL].filter(f=>fs.existsSync(path.join(ROOT,f))),...DIRS.flatMap(d=>git('ls-files','--',d).split('\n').filter(Boolean))].sort();
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
  const absent=REQUIRED.filter(d=>!Object.keys(files).some(f=>f.startsWith(d+'/')));if(absent.length){console.error('required reviews not committed: '+absent.join(', '));process.exit(2);}
  if(RECORDS.some(f=>!(f in files))){console.error('records missing: '+RECORDS.filter(f=>!(f in files)).join(', '));process.exit(2);}
  if(git('status','--porcelain','--',...Object.keys(files)).length){console.error('the bound files must be committed');process.exit(2);}
  const rec={revision:REVISION,mission:'Safety Continuity & Execution Occurrence Closure: SEC-O1-01b/c (a declared stop keeps SB-1 asking until a later declaration), C-O1-2 (occurrence of a disputed session every voice says took place, never its amount), SEC-O1-02/QRE-O1-02 (no phantom dispute), SEC-O1-03 (bounded kept voices) (Founder, 2026-11-20)',scope:'synthetic candidate; no real athlete; cross-runtime readiness pending the physical Mac/iPhone revalidation',
   commit:git('rev-parse',commit),base:git('rev-parse',BASE),additiveTo:PRIOR.map(f=>({record:f,sha256:sha(f)})),entryPoint:'CoachingCore/src/v1-safety-index.mjs (V1_CORE_ENGINE)',
   amended:AMENDED.map(f=>({file:f,base:blobSha(BASE,f),now:sha(f)})),preserved:p.out,note:arg('--note')??null,files,fileCount:Object.keys(files).length,filesDigest:digest(files)};
  fs.writeFileSync(file,JSON.stringify(rec,null,1)+'\n');console.log('wrote '+RECORD);
 }else{
  if(!fs.existsSync(file)){console.error('no record');process.exit(1);}
  const rec=JSON.parse(fs.readFileSync(file,'utf8')),drift=Object.entries(rec.files).filter(([f,h])=>!fs.existsSync(path.join(ROOT,f))||sha(f)!==h).map(([f])=>f),extra=Object.keys(files).filter(f=>!(f in rec.files));
  if(drift.length||extra.length||rec.filesDigest!==digest(rec.files)){console.error('DRIFT: '+[...drift,...extra.map(f=>'new '+f)].join(', '));process.exit(1);}
  const ancestor=(()=>{try{execFileSync('git',['merge-base','--is-ancestor',rec.commit,'HEAD'],{cwd:ROOT});return true;}catch{return false;}})();
  const meta=[rec.revision===REVISION||'revision',rec.base===git('rev-parse',BASE)||'base',ancestor||'commit not an ancestor of HEAD',
   JSON.stringify(rec.additiveTo)===JSON.stringify(PRIOR.map(f=>({record:f,sha256:sha(f)})))||'additiveTo',JSON.stringify(rec.amended)===JSON.stringify(AMENDED.map(f=>({file:f,base:blobSha(BASE,f),now:sha(f)})))||'amended',
   REQUIRED.every(d=>Object.keys(rec.files).some(f=>f.startsWith(d+'/')))||'required reviews'].filter(x=>x!==true);
  if(meta.length){console.error('RECORD FIELDS: '+meta.join(', '));process.exit(1);}
  console.log(`${rec.revision}: ${rec.fileCount}/${rec.fileCount} files byte-identical; earlier freezes preserved`);
 }
}else{console.error('usage: --preserved | --write --commit <sha> | --check');process.exit(2);}
