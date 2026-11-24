// SSCTR BC R1 probe b3: as b2, in a later week (WEEK, default 3) after earlier weeks done as planned, to see the held step in doses.
// Usage: node b3-systemic-dose-week.mjs <CoachingCore root> [week]. Read-only; synthetic.
import path from 'node:path';import {pathToFileURL} from 'node:url';
const root=process.argv[2],WEEK=Number(process.argv[3]??3);const H=await import(pathToFileURL(path.join(root,'test/v1int-helpers.mjs')).href);
const {athlete,spy,ELIG,at}=H;const code=r=>r.ok?'OK':r.error.code;
const doses=w=>w.sessions.map(s=>s.sport[0]+(s.role??'').replace('STRENGTH_','').slice(0,6)+':'+(s.prescription?.durationMinutes??'-')+(s.prescription?.exercises?'['+s.prescription.exercises.map(e=>JSON.stringify(e.load??e.loadKg??e.prescribedLoad??e.reps??'')).join(',')+']':'')).join(' ');
const mono=(t,d,h)=>{t.clock=Math.max(t.clock+60e3,Date.parse(at(d,h)));};
function go(label,{adverseForm=true,strengthAdverse=false}){
 const sp=spy(),t=athlete({id:'b3-'+label.slice(0,1),engine:sp.engine,weeks:12});t.enroll();const steps=[];
 for(let w=0;w<WEEK;w++){const ss=t.sessions(w);if(!ss.length){steps.push('noSessions'+w);break;}const last=ss.map(s=>s.date).sort().at(-1);
  for(const s of [...ss].sort((a,b)=>a.date<b.date?-1:1)){mono(t,s.date,'21:00');steps.push(code(t.weekly(s.date,[t.form(s)])));}
  mono(t,last,'22:00');steps.push(code(t.weekly(last,[])));}
 const ss=t.sessions(WEEK),run=ss.find(s=>s.sport==='RUN'&&s.role==='EASY'),last=ss.map(s=>s.date).sort().at(-1);
 mono(t,run.date,'21:00');const base=t.form(run).actual.minutes;
 t.clock+=60e3;steps.push(code(t.import([t.watch(run)])));
 t.clock+=60e3;steps.push(code(t.weekly(run.date,[t.form(run,{actual:{minutes:base+20},response:adverseForm?{recovery:'ADVERSE',effort:'HARDER'}:{effort:'HARDER'}})])));
 let n=0;for(const s of ss.filter(x=>x.id!==run.id).sort((a,b)=>a.date<b.date?-1:1)){const resp=s.sport==='STRENGTH'&&strengthAdverse&&!n++?{recovery:'ADVERSE'}:{};mono(t,s.date,'21:00');steps.push(code(t.weekly(s.date,[t.form(s,{response:resp})])));}
 mono(t,last,'22:00');steps.push(code(t.weekly(last,[])));
 const out=sp.calls.filter(c=>c.op==='evaluate').at(-1).out,ev=out.weekEvidence,prog=out.proposal??t.doc().program;
 console.log(JSON.stringify({label,steps:[...new Set(steps)],phase:prog.phases?.phases?.slice(WEEK,WEEK+2),status:out.status,adverse:ev?.adverseSessions,systemic:ev?.systemicConvergence,gates:out.gates}));
 for(const k of [1,2,3])if(prog.weeks[WEEK+k])console.log('   week+'+k+' '+(prog.phases?.phases?.[WEEK+k]??'')+':',doses(prog.weeks[WEEK+k]));
}
go('B dispute adverse alone',{});
go('C dispute adverse + strength adverse',{strengthAdverse:true});
go('G dispute not adverse + strength adverse',{adverseForm:false,strengthAdverse:true});
