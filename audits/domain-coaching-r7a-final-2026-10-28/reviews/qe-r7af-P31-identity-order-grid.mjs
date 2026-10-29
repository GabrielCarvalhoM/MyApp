// R7AF-QE-r1 P31 (independent engineering judge, R7A-FINAL-FREEZE): identity under report order and timing (Founder §18; brief "where to look
// hardest"). After A (16-day break reported Monday 06:00 of week 5; Tue run + Wed lift executed and reported Wed 21:00), a second report of A
// (A2) and a separate break B are made in every order and at every clock relative to B: before B began, on B's first day (06:00 and 20:00),
// during B, after B ended but before B's report, and after B's report.
//  A2 kinds: the same record without a name (DUP), the same dates named by A's identity (NAMED), named by A's report id (NAMED_BY_REPORT),
//  a named earlier start (NAMED_EARLIER), a named earlier end (NAMED_SHORTER), an unnamed earlier start (UNNAMED_SHIFT, expected ASK).
//  B placements: Thu-Fri of week 5 (same week), Mon-Tue of week 6 with week 5 unreviewed, the same with week 5 reviewed on Sunday.
//  B naming: unnamed, or a fresh name ('trip-B').
// Oracles: V1 B never SAME_BREAK of A nor A's identity; V2 a named/duplicate A2 never NEW nor a different identity; V3 B's point is one of A's
// reports (RETURN) or, after the Sunday review, the reviewed week-6 start; never a week start at or before A's re-entry week; V4 no pre-break
// dose row (known load at 3+ sets) and no long run above 45 min in B's week and the next; V5 an A2 after B's report is ASK; V6 (P1) for DUP
// and NAMED (no fact changed) B's entry equals the control's (no A2), last performed dates aside.
// Synthetic data, DEV_TEST_ONLY authority, prints only.
import {H,afterA,reportOn,at,on,addDays,brk,lastR,returns,dec,entryOf,preBreakDose,runRows,print,copy,weekOfDay} from './qe-r7af-lib.mjs';
const out={probe:'R7AF-QE-P31',runtime:process.env.QE_LIVE_ROOT?'QE_LIVE_ROOT':'LIVE',tally:{cells:0,violating:0,byOracle:{V1:0,V2:0,V3:0,V4:0,V5:0,V6:0}},violations:[],cells:[]};
const TZ=Number(process.env.QE_TZ??0);out.tz=TZ;
const base0=afterA('qaf-p31',TZ?{tz:TZ}:{});reportOn(base0.t,5,2,'21:00',s=>s.day<3);
const {d0,A}=base0,Aid=A.interruption.episode;
const reviewed=copy(base0.t);H.weekly(reviewed,5,()=>false);
const PLACE={sameWeek:{t:base0.t,b0:3,len:2},nextWeekUnreviewed:{t:base0.t,b0:7,len:2},nextWeekReviewed:{t:reviewed,b0:7,len:2}};
const A2={
 DUP:()=>brk(addDays(d0,-16),addDays(d0,-1),{reason:'Long work trip'}),
 NAMED:()=>brk(addDays(d0,-16),addDays(d0,-1),{episodeId:Aid}),
 NAMED_BY_REPORT:()=>brk(addDays(d0,-16),addDays(d0,-1),{episodeId:A.eventId,reason:'Long work trip'}),
 NAMED_EARLIER:()=>brk(addDays(d0,-17),addDays(d0,-1),{episodeId:Aid}),
 NAMED_SHORTER:()=>brk(addDays(d0,-16),addDays(d0,-2),{episodeId:Aid}),
 UNNAMED_SHIFT:()=>brk(addDays(d0,-17),addDays(d0,-1))
};
const strip=e=>JSON.stringify(e);
for(const [pn,P] of Object.entries(PLACE)){
 const bs=addDays(d0,P.b0),be=addDays(bs,P.len-1),rep=addDays(be,1);
 const TIMES={beforeB:[addDays(bs,-1),'22:00'],bFirstDay0600:[bs,'06:00'],bFirstDay2000:[bs,'20:00'],duringB:[be,'12:00'],afterBbeforeReport:[rep,'05:00'],afterBReport:[rep,'09:00']};
 for(const bName of [null,'trip-B']){
  const Bx=()=>brk(bs,be,bName?{episodeId:bName}:{});
  // control: B alone
  const ctl=copy(P.t);H.ev(ctl,on(ctl,rep,'07:00',Bx()));const C=lastR(ctl.p);
  for(const [kn,mk] of Object.entries(A2))for(const [tn,[day,hm]] of Object.entries(TIMES)){
   const t=copy(P.t),seq=[[day,hm,'A2',mk],[rep,'07:00','B',Bx]].sort((x,y)=>(x[0]+x[1]).localeCompare(y[0]+y[1])),log={};
   for(const [d,h,what,f] of seq){const s=H.ev(t,on(t,d,h,f()));log[what]={result:s,decision:s.includes('REESTABLISH')?dec(lastR(t.p)):null,missingInputs:t.last.missingInputs??[]};}
   const Bd=log.B.decision,A2d=log.A2.decision,v=[];
   if(Bd&&(Bd.relation==='SAME_BREAK'||Bd.episode===Aid))v.push(['V1',`B ${Bd.relation} episode ${Bd.episode}`]);
   if(A2d&&kn!=='UNNAMED_SHIFT'&&(A2d.relation==='NEW'||A2d.episode!==Aid))v.push(['V2',`A2 ${A2d.relation} episode ${A2d.episode}`]);
   if(A2d&&kn==='UNNAMED_SHIFT')v.push(['V2',`unnamed shifted A2 applied: ${A2d.relation}`]);
   const aReports=new Set(returns(t.p).filter(d=>d.interruption.episode===Aid).map(d=>d.eventId));
   if(Bd&&!(Bd.stateAt.kind==='RETURN'&&aReports.has(Bd.stateAt.eventId))&&!(pn==='nextWeekReviewed'&&Bd.stateAt.kind==='WEEK_START'&&Bd.stateAt.week===6))v.push(['V3',`B point ${Bd.stateAt.kind}/w${Bd.stateAt.week}/${Bd.stateAt.eventId}`]);
   if(Bd){const wB=weekOfDay(t.p,rep),pb=[...preBreakDose(t.p,wB,rep),...preBreakDose(t.p,wB+1,rep)],lg=[...runRows(t.p,wB,rep),...runRows(t.p,wB+1,rep)].filter(r=>/ LONG /.test(r)&&Number(r.split(':').at(-1))>45);if(pb.length||lg.length)v.push(['V4',[...pb,...lg].slice(0,3).join('; ')]);}
   if(tn==='afterBReport'&&log.A2.result!=='ASK/ASK')v.push(['V5',`A2 after B's report: ${log.A2.result}`]);
   if(Bd&&['DUP','NAMED','NAMED_BY_REPORT'].includes(kn)){const noLP=e=>strip({run:e.run,strength:e.strength});if(noLP(entryOf(lastR(t.p).interruption.episode===Bd.episode?lastR(t.p):returns(t.p).find(d=>d.eventId===Bd.eventId)))!==noLP(entryOf(C)))v.push(['V6',`B entry differs from control: ${entryOf(returns(t.p).find(d=>d.eventId===Bd.eventId)).run} vs ${entryOf(C).run}`]);}
   out.tally.cells++;if(v.length){out.tally.violating++;for(const [o] of v)out.tally.byOracle[o]++;out.violations.push({place:pn,bName,a2:kn,timing:tn,v});}
   out.cells.push({place:pn,bName,a2:kn,timing:tn,order:seq.map(x=>x[2]+'@'+x[0]+' '+x[1]),A2:log.A2.result+(A2d?` ${A2d.relation}/${A2d.basis}/rev${A2d.revision} point ${A2d.stateAt.kind}/w${A2d.stateAt.week}`:' '+log.A2.missingInputs.join(',')),B:log.B.result+(Bd?` ${Bd.relation}/${Bd.basis} ep=${Bd.episode===Aid?'A':Bd.episode===bName?'trip-B':'own'} point ${Bd.stateAt.kind}/w${Bd.stateAt.week}/${Bd.stateAt.eventId===A.eventId?'A1':Bd.stateAt.eventId===A2d?.eventId?'A2':Bd.stateAt.eventId}`:' '+log.B.missingInputs.join(',')),violations:v.map(x=>x[0])});
  }
 }
}
print(out);
