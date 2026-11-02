// SSCTR Phase 7 recheck (R7C-FREEZE-4): runtime loader for the probes in this folder. Read-only instrument; never gate evidence alone.
// HEAD is the working tree (R7C-FREEZE-4 bytes for CoachingCore/src and test, checked by the verifier). Any other revision is extracted with
// git archive into a fresh folder of this review's own under the system temp directory (ssctr-r7c-p7-*), outside the repository and outside the
// authoring session's scratchpad, with CoachingCore/node_modules copied; the folder is removed by cleanup().
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {REPO,load} from '../../../../probes/phase3-lib.mjs';
import {kit,GEN,R10K,VALID} from '../cc/cc-lib.mjs';
export {REPO,load,kit,GEN,R10K,VALID};
export const FREEZE_3='08c6db352d102e2b33ed7e834cff980248b90299',FREEZE_4='a9654c8ea175611fbaae805ac6b0e8b928620dff';
const PATHS=['CoachingCore/src','CoachingCore/r5','CoachingCore/r6','CoachingCore/r7/b0','CoachingCore/r7/b/fixtures','CoachingCore/scripts/evaluate-holdout-r6.mjs','CoachingCore/package.json','audits/domain-coaching-r7-b0-2026-10-31/reviews/SSCTR_RECHECK_B0.json','audits/domain-coaching-r6-2026-10-26/reviews/ssctr-policy-review.json','audits/domain-coaching-r5-2026-10-25/reviews/ssctr-policy-review.json'];
export function extract(rev){
 const full=spawnSync('git',['rev-parse',rev],{cwd:REPO,encoding:'utf8'});if(full.status!==0)throw Error('git rev-parse '+rev+': '+full.stderr);
 const base=os.tmpdir();if(/9c34315f-9491-4e24-b552-36b62143e482/.test(base))throw Error('temp dir is inside the authoring scratchpad');
 const tmp=fs.mkdtempSync(path.join(base,'ssctr-r7c-p7-')),tar=path.join(tmp,'x.tar');
 const ar=spawnSync('git',['archive','--format=tar','-o',tar,full.stdout.trim(),...PATHS],{cwd:REPO,encoding:'utf8'});if(ar.status!==0)throw Error('git archive: '+ar.stderr);
 const tx=spawnSync('tar',['-xf','x.tar'],{cwd:tmp,encoding:'utf8'});if(tx.status!==0)throw Error('tar: '+tx.stderr);
 fs.rmSync(tar);
 fs.cpSync(path.join(REPO,'CoachingCore/node_modules'),path.join(tmp,'CoachingCore/node_modules'),{recursive:true});
 return {root:tmp,commit:full.stdout.trim(),cleanup:()=>fs.rmSync(tmp,{recursive:true,force:true})};
}
/** Runtimes by label: HEAD (working tree) and extra [label, commit] pairs. */
export async function runtimes(extra=[]){
 const out={HEAD:await load(REPO)},cleanups=[];
 for(const [label,rev] of extra){const x=extract(rev);cleanups.push(x.cleanup);out[label]=await load(x.root);}
 return {rt:out,cleanup:()=>cleanups.forEach(f=>f())};
}
