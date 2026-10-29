// Scratch (author, pre-freeze): values for three new tests on the live runtime (or QE_LIVE_ROOT). Prints only.
import {H,at,obs,on,addDays,brk,lastR,print,copy,live} from '../../../domain-coaching-r7a-final-2026-10-28/reviews/qe-r7af-lib.mjs';
const SAT=s=>s.sport==='STRENGTH'&&s.day===5,SUN=s=>s.sport==='RUN'&&s.day===6;
const perDay=(t,w,keep,edit=o=>o)=>{for(const s of t.p.weeks[w].sessions.filter(s=>live(s)&&keep(s)&&s.day<6))H.ev(t,at(t.p,w,s.day,'21:00',{kind:'WEEKLY_REVIEW',observations:[edit(obs(t.p,s),s)]}));H.ev(t,at(t.p,w+1,0,'06:00',{kind:'WEEKLY_REVIEW',observations:t.p.weeks[w].sessions.filter(s=>live(s)&&keep(s)&&s.day===6).map(s=>edit(obs(t.p,s),s))}));};
const B=(t,k,from=1,to=2)=>{const d=t.p.weeks[k].startDate;H.ev(t,on(t,addDays(d,to+1),'06:00',brk(addDays(d,from),addDays(d,to))));return lastR(t.p);};
const ex=(st,id)=>{const e=st.strength.exercises[id];return e?`${e.load}t${e.loadTick} les${e.lastExecutedSets??'-'}`:null;};
const ids=['back-squat','db-row','db-rdl','db-split-squat'];const out={runtime:process.env.QE_LIVE_ROOT?'QE_LIVE_ROOT':'LIVE'};
// 1. Development weeks: week 4 unreviewed with Saturday missed, week 5 unreviewed in full, B in week 6; R: both reviewed.
{const base=H.start({id:'se-n1'},4),u=copy(base),r=copy(base);perDay(u,4,s=>!SAT(s));perDay(u,5,()=>true);H.weekly(r,4,s=>!SAT(s));H.weekly(r,5);
 const U=B(u,6),R=B(r,6);out.dev={w4:Object.fromEntries(ids.map(i=>[i,ex(base.p.stateTrace[4],i)])),U:Object.fromEntries(ids.map(i=>[i,ex(U.interruption.entry,i)])),R:Object.fromEntries(ids.map(i=>[i,ex(R.interruption.entry,i)])),Uauth:U.interruption.stateAt.authority,stored6:Object.fromEntries(ids.map(i=>[i,ex(u.p.stateTrace[6],i)]))};}
// 2. Unknown unit in an unreviewed week after a reviewed one: week 4 reviewed, week 5 unreviewed with Saturday's loads in an unknown unit.
{const base=H.start({id:'se-n2'},5),u=copy(base);const st=u=>({...u,actual:{...u.actual,exercises:u.actual.exercises.map(e=>({...e,sets:e.sets.map(x=>x.load?.unit==='KG'?{...x,load:{...x.load,unit:'STONE'}}:x)}))}});
 perDay(u,5,()=>true,(o,s)=>SAT(s)?st(o):o);const U=B(u,6);out.unit={w5:Object.fromEntries(ids.map(i=>[i,ex(base.p.stateTrace[5],i)])),stored6:Object.fromEntries(ids.map(i=>[i,ex(u.p.stateTrace[6],i)])),U:Object.fromEntries(ids.map(i=>[i,ex(U.interruption.entry,i)])),Uauth:U.interruption.stateAt.authority};}
// 3. A run value rebuilt by a review, then a week executed in full: week 2 unreviewed with the long run missed, week 3 reviewed with it
// missed again (week 4's run start carried from a projection), week 4 executed in full and not reviewed, B in week 5; R: weeks 2-4 reviewed.
{const base=H.start({id:'se-n3'},2),u=copy(base),r=copy(base);perDay(u,2,s=>!SUN(s));H.weekly(u,3,s=>!SUN(s));perDay(u,4,()=>true);H.weekly(r,2,s=>!SUN(s));H.weekly(r,3,s=>!SUN(s));H.weekly(r,4);
 const U=B(u,5),R=B(r,5),k=st=>`ewd ${st.run.easyWeeksDone} q ${st.run.qualityStep} td ${st.run.thresholdDone} long ${st.run.long}`;
 out.rebuiltThenExecuted={w4auth:u.p.weeks[4].startAuthority.RUN,stored5:k(u.p.stateTrace[5]),U:k(U.interruption.entry),R:k(R.interruption.entry),Uvalues:U.interruption.stateAt.values.RUN};}
print(out);
