// Engineering review of R7C-FREEZE-3 (Phase 6, QE-R7C-07): probe library. Read-only. Loads one or more CoachingCore roots: the worktree by
// default (named F3), others from git archive copies outside the repository, passed in QE_ROOTS as name=path pairs separated by ';' (each path
// holds CoachingCore/). Exposes each root's R7-B fixture helpers, hash and a client-like timeline. Writes nothing.
import {pathToFileURL,fileURLToPath} from 'node:url';
import path from 'node:path';
const HERE=path.dirname(fileURLToPath(import.meta.url)),WT=path.resolve(HERE,'../../../../../..');
const pairs=(process.env.QE_ROOTS??'').split(';').filter(Boolean).map(x=>{const i=x.indexOf('=');return [x.slice(0,i),x.slice(i+1)];});
export const ROOTS=pairs.length?pairs:[['F3',WT]];
export const RUNTIMES={};
for(const [name,root] of ROOTS){
 const imp=rel=>import(pathToFileURL(path.join(root,'CoachingCore',rel)).href);
 const H=await imp('r7/b/fixtures/helpers.mjs'),V=await imp('src/value.mjs'),A=await imp('src/r6-adaptation.mjs');
 RUNTIMES[name]={name,root,H,hash:V.hash,A};
}
export const VALID='VALID_WITHIN_CURRENT_BOUNDED_SCOPE';
export const live=s=>s.prescription&&s.status!=='SKIPPED';
export const addDays=(d,n)=>new Date(Date.parse(d+'T00:00:00Z')+n*864e5).toISOString().slice(0,10);
export const BAD={recovery:'ADVERSE',nextDayFunction:'IMPAIRED'};
export const ORIGIN=r=>{const s=String(r?.reason??'');return /whichever decision recorded them/.test(s)?'RECORDED':/exceed what the recorded runs allow/.test(s)?'CEILING':/answer the question about unreported training/.test(s)?'ANSWERED':/changed what this week starts from/.test(s)?'MOVED':null;};
export const val=r=>r?.planValidity?.status===VALID?'VALID':r?.planValidity?.status??null;
let ND=0;
export const notDone=(p,s)=>({eventId:`p6-nd-${s.id}-${ND++}`,athleteId:p.athleteId,sessionId:s.id,observedAt:`${s.date}T${s.turn==='PM'?'19:00:00':'08:00:00'}Z`,actual:{completed:false},response:{}});
/** A client: carries the program, the completed-work record and the reference state from each result, as every R7-C probe does. */
export function client(R,p,ledger=[],ref=null){
 const t={R,p,ledger:[...ledger],ref};
 // apply=false: the client records the result's ledger and reference state but does not apply its proposal (an ASK it only presents).
 t.step=(w,x={},{apply=true}={})=>{const r=R.H.evaluateProgram(t.p,{...R.H.review(t.p,w,x),actualLedger:t.ledger,...(t.ref?{referenceState:t.ref}:{})},R.H.opts);t.ledger=r.actualLedger??t.ledger;if(r.proposal&&apply)t.p=r.proposal;t.ref=r.referenceState??t.ref;return r;};
 t.copy=()=>client(R,t.p,t.ledger,t.ref);
 return t;
}
/** The plan in force from day d of week b: every session of weeks b..b+span-1 dated on or after it (id, status, prescription digest). */
export const planFrom=(R,P,b,d,span=2)=>{const day=addDays(P.weeks[b].startDate,d);return P.weeks.slice(b,b+span).flatMap(x=>x.sessions).filter(s=>s.date>=day).map(s=>`${s.id}:${s.status??'PLANNED'}:${R.hash(s.prescription??null)}`);};
export const runsOfWeek=(P,w)=>P.weeks[w]?P.weeks[w].sessions.filter(s=>s.sport==='RUN'&&live(s)).map(s=>`${s.role}:${s.prescription.durationMinutes}`).join('/'):null;
export const runsFromDay=(P,w,d)=>{const day=addDays(P.weeks[w].startDate,d);return P.weeks[w].sessions.filter(s=>s.sport==='RUN'&&live(s)&&s.date>=day).map(s=>`${s.role}:${s.prescription.durationMinutes}`).join('/');};
/** Known strength loads ahead, per session and exercise, from day d of week b over `span` weeks. */
export const loadsFrom=(P,b,d,span=2)=>{const day=addDays(P.weeks[b].startDate,d),out={};for(const s of P.weeks.slice(b,b+span).flatMap(x=>x.sessions))if(s.date>=day&&live(s)&&s.sport==='STRENGTH')for(const e of s.prescription.exercises??[])if(e.load?.mode==='KNOWN')out[`${s.id}/${e.id}`]=e.load.value;return out;};
/** Run minutes ahead per session, from day d of week b over `span` weeks. */
export const minutesFrom=(P,b,d,span=2)=>{const day=addDays(P.weeks[b].startDate,d),out={};for(const s of P.weeks.slice(b,b+span).flatMap(x=>x.sessions))if(s.date>=day&&live(s)&&s.sport==='RUN')out[s.id]=`${s.role}:${s.prescription.durationMinutes}`;return out;};
export const brief=r=>({status:r.status,action:r.action,validity:val(r),question:r.question?.kind??null,origin:ORIGIN(r),proposal:!!r.proposal});
