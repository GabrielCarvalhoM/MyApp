// QRE V1STR R1, probe A (independent judge; read-only, writes nothing): V-EXT-01 off-identity, caller injection and authority fail-closed.
// Run from CoachingCore/: node ../audits/v1-strength-corrections-2026-11-16/candidate/reviews/qre/probes/qre-a-off-and-authority.mjs
import * as S from '../../../../../../CoachingCore/src/v1-strength-index.mjs';
import * as F from '../../../../../../CoachingCore/src/v1-run-forecast-index.mjs';
import * as V1 from '../../../../../../CoachingCore/src/v1-index.mjs';
import {STRENGTH_RULES,repertoireAuthority} from '../../../../../../CoachingCore/src/r7b-repertoire.mjs';
import {strengthAuthority,strengthRules,devStrength,allowsStrength,STRENGTH_VALUES_SHA256,STRENGTH_BOUNDARIES as B} from '../../../../../../CoachingCore/src/v1-strength.mjs';
import {lifter,hybrid,timeline,report,live,hash,EQUIPMENT,DEV,OFF,only,familiar,idsOf,addDays,ELIG} from '../../../../../../CoachingCore/test/v1str-helpers.mjs';

const out={checks:[],counts:{}};let fails=0;
const check=(name,ok,detail='')=>{out.checks.push({name,ok:!!ok,...(detail?{detail}:{})});if(!ok){fails++;console.log('FAIL',name,detail);}};
const without=(o,keys)=>Object.fromEntries(Object.entries(o).filter(([k])=>!keys.includes(k)));
const MINE=['strengthExtension','strengthExposure'],HOLDS=['front-plank','side-plank'];

// 1. Off-identity over a population, with no options at all (the integration path: no record exists, so every boundary is off) and with OFF.
const GOALS=['GENERAL','HYPERTROPHY','STRENGTH','RUNNING_SUPPORT'],DAYS=[[3],[1,4],[1,3,5],[0,2,4,6],[0,1,2,4,6]],EXP=['NONE','NOVICE','INTERMEDIATE','EXPERIENCED'];
let gen=0,genSame=0,frozenNote=null;
for(const eq of Object.keys(EQUIPMENT))for(const goal of GOALS)for(const days of DAYS)for(const experience of EXP){
 if((gen%3)!==0&&experience!=='NONE'&&days.length!==5){gen++;continue;} // a stratified third of the grid, every NONE and every 5-day profile
 const intake=lifter({goal,experience,equipment:EQUIPMENT[eq],days});
 const a=S.generateProgram(intake),b=F.generateProgram(intake);gen++;
 const same=hash(without(a,MINE))===hash(b)&&a.strengthExtension.status==='DISABLED'&&a.strengthExposure.status==='DISABLED'&&(a.program?.repertoire?.strengthExtension===undefined);
 if(same)genSame++;else check(`off-identity no options ${eq} ${goal} ${days.length}d ${experience}`,false,a.status+' '+b.status);
 if(frozenNote===null)frozenNote={baseFrozen:Object.isFrozen(b),newFrozen:Object.isFrozen(a)};
}
out.counts.offIdentityGenerate={population:genSame+out.checks.filter(c=>!c.ok).length,identical:genSame};
console.log('off-identity (no options) generate:',genSame,'identical');
// Reviews and a restart, with no options and with OFF, several weeks, a missed week and an adverse week, a substitution and an equipment change.
let rev=0,revSame=0;
for(const intake of [lifter({experience:'NONE',equipment:EQUIPMENT.BW,days:[1,3,5]}),lifter({goal:'HYPERTROPHY',experience:'INTERMEDIATE'}),hybrid({}),lifter({experience:'INTERMEDIATE',equipment:EQUIPMENT.DB_BANDS,days:[0,2,4,6]}),hybrid({goal:'GENERAL',equipment:EQUIPMENT.MACH_DB,days:[0,2,4]})]){
 for(const opts of [{},OFF]){
  const a=timeline(intake,{opts}),b=timeline(intake,{opts,entry:F});
  const how=w=>s=>w===1&&s.sport==='STRENGTH'?false:w===2?{response:{performance:'UNDER',recovery:'ADVERSE',effort:'HARDER',nextDayFunction:'IMPAIRED'}}:{};
  for(let w=0;w<4;w++){const x=a.week(w,how(w)),y=b.week(w,how(w));rev++;if(hash(without(x,MINE))===hash(y))revSame++;else check(`off-identity review week ${w}`,false,x.status+'/'+y.status);}
  const target=a.p.weeks[4].sessions.filter(live).flatMap(s=>s.sport==='STRENGTH'?s.prescription.exercises:[]).find(e=>e.role==='MAIN')?.id;
  if(target){const ev={substitution:{exerciseId:target,reason:'NONCLINICAL_DISCOMFORT_OR_PREFERENCE',nonclinicalConfirmed:true}};const x=a.step(4,0,'EXERCISE_SUBSTITUTION',ev,'06:00'),y=b.step(4,0,'EXERCISE_SUBSTITUTION',ev,'06:00');rev++;if(hash(without(x,MINE))===hash(y))revSame++;else check('off-identity substitution',false);}
  const eqc={changes:{equipment:['DUMBBELLS','MACHINES','BANDS']}};const x=a.step(4,1,'EQUIPMENT_CHANGE',eqc,'06:00'),y=b.step(4,1,'EQUIPMENT_CHANGE',eqc,'06:00');rev++;if(hash(without(x,MINE))===hash(y))revSame++;else check('off-identity equipment change',false);
  const asOf=addDays(a.p.startDate,36),again={intake:{...intake,asOf,startDate:addDays(a.p.startDate,42),athlete:{...intake.athlete,eligibility:ELIG(asOf),pause:{weeks:1,reasonCategory:'TRAVEL',nonclinical:true}}},record:a.ledger,referenceState:a.ref};
  const r=S.restartProgram(again,opts),q=F.restartProgram(again,opts);rev++;if(hash(without(r,MINE))===hash(q))revSame++;else check('off-identity restart',false,r.status+'/'+q.status);
 }
}
out.counts.offIdentityReviews={compared:rev,identical:revSame};
console.log('off-identity reviews/restarts:',revSame,'/',rev);
out.counts.frozenness=frozenNote;

// 2. A caller cannot turn a rule on through the new entry point (by the option key, a supplied repertoire, or authority.repertoire).
const intake=lifter({experience:'INTERMEDIATE',equipment:EQUIPMENT.BW,days:[1,3,5]}),rules=strengthRules(devStrength()),base=S.generateProgram(intake);
const hasHold=r=>!!r.program&&idsOf(r.program).some(id=>HOLDS.includes(id));
check('control: without rules this plan holds a plank',hasHold(base));
check('control: DEV turns the plank off',!hasHold(S.generateProgram(intake,DEV)));
const rep=repertoireAuthority({asOf:intake.asOf});
const injections={
 symbolKey:{[STRENGTH_RULES]:rules},
 repertoireStrength:{repertoire:{...rep,strength:rules}},
 authorityRepertoireStrength:(()=>{const g=F.generateProgram(intake);return null;})(),
 repertoireStrengthNonEnumerable:(()=>{const r={...rep};Object.defineProperty(r,'strength',{value:rules,enumerable:false});return {repertoire:r};})(),
 repertoireProtoStrength:{repertoire:Object.assign(Object.create({strength:rules}),rep)},
 strengthRecordsForged:{strengthRecords:{records:Object.values(B).map(id=>({boundaryId:id,extensionSha256:STRENGTH_VALUES_SHA256,independent:true,disposition:'APPROVE',evidenceStatus:'WELL_SUPPORTED',sourceIds:['x']}))}},
 strengthExtensionForged:{strengthExtension:devStrength()},
};
delete injections.authorityRepertoireStrength;
for(const [k,o] of Object.entries(injections)){const r=S.generateProgram(intake,o);out.counts['inject_'+k]={holds:hasHold(r),boundaries:r.strengthExtension?.boundaries,status:r.status};}
check('option key STRENGTH_RULES is taken off',hasHold(S.generateProgram(intake,injections.symbolKey)));
check('a strength field on a supplied repertoire is taken off',hasHold(S.generateProgram(intake,injections.repertoireStrength)));
check('a non-enumerable strength on a supplied repertoire',hasHold(S.generateProgram(intake,injections.repertoireStrengthNonEnumerable)),'non-enumerable strength survives spread? '+!hasHold(S.generateProgram(intake,injections.repertoireStrengthNonEnumerable)));
check('an inherited strength on a supplied repertoire',hasHold(S.generateProgram(intake,injections.repertoireProtoStrength)),'inherited strength reaches the selection: '+!hasHold(S.generateProgram(intake,injections.repertoireProtoStrength)));
// authority.repertoire with strength: needs a full R6 authority object; take it from the engine's own resolution.
import('../../../../../../CoachingCore/src/r6-authority.mjs').then(async({r6Authority})=>{
 const auth={...r6Authority({}),repertoire:{...rep,strength:rules}},r=S.generateProgram(intake,{authority:auth});
 check('a strength field on authority.repertoire is taken off',hasHold(r),r.status);
 // The dev affordances that DO turn rules on through the new entry point (D-12): a forged records list and a supplied authority.
 out.counts.devAffordances={forgedRecordsTurnOn:!hasHold(S.generateProgram(intake,injections.strengthRecordsForged)),suppliedAuthorityTurnsOn:!hasHold(S.generateProgram(intake,injections.strengthExtensionForged))};
 // A supplied authority with arbitrary values: is anything checked about `values` when supplied?
 const evil={id:'V1X-STRENGTH-1',valid:true,sha256:'x',approved:{[B.HOLD]:true},values:{holdDose:{configurations:['dead-bug','bird-dog','pallof-press','front-plank','side-plank']},planeAlternation:{patterns:{}}}};
 const e=S.generateProgram(intake,{strengthExtension:evil});
 out.counts.suppliedArbitraryValues={status:e.status,trunkRowsWeek0:e.program?e.program.weeks[0].sessions.filter(live).flatMap(s=>s.sport==='STRENGTH'?s.prescription.exercises:[]).filter(x=>x.pattern==='TRUNK').map(x=>x.id):null,missing:e.program?.templates?.map(t=>t.missingPatterns)};

 // 3. Authority fail closed (records variants).
 const rec=(id,x={})=>({boundaryId:id,extensionSha256:STRENGTH_VALUES_SHA256,independent:true,disposition:'APPROVE_WITH_CONDITIONS',evidenceStatus:'SUPPORTED_WITH_LIMITS',sourceIds:['S'],...x});
 const on=records=>{try{const a=strengthAuthority({strengthRecords:records});return Object.keys(B).filter(k=>allowsStrength(a,k));}catch(err){return 'THROW '+err.message;}};
 const variants={
  none:[undefined,[]],nullRecords:[null,[]],recordsNotArray:[{records:{}},[]],recordsArrayTop:[[rec(B.HOLD)],[]],
  good:[{records:[rec(B.HOLD)]},['HOLD']],
  independentString:[{records:[rec(B.HOLD,{independent:'true'})]},[]],
  sourceIdsString:[{records:[rec(B.HOLD,{sourceIds:'S'})]},[]],
  wrongBoundaryCase:[{records:[rec(B.HOLD.toLowerCase())]},[]],
  shaUpper:[{records:[rec(B.HOLD,{extensionSha256:STRENGTH_VALUES_SHA256.toUpperCase()})]},[]],
  mixedVeto:[{records:[rec(B.HOLD),rec(B.HOLD,{evidenceStatus:'INSUFFICIENT'})]},[]],
  mixedOtherSha:[{records:[rec(B.HOLD),rec(B.HOLD,{extensionSha256:'0'.repeat(64),disposition:'REJECT'})]},['HOLD']],
  nullEntries:[{records:[null,1,'x',rec(B.UPPER)]},['UPPER']],
  hostileGetter:[{get records(){throw new Error('boom');}},'THROW'],
 };
 for(const [k,[records,expect]] of Object.entries(variants)){const got=on(records);out.counts['auth_'+k]=got;
  if(expect==='THROW')check(`authority ${k}: a throwing records object`,typeof got==='string',JSON.stringify(got));else check(`authority ${k}`,JSON.stringify(got)===JSON.stringify(expect),JSON.stringify(got));}
 // The entry point with a throwing records object: fail closed (every boundary off) and the engine answers.
 const thr=S.generateProgram(intake,{strengthRecords:{get records(){throw new Error('boom');}}});
 check('entry point: a throwing records object leaves every boundary off and the engine answers',thr.status==='PROPOSED'&&Object.values(thr.strengthExtension.boundaries).every(v=>v===false),thr.status);
 // A review of a plan built under the rules, after the rules are withdrawn (the records file gone): UNSUPPORTED. And with a fresh warning sign?
 const t=timeline(lifter({experience:'INTERMEDIATE'}));t.week(0);
 const pain=S.evaluateProgram(t.p,t.review(1,0,'WEEKLY_REVIEW',{eligibility:{status:'NONCLINICAL_CONFIRMED',assessedAt:t.day(1,0),pain:true,persistentPain:false,injury:false,illness:false,functionalLimitation:false,clinicalConcern:false}},'06:00'),OFF);
 out.counts.withdrawnRulesFreshWarningSign={status:pain.status,reason:pain.reason};
 const painUnder=S.evaluateProgram(t.p,t.review(1,0,'WEEKLY_REVIEW',{eligibility:{status:'NONCLINICAL_CONFIRMED',assessedAt:t.day(1,0),pain:true,persistentPain:false,injury:false,illness:false,functionalLimitation:false,clinicalConcern:false}},'06:00'),DEV);
 out.counts.underRulesFreshWarningSign={status:painUnder.status};
 // The same plan through the frozen entry points (what custody calls today, D-11): reviewed with no rule and no refusal.
 const viaFrozen=F.evaluateProgram(t.p,t.review(1,6,'WEEKLY_REVIEW'),{});
 const viaV1=V1.evaluateProgram(t.p,t.review(1,6,'WEEKLY_REVIEW'),{});
 out.counts.planUnderRulesViaFrozenEntryPoints={forecastIndex:viaFrozen.status,v1Index:viaV1.status};
 // Determinism: the same input twice, same plan.
 const d1=S.generateProgram(hybrid({equipment:EQUIPMENT.FULL}),DEV),d2=S.generateProgram(hybrid({equipment:EQUIPMENT.FULL}),DEV);
 check('determinism: same input, same answer',hash(d1)===hash(d2));
 out.fails=fails;console.log(JSON.stringify(out.counts,null,1));console.log('fails:',fails);
 if(process.argv[2])(await import('node:fs')).writeFileSync(process.argv[2],JSON.stringify(out,null,1));
});
