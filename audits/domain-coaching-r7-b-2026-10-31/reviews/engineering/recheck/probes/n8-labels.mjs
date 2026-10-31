// Recheck probe N8 (root-parameterized, to label findings as introduced or pre-existing): N1 (a correction and a block choice in one mid-week
// review) and N7d (a capped novice's SKILL_MISMATCH substitution, then the next weekly reviews). Read-only.
// Usage: node n8-labels.mjs [root] [label]
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {record,guard,done,REPO} from './lib.mjs';

const root=process.argv[2]??REPO,label=process.argv[3]??'FREEZE-2';
const H=await import(pathToFileURL(path.join(root,'CoachingCore/r7/b/fixtures/helpers.mjs')).href);
const {program,weekly,review,evaluateProgram,opts,live}=H;
const BAD={performance:'UNDER',recovery:'ADVERSE',effort:'HARDER',nextDayFunction:'IMPAIRED'};
const correctionOf=(o,actual,correctedAt,response=null)=>({eventId:o.eventId+'-fix',athleteId:o.athleteId,sessionId:o.sessionId,observedAt:o.observedAt,correctionOf:o.eventId,correctedAt,actual,response:{...o.response,...(response??{})}});
const types=(p,w,after=null)=>p.weeks[w].sessions.filter(s=>s.sport==='STRENGTH'&&s.prescription&&(!after||s.date>after)).map(s=>s.templateType).sort().join(',');
const ids=(p,w)=>[...new Set(p.weeks[w].sessions.filter(s=>live(s)&&s.sport==='STRENGTH').flatMap(s=>s.prescription.exercises.map(e=>e.id)))];
const apply=(t,r)=>{t.ledger=r.actualLedger??t.ledger;if(r.proposal)t.p=r.proposal;return r;};
const sum=r=>({status:r.status,action:r.action,reason:String(r.reason??'').slice(0,140)});
const NOV={id:'n8-novice',strengthExperience:'NONE',goals:{run:'REGULAR',strength:'GENERAL'},equipment:['DUMBBELLS','BENCH'],schedule:{strengthDays:[0,2,4,5]},weeks:12};

guard('N1-'+label,'A5 with a block choice in a mid-week review',()=>{
 const t={p:program(NOV),ledger:[]};for(let w=0;w<5;w++)weekly(t,w);
 const fixes=t.ledger.filter(o=>!o.superseded&&t.p.weeks[4].sessions.some(s=>s.id===o.sessionId&&s.sport==='STRENGTH')).map(o=>correctionOf(o,structuredClone(o.actual),`${t.p.weeks[5].startDate}T05:00:00Z`,BAD));
 const r=apply(t,evaluateProgram(t.p,{...review(t.p,5,{day:0,hour:'06:00:00',observations:fixes,choices:[{type:'LADDER_STEP',from:'goblet-squat',to:'kb-goblet-squat'}]}),actualLedger:t.ledger},opts));
 const day=t.p.weeks[5].startDate;
 record('N1-'+label,'A5 with a block choice in a mid-week review',/CORE/.test(types(t.p,5,day)),
  'the sessions still ahead in week 5 follow the corrected facts (capped), whatever the review also asked',{result:{...sum(r),proposal:!!r.proposal},week5Ahead:types(t.p,5,day)});
});
guard('N7d-'+label,'capped novice: SKILL_MISMATCH substitution, then the next weekly reviews',()=>{
 const t={p:program(NOV),ledger:[]};for(let w=0;w<2;w++)weekly(t,w);
 const s=apply(t,evaluateProgram(t.p,{...review(t.p,2,{day:1,hour:'06:00:00',kind:'EXERCISE_SUBSTITUTION',substitution:{exerciseId:'goblet-squat',reason:'SKILL_MISMATCH'}}),actualLedger:t.ledger},opts));
 const after=[];for(let w=2;w<4;w++){const r=weekly(t,w);after.push({reviewedWeek:w,action:r.action,nextWeek:w+1,squatRows:t.p.weeks[w+1].sessions.filter(x=>live(x)&&x.sport==='STRENGTH').flatMap(x=>x.prescription.exercises.filter(e=>e.pattern==='SQUAT').map(e=>`${x.id}:${e.id}:${e.role}`))});}
 record('N7d-'+label,'capped novice: SKILL_MISMATCH substitution, then the next weekly reviews',s.status==='MODIFY'&&after.every(x=>!x.squatRows.some(r=>r.includes(':goblet-squat:'))),
  'goblet-squat, reported as not doable with steady technique, never comes back in the capped weeks planned after the substitution',
  {substitution:{...sum(s),selected:s.substitutions?.[0]?.selected??null},inTheDecisionsProposalWeek3:ids(s.proposal??t.p,3),afterWeeklyReviews:after});
});
done('n8-labels-'+label);
