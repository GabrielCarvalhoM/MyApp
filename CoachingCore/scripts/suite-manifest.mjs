// REPMILE V1 test-suite sanitization (2026-11-25): what the active and historical suite runners share (not a test, not a runtime module).
// - The manifest of historical tests (test/HISTORICAL_TESTS.json) and its validation.
// - A JUnit reader for node's junit reporter (no dependency): node escapes a title's double quote as &quot; and then the attribute's & again.
// - The exact-title pattern: a title is matched whole, never as a substring of another title.
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';

export const MANIFEST='test/HISTORICAL_TESTS.json';
export const SCHEMA='REPMILE-V1-HISTORICAL-TESTS-1';
/** Why a test is historical (HISTORICAL_TEST_POLICY.md): the three kinds a test of the current line can never be. */
export const KINDS=Object.freeze(['FREEZE_RECORD_OF_ITS_LINE','PINNED_DEFECT_CLOSED_LATER','CONTRACT_SUPERSEDED_BY_REVIEWED_CHANGE']);
export const readManifest=core=>JSON.parse(fs.readFileSync(path.join(core,MANIFEST),'utf8'));

const SHA=/^[0-9a-f]{64}$/,COMMIT=/^[0-9a-f]{7,40}$/;
export function manifestErrors(m){
 const e=[];
 if(!m||m.schema!==SCHEMA)return ['schema is not '+SCHEMA];
 if(!Array.isArray(m.entries)||!m.entries.length)return ['no entries'];
 const ids=new Set(),keys=new Set();
 for(const [i,x] of m.entries.entries()){
  const at=`entry ${i} (${x?.id??'?'})`;
  if(typeof x?.id!=='string'||ids.has(x.id))e.push(at+': id missing or repeated');ids.add(x?.id);
  for(const k of ['file','title','kind','reason','contract'])if(typeof x?.[k]!=='string'||!x[k])e.push(`${at}: ${k} is required`);
  if(!KINDS.includes(x?.kind))e.push(`${at}: kind must be one of ${KINDS.join(', ')}`);
  if(!SHA.test(x?.fileSha256??''))e.push(at+': fileSha256 (the pinned bytes of the historical test file) is required');
  if(!COMMIT.test(x?.belongsTo?.commit??''))e.push(at+': belongsTo.commit (where the test is green, in its own context) is required');
  if(!COMMIT.test(x?.firstFailedAt?.commit??''))e.push(at+': firstFailedAt.commit is required');
  if(!Number.isInteger(x?.failsAt?.line)||x.failsAt.line<1)e.push(at+': failsAt.line (the assertion it fails at on the current tree) is required');
  if(typeof x?.supersededBy!=='string'||!x.supersededBy)e.push(at+': supersededBy (the versioned change that ended its line) is required');
  if(typeof x?.successor?.file!=='string'||typeof x?.successor?.title!=='string')e.push(at+': successor {file, title} (the current contract, active) is required');
  if(x?.successor&&x.successor.file===x.file&&x.successor.title===x.title)e.push(at+': a test is not its own successor');
  const k=`${x?.file}\u0000${x?.title}`;if(keys.has(k))e.push(at+': listed twice');keys.add(k);
 }
 // A successor is never itself historical: the chain must end in the active suite.
 for(const x of m.entries)if(keys.has(`${x.successor?.file}\u0000${x.successor?.title}`))e.push(`${x.id}: its successor is itself historical (point to the active end of the chain)`);
 for(const x of m.entries)for(const a of Array.isArray(x.alsoCoveredBy)?x.alsoCoveredBy:[]){if(typeof a?.file!=='string'||typeof a?.title!=='string')e.push(`${x.id}: an alsoCoveredBy entry needs {file, title}`);else if(keys.has(`${a.file}\u0000${a.title}`))e.push(`${x.id}: an alsoCoveredBy test is itself historical`);}
 return e;
}

const ENT={amp:'&',lt:'<',gt:'>',quot:'"',apos:"'"};
const unescape=s=>s.replace(/&(#x[0-9a-f]+|#\d+|amp|lt|gt|quot|apos);/gi,(_,c)=>c[0]==='#'?String.fromCodePoint(c[1]==='x'||c[1]==='X'?parseInt(c.slice(2),16):parseInt(c.slice(1),10)):ENT[c.toLowerCase()]);
const attr=(tag,name)=>{const m=tag.match(new RegExp(`\\s${name}="([^"]*)"`));return m?unescape(m[1]):null;};
/** The testcases of a node junit report: {file (relative to test/), name, status: passed | failed | skipped, fileLevel}. */
export function parseJunit(xml){
 // Attributes are read as quoted values: node does not escape '>' inside one (a title such as "done -> not done"), so a tag never ends at it.
 const out=[],re=/<testcase((?:\s+[\w:-]+="[^"]*")*)\s*(\/>|>([\s\S]*?)<\/testcase>)/g;let m;
 while((m=re.exec(xml))){
  const tag=m[1],body=m[3]??'',file=attr(tag,'file')??'',name=(attr(tag,'name')??'').replace(/&quot;/g,'"');
  const status=/<failure\b/.test(body)?'failed':/<skipped\b/.test(body)?'skipped':'passed';
  const rel=file.includes('/test/')?file.slice(file.lastIndexOf('/test/')+6):path.basename(file);
  // node reports a file of which no test ran (all filtered out) as one entry named after the file: not a test. If it failed, the file did
  // not load, and that is a failure of the suite.
  // The line of the failing assertion: the first frame of the failure in the test's own file (QRE-SAN-03).
  const esc=rel.replace(/[.*+?^${}()|[\]\\/]/g,'\\$&'),fm=status==='failed'?unescape(body).match(new RegExp(`/test/${esc}:(\\d+):\\d+`)):null;
  const msg=status==='failed'?(unescape((body.match(/<failure\b[^>]*?message="([^"]*)"/)??[])[1]??'')).replace(/\s+/g,' '):'';
  out.push({file:rel,name,status,fileLevel:name==='test/'+rel||name===file,failLine:fm?Number(fm[1]):null,message:msg});
 }
 return out;
}
/** node's own counters (the junit comments: tests, pass, fail, cancelled, skipped, todo). */
export function junitCounts(xml){const o={};for(const k of ['tests','pass','fail','cancelled','skipped','todo']){const m=xml.match(new RegExp(`<!-- ${k} (\\d+) -->`));o[k]=m?Number(m[1]):null;}return o;}
/** An anchored, fully escaped pattern for one exact title. */
export const exactPattern=title=>'^'+title.replace(/[\\^$.|?*+()[\]{}/]/g,'\\$&')+'$';

// ---- The historical-layer record (QRE_SAN_R1 QRE-SAN-04, QRE_SAN_R2 QRE-SAN-10/-11) ----
// The record is a file written by exactly ONE commit and never modified: git's history proves it, so no commit hash has to be written into a
// file the record itself binds. A change to the layer is a new record file (a new version), never an edit. The record binds the manifest, the
// suite scripts, package.json, the record test, every test file holding a successor or an alsoCoveredBy test, the helper modules and audit
// harness they import, and the verifier scripts they run. Both the active runner and test/v1san-record.test.mjs check it.
// CCP-79 (#79): the layer changed with REPMILE-COACHINGCORE-V1-CCP79-AMENDMENT-3 (the runtime-integrity test repointed), so it is bound by a new
// record version, REPMILE-COACHINGCORE-V1-TEST-SUITE-SANITIZATION-3; -2 (audits/v1-test-suite-sanitization-2026-11-25/HISTORICAL_LAYER_RECORD.json)
// is kept unchanged as history.
export const LAYER_RECORD='audits/v1-ios-integration-2026-11-26/results/i79-engine-fixforward/HISTORICAL_LAYER_RECORD_3.json';
export const RECORD_TEST={file:'v1san-record.test.mjs',title:'the historical-layer record: written once, never modified, and the layer is the bytes it binds'};
export const LAYER_CORE=Object.freeze(['CoachingCore/test/HISTORICAL_TESTS.json','CoachingCore/package.json','CoachingCore/scripts/suite-active.mjs','CoachingCore/scripts/suite-historical.mjs','CoachingCore/scripts/suite-manifest.mjs','CoachingCore/test/'+RECORD_TEST.file]);
const shaFile=f=>createHash('sha256').update(fs.readFileSync(f)).digest('hex');
/** The errors of the historical-layer record against the tree at root (the repository root); [] when it holds. */
export function layerRecordErrors(root){
 const abs=path.join(root,LAYER_RECORD),e=[];
 if(!fs.existsSync(abs))return ['the historical-layer record is missing: '+LAYER_RECORD];
 let commits;
 try{commits=execFileSync('git',['log','--format=%H','--',LAYER_RECORD],{cwd:root,encoding:'utf8'}).split('\n').filter(Boolean);}catch{return ['git history is needed to verify the historical-layer record'];}
 if(commits.length!==1)e.push(`the historical-layer record must be written by exactly one commit and never modified (${commits.length} commits touch it): a change to the layer is a new record file`);
 else{const sealed=execFileSync('git',['show',`${commits[0]}:${LAYER_RECORD}`],{cwd:root,maxBuffer:1<<26});
  if(createHash('sha256').update(sealed).digest('hex')!==shaFile(abs))e.push('the historical-layer record differs from the bytes its commit wrote');}
 let rec;try{rec=JSON.parse(fs.readFileSync(abs,'utf8'));}catch{return [...e,'the historical-layer record is not JSON'];}
 const files=rec?.files&&typeof rec.files==='object'?rec.files:{};
 if(rec.filesDigest!==createHash('sha256').update(JSON.stringify(Object.fromEntries(Object.entries(files).sort()))).digest('hex'))e.push('the record is not internally consistent (filesDigest)');
 for(const f of LAYER_CORE)if(!Object.hasOwn(files,f))e.push('the record does not bind '+f);
 let m=null;try{m=readManifest(path.join(root,'CoachingCore'));}catch{}
 if(m){if(m.entries.length!==rec.historicalEntries)e.push(`the manifest has ${m.entries.length} entries, the record ${rec.historicalEntries}`);
  for(const x of m.entries.flatMap(y=>[y.successor,...(y.alsoCoveredBy??[])]))if(!Object.hasOwn(files,'CoachingCore/test/'+x.file))e.push('a successor file is not bound: '+x.file);}
 for(const [f,h] of Object.entries(files)){const p=path.join(root,f);if(!fs.existsSync(p))e.push('a bound file is missing: '+f);else if(shaFile(p)!==h)e.push('the historical layer changed without a new record: '+f);}
 return e;
}
