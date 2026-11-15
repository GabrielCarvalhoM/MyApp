// Builds a scratch copy of what the v1rws tests need from one worktree, taking node_modules from another (a worktree that has no node_modules of
// its own: it is not tracked). Never the worktree itself: nothing is deleted or overwritten, and the target must not exist.
//   node make-copy-of.mjs <CoachingCore of the code to copy> <CoachingCore that has node_modules> <new target dir under a scratchpad>
import fs from 'node:fs';
import path from 'node:path';
const [src,mods,dst]=process.argv.slice(2);
if(!src||!mods||!dst||!dst.includes('scratchpad'))throw new Error('usage: <CoachingCore> <CoachingCore with node_modules> <scratch target>');
if(fs.existsSync(dst))throw new Error('the target exists: choose a new name');
const root=path.dirname(src),cc=path.join(dst,'CoachingCore');
const copy=(from,to)=>{fs.mkdirSync(path.dirname(to),{recursive:true});fs.cpSync(from,to,{recursive:true});};
for(const d of ['src','v1','package.json'])copy(path.join(src,d),path.join(cc,d));
copy(path.join(mods,'node_modules'),path.join(cc,'node_modules'));
for(const f of ['r3/BOUNDED_POLICY_CANDIDATES_R3.json','r4/PRESCRIPTION_ENVELOPE_REGISTRY.json','r5/PROGRAM_POLICY_R5.json','r6/PROGRAM_POLICY_R6.json','r7/b0/REPERTOIRE_CATALOG_B0.json'])copy(path.join(src,f),path.join(cc,f));
fs.mkdirSync(path.join(cc,'test'),{recursive:true});
for(const f of fs.readdirSync(path.join(src,'test')).filter(f=>/^v1rws-.*\.mjs$/.test(f)||f==='v1rc-helpers.mjs'))fs.copyFileSync(path.join(src,'test',f),path.join(cc,'test',f));
for(const f of ['audits/coachingcore-v1-final-closure-2026-11-11/reviews/ssctr/SSCTR_V1FC_EVENT_RECORDS.json','audits/coachingcore-v1-run-calibration-2026-11-11/reviews/ssctr/SSCTR_V1RC_RUN_RECORDS.json','audits/domain-closure-r3-2026-10-24/reviews/ssctr-records.json',
 'audits/domain-closure-r4-2026-10-25/reviews/ssctr-envelope-review.json','audits/domain-coaching-r5-2026-10-25/reviews/ssctr-policy-review.json','audits/domain-coaching-r6-2026-10-26/reviews/ssctr-policy-review.json','audits/domain-coaching-r7-b0-2026-10-31/reviews/SSCTR_RECHECK_B0.json'])copy(path.join(root,f),path.join(dst,f));
copy(path.join(root,'audits/v1-run-workout-structure-2026-11-13/ssctr'),path.join(dst,'audits/v1-run-workout-structure-2026-11-13/ssctr'));
console.log('copied to',dst);
