// QRE V1STR recheck R2, probe A (independent judge; read-only): the Symbol carrier, the clinical pass-through for a plan built under other
// rules, the trunk-gap disclosure, the known limitations, and the exposure's new strictness.
// Run from CoachingCore/: node ../audits/v1-strength-corrections-2026-11-16/candidate/reviews/qre/probes/r2-a-carrier-clinical-gaps.mjs [out.json]
import fs from 'node:fs';
import * as S from '../../../../../../CoachingCore/src/v1-strength-index.mjs';
import * as F from '../../../../../../CoachingCore/src/v1-run-forecast-index.mjs';
import * as V1 from '../../../../../../CoachingCore/src/v1-index.mjs';
import {STRENGTH_RULES,repertoireAuthority} from '../../../../../../CoachingCore/src/r7b-repertoire.mjs';
import {r6Authority} from '../../../../../../CoachingCore/src/r6-authority.mjs';
import {strengthRules,devStrength,weeklyStrengthExposure} from '../../../../../../CoachingCore/src/v1-strength.mjs';
import {lifter,hybrid,timeline,report,live,hash,EQUIPMENT,FULL,DEV,OFF,only,familiar,idsOf,rowsOf,mainsOf,addDays,ELIG} from '../../../../../../CoachingCore/test/v1str-helpers.mjs';
const out={};let fails=0;const note=(k,v)=>{out[k]=v;console.log(k,JSON.stringify(v).slice(0,1200));};
const check=(k,ok,d='')=>{out.checks??=[];out.checks.push({k,ok:!!ok,d});if(!ok){fails++;console.log('FAIL',k,d);}};
const HOLDS=['front-plank','side-plank'],hasHold=r=>!!r.program&&idsOf(r.program).some(id=>HOLDS.includes(id));
const without=(o,keys)=>Object.fromEntries(Object.entries(o).filter(([k])=>!keys.includes(k)));
const MINE=['strengthExtension','strengthExposure'];

// 1. The carrier. A caller's own rules, in every form, through the new entry point (must be taken off) and the frozen ones (a JSON field inert).
{const intake=lifter({experience:'INTERMEDIATE',equipment:EQUIPMENT.BW,days:[1,3,5]}),rules=strengthRules(devStrength()),rep=repertoireAuthority({asOf:intake.asOf});
 check('control: the plank is there without rules',hasHold(S.generateProgram(intake)));check('control: DEV takes it off',!hasHold(S.generateProgram(intake,DEV)));
 const sym=o=>({...o,[STRENGTH_RULES]:rules}),hidden=o=>{const x={...o};Object.defineProperty(x,STRENGTH_RULES,{value:rules,enumerable:false});return x;},inherited=o=>Object.assign(Object.create({[STRENGTH_RULES]:rules}),o);
 const forms={optionKey:{[STRENGTH_RULES]:rules},repertoireSymbol:{repertoire:sym(rep)},repertoireHidden:{repertoire:hidden(rep)},repertoireInherited:{repertoire:inherited(rep)},repertoireStrengthField:{repertoire:{...rep,strength:rules}},
  authorityRepertoireSymbol:{authority:{...r6Authority({}),repertoire:sym(rep)}},authorityRepertoireHidden:{authority:{...r6Authority({}),repertoire:hidden(rep)}},authorityRepertoireInherited:{authority:{...r6Authority({}),repertoire:inherited(rep)}},
  authorityItselfSymbol:{authority:sym(r6Authority({}))}};
 const res={};for(const [k,o] of Object.entries(forms)){const r=S.generateProgram(intake,o);res[k]={plankKept:hasHold(r),status:r.status};check('new entry point strips '+k,hasHold(r),r.status);}
 // The frozen entry points: a JSON `strength` field is inert again (A-06); a code-level Symbol is the development path (D-12).
 const plain=V1.generateProgram(intake),field=V1.generateProgram(intake,{repertoire:{...rep,strength:{hold:['front-plank','side-plank','dead-bug']}}}),symbol=V1.generateProgram(intake,{repertoire:sym(rep)});
 res.frozenJsonFieldInert=hash(field.program)===hash(plain.program);res.frozenSymbolActs=!hasHold(symbol);res.frozenSymbolBinding=symbol.program?.repertoire?.strengthExtension??null;
 check('frozen v1-index: a JSON strength field is inert',res.frozenJsonFieldInert);
 // JSON round trip of a supplied repertoire carrying the Symbol: the rules vanish (as they must: JSON cannot carry them).
 res.jsonRoundTripDropsRules=!JSON.stringify(sym(rep)).includes('hold');
 note('A1 carrier',res);}

// 2. Rules carried through every rebuild kind: a long bodyweight plan under DEV, many review kinds; a hold or a lost binding would show here.
{const t=timeline(lifter({experience:'INTERMEDIATE',equipment:EQUIPMENT.BW,days:[0,1,2,4,6],weeks:16,rotation:'EVERY_2_WEEKS',known:HOLDS.map(familiar)}));const seen=[],statuses=[];
 const steps=[[0,6,'WEEKLY_REVIEW'],[1,6,'WEEKLY_REVIEW'],[2,0,'SCHEDULE_CHANGE',{changes:{strengthDays:[1,3,5]}}],[2,6,'WEEKLY_REVIEW'],[3,0,'EQUIPMENT_CHANGE',{changes:{equipment:['BANDS']}}],[3,2,'LOCAL_FATIGUE',{signals:{region:'LOWER'}}],[3,3,'SYSTEMIC_FATIGUE',{}],[3,6,'WEEKLY_REVIEW'],
  [4,0,'EQUIPMENT_CHANGE',{changes:{equipment:[],from:null,to:null}}],[4,1,'EXERCISE_SUBSTITUTION',{substitution:{exerciseId:'dead-bug',reason:'NONCLINICAL_DISCOMFORT_OR_PREFERENCE',nonclinicalConfirmed:true}}],[4,6,'WEEKLY_REVIEW'],[5,0,'SCHEDULE_CHANGE',{changes:{strengthDays:[0,1,2,4,6]}}],[5,6,'WEEKLY_REVIEW'],[6,6,'WEEKLY_REVIEW']];
 for(const [w,d,k,x] of steps){const r=k==='WEEKLY_REVIEW'?t.week(w):t.step(w,d,k,x??{},'06:00');statuses.push(k+':'+r.status+':'+(r.strengthExtension?.status??''));seen.push(...idsOf(t.p).filter(id=>HOLDS.includes(id)));}
 note('A2 rules through rebuilds',{statuses,holdsSeen:[...new Set(seen)],binding:t.p.repertoire.strengthExtension});check('no hold through rebuilds',!seen.length);}

// 3. The clinical pass-through for a plan built under other rules.
{const t=timeline(lifter({experience:'INTERMEDIATE'}));t.week(0);const sign={status:'NONCLINICAL_CONFIRMED',assessedAt:t.day(1,0),pain:true,persistentPain:false,injury:false,illness:false,functionalLimitation:false,clinicalConcern:false};
 const reviews={painSign:t.review(1,0,'WEEKLY_REVIEW',{eligibility:sign},'06:00'),injurySign:t.review(1,0,'WEEKLY_REVIEW',{eligibility:{...sign,pain:false,injury:true}},'06:10'),
  painWithExercise:t.review(1,0,'EXERCISE_SUBSTITUTION',{substitution:{exerciseId:mainsOf(t.p)['FULL_A:1'],reason:'NONCLINICAL_DISCOMFORT_OR_PREFERENCE',pain:true}},'06:20'),
  weekly:t.review(1,6,'WEEKLY_REVIEW'),systemic:t.review(1,2,'SYSTEMIC_FATIGUE',{},'06:00'),adverse:t.review(1,6,'WEEKLY_REVIEW',{observations:t.p.weeks[1].sessions.filter(live).map(s=>report(t.p,s,{response:{performance:'UNDER',recovery:'ADVERSE',effort:'HARDER',nextDayFunction:'IMPAIRED'}}))}),
  substitutionNoPain:t.review(1,0,'EXERCISE_SUBSTITUTION',{substitution:{exerciseId:mainsOf(t.p)['FULL_A:1'],reason:'NONCLINICAL_DISCOMFORT_OR_PREFERENCE',nonclinicalConfirmed:true}},'06:30'),
  equipment:t.review(1,0,'EQUIPMENT_CHANGE',{changes:{equipment:['BANDS']}},'06:40'),schedule:t.review(1,0,'SCHEDULE_CHANGE',{changes:{strengthDays:[1,3,5]}},'06:50')};
 const res={};
 for(const [name,opts] of [['OFF',OFF],['HOLD only',only('HOLD')],['EXPOSURE only',only('EXPOSURE')],['other bytes',{...DEV,strengthExtension:{...devStrength(),sha256:'f'.repeat(64)}}]])for(const [k,rv] of Object.entries(reviews)){
  const r=S.evaluateProgram(t.p,rv,opts),below=F.evaluateProgram(t.p,rv,{...opts});
  const same=hash(without(r,MINE))===hash(below);
  res[name+' / '+k]={status:r.status,proposal:!!r.proposal,ext:r.strengthExtension.status,exactlyBelow:r.status==='CLINICAL_HUMAN_REQUIRED'?same:undefined,belowStatus:below.status,belowProposal:!!below.proposal};
  if(r.status!=='UNSUPPORTED')check(`only a clinical answer passes (${name} / ${k})`,r.status==='CLINICAL_HUMAN_REQUIRED'&&!r.proposal&&same,r.status);
 }
 // A hold on the record from the clinical answer, then a weekly review of the same stranded plan with that reference state.
 const held=S.evaluateProgram(t.p,reviews.painSign,OFF),next=S.evaluateProgram(t.p,{...t.review(1,6,'WEEKLY_REVIEW'),referenceState:held.referenceState,actualLedger:held.actualLedger??[]},OFF);
 res.heldThenWeekly={first:held.status,next:next.status,nextProposal:!!next.proposal};
 note('A3 clinical pass-through',res);}

// 4. The trunk gap disclosure (A-02) and the known limitations; and a stale novice gap.
{const res={};
 for(const reason of ['SKILL_MISMATCH','NONCLINICAL_DISCOMFORT_OR_PREFERENCE']){const t=timeline(lifter({experience:'INTERMEDIATE',equipment:EQUIPMENT.BW,days:[0,1,2,4,6]}));t.weeks(0,1);
  const s=t.step(2,0,'EXERCISE_SUBSTITUTION',{substitution:{exerciseId:'dead-bug',reason,nonclinicalConfirmed:true}},'06:00'),w=t.week(2),later=t.week(3);
  res[reason]={atSubstitution:s.strengthExtension.disclosures??null,atWeekly:(w.strengthExtension.disclosures??[]).map(d=>d.id+':'+d.templates.join('/')),later:(later.strengthExtension.disclosures??[]).map(d=>d.id),knownLimitations:s.strengthExtension.knownLimitations.map(x=>x.id),missing:t.p.templates.filter(x=>x.missingPatterns.includes('TRUNK')).map(x=>x.type)};
  check('trunk gap declared at the substitution and after ('+reason+')',(s.strengthExtension.disclosures??[]).some(d=>d.id==='TRUNK_SLOT_UNFILLED')&&(w.strengthExtension.disclosures??[]).some(d=>d.id==='TRUNK_SLOT_UNFILLED'));}
 // Under OFF the same plan has no such disclosure (the gap does not exist there); under only UPPER and PLANE neither.
 const o=timeline(lifter({experience:'INTERMEDIATE',equipment:EQUIPMENT.BW,days:[0,1,2,4,6]}),{opts:OFF});o.weeks(0,1);res.OFF=o.step(2,0,'EXERCISE_SUBSTITUTION',{substitution:{exerciseId:'dead-bug',reason:'SKILL_MISMATCH'}},'06:00').strengthExtension.disclosures??null;
 // A NONE plan with five days (novice set in force first): any trunk gap only in the novice set, and what the answer says after the boundary.
 for(const eq of ['BW','BANDS']){const t=timeline(lifter({experience:'NONE',equipment:EQUIPMENT[eq],days:[0,1,2,4,6]}));const end=t.p.blocks.find(b=>b.family==='DEVELOPMENT').endWeekExclusive;t.weeks(0,1);
  const s=t.step(2,0,'EXERCISE_SUBSTITUTION',{substitution:{exerciseId:'dead-bug',reason:'SKILL_MISMATCH'}},'06:00');t.weeks(2,end+1);
  res['NONE 5d '+eq]={sub:s.status,noviceMissing:(t.p.noviceTemplates??[]).filter(x=>x.missingPatterns.includes('TRUNK')).map(x=>x.type),regularMissing:t.p.templates.filter(x=>x.missingPatterns.includes('TRUNK')).map(x=>x.type),disclosedAfterBoundary:(t.last.strengthExtension.disclosures??[]).map(d=>d.templates),weekAfterBoundaryTrunkRows:rowsOf(t.p,end+1).filter(x=>x.e.pattern==='TRUNK').length};}
 // A fresh plan: the limitations every answer under HOLD carries.
 res.newPlanLimitations=S.generateProgram(lifter({}),DEV).strengthExtension.knownLimitations.map(x=>x.id);res.newPlanUnderPlaneOnly=S.generateProgram(lifter({}),only('PLANE')).strengthExtension.knownLimitations??null;
 note('A4 trunk gap and limitations',res);}

// 5. Exposure strictness (A-13) through the function.
{const p=S.generateProgram(lifter({experience:'INTERMEDIATE',equipment:EQUIPMENT.DB}),DEV).program,s=p.weeks[1].sessions.filter(x=>live(x)&&x.sport==='STRENGTH')[0],base={...report(p,s),localDate:s.date};
 const c=l=>weeklyStrengthExposure({program:p,weekIndex:1,ledger:l}).executed,first=base.actual.exercises[0].id;
 note('A5 exposure strictness',{noAthleteId:c([{...base,athleteId:undefined}]).sessionsReported,fractional:c([{...base,actual:{completed:true,exercises:[{id:first,sets:[{reps:8.5},{reps:8}]}]}}]).byPrimaryMuscle,bigSets:Object.values(c([{...base,actual:{completed:true,exercises:[{id:first,sets:Array.from({length:5000},()=>({reps:8}))}]}}]).byPrimaryMuscle)[0]});}

// 6. A supplied development authority whose values lack the new knownLimitations array (D-12 path): contained or thrown?
{let r;try{const v={...devStrength().values,holdDose:{...devStrength().values.holdDose,knownLimitations:undefined}};r=S.generateProgram(lifter({}),{...DEV,strengthExtension:{...devStrength(),values:v}}).status;}catch(e){r='THROW '+e.message.slice(0,80);}
 note('A6 supplied values without knownLimitations',r);}
out.fails=fails;console.log('fails',fails);
if(process.argv[2])fs.writeFileSync(process.argv[2],JSON.stringify(out,null,1));
