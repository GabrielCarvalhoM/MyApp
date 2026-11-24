// REPMILE CoachingCore V1 final physical validation (Founder mission of 2026-11-24): the verifier of REPMILE-COACHINGCORE-V1-FINAL-RELEASE-FREEZE.
// The successor of REPMILE-COACHINGCORE-V1-RC-1 (scripts/v1-rc-1.mjs stays the verifier of that record; on this line its --check names the two
// amendments below, by design). It binds what the app consumes and what was run physically:
// - every file under CoachingCore/src and every data file the runtime reads by URL (the 87 files RC-1 bound), by sha256;
// - the two amended files against RC-1's own hashes; RC-1's other bound files byte-identical;
// - nothing else in CoachingCore changed since the RC-1 content commit (89796df) but the files this line adds; nothing untracked;
// - the validated JavaScriptCore bundle: its sha256 is the build manifest's, every CoachingCore module the manifest lists has the sha256 of the
//   bound source, every bound source module is in it, and every bundled asset is byte-identical to the bound data file it copies.
// The record's narrative fields (results, opinions, findings, obligations, rules) come from audits/v1-final-physical-2026-11-24/FREEZE_INPUTS.json.
//   node scripts/v1-final-release-freeze.mjs --write --commit <HEAD sha> | --check
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..','..');
const BASE='89796df',RC1='CoachingCore/v1/RELEASE_CANDIDATE_V1_RC_1.json',RECORD='CoachingCore/v1/FINAL_RELEASE_FREEZE_V1.json',REVISION='REPMILE-COACHINGCORE-V1-FINAL-RELEASE-FREEZE';
const INPUTS='audits/v1-final-physical-2026-11-24/FREEZE_INPUTS.json',RES='audits/v1-aif-p0-jsc-2026-11-17/ios/Sources/P0Host/Resources';
const AMENDED={
 'CoachingCore/src/boundary/views.mjs':{findings:['SEC-BC-R2-01'],change:'planView reads every erasure marker on record as in force whatever its instant (it can only add a hold); every other fact as of the clock'},
 'CoachingCore/src/boundary/custody.mjs':{findings:['FPV-01'],change:'reconcile reads an engine row that differs from the stored row only in context.mode and context.phaseClass (a re-binding to the plan in force) as the row as recorded; every other change is refused as before'},
};
const ADDED=['CoachingCore/scripts/v1-final-release-freeze.mjs','CoachingCore/test/v1final-fpv-01.test.mjs','CoachingCore/test/v1final-sec-bc-r2-01.test.mjs','CoachingCore/test/v1final-freeze-record.test.mjs'];
const sha=f=>createHash('sha256').update(fs.readFileSync(path.join(ROOT,f))).digest('hex');
const git=(...a)=>execFileSync('git',a,{cwd:ROOT,encoding:'utf8'});
const walk=d=>fs.readdirSync(path.join(ROOT,d),{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(d+'/'+e.name):[d+'/'+e.name]);
function consumed(){
 const src=walk('CoachingCore/src').filter(f=>f.endsWith('.mjs')).sort(),data=new Set();
 for(const f of src)for(const m of fs.readFileSync(path.join(ROOT,f),'utf8').matchAll(/new URL\('([^']+)',import\.meta\.url\)/g))data.add(path.posix.normalize(path.posix.join(path.posix.dirname(f),m[1])));
 return [...src,...[...data].sort()];
}
function bundleOf(list){
 const bm=JSON.parse(fs.readFileSync(path.join(ROOT,RES,'build-manifest.json'),'utf8')),am=JSON.parse(fs.readFileSync(path.join(ROOT,RES,'assets-manifest.json'),'utf8'));
 const bad=[],js=sha(RES+'/coachingcore-p0.js');
 if(js!==bm.bundle.sha256)bad.push('the bundle bytes are not the build manifest\'s');
 const core=bm.modules.filter(m=>m.file.startsWith('CoachingCore/'));
 for(const m of core)if(!list.includes(m.file)||sha(m.file)!==m.sha256)bad.push('bundle module not the bound source: '+m.file);
 const srcMods=list.filter(f=>f.startsWith('CoachingCore/src/')&&f.endsWith('.mjs')),inBundle=new Set(core.map(m=>m.file));
 const absent=srcMods.filter(f=>!inBundle.has(f));
 for(const a of am)if(!list.includes(a.key)||sha(a.key)!==a.sha256||sha(RES+'/assets/'+a.file)!==a.sha256)bad.push('bundled asset differs from the bound data file: '+a.key);
 if(bm.exportGate?.mismatches!==0)bad.push('export gate mismatches');
 return {bad,info:{file:RES+'/coachingcore-p0.js',sha256:js,bytes:bm.bundle.bytes,modules:bm.modules.length,coachingCoreModules:core.length,
  boundSourceModulesNotLinked:absent,assets:am.length,assetsManifestSha256:sha(RES+'/assets-manifest.json'),buildManifestSha256:sha(RES+'/build-manifest.json'),entry:bm.entry,exportGate:bm.exportGate}};
}
function checks(){
 const out=[],bad=[],amended=Object.keys(AMENDED),rc=JSON.parse(fs.readFileSync(path.join(ROOT,RC1),'utf8'));
 const other=Object.entries(rc.files).filter(([f])=>!amended.includes(f)),same=other.filter(([f,h])=>fs.existsSync(path.join(ROOT,f))&&sha(f)===h).length;
 (same===other.length?out:bad).push(`REPMILE-COACHINGCORE-V1-RC-1: ${same}/${other.length} of its other bound files byte-identical; ${amended.length} declared amendments`);
 for(const f of amended){const was=rc.files[f],now=sha(f);(was&&was!==now?out:bad).push(`${f}: amended (RC-1 ${String(was).slice(0,12)}, now ${now.slice(0,12)}) for ${AMENDED[f].findings.join(', ')}`);}
 const changed=git('diff','--name-only',BASE,'--','CoachingCore').split('\n').filter(Boolean),undeclared=changed.filter(f=>!amended.includes(f)&&!ADDED.includes(f)&&f!==RECORD);
 (undeclared.length?bad:out).push(undeclared.length?'CHANGED and not declared: '+undeclared.join(', '):`nothing else changed in CoachingCore since ${BASE} (${changed.length} files)`);
 const untracked=git('ls-files','--others','--exclude-standard','--','CoachingCore').split('\n').filter(Boolean);
 (untracked.length?bad:out).push(untracked.length?'UNTRACKED: '+untracked.join(', '):'no untracked file in CoachingCore');
 const list=consumed(),missing=list.filter(f=>!fs.existsSync(path.join(ROOT,f)));(missing.length?bad:out).push(missing.length?'MISSING: '+missing.join(', '):`every file the runtime reads is present (${list.length})`);
 const b=bundleOf(list);if(b.bad.length)bad.push(...b.bad);else out.push(`bundle ${b.info.sha256.slice(0,16)}: ${b.info.coachingCoreModules} CoachingCore modules equal to the bound sources, ${b.info.assets} assets equal to the bound data files`);
 return {out,bad,list,bundle:b.info};
}
const mode=process.argv[2],arg=k=>{const i=process.argv.indexOf(k);return i>0?process.argv[i+1]:null;};
if(mode!=='--write'&&mode!=='--check'){console.error('usage: --write --commit <sha> | --check');process.exit(2);}
const c=checks();if(c.bad.length){for(const l of c.bad)console.error(l);process.exit(1);}
if(mode==='--write'){
 const commit=arg('--commit');if(!commit||commit.length<7)throw new Error('--commit <sha> is required');
 const head=git('rev-parse','HEAD').trim(),dirty=git('status','--porcelain','--','CoachingCore').split('\n').filter(Boolean).filter(l=>!l.endsWith(RECORD));
 if(!head.startsWith(commit)){console.error('--commit must be HEAD ('+head+')');process.exit(1);}
 if(dirty.length){console.error('CoachingCore has uncommitted changes: '+dirty.join(', '));process.exit(1);}
 const files=Object.fromEntries(c.list.map(f=>[f,sha(f)])),pkg=JSON.parse(fs.readFileSync(path.join(ROOT,'CoachingCore/package.json'),'utf8')),inputs=JSON.parse(fs.readFileSync(path.join(ROOT,INPUTS),'utf8'));
 const rc=JSON.parse(fs.readFileSync(path.join(ROOT,RC1),'utf8'));
 const rec={revision:REVISION,predecessor:{revision:rc.revision,record:RC1,commit:rc.commit,filesDigest:rc.filesDigest},commit:head,base:BASE,package:{name:pkg.name,version:pkg.version},
  entryPoints:{engine:'CoachingCore/src/v1-safety-index.mjs',boundary:'CoachingCore/src/boundary/integration.mjs (createIntegration) under CoachingCore/src/boundary/api.mjs (createBoundary)'},
  amended:Object.entries(AMENDED).map(([file,a])=>({file,rc1:rc.files[file],now:files[file],...a})),added:ADDED,preserved:c.out,bundle:c.bundle,
  ...inputs,files,fileCount:c.list.length,filesDigest:createHash('sha256').update(JSON.stringify(files)).digest('hex')};
 fs.writeFileSync(path.join(ROOT,RECORD),JSON.stringify(rec,null,1)+'\n');console.log(`${REVISION}: written, ${c.list.length} files bound, bundle ${c.bundle.sha256.slice(0,16)}`);
}else{
 if(!fs.existsSync(path.join(ROOT,RECORD))){console.error('no record');process.exit(1);}
 const rec=JSON.parse(fs.readFileSync(path.join(ROOT,RECORD),'utf8'));
 if(rec.fileCount!==Object.keys(rec.files).length||rec.filesDigest!==createHash('sha256').update(JSON.stringify(rec.files)).digest('hex')){console.error('the record\'s fileCount or filesDigest does not match its files');process.exit(1);}
 const diff=Object.entries(rec.files).filter(([f,h])=>!fs.existsSync(path.join(ROOT,f))||sha(f)!==h).map(([f])=>f),extra=c.list.filter(f=>!Object.hasOwn(rec.files,f));
 if(diff.length||extra.length){console.error((diff.length?'NOT byte-identical: '+diff.join(', '):'')+(extra.length?' NOT BOUND: '+extra.join(', '):''));process.exit(1);}
 if(rec.bundle?.sha256!==c.bundle.sha256){console.error('the bundle is not the one the record binds');process.exit(1);}
 for(const l of c.out)console.log(l);console.log(`${REVISION}: ${rec.fileCount}/${rec.fileCount} consumed files byte-identical; bundle ${rec.bundle.sha256.slice(0,16)} as recorded; two amendments over RC-1 declared`);
}
