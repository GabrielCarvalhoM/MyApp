// Probe batch C2: a graduated program reviewed under an authority without the B0-C01 record (the record withdrawn after planning). Read-only.
import {record,guard,done,reviewed,weekly,review,evaluateProgram,opts,live,obs,without,qualityRuns,summary} from './lib.mjs';

const GRAD={id:'c2-grad',goals:{run:'PERFORMANCE',strength:'NONE'},runExperience:'NOVICE',recent:{runDaysPerWeek:3,runMinutesPerWeek:80,longestRunMinutes:35},schedule:{strengthDays:[],runMinutes:45},weeks:16};
guard('C8b','authority binding / candidate withdrawn after planning',()=>{
 const t=reviewed(GRAD,3);const g=weekly(t,3);
 const off={...opts,repertoireRecords:without('B0-C01')};
 const mid=evaluateProgram(t.p,{...review(t.p,4,{day:2,hour:'06:00:00',observations:t.p.weeks[4].sessions.filter(s=>live(s)&&s.day<2).map(s=>obs(t.p,s))}),actualLedger:t.ledger},off);
 const end=evaluateProgram(t.p,{...review(t.p,4,{observations:t.p.weeks[4].sessions.filter(live).map(s=>obs(t.p,s))}),actualLedger:t.ledger},off);
 const q=(p,from)=>p?p.weeks.slice(from).flatMap(w=>qualityRuns(p,w.index).map(s=>s.id)):null;
 record('C8b','authority binding / candidate withdrawn after planning',(mid.status==='UNSUPPORTED'||mid.proposal&&!q(mid.proposal,4).length)&&(end.status==='UNSUPPORTED'||end.proposal&&!q(end.proposal,5).length),
  'a review under an authority that no longer approves B0-C01 never keeps a threshold session that only B0-C01 allowed (UNSUPPORTED, or a re-plan without it)',
  {graduation:g.action,qualityPlannedWeek4:q(t.p,4).slice(0,1),midWeek:{...summary(mid),proposal:!!mid.proposal},endOfWeek:{...summary(end),qualityFromWeek5:q(end.proposal,5)?.slice(0,3)??null}});
});
done('c2-authority');
