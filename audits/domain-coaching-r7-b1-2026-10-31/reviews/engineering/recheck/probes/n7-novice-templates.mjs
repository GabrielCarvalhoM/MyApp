// Recheck probe N7: the novice (capped) templates a context change rebuilds, read again by the decisions that follow it. Read-only.
// Usage: node n7-novice-templates.mjs [root]   (root: a CoachingCore parent tree; default the repository, i.e. the FREEZE-2 bytes)
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {record,guard,done,REPO} from './lib.mjs';

const root=process.argv[2]??REPO,label=process.argv[3]??'R7B1-2';
const H=await import(pathToFileURL(path.join(root,'CoachingCore/r7/b/fixtures/helpers.mjs')).href);
const P=await import(pathToFileURL(path.join(root,'CoachingCore/src/r6-program.mjs')).href);
const {program,weekly,review,evaluateProgram,opts,live}=H;
const types=(p,w)=>p.weeks[w].sessions.filter(s=>s.sport==='STRENGTH'&&s.prescription).map(s=>s.templateType).sort().join(',');
const ids=(p,w)=>[...new Set(p.weeks[w].sessions.filter(s=>live(s)&&s.sport==='STRENGTH').flatMap(s=>s.prescription.exercises.map(e=>e.id)))];
const apply=(t,r)=>{t.ledger=r.actualLedger??t.ledger;if(r.proposal)t.p=r.proposal;return r;};
const sum=r=>({status:r.status,action:r.action,reason:String(r.reason??'').slice(0,160),errors:(r.errors??[]).slice(0,4)});
const NOV={id:'n7-novice',strengthExperience:'NONE',goals:{run:'REGULAR',strength:'GENERAL'},equipment:['DUMBBELLS','BENCH'],schedule:{strengthDays:[0,2,4,5]},weeks:12};

// N7a: QE-R7B-05 after the next weekly reviews: a strength-NONE athlete moves from two to four days in week 1; weeks 1-3 are executed and reviewed.
guard('N7a-'+label,'novice cap started by a context change, after the following weekly reviews',()=>{
 const t={p:program({...NOV,id:'n7-2d',schedule:{strengthDays:[0,4]}}),ledger:[]};weekly(t,0);
 const sc=apply(t,evaluateProgram(t.p,{...review(t.p,1,{day:0,hour:'06:00:00',kind:'SCHEDULE_CHANGE',changes:{strengthDays:[0,2,4,5]}}),actualLedger:t.ledger},opts));
 const atChange=[2,3,4].map(w=>types(t.p,w));
 const after=[];for(let w=1;w<4;w++){const r=weekly(t,w);after.push({reviewedWeek:w,action:r.action,nextWeek:w+1,templates:types(t.p,w+1),density:t.p.stateTrace[w+1]?.strength?.density??null});}
 record('N7a-'+label,'novice cap started by a context change, after the following weekly reviews',after.every(x=>x.nextWeek>=4||/CORE/.test(x.templates)),
  'weeks 2 and 3 (before the first block boundary at week 4) stay capped after each weekly review, as the state says',
  {scheduleChange:sum(sc),plannedAtTheChange:atChange,storedNoviceTemplates:!!t.p.noviceTemplates,afterWeeklyReviews:after});
});

// N7b: a capped novice (four days from intake) substitutes an exercise of the capped templates; the next weekly reviews compose the capped weeks
// again: the set-aside exercise must not come back.
guard('N7b-'+label,'set-aside configuration in capped weeks after the next weekly reviews',()=>{
 const t={p:program(NOV),ledger:[]};for(let w=0;w<2;w++)weekly(t,w);
 const target=ids(t.p,2).find(id=>!['dead-bug','dead-bug-practice','sit-to-stand','hip-hinge-practice','wall-pushup','prone-row-practice','split-squat-bodyweight','supported-calf-raise'].includes(id))??ids(t.p,2)[0];
 const s=apply(t,evaluateProgram(t.p,{...review(t.p,2,{day:1,hour:'06:00:00',kind:'EXERCISE_SUBSTITUTION',substitution:{exerciseId:target,reason:'NONCLINICAL_DISCOMFORT_OR_PREFERENCE',nonclinicalConfirmed:true}}),actualLedger:t.ledger},opts));
 const inDecision=[2,3,4].map(w=>({week:w,templates:types(t.p,w),hasReplaced:ids(t.p,w).includes(target)}));
 const after=[];for(let w=2;w<4;w++){const r=weekly(t,w);after.push({reviewedWeek:w,action:r.action,status:r.status,nextWeek:w+1,templates:types(t.p,w+1),hasReplaced:ids(t.p,w+1).includes(target)});}
 record('N7b-'+label,'set-aside configuration in capped weeks after the next weekly reviews',s.status==='MODIFY'&&after.every(x=>!x.hasReplaced),
  'the exercise set aside in week 2 never comes back in the capped weeks the following weekly reviews plan',
  {replaced:target,substitution:{...sum(s),selected:s.substitutions?.[0]?.selected??null},inTheDecisionsProposal:inDecision,afterWeeklyReviews:after,storedNoviceTemplatesStillHoldIt:JSON.stringify(t.p.noviceTemplates??[]).includes('"'+target+'"')});
});

// N7c: a capped novice's permanent equipment change (dumbbells and bench -> kettlebell only) in week 1, then the weekly review of week 1.
guard('N7c-'+label,'equipment change while capped, after the next weekly review',()=>{
 const t={p:program(NOV),ledger:[]};weekly(t,0);
 const e=apply(t,evaluateProgram(t.p,{...review(t.p,1,{day:0,hour:'06:00:00',kind:'EQUIPMENT_CHANGE',changes:{equipment:['KETTLEBELL']}}),actualLedger:t.ledger},opts));
 const r=evaluateProgram(t.p,{...review(t.p,1,{observations:t.p.weeks[1].sessions.filter(live).map(s=>H.obs(t.p,s,{kg:()=>12}))}),actualLedger:t.ledger},opts);
 const p2=r.proposal??t.p,dumbbellRows=[2,3].flatMap(w=>p2.weeks[w].sessions.filter(s=>live(s)&&s.sport==='STRENGTH').flatMap(s=>s.prescription.exercises.filter(x=>(x.equipment??[]).some(q=>['DUMBBELLS','BENCH'].includes(q))).map(x=>`w${w}:${x.id}`)));
 record('N7c-'+label,'equipment change while capped, after the next weekly review',['MODIFY','KEEP'].includes(r.status)&&!dumbbellRows.length,
  'after a permanent change to kettlebell only, the capped weeks the next weekly review plans use only the kettlebell (and the review is not refused)',
  {equipmentChange:sum(e),weeklyReviewWeek1:sum(r),week2:types(p2,2),rowsNeedingRemovedEquipment:dumbbellRows.slice(0,6)});
});
done('n7-novice-templates-'+label);
