// RepMile #59 engine replay (read-only, in-memory store, synthetic athlete). Adapted from the reviewer's replay59*.mjs.
// Journey: device import -> athlete form (as RunReportViewModel.makeObservation builds it) -> history correction exactly as
// HistoryCorrectionViewModel.observation(entry:) + request() build it (C · #59). Usage: node i59-engine-replay.mjs <repo root>
import fs from 'node:fs';
const ROOT=process.argv[2];
const {athlete,ELIG}=await import(ROOT+'/CoachingCore/test/v1int-helpers.mjs');
const {loggedEntries,keepsReport}=await import(ROOT+'/ios/Packages/CoachingPresentation/Facade/app-projections.mjs');
let seq=0;const newId=p=>`${p}_${String(++seq).padStart(6,'0')}`;
const addDay=(d,n=1)=>new Date(Date.parse(d+'T12:00:00Z')+n*86400000).toISOString().slice(0,10);
let failures=0;const check=(label,cond)=>{console.log(`  ${cond?'PASS':'FAIL'} ${label}`);if(!cond)failures++;};
const sorted=v=>Array.isArray(v)?v.map(sorted):v&&typeof v==='object'?Object.fromEntries(Object.keys(v).sort().map(k=>[k,sorted(v[k])])):v;

// ---- The Swift builder, line for line (HistoryCorrectionViewModel). ----
const ENUMS={stop:['SYMPTOM','FATIGUE','PACING','CONDITIONS','TIME','CHOICE','OTHER'],performance:['COMPATIBLE','UNDER','OVER','UNKNOWN'],
 recovery:['COMPATIBLE','ADVERSE','UNKNOWN'],effort:['ON_TARGET','EASIER','HARDER','UNKNOWN'],nextDayFunction:['NORMAL','IMPAIRED','UNKNOWN']};
const athleteVoice=e=>{const m=e.voices.filter(v=>v.channel==='ATHLETE');return m.length===1?m[0]:null;};
/** statement(_:): nil when a stated stop or response is outside the shared enumerations (fail closed). */
function statement(v){const r=v.response??{},out={response:{}};
 if(v.stopReason!=null){if(!ENUMS.stop.includes(v.stopReason))return null;out.stop={reason:v.stopReason};}
 for(const k of ['performance','recovery','effort','nextDayFunction']){if(r[k]!=null&&!ENUMS[k].includes(r[k]))return null;out.response[k]=r[k]??'UNKNOWN';}
 return out;}
const canContestStatic=e=>e.sessionId!=null&&e.measuredKm!=null&&e.contested==null&&e.sport==='RUN'&&!!athleteVoice(e)&&!!statement(athleteVoice(e));
const canContest=(e,sessionDate)=>canContestStatic(e)&&sessionDate===e.date;
function observation(e,km,reason){const mine=athleteVoice(e);if(e.sessionId==null||!mine)return null;const said=statement(mine);if(!said)return null;
 const actual={completed:mine.completed,...(mine.minutes!=null?{minutes:mine.minutes}:{}),...(mine.declaredKm!=null?{distanceKm:mine.declaredKm}:{}),...(mine.rpe!=null?{rpe:mine.rpe}:{}),...(said.stop?{stop:said.stop}:{}),declared:{distanceKm:km,reason}};
 return {sessionId:e.sessionId,occurrenceDate:e.date,actual,response:said.response,correctionOf:mine.eventId};}
const NONE_APPLIES={status:'NONCLINICAL_CONFIRMED',pain:false,persistentPain:false,injury:false,illness:false,functionalLimitation:false,clinicalConcern:false};
const request=(obs,screen,today)=>({kind:'WEEKLY_REVIEW',observations:[obs],eligibility:{...screen,assessedAt:today}});

// ---- 0. The replica produces the Swift golden bytes (HistoryCorrectionViewModelTests.testTheCorrectionNamesTheAthletesReportAndCarriesTheScreen).
console.log('=== 0 replica == Swift golden (fixture P-logged-two-voices, 7,4 km OBSTRUCTED_SKY, plan today 2026-11-18)');
{const golden=fs.readFileSync(ROOT+'/ios/Packages/RepMileUI/Tests/RepMileUIUnitTests/HistoryCorrectionViewModelTests.swift','utf8');
 const g=[...golden.matchAll(/#"(.*?)"#/g)].map(m=>m[1]).join('').match(/\{"eligibility".*?"sessionId":"w0-run-d1"\}\]\}/)[0];
 const fx=JSON.parse(fs.readFileSync(ROOT+'/ios/Packages/CoachingPresentation/Tests/CoachingPresentationTests/Fixtures/P-logged-two-voices.json','utf8'));
 const e=fx.entries.find(x=>x.sessionId==='w0-run-d1');e.sport=e.sport?.raw??e.sport;
 const mine=JSON.stringify(sorted(request(observation(e,7.4,'OBSTRUCTED_SKY'),NONE_APPLIES,'2026-11-18')));
 check('the JS replica encodes exactly the Swift golden request',mine===g);}

// ---- The journey. ----
function journey(name,{form,screenAtForm=true,screen=NONE_APPLIES,edit,legacy}){
 console.log(`=== ${name}`);
 const t=athlete({newId,id:'i59-'+name.split(' ')[0],weeks:12});t.enroll();
 const s=t.sessions(0).find(x=>x.sport==='RUN');const planDate=new Map(t.doc().program.weeks.flatMap(w=>w.sessions).map(x=>[x.id,x.date]));
 t.set(s.date,'08:00');const w=t.watch(s);const imp=t.import([w]);console.log(`  device import: ok=${imp.ok} recorded=${imp.recorded?.length??0}`);
 // RunReportViewModel.makeObservation (planned): sessionId, the session's date, the recording's end instant, the athlete's statements.
 t.set(s.date,'20:00');const end=new Date(t.clock-15*60000).toISOString();
 const f={sessionId:s.id,occurrenceDate:s.date,observedAt:end,actual:{completed:form.completed&&!form.stop,minutes:form.minutes,...(form.distanceKm!=null?{distanceKm:form.distanceKm}:{}),rpe:form.rpe,...(form.stop?{stop:{reason:form.stop}}:{})},
  response:{performance:'UNKNOWN',recovery:'UNKNOWN',effort:form.effort??'UNKNOWN',nextDayFunction:'UNKNOWN'}};
 const r1=t.submit({kind:'WEEKLY_REVIEW',observations:[f],...(screenAtForm?{eligibility:{...NONE_APPLIES,assessedAt:s.date}}:{})});
 console.log(`  athlete form (eligibility ${screenAtForm?'answered':'nil'}): ok=${r1.ok} status=${r1.status} recorded=${r1.recorded?.length??0} missing=${JSON.stringify(r1.decision?.missingInputs??[])} warningSignScreen=${r1.warningSignScreen?.status}`);
 let before=loggedEntries(t.rows()).find(x=>x.sessionId===s.id&&!x.superseded);if(edit)edit(before);const partsBefore=JSON.parse(JSON.stringify(t.live(s.id)[0]?.provenance?.parts??{}));
 const voices=e=>JSON.stringify(e.voices.map(v=>({ch:v.channel,completed:v.completed,minutes:v.minutes,km:v.measuredKm??undefined,declaredKm:v.declaredKm??undefined,stop:v.stopReason??undefined})));
 console.log(`  row before: completed=${before.completed} minutes=${before.minutes} measuredKm=${before.measuredKm} contested=${JSON.stringify(before.contested)} voices=${voices(before)}`);
 const offered=canContest(before,planDate.get(s.id));console.log(`  correction offered: ${offered}`);
 if(!offered)return {t,s,before,offered,partsBefore};
 const obs=observation(before,6,'SIGNAL_LOSS');if(legacy)legacy(obs);
 const today=addDay(s.date);t.set(today,'09:00');
 const req=request(obs,screen,today);if(legacy?.noScreen)delete req.eligibility;
 console.log(`  sent: ${JSON.stringify({...req,observations:req.observations.map(o=>({...o,correctionOf:o.correctionOf?'<ATHLETE voice eventId>':undefined}))})}`);
 const r=t.submit(req);
 const rows=loggedEntries(t.rows()),after=rows.find(x=>x.sessionId===s.id&&!x.superseded);
 console.log(`  answer: ok=${r.ok} ${r.ok?`status=${r.status} recorded=${r.recorded?.length} notRecorded=${JSON.stringify((r.notRecorded??[]).map(x=>x.reason))} warningSignScreen=${r.warningSignScreen?.status}`:`error=${r.error?.code}`}`);
 console.log(`  row after: completed=${after.completed} minutes=${after.minutes} measuredKm=${after.measuredKm} contested=${JSON.stringify(after.contested)} voices=${voices(after)}`);
 const parts=t.live(s.id)[0]?.provenance?.parts??{};
 return {t,s,before,after,r,rows,parts,partsBefore,offered,req};
}
const dev=e=>e.voices.find(v=>v.channel==='DEVICE');
const kept=(x)=>x.r.ok&&(x.r.recorded??[]).some(id=>keepsReport(x.rows,id));

{const x=journey('A completed run, correction',{form:{completed:true,minutes:40,rpe:4,effort:'ON_TARGET'}});
 check('offered (one ATHLETE voice, row on the plan\'s day for its session)',x.offered);
 check('request carries correctionOf = the ATHLETE voice eventId',x.req.observations[0].correctionOf===athleteVoice(x.before).eventId);
 check('request carries no observedAt; the row instant it would have copied is the device part\'s',!('observedAt' in x.req.observations[0])&&x.before.observedAt===x.partsBefore[dev(x.before).eventId]?.observedAt);
 check('answer ok and recorded',x.r.ok&&x.r.recorded?.length===1);
 check('kept by the record (keepsReport)',kept(x));
 check('contested present = declared 6 km SIGNAL_LOSS',x.after.contested?.distanceKm===6&&x.after.contested?.reason==='SIGNAL_LOSS');
 check('DEVICE voice intact (same event, completed, minutes, measured km)',JSON.stringify(dev(x.after))===JSON.stringify(dev(x.before)));
 check('completed and minutes unchanged',x.after.completed===x.before.completed&&x.after.minutes===x.before.minutes);
 check('the ATHLETE voice is the correction',athleteVoice(x.after)?.eventId===x.r.recorded[0]);
 const ap=x.parts[x.r.recorded[0]],dp=x.parts[dev(x.after).eventId];
 check('the athlete part\'s instant is not the device\'s',ap&&dp&&ap.observedAt!==dp.observedAt);
 check('not offered again (contested)',!canContestStatic(x.after));}

{const x=journey('A2 the athlete declared a distance in the report',{form:{completed:true,minutes:40,rpe:4,distanceKm:7.5,effort:'ON_TARGET'}});
 check('offered',x.offered);
 check('the athlete\'s declared distance is re-sent as theirs (distanceKm)',x.req.observations[0].actual.distanceKm===athleteVoice(x.before).declaredKm&&athleteVoice(x.before).declaredKm===7.5);
 check('recorded and kept',kept(x));
 check('the athlete voice still states its own 7.5 km',athleteVoice(x.after)?.declaredKm===7.5);
 check('contested present = 6 km',x.after.contested?.distanceKm===6);
 check('DEVICE voice intact',JSON.stringify(dev(x.after))===JSON.stringify(dev(x.before)));}

{const x=journey('B symptom stop, correction re-sends it',{form:{completed:false,minutes:5,rpe:9,stop:'SYMPTOM',effort:'HARDER'}});
 check('offered',x.offered);
 check('the stop SYMPTOM is re-sent',x.req.observations[0].actual.stop?.reason==='SYMPTOM');
 check('recorded and kept',kept(x));
 check('the answer asks the warning-sign screen again (REQUIRED)',x.r.warningSignScreen?.status==='REQUIRED');
 check('the athlete voice keeps SYMPTOM, not completed, 5 min',athleteVoice(x.after)?.stopReason==='SYMPTOM'&&athleteVoice(x.after)?.completed===false&&athleteVoice(x.after)?.minutes===5);
 check('DEVICE voice intact',JSON.stringify(dev(x.after))===JSON.stringify(dev(x.before)));
 check('contested present',x.after.contested?.distanceKm===6);}

{const x=journey('C a flag answered "sim" with the correction',{form:{completed:true,minutes:40,rpe:4},screen:{...NONE_APPLIES,status:undefined,pain:true}});
 check('routes to a human (CLINICAL_HUMAN_REQUIRED)',x.r.ok&&x.r.status==='CLINICAL_HUMAN_REQUIRED');
 check('nothing kept, the original athlete report stays in force',!kept(x)&&athleteVoice(x.after)?.eventId===athleteVoice(x.before).eventId&&x.after.contested==null);}

{const x=journey('D unmappable stop (UNSTATED) is not offered',{form:{completed:true,minutes:40,rpe:4},edit:e=>{athleteVoice(e).stopReason='UNSTATED';}});
 check('not offered, nothing built',!x.offered&&observation(x.before,6,'SIGNAL_LOSS')===null);}

{const x=journey('E before #59: no correctionOf',{form:{completed:true,minutes:40,rpe:4},legacy:o=>{delete o.correctionOf;}});
 check('refused ALREADY_REPORTED (integration.mjs admit)',!x.r.ok&&x.r.error?.code==='ALREADY_REPORTED');}

{const legacy=o=>{};legacy.noScreen=true;
 const x=journey('F correctionOf but no eligibility',{form:{completed:true,minutes:40,rpe:4},legacy});
 check('ok but ASK eligibility.currentAssessment, nothing recorded',x.r.ok&&x.r.status==='ASK'&&(x.r.recorded??[]).length===0);}

{const x=journey('G the app\'s run report as sent today (eligibility nil)',{form:{completed:true,minutes:40,rpe:4},screenAtForm:false});
 check('separate finding: the athlete form is ASK and not recorded, so no ATHLETE voice exists and the correction is not offered',!x.offered&&x.before.voices.every(v=>v.channel==='DEVICE'));}

console.log(failures?`RESULT: ${failures} FAILED`:'RESULT: ALL PASS');process.exitCode=failures?1:0;
