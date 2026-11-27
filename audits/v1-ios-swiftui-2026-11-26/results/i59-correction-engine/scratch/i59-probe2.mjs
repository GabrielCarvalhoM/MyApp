const ROOT=process.argv[2];
const {athlete,ELIG,notFeeling100WithSign}=await import(ROOT+'/CoachingCore/test/v1int-helpers.mjs');
const {loggedEntries}=await import(ROOT+'/ios/Packages/CoachingPresentation/Facade/app-projections.mjs');
let seq=0;const newId=p=>`${p}_${String(++seq).padStart(6,'0')}`;
const addDay=(d,n=1)=>new Date(Date.parse(d+'T12:00:00Z')+n*86400000).toISOString().slice(0,10);
const U={performance:'UNKNOWN',recovery:'UNKNOWN',effort:'UNKNOWN',nextDayFunction:'UNKNOWN'};
const show=(label,t,sid)=>{const e=loggedEntries(t.rows()).filter(x=>x.sessionId===sid&&!x.superseded);
 for(const x of e)console.log(label,JSON.stringify({date:x.date,observedAt:x.observedAt,completed:x.completed,minutes:x.minutes,contested:x.contested,voices:x.voices.map(v=>[v.channel,v.eventId,v.completed,v.minutes,v.stopReason])}));
 for(const r of t.live(sid))console.log(label,'parts',JSON.stringify({localDate:r.localDate,occ:r.occurrenceDate,parts:Object.fromEntries(Object.entries(r.provenance?.parts??{}).map(([k,p])=>[k.slice(0,8),{sq:p.sourceQuality,observedAt:p.observedAt,occ:p.occurrenceDate,localDate:p.localDate}]))}));
 return e[0];};
const ans=(l,r)=>console.log(l,r.ok,r.error?.code??'',r.status??'',JSON.stringify(r.recorded),JSON.stringify(r.notRecorded),r.warningSignScreen?.status??null,JSON.stringify(r.decision?.missingInputs??null));
function setup(name,{stop,deviceDay=0}){
 console.log('=== '+name);const t=athlete({newId,id:'q59-'+name,weeks:12});t.enroll();const s=t.sessions(0).find(x=>x.sport==='RUN');
 const dd=addDay(s.date,deviceDay);t.set(dd,'08:00');const w=t.watch(s);w.observedAt=new Date(Date.parse(w.observedAt)+deviceDay*86400000).toISOString();ans('import',t.import([w]));
 t.set(dd,'20:00');
 const f={sessionId:s.id,occurrenceDate:s.date,observedAt:new Date(t.clock-3600e3).toISOString(),actual:{completed:!stop,minutes:stop?20:40,rpe:4,...(stop?{stop:{reason:stop}}:{})},response:{...U,effort:'ON_TARGET'}};
 ans('athlete',t.submit({kind:'WEEKLY_REVIEW',eligibility:ELIG(dd),observations:[f]}));
 return {t,s,dd};}
function corr(t,s,e,{elig,obsAt,stopOverride}={}){const av=e.voices.find(v=>v.channel==='ATHLETE');
 const a={completed:av.completed,...(av.minutes!=null?{minutes:av.minutes}:{}),...(av.rpe!=null?{rpe:av.rpe}:{}),...(stopOverride!==undefined?stopOverride:(av.stopReason?{stop:{reason:av.stopReason}}:{})),declared:{distanceKm:6,reason:'SIGNAL_LOSS'}};
 return {sessionId:s.id,occurrenceDate:e.date,...(obsAt?{observedAt:obsAt}:{}),actual:a,response:U,correctionOf:av.eventId};}
{// 1 omit observedAt + elig
 const {t,s,dd}=setup('omitObservedAt',{});const e=show('before',t,s.id);t.set(addDay(dd),'09:00');
 ans('corr',t.submit({kind:'WEEKLY_REVIEW',eligibility:ELIG(addDay(dd)),observations:[corr(t,s,e)]}));show('after',t,s.id);}
{// 2 symptom; corr re-sends symptom
 const {t,s,dd}=setup('symptom',{stop:'SYMPTOM'});const e=show('before',t,s.id);t.set(addDay(dd),'09:00');
 ans('corr',t.submit({kind:'WEEKLY_REVIEW',eligibility:ELIG(addDay(dd)),observations:[corr(t,s,e)]}));const e2=show('after',t,s.id);
 // athlete answers not-feeling-100 (no sign) then corrects again
 t.set(addDay(dd),'10:00');ans('nf100-withSign',t.submit({kind:'NOT_FEELING_100',...notFeeling100WithSign(addDay(dd))}));
 t.set(addDay(dd),'11:00');ans('corr2',t.submit({kind:'WEEKLY_REVIEW',eligibility:ELIG(addDay(dd)),observations:[corr(t,s,e2)]}));show('after2',t,s.id);}
{// 2b symptom then no-signs wellbeing answered, then correction
 const {t,s,dd}=setup('symptomAnswered',{stop:'SYMPTOM'});const e=show('before',t,s.id);
 const NO={feverOrChills:false,chestPainPressureOrTightness:false,breathlessAtRest:false,palpitationsAtRest:false,faintingOrDizziness:false,painThatChangesMovement:false,swelling:false,injuryFromFallOrImpact:false,gettingWorse:false,bodyWideAches:false,exhaustionAtRest:false,vomitingDiarrhoeaNauseaOrAbdominalPain:false,moderateOrSevereCough:false,severeHeadache:false,severeNoseOrThroat:false};
 t.set(addDay(dd),'08:00');ans('nf100-noSign',t.submit({kind:'NOT_FEELING_100',eligibility:ELIG(addDay(dd)),wellbeing:{condition:'MILD_ILLNESS',warningSigns:NO,intent:'REST',days:2}}));
 t.set(addDay(dd),'09:00');ans('corr',t.submit({kind:'WEEKLY_REVIEW',eligibility:ELIG(addDay(dd)),observations:[corr(t,s,e)]}));show('after',t,s.id);}
{// 3 clinical yes
 const {t,s,dd}=setup('clinicalYes',{});const e=show('before',t,s.id);t.set(addDay(dd),'09:00');
 ans('corr',t.submit({kind:'WEEKLY_REVIEW',eligibility:ELIG(addDay(dd),{pain:true,status:undefined}),observations:[corr(t,s,e)]}));show('after',t,s.id);}
{// 4 device on another day than the session
 const {t,s,dd}=setup('deviceNextDay',{deviceDay:1});show('before',t,s.id);}
{// 5 stale elig (15 days)
 const {t,s,dd}=setup('staleElig',{});const e=show('before',t,s.id);t.set(addDay(dd),'09:00');
 ans('corr',t.submit({kind:'WEEKLY_REVIEW',eligibility:ELIG(addDay(dd,-15)),observations:[corr(t,s,e)]}));}
