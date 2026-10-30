// Author probe (R7-A RESIDUAL AUTHORITY, Founder request §27): names every difference of the evidence round. Inputs: the comparison
// (probes/COMPARISON_R7ARA.json), the ablation (probes/runs/ablation.out.json: which reverted root cause restores the predecessor's output) and the
// regression (CoachingCore/r7/residual-authority/REGRESSION_R7ARA.json). An output that differs only by labels or clocks is named as such; any
// other difference is named by the root cause whose revert restores it (A5, E1, or both together); a difference no revert restores is unnamed, and
// the freeze refuses an unnamed difference. Writes probes/NAMED_DIFFERENCES_R7ARA.json; prints its summary.
import fs from 'node:fs';
import path from 'node:path';
const here=import.meta.dirname,repo=path.resolve(here,'../../..');
const cmp=JSON.parse(fs.readFileSync(path.join(here,'COMPARISON_R7ARA.json'),'utf8')),abl=JSON.parse(fs.readFileSync(path.join(here,'runs/ablation.out.json'),'utf8'));
const reg=JSON.parse(fs.readFileSync(path.join(repo,'CoachingCore/r7/residual-authority/REGRESSION_R7ARA.json'),'utf8'));
const CAUSES={A5:'A5, the canonical factual state before every decision (QE-R7ADA-01): the factual re-plan runs before every review kind',E1:'E1, the return factual ceiling (QE-R7ADA-02, F4-X): a return reads the running state and doses last executed',ALL:'A5 and E1 together'};
const causeOf=v=>!v?null:v.restoredBy.includes('A5')&&v.restoredBy.includes('E1')?'A5|E1':v.restoredBy.includes('A5')?'A5':v.restoredBy.includes('E1')?'E1':v.restoredBy.includes('ALL')?'ALL':null;
const out={revision:'R7ARA-NAMED-DIFFERENCES-1',generatedAt:new Date().toISOString(),sourceDigest:cmp.sourceDigest,causes:CAUSES,groups:{},regression:{},unnamed:[]};
for(const [g,list] of Object.entries(cmp.groups)){
 const named={};
 for(const x of list){
  if(x.verdict==='IDENTICAL')continue;
  if(x.verdict==='LABEL_OR_CLOCK_ONLY'){named[x.name]='LABELS_OR_CLOCKS_ONLY';continue;}
  if(x.verdict==='MISSING'){out.unnamed.push(`${g}/${x.name}: missing output`);continue;}
  const c=causeOf(abl.jobs[`${g}/${x.name}`]);if(c)named[x.name]=c;else out.unnamed.push(`${g}/${x.name}`);
 }
 out.groups[g]={jobs:list.length,identical:list.filter(x=>x.verdict==='IDENTICAL').length,named};
}
for(const [part,list] of [['r6FreshHoldout',reg.r6FreshHoldout],['r5Corpus',reg.r5Corpus],['profiles',reg.profiles],['simulations',reg.simulations]]){
 const kind={r6FreshHoldout:'R6',r5Corpus:'R5',profiles:'PROFILE',simulations:'SIMULATION'}[part],named={};
 for(const x of list.filter(x=>!x.identical)){const id=x.caseId??x.label,c=causeOf(abl.regression[`${kind} ${id}`]);if(c)named[id]=c;else out.unnamed.push(`regression/${part}/${id}`);}
 out.regression[part]={cases:list.length,identical:list.filter(x=>x.identical).length,named,doseRose:list.filter(x=>x.tally?.rose?.length).map(x=>({case:x.caseId??x.label,rose:x.tally.rose}))};
}
out.summary={groups:Object.fromEntries(Object.entries(out.groups).map(([g,v])=>[g,`${v.identical}/${v.jobs} identical, ${Object.keys(v.named).length} named`])),regression:Object.fromEntries(Object.entries(out.regression).map(([p,v])=>[p,`${v.identical}/${v.cases} identical, ${Object.keys(v.named).length} named, ${v.doseRose.length} with a dose risen`])),unnamed:out.unnamed.length};
fs.writeFileSync(path.join(here,'NAMED_DIFFERENCES_R7ARA.json'),JSON.stringify(out,null,1)+'\n');
console.log(JSON.stringify(out.summary,null,1));
