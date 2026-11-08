// R7D-SEAL-FINAL-2 (R7-D Phase 5, R7D-PREREG-8 Δ54): copied from seal-final.mjs (R7D-SEAL-FINAL-1, the Phase 4 seal, never edited). It differs in
// the runtime it binds (R7D-FREEZE-6), the harness it reads and lists (R7D-HARNESS-9), the pre-registration (R7D-PREREG-8), the corpus revision and
// its default file name (R7D-FINAL-2, R7D_FINAL_HOLDOUT_2.json), the case count (34 to 40) and the author inputs (R7D-INTERFACE-8, brief 8 and the
// advisory checker). Everything else, the H2 sample rule included (label FINAL, seed from the freeze's manifest digest), is the Phase 4 seal's.
// R7-D final seal (R7D-SEAL-FINAL-1, R7-D Phase 4, R7D-PREREG-7): run once, after the independent author has sealed the final holdout (H1) and before
// any evaluation. The bound seal-corpus.mjs is the Phase 2 diagnostic's (R7C-FREEZE-4, R7D-HARNESS-1, PREREG-1) and stays unedited; this script
// is its final-holdout form. It verifies the author's manifest against the corpus bytes and R7D-FREEZE-5, refuses a structural error or a case count
// outside 32-36, generates the seeded intake sample H2 (label FINAL, seed sha256('R7D-SAMPLE|FINAL|' + the freeze's manifest digest), 250-300 intakes)
// with its own manifest, and writes SEAL.json for each corpus, binding every input of the first evaluation: corpus, manifests, sample, harness files,
// pre-registration, author inputs and runtime record. It never runs the runtime.
//   node seal-final.mjs --dir <final dir> [--count 300]
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {sha256} from './lib/util.mjs';
import {manifestSealDigest,verifyRuntime,verifyFreshness,HARNESS_VERSION} from './r7d-harness-9.mjs';
import {generateSample,GENERATOR_VERSION} from './generate-sample.mjs';
import {checkCorpus} from '../author/check-corpus.mjs';

const arg=(k,d=null)=>{const i=process.argv.indexOf(k);return i>=0?process.argv[i+1]:d;};
const HERE=import.meta.dirname,REPO=path.resolve(HERE,'../../..'),AUD=path.resolve(HERE,'..');
const dir=path.resolve(arg('--dir')),label='FINAL',count=Number(arg('--count','300'));
if(!(count>=250&&count<=300))throw Error('H2 holds 250 to 300 intakes (PREREG-1 §8.3)');
const raw=p=>sha256(fs.readFileSync(p)),rel=p=>path.relative(REPO,p).split(path.sep).join('/');
const sealPath=path.join(dir,'SEAL.json');
if(fs.existsSync(sealPath))throw Error('already sealed: '+sealPath);
const recordPath=path.join(REPO,'CoachingCore/r7/d/RUNTIME_FREEZE_R7D_6.json'),runtime=verifyRuntime(REPO,recordPath);
if(runtime.revision!=='R7D-FREEZE-6')throw Error('not the R7D-FREEZE-6 record');
if(runtime.runtimeDiff.length)throw Error('runtime differs from its record: '+runtime.runtimeDiff.join(', '));
// 1. The authored corpus and its manifest.
const manifestPath=path.join(dir,'FRESHNESS_MANIFEST.json'),manifest=JSON.parse(fs.readFileSync(manifestPath,'utf8'));
const corpusPath=path.join(dir,manifest.corpusPath??'R7D_FINAL_HOLDOUT_2.json'),corpusSha=raw(corpusPath),corpus=JSON.parse(fs.readFileSync(corpusPath,'utf8'));
const problems=verifyFreshness(manifest,{corpusBytesSha:corpusSha,runtime,firstEvaluation:true,seal:null});
if(manifest.corpus!=='FINAL')problems.push('manifest corpus must be FINAL');
if(manifest.runtimeFreeze!=='R7D-FREEZE-6'||manifest.runtimeFreezeDigest!==runtime.manifestDigest)problems.push('the manifest does not name R7D-FREEZE-6 and its manifest digest');
if(manifest.author?.assessmentsAuthoredBeforeRuntimeOutput!==true)problems.push('assessmentsAuthoredBeforeRuntimeOutput must be true');
if(corpus.corpusRevision!=='R7D-FINAL-2')problems.push('corpusRevision must be R7D-FINAL-2');
const n=corpus.cases?.length??0;if(!(n>=34&&n<=40))problems.push(`H1 holds 34 to 40 base cases (found ${n}; R7D-PREREG-8 Δ53)`);
const structure=checkCorpus(corpus);if(structure.errors.length)problems.push('structure errors: '+structure.errors.slice(0,5).join(' | '));
if(problems.length)throw Error('cannot seal: '+problems.join('; '));
const steps=corpus.cases.reduce((m,c)=>m+(c.timeline?.length??0),0);
// 2. The seeded sample (the seed from the evaluated freeze's manifest digest; the generator was fixed in code before this run).
const genDir=path.join(dir,'generated');if(fs.existsSync(genDir))throw Error('generated/ exists: '+genDir);fs.mkdirSync(genDir);
const startedAt=new Date().toISOString(),sample=generateSample({manifestDigest:runtime.manifestDigest,label,count});
const samplePath=path.join(genDir,`R7D_GENERATED_${label}.json`),sampleBytes=JSON.stringify(sample,null,1)+'\n';
fs.writeFileSync(samplePath,sampleBytes,{flag:'wx'});
const sampleManifest={manifest:'R7D-FRESHNESS-MANIFEST-1',corpus:`GENERATED_${label}`,
 author:{role:'mechanical generator '+GENERATOR_VERSION+' (interface vocabulary only)',identity:GENERATOR_VERSION,runtimeInspectedBeforeSeal:false,outputsInspectedBeforeSeal:false,runtimeImportedOrExecutedByAuthor:false,developmentCorpusInspected:false,earlierHoldoutsInspected:false,harnessInspected:false,engineImplementationByAuthor:false},
 authoringProtocol:'harness/generate-sample.mjs (distributions fixed in code before this run; R7D-GENERATOR-1, unchanged)',allowedInputs:['author/INTERFACE_ONLY_R7D.md vocabulary'],forbiddenInputs:['runtime, outputs, development cases'],
 authorStartedAt:startedAt,sealedAt:new Date().toISOString(),runtimeFreeze:runtime.revision,runtimeFreezeDigest:runtime.manifestDigest,
 corpusPath:path.basename(samplePath),corpusSha256:sha256(Buffer.from(sampleBytes)),hashMode:'sha256 over file bytes',bytes:Buffer.byteLength(sampleBytes),caseCount:sample.cases.length,
 coverageTags:sample.cases.flatMap(c=>c.coverageTags).reduce((m,t)=>(m[t]=(m[t]??0)+1,m),{}),generationMethod:'SEEDED_GENERATOR',seed:sample.seed,seedRule:sample.seedRule,
 evaluation:{evaluationCount:0,firstEvaluationAt:null}};
const sampleManifestPath=path.join(genDir,'FRESHNESS_MANIFEST.json');fs.writeFileSync(sampleManifestPath,JSON.stringify(sampleManifest,null,1)+'\n',{flag:'wx'});
// 3. The seal.
const head=execFileSync('git',['-C',REPO,'rev-parse','HEAD']).toString().trim();
const harnessFiles=['harness/r7d-harness-9.mjs','harness/lib/properties-9.mjs','harness/lib/client-9.mjs','harness/lib/metamorphic-9.mjs','harness/lib/properties-8.mjs','harness/lib/client.mjs','harness/lib/canonical.mjs','harness/lib/expectations.mjs','harness/lib/metamorphic.mjs','harness/lib/properties.mjs','harness/lib/report.mjs','harness/lib/util.mjs','harness/generate-sample.mjs','harness/seal-final-2.mjs','author/check-corpus.mjs','author/check-corpus-8.mjs'];
const authorInputs=['author/INTERFACE_ONLY_R7D.md','author/INTERFACE_DELTA_R7D_2.md','author/INTERFACE_DELTA_R7D_3.md','author/INTERFACE_DELTA_R7D_4.md','author/INTERFACE_DELTA_R7D_5.md','author/INTERFACE_DELTA_R7D_6.md','author/INTERFACE_DELTA_R7D_7.md','author/INTERFACE_DELTA_R7D_8.md','author/CASE_SCHEMA_R7D.json','author/AUTHOR_BRIEF_FINAL_R7D_8.md'];
const seal={seal:'R7D-SEAL-FINAL-2',sealedAt:new Date().toISOString(),firstEvaluationPending:true,
 authored:{corpus:rel(corpusPath),corpusSha256:corpusSha,manifest:rel(manifestPath),manifestSealDigest:manifestSealDigest(manifest),caseCount:n,steps,structureErrors:structure.errors,structureWarnings:structure.warnings,authorStartedAt:manifest.authorStartedAt,authorSealedAt:manifest.sealedAt},
 generated:{corpus:rel(samplePath),corpusSha256:sampleManifest.corpusSha256,manifest:rel(sampleManifestPath),manifestSealDigest:manifestSealDigest(sampleManifest),seed:sample.seed,seedRule:sample.seedRule,label,count},
 runtime:{revision:runtime.revision,commit:runtime.commit,created:runtime.created,recordSha256:runtime.recordSha256,sourceDigest:runtime.sourceDigest,manifestDigest:runtime.manifestDigest,filesEqual:`${runtime.same}/${runtime.files}`,runtimeDiff:runtime.runtimeDiff},
 harness:{version:HARNESS_VERSION,commitAtSeal:head,files:Object.fromEntries(harnessFiles.map(p=>[p,raw(path.join(AUD,p))]))},
 preregistration:{path:'audits/domain-coaching-r7-d-2026-11-02/PREREGISTRATION_R7D_8.md',sha256:raw(path.join(AUD,'PREREGISTRATION_R7D_8.md'))},
 author:Object.fromEntries(authorInputs.map(p=>[p,raw(path.join(AUD,p))]))};
// Two seals, one per corpus, as the harness reads them (--seal): the manifest digest and the corpus bytes of that corpus.
fs.writeFileSync(sealPath,JSON.stringify({...seal,manifestSealDigest:seal.authored.manifestSealDigest,corpusSha256:seal.authored.corpusSha256},null,1)+'\n',{flag:'wx'});
fs.writeFileSync(path.join(genDir,'SEAL.json'),JSON.stringify({...seal,manifestSealDigest:seal.generated.manifestSealDigest,corpusSha256:seal.generated.corpusSha256},null,1)+'\n',{flag:'wx'});
console.log(JSON.stringify({sealed:rel(sealPath),authored:{...seal.authored,structureWarnings:seal.authored.structureWarnings.length},generated:seal.generated,runtime:seal.runtime,harness:{version:seal.harness.version,commitAtSeal:head}},null,1));
