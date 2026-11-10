// V1 Coaching Integration Boundary, RECORD-CUSTODY storage adapters (V1CIB-CUSTODY-1). A store keeps one custody document per athlete as JSON text,
// compares and swaps it by version, and keeps erasure tombstones. These adapters are the testable reference: the operational database (transactions,
// backups, replication, access control at rest) is PENDING and must keep the same contract.
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';

/** In-memory store: every read returns a fresh JSON copy, so no caller holds a reference into stored state. */
export function memoryStore(){
 const docs=new Map(),tombs=new Map();
 return {
  load:id=>docs.has(id)?JSON.parse(docs.get(id)):null,
  commit(id,expectedVersion,doc){const cur=docs.has(id)?JSON.parse(docs.get(id)).version:null;if(cur!==expectedVersion)return {ok:false,conflict:true,version:cur};docs.set(id,JSON.stringify(doc));return {ok:true};},
  remove:id=>{docs.delete(id);},
  tombstone(subject,t){tombs.set(subject,JSON.stringify(t));},
  tombstoneOf:subject=>tombs.has(subject)?JSON.parse(tombs.get(subject)):null,
  /** Test and audit hook only: the raw stored text (an attacker or an operator with storage access sees this). */
  raw:id=>docs.get(id)??null,setRaw:(id,text)=>{docs.set(id,text);}
 };
}
/** File store: one file per athlete (named by a digest of the id), written to a temporary file and renamed (atomic on one file system), with an
 * exclusive lock file per commit so two server processes never interleave a read-compare-write. No recursive removal anywhere. */
export function fileStore(dir){
 fs.mkdirSync(dir,{recursive:true});
 const name=id=>createHash('sha256').update(String(id)).digest('hex').slice(0,32);
 const file=id=>path.join(dir,`athlete-${name(id)}.json`),lock=id=>path.join(dir,`athlete-${name(id)}.lock`),tomb=s=>path.join(dir,`tombstone-${name(s)}.json`);
 const read=f=>fs.existsSync(f)?JSON.parse(fs.readFileSync(f,'utf8')):null;
 return {
  load:id=>read(file(id)),
  commit(id,expectedVersion,doc){
   let fd;try{fd=fs.openSync(lock(id),'wx');}catch(e){if(e.code==='EEXIST')return {ok:false,busy:true};throw e;}
   try{const cur=read(file(id))?.version??null;if(cur!==expectedVersion)return {ok:false,conflict:true,version:cur};
    const tmp=file(id)+'.tmp';fs.writeFileSync(tmp,JSON.stringify(doc));fs.renameSync(tmp,file(id));return {ok:true};}
   finally{fs.closeSync(fd);fs.unlinkSync(lock(id));}
  },
  remove:id=>{if(fs.existsSync(file(id)))fs.unlinkSync(file(id));},
  tombstone(subject,t){fs.writeFileSync(tomb(subject),JSON.stringify(t));},
  tombstoneOf:subject=>read(tomb(subject)),
  raw:id=>fs.existsSync(file(id))?fs.readFileSync(file(id),'utf8'):null,setRaw:(id,text)=>{fs.writeFileSync(file(id),text);}
 };
}
