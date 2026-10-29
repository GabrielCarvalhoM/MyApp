// R7AB-QE-r1 P40c: P40's saturdayLift history (week 2 Saturday missed, unreviewed in U / reviewed in R; week 3 Saturday missed again,
// reviewed), then B a 14-day break from Tuesday of week 4, reported on the Tuesday two weeks later (MODERATE: return steps from the state,
// the earlier load the ceiling, SSCTR D49). Prints B's point and the re-entry rows of the Saturday-only exercises, with their ceiling note.
import {H,at,obs,on,addDays,brk,lastR,print,copy,live} from '../../domain-coaching-r7a-final-2026-10-28/reviews/qe-r7af-lib.mjs';
const perDay=(t,w,keep)=>{for(const s of t.p.weeks[w].sessions.filter(s=>live(s)&&keep(s)&&s.day<6))H.ev(t,at(t.p,w,s.day,'21:00',{kind:'WEEKLY_REVIEW',observations:[obs(t.p,s)]}));};
const sundayOnMonday=(t,w)=>H.ev(t,at(t.p,w+1,0,'06:00',{kind:'WEEKLY_REVIEW',observations:t.p.weeks[w].sessions.filter(s=>live(s)&&s.day===6).map(s=>obs(t.p,s))}));
const miss=s=>s.sport==='STRENGTH'&&s.day===5,F=2,base=H.start({id:'qab-p40c'},F),out={probe:'R7AB-QE-P40c',runtime:process.env.QE_LIVE_ROOT?'QE_LIVE_ROOT':'LIVE',cells:{}};
for(const cell of ['U','R']){const t=copy(base);if(cell==='U'){perDay(t,F,s=>!miss(s));sundayOnMonday(t,F);}else H.weekly(t,F,s=>!miss(s));H.weekly(t,F+1,s=>!miss(s));
 const d=t.p.weeks[F+2].startDate,b=H.ev(t,on(t,addDays(d,15),'06:00',brk(addDays(d,1),addDays(d,14)))),B=lastR(t.p),w=B.fromWeek;
 const rows=t.p.weeks.slice(w,w+2).flatMap(x=>x.sessions.filter(s=>live(s)&&s.sport==='STRENGTH').flatMap(s=>s.prescription.exercises.filter(e=>/db-rdl|db-split-squat/.test(e.id)).map(e=>`${s.date} ${e.id} ${e.sets}x${e.reps}@${e.rir}/${e.load.mode}${e.load.value??''} ${e.exposure?.kind??''} ${(e.load.note??e.note??'').slice(0,120)}`)));
 out.cells[cell]={B:b,class:B.interruption.class,point:`${B.interruption.stateAt.kind}/w${B.interruption.stateAt.week}`,authority:B.interruption.stateAt.authority,entry:Object.fromEntries(['db-rdl','db-split-squat'].map(id=>[id,B.interruption.entry.strength.exercises[id]])),rows};}
print(out);
