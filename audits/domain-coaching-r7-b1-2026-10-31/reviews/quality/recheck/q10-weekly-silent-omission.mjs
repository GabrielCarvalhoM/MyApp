// The silent path: a substitution before the taper whose substitute is then not performed; what does the weekly review entering the taper say?
import {program,reviewed,weekly,review,evaluateProgram,opts,live,addDays,K} from '../../../../../CoachingCore/r7/b/fixtures/helpers.mjs';
const EV={id:'q-event',goals:{run:'RACE',strength:'GENERAL'},event:{kind:'10K',date:'2027-01-24'},weeks:16,equipment:['DUMBBELLS','BENCH','KETTLEBELL'],recent:{runDaysPerWeek:4,runMinutesPerWeek:200,longestRunMinutes:70,strengthDaysPerWeek:2},schedule:{runDays:[1,3,5,6],strengthDays:[0,4]},rotation:'FIXED'};
let t0=Date.now();const t=reviewed(EV,0);const ph=t.p.phases.phases,wk=ph.indexOf('TAPER'),spec=wk-1;
for(let w=0;w<spec;w++)weekly(t,w);console.log('ms per weekly',(Date.now()-t0)/spec);
t0=Date.now();
const r=evaluateProgram(t.p,{...review(t.p,spec,{day:0,hour:'06:00:00',kind:'EXERCISE_SUBSTITUTION',substitution:{exerciseId:'db-rdl',reason:'NONCLINICAL_DISCOMFORT_OR_PREFERENCE',nonclinicalConfirmed:true}}),actualLedger:t.ledger},opts);
console.log('ms subst',Date.now()-t0,r.status,r.substitutions?.[0]?.selected,JSON.stringify(r.disclosures?.map(d=>d.id)));
const sel=r.substitutions[0].selected;t.ledger=r.actualLedger??t.ledger;t.p=r.proposal;
for(const w of [spec,wk,wk+1,wk+2])for(const s of t.p.weeks[w].sessions.filter(s=>s.sport==='STRENGTH'))console.log('decision plan',w,ph[w],s.id,s.role,JSON.stringify(s.eventStandIns??null),s.prescription?s.prescription.exercises.map(e=>e.id).join(','):s.explanation);
// skip the strength session that holds the substitute in week spec
const res=weekly(t,spec,{keep:s=>!(s.sport==='STRENGTH'&&s.prescription.exercises.some(e=>e.id===sel))});
console.log('weekly',res.status,res.action,res.reason?.slice(0,300));console.log('disclosures',JSON.stringify(res.disclosures??[]).slice(0,800));
for(const w of [wk,wk+1,wk+2,wk+3])for(const s of t.p.weeks[w].sessions.filter(s=>s.sport==='STRENGTH'))console.log('after weekly',w,ph[w],s.id,s.role,JSON.stringify(s.eventStandIns??null),s.prescription?s.prescription.exercises.map(e=>e.id+(e.instructions?.some(i=>/stands in|No new/.test(i))?'[note]':'')).join(','):s.explanation);
console.log(Object.keys(res));
