import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {clone,freeze,hash} from './value.mjs';

/**
 * R7-B runtime binding of the V1 coaching repertoire (DOMAIN_COACHING_R7-B; audits/domain-coaching-r7-b-2026-10-31/TASK_CONTRACT.md).
 *
 * The B0 catalog (R7B0-CATALOG-2) is the specification: this module loads its exact bytes, refuses any other bytes, and exposes the
 * configurations, relations and rules the planner and the reviews consume. A B0_CANDIDATE entry becomes usable only through its SSCTR r2
 * record bound to this catalog hash (read at runtime, as the R6 envelope records are read for the policy). The record conditions bind the
 * catalog and prevail where stricter; each one is materialized where it is consumed and listed in CoachingCore/r7/b/CONFORMANCE_R7B.md.
 * Nothing here adds a dose: every number comes from the policy (R6-POLICY-5) by path, or is a runtime constant exposed with its provenance.
 */
export const R7B_REPERTOIRE_VERSION='R7B-REPERTOIRE-1';
export const CATALOG_REVISION='R7B0-CATALOG-2';
export const CATALOG_SHA256='ceee276a424ee7575b4477a2bc429de2e8cd854e3cb82ac767776492cdcb92f9';
export const CATALOG_URL=new URL('../r7/b0/REPERTOIRE_CATALOG_B0.json',import.meta.url);
export const RECORDS_URL=new URL('../../audits/domain-coaching-r7-b0-2026-10-31/reviews/SSCTR_RECHECK_B0.json',import.meta.url);

const readBytes=url=>{try{return fs.readFileSync(url);}catch{return null;}};
const sha256=bytes=>createHash('sha256').update(bytes).digest('hex');
const CATALOG_BYTES=readBytes(CATALOG_URL);
/** The SHA-256 of the catalog file as read; the catalog is used only when it equals the reviewed bytes. */
export const CATALOG_FILE_SHA256=CATALOG_BYTES?sha256(CATALOG_BYTES):null;
export const CATALOG=CATALOG_FILE_SHA256===CATALOG_SHA256?freeze(JSON.parse(CATALOG_BYTES.toString('utf8'))):null;
const RECORD_BYTES=readBytes(RECORDS_URL);
export const RECORDS_FILE_SHA256=RECORD_BYTES?sha256(RECORD_BYTES):null;
const DEFAULT_RECORDS=RECORD_BYTES?(()=>{try{return JSON.parse(RECORD_BYTES.toString('utf8'));}catch{return null;}})():null;

// ---------- authority ----------
export const CANDIDATES=['B0-C01','B0-C02','B0-C03','B0-C04','B0-C05','B0-C06','B0-C07','B0-C08','B0-C09','B0-C10','B0-C11','B0-C12'];
/** Records without which the catalog cannot be the configuration source at all: fidelity, the representation and the contextual roles. The 37
 * B0-origin configurations are admitted only with B0-C03; without it the catalog serves its 39 R6-origin configurations. */
export const CORE_RECORDS=['B0-FIDELITY','B0-C04','B0-C05'];
const ENABLING=new Set(['APPROVE','APPROVE_WITH_CONDITIONS']),EVIDENCE=new Set(['WELL_SUPPORTED','SUPPORTED_WITH_LIMITS']);
/**
 * Per-record activation (fail closed): a record enables its candidate only when it targets this catalog revision and hash, its disposition
 * enables, its evidence status is supported, and the decision date is not after its review-by date. The repertoire is valid only with the
 * catalog bytes and every core record; any other candidate without a record is simply off (its conservative fallback applies). A record bound to
 * this catalog that does not enable (a rejection, a revision request, unsupported evidence) vetoes its candidate whatever else approves it
 * (QE-R7B-10). The decision date is the calendar date of the instant in UTC, whatever offset it is written with (QE-R7B-09).
 */
const utcDayOf=v=>{if(typeof v!=='string')return null;const t=Date.parse(v);return /T/.test(v)&&Number.isFinite(t)?new Date(t).toISOString().slice(0,10):v.slice(0,10);};
export function repertoireAuthority(options={}){
 if(options.repertoire)return options.repertoire;
 const asOf=utcDayOf(options.asOf),records=options.repertoireRecords??DEFAULT_RECORDS,approved={},bound=[],vetoed=new Set();
 for(const r of Array.isArray(records)?records:[]){
  const id=String(r?.review_id??'').replace(/^R7B0-SSCTR-/,'');
  if(!/^B0-(FIDELITY|C\d\d)$/.test(id)||r.target?.sha256!==CATALOG_SHA256||r.target?.artifact_revision!==CATALOG_REVISION)continue;
  if(!ENABLING.has(r.disposition)||!EVIDENCE.has(r.evidence_status)){vetoed.add(id);continue;}
  const reviewBy=typeof r.expiry?.review_by==='string'?r.expiry.review_by:null;
  if(asOf&&reviewBy&&asOf>reviewBy)continue;
  approved[id]=r.disposition;bound.push({id,reviewId:r.review_id,revision:r.review_revision,disposition:r.disposition,evidenceStatus:r.evidence_status,confidence:r.confidence?.level??null,conditionCount:(r.decision?.conditions??[]).length,reviewBy});
 }
 for(const id of vetoed)delete approved[id];
 const valid=!!CATALOG&&CORE_RECORDS.every(id=>approved[id]);
 return {version:R7B_REPERTOIRE_VERSION,valid,catalogRevision:CATALOG?CATALOG.revision:null,catalogSha256:CATALOG_FILE_SHA256,recordsSha256:options.repertoireRecords?hash(options.repertoireRecords):RECORDS_FILE_SHA256,approved,records:bound.filter(b=>!vetoed.has(b.id)).sort((a,b)=>a.id<b.id?-1:1)};
}
export const allowsCandidate=(auth,id)=>!!auth?.valid&&!!auth.approved?.[id];
/** The repertoire authority without a decision date (used when a caller supplies an authority object without one). */
export const DEFAULT_REPERTOIRE=freeze(repertoireAuthority());
/** The repertoire authority a planner or review reads from an R6 authority object (attached at the entry points with the decision date). */
export const repertoireOf=authority=>authority?.repertoire??DEFAULT_REPERTOIRE;
/** The binding a program records (and every review checks): which catalog and which records it was planned under. */
export const repertoireBinding=auth=>({version:R7B_REPERTOIRE_VERSION,catalogRevision:auth?.catalogRevision??null,catalogSha256:auth?.catalogSha256??null,recordsSha256:auth?.recordsSha256??null,approvedCandidates:Object.keys(auth?.approved??{}).sort()});

// ---------- vocabulary ----------
const DEMAND=['NONE','LIGHT','MODERATE','HEAVY'],ORDINAL=['NONE','LOW','MODERATE','HIGH'],SKILL={LOW:0,MODERATE:1,HIGH:2};
export const demandRank=v=>DEMAND.indexOf(v??'NONE');
export const ordinalRank=v=>ORDINAL.indexOf(v??'NONE');
export const skillRank=v=>SKILL[v]??0;
/** Loadings without a kilogram value: reps and reserve only (bodyweight), or an athlete-reported ordinal level (bands, assistance; B0-C04). */
export const NO_KG_LOADING=['BODYWEIGHT','BAND','ASSISTED'];
export const noExternalLoad=entry=>NO_KG_LOADING.includes(entry?.loading);
export const ordinalResistance=entry=>['BAND','ASSISTED'].includes(entry?.loading);
export const NO_KG_CONVENTIONS=['BODYWEIGHT','BAND_TENSION','ASSISTED_BODYWEIGHT'];
/**
 * The smallest load step of a convention (B0-C04 condition 4; B0-F07): a single implement steps by the per-implement step applied to the one
 * implement; bands and assistance never step a load (they progress by repetitions inside the goal range).
 */
export const incrementFor=(S,convention)=>convention==='SINGLE_IMPLEMENT'?(S?.smallestIncrement?.PER_HAND??0):(S?.smallestIncrement?.[convention]??0);
/** Kilogram display of a logged or planned load: per hand for two implements, the one implement's mass otherwise. */
export const kgText=(value,convention)=>`${value} kg${convention==='PER_HAND'?' per hand':convention==='SINGLE_IMPLEMENT'?' (one implement)':''}`;

// ---------- configurations ----------
function entryFrom(cfg){
 return freeze({id:cfg.id,name:cfg.name,pattern:cfg.pattern,subpattern:cfg.sub,region:cfg.region,equipment:[...cfg.eq],loading:cfg.loading,convention:cfg.conv,laterality:cfg.lat,unilateral:cfg.lat==='UNILATERAL',skill:cfg.skill,lowerDemand:cfg.lower,axial:cfg.axial,eccentric:cfg.ecc,primary:[...cfg.prim],secondary:[...cfg.sec],kind:cfg.kind,roles:[...cfg.roles],purposes:[...cfg.purposes],variantOf:cfg.variantOf,origin:cfg.origin,authorityStatus:cfg.authorityStatus});
}
/** Every catalog configuration, B0 representation (conventions, laterality, loading) and admissible contextual roles (DR-134; no universal role). */
export const CONFIGURATIONS=freeze(CATALOG?CATALOG.strength.configurations.map(entryFrom):[]);
const BY_ID=new Map(CONFIGURATIONS.map(e=>[e.id,e]));
export const configurationOf=id=>BY_ID.get(id)??null;
/** B0-origin configurations are admitted only with B0-C03; R6-origin ones are approved-envelope materializations. */
export const admitted=(entry,auth)=>!!entry&&(entry.origin==='R6'||allowsCandidate(auth,'B0-C03'));
export const PRACTICE_FOR=freeze(CATALOG?{...CATALOG.strength.skillLadders.practiceFor}:{});
export const DEFAULT_SUBPATTERN=freeze(CATALOG?{...CATALOG.strength.templateRules.patternDefaultSubpattern}:{});
export const TEMPLATE_DEFS=freeze(CATALOG?Object.fromEntries(CATALOG.strength.templates.map(t=>[t.id.replace(/^TPL\./,''),t])):{});
export const FAMILY_OF_TEMPLATE=freeze(CATALOG?Object.fromEntries(CATALOG.strength.templates.map(t=>[t.id.replace(/^TPL\./,''),t.family])):{});
/** The strength prescription family of a template (the R6 FAMILY_OF the catalog session families materialize; TPL.CORE is light by design). */
export const STRENGTH_PRESCRIPTION_FAMILY=freeze({FULL_A:'FULL_BODY',FULL_B:'FULL_BODY',LOWER:'LOWER',UPPER:'UPPER',LOWER_B:'LOWER',UPPER_B:'UPPER',CORE:'PRACTICE'});
/** Template types by chosen strength-day count (catalog templatesByDayCount, equal to the R6 TYPES): the four-day set plus TPL.CORE per extra day. */
export function templateTypesFor(days){
 const map=CATALOG?.strength.templatesByDayCount??{},list=[...(map[String(Math.min(4,days))]??[])].map(x=>x.replace(/^TPL\./,''));
 for(let i=4;i<days;i++)list.push('CORE');
 return list;
}
/** B0-C08: strength class NONE keeps at most two full templates until the first block boundary; further chosen days carry TPL.CORE. */
export function noviceTemplateTypes(days){const list=templateTypesFor(Math.min(2,days));for(let i=2;i<days;i++)list.push('CORE');return list;}

// ---------- classification (B0-F05) ----------
/**
 * The run-class thresholds of the reviewed runtime binding of R6-COLD-START (catalog classification.runClassSource). They are runtime
 * constants, not policy fields: exposed here with their provenance and never changed; their declaration belongs to the next policy revision.
 */
export const RUN_CLASS_THRESHOLDS=freeze({noviceWeeklyMinutesBelow:45,easyLowWeeklyMinutesBelow:60,easyLowRunDaysBelow:2,longPauseWeeksAtLeast:4,source:'runtime:src/r6-program.mjs assessCapability at R7A-RESIDUAL-AUTHORITY-FREEZE-1 (reviewed runtime binding of R6-COLD-START); catalog classification.runClassSource',policyDeclaration:'PENDING_NEXT_POLICY_REVISION (B0-F05): declare without changing values'});
/** Archetype label of the R6 goal-model lead (B0-C12): no dose, no static priority, no protection rule of its own. */
export function archetypeOf(goal){
 const run=goal?.run?.kind,strength=goal?.strength?.kind;
 const id=strength==='NONE'?'ARCH.RUN_ONLY':run==='NONE'?'ARCH.STRENGTH_ONLY':goal.baseLead==='RUN'?'ARCH.RUN_LED':goal.baseLead==='STRENGTH'?'ARCH.STRENGTH_LED':'ARCH.JOINT';
 const overlays=[...(goal?.run?.event?['EVENT_PREP']:[])];
 return {id,baseLead:goal?.baseLead??null,overlays,phaseLeads:Object.fromEntries(Object.entries(goal?.priorityByPhase??{}).map(([p,v])=>[p,v.lead])),basis:'B0-C12: label of the R6 goal-model lead; adds no dose, priority flag or protection'};
}

// ---------- run families ----------
/** The catalog family and configuration of a run prescription (the binding every planned run carries). */
export function runRepertoireOf(p,{role=null}={}){
 if(!p||p.modality!=='RUN')return null;
 const f=p.family,cfg={WALK:['RUN.WALK','RUNCFG.WALK_CONTINUOUS'],WALK_JOG:['RUN.WALK_JOG','RUNCFG.WALK_JOG_INTERVALS'],EASY:['RUN.EASY','RUNCFG.EASY_CONTINUOUS'],RECOVERY_EASY:['RUN.EASY','RUNCFG.EASY_CONTINUOUS'],SHAKEOUT:['RUN.EASY','RUNCFG.SHAKEOUT'],LONG:['RUN.LONG','RUNCFG.LONG_CONTINUOUS'],THRESHOLD:['RUN.THRESHOLD','RUNCFG.THRESHOLD_INTERVALS'],TEN_K_SPECIFIC:['RUN.EVENT_SPECIFIC','RUNCFG.TEN_K_SPECIFIC_INTERVALS'],HALF_MARATHON_SPECIFIC:['RUN.EVENT_SPECIFIC','RUNCFG.HALF_MARATHON_SPECIFIC_INTERVALS'],RACE_TOUCH:['RUN.RACE_TOUCH','RUNCFG.RACE_TOUCH_INTERVALS'],RACE:[ 'RUN.RACE',p.completion?'RUNCFG.RACE_COMPLETION':'RUNCFG.RACE_EFFORT'],FAMILIAR_REPEATED_BOUTS:['RUN.FAMILIAR_REPEATED_BOUTS','RUNCFG.FAMILIAR_REPEATED_BOUTS']}[f];
 if(!cfg)return null;
 const method=p.calibration?.basis==='CURRENT_FAMILIAR_TASK'&&p.target?'FAMILIAR_FIELD_SESSION_TARGET':'EFFORT_CUE';
 return {family:cfg[0],configuration:cfg[1],intensityMethod:method,...(p.strides?{components:['RUN.STRIDES']}:{}),...(role==='RESTART'||role==='RETURN'?{purpose:role}:{})};
}
export const KEY_RUN_FAMILIES=['THRESHOLD','TEN_K_SPECIFIC','HALF_MARATHON_SPECIFIC','RACE_TOUCH','LONG','RACE','FAMILIAR_REPEATED_BOUTS'];
/** The runs CMP.I11 protects: the long run and the week's quality KEY run (threshold, event-specific or B0-C02 familiar bouts); the race stays under CMP.I01/P06. */
export const I11_PROTECTED_FAMILIES=['LONG','THRESHOLD','TEN_K_SPECIFIC','HALF_MARATHON_SPECIFIC','FAMILIAR_REPEATED_BOUTS'];
/** Later-gate items (B0-C10): never prescribed; their fallback is used and disclosed as a different stimulus. */
export const LATER_GATE=freeze(CATALOG?CATALOG.laterGate.map(x=>({...x})):[]);
export const laterGateItem=id=>LATER_GATE.find(x=>x.id===id)??null;
/** A familiar run task category that no V1 family covers (B0-C02 condition 1, B0-C10 condition 5). */
export const LATER_GATE_RUN_CATEGORIES=freeze({SHORT_INTERVALS:'LATER.RUN.SHORT_INTERVALS_SPEED',SPEED:'LATER.RUN.SHORT_INTERVALS_SPEED',HILLS:'LATER.RUN.HILL_REPEATS',HILL_REPEATS:'LATER.RUN.HILL_REPEATS',TIME_TRIAL:'LATER.RUN.FITNESS_TEST_TIME_TRIAL',RACE_SIMULATION:'LATER.RUN.FITNESS_TEST_TIME_TRIAL',FARTLEK:'LATER.RUN.FARTLEK_PROGRESSION_RUN',PROGRESSION_RUN:'LATER.RUN.FARTLEK_PROGRESSION_RUN',STEADY:'LATER.RUN.STEADY',CONTINUOUS_TEMPO:'LATER.RUN.CONTINUOUS_TEMPO',TEMPO:'LATER.RUN.CONTINUOUS_TEMPO'});

const THRESHOLD_LIKE=['THRESHOLD','CRUISE','TEN_K_SPECIFIC','HALF_MARATHON_SPECIFIC'],EASY_LIKE=['EASY','LONG','RECOVERY_EASY','WALK','WALK_JOG','STRIDES','SHAKEOUT','RESTART'];
const VO2_STYLE=['VO2_STYLE','VO2_STYLE_INTERVALS','REPEATED_BOUTS'];
/**
 * The category of a current familiar run task: THRESHOLD_LIKE (the R6 QUALITY_FAMILIAR families, unchanged), VO2_STYLE (ACF-G05 minutes-long
 * repeated harder bouts: B0-C02), LATER_GATE (short intervals, hills, time trial, race simulation, steady, tempo: B0-C10), EASY_LIKE, or
 * AMBIGUOUS (asked about, never guessed: B0-C02 condition 1).
 */
export function familiarRunCategory(t){
 const cat=String(t?.category??'').toUpperCase(),fam=String(t?.prescription?.family??'').toUpperCase();
 if(THRESHOLD_LIKE.includes(fam))return 'THRESHOLD_LIKE';
 if(VO2_STYLE.includes(cat)||VO2_STYLE.includes(fam))return 'VO2_STYLE';
 if(LATER_GATE_RUN_CATEGORIES[cat]||LATER_GATE_RUN_CATEGORIES[fam])return 'LATER_GATE';
 if(EASY_LIKE.includes(fam)&&!cat)return 'EASY_LIKE';
 return 'AMBIGUOUS';
}
export const laterGateRunItem=t=>LATER_GATE_RUN_CATEGORIES[String(t?.category??'').toUpperCase()]??LATER_GATE_RUN_CATEGORIES[String(t?.prescription?.family??'').toUpperCase()]??null;
/**
 * The SSCTR-R2-P14 inputs a familiar VO2-style task needs before it may continue (B0-C02 condition 1): the exact recipe, a current target with
 * its method, construct and provenance, same-task dose and tolerated response history, comparable conditions and known tolerance. Returns
 * the missing ones; an empty list means the task is fully specified (currency is the intake definition: current, familiar, tolerated, ≤ 28 days).
 */
export function familiarBoutsInputs(t){
 const missing=[],p=t?.prescription,w=p?.work,tg=t?.target,method=String(tg?.method??'').toUpperCase();
 if(!(Number.isInteger(w?.repetitions)&&w.repetitions>=2&&w.workMinutes>0&&w.recoveryMinutes>=0))missing.push('recipe.work');
 if(!(Number.isFinite(p?.durationMinutes)&&p.durationMinutes>0))missing.push('recipe.durationMinutes');
 if(!['PACE','TALK_RPE'].includes(method))missing.push('target.method');
 if(tg?.construct!=='FIELD_SESSION_TARGET')missing.push('target.construct');
 if(typeof tg?.provenance!=='string'||!tg.provenance.trim())missing.push('target.provenance');
 if(method==='PACE'&&!(tg?.paceSecondsPerKm>0))missing.push('target.paceSecondsPerKm');
 if(!(Number.isInteger(t?.history?.sameTaskExposures)&&t.history.sameTaskExposures>=1)||t?.history?.response!=='TOLERATED')missing.push('history.sameTask');
 if(t?.conditions?.comparable!==true)missing.push('conditions.comparable');
 if(t?.tolerated!==true)missing.push('tolerance');
 return missing;
}

// ---------- relations ----------
const sharesPrimary=(a,b)=>a.primary.some(m=>b.primary.includes(m));
const withinOneStep=(a,b)=>Math.abs(demandRank(a.lowerDemand)-demandRank(b.lowerDemand))<=1&&Math.abs(ordinalRank(a.axial)-ordinalRank(b.axial))<=1&&Math.abs(ordinalRank(a.eccentric)-ordinalRank(b.eccentric))<=1;
const SUBPATTERN_GROUPS=CATALOG?.strength.rotation.subpatternGroups??{};
const sameGroup=(pattern,a,b)=>a===b||(SUBPATTERN_GROUPS[pattern]??[]).some(g=>g.includes(a)&&g.includes(b));
/** Directed close variation A → B (B0-C06): a ranking relation only; it grants no permission and never exempts a MAIN from block stability. */
export function closeVariation(a,b,role=null){
 if(!a||!b||a.id===b.id||a.pattern!==b.pattern||a.subpattern!==b.subpattern||!sharesPrimary(a,b)||skillRank(b.skill)>skillRank(a.skill)||!withinOneStep(a,b))return false;
 return role===null||a.roles.includes(role)&&b.roles.includes(role);
}
/**
 * Admissible rotation alternative (B0-C06 condition 1): same slot pattern with the same subpattern, a subpattern of the same rotation group, or
 * a listed goal-context alternative pattern; a shared primary muscle; lower, axial and eccentric classes within one step; equipment, skill and
 * the slot role admissible. The arrangement-cost condition is checked where the week is composed (it needs the week).
 */
export function admissibleAlternative(current,candidate,{role,goalPatterns=[],available=null,skillOk=()=>true,auth=null}={}){
 if(!current||!candidate||current.id===candidate.id||!admitted(candidate,auth))return false;
 const shape=candidate.pattern===current.pattern&&sameGroup(current.pattern,current.subpattern,candidate.subpattern)||goalPatterns.includes(candidate.pattern);
 if(!shape||!sharesPrimary(current,candidate)||!withinOneStep(current,candidate)||!candidate.roles.includes(role))return false;
 if(available&&!candidate.equipment.every(q=>available.has(q)))return false;
 return skillOk(candidate);
}
const LADDERS=freeze(CATALOG?CATALOG.strength.skillLadders.progressionOf.map(c=>[...c]):[]);
export const SKILL_LADDERS=LADDERS;
/** The next configurations on the skill ladders (B0-C07), one step, never skipping a chain step. */
export const ladderNext=id=>[...new Set(LADDERS.flatMap(c=>{const i=c.indexOf(id);return i>=0&&i<c.length-1?[c[i+1]]:[];}))];
/** The previous configurations on the skill ladders: the SKILL_MISMATCH regression along the chain. */
export const ladderPrevious=id=>[...new Set(LADDERS.flatMap(c=>{const i=c.indexOf(id);return i>0?[c[i-1]]:[];}))];
/** Every configuration below `id` on the chains that contain it (B0-C07): what an athlete who reached `id` has stepped past. */
export const ladderBelow=id=>[...new Set(LADDERS.flatMap(c=>{const i=c.indexOf(id);return i>0?c.slice(0,i):[];}))];
/** The rungs below `id`, nearest first (the previous rungs, then theirs): the order of a SKILL_MISMATCH regression along its chains. */
export function ladderDown(id){const out=[];let frontier=[id];while(frontier.length){const next=[...new Set(frontier.flatMap(ladderPrevious))].filter(x=>x!==id&&!out.includes(x));out.push(...next);frontier=next;}return out;}
/**
 * The direction of a SKILL_MISMATCH (catalog strength.substitution: "the previous configuration on its skill ladder"; B0-C07 condition 1): once
 * `aside` is set aside because it cannot be done with steady technique, a configuration follows that reason only when it is a rung below it on a
 * ladder or of a lower skill, and never of a higher skill than `inUse`, the substitute the decision selected (QE-R7B-R2-03: losing equipment never
 * raises the skill demand).
 */
export const followsSkillMismatch=(aside,e,inUse=null)=>!!aside&&!!e&&e.id!==aside.id&&(ladderBelow(aside.id).includes(e.id)||skillRank(e.skill)<skillRank(aside.skill))&&skillRank(e.skill)<=skillRank((inUse??aside).skill);
/** A ladder link that changes the subpattern (push-up → pike-push-up) is a variation, not a progression of the same movement (B0-C07 condition 6). */
export const ladderChangesSubpattern=(from,to)=>{const a=configurationOf(from),b=configurationOf(to);return !!a&&!!b&&a.subpattern!==b.subpattern;};

// ---------- rotation eligibility (DR-134, B0-C06) ----------
export const ROTATION_DEFERRED_PHASES=freeze(CATALOG?[...CATALOG.strength.rotation.deferredPhases]:['ESTABLISHMENT','SPECIFIC','TAPER','RACE_WEEK','POST_EVENT']);
/** Effective rotation eligibility of a contextual role: REASON_ONLY in deferred phases and while returning; the preference mapping otherwise. */
export function rotationEligibility(preference,role,{phase=null,returning=false,hasAlternative=false}={}){
 if(returning||ROTATION_DEFERRED_PHASES.includes(phase)||preference==='FIXED'||role==='PRACTICE')return 'REASON_ONLY';
 if(role==='MAIN')return 'BLOCK_BOUNDARY_ELIGIBLE';
 return preference==='EVERY_2_WEEKS'&&hasAlternative?'TWO_WEEK_ELIGIBLE':'BLOCK_BOUNDARY_ELIGIBLE';
}

// ---------- template selection (B0-C05, B0-C09, catalog templateRules) ----------
/** The reasons of a reason-based substitution (catalog strength.substitution; DR-134): the configuration they replace is set aside. */
export const REASON_BASED_SUBSTITUTION=freeze(['SKILL_MISMATCH','NONCLINICAL_DISCOMFORT_OR_PREFERENCE']);
const GOAL_PURPOSE={STRENGTH:'STRENGTH_DEVELOPMENT',HYPERTROPHY:'HYPERTROPHY',RUNNING_SUPPORT:'RUNNING_SUPPORT',GENERAL:'GENERAL',MAINTAIN:'GENERAL'};
/** The goal-context keys in force (catalog goalContextKeys): HYPERTROPHY or RUNNING_SUPPORT by strength goal; EVENT when a 10K/half marathon is programmed. */
export function goalContextKeys(goal){
 const keys=[];if(goal?.strength?.kind==='HYPERTROPHY')keys.push('HYPERTROPHY');if(goal?.strength?.kind==='RUNNING_SUPPORT')keys.push('RUNNING_SUPPORT');if(goal?.run?.event)keys.push('EVENT');
 return keys;
}
const byCode=(a,b)=>a<b?-1:a>b?1:0;
/**
 * Deterministic selection order (catalog templateRules.selectionOrder, an IMPLEMENTATION_CHOICE with no dose or admissibility effect): familiar,
 * established in this program, purpose matching the goal context, the slot's default subpattern (or the one an alternation asks for), external
 * loading, higher admissible skill, R6 origin, id.
 */
export function selectionCompare(ctx,preferredSubpattern){
 const k=e=>[ctx.familiar.has(e.id)?0:1,ctx.established.has(e.id)?0:1,e.purposes.some(p=>ctx.purposes.has(p))?0:1,preferredSubpattern&&e.subpattern!==preferredSubpattern?1:0,e.loading==='EXTERNAL'?0:1,-skillRank(e.skill),e.origin==='R6'?0:1];
 return (a,b)=>{const x=k(a),y=k(b);for(let i=0;i<x.length;i++)if(x[i]!==y[i])return x[i]-y[i];return byCode(a.id,b.id);};
}
/**
 * The strength templates of a week, one per chosen strength day (catalog templates = the R6 TYPES/SLOTS, B0-C05 goal context, B0-C09 coverage).
 * Each slot takes the best admissible configuration: equipment available, skill admissible (familiar or ladder-reached for HIGH), its admissible
 * roles including the slot role (DR-134: the row's role is the slot's), MAIN subpatterns respected, used once per session. Goal-context accessory
 * slots replace (never add) the slot pattern with one listed alternative pattern, distributed across the listed patterns within the week; the calf
 * slots alternate straight and bent knee keeping the straight-knee default (single exposure) and at most half bent-knee. A MAIN PULL slot with no
 * MAIN-admissible configuration takes the best ACCESSORY-admissible pull as an ACCESSORY row with the PULL_LIMITED_FOR_EQUIPMENT disclosure.
 * Selection directives (athlete-stated or block-boundary choices with a recorded reason) replace a configuration in its slot when the
 * replacement is admissible there; configurations an athlete set aside for a reason are never selected or rotated back.
 */
export function buildTemplates({types,equipment=[],experience='NOVICE',knownExercises=[],established=[],goal,auth,knownOnly=false,emphasis=[],selections=[],ladderReached=[]}){
 const available=new Set([...equipment,'BODYWEIGHT']),familiar=new Set(knownExercises.filter(k=>k.familiar!==false).map(k=>k.id)),withDose=new Set(knownExercises.filter(k=>k.dose).map(k=>k.id));
 const reached=new Set([...ladderReached,...selections.filter(s=>s.reason==='SKILL_PROGRESSION'&&s.to).map(s=>s.to)]),setAside=new Set(selections.filter(s=>s.setAside!==false&&REASON_BASED_SUBSTITUTION.includes(s.reason)).map(s=>s.from));
 const maxSkill=['NONE','NOVICE'].includes(experience)?0:1,skillOk=e=>familiar.has(e.id)||reached.has(e.id)||skillRank(e.skill)<=maxSkill;
 // A configuration below a reached one on the same skill ladder (B0-C07) is never a calendar alternative: stepping back along a chain is a
 // reason-based substitution (SKILL_MISMATCH), never rotation (QE-R7B-02, Q-R7B-01).
 const surpassed=new Set([...reached].flatMap(ladderBelow));
 const contextKeys=goalContextKeys(goal),purposes=new Set([GOAL_PURPOSE[goal?.strength?.kind]??'GENERAL']),accessoryPurposes=new Set([...purposes,...(contextKeys.includes('EVENT')||goal?.strength?.kind==='RUNNING_SUPPORT'?['RUNNING_SUPPORT']:[])]);
 const order=(rolePurposes,sub)=>selectionCompare({familiar,established:new Set(established),purposes:rolePurposes},sub);
 const emph=new Set(emphasis.map(x=>String(x).toUpperCase())),disclosures=[];
 const usable=(e,role,{pattern,subpatterns=null,used,aside=false})=>e.pattern===pattern&&(!subpatterns||subpatterns.includes(e.subpattern))&&admitted(e,auth)&&e.equipment.every(q=>available.has(q))&&e.roles.includes(role)&&skillOk(e)&&!used.has(e.id)&&(aside||!setAside.has(e.id))&&(!knownOnly||noExternalLoad(e)||withDose.has(e.id));
 // Goal-context alternation across the week: count of listed alternative patterns chosen, and the calf exposures with their alternation.
 const altCount={},defs=types.map(t=>TEMPLATE_DEFS[t]),calfSlots=defs.flatMap((d,ti)=>(d?.slots??[]).map((s,si)=>({ti,si,s})).filter(x=>x.s.pattern==='CALF'));
 const alternating=calfSlots.filter(x=>contextKeys.some(k=>x.s.goalContext?.[k]?.alternateSubpatterns)),bentAllowed=calfSlots.length>=2?Math.floor(calfSlots.length/2):0;
 const calfSub=new Map();let bent=0;
 alternating.forEach((x,i)=>{const want=i%2===1&&bent<bentAllowed?'BENT_KNEE':'STRAIGHT_KNEE';if(want==='BENT_KNEE')bent++;calfSub.set(x.ti+':'+x.si,want);});
 const templates=defs.map((def,index)=>{
  const used=new Set(),rows=[],missing=[],missingLimits={},asideGaps=[];
  (def?.slots??[]).forEach((slot,si)=>{
   const role=slot.role,rolePurposes=role==='ACCESSORY'?accessoryPurposes:purposes;
   // A goal-context slot (B0-C05): the listed alternative pattern least chosen so far this week that has an admissible configuration.
   const ctxDef=contextKeys.map(k=>slot.goalContext?.[k]).find(Boolean)??null;
   let pattern=slot.pattern,preferred=DEFAULT_SUBPATTERN[slot.pattern]??null,goalPatterns=[];
   if(ctxDef?.alternativePatterns){
    goalPatterns=ctxDef.alternativePatterns;
    const viable=ctxDef.alternativePatterns.filter(p=>CONFIGURATIONS.some(e=>usable(e,role,{pattern:p,used})));
    const pick=[...viable].sort((a,b)=>(altCount[a]??0)-(altCount[b]??0)||ctxDef.alternativePatterns.indexOf(a)-ctxDef.alternativePatterns.indexOf(b))[0];
    if(pick){pattern=pick;altCount[pick]=(altCount[pick]??0)+1;preferred=DEFAULT_SUBPATTERN[pick]??null;}
   }
   if(slot.pattern==='CALF'&&calfSub.has(index+':'+si))preferred=calfSub.get(index+':'+si);
   // `keep` narrows the candidates (the direction of a SKILL_MISMATCH fallback, QE-R7B-R2-03), in the MAIN list and in its B0-C09 downgrade alike.
   const optionsFor=(aside,keep=()=>true)=>{
    let list=CONFIGURATIONS.filter(e=>usable(e,role,{pattern,subpatterns:slot.subpatterns??null,used,aside})&&keep(e)).sort(order(rolePurposes,preferred)),r=role,down=false;
    // B0-C09: a MAIN pull slot without a MAIN-admissible pull takes the best ACCESSORY-admissible pull, as an ACCESSORY row, disclosed.
    if(!list.length&&role==='MAIN'&&pattern==='PULL'&&allowsCandidate(auth,'B0-C09')){const within=e=>(slot.subpatterns??[]).includes(e.subpattern)?0:1,cmp=order(accessoryPurposes,preferred);list=CONFIGURATIONS.filter(e=>usable(e,'ACCESSORY',{pattern,used,aside})&&keep(e)).sort((a,b)=>within(a)-within(b)||cmp(a,b));if(list.length){r='ACCESSORY';down=true;}}
    return {list,r,down};
   };
   // Selection directives (QE-R7B-01): the slot's natural pick, as if nothing had been set aside, then every recorded decision on it in the order
   // it was made (ladder step, MAIN change, reason-based substitution), each applied when its configuration fits the slot (pattern, MAIN
   // subpatterns, role, equipment, skill or ladder reach). A set-aside configuration is only a step on the way: the result never is one; if no
   // decision moves the slot off it, the slot takes its best configuration not set aside.
   const open=optionsFor(false),natural=setAside.size?optionsFor(true):open;
   const options=open.list;
   let rowRole=natural.r,downgraded=natural.down,pick=natural.list[0]??null,directive=null,fallbackFor=null;
   const fits=to=>!!to&&admitted(to,auth)&&to.roles.includes(rowRole)&&to.equipment.every(q=>available.has(q))&&skillOk(to)&&!used.has(to.id)&&(to.pattern===pick.pattern||to.pattern===slot.pattern)&&(rowRole!=='MAIN'||!slot.subpatterns||slot.subpatterns.includes(to.subpattern))&&(!knownOnly||noExternalLoad(to)||withDose.has(to.id));
   // A decision names the slots where its configuration was in use (rotation included); one without them applies where the slot picks it.
   const located=d=>Array.isArray(d.slots)&&d.slots.some(x=>x?.template===types[index]&&x?.slot===si);
   // Every SKILL_MISMATCH decision on this slot sets the direction a later fallback of the slot must follow (QE-R7B-R2-03).
   const mismatch=[];
   for(const d of selections){if(!pick||!d.to||d.to===pick.id||d.from!==pick.id&&!located(d))continue;const to=configurationOf(d.to);if(d.reason==='SKILL_MISMATCH'&&setAside.has(d.from)&&configurationOf(d.from))mismatch.push({aside:configurationOf(d.from),inUse:to});if(!fits(to))continue;pick=to;directive={reason:d.reason,from:d.from,since:d.fromWeek??null};}
   // The slot ends on a configuration set aside and no decision moves it off (the substitute no longer fits: its equipment went). The fallback follows
   // the direction of the reason (QE-R7B-R2-03): after a SKILL_MISMATCH a rung below on its ladder (nearest first) or a lower skill, never above the
   // substitute the decision selected; without one the slot stays unfilled (asideGaps), so the decision that removed the equipment asks. After a
   // nonclinical preference, the slot's best configuration not set aside, as before. The row records what it stands in for (fallbackFor; OBS-04).
   if(pick&&setAside.has(pick.id)){
    const from=pick,reason=selections.findLast(s=>s.from===from.id&&s.setAside!==false&&REASON_BASED_SUBSTITUTION.includes(s.reason))?.reason??null;
    const fb=mismatch.length?optionsFor(false,e=>mismatch.every(m=>followsSkillMismatch(m.aside,e,m.inUse))):open;
    if(mismatch.length){const down=ladderDown(mismatch.at(-1).aside.id),rank=e=>{const i=down.indexOf(e.id);return i<0?Infinity:i;};fb.list.sort((a,b)=>rank(a)-rank(b));}
    pick=fb.list[0]??null;rowRole=fb.r;downgraded=fb.down;directive=null;fallbackFor={from:from.id,reason};
    if(!pick&&mismatch.length)asideGaps.push({slot:si,pattern:slot.pattern,setAside:from.id,substitute:mismatch.at(-1).inUse?.id??null,reason:'SKILL_MISMATCH'});
   }
   // Q-R7B-07: what limits an unfilled or downgraded slot, skill or equipment: skill when a configuration that fits the equipment and the role
   // fails only the skill gate.
   const fitsSlot=(e,r)=>e.pattern===pattern&&(!slot.subpatterns||slot.subpatterns.includes(e.subpattern))&&admitted(e,auth)&&e.roles.includes(r);
   const skillLimited=r=>CONFIGURATIONS.some(e=>fitsSlot(e,r)&&e.equipment.every(q=>available.has(q))&&!skillOk(e));
   const helpFor=r=>[...new Set(CONFIGURATIONS.filter(e=>fitsSlot(e,r)&&skillOk(e)&&!e.equipment.every(q=>available.has(q))).flatMap(e=>e.equipment.filter(q=>!available.has(q))))].sort();
   if(!pick){missing.push(slot.pattern);missingLimits[slot.pattern]=asideGaps.some(g=>g.slot===si)?'SKILL':helpFor(role).length?'EQUIPMENT':skillLimited(role)?'SKILL':'EQUIPMENT';return;}
   used.add(pick.id);
   const alternatives=options.filter(o=>o.id!==pick.id&&!surpassed.has(o.id)&&admissibleAlternative(pick,o,{role:rowRole,goalPatterns,available,skillOk,auth})).slice(0,3).map(o=>o.id);
   rows.push({slot:si,pattern:pick.pattern,slotPattern:slot.pattern,role:rowRole,entry:clone(pick),alternatives,emphasized:emph.has(pick.pattern)||emph.has(slot.pattern)||emph.has(pick.region),...(pattern!==slot.pattern?{goalContextPattern:pattern}:{}),...(slot.pattern==='CALF'&&calfSub.has(index+':'+si)?{calfAlternation:calfSub.get(index+':'+si)}:{}),...(downgraded?{downgradedFrom:'MAIN',coverage:'PULL_LIMITED_FOR_EQUIPMENT',limit:skillLimited('MAIN')?'SKILL':'EQUIPMENT',addEquipment:helpFor('MAIN')}:{}),...(directive?{directive}:{}),...(fallbackFor?{fallbackFor}:{}),familiar:familiar.has(pick.id)});
  });
  rows.sort((x,y)=>Number(y.role==='MAIN')-Number(x.role==='MAIN')||Number(y.emphasized)-Number(x.emphasized)||x.slot-y.slot);
  return {index,type:types[index],templateId:'TPL.'+types[index],family:STRENGTH_PRESCRIPTION_FAMILY[types[index]]??null,sessionFamily:FAMILY_OF_TEMPLATE[types[index]]??null,rows,missingPatterns:missing,missingLimits,...(asideGaps.length?{asideGaps}:{})};
 });
 return templates;
}
/** Computed from the rows actually selected (B0-C09): only when a pull row stands in for a MAIN pull. Never claims equivalence. */
export function pullCoverageDisclosure(templates){
 const rows=templates.flatMap(t=>t.rows).filter(r=>r.coverage==='PULL_LIMITED_FOR_EQUIPMENT');
 if(!rows.length)return null;
 const ids=[...new Set(rows.map(r=>r.entry.id))],help=[...new Set(rows.flatMap(r=>r.addEquipment??[]))].sort(),skill=rows.some(r=>r.limit==='SKILL');
 // Q-R7B-07: the disclosure says whether skill or equipment is the limit, and offers only the equipment that would add a loaded row or pull-down
 // at the athlete's skill level.
 const add=help.includes('BANDS')?'Add a band':help.length?'Add equipment for a loaded row or pull-down':null;
 return {id:'PULL_LIMITED_FOR_EQUIPMENT',blocking:false,informational:true,limit:skill?'SKILL':'EQUIPMENT',exercises:ids,...(help.length?{addEquipment:help}:{}),detail:(skill?'The rows and pull-downs your equipment allows need more practice first':'No loaded row or pull-down fits the equipment you have')+', so the pull work is '+ids.join(', ')+': a lower, different stimulus than a loaded row or pull-down, not an equivalent'+(skill?'; harder pulls come through their skill ladder at block reviews':''),options:[...(add?[add]:[]),'Accept limited pull work']};
}
/** Bodyweight or band rows that cannot approach the prescribed reserve at a load-mode goal's repetitions (B0-C03 condition 6, B0-C09 condition 4). */
export function lowerStimulusDisclosure(templates,goalDose){
 if(goalDose?.mode!=='LOAD')return null;
 const ids=[...new Set(templates.flatMap(t=>t.rows).filter(r=>r.role==='MAIN'&&noExternalLoad(r.entry)&&r.entry.kind!=='PRACTICE').map(r=>r.entry.id))];
 if(!ids.length)return null;
 return {id:'BODYWEIGHT_LOWER_STIMULUS',blocking:false,informational:true,exercises:ids,detail:`At this goal's low repetitions, ${ids.join(', ')} may not get close to the reps in reserve shown: a lower stimulus than a loaded alternative of the same pattern. Added load on bodyweight exercises is not part of V1`,options:['Keep these exercises','Add equipment for a loaded alternative']};
}
/** CMP.I11 (B0-C11): a lower-body configuration that is HIGH eccentric, or in its first or re-establishment exposure. */
export const novelOrEccentricLower=row=>{const e=configurationOf(row?.id);const lower=e?e.region==='LOWER':['SQUAT','HINGE','LUNGE','CALF'].includes(String(row?.pattern??'').toUpperCase());return !!lower&&(e?.eccentric==='HIGH'||row?.firstExposure===true||['FIRST_ESTABLISH','REESTABLISH'].includes(row?.exposure?.kind));};
/** Muscle counting is descriptive only (B0-C04 condition 3): never sets, gates or judges weekly volume. */
export const MUSCLE_COUNTING_DESCRIPTIVE_ONLY=true;
