// SEC-V1RFC-FOCAL-R1 probes: shared scenario (synthetic data only). Imports the candidate read-only from the worktree.
const ROOT='file:///C:/Users/carva/Desktop/myApp/MyApp/.claude/worktrees/v1-run-extensions/CoachingCore/';
export const H=await import(ROOT+'test/v1rfc-helpers.mjs');
export const P=H.P,F=H.F;
export const VAL=await import(ROOT+'src/value.mjs');
export const RF=await import(ROOT+'src/v1-race-forecast.mjs');
export const THRESHOLD='THRESHOLD_CONTROLLED';
export const band=b=>b?[b.fastSecondsPerKm,b.slowSecondsPerKm]:null;
export const QUALITY=(w,s)=>s.role==='QUALITY'?{pace:330,rpe:7,workPace:268,actual:{measurement:'TRACK'}}:{pace:s.role==='LONG'?365:345,rpe:4};
/** The author's threshold scenario, rebuilt here: a threshold session every week on a track at 4:28/km, effort 7. */
export function thresholds({opts=H.DEV_REVISION,through=9,answer=()=>null,how=()=>null}={}){
 const intake=H.runner({id:'rf-thr',asOf:'2027-01-02',start:H.START,weeks:16,runExperience:'EXPERIENCED',goal:'PERFORMANCE',anchors:[H.result('10K',3000,'2027-01-01')],recent:{runDaysPerWeek:4,runMinutesPerWeek:240,longestRunMinutes:90,strengthDaysPerWeek:1},schedule:{runDays:[0,1,3,6],strengthDays:[2],runMinutes:75,longRunMinutes:130,longRunDay:6}});
 const t=H.timeline(intake,{opts}),looks=[];
 for(let w=0;w<=through;w++){
  const look=t.look(w);looks.push(look);const said=answer(w,look);if(said)looks[w]=t.step(w,1,'WEEKLY_REVIEW',{paceRevisionResponse:said},'09:00');
  if(w<through)t.week(w,s=>how(w,s)??QUALITY(w,s));
 }
 return {t,looks};
}
/** A row of the record of answers exactly as the module writes it: the seal is an unkeyed hash anyone can recompute. */
export function forgeRow({athleteId,planId,offerId,response,recordedAt}){
 const body={offerId,planId,response};
 return {fact:P.PACE_REVISION_RESPONSE,eventId:`pace-revision|${planId}|${offerId}|${response}`,athleteId,recordedAt,response:body,inputHash:VAL.hash({athleteId,recordedAt,response:body})};
}
export const rev=r=>({status:r.paceRevision.status,reason:r.paceRevision.reason??null,ended:r.paceRevision.ended?.reason??null,fraction:r.paceRevision.active?.fraction??null,inForceToday:r.paceRevision.active?.inForceToday??null,effective:band(r.paceRevision.effectivePaceBands?.[THRESHOLD]),v1rc:band(r.runCalibration?.paceBands?.[THRESHOLD]),unreadable:r.paceRevision.unreadableResponses?.length??null,records:r.paceRevisionRecord?.length??null,response:r.paceRevision.response??null});
export const qualityOf=(t,w)=>t.p.weeks[w].sessions.find(s=>s.sport==='RUN'&&s.role==='QUALITY');
export const formatBandOf=(r,t,w)=>{const q=qualityOf(t,w),run=r.runSessions?.[q.id];if(!run?.blocks)return null;const x=H.flatSteps(run.blocks).find(s=>s.kind==='WORK');return x?.intensity?.pace?[x.intensity.pace.fastSecondsPerKm,x.intensity.pace.slowSecondsPerKm]:null;};
export const out=(name,v)=>console.log(name+' '+JSON.stringify(v));
