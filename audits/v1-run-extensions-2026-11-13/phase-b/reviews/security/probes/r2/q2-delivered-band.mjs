// R2 q2: the band an execution is read against now comes from RUN_FORMAT_EMITTED rows of the carried record of formats.
// A client that controls that record adds a fully readable row (every unkeyed seal recomputed) for past threshold sessions, with another band.
import {H,P,F,VAL,thresholds,out} from './base.mjs';
const THR='THRESHOLD_CONTROLLED';
const hashOf=c=>VAL.hash({sessionId:c.sessionId,plannedPrescriptionHash:c.plannedPrescriptionHash,expression:c.expression,pattern:c.pattern,blocks:c.blocks});
const work325=(w,s)=>s.role==='QUALITY'?{pace:330,rpe:7,workPace:325,actual:{measurement:'TRACK'}}:{pace:s.role==='LONG'?365:345,rpe:4};
const x=thresholds({opts:H.DEV,through:9,how:work325}),t=x.t;
const insight=r=>{const d=r.paceInsights?.domains?.[THR];return d?{status:r.paceInsights.status,state:d.state,action:d.action,votes:d.votes,bands:d.sessions.map(s=>[s.band.fastSecondsPerKm,s.band.slowSecondsPerKm]),excluded:d.excluded.map(e=>e.reason)}:{status:r.paceInsights?.status,reason:r.paceInsights?.reason};};
const look=fmt=>P.evaluateProgram(t.p,{...t.review(9,1,'WEEKLY_REVIEW',{},'08:00'),runFormatRecord:fmt},H.DEV);
const ctl=look(t.fmt);
out('q2.control',{...insight(ctl),screen:ctl.runFormat.warningSignScreen?.status,unreadableFormats:ctl.runFormat.unreadableFormats?.length});
/** A readable copy of the latest format row of a session, with the work pace moved by `delta` s/km; `seals`: 'all' or 'inputHashOnly'. */
function forged(s,delta,{seals='all',at=null}={}){
 const rows=t.fmt.filter(r=>r.fact==='RUN_FORMAT_EMITTED'&&r.sessionId===s.id).sort((a,b)=>Date.parse(a.recordedAt)-Date.parse(b.recordedAt)),last=rows.at(-1);if(!last)return null;
 const format=JSON.parse(JSON.stringify(last.format));let moved=0;
 for(const b of format.blocks)for(const st of b.steps)if(st.kind==='WORK'&&st.intensity?.pace){st.intensity.pace.fastSecondsPerKm+=delta;st.intensity.pace.slowSecondsPerKm+=delta;moved++;}
 if(!moved)return null;
 const fh=seals==='all'?hashOf(format):format.formatHash;if(seals==='all')format.formatHash=fh;
 return {fact:'RUN_FORMAT_EMITTED',eventId:`${s.id}|${fh}|P`,athleteId:t.p.athleteId,recordedAt:at??`${s.date}T08:00:00.000Z`,sessionId:s.id,formatHash:fh,settled:false,week:last.week,format,inputHash:VAL.hash(format)};
}
const past=[3,4,5,6,7,8].map(w=>t.p.weeks[w].sessions.find(s=>s.sport==='RUN'&&s.role==='QUALITY'));
for(const [label,delta,opt] of [['slower-band',+40,{}],['faster-band',-40,{}],['inputHash-only',+40,{seals:'inputHashOnly'}]]){
 const extra=past.map(s=>forged(s,delta,opt)).filter(Boolean),r=look([...t.fmt,...extra]);
 out('q2.'+label,{forgedRows:extra.length,...insight(r),screen:r.runFormat.warningSignScreen?.status,unreadableFormats:r.runFormat.unreadableFormats?.length??0,layerBelowSessionsSame:H.hash(r.runSessions)===H.hash(ctl.runSessions),
  citedFormatStillOriginal:past.every(s=>r.runSessions[s.id]?.execution?.formatHash===ctl.runSessions[s.id]?.execution?.formatHash),calibrationSame:H.hash(r.runCalibration)===H.hash(ctl.runCalibration)});
}
// A format row with no pace on its work (delivered by effort), forged for the same sessions: no band, no vote.
{
 const extra=past.map(s=>{const f=forged(s,0);if(!f)return null;for(const b of f.format.blocks)for(const st of b.steps)if(st.intensity)delete st.intensity.pace;const fh=hashOf(f.format);f.format.formatHash=fh;return {...f,formatHash:fh,eventId:`${s.id}|${fh}|P`,inputHash:VAL.hash(f.format)};}).filter(Boolean),r=look([...t.fmt,...extra]);
 out('q2.effort-only',{forgedRows:extra.length,...insight(r)});
}
// Cost of the new reader: 20 000 readable forged format rows for one past session.
{
 const s=past[5],base=forged(s,+1),many=Array.from({length:20000},(_,i)=>({...base,recordedAt:new Date(Date.parse(base.recordedAt)-i*1000).toISOString(),eventId:base.eventId+'#'+i}));
 const a=performance.now(),r=look([...t.fmt,...many]),ms=Math.round(performance.now()-a),b=performance.now();look(t.fmt);const ms0=Math.round(performance.now()-b);
 out('q2.cost',{rows:many.length,ms,controlMs:ms0,unreadableFormats:r.runFormat.unreadableFormats?.length??0,screen:r.runFormat.warningSignScreen?.status});
}
