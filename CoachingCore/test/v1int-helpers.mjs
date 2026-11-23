// V1 CoachingCore Integration Boundary (Founder mission of 2026-11-23): shared helpers for the v1int-* tests (not a test file). A synthetic
// athlete's own form and HealthKit workouts, split by voice from the AIF reports (reused, not restated). No training rule here.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import * as S from '../src/v1-safety-index.mjs';
import {createIntegration} from '../src/boundary/integration.mjs';
import {createBoundary} from '../src/boundary/api.mjs';
import {memoryStore,fileStore} from '../src/boundary/store.mjs';
import {athleteA,reportOf,liveSessions,at,ELIG,addDays,notFeeling100WithSign,readiness} from '../../audits/v1-app-integration-foundation-2026-11-16/harness/scenario.mjs';
export {S,createIntegration,createBoundary,memoryStore,fileStore,athleteA,reportOf,liveSessions,at,ELIG,addDays,notFeeling100WithSign,readiness};

export const CONSENTS=Object.freeze({COACHING:true,HEALTH_SIGNALS:true,LEARNING:true});
export const U=Object.freeze({performance:'UNKNOWN',recovery:'UNKNOWN',effort:'UNKNOWN',nextDayFunction:'UNKNOWN'});
const DEVICE_ONLY=['gpsQuality','measurement'],ATHLETE_ONLY=['conditions','walkBreaks','stop','rpe'];
const drop=(o,keys)=>Object.fromEntries(Object.entries(o).filter(([k])=>!keys.includes(k)));
/** A new scratch directory for a file store (never removed recursively: each test gets its own name). */
export const scratchDir=tag=>fs.mkdtempSync(path.join(os.tmpdir(),`v1int-${tag}-`));
/** An in-memory anchor (native: one Keychain item per athlete). */
export function memoryAnchor(){const m=new Map();return {get:id=>m.has(id)?{...m.get(id)}:null,set:(id,v)=>m.set(id,{...v}),clear:id=>m.delete(id),raw:m};}
/**
 * One athlete through the integration boundary: `it` (the custody-compatible service), `api` (the frozen api.mjs over it), the clock, and the
 * client-side views the app would hold (the plan in force and its run sessions as presented).
 */
export function athlete({id='v1int-a',weeks=8,store=memoryStore(),anchor=null,engine=S,key='v1int-synthetic-key',start='2026-11-14T12:00:00-03:00',newId}={}){
 const t={clock:Date.parse(start),id,actor:{athleteId:id},store,anchor};
 t.it=createIntegration({store,key,clock:()=>t.clock,anchor,engine,newId});
 t.api=createBoundary({custody:t.it,now:()=>t.clock});
 t.enroll=(intake=athleteA({weeks,id}))=>t.it.enroll({actor:t.actor,intake,consents:CONSENTS});
 t.doc=()=>{const o=t.it.read({actor:t.actor});if(!o.ok)throw new Error(o.error.code);return o.doc;};
 t.version=()=>t.doc().version;
 t.env=()=>({program:t.doc().program,presentation:{runSessions:t.it.presentation({actor:t.actor}).inForce??{}}});
 t.sessions=w=>liveSessions(t.env(),w);
 t.set=(day,time='20:00')=>{t.clock=Date.parse(at(day,time));};
 let n=0;t.rid=tag=>`${tag??'rq'}-${++n}`;
 /** The athlete's own form for a session as the AIF athlete did it (no device field, no id: the boundary assigns them). */
 t.form=(s,{actual={},response={}}={})=>{const r=reportOf(t.env(),s);return {sessionId:r.sessionId,occurrenceDate:r.occurrenceDate,actual:{...drop(r.actual,DEVICE_ONLY),...actual},response:{...r.response,...response}};};
 /** The HealthKit workout of a run session (only what the device measured), ending at `endTime` local on the session's day. */
 t.watch=(s,{activityId=`HK-${s.id}`,endTime='07:45',actual={}}={})=>{const r=reportOf(t.env(),s);return {activityId,activityType:'RUN',sessionId:s.id,observedAt:at(s.date,endTime),actual:{...drop(r.actual,ATHLETE_ONLY),...actual}};};
 t.submit=(review,{rid=t.rid(),expectedVersion=t.version()}={})=>t.it.submit({actor:t.actor,clientRequestId:rid,expectedVersion,review});
 t.weekly=(day,observations,extra={})=>t.submit({kind:'WEEKLY_REVIEW',eligibility:ELIG(day),observations,...extra});
 /** HealthKit workouts. The device states no screen (cycle 1, SEC-INT-01): with `eligibility`, the athlete first answers that screen through
  * their own channel (an athlete review with the screen alone), as the app does, and the delivery then carries it. */
 t.screen=eligibility=>t.submit({kind:'WEEKLY_REVIEW',eligibility});
 t.import=(activities,{rid=t.rid('hk'),expectedVersion,eligibility}={})=>{if(eligibility){const s=t.screen(eligibility);if(!s.ok)return s;}
  return t.it.importActivities({actor:t.actor,clientRequestId:rid,expectedVersion:expectedVersion??t.version(),activities});};
 t.rows=()=>t.it.visible(t.doc());
 t.live=sid=>t.rows().filter(o=>!o.fact&&o.sessionId===sid&&o.superseded!==true);
 t.carried=()=>t.it.carried({actor:t.actor}).records;
 return t;
}
/** An engine spy: every call's input and answer, in order (the C-F01-2 oracle reads what the engine was handed against what it last returned). */
export function spy(engine=S){
 const calls=[];
 return {calls,engine:{...engine,
  generateProgram:(i,o)=>{const r=engine.generateProgram(i,o);calls.push({op:'generate',input:i,out:r});return r;},
  evaluateProgram:(p,i,o)=>{const r=engine.evaluateProgram(p,i,o);calls.push({op:'evaluate',program:p,input:i,out:r,options:o});return r;},
  restartProgram:(i,o)=>{const r=engine.restartProgram(i,o);calls.push({op:'restart',input:i,out:r});return r;}}};
}
export const json=x=>JSON.parse(JSON.stringify(x));
export const sortedById=list=>[...list].map(x=>JSON.stringify(x)).sort();
