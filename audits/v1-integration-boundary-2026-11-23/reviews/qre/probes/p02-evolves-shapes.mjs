// QRE probe P02: legitimate multi-voice flows through the integration boundary and the amended custody (evolves). For each: every step's
// code, the live row(s) of the session, its voices, conflict flag, whether the athlete's own answers (rpe, response) survive, and the chain.
// Run from CoachingCore/: node ../audits/v1-integration-boundary-2026-11-23/reviews/qre/probes/p02-evolves-shapes.mjs
import {athlete,ELIG,at} from '../../../../../CoachingCore/test/v1int-helpers.mjs';

const code=r=>r.ok?(r.duplicate?'DUP':'OK'+(r.status?':'+r.status:'')+(r.recorded?'/rec'+r.recorded.length:'')):r.error.code+(r.error.message&&r.error.code==='OPERATIONAL_ERROR'?'':'')+(r.error.code==='ENGINE_CONTRACT_VIOLATION'?' ('+r.error.message+')':'');
function setup(id){const t=athlete({id});t.enroll();const ss=t.sessions(0);return {t,run:ss.find(s=>s.id==='w0-run-d1'),str:ss.find(s=>s.sport==='STRENGTH')};}
const report=(t,run,label,steps)=>{const out=steps.map(f=>{const r=f();return code(r);});const live=t.live(run.id),all=t.rows().filter(o=>!o.fact&&o.sessionId===run.id);
 const r=live[0];console.log(JSON.stringify({case:label,steps:out,liveRows:live.length,rows:all.length,voices:r?Object.keys(r.provenance?.parts??{}).length:0,conflicted:r?.conflicted??null,
  minutes:r?.actual?.minutes??null,rpe:r?.actual?.rpe??null,recovery:r?.response?.recovery??null,measurement:r?.actual?.measurement??null,chainOk:t.it.verify(t.doc())===null}));};
const RESP={performance:'COMPATIBLE',recovery:'ADVERSE',effort:'HARDER',nextDayFunction:'NORMAL'};

// A: device, athlete (merged), device re-sync with other values (the device's own correction).
{const {t,run}=setup('p02-a');let hk;report(t,run,'A device, athlete, device re-sync',[
 ()=>{t.set(run.date,'08:00');hk=t.import([t.watch(run)],{eligibility:ELIG(run.date)});return hk;},
 ()=>{t.set(run.date,'20:00');return t.weekly(run.date,[{...t.form(run),actual:{completed:true,minutes:40,rpe:7},response:RESP}]);},
 ()=>{t.set(run.date,'21:00');return t.import([t.watch(run,{actual:{distanceKm:7.5}})],{eligibility:ELIG(run.date)});}]);}
// B: athlete, device (merged), device re-sync.
{const {t,run}=setup('p02-b');report(t,run,'B athlete, device, device re-sync',[
 ()=>{t.set(run.date,'08:00');return t.weekly(run.date,[{...t.form(run),actual:{completed:true,minutes:40,rpe:7},response:RESP}]);},
 ()=>{t.set(run.date,'09:00');return t.import([t.watch(run)],{eligibility:ELIG(run.date)});},
 ()=>{t.set(run.date,'21:00');return t.import([t.watch(run,{actual:{distanceKm:7.5}})],{eligibility:ELIG(run.date)});}]);}
// C: athlete, device (merged), athlete corrects own report.
{const {t,run}=setup('p02-c');let mine;report(t,run,'C athlete, device, athlete corrects own',[
 ()=>{t.set(run.date,'08:00');mine=t.weekly(run.date,[{...t.form(run),actual:{completed:true,minutes:40,rpe:7},response:RESP}]);return mine;},
 ()=>{t.set(run.date,'09:00');return t.import([t.watch(run)],{eligibility:ELIG(run.date)});},
 ()=>{t.set(run.date,'21:00');return t.weekly(run.date,[{...t.form(run),correctionOf:mine.recorded[0],actual:{completed:true,minutes:40,rpe:5},response:RESP}]);}]);}
// D: a dispute (device 40, athlete 90: conflicted), then the athlete corrects to agree (40).
{const {t,run}=setup('p02-d');let mine;report(t,run,'D dispute then athlete corrects to agree',[
 ()=>{t.set(run.date,'08:00');return t.import([t.watch(run)],{eligibility:ELIG(run.date)});},
 ()=>{t.set(run.date,'20:00');mine=t.weekly(run.date,[{...t.form(run),actual:{completed:true,minutes:90,rpe:6}}]);return mine;},
 ()=>{t.set(run.date,'21:00');return t.weekly(run.date,[{...t.form(run),correctionOf:mine.recorded[0],actual:{completed:true,minutes:40,rpe:6}}]);}]);}
// E: a dispute, then the device re-syncs to agree with the athlete (90).
{const {t,run}=setup('p02-e');report(t,run,'E dispute then device re-sync agrees',[
 ()=>{t.set(run.date,'08:00');return t.import([t.watch(run)],{eligibility:ELIG(run.date)});},
 ()=>{t.set(run.date,'20:00');return t.weekly(run.date,[{...t.form(run),actual:{completed:true,minutes:90,rpe:6}}]);},
 ()=>{t.set(run.date,'21:00');return t.import([t.watch(run,{actual:{minutes:90}})],{eligibility:ELIG(run.date)});}]);}
// F: two device activities on one session (a run in two recordings), then a re-sync of the second, then the athlete.
{const {t,run}=setup('p02-f');report(t,run,'F device+device, re-sync of second, athlete',[
 ()=>{t.set(run.date,'08:00');return t.import([t.watch(run,{activityId:'HK-1',actual:{minutes:20,distanceKm:3.5}})],{eligibility:ELIG(run.date)});},
 ()=>{t.set(run.date,'08:30');return t.import([t.watch(run,{activityId:'HK-2',endTime:'08:20',actual:{minutes:20,distanceKm:3.5}})],{eligibility:ELIG(run.date)});},
 ()=>{t.set(run.date,'09:00');return t.import([t.watch(run,{activityId:'HK-2',endTime:'08:20',actual:{minutes:21,distanceKm:3.6}})],{eligibility:ELIG(run.date)});},
 ()=>{t.set(run.date,'20:00');return t.weekly(run.date,[{...t.form(run),actual:{completed:true,minutes:41,rpe:5}}]);}]);}
// G: device then athlete in the SAME request is impossible (two channels); athlete then device in two requests, both in one later review day.
// H: athlete "not done" then device workout of the session (the athlete's stop vs a device execution).
{const {t,run}=setup('p02-h');report(t,run,'H athlete not done with symptom stop, then device workout',[
 ()=>{t.set(run.date,'08:00');return t.weekly(run.date,[{...t.form(run),actual:{completed:false,minutes:12,stop:{reason:'SYMPTOM'}},response:{...RESP}}]);},
 ()=>{t.set(run.date,'09:00');return t.import([t.watch(run)],{eligibility:ELIG(run.date)});}]);}
