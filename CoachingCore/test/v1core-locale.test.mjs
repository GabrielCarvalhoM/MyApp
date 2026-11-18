// V1 Core Safety & Lifecycle, determinism (P0 device report C-3): no order the engine decides, identifies or hashes by depends on the device
// language. The V1 module graph calls no locale-dependent comparison; a journey runs with localeCompare never called; the anchor hash is the
// same under the default collators of pt-BR, en-US, da-DK, nb-NO and cs-CZ on inputs those collators order differently.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import * as S from '../src/v1-safety-index.mjs';
import {anchorConfigurationHash} from '../src/r5-contract.mjs';
import {planAWithWeek0,restartAfter,liveSessions,reportOf,at,ELIG,addDays} from './v1core-helpers.mjs';

const SRC=path.join(path.dirname(fileURLToPath(import.meta.url)),'..','src');
const LOCALES=['pt-BR','en-US','da-DK','nb-NO','cs-CZ'];
/** Every module the composed entry point loads, by its static imports (the graph the device bundle carries). */
function graph(entry){const seen=new Set(),todo=[path.join(SRC,entry)];while(todo.length){const f=todo.pop();if(seen.has(f))continue;seen.add(f);
 for(const m of fs.readFileSync(f,'utf8').matchAll(/^(?:import|export)\s[^;]*?from\s*'(\.[^']+)'/gm))todo.push(path.resolve(path.dirname(f),m[1]));}return [...seen];}
/** Code outside comments (block and line comments removed; no string in this source holds a comment marker that matters here). */
const code=t=>t.replace(/\/\*[\s\S]*?\*\//g,'').replace(/(^|[^:'"`\\])\/\/.*$/gm,'$1');

test('C-3: the V1 module graph calls no locale-dependent comparison or formatting', ()=>{
 const files=graph('v1-safety-index.mjs');assert.ok(files.length>=36,'the whole graph is scanned: '+files.length);
 const hits=files.flatMap(f=>[...code(fs.readFileSync(f,'utf8')).matchAll(/\.localeCompare\(|\bIntl\.|\.toLocale[A-Za-z]*\(/g)].map(m=>path.basename(f)+':'+m[0]));
 assert.deepEqual(hits,[]);
});

test('C-3: the inputs below are ordered differently by the device collators (the test can see the defect)', ()=>{
 const ids=['b','aa','h','ch','Z','_x','a-1','a_1'];
 const orders=new Set(LOCALES.map(l=>JSON.stringify([...ids].sort(new Intl.Collator(l).compare))));
 assert.ok(orders.size>=3,'at least three different orders: '+[...orders].join(' | '));
});

test('C-3: the anchor configuration hash is the same under every device collator', ()=>{
 const anchors=['b','aa','h','ch','Z','_x','a-1','a_1'].map(id=>({id,prescription:{modality:'RUN',family:'EASY',durationMinutes:30}}));
 const saved=String.prototype.localeCompare,out=[];
 try{for(const l of LOCALES){const c=new Intl.Collator(l);String.prototype.localeCompare=function(o){return c.compare(String(this),String(o));};out.push(anchorConfigurationHash(anchors));}}
 finally{String.prototype.localeCompare=saved;}
 assert.equal(new Set(out).size,1);
});

test('C-3: a hybrid journey with a restart never calls localeCompare, and gives the same answers under every device collator', ()=>{
 const saved=String.prototype.localeCompare,digests=[];let calls=0;
 try{for(const l of LOCALES){const c=new Intl.Collator(l);String.prototype.localeCompare=function(o){calls++;return c.compare(String(this),String(o));};
  const x=planAWithWeek0(S,{id:'core-locale'});restartAfter(x,18,{id:'core-locale'});const s0=liveSessions(x.env,0)[0];
  const r=x.review('WEEKLY_REVIEW',at(s0.date),{eligibility:ELIG(s0.date),observations:[reportOf(x.env,s0,{tag:'-b'})]},'b-first');
  const d=addDays(x.env.program.startDate,6),w=x.probe('WEEKLY_REVIEW',at(d),{eligibility:ELIG(d),observations:liveSessions(x.env,0).slice(1).map(s=>reportOf(x.env,s,{tag:'-b'}))},'b-w0');
  digests.push(JSON.stringify([r,w,x.env]));}}
 finally{String.prototype.localeCompare=saved;}
 assert.equal(calls,0,'localeCompare was called');
 assert.equal(new Set(digests).size,1);
});
