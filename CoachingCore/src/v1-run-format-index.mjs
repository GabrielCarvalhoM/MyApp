// CoachingCore V1 Run Workout Structure (Founder request of 2026-11-13): the V1 engine and its run calibration, with the native run formats.
// - It wraps v1-run-index.mjs, which wraps v1-index.mjs, and changes neither: every plan, decision, record and calibration they return is returned
//   as it is. One entry point serves one record (a record kept through this one is read through this one).
// - It adds to each result: `runSessions` (the planned run sessions of the week in force and of the two after it as they are prescribed, by
//   distance or by time, and every executed session with its reading), `runFormat` (the extension's state: what it asks, what it offers, what it could not read), `runFormatRecord`
//   (the formats delivered, append-only: a report is read against the format it cites, never against today's bands) and `runHistoryRecord` (the
//   dated run distances an intake brought, which the engine does not keep). The caller keeps both records and sends them back, as it keeps the
//   engine's record and the calibration's evidence record.
// - A review may carry `runFormatRecord`, `runHistoryRecord` and `runExpression` ('TIME': the athlete prefers every run by time); an intake may
//   carry `runExpression` and `athlete.recentLongestRun`. All are taken off before the engine reads its input, so its decision is the one it makes
//   without them. An integration passes no options.
// - The completion of a native session is never accepted from anywhere: any `completionRead` on an observation, in the review or in the carried
//   record, is dropped, and the reading is made by the engine's own binding, on its canonical row, through this module's reader (the one key of
//   r6-adaptation.mjs's amendment, which a caller's options can never set here).
// - With the boundary off (no enabling record bound to the pinned values) every added key is inert and everything else is v1-run-index.mjs.
// - One run reported by several sources (the app and a device import) is one row of the engine's record, and a report that contradicts another is
//   refused. Nothing here depends on which report brought a fact, or on the order they came in (fix-forward of 2026-11-14):
//   * Reliability is read from the row as the record holds it now, and the calibration is handed the record as admitted (`admitted`): a run
//     whose own facts, or whose reports, say its distance is not one whole checked measurement reaches no reader of pace or capacity. No stored
//     row is rewritten for it, and no frozen reader is changed.
//   * A stop a run report declares is kept as a fact of this extension's record when the report is received, whatever the engine then does with
//     the report, and is read on every row the record holds, in conflict or replaced as well: it asks for the warning-sign screen until the
//     screen is answered after it. It is never execution credit.
// - What a source does not say never removes what another said (final fix-forward of 2026-11-14, QRE-RWS-C-01 and C-05):
//   * A field of a run report that states nothing (an empty list, an empty declaration) is not handed to the engine's merge, so the row keeps
//     what the other report stated; and what each report states that withholds a distance from pace readers (further recordings, a correction,
//     the athlete's own figure) is kept as a report fact and read on every report a row was made of, whatever the row then holds.
//   * Every answer reads the record the same way first (readingOf), the answers that deliver no session as well: the calibration an answer
//     carries is the one over the record as admitted, or none, and the screen the record asks for is named in it.
//   * A row of the record of reports that cannot be read is never read as nothing: while it is there the screen is asked, run sessions are by
//     time and no distance is handed to a pace reader. Data proven invalid is told apart from data that is not there (which only the custody's
//     keyed chain can tell), and is never read as a confirmed symptom either.
// - A row goes to a reader of pace, capacity or a race result only when it carries every run report still in force for its session (evidence
//   lineage fix-forward of 2026-11-15, QRE-RWS-D-01; SSCTR lineage items L1 to L4):
//   * The engine replaces a whole row on any correction, whoever sent it, and refuses a report that contradicts another. So every run report
//     received leaves a report fact with who it speaks for (the athlete, one identified device activity, or a device that is not identified),
//     and a report stays in force until an applied correction of its own speaker replaces it. A row that is not made of every report in force
//     is withheld from pace readers (REPORT_NOT_CARRIED), whatever the missing report said. The lineage only withholds: it adds no distance,
//     no credit and no source, and completion, credit, load and the stops are read as before, on the row and on the report facts.
//   * Known cost, accepted for the synthetic candidate (SSCTR L1-f): with the engine as frozen, a run one source corrects after the other also
//     reported it is out of pace evidence for good. Before any real athlete an integration states how often, and gives the way back if it matters.
//   * HARD GATE OF A REAL INTEGRATION, not met by anything here (engine finding E-1, SSCTR item L5): a device re-sync of an execution the athlete
//     also reported, sent as a correction, makes the frozen engine's row lose the athlete's answers (recovery, effort, next-day function,
//     conditions, walk breaks). This extension then withholds the run's pace evidence; it does not give the engine those answers back. An
//     integration shows, by result, that such a re-sync never erases the athlete's answers in the engine's record, or asks the Founder for a
//     controlled change of the engine.
// - The records this entry point returns (`runFormatRecord`, which also holds the report facts, `runHistoryRecord`, and the calibration's
//   `runEvidenceRecord`) are kept by the caller. An integration keeps the three under the custody's keyed chain, stored atomically with the
//   engine's record in one sealed commit (Security A-01, A-06): that integration does not exist yet and nothing here stands for it.
import {generateProgram as generate,evaluateProgram as evaluate,restartProgram as restart,validProgram,V1_SCOPE,V1_UNAVAILABLE,WITHHOLDABLE,V1_ENGINE,V1_RUN_ENGINE} from './v1-run-index.mjs';
import {READS_COMPLETION,historicalStateOf as engineHistoricalState,doseKeyOf} from './r6-adaptation.mjs';
import {runCalibrationOf as calibrate} from './v1-run-calibration.mjs';
import {utcTimestamp,localDate} from './r6-provenance.mjs';
import {clone,freeze} from './value.mjs';
import {runFormatAuthority,allowsFormat,selectRunSession,reselectRunSession,readFormatRecord,appendFormats,readCompletion,executionOf,pausedUntil,flatSteps,stopOf,reportFactOf,stopOnly,appendReportFacts,readReportFacts,reportsReading,FORMAT_EXTENSION_ID,RUN_FORMAT_VERSION} from './v1-run-format.mjs';
import {runHistory,factsFromIntake,appendHistory,distanceFacts,L30,comparableLongRun,latestClassRun,onDate,inForce as inForceAt} from './v1-run-history.mjs';
export {validProgram,V1_SCOPE,V1_UNAVAILABLE,WITHHOLDABLE,V1_ENGINE,V1_RUN_ENGINE};
export {runCalibrationAuthority,readEvidence,RUN_BOUNDARIES,RUN_EXTENSION_ID,RUN_EVIDENCE_DECLARED} from './v1-run-index.mjs';
export {runFormatAuthority,FORMAT_BOUNDARIES,FORMAT_EXTENSION_ID,RUN_FORMAT_EMITTED,RUN_REPORT_RECEIVED} from './v1-run-format.mjs';
export {RUN_HISTORY_FACT,PACE_WITHHELD,WHOLE_ROW_WITHHELD} from './v1-run-history.mjs';
export const V1_RUN_FORMAT_ENGINE=V1_RUN_ENGINE+'+'+FORMAT_EXTENSION_ID;

/**
 * The one source of a band (preflight SC-4, IC-2 of the Race Forecast handoff): the key under which a later entry point that wraps this one may hand
 * a function ({week, domain, band}) giving the band in force for a week and a domain. Absent, and whenever what it gives is no readable band of the
 * same domain, the band is V1RC's own. Nothing sets it in this extension: the pace revision it serves is not part of it. An integration passes no options.
 */
export const BAND_OF=Symbol('V1RWS: the band in force for a week and a domain');
const readableBand=(b,domain)=>isObj(b)&&b.status==='AVAILABLE'&&b.domain===domain&&num(b.fastSecondsPerKm,1)&&num(b.slowSecondsPerKm,b.fastSecondsPerKm);
/** How far ahead of the week in force a session is delivered, and so kept on the record of formats: this week and the two after it. */
export const HORIZON_WEEKS=2;
const isObj=o=>!!o&&typeof o==='object'&&!Array.isArray(o);
const list=v=>Array.isArray(v)?v:[];
const num=(v,lo=-Infinity,hi=Infinity)=>typeof v==='number'&&Number.isFinite(v)&&v>=lo&&v<=hi;
const upper=v=>typeof v==='string'&&v.trim()?v.trim().toUpperCase().replace(/[\s-]+/g,'_'):null;
const isoDay=v=>typeof v==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(v)&&Number.isFinite(Date.parse(v+'T00:00:00Z'));
const without=(o,keys)=>Object.fromEntries(Object.entries(o).filter(([k])=>!keys.includes(k)));
/** The keys of this extension on a review and on a restart input: never read by the engine. */
const MINE=['runFormatRecord','runHistoryRecord','runExpression'];
/** A caller's options without the reader's key: only this module sets it (handoff section 5, SC-6). */
const internal=options=>{const {[READS_COMPLETION]:_never,...rest}=isObj(options)?options:{};return rest;};
const shaped=v=>isObj(v)&&['tied','distances','envelope','catalog','patterns','recoveryByDistance','eligibility','sizingExclusions','exposure','stops','runFacts','statuses','suppression','texts'].every(k=>isObj(v[k]))&&Array.isArray(v.runFacts.declaredFailureReasons)&&Array.isArray(v.runFacts.measuredSources)&&Array.isArray(v.runFacts.plausiblePaceSecondsPerKm);
const authorityOf=opts=>{try{const ext=runFormatAuthority(opts);return {ext,on:allowsFormat(ext)&&shaped(ext.values)};}catch{return {ext:null,on:false};}};
const preferenceOf=v=>upper(v)==='TIME'?'TIME':'NATIVE';
/** An intake without this extension's keys (the engine hashes what it is given), and what they said. */
function takeIntake(input){
 if(!isObj(input))return {clean:input,preference:'NATIVE'};
 let clean=input;
 if('runExpression' in clean)clean=without(clean,['runExpression']);
 if(isObj(clean.athlete)&&'recentLongestRun' in clean.athlete)clean={...clean,athlete:without(clean.athlete,['recentLongestRun'])};
 return {clean,preference:preferenceOf(input.runExpression)};
}
const head=(ext,on)=>({version:RUN_FORMAT_VERSION,extension:{id:FORMAT_EXTENSION_ID,sha256:ext?.sha256??null,source:ext?.source??null,boundaries:{NATIVE:on}}});
const inert=(base,ext,on,status,reason,formats,history,extra={})=>({...base,runSessions:{},runFormat:{...head(ext,on),status,reason,...extra},runFormatRecord:clone(list(formats)),runHistoryRecord:clone(list(history))});
const liveRun=(o,athleteId)=>isObj(o)&&!o.fact&&o.superseded!==true&&o.athleteId===athleteId&&o.context?.sport==='RUN'&&isObj(o.actual)&&typeof o.sessionId==='string';
const wearableRow=o=>String(o.provenance?.sourceQuality??'').startsWith('WEARABLE');
const recordedInstant=o=>Number.isFinite(Date.parse(o.provenance?.firstRecordedAt))?Date.parse(o.provenance.firstRecordedAt):Date.parse(o.observedAt);
const SCREEN_NOTE='Take the athlete to the existing warning-sign screen; run sessions are by time until it is answered after the stop';
const UNREADABLE_NOTE='A row of the record of run reports cannot be read: what it said is unknown, a stop included. Take the athlete to the existing warning-sign screen; run sessions are by time and no distance is pace evidence until the record is sent as it was kept';
/**
 * The fields of a run report that state nothing when empty (a list with nothing in it, a declaration with nothing in it, a distance of zero),
 * and are then not handed to the engine's merge (evaluateProgram). The engine reads none of them; the calibration reads `conditions` as a list
 * and a distance only from half a kilometre: to each reader the field is the same empty or absent.
 */
const STATES_NOTHING_WHEN_EMPTY=['segments','steps','conditions','declared','distanceKm','manualDistanceKm'];
const emptyValue=v=>Array.isArray(v)?v.length===0:isObj(v)?Object.keys(v).length===0:v===0;
/** The calibration of an answer whose record could not be read as admitted: none is shown (fail closed; the shape v1-run-index.mjs gives an unavailable calibration). */
const NOT_ADMITTED=Object.freeze({status:'UNAVAILABLE',reason:'RECORD_NOT_ADMITTED',sessions:{}});
/** The calibrations v1-run-index.mjs gives when it read nothing from the record. */
const NOTHING_READ=['DISABLED','NOT_APPLICABLE'];
const SIGNS=['pain','persistentPain','injury','illness','functionalLimitation','clinicalConcern'];

/**
 * What a record asks for and what it admits, read once, the same way, for every answer this entry point gives on it (QRE-RWS-C-05). `c` is what
 * the answer is about: the plan in force, the engine's record, the record of formats and report facts, the instant and the eligibility read.
 * - `facts`, `adm`: what each report said and which reports are in force (read with the engine's record, which shows the corrections applied),
 *   and the engine's record as a pace reader may read it (admitted).
 * - `symptomStops`: every stop for a symptom, on every run report this record received (the report facts: also a report the engine refused
 *   because it contradicts another) and on every row the engine's record holds for a run session (as the engine bound the row), whatever its
 *   expression, in conflict or replaced by a correction as well, that no screen was answered after. A stop on a row the engine binds to no run
 *   session is read from its report fact, which names no plan. A contradiction between sources, a merge or a later correction never removes the
 *   signal: only the screen does, every item answered no, assessed after the record first held the stop and no later than the instant of the
 *   review that reads it (a screen dated after its own review answers nothing yet; SSCTR-RWS-C-02). It is nothing else: no credit, no pause
 *   count, no sizing, and the extension decides no clearance (R3 C4; SSCTR-RWS-B-01).
 * - `symptomSessions`: their sessions, with those of the stops the request itself declares (`c.requested`), recorded or not.
 * - `unreadable`: the rows of the record of reports that cannot be read.
 * Never throws: a record that cannot be read at all gives `ok: false`, under which no calibration is shown and the screen is asked.
 */
function readingOf(c,V){
 try{
  const {program,ledger,formats,asOf,eligibility}=c,athleteId=program.athleteId,tz=program.timezoneOffsetMinutes??0,dayOnly=isoDay(asOf),at=dayOnly?asOf+'T23:59:59.000Z':utcTimestamp(asOf),asOfDay=!at?null:dayOnly?asOf:localDate(at,tz);
  const facts=readReportFacts(formats,athleteId,V,ledger),adm=admitted(ledger,{athleteId,facts},V);
  const el=isObj(eligibility)?{...eligibility,...(isObj(eligibility.flags)?eligibility.flags:{})}:null,screened=el?.status==='NONCLINICAL_CONFIRMED'&&SIGNS.every(k=>el[k]===false)&&typeof el.assessedAt==='string'?el.assessedAt:null;
  const answeredAfter=instant=>!!screened&&!!at&&(isoDay(screened)?screened>localDate(new Date(instant).toISOString(),tz)&&screened<=asOfDay:Number.isFinite(Date.parse(screened))&&Date.parse(screened)>instant&&Date.parse(screened)<=Date.parse(at));
  const rowStops=list(ledger).filter(o=>isObj(o)&&!o.fact&&o.athleteId===athleteId&&isObj(o.actual)&&typeof o.sessionId==='string'&&o.context?.sport==='RUN').map(o=>({sessionId:o.sessionId,reason:stopOf(o.actual,V)?.reason??null,at:recordedInstant(o)}));
  const symptomStops=[...facts.stops,...rowStops].filter(x=>x.reason==='SYMPTOM'&&Number.isFinite(x.at)&&!answeredAfter(x.at));
  return {ok:true,tz,dayOnly,at,asOfDay,facts,adm,el,symptomStops,symptomSessions:[...new Set([...symptomStops.map(x=>x.sessionId),...list(c.requested)])].sort(),unreadable:facts.unreadable};
 }catch{return {ok:false,at:null,adm:{ledger:[],withheld:[]},symptomStops:[],symptomSessions:[...list(c?.requested)].sort(),unreadable:[]};}
}
/**
 * The screen a reading asks for. A stop for a symptom is the athlete's own word; a row that cannot be read is not: it asks for the same screen
 * and says why, and is never named as a symptom.
 */
const screenOf=r=>r.symptomSessions.length?{status:'REQUIRED',reason:'RUN_STOPPED_FOR_A_SYMPTOM',sessionIds:r.symptomSessions,decidedByThisExtension:false,note:SCREEN_NOTE}
 :!r.ok||r.unreadable.length?{status:'REQUIRED',reason:'RUN_REPORT_UNREADABLE',sessionIds:[],decidedByThisExtension:false,note:UNREADABLE_NOTE}:{status:'NOT_RAISED_BY_THIS_EXTENSION'};
/**
 * The result with the calibration an answer may carry: the one v1-run-index.mjs made when it read nothing from the record or when the record
 * admits every row (then it is that calibration, byte for byte); made again over the record as admitted, with the same arguments, when a row's
 * distance is withheld; and none when the record could not be read as admitted.
 */
function admittedCalibration(base0,c,r){
 const cal=base0?.runCalibration;
 if(!isObj(cal)||NOTHING_READ.includes(cal.status))return base0;
 if(!r.ok)return {...base0,runCalibration:NOT_ADMITTED};
 if(!r.adm.withheld.length)return base0;
 let again;try{again=calibrate({program:c.program,ledger:r.adm.ledger,evidenceRecord:Array.isArray(base0.runEvidenceRecord)?base0.runEvidenceRecord:[],asOf:c.asOf,weekIndex:c.weekIndex,hold:c.hold===true,engineStatus:c.engineStatus,eligibility:c.eligibility},c.opts);}catch{again={status:'UNAVAILABLE',reason:'CALIBRATION_ERROR',sessions:{}};}
 return {...base0,runCalibration:again};
}
/**
 * An answer that delivers no session (a refused review, one earlier than the record, an unreadable format or instant, an error of this
 * extension): the engine's result with the calibration over the record as admitted, the screen the reading asks for, and what was withheld or
 * could not be read. `record` is the record of formats returned: nothing is recorded by the answer itself.
 */
function heldAnswer(base0,c,r,status,reason,record){
 const screen=screenOf(r);
 return inert(admittedCalibration(base0,c,r),c.ext,c.on,status,reason,record,c.historyRecord,{...(screen.status==='REQUIRED'?{warningSignScreen:screen}:{}),...(r.unreadable.length?{unreadableReports:r.unreadable}:{}),...(r.adm.withheld.length?{paceEvidenceWithheld:r.adm.withheld}:{})});
}

/**
 * The record as a reader of pace or capacity may read it (QRE-RWS-B-01; R3A A1 condition 4: how the calibration's input marks a distance that is
 * not a measured distance of the whole run). The engine's record is read row by row, each as the record holds it now (reports of one run already
 * merged), with what the reports of its session said (`facts`, readReportFacts). A live run row that is withheld (distanceFacts'
 * `paceWithheld`: several recordings, a correction with a listed failure reason, no duration, a figure of the athlete's or of another report
 * that disputes it; or, of the row whole, a report in force the row does not carry, or a record of reports that cannot be read) is handed over
 * without its distance and marked POOR, so the calibration reads it as no easy-pace observation, no comparable harder session and no race
 * result. The reasons of the row whole stand on a row that carries no distance as well: its work pace is no pace evidence either. Every other
 * row is handed over as it is, and when nothing is withheld the record itself is returned.
 * Nothing is rewritten: the record the caller keeps is the engine's, whole. `withheld` names each row and why.
 */
export function admitted(ledger,{athleteId,facts=null},V){
 const withheld=[],rows=list(ledger).map(o=>{
  if(!liveRun(o,athleteId))return o;
  const why=distanceFacts(o.actual,V,{wearable:wearableRow(o),reports:reportsReading(o,facts,V)}).paceWithheld;if(!why)return o;
  withheld.push({sessionId:o.sessionId,eventId:typeof o.eventId==='string'?o.eventId:null,reason:why});
  return {...o,actual:{...without(o.actual,['distanceKm']),gpsQuality:'POOR'}};
 });
 return {ledger:withheld.length?rows:ledger,withheld};
}
/**
 * The run calibration of a record kept through this entry point: V1RC's own (v1-run-calibration.mjs, unchanged), over the record as admitted.
 * `runFormatRecord` is the record of formats and report facts kept with the engine's record. With the boundary off it is V1RC's as it is.
 * The record is admitted for whatever plan V1RC is given: V1RC reads the rows of the plan's athlete whether or not the plan is the engine's own.
 */
export function runCalibrationOf(input,options={}){
 const opts=internal(options),{ext,on}=authorityOf(opts);
 if(!on||!isObj(input)||!isObj(input.program))return calibrate(input,opts);
 const {runFormatRecord,...rest}=input,facts=readReportFacts(runFormatRecord,input.program.athleteId,ext.values,input.ledger);
 return calibrate({...rest,ledger:admitted(input.ledger,{athleteId:input.program.athleteId,facts},ext.values).ledger},opts);
}

/**
 * The observed easy range (P1) of the week in force and of the next, exactly as V1RC computes it: the EASY band V1RC itself gives the same record
 * when no result calibrates it (its own observed-at-effort band). Read through V1RC, never recomputed here (R3 C1 condition). Null when V1RC
 * reports no such range. `ledger` is the record as admitted.
 */
function observedEasyOf({program,ledger,asOf,weekIndex,engineStatus,eligibility},opts){
 const bare={...program,canonical:{...program.canonical,athlete:{...program.canonical.athlete,performanceAnchors:[]}}};
 const cal=calibrate({program:bare,ledger:list(ledger).filter(o=>!(isObj(o)&&!o.fact&&o.context?.family==='RACE')),evidenceRecord:[],asOf,weekIndex,engineStatus,eligibility},opts);
 const of=b=>b?.status==='AVAILABLE'&&b.basis==='OBSERVED_AT_EFFORT'&&b.method==='MEDIAN_OF_OWN_EASY_RUNS'?{fastSecondsPerKm:b.fastSecondsPerKm,slowSecondsPerKm:b.slowSecondsPerKm}:null;
 return {now:of(cal.paceBands?.EASY),next:of(cal.nextWeek?.paceBands?.EASY)};
}
/** The reader the engine's bindings call on each canonical run row: the status of a report that cites a native format, or nothing. */
const readerOf=(formats,V)=>(o,s)=>{
 const h=o.actual?.formatHash;if(typeof h!=='string')return null; // no format cited: the time version, read by the engine as always
 const f=formats.resolve(s.id,h);if(!f)return 'UNKNOWN';           // a format the record does not hold is never read as complete
 // A format that expresses another dose than the session now plans (the engine planned it again) credits nothing by distance: the minutes read.
 return f.expression==='NATIVE'&&f.plannedPrescriptionHash===s.plannedPrescriptionHash?readCompletion(o.actual,f,V,{wearable:wearableRow(o)}).status:null;
};

/** The extension's part of a result: the sessions as prescribed, the executions as read, the records. Never fails the engine's result. */
function finish(base0,c){
 const {program,ledger,formats,historyRecord,asOf,weekIndex,preference,engineStatus,eligibility,opts,ext,on,notes={}}=c;
 if(!on)return inert(base0,ext,on,'DISABLED','EXTENSION_NOT_ENABLED',formats,historyRecord);
 // The record is read before anything is answered, and every way out of this function answers from that reading.
 const V=ext.values,r=readingOf(c,V),held=(status,reason)=>heldAnswer(base0,c,r,status,reason,formats);
 if(!r.ok)return held('UNAVAILABLE','FORMAT_ERROR');
 if(!r.at)return held('NOT_APPLICABLE','REVIEW_TIME_REQUIRED');
 try{
  // What each report said, and the record as a pace reader may read it. When a row's distance is withheld, the calibration v1-run-index.mjs
  // made over the bare record is made again over the admitted one, with the same arguments; when none is, it is the one v1-run-index.mjs made.
  const {tz,dayOnly,at,asOfDay,facts,adm,el}=r,reportsOf=o=>reportsReading(o,facts,V),base=admittedCalibration(base0,c,r);
  const w=Math.max(0,Math.min(Number.isInteger(weekIndex)?weekIndex:0,program.weeks.length-1)),cal=base.runCalibration??null;
  const fr=readFormatRecord(formats,program.athleteId),H=runHistory({ledger,record:historyRecord,athleteId:program.athleteId,tz,reportsOf},V);
  const sessions=new Map(program.weeks.flatMap(x=>x.sessions.map(s=>[s.id,s]))),cues=Object.fromEntries(list(cal?.effortDomains).map(d=>[d.id,{rpe:d.rpe,talk:d.talk}]));
  // Every execution on record, read against the format its report cites: the latest report of each session.
  const done=new Map();
  for(const o of list(ledger).filter(o=>liveRun(o,program.athleteId)).sort((a,b)=>Date.parse(a.observedAt)-Date.parse(b.observedAt))){
   const cited=typeof o.actual.formatHash==='string'?fr.resolve(o.sessionId,o.actual.formatHash):null,format=cited&&cited.expression==='NATIVE'&&cited.plannedPrescriptionHash!==sessions.get(o.sessionId)?.plannedPrescriptionHash?{...cited,expression:'TIME',pattern:'TIME'}:cited;
   done.set(o.sessionId,{row:o,format,execution:executionOf(o,format,V,{boutMinutes:sessions.get(o.sessionId)?.prescription?.work?.workMinutes??null,reports:reportsOf(o)}),date:o.localDate,recordedOn:Number.isFinite(Date.parse(o.provenance?.firstRecordedAt))?localDate(new Date(Date.parse(o.provenance.firstRecordedAt)).toISOString(),tz):o.localDate});
  }
  const executed=[...done.values()].filter(x=>!x.row.conflicted);
  // R3 C4: a stop for a symptom (or with no stated reason) keeps every run session by time until the warning-sign screen is answered after it
  // (readingOf). A row of the record of reports that cannot be read does the same while it is there (SEC-RWS-C-06): what it said is unknown.
  // SSCTR-RWS-B-02: while the engine asks for the current eligibility, the screen it asks for is not answered: run sessions are by time.
  const screenRequired=r.symptomSessions.length>0?true:r.unreadable.length?'RUN_REPORT_UNREADABLE':c.eligibilityAsked===true?'ENGINE_ASKS_CURRENT_ELIGIBILITY':false;
  // R3 X-2: a class of continuous runs paused by two consecutive flagged distance sessions (read at once: a withdrawal to time is immediate).
  const pause=Object.fromEntries(V.eligibility.continuous.families.map(family=>[family,pausedUntil(executed.filter(x=>x.row.context.family===family).sort((a,b)=>a.date<b.date?-1:a.date>b.date?1:0).map(x=>({date:x.date,execution:x.execution,actual:x.row.actual})),V,onDate)]));
  const p1=observedEasyOf({program,ledger:adm.ledger,asOf,weekIndex:w,engineStatus,eligibility},opts),schedule=program.canonical?.schedule??{};
  const hook=typeof opts[BAND_OF]==='function'?opts[BAND_OF]:null,inForceBand=(week,band,domain)=>{if(!hook||band?.status!=='AVAILABLE')return band;let b=null;try{b=hook({week,domain,band:clone(band)});}catch{b=null;}return readableBand(b,domain)?{...band,...b}:band;};
  const stepOf=o=>{const k=String(o.context?.doseKey??'').split(':');return k.length===3&&Number.isFinite(Number(k[2]))?Number(k[2]):-1;};
  const runSessions={},emitted=[];
  for(const week of program.weeks)for(const s of week.sessions){
   if(s.sport!=='RUN'||!s.prescription||s.status==='SKIPPED')continue;
   const seen=done.get(s.id)??null;
   if(week.index<w){ // a past week: only what was executed, with the format its report cites (never selected again)
    if(seen)runSessions[s.id]={sessionId:s.id,expression:seen.execution.expression,pattern:seen.execution.pattern??'TIME',formatHash:seen.execution.formatHash,week:week.index,date:s.date,role:s.role,family:s.prescription.family,past:true,provisional:false,execution:seen.execution};
    continue;
   }
   // Only what the record then holds is delivered: the week in force and the two after it (a report can cite nothing else).
   if(week.index>w+HORIZON_WEEKS)continue;
   const weekStart=week.startDate??onDate(program.startDate,7*week.index),cutoff=weekStart<=asOfDay?weekStart:onDate(asOfDay,1),inWeek=week.index===w,view=inWeek||!cal?.nextWeek?cal:cal.nextWeek,p=s.prescription,family=p.family,long=family==='LONG';
   const inForce=x=>inForceAt(x,cutoff),continuous=V.eligibility.continuous.families.includes(family);
   const history=continuous?{p1:inWeek?p1.now:p1.next,l30:L30(H.runs,{cutoff,weekStart},V),comparable:long?comparableLongRun(H.runs,{cutoff,weekStart,minutes:p.durationMinutes},V):null,latest:latestClassRun(H.runs,{cutoff,weekStart,family},V),pausedUntil:pause[family]??null}:null;
   let prior=null;
   if(s.role==='QUALITY'){
    // R2 N10: the last session planned at this step before this one, as the record of the week reads it.
    const key=doseKeyOf(s),before=[...sessions.values()].filter(y=>y.sport==='RUN'&&y.prescription&&y.id!==s.id&&y.date<s.date&&doseKeyOf(y)===key).sort((a,b)=>a.date<b.date?1:-1)[0]??null,last=before?done.get(before.id):null,read=last&&inForce(last)&&!last.row.conflicted?last:null;
    const evenOnly=!!before&&(read?read.execution.completed!==true||read.row.response?.effort==='HARDER':before.status!=='SKIPPED'&&before.date<cutoff);
    // R2 N9: the achieved peak of this family, when it was done as even repetitions by distance: the highest step completed, the latest of them.
    const peak=week.phase==='TAPER'?executed.filter(x=>inForce(x)&&x.row.context.family===family&&x.execution.completed===true&&x.format?.expression==='NATIVE'&&x.format.pattern==='EVEN_REPEATS').sort((a,b)=>stepOf(b.row)-stepOf(a.row)||(a.date<b.date?1:-1))[0]??null:null;
    prior={evenOnly,peakMetres:peak?flatSteps(peak.format.blocks).find(y=>y.kind==='WORK'&&y.target.type==='DISTANCE')?.target.metres??null:null};
   }
   const x={session:s,weekIndex:week.index,phase:week.phase,mode:program.stateTrace?.[Math.max(0,Math.min(week.index,(program.stateTrace?.length??1)-1))]?.run?.mode??null,experience:program.capability?.run?.experience??null,eventKind:program.goal?.run?.event?.kind??null,
    guidance:(g=>g?.pace?.status==='AVAILABLE'?{...g,pace:inForceBand(week.index,g.pace,g.pace.domain)}:g)(cal?.sessions?.[s.id]??null),recoveryBand:(b=>b?inForceBand(week.index,{...b,domain:'RECOVERY'},'RECOVERY'):null)(view?.paceBands?.RECOVERY??null),marathonEstimate:view?.estimates?.MARATHON??null,cues,budgetMinutes:long?schedule.longRunMinutes??schedule.runMinutes:schedule.runMinutes,availableMinutes:long?schedule.longRunMinutes??schedule.runMinutes:schedule.runMinutes,
    preference,enabled:true,engineStatus,screenRequired,history,prior};
   // The format of a session is fixed for its week once a selection delivered it (R2 N10; handoff section 3): its structure is kept while it still
   // passes with today's inputs, unless the engine planned the session again or a state now withdraws it to time (reselectRunSession).
   const settled=inWeek?fr.settledOf(s.id):null,session=settled?reselectRunSession(x,settled,V):selectRunSession(x,V);
   if(!session)continue;
   // Under a clinical route or a standing hold the engine prescribes nothing: the session is laid out by time and says it is not prescribed.
   const given={...session,provisional:week.index>w,prescribed:!['HOLD_NO_PRESCRIPTION','CLINICAL_ROUTE'].includes(session.unavailable?.native)};emitted.push(given);
   runSessions[s.id]=seen?{...given,execution:seen.execution}:given;
  }
  const appended=notes.keepRecord?{record:clone(list(formats)),added:[],notKept:[]}:appendFormats(formats,emitted,{athleteId:program.athleteId,recordedAt:dayOnly?asOf:at});
  const asks=executed.filter(x=>x.execution.ask).map(x=>({sessionId:x.row.sessionId,eventId:x.row.eventId,status:x.execution.status,flag:x.execution.flag??null,ask:x.execution.ask,blocking:false}));
  const offers=executed.filter(x=>x.execution.stop?.reason==='FATIGUE').map(x=>({kind:'SYSTEMIC_FATIGUE_REVIEW',sessionId:x.row.sessionId,eventId:x.row.eventId,behindTheWarningSignScreen:true,decidedByThisExtension:false}));
  const count=k=>Object.values(runSessions).filter(x=>!x.past&&x.expression===k).length;
  // SSCTR-RWS-B-02: `prescribing` is V1RC's own reading (SSCTR-V1RC-R-02): the engine's answer is a prescribing one, the eligibility it read says
  // nonclinical with every warning-sign item answered no, and no hold stands.
  const prescribing=typeof engineStatus==='string'&&!['ASK','HOLD','CLINICAL_HUMAN_REQUIRED','UNSUPPORTED','INVALID_INPUT'].includes(engineStatus)&&el?.status==='NONCLINICAL_CONFIRMED'&&SIGNS.every(k=>el[k]===false)&&cal?.status!=='WITHHELD_HOLD';
  return {...base,runSessions,runFormat:{...head(ext,on),status:'ACTIVE',asOf:at,week:w,prescribing,expressionPreference:preference,native:count('NATIVE'),time:count('TIME'),asks,offers,
   warningSignScreen:screenOf(r),
   pausedContinuous:Object.fromEntries(Object.entries(pause).filter(([,until])=>until&&until>asOfDay)),history:{runs:H.runs.length,unreadable:H.unreadable,...(notes.history??{})},unreadableFormats:fr.unreadable,unreadableReports:facts.unreadable,
   paceEvidenceWithheld:adm.withheld,...(appended.notKept.length?{formatsNotKept:appended.notKept}:{}),...(notes.notRecorded?{notRecorded:notes.notRecorded}:{})},
   runFormatRecord:appended.record,runHistoryRecord:clone(list(historyRecord))};
 }catch{return held('UNAVAILABLE','FORMAT_ERROR');}
}

/** A first plan: the engine's result and its calibration, each run session as it is prescribed, and the record of the runs the intake brought. */
export function generateProgram(input,options={}){
 const opts=internal(options),{clean,preference}=takeIntake(input),base=generate(clean,opts),{ext,on}=authorityOf(opts);
 if(!base?.program)return freeze(inert(base,ext,on,on?'NOT_APPLICABLE':'DISABLED',on?'NO_PLAN':'EXTENSION_NOT_ENABLED',[],[]));
 let history={record:[],added:[],duplicates:[]},skipped=[];
 if(on)try{const f=factsFromIntake(input,ext.values);skipped=f.skipped;history=appendHistory([],f.facts,{athleteId:base.program.athleteId,recordedAt:base.program.canonical?.asOf});}catch{history={record:[],added:[],duplicates:[]};}
 return freeze(finish(base,{program:base.program,ledger:[],formats:[],historyRecord:history.record,asOf:base.program.canonical?.asOf,weekIndex:0,preference,engineStatus:base.status,eligibility:input?.athlete?.eligibility??null,opts,ext,on,notes:{history:{added:history.added,duplicates:history.duplicates,skipped}}}));
}
/** The shell of an answer this entry point gives before any decision is made: nothing planned, nothing recorded (as v1-index.mjs refuses). */
const undecided=(status,reason,extra)=>({runtimeVersion:'R6-1',mode:'SHADOW',status,action:status,reason,program:null,proposal:null,applied:false,missingInputs:[],errors:[],...extra,runCalibration:{status:'NOT_APPLICABLE',reason:'NO_DECISION',sessions:{}},runEvidence:{added:[],refused:[]}});
/**
 * A review: the engine's decision on the review without this extension's keys, every run report bound through the completion reader, then the
 * sessions of the plan in force as prescribed.
 * - A new report that cites a format this record does not hold is not read and not recorded: the review is asked again (R2 N7), unless what it
 *   carries routes clinically, which always comes first. A stop it declares is kept all the same, as a report fact, and named in the answer.
 * - Every answer below, the ones that deliver no session as well (a refused review, one earlier than the record, an unreadable format), reads
 *   the record the same way first (readingOf): the calibration it carries is over the record as admitted, or none, and the screen the record
 *   asks for is named (QRE-RWS-C-05).
 * - A report already on record whose format the format record no longer holds is an integrity failure of the records sent: nothing is decided.
 * - What each run report states that the engine's record may not keep (a declared stop, the distance it measured) is read before the engine
 *   merges or refuses the report, and joins the record of formats as report facts when the engine accepts the review's instant.
 */
export function evaluateProgram(program,review,options={}){
 const opts=internal(options),{ext,on}=authorityOf(opts),formats=isObj(review)&&Array.isArray(review.runFormatRecord)?review.runFormatRecord:[],history=isObj(review)&&Array.isArray(review.runHistoryRecord)?review.runHistoryRecord:[];
 const plain=isObj(review)?without(review,MINE):review,readable=validProgram(program)&&program.version==='R6-PROGRAM-1';
 if(!on||!isObj(review)||!readable)return freeze(inert(evaluate(program,plain,opts),ext,on,on?'NOT_APPLICABLE':'DISABLED',on?'NO_DECISION':'EXTENSION_NOT_ENABLED',formats,history));
 const V=ext.values,fr=readFormatRecord(formats,program.athleteId),planned=new Map(program.weeks.flatMap(x=>x.sessions.map(s=>[s.id,s])));
 const fromDevice=o=>typeof(o.source?.activityId??o.canonicalActivityId)==='string'||String(o.source?.quality??'').startsWith('WEARABLE');
 // Every observation received loses any reading it carries; a new report is recorded with what it may carry as a measurement (below).
 const tidy=fresh=>o=>{
  if(!isObj(o)||!isObj(o.actual))return o;let a=o.actual;
  if('completionRead' in a)a=without(a,['completionRead']);
  if(fresh){
   // A field of a run report that states nothing (an empty list of further recordings, of laps or of conditions; an empty declaration; a
   // distance of zero) is not handed to the engine's merge: there the better source's value replaces the other's, and an empty one would remove what the other report
   // said (QRE-RWS-C-01). Stating nothing, it reads the same present or absent, to the engine, to the calibration and here.
   if(planned.get(o.sessionId)?.sport==='RUN'){const silent=STATES_NOTHING_WHEN_EMPTY.filter(k=>emptyValue(a[k]));if(silent.length)a=without(a,silent);}
   // A figure typed into the measured slot of a planned run is the athlete's own figure, never a measurement: it is kept beside, so no reader of
   // the record takes it for a measured distance (R3A paceUse; SSCTR review of the candidate, A-02). A race keeps its own evidence rules (V1RC).
   const s=planned.get(o.sessionId);
   if(s?.sport==='RUN'&&s.prescription?.family!=='RACE'&&num(a.distanceKm,0)&&!V.runFacts.measuredSources.includes(upper(a.measurement)??(fromDevice(o)?'GPS':null)))a={...without(a,['distanceKm']),manualDistanceKm:a.distanceKm};
   // Nothing else of a report is rewritten: a run sent in several recordings, or corrected with a listed failure reason, keeps its measurement
   // and its quality as they were sent (R3A A1 condition 1), and its reliability is read from the facts of the row (distanceFacts, admitted).
  }
  return a===o.actual?o:{...o,actual:a};};
 const input={...plain};
 if(Array.isArray(plain.observations))input.observations=plain.observations.map(tidy(true));
 if(Array.isArray(plain.actualLedger))input.actualLedger=plain.actualLedger.map(tidy(false));
 const asOf=utcTimestamp(review.asOf),instants=[...list(formats).filter(isObj).map(r=>Date.parse(r.recordedAt)),...list(input.actualLedger).filter(isObj).map(o=>Date.parse(o.provenance?.firstRecordedAt??o.declaredAt))].filter(Number.isFinite);
 const early=!!asOf&&instants.some(t=>t>Date.parse(asOf)),refused=b=>!asOf||['UNSUPPORTED','INVALID_INPUT','HOLD'].includes(b.status);
 const cites=o=>isObj(o)&&isObj(o.actual)&&o.actual.formatHash!==undefined&&o.actual.formatHash!==null,resolves=o=>typeof o.actual.formatHash==='string'&&typeof o.sessionId==='string'&&!!fr.resolve(o.sessionId,o.actual.formatHash);
 const unknownNew=list(input.observations).filter(o=>cites(o)&&!resolves(o)),lost=list(input.actualLedger).filter(o=>cites(o)&&!o.fact&&o.superseded!==true&&!resolves(o));
 // What each run report of this review states that the engine's record may not keep (who it speaks for, a declared stop, what it says of its
 // distance), read before the engine merges or refuses it: every report leaves a fact, whatever it states, and is then a report in force for
 // its session. A report that names another athlete is not this athlete's. A report that cites a format this record does not hold is itself
 // not recorded, and the review is asked again: only a stop it declares is a fact (its distance is of no row).
 const received=list(input.observations).filter(o=>isObj(o)&&planned.get(o.sessionId)?.sport==='RUN'&&(o.athleteId===undefined||o.athleteId===null||o.athleteId===program.athleteId)).map(o=>{const f=reportFactOf(o,V,{fromDevice:fromDevice(o)});return f&&unknownNew.includes(o)?(f.stop?stopOnly(f):null):f;}).filter(Boolean);
 // A symptom stop a report of this request declares is named in every answer, from the request alone when nothing of it is recorded.
 const requested=[...new Set(received.filter(f=>f.stop?.reason==='SYMPTOM').map(f=>f.sessionId))].sort();
 const engineOpts={...opts,[READS_COMPLETION]:readerOf(fr,V)},carriedEvidence=Array.isArray(review.runEvidenceRecord)?clone(review.runEvidenceRecord):[];
 // The record of formats with what the reports of this request state: what every answer reads. It is the record returned whenever the
 // engine accepts the review's instant (it then keeps the rows of those reports, and no row it keeps is left without what its reports said);
 // under an instant the engine refused it is read and not kept.
 const read=asOf?appendReportFacts(formats,received,{athleteId:program.athleteId,recordedAt:asOf},V).record:formats;
 // What an answer is about, with the arguments v1-run-index.mjs gave the calibration of the same result.
 const contextOf=(b,record)=>({program:validProgram(b.proposal)?b.proposal:program,ledger:Array.isArray(b.actualLedger)?b.actualLedger:Array.isArray(input.actualLedger)?input.actualLedger:[],formats:record,historyRecord:history,asOf,weekIndex:review.weekIndex,
  preference:preferenceOf(review.runExpression),engineStatus:b.status,eligibility:review.eligibility??null,hold:['HOLD','CLINICAL_HUMAN_REQUIRED'].includes(b.status),requested,opts,ext,on});
 const held=(b,status,reason,record)=>{const c=contextOf(b,read);return freeze(heldAnswer(b,c,readingOf(c,V),status,reason,record));};
 let base,notes={};
 if(unknownNew.length||lost.length){
  // Clinical screen first: what the review carries is decided without the reports that cannot be read; only a clinical route stands.
  base=evaluate(program,{...input,...(unknownNew.length?{observations:input.observations.filter(o=>!unknownNew.includes(o))}:{})},engineOpts);
  if(base.status!=='CLINICAL_HUMAN_REQUIRED'){
   const ids=x=>x.map(o=>({sessionId:typeof o.sessionId==='string'?o.sessionId:null,eventId:typeof o.eventId==='string'?o.eventId:null}));
   const shell=lost.length?undecided('HOLD','The run reports on this record cite session formats the format record sent with it does not hold: nothing is decided; send the format record as kept',{errors:['runFormatRecord.missingFormat'],unreadable:ids(lost)})
    :undecided('ASK','A run report cites a session format this record does not hold: it was not recorded. Send it with the format the session was prescribed in, or as the time version',{missingInputs:['observations.actual.formatHash'],question:{kind:'UNKNOWN_RUN_FORMAT',observations:ids(unknownNew)}});
   // A report that cannot be read is no execution, but a stop it declares was said: on a review the engine accepted, the stop is kept as a
   // fact of this record, though the report itself is not recorded. Nothing is kept when the records sent do not hold together (the HOLD
   // above), or under an instant the engine did not accept. In every case the screen is named at once, in the answer (SEC-RWS-A-05).
   const kept=lost.length||refused(base)?formats:appendReportFacts(formats,received.filter(f=>f.stop).map(stopOnly),{athleteId:program.athleteId,recordedAt:asOf},V).record;
   return held({...shell,runEvidenceRecord:carriedEvidence},'NOT_APPLICABLE','NO_DECISION',kept);
  }
  notes={notRecorded:unknownNew.map(o=>({sessionId:o.sessionId??null,eventId:o.eventId??null,reason:'UNKNOWN_RUN_FORMAT'}))};
 }else base=evaluate(program,input,engineOpts);
 // A review the engine refuses records nothing, and one earlier than the record delivers no session and adds no format to the record
 // (QRE-RWS-A-05). Their answers are still read from the record: the calibration over the record as admitted, the screen the record asks for,
 // and a symptom stop a report of the request declares. The engine keeps the rows of a review it accepts, an earlier one as well: what the
 // reports of that review state is kept with them, under the instant the engine accepted (the engine's own instant for those rows).
 if(refused(base))return held(base,'NOT_APPLICABLE','NO_DECISION',formats);
 if(early)return held(base,'NOT_APPLICABLE','REVIEW_BEFORE_THE_RECORD',read);
 // The report facts of this review join the record under the instant the engine accepted, before anything is read from it (`read`).
 // SSCTR-RWS-B-02: the engine asks for the current eligibility (the screen, or the check after the race): nothing native is delivered meanwhile.
 const eligibilityAsked=base.status==='ASK'&&list(base.missingInputs).some(k=>typeof k==='string'&&k.startsWith('eligibility.'));
 return freeze(finish(base,{...contextOf(base,read),eligibilityAsked,notes}));
}
/** A new plan from the record: the engine's restart and its calibration, the carried records kept, and the runs the new intake brings added. */
export function restartProgram(input,options={}){
 const opts=internal(options),{ext,on}=authorityOf(opts),formats=isObj(input)&&Array.isArray(input.runFormatRecord)?input.runFormatRecord:[],carried=isObj(input)&&Array.isArray(input.runHistoryRecord)?input.runHistoryRecord:[];
 const taken=isObj(input)?takeIntake(input.intake):{clean:undefined,preference:'NATIVE'},base=restart(isObj(input)?{...without(input,MINE),intake:taken.clean}:input,opts);
 if(!base?.program)return freeze(inert(base,ext,on,on?'NOT_APPLICABLE':'DISABLED',on?'NO_PLAN':'EXTENSION_NOT_ENABLED',formats,carried));
 let history={record:clone(carried),added:[],duplicates:[]},skipped=[];
 if(on)try{const f=factsFromIntake(input.intake,ext.values);skipped=f.skipped;history=appendHistory(carried,f.facts,{athleteId:base.program.athleteId,recordedAt:base.program.canonical?.asOf});}catch{history={record:clone(carried),added:[],duplicates:[]};}
 const ledger=Array.isArray(base.carriedRecord)?base.carriedRecord:Array.isArray(input.record)?input.record:[];
 return freeze(finish(base,{program:base.program,ledger,formats,historyRecord:history.record,asOf:base.program.canonical?.asOf,weekIndex:0,preference:preferenceOf(input.intake?.runExpression??input.runExpression),engineStatus:base.status,eligibility:input.intake?.athlete?.eligibility??null,opts,ext,on,notes:{history:{added:history.added,duplicates:history.duplicates,skipped}}}));
}
/**
 * The engine's historical state of a record kept through this entry point: the same reader, the same formats, so the reconstruction reads every
 * native session as the review that recorded it did. With the boundary off it is the engine's own.
 */
export function historicalStateOf(program,{asOf,actualLedger=[],runFormatRecord=[]}={},options={}){
 const opts=internal(options),{ext,on}=authorityOf(opts);
 if(!on||!validProgram(program))return engineHistoricalState(program,{asOf,actualLedger},opts);
 return engineHistoricalState(program,{asOf,actualLedger},{...opts,[READS_COMPLETION]:readerOf(readFormatRecord(runFormatRecord,program.athleteId),ext.values)});
}
