// SSCTR BC R1 probe b2: the dose consequence of C-O1-3. Week 0 of a synthetic athlete: every session done as planned, except the first run,
// disputed (watch first, then the athlete's form with +20 min and recovery ADVERSE), with or without one strength session reported ADVERSE.
// Prints the week's evidence, the gates and the next week's prescribed doses on one tree. Read-only; synthetic.
import path from 'node:path';import {pathToFileURL} from 'node:url';
const root=process.argv[2];const H=await import(pathToFileURL(path.join(root,'test/v1int-helpers.mjs')).href);
const {athlete,spy,ELIG,U}=H;const code=r=>r.ok?'OK':r.error.code;
function go(label,{disputed=true,order='device first',strengthAdverse=false,thirdAdverse=false,adverseForm=true}){
 const sp=spy(),t=athlete({id:'b2-'+label,engine:sp.engine});t.enroll();
 const ss=t.sessions(0),run=ss.find(s=>s.id==='w0-run-d1'),last=ss.map(s=>s.date).sort().at(-1);
 t.set(run.date,'21:00');t.screen(ELIG(run.date));
 const base=t.form(run).actual.minutes;
 const steps=[];
 if(disputed){const watch=()=>t.import([t.watch(run)]),form=()=>t.weekly(run.date,[t.form(run,{actual:{minutes:base+20},response:adverseForm?{recovery:'ADVERSE',effort:'HARDER'}:{effort:'HARDER'}})]);
  for(const f of order==='device first'?[watch,form]:[form,watch]){t.clock+=60e3;steps.push(code(f()));}}
 else{t.clock+=60e3;steps.push(code(t.weekly(run.date,[t.form(run,{response:{recovery:'ADVERSE'}})])));}
 let nAdv=0;
 for(const s of ss.filter(x=>x.id!==run.id).sort((a,b)=>a.date<b.date?-1:1)){
  let resp={};if(s.sport==='STRENGTH'&&strengthAdverse&&!nAdv){resp={recovery:'ADVERSE'};nAdv++;}else if(s.sport==='RUN'&&thirdAdverse&&nAdv<2){resp={recovery:'ADVERSE'};nAdv++;}
  t.set(s.date,'21:00');steps.push(code(t.weekly(s.date,[t.form(s,{response:resp})])));}
 t.set(last,'22:00');const sun=t.weekly(last,[]);steps.push(code(sun));
 const out=sp.calls.filter(c=>c.op==='evaluate').at(-1).out,ev=out.weekEvidence;
 const prog=out.proposal??null;const next=prog?[1,2].map(k=>prog.weeks[k].sessions.map(s=>s.sport[0]+':'+s.role+':'+(s.prescription?.durationMinutes??'')+(s.prescription?.exercises?'/'+s.prescription.exercises.map(e=>JSON.stringify(e.dose??e.target??e.sets)).join(','):'')).join(' ')):['no proposal',Object.keys(out).join(',')];const _x=(null??[]).map(s=>`${s.sport[0]}:${s.role}:${s.prescription?.durationMinutes??''}${s.prescription?.exercises?'/'+s.prescription.exercises.map(e=>(e.sets??'')+'x'+(e.reps??e.repsTarget??'')+'@'+(e.load?.value??e.loadKg??e.rir??'')).join(','):''}`);
 const gates=out.gates??out.decision?.gates??null;
 console.log(JSON.stringify({label,steps:[...new Set(steps)],status:out.status,action:out.action,adverse:ev?.adverseSessions,systemic:ev?.systemicConvergence,conflicted:ev?.conflicted,gates,next}));
}
go('A no dispute, run adverse + strength adverse',{disputed:false,strengthAdverse:true});
go('B dispute device-first, alone',{});
go('C dispute device-first + strength adverse',{strengthAdverse:true});
go('D dispute athlete-first + strength adverse',{order:'athlete first',strengthAdverse:true});
go('E dispute device-first + 2 more run adverse',{thirdAdverse:true});
go('F control: dispute device-first, form not adverse',{adverseForm:false});go('G control: dispute device-first, form not adverse + strength adverse',{adverseForm:false,strengthAdverse:true});
