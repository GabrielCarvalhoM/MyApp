// SSCTR BC R1 probe b9 (SEC-SC-03 dose): restart through the boundary on the day of a run (a) stopped for a symptom that morning, (b) done that
// morning, with no stated pause, then with a stated nonclinical cause (SCHEDULE, 0 weeks), then a clinical one (INJURY). Status and the new
// plan's first two weeks. Usage: node b9-restart-dose.mjs <CoachingCore root>. Synthetic; read-only.
import path from 'node:path';import {pathToFileURL} from 'node:url';
const root=process.argv[2];const H=await import(pathToFileURL(path.join(root,'test/v1int-helpers.mjs')).href);
const {athlete,ELIG,U,addDays,athleteA}=H;
const RI=(id,day,pause)=>{const u={...athleteA({weeks:8,id}),asOf:day,startDate:addDays(day,3)};u.athlete.eligibility=ELIG(day);if(pause)u.athlete.pause=pause;else delete u.athlete.pause;return u;};
const doses=p=>p&&p.weeks?[0,1].map(k=>p.weeks[k].sessions.map(s=>s.sport[0]+':'+(s.prescription?.durationMinutes??'-')).join(' ')).join(' | '):'-';
function go(label,stop,pause){
 const t=athlete({id:'b9'});t.enroll();const all=[...t.sessions(0),...t.sessions(1)],s=t.sessions(1).find(x=>x.sport==='RUN'),day=s.date;
 for(const x of all.filter(x=>x.date<day).sort((m,n)=>m.date<n.date?-1:1)){t.clock=Math.max(t.clock+60e3,Date.parse(H.at(x.date,'21:00')));t.weekly(x.date,[t.form(x)]);}
 t.clock=Math.max(t.clock+60e3,Date.parse(H.at(day,'09:00')));const f=t.weekly(day,[t.form(s,stop?{actual:{completed:false,minutes:12,stop:{reason:'SYMPTOM'}},response:U}:{})]);
 t.set(day,'10:00');const r=t.it.restart({actor:t.actor,intake:RI('b9',day,pause),expectedVersion:t.version()});
 console.log(label.padEnd(34),'report',f.ok?f.status:f.error.code,'| restart',r.ok===false?r.error.code:r.status,(r.missingInputs??r.engine?.missingInputs??[]).join(','),'|',doses(r.program??r.proposal??r.doc?.program??null),'hash',String(r.programHash??'-').slice(0,12),'screen',r.warningSignScreen?.reason??r.warningSignScreen?.status??'-');
}
for(const stop of [true,false])for(const [n,p] of [['no stated pause',null],['SCHEDULE 0w',{reasonCategory:'SCHEDULE',nonclinical:true,weeks:0}],['INJURY',{reasonCategory:'INJURY',weeks:0}]])go((stop?'stop today, ':'done today, ')+n,stop,p);
