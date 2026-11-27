// Probe (read-only, in-memory): what the engine needs to keep an athlete correction.
const ROOT=process.argv[2];
const {athlete,ELIG}=await import(ROOT+'/CoachingCore/test/v1int-helpers.mjs');
const {loggedEntries}=await import(ROOT+'/ios/Packages/CoachingPresentation/Facade/app-projections.mjs');
let seq=0;const newId=p=>`${p}_${String(++seq).padStart(6,'0')}`;
const nextDay=d=>new Date(Date.parse(d+'T12:00:00Z')+86400000).toISOString().slice(0,10);
const show=(label,t,sid)=>{const e=loggedEntries(t.rows()).filter(x=>x.sessionId===sid&&!x.superseded);
 for(const x of e)console.log(label,JSON.stringify({completed:x.completed,minutes:x.minutes,measuredKm:x.measuredKm,contested:x.contested,voices:x.voices.map(v=>[v.channel,v.eventId,v.completed,v.minutes,v.stopReason,v.observedAt,v.occurrenceDate])}));return e[0];};
function run(name,{firstElig,corrElig,stop}){
 console.log('=== '+name);
 const t=athlete({newId,id:'p59-'+name,weeks:12});t.enroll();
 const s=t.sessions(0).find(x=>x.sport==='RUN');
 t.set(s.date,'08:00');const w=t.watch(s);console.log('import',JSON.stringify(t.import([w]).ok));
 t.set(s.date,'20:00');const f=t.form(s,{actual:stop?{completed:false,minutes:20,stop:{reason:stop}}:{}});delete f.actual.distanceKm;
 const r1=t.submit({kind:'WEEKLY_REVIEW',...(firstElig?{eligibility:ELIG(s.date)}:{}),observations:[f]});
 console.log('first',r1.ok,r1.error?.code??'',JSON.stringify(r1.recorded),JSON.stringify(r1.notRecorded),JSON.stringify(r1.warningSignScreen),r1.status,JSON.stringify(r1.decision?.missingInputs));
 const before=show('before',t,s.id);if(!before)return;const av=before.voices.find(v=>v.channel==='ATHLETE');if(!av)return;
 t.set(nextDay(s.date),'09:00');
 const obs={sessionId:s.id,occurrenceDate:s.date,actual:{completed:av.completed,...(av.minutes!=null?{minutes:av.minutes}:{}),...(stop?{stop:{reason:stop}}:{}),declared:{distanceKm:6,reason:'SIGNAL_LOSS'}},response:{performance:'UNKNOWN',recovery:'UNKNOWN',effort:'UNKNOWN',nextDayFunction:'UNKNOWN'},correctionOf:av.eventId};
 const r=t.submit({kind:'WEEKLY_REVIEW',...(corrElig?{eligibility:ELIG(nextDay(s.date))}:{}),observations:[obs]});
 console.log('corr',r.ok,r.error?.code??'',JSON.stringify(r.recorded),JSON.stringify(r.notRecorded),JSON.stringify(r.warningSignScreen),r.status,JSON.stringify(r.decision?.missingInputs),r.decision?.reason);
 show('after',t,s.id);
}
run('appFirstNoElig_corrNoElig',{});
run('firstElig_corrNoElig',{firstElig:true});
run('appFirstNoElig_corrElig',{corrElig:true});
run('symptom_corrNoElig',{stop:'SYMPTOM'});
run('symptom_corrElig',{stop:'SYMPTOM',corrElig:true});
