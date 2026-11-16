import {paceEdge} from './v1-run-calibration.mjs';
import {clone,hash} from './value.mjs';

/**
 * CoachingCore V1 Pace Insights (Founder request of 2026-11-13, handoff r3 section 5; phase B of the V1 run extensions): V1X-PACE-INSIGHTS and,
 * behind its own boundary, V1X-PACE-REVISION.
 * - An insight is an observation: per harder effort domain, how the athlete's comparable sessions of the last 42 days sat against the band that
 *   was in force in each session's own week. It changes nothing by itself: no capacity, estimate, forecast, band, dose or progression.
 * - The one thing an athlete may confirm without a test or a race is a small, reversible revision of the THRESHOLD_CONTROLLED band (A3): only
 *   with the calibration's own training factor at its cap, only from long bouts measured on a track or by good GPS at the target effort, at most
 *   2% a step and 3% in all, ended at once by a single session harder than the cue. The race-pace bands are never revised from training.
 * - Pure functions of what they are given. This module reads no record: the composed entry point (v1-run-forecast-index.mjs) hands it each
 *   execution already read through the admitted record of the run formats, so an execution whose pace evidence is withheld there never votes.
 * - The rounding of a band edge is the calibration's own (`paceEdge`): one rule for every band shown or used.
 * Values: `paceInsights` of CoachingCore/v1/RACE_FORECAST_EXTENSION_V1.json (`V`), and the calibration's values (`RC`) for what the decision
 * names by reference (the trigger of 1.5%, the effort cues, the cap of the training factor, the long-bout rule, the band's rounding and width).
 */
const EPS=1e-9,DAY=86400000;
const num=(v,lo=-Infinity,hi=Infinity)=>typeof v==='number'&&Number.isFinite(v)&&v>=lo&&v<=hi;
const isObj=o=>!!o&&typeof o==='object'&&!Array.isArray(o);
const list=v=>Array.isArray(v)?v:[];
const onDate=(start,offset)=>new Date(Date.parse(start+'T00:00:00Z')+offset*DAY).toISOString().slice(0,10);
const dayGap=(start,end)=>Math.round((Date.parse(end+'T00:00:00Z')-Date.parse(start+'T00:00:00Z'))/DAY);
const median=v=>{const s=[...v].sort((a,b)=>a-b),n=s.length;return n?(n%2?s[(n-1)/2]:(s[n/2-1]+s[n/2])/2):null;};
const byDate=(a,b)=>a.date<b.date?-1:a.date>b.date?1:String(a.eventId)<String(b.eventId)?-1:1;
export const REVISION_DOMAIN='THRESHOLD_CONTROLLED';
export const PACE_INSIGHTS_VERSION='V1X-PACE-INSIGHTS-STATE-1';

/** FASTER, INSIDE or SLOWER, as the calibration's training rule compares a work pace with a band (F9): beyond the trigger past an edge. */
export const classOf=(pace,band,RC)=>{const t=RC.recalibration.training.triggerFraction;return band.fastSecondsPerKm/pace-1>t?'FASTER':pace/band.slowSecondsPerKm-1>t?'SLOWER':'INSIDE';};
/** The cue of a domain: the range of reported effort its sessions are prescribed at. */
const cueOf=(domain,RC)=>RC.effortCues[RC.domains[domain].cue].rpe;
/**
 * Why an execution does not vote, or null when it does. The order is the order of what must hold first: an execution withheld from pace readers
 * is out before anything else of it is read (the admitted record of the run formats; QRE-RWS-E-01), then that it was completed, has a work pace,
 * is comparable, ran in long bouts, was reported at an effort inside the cue with a compatible response, and has a band of its own week.
 */
function excludedWhy(e,band,cue){
 if(e.admitted!==true)return 'PACE_EVIDENCE_WITHHELD';
 if(e.completed!==true)return 'NOT_COMPLETED';
 if(!num(e.secondsPerKm,1))return 'NO_WORK_PACE';
 if(e.comparable!==true)return 'NOT_COMPARABLE';
 if(e.longBouts!==true)return 'WORK_BOUTS_SHORTER_THAN_5_MIN';
 if(!num(e.rpe,0,10))return 'EFFORT_NOT_REPORTED';
 if(e.rpe>cue[1]||e.effortHarder===true)return 'HARDER_THAN_CUE';
 if(e.rpe<cue[0])return 'EFFORT_BELOW_CUE';
 if(e.compatible!==true)return 'RESPONSE_NOT_COMPATIBLE';
 if(!band)return 'NO_BAND_IN_ITS_WEEK';
 return null;
}
/**
 * The state of one domain at a week boundary (F9): its executions of the window, each against the band of its own week.
 * `executions`: this domain's, each {eventId, sessionId, date, recordedOn, secondsPerKm, rpe, admitted, withheld, completed, comparable,
 * compatible, effortHarder, longBouts, measurement, gpsGood, totalWorkMinutes}. `bandAt(e)`: the band in force for that execution, or null.
 * `since`: when given, only executions dated on or after it are read (A3: no execution supports two steps of a revision).
 */
export function insightOf(domain,executions,{weekStart,cutoff,bandAt,since=null},V,RC){
 const cue=cueOf(domain,RC),X=V.exceptional,voting=[],excluded=[];
 const inWindow=list(executions).filter(e=>isObj(e)&&e.date<cutoff&&e.recordedOn<cutoff&&dayGap(e.date,weekStart)<=V.windowDays&&(!since||e.date>=since)).sort(byDate);
 for(const e of inWindow){
  const band=bandAt(e)??null,why=excludedWhy(e,band,cue);
  if(why){excluded.push({eventId:e.eventId,sessionId:e.sessionId,date:e.date,reason:why,...(why==='PACE_EVIDENCE_WITHHELD'&&e.withheld?{withheld:e.withheld}:{})});continue;}
  const mid=(band.fastSecondsPerKm+band.slowSecondsPerKm)/2;
  voting.push({eventId:e.eventId,sessionId:e.sessionId,date:e.date,secondsPerKm:e.secondsPerKm,rpe:e.rpe,band:{fastSecondsPerKm:band.fastSecondsPerKm,slowSecondsPerKm:band.slowSecondsPerKm},class:classOf(e.secondsPerKm,band,RC),
   marginOverFastEdge:band.fastSecondsPerKm/e.secondsPerKm-1,logDeviationFromBandMidpoint:Math.log(mid/e.secondsPerKm),measurement:e.measurement??null,gpsGood:e.gpsGood===true,totalWorkMinutes:e.totalWorkMinutes??null});
 }
 // Exceptional: further from the median than three times the median deviation, and never less than 5% (GPS error is that size): shown, not voted.
 const d=voting.map(v=>v.logDeviationFromBandMidpoint),m=median(d),mad=m===null?null:median(d.map(v=>Math.abs(v-m))),limit=mad===null?null:Math.max(X.madMultiple*mad,X.floorFraction);
 const sessions=voting.map(v=>({...v,exceptional:limit!==null&&Math.abs(v.logDeviationFromBandMidpoint-m)>limit+EPS})),votes=sessions.filter(v=>!v.exceptional);
 const n=votes.length,span=n?dayGap(votes[0].date,votes[n-1].date):0,count=k=>votes.filter(v=>v.class===k).length,share=k=>count(k)/n;
 const state=n<V.minExecutions||span<V.minSpanDays?'INSUFFICIENT_DATA':share('FASTER')>=2/3-EPS&&votes[n-1].class==='FASTER'?'IMPROVING':share('SLOWER')>=2/3-EPS?'SLOWER_THAN_BAND':count('INSIDE')>n/2?'STABLE':'MIXED';
 return {domain,state,cue:{rpe:clone(cue)},sessions,excluded,votes:n,spanDays:span,median:m,MAD:mad,exceptionalThreshold:limit,harderThanCue:excluded.filter(x=>x.reason==='HARDER_THAN_CUE').length,shortBouts:excluded.filter(x=>x.reason==='WORK_BOUTS_SHORTER_THAN_5_MIN').length};
}
/**
 * What an insight leads to (values paceInsights.actions): an explanation, an offer of the calibration's own field test, a suggestion to report a
 * race, the reminder that effort governs, or nothing. Never a change. `q8`: {applies, fraction, withdrawn} of the domain's training factor;
 * `p3Offered`: the calibration offers its field test now; `revisionOffered`: the athlete-confirmed revision is offered (threshold only).
 */
export function actionOf(insight,{q8,p3Offered,revisionOffered=false},V,RC){
 const A=V.actions,cap=RC.recalibration.training.up.totalMax;
 if(insight.state==='SLOWER_THAN_BAND')return {action:A.slower};
 if(insight.state==='INSUFFICIENT_DATA')return {action:A.shortRepsOrEasy};
 if(insight.state!=='IMPROVING')return {action:'NONE'};
 if(q8?.applies&&q8.withdrawn!==true&&num(q8.fraction)&&q8.fraction<cap-EPS)return {action:A.q8HasRoom};
 const revisable=V.athleteConfirmedRevision.domains.includes(insight.domain)&&revisionOffered;
 if(p3Offered)return {action:'OFFER_V1RC_FIELD_TEST',...(revisable?{alternative:V.athleteConfirmedRevision.id}:{})};
 return {action:revisable?V.athleteConfirmedRevision.id:'SUGGEST_REPORTING_A_RACE'};
}
/** The insights of a week: each domain's state, its sessions, what did not vote and why, the action, and an id a client may dismiss it by. */
export function paceInsightsOf({week,weekStart,cutoff,domains,bandAt,p3Offered,revisionOffered=false},V,RC){
 const out={};
 for(const domain of V.domains){
  const x=domains?.[domain]??{},i=insightOf(domain,x.executions,{weekStart,cutoff,bandAt:e=>bandAt(domain,e)},V,RC),a=actionOf(i,{q8:x.q8,p3Offered,revisionOffered:domain===REVISION_DOMAIN&&revisionOffered},V,RC);
  out[domain]={...i,...a,namedFactors:clone(RC.paceRules.namedFactors),id:hash({domain,state:i.state,sessions:i.sessions.filter(s=>!s.exceptional).map(s=>s.eventId)})};
 }
 return {week,computedAt:V.computedAt,weekStart,changesCapacity:V.changesCapacity,changesEstimateOrForecast:V.changesEstimateOrForecast,heartRateInput:V.heartRateInput,domains:out};
}

// ---------- the athlete-confirmed revision of the threshold band (A3) ----------
/**
 * The band with a revision in force: speed terms, as the calibration's own training factor; the fast edge rounded as every band edge is, the slow
 * edge never closer than the calibration's minimum width. Rounding only ever leaves an edge where it was or slower.
 */
export function effectiveBandOf(band,fraction,RC){
 const step=RC.paceRules.roundUpToSecondsPerKm,width=RC.paceRules.minimumWidthSecondsPerKm.HARDER,fast=paceEdge(1/band.fastSecondsPerKm*(1+fraction),step);
 return {fastSecondsPerKm:fast,slowSecondsPerKm:Math.max(paceEdge(1/band.slowSecondsPerKm*(1+fraction),step),fast+width)};
}
const ENDS=Object.freeze(['NEW_V1RC_REFERENCE','V1RC_WITHDRAWAL','HARDER_THAN_CUE_EXECUTION','TWO_SLOWER_EXECUTIONS','INSIGHTS_SLOWER_THAN_BAND','V1RC_TRAINING_FACTOR_DOWN','ADVERSE_RESPONSE','REVOKED_BY_THE_ATHLETE','TAPER_OR_RACE_WEEK_STARTS','LAPSED']);
const NO_REVISION_PHASES=['TAPER','RACE_WEEK','POST_EVENT'];
/**
 * The revision of the threshold band as the record gives it, week boundary by week boundary, from the first week given to the week in force.
 * Nothing is stored but the athlete's answers: every offer, step and ending is worked out again from the record, and an answer counts only for
 * the offer it names (an acceptance of anything else changes nothing).
 * `x`:
 * - `now`: the week in force; `weeks`: one snapshot per week from the first week read to `now`, each {index, startDate, phase, mode, band (the
 *   calibration's threshold band of that week, {fastSecondsPerKm, slowSecondsPerKm, derived}, or null), factor (its training factor), withdrawn
 *   (the factor's band is withdrawn), referenceId, withdrawal (a reason, when the calibration prescribes by effort only or withholds that week)};
 * - `executions`: the threshold executions (as insightOf reads them); `adverse`: the dates of adverse responses on any run;
 * - `breaks`: declared breaks [{from, to, days}]; `responses`: the athlete's answers [{offerId, response, date}], as the record of them holds;
 * - `raceDate`, `experience`, `asOfDay`, `screenRequired` (the warning-sign screen is asked now), `p3Offered` (the calibration offers a test now);
 * - `scope`: what an offer is of (the plan in force): an answer names an offer of one plan only.
 * Returns the state now, the offer of this week (if any), the revision in force and `fractionAt(date)`: the revision in force on a day.
 */
export function paceRevisionOf(x,V,RC){
 const A=V.athleteConfirmedRevision,cue=cueOf(REVISION_DOMAIN,RC),cap=RC.recalibration.training.up.totalMax,trigger=RC.recalibration.training.triggerFraction,T=RC.recalibration.training;
 const weeks=list(x.weeks).filter(isObj).sort((a,b)=>a.index-b.index),byIndex=new Map(weeks.map(w=>[w.index,w])),execs=list(x.executions).filter(isObj).sort(byDate),responses=list(x.responses).filter(r=>isObj(r)&&typeof r.offerId==='string').sort((a,b)=>a.date<b.date?-1:a.date>b.date?1:0);
 const weekOf=date=>weeks.findLast(w=>w.startDate<=date)??null;
 // The revision as it stood on each day: the steps in force, and the day it ended (a session that ends it ran under it; later ones do not).
 const steps=[],ends=[];let total=0,since=null,pending=null,lastChange=null,ended=null;
 const fractionAt=date=>{let f=0;for(const s of steps)if(s.effectiveFrom<=date&&!(s.endedOn&&date>s.endedOn))f+=s.fraction;return f;};
 const v1rcBandAt=e=>{const w=byIndex.get(e.week)??weekOf(e.date);return w?.band?.derived===true?w.band:null;};
 // An execution that carries the band its session was delivered with is read against it (it is already the effective band of its week).
 const bandAt=e=>{if(isObj(e.band))return e.band;const b=v1rcBandAt(e);if(!b)return null;const f=fractionAt(e.date);return f>0?effectiveBandOf(b,f,RC):b;};
 const end=(date,reason)=>{if(!(total>0)&&!pending)return;for(const s of steps)if(!s.endedOn)s.endedOn=date;ended={date,reason};ends.push(ended);total=0;pending=null;lastChange=date;slower=0;};
 const declined=new Set(),harder=e=>num(e.rpe)&&e.rpe>cue[1]||e.effortHarder===true;let offer=null,answered=null,ignored=[],evidenceFrom=null,slower=0;
 for(const w of weeks){
  const start=w.startDate,next=onDate(start,7),prev=byIndex.get(w.index-1)??null;offer=null;answered=null;
  if(pending&&pending.effectiveFrom<=start){steps.push({fraction:pending.step,effectiveFrom:pending.effectiveFrom,offerId:pending.offerId,endedOn:null});total+=pending.step;since=pending.effectiveFrom;lastChange=pending.effectiveFrom;evidenceFrom=pending.effectiveFrom;pending=null;ended=null;slower=0;}
  const insight=from=>insightOf(REVISION_DOMAIN,execs,{weekStart:start,cutoff:start,bandAt,since:from},V,RC);
  // What ends a revision at a week boundary: the taper or race week starts, a new reference, a withdrawal, a downward training factor, the
  // insight reading slower than the band, or 56 days with no support from the athlete's own sessions.
  if(total>0||pending){
   const state=total>0?insight(null).state:null;
   if(NO_REVISION_PHASES.includes(w.phase))end(start,'TAPER_OR_RACE_WEEK_STARTS');
   else if(prev&&w.referenceId!==prev.referenceId)end(start,'NEW_V1RC_REFERENCE');
   else if(w.withdrawal)end(start,'V1RC_WITHDRAWAL');
   else if(prev&&num(w.factor)&&num(prev.factor)&&w.factor<prev.factor-EPS||w.withdrawn===true)end(start,'V1RC_TRAINING_FACTOR_DOWN');
   else if(state==='SLOWER_THAN_BAND')end(start,'INSIGHTS_SLOWER_THAN_BAND');
   else if(total>0&&since&&dayGap(since,start)>=56&&!['STABLE','IMPROVING'].includes(state))end(start,'LAPSED');
  }
  // The offer of this week (offeredWhen), worked out at its boundary from what was on record before it. No execution supports two steps: after
  // a step only the executions from its effective date are read, and after a revision ended only the ones after the day it ended.
  const i=insight(evidenceFrom),windowed=execs.filter(e=>e.date<start&&e.recordedOn<start&&dayGap(e.date,start)<=V.windowDays);
  const votes=i.sessions.filter(s=>!s.exceptional),room=A.totalMax-total,why=[];
  if(i.state!=='IMPROVING')why.push('STATE_'+i.state);
  if(!(w.band?.derived===true))why.push('NO_DERIVED_BAND');
  if(!(num(w.factor)&&w.factor>=cap-EPS)||w.withdrawn===true)why.push('TRAINING_FACTOR_NOT_AT_ITS_CAP');
  if(votes.some(s=>!(s.measurement==='TRACK'||s.measurement==='GPS'&&s.gpsGood)))why.push('MEASUREMENT_NOT_TRACK_OR_GOOD_GPS');
  if(votes.some(s=>!num(s.totalWorkMinutes,T.totalWorkMinutesMin)))why.push('TOTAL_WORK_BELOW_15_MIN');
  // A session reported harder than the cue is the athlete's word, not pace evidence: it is read whatever a pace reader may read of the run.
  if(windowed.some(harder))why.push('HARDER_THAN_CUE_IN_THE_WINDOW');
  if(list(x.adverse).some(d=>d<start&&dayGap(d,start)<=7))why.push('ADVERSE_RESPONSE_WITHIN_7_DAYS');
  if(w.mode!=='EASY')why.push('MODE_'+(w.mode??'UNKNOWN'));
  if(w.withdrawal)why.push('V1RC_WITHDRAWAL');
  if(list(x.breaks).some(b=>b.days>=7&&b.to>=onDate(start,-V.windowDays)&&b.from<start))why.push('DECLARED_BREAK_IN_THE_WINDOW');
  if(w.index===x.now&&x.screenRequired===true)why.push('WARNING_SIGN_SCREEN_REQUIRED');
  if(!x.experience||x.experience==='NONE')why.push('EXPERIENCE_'+(x.experience??'UNKNOWN'));
  if(NO_REVISION_PHASES.includes(w.phase))why.push('PHASE_'+w.phase);
  if(x.raceDate&&dayGap(start,x.raceDate)<=14)why.push('WITHIN_14_DAYS_OF_THE_RACE');
  if(lastChange&&dayGap(lastChange,start)<28)why.push('LESS_THAN_28_DAYS_SINCE_THE_LAST_STEP_OR_END');
  if(pending)why.push('A_STEP_IS_ALREADY_CONFIRMED');
  const margin=median(votes.map(s=>s.marginOverFastEdge)),size=margin===null?0:Math.min(margin,A.step.maxPerStep,room);
  if(!(size>EPS))why.push('NO_ROOM_UNDER_THE_TOTAL');
  const evidence=hash(votes.map(s=>s.eventId));
  if(declined.has(evidence))why.push('THIS_EVIDENCE_WAS_DECLINED');
  if(!why.length){
   const stepFraction=Math.round(size*1e6)/1e6,sessions=votes.map(s=>s.eventId);
   offer={offerId:hash({scope:x.scope??null,domain:REVISION_DOMAIN,week:w.index,weekStart:start,stepFraction,sessions}),domain:REVISION_DOMAIN,week:w.index,computedAt:start,stepFraction,medianMarginOverFastEdge:margin,sessions,evidence,expiresAtWeekBoundary:next,effectiveFrom:next,
    revisionTotalAfter:Math.round((total+stepFraction)*1e6)/1e6,testFirst:w.index===x.now&&x.p3Offered===true};
  }
  // The athlete's answers of this week, and what a session of this week says of a revision in force, in the order they happened.
  const events=[...responses.filter(r=>r.date>=start&&r.date<next).map(r=>({date:r.date,order:1,r})),...list(x.adverse).filter(d=>d>=start&&d<next).map(d=>({date:d,order:0,adverse:true})),...execs.filter(e=>e.date>=start&&e.date<next).map(e=>({date:e.date,order:0,e}))].sort((a,b)=>a.date<b.date?-1:a.date>b.date?1:a.order-b.order);
  for(const ev of events){
   if(ev.r){
    const r=ev.r;
    if(r.response==='REVOKE'){if(total>0||pending)end(r.date,'REVOKED_BY_THE_ATHLETE');else ignored.push({offerId:r.offerId,response:r.response,reason:'NO_REVISION_IN_FORCE'});continue;}
    if(!offer||r.offerId!==offer.offerId||answered){ignored.push({offerId:r.offerId,response:r.response,reason:answered?'OFFER_ALREADY_ANSWERED':'NO_SUCH_OFFER_THIS_WEEK'});continue;}
    answered=r.response;
    if(r.response==='ACCEPT')pending={step:offer.stepFraction,effectiveFrom:next,offerId:offer.offerId,confirmedOn:r.date};
    else if(r.response==='DECLINE')declined.add(offer.evidence);
    else{answered=null;ignored.push({offerId:r.offerId,response:r.response,reason:'UNKNOWN_RESPONSE'});}
    continue;
   }
   if(!(total>0)&&!pending)continue;
   // An adverse response, or a session harder than the cue, ends a revision in force and one confirmed for the next week alike.
   if(ev.adverse){end(ev.date,'ADVERSE_RESPONSE');evidenceFrom=onDate(ev.date,1);continue;}
   const e=ev.e;if(e.comparable!==true)continue;
   if(harder(e)){end(e.date,'HARDER_THAN_CUE_EXECUTION');evidenceFrom=onDate(e.date,1);continue;}
   // Two sessions in a row at an effort inside the cue and slower than the effective band: a pace reading, so only of admitted pace evidence.
   if(!(total>0)||e.admitted!==true)continue;
   const b=bandAt(e),inCue=num(e.rpe,cue[0],cue[1])&&num(e.secondsPerKm,1)&&b;
   if(inCue&&e.secondsPerKm/b.slowSecondsPerKm-1>trigger){if(++slower>=2){end(e.date,'TWO_SLOWER_EXECUTIONS');evidenceFrom=onDate(e.date,1);}}else if(inCue)slower=0;
  }
  if(ended&&!(total>0)&&!pending&&(!evidenceFrom||evidenceFrom<=ended.date))evidenceFrom=onDate(ended.date,1);
 }
 const w=byIndex.get(x.now)??weeks.at(-1)??null,today=x.asOfDay??w?.startDate??null,inForce=total>0&&today?fractionAt(today):0,open=offer&&!answered&&!pending?offer:null;
 const status=pending||total>0?'ACTIVE':open?'OFFERED':ended?'ENDED':'NONE',latest=steps.filter(s=>!s.endedOn).at(-1)??null,lapses=latest?weeks.map(k=>k.startDate).concat(w?[onDate(w.startDate,7)]:[]).find(d=>dayGap(latest.effectiveFrom,d)>=56)??onDate(latest.effectiveFrom,56):null;
 return {status,domain:REVISION_DOMAIN,offer:open?{...open,requiredText:A.requiredText.replace('<n>',String(open.sessions.length)).replace('<x>',String(Math.round(open.stepFraction*1000)/10)).replace('<date>',open.effectiveFrom),offerOrder:open.testFirst?A.offerOrder:null}:null,
  active:status==='ACTIVE'?{fraction:Math.round((total+(pending?.step??0))*1e6)/1e6,inForceToday:inForce,effectiveFrom:pending?pending.effectiveFrom:latest?.effectiveFrom??null,pending:!!pending,steps:steps.filter(s=>!s.endedOn).map(s=>({fraction:s.fraction,effectiveFrom:s.effectiveFrom,offerId:s.offerId})),endsOn:[...ENDS],lapsesOn:lapses,
   label:{id:A.label.split(',')[0],percent:Math.round((total+(pending?.step??0))*1000)/10,effortGoverns:true}}:null,
  ended:ended?{...ended}:null,history:{steps:steps.map(s=>({...s})),ends:ends.map(e=>({...e})),ignored},
  /** The revision in force for a session not yet started, on its day: none once it ended, before a step takes effect, or in a taper or race week. */
  fractionOn:(date,phase=null)=>NO_REVISION_PHASES.includes(phase)?0:Math.round((total+(pending&&pending.effectiveFrom<=date?pending.step:0))*1e6)/1e6,fractionAt,bandAt};
}
/** IC-2, the one source of the threshold band: the calibration's band of a week with the revision in force that week, or the band itself. */
export const effectiveBand=(band,fraction,RC)=>isObj(band)&&band.status==='AVAILABLE'&&fraction>0?{...band,...effectiveBandOf(band,fraction,RC),label:'ATHLETE_CONFIRMED_REVISION',revision:{fraction,ofTheV1rcBand:{fastSecondsPerKm:band.fastSecondsPerKm,slowSecondsPerKm:band.slowSecondsPerKm},effortGoverns:true}}:band;
