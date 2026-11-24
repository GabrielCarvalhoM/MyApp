// V1 UI functional reconciliation (2026-11-24): captures what the FROZEN boundary really returns for a synthetic athlete, so every screen claim
// in the reconciliation cites a real shape. Reads the frozen engine and its test helpers; writes nothing outside ./out. No training rule here.
// Run: node audits/v1-ui-functional-reconciliation/probes/capture-views.mjs
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {athlete,ELIG,addDays,notFeeling100WithSign,readiness} from '../../../CoachingCore/test/v1int-helpers.mjs';
let idSeq=0;const newId=p=>`${p}_${String(++idSeq).padStart(6,'0')}`; // deterministic ids (as v1int-journeys Journey D): reruns give the same bytes

const OUT=path.join(path.dirname(fileURLToPath(import.meta.url)),'out');fs.mkdirSync(OUT,{recursive:true});
const save=(name,x)=>fs.writeFileSync(path.join(OUT,name+'.json'),JSON.stringify(x,null,1)+'\n');
const code=r=>r?.ok?'OK':r?.error?.code;
const log=[];const step=(name,r)=>{log.push({step:name,result:code(r),state:r?.view?.state??r?.state??null});save(name,r);return r;};

// 1. Onboarding and the first week.
const t=athlete({newId,id:'ui-probe',weeks:12});
const e=step('01-onboard',t.enroll());
step('02-plan-w0',t.api.plan({actor:t.actor}));
step('03-sessions',t.api.sessions({actor:t.actor}));
step('04-presentation-after-onboard',t.it.presentation({actor:t.actor}));
step('05-status',t.api.status({actor:t.actor}));
const w0=t.sessions(0),run1=w0.find(s=>s.sport==='RUN'),str1=w0.find(s=>s.sport==='STRENGTH');
// 2. A run: the device workout in the morning, the athlete's form at night.
t.set(run1.date,'08:00');
step('06-import-device-run',t.import([t.watch(run1)],{eligibility:ELIG(run1.date)}));
t.set(run1.date,'20:00');
step('07-athlete-run-form',t.weekly(run1.date,[t.form(run1)]));
step('08-presentation-after-run',t.it.presentation({actor:t.actor}));
// 3. Strength via the api form.
t.set(str1.date,'19:00');
const f=t.form(str1);
step('09-logStrength',t.api.logStrength({actor:t.actor,clientRequestId:t.rid('str'),expectedVersion:t.version(),eligibility:ELIG(str1.date),sessionId:f.sessionId,occurredOn:f.occurrenceDate,completed:true,minutes:f.actual.minutes,exercises:f.actual.exercises,response:f.response}));
// 4. A missed session (the coach may offer to move it).
const missed=w0.filter(s=>s.date>str1.date).find(s=>s.sport==='RUN');
if(missed){t.set(missed.date,'21:00');step('10-logRun-missed',t.api.logRun({actor:t.actor,clientRequestId:t.rid('miss'),expectedVersion:t.version(),eligibility:ELIG(missed.date),sessionId:missed.id,occurredOn:missed.date,completed:false,response:{performance:'UNKNOWN',recovery:'UNKNOWN',effort:'UNKNOWN',nextDayFunction:'UNKNOWN'}}));}
// 5. The Sunday review of week 0 (every remaining session done as prescribed).
const sun=addDays(t.doc().program.startDate,6);t.set(sun,'20:00');
const remaining=t.sessions(0).filter(s=>t.live(s.id).length===0&&s.id!==missed?.id);
step('11-weekly-review-w0',t.weekly(sun,remaining.map(s=>t.form(s))));
step('12-presentation-after-w0',t.it.presentation({actor:t.actor}));
step('13-plan-w1',t.api.plan({actor:t.actor}));
// 6. Preferences (from next week) and a pending change, if any.
const pref=step('14-setPreferences',t.api.setPreferences({actor:t.actor,clientRequestId:t.rid('pref'),expectedVersion:t.version(),volume:{RUN:'LOWER'}}));
if(pref.ok&&pref.view?.pending){step('15-decline',t.api.decline({actor:t.actor,decisionId:pref.view.pending.decisionId,expectedVersion:t.version()}));}
// 7. "Not 100%" with a warning sign: the hold; then the readiness declaration.
const d1=addDays(sun,2);t.set(d1,'09:00');
const nf=notFeeling100WithSign(d1);
step('16-notFeeling100-sign',t.api.notFeeling100({actor:t.actor,clientRequestId:t.rid('nf'),expectedVersion:t.version(),...nf}));
step('17-plan-blocked',t.api.plan({actor:t.actor}));
const d2=addDays(d1,3);t.set(d2,'09:00');
step('18-declareReadiness',t.api.declareReadiness({actor:t.actor,clientRequestId:t.rid('rd'),expectedVersion:t.version(),...readiness(d2)}));
step('19-plan-after-readiness',t.api.plan({actor:t.actor}));
// 8. History, a decision, and the error envelopes the screens map.
const h=step('20-history',t.api.history({actor:t.actor}));
const dec=h.history?.decisions?.at(-1);if(dec)step('21-decision',t.api.decision({actor:t.actor,decisionId:dec.decisionId}));
step('22-error-stale-version',t.api.setCoach({actor:t.actor,clientRequestId:t.rid('stale'),expectedVersion:0,profile:'BALANCED'}));
step('23-error-not-enrolled',athlete({newId,id:'ui-nobody'}).api.plan({actor:{athleteId:'ui-nobody'}}));
// 9. An unlinked device run (no session) and a run before the record started.
t.set(addDays(d2,1),'07:30');
step('24-import-unlinked',t.import([{activityId:'HK-UNLINKED-1',activityType:'RUN',observedAt:addDays(d2,1)+'T07:20:00-03:00',actual:{completed:true,minutes:31,distanceKm:5.2,measurement:'GPS',gpsQuality:'OK'}}],{eligibility:ELIG(addDays(d2,1))}));
step('25-import-before-start',t.import([{activityId:'HK-OLD-1',activityType:'RUN',observedAt:'2026-01-10T07:20:00-03:00',actual:{completed:true,minutes:40,distanceKm:7}}]));
step('26-history-final',t.api.history({actor:t.actor}));
save('00-log',log);
console.log(log.map(x=>`${x.step}\t${x.result}\t${x.state}`).join('\n'));
