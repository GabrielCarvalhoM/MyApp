// R7AF-QE-r1 P32 (independent engineering judge, R7A-FINAL-FREEZE): late historical evidence (Founder 0.7, I6; contract §5, boundaries B1/B2).
// First loaded week F (strength Mon/Thu PM, runs Tue/Fri/Sun AM; the weeks before trained and reviewed), FAMILIAR and KNOWN athletes.
//  L0 in time: Monday's lift logged Monday; break Wed-Fri; return Saturday 06:00 -> the reference entry.
//  L1 sync before the return: Monday's lift synced Friday 21:00 (executed Monday) -> entry equals L0 (report time never decides causality).
//  L2 sync after the return, inside its re-entry week: ASK (confirm), nothing re-planned, the fact recorded; confirmed by the same dates (L2a)
//     or by the name (L2b) -> entry equals L0; the next weekly review is not asked again (no loop).
//  L2c the sync is followed by an ordinary weekly review instead of the confirmation -> still asked (confirmation-first).
//  L3 sync after the re-entry week (B1): no question, the return is not replayed.
//  L4 week boundary (B2): break Monday-Wednesday of week F+1, Thursday's lift of week F synced after the return, week F reviewed or not.
//  L5 the second interruption: A (16 days) reported Monday of week 5 of the default program, Tue run + Wed lift logged, Saturday's lift executed
//     but synced only after B (Mon-Tue of week 6) was reported -> B's return asks to be confirmed, then reads it.
//  L6 a late fact that moves only a last performed date (Thursday's lift synced late when Monday's, with the same exercises and counts, was in
//     time): asked or not? (the same-day rule treats a date-only difference as immaterial).
// Synthetic data, DEV_TEST_ONLY authority, prints only.
import {H,R,opts,at,obs,addDays,brk,lastR,dec,entryOf,stateSummary,print,copy,afterA,reportOn,on,live} from './qe-r7af-lib.mjs';
const out={probe:'R7AF-QE-P32',runtime:process.env.QE_LIVE_ROOT?'QE_LIVE_ROOT':'LIVE',cases:{},checks:[]};
const check=(name,ok,detail='')=>out.checks.push({name,ok,detail});
const ATH={FAMILIAR:{knownExercises:[]},KNOWN:{}};
function firstLoaded(id,cls){
 const t=H.start({id,athlete:ATH[cls],schedule:{strengthDays:[0,3],runDays:[1,4,6],longRunDay:6}},0);
 const F=t.p.weeks.findIndex(x=>x.sessions.some(s=>s.sport==='STRENGTH'&&s.prescription?.exercises?.some(e=>e.load.mode!=='BODYWEIGHT'&&e.exposure?.kind!=='PRACTICE')));
 for(let w=0;w<F;w++)H.weekly(t,w);return {t,F,d:t.p.weeks[F].startDate};
}
const lifts=(P,F,day)=>P.weeks[F].sessions.filter(s=>live(s)&&s.sport==='STRENGTH'&&s.day===day);
const sync=(t,F,day,whenDay,hm,sessions)=>H.ev(t,on(t,whenDay,hm,{kind:'PARTIAL_SESSION',observations:sessions.map(s=>obs(t.p,s))}));
const noLP=st=>JSON.stringify({run:st?.run,strength:Object.fromEntries(Object.entries(st?.strength??{}).map(([k,v])=>[k,v]))});
for(const cls of ['FAMILIAR','KNOWN']){
 const C=out.cases[cls]={};
 // L0
 {const {t,F,d}=firstLoaded(`qaf-p32-l0-${cls}`,cls);sync(t,F,0,d,'21:00',lifts(t.p,F,0));const r=H.ev(t,on(t,addDays(d,5),'06:00',brk(addDays(d,2),addDays(d,4))));C.L0={r,ret:dec(lastR(t.p)),entry:entryOf(lastR(t.p))};}
 // L1
 {const {t,F,d}=firstLoaded(`qaf-p32-l1-${cls}`,cls);const s=sync(t,F,0,addDays(d,4),'21:00',lifts(t.p,F,0));const r=H.ev(t,on(t,addDays(d,5),'06:00',brk(addDays(d,2),addDays(d,4))));C.L1={sync:s,r,entry:entryOf(lastR(t.p))};
  check(`${cls} L1 sync before return = in time`,noLP(C.L1.entry)===noLP(C.L0.entry));}
 // L2 a/b/c
 for(const how of ['a_sameDates','b_named','c_weeklyFirst']){
  const {t,F,d}=firstLoaded(`qaf-p32-l2${how}-${cls}`,cls);H.ev(t,on(t,addDays(d,5),'06:00',brk(addDays(d,2),addDays(d,4))));const Rb=lastR(t.p),entryBefore=entryOf(Rb),pBefore=t.p;
  const s=sync(t,F,0,addDays(d,5),'07:00',lifts(t.p,F,0)),ask=t.last;const recorded=t.ledger.some(o=>lifts(pBefore,F,0).some(x=>x.id===o.sessionId));
  const L={entryBefore,sync:s,missing:ask.missingInputs,question:ask.question??null,replanned:ask.proposal!==null,recorded};
  if(how==='c_weeklyFirst'){L.weekly=H.weekly(t,F,s=>s.day===0);L.weeklyMissing=t.last.missingInputs;}
  const conf=how==='b_named'?brk(addDays(d,2),addDays(d,4),{episodeId:Rb.interruption.episode}):brk(addDays(d,2),addDays(d,4));
  L.confirm=H.ev(t,on(t,addDays(d,5),'08:00',conf));L.confirmed=dec(lastR(t.p));L.entryAfter=entryOf(lastR(t.p));
  L.nextWeekly=H.weekly(t,F,s=>s.day===0);L.nextWeeklyMissing=t.last.missingInputs;
  C['L2'+how]=L;
  check(`${cls} L2${how} sync asked`,s==='ASK/ASK'&&JSON.stringify(ask.missingInputs)==='["interruption.episodeId"]'&&!L.replanned&&recorded,s);
  check(`${cls} L2${how} confirmed = in time`,noLP(L.entryAfter)===noLP(C.L0.entry)&&L.confirmed.episode===Rb.interruption.episode&&L.confirmed.relation==='SAME_BREAK',`${L.confirm} ${L.confirmed?.relation}/${L.confirmed?.basis}`);
  check(`${cls} L2${how} no loop after confirmation`,!/ASK/.test(L.nextWeekly),L.nextWeekly);
  if(how==='c_weeklyFirst')check(`${cls} L2c weekly before confirmation still asked`,/ASK/.test(L.weekly),L.weekly);
 }
 // L3 (B1)
 {const {t,F,d}=firstLoaded(`qaf-p32-l3-${cls}`,cls);H.ev(t,on(t,addDays(d,5),'06:00',brk(addDays(d,2),addDays(d,4))));const e0=entryOf(lastR(t.p));H.weekly(t,F,()=>false);H.weekly(t,F+1);
  const s=sync(t,F,0,addDays(d,15),'07:00',lifts(t.p,F,0));C.L3={sync:s,missing:t.last.missingInputs,entryUnchanged:noLP(entryOf(lastR(t.p)))===noLP(e0)};check(`${cls} L3 after the re-entry week: no question (B1)`,!/ASK/.test(s),s);}
 // L4 (B2)
 for(const reviewed of [true,false]){const {t,F,d}=firstLoaded(`qaf-p32-l4${reviewed}-${cls}`,cls);sync(t,F,0,d,'21:00',lifts(t.p,F,0));if(reviewed)H.weekly(t,F,s=>s.day!==3);
  const b0=addDays(d,7);const r=H.ev(t,on(t,addDays(d,10),'06:00',brk(b0,addDays(b0,2))));const e0=entryOf(lastR(t.p));
  const s=sync(t,F,3,addDays(d,10),'07:00',lifts(t.p,F,3));C['L4'+(reviewed?'reviewed':'unreviewed')]={r,stateAt:dec(lastR(t.p)).stateAt,sync:s,missing:t.last.missingInputs};
  check(`${cls} L4 ${reviewed?'reviewed':'unreviewed'} week before the point: late log not asked (B2)`,!/ASK/.test(s),s);}
 // L6 last performed date only
 {const {t,F,d}=firstLoaded(`qaf-p32-l6-${cls}`,cls);sync(t,F,0,d,'21:00',lifts(t.p,F,0));
  const mon=new Set(lifts(t.p,F,0).flatMap(s=>s.prescription.exercises.map(e=>e.id))),thu=lifts(t.p,F,3).flatMap(s=>s.prescription.exercises.map(e=>e.id));
  H.ev(t,on(t,addDays(d,6),'06:00',brk(addDays(d,4),addDays(d,5))));const e0=lastR(t.p).interruption.entry;
  const s=sync(t,F,3,addDays(d,6),'07:00',lifts(t.p,F,3)),ask=t.last;
  C.L6={thursdayAlsoOnMonday:thu.filter(x=>mon.has(x)),thursdayOnly:thu.filter(x=>!mon.has(x)),sync:s,missing:ask.missingInputs,entryBefore:stateSummary(e0)};}
}
// L5 the second interruption
{const {t,d0,A}=afterA('qaf-p32-l5');reportOn(t,5,2,'21:00',s=>s.day<3);
 const sat=t.p.weeks[5].sessions.filter(s=>live(s)&&s.day===5);
 const r=H.ev(t,on(t,addDays(d0,9),'06:00',brk(addDays(d0,7),addDays(d0,8))));const B=lastR(t.p);
 const s=H.ev(t,on(t,addDays(d0,9),'07:00',{kind:'PARTIAL_SESSION',observations:sat.map(x=>obs(t.p,x))})),ask=t.last;
 const c=H.ev(t,on(t,addDays(d0,9),'08:00',brk(addDays(d0,7),addDays(d0,8))));const B2=lastR(t.p);
 out.cases.L5={B:r,Bdec:dec(B),Bentry:entryOf(B),sync:s,missing:ask.missingInputs,question:ask.question??null,confirm:c,B2:dec(B2),B2entry:entryOf(B2)};
 check('L5 late lift before B (after A) asks to confirm B',s==='ASK/ASK'&&ask.question?.episodeId===B.interruption.episode,s);
 check('L5 confirmation keeps B identity',B2.interruption.episode===B.interruption.episode&&B2.interruption.relation==='SAME_BREAK',`${B2.interruption.relation}/${B2.interruption.basis}`);}
print(out);
