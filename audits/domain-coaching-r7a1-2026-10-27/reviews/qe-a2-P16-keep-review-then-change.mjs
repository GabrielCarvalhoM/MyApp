// R7A1-QE-r2 P16 (follows P15): the weekly review answers KEEP ("the planned progression step stands") and records nothing; a change of
// the complete week the same evening then starts next week from the week's evidence (C3). Does that re-derivation equal the start the
// review let stand? Changes: a no-op equipment statement (recorded on A2 only), a schedule change, a goal change, a real equipment swap
// and a window over next week. Compared field by field on next week's strength and run start and next week's rows of the exercises that
// all variants keep. Synthetic data, DEV_TEST_ONLY authority, prints only. Runs on the live tree or QE_LIVE_ROOT.
import {runtime,make,at,obs,line,print} from './qe-a2-lib.mjs';
const RT=await runtime('A1'),H=make(RT);
const ALL=['DUMBBELLS','BENCH','BARBELL','RACK'];
const diff=(a,b,p='',out=[])=>{if(JSON.stringify(a)===JSON.stringify(b))return out;if(a&&b&&typeof a==='object'&&typeof b==='object'){for(const k of new Set([...Object.keys(a),...Object.keys(b)]))diff(a[k],b[k],p+'.'+k,out);}else out.push(`${p}: ${JSON.stringify(b)} -> ${JSON.stringify(a)}`);return out;};
const startOf=(P,w)=>{const {anchor,...st}=P.stateTrace[w]??{};return st;};
const out={probe:'R7A1-QE-P16',runtime:process.env.QE_LIVE_ROOT?'QE_LIVE_ROOT':'LIVE',cases:{}};
for(const [pname,ia] of Object.entries({plain:{id:'qa2-p15a'},plain2:{id:'qa2-p16b',schedule:{runDays:[0,2,5],strengthDays:[1,4],longRunDay:5}}})){
 for(const W of [1,2,3,4]){
  const base=H.start(ia,W),w=W;const review=H.weekly(base,w);
  const ref=startOf(base.p,w+1),refRows=line(base.p,w+1);
  const d0n=base.p.weeks[w+1].startDate,end=new Date(Date.parse(d0n)+6*864e5).toISOString().slice(0,10);
  const changes={
   noopEquipment:{kind:'EQUIPMENT_CHANGE',changes:{equipment:[...ALL,'TREADMILL']}},
   scheduleSameDays:{kind:'SCHEDULE_CHANGE',changes:{runMinutes:61}},
   goalSame:{kind:'GOAL_CHANGE',changes:{goals:{run:'PERFORMANCE',strength:'STRENGTH'}}},
   windowNextWeek:{kind:'EQUIPMENT_CHANGE',changes:{equipment:['DUMBBELLS','BENCH'],from:d0n,to:end}}};
  for(const [n,x] of Object.entries(changes)){
   const T=H.copy(base),r=H.ev(T,at(T.p,w,6,'22:00',x)),d=diff(startOf(T.p,w+1),ref);
   // Only the exercises both plans keep: the state fields that progression owns (reps, load, sets, loadTick, mode, run doses).
   const owned=d.filter(s=>{const p=s.split(': ')[0];return /\.(reps|load|sets|loadTick|mode|easy|long|qualityStep|qualityDone|easyWeeksDone|stridesDone|returnStep|setCap|regainCap)$/.test(p)&&!/\.(planned|achieved|longByWeek)\./.test(p);});
   out.cases[`${pname}:w${w}:${n}`]={review,result:r,startDiff:owned,allStartDiffs:d.length};
  }
 }
}
out.summary=Object.entries(out.cases).filter(([k,v])=>v.startDiff.length).map(([k,v])=>`${k} (${v.review}; ${v.result}): ${v.startDiff.join(', ')}`);
print(out);
