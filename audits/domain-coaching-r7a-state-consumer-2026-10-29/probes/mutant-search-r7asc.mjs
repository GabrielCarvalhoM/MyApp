// Author probe (prints only): a mutant-killing search for the run re-entry survivors of mutation-check-r7asc.mjs. It runs one battery of run
// timelines on the runtime R7ASC_ROOT selects and prints, per timeline, every week's run rows and history's run state at each week start, so two
// runtimes (the live tree and a mutated copy) can be diffed. The battery: every R6 simulation trajectory; every development profile that
// generates a plan, each executed and reviewed for four weeks, then interrupted from Tuesday of week 4 until the day before its report (a Monday,
// Thursday or Friday of weeks 5, 6, 8 or 9: 6 to 38 days, every return class), then every session from the report on executed and each week
// reviewed; and the same with the week before the report left unreviewed. Usage: node mutant-search-r7asc.mjs > out.json
import * as L from './r7asc-lib.mjs';
const SIM=await import(L.pathToRoot('src/r6-simulator.mjs')),TRAJ=await import(L.pathToRoot('r6/fixtures/trajectories.mjs')),PROF=await import(L.pathToRoot('r6/fixtures/profiles.mjs'));
const out={probe:'mutant-search-r7asc',root:L.ROOT,timelines:{}};
const runOf=st=>st?(({mode,easy,long,returnStep,restart,walkStep,walks,longestContinuous})=>({mode,easy,long,returnStep,restart,walkStep,walks,longestContinuous}))(st):null;
const record=(P,ledger)=>P.weeks.map((w,k)=>{const H=(()=>{try{return L.A.historicalStateOf(P,{asOf:`${w.startDate}T00:30:00Z`,actualLedger:ledger},L.opts);}catch(e){return {error:e.message};}})();
 return `w${k} ${w.sessions.filter(s=>L.live(s)&&s.sport==='RUN').map(s=>`${s.date.slice(5)}:${s.role}:${s.prescription.durationMinutes}${s.progression?`:${s.progression.dimension}=${s.progression.value}`:''}`).join(',')} | H ${JSON.stringify(H?.error?H:runOf(H?.state?.run))}`;});
for(const t of TRAJ.TRAJECTORIES){const sim=SIM.simulateProgram(t.input,t.script,L.opts);out.timelines['sim:'+t.id]=sim.finalProgram?record(sim.finalProgram,sim.actualLedger):sim.status;}
const profiles={...PROF.PROFILES,...PROF.EDGE_PROFILES};
for(const [name,intake] of Object.entries(profiles))for(const [rw,report] of [[5,0],[5,3],[6,0],[6,3],[6,4],[8,3],[9,4]])for(const reviewBefore of [true,false]){
 const id=`${name}-w${rw}d${report}-${reviewBefore?'rev':'unrev'}`;
 try{
  L.resetIds();const g=L.R.generateProgram(structuredClone(intake),L.opts);if(!g.program){out.timelines[id]='no plan: '+g.status;continue;}
  const t={p:g.program,ledger:[]},W=t.p.weeks.length;
  if(rw+2>=W){out.timelines[id]='short plan';continue;}
  for(let w=0;w<4;w++)L.weekly(t,w);
  const start=L.addDays(t.p.weeks[4].startDate,1);
  // Weeks inside the break: nothing executed; reviewed, except the one before the report when reviewBefore is false.
  for(let w=4;w<rw;w++)if(reviewBefore||w<rw-1)L.weekly(t,w,s=>s.date<start);
  const rDate=L.addDays(t.p.weeks[rw].startDate,report);
  L.step(t,L.at(t.p,rw,report,'07:00:00',L.brk(start,L.addDays(rDate,-1))),{allow:true});
  for(let w=rw;w<Math.min(W,rw+6);w++)L.weekly(t,w,s=>s.date>=rDate,{},'21:00:00');
  out.timelines[id]=record(t.p,t.ledger);
 }catch(e){out.timelines[id]='error: '+String(e.message).slice(0,160);}
}
L.print(out);
