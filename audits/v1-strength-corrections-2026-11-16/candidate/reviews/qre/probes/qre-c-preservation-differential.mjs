// QRE V1STR R1, probe C (independent judge; read-only): the preservation differential. Every plan of a population is built twice through the
// composed entry point, with the rules (DEV, or one boundary) and without (OFF), and compared week by week: runs, the week's shape, which rows
// change (by region, role and pattern), and for a row whose exercise is the same in the same session, every dose field.
// Run from CoachingCore/: node ../audits/v1-strength-corrections-2026-11-16/candidate/reviews/qre/probes/qre-c-preservation-differential.mjs [out.json]
import * as S from '../../../../../../CoachingCore/src/v1-strength-index.mjs';
import {configurationOf} from '../../../../../../CoachingCore/src/r7b-repertoire.mjs';
import {interferenceCosts} from '../../../../../../CoachingCore/src/r6-balanced.mjs';
import {lifter,hybrid,live,hash,EQUIPMENT,DEV,OFF,only} from '../../../../../../CoachingCore/test/v1str-helpers.mjs';
import fs from 'node:fs';

const GOALS=['GENERAL','HYPERTROPHY','STRENGTH','RUNNING_SUPPORT'],EXP=['NONE','NOVICE','INTERMEDIATE','EXPERIENCED'],DAYS=[[1,4],[1,3,5],[0,2,4,6]];
const population=[];
for(const eq of Object.keys(EQUIPMENT))for(const goal of GOALS)for(const experience of EXP)for(const days of DAYS)population.push({name:`${eq} ${goal} ${experience} ${days.length}d`,intake:lifter({goal,experience,equipment:EQUIPMENT[eq],days})});
for(const eq of Object.keys(EQUIPMENT))for(const goal of ['RUNNING_SUPPORT','HYPERTROPHY','GENERAL'])for(const days of [[2,5],[0,2,4]])population.push({name:`hybrid ${eq} ${goal} ${days.length}d`,intake:hybrid({goal,equipment:EQUIPMENT[eq],days})});
const AUTHS={DEV,HOLD:only('HOLD'),UPPER:only('UPPER'),PLANE:only('PLANE')};
const DOSE=['sets','reps','rir','restSeconds','load','role','tempo','durationMinutes','establishment','note'];
const strengthSessions=(p,w)=>p.weeks[w].sessions.filter(s=>live(s)&&s.sport==='STRENGTH');
const res={population:population.length,byAuth:{}};
for(const [an,auth] of Object.entries(AUTHS)){
 const r={plans:0,statusDiffers:0,runWeeksDiffer:0,shapeWeeksDiffer:0,phasesOrBlocksDiffer:0,interferenceWeeksDiffer:0,rowsCompared:0,rowsChanged:0,changedBy:{},changedOutsideScope:[],sameIdDoseDiffers:0,sameIdDoseFields:{},sameIdDoseExamples:[],sessionDurationDiffers:0,durationExamples:[],rowCountDiffers:0,rowCountExamples:[],setsTotalDiffers:0,setsExamples:[]};
 for(const {name,intake} of population){
  const a=S.generateProgram(intake,OFF),b=S.generateProgram(intake,auth);
  if(a.status!==b.status){r.statusDiffers++;continue;}if(!a.program)continue;r.plans++;
  const P=a.program,Q=b.program;
  if(hash([P.phases,P.blocks,P.arrangement])!==hash([Q.phases,Q.blocks,Q.arrangement]))r.phasesOrBlocksDiffer++;
  for(let w=0;w<P.weeks.length;w++){
   const x=P.weeks[w].sessions.filter(live),y=Q.weeks[w].sessions.filter(live);
   if(hash(x.filter(s=>s.sport==='RUN'))!==hash(y.filter(s=>s.sport==='RUN')))r.runWeeksDiffer++;
   if(hash(x.map(s=>[s.id,s.sport,s.day,s.turn,s.role,s.templateType??null]))!==hash(y.map(s=>[s.id,s.sport,s.day,s.turn,s.role,s.templateType??null])))r.shapeWeeksDiffer++;
   if(hash(interferenceCosts(x,{wrap:true}))!==hash(interferenceCosts(y,{wrap:true})))r.interferenceWeeksDiffer++;
   const sx=strengthSessions(P,w),sy=strengthSessions(Q,w);
   for(const s of sx){const t=sy.find(z=>z.id===s.id);if(!t)continue;
    const ex=s.prescription.exercises,ey=t.prescription.exercises;
    if(s.prescription.durationMinutes!==t.prescription.durationMinutes){r.sessionDurationDiffers++;if(r.durationExamples.length<6)r.durationExamples.push({name,w,s:s.id,off:s.prescription.durationMinutes,on:t.prescription.durationMinutes,offIds:ex.map(e=>e.id),onIds:ey.map(e=>e.id)});}
    if(ex.length!==ey.length){r.rowCountDiffers++;if(r.rowCountExamples.length<6)r.rowCountExamples.push({name,w,s:s.id,off:ex.map(e=>e.id+'/'+e.role),on:ey.map(e=>e.id+'/'+e.role)});}
    const sum=l=>l.reduce((n,e)=>n+(e.sets??0),0);if(sum(ex)!==sum(ey)){r.setsTotalDiffers++;if(r.setsExamples.length<6)r.setsExamples.push({name,w,s:s.id,off:ex.map(e=>e.id+'x'+e.sets),on:ey.map(e=>e.id+'x'+e.sets)});}
    // Row matching by position within the session (the order is template order).
    for(let i=0;i<Math.max(ex.length,ey.length);i++){const e=ex[i],f=ey[i];r.rowsCompared++;
     if(!e||!f||e.id!==f.id){r.rowsChanged++;const c=configurationOf((e??f).id),key=`${c?.region??'?'}/${(e??f).role}/${c?.pattern??'?'}`;r.changedBy[key]=(r.changedBy[key]??0)+1;
      const okScope=(an==='HOLD'?c?.pattern==='TRUNK'&&(e??f).role==='ACCESSORY':an==='UPPER'||an==='PLANE'?c?.region==='UPPER':c?.region==='UPPER'||c?.pattern==='TRUNK');
      const okOther=f&&e?(an==='HOLD'?configurationOf(f.id)?.pattern==='TRUNK':an==='DEV'?(configurationOf(f.id)?.region==='UPPER'||configurationOf(f.id)?.pattern==='TRUNK'):configurationOf(f.id)?.region==='UPPER'):false;
      if((!okScope||!okOther)&&r.changedOutsideScope.length<10)r.changedOutsideScope.push({name,w,s:s.id,i,off:e?.id??null,on:f?.id??null});
      continue;}
     // The same exercise in the same position: every dose field.
     const diff=DOSE.filter(k=>hash(e[k]??null)!==hash(f[k]??null));
     const rest=Object.keys({...e,...f}).filter(k=>!DOSE.includes(k)&&hash(e[k]??null)!==hash(f[k]??null));
     if(diff.length||rest.length){r.sameIdDoseDiffers++;for(const k of [...diff,...rest])r.sameIdDoseFields[k]=(r.sameIdDoseFields[k]??0)+1;if(r.sameIdDoseExamples.length<12)r.sameIdDoseExamples.push({name,w,s:s.id,id:e.id,fields:Object.fromEntries([...diff,...rest].map(k=>[k,{off:e[k]??null,on:f[k]??null}]))});}
    }
   }
  }
 }
 res.byAuth[an]=r;console.log(an,JSON.stringify({plans:r.plans,statusDiffers:r.statusDiffers,runWeeksDiffer:r.runWeeksDiffer,shapeWeeksDiffer:r.shapeWeeksDiffer,phases:r.phasesOrBlocksDiffer,interference:r.interferenceWeeksDiffer,rowsCompared:r.rowsCompared,rowsChanged:r.rowsChanged,changedBy:r.changedBy,outside:r.changedOutsideScope.length,sameIdDoseDiffers:r.sameIdDoseDiffers,fields:r.sameIdDoseFields,duration:r.sessionDurationDiffers,rowCount:r.rowCountDiffers,setsTotal:r.setsTotalDiffers}));
}
if(process.argv[2])fs.writeFileSync(process.argv[2],JSON.stringify(res,null,1));
