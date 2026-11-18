// Phase C, E-1 reproduction: a run reported in two voices (contract IOS_RUN_REPORT_INTEGRATION_CONTRACT §2): the device report (activity id,
// measurements, response unknown) and the athlete report (no activity id, recovery/effort/next-day function, rpe). A device re-sync arrives as
// a correction of the device report. Does the live row keep what the athlete said? Prints JSON; writes nothing.
//   node audits/v1-core-safety-lifecycle-2026-11-18/repro/repro-e1.mjs [entry]
import {client,athleteA,reportOf,liveSessions,at,ELIG,addDays} from '../../../CoachingCore/test/v1core-helpers.mjs';
const entry=process.argv[2]??'v1-strength-index.mjs';
const S=await import('../../../CoachingCore/src/'+entry);
const c=client(S);c.onboard(athleteA({weeks:8,id:'e1'}));
const s=liveSessions(c.env,0).find(x=>x.sport==='RUN'),base=reportOf(c.env,s);
const {response:_r,eventId:_e,...body}=base,actual={...base.actual};delete actual.rpe;
const device={...body,eventId:'dev-1',actual:{...actual},source:{provider:'HEALTHKIT',activityId:'HK-1',quality:'WEARABLE_FULL'},canonicalActivityId:'HK-1',response:{performance:'UNKNOWN',recovery:'UNKNOWN',effort:'UNKNOWN',nextDayFunction:'UNKNOWN'}};
const athlete={sessionId:s.id,occurrenceDate:base.occurrenceDate,eventId:'ath-1',actual:{completed:true,rpe:8},response:{performance:'UNDER',recovery:'ADVERSE',effort:'HARDER',nextDayFunction:'IMPAIRED'}};
const d1=addDays(s.date,0),d2=addDays(s.date,1);
const r1=c.review('WEEKLY_REVIEW',at(d1,'21:00'),{eligibility:ELIG(d1),observations:[device,athlete]},'two-voices');
const row=()=>c.env.actualLedger.filter(o=>!o.fact&&o.sessionId===s.id&&!o.superseded).map(o=>({eventId:o.eventId,response:o.response,rpe:o.actual?.rpe??null,minutes:o.actual?.minutes,merged:o.provenance?.mergedSourceIds??null,conflicted:!!o.conflicted}));
const afterMerge=row(),ev1=r1.weekEvidence?.adverseSessions;
const resync={...device,eventId:'dev-1b',correctionOf:'dev-1',correctedAt:at(d2,'07:00'),actual:{...actual,minutes:(actual.minutes??30)+1}};
const r2=c.review('WEEKLY_REVIEW',at(d2,'20:00'),{eligibility:ELIG(d2),observations:[resync]},'resync');
console.log(JSON.stringify({entry,afterMerge,adverseAfterMerge:ev1,afterResync:row(),adverseAfterResync:r2.weekEvidence?.adverseSessions,status:[r1.status,r2.status]},null,1));
