// SSCTR R7A-SSCTR-r1 declared substitute for .agents/skills/sports-science-review/scripts/validate_records.py (Python and jsonschema are
// not installed in this session). Node + CoachingCore/node_modules/ajv (Ajv2020, draft 2020-12) against
// governance/agents/sports-science-reviewer/decision.schema.json, plus a line-by-line port of the helper's cross-checks: duplicate review,
// source and claim ids; source identity across records; unresolved claim sources; decisive claims need a linked verified, eligible,
// full-text source and a strong status; AE answers 1..10 exactly once when applicable; target is an existing project file with a current
// SHA-256; queue correspondence (decision id, revision, target fields, conditions, state, no human review) against the queue proposal.
// Formats: ajv-formats is not installed, so "date" (YYYY-MM-DD, a real calendar day) and "uri" (WHATWG URL parse with a scheme) are
// registered here; that is weaker than jsonschema's FormatChecker for uri. It checks record consistency only, never citation truth,
// scientific safety or LLM behaviour. Usage: node ssctr-r7a-validate.mjs <records.json> [--queue <queue.json>]
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
const ROOT=path.resolve(import.meta.dirname,'../../..');
const require=createRequire(path.join(ROOT,'CoachingCore/package.json'));
const Ajv2020=require('ajv/dist/2020').default??require('ajv/dist/2020');
const ajvVersion=require('ajv/package.json').version;
const SCHEMA=JSON.parse(fs.readFileSync(path.join(ROOT,'governance/agents/sports-science-reviewer/decision.schema.json'),'utf8'));
const APPROVALS=new Set(['APPROVE','APPROVE_WITH_CONDITIONS']),STRONG=new Set(['WELL_SUPPORTED','SUPPORTED_WITH_LIMITS']);
const args=process.argv.slice(2),recordsPath=path.resolve(args[0]),qi=args.indexOf('--queue'),queuePath=qi>=0?path.resolve(args[qi+1]):null;
const load=p=>JSON.parse(fs.readFileSync(p,'utf8').replace(/^﻿/,''));
const recordsFrom=d=>Array.isArray(d)?d:Array.isArray(d?.decisions)?d.decisions:Array.isArray(d?.records)?d.records:(()=>{throw new Error('Expected decision array or object with decisions/records array');})();
const ajv=new Ajv2020({allErrors:true,strict:true,strictTypes:false});
ajv.addFormat('date',{type:'string',validate:s=>/^\d{4}-\d{2}-\d{2}$/.test(s)&&new Date(s+'T00:00:00Z').toISOString().slice(0,10)===s});
ajv.addFormat('uri',{type:'string',validate:s=>{try{const u=new URL(s);return /^[a-z][a-z0-9+.-]*:$/i.test(u.protocol);}catch{return false;}}});
const validate=ajv.compile(SCHEMA);
const records=recordsFrom(load(recordsPath)),errors=[],seen=new Set(),identities=new Map();
for(const [i,r] of records.entries()){
 const label=r.review_id??`record[${i}]`;
 if(!validate(r))for(const e of validate.errors)errors.push(`${label}/${e.instancePath.replace(/^\//,'')||'record'}: ${e.message}`);
 if(seen.has(label))errors.push(`${label}: duplicate review ID`);seen.add(label);
 const sources=r.literature_snapshot?.sources??[],map=new Map(sources.map(s=>[s.source_id,s]));
 if(map.size!==sources.length)errors.push(`${label}: duplicate source ID`);
 for(const s of sources){const id=JSON.stringify(['title','doi','pmid','year'].map(k=>s[k]??null));if(identities.has(s.source_id)&&identities.get(s.source_id)!==id)errors.push(`${label}/${s.source_id}: source identity differs between records`);identities.set(s.source_id,id);}
 const cids=new Set();
 for(const c of r.claims??[]){
  if(cids.has(c.claim_id))errors.push(`${label}/${c.claim_id}: duplicate claim ID`);cids.add(c.claim_id);
  const refs=c.source_ids??[],missing=refs.filter(x=>!map.has(x));if(missing.length)errors.push(`${label}/${c.claim_id}: unresolved source IDs ${JSON.stringify(missing.sort())}`);
  if(c.role==='DECISION_SUPPORT'){const ok=refs.filter(x=>map.has(x)).map(x=>map.get(x)).filter(s=>s.verified===true&&s.access==='FULL_TEXT'&&s.prescriptive_support_eligible===true);if(!ok.length)errors.push(`${label}/${c.claim_id}: decisive claim lacks linked verified eligible full text`);if(!STRONG.has(c.evidence_status))errors.push(`${label}/${c.claim_id}: weak claim cannot be decision support`);}
 }
 const ae=r.ae_review??{};if(ae.applicable){const q=(ae.answers??[]).map(a=>a.question_number);if(q.length!==10||new Set(q).size!==10||q.some(n=>n<1||n>10))errors.push(`${label}: AE answers must cover each of questions 1..10 exactly once`);}
 const t=r.target??{},tp=path.resolve(ROOT,t.artifact??'');
 if(!tp.startsWith(ROOT+path.sep)||!fs.existsSync(tp)||!fs.statSync(tp).isFile())errors.push(`${label}: target is not an existing project file`);
 else if(t.sha256){const a=createHash('sha256').update(fs.readFileSync(tp)).digest('hex');if(a!==t.sha256.toLowerCase())errors.push(`${label}: target hash is stale`);}
 else errors.push(`${label}: material target hash is required by record protocol`);
}
if(queuePath){
 const queue=load(queuePath),entries=queue.items??[],byId=new Map(entries.map(x=>[x.queue_id,x]));
 if(byId.size!==entries.length)errors.push('queue: duplicate queue ID');
 const approvals=records.filter(r=>APPROVALS.has(r.disposition)&&r.scope?.prescriptive_impact),funding=queue.funding_trigger??{},funded=funding.state!=='NOT_DECLARED';
 if(funded&&!(funding.declaration_ref&&funding.declared_at))errors.push('queue: funded trigger lacks Founder declaration provenance');
 const expected=funded?'HUMAN_REVALIDATION_REQUIRED':'QUEUED_FOR_FUNDED_HUMAN_REVALIDATION',matched=[];
 for(const r of approvals){
  const ref=r.human_revalidation?.queue_ref??'',[pathText,qid]=[ref.split('#')[0],ref.split('#').slice(1).join('#')];
  if(path.resolve(ROOT,pathText)!==queuePath||!byId.has(qid)){errors.push(`${r.review_id}: missing or unresolved funded-human queue reference`);continue;}
  const e=byId.get(qid);matched.push(qid);
  if(e.decision_id!==r.review_id||e.decision_revision!==r.review_revision)errors.push(`${r.review_id}: queue references wrong decision/revision`);
  for(const f of ['artifact','artifact_revision','sha256','rule_ids'])if(JSON.stringify(e.target?.[f])!==JSON.stringify(r.target?.[f]))errors.push(`${r.review_id}: queue target mismatch for ${f}`);
  if(JSON.stringify(e.conditions)!==JSON.stringify(r.decision?.conditions))errors.push(`${r.review_id}: queue conditions differ from approval`);
  if(e.state!==expected||r.human_revalidation?.state!==expected)errors.push(`${r.review_id}: revalidation state inconsistent with funding declaration`);
  if(e.human_review!==null&&e.human_review!==undefined)errors.push(`${r.review_id}: this provisional AI-record validator cannot certify a human review`);
 }
 const extra=[...byId.keys()].filter(k=>!matched.includes(k));if(extra.length||matched.length!==new Set(matched).size)errors.push('queue: missing approval or extra entry not linked to a prescriptive approval');
}else if(records.some(r=>APPROVALS.has(r.disposition)&&r.scope?.prescriptive_impact))errors.push('--queue is required for prescriptive-impact approvals');
const result={passed:!errors.length,records:records.length,errors,validator:'declared substitute: Node '+process.version+' + ajv '+ajvVersion+' (Ajv2020, allErrors, strict except the Ajv-only strictTypes lint) with local date/uri formats; cross-checks ported from validate_records.py',limits:'Record consistency only; source truth, applicability and clinical safety require competent review.'};
console.log(JSON.stringify(result,null,2));
process.exit(errors.length?1:0);
