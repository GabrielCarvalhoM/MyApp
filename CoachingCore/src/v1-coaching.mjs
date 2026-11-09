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
