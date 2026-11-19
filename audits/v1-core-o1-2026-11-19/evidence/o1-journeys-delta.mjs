// O-1 Conflict Evidence: why one earlier Mac core journey (ncc-late-report) moves digests, and only that. Successor of
// audits/v1-core-ncc-2026-11-19/evidence/core-journeys-delta.mjs (same replay of core.json inputJSON through each tree, the record carried as
// core-driver.js does). Normalized before comparing: (1) a row's kept voices removed (a part, and its input hash, of a report the row did not
// merge: neither its own event id nor one of its mergedSourceIds), and a parts map left holding only the row's own report removed; (2) the
// learning model's lists compared as sets; (3) 64-hex digests dropped (they hash the bytes (1) changes).
// Usage: node o1-journeys-delta.mjs <FREEZE-5 CoachingCore> <candidate CoachingCore> <core.json> [journey names...]. Exit 0 when equal. Read-only.
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
// (1): a row's kept voices, removed with their input hashes; a parts map then holding only the row's own report is removed too.
const unkeep=o=>{if(!o||typeof o!=='object'||Array.isArray(o)||!o.provenance||typeof o.provenance.parts!=='object'||!o.provenance.parts)return o;const made=new Set([o.eventId,...(o.provenance.mergedSourceIds??[])]),kept=Object.keys(o.provenance.parts).filter(id=>!made.has(id));if(!kept.length)return o;
 const p={...o.provenance,parts:Object.fromEntries(Object.entries(o.provenance.parts).filter(([id])=>made.has(id))),inputHashes:Object.fromEntries(Object.entries(o.provenance.inputHashes??{}).filter(([id])=>!kept.includes(id)))};partFields+=kept.length;if(Object.keys(p.parts).length===1&&o.eventId in p.parts&&!(o.provenance.mergedSourceIds??[]).length)delete p.parts;return {...o,provenance:p};};
const norm=(v0,inModel=false)=>{const v=unkeep(v0);if(Array.isArray(v)){const m=v.map(x=>norm(x,inModel));return inModel?m.map(x=>JSON.stringify(x)).sort().map(x=>JSON.parse(x)):m;}
 if(!v||typeof v!=='object')return typeof v==='string'&&HEX.test(v)?'<digest>':v;
 const o={};for(const [k,x] of Object.entries(v)){
  o[k]=norm(x,inModel||MODEL.has(k));}return o;};
// The carried athlete model sits at persisted[3]: compare it as a model too.
const normStep=s=>({answer:norm(s.answer),persisted:s.persisted.map((x,i)=>norm(x,i===3))});
const [O,C]=[await load(oldRoot),await load(newRoot)],report={};let total=0;
for(const name of want){const j=input.journeys.find(x=>x.name===name);if(!j)throw new Error('no journey '+name);const a=run(O,j),b=run(C,j),d=[];
 const walk=(x,y,p)=>{if(JSON.stringify(x)===JSON.stringify(y))return;if(x&&y&&typeof x==='object'&&typeof y==='object'){for(const k of new Set([...Object.keys(x),...Object.keys(y)]))walk(x[k],y[k],p+'.'+k);return;}d.push(p+': '+JSON.stringify(x)?.slice(0,100)+' -> '+JSON.stringify(y)?.slice(0,100));};
 a.forEach((s,i)=>walk(normStep(s),normStep(b[i]),'step'+i));total+=d.length;report[name]={steps:a.length,rawEqual:JSON.stringify(a)===JSON.stringify(b),differencesOnceNormalized:d.length,first:d.slice(0,5)};}
console.log(JSON.stringify({keptVoicesRemoved:partFields,journeys:report},null,1));process.exitCode=total?1:0;
