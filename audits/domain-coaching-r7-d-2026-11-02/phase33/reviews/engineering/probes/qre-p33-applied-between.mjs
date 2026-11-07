// R7-D Phase 3.3 independent probe (QUALITY_CHECK_R7D_PHASE33): an applied break between two separate breaks. The earlier break A is declared late,
// after a return applied a later break E, with A's days before E's; then H is declared, named on its own; a plain review reads A and H as separate
// breaks (A is not applied: it was declared after E's return). Between A and H lie one run and E's days. Compares the run with nothing trained
// between A and H. Reads a runtime root, writes one JSON file.
//   node qre-p33-applied-between.mjs --rt <root> --out <file>
import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';

const arg=k=>{const i=process.argv.indexOf(k);return i>=0?process.argv[i+1]:null;};
const root=arg('--rt'),out=arg('--out');if(!root||!out)throw Error('--rt <root> --out <file>');
const {opts,K,FULL,program,review,obs,live,addDays,evaluateProgram}=await import(pathToFileURL(path.join(root,'CoachingCore/r7/b/fixtures/helpers.mjs')).href);
const GEN={id:'qre-p33-ab',weeks:12,goals:{run:'PERFORMANCE',strength:'GENERAL'},equipment:FULL,knownExercises:[K('back-squat',3,5,82.5)]};
const step=(t,w,x={})=>{const r=evaluateProgram(t.p,{...review(t.p,w,x),...(x.event?{event:x.event}:{}),...(t.ledger.length?{actualLedger:t.ledger}:{}),...(t.ref?{referenceState:t.ref}:{})},opts);t.ledger=r.actualLedger??t.ledger;t.ref=r.referenceState??t.ref;if(r.proposal)t.p=r.proposal;return r;};
const notDone=(p,s)=>obs(p,s,{actual:{completed:false,minutes:0}});
const W2='2026-11-16',day=n=>addDays(W2,n);
const brk=(from,to,x={})=>({startDate:day(from),endDate:day(to),days:to-from+1,reasonCategory:'VACATION',reason:'Holiday',nonclinical:true,...x});
const trip=(from,to,x={})=>brk(from,to,{reasonCategory:'WORK',reason:'Work trip',...x});
const sessionsIn=(p,from,to)=>p.weeks.flatMap(x=>x.sessions).filter(s=>live(s)&&s.date>=day(from)&&s.date<=day(to));
const rows=[];
for(const oneRun of [true,false]){
 const t={p:program(GEN),ledger:[],ref:null},log=[];
 for(const w of [0,1])step(t,w,{observations:t.p.weeks[w].sessions.filter(live).map(s=>obs(t.p,s))});
 // Weeks 2-3 reported not done and reviewed; week 4 reviewed with its Tue run only (or nothing).
 for(const w of [2,3])log.push(['w'+w,step(t,w,{observations:t.p.weeks[w].sessions.filter(live).map(s=>notDone(t.p,s))}).action]);
 log.push(['w4',step(t,4,{observations:t.p.weeks[4].sessions.filter(live).map(s=>oneRun&&s.sport==='RUN'&&s.date===day(15)?obs(t.p,s):notDone(t.p,s))}).action]);
 // E: Mon-Thu wk5, applied by a return report on Fri wk5.
 log.push(['E',step(t,5,{day:4,hour:'07:00:00',kind:'RETURN_AFTER_PAUSE',interruption:trip(21,24),observations:[]}).action]);
 log.push(['w5',step(t,5,{observations:sessionsIn(t.p,25,27).map(s=>notDone(t.p,s))}).action]);
 // A (weeks 2-3) declared late on Mon wk6; H = Wed-Sat wk6 named on its own, declared Sun wk6 with Mon-Tue wk6 reported not done.
 log.push(['A',step(t,6,{day:0,hour:'07:00:00',kind:'SYSTEMIC_FATIGUE',interruption:brk(0,13),event:{id:'qab-A-'+oneRun,kind:'SYSTEMIC_FATIGUE'}}).action]);
 log.push(['H',step(t,6,{day:6,hour:'07:00:00',kind:'LOCAL_FATIGUE',interruption:{...trip(30,33),episodeId:'qab-H-'+oneRun},event:{id:'qab-H-'+oneRun,kind:'LOCAL_FATIGUE'},observations:sessionsIn(t.p,28,29).map(s=>notDone(t.p,s))}).action]);
 const r=step(t,6,{day:6,hour:'08:00:00'});
 // The athlete answers the question by naming H again (a different interruption, its own name): does the question end?
 const r2=r.action==='ASK'?step(t,7,{day:0,hour:'08:00:00',kind:'RETURN_AFTER_PAUSE',interruption:{...trip(30,33),episodeId:'qab-H-'+oneRun},event:{id:'qab-H2-'+oneRun,kind:'RETURN_AFTER_PAUSE'}}):null;
 const d=t.p.decisions.filter(x=>x.action==='REESTABLISH').at(-1)?.interruption;
 rows.push({variant:oneRun?'one run between A and E':'nothing trained between A and E',log,plain:{action:r.action,missing:r.missingInputs??[],reason:String(r.reason).slice(0,400)},answer:r2?{action:r2.action,missing:r2.missingInputs??[],reason:String(r2.reason).slice(0,300)}:null,
  lastReturn:d?{start:d.startDate,end:d.endDate,days:d.days,class:d.class,separate:(d.separateBreaks??[]).map(b=>b.stop)}:null});
}
fs.writeFileSync(out,JSON.stringify({probe:'QRE-R7D-P33-APPLIED-BETWEEN-1',runtimeRoot:path.resolve(root),rows},null,1)+'\n');
console.log(JSON.stringify(rows,null,1));
