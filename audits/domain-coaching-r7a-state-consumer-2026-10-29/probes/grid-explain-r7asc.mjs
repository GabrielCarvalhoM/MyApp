// Author probe (prints only): explains every difference the SSCTR's restoration grid shows between this runtime and STATE-EVIDENCE-FREEZE-1 (the
// freeze the SSCTR accepted for D53 and D56-D59), using the same timelines on HISTORICAL-PROJECTION-FREEZE-1 (the predecessor). Input: three
// outputs of grid-signature-r7asc.mjs for the same shard (live, SE, predecessor). Each row of each week, per exercise in order, is either identical
// to SE, or falls in a named class:
//  - CARRIED_FROM_PREDECESSOR: identical to the predecessor's row (a change the predecessor made and the SSCTR read on it: the return base, R7ASM
//    "Return base: Approved", the return resuming the dose last executed instead of a load never lifted);
//  - GOAL_RANGE_CUT: SE's row with its repetition target cut at the goal's range (this mission, Property C / F3: a row of a known dose is never
//    above the current goal's range, as the KNOWN row already cut it);
//  - F1_RESTORED_WITH_RETURN_BASE: SE's row kind and sets (the return step F1 had skipped, restored) with the predecessor's repetition target (the
//    return base above);
//  - UNEXPLAINED: anything else.
// Usage: node grid-explain-r7asc.mjs <live.json> <se.json> <predecessor.json>
import fs from 'node:fs';
const [L,S,H]=process.argv.slice(2).map(f=>JSON.parse(fs.readFileSync(f,'utf8')));
const HI={STRENGTH:6,HYPERTROPHY:12,RUNNING_SUPPORT:10};
const byEx=w=>{const m={};for(const r of w.split(/:(.*)/s)[1].split(' caps:')[0].split(',').filter(Boolean)){const [id,v]=r.split('=');(m[id]??=[]).push(v);}return m;};
const repsOf=v=>Number(v?.match(/x(\d+)@/)?.[1]),withReps=(v,r)=>v.replace(/x\d+@/,'x'+r+'@'),cut=(v,hi)=>withReps(v,Math.min(repsOf(v),hi));
const out={probe:'grid-explain-r7asc',grid:{live:{timelines:L.timelines,B:L.B.violations,C:L.C.violations,A_riseOrEnd:L.A.riseOrEnd,A2_held:L.A2.held},se:{timelines:S.timelines,B:S.B.violations,C:S.C.violations},predecessor:{timelines:H.timelines,B:H.B.violations,C:H.C.violations}},
 timelinesDifferingFromSE:0,rows:{},capsOnlyWeeks:0,unexplained:[],byTimeline:{}};
for(const id of Object.keys(L.sigs)){
 if(JSON.stringify(L.sigs[id])===JSON.stringify(S.sigs[id]))continue;out.timelinesDifferingFromSE++;const goal=id.split('-')[2],hi=HI[goal],seen=new Set();
 L.sigs[id].forEach((w,i)=>{const a=byEx(w),s=byEx(S.sigs[id][i]),h=byEx(H.sigs[id][i]);let rowsDiffer=false;
  for(const ex of new Set([...Object.keys(a),...Object.keys(s)]))for(let j=0;j<Math.max(a[ex]?.length??0,s[ex]?.length??0);j++){const x=a[ex]?.[j],y=s[ex]?.[j],z=h[ex]?.[j];if(x===y)continue;rowsDiffer=true;
   const k=x===z?'CARRIED_FROM_PREDECESSOR':x&&y&&x===cut(y,hi)?'GOAL_RANGE_CUT':x&&y&&z&&x===withReps(y,repsOf(z))?'F1_RESTORED_WITH_RETURN_BASE':'UNEXPLAINED';
   out.rows[k]=(out.rows[k]??0)+1;seen.add(k);if(k==='UNEXPLAINED'&&out.unexplained.length<20)out.unexplained.push({timeline:id,week:w.split(':')[0],exercise:ex,live:x??null,se:y??null,predecessor:z??null});}
  if(!rowsDiffer&&w!==S.sigs[id][i])out.capsOnlyWeeks++;});
 out.byTimeline[id]=[...seen].sort();
}
out.allExplained=!out.rows.UNEXPLAINED;
console.log(JSON.stringify(out,null,1));
