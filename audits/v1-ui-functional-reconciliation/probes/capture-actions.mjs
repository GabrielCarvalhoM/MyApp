// V1 UI functional reconciliation (2026-11-24): the plan-changing actions and the safety paths the screens offer, through the FROZEN boundary,
// for a synthetic athlete. Reads the frozen engine and its test helpers; writes only ./out/actions-*.json. No training rule here.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {athlete,ELIG,addDays} from '../../../CoachingCore/test/v1int-helpers.mjs';
let idSeq=0;const newId=p=>`${p}_${String(++idSeq).padStart(6,'0')}`; // deterministic ids (as v1int-journeys Journey D): reruns give the same bytes
const OUT=path.join(path.dirname(fileURLToPath(import.meta.url)),'out');fs.mkdirSync(OUT,{recursive:true});
const code=r=>r?.ok?'OK':r?.error?.code;const log=[];
const step=(name,r)=>{log.push([name,code(r),r?.status??'',r?.action??'',r?.view?.state??r?.state??'',r?.view?.pending?JSON.stringify(r.view.pending):'',JSON.stringify(r?.warningSignScreen??null)].join('\t'));fs.writeFileSync(path.join(OUT,'actions-'+name+'.json'),JSON.stringify(r,null,1)+'\n');return r;};
const NO={feverOrChills:false,chestPainPressureOrTightness:false,breathlessAtRest:false,palpitationsAtRest:false,faintingOrDizziness:false,painThatChangesMovement:false,swelling:false,injuryFromFallOrImpact:false,gettingWorse:false,bodyWideAches:false,exhaustionAtRest:false,vomitingDiarrhoeaNauseaOrAbdominalPain:false,moderateOrSevereCough:false,severeHeadache:false,severeNoseOrThroat:false};
const mk=id=>{const t=athlete({newId,id,weeks:12});t.enroll();return t;};
// A. Substitution of a strength exercise (EXERCISE_SUBSTITUTION through submit: no api.mjs form exists).
{const t=mk('ui-sub');const s=t.sessions(0).find(x=>x.sport==='STRENGTH'),ex=s.prescription.exercises[0];t.set(addDays(s.date,-1),'10:00');
 const r=step('A1-substitution-preference',t.submit({kind:'EXERCISE_SUBSTITUTION',eligibility:ELIG(addDays(s.date,-1)),substitution:{exerciseId:ex.id,reason:'PREFERENCE'}}));
 const r2=step('A2-substitution-valid-reason',t.submit({kind:'EXERCISE_SUBSTITUTION',eligibility:ELIG(addDays(s.date,-1)),substitution:{exerciseId:ex.id,reason:'NONCLINICAL_DISCOMFORT_OR_PREFERENCE',nonclinicalConfirmed:true}}));
 step('A2b-plan-after-substitution',t.api.plan({actor:t.actor}));
 const pend=t.api.plan({actor:t.actor}).view?.pending;if(pend)step('A2c-accept-substitution',t.api.accept({actor:t.actor,decisionId:pend.decisionId,expectedVersion:t.version()}));
 step('A3-substitution-pain',t.submit({kind:'EXERCISE_SUBSTITUTION',eligibility:ELIG(addDays(s.date,-1)),substitution:{exerciseId:ex.id,reason:'NONCLINICAL_DISCOMFORT_OR_PREFERENCE',pain:true}}));}
// B. A day unavailable, and a schedule change: changes that wait for the athlete's confirmation.
{const t=mk('ui-avail');const s=t.sessions(0).find(x=>x.sport==='RUN'&&x.role!=='EASY')??t.sessions(0)[2];t.set(addDays(t.doc().program.startDate,0),'08:00');
 const r=step('B1-unavailable-day',t.api.updateAvailability({actor:t.actor,clientRequestId:t.rid('ua'),expectedVersion:t.version(),eligibility:ELIG(addDays(t.doc().program.startDate,0)),unavailableDates:[s.date]}));
 if(r.ok&&r.view?.pending)step('B2-accept-unavailable',t.api.accept({actor:t.actor,decisionId:r.view.pending.decisionId,expectedVersion:t.version()}));
 step('B3-preferences-with-screen',t.api.setPreferences({actor:t.actor,clientRequestId:t.rid('pf'),expectedVersion:t.version(),eligibility:ELIG(addDays(t.doc().program.startDate,0)),difficulty:{RUN:'LOWER'}}));}
// C. A run stopped for a symptom (submit: logRun cannot carry a stop), a partial run, a run with distance only by GPS from the device.
{const t=mk('ui-stop');const s=t.sessions(0).find(x=>x.sport==='RUN');t.set(s.date,'19:00');
 const f=t.form(s);step('C1-run-stop-symptom',t.weekly(s.date,[{...f,actual:{...f.actual,completed:false,minutes:12,stop:{reason:'SYMPTOM'}}}]));
 step('C2-plan-after-symptom-stop',t.api.plan({actor:t.actor}));}
{const t=mk('ui-partial');const s=t.sessions(0).find(x=>x.sport==='RUN');t.set(s.date,'19:00');
 const f=t.form(s);step('C3-run-partial-time',t.weekly(s.date,[{...f,actual:{completed:true,minutes:Math.round((f.actual.minutes??40)/2),rpe:4}}]));
 step('C4-presentation-after-partial',t.it.presentation({actor:t.actor}));}
// D. "Not 100%" without a warning sign (V1 offers no temporary reduction), then its check.
{const t=mk('ui-nf');const d=addDays(t.doc().program.startDate,1);t.set(d,'08:00');
 step('D1-notFeeling100-no-sign',t.api.notFeeling100({actor:t.actor,clientRequestId:t.rid('nf'),expectedVersion:t.version(),eligibility:ELIG(d),wellbeing:{condition:'UNUSUAL_FATIGUE',warningSigns:{...NO},intent:'REDUCE_LIGHT',days:2}}));
 step('D2-plan-after-nf',t.api.plan({actor:t.actor}));
 step('D3-notFeeling100-no-screen',t.api.notFeeling100({actor:t.actor,clientRequestId:t.rid('nf2'),expectedVersion:t.version(),eligibility:ELIG(d),wellbeing:{condition:'UNUSUAL_FATIGUE',intent:'REDUCE_LIGHT',days:2}}));}
// E. A break the athlete reports (nonclinical), and the clinical one.
{const t=mk('ui-break');const d=addDays(t.doc().program.startDate,2);t.set(d,'08:00');
 step('E1-break-nonclinical',t.api.reportBreak({actor:t.actor,clientRequestId:t.rid('br'),expectedVersion:t.version(),eligibility:ELIG(d),interruption:{reasonCategory:'TRAVEL',nonclinical:true,startDate:d,endDate:addDays(d,6)}}));
 step('E2-break-clinical',t.api.reportBreak({actor:t.actor,clientRequestId:t.rid('br2'),expectedVersion:t.version(),eligibility:ELIG(d),interruption:{reasonCategory:'ILLNESS',nonclinical:false,startDate:d,endDate:addDays(d,6)}}));}
// F. Erasing a health fact, then the plan (SEC-FPV-01 path: the app shows nothing startable until a new screen).
{const t=mk('ui-erase');const d=addDays(t.doc().program.startDate,1);t.set(d,'08:00');
 const nf=step('F1-notFeeling100-sign',t.api.notFeeling100({actor:t.actor,clientRequestId:t.rid('nf'),expectedVersion:t.version(),eligibility:ELIG(d),wellbeing:{condition:'MILD_ILLNESS',warningSigns:{...NO,feverOrChills:true},intent:'REST',days:3}}));
 const ids=t.api.history({actor:t.actor}).history.facts.map(f=>f.eventId);
 step('F2-eraseHealthFacts',t.api.eraseHealthFacts({actor:t.actor,eventIds:ids,expectedVersion:t.version()}));
 step('F3-plan-after-erase',t.api.plan({actor:t.actor}));
 step('F4-eraseAccount',t.api.eraseAccount({actor:t.actor}));
 step('F5-plan-after-account-erase',t.api.plan({actor:t.actor}));}
fs.writeFileSync(path.join(OUT,'actions-00-log.tsv'),'step\tresult\tstatus\taction\tstate\tpending\twarningSignScreen\n'+log.join('\n')+'\n');
console.log(log.join('\n'));
