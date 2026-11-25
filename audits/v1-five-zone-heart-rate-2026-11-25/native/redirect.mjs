// V1HR5 native validation: runs the historical bundle linker and Node oracles UNCHANGED, against the amended CoachingCore, while every file they
// read or write under the historical iOS package (audits/v1-aif-p0-jsc-2026-11-17/ios) is redirected to this mission's copy of it
// (audits/v1-five-zone-heart-rate-2026-11-25/native/ios). Any write elsewhere is refused, so the historical evidence of the final release freeze
// (its bundle, manifests and fixtures) cannot be touched by this mission.
//   node --import ./audits/v1-five-zone-heart-rate-2026-11-25/native/redirect.mjs <historical script>
import fs from 'node:fs';
import path from 'node:path';
import {syncBuiltinESMExports} from 'node:module';
import {fileURLToPath} from 'node:url';

// REDIRECT_FROM / REDIRECT_TO (repository-relative) choose another pair: the reconciliation probes are captured the same way
// (audits/v1-ui-functional-reconciliation/probes/out -> audits/v1-five-zone-heart-rate-2026-11-25/probes/out).
const HERE=path.dirname(fileURLToPath(import.meta.url)),REPO=path.resolve(HERE,'..','..','..');
const FROM=path.join(REPO,process.env.REDIRECT_FROM??'audits/v1-aif-p0-jsc-2026-11-17/ios')+path.sep,TO=path.join(REPO,process.env.REDIRECT_TO??'audits/v1-five-zone-heart-rate-2026-11-25/native/ios')+path.sep;
if(!TO.startsWith(path.join(REPO,'audits','v1-five-zone-heart-rate-2026-11-25')+path.sep))throw new Error('redirect: the target must be inside this mission\'s folder');
const asPath=p=>p instanceof URL?fileURLToPath(p):typeof p==='string'?path.resolve(p):p;
const map=p=>{const a=asPath(p);return typeof a==='string'&&(a+path.sep).startsWith(FROM)?TO+a.slice(FROM.length):p;};
// The one exception: lab/focal-oracle.mjs hands a transient input file to a child process (which does not inherit this preload) by its original
// path, and removes it in a `finally`. That exact file may be written and removed in place; build.sh then checks the historical tree is unchanged.
const TRANSIENT=path.join(REPO,'audits','v1-aif-p0-jsc-2026-11-17','results','.focal-input.tmp.json');
const guard=(p,op)=>{const a=asPath(map(p));if(a===TRANSIENT)return a;if(typeof a!=='string'||!((a+path.sep).startsWith(TO)))throw new Error(`redirect: ${op} outside the mission copy refused: ${a}`);return a;};
const orig={readFileSync:fs.readFileSync,existsSync:fs.existsSync,writeFileSync:fs.writeFileSync,mkdirSync:fs.mkdirSync,readdirSync:fs.readdirSync,statSync:fs.statSync,rmSync:fs.rmSync,
 appendFileSync:fs.appendFileSync,copyFileSync:fs.copyFileSync,renameSync:fs.renameSync,unlinkSync:fs.unlinkSync,rmdirSync:fs.rmdirSync,openSync:fs.openSync};
export const redirected=[];
fs.readFileSync=(p,...a)=>orig.readFileSync(map(p),...a);
fs.existsSync=p=>orig.existsSync(map(p));
fs.readdirSync=(p,...a)=>orig.readdirSync(map(p),...a);
fs.statSync=(p,...a)=>orig.statSync(map(p),...a);
fs.writeFileSync=(p,...a)=>{const t=guard(p,'write');redirected.push(t);return orig.writeFileSync(t,...a);};
fs.mkdirSync=(p,...a)=>orig.mkdirSync(guard(p,'mkdir'),...a);
fs.rmSync=(p,...a)=>orig.rmSync(guard(p,'rm'),...a);
// QRE-HR5-10: every other way a script could write, rename, copy into or remove a file is guarded the same way; an open for writing too.
fs.appendFileSync=(p,...a)=>orig.appendFileSync(guard(p,'append'),...a);
fs.copyFileSync=(src,dst,...a)=>orig.copyFileSync(map(src),guard(dst,'copy'),...a);
fs.renameSync=(src,dst)=>orig.renameSync(guard(src,'rename'),guard(dst,'rename'));
fs.unlinkSync=p=>orig.unlinkSync(guard(p,'unlink'));
fs.rmdirSync=(p,...a)=>orig.rmdirSync(guard(p,'rmdir'),...a);
fs.openSync=(p,flags='r',...a)=>orig.openSync(/^[rR]$|^rs\+?$/.test(String(flags))&&!/\+/.test(String(flags))?map(p):guard(p,'open for writing'),flags,...a);
const refuse=op=>()=>{throw new Error('redirect: asynchronous '+op+' is not allowed under the preload');};
for(const op of ['writeFile','appendFile','mkdir','rm','rename','copyFile','unlink','rmdir','open'])fs.promises[op]=refuse(op);
for(const op of ['writeFile','appendFile','mkdir','rm','rename','copyFile','unlink','rmdir','createWriteStream'])fs[op]=refuse(op);
syncBuiltinESMExports();
process.on('exit',()=>{if(redirected.length)process.stderr.write(`redirect: ${redirected.length} file(s) written under ${path.relative(REPO,TO)}\n`);});
