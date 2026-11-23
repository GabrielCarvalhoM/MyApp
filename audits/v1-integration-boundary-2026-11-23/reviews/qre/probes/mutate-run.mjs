// QRE mutation run over the candidate's v1int tests: each mutant is applied in memory (mutate-hook.mjs) and the four v1int test files run.
// A mutant is KILLED when at least one test fails, SURVIVED when all pass. A mutant that cannot be applied fails loudly (not counted).
// Run from CoachingCore/: node ../audits/v1-integration-boundary-2026-11-23/reviews/qre/probes/mutate-run.mjs [--fast]
//   --fast skips the three 2000-iteration tests except for mutants tagged `limits`.
import {spawnSync} from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';
import {fileURLToPath,pathToFileURL} from 'node:url';
const HERE=path.dirname(fileURLToPath(import.meta.url)),hook=pathToFileURL(path.join(HERE,'mutate-hook.mjs')).href;
const fast=process.argv.includes('--fast');
const M=[
 ['I01','integration.mjs',"if(m.ch!==(channel===CHANNELS.ATHLETE?'A':'D'))return {refusal:{code:'CROSS_AUTHOR_CORRECTION'","if(false)return {refusal:{code:'CROSS_AUTHOR_CORRECTION'"],
 ['I02','integration.mjs',"Date.parse(c.lastAt)>op.at","false"],
 ['I03','integration.mjs',"|${doc.version}|${doc.docMac}|`","|`"],
 ['I04','integration.mjs',"records=last?last.records:base.records","records=base.records"],
 ['I05','integration.mjs',"if(typeof id==='string'&&admitted.has(id))origins[id]=meta;","if(typeof id==='string')origins[id]=meta;"],
 ['I06','integration.mjs',"const at=Date.parse(seen.at),kept=","const at=op.at,kept="],
 ['I07','integration.mjs',"if(full.observations.some(x=>held.has(x?.eventId)))","if(false)"],
 ['I08','integration.mjs',"if((m.s??null)!==(o.sessionId??null))return {refusal:{code:'ACTIVITY_LINKED_ELSEWHERE'","if(false)return {refusal:{code:'ACTIVITY_LINKED_ELSEWHERE'"],
 ['I09','integration.mjs',"reason:excluded.get(id)??'NOT_RECORDED_BY_THIS_DECISION'","reason:'NOT_RECORDED_BY_THIS_DECISION'"],
 ['I10','integration.mjs',"if((m.s??null)!==(o.sessionId??null))return {refusal:{code:'CORRECTION_SESSION_MISMATCH'","if(false)return {refusal:{code:'CORRECTION_SESSION_MISMATCH'"],
 ['I11','integration.mjs',"if(channel===CHANNELS.DEVICE&&m.act!==o.activityId)return","if(false)return"],
 ['I12','integration.mjs',"for(const h of Object.keys(sessions))if(!keep.has(h))delete sessions[h];",""],
 ['I13','integration.mjs',"if(a&&doc&&(!Number.isInteger(doc.version)||doc.version<a.version||doc.version===a.version&&doc.docMac!==a.docMac))","if(a&&doc&&(!Number.isInteger(doc.version)||doc.version<a.version))"],
 ['I14','integration.mjs',"const a=anchor?.get(actor.athleteId);if(!a)return fail('NOT_LOST','Nothing to acknowledge');","const a=anchor?.get(actor.athleteId);"],
 ['I15','integration.mjs',"if(replaced.has(correctionOf))return","if(false)return"],
 ['I16','integration.mjs',"const full={...input,...recordsIn()};\n   // A report id","const full={...input};\n   // A report id"],
 ['I17','integration.mjs',"if(m.d===factsDigest(o)){duplicates.push(i);continue;}","if(false){duplicates.push(i);continue;}"],
 ['I18','integration.mjs',"if(seen.d!==d)return fail('CONFLICT_IDEMPOTENCY_KEY'","if(false)return fail('CONFLICT_IDEMPOTENCY_KEY'"],
 ['A01','admission.mjs',"for(const k of Object.keys(o.actual))if(BOUNDARY_OWNED.includes(k))return","for(const k of [])if(BOUNDARY_OWNED.includes(k))return"],
 ['A02','admission.mjs',"if(!idOk(o.activityId))return","if(false)return"],
 ['A03','admission.mjs',"if(!instantOk(o.observedAt))return {code:'INVALID_TIME',index,field:'observedAt'};\n  if(present(o.sourceQuality)","if(present(o.sourceQuality)"],
 ['A04L','admission.mjs',"deviceActivitiesPerSession:4","deviceActivitiesPerSession:5"],
 ['A05','admission.mjs',"if(d>depth)return {limit:'depth',at};","if(d>depth+20)return {limit:'depth',at};"],
 ['C01','custody.mjs',"if(!added.length||!added.every(k=>incoming.has(k)))return false;","if(!added.length)return false;"],
 ['C02','custody.mjs',"if(x.conflicted===true&&y.conflicted!==true)return false;",""],
 ['C03','custody.mjs',"else if(Object.hasOwn(partsY,x.eventId)&&(digest(partsY[x.eventId]?.actual)!==digest(x.actual)||digest(partsY[x.eventId]?.response)!==digest(x.response)))return false;",""],
 ['C04','custody.mjs',"if(digest(omit(px,PROVENANCE_EVOLVING))!==digest(omit(py,PROVENANCE_EVOLVING)))return false;",""],
 ['C05','custody.mjs',"if(!added.length||","if("],
];
const files=['test/v1int-authorship.test.mjs','test/v1int-custody.test.mjs','test/v1int-journeys.test.mjs','test/v1int-limits.test.mjs'];
const out=[];
for(const [id,file,from,to] of M){
 const mut=Buffer.from(JSON.stringify({file,from,to})).toString('base64'),skip=fast&&!id.endsWith('L')?['--test-skip-pattern=2000']:[];
 const r=spawnSync(process.execPath,['--import',hook,'--test',...skip,...files],{env:{...process.env,MUT:mut},encoding:'utf8',maxBuffer:1<<28});
 const text=(r.stdout??'')+(r.stderr??''),applied=!/MUTANT NOT APPLIED/.test(text),fail=Number((text.match(/ℹ fail (\d+)/)??[])[1]??NaN),pass=Number((text.match(/ℹ pass (\d+)/)??[])[1]??NaN);
 const killers=[...new Set([...text.matchAll(/^✖ (.+?) \(\d/mg)].map(m=>m[1]))].slice(0,3);
 const line={id,file,applied,pass,fail,verdict:!applied?'NOT_APPLIED':fail>0?'KILLED':'SURVIVED',killers};out.push(line);console.log(JSON.stringify(line));
}
fs.writeFileSync(path.join(HERE,'mutation-out.json'),JSON.stringify(out,null,1)+'\n');
