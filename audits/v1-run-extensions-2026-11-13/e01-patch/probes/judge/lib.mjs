// QRE R5 judge library (independent of the author's tests): a conforming client of the composed entry point, one run reported by several
// speakers in reviews on the Sunday of its week, then the week after as prescribed. Works against any CoachingCore directory given as root.
import {pathToFileURL} from 'node:url';
import path from 'node:path';
import crypto from 'node:crypto';
export async function load(root){
 const imp=f=>import(pathToFileURL(path.join(root,f)).href);
 const H=await imp('test/v1rws-helpers.mjs'),RF=await imp('src/v1-run-format.mjs'),RH=await imp('src/v1-run-history.mjs'),C=await imp('src/v1-run-calibration.mjs'),P=await imp('src/r6-provenance.mjs');
 return {root,H,RF,RH,C,P,F:H.F,V:H.VALUES};
}
export const sha=o=>crypto.createHash('sha256').update(JSON.stringify(o)).digest('hex').slice(0,16);
export const UNKNOWN={performance:'UNKNOWN',recovery:'UNKNOWN',effort:'UNKNOWN',nextDayFunction:'UNKNOWN'};
const TIMES=['16:00','17:00','18:00','19:00','20:00','21:00','22:00','23:00'];
const EXT=['runCalibration','runFormat','runSessions','runFormatRecord','runHistoryRecord','runEvidenceRecord','runEvidence','inputHash','trace'];
export const core=r=>sha(Object.fromEntries(Object.entries(r??{}).filter(([k])=>!EXT.includes(k))));
const band=(cal,k)=>{const b=cal?.paceBands?.[k];return b?(b.status==='AVAILABLE'?[b.fastSecondsPerKm,b.slowSecondsPerKm]:b.status):null;};
/** A scene: `family` EASY (week 3 easy native run, 11 km) or LONG (week 1 long run, 16 km). `opts` the authority (DEV by default). */
export function scene(L,family='EASY',{opts=null}={}){
 const {H}=L,t=H.atSixteen(opts?{opts}:{});
 if(family!=='LONG'){t.week(1,H.weekWith(t,1,null,null));t.week(2,H.weekWith(t,2,null,null));}
 const w=family==='LONG'?1:3,s=family==='LONG'?t.runsOf(1,q=>q.role==='LONG')[0]:t.runsOf(3,q=>q.role==='EASY').find(q=>t.runs[q.id]?.expression==='NATIVE');
 const run=t.runs[s.id],km=run.blocks.flatMap(b=>b.steps).find(q=>q.kind==='STEADY').target.metres/1000,min=Math.round(run.estimate.durationMinutes.low);
 const x={L,t,w,s,run,km,min,family,first:Math.round(km*0.6*100)/100,second:Math.round(km*0.4*100)/100,n:0,answers:[]};
 let rest=t.p.weeks[w].sessions.filter(H.live).filter(q=>q.id!==s.id).map(q=>{const o=q.sport==='RUN'?H.asPrescribed(t,q):{};return o?.eventId?o:H.report(t.p,q,o??{});});
 x.review=(observations,extra={})=>{const r=t.step(w,6,'WEEKLY_REVIEW',{observations:[...rest,...observations],...extra},TIMES[x.n++]);rest=[];x.answers.push(r);return r;};
 x.at=()=>`${t.day(w,6)}T${String(Number(TIMES[x.n].slice(0,2))-1).padStart(2,'0')}:30:00-03:00`;
 x.app=(actual={},eventId='app-x',{cite='TIME',minutes=null,completed=true,response={},source=null}={})=>{const r={...H.nativeReport(t,s,{minutes:minutes??min,rpe:3,actual,completed,response}),eventId};if(cite==='TIME')r.actual.formatHash=run.timeFormatHash;if(source)Object.assign(r,source);return r;};
 x.dev=(actual={},eventId='dev-x',activity='hk-1',{provider='HEALTHKIT',quality='WEARABLE_FULL',response=UNKNOWN}={})=>({eventId,athleteId:t.p.athleteId,sessionId:s.id,occurrenceDate:s.date,...(activity?{canonicalActivityId:activity}:{}),source:{provider,...(activity?{activityId:activity}:{}),...(quality?{quality}:{})},actual:{completed:true,minutes:min,distanceKm:x.first,measurement:'GPS',gpsQuality:'OK',rpe:3,...actual},response});
 x.corr=(o,of,at=x.at())=>({...o,correctionOf:of,correctedAt:at});
 x.list=()=>[{distanceKm:x.second,measurement:'GPS'}];
 x.whole=()=>({distanceKm:km,measurement:'GPS',gpsQuality:'OK'});
 return x;
}
/** What the entry point answers after the run's reviews: the review of the week after, as prescribed. */
export function readOut(x,{next=true}={}){
 const {L,t,s,w}=x,{H,RF,C}=L,last=t.results.at(-1),row=t.row(s.id);
 const bare=C.runCalibrationOf({program:t.p,ledger:t.ledger,evidenceRecord:t.ev,asOf:P2(t.day(w,6)),weekIndex:w,hold:false,engineStatus:last.status,eligibility:H.ELIG(t.day(w,6))},H.DEV);
 const r=next?t.week(w+1,H.weekWith(t,w+1,null,null)):last;
 const exec=r.runSessions?.[s.id]?.execution??last.runSessions?.[s.id]?.execution??null;
 const longAhead=t.runsOf(w+2,q=>q.role==='LONG')[0],ahead=longAhead?r.runSessions?.[longAhead.id]:null;
 let inForce=null;try{const f=RF.readReportFacts(t.fmt,t.p.athleteId,L.V,t.ledger);inForce=f.inForce?[...f.inForce(s.id).ids].sort():'n/a';}catch(e){inForce='n/a';}
 return {row:row?{id:row.eventId,km:row.actual.distanceKm??null,min:row.actual.minutes??null,merged:row.provenance?.mergedSourceIds??null,conflicted:!!row.conflicted,recovery:row.response?.recovery}:null,
  excluded:(last.provenance?.excluded??[]).filter(e=>e.sessionId===s.id).map(e=>e.eventId+':'+e.reason),
  withheld:(r.runFormat?.paceEvidenceWithheld??[]).filter(q=>q.sessionId===s.id).map(q=>q.reason),easy:band(r.runCalibration,'EASY'),long:band(r.runCalibration,'LONG'),bareEasy:band(bare,'EASY'),
  exec:exec?{status:exec.status,completed:exec.completed,basis:exec.basis??null,measuredKm:exec.measuredKm,extentKm:exec.extentKm,paceEvidence:exec.paceEvidence,paceWithheld:exec.paceWithheld,actualMinutes:exec.actualMinutes}:null,
  screen:r.runFormat?.warningSignScreen?.status??null,engine:r.status,core:core(r),inForce,
  ahead:ahead?{expr:ahead.expression,min:longAhead.prescription.durationMinutes,km:ahead.expression==='NATIVE'?ahead.blocks.flatMap(b=>b.steps).find(q=>q.kind==='STEADY')?.target.metres/1000:null,ct3:ahead.dose?.checks?.['CT-3']?.max??null}:null,
  calHash:r.runCalibration?.hash??null};
}
const P2=d=>new Date(Date.parse(`${d}T20:00:00-03:00`)).toISOString();
export const safe=f=>{try{return f();}catch(e){return {THREW:String(e&&e.stack||e).slice(0,500)};}};
