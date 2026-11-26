// RepMile CoachingHost: acceptance rule 1 of the production bundle (SWIFTUI_BACKEND_HANDOFF §2, A handoff §4 item 1 and §7 test 1).
// The bundle's build manifest must list exactly: every CoachingCore module the HR5R validated bundle (d087ad51, AMENDMENT-2) links, each at the
// sha256 REPMILE-COACHINGCORE-V1-FIVE-ZONE-AMENDMENT-2 binds; the shared app-projections.mjs at the bytes of the shared contract; and this
// package's own facade files. Every asset at the sha256 the amendment binds. The export gate must report 0 mismatches. Anything else fails.
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
const HERE=path.dirname(fileURLToPath(import.meta.url)),ROOT=path.resolve(HERE,'..'),REPO=path.resolve(ROOT,'..','..','..');
const read=f=>fs.readFileSync(path.join(REPO,f));
const sha=b=>createHash('sha256').update(b).digest('hex');
const am=JSON.parse(read('CoachingCore/v1/HR5_RUNNA_AMENDMENT_V1.json'));
const built=JSON.parse(fs.readFileSync(path.join(ROOT,'Sources/CoachingHost/Resources/build-manifest.json'),'utf8'));
const assets=JSON.parse(fs.readFileSync(path.join(ROOT,'Sources/CoachingHost/Resources/assets-manifest.json'),'utf8'));
const hr5r=JSON.parse(read('audits/v1-hr5-runna-parity-2026-11-25/native/ios/Sources/P0Host/Resources/build-manifest.json'));
const hr5rAssets=JSON.parse(read('audits/v1-hr5-runna-parity-2026-11-25/native/ios/Sources/P0Host/Resources/assets-manifest.json'));
const fail=[];
const PROJ='ios/Packages/CoachingPresentation/Facade/app-projections.mjs',OWN='ios/Packages/CoachingHost/facade/';
const core=built.modules.filter(m=>m.file.startsWith('CoachingCore/')),other=built.modules.filter(m=>!m.file.startsWith('CoachingCore/'));
for(const m of core){if(am.files[m.file]!==m.sha256)fail.push(`${m.file}: ${m.sha256.slice(0,12)} is not the amendment's ${String(am.files[m.file]).slice(0,12)}`);}
const want=hr5r.modules.filter(m=>m.file.startsWith('CoachingCore/')).map(m=>m.file).sort(),got=core.map(m=>m.file).sort();
if(want.join()!==got.join())fail.push(`CoachingCore module set differs from the validated bundle: +${got.filter(f=>!want.includes(f))} -${want.filter(f=>!got.includes(f))}`);
for(const m of other){
 if(m.file===PROJ){if(sha(read(PROJ))!==m.sha256)fail.push('app-projections.mjs is not the shared bytes');continue;}
 if(m.file.startsWith(OWN)&&!m.file.slice(OWN.length).includes('/'))continue;
 fail.push(`${m.file}: not a CoachingCore module, the shared projections or this package's facade`);
}
if(!other.some(m=>m.file===PROJ))fail.push('app-projections.mjs is not linked');
for(const a of assets){if(am.files[a.key]!==a.sha256)fail.push(`asset ${a.key}: not at the amendment's sha256`);}
if(assets.map(a=>a.key+a.sha256).join()!==hr5rAssets.map(a=>a.key+a.sha256).join())fail.push('the asset set differs from the validated bundle');
if(built.exportGate.mismatches!==0)fail.push('export gate mismatches');
const bundleSha=sha(fs.readFileSync(path.join(ROOT,'Sources/CoachingHost/Resources/coachinghost.js')));
if(bundleSha!==built.bundle.sha256)fail.push('the bundle bytes are not the manifest sha');
const report={amendment:am.revision,bundleSha256:built.bundle.sha256,modules:built.modules.length,coachingCoreModules:core.length,projections:PROJ,facade:other.filter(m=>m.file.startsWith(OWN)).map(m=>m.file),
 assets:assets.length,exportGate:built.exportGate,failures:fail};
console.log(JSON.stringify(report,null,1));
if(fail.length)process.exit(1);
