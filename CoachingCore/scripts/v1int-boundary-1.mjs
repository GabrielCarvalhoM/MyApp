// V1 CoachingCore Integration Boundary (Founder mission of 2026-11-23): the verifier of V1INT-BOUNDARY-SUCCESSOR-1, the successor record of the one
// boundary file COACHINGCORE-V1-FREEZE-1 binds that this line amends (src/boundary/custody.mjs, reconcile/evolves only), with the files this line
// adds. It is a boundary record, synthetic use only: no engine file changes, and it is no sporting or safety freeze of the engine.
// Approved after the R2 rechecks: SEC_INT_R2 (PASS_WITH_CONDITIONS: synthetic only, SEC-INT-02R named open, the amended file declared with its
// base and new hashes) and QRE_INT_R2 (READY_WITH_CONDITIONS: successor once C-R2-1 is met; met, evidence/c-r2-1-mutants.json).
// scripts/v1core-freeze-7.mjs stays the verifier of FREEZE-7: on this line its --check names this line's files, by design.
//   node scripts/v1int-boundary-1.mjs --write --commit <sha> | --check
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..','..');
const BASE='e44d855',RECORD='CoachingCore/v1/BOUNDARY_SUCCESSOR_V1INT_1.json',REVISION='V1INT-BOUNDARY-SUCCESSOR-1',FREEZE7='CoachingCore/v1/RUNTIME_FREEZE_V1CORE_7.json';
const AMENDED=['CoachingCore/src/boundary/custody.mjs'];
const ADDED=['CoachingCore/src/boundary/integration.mjs','CoachingCore/src/boundary/admission.mjs','CoachingCore/scripts/v1int-boundary-1.mjs',
 ...['helpers.mjs','custody.test.mjs','authorship.test.mjs','limits.test.mjs','journeys.test.mjs','cycle1.test.mjs','successor.test.mjs'].map(f=>'CoachingCore/test/v1int-'+f)];
const sha=f=>createHash('sha256').update(fs.readFileSync(path.join(ROOT,f))).digest('hex');
const git=(...a)=>execFileSync('git',a,{cwd:ROOT,encoding:'utf8'});
const blobSha=(rev,f)=>createHash('sha256').update(execFileSync('git',['show',`${rev}:${f}`],{cwd:ROOT})).digest();
const hex=b=>Buffer.from(b).toString('hex');
function checks(){
 const out=[],bad=[];
 const f7=JSON.parse(fs.readFileSync(path.join(ROOT,FREEZE7),'utf8')),files7=Object.entries(f7.files),same7=files7.filter(([f,h])=>fs.existsSync(path.join(ROOT,f))&&sha(f)===h).length;
 (same7===files7.length?out:bad).push(`COACHINGCORE-V1-CORE-SAFETY-FREEZE-7: ${same7}/${files7.length} bound files byte-identical (direct hash)`);
 for(const f of AMENDED){const base=hex(blobSha(BASE,f)),now=sha(f);(base!==now?out:bad).push(`${f}: amended (base ${base.slice(0,12)}, now ${now.slice(0,12)})`);}
 const changed=git('diff','--name-only',BASE,'--','CoachingCore').split('\n').filter(Boolean),undeclared=changed.filter(f=>!AMENDED.includes(f)&&!ADDED.includes(f)&&f!==RECORD);
 (undeclared.length?bad:out).push(undeclared.length?'CHANGED and not declared: '+undeclared.join(', '):`nothing else changed in CoachingCore since ${BASE} (${changed.length} files)`);
 const untracked=git('ls-files','--others','--exclude-standard','--','CoachingCore').split('\n').filter(Boolean);
 (untracked.length?bad:out).push(untracked.length?'UNTRACKED: '+untracked.join(', '):'no untracked file in CoachingCore');
 return {out,bad};
}
const mode=process.argv[2],arg=k=>{const i=process.argv.indexOf(k);return i>0?process.argv[i+1]:null;};
if(mode==='--write'||mode==='--check'){
 const c=checks();if(c.bad.length){for(const l of c.bad)console.error(l);process.exit(1);}
 const list=[...AMENDED,...ADDED].sort(),files=Object.fromEntries(list.map(f=>[f,sha(f)]));
 if(mode==='--write'){
  const commit=arg('--commit');if(!commit)throw new Error('--commit <sha> is required');
  const rec={revision:REVISION,mission:'CoachingCore Integration Boundary & Custody Foundation (Founder, 2026-11-23): C-F01-2 custody, SEC-CORE-03 authorship, C-NCC-3 formats and time, SEC-O1-03 boundary limits',
   scope:'synthetic use only; no real athlete; a boundary record, not a freeze of the engine (no engine file changed); cross-runtime and native parts pending the Mac/iPhone run (IOS_REVALIDATION_PENDING)',
   commit,base:BASE,successorOf:{record:'COACHINGCORE-V1-FREEZE-1',file:'CoachingCore/src/boundary/custody.mjs',relation:'reconcile also admits the engine\'s two in-place shapes of the row in force by this review\'s own reports (evolves); nothing else in the file changes'},
   amended:AMENDED.map(f=>({file:f,base:hex(blobSha(BASE,f)),now:sha(f)})),preserved:c.out,
   reviews:{security:['SEC_INT_R1 PASS_WITH_CONDITIONS','SEC_INT_R2 PASS_WITH_CONDITIONS (successor: synthetic only, SEC-INT-02R open)'],qre:['QRE_INT_R1 NOT_READY','QRE_INT_R2 READY_WITH_CONDITIONS (successor once C-R2-1 met: met)'],ssctr:['SSCTR_INT_R1 ACCEPT_WITH_CONDITIONS','SSCTR_INT_R2 ACCEPT_WITH_CONDITIONS']},
   open:['SEC-INT-02R (evolves: six forged merge/kept-voice shapes only a misbehaving engine produces; owner Engineering + QRE; before any real athlete or any change to the r6-provenance merge or kept-voice code)',
    'QRE-INT-02 (engine: a report fact kept for a report an ASK did not record withholds the re-sent run from pace evidence; Core + SSCTR + Founder; before real athletes see pace readings)',
    'SEC-INT-04 (clock ahead: trusted time, Founder D1; erasure under a behind clock: Engineering)','SEC-INT-05 rest (intake anchors closed to known keys: Core)','SEC-INT-06','SEC-INT-07','SEC-INT-08 rest (G07)','SEC-INT-12','SSCTR-INT-R2-01','C-R2-2 records',
    'native obligations (contract section 9)','IOS_REVALIDATION_PENDING'],
   files,fileCount:list.length,filesDigest:createHash('sha256').update(JSON.stringify(files)).digest('hex')};
  fs.writeFileSync(path.join(ROOT,RECORD),JSON.stringify(rec,null,1)+'\n');console.log(`${REVISION}: written, ${list.length} files bound`);
 }else{
  if(!fs.existsSync(path.join(ROOT,RECORD))){console.error('no record');process.exit(1);}
  const rec=JSON.parse(fs.readFileSync(path.join(ROOT,RECORD),'utf8')),diff=Object.entries(rec.files).filter(([f,h])=>!fs.existsSync(path.join(ROOT,f))||sha(f)!==h).map(([f])=>f);
  if(diff.length){console.error('NOT byte-identical: '+diff.join(', '));process.exit(1);}
  for(const l of c.out)console.log(l);console.log(`${REVISION}: ${rec.fileCount}/${rec.fileCount} files byte-identical; FREEZE-7 preserved; the one amended file declared`);
 }
}else{console.error('usage: --write --commit <sha> | --check');process.exit(2);}
