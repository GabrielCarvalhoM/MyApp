// R7-D Phase 3.1 engineering check: which carried rows change between the record a decision reads and the record it returns, and how.
// The same sequence as qe31-persistence.mjs `appendOnly` (a break with a schedule change, a fatigue report, the applying review, the closing
// review), and the same sequence without any break, so a change that is not of the declared-break family shows on both.
//   node qe31-row-diff.mjs --root <dir holding CoachingCore and the records it reads>
import path from 'node:path';
import {pathToFileURL} from 'node:url';

const arg=k=>{const i=process.argv.indexOf(k);return i>=0?process.argv[i+1]:null;};
const root=path.resolve(arg('--root')??'.');
const imp=p=>import(pathToFileURL(path.join(root,'CoachingCore',p)).href);
const H=await imp('r7/b/fixtures/helpers.mjs');
const {opts,K,FULL,program,review,obs,live,addDays,evaluateProgram}=H;
const GEN={id:'qe31-gen',weeks:12,goals:{run:'PERFORMANCE',strength:'GENERAL'},equipment:FULL,knownExercises:[K('back-squat',3,5,82.5)]};
const cj=v=>JSON.stringify(v);
function step(t,w,x={}){const r=evaluateProgram(t.p,{...review(t.p,w,x),...(t.ledger.length?{actualLedger:t.ledger}:{}),...(t.ref?{referenceState:t.ref}:{})},opts);t.ledger=r.actualLedger??t.ledger;t.ref=r.referenceState??t.ref;if(r.proposal)t.p=r.proposal;return r;}
const weekFacts=(p,w)=>p.weeks[w].sessions.filter(live).map(s=>obs(p,s));
function prep(){const t={p:program(GEN),ledger:[],ref:null};for(const w of [0,1,2])step(t,w,{observations:weekFacts(t.p,w)});return t;}
const BREAK=p=>({startDate:p.weeks[3].startDate,endDate:addDays(p.weeks[4].startDate,6),days:14,reasonCategory:'VACATION',reason:'Holiday',nonclinical:true});
function diffKeys(a,b,pfx=''){
 if(cj(a)===cj(b))return [];
 if(!a||!b||typeof a!=='object'||typeof b!=='object')return [pfx||'(value)'];
 return [...new Set([...Object.keys(a),...Object.keys(b)])].flatMap(k=>diffKeys(a[k],b[k],pfx?pfx+'.'+k:k));
}
function run(withBreak){
 const t=prep(),out=[];
 const seq=[withBreak?{day:1,hour:'07:00:00',kind:'SCHEDULE_CHANGE',changes:{strengthDays:[0,3]},interruption:BREAK(t.p)}:{day:1,hour:'07:00:00',kind:'SCHEDULE_CHANGE',changes:{strengthDays:[0,3]}},{day:1,hour:'09:00:00',kind:'LOCAL_FATIGUE'},{day:2,hour:'07:00:00',observations:weekFacts(t.p,5).filter(o=>o.observedAt<`${addDays(t.p.weeks[5].startDate,2)}`)},{day:6,hour:'21:00:00'}];
 for(const x of seq){
  const before=t.ledger,r=step(t,5,x),after=r.actualLedger??t.ledger,byId=new Map(after.map(o=>[(o.fact??'O')+'|'+o.eventId,o]));
  const changed=before.map(o=>({o,y:byId.get((o.fact??'O')+'|'+o.eventId)})).filter(({o,y})=>cj(o)!==cj(y)).map(({o,y})=>({eventId:o.eventId,sessionId:o.sessionId??null,fact:o.fact??null,present:!!y,changedKeys:y?diffKeys(o,y):null,before:y?Object.fromEntries(diffKeys(o,y).slice(0,4).map(k=>[k,k.split('.').reduce((v,s)=>v?.[s],o)])):null,after:y?Object.fromEntries(diffKeys(o,y).slice(0,4).map(k=>[k,k.split('.').reduce((v,s)=>v?.[s],y)])):null}));
  out.push({kind:x.kind??'WEEKLY_REVIEW',status:r.status,action:r.action,rowsBefore:before.length,rowsAfter:after.length,changed});
 }
 return out;
}
// The break stated directly in the applying weekly review (the pre-Phase 3.1 path, present on R7D-FREEZE-1 too).
function stated(){
 const t=prep(),out=[];
 const seq=[{day:1,hour:'07:00:00',kind:'SCHEDULE_CHANGE',changes:{strengthDays:[0,3]}},{day:1,hour:'09:00:00',kind:'LOCAL_FATIGUE'},{day:2,hour:'07:00:00',interruption:BREAK(t.p),observations:weekFacts(t.p,5).filter(o=>o.observedAt<`${addDays(t.p.weeks[5].startDate,2)}`)},{day:6,hour:'21:00:00'}];
 for(const x of seq){
  const before=t.ledger,r=step(t,5,x),after=r.actualLedger??t.ledger,byId=new Map(after.map(o=>[(o.fact??'O')+'|'+o.eventId,o]));
  out.push({kind:x.kind??'WEEKLY_REVIEW',status:r.status,action:r.action,rowsBefore:before.length,rowsAfter:after.length,changed:before.map(o=>({o,y:byId.get((o.fact??'O')+'|'+o.eventId)})).filter(({o,y})=>cj(o)!==cj(y)).map(({o,y})=>({eventId:o.eventId,sessionId:o.sessionId??null,changedKeys:y?diffKeys(o,y):null}))});
 }
 return out;
}
console.log(JSON.stringify({root,withBreak:run(true),withoutBreak:run(false),statedInWeekly:stated()},null,1));
