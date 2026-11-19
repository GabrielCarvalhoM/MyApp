// Normalization Consistency: why four earlier Mac core journeys' digests move (e1-ADVERSE, e1-HEAT, restart-f01, restart-r2-disputed), and only
// that. Replays the recorded inputs of core.json (inputJSON) through each tree's composed entry point v1-safety-index.mjs, carrying the record
// exactly as core-driver.js does, and compares every full answer and the carried envelope after three normalizations:
//   (1) merged parts' `activityId` and `availableAt` removed (the two fields this line adds to `provenance.parts[*]`);
//   (2) the learning model's lists compared as sets (record-first order changes the order of `excluded`, never its content);
//   (3) 64-hex digests dropped (they hash the bytes (1) and (2) change).
// Usage: node core-journeys-delta.mjs <FREEZE-4 CoachingCore> <candidate CoachingCore> <core.json> [journey names...]. Exit 0 when equal. Read-only.
import fs from 'node:fs';import path from 'node:path';import {pathToFileURL} from 'node:url';
const [oldRoot,newRoot,fixture,...names]=process.argv.slice(2);
const input=JSON.parse(JSON.parse(fs.readFileSync(fixture,'utf8')).inputJSON),want=names.length?names:input.journeys.map(j=>j.name);
const load=async r=>import(pathToFileURL(path.join(r,'src/v1-safety-index.mjs')).href);
const copy=v=>JSON.parse(JSON.stringify(v)),CARRIED=['runEvidenceRecord','runFormatRecord','runHistoryRecord'],PERSISTED=['program','actualLedger','referenceState','athleteModel',...CARRIED];
function run(core,j){let env={program:null,actualLedger:[],referenceState:null,athleteModel:null,runEvidenceRecord:[],runFormatRecord:[],runHistoryRecord:[]};const out=[];
 const keep=r=>{if(r.program&&!env.program)env.program=r.program;if(r.proposal)env.program=r.proposal;if(Array.isArray(r.actualLedger))env.actualLedger=r.actualLedger;else if(Array.isArray(r.carriedRecord))env.actualLedger=r.carriedRecord;
  if(r.referenceState!==undefined&&r.referenceState!==null)env.referenceState=r.referenceState;if(r.updatedModel)env.athleteModel=r.updatedModel;for(const k of CARRIED)if(Array.isArray(r[k]))env[k]=r[k];return r;};
 const inp=(kind,asOf,facts,eventId)=>{const weekIndex=Math.floor((Date.parse(asOf.slice(0,10)+'T00:00:00Z')-Date.parse(env.program.startDate+'T00:00:00Z'))/(7*864e5));
  return {version:'R6-REVIEW-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf,weekIndex,event:{id:eventId,kind},...facts,...(env.actualLedger.length?{actualLedger:env.actualLedger}:{}),...(env.referenceState?{referenceState:env.referenceState}:{}),...(env.athleteModel?{athleteModel:env.athleteModel}:{}),runEvidenceRecord:env.runEvidenceRecord,runFormatRecord:env.runFormatRecord,runHistoryRecord:env.runHistoryRecord};};
 for(const s of j.steps){let r=null;
  if(s.op==='onboard'){r=core.generateProgram(copy(s.intake));if(r.status==='PROPOSED')keep(r);}
  else if(s.op==='review')r=keep(core.evaluateProgram(env.program,inp(s.kind,s.asOf,copy(s.facts),s.eventId)));
  else if(s.op==='probe')r=core.evaluateProgram(env.program,inp(s.kind,s.asOf,copy(s.facts),s.eventId));
  else if(s.op==='restart'){r=core.restartProgram({intake:copy(s.intake),record:env.actualLedger,referenceState:env.referenceState,asOf:s.asOf,athleteId:env.program?env.program.athleteId:null,runEvidenceRecord:env.runEvidenceRecord,runFormatRecord:env.runFormatRecord,runHistoryRecord:env.runHistoryRecord});if(r.status==='PROPOSED'){env.program=r.program;env.referenceState=null;keep(r);}}
  else if(s.op==='roundtrip'){env=JSON.parse(JSON.stringify(env));}
  out.push(copy({answer:r,persisted:PERSISTED.map(k=>env[k])}));}
 return out;}
const HEX=/^[0-9a-f]{64}$/,MODEL=new Set(['updatedModel','athleteModel']);let partFields=0;
const norm=(v,inModel=false)=>{if(Array.isArray(v)){const m=v.map(x=>norm(x,inModel));return inModel?m.map(x=>JSON.stringify(x)).sort().map(x=>JSON.parse(x)):m;}
 if(!v||typeof v!=='object')return typeof v==='string'&&HEX.test(v)?'<digest>':v;
 const o={};for(const [k,x] of Object.entries(v)){
  if(k==='parts'&&x&&typeof x==='object'&&!Array.isArray(x)){o[k]=Object.fromEntries(Object.entries(x).map(([id,p])=>{if(p&&typeof p==='object'){const {activityId:a,availableAt:t,...rest}=p;if(a!==undefined||t!==undefined)partFields++;return [id,norm(rest,inModel)];}return [id,p];}));continue;}
  o[k]=norm(x,inModel||MODEL.has(k));}return o;};
// The carried athlete model sits at persisted[3]: compare it as a model too.
const normStep=s=>({answer:norm(s.answer),persisted:s.persisted.map((x,i)=>norm(x,i===3))});
const [O,C]=[await load(oldRoot),await load(newRoot)],report={};let total=0;
for(const name of want){const j=input.journeys.find(x=>x.name===name);if(!j)throw new Error('no journey '+name);const a=run(O,j),b=run(C,j),d=[];
 const walk=(x,y,p)=>{if(JSON.stringify(x)===JSON.stringify(y))return;if(x&&y&&typeof x==='object'&&typeof y==='object'){for(const k of new Set([...Object.keys(x),...Object.keys(y)]))walk(x[k],y[k],p+'.'+k);return;}d.push(p+': '+JSON.stringify(x)?.slice(0,100)+' -> '+JSON.stringify(y)?.slice(0,100));};
 a.forEach((s,i)=>walk(normStep(s),normStep(b[i]),'step'+i));total+=d.length;report[name]={steps:a.length,rawEqual:JSON.stringify(a)===JSON.stringify(b),differencesOnceNormalized:d.length,first:d.slice(0,5)};}
console.log(JSON.stringify({partFieldsSeenInCandidate:partFields,journeys:report},null,1));process.exitCode=total?1:0;
