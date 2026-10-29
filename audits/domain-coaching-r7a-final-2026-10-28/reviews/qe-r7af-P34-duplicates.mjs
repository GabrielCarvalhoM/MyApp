// R7AF-QE-r1 P34 (independent engineering judge, R7A-FINAL-FREEZE): duplicate identity (Founder 0.4 "demonstrable duplicate -> SAME EPISODE /
// DEDUPE", §14 P6; contract §3 rules 2-3). A = 16-day break reported Monday 06:00 of week 5 (default program); Tue run + Wed lift logged.
//  D1 the same report again (same event id, same facts) -> KEEP, nothing added;  D2 same event id, other facts -> ASK event.id;
//  D3 the same record with a new event id at once -> SAME_BREAK DUPLICATE revision 2, one episode, plan unchanged;
//  D4 the same record with a new id after the re-entry weeks 5 and 6 were executed and reviewed (week 7) -> same episode; what happens to the
//     plan (re-derived from the break's start, i.e. the return restarted)?;
//  D5 A's record (new id) after a separate break B was reported -> ASK;  D6 A's report replayed (same id) after B -> KEEP;
//  D7 B's report replayed -> KEEP;  D8 B's record with a new id -> SAME_BREAK of B;  D9 the identical interruption object with a new id ->
//     DUPLICATE (not KEEP: only the event id dedupes).
// Synthetic data, DEV_TEST_ONLY authority, prints only.
import {H,R,opts,at,on,addDays,brk,lastR,returns,episodes,dec,entryOf,strengthRows,runRows,print,copy,afterA,reportOn,peek} from './qe-r7af-lib.mjs';
const out={probe:'R7AF-QE-P34',runtime:process.env.QE_LIVE_ROOT?'QE_LIVE_ROOT':'LIVE',cases:{},checks:[]};
const check=(name,ok,detail='')=>out.checks.push({name,ok,detail});
const {t:base,d0,A}=afterA('qaf-p34');reportOn(base,5,2,'21:00',s=>s.day<3);
const Arev=at(base.p,5,0,'06:00',brk(addDays(d0,-16),addDays(d0,-1)));
const plan=P=>JSON.stringify(P.weeks.slice(5).map(w=>w.sessions.map(s=>[s.id,s.status??'',s.prescription?JSON.stringify(s.prescription.exercises?.map(e=>[e.id,e.sets,e.reps,e.rir,e.load.mode,e.load.value])??s.prescription.durationMinutes):'-'])));
// D1, D2
{const r=peek(base,{...Arev,event:{...Arev.event,id:A.eventId}});out.cases.D1={status:r.status,proposal:!!r.proposal};check('D1 same id same facts: KEEP',r.status==='KEEP'&&!r.proposal);
 const x=peek(base,{...Arev,event:{...Arev.event,id:A.eventId},interruption:{...Arev.interruption,reason:'Holiday'}});out.cases.D2={status:x.status,missing:x.missingInputs};check('D2 same id other facts: ASK event.id',x.status==='ASK'&&JSON.stringify(x.missingInputs)==='["event.id"]');}
// D3
{const t=copy(base),before=plan(t.p),s=H.ev(t,on(t,addDays(d0,2),'22:00',brk(addDays(d0,-16),addDays(d0,-1))));const D=dec(lastR(t.p));
 out.cases.D3={s,D,episodes:episodes(t.p).length,planUnchanged:plan(t.p)===before};check('D3 same record new id: one episode, revision 2',D.relation==='SAME_BREAK'&&D.basis==='DUPLICATE'&&D.revision===2&&episodes(t.p).length===1);
 if(plan(t.p)!==before){const diffs=[];for(let w=5;w<9;w++){const a=[...runRows(base.p,w,addDays(d0,3)),...strengthRows(base.p,w,addDays(d0,3))],b=[...runRows(t.p,w,addDays(d0,3)),...strengthRows(t.p,w,addDays(d0,3))];if(JSON.stringify(a)!==JSON.stringify(b))diffs.push({week:w,before:a,after:b});}out.cases.D3.diffs=diffs;}}
// D4: late duplicate after executed and reviewed re-entry weeks
{const ctl=copy(base);H.weekly(ctl,5,s=>s.day>=3);H.weekly(ctl,6);const t=copy(ctl);
 const s=H.ev(t,at(t.p,7,0,'06:00',brk(addDays(d0,-16),addDays(d0,-1))));const D=dec(lastR(t.p));
 out.cases.D4={s,D,episodes:episodes(t.p).length,week7:{withoutDuplicate:[...runRows(ctl.p,7,addDays(d0,14)),...strengthRows(ctl.p,7,addDays(d0,14))],withDuplicate:[...runRows(t.p,7,addDays(d0,14)),...strengthRows(t.p,7,addDays(d0,14))]},startW7:{withoutDuplicate:entryOf({interruption:{entry:ctl.p.stateTrace[7]}}),withDuplicate:entryOf({interruption:{entry:t.p.stateTrace[7]}})}};
 check('D4 late duplicate: same episode',D?.relation==='SAME_BREAK'&&episodes(t.p).length===1,s);}
// B, then D5-D8
{const t=copy(base);H.ev(t,on(t,addDays(d0,6),'07:00',brk(addDays(d0,3),addDays(d0,5))));const B=lastR(t.p);
 const d5=peek(t,on(t,addDays(d0,6),'08:00',brk(addDays(d0,-16),addDays(d0,-1))));check('D5 A record after B: ASK',d5.status==='ASK',d5.status+' '+d5.missingInputs);
 const d6=peek(t,{...Arev,event:{...Arev.event,id:A.eventId}});check('D6 A replay after B: KEEP',d6.status==='KEEP'&&!d6.proposal,d6.status);
 const Bre=on(t,addDays(d0,6),'07:00',brk(addDays(d0,3),addDays(d0,5)));const d7=peek(t,{...Bre,event:{...Bre.event,id:B.eventId}});check('D7 B replay: KEEP',d7.status==='KEEP'&&!d7.proposal,d7.status);
 const s8=H.ev(t,on(t,addDays(d0,6),'09:00',brk(addDays(d0,3),addDays(d0,5))));const D8=dec(lastR(t.p));check('D8 B record new id: SAME_BREAK of B',D8.relation==='SAME_BREAK'&&D8.episode===B.interruption.episode,s8);
 out.cases.D5_8={d5:[d5.status,d5.missingInputs],d6:d6.status,d7:d7.status,d8:D8};}
// D9 identical object, new id
{const t=copy(base),x=at(t.p,5,2,'23:00',brk(addDays(d0,-16),addDays(d0,-1)));x.interruption={...A.interruption&&Arev.interruption};const s=H.ev(t,x);out.cases.D9={s,D:dec(lastR(t.p))};check('D9 identical object new id: a DUPLICATE revision (event id is the only replay key)',dec(lastR(t.p)).basis==='DUPLICATE',s);}
print(out);
