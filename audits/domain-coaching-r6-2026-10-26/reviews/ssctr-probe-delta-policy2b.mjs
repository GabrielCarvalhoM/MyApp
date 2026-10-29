// SSCTR R6 delta probe b: cold-start arrangement with an unavoidable MODERATE cost (disclosure check); short intake pause with Spanish illness text.
import fs from 'node:fs';
import path from 'node:path';
import {generateProgram} from '../../../CoachingCore/src/r6-program.mjs';
import {devAuthority} from '../../../CoachingCore/r6/fixtures/dev-authority.mjs';
import {PROFILES,intake} from '../../../CoachingCore/r6/fixtures/profiles.mjs';
const ALL=devAuthority(),out={};
const kn=[{id:'back-squat',sets:3,reps:5,load:{value:80,unit:'KG',convention:'TOTAL'},rir:2,current:true,familiar:true,tolerated:true,observedAt:'2026-10-27'},{id:'barbell-rdl',sets:3,reps:6,load:{value:85,unit:'KG',convention:'TOTAL'},rir:2,current:true,familiar:true,tolerated:true,observedAt:'2026-10-29'}];
const g=generateProgram(intake('probe-moderate',{weeks:8,athlete:{goals:{run:'PERFORMANCE',strength:'STRENGTH'},runExperience:'INTERMEDIATE',strengthExperience:'INTERMEDIATE',recent:{runDaysPerWeek:3,runMinutesPerWeek:120,longestRunMinutes:50,strengthDaysPerWeek:2},equipment:['BARBELL','RACK','BENCH','DUMBBELLS'],knownExercises:kn},schedule:{runDays:[1,3,6],strengthDays:[1,3],runTurn:'PM',strengthTurn:'AM',longRunDay:6,runMinutes:50,strengthMinutes:50,longRunMinutes:80}}),{authority:ALL});
out.UNAVOIDABLE_MODERATE={status:g.status,question:g.question??null,arrangement:g.trace?.arrangement?Object.fromEntries(Object.entries(g.trace.arrangement).map(([k,v])=>[k,{basis:v.basis,selected:v.selectedId,selectedCosts:v.counterfactuals.find(c=>c.selected)?.costs?.map(x=>x.axis+':'+x.severity+':'+x.cause)}])):null,negotiation:(g.program?.negotiation??[]).map(x=>({id:x.id,detail:x.detail})),disclosures:g.program?.weeks[3]?.sessions.filter(s=>s.explanation||s.interference||s.disclosure).map(s=>({id:s.id,explanation:s.explanation??null,interference:s.interference??s.disclosure??null}))};
const base=PROFILES.C_BALANCED_HYBRID,A=devAuthority(ALL.policy.scientificBoundaryIds.filter(x=>x!=='R6-NONCLINICAL-RETURN'));
out.SHORT_PAUSE_SPANISH_ILLNESS=['Ocupado y enfermo','Not sick - injured on holiday','Fiquei doente'].map(reason=>{const r=generateProgram({...base,athlete:{...base.athlete,pause:{nonclinical:true,weeks:2,reason}}},{authority:A});return {reason,returnAuthority:false,status:r.status,runClass:r.program?.capability.run.class??null};});
fs.writeFileSync(path.join(import.meta.dirname,'ssctr-probe-delta-policy2b.out.json'),JSON.stringify(out,null,2)+'\n');
console.log(JSON.stringify(out,null,1));
