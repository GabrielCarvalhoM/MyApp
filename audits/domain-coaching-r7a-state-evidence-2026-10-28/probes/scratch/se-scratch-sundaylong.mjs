// Scratch (author, pre-freeze): P40b sundayLong/sameMissed traced week by week (stored run starts, authorities, the ledger's runs), live or
// QE_LIVE_ROOT. Synthetic data, DEV_TEST_ONLY; prints only.
import {H,at,obs,on,addDays,brk,lastR,print,copy,live} from '../../../domain-coaching-r7a-final-2026-10-28/reviews/qe-r7af-lib.mjs';
const perDay=(t,w,keep)=>{for(const s of t.p.weeks[w].sessions.filter(s=>live(s)&&keep(s)&&s.day<6))H.ev(t,at(t.p,w,s.day,'21:00',{kind:'WEEKLY_REVIEW',observations:[obs(t.p,s)]}));};
const sundayOnMonday=(t,w,keep)=>H.ev(t,at(t.p,w+1,0,'06:00',{kind:'WEEKLY_REVIEW',observations:t.p.weeks[w].sessions.filter(s=>live(s)&&s.day===6&&keep(s)).map(s=>obs(t.p,s))}));
const miss=s=>s.sport==='RUN'&&s.day===6,F=2,out={runtime:process.env.QE_LIVE_ROOT?'QE_LIVE_ROOT':'LIVE'};
const base=H.start({id:'qab-p40b-sundayLong-sameMissed'},F);
const run=st=>st?`${st.mode} long ${st.long} easy ${st.easy} q ${st.qualityStep} ewd ${st.easyWeeksDone} ach.long ${st.achieved?.long}`:null;
for(const cell of ['U','R']){const t=copy(base);if(cell==='U'){perDay(t,F,s=>!miss(s));sundayOnMonday(t,F,s=>!miss(s));}else H.weekly(t,F,s=>!miss(s));
 const x={};for(const w of [2,3])x['start'+w]={auth:t.p.weeks[w].startAuthority.RUN?.provenance,run:run(t.p.stateTrace[w].run)};
 x.week2Runs=t.p.weeks[2].sessions.filter(s=>s.sport==='RUN'&&s.prescription).map(s=>`${s.date} d${s.day} ${s.role} ${s.prescription.durationMinutes}`);
 x.week3Runs=t.p.weeks[3].sessions.filter(s=>s.sport==='RUN'&&s.prescription).map(s=>`${s.date} d${s.day} ${s.role} ${s.prescription.durationMinutes}`);
 x.f1=H.weekly(t,F+1,s=>!miss(s));x.start4={auth:t.p.weeks[4].startAuthority.RUN,run:run(t.p.stateTrace[4].run)};
 x.ledgerRuns=t.ledger.filter(o=>o.context?.sport==='RUN').map(o=>`${o.localDate} ${o.context.role} ${o.actual.minutes}`);out[cell]=x;}
print(out);
