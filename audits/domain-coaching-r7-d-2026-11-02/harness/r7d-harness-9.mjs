#!/usr/bin/env node
// R7D-HARNESS-9 (R7-D Phase 5, R7D-PREREG-8): copied from r7d-harness-8.mjs (R7D-HARNESS-8, never edited). It differs in its version, its default
// freeze record (R7D-FREEZE-6) and the three modules it reads: lib/client-9.mjs (substitution reference by pattern), lib/properties-9.mjs (QRE-P4-H01,
// QRE-P4-H02) and lib/metamorphic-9.mjs (QRE-P4-H03). Every other module is R7D-HARNESS-8's. A first evaluation still refuses any runtime difference.
// R7D-HARNESS-8 (R7-D Phase 4, R7D-PREREG-7): this entry point, copied from the R7D-HARNESS-7 r2 bytes bound by R7D-FREEZE-5 (r7d-harness.mjs,
// never edited), differs only in its version and in reading lib/properties-8.mjs (P17's same-break resolution, QRE3-P35-02). Every other module
// is the bound R7D-HARNESS-7 r2 file. The evaluated runtime is still R7D-FREEZE-5, and a first evaluation still refuses any runtime difference.
// R7D-HARNESS-7 (Phase 3.5, R7D-PREREG-6 Δ26-Δ28): P18(e) a sport re-entered through a week whose reports converge adversely; P18(f) a break placed
// by the training after it with sessions between left unreported; P18(c) never reads a week the systemic rule may hold; the NESTED guard reads
// "after it" by first days (QH4); not-evaluable units are listed per case in the summary, whatever the property's result.
// R7-D Fresh Generalization harness (R7D-HARNESS-6, Phase 3.4: P18(a) reads the re-entry week contract's counted sessions and accounts for an earlier
// break read as its own return; P18(c) the inverse direction; P18(d) a correction of a separate-breaks return; P02 R-F08-1. R7D-HARNESS-5 is commit
// 3edf3c5 (Phase 3.3: P18(a) accepts training after a break only as a whole executed week of the plan);
// R7D-HARNESS-4 is commit 9042ed0 (Phase 3.2: P18 and INSERT_NEWER_BREAK); R7D-HARNESS-3 is commit 747eab2 (Phase 3.1: P17 and
// RESTATE_DECLARED_BREAK); R7D-HARNESS-2 is commit b77480f, R7D-HARNESS-1 is
// commit 8eec795, kept for the Phase 2 diagnostic record). Lives outside CoachingCore and has no *.test.* file, so `node --test CoachingCore` never
// discovers it and the 884 frozen tests are untouched. It reads the runtime, the freeze record, the policy and the catalog; it never writes
// inside CoachingCore or into a corpus file. With --first-evaluation it writes only the manifest's `evaluation` block (excluded from the seal).
//
// node r7d-harness.mjs --corpus <corpus.json> --out <dir> [--manifest <manifest.json>] [--seal <seal.json>] [--first-evaluation]
//   [--runtime-root <dir holding CoachingCore>] [--freeze-record <record.json>] [--skip-structure] [--cases A,B] [--relations X,Y] [--label L]
import fs from 'node:fs';
import path from 'node:path';
import {sha256,digestOf,canonicalJson,clone} from './lib/util.mjs';
import {loadRuntime,runCase} from './lib/client-9.mjs';
import {evaluateProperties,PROPERTY_META} from './lib/properties-9.mjs';
import {runRelations,RELATIONS} from './lib/metamorphic-9.mjs';
import {evaluateExpectations} from './lib/expectations.mjs';
import {domainPacket,summaryMarkdown} from './lib/report.mjs';
import {checkCorpus} from '../author/check-corpus.mjs';

export const HARNESS_VERSION='R7D-HARNESS-9';
// The runtime the final gate evaluates: the R7-D Phase 3.4 freeze (R7D-FREEZE-5; R7D-HARNESS-5 named R7D-FREEZE-4, R7D-HARNESS-4 R7D-FREEZE-3,
// R7D-HARNESS-3 R7D-FREEZE-2, R7D-HARNESS-2 R7D-FREEZE-1). Before it exists, a development
// run names a record and passes --allow-runtime-diff; its report then lists the differing files and the evaluated bytes (runtimeSource), never a
// freeze claim.
export const DEFAULT_FREEZE_RECORD='CoachingCore/r7/d/RUNTIME_FREEZE_R7D_6.json';
const HERE=import.meta.dirname,REPO=path.resolve(HERE,'../../..');
const arg=(k,d=null)=>{const i=process.argv.indexOf(k);return i>=0&&process.argv[i+1]&&!process.argv[i+1].startsWith('--')?process.argv[i+1]:d;};
const flag=k=>process.argv.includes(k);
const raw=p=>sha256(fs.readFileSync(p));

/** Hashes every file a freeze record binds, under the given repository root. */
export function verifyRuntime(repoRoot,recordPath){
 const rec=JSON.parse(fs.readFileSync(recordPath,'utf8')),diff=[],absent=[];
 // Records bind paths from the repository root, or (older records) from CoachingCore.
 for(const [p,h] of Object.entries(rec.files??{})){
  const f=[path.join(repoRoot,p),path.join(repoRoot,'CoachingCore',p)].find(x=>fs.existsSync(x));
  if(!f)absent.push(p);else if(raw(f)!==h)diff.push(p);
 }
 const runtimeDiff=[...diff,...absent].filter(p=>/^(CoachingCore\/)?(src|r6|r7|package)/.test(p));
 return {revision:rec.revision??null,commit:rec.commit??null,created:rec.created??rec.frozenAt??rec.createdAt??null,recordSha256:raw(recordPath),sourceDigest:rec.sourceDigest??null,manifestDigest:rec.manifestDigest??null,files:Object.keys(rec.files??{}).length,same:Object.keys(rec.files??{}).length-diff.length-absent.length,diff:[...diff,...absent],changed:diff.length,absent:absent.length,runtimeDiff};
}
/** The evaluated bytes: SHA-256 of every runtime source file, the policy and the catalog (what a freeze record binds for them). */
export function sourceBytes(coachingCore){
 const files={};
 for(const f of fs.readdirSync(path.join(coachingCore,'src')).filter(x=>x.endsWith('.mjs')).sort())files['CoachingCore/src/'+f]=raw(path.join(coachingCore,'src',f));
 for(const p of ['r6/PROGRAM_POLICY_R6.json','r7/b0/REPERTOIRE_CATALOG_B0.json'])files['CoachingCore/'+p]=raw(path.join(coachingCore,p));
 return {files,digest:digestOf(files)};
}
export const manifestSealDigest=m=>{const {evaluation,...body}=m;return digestOf(body);};

export function verifyFreshness(manifest,{corpusBytesSha,runtime,firstEvaluation,seal}){
 const issues=[],need=(ok,msg)=>{if(!ok)issues.push(msg);};
 need(manifest.corpusSha256===corpusBytesSha,'corpusSha256 does not match the corpus bytes');
 need(manifest.runtimeFreezeDigest===runtime.manifestDigest||manifest.runtimeFreezeDigest===runtime.sourceDigest,'runtimeFreezeDigest does not name the evaluated freeze');
 need(!!manifest.authorStartedAt&&Date.parse(manifest.authorStartedAt)>Date.parse(runtime.created),'authorStartedAt is not after the freeze');
 need(!!manifest.sealedAt&&Date.parse(manifest.sealedAt)>=Date.parse(manifest.authorStartedAt),'sealedAt precedes authorStartedAt');
 for(const k of ['runtimeInspectedBeforeSeal','outputsInspectedBeforeSeal','runtimeImportedOrExecutedByAuthor','developmentCorpusInspected','earlierHoldoutsInspected','harnessInspected'])need(manifest.author?.[k]===false||manifest[k]===false,`${k} must be false`);
 if(seal)need(seal.manifestSealDigest===manifestSealDigest(manifest)&&seal.corpusSha256===corpusBytesSha,'the seal does not match the manifest or the corpus');
 if(firstEvaluation)need((manifest.evaluation?.evaluationCount??0)===0&&!manifest.evaluation?.firstEvaluationAt,'evaluationCount must be 0 before the first evaluation');
 return issues;
}

async function main(){
 const corpusPath=arg('--corpus'),out=arg('--out');
 if(!corpusPath||!out)throw Error('usage: --corpus <file> --out <dir> [...]');
 const repoRoot=path.resolve(arg('--runtime-root',REPO)),coachingCore=path.join(repoRoot,'CoachingCore');
 const recordPath=path.resolve(arg('--freeze-record',path.join(repoRoot,DEFAULT_FREEZE_RECORD)));
 const firstEvaluation=flag('--first-evaluation');
 if(firstEvaluation&&fs.existsSync(out))throw Error('a first evaluation writes into a new directory only: '+out);
 if(firstEvaluation&&flag('--allow-runtime-diff'))throw Error('a first evaluation runs only on the exact bytes of its freeze record');
 if(!fs.existsSync(recordPath))throw Error('freeze record not found: '+recordPath+' (give --freeze-record)');
 const runtime=verifyRuntime(repoRoot,recordPath),runtimeSource=sourceBytes(coachingCore);
 if(runtime.runtimeDiff.length&&!flag('--allow-runtime-diff'))throw Error(`runtime bytes differ from ${runtime.revision}: ${runtime.diff.slice(0,5).join(', ')}`);
 const corpusBytes=fs.readFileSync(corpusPath),corpusSha=sha256(corpusBytes),corpus=JSON.parse(corpusBytes.toString('utf8'));
 const manifestPath=arg('--manifest'),manifest=manifestPath?JSON.parse(fs.readFileSync(manifestPath,'utf8')):null;
 const sealPath=arg('--seal'),seal=sealPath?JSON.parse(fs.readFileSync(sealPath,'utf8')):null;
 const freshness=manifest?verifyFreshness(manifest,{corpusBytesSha:corpusSha,runtime,firstEvaluation,seal}):['no manifest (development run)'];
 if(firstEvaluation&&freshness.length)throw Error('freshness checks failed: '+freshness.join('; '));
 const structure=flag('--skip-structure')?{errors:[],warnings:['structure check skipped (development run)']}:checkCorpus(corpus);
 const policy=JSON.parse(fs.readFileSync(path.join(coachingCore,'r6/PROGRAM_POLICY_R6.json'),'utf8')),catalog=JSON.parse(fs.readFileSync(path.join(coachingCore,'r7/b0/REPERTOIRE_CATALOG_B0.json'),'utf8'));
 const rt=await loadRuntime(coachingCore),ctx={policy,catalog};
 const only=arg('--cases')?.split(',')??null,relationsOnly=arg('--relations')?.split(',')??null;
 const startedAt=new Date().toISOString(),rows=[];
 const structuralByCase=new Map();
 for(const e of structure.errors){const m=/^case (\S+)/.exec(e);const id=m?.[1]??'*';structuralByCase.set(id,[...(structuralByCase.get(id)??[]),e]);}
 for(const kase of corpus.cases){
  if(only&&!only.includes(kase.caseId))continue;
  const structural=structuralByCase.get(kase.caseId)??[];
  if(structural.length){rows.push({caseId:kase.caseId,corpusError:{stage:'STRUCTURE',errors:structural}});continue;}
  let base;
  try{base=runCase(rt,kase);}catch(e){rows.push({caseId:kase.caseId,harnessError:{name:e.name,message:e.message,stack:String(e.stack).split('\n').slice(0,4)}});continue;}
  const properties=evaluateProperties(base,ctx),expectations=evaluateExpectations(kase,base);
  let relations={};
  try{relations=runRelations(rt,kase,base,ctx,{only:relationsOnly});}catch(e){relations={harnessError:{name:e.name,message:e.message,stack:String(e.stack).split('\n').slice(0,4)}};}
  rows.push({caseId:kase.caseId,kase,base,properties,expectations,relations});
 }
 const finishedAt=new Date().toISOString();
 const report=buildReport({corpus,corpusPath,corpusSha,manifest,runtime,runtimeSource,allowRuntimeDiff:flag('--allow-runtime-diff'),freshness,structure,rows,startedAt,finishedAt,firstEvaluation,label:arg('--label')});
 fs.mkdirSync(out,{recursive:true});
 const write=(name,content)=>{const p=path.join(out,name);fs.writeFileSync(p,content,{flag:firstEvaluation?'wx':'w'});return {name,sha256:sha256(Buffer.from(content))};};
 const files=[write('RUN_REPORT.json',JSON.stringify(report,null,1)+'\n')];
 const packet=domainPacket(rows,report);
 files.push(write('DOMAIN_PACKET.json',JSON.stringify(packet.json,null,1)+'\n'),write('DOMAIN_PACKET.md',packet.md),write('SUMMARY.md',summaryMarkdown(report)));
 if(firstEvaluation&&manifestPath){
  const m=JSON.parse(fs.readFileSync(manifestPath,'utf8'));
  m.evaluation={evaluationCount:(m.evaluation?.evaluationCount??0)+1,firstEvaluationAt:m.evaluation?.firstEvaluationAt??startedAt,firstEvaluationReport:path.relative(path.dirname(manifestPath),path.join(out,'RUN_REPORT.json')).split(path.sep).join('/'),firstEvaluationReportSha256:files[0].sha256,harness:HARNESS_VERSION,runtime:runtime.revision};
  fs.writeFileSync(manifestPath,JSON.stringify(m,null,1)+'\n');
 }
 console.log(JSON.stringify({out,cases:rows.length,files,summary:report.summary},null,1));
}

function buildReport({corpus,corpusPath,corpusSha,manifest,runtime,runtimeSource=null,allowRuntimeDiff=false,freshness,structure,rows,startedAt,finishedAt,firstEvaluation,label}){
 const props={},rel={},exp={PASS:0,FAIL:0,NOT_EVALUABLE:0,JUDGED:0,CORPUS_ERROR:0};
 for(const id of [...Object.keys(PROPERTY_META)])props[id]={...PROPERTY_META[id],cases:{PASS:0,FAIL:0,NOT_EVALUABLE:0,NOT_APPLICABLE:0},units:0,violations:0,notEvaluableUnits:0,failingCases:[],notEvaluableCases:[]};
 for(const r of Object.keys(RELATIONS))rel[r]={...RELATIONS[r],applicableCases:0,units:0,violations:0,failingCases:[],differenceCases:[]};
 for(const row of rows){
  if(!row.properties)continue;
  // R7D-HARNESS-7 (QRE2-P34-03, CQ2-3): a not-evaluable unit is listed with its case whatever the property's result there (a PASS of other units
  // never hides it); it goes to the domain judge (R7D-PREREG-6 Δ16, Δ27), never counted as a pass.
  for(const [id,p] of Object.entries(row.properties)){const t=props[id];t.cases[p.result]++;t.units+=p.units;t.violations+=p.violations.length;t.notEvaluableUnits+=p.notEvaluable.length;if(p.result==='FAIL')t.failingCases.push(row.caseId);if(p.notEvaluable.length)t.notEvaluableCases.push({caseId:row.caseId,result:p.result,units:p.notEvaluable.length,reasons:[...new Set(p.notEvaluable.map(x=>x.reason))]});}
  for(const [id,r] of Object.entries(row.relations??{})){const t=rel[id];if(!t)continue;if(r.applicable)t.applicableCases++;t.units+=r.units??0;t.violations+=(r.violations??[]).length;if((r.violations??[]).length)t.failingCases.push(row.caseId);if((r.differences??[]).length)t.differenceCases.push(row.caseId);}
  for(const e of row.expectations)exp[e.result]=(exp[e.result]??0)+1;
 }
 // P05 is evaluated through its relations (CARRIER_CLINICAL, CARRIER_HOLD, RESEND); P13 adds its relations to the record-clock checks.
 const fromRel=(ids,target)=>{const t=props[target];for(const id of ids){t.units+=rel[id].units;t.violations+=rel[id].violations;t.failingCases.push(...rel[id].failingCases);}t.failingCases=[...new Set(t.failingCases)];};
 props.P05={...PROPERTY_META.P05,cases:null,units:0,violations:0,notEvaluableUnits:0,failingCases:[],notEvaluableCases:[]};fromRel(['CARRIER_CLINICAL','CARRIER_HOLD','RESEND'],'P05');
 fromRel(['DETERMINISM','PERMUTE_OBSERVATIONS','DUPLICATE_SECOND_SOURCE','RENAME_OPAQUE_IDS','LOAD_CONVENTION_EQUIVALENT'],'P13');
 fromRel(['CONSENT_OFF'],'P14');
 // R7D-HARNESS-3: P17 adds its relation (no repetition is ever needed) to its own checks.
 fromRel(['RESTATE_DECLARED_BREAK'],'P17');
 // R7D-HARNESS-4: P18 adds its relation (a newer break that names none never replaces or joins a kept one) to its own checks.
 fromRel(['INSERT_NEWER_BREAK'],'P18');
 for(const t of Object.values(props))t.result=t.violations?'FAIL':t.units?'PASS':'NOT_EVALUABLE';
 const corpusErrors=rows.filter(r=>r.corpusError||r.base?.corpusErrors?.length).map(r=>({caseId:r.caseId,errors:r.corpusError?.errors??r.base.corpusErrors}));
 const harnessErrors=rows.filter(r=>r.harnessError||r.relations?.harnessError).map(r=>({caseId:r.caseId,error:r.harnessError??r.relations.harnessError}));
 const caseRows=rows.map(r=>r.base?{caseId:r.caseId,coverageTags:r.kase.coverageTags,generation:r.base.generation?.status,steps:r.base.steps.length,stopped:r.base.stopped,corpusErrors:r.base.corpusErrors,runtimeErrors:r.base.runtimeErrors,integrity:r.base.integrity,properties:Object.fromEntries(Object.entries(r.properties).map(([k,p])=>[k,{result:p.result,units:p.units,violations:p.violations,notEvaluable:p.notEvaluable,observations:p.observations}])),relations:r.relations,expectations:r.expectations,stepsDigest:digestOf(r.base.steps.map(s=>s.result))}:{caseId:r.caseId,corpusError:r.corpusError,harnessError:r.harnessError});
 return {harness:HARNESS_VERSION,label:label??null,firstEvaluation,startedAt,finishedAt,node:process.version,
  corpus:{path:path.relative(REPO,path.resolve(corpusPath)).split(path.sep).join('/'),revision:corpus.corpusRevision??null,sha256:corpusSha,cases:corpus.cases.length},
  manifest:manifest?{sealDigest:manifestSealDigest(manifest),evaluationBefore:manifest.evaluation??null}:null,
  runtime,runtimeSource,allowRuntimeDiff,freshness,structure,
  summary:{cases:rows.length,evaluated:rows.filter(r=>r.base).length,corpusErrors:corpusErrors.length,harnessErrors:harnessErrors.length,properties:Object.fromEntries(Object.entries(props).map(([k,t])=>[k,{result:t.result,units:t.units,violations:t.violations,notEvaluableUnits:t.notEvaluableUnits,failingCases:t.failingCases,notEvaluableCases:t.notEvaluableCases??[]}])),relations:Object.fromEntries(Object.entries(rel).map(([k,t])=>[k,{applicableCases:t.applicableCases,units:t.units,violations:t.violations,failingCases:t.failingCases,differenceCases:t.differenceCases}])),expectations:exp},
  corpusErrors,harnessErrors,cases:caseRows};
}
if(process.argv[1]&&path.resolve(process.argv[1])===path.resolve(import.meta.filename))main().catch(e=>{console.error(e.stack??e.message);process.exitCode=1;});
