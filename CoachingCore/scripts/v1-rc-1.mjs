// REPMILE V1 CoachingCore blocker closure (Founder mission of 2026-11-24): the verifier of REPMILE-COACHINGCORE-V1-RC-1, the release candidate.
// It is the single successor record of this line (mission section 14). It is not the FINAL RELEASE FREEZE, which waits for the physical validation
// on the Mac and iPhone. Synthetic use only.
// It binds what the app consumes: every file under CoachingCore/src and every data file the runtime reads by URL. It declares, against ee256ae,
// the seven amended files and the records that bound them, and checks the rest:
// - FREEZE-7's other bound files are byte-identical;
// - V1INT-BOUNDARY-SUCCESSOR-1's other files are byte-identical;
// - nothing else in CoachingCore changed since the base;
// - no file is untracked.
// scripts/v1core-freeze-7.mjs and scripts/v1int-boundary-1.mjs stay the verifiers of their records. On this line their --check names this line's
// files, by design.
//   node scripts/v1-rc-1.mjs --write --commit <sha> | --check
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..','..');
const BASE='ee256ae',RECORD='CoachingCore/v1/RELEASE_CANDIDATE_V1_RC_1.json',REVISION='REPMILE-COACHINGCORE-V1-RC-1';
const FREEZE7='CoachingCore/v1/RUNTIME_FREEZE_V1CORE_7.json',V1INT='CoachingCore/v1/BOUNDARY_SUCCESSOR_V1INT_1.json';
/** The amended files, what each changes, and the earlier records that bind it (their bytes stay as recorded; only this record moves on). */
const AMENDED={
 'CoachingCore/src/r6-adaptation.mjs':{findings:['C-O1-3'],change:'kindOf: a flagged row any of whose voices states ADVERSE or IMPAIRED reads ADVERSE',boundBy:['COACHINGCORE-V1-FREEZE-1','COACHINGCORE-V1-CORE-SAFETY-FREEZE-1','COACHINGCORE-V1-RUN-FORMAT-FREEZE-2','COACHINGCORE-V1-STRENGTH-FREEZE-1']},
 'CoachingCore/src/r6-provenance.mjs':{findings:['SEC-SC-02'],change:'partOf keeps the report\'s own observedAt',boundBy:['COACHINGCORE-V1-FREEZE-1','COACHINGCORE-V1-CORE-SAFETY-FREEZE-7']},
 'CoachingCore/src/v1-f08.mjs':{findings:['SEC-SC-02','SEC-SC-03'],change:'restartIntake: each voice dated by its own instant (saidAfter); a stop after the latest declaration or on the restart day gives a 0-week pause',boundBy:['COACHINGCORE-V1-FREEZE-1','COACHINGCORE-V1-CORE-SAFETY-FREEZE-7']},
 'CoachingCore/src/v1-run-format-index.mjs':{findings:['QRE-INT-02'],change:'evaluateProgram: a report the decision neither recorded nor refused keeps only its stop in the record of formats',boundBy:['COACHINGCORE-V1-CORE-SAFETY-FREEZE-1','COACHINGCORE-V1-RUN-FORMAT-FREEZE-2','COACHINGCORE-V1-RACE-FORECAST-FREEZE-1']},
 'CoachingCore/src/boundary/custody.mjs':{findings:['SEC-INT-02R'],change:'evolves: a new voice is its report whole; a merge keeps completion and every stated response; a kept voice\'s label is one the engine writes',boundBy:['COACHINGCORE-V1-FREEZE-1','V1INT-BOUNDARY-SUCCESSOR-1']},
 'CoachingCore/src/boundary/integration.mjs':{findings:['SEC-INT-06','SEC-INT-07','SEC-INT-04 rest','SSCTR-INT-R2-01','G07'],change:'admission: no report before the record began; a safety signal past a limit (at most 3 more); erasure under a behind clock; the duplicate answer carries the stored screen; erasure erases the stored screen',boundBy:['V1INT-BOUNDARY-SUCCESSOR-1']},
 'CoachingCore/src/boundary/admission.mjs':{findings:['SEC-INT-07'],change:'LIMITS.safetyExcess 3; statesSafetySignal',boundBy:['V1INT-BOUNDARY-SUCCESSOR-1']},
};
const ADDED=['CoachingCore/scripts/v1-rc-1.mjs','CoachingCore/test/v1bc-blocker-closure.test.mjs','CoachingCore/test/v1bc-rc-record.test.mjs'];
const sha=f=>createHash('sha256').update(fs.readFileSync(path.join(ROOT,f))).digest('hex');
const git=(...a)=>execFileSync('git',a,{cwd:ROOT,encoding:'utf8'});
const blobSha=(rev,f)=>createHash('sha256').update(execFileSync('git',['show',`${rev}:${f}`],{cwd:ROOT})).digest('hex');
const walk=d=>fs.readdirSync(path.join(ROOT,d),{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(d+'/'+e.name):[d+'/'+e.name]);
/** What the app consumes: the runtime sources and the data files they read by URL (relative to the file that reads them). */
function consumed(){
 const src=walk('CoachingCore/src').filter(f=>f.endsWith('.mjs')).sort(),data=new Set();
 for(const f of src)for(const m of fs.readFileSync(path.join(ROOT,f),'utf8').matchAll(/new URL\('([^']+)',import\.meta\.url\)/g))data.add(path.posix.normalize(path.posix.join(path.posix.dirname(f),m[1])));
 return [...src,...[...data].sort()];
}
function checks(){
 const out=[],bad=[],amended=Object.keys(AMENDED);
 const f7=JSON.parse(fs.readFileSync(path.join(ROOT,FREEZE7),'utf8')),files7=Object.entries(f7.files),other7=files7.filter(([f])=>!amended.includes(f)),same7=other7.filter(([f,h])=>fs.existsSync(path.join(ROOT,f))&&sha(f)===h).length;
 (same7===other7.length?out:bad).push(`COACHINGCORE-V1-CORE-SAFETY-FREEZE-7: ${same7}/${other7.length} of its other bound files byte-identical; ${files7.length-other7.length} declared amendments`);
 const vi=JSON.parse(fs.readFileSync(path.join(ROOT,V1INT),'utf8')),filesI=Object.entries(vi.files),otherI=filesI.filter(([f])=>!amended.includes(f)),sameI=otherI.filter(([f,h])=>fs.existsSync(path.join(ROOT,f))&&sha(f)===h).length;
 (sameI===otherI.length?out:bad).push(`V1INT-BOUNDARY-SUCCESSOR-1: ${sameI}/${otherI.length} of its other files byte-identical; ${filesI.length-otherI.length} declared amendments`);
 for(const f of amended){const base=blobSha(BASE,f),now=sha(f);(base!==now?out:bad).push(`${f}: amended (base ${base.slice(0,12)}, now ${now.slice(0,12)}) for ${AMENDED[f].findings.join(', ')}`);}
 const changed=git('diff','--name-only',BASE,'--','CoachingCore').split('\n').filter(Boolean),undeclared=changed.filter(f=>!amended.includes(f)&&!ADDED.includes(f)&&f!==RECORD);
 (undeclared.length?bad:out).push(undeclared.length?'CHANGED and not declared: '+undeclared.join(', '):`nothing else changed in CoachingCore since ${BASE} (${changed.length} files)`);
 const untracked=git('ls-files','--others','--exclude-standard','--','CoachingCore').split('\n').filter(Boolean);
 (untracked.length?bad:out).push(untracked.length?'UNTRACKED: '+untracked.join(', '):'no untracked file in CoachingCore');
 const missing=consumed().filter(f=>!fs.existsSync(path.join(ROOT,f)));(missing.length?bad:out).push(missing.length?'MISSING data: '+missing.join(', '):`every file the runtime reads is present (${consumed().length})`);
 return {out,bad};
}
const mode=process.argv[2],arg=k=>{const i=process.argv.indexOf(k);return i>0?process.argv[i+1]:null;};
if(mode==='--write'||mode==='--check'){
 const c=checks();if(c.bad.length){for(const l of c.bad)console.error(l);process.exit(1);}
 if(mode==='--write'){
  const commit=arg('--commit');if(!commit)throw new Error('--commit <sha> is required');
  const list=consumed(),files=Object.fromEntries(list.map(f=>[f,sha(f)])),pkg=JSON.parse(fs.readFileSync(path.join(ROOT,'CoachingCore/package.json'),'utf8'));
  const rec={revision:REVISION,mission:'REPMILE V1 COACHINGCORE BLOCKER CLOSURE (Founder, 2026-11-24)',
   scope:'release candidate for the physical validation on the Mac and iPhone; synthetic use only; not the FINAL RELEASE FREEZE; no real athlete before the native and security gates (NATIVE_OBLIGATIONS.md)',
   commit,base:BASE,package:{name:pkg.name,version:pkg.version},
   entryPoints:{engine:'CoachingCore/src/v1-safety-index.mjs',boundary:'CoachingCore/src/boundary/integration.mjs (createIntegration) under CoachingCore/src/boundary/api.mjs (createBoundary)'},
   amended:Object.entries(AMENDED).map(([file,a])=>({file,base:blobSha(BASE,file),now:sha(file),...a})),added:ADDED,preserved:c.out,
   records:{inventory:'audits/v1-blocker-closure-2026-11-24/V1_BLOCKER_INVENTORY.md',report:'audits/v1-blocker-closure-2026-11-24/FINAL_REPORT.md',native:'audits/v1-blocker-closure-2026-11-24/NATIVE_OBLIGATIONS.md'},
   files,fileCount:list.length,filesDigest:createHash('sha256').update(JSON.stringify(files)).digest('hex')};
  fs.writeFileSync(path.join(ROOT,RECORD),JSON.stringify(rec,null,1)+'\n');console.log(`${REVISION}: written, ${list.length} files bound`);
 }else{
  if(!fs.existsSync(path.join(ROOT,RECORD))){console.error('no record');process.exit(1);}
  const rec=JSON.parse(fs.readFileSync(path.join(ROOT,RECORD),'utf8')),diff=Object.entries(rec.files).filter(([f,h])=>!fs.existsSync(path.join(ROOT,f))||sha(f)!==h).map(([f])=>f);
  const extra=consumed().filter(f=>!Object.hasOwn(rec.files,f));
  if(diff.length||extra.length){console.error((diff.length?'NOT byte-identical: '+diff.join(', '):'')+(extra.length?' NOT BOUND: '+extra.join(', '):''));process.exit(1);}
  for(const l of c.out)console.log(l);console.log(`${REVISION}: ${rec.fileCount}/${rec.fileCount} consumed files byte-identical; the seven amendments declared`);
 }
}else{console.error('usage: --write --commit <sha> | --check');process.exit(2);}
