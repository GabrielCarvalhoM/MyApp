// QE re-check helper (R7A-QE-r2): builds a single-revert mutant of the FREEZE-2 runtime in the OS temp directory (never in the repo).
// Every copied file is checked against its SHA-256 in RUNTIME_FREEZE_R7A_2.json first; exactly one occurrence of `from` is replaced.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {pathToFileURL} from 'node:url';
import {ROOT} from './qe-lib.mjs';
const CC=path.join(ROOT,'CoachingCore');
export async function mutant(file,from,to){
 const freeze=JSON.parse(fs.readFileSync(path.join(CC,'r7/RUNTIME_FREEZE_R7A_2.json'),'utf8'));
 const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'qe-r7a-mutant-'));
 for(const [rel,digest] of Object.entries(freeze.files)){
  if(rel.startsWith('test/'))continue;
  let b=fs.readFileSync(path.join(CC,rel));
  if(createHash('sha256').update(b).digest('hex')!==digest)throw Error('freeze drift '+rel);
  if(rel===file){const s=b.toString('utf8'),n=s.split(from).length-1;if(n!==1)throw Error(`mutation site found ${n} times in ${rel}`);b=Buffer.from(s.replace(from,to),'utf8');}
  fs.mkdirSync(path.dirname(path.join(tmp,'CoachingCore',rel)),{recursive:true});fs.writeFileSync(path.join(tmp,'CoachingCore',rel),b);
 }
 const L=rel=>import(pathToFileURL(path.join(tmp,'CoachingCore',rel)).href);
 return {...(await L('src/r6-index.mjs')),...(await L('src/r6-program.mjs')),tmp};
}
