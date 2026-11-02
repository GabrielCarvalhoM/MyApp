// Engineering recheck (R7C-FREEZE-2) probe library. Read-only: loads one or more CoachingCore roots (the worktree by default; others from
// git archive copies passed in QE_ROOTS as name=path pairs separated by ';') and the R7-B synthetic fixtures of each root. Writes nothing.
import {pathToFileURL,fileURLToPath} from 'node:url';
import path from 'node:path';
const HERE=path.dirname(fileURLToPath(import.meta.url)),WT=path.resolve(HERE,'../../../../../..');
const pairs=(process.env.QE_ROOTS??'').split(';').filter(Boolean).map(x=>x.split('='));
const roots=pairs.length?pairs:[['F2',WT]];
export const RUNTIMES={};
for(const [name,root] of roots){
 const imp=rel=>import(pathToFileURL(path.join(root,'CoachingCore',rel)).href);
 const H=await imp('r7/b/fixtures/helpers.mjs'),V=await imp('src/value.mjs'),C=await imp('src/r6-composition.mjs'),P=await imp('src/r6-program.mjs');
 RUNTIMES[name]={root,H,hash:V.hash,C,P};
}
export const CEILING=/exceed what the recorded runs allow/;
export const live=s=>s.prescription&&s.status!=='SKIPPED';
export const addDays=(d,n)=>new Date(Date.parse(d+'T00:00:00Z')+n*864e5).toISOString().slice(0,10);
export const runsOf=(P,w)=>P.weeks[w]?P.weeks[w].sessions.filter(s=>s.sport==='RUN'&&live(s)).map(s=>`${s.role}:${s.prescription.durationMinutes}`):null;
export const runsFrom=(P,w,d)=>{const day=addDays(P.weeks[w].startDate,d);return P.weeks[w].sessions.filter(s=>s.sport==='RUN'&&live(s)&&s.date>=day).map(s=>`${s.role}:${s.prescription.durationMinutes}`);};
export const strengthDigest=(R,P,from)=>R.hash(P.weeks.slice(from).map(x=>x.sessions.filter(s=>s.sport==='STRENGTH').map(s=>[s.id,s.status??null,s.prescription??null])));
let ND=0;
export const notDone=(p,s)=>({eventId:`rc-nd-${s.id}-${ND++}`,athleteId:p.athleteId,sessionId:s.id,observedAt:`${s.date}T${s.turn==='PM'?'19:00:00':'08:00:00'}Z`,actual:{completed:false},response:{}});
/** A timeline on runtime R: program p, carried ledger and reference state; step() chains them as a client would. */
export function timeline(R,o){
 const t={R,p:R.H.program(o),ledger:[],ref:null,log:[]};
 t.step=(w,x={})=>{const r=R.H.evaluateProgram(t.p,{...R.H.review(t.p,w,x),actualLedger:t.ledger,...(t.ref?{referenceState:t.ref}:{})},R.H.opts);t.ledger=r.actualLedger??t.ledger;if(r.proposal)t.p=r.proposal;t.ref=r.referenceState??t.ref;return r;};
 t.copy=()=>{const u=timeline.from(R,t);return u;};
 return t;
}
timeline.from=(R,t)=>{const u={R,p:t.p,ledger:[...t.ledger],ref:t.ref};u.step=(w,x={})=>{const r=R.H.evaluateProgram(u.p,{...R.H.review(u.p,w,x),actualLedger:u.ledger,...(u.ref?{referenceState:u.ref}:{})},R.H.opts);u.ledger=r.actualLedger??u.ledger;if(r.proposal)u.p=r.proposal;u.ref=r.referenceState??u.ref;return r;};u.copy=()=>timeline.from(R,u);return u;};
export const brief=r=>({status:r.status,action:r.action,validity:r.planValidity?.status==='VALID_WITHIN_CURRENT_BOUNDED_SCOPE'?'VALID':r.planValidity?.status,question:r.question?.kind??null,ceiling:CEILING.test(r.reason??''),reason:String(r.reason??'').slice(0,140)});
