// RepMile CoachingHost (front A): CHG-UI-2 item 2.3, the sessions of a proposal waiting for the athlete's confirmation, strength included
// (GAP-CORE-03: the frozen view names no diff and `presentation().pending` carries only the run sessions). A projection of what the record
// already holds (`doc.pending.proposal`, the program the engine proposed), rendered by the frozen `planView` so every session has exactly the
// view's own format. No rule: nothing is computed here but the view of the proposed program.
//
// Safety by construction: a proposal is not the plan in force, so no session of it is ever startable here (`executable:false`, `proposed:true`);
// C shows it only on the accept/decline screen. Owned by front A; its Swift type is proposal CCP-A-01 (contract §11).
import {planView} from '../../../../CoachingCore/src/boundary/views.mjs';

export const PENDING_WEEK_VERSION='RM-COACHINGHOST-PENDING-WEEK-1';
const isObj=o=>!!o&&typeof o==='object'&&!Array.isArray(o);

export function pendingWeek(doc,{nowMs,week=null}={}){
 const p=doc?.pending;
 if(!isObj(p)||!isObj(p.proposal)||!Array.isArray(p.proposal.weeks))return {ok:true,projections:PENDING_WEEK_VERSION,pending:null};
 const v=planView({...doc,program:p.proposal,pending:null},{nowMs,week});
 const sessions=(v.week?.sessions??[]).map(s=>({...s,executable:false,proposed:true}));
 return {ok:true,projections:PENDING_WEEK_VERSION,pending:{decisionId:p.decisionId,change:p.kind??'REQUESTED_CHANGE',programHash:p.proposal.hash??null,
  weekIndex:v.weekIndex,weeks:v.weeks,week:v.week?{index:v.week.index,startDate:v.week.startDate,sessions}:null}};
}
