// QRE R7-D Phase 3.4: QRE-P34-01 follow-up (a named correction of the latest break without its first day, after a return that read separate breaks).
// node qre-p34-q01.mjs <root> --label <name> [--out <file>]  (scratch copy only)
import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';

const root=process.argv[2],arg=k=>{const i=process.argv.indexOf(k);return i>=0?process.argv[i+1]:null;};
const label=arg('--label')??'unlabelled',outFile=arg('--out');
const H=await import(pathToFileURL(path.join(root,'CoachingCore/r7/b/fixtures/helpers.mjs')).href);
const {opts,K,FULL,program,review,obs,live,addDays,evaluateProgram}=H;
const GEN={id:'qre-p34-gen',weeks:12,goals:{run:'PERFORMANCE',strength:'GENERAL'},equipment:FULL,knownExercises:[K('back-squat',3,5,82.5)]};
const step=(t,w,x={})=>{const r=evaluateProgram(t.p,{...review(t.p,w,x),...(x.event?{event:x.event}:{}),...(t.ledger.length?{actualLedger:t.ledger}:{}),...(t.ref?{referenceState:t.ref}:{})},opts);t.ledger=r.actualLedger??t.ledger;t.ref=r.referenceState??t.ref;if(r.proposal)t.p=r.proposal;return r;};
const copy=t=>({p:t.p,ledger:[...t.ledger],ref:t.ref});
let BASE=null;
function base(){if(!BASE){const t={p:program(GEN),ledger:[],ref:null};for(const w of [0,1])step(t,w,{observations:t.p.weeks[w].sessions.filter(live).map(s=>obs(t.p,s))});BASE=t;}return copy(BASE);}
const day=n=>addDays(base().p.weeks[2].startDate,n);
const brk=(from,to,x={})=>({startDate:day(from),endDate:day(to),days:to-from+1,reasonCategory:'VACATION',reason:'Holiday',nonclinical:true,...x});
const trip=(from,to,x={})=>brk(from,to,{reasonCategory:'WORK',reason:'Work trip',...x});
const notDone=(p,s)=>obs(p,s,{actual:{completed:false,minutes:0}});
const dow=s=>new Date(s.date+'T00:00:00Z').getUTCDay(),friStrength=s=>s.sport==='STRENGTH'&&dow(s)===5;
const miss=pred=>(p,s)=>pred(s)?notDone(p,s):obs(p,s);
const res=r=>({action:r.action,status:r.status??null,validity:r.planValidity?.status??null,missing:r.missingInputs??[],errors:r.errors??[],reason:String(r.reason??'').slice(0,200),recordRows:(r.actualLedger??[]).length});
const out={probe:'QRE-P34-Q01-1',label,cases:{}};
const run=(id,f)=>{try{out.cases[id]=f();}catch(e){out.cases[id]={exception:e.name+': '+e.message};}};
function founders(id){const t=base();
 step(t,4,{day:0,hour:'07:00:00',kind:'SYSTEMIC_FATIGUE',interruption:brk(0,13),event:{id:id+'-A',kind:'SYSTEMIC_FATIGUE'}});
 const o=[4,5].flatMap(w=>t.p.weeks[w].sessions.filter(live).map(s=>miss(friStrength)(t.p,s)));
 step(t,6,{day:4,hour:'07:00:00',kind:'LOCAL_FATIGUE',interruption:{...trip(28,31),episodeId:id+'-D'},event:{id:id+'-D',kind:'LOCAL_FATIGUE'},observations:o});
 return {t,r:step(t,6,{day:4,hour:'08:00:00'})};}
// (a) the correction without startDate, then the next plain reviews: does the HOLD persist?
run('a_hold_persists',()=>{const c=founders('qa');const {startDate,...noStart}=trip(28,32);
 const r1=step(c.t,6,{day:5,hour:'10:00:00',kind:'RETURN_AFTER_PAUSE',interruption:{...noStart,episodeId:'qa-D'},event:{id:'qa-D2',kind:'RETURN_AFTER_PAUSE'}});
 const r2=step(c.t,6,{day:5,hour:'12:00:00'}),r3=step(c.t,6,{day:6,hour:'21:00:00'});
 const r4=step(c.t,7,{day:0,hour:'07:00:00',kind:'RETURN_AFTER_PAUSE',interruption:{...trip(28,32),episodeId:'qa-D'},event:{id:'qa-D3',kind:'RETURN_AFTER_PAUSE'}});
 return {first:res(c.r),correctionNoStart:res(r1),nextPlain:res(r2),weekReview:res(r3),restatedWithStart:res(r4)};});
// (b) a correction stating only its length (no first or last day): the end is the day before the review.
run('b_days_only',()=>{const c=founders('qb');const r=step(c.t,6,{day:5,hour:'10:00:00',kind:'RETURN_AFTER_PAUSE',interruption:{days:5,reasonCategory:'WORK',reason:'Work trip',nonclinical:true,episodeId:'qb-D'},event:{id:'qb-D2',kind:'RETURN_AFTER_PAUSE'}});return res(r);});
// (c) control: the same correction shape after a single-break return (no separate breaks recorded) is applied.
run('c_single_break_control',()=>{const t=base();
 const r0=step(t,6,{day:4,hour:'08:00:00',kind:'RETURN_AFTER_PAUSE',interruption:{...trip(28,31),episodeId:'qc-D'},event:{id:'qc-D',kind:'RETURN_AFTER_PAUSE'}});
 const {startDate,...noStart}=trip(28,32);
 const r1=step(t,6,{day:5,hour:'10:00:00',kind:'RETURN_AFTER_PAUSE',interruption:{...noStart,episodeId:'qc-D'},event:{id:'qc-D2',kind:'RETURN_AFTER_PAUSE'}});
 return {first:res(r0),correctionNoStart:res(r1)};});
const text=JSON.stringify(out,null,1);
if(outFile)fs.writeFileSync(outFile,text+'\n');else console.log(text);
