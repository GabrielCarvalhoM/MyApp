// R7AF-QE-r1 P35 (independent engineering judge, R7A-FINAL-FREEZE): three interruptions with short returns and their easy slots (Founder I2,
// I8; contract §6), and the QE-R7A2-01 shape one level up: a report of the middle break B (duplicate or named correction) made before C began,
// during C, after C ended but before C's report, and after C's report.
// Default program, weeks 0-2 trained. A: 6 days to Sunday of week 2, reported Monday 06:00 of week 3 (slot: Tuesday of week 3, then run).
// B: Wed-Fri of week 3, reported Saturday 07:00 (slot: the next quality slot, Tuesday of week 4). Week 3 reviewed Sunday (Sat/Sun executed).
// Tuesday of week 4 (B's slot) and Monday executed, reported Tuesday 21:00. C: Wed-Fri of week 4, reported Saturday 07:00 (own slot expected
// in week 5). Oracles: C NEW with its own identity, never SAME_BREAK of B or A; a report of B is SAME_BREAK of B (or ASK), never NEW; after
// C's report a report of B is ASK; one easy slot per break and no break with two; C's slot is C's (easedFor C); no break adopts another's slot.
// Synthetic data, DEV_TEST_ONLY authority, prints only.
import {H,at,on,obs,addDays,brk,lastR,returns,episodes,dec,print,copy,reportOn,live} from './qe-r7af-lib.mjs';
const out={probe:'R7AF-QE-P35',runtime:process.env.QE_LIVE_ROOT?'QE_LIVE_ROOT':'LIVE',cells:[],tally:{cells:0,violating:0},violations:[]};
const t0=H.start({id:'qaf-p35'},3),w=3,d0=t0.p.weeks[w].startDate;
H.ev(t0,at(t0.p,w,0,'06:00',brk(addDays(d0,-6),addDays(d0,-1))));const A=lastR(t0.p);
reportOn(t0,w,1,'21:00',s=>s.day<=1);
H.ev(t0,at(t0.p,w,5,'07:00',brk(addDays(d0,2),addDays(d0,4))));const B=lastR(t0.p);
H.weekly(t0,w,s=>s.day>=5);reportOn(t0,w+1,1,'21:00',s=>s.day<=1);
const base={t:t0,A,B},Bid=B.interruption.episode;
const slots=P=>P.weeks.slice(3,8).flatMap(x=>x.sessions.filter(s=>s.easedFor).map(s=>`${s.id}:${s.easedFor}`));
const c0=addDays(d0,9),c1=addDays(d0,11),crep=addDays(d0,12);
const TIMES={beforeC:[addDays(c0,-1),'22:00'],cFirstDay:[c0,'12:00'],duringC:[c1,'12:00'],afterCbeforeReport:[crep,'05:00'],afterCReport:[crep,'09:00']};
const KINDS={DUP:()=>brk(addDays(d0,2),addDays(d0,4),{reason:'Long trip'}),NAMED:()=>brk(addDays(d0,2),addDays(d0,4),{episodeId:Bid}),NAMED_EARLIER:()=>brk(addDays(d0,1),addDays(d0,4),{episodeId:Bid})};
// control: C alone
{const t=copy(base.t);H.ev(t,on(t,crep,'07:00',brk(c0,c1)));out.control={C:dec(lastR(t.p)),slots:slots(t.p),episodes:episodes(t.p).length};}
for(const [kn,mk] of Object.entries(KINDS))for(const [tn,[day,hm]] of Object.entries(TIMES)){
 const t=copy(base.t),seq=[[day,hm,'B2',mk],[crep,'07:00','C',()=>brk(c0,c1)]].sort((x,y)=>(x[0]+x[1]).localeCompare(y[0]+y[1])),log={};
 for(const [d,h,what,f] of seq){const s=H.ev(t,on(t,d,h,f()));log[what]={result:s,decision:s.includes('REESTABLISH')?dec(lastR(t.p)):null,missing:t.last.missingInputs??[]};}
 H.weekly(t,w+1,s=>s.day>=5);
 const C=log.C.decision,B2=log.B2.decision,sl=slots(t.p),v=[];
 if(!C||C.relation!=='NEW'||[A.interruption.episode,Bid].includes(C.episode))v.push(`C ${log.C.result} ${C?.relation} ${C?.episode}`);
 if(B2&&(B2.relation!=='SAME_BREAK'||B2.episode!==Bid))v.push(`B2 ${B2.relation} ${B2.episode}`);
 if(tn==='afterCReport'&&log.B2.result!=='ASK/ASK')v.push('B2 after C report not asked: '+log.B2.result);
 const by={};for(const s of sl){const e=s.split(':').at(-1);by[e]=(by[e]??0)+1;}
 if(Object.values(by).some(n=>n>1))v.push('a break with two slots: '+JSON.stringify(by));
 if(C&&!by[C.episode])v.push('C has no slot of its own: '+sl.join(','));
 if(C&&C.stateAt.eventId&&returns(t.p).find(d=>d.eventId===C.stateAt.eventId)?.interruption.episode!==Bid)v.push('C point not a report of B: '+JSON.stringify(C.stateAt));
 out.tally.cells++;if(v.length){out.tally.violating++;out.violations.push({kind:kn,timing:tn,v});}
 out.cells.push({kind:kn,timing:tn,order:seq.map(x=>x[2]),B2:log.B2.result+(B2?` ${B2.relation}/${B2.basis}/rev${B2.revision}`:' '+log.B2.missing.join(',')),C:log.C.result+(C?` ${C.relation}/${C.basis} point ${C.stateAt.kind}/w${C.stateAt.week}`:''),episodes:episodes(t.p).length,slots:sl.map(s=>s.replace(A.interruption.episode,'A').replace(Bid,'B').replace(C?.episode??'#','C')),violations:v});
}
print(out);
