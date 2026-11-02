// Engineering review of R7C-FREEZE-4 (Phase 7, QE-R7C-10): probe library. Read-only. Loads one or more CoachingCore roots: the worktree by
// default (named F4), others from git archive copies outside the repository, passed in QE_ROOTS as name=path pairs separated by ';' (each path
// holds CoachingCore/). Same client model as the Phase 6 judge's p6-lib (carries program, completed-work record and reference state). Writes nothing.
import {pathToFileURL,fileURLToPath} from 'node:url';
import path from 'node:path';
const HERE=path.dirname(fileURLToPath(import.meta.url)),WT=path.resolve(HERE,'../../../../../..');
const pairs=(process.env.QE_ROOTS??'').split(';').filter(Boolean).map(x=>{const i=x.indexOf('=');return [x.slice(0,i),x.slice(i+1)];});
export const ROOTS=pairs.length?pairs:[['F4',WT]];
export const RUNTIMES={};
for(const [name,root] of ROOTS){
 const imp=rel=>import(pathToFileURL(path.join(root,'CoachingCore',rel)).href);
 const H=await imp('r7/b/fixtures/helpers.mjs'),V=await imp('src/value.mjs'),A=await imp('src/r6-adaptation.mjs'),N=await imp('src/r6-provenance.mjs');
 RUNTIMES[name]={name,root,H,hash:V.hash,A,N};
}
export const VALID='VALID_WITHIN_CURRENT_BOUNDED_SCOPE';
export const live=s=>s.prescription&&s.status!=='SKIPPED';
export const addDays=(d,n)=>new Date(Date.parse(d+'T00:00:00Z')+n*864e5).toISOString().slice(0,10);
export const BAD={recovery:'ADVERSE',nextDayFunction:'IMPAIRED'};
export const ORIGIN=r=>{const s=String(r?.reason??'');return /whichever decision recorded them/.test(s)?'RECORDED':/exceed what the recorded runs allow/.test(s)?'CEILING':/answer the question about unreported training/.test(s)?'ANSWERED':/changed what this week starts from/.test(s)?'MOVED':null;};
export const val=r=>r?.planValidity?.status===VALID?'VALID':r?.planValidity?.status??null;
let ND=0;
export const notDone=(p,s)=>({eventId:`p7-nd-${s.id}-${ND++}`,athleteId:p.athleteId,sessionId:s.id,observedAt:`${s.date}T${s.turn==='PM'?'19:00:00':'08:00:00'}Z`,actual:{completed:false},response:{}});
export function client(R,p,ledger=[],ref=null){
 const t={R,p,ledger:[...ledger],ref};
 t.step=(w,x={},{apply=true}={})=>{const r=R.H.evaluateProgram(t.p,{...R.H.review(t.p,w,x),actualLedger:t.ledger,...(t.ref?{referenceState:t.ref}:{})},R.H.opts);t.ledger=r.actualLedger??t.ledger;if(r.proposal&&apply)t.p=r.proposal;t.ref=r.referenceState??t.ref;return r;};
 t.copy=()=>client(R,t.p,t.ledger,t.ref);
 return t;
}
export const planFrom=(R,P,b,d,span=2)=>{const day=addDays(P.weeks[b].startDate,d);return P.weeks.slice(b,b+span).flatMap(x=>x.sessions).filter(s=>s.date>=day).map(s=>`${s.id}:${s.status??'PLANNED'}:${R.hash(s.prescription??null)}`);};
export const runsFromDay=(P,w,d,span=1)=>{const day=addDays(P.weeks[w].startDate,d);return P.weeks.slice(w,w+span).flatMap(x=>x.sessions).filter(s=>s.sport==='RUN'&&live(s)&&s.date>=day).map(s=>`${s.role}:${s.prescription.durationMinutes}`).join('/');};
export const brief=r=>({status:r.status,action:r.action,validity:val(r),question:r.question?.kind??null,origin:ORIGIN(r),proposal:!!r.proposal});
export const strip=ledger=>ledger.map(o=>{const {firstRecordedAt,...provenance}=o.provenance??{};return {...o,provenance};});
export function programs(H){
 const GEN={id:'p7-gen',weeks:12,goals:{run:'PERFORMANCE',strength:'GENERAL'},equipment:H.FULL,knownExercises:[H.K('back-squat',3,5,82.5)]};
 const R10K={id:'p7-10k',weeks:12,goals:{run:{kind:'RACE',event:{kind:'10K',date:addDays('2026-11-02',11*7+6)}},strength:'RUNNING_SUPPORT'},recent:{runDaysPerWeek:3,runMinutesPerWeek:150,longestRunMinutes:70,strengthDaysPerWeek:2},schedule:{runDays:[1,3,6],strengthDays:[0,4],longRunDay:6,runMinutes:60,longRunMinutes:100}};
 return {GEN,R10K};
}
export const strengthOf=(H,p,w)=>p.weeks[w].sessions.filter(s=>live(s)&&s.sport==='STRENGTH').map(s=>H.obs(p,s));
export const runSessions=(p,from,to)=>p.weeks.slice(from,to).flatMap(x=>x.sessions.filter(s=>live(s)&&s.sport==='RUN'));
export const short=(H,p,s,f,x={})=>H.obs(p,s,{minutes:Math.max(10,Math.round(s.prescription.durationMinutes*f)),...x});
/** The answer shapes: V over the gap's run sessions in date order. */
export function answer(H,p,s,i,V){
 switch(V){
  case 'EXEC':return [H.obs(p,s)];
  case 'SHORT60':return [short(H,p,s,0.6)];
  case 'SHORT80':return [short(H,p,s,0.8)];
  case 'ADVERSE':return [H.obs(p,s,{response:BAD})];
  case 'SHORT_ADVERSE':return [short(H,p,s,0.6,{response:BAD})];
  case 'LONGSHORT_REST_MISS':return [s.role==='LONG'?short(H,p,s,0.6):notDone(p,s)];
  case 'MIX_SHORT_MISS':return [i%2===1?notDone(p,s):short(H,p,s,0.6)];
  case 'MISS':return [notDone(p,s)];
 }
 throw new Error('answer '+V);
}
/** Weeks [0,g) executed and reviewed; [g,b-1) RV reviewed with strength only, NR neither; the review closing week b-1 asks. */
export function fork(R,o,{g,b,mode}){
 const H=R.H,t=client(R,H.program(o));
 for(let w=0;w<g;w++)t.step(w,{observations:t.p.weeks[w].sessions.filter(live).map(s=>H.obs(t.p,s))});
 if(mode==='RV')for(let w=g;w<b-1;w++)t.step(w,{observations:strengthOf(H,t.p,w)});
 const strength=[...(mode==='NR'?Array.from({length:Math.max(0,b-1-g)},(_,i)=>g+i).flatMap(w=>strengthOf(H,t.p,w)):[]),...strengthOf(H,t.p,b-1)];
 const q=t.step(b-1,{observations:strength});return {t,question:q.question?.kind??null};
}
export const AT=(d,hour='07:00:00')=>({day:d,hour});
export function csub(t,b,facts,at=AT(2)){const X=t.p.weeks[b].sessions.filter(s=>live(s)&&s.sport==='STRENGTH').flatMap(s=>s.prescription.exercises.map(e=>e.id))[0];const c=t.step(b,{...at,kind:'EXERCISE_SUBSTITUTION',substitution:{exerciseId:X,reason:'SKILL_MISMATCH',pain:true},observations:facts});t.ref=null;return c;}
export const startsOf=P=>P.weeks.map((x,i)=>({i,run:x.startAuthority?.RUN?.provenance??null,through:x.startAuthority?.RUN?.evidenceThrough??null,eventId:x.startAuthority?.RUN?.eventId??null}));
