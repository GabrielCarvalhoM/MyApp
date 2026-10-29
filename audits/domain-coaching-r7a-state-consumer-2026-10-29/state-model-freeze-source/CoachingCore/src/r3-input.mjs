/** Pure representation adapter. This module never selects a policy or proposes training. */
import {createHash} from 'node:crypto';
import Ajv2020 from 'ajv/dist/2020.js';
import schema from '../r3/CANONICAL_COACHING_INPUT_R3_SCHEMA.json' with {type:'json'};

export const CANONICAL_INPUT_VERSION='3.0.0';
const validateSchema=new Ajv2020({strict:false,allErrors:true}).compile(schema);
const has=(o,k)=>Object.prototype.hasOwnProperty.call(o,k);
const escape=s=>String(s).replaceAll('~','~0').replaceAll('/','~1');
const unescape=s=>s.replaceAll('~1','/').replaceAll('~0','~');
const plain=v=>v!==null&&typeof v==='object'&&!Array.isArray(v)&&(Object.getPrototypeOf(v)===Object.prototype||Object.getPrototypeOf(v)===null);
const clone=v=>structuredClone(v);
const sorted=v=>Array.isArray(v)?v.map(sorted):plain(v)?Object.fromEntries(Object.keys(v).sort().map(k=>[k,sorted(v[k])])):v;
export const canonicalFactsHash=value=>createHash('sha256').update(JSON.stringify(sorted(value))).digest('hex');

function status(value){
 if(value===null)return 'UNKNOWN';
 if(typeof value==='string'){
  if(/^(?:not applicable|n\/a)$/i.test(value))return 'NOT_APPLICABLE';
  if(/^(?:unknown(?:[ ;:].*)?|not supplied|not established|not assessed|not tested(?: .*)?|uncertain)$/i.test(value))return 'UNKNOWN';
 }
 return 'KNOWN';
}
function read(object,path){
 let value=object;
 for(const token of path.split('/').slice(1).map(unescape)){
  if(value===null||typeof value!=='object'||!has(value,token))return undefined;
  value=value[token];
 }
 return value;
}
/** Exact source value, including null and unknown prose; undefined means ABSENT. */
export function fact(input,path){
 const exact=input?.facts?.[path];
 if(exact)return clone(exact.value);
 const prefix=path;
 const entries=Object.entries(input?.facts??{}).filter(([key])=>key.startsWith(prefix+'/'));
 if(!entries.length)return undefined;
 const result=input.structure?.[path]==='ARRAY'?[]:{};
 for(const [key,cell] of entries){
  const tokens=key.slice(prefix.length+1).split('/').map(unescape);let target=result;
  for(let i=0;i<tokens.length-1;i++){
   const token=tokens[i];
   const parentPath=prefix+'/'+tokens.slice(0,i+1).map(escape).join('/');
   if(!has(target,token))Object.defineProperty(target,token,{value:input.structure?.[parentPath]==='ARRAY'?[]:{},writable:true,enumerable:true,configurable:true});
   target=target[token];
  }
  Object.defineProperty(target,tokens.at(-1),{value:clone(cell.value),writable:true,enumerable:true,configurable:true});
 }
 return result;
}
/** A missing field remains distinct from an explicit unknown, false, zero or empty array. */
export function factCell(input,path){
 if(input?.facts&&has(input.facts,path))return clone(input.facts[path]);
 const value=fact(input,path);
 return value===undefined?{status:'ABSENT',origin:'UNSPECIFIED',sourcePath:path}:{status:status(value),origin:'EXPLICIT_SYNTHETIC',sourcePath:path,value};
}

export function normalizeRepresentative(record){
 if(!plain(record?.scenarioFacts))throw new TypeError('scenarioFacts must be a JSON object');
 const source=record.scenarioFacts;
 const facts={};const structure={};const trace=[];const warnings=[];const conflicts=[];
 function flatten(value,path=''){
  if(value===undefined||typeof value==='function'||typeof value==='symbol'||typeof value==='bigint'||(typeof value==='number'&&!Number.isFinite(value)))throw new TypeError('Non-JSON fact at '+path);
  if(value!==null&&typeof value==='object'&&!Array.isArray(value)&&!plain(value))throw new TypeError('Non-JSON object at '+path);
  if(Array.isArray(value)||plain(value))structure[path]=Array.isArray(value)?'ARRAY':'OBJECT';
  if((Array.isArray(value)||plain(value))&&Object.keys(value).length){
   for(const [key,child] of Object.entries(value))flatten(child,path+'/'+escape(key));return;
  }
  facts[path]={status:status(value),origin:'EXPLICIT_SYNTHETIC',sourcePath:path,value:clone(value)};
  trace.push({operation:value===null?'NULL_AS_UNKNOWN':status(value)==='UNKNOWN'?'UNKNOWN_TOKEN_PRESERVED':'COPY',sourcePaths:[path],targetPath:'/facts/'+escape(path),detail:'Lossless source fact; no sporting adjudication'});
 }
 flatten(source);
 const input={schemaVersion:CANONICAL_INPUT_VERSION,synthetic:source.population?.synthetic===true,purpose:'SHADOW_REFERENCE',source:{corpusId:record.corpusId??'REPRESENTATIVE-CORPUS-R2',version:record.corpusVersion??'R2-EVAL-1.0.0',caseId:record.caseId??'UNIDENTIFIED',factsHash:canonicalFactsHash(source)},facts,structure,structuredContexts:{},adapter:{version:CANONICAL_INPUT_VERSION,trace,warnings,conflicts,blocked:false}};
 if(record.scenarioFactsSha256)input.source.declaredFactsHash=record.scenarioFactsSha256;
 const cell=(path,targetPath)=>{
  const result=factCell(input,path);
  trace.push({operation:result.status==='ABSENT'?'MARK_ABSENT':'BIND_SOURCE',sourcePaths:[path],targetPath,detail:'Typed view of the source field; absent is never defaulted'});return result;
 };
 const objectFields=(prefix,fields,target)=>Object.fromEntries(fields.map(name=>[name,cell(prefix+'/'+name,target+'/'+name)]));
 const c=input.structuredContexts;
 c.request=objectFields('/currentDemand',['kind','family'],'/structuredContexts/request');
 c.athlete={...objectFields('/population',['ageBand','ageYears','priority','participation','dataTier','historyOrigin'],'/structuredContexts/athlete'),modalities:{run:{experience:cell('/population/runExperience','/structuredContexts/athlete/modalities/run/experience'),competence:cell('/population/runCompetence','/structuredContexts/athlete/modalities/run/competence')},strength:{experience:cell('/population/strengthExperience','/structuredContexts/athlete/modalities/strength/experience'),competence:cell('/population/strengthCompetence','/structuredContexts/athlete/modalities/strength/competence')}}};
 c.eligibility=objectFields('/eligibility',['status','source','clinicalConcern','pain','persistentPain','injury','illness','functionalLimitation','clearanceClaim'],'/structuredContexts/eligibility');
 c.plan={officialPlan:cell('/currentDemand/officialPlan','/structuredContexts/plan/officialPlan'),officialRunWeek:cell('/currentDemand/officialRunWeek','/structuredContexts/plan/officialRunWeek')};
 c.goals={onboarding:cell('/onboarding/goals','/structuredContexts/goals/onboarding'),phase:cell('/phase','/structuredContexts/goals/phase'),goal:cell('/goal','/structuredContexts/goals/goal')};
 c.equipment={onboarding:cell('/onboarding/equipment','/structuredContexts/equipment/onboarding'),movementKnowledge:cell('/onboarding/movementKnowledge','/structuredContexts/equipment/movementKnowledge')};
 c.event=objectFields('/event',['distanceKm','day','completedAt','priority','goal','priorityWindow','athleteConfirmed','firstAtDistance','actualEffort'],'/structuredContexts/event');
 c.interruption=objectFields('/interruption',['reason','durationDays','nonclinical','actualExposureKnown','exposureDuringPause'],'/structuredContexts/interruption');
 c.calibration={...objectFields('/calibration',['method','source','construct','available','unavailable'],'/structuredContexts/calibration'),sourcePaths:Object.keys(facts).filter(p=>p.startsWith('/calibration/')||p==='/currentDemand/calibration')};
 c.recovery={...objectFields('/observations',['local','systemic','warmup','currentCapacity','currentFunction','ordinaryFunction','subjectiveRecovery','clinicalConcern','pain'],'/structuredContexts/recovery'),observationSourcePaths:Object.keys(facts).filter(p=>p.startsWith('/observations/')||p.startsWith('/observationPlan/')||p.startsWith('/nextCheck/'))};
 c.history={sourcePaths:Object.keys(facts).filter(p=>['/history','/priorHistory','/reportedExposure','/completedPrefix'].some(prefix=>p===prefix||p.startsWith(prefix+'/'))),learningConsent:cell('/learningConsent/purposeAllowed','/structuredContexts/history/learningConsent'),causalityEstablished:cell('/priorHistory/causalityEstablished','/structuredContexts/history/causalityEstablished'),observational:cell('/priorHistory/observational','/structuredContexts/history/observational')};
 c.schedule={timeBasis:'LOCAL_UNANCHORED',evaluationTime:cell('/evaluatedAt','/structuredContexts/schedule/evaluationTime'),localDate:cell('/localDate','/structuredContexts/schedule/localDate'),timezone:cell('/timezone','/structuredContexts/schedule/timezone'),availability:[]};
 if(typeof source.localDate==='string')c.schedule.timeBasis='LOCAL_DATE_ANCHORED';
 const minuteCell=(value,path,target)=>{
  if(typeof value!=='string'||!/^([01][0-9]|2[0-3]):[0-5][0-9]$/.test(value)){
   warnings.push({code:'INVALID_LOCAL_TIME',sourcePaths:[path],detail:'Expected explicit HH:mm; no date, timezone, or corrected time is inferred'});return {status:'UNKNOWN',origin:'UNSPECIFIED',sourcePath:path,value:null};
  }
  const [hours,minutes]=value.split(':').map(Number);
  trace.push({operation:'HHMM_TO_LOCAL_MINUTE',sourcePaths:[path],targetPath:target,detail:'hours * 60 + minutes; local wall-clock representation only'});
  return {status:'KNOWN',origin:'INFERRED',sourcePath:path,value:hours*60+minutes,derivation:'HHMM_TO_LOCAL_MINUTE'};
 };
 for(const prefix of ['/onboarding/availability','/currentDemand/availability','/availability']){
  const availability=read(source,prefix);
  if(Array.isArray(availability)){
   availability.forEach((entry,n)=>{
    const p=prefix+'/'+n;const target='/structuredContexts/schedule/availability/'+c.schedule.availability.length;
    const start=has(entry??{},'start')?minuteCell(entry.start,p+'/start',target+'/startMinute'):{status:'ABSENT',origin:'UNSPECIFIED',sourcePath:p+'/start'};
    const end=has(entry??{},'end')?minuteCell(entry.end,p+'/end',target+'/endMinute'):{status:'ABSENT',origin:'UNSPECIFIED',sourcePath:p+'/end'};
    if(start.status==='KNOWN'&&end.status==='KNOWN'){
     if(end.value<=start.value)conflicts.push({code:'UNANCHORED_WINDOW_ORDER',sourcePaths:[p+'/start',p+'/end'],detail:'Same-day end is not after start; no next-day rollover is assumed',requiresResolution:true});
     else if(typeof entry?.minutes==='number'&&entry.minutes>end.value-start.value)conflicts.push({code:'CAPACITY_EXCEEDS_LOCAL_WINDOW',sourcePaths:[p+'/minutes',p+'/start',p+'/end'],detail:'Explicit minute capacity exceeds the supplied same-day clock window; all values retained without choosing a schedule',requiresResolution:true});
    }
    c.schedule.availability.push({sourcePath:p,day:cell(p+'/day',target+'/day'),capacityMinutes:cell(p+'/minutes',target+'/capacityMinutes'),startLocal:cell(p+'/start',target+'/startLocal'),endLocal:cell(p+'/end',target+'/endLocal'),startMinute:start,endMinute:end});
   });
  }else if(plain(availability)){
   for(const [day,windows] of Object.entries(availability)){
    if(!Array.isArray(windows)){warnings.push({code:'INVALID_AVAILABILITY_WINDOWS',sourcePaths:[prefix+'/'+escape(day)],detail:'Day windows must be an explicit array'});continue;}
    windows.forEach((window,n)=>{
     const p=prefix+'/'+escape(day)+'/'+n;const target='/structuredContexts/schedule/availability/'+c.schedule.availability.length;
     if(!Array.isArray(window)||window.length!==2){warnings.push({code:'INVALID_AVAILABILITY_WINDOW',sourcePaths:[p],detail:'Expected [start HH:mm,end HH:mm]'});return;}
     const start=minuteCell(window[0],p+'/0',target+'/startMinute'),end=minuteCell(window[1],p+'/1',target+'/endMinute');
     if(start.status==='KNOWN'&&end.status==='KNOWN'&&end.value<=start.value)conflicts.push({code:'UNANCHORED_WINDOW_ORDER',sourcePaths:[p+'/0',p+'/1'],detail:'Same-day end is not after start; no next-day rollover is assumed',requiresResolution:true});
     trace.push({operation:'OBJECT_KEY_TO_LOCAL_DAY',sourcePaths:[prefix+'/'+escape(day)],targetPath:target+'/day',detail:'Literal day key; no calendar date inferred'});
     c.schedule.availability.push({sourcePath:p,day:{status:'KNOWN',origin:'EXPLICIT_SYNTHETIC',sourcePath:prefix+'/'+escape(day),value:day},capacityMinutes:{status:'ABSENT',origin:'UNSPECIFIED',sourcePath:p+'/capacityMinutes'},startLocal:cell(p+'/0',target+'/startLocal'),endLocal:cell(p+'/1',target+'/endLocal'),startMinute:start,endMinute:end});
    });
   }
  }
 }
 const doseNames=['durationMinutes','minutes','warmupMinutes','workMinutes','workMinutesEach','repetitions','recoveryMinutes','cooldownMinutes','secondsEach','paceSecondsPerKm','sets','setsEach','reps','loadKg','loadKgPerHand','targetRir','restSeconds','actualWorkMinutes','plannedMinutes','actualMinutes','distanceKm','timeMinutes'];
 c.sessions=[];
 function sessionWalk(value,path=''){
  if(value===null||typeof value!=='object')return;
  const transportOnly=/^\/(?:onboarding\/availability|availability|currentDemand\/availability|event|calibration\/raceData)(?:\/|$)/.test(path);
  if(!transportOnly&&!Array.isArray(value)&&(doseNames.some(k=>has(value,k))||has(value,'exercise'))){
   const target='/structuredContexts/sessions/'+c.sessions.length;
   const modality=/strength|essential|optional|row|squat/i.test(path)||has(value,'exercise')||has(value,'loadKg')||has(value,'loadKgPerHand')?'STRENGTH':/walk/i.test(path)?'WALK':/run|sameFamily|completedPrefix/i.test(path)||has(value,'paceSecondsPerKm')||has(value,'workMinutesEach')||['EASY','RECOVERY','STEADY','CRUISE','CRUISE_INTERVALS','THRESHOLD_CRUISE','VO2_STYLE_INTERVALS','SHORT_INTERVALS','LONG_RUN','HILLS','STRIDES','RACE_PACE'].includes(value.family)?'RUN':'UNSPECIFIED';
   const role=/candidate|Alternative/i.test(path)?'CANDIDATE':/completed|actual/i.test(path)?'COMPLETED':/priorHistory|reportedExposure|history|recentComparable|lastSession/i.test(path)?'HISTORICAL':'PLANNED';
   c.sessions.push({sourcePath:path,modality,role,family:cell(path+'/family',target+'/family'),exercise:cell(path+'/exercise',target+'/exercise'),recipeReference:cell(path+'/recipeReference',target+'/recipeReference'),optional:cell(path+'/optional',target+'/optional'),dose:Object.fromEntries(doseNames.map(k=>[k,cell(path+'/'+k,target+'/dose/'+k)])),timing:{day:cell(path+'/day',target+'/timing/day'),startLocal:cell(path+'/start',target+'/timing/startLocal'),startMinute:has(value,'start')?minuteCell(value.start,path+'/start',target+'/timing/startMinute'):{status:'ABSENT',origin:'UNSPECIFIED',sourcePath:path+'/start'}},sourceKind:cell(path+'/kind',target+'/sourceKind')});
   if(has(value,'minutes')&&has(value,'durationMinutes')&&value.minutes!==value.durationMinutes)conflicts.push({code:'CONFLICTING_DURATION_FIELDS',sourcePaths:[path+'/minutes',path+'/durationMinutes'],detail:'Both supplied values are retained; adapter chooses neither',requiresResolution:true});
  }
  if(Array.isArray(value)){
   const eventIds=new Set();
   value.forEach((entry,n)=>{
    const key=['eventId','factId','observationId'].find(k=>plain(entry)&&typeof entry[k]==='string');
    if(key){if(eventIds.has(entry[key]))warnings.push({code:'DUPLICATED_EVENT_ID_PRESERVED',sourcePaths:[path+'/'+n+'/'+key],detail:'Repeated identifier retained; no duplicate evidence count is manufactured'});eventIds.add(entry[key]);}
   });
  }
  for(const [key,child] of Object.entries(value))sessionWalk(child,path+'/'+escape(key));
 }
 sessionWalk(source);
 if(source.population?.dataTier==='NO_WEARABLE'&&typeof source.wearable?.type==='string'&&!['none','NONE','NO_WEARABLE'].includes(source.wearable.type))conflicts.push({code:'DATA_TIER_DEVICE_CONFLICT',sourcePaths:['/population/dataTier','/wearable/type'],detail:'NO_WEARABLE conflicts with an explicitly described device; both facts retained',requiresResolution:true});
 if(source.event?.completedAt&&!has(source,'evaluatedAt'))warnings.push({code:'EVENT_TIME_WITHOUT_EVALUATION_ANCHOR',sourcePaths:['/event/completedAt','/evaluatedAt'],detail:'Absolute event time retained; relative current/event chronology cannot be computed'});
 for(const [path,entry] of Object.entries(facts)){
  if(typeof entry.value==='string'&&/\d/.test(entry.value)&&/^\/(priorHistory|reportedExposure|onboarding|currentDemand)/.test(path))warnings.push({code:'NARRATIVE_NUMERIC_CONTENT_RETAINED',sourcePaths:[path],detail:'Prose remains a source fact; no dose, capacity, comparability, necessity or approval is inferred'});
  if(path.endsWith('/stale')&&entry.value===true)warnings.push({code:'EXPLICIT_STALE_OBSERVATION',sourcePaths:[path],detail:'Supplied staleness retained; no recency threshold is introduced'});
 }
 if(record.scenarioFactsSha256&&record.scenarioFactsSha256!==input.source.factsHash){input.adapter.blocked=true;warnings.push({code:'SOURCE_HASH_MISMATCH',sourcePaths:[''],detail:'Declared frozen facts hash differs from supplied facts'});}
 if(input.synthetic!==true||source.population?.realPerson===true){input.adapter.blocked=true;warnings.push({code:'NOT_SYNTHETIC_SHADOW_SOURCE',sourcePaths:['/population/synthetic','/population/realPerson'],detail:'Only explicit synthetic reference inputs are supported'});}
 if(warnings.some(w=>w.code.startsWith('INVALID_')))input.adapter.blocked=true;
 return input;
}

export function validateCanonical(input){
 const valid=validateSchema(input);const errors=valid?[]:clone(validateSchema.errors??[]);
 if(valid){
  const restored=fact(input,'');
  if(canonicalFactsHash(restored)!==input.source.factsHash)errors.push({instancePath:'/source/factsHash',keyword:'factsIntegrity',message:'Lossless source facts do not match their hash'});
  for(const [path,entry] of Object.entries(input.facts)){
   if(path!==entry.sourcePath)errors.push({instancePath:'/facts/'+escape(path),keyword:'sourcePath',message:'Fact sourcePath must equal its JSON pointer key'});
   if(entry.status!==status(entry.value))errors.push({instancePath:'/facts/'+escape(path)+'/status',keyword:'factStatus',message:'Fact status must preserve the explicit source value'});
  }
  const projected=normalizeRepresentative({scenarioFacts:restored,caseId:input.source.caseId,corpusId:input.source.corpusId,corpusVersion:input.source.version,scenarioFactsSha256:input.source.declaredFactsHash});
  if(JSON.stringify(sorted(projected.facts))!==JSON.stringify(sorted(input.facts)))errors.push({instancePath:'/facts',keyword:'factProvenanceIntegrity',message:'This representative adapter preserves synthetic premise origins; measured, self-reported or learned origins require a separate versioned ingestion contract'});
  if(JSON.stringify(sorted(projected.structure))!==JSON.stringify(sorted(input.structure)))errors.push({instancePath:'/structure',keyword:'structureIntegrity',message:'Container shape metadata must match the reconstructed source facts'});
  if(JSON.stringify(sorted(projected.structuredContexts))!==JSON.stringify(sorted(input.structuredContexts)))errors.push({instancePath:'/structuredContexts',keyword:'projectionIntegrity',message:'Typed views must match lossless source facts and documented representation transformations'});
  if(JSON.stringify(sorted(projected.adapter))!==JSON.stringify(sorted(input.adapter)))errors.push({instancePath:'/adapter',keyword:'adapterIntegrity',message:'Adapter blocking, conflicts, warnings and complete transformation trace must match source facts'});
 }
 return {valid:valid&&errors.length===0,errors};
}
