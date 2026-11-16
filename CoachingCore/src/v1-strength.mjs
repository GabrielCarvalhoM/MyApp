import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {freeze} from './value.mjs';
import {CATALOG,CATALOG_REVISION,CATALOG_SHA256,CATALOG_FILE_SHA256,configurationOf} from './r7b-repertoire.mjs';

/**
 * CoachingCore V1 Strength Extension (Founder request of 2026-11-16; Strength Intelligence Foundation of 2026-11-13, SI-V1-SSCTR-SQ-1 to SQ-4):
 * four corrections of the strength module the bound repertoire already runs. It is no second selector and adds no dose.
 * - V1X-STRENGTH-HOLD-DOSE (SQ-1): a configuration whose dose is a hold is not admitted anywhere while no time dose is approved.
 * - V1X-STRENGTH-UPPER-LOADING (SQ-2): in an upper-body slot where RUNNING_SUPPORT is a matching purpose, external loading ranks before purpose.
 * - V1X-STRENGTH-PLANE (SQ-4): with two MAIN slots of PUSH (or PULL) that admit both planes, a new plan asks the second for the vertical plane,
 *   unless the plan opens with movement practice; a plan in force keeps each slot as it was built.
 * - V1X-STRENGTH-EXPOSURE (SQ-3): a descriptive count of working sets per primary muscle, planned and executed. Nothing reads it.
 * The first three act inside the repertoire's own selection (src/r7b-repertoire.mjs reads the rules this module hands over; it reads nothing
 * else of this file). The values are CoachingCore/v1/STRENGTH_EXTENSION_V1.json, used only as the pinned bytes and only over the catalog bytes
 * they bind; each boundary is on only with an independent SSCTR record bound to those bytes. Off, everything is as before.
 * This module imports no engine: the composed entry point (v1-strength-index.mjs) hands it plain data.
 */
export const STRENGTH_EXTENSION_ID='V1X-STRENGTH-1';
export const STRENGTH_VALUES_SHA256='06d4731de7cf748adf53ff4b88bdffcfe14200ee69c9d8cd1d86257c0d749b33';
export const STRENGTH_VALUES_URL=new URL('../v1/STRENGTH_EXTENSION_V1.json',import.meta.url);
export const STRENGTH_RECORDS_URL=new URL('../../audits/v1-strength-corrections-2026-11-16/candidate/reviews/ssctr/SSCTR_V1STR_RECORDS.json',import.meta.url);
export const STRENGTH_BOUNDARIES=freeze({HOLD:'V1X-STRENGTH-HOLD-DOSE',UPPER:'V1X-STRENGTH-UPPER-LOADING',PLANE:'V1X-STRENGTH-PLANE',EXPOSURE:'V1X-STRENGTH-EXPOSURE'});
/** The boundaries that change which configuration a slot takes: a plan records the ones it was built under. */
export const SELECTION_BOUNDARIES=freeze(['HOLD','UPPER','PLANE']);
export const STRENGTH_EXPOSURE_VERSION='V1X-STRENGTH-EXPOSURE-1';

const readBytes=url=>{try{return fs.readFileSync(url);}catch{return null;}};
const sha256=bytes=>createHash('sha256').update(bytes).digest('hex');
const parse=bytes=>{try{return JSON.parse(bytes.toString('utf8'));}catch{return null;}};
const isObj=o=>!!o&&typeof o==='object'&&!Array.isArray(o);
const BYTES=readBytes(STRENGTH_VALUES_URL);
export const STRENGTH_VALUES_FILE_SHA256=BYTES?sha256(BYTES):null;
/**
 * The values of a file's bytes, only when they are the pinned bytes, bind the catalog bytes in use, and say what the runtime does: every hold
 * configuration and every plane is one the catalog has, and the upper-loading scope is the one the selection applies.
 */
function shaped(v){
 if(!isObj(v)||!isObj(v.binds)||!isObj(v.holdDose)||!isObj(v.upperLoading)||!isObj(v.exposure)||!isObj(v.planeAlternation)||!isObj(v.planeAlternation.patterns))return false;
 if(v.binds.catalogRevision!==CATALOG_REVISION||v.binds.catalogSha256!==CATALOG_SHA256||CATALOG_FILE_SHA256!==CATALOG_SHA256||!CATALOG)return false;
 const holds=v.holdDose.configurations,planes=Object.entries(v.planeAlternation.patterns),defaults=CATALOG.strength.templateRules.patternDefaultSubpattern;
 if(!Array.isArray(holds)||!holds.length||!holds.every(id=>typeof id==='string'&&!!configurationOf(id))||v.holdDose.timeDose!==null)return false;
 if(!Array.isArray(v.holdDose.knownLimitations)||!v.holdDose.knownLimitations.length||!v.holdDose.knownLimitations.every(x=>isObj(x)&&typeof x.id==='string'&&typeof x.detail==='string'))return false;
 if(v.upperLoading.region!=='UPPER'||v.upperLoading.matchingPurpose!=='RUNNING_SUPPORT')return false;
 if(!planes.length||!planes.every(([p,sub])=>typeof sub==='string'&&typeof defaults[p]==='string'&&sub!==defaults[p]&&CATALOG.strength.configurations.some(e=>e.pattern===p&&e.sub===sub)))return false;
 return Array.isArray(v.exposure.consumers)&&v.exposure.consumers.length===0;
}
export const strengthValuesOf=bytes=>{if(!bytes||sha256(bytes)!==STRENGTH_VALUES_SHA256)return null;const v=parse(bytes);return shaped(v)?freeze(v):null;};
export const STRENGTH_VALUES=strengthValuesOf(BYTES);
const RECORD_BYTES=readBytes(STRENGTH_RECORDS_URL),DEFAULT_RECORDS=RECORD_BYTES?parse(RECORD_BYTES):null;
const ENABLING=new Set(['APPROVE','APPROVE_WITH_CONDITIONS']),EVIDENCE_OK=new Set(['WELL_SUPPORTED','SUPPORTED_WITH_LIMITS']);
/**
 * Per-boundary activation (fail closed): a boundary is on only when the values file is the pinned bytes over the bound catalog and every
 * independent SSCTR record bound to that hash for the boundary enables it with supported evidence and at least one source. With no record file
 * every boundary is off. `options.strengthExtension` supplies an authority directly (development and tests only).
 */
export function strengthAuthority(options={}){
 if(options?.strengthExtension)return options.strengthExtension;
 const records=options?.strengthRecords??DEFAULT_RECORDS,approved={},used=[];
 if(STRENGTH_VALUES)for(const id of Object.values(STRENGTH_BOUNDARIES)){
  const all=(Array.isArray(records?.records)?records.records:[]).filter(r=>r?.boundaryId===id&&r.extensionSha256===STRENGTH_VALUES_SHA256);
  const ok=all.length>0&&all.every(r=>r.independent===true&&ENABLING.has(r.disposition)&&EVIDENCE_OK.has(r.evidenceStatus)&&Array.isArray(r.sourceIds)&&r.sourceIds.length>0);
  if(ok){approved[id]=true;used.push(...all.map(r=>({boundaryId:id,disposition:r.disposition,evidenceStatus:r.evidenceStatus,conditions:r.conditions??[],reviewId:r.reviewId??null})));}
 }
 return freeze({id:STRENGTH_EXTENSION_ID,valid:!!STRENGTH_VALUES,sha256:STRENGTH_VALUES?STRENGTH_VALUES_SHA256:null,approved,records:used,values:STRENGTH_VALUES,source:'CURRENT_INDEPENDENT_REVIEW'});
}
/** A development authority: the named boundaries on over the values file as read (tests and simulations only, never an integration). */
export function devStrength(enabled=Object.values(STRENGTH_BOUNDARIES),values=null){
 const v=values??(()=>{const x=BYTES?parse(BYTES):null;return shaped(x)?freeze(x):null;})();
 return freeze({id:STRENGTH_EXTENSION_ID,valid:!!v,sha256:STRENGTH_VALUES_FILE_SHA256,approved:Object.fromEntries(enabled.map(id=>[id,true])),records:enabled.map(id=>({boundaryId:id,disposition:'DEV_TEST_ONLY'})),values:v,source:'DEV_TEST_ONLY'});
}
export const allowsStrength=(ext,name)=>!!(ext?.valid&&ext.values&&typeof ext.sha256==='string'&&ext.approved?.[STRENGTH_BOUNDARIES[name]]);
/** The selection boundaries in force, in a fixed order: what a plan built under them records, and what a review of it must find again. */
export const selectionBoundaries=ext=>SELECTION_BOUNDARIES.filter(k=>allowsStrength(ext,k)).map(k=>STRENGTH_BOUNDARIES[k]).sort();
/**
 * The rules the repertoire's selection reads (plain data; null when no selection boundary is on). `inForce` is given for a review of a plan
 * built under them: the configuration each plane slot was built with, so that slot keeps it (SQ-4 conditions 2 and 5).
 */
export function strengthRules(ext,{inForce=null}={}){
 const boundaries=selectionBoundaries(ext);if(!boundaries.length)return null;
 const V=ext.values;
 return freeze({id:ext.id,sha256:ext.sha256,boundaries,...(allowsStrength(ext,'HOLD')?{hold:[...V.holdDose.configurations]}:{}),...(allowsStrength(ext,'UPPER')?{upperLoadingFirst:true}:{}),
  ...(allowsStrength(ext,'PLANE')?{planeAlternation:{...V.planeAlternation.patterns},inForce:inForce?{...inForce}:null}:{})});
}
/** Whether a plan's recorded binding is the rules in force now: the same extension, the same bytes, the same boundaries. */
export const sameRules=(bound,rules)=>isObj(bound)&&!!rules&&bound.id===rules.id&&bound.sha256===rules.sha256&&Array.isArray(bound.boundaries)&&bound.boundaries.join()===rules.boundaries.join();
/**
 * The configuration each plane slot of a plan was built with (the `planeAlternation.built` of its template rows), by template type and slot.
 * A slot two template sets disagree on is left out: nothing is then kept for it by this rule.
 */
export function slotsInForce(program){
 const out={},clash=new Set();
 for(const t of [...(Array.isArray(program?.templates)?program.templates:[]),...(Array.isArray(program?.noviceTemplates)?program.noviceTemplates:[])])for(const r of Array.isArray(t?.rows)?t.rows:[]){
  const built=r?.planeAlternation?.built;if(typeof built!=='string'||typeof t.type!=='string'||!Number.isInteger(r.slot))continue;
  const key=t.type+':'+r.slot;if(key in out&&out[key]!==built)clash.add(key);out[key]=built;
 }
 for(const k of clash)delete out[k];
 return out;
}

// ---------- V1X-STRENGTH-EXPOSURE (SQ-3) ----------
const MUSCLES=CATALOG?[...CATALOG.vocabulary.muscles]:[];
const addDays=(day,n)=>new Date(Date.parse(day+'T00:00:00Z')+n*864e5).toISOString().slice(0,10);
const tally=()=>{const by=new Map();return {add(primary,sets){for(const m of primary)by.set(m,(by.get(m)??0)+sets);},out(){return Object.fromEntries(MUSCLES.filter(m=>by.has(m)).map(m=>[m,by.get(m)]));}};};
/** A logged set that can be counted: an entry with a whole, positive repetition count (no set is imputed from a session marked complete). */
const loggedSet=s=>isObj(s)&&Number.isInteger(s.reps)&&s.reps>0;
/**
 * Weekly strength exposure of one week of a plan (SI-V1-SSCTR-SQ-3; catalog muscleCounting): each working set once for every primary muscle of
 * its configuration. Secondary muscles are not counted, a unilateral set counts once, and a PRACTICE row never counts; the plan holds no
 * warm-up row. `planned` reads the prescription; `executed` reads only sets logged in the record for that week's sessions (the latest report of
 * each session that is this athlete's, neither superseded nor in conflict, and dated inside the week), and attributes a logged exercise only
 * when it is a counted row of that session. The two are separate quantities and neither is a target: there is no range, threshold, score or comparison here, and
 * nothing in CoachingCore reads this value.
 */
export function weeklyStrengthExposure({program,weekIndex,ledger=[]},values=STRENGTH_VALUES){
 const week=Number.isInteger(weekIndex)?program?.weeks?.[weekIndex]:null;
 if(!isObj(values)||!isObj(week)||!Array.isArray(week.sessions)||typeof week.startDate!=='string')return {version:STRENGTH_EXPOSURE_VERSION,status:'NOT_APPLICABLE',reason:'NO_SUCH_WEEK'};
 const sessions=week.sessions.filter(s=>isObj(s)&&s.sport==='STRENGTH'&&isObj(s.prescription)&&Array.isArray(s.prescription.exercises)&&s.status!=='SKIPPED');
 const planned={rows:[],notCounted:[]},P=tally();
 for(const s of sessions)for(const e of s.prescription.exercises){
  const cfg=configurationOf(e?.id),sets=e?.sets;
  if(e?.role==='PRACTICE'){planned.notCounted.push({sessionId:s.id,exerciseId:e.id,reason:'PRACTICE_ROW'});continue;}
  if(!cfg||!Number.isInteger(sets)||sets<1){planned.notCounted.push({sessionId:s.id,exerciseId:e?.id??null,reason:cfg?'NO_SET_COUNT':'NOT_A_CONFIGURATION'});continue;}
  planned.rows.push({sessionId:s.id,exerciseId:cfg.id,sets,primary:[...cfg.primary]});P.add(cfg.primary,sets);
 }
 const executed={rows:[],notCounted:[]},E=tally(),last=addDays(week.startDate,6);let reported=0;
 for(const s of sessions){
  const reports=(Array.isArray(ledger)?ledger:[]).filter(o=>isObj(o)&&o.sessionId===s.id&&o.superseded!==true&&o.conflicted!==true&&o.athleteId===program.athleteId&&typeof o.localDate==='string'&&o.localDate>=week.startDate&&o.localDate<=last);
  const o=reports.at(-1);if(!o)continue;
  reported++;
  for(const x of Array.isArray(o.actual?.exercises)?o.actual.exercises:[]){
   if(!isObj(x)||typeof x.id!=='string')continue;
   const row=s.prescription.exercises.find(e=>e?.id===x.id),cfg=configurationOf(x.id),all=Array.isArray(x.sets)?x.sets:[],sets=all.filter(loggedSet).length;
   if(!row||!cfg){executed.notCounted.push({sessionId:s.id,exerciseId:x.id,reason:'NOT_A_ROW_OF_THE_SESSION'});continue;}
   if(row.role==='PRACTICE'){executed.notCounted.push({sessionId:s.id,exerciseId:x.id,reason:'PRACTICE_ROW'});continue;}
   if(all.length>sets)executed.notCounted.push({sessionId:s.id,exerciseId:x.id,reason:'SET_WITHOUT_REPETITIONS',sets:all.length-sets});
   if(!sets)continue;
   executed.rows.push({sessionId:s.id,exerciseId:cfg.id,sets,primary:[...cfg.primary]});E.add(cfg.primary,sets);
  }
 }
 return {version:STRENGTH_EXPOSURE_VERSION,status:'ACTIVE',descriptiveOnly:true,weekIndex,unit:'WORKING_SETS',label:values.exposure.label,counts:values.exposure.counts,
  planned:{basis:'PRESCRIBED_ROWS',byPrimaryMuscle:P.out(),...planned},
  executed:{basis:'LOGGED_SETS',imputed:false,sessionsPlanned:sessions.length,sessionsReported:reported,byPrimaryMuscle:E.out(),...executed}};
}
