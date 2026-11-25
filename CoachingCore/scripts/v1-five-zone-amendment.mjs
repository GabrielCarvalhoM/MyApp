// REPMILE CoachingCore V1 five-zone amendment (Founder mission of 2026-11-25, V1HR5): the verifier of REPMILE-COACHINGCORE-V1-FIVE-ZONE-AMENDMENT-1,
// a versioned amendment BESIDE REPMILE-COACHINGCORE-V1-FINAL-RELEASE-FREEZE (it does not rewrite that record and is not a new freeze cycle).
// It binds, and --check proves:
// - the original freeze record (CoachingCore/v1/FINAL_RELEASE_FREEZE_V1.json) is byte-identical to its commit 6482749;
// - of the 87 files the original record binds, every one is byte-identical but the ONE declared amended file (src/v1-run-calibration.mjs),
//   whose change from the frozen bytes is exactly the recorded diff, and whose heartRateOf (the three-zone path bound by the V1X-RUN-HR record)
//   is byte-identical to the frozen function;
// - the files the runtime now consumes besides them (the new module, the five-zone values, the enabling records) are present and bound;
// - nothing else in CoachingCore changed since the base 476b657 but the files this amendment adds; nothing untracked;
// - the AMENDED JavaScriptCore bundle (audits/v1-five-zone-heart-rate-2026-11-25/native/ios, the bundle that ran on the Mac and the iPhone):
//   its sha256 is its manifest's, every CoachingCore module it lists is the bound source, every bound source module is in it, and every bundled
//   asset is byte-identical to the bound data file it copies;
// - the five-zone values are the pinned bytes, and the enabling state is the one recorded.
// The narrative fields (reason, method, tests, runtimes, device, open items, what it validates) come from
// audits/v1-five-zone-heart-rate-2026-11-25/AMENDMENT_INPUTS.json.
//   node CoachingCore/scripts/v1-five-zone-amendment.mjs --write --commit <HEAD sha> | --check
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {fileURLToPath,pathToFileURL} from 'node:url';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..','..');
const REVISION='REPMILE-COACHINGCORE-V1-FIVE-ZONE-AMENDMENT-1',RECORD='CoachingCore/v1/FIVE_ZONE_AMENDMENT_V1.json';
const ORIGINAL={record:'CoachingCore/v1/FINAL_RELEASE_FREEZE_V1.json',recordCommit:'6482749',contentCommit:'460a9ab',revision:'REPMILE-COACHINGCORE-V1-FINAL-RELEASE-FREEZE'};
const BASE='476b657',MISSION='audits/v1-five-zone-heart-rate-2026-11-25',INPUTS=MISSION+'/AMENDMENT_INPUTS.json',RES=MISSION+'/native/ios/Sources/P0Host/Resources';
const AMENDED={'CoachingCore/src/v1-run-calibration.mjs':{change:'one import of src/v1-heart-rate-zones.mjs; the five zones of the week in force and of the next, and the heart-rate role of each planned run session, computed beside the unchanged session guidance; one output key runCalibration.heartRateFiveZones. heartRateOf and every other output unchanged.'}};
const ADDED_CONSUMED=['CoachingCore/src/v1-heart-rate-zones.mjs','CoachingCore/v1/HEART_RATE_FIVE_ZONE_V1.json',MISSION+'/reviews/ssctr/SSCTR_HR5_RECORDS.json'];
const ADDED=['CoachingCore/src/v1-heart-rate-zones.mjs','CoachingCore/v1/HEART_RATE_FIVE_ZONE_V1.json','CoachingCore/scripts/v1-five-zone-amendment.mjs','CoachingCore/test/v1hr5-five-zones.test.mjs','CoachingCore/test/v1hr5-amendment-record.test.mjs'];
const sha=f=>createHash('sha256').update(fs.readFileSync(path.join(ROOT,f))).digest('hex');
const shaText=t=>createHash('sha256').update(t).digest('hex');
const git=(...a)=>execFileSync('git',a,{cwd:ROOT,encoding:'utf8',maxBuffer:1<<26});
const walk=d=>fs.readdirSync(path.join(ROOT,d),{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(d+'/'+e.name):[d+'/'+e.name]);
function consumed(){
 const src=walk('CoachingCore/src').filter(f=>f.endsWith('.mjs')).sort(),data=new Set();
 for(const f of src)for(const m of fs.readFileSync(path.join(ROOT,f),'utf8').matchAll(/new URL\('([^']+)',import\.meta\.url\)/g))data.add(path.posix.normalize(path.posix.join(path.posix.dirname(f),m[1])));
 return [...src,...[...data].sort()];
}
/** The text of one top-level function (from its declaration to the first line that is a lone closing brace). */
const fnText=(text,name)=>{const i=text.indexOf(`\nfunction ${name}(`);if(i<0)return null;const j=text.indexOf('\n}\n',i);return j<0?null:text.slice(i+1,j+2);};
function bundleOf(list){
 const bm=JSON.parse(fs.readFileSync(path.join(ROOT,RES,'build-manifest.json'),'utf8')),am=JSON.parse(fs.readFileSync(path.join(ROOT,RES,'assets-manifest.json'),'utf8'));
 const bad=[],js=sha(RES+'/coachingcore-p0.js');
 if(js!==bm.bundle.sha256)bad.push('the amended bundle bytes are not its build manifest\'s');
 const core=bm.modules.filter(m=>m.file.startsWith('CoachingCore/'));
 for(const m of core)if(!list.includes(m.file)||sha(m.file)!==m.sha256)bad.push('amended bundle module not the bound source: '+m.file);
 const inBundle=new Set(core.map(m=>m.file)),srcMods=list.filter(f=>f.startsWith('CoachingCore/src/')&&f.endsWith('.mjs'));
 for(const a of am)if(!list.includes(a.key)||sha(a.key)!==a.sha256||sha(RES+'/assets/'+a.file)!==a.sha256)bad.push('amended bundle asset differs from the bound data file: '+a.key);
 for(const f of ADDED_CONSUMED)if(f.endsWith('.json')&&!am.some(a=>a.key===f))bad.push('a consumed data file is not bundled: '+f);
 if(!inBundle.has('CoachingCore/src/v1-heart-rate-zones.mjs'))bad.push('the five-zone module is not in the amended bundle');
 if(bm.exportGate?.mismatches!==0)bad.push('export gate mismatches');
 return {bad,info:{file:RES+'/coachingcore-p0.js',sha256:js,bytes:bm.bundle.bytes,modules:bm.modules.length,coachingCoreModules:core.length,boundSourceModulesNotLinked:srcMods.filter(f=>!inBundle.has(f)),
  assets:am.length,assetsManifestSha256:sha(RES+'/assets-manifest.json'),buildManifestSha256:sha(RES+'/build-manifest.json'),entry:bm.entry,exportGate:bm.exportGate}};
}
async function checks(){
 const out=[],bad=[];
 const histRecord=git('show',`${ORIGINAL.recordCommit}:${ORIGINAL.record}`);
 (shaText(histRecord)===sha(ORIGINAL.record)?out:bad).push(`${ORIGINAL.revision}: its record is byte-identical to ${ORIGINAL.recordCommit} (not rewritten)`);
 const orig=JSON.parse(histRecord),amended=Object.keys(AMENDED);
 const others=Object.entries(orig.files).filter(([f])=>!amended.includes(f)),same=others.filter(([f,h])=>fs.existsSync(path.join(ROOT,f))&&sha(f)===h).length;
 (same===others.length?out:bad).push(`${ORIGINAL.revision}: ${same}/${others.length} of its other bound files byte-identical; ${amended.length} declared amendment`);
 const diffs={};
 for(const f of amended){
  const was=orig.files[f],now=sha(f),frozen=git('show',`${ORIGINAL.contentCommit}:${f}`),cur=fs.readFileSync(path.join(ROOT,f),'utf8');
  (was&&was!==now&&shaText(frozen)===was?out:bad).push(`${f}: amended (frozen ${String(was).slice(0,12)}, now ${now.slice(0,12)})`);
  const a=fnText(frozen,'heartRateOf'),b=fnText(cur,'heartRateOf');(a&&a===b?out:bad).push(`${f}: heartRateOf byte-identical to the frozen function (${a?shaText(a).slice(0,12):'missing'})`);
  diffs[f]=git('diff','--no-color','-U0',ORIGINAL.contentCommit,'--',f).split('\n').filter(l=>/^[+-]/.test(l)&&!/^(\+\+\+|---) /.test(l)).join('\n');
 }
 const changed=git('diff','--name-only',BASE,'--','CoachingCore').split('\n').filter(Boolean),undeclared=changed.filter(f=>!amended.includes(f)&&!ADDED.includes(f)&&f!==RECORD);
 (undeclared.length?bad:out).push(undeclared.length?'CHANGED and not declared: '+undeclared.join(', '):`nothing else changed in CoachingCore since ${BASE} (${changed.length} files)`);
 const untracked=git('ls-files','--others','--exclude-standard','--','CoachingCore').split('\n').filter(Boolean);
 (untracked.length?bad:out).push(untracked.length?'UNTRACKED: '+untracked.join(', '):'no untracked file in CoachingCore');
 const list=consumed(),missing=list.filter(f=>!fs.existsSync(path.join(ROOT,f)));(missing.length?bad:out).push(missing.length?'MISSING: '+missing.join(', '):`every file the runtime reads is present (${list.length})`);
 const extra=list.filter(f=>!Object.hasOwn(orig.files,f)),unexpected=extra.filter(f=>!ADDED_CONSUMED.includes(f));
 (unexpected.length||extra.length!==ADDED_CONSUMED.length?bad:out).push(unexpected.length?'CONSUMED and not declared: '+unexpected.join(', '):`the runtime reads ${extra.length} files the original record does not bind, all declared: ${extra.join(', ')}`);
 const Z=await import(pathToFileURL(path.join(ROOT,'CoachingCore/src/v1-heart-rate-zones.mjs')).href);
 (Z.HR5_FILE_SHA256===Z.HR5_SHA256?out:bad).push(`five-zone values are the pinned bytes (${String(Z.HR5_SHA256).slice(0,12)})`);
 const auth=Z.fiveZoneAuthority();out.push(`V1X-RUN-HR-FIVE-ZONE ${auth.approved?'ENABLED by '+auth.records.map(r=>r.reviewId+' '+r.disposition).join(', '):'NOT ENABLED (no independent enabling record)'}`);
 const b=bundleOf(list);if(b.bad.length)bad.push(...b.bad);else out.push(`amended bundle ${b.info.sha256.slice(0,16)}: ${b.info.coachingCoreModules} CoachingCore modules equal to the bound sources, ${b.info.assets} assets equal to the bound data files`);
 return {out,bad,list,bundle:b.info,diffs,orig,enabled:{approved:auth.approved,records:auth.records,valuesSha256:auth.sha256}};
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
 const rec={revision:REVISION,kind:'VERSIONED_AMENDMENT_BESIDE_THE_ORIGINAL_FREEZE',original:{revision:ORIGINAL.revision,record:ORIGINAL.record,recordCommit:ORIGINAL.recordCommit,contentCommit:ORIGINAL.contentCommit,
   recordSha256:sha(ORIGINAL.record),filesDigest:c.orig.filesDigest,fileCount:c.orig.fileCount,bundleSha256:c.orig.bundle?.sha256??null},
  commit:head,base:BASE,amended:Object.entries(AMENDED).map(([file,a])=>({file,frozen:c.orig.files[file],now:files[file],...a,diffSha256:shaText(c.diffs[file]),diff:c.diffs[file].split('\n')})),
  addedConsumed:ADDED_CONSUMED,added:ADDED,preserved:c.out,bundle:c.bundle,enabling:c.enabled,...inputs,files,fileCount:c.list.length,filesDigest:createHash('sha256').update(JSON.stringify(files)).digest('hex')};
 fs.writeFileSync(path.join(ROOT,RECORD),JSON.stringify(rec,null,1)+'\n');console.log(`${REVISION}: written, ${c.list.length} files bound, amended bundle ${c.bundle.sha256.slice(0,16)}`);
}else{
 if(!fs.existsSync(path.join(ROOT,RECORD))){console.error('no record');process.exit(1);}
 const rec=JSON.parse(fs.readFileSync(path.join(ROOT,RECORD),'utf8'));
 if(rec.fileCount!==Object.keys(rec.files).length||rec.filesDigest!==createHash('sha256').update(JSON.stringify(rec.files)).digest('hex')){console.error('the record\'s fileCount or filesDigest does not match its files');process.exit(1);}
 const diff=Object.entries(rec.files).filter(([f,h])=>!fs.existsSync(path.join(ROOT,f))||sha(f)!==h).map(([f])=>f),extra=c.list.filter(f=>!Object.hasOwn(rec.files,f));
 if(diff.length||extra.length){console.error((diff.length?'NOT byte-identical: '+diff.join(', '):'')+(extra.length?' NOT BOUND: '+extra.join(', '):''));process.exit(1);}
 for(const a of rec.amended)if(shaText(c.diffs[a.file])!==a.diffSha256){console.error('the amended file\'s diff is not the recorded one: '+a.file);process.exit(1);}
 if(rec.bundle?.sha256!==c.bundle.sha256){console.error('the amended bundle is not the one the record binds');process.exit(1);}
 if(rec.enabling?.approved!==c.enabled.approved){console.error('the enabling state is not the recorded one');process.exit(1);}
 for(const l of c.out)console.log(l);console.log(`${REVISION}: ${rec.fileCount}/${rec.fileCount} consumed files byte-identical; amended bundle ${rec.bundle.sha256.slice(0,16)} as recorded; one amended file over ${ORIGINAL.revision}, its diff as recorded`);
}
