// QRE V1STR R1, probe B2 (read-only): QRE-STR-A-01 variants. A permanent equipment change to MACHINES, BANDS or DUMBBELLS, then back to the full gym:
// the two plane slots of FULL_B with the rules (DEV) and without (OFF), and the in-force anchors after the regain.
// Run from CoachingCore/: node ../audits/v1-strength-corrections-2026-11-16/candidate/reviews/qre/probes/qre-b2-anchor-variants.mjs
import {lifter,timeline,EQUIPMENT,FULL,DEV,OFF,mainsOf} from '../../../../../../CoachingCore/test/v1str-helpers.mjs';
import {slotsInForce} from '../../../../../../CoachingCore/src/v1-strength.mjs';
for(const mid of [['MACHINES'],['BANDS'],['DUMBBELLS']])for(const [label,opts] of [['DEV',DEV],['OFF',OFF]]){
 const t=timeline(lifter({experience:'INTERMEDIATE',equipment:FULL}),{opts});const m0=mainsOf(t.p);t.weeks(0,1);
 t.step(2,0,'EQUIPMENT_CHANGE',{changes:{equipment:mid}},'06:00');const m1=mainsOf(t.p);t.weeks(2,3);
 t.step(4,0,'EQUIPMENT_CHANGE',{changes:{equipment:FULL}},'06:00');const m2=mainsOf(t.p);
 console.log(mid.join('+'),label,JSON.stringify({built:[m0['FULL_B:1'],m0['FULL_B:2']],mid:[m1['FULL_B:1'],m1['FULL_B:2']],regain:[m2['FULL_B:1'],m2['FULL_B:2']],inForce:slotsInForce(t.p)}));
}
