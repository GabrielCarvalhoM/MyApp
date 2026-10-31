// Q-R7B probe 10: catalog strength witnesses (WP-STR-01, 03, 05, 06, 08, 09, 10) against what the runtime produces for their stated
// context through public entry points (generateProgram; EQUIPMENT_CHANGE review for the travel window). Output: out/p10-witnesses.json
import fs from 'node:fs';
import {program,review,evaluateProgram,opts,addDays,live} from '../../../../../CoachingCore/r7/b/fixtures/helpers.mjs';
const tpl=(p,w=0)=>p.weeks[w].sessions.filter(s=>s.sport==='STRENGTH'&&s.prescription).map(s=>`${s.role}: ${s.prescription.exercises.map(e=>e.id+'/'+e.role).join(', ')}`);
const out={};
// WP-STR-01: class NONE, GENERAL, home dumbbells, 2 days.
{const p=program({id:'w01',goals:{run:'PERFORMANCE',strength:'GENERAL'},strengthExperience:'NONE',recent:{runDaysPerWeek:3,runMinutesPerWeek:150,longestRunMinutes:60,strengthDaysPerWeek:0},equipment:['DUMBBELLS']});out['WP-STR-01']={witness:'Week 1 PRACTICE rows (sit-to-stand, wall-pushup, prone-row-practice) then establishment of goblet-squat, db-floor-press, db-row',week0:tpl(p,0),week1:tpl(p,1)};}
// WP-STR-03: HYPERTROPHY, machines and dumbbells, 4 days.
{const p=program({id:'w03',goals:{run:'PERFORMANCE',strength:'HYPERTROPHY'},equipment:['MACHINES','DUMBBELLS'],schedule:{strengthDays:[0,2,4,5]}});out['WP-STR-03']={witness:'TPL.UPPER with db-lateral-raise and db-biceps-curl filling the accessory alternatives',week1:tpl(p,1)};}
// WP-STR-05: EVERY_2_WEEKS, accessory db-step-up in TPL.LOWER, BUILD phase.
{const p=program({id:'w05',goals:{run:'PERFORMANCE',strength:'GENERAL'},rotation:'EVERY_2_WEEKS',equipment:['DUMBBELLS','BENCH'],schedule:{strengthDays:[0,2,4,5]},weeks:16});const lunge=p.weeks.map(w=>w.sessions.filter(s=>s.role==='STRENGTH_LOWER'&&s.prescription).flatMap(s=>s.prescription.exercises.filter(e=>/lunge|split|step/.test(e.id)).map(e=>e.id)).join(','));out['WP-STR-05']={witness:'TWO_WEEK_ELIGIBLE: db-step-up in TPL.LOWER, reverse-lunge-db as an admissible alternative',lowerLungeSlotByWeek:lunge,phases:p.phases.phases};}
// WP-STR-06: travel with bands only for 10 days, machine pulls in use.
{const p=program({id:'w06',goals:{run:'PERFORMANCE',strength:'GENERAL'},equipment:['MACHINES','BENCH'],schedule:{strengthDays:[0,2,4,5]},weeks:12});const w=3;const from=p.weeks[w+1].startDate,to=addDays(from,9);
 const r=evaluateProgram(p,review(p,w,{day:0,kind:'EQUIPMENT_CHANGE',changes:{equipment:['BANDS'],from,to}}),opts);
 const q=r.proposal??p;out['WP-STR-06']={witness:'band-row and band-pulldown substitute the machine pulls; originals return after the window',status:r.status,action:r.action,before:tpl(p,w+1).filter(x=>/UPPER/.test(x)),during:tpl(q,w+1).filter(x=>/UPPER/.test(x)),after:tpl(q,w+3).filter(x=>/UPPER/.test(x))};}
// WP-STR-08: kettlebell-only.
{for(const exp of ['NOVICE','INTERMEDIATE']){const p=program({id:'w08'+exp,goals:{run:'PERFORMANCE',strength:'GENERAL'},strengthExperience:exp,equipment:['KETTLEBELL']});out['WP-STR-08 '+exp]={witness:'kb-goblet-squat, kb-deadlift, push-up, kb-row',week1:tpl(p,1)};}}
// WP-STR-09: bodyweight-only, upper.
{for(const exp of ['NOVICE','INTERMEDIATE']){const p=program({id:'w09'+exp,goals:{run:'PERFORMANCE',strength:'GENERAL'},strengthExperience:exp,equipment:[],schedule:{strengthDays:[0,2,4,5]}});out['WP-STR-09 '+exp]={witness:'push-up MAIN; PULL slot prone-ytw-raise as ACCESSORY with PULL_LIMITED_FOR_EQUIPMENT',week1:tpl(p,1).filter(x=>/UPPER/.test(x)),disclosure:p.negotiation.map(n=>n.id)};}}
// WP-STR-10: class NONE, 4 days.
{const p=program({id:'w10',goals:{run:'PERFORMANCE',strength:'GENERAL'},strengthExperience:'NONE',recent:{runDaysPerWeek:3,runMinutesPerWeek:150,longestRunMinutes:60,strengthDaysPerWeek:0},schedule:{strengthDays:[0,2,4,5]}});out['WP-STR-10']={witness:'FULL_A, FULL_B and two TPL.CORE sessions with STRENGTH_DAYS_ABOVE_CURRENT_PRACTICE',week0:tpl(p,0),negotiation:p.negotiation.map(n=>n.id)};}
fs.writeFileSync(new URL('./out/p10-witnesses.json',import.meta.url),JSON.stringify(out,null,1));
console.log(JSON.stringify(out,null,1));
