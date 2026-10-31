import {clone} from './value.mjs';
import {CONFIGURATIONS,configurationOf,admitted,skillRank,closeVariation,noExternalLoad,repertoireAuthority} from './r7b-repertoire.mjs';

/**
 * Movement catalogue (R7-B): the configurations of the bound repertoire catalog R7B0-CATALOG-2 (src/r7b-repertoire.mjs), which supersedes the
 * R6 list (B0-F01 load conventions, B0-F02 laterality, B0-F03 one fixed role per exercise). Identity, equipment, ordinal demand classes, load
 * convention, laterality and admissible contextual roles; no load table, no cross-exercise kilogram conversion. A configuration has no
 * universal role: the role of a row is the role of the slot it fills (DR-134).
 */
export const CATALOGUE=CONFIGURATIONS;
export const catalogueEntry=id=>configurationOf(id);
export const has=(available,required)=>required.every(eq=>available.has(eq));
const DEFAULT_AUTH=repertoireAuthority();
const practiceOnly=e=>e.roles.length===1&&e.roles[0]==='PRACTICE';
/**
 * Candidate configurations for a pattern, ranked by familiarity, competence fit and least novelty. Familiarity comes only from explicit athlete
 * facts; equipment availability never implies competence. `role` filters by admissible contextual role ('ANY' for any non-practice role).
 */
export function candidatesFor(pattern,{equipment=[],experience='NOVICE',known=[],role=null,exclude=[],practice=false,auth=DEFAULT_AUTH}={}){
 const available=new Set([...equipment,'BODYWEIGHT']),maxSkill=experience==='NOVICE'||experience==='NONE'?0:1,knownIds=new Set(known.map(k=>k.id));
 return CATALOGUE.filter(e=>e.pattern===pattern&&admitted(e,auth)&&has(available,e.equipment)&&!exclude.includes(e.id)&&(practice?e.roles.includes('PRACTICE'):!practiceOnly(e))&&(role===null||role==='ANY'||e.roles.includes(role))&&(knownIds.has(e.id)||skillRank(e.skill)<=maxSkill))
  .map(e=>({...clone(e),familiar:knownIds.has(e.id)}))
  .sort((a,b)=>Number(b.familiar)-Number(a.familiar)||(a.loading==='EXTERNAL'&&b.loading!=='EXTERNAL'?-1:b.loading==='EXTERNAL'&&a.loading!=='EXTERNAL'?1:0)||skillRank(b.skill)-skillRank(a.skill)||(a.id<b.id?-1:a.id>b.id?1:0));
}
/**
 * Same-intent substitutes (catalog strength.substitution.ranking): familiar first, then a close variation of the original, then the same
 * subpattern, then the same pattern. A bodyweight-for-load swap is marked as a different stimulus. Never returns a load; an unfamiliar
 * substitute starts with establishment.
 */
export function substitutesFor(exerciseId,{pattern=null,equipment=[],experience='NOVICE',known=[],role='ANY',auth=DEFAULT_AUTH,exclude=[]}={}){
 const source=catalogueEntry(exerciseId),target=source?.pattern??pattern;if(!target)return [];
 return candidatesFor(target,{equipment,experience,known,role,exclude:[exerciseId,...exclude],auth}).map(e=>({...e,closeVariation:!!source&&closeVariation(source,catalogueEntry(e.id)),sameSubpattern:!!source&&e.subpattern===source.subpattern,sameVariantFamily:!!source&&e.variantOf===source.variantOf,demandChange:source?{lower:source.lowerDemand+'->'+e.lowerDemand,loading:source.loading+'->'+e.loading}:null,stimulusChange:!!source&&!noExternalLoad(source)&&noExternalLoad(e)?'A bodyweight or band swap for a loaded exercise is a different stimulus, not an equivalent load':null,requiresEstablishment:!e.familiar}))
  .sort((a,b)=>Number(b.familiar)-Number(a.familiar)||Number(b.closeVariation)-Number(a.closeVariation)||Number(b.sameSubpattern)-Number(a.sameSubpattern)||Number(b.sameVariantFamily)-Number(a.sameVariantFamily));
}
