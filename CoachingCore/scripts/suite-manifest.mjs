// REPMILE V1 test-suite sanitization (2026-11-25): what the active and historical suite runners share (not a test, not a runtime module).
// - The manifest of historical tests (test/HISTORICAL_TESTS.json) and its validation.
// - A JUnit reader for node's junit reporter (no dependency): node escapes a title's double quote as &quot; and then the attribute's & again.
// - The exact-title pattern: a title is matched whole, never as a substring of another title.
import fs from 'node:fs';
import path from 'node:path';

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
  if(typeof x?.supersededBy!=='string'||!x.supersededBy)e.push(at+': supersededBy (the versioned change that ended its line) is required');
  if(typeof x?.successor?.file!=='string'||typeof x?.successor?.title!=='string')e.push(at+': successor {file, title} (the current contract, active) is required');
  if(x?.successor&&x.successor.file===x.file&&x.successor.title===x.title)e.push(at+': a test is not its own successor');
  const k=`${x?.file}\u0000${x?.title}`;if(keys.has(k))e.push(at+': listed twice');keys.add(k);
 }
 // A successor is never itself historical: the chain must end in the active suite.
 for(const x of m.entries)if(keys.has(`${x.successor?.file}\u0000${x.successor?.title}`))e.push(`${x.id}: its successor is itself historical (point to the active end of the chain)`);
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
  out.push({file:rel,name,status,fileLevel:name==='test/'+rel||name===file});
 }
 return out;
}
/** An anchored, fully escaped pattern for one exact title. */
export const exactPattern=title=>'^'+title.replace(/[\\^$.|?*+()[\]{}/]/g,'\\$&')+'$';
