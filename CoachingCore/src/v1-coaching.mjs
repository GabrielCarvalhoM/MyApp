// V1 Coaching Productization (V1CP, Founder request of 2026-11-08), Blocks 3 and 4: the athlete's coaching choices.
// - Coach profile: CONSERVATIVE | BALANCED | DEMANDING, one per athlete. It is the adaptive philosophy: how evidence becomes progression.
// - Volume: LOWER | STANDARD | HIGHER, per sport (one value for both is accepted). Quantity ceilings only.
// - Difficulty: LOWER | STANDARD | HIGHER, per sport. The relative challenge of sessions only.
// Each lever belongs to exactly one axis, so the three choices never multiply; every output still passes through the unchanged R6 envelope (gates,
// caps, return recipes, event phase doses, the clinical screen). BALANCED / STANDARD / STANDARD is the R7D-FREEZE-6 behaviour: the default path
// carries no `coaching` key at all, so its canonical intake, program and decisions are byte-identical to the reviewed runtime.
// Which lever does what is the SSCTR's decision (audits/v1-coaching-productization-2026-11-08/ssctr/): the levers are listed in LEVERS with the
// decision that enables each one; a lever no decision enables is inert.
import {clone,freeze,hash} from './value.mjs';

export const COACH_PROFILES=Object.freeze(['CONSERVATIVE','BALANCED','DEMANDING']);
export const LEVELS=Object.freeze(['LOWER','STANDARD','HIGHER']);
export const SPORTS=Object.freeze(['RUN','STRENGTH']);
export const DEFAULT_COACHING=freeze({profile:'BALANCED',volume:{RUN:'STANDARD',STRENGTH:'STANDARD'},difficulty:{RUN:'STANDARD',STRENGTH:'STANDARD'}});
const word=v=>typeof v==='string'?v.trim().toUpperCase().replace(/[\s-]+/g,'_'):null;
const SPORT_KEYS={RUN:'RUN',RUNNING:'RUN',STRENGTH:'STRENGTH'};

/** A level per sport from one value for both or an object by sport; a sport left out keeps `base`. Invalid values are named in `errors`. */
function perSport(v,base,name,errors){
 if(v===undefined)return clone(base);
 if(typeof v==='string'){const l=word(v);if(!LEVELS.includes(l)){errors.push(name);return clone(base);}return {RUN:l,STRENGTH:l};}
 if(!v||typeof v!=='object'||Array.isArray(v)){errors.push(name);return clone(base);}
 const out=clone(base);
 for(const [k,x] of Object.entries(v)){const s=SPORT_KEYS[word(k)],l=word(x);if(!s||!LEVELS.includes(l)){errors.push(name+'.'+k);continue;}out[s]=l;}
 return out;
}
/** The choices `ch` states, over `base` (the choices in force): profile, volume and difficulty; anything else is an error, never ignored. */
export function mergeCoaching(base,ch,errors=[]){
 const b=base??DEFAULT_COACHING,out={profile:b.profile,volume:clone(b.volume),difficulty:clone(b.difficulty)};
 if(!ch||typeof ch!=='object'||Array.isArray(ch)){errors.push('coaching');return out;}
 for(const k of Object.keys(ch))if(!['profile','volume','difficulty'].includes(k))errors.push('coaching.'+k);
 if(ch.profile!==undefined){const p=word(ch.profile);if(COACH_PROFILES.includes(p))out.profile=p;else errors.push('coaching.profile');}
 out.volume=perSport(ch.volume,out.volume,'coaching.volume',errors);
 out.difficulty=perSport(ch.difficulty,out.difficulty,'coaching.difficulty',errors);
 return out;
}
/** The canonical choices of an intake: null when the athlete stated none (the default path, no key), else the merged choices. */
export function canonicalCoaching(raw,errors=[]){
 if(raw===undefined||raw===null)return null;
 return mergeCoaching(DEFAULT_COACHING,raw,errors);
}
/** One line naming the choices, for decision reasons and coach explanations. */
export const describeCoaching=x=>{const c=x??DEFAULT_COACHING;return `coach ${c.profile.toLowerCase()}; volume running ${c.volume.RUN.toLowerCase()}, strength ${c.volume.STRENGTH.toLowerCase()}; difficulty running ${c.difficulty.RUN.toLowerCase()}, strength ${c.difficulty.STRENGTH.toLowerCase()}`;};
/** The choices in force for a canonical context: its own, or the defaults. */
export const coachingOf=c=>c?.coaching??DEFAULT_COACHING;
export const isDefaultCoaching=x=>hash(x??DEFAULT_COACHING)===hash(DEFAULT_COACHING);

// ---------- The levers (SSCTR-V1CP-DECISION Q09-Q12) ----------
// Profile (adaptive philosophy, holds and advice only): P1 CONSERVATIVE counts EARNED as ADVANCE; P2 CONSERVATIVE holds an EASY-mode development run
// step after a completed run with no reported response; P4 advice on graduation and ladder offers. P3 moved to Difficulty; P5 rejected: DEMANDING's
// doses equal BALANCED's.
// Volume (quantity ceilings): V1 LOWER strength exercises at the main-only budget; V2 LOWER no block-boundary set; V3 taper and race-week running
// fractions at the range bounds; V4' LOWER easy-run durations take no step.
// Difficulty (relative challenge): D1 the strength step tolerance and instruction threshold (LOWER tolerance 0 and threshold startRir; HIGHER RIR 2
// on eligible hypertrophy accessory rows, threshold 1, or threshold 2 on general accessory rows); D2 optional strides (LOWER not shown, HIGHER shown
// in the session, still optional); D3 taper quality work at the range bounds.
export const profileOf=c=>coachingOf(c).profile;
export const volumeOf=(c,sport)=>coachingOf(c).volume[sport];
export const difficultyOf=(c,sport)=>coachingOf(c).difficulty[sport];
/** V3, D3: a point of an approved range: the lower bound (LOWER), today's value (STANDARD) or the upper bound (HIGHER). */
export const rangePoint=(range,level,standard)=>level==='LOWER'?range[0]:level==='HIGHER'?range[1]:standard;
/** D1 HIGHER eligibility of a strength row (Q11): an accessory loaded row (KNOWN or FROM_LOG), an INTERMEDIATE or EXPERIENCED lifter, a development
 * phase, and, with a programmed run goal, an upper-body row only (key-run protection). Returns the goal kind it applies to, else null. */
export const DEVELOPMENT_PHASES_D1=Object.freeze(['BUILD','DEVELOPMENT','NEXT_BLOCK','CONSOLIDATION']);
export function d1Higher(sk,{role,kind,loaded,region,phase}){
 if(difficultyOf(sk.c,'STRENGTH')!=='HIGHER'||role!=='ACCESSORY'||!loaded||!['KNOWN','FROM_LOG'].includes(kind)||!DEVELOPMENT_PHASES_D1.includes(phase))return null;
 if(!['INTERMEDIATE','EXPERIENCED'].includes(sk.c.athlete.strengthExperience))return null;
 const goal=sk.goal?.strength?.kind;if(!['HYPERTROPHY','GENERAL'].includes(goal))return null;
 if(sk.cap?.run?.programmed&&sk.goal?.run?.kind!=='NONE'&&region!=='UPPER')return null;
 return goal;
}
/** The disclosures the choices carry (Q09 C-Q09-2, Q10 C-Q10-1 and V1, P2 conditions): informational, never blocking. */
export function coachingDisclosures(c){
 const x=coachingOf(c),out=[];
 if(isDefaultCoaching(x))return out;
 if(x.profile==='CONSERVATIVE')out.push({id:'COACH_CONSERVATIVE',blocking:false,informational:true,detail:'Conservative coach: a step waits for evidence on the planned cadence (no early step from easier-than-target sessions), and a running step waits for your reported effort and recovery; a completed run imported without them holds too, and the harder running session is offered only once they are reported'});
 if(x.profile==='DEMANDING')out.push({id:'COACH_DEMANDING',blocking:false,informational:true,detail:'Demanding coach: the doses and limits are the same as the balanced coach (no faster step is supported by the evidence reviewed); the coach recommends taking the harder options when they are offered'});
 if(x.volume.STRENGTH==='LOWER')out.push({id:'VOLUME_LOWER_STRENGTH',blocking:false,informational:true,detail:'Lower strength volume: main lifts only and no added set at block boundaries; progress toward a muscle-building goal is slower with fewer weekly sets'});
 if(x.volume.RUN==='LOWER')out.push({id:'VOLUME_LOWER_RUN',blocking:false,informational:true,detail:'Lower running volume: your easy runs keep their length; the long run and the harder session still progress on evidence. Fewer run days is a change of your chosen days'});
 for(const s of SPORTS)if(x.volume[s]==='HIGHER')out.push({id:'VOLUME_HIGHER_'+s,blocking:false,informational:true,detail:`Higher ${s==='RUN'?'running':'strength'} volume is the same as standard here: your plan already uses your chosen days and minutes as your capacity allows${s==='RUN'?'; only taper and race weeks keep more of your running':''}`});
 if(x.difficulty.STRENGTH==='LOWER')out.push({id:'DIFFICULTY_LOWER_STRENGTH',blocking:false,informational:true,detail:'Lower strength difficulty: a step needs every logged set at the prescribed reps in reserve or more; a set one short holds, never goes back'});
 if(x.difficulty.STRENGTH==='HIGHER')out.push({id:'DIFFICULTY_HIGHER_STRENGTH',blocking:false,informational:true,detail:'Higher strength difficulty: eligible accessory exercises are prescribed closer to the limit (never to failure), only for intermediate or experienced lifters in development weeks, and never during a return'});
 if(x.difficulty.RUN!=='STANDARD')out.push({id:'DIFFICULTY_RUN_'+x.difficulty.RUN,blocking:false,informational:true,detail:x.difficulty.RUN==='LOWER'?'Lower running difficulty: optional strides are not shown; taper sessions keep the lower amount of harder work':'Higher running difficulty: optional strides are shown in the session (still optional); taper sessions keep the upper amount of harder work; the harder sessions themselves progress as standard'});
 return out;
}
