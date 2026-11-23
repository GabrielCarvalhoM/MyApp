// QRE R2 mutation run over the cycle (d310faf): the R1 mutants that survived, re-targeted where the code moved, and mutants of each cycle fix
// (evolves, the acknowledge guard, pendingRecords, the screen, the per-activity answer, erasure, the duplicate rule, offsets, anchorStale).
// In memory only (../mutate-hook.mjs); the five v1int test files run per mutant, the three 2000-iteration tests skipped (--fast) except `L` ids.
// Run from CoachingCore/: node ../audits/v1-integration-boundary-2026-11-23/reviews/qre/probes/r2/mutate-run-r2.mjs --fast
import {spawnSync} from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';
import {fileURLToPath,pathToFileURL} from 'node:url';
const HERE=path.dirname(fileURLToPath(import.meta.url)),hook=pathToFileURL(path.join(HERE,'..','mutate-hook.mjs')).href,fast=process.argv.includes('--fast');
const M=[
 // R1 survivors, re-run.
 ['I06','integration.mjs',"const at=Date.parse(seen.at),kept=","const at=op.at,kept="],
 ['I12','integration.mjs',"for(const h of Object.keys(sessions))if(!keep.has(h))delete sessions[h];",""],
 ['I13','integration.mjs',"if(a&&doc&&(!Number.isInteger(doc.version)||doc.version<a.version||doc.version===a.version&&doc.docMac!==a.docMac))","if(a&&doc&&(!Number.isInteger(doc.version)||doc.version<a.version))"],
 ['A03','admission.mjs',"if(!instantOk(o.observedAt))return {code:'INVALID_TIME',index,field:'observedAt'};\n  if(present(o.sourceQuality)","if(present(o.sourceQuality)"],
 ['A04L','admission.mjs',"deviceActivitiesPerSession:4","deviceActivitiesPerSession:5"],
 // Acknowledge guard (QRE-INT-03).
 ['K01','integration.mjs',"if(!lost)return fail('NOT_LOST','The record is there and as last kept; nothing is set aside');",""],
 ['K02','integration.mjs',"let doc;try{doc=store.load(id);}catch{return fail('NOT_LOST'","let doc;try{doc=store.load(id);}catch{doc=null;if(0)return fail('NOT_LOST'"],
 ['K03','integration.mjs',"doc.version<a.version||doc.version===a.version&&doc.docMac!==a.docMac;","doc.version<a.version;"],
 // pendingRecords (QRE-INT-01).
 ['P01','integration.mjs',"if(op?.name==='accept'&&base.pendingRecords&&doc.program?.hash===base.pendingRecords.programHash)records=base.pendingRecords.records;",""],
 ['P02','integration.mjs',"if(op?.name==='accept'&&base.pendingRecords&&doc.program?.hash===base.pendingRecords.programHash)","if(base.pendingRecords)"],
 ['P03','integration.mjs',"maker=pendingHash?calls.find(c=>c.programHash===pendingHash):null","maker=pendingHash?calls.at(-1):null"],
 // The screen (SEC-INT-01 / QRE-INT-02 mitigation).
 ['S01','integration.mjs',"if(channel===CHANNELS.DEVICE&&!seen&&!isObj(op.loaded.screen))return fail('SCREEN_REQUIRED'","if(false)return fail('SCREEN_REQUIRED'"],
 ['S02','integration.mjs',"if(channel===CHANNELS.ATHLETE&&isObj(rv.eligibility))op.screen=clone(rv.eligibility);",""],
 ['S03','integration.mjs',"const screen=channel===CHANNELS.DEVICE?(seen?seen.screen:op.loaded.screen):null;","const screen=channel===CHANNELS.DEVICE?op.loaded.screen:null;"],
 ['S04','integration.mjs',"if(Object.keys(rest).some(k=>rest[k]!==undefined))return fail('INVALID_REQUEST'","if(false)return fail('INVALID_REQUEST'"],
 ['S05','integration.mjs',"if(isObj(args.intake.athlete?.eligibility))op.screen=clone(args.intake.athlete.eligibility);return withScreen(custody.enroll(args));","return withScreen(custody.enroll(args));"],
 // Per-activity answer, empty delivery, duplicates (QRE-INT-05, SEC-INT-11, SSCTR-INT-01).
 ['Q01','integration.mjs',"if(duplicates.includes(index))return {index,activityId,outcome:'DUPLICATE',eventId:null};","if(false)return {index,activityId,outcome:'DUPLICATE',eventId:null};"],
 ['Q02','integration.mjs',"if(!Array.isArray(activities)||!activities.length)return fail('NOTHING_TO_IMPORT'","if(!Array.isArray(activities))return fail('NOTHING_TO_IMPORT'"],
 ['Q03','integration.mjs',"if(head.startsWith('pending:'))return {refusal:{code:'DUPLICATE_IN_REQUEST'","if(false)return {refusal:{code:'DUPLICATE_IN_REQUEST'"],
 ['Q04','integration.mjs',"if(!head.startsWith('pending:')&&all[head]?.d===factsDigest(o)){duplicates.push(i);continue;}",""],
 // Erasure, anchorStale, clock (SEC-INT-08/QRE-INT-10, QRE-INT-08, SEC-INT-04).
 ['E01','integration.mjs',"if(erasing)requests=Object.fromEntries(",";(()=>0)||Object.fromEntries("],
 ['E02','integration.mjs',"readings:erasing?null:last?","readings:last?"],
 ['E03','integration.mjs',"if(r&&r.ok!==false&&op.anchorStale)return {...r,anchorStale:true};",""],
 ['E04','integration.mjs',"const lastAt=op?(base.lastAt&&Date.parse(base.lastAt)>op.at?base.lastAt:iso(op.at)):base.lastAt;","const lastAt=op?iso(op.at):base.lastAt;"],
 ['E05','integration.mjs',"setConsent:args=>run(args?.actor,args?.granted!==false,","setConsent:args=>run(args?.actor,true,"],
 ['T01','admission.mjs',"(Z|[+-]\\d{2}:\\d{2})$/","(Z|[+-]\\d{2}:\\d{2})?$/"],
 // evolves (QRE-INT-04).
 ['C03','custody.mjs',"else if(!Object.hasOwn(partsY,x.eventId)||digest(partsY[x.eventId]?.actual)!==digest(x.actual)","else if(digest(partsY[x.eventId]?.actual)!==digest(x.actual)&&Object.hasOwn(partsY,x.eventId)"],
 ['C06','custody.mjs',"for(const k of added)if(digest(SAFETY_FACTS(partsY[k]))!==digest(SAFETY_FACTS(incoming.get(k))))return false;",""],
 ['C07','custody.mjs',"if('conflicted' in y&&y.conflicted!==true||'conflicted' in x&&x.conflicted!==true)return false;",""],
 ['C08','custody.mjs',"if(px.conflict!==undefined&&py.conflict!==px.conflict)return false;",""],
 ['C09','custody.mjs',"return digest(x.actual)===digest(y.actual)&&digest(x.response)===digest(y.response)&&digest(mx)===digest(my)&&typeof py.conflict==='string';","return typeof py.conflict==='string';"],
 ['C10','custody.mjs',"if(!from.some(f=>digest(f)===digest(v))&&!(typeof v==='number'&&nums.length&&v===Math.min(...nums)))return false;",""],
 ['C11','custody.mjs',"for(const a of [ax,...voices])for(const k of Object.keys(a))if(k!=='exercises'&&stated(a[k])&&!stated(ay[k]))return false;",""],
 ['C12','custody.mjs',"if(rx[k]!==undefined&&rx[k]!=='UNKNOWN'){if(ry[k]!==rx[k])return false;}","if(0){}"],
 ['C13','custody.mjs',"else if(ry[k]!==undefined&&ry[k]!=='UNKNOWN'&&!added.some(a=>partsY[a]?.response?.[k]===ry[k]))return false;",""],
 ['C14','custody.mjs',"if(!ids(ay).every(i=>allowed.has(i))||!ids(ax).every(i=>ids(ay).includes(i)))return false;",""],
 ['C15','custody.mjs',"every(k=>added.includes(k)))return false;\n  if(y.conflicted===true){","every(k=>true))return false;\n  if(y.conflicted===true){"],
];
const files=['test/v1int-authorship.test.mjs','test/v1int-custody.test.mjs','test/v1int-journeys.test.mjs','test/v1int-limits.test.mjs','test/v1int-cycle1.test.mjs'];
const out=[],only=process.argv.find(a=>a.startsWith('--only='))?.slice(7).split(',');
for(const [id,file,from,to] of M){if(only&&!only.includes(id))continue;
 const mut=Buffer.from(JSON.stringify({file,from,to})).toString('base64'),skip=fast&&!id.endsWith('L')?['--test-skip-pattern=2000']:[];
 const r=spawnSync(process.execPath,['--import',hook,'--test',...skip,...files],{env:{...process.env,MUT:mut},encoding:'utf8',maxBuffer:1<<28});
 const text=(r.stdout??'')+(r.stderr??''),applied=!/MUTANT NOT APPLIED/.test(text),fail=Number((text.match(/ℹ fail (\d+)/)??[])[1]??NaN),pass=Number((text.match(/ℹ pass (\d+)/)??[])[1]??NaN);
 const killers=[...new Set([...text.matchAll(/^✖ (.+?) \(\d/mg)].map(m=>m[1]))].slice(0,3);
 const line={id,file,applied,pass,fail,verdict:!applied?'NOT_APPLIED':fail>0?'KILLED':'SURVIVED',killers};out.push(line);console.log(JSON.stringify(line));
}
fs.writeFileSync(path.join(HERE,'mutation-r2-out.json'),JSON.stringify(out,null,1)+'\n');
