// REPMILE CoachingCore V1 five-zone Runna-parity amendment (Founder decision FOUNDER-HR5-RUNNA-PARITY-2026-11-25, mission V1HR5R): the verifier of
// REPMILE-COACHINGCORE-V1-FIVE-ZONE-AMENDMENT-2, the successor of REPMILE-COACHINGCORE-V1-FIVE-ZONE-AMENDMENT-1, versioned BESIDE both earlier
// records (it rewrites neither and is not a new freeze cycle). It binds, and --check proves:
// - the original freeze record (CoachingCore/v1/FINAL_RELEASE_FREEZE_V1.json) is byte-identical to its commit 6482749, and the first amendment's
//   record (CoachingCore/v1/FIVE_ZONE_AMENDMENT_V1.json) to its commit bec39c5;
// - of the files the first amendment binds, every one is byte-identical but the declared amended files, whose change from the bytes it binds is
//   exactly the recorded diff; src/v1-run-calibration.mjs (the run calibration, heartRateOf among it) is byte-identical to the bytes it binds;
// - the files the runtime now reads besides them (the profile module, the revision-2 values, the new enabling records) are present and bound,
//   and the two it no longer reads (the revision-1 values and records) are kept byte-identical as history;
// - nothing else in CoachingCore changed since the base 4850560 but the files this amendment declares; nothing untracked;
// - the AMENDED JavaScriptCore bundle (audits/v1-hr5-runna-parity-2026-11-25/native/ios, the bundle that ran on the Mac and the iPhone): its
//   sha256 is its manifest's, every CoachingCore module it lists is the bound source, and every bundled asset is the bound data file it copies;
// - the five-zone values are the pinned bytes, and the enabling state is the one recorded.
// Narrative fields come from audits/v1-hr5-runna-parity-2026-11-25/AMENDMENT_INPUTS.json.
//   node CoachingCore/scripts/v1-hr5-runna-amendment.mjs --write --commit <HEAD sha> | --check
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {fileURLToPath,pathToFileURL} from 'node:url';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..','..');
const REVISION='REPMILE-COACHINGCORE-V1-FIVE-ZONE-AMENDMENT-2',RECORD='CoachingCore/v1/HR5_RUNNA_AMENDMENT_V1.json';
const ORIGINAL={record:'CoachingCore/v1/FINAL_RELEASE_FREEZE_V1.json',recordCommit:'6482749',revision:'REPMILE-COACHINGCORE-V1-FINAL-RELEASE-FREEZE'};
const FIRST={record:'CoachingCore/v1/FIVE_ZONE_AMENDMENT_V1.json',recordCommit:'bec39c5',revision:'REPMILE-COACHINGCORE-V1-FIVE-ZONE-AMENDMENT-1'};
const BASE='4850560',MISSION='audits/v1-hr5-runna-parity-2026-11-25',INPUTS=MISSION+'/AMENDMENT_INPUTS.json',RES=MISSION+'/native/ios/Sources/P0Host/Resources';
const AMENDED={
 'CoachingCore/src/v1-heart-rate-zones.mjs':{change:'revision 2 (V1X-HR-FIVE-ZONE-2): zones of 65/81/89/97 % with exact whole-bpm limits; the reference order declared > lab > observed above the estimate > 220 - age; custom limits; measured values classified one by one; classifier defaults and optical series; walk/jog, restart and return keep the zones; applyHeartRateProfile resolves the reading with the athlete profile. Same exports and call signatures for the run calibration.'},
 'CoachingCore/src/v1-safety-index.mjs':{change:'the composed entry carries heartRateProfileRecord and heartRateProfileDeclared, takes heartRateProfile and heartRateProfileRecord off what the engine reads, appends the intake age and the athlete declaration, and resolves the five-zone reading with the profile; heartRateProfileReading for the integration. Every engine answer is otherwise unchanged.'},
 'CoachingCore/src/boundary/integration.mjs':{change:'heartRateProfileRecord is a carried record (sealed with the others); setHeartRateProfile records the athlete declaration and the re-resolved reading in one carried commit, with no engine call and no custody decision.'},
 'CoachingCore/src/boundary/api.mjs':{change:'setHeartRateProfile passes through to the integration custody (NOT_SUPPORTED over a bare custody).'},
 'CoachingCore/src/boundary/inventory.mjs':{change:'one inventory row: the heart-rate profile and the five-zone reading are HEALTH, egress NONE.'},
};
const AMENDED_TESTS={'CoachingCore/test/v1hr5-five-zones.test.mjs':'rewritten to revision 2: the behaviour kept keeps its tests; what the Founder decision changed is asserted anew'};
const ADDED_CONSUMED=['CoachingCore/src/v1-heart-rate-profile.mjs','CoachingCore/v1/HEART_RATE_FIVE_ZONE_V2.json',MISSION+'/reviews/ssctr/SSCTR_HR5R_RECORDS.json'];
const NO_LONGER_CONSUMED=['CoachingCore/v1/HEART_RATE_FIVE_ZONE_V1.json','audits/v1-five-zone-heart-rate-2026-11-25/reviews/ssctr/SSCTR_HR5_RECORDS.json'];
const ADDED=['CoachingCore/src/v1-heart-rate-profile.mjs','CoachingCore/v1/HEART_RATE_FIVE_ZONE_V2.json','CoachingCore/scripts/v1-hr5-runna-amendment.mjs','CoachingCore/test/v1hr5r-boundary.test.mjs','CoachingCore/test/v1hr5r-successors.test.mjs'];
const KEPT='CoachingCore/src/v1-run-calibration.mjs';
const sha=f=>createHash('sha256').update(fs.readFileSync(path.join(ROOT,f))).digest('hex');
const shaText=t=>createHash('sha256').update(t).digest('hex');
const git=(...a)=>execFileSync('git',a,{cwd:ROOT,encoding:'utf8',maxBuffer:1<<26});
const walk=d=>fs.readdirSync(path.join(ROOT,d),{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(d+'/'+e.name):[d+'/'+e.name]);
function consumed(){
 const src=walk('CoachingCore/src').filter(f=>f.endsWith('.mjs')).sort(),data=new Set();
 for(const f of src)for(const m of fs.readFileSync(path.join(ROOT,f),'utf8').matchAll(/new URL\('([^']+)',import\.meta\.url\)/g))data.add(path.posix.normalize(path.posix.join(path.posix.dirname(f),m[1])));
 return [...src,...[...data].sort()];
}
function bundleOf(list){
 const bm=JSON.parse(fs.readFileSync(path.join(ROOT,RES,'build-manifest.json'),'utf8')),am=JSON.parse(fs.readFileSync(path.join(ROOT,RES,'assets-manifest.json'),'utf8'));
 const bad=[],js=sha(RES+'/coachingcore-p0.js');
 if(js!==bm.bundle.sha256)bad.push('the amended bundle bytes are not its build manifest\'s');
 const core=bm.modules.filter(m=>m.file.startsWith('CoachingCore/'));
 for(const m of core)if(!list.includes(m.file)||sha(m.file)!==m.sha256)bad.push('amended bundle module not the bound source: '+m.file);
 const inBundle=new Set(core.map(m=>m.file)),srcMods=list.filter(f=>f.startsWith('CoachingCore/src/')&&f.endsWith('.mjs'));
 for(const a of am)if(!list.includes(a.key)||sha(a.key)!==a.sha256||sha(RES+'/assets/'+a.file)!==a.sha256)bad.push('amended bundle asset differs from the bound data file: '+a.key);
 for(const f of ADDED_CONSUMED)if(f.endsWith('.json')&&!am.some(a=>a.key===f))bad.push('a consumed data file is not bundled: '+f);
 for(const f of ['CoachingCore/src/v1-heart-rate-zones.mjs','CoachingCore/src/v1-heart-rate-profile.mjs'])if(!inBundle.has(f))bad.push('not in the amended bundle: '+f);
 if(bm.exportGate?.mismatches!==0)bad.push('export gate mismatches');
 return {bad,info:{file:RES+'/coachingcore-p0.js',sha256:js,bytes:bm.bundle.bytes,modules:bm.modules.length,coachingCoreModules:core.length,boundSourceModulesNotLinked:srcMods.filter(f=>!inBundle.has(f)),
  assets:am.length,assetsManifestSha256:sha(RES+'/assets-manifest.json'),buildManifestSha256:sha(RES+'/build-manifest.json'),entry:bm.entry,exportGate:bm.exportGate}};
}
async function checks(){
 const out=[],bad=[];
 for(const R of [ORIGINAL,FIRST]){const t=git('show',`${R.recordCommit}:${R.record}`);(shaText(t)===sha(R.record)?out:bad).push(`${R.revision}: its record is byte-identical to ${R.recordCommit} (not rewritten)`);}
 const first=JSON.parse(git('show',`${FIRST.recordCommit}:${FIRST.record}`)),amended=Object.keys(AMENDED);
 const others=Object.entries(first.files).filter(([f])=>!amended.includes(f)),same=others.filter(([f,h])=>fs.existsSync(path.join(ROOT,f))&&sha(f)===h).length;
 (same===others.length?out:bad).push(`${FIRST.revision}: ${same}/${others.length} of its other bound files byte-identical; ${amended.length} declared amendments`);
 (first.files[KEPT]===sha(KEPT)?out:bad).push(`${KEPT}: byte-identical to the bytes ${FIRST.revision} binds (${String(first.files[KEPT]).slice(0,12)}): the run calibration, its three zones and its session guidance are unchanged`);
 const diffs={};
 for(const f of amended){
  const was=first.files[f],now=sha(f),prior=git('show',`${BASE}:${f}`);
  (was&&was!==now&&shaText(prior)===was?out:bad).push(`${f}: amended (bound ${String(was).slice(0,12)}, now ${now.slice(0,12)})`);
  diffs[f]=git('diff','--no-color','-U0',BASE,'--',f).split('\n').filter(l=>/^[+-]/.test(l)&&!/^(\+\+\+|---) /.test(l)).join('\n');
 }
 for(const f of NO_LONGER_CONSUMED)(first.files[f]&&first.files[f]===sha(f)?out:bad).push(`${f}: no longer read by the runtime, kept byte-identical as history`);
 const changed=git('diff','--name-only',BASE,'--','CoachingCore').split('\n').filter(Boolean),declared=[...amended,...Object.keys(AMENDED_TESTS),...ADDED,RECORD];
 const undeclared=changed.filter(f=>!declared.includes(f));
 (undeclared.length?bad:out).push(undeclared.length?'CHANGED and not declared: '+undeclared.join(', '):`nothing else changed in CoachingCore since ${BASE} (${changed.length} files)`);
 const untracked=git('ls-files','--others','--exclude-standard','--','CoachingCore').split('\n').filter(Boolean);
 (untracked.length?bad:out).push(untracked.length?'UNTRACKED: '+untracked.join(', '):'no untracked file in CoachingCore');
 const list=consumed(),missing=list.filter(f=>!fs.existsSync(path.join(ROOT,f)));(missing.length?bad:out).push(missing.length?'MISSING: '+missing.join(', '):`every file the runtime reads is present (${list.length})`);
 const extra=list.filter(f=>!Object.hasOwn(first.files,f)),unexpected=extra.filter(f=>!ADDED_CONSUMED.includes(f));
 (unexpected.length||extra.length!==ADDED_CONSUMED.length?bad:out).push(unexpected.length?'CONSUMED and not declared: '+unexpected.join(', '):`the runtime reads ${extra.length} files ${FIRST.revision} does not bind, all declared: ${extra.join(', ')}`);
 const gone=Object.keys(first.files).filter(f=>!list.includes(f));
 (gone.length===NO_LONGER_CONSUMED.length&&gone.every(f=>NO_LONGER_CONSUMED.includes(f))?out:bad).push(`the runtime no longer reads ${gone.length} files ${FIRST.revision} binds: ${gone.join(', ')}`);
 const Z=await import(pathToFileURL(path.join(ROOT,'CoachingCore/src/v1-heart-rate-zones.mjs')).href);
 (Z.HR5_FILE_SHA256===Z.HR5_SHA256?out:bad).push(`five-zone values revision 2 are the pinned bytes (${String(Z.HR5_SHA256).slice(0,12)})`);
 const auth=Z.fiveZoneAuthority();out.push(`V1X-RUN-HR-FIVE-ZONE ${auth.approved?'ENABLED by '+auth.records.map(r=>r.reviewId+' '+r.disposition).join(', '):'NOT ENABLED (no independent enabling record)'}`);
 const b=bundleOf(list);if(b.bad.length)bad.push(...b.bad);else out.push(`amended bundle ${b.info.sha256.slice(0,16)}: ${b.info.coachingCoreModules} CoachingCore modules equal to the bound sources, ${b.info.assets} assets equal to the bound data files`);
 return {out,bad,list,bundle:b.info,diffs,first,enabled:{approved:auth.approved,records:auth.records,valuesSha256:auth.sha256}};
}
const mode=process.argv[2],arg=k=>{const i=process.argv.indexOf(k);return i>0?process.argv[i+1]:null;};
if(mode!=='--write'&&mode!=='--check'){console.error('usage: --write --commit <sha> | --check');process.exit(2);}
const c=await checks();if(c.bad.length){for(const l of c.bad)console.error(l);process.exit(1);}
if(mode==='--write'){
 const commit=arg('--commit');if(!commit||commit.length<7)throw new Error('--commit <sha> is required');
 const head=git('rev-parse','HEAD').trim(),dirty=git('status','--porcelain','--','CoachingCore').split('\n').filter(Boolean).filter(l=>!l.endsWith(RECORD));
 if(!head.startsWith(commit)){console.error('--commit must be HEAD ('+head+')');process.exit(1);}
 if(dirty.length){console.error('CoachingCore has uncommitted changes: '+dirty.join(', '));process.exit(1);}
 const files=Object.fromEntries(c.list.map(f=>[f,sha(f)])),inputs=JSON.parse(fs.readFileSync(path.join(ROOT,INPUTS),'utf8'));
 const rec={revision:REVISION,kind:'VERSIONED_AMENDMENT_BESIDE_THE_ORIGINAL_FREEZE_AND_THE_FIRST_AMENDMENT',supersedesForTheFiveZones:FIRST.revision,
  original:{revision:ORIGINAL.revision,record:ORIGINAL.record,recordCommit:ORIGINAL.recordCommit,recordSha256:sha(ORIGINAL.record)},
  first:{revision:FIRST.revision,record:FIRST.record,recordCommit:FIRST.recordCommit,recordSha256:sha(FIRST.record),filesDigest:c.first.filesDigest,fileCount:c.first.fileCount,bundleSha256:c.first.bundle?.sha256??null},
  commit:head,base:BASE,amended:Object.entries(AMENDED).map(([file,a])=>({file,bound:c.first.files[file],now:files[file],...a,diffSha256:shaText(c.diffs[file]),diffLines:c.diffs[file].split('\n').length})),
  amendedTests:AMENDED_TESTS,kept:{file:KEPT,sha256:files[KEPT]},addedConsumed:ADDED_CONSUMED,noLongerConsumed:NO_LONGER_CONSUMED,added:ADDED,preserved:c.out,bundle:c.bundle,enabling:c.enabled,...inputs,
  files,fileCount:c.list.length,filesDigest:createHash('sha256').update(JSON.stringify(files)).digest('hex')};
 fs.writeFileSync(path.join(ROOT,RECORD),JSON.stringify(rec,null,1)+'\n');console.log(`${REVISION}: written, ${c.list.length} files bound, amended bundle ${c.bundle.sha256.slice(0,16)}`);
}else{
 if(!fs.existsSync(path.join(ROOT,RECORD))){console.error('no record');process.exit(1);}
 const rec=JSON.parse(fs.readFileSync(path.join(ROOT,RECORD),'utf8'));
 if(rec.fileCount!==Object.keys(rec.files).length||rec.filesDigest!==createHash('sha256').update(JSON.stringify(rec.files)).digest('hex')){console.error('the record\'s fileCount or filesDigest does not match its files');process.exit(1);}
 const diff=Object.entries(rec.files).filter(([f,h])=>!fs.existsSync(path.join(ROOT,f))||sha(f)!==h).map(([f])=>f),extra=c.list.filter(f=>!Object.hasOwn(rec.files,f));
 if(diff.length||extra.length){console.error((diff.length?'NOT byte-identical: '+diff.join(', '):'')+(extra.length?' NOT BOUND: '+extra.join(', '):''));process.exit(1);}
 for(const a of rec.amended)if(shaText(c.diffs[a.file])!==a.diffSha256){console.error('an amended file\'s diff is not the recorded one: '+a.file);process.exit(1);}
 if(rec.bundle?.sha256!==c.bundle.sha256){console.error('the amended bundle is not the one the record binds');process.exit(1);}
 if(rec.enabling?.approved!==c.enabled.approved){console.error('the enabling state is not the recorded one');process.exit(1);}
 for(const l of c.out)console.log(l);console.log(`${REVISION}: ${rec.fileCount}/${rec.fileCount} consumed files byte-identical; amended bundle ${rec.bundle.sha256.slice(0,16)} as recorded; ${rec.amended.length} amended files over ${FIRST.revision}, their diffs as recorded`);
}
