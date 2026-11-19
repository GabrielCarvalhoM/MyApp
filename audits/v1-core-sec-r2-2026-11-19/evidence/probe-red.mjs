// SEC-R2-03 / SEC-R2-04 RED probe (scenarios A, B, self id, replay of a conflicted correction, probe3, a FREEZE-3 orphan carried in).
// Usage: node probe-red.mjs <CoachingCore dir>. Read-only; synthetic athletes only.
import {pathToFileURL} from 'node:url';
import path from 'node:path';
const root=process.argv[2];
const imp=p=>import(pathToFileURL(path.join(root,p)).href);
const {normalizeObservations}=await imp('src/r6-provenance.mjs');
const {restartIntake,readinessFact,readReadiness,READINESS_SIGNS}=await imp('src/v1-f08.mjs');
const {factsFromLedger}=await imp('src/v1-run-history.mjs');const {FORMAT_VALUES_URL}=await imp('src/v1-run-format.mjs');const fs=await import('node:fs');const VALUES=JSON.parse(fs.readFileSync(FORMAT_VALUES_URL,'utf8'));
const ATH='ath-p',DAY='2026-11-10',U={performance:'UNKNOWN',recovery:'UNKNOWN',effort:'UNKNOWN',nextDayFunction:'UNKNOWN'};
const shift=(d,n)=>new Date(Date.parse(d+'T00:00:00Z')+n*864e5).toISOString().slice(0,10);
const opt=(asOf,prior)=>({athleteId:ATH,asOf,maximumAgeDays:36500,...(prior?{prior}:{})});
const rec=n=>[...n.accepted,...n.supersededRows];
const READY=readReadiness({declaredRecovered:true,sports:{RUN:{ready:true}},warningSigns:Object.fromEntries(READINESS_SIGNS.map(k=>[k,false]))},{programmed:['RUN']}).value;
const ready=daysAgo=>readinessFact({athleteId:ATH},{event:{id:'ready-p'},readiness:{}},shift(DAY,-daysAgo)+'T08:00:00.000Z',READY,null);
const restart=record=>{const r=restartIntake({intake:{asOf:DAY,athlete:{id:ATH,recent:{runMinutesPerWeek:600,runDaysPerWeek:7}}},record,asOf:DAY,screen:()=>({status:'NONCLINICAL'}),athleteId:ATH});return {status:r.status,readinessDeclared:r.facts?.pause?.readinessDeclared??null,runDays:r.facts?.pause?.bySportDays?.RUN??null,recent:r.intake?.athlete?.recent??null};};
const base=(id,sid,d,extra={})=>({athleteId:ATH,...(sid?{sessionId:sid}:{}),eventId:id,occurrenceDate:d,reportedAt:d+'T12:00:00Z',context:{sport:'RUN',sessionType:'RUN_EASY'},response:U,actual:{completed:true,minutes:40},source:{provider:'MANUAL'},...extra});
const live=(r,id)=>r.filter(o=>o.eventId===id&&o.superseded!==true);
const runs=r=>factsFromLedger(r,{athleteId:ATH},VALUES).map(f=>f.eventId??f.id??f.localDate);
const out={};
const dx=shift(DAY,-5),dy=shift(DAY,-15),watch={source:{provider:'HEALTHKIT',activityId:'hk-y',quality:'WEARABLE_FULL'},canonicalActivityId:'hk-y'};
// A: eventId reused (another session's id).  B: activity bound to another session.
for(const kind of ['A','B']){
 const Y=kind==='A'?base('Y','sy',dy):base('Yw','sy',dy,watch),X=base('X','sx',dx);
 const l1=rec(normalizeObservations([Y,X],opt(dx+'T13:00:00Z')));
 const c={...X,eventId:kind==='A'?'Y':'X2',correctionOf:'X',correctedAt:dx+'T14:00:00Z',reportedAt:dx+'T14:00:00Z',actual:{completed:true,minutes:45},...(kind==='B'?watch:{})};
 const n=normalizeObservations([c],opt(dx+'T15:00:00Z',l1)),r=rec(n);
 out[kind]={excluded:n.excluded.map(e=>e.reason),xLive:live(r,'X').length,xSuperseded:r.filter(o=>o.eventId==='X'&&o.superseded===true).length,superseded:n.superseded,runsBefore:runs(l1).length,runsAfter:runs(r).length,restartAfterReady:restart([ready(10),...r]).readinessDeclared};
}
// C: a correction that reuses its own original's eventId with different facts.
{const X=base('X','sx',dx),l1=rec(normalizeObservations([X],opt(dx+'T13:00:00Z')));
 const n=normalizeObservations([{...X,correctionOf:'X',correctedAt:dx+'T14:00:00Z',reportedAt:dx+'T14:00:00Z',actual:{completed:true,minutes:20}}],opt(dx+'T15:00:00Z',l1)),r=rec(n);
 out.C_selfId={excluded:n.excluded.map(e=>e.reason),xLive:live(r,'X').length,xSuperseded:r.filter(o=>o.eventId==='X'&&o.superseded===true).length,runsAfter:runs(r).length};}
// D: a correction in conflict with a report in force (P4 shape), replayed once more as received.
{const b={athleteId:ATH,sessionId:'sd',occurrenceDate:dx,context:{sport:'RUN',sessionType:'RUN_EASY'},response:U};
 const A={...b,eventId:'Ad',reportedAt:dx+'T12:00:00Z',actual:{completed:true,minutes:50},source:{provider:'MANUAL'}};
 const W={...b,eventId:'Wd',reportedAt:dx+'T12:05:00Z',actual:{completed:true,minutes:50},source:{provider:'HEALTHKIT',activityId:'hk-d',quality:'WEARABLE_FULL'},canonicalActivityId:'hk-d'};
 const l1=rec(normalizeObservations([A,W],opt(dx+'T13:00:00Z')));
 const C={...A,eventId:'Ad2',correctionOf:'Ad',correctedAt:dx+'T14:00:00Z',reportedAt:dx+'T14:00:00Z',actual:{completed:true,minutes:20}};
 const l2=rec(normalizeObservations([C],opt(dx+'T15:00:00Z',l1)));
 const n3=normalizeObservations([C],opt(dx+'T16:00:00Z',l2)),l3=rec(n3);
 out.D_replayConflicted={l2Live:l2.filter(o=>o.superseded!==true).map(o=>o.eventId+(o.conflicted?'!':'')),l3Live:l3.filter(o=>o.superseded!==true).map(o=>o.eventId+(o.conflicted?'!':'')),duplicates:n3.duplicates.map(d=>d.reason),excluded:n3.excluded.map(e=>e.reason)};}
// E: SEC-R2-04 probe3: two manual rows with no session; Y before the declaration, X after; X's correction reuses Y's id.
{const dY=shift(DAY,-15),dX=shift(DAY,-5),Y=base('Y',null,dY,{observedAt:dY+'T09:00:00Z'}),X=base('X',null,dX,{observedAt:dX+'T09:00:00Z'});
 const l1=rec(normalizeObservations([Y,X],opt(dX+'T13:00:00Z')));
 const n=normalizeObservations([{...X,eventId:'Y',correctionOf:'X',correctedAt:dX+'T14:00:00Z',reportedAt:dX+'T14:00:00Z',actual:{completed:true,minutes:45}}],opt(dX+'T15:00:00Z',l1)),r=rec(n);
 out.E_secR204={excluded:n.excluded.map(e=>e.reason),xLive:live(r,'X').length,restartAfterReady:restart([ready(10),...r])};
 // E2: the same record as FREEZE-3 wrote it (an orphan carried in), restored: the restart must still ask.
 const orphan=[Y,{...X,superseded:true,supersededBy:'Y',supersededAt:dX+'T14:00:00.000Z'}].map(o=>rec(normalizeObservations([o],opt(dX+'T13:00:00Z')))[0]);
 const forged=[orphan[0],{...orphan[1],superseded:true,supersededBy:'Y',supersededAt:dX+'T14:00:00.000Z'}];
 out.E2_orphanCarried={restartAfterReady:restart([ready(10),...forged]),renormalized:restart([ready(10),...rec(normalizeObservations([],opt(DAY+'T09:00:00Z',forged)))])};}
console.log(JSON.stringify(out,null,1));
