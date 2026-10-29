// R7AF-QE-r1 P33 (independent engineering judge, R7A-FINAL-FREEZE): the same day (Founder 0.8, I7/I9, P4; contract §4, boundary B5).
// First loaded week F (strength Mon/Thu PM at 19:00 local, runs Tue/Fri/Sun AM), FAMILIAR athlete; a 14-day break from Monday (its first day),
// reported Monday two weeks later 06:00 with Monday's lift attached. Cases, at UTC, UTC+9 and UTC-5 (intake offsets):
//  S1 dates only -> ASK interruption.startedAt (material: Monday's exercises enter the state or not);
//  S2 startedAt 21:00 local (after the lift) -> the lift is before the break: Monday's exercises at the return entry;
//  S3 startedAt 06:00 local (before the lift) -> the lift is after it began: Monday-only exercises absent;
//  S2o the same instant as S2 written with an explicit offset instead of Z;
//  S7 the S1 question answered (the same report again with startedAt) -> applied;
//  S6 only a run on the first day (no lift that day): no question;
//  S4 immaterial: a 16-day break from a Saturday whose lift was logged that evening (exercises already in use): recorded, not asked.
// Synthetic data, DEV_TEST_ONLY authority, prints only.
import {H,at,obs,addDays,brk,lastR,dec,entryOf,print,copy,afterA,on,live,localAt} from './qe-r7af-lib.mjs';
const out={probe:'R7AF-QE-P33',runtime:process.env.QE_LIVE_ROOT?'QE_LIVE_ROOT':'LIVE',byTz:{},checks:[]};
const check=(name,ok,detail='')=>out.checks.push({name,ok,detail});
const offsetStr=tz=>{const s=tz>=0?'+':'-',a=Math.abs(tz);return `${s}${String(Math.floor(a/60)).padStart(2,'0')}:${String(a%60).padStart(2,'0')}`;};
function firstLoaded(id,tz){
 const t=H.start({id,tz,athlete:{knownExercises:[]},schedule:{strengthDays:[0,3],runDays:[1,4,6],longRunDay:6}},0);
 const F=t.p.weeks.findIndex(x=>x.sessions.some(s=>s.sport==='STRENGTH'&&s.prescription?.exercises?.some(e=>e.load.mode!=='BODYWEIGHT'&&e.exposure?.kind!=='PRACTICE')));
 for(let w=0;w<F;w++)H.weekly(t,w);return {t,F,d:t.p.weeks[F].startDate};
}
for(const tz of [0,540,-300]){
 const R=out.byTz[tz]={};
 const run=(name,extra,{attach='lift'}={})=>{const {t,F,d}=firstLoaded(`qaf-p33-${name}-${tz}`,tz);
  const monday=t.p.weeks[F].sessions.filter(s=>live(s)&&s.day===0&&(attach==='lift'?s.sport==='STRENGTH':false));
  const runOnly=attach==='run'?t.p.weeks[F].sessions.filter(s=>live(s)&&s.day===1&&s.sport==='RUN').map(s=>({...obs(t.p,s),observedAt:localAt(d,'07:00',tz)})):[];
  const ids=[...new Set(monday.flatMap(s=>s.prescription.exercises.filter(e=>e.load.mode!=='BODYWEIGHT').map(e=>e.id)))];
  const rv=on(t,addDays(d,14),'06:00',{...brk(d,addDays(d,13),extra(d)),observations:[...monday.map(s=>obs(t.p,s)),...runOnly]});
  const s=H.ev(t,rv),r=t.last;return {t,d,F,ids,s,missing:r.missingInputs,ret:s.includes('REESTABLISH')?lastR(t.p):null,rv};};
 const S1=run('s1',()=>({})),S2=run('s2',d=>({startedAt:localAt(d,'21:00',tz)})),S3=run('s3',d=>({startedAt:localAt(d,'06:00',tz)})),S2o=run('s2o',d=>({startedAt:`${d}T21:00:00${offsetStr(tz)}`}));
 R.S1={s:S1.s,missing:S1.missing};R.S2={s:S2.s,entry:entryOf(S2.ret)};R.S3={s:S3.s,entry:entryOf(S3.ret)};R.S2o={s:S2o.s,entry:entryOf(S2o.ret)};
 check(`tz${tz} S1 dates only: asked startedAt`,S1.s==='ASK/ASK'&&JSON.stringify(S1.missing)==='["interruption.startedAt"]',S1.s+' '+S1.missing);
 check(`tz${tz} S2 started after the lift: Monday's exercises at the entry`,!!S2.ret&&S2.ids.every(id=>S2.ret.interruption.entry.strength.exercises[id]?.returnStep===0),S2.s);
 check(`tz${tz} S3 started before the lift: Monday's exercises absent`,!!S3.ret&&S3.ids.every(id=>S3.ret.interruption.entry.strength.exercises[id]===undefined),S3.s);
 check(`tz${tz} S2o offset form = Z form`,JSON.stringify(R.S2o.entry)===JSON.stringify(R.S2.entry),S2o.s+' '+(S2o.missing??''));
 // S7: the question answered by the same report with a start time (a new event id; the asked report was not recorded)
 {const t=S1.t,d=S1.d;const s=H.ev(t,on(t,addDays(d,14),'06:05',{...brk(d,addDays(d,13),{startedAt:localAt(d,'21:00',tz)}),observations:[]}));R.S7={s,entry:entryOf(lastR(t.p)),relation:dec(lastR(t.p))?.relation};check(`tz${tz} S7 answered: applied as S2`,JSON.stringify(R.S7.entry)===JSON.stringify(R.S2.entry),s);}
 // S6: only a run on the first day
 {const S6=run('s6',()=>({}),{attach:'run'});R.S6={s:S6.s,missing:S6.missing};check(`tz${tz} S6 a first-day run alone: not asked`,!/ASK/.test(S6.s),S6.s);}
}
// S4 immaterial (UTC): a Saturday break start with Saturday's lift logged, every exercise already in use.
{const {A}=afterA('qaf-p33-s4');out.S4={relation:A.interruption.relation,sameDayRecorded:!!A.interruption.stateAt.sameDay};check('S4 immaterial same day: recorded, not asked',!!A.interruption.stateAt.sameDay);}
// Cross-tz equality of the S2/S3 entries
check('S2/S3 entries equal across time zones',[540,-300].every(tz=>JSON.stringify(out.byTz[tz].S2.entry)===JSON.stringify(out.byTz[0].S2.entry)&&JSON.stringify(out.byTz[tz].S3.entry)===JSON.stringify(out.byTz[0].S3.entry)));
print(out);
