// SEC_INT_R2 probe 7: the cycle-1 device-screen rule, called directly (the cycle's t.import helper answers the screen through the athlete
// channel first, so p3 no longer exercises the device route). Each case on a fresh athlete. Run from CoachingCore/:
//   node ../audits/v1-integration-boundary-2026-11-23/reviews/security/probes/p7-device-screen-r2.mjs
import {athlete,ELIG,addDays} from '../../../../../CoachingCore/test/v1int-helpers.mjs';
const code=r=>r.ok?'OK':r.error.code;
const imp=(t,activities,extra={})=>t.it.importActivities({actor:t.actor,clientRequestId:t.rid('hk'),expectedVersion:t.version(),activities,...extra});
function afterStop(id){const t=athlete({id});t.enroll();const ss=t.sessions(0),run=ss.find(s=>s.id==='w0-run-d1'),run3=ss.find(s=>s.id==='w0-run-d3');
 t.set(run.date,'20:00');const stop=t.weekly(run.date,[{...t.form(run),actual:{...t.form(run).actual,minutes:15,stop:{reason:'SYMPTOM'}}}]);
 t.set(run3.date,'20:00');return {t,run,run3,d:run3.date,w:t.watch(run3),stop};}
const say=(label,r,t,run3)=>console.log(label.padEnd(44),code(r),r.ok?`status=${r.status} recorded=${r.recorded?.length} screen=${r.warningSignScreen?.status??null}`:'',
 t&&run3?'| stored actual keys: '+JSON.stringify(Object.keys(t.live(run3.id)[0]?.actual??{})):'');
{const {t,d,w,stop}=afterStop('p7-1');console.log('stop on record: screen',stop.warningSignScreen?.status);say('1 eligibility beside the workouts',imp(t,[w],{eligibility:ELIG(d)}));}
{const {t,d,w}=afterStop('p7-2');say('2a a review object beside them',imp(t,[w],{review:{eligibility:ELIG(d)}}));say('2b a kind beside them',imp(t,[w],{kind:'READINESS_DECLARATION'}));say('2c eligibility:null',imp(t,[w],{eligibility:null}));}
{const {t,d,w}=afterStop('p7-3');say('3a eligibility inside a workout',imp(t,[{...w,eligibility:ELIG(d)}]));}
{const {t,d,w,run3}=afterStop('p7-4');say('4 eligibility inside actual',imp(t,[{...w,actual:{...w.actual,eligibility:ELIG(d)}}]),t,run3);}
{const {t,w,run3}=afterStop('p7-5');say('5 plain delivery (stored screen = stop day)',imp(t,[w]),t,run3);}
{const {t,run,d,w,run3}=afterStop('p7-6');
 const f=t.submit({kind:'WEEKLY_REVIEW',eligibility:{...ELIG(d),assessedAt:addDays(d,3)+'T10:00:00-03:00'}});
 say('6 athlete screen from the future, then delivery',f);say('  delivery',imp(t,[w]),t,run3);}
