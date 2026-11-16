// QRE V1STR R1, probe F (independent judge; read-only): (1) a trunk set-aside under N1 in a bodyweight plan with CORE templates: is every trunk
// slot filled, or the gap declared (SQ-1 c3, V-EXT-06)? (2) the plan's binding is integrity-protected (a tampered or removed binding).
// Run from CoachingCore/: node ../audits/v1-strength-corrections-2026-11-16/candidate/reviews/qre/probes/qre-f-trunk-gap-and-binding.mjs
import * as S from '../../../../../../CoachingCore/src/v1-strength-index.mjs';
import {lifter,timeline,EQUIPMENT,DEV,OFF,only,rowsOf} from '../../../../../../CoachingCore/test/v1str-helpers.mjs';
for(const [label,opts] of [['DEV',DEV],['OFF',OFF]])for(const reason of ['SKILL_MISMATCH','NONCLINICAL_DISCOMFORT_OR_PREFERENCE']){
 const t=timeline(lifter({experience:'INTERMEDIATE',equipment:EQUIPMENT.BW,days:[0,1,2,4,6]}),{opts});t.weeks(0,1);
 const s=t.step(2,0,'EXERCISE_SUBSTITUTION',{substitution:{exerciseId:'dead-bug',reason,nonclinicalConfirmed:true}},'06:00');t.weeks(2,3);
 const trunk=w=>rowsOf(t.p,w).filter(x=>x.e.pattern==='TRUNK').map(x=>x.e.id);
 console.log(label,reason,JSON.stringify({status:s.status,selected:s.substitutions?.map(x=>x.selected),templateMissing:t.p.templates.filter(x=>x.missingPatterns.length).map(x=>x.type+':'+x.missingPatterns.join('/')),trunkRowsWeek4:trunk(4),planNegotiationUnavailable:(t.p.negotiation??[]).filter(n=>n.id==='MOVEMENT_PATTERN_UNAVAILABLE').map(n=>n.patterns),answerDisclosures:(s.disclosures??[]).map(d=>d.id)}));
}
{
 const t=timeline(lifter({experience:'INTERMEDIATE',equipment:EQUIPMENT.BW,days:[1,3,5]}),{opts:only('HOLD')});t.week(0);
 const rv=t.review(1,6,'WEEKLY_REVIEW');
 const q=JSON.parse(JSON.stringify(t.p));q.repertoire.strengthExtension.boundaries=['V1X-STRENGTH-HOLD-DOSE','V1X-STRENGTH-PLANE','V1X-STRENGTH-UPPER-LOADING'];
 const r=JSON.parse(JSON.stringify(t.p));delete r.repertoire.strengthExtension;
 console.log('binding',JSON.stringify({builtUnderHOLDreviewedUnderHOLD:S.evaluateProgram(t.p,rv,only('HOLD')).status,builtUnderHOLDreviewedUnderDEV:S.evaluateProgram(t.p,rv,DEV).status,tamperedBindingUnderDEV:S.evaluateProgram(q,rv,DEV).status,bindingRemovedUnderOFF:S.evaluateProgram(r,rv,OFF).status}));
}
