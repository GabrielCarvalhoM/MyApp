// O-1 evidence: the lineage acceptance matrix (test/v1core-successor-lineage.test.mjs, its MATRIX), every row in both families, read by one
// CoachingCore tree and printed as JSON lines: no assertion, so every row is read, not only up to the first that differs.
// Usage: node lineage-dump.mjs <CoachingCore root> <scratch dir> > out.jsonl   (run once per tree; compare the two outputs with lineage-diff.mjs)
import fs from 'node:fs';import path from 'node:path';import {pathToFileURL} from 'node:url';
const [root,scratch]=process.argv.slice(2);if(!root||!scratch)throw new Error('usage: node lineage-dump.mjs <CoachingCore root> <scratch dir>');
const here=path.join(root,'test'),src=fs.readFileSync(path.join(here,'v1core-successor-lineage.test.mjs'),'utf8');
const NEEDLE="import test from 'node:test';";if(src.split(NEEDLE).length!==2)throw new Error('test import, once');
const dump=`
for(const family of ['EASY','LONG'])for(const [name,[send]] of Object.entries(MATRIX)){
 const m=run(family,send),row=m.row;
 console.log(JSON.stringify({family,name,word:m.word,inForce:m.inForce,replaced:m.replaced,extentKm:m.exec?.extentKm??null,completed:m.exec?.completed??null,
  conflicted:row?.conflicted===true,rowId:row?.eventId??null,voices:Object.keys(row?.provenance?.parts??{}).sort(),merged:[...(row?.provenance?.mergedSourceIds??[])].sort(),
  rejected:m.rejected,screen:m.screen,easy:m.easy,bands:m.bands,longAhead:m.longAhead,stable:m.stable,oracleWord:m.want?.word??null,
  ...(process.env.DOSE?dose(m.x):{})}));
}
// DOSE=1: the dose ahead. The weeks after the run, each reviewed as prescribed: every run session (role:minutes) of weeks w+1 to w+3, and the
// run-history facts the record holds for the run (what the pace, forecast and long-run readers can use).
function dose(x){const t=x.t,out={};for(const w of [x.w+2,x.w+3])if(t.p.weeks[w])t.week(w,weekWith(t,w,null,null));
 for(const w of [x.w+1,x.w+2,x.w+3])if(t.p.weeks[w])out['w+'+(w-x.w)]=t.runsOf(w).map(s=>s.role+':'+s.prescription.durationMinutes).join(',');
 out.runHistory=__facts(t.ledger,{athleteId:t.p.athleteId},V).filter(f=>f.sessionId===x.s.id).length;return out;}`;
const body=src.replace(NEEDLE,'const test=()=>{};import {factsFromLedger as __facts} from '+JSON.stringify(pathToFileURL(path.join(root,'src','v1-run-history.mjs')).href)+';').replaceAll("from './","from '"+pathToFileURL(here).href+'/').replaceAll("from '../","from '"+pathToFileURL(root).href+'/')+dump;
const dir=fs.mkdtempSync(path.join(scratch,'o1-lineage-')),file=path.join(dir,'dump.mjs');fs.writeFileSync(file,body);
await import(pathToFileURL(file).href);
