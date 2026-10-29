import {clone,freeze} from './value.mjs';

/** Movement catalogue. Identity, equipment and demand classes only; no load table, no cross-exercise kg conversion. */
const E=(id,pattern,region,equipment,skill,lowerDemand,role,extra={})=>({id,pattern,region,equipment,skill,lowerDemand,role,loading:equipment.includes('BODYWEIGHT')&&equipment.length===1?'BODYWEIGHT':equipment.includes('BANDS')?'BAND':'EXTERNAL',convention:equipment.includes('BARBELL')?'TOTAL':equipment.includes('DUMBBELLS')||equipment.includes('KETTLEBELL')?'PER_HAND':equipment.includes('MACHINES')?'MACHINE_STACK':'BODYWEIGHT',unilateral:false,runningSupport:false,variantOf:null,...extra});
export const CATALOGUE=freeze([
 E('back-squat','SQUAT','LOWER',['BARBELL','RACK'],'HIGH','HEAVY','MAIN',{variantOf:'squat'}),
 E('goblet-squat','SQUAT','LOWER',['DUMBBELLS'],'LOW','MODERATE','MAIN',{variantOf:'squat'}),
 E('kb-goblet-squat','SQUAT','LOWER',['KETTLEBELL'],'LOW','MODERATE','MAIN',{variantOf:'squat'}),
 E('leg-press','SQUAT','LOWER',['MACHINES'],'LOW','MODERATE','MAIN',{variantOf:'squat'}),
 E('box-squat-bodyweight','SQUAT','LOWER',['BODYWEIGHT'],'LOW','LIGHT','MAIN',{variantOf:'squat'}),
 E('sit-to-stand','SQUAT','LOWER',['BODYWEIGHT'],'LOW','LIGHT','PRACTICE',{variantOf:'squat'}),
 E('barbell-rdl','HINGE','LOWER',['BARBELL'],'HIGH','HEAVY','MAIN',{variantOf:'hinge',runningSupport:true}),
 E('db-rdl','HINGE','LOWER',['DUMBBELLS'],'MODERATE','MODERATE','MAIN',{variantOf:'hinge',runningSupport:true}),
 E('kb-deadlift','HINGE','LOWER',['KETTLEBELL'],'LOW','MODERATE','MAIN',{variantOf:'hinge',runningSupport:true}),
 E('hip-thrust-db','HINGE','LOWER',['DUMBBELLS','BENCH'],'MODERATE','MODERATE','ACCESSORY',{variantOf:'bridge',runningSupport:true}),
 E('glute-bridge','HINGE','LOWER',['BODYWEIGHT'],'LOW','LIGHT','ACCESSORY',{variantOf:'bridge',runningSupport:true}),
 E('hip-hinge-practice','HINGE','LOWER',['BODYWEIGHT'],'LOW','LIGHT','PRACTICE',{variantOf:'hinge'}),
 E('db-split-squat','LUNGE','LOWER',['DUMBBELLS'],'MODERATE','MODERATE','ACCESSORY',{unilateral:true,runningSupport:true,variantOf:'single-leg'}),
 E('db-step-up','LUNGE','LOWER',['DUMBBELLS','BENCH'],'LOW','MODERATE','ACCESSORY',{unilateral:true,runningSupport:true,variantOf:'single-leg'}),
 E('reverse-lunge','LUNGE','LOWER',['BODYWEIGHT'],'LOW','LIGHT','ACCESSORY',{unilateral:true,runningSupport:true,variantOf:'single-leg'}),
 E('split-squat-bodyweight','LUNGE','LOWER',['BODYWEIGHT'],'LOW','LIGHT','ACCESSORY',{unilateral:true,runningSupport:true,variantOf:'single-leg'}),
 E('standing-calf-raise','CALF','LOWER',['BODYWEIGHT'],'LOW','LIGHT','ACCESSORY',{runningSupport:true,variantOf:'calf'}),
 E('db-calf-raise','CALF','LOWER',['DUMBBELLS'],'LOW','LIGHT','ACCESSORY',{runningSupport:true,variantOf:'calf'}),
 E('supported-calf-raise','CALF','LOWER',['BODYWEIGHT'],'LOW','LIGHT','PRACTICE',{runningSupport:true,variantOf:'calf'}),
 E('bench-press','PUSH','UPPER',['BARBELL','BENCH','RACK'],'HIGH','NONE','MAIN',{variantOf:'horizontal-push'}),
 E('db-bench-press','PUSH','UPPER',['DUMBBELLS','BENCH'],'MODERATE','NONE','MAIN',{variantOf:'horizontal-push'}),
 E('db-floor-press','PUSH','UPPER',['DUMBBELLS'],'LOW','NONE','MAIN',{variantOf:'horizontal-push'}),
 E('machine-chest-press','PUSH','UPPER',['MACHINES'],'LOW','NONE','MAIN',{variantOf:'horizontal-push'}),
 E('push-up','PUSH','UPPER',['BODYWEIGHT'],'MODERATE','NONE','MAIN',{variantOf:'horizontal-push'}),
 E('incline-push-up','PUSH','UPPER',['BODYWEIGHT'],'LOW','NONE','MAIN',{variantOf:'horizontal-push'}),
 E('wall-pushup','PUSH','UPPER',['BODYWEIGHT'],'LOW','NONE','PRACTICE',{variantOf:'horizontal-push'}),
 E('db-overhead-press','PUSH','UPPER',['DUMBBELLS'],'MODERATE','NONE','ACCESSORY',{variantOf:'vertical-push'}),
 E('one-arm-db-row','PULL','UPPER',['DUMBBELLS','BENCH'],'LOW','NONE','MAIN',{unilateral:true,variantOf:'horizontal-pull'}),
 E('db-row','PULL','UPPER',['DUMBBELLS'],'LOW','NONE','MAIN',{variantOf:'horizontal-pull'}),
 E('barbell-row','PULL','UPPER',['BARBELL'],'HIGH','LIGHT','MAIN',{variantOf:'horizontal-pull'}),
 E('lat-pulldown','PULL','UPPER',['MACHINES'],'LOW','NONE','MAIN',{variantOf:'vertical-pull'}),
 E('seated-cable-row','PULL','UPPER',['MACHINES'],'LOW','NONE','MAIN',{variantOf:'horizontal-pull'}),
 E('pull-up','PULL','UPPER',['PULL_UP_BAR'],'HIGH','NONE','MAIN',{variantOf:'vertical-pull'}),
 E('band-row','PULL','UPPER',['BANDS'],'LOW','NONE','MAIN',{variantOf:'horizontal-pull'}),
 E('prone-row-practice','PULL','UPPER',['BODYWEIGHT'],'LOW','NONE','PRACTICE',{variantOf:'horizontal-pull'}),
 E('dead-bug','TRUNK','CORE',['BODYWEIGHT'],'LOW','NONE','ACCESSORY',{variantOf:'anti-extension',runningSupport:true}),
 E('dead-bug-practice','TRUNK','CORE',['BODYWEIGHT'],'LOW','NONE','PRACTICE',{variantOf:'anti-extension'}),
 E('side-plank','TRUNK','CORE',['BODYWEIGHT'],'LOW','NONE','ACCESSORY',{variantOf:'anti-lateral',runningSupport:true}),
 E('pallof-press','TRUNK','CORE',['BANDS'],'LOW','NONE','ACCESSORY',{variantOf:'anti-rotation',runningSupport:true})
]);
const index=new Map(CATALOGUE.map(e=>[e.id,e]));
export const catalogueEntry=id=>index.get(id)??null;
export const has=(available,required)=>required.every(eq=>available.has(eq));
const skillRank={LOW:0,MODERATE:1,HIGH:2};
/**
 * Candidate exercises for a pattern, ranked by familiarity, competence fit and least novelty.
 * Familiarity comes only from explicit athlete facts; equipment availability never implies competence.
 */
export function candidatesFor(pattern,{equipment=[],experience='NOVICE',known=[],role=null,exclude=[],practice=false}={}){
 const available=new Set([...equipment,'BODYWEIGHT']),maxSkill=experience==='NOVICE'||experience==='NONE'?0:1,knownIds=new Set(known.map(k=>k.id));
 return CATALOGUE.filter(e=>e.pattern===pattern&&has(available,e.equipment)&&!exclude.includes(e.id)&&(practice?e.role==='PRACTICE':e.role!=='PRACTICE')&&(role===null||e.role===role||role==='ANY')&&(knownIds.has(e.id)||skillRank[e.skill]<=maxSkill))
  .map(e=>({...clone(e),familiar:knownIds.has(e.id)}))
  .sort((a,b)=>Number(b.familiar)-Number(a.familiar)||(a.loading==='EXTERNAL'&&b.loading!=='EXTERNAL'?-1:b.loading==='EXTERNAL'&&a.loading!=='EXTERNAL'?1:0)||skillRank[b.skill]-skillRank[a.skill]||(a.id<b.id?-1:a.id>b.id?1:0));
}
/** Same-intent substitutes keep pattern first; variant family second. Never returns a load. */
export function substitutesFor(exerciseId,{pattern=null,equipment=[],experience='NOVICE',known=[]}={}){
 const source=catalogueEntry(exerciseId),target=source?.pattern??pattern;if(!target)return [];
 return candidatesFor(target,{equipment,experience,known,role:'ANY',exclude:[exerciseId]}).map(e=>({...e,sameVariantFamily:!!source&&e.variantOf===source.variantOf,demandChange:source?{lower:source.lowerDemand+'->'+e.lowerDemand,loading:source.loading+'->'+e.loading}:null,requiresEstablishment:!e.familiar}))
  .sort((a,b)=>Number(b.familiar)-Number(a.familiar)||Number(b.sameVariantFamily)-Number(a.sameVariantFamily));
}
