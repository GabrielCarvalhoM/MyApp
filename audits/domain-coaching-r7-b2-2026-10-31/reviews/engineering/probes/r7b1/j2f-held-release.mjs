// R7B1-ENG-r1 judge probe J2f (R2-01: planned release vs executed release). The projection assumes the cap releases at the first block boundary;
// when the boundary week is not executed as planned the weekly review holds the cap, and the next weeks are composed from the stored capped
// templates of the context in force (a schedule-started cap; a substitution while capped; a kettlebell-only change while capped). Read-only.
import {record,guard,done,program,weekly,review,evaluateProgram,opts,live,apply,R,P,imp,LABEL} from './lib.mjs';
const AU=await imp('src/r6-authority.mjs'),auth=AU.r6Authority(opts);
const NOV={strengthExperience:'NONE',goals:{run:'REGULAR',strength:'GENERAL'},equipment:['DUMBBELLS','BENCH'],weeks:12};
const types=(p,w)=>p.weeks[w].sessions.filter(s=>s.sport==='STRENGTH'&&s.prescription).map(s=>s.templateType).sort().join(',');
const ids=(p,w)=>p.weeks[w].sessions.filter(s=>live(s)&&s.sport==='STRENGTH').flatMap(s=>s.prescription.exercises.map(e=>e.id));
const F=[],out={};
for(const [name,o,d] of [
 ['schedule-cap',{...NOV,id:'j2f-a',schedule:{strengthDays:[0,4]}},t=>({w:1,x:{kind:'SCHEDULE_CHANGE',changes:{strengthDays:[0,2,4,5]}}})],
 ['substitution-capped',{...NOV,id:'j2f-b',schedule:{strengthDays:[0,2,4,5]}},t=>({w:2,x:{kind:'EXERCISE_SUBSTITUTION',day:1,substitution:{exerciseId:'goblet-squat',reason:'SKILL_MISMATCH'}}})],
 ['kettlebell-capped',{...NOV,id:'j2f-c',schedule:{strengthDays:[0,2,4,5]}},t=>({w:1,x:{kind:'EQUIPMENT_CHANGE',changes:{equipment:['KETTLEBELL']}}})]])guard('J2f-'+name,'held release',()=>{
 const t={p:program(o),ledger:[]},{w,x}=d(t);for(let k=0;k<w;k++)weekly(t,k);
 const r=apply(t,evaluateProgram(t.p,{...review(t.p,w,{hour:'06:00:00',...x,day:x.day??0}),actualLedger:t.ledger},opts));if(r.status!=='MODIFY'){F.push({name,decision:r.status});return;}
 const sk=P.skeletonOf(t.p,auth),boundary=P.firstStrengthBoundary(sk),gone=new Set((t.p.canonical.athlete.strengthSelections??[]).map(s=>s.from)),have=new Set([...t.p.canonical.athlete.equipment,'BODYWEIGHT']);
 for(let k=w;k<boundary-1;k++)weekly(t,k,{o:()=>({kg:()=>12})});
 // The boundary week: only the first strength session is reported, so the release is not earned.
 let first=true;const rv=weekly(t,boundary-1,{keep:s=>s.sport!=='STRENGTH'||(first?(first=false,true):false),o:()=>({kg:()=>12})});
 const k=boundary,dens=t.p.stateTrace[k]?.strength?.density??null,ty=types(t.p,k),bad=ids(t.p,k).filter(id=>gone.has(id)||!R.configurationOf(id).equipment.every(q=>have.has(q)));
 out[name]={boundary,review:rv.action,density:dens,types:ty,bad};
 if(!dens?.capped||!/CORE/.test(ty)||bad.length)F.push({name,boundary,density:dens,types:ty,bad,note:'held cap not planned from the stored capped templates'});
});
record('J2f','a held release plans capped weeks from the stored context',!F.length,'when the boundary week does not earn the release, the next week is capped and keeps every earlier decision (no set-aside exercise, no removed equipment)',{label:LABEL,failures:F,cases:out});
done('j2f-held-release');
