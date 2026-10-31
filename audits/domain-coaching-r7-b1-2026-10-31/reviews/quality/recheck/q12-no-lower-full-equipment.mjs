// R7B1-QUALITY q12: the NO_LOWER_SKILL_ALTERNATIVE dead end with full equipment (from q05). Athlete: FULL equipment, RUNNING_SUPPORT, 3 strength days,
// INTERMEDIATE, FIXED, reviewed through week 3. db-row (ACCESSORY) is set aside for SKILL_MISMATCH -> band-face-pull; week 3 reviewed. Week 4: the
// bands are lost (permanent EQUIPMENT_CHANGE to FULL minus BANDS). Control: the same change without the SKILL_MISMATCH. Then every way to "name a pull
// exercise": an EXERCISE_SUBSTITUTION of band-face-pull, and of band-row (the MAIN row that needs the bands), naming each pull that fits, both
// reasons; then the same equipment change. Reports the question text after each attempt (truthfulness of the equipment it names).
import fs from 'node:fs';
import {reviewed,weekly,review,evaluateProgram,opts,live} from '../../../../../CoachingCore/r7/b/fixtures/helpers.mjs';
const FULL=['BARBELL','RACK','BENCH','DUMBBELLS','KETTLEBELL','MACHINES','BANDS','PULL_UP_BAR'],NOB=FULL.filter(x=>x!=='BANDS');
const apply=(t,r)=>{t.ledger=r.actualLedger??t.ledger;if(r.proposal)t.p=r.proposal;return r;};
const ev=(t,w,x)=>evaluateProgram(t.p,{...review(t.p,w,{day:0,hour:'06:00:00',...x}),actualLedger:t.ledger},opts);
const O={id:'q12',equipment:FULL,goals:{run:'PERFORMANCE',strength:'RUNNING_SUPPORT'},strengthExperience:'INTERMEDIATE',rotation:'FIXED',weeks:12,schedule:{strengthDays:[0,2,4]}};
const ids=(p,w)=>p.weeks[w].sessions.filter(s=>live(s)&&s.sport==='STRENGTH').map(s=>s.id+': '+s.prescription.exercises.map(e=>e.id+':'+e.role).join(','));
const out={};
const u=reviewed(O,4),cu=ev(u,4,{kind:'EQUIPMENT_CHANGE',changes:{equipment:NOB}});
out.control={status:cu.status,swaps:(cu.substitutions??[]).map(s=>s.exerciseId+'->'+s.selected)};
const t=reviewed(O,3);out.week4Before=ids(t.p,4);
const s=apply(t,ev(t,3,{day:1,kind:'EXERCISE_SUBSTITUTION',substitution:{exerciseId:'db-row',reason:'SKILL_MISMATCH'}}));weekly(t,3);
out.mismatch={status:s.status,selected:s.substitutions?.[0]?.selected,week4After:ids(t.p,4)};
const q=ev(t,4,{kind:'EQUIPMENT_CHANGE',changes:{equipment:NOB}});out.question={status:q.status,reason:q.reason,missingInputs:q.missingInputs,disclosure:q.disclosures?.find(d=>d.id==='NO_LOWER_SKILL_ALTERNATIVE')??null};
out.attempts=[];
for(const target of ['band-face-pull','band-row'])for(const reason of ['SKILL_MISMATCH','NONCLINICAL_DISCOMFORT_OR_PREFERENCE'])for(const to of ['seated-cable-row','lat-pulldown','kb-row','one-arm-db-row','cable-face-pull','prone-ytw-raise','inverted-row']){
 const c={p:t.p,ledger:t.ledger};const n=ev(c,4,{kind:'EXERCISE_SUBSTITUTION',substitution:{exerciseId:target,reason,to,...(reason==='SKILL_MISMATCH'?{}:{nonclinicalConfirmed:true})}});
 const row={target,reason,named:to,substitution:n.status};
 if(n.status==='MODIFY'){apply(c,n);const a=ev(c,4,{day:1,kind:'EQUIPMENT_CHANGE',changes:{equipment:NOB}});row.thenChange=a.status;row.thenQuestion=a.status==='ASK'?a.reason:null;}
 out.attempts.push(row);
}
out.summary={attempts:out.attempts.length,substitutionsApplied:out.attempts.filter(a=>a.substitution==='MODIFY').length,changeRecordedAfter:out.attempts.filter(a=>a.thenChange&&a.thenChange!=='ASK').length,
 falseEquipmentClaims:out.attempts.filter(a=>/needs dumbbells and bench that is not available/.test(a.thenQuestion??'')).map(a=>a.target+'->'+a.named)};
fs.writeFileSync(new URL('./out/q12-no-lower-full-equipment.json',import.meta.url),JSON.stringify(out,null,1));
console.log(JSON.stringify({control:out.control,mismatch:out.mismatch.selected,question:out.question.reason,summary:out.summary},null,1));
