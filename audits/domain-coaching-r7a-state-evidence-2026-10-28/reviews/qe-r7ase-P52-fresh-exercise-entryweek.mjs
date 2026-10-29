// R7ASE-QE-r1 P52 (independent engineering judge, STATE-EVIDENCE-FREEZE-1): cross-exercise. P44's history (A's MODERATE return, re-entry
// week 5; week 5's Wednesday lift missed and week 5 unreviewed (U) or reviewed (R); week 6 under an equipment window without barbell and
// rack, stated Monday 06:00, so back-squat is substituted by a new exercise; week 6 executed in full and reviewed; B Tuesday-Wednesday of
// week 7). A fresh exercise set up in week 6 is "held" by history's review rule and takes the stored value, which the planning review set up
// with the planning view's entry-week flag (projected return steps). Prints B's full entry, field by field, for every exercise in U and R,
// the per-value basis, and the week-6 rows. Oracle (Founder §12, I4, family E): a value of one exercise never depends on another exercise's
// projected state. Read-only; synthetic; DEV_TEST_ONLY; prints only. QE_LIVE_ROOT may point at a copy.
import {H,at,obs,on,addDays,brk,lastR,afterA,print,copy,live,strengthRows} from '../../domain-coaching-r7a-final-2026-10-28/reviews/qe-r7af-lib.mjs';
const perDay=(t,w,keep)=>{for(const s of t.p.weeks[w].sessions.filter(s=>live(s)&&keep(s)&&s.day<6))H.ev(t,at(t.p,w,s.day,'21:00',{kind:'WEEKLY_REVIEW',observations:[obs(t.p,s)]}));};
const sundayOnMonday=(t,w)=>H.ev(t,at(t.p,w+1,0,'06:00',{kind:'WEEKLY_REVIEW',observations:t.p.weeks[w].sessions.filter(s=>live(s)&&s.day===6).map(s=>obs(t.p,s))}));
const miss=s=>s.sport==='STRENGTH'&&s.day===2;
const flat=(o,p='')=>o&&typeof o==='object'?Object.entries(o).flatMap(([k,v])=>flat(v,p?p+'.'+k:k)):[[p,JSON.stringify(o)]];
const {t:base,d0}=afterA('qab-p44'),out={probe:'R7ASE-QE-P52',runtime:process.env.QE_LIVE_ROOT?'QE_LIVE_ROOT':'LIVE',cells:{}};
for(const cell of ['U','R']){
 const t=copy(base);if(cell==='U'){perDay(t,5,s=>!miss(s));sundayOnMonday(t,5);}else H.weekly(t,5,s=>!miss(s));
 const eq=H.ev(t,at(t.p,6,0,'06:00',{kind:'EQUIPMENT_CHANGE',changes:{equipment:['DUMBBELLS','BENCH'],from:t.p.weeks[6].startDate,to:addDays(t.p.weeks[6].startDate,6)}}));
 const rows6=strengthRows(t.p,6,t.p.weeks[6].startDate),rv=H.weekly(t,6);
 const d=t.p.weeks[7].startDate,b=H.ev(t,on(t,addDays(d,3),'06:00',brk(addDays(d,1),addDays(d,2)))),B=lastR(t.p);
 out.cells[cell]={equipment:eq,week6Rows:rows6,week6Review:rv,week7StartAuthority:{STRENGTH:t.p.weeks[7].startAuthority?.STRENGTH?.provenance,projectedBase:t.p.weeks[7].startAuthority?.STRENGTH?.projectedBase??null},
  B:b,class:B.interruption.class,stateAt:`${B.interruption.stateAt.kind}/w${B.interruption.stateAt.week}`,values:B.interruption.stateAt.values?.STRENGTH,entry:B.interruption.entry.strength.exercises,
  planningWeek7:Object.fromEntries(Object.entries(t.p.stateTrace[7].strength.exercises).map(([id,e])=>[id,`${e.mode}${e.load??''} step ${e.returnStep??'-'} sets ${e.sets??'-'} ceil ${e.setCeiling??'-'} cap ${e.setCap??'-'}`])),
  executed:t.ledger.filter(o=>o.logs&&o.context?.weekIndex>=5).flatMap(o=>Object.entries(o.logs).map(([id,l])=>`${o.localDate} ${id} ${l.load}x${l.reps} sets ${l.setsDone}`))};
}
const U=out.cells.U,R=out.cells.R,ids=[...new Set([...Object.keys(U.entry),...Object.keys(R.entry)])].sort();
out.entryDiff=Object.fromEntries(ids.map(id=>{const A=new Map(flat(U.entry[id]??{})),Bm=new Map(flat(R.entry[id]??{}));return [id,[...new Set([...A.keys(),...Bm.keys()])].filter(k=>A.get(k)!==Bm.get(k)).map(k=>`${k}: U=${A.get(k)} R=${Bm.get(k)}`)];}).filter(([,v])=>v.length));
print(out);
