// R7ASE-QE-r1 I01 (independent engineering judge, STATE-EVIDENCE-FREEZE-1): instrumentation of P40b's Sunday-long-run cells, where B's entry
// still differs between U (week F unreviewed) and R (week F reviewed). Prints, per cell: the run state each week start stores (planning view)
// with its authority and projectedBase; B's recorded per-value basis (interruption.stateAt.values) and entry; the long runs the ledger shows.
// Read-only; synthetic data; DEV_TEST_ONLY authority; prints only. QE_LIVE_ROOT may point at a copy.
import {H,at,obs,on,addDays,brk,lastR,print,copy,live} from '../../domain-coaching-r7a-final-2026-10-28/reviews/qe-r7af-lib.mjs';
const perDay=(t,w,keep)=>{for(const s of t.p.weeks[w].sessions.filter(s=>live(s)&&keep(s)&&s.day<6))H.ev(t,at(t.p,w,s.day,'21:00',{kind:'WEEKLY_REVIEW',observations:[obs(t.p,s)]}));};
const sundayOnMonday=(t,w,keep)=>H.ev(t,at(t.p,w+1,0,'06:00',{kind:'WEEKLY_REVIEW',observations:t.p.weeks[w].sessions.filter(s=>live(s)&&s.day===6&&keep(s)).map(s=>obs(t.p,s))}));
const miss=s=>s.sport==='RUN'&&s.day===6,F=2;
const F1={sameMissed:(t,w)=>H.weekly(t,w,s=>!miss(s)),nothing:(t,w)=>H.weekly(t,w,()=>false)};
const runOf=st=>st?{mode:st.mode,long:st.long,easy:st.easy,qualityStep:st.qualityStep,easyWeeksDone:st.easyWeeksDone,devCount:st.devCount,longByWeek:st.longByWeek,planned:st.planned?{long:st.planned.long,easy:st.planned.easy}:undefined}:null;
const auth=a=>a?{RUN:a.RUN?.provenance+(a.RUN?.projectedBase?' projectedBase='+JSON.stringify(a.RUN.projectedBase):''),STRENGTH:a.STRENGTH?.provenance+(a.STRENGTH?.projectedBase?' projectedBase='+JSON.stringify(a.STRENGTH.projectedBase):'')}:null;
const out={probe:'R7ASE-QE-I01',runtime:process.env.QE_LIVE_ROOT?'QE_LIVE_ROOT':'LIVE',cells:{}};
for(const [fn,f1] of Object.entries(F1)){
 const base=H.start({id:`qab-p40b-sundayLong-${fn}`},F);
 for(const cell of ['U','R']){
  const t=copy(base);if(cell==='U'){perDay(t,F,s=>!miss(s));sundayOnMonday(t,F,s=>!miss(s));}else H.weekly(t,F,s=>!miss(s));
  const w3={auth:auth(t.p.weeks[F+1].startAuthority),run:runOf(t.p.stateTrace[F+1].run)};
  const rv=f1(t,F+1);
  const w4={auth:auth(t.p.weeks[F+2].startAuthority),run:runOf(t.p.stateTrace[F+2].run)};
  const d=t.p.weeks[F+2].startDate,b=H.ev(t,on(t,addDays(d,3),'06:00',brk(addDays(d,1),addDays(d,2)))),B=lastR(t.p);
  out.cells[fn+'/'+cell]={weekF1Start:w3,f1Review:rv,weekF2Start:w4,B:b,stateAt:{kind:B.interruption.stateAt.kind,week:B.interruption.stateAt.week,authority:B.interruption.stateAt.authority,RUNvalue:B.interruption.stateAt.values?.RUN},entryRun:runOf(B.interruption.entry.run),
   longRuns:t.ledger.filter(o=>o.context?.sport==='RUN'&&o.context.role==='LONG').map(o=>`${o.localDate} LONG ${o.actual.minutes} (week ${o.context.weekIndex})`)};
 }
}
print(out);
