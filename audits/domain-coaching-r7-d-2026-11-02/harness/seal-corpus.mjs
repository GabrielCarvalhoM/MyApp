// R7-D seal (R7D-SEAL-1): run once, after the author has sealed and before any evaluation. Verifies the author's manifest against the corpus
// bytes and the freeze, generates the seeded intake sample with its own manifest, and writes SEAL.json binding every input of the first
// evaluation: corpus, manifests, sample, harness commit, pre-registration and runtime record. It never runs the runtime.
//   node seal-corpus.mjs --dir <diagnostic dir> --label DIAGNOSTIC --count 100
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {sha256} from './lib/util.mjs';
import {manifestSealDigest,verifyRuntime} from './r7d-harness.mjs';
import {generateSample,GENERATOR_VERSION} from './generate-sample.mjs';
import {checkCorpus} from '../author/check-corpus.mjs';

const arg=(k,d=null)=>{const i=process.argv.indexOf(k);return i>=0?process.argv[i+1]:d;};
const HERE=import.meta.dirname,REPO=path.resolve(HERE,'../../..'),dir=path.resolve(arg('--dir')),label=arg('--label','DIAGNOSTIC'),count=Number(arg('--count','100'));
const raw=p=>sha256(fs.readFileSync(p)),rel=p=>path.relative(REPO,p).split(path.sep).join('/');
const sealPath=path.join(dir,'SEAL.json');
if(fs.existsSync(sealPath))throw Error('already sealed: '+sealPath);
const recordPath=path.join(REPO,'CoachingCore/r7/c/RUNTIME_FREEZE_R7C_4.json'),runtime=verifyRuntime(REPO,recordPath);
if(runtime.runtimeDiff.length)throw Error('runtime differs from its record');
// 1. The authored corpus and its manifest.
const manifestPath=path.join(dir,'FRESHNESS_MANIFEST.json'),manifest=JSON.parse(fs.readFileSync(manifestPath,'utf8'));
const corpusPath=path.join(dir,manifest.corpusPath??'R7D_DIAGNOSTIC_CORPUS.json'),corpusSha=raw(corpusPath),corpus=JSON.parse(fs.readFileSync(corpusPath,'utf8'));
const problems=[];
if(manifest.corpusSha256!==corpusSha)problems.push('manifest corpusSha256 differs from the corpus bytes');
if((manifest.evaluation?.evaluationCount??0)!==0||manifest.evaluation?.firstEvaluationAt)problems.push('evaluationCount must be 0');
if(manifest.runtimeFreezeDigest!==runtime.manifestDigest)problems.push('runtimeFreezeDigest does not name R7C-FREEZE-4');
if(!(Date.parse(manifest.authorStartedAt)>Date.parse(runtime.created)))problems.push('authorStartedAt not after the freeze');
if(!(Date.parse(manifest.sealedAt)>=Date.parse(manifest.authorStartedAt)))problems.push('sealedAt before authorStartedAt');
const structure=checkCorpus(corpus);
if(problems.length)throw Error('cannot seal: '+problems.join('; '));
// 2. The seeded sample (seed from the evaluated freeze's manifest digest; generator defined before this run).
const genDir=path.join(dir,'generated');fs.mkdirSync(genDir,{recursive:true});
const startedAt=new Date().toISOString(),sample=generateSample({manifestDigest:runtime.manifestDigest,label,count});
const samplePath=path.join(genDir,`R7D_GENERATED_${label}.json`),sampleBytes=JSON.stringify(sample,null,1)+'\n';
fs.writeFileSync(samplePath,sampleBytes,{flag:'wx'});
const sampleManifest={manifest:'R7D-FRESHNESS-MANIFEST-1',corpus:`GENERATED_${label}`,
 author:{role:'mechanical generator '+GENERATOR_VERSION+' (interface vocabulary only)',identity:GENERATOR_VERSION,runtimeInspectedBeforeSeal:false,outputsInspectedBeforeSeal:false,runtimeImportedOrExecutedByAuthor:false,developmentCorpusInspected:false,earlierHoldoutsInspected:false,harnessInspected:false,engineImplementationByAuthor:false},
 authoringProtocol:'harness/generate-sample.mjs (distributions fixed in code before this run)',allowedInputs:['author/INTERFACE_ONLY_R7D.md vocabulary'],forbiddenInputs:['runtime, outputs, development cases'],
 authorStartedAt:startedAt,sealedAt:new Date().toISOString(),runtimeFreeze:runtime.revision,runtimeFreezeDigest:runtime.manifestDigest,
 corpusPath:path.basename(samplePath),corpusSha256:sha256(Buffer.from(sampleBytes)),hashMode:'sha256 over file bytes',bytes:Buffer.byteLength(sampleBytes),caseCount:sample.cases.length,
 coverageTags:sample.cases.flatMap(c=>c.coverageTags).reduce((m,t)=>(m[t]=(m[t]??0)+1,m),{}),generationMethod:'SEEDED_GENERATOR',seed:sample.seed,seedRule:sample.seedRule,
 evaluation:{evaluationCount:0,firstEvaluationAt:null}};
const sampleManifestPath=path.join(genDir,'FRESHNESS_MANIFEST.json');fs.writeFileSync(sampleManifestPath,JSON.stringify(sampleManifest,null,1)+'\n',{flag:'wx'});
// 3. The seal.
const head=execFileSync('git',['-C',REPO,'rev-parse','HEAD']).toString().trim();
const seal={seal:'R7D-SEAL-1',sealedAt:new Date().toISOString(),firstEvaluationPending:true,
 authored:{corpus:rel(corpusPath),corpusSha256:corpusSha,manifest:rel(manifestPath),manifestSealDigest:manifestSealDigest(manifest),caseCount:corpus.cases.length,structureErrors:structure.errors,structureWarnings:structure.warnings},
 generated:{corpus:rel(samplePath),corpusSha256:sampleManifest.corpusSha256,manifest:rel(sampleManifestPath),manifestSealDigest:manifestSealDigest(sampleManifest),seed:sample.seed,seedRule:sample.seedRule,label,count},
 runtime:{revision:runtime.revision,commit:runtime.commit,recordSha256:runtime.recordSha256,manifestDigest:runtime.manifestDigest,filesEqual:`${runtime.same}/${runtime.files}`},
 harness:{version:'R7D-HARNESS-1',commitAtSeal:head},
 preregistration:{path:'audits/domain-coaching-r7-d-2026-11-02/PREREGISTRATION_R7D.md',sha256:raw(path.join(REPO,'audits/domain-coaching-r7-d-2026-11-02/PREREGISTRATION_R7D.md'))},
 author:{interface:raw(path.join(REPO,'audits/domain-coaching-r7-d-2026-11-02/author/INTERFACE_ONLY_R7D.md')),schema:raw(path.join(REPO,'audits/domain-coaching-r7-d-2026-11-02/author/CASE_SCHEMA_R7D.json')),brief:raw(path.join(REPO,'audits/domain-coaching-r7-d-2026-11-02/author/AUTHOR_BRIEF_DIAGNOSTIC.md'))}};
// Two seals, one per corpus, as the harness reads them (--seal): the manifest digest and the corpus bytes of that corpus.
fs.writeFileSync(sealPath,JSON.stringify({...seal,manifestSealDigest:seal.authored.manifestSealDigest,corpusSha256:seal.authored.corpusSha256},null,1)+'\n',{flag:'wx'});
fs.writeFileSync(path.join(genDir,'SEAL.json'),JSON.stringify({...seal,manifestSealDigest:seal.generated.manifestSealDigest,corpusSha256:seal.generated.corpusSha256},null,1)+'\n',{flag:'wx'});
console.log(JSON.stringify({sealed:rel(sealPath),authored:seal.authored,generated:{...seal.generated},harnessCommit:head},null,1));
