// Read-only replay of RepMile #59 correction against the real engine (in-memory store). Writes nothing to the checkout.
const ROOT=process.argv[2];
const {athlete,ELIG}=await import(ROOT+'/CoachingCore/test/v1int-helpers.mjs');
const {loggedEntries}=await import(ROOT+'/ios/Packages/CoachingPresentation/Facade/app-projections.mjs');
let seq=0;const newId=p=>`${p}_${String(++seq).padStart(6,'0')}`;
const nextDay=d=>new Date(Date.parse(d+'T12:00:00Z')+86400000).toISOString().slice(0,10);
// Exactly HistoryCorrectionViewModel.observation(entry:distanceKm:reason:) as JSON.
function correction(e,km){
 const mine=e.voices.filter(v=>v.channel==='ATHLETE');if(mine.length!==1)return null;const v=mine[0];
 const R=x=>x??'UNKNOWN';
 const actual={completed:v.completed};if(v.minutes!=null)actual.minutes=v.minutes;if(v.rpe!=null)actual.rpe=v.rpe;
 if(v.stopReason&&['SYMPTOM','FATIGUE','PACING','CONDITIONS','TIME','CHOICE','OTHER'].includes(v.stopReason))actual.stop={reason:v.stopReason};
 actual.declared={distanceKm:km,reason:'SIGNAL_LOSS'};
 const o={sessionId:e.sessionId,occurrenceDate:e.date,actual,response:{performance:R(v.response?.performance),recovery:R(v.response?.recovery),effort:R(v.response?.effort),nextDayFunction:R(v.response?.nextDayFunction)}};
 if(e.observedAt)o.observedAt=e.observedAt;return o;
}
const show=(label,t,sid)=>{
 const e=loggedEntries(t.rows()).filter(x=>x.sessionId===sid&&!x.superseded);
 for(const x of e)console.log(label,JSON.stringify({observedAt:x.observedAt,date:x.date,completed:x.completed,minutes:x.minutes,measuredKm:x.measuredKm,contested:x.contested,conflicted:x.conflicted,voices:x.voices.map(v=>[v.channel,v.eventId,v.completed,v.minutes,v.rpe,v.stopReason])}));
 const raw=t.live(sid);for(const r of raw)console.log(label,'raw',JSON.stringify({observedAt:r.observedAt,actual:r.actual,partial:r.partial,sq:r.provenance?.sourceQuality,parts:Object.fromEntries(Object.entries(r.provenance?.parts??{}).map(([k,p])=>[k,{sq:p.sourceQuality,observedAt:p.observedAt,minutes:p.actual?.minutes,declared:p.actual?.declared}]))}));
 return e[0];
};
function scenario(name,{athleteFirst,athleteMinutes,deviceMinutes,stop}){
 console.log('=== '+name);
 const t=athlete({newId,id:'r59-'+name,weeks:12});t.enroll();
 const s=t.sessions(0).find(x=>x.sport==='RUN');console.log('planned minutes',s.prescription?.durationMinutes,'date',s.date);
 const dev=()=>{t.set(s.date,'08:00');const w=t.watch(s,{actual:deviceMinutes!=null?{minutes:deviceMinutes}:{}});console.log('import',JSON.stringify(t.import([w],{eligibility:ELIG(s.date)})?.ok));};
 const ath=()=>{t.set(s.date,athleteFirst?'08:30':'20:00');const f=t.form(s,{actual:{...(athleteMinutes!=null?{minutes:athleteMinutes}:{}),...(stop?{completed:false,minutes:20,stop:{}}:{})}});console.log('form',JSON.stringify(f.actual));const r=t.weekly(s.date,[f]);console.log('athlete report ok',r?.ok,r?.error?.code??'');};
 if(athleteFirst){ath();dev();}else{dev();ath();}
 const before=show('before',t,s.id);
 const obs=correction(before,6);console.log('correction',JSON.stringify(obs));
 t.set(nextDay(s.date),'09:00');
 const av=before.voices.find(v=>v.channel==='ATHLETE');obs.correctionOf=av.eventId;const r=t.submit({kind:'WEEKLY_REVIEW',eligibility:ELIG(nextDay(s.date)),observations:[obs]});console.log('correction answer',JSON.stringify(r).slice(0,900));
 show('after',t,s.id);
}
scenario('A-device-first',{athleteFirst:false});
scenario('C-athlete-stop-unstated',{athleteFirst:false,stop:true});
