// R7-C Phase 3 probe library (read-only engineering instrument; never gate evidence by itself). Loads a CoachingCore runtime from a root, and
// extracts the R7B2-FREEZE-1 bytes (commit 1a1c728) from git into a temporary directory, as scripts/regress-r7b2.mjs does.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {pathToFileURL,fileURLToPath} from 'node:url';

export const REPO=path.resolve(fileURLToPath(new URL('../../..',import.meta.url)));
export const R7B2_FREEZE_1='1a1c7286adc8b08d16f97dea86f4973fe33e5a95';
const PATHS=['CoachingCore/src','CoachingCore/r5','CoachingCore/r6','CoachingCore/r7/b0','CoachingCore/r7/b/fixtures','CoachingCore/scripts/evaluate-holdout-r6.mjs','audits/domain-coaching-r7-b0-2026-10-31/reviews/SSCTR_RECHECK_B0.json','audits/domain-coaching-r6-2026-10-26/reviews/ssctr-policy-review.json','audits/domain-coaching-r5-2026-10-25/reviews/ssctr-policy-review.json'];

/** The bytes of a commit, extracted into a fresh temporary directory; returns its root. */
export function extract(rev){
 const full=spawnSync('git',['rev-parse',rev],{cwd:REPO,encoding:'utf8'});if(full.status!==0)throw Error('git rev-parse '+rev+': '+full.stderr);
 const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'r7c-p3-')),tar=path.join(tmp,'x.tar');
 const ar=spawnSync('git',['archive','--format=tar','-o',tar,full.stdout.trim(),...PATHS],{cwd:REPO,encoding:'utf8'});if(ar.status!==0)throw Error('git archive: '+ar.stderr);
 const tx=spawnSync('tar',['-xf','x.tar'],{cwd:tmp,encoding:'utf8'});if(tx.status!==0)throw Error('tar: '+tx.stderr);
 fs.rmSync(tar);
 return {root:tmp,commit:full.stdout.trim(),cleanup:()=>fs.rmSync(tmp,{recursive:true,force:true})};
}
/** A runtime's public API, fixtures and holdout adapter, loaded from <root>/CoachingCore. */
export async function load(root){
 const imp=rel=>import(pathToFileURL(path.join(root,'CoachingCore',rel)).href);
 const idx=await imp('src/r6-index.mjs'),A=await imp('src/r6-adaptation.mjs'),V=await imp('src/value.mjs'),S=await imp('src/r6-simulator.mjs');
 const H=await imp('r7/b/fixtures/helpers.mjs'),PF=await imp('r6/fixtures/profiles.mjs'),HO=await imp('scripts/evaluate-holdout-r6.mjs'),dev=(await imp('r6/fixtures/dev-authority.mjs')).devAuthority;
 const corpus=JSON.parse(fs.readFileSync(path.join(root,'CoachingCore/r6/holdout/R6_INDEPENDENT_HOLDOUT.json'),'utf8'));
 return {root,generateProgram:idx.generateProgram,evaluateProgram:idx.evaluateProgram,historicalStateOf:A.historicalStateOf,hash:V.hash,clone:V.clone,simulateProgram:S.simulateProgram,H,PROFILES:PF.PROFILES,EDGE_PROFILES:PF.EDGE_PROFILES,evaluateHoldoutCase:HO.evaluateHoldoutCase,devAuthority:dev,opts:{authority:dev()},corpus};
}
export const brief=r=>({status:r.status,action:r.action??null,proposal:!!r.proposal,missing:r.missingInputs??[],question:r.question?{kind:r.question.kind,dependentScope:r.question.dependentScope,fromWeek:r.question.fromWeek,unreported:r.question.unreported?.sessionIds?.length??0}:null,reason:String(r.reason??'').slice(0,200),planValidity:r.planValidity?.status??null});
