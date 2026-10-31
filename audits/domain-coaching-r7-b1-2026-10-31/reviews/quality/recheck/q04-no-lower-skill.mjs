// R7B1-QUALITY q04: the NO_LOWER_SKILL_ALTERNATIVE question (R7-B.1, QE-R7B-R2-03). Reaches it through both entry points and follows each option:
//  S1 EQUIPMENT_CHANGE permanent (DUMBBELLS+BANDS athlete; db-row SKILL_MISMATCH -> band-row; then DUMBBELLS only)
//  S2 EQUIPMENT_CHANGE dated window without the bands
//  S3 EXERCISE_SUBSTITUTION with a window already recorded (the SKILL_MISMATCH substitute needs the equipment of the window)
// Per question: truthful text (setAside, substitute, missing equipment, window); options:
//  O1 "Keep the equipment": the athlete does not lose it; nothing recorded; plan unchanged (checked: proposal null, plan keeps the substitute)
//  O2 "Name a <pattern> exercise": (a) the same review resubmitted with the missing input `substitution.to` (the question's missingInputs);
//     (b) an EXERCISE_SUBSTITUTION of the substitute naming each same-pattern configuration, then the original equipment change again.
import fs from 'node:fs';
import {reviewed,weekly,review,evaluateProgram,opts,live,addDays} from '../../../../../CoachingCore/r7/b/fixtures/helpers.mjs';
import {configurationOf} from '../../../../../CoachingCore/src/r7b-repertoire.mjs';
const CAT=JSON.parse(fs.readFileSync(new URL('../../../../../CoachingCore/r7/b0/REPERTOIRE_CATALOG_B0.json',import.meta.url),'utf8')).strength.configurations;
const apply=(t,r)=>{t.ledger=r.actualLedger??t.ledger;if(r.proposal)t.p=r.proposal;return r;};
const ev=(t,w,x)=>evaluateProgram(t.p,{...review(t.p,w,{day:0,hour:'06:00:00',...x}),actualLedger:t.ledger},opts);
const pullIds=(p,w)=>[...new Set(p.weeks.slice(w).flatMap(k=>k.sessions.filter(s=>live(s)&&s.sport==='STRENGTH').flatMap(s=>s.prescription.exercises.filter(e=>e.pattern==='PULL').map(e=>e.id))))];
const base=()=>{const t=reviewed({id:'q04',equipment:['DUMBBELLS','BANDS'],goals:{run:'PERFORMANCE',strength:'GENERAL'},rotation:'FIXED',weeks:12},3);
 const s=apply(t,ev(t,3,{day:1,kind:'EXERCISE_SUBSTITUTION',substitution:{exerciseId:'db-row',reason:'SKILL_MISMATCH'}}));if(s.substitutions?.[0]?.selected!=='band-row')throw new Error('setup '+s.status+' '+s.substitutions?.[0]?.selected);weekly(t,3);return t;};
const out={};
const follow=(name,t,w,question,changes)=>{
 const r=question;const d=r.disclosures?.find(x=>x.id==='NO_LOWER_SKILL_ALTERNATIVE');
 const row={status:r.status,reason:r.reason,missingInputs:r.missingInputs,disclosure:d??null,proposal:!!r.proposal};
 // O1
 row.O1_keepEquipment={planStillHasSubstitute:pullIds(t.p,w+1).includes('band-row'),nothingRecorded:!r.proposal};
 // O2a: same review + substitution.to, for each pull configuration
 const o2a={};for(const c of CAT.filter(c=>c.pattern==='PULL')){const r2=ev(t,w,{kind:changes.kind,changes:changes.changes,substitution:{exerciseId:'band-row',to:c.id,reason:'SKILL_MISMATCH'}});o2a[c.id]=r2.status+(r2.status==='ASK'?':'+(r2.disclosures?.[0]?.id??r2.missingInputs?.join('+')):'');}
 row.O2a_sameReviewWithSubstitutionTo=o2a;
 // O2b: an EXERCISE_SUBSTITUTION naming each pull configuration (both reasons), then the original change again
 const o2b=[];for(const c of CAT.filter(c=>c.pattern==='PULL'&&c.id!=='band-row'))for(const reason of ['SKILL_MISMATCH','NONCLINICAL_DISCOMFORT_OR_PREFERENCE']){
  const c2={p:t.p,ledger:t.ledger};const s=ev(c2,w,{kind:'EXERCISE_SUBSTITUTION',substitution:{exerciseId:'band-row',reason,to:c.id,...(reason==='SKILL_MISMATCH'?{}:{nonclinicalConfirmed:true})}});
  if(s.status!=='MODIFY'){continue;}apply(c2,s);const again=ev(c2,w,{day:1,kind:changes.kind,changes:changes.changes});
  o2b.push({named:c.id,skill:configurationOf(c.id).skill,reason,substitution:s.status,thenChange:again.status,thenAsk:again.status==='ASK'?again.reason.slice(0,140):null,pullAfter:again.proposal?pullIds(again.proposal,w+1):null});}
 row.O2b_nameThenChange=o2b;
 row.O2_effective=o2b.some(x=>x.thenChange==='MODIFY')||Object.values(o2a).some(v=>v.startsWith('MODIFY'));
 out[name]=row;
};
{const t=base(),w=4,ch={kind:'EQUIPMENT_CHANGE',changes:{equipment:['DUMBBELLS']}};follow('S1_permanent',t,w,ev(t,w,ch),ch);}
{const t=base(),w=4,from=t.p.weeks[5].startDate,ch={kind:'EQUIPMENT_CHANGE',changes:{equipment:['DUMBBELLS'],from,to:addDays(from,6)}};follow('S2_window',t,w,ev(t,w,ch),ch);}
{// S3: the window first (before any SKILL_MISMATCH), then the substitution whose substitute needs the bands
 const t=reviewed({id:'q04b',equipment:['DUMBBELLS','BANDS'],goals:{run:'PERFORMANCE',strength:'GENERAL'},rotation:'FIXED',weeks:12},3),from=t.p.weeks[5].startDate;
 const win=apply(t,ev(t,3,{day:1,kind:'EQUIPMENT_CHANGE',changes:{equipment:['DUMBBELLS'],from,to:addDays(from,6)}}));
 const q=ev(t,3,{day:2,kind:'EXERCISE_SUBSTITUTION',substitution:{exerciseId:'db-row',reason:'SKILL_MISMATCH'}});
 const d=q.disclosures?.find(x=>x.id==='NO_LOWER_SKILL_ALTERNATIVE');
 const row={windowRecorded:win.status,status:q.status,reason:q.reason,missingInputs:q.missingInputs,disclosure:d??null};
 // O1 "Keep the equipment": the athlete withdraws the window (a permanent statement of the full equipment), then the same substitution
 const c={p:t.p,ledger:t.ledger};const back=apply(c,ev(c,3,{day:2,kind:'EQUIPMENT_CHANGE',changes:{equipment:['DUMBBELLS','BANDS']}}));
 const after=ev(c,3,{day:3,kind:'EXERCISE_SUBSTITUTION',substitution:{exerciseId:'db-row',reason:'SKILL_MISMATCH'}});row.O1_withdrawWindowThenSubstitute={withdraw:back.status,substitution:after.status,selected:after.substitutions?.[0]?.selected??null};
 // O2 "Name a pull exercise": the same substitution with `to`
 const named={};for(const x of CAT.filter(x=>x.pattern==='PULL'))named[x.id]=ev(t,3,{day:2,kind:'EXERCISE_SUBSTITUTION',substitution:{exerciseId:'db-row',reason:'SKILL_MISMATCH',to:x.id}}).status;
 row.O2_named=named;row.O2_effective=Object.values(named).includes('MODIFY');
 out.S3_substitutionWithWindowAhead=row;}
fs.writeFileSync(new URL('./out/q04-no-lower-skill.json',import.meta.url),JSON.stringify(out,null,1));
console.log(JSON.stringify(out,null,1));
