import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {hash} from '../src/value.mjs';
const core=path.resolve(import.meta.dirname,'..'),root=path.dirname(core),reviewDir=path.join(root,'audits/domain-closure-r2-2026-10-24/reviews');
const registryPath='CoachingCore/r2/POSITIVE_PRESCRIPTION_REGISTRY.json',raw=fs.readFileSync(path.join(root,registryPath));
const rawHash=createHash('sha256').update(raw).digest('hex'),registry=JSON.parse(raw);
const doc=JSON.parse(fs.readFileSync(path.join(reviewDir,'ssctr-records.json'))),records=Array.isArray(doc)?doc:doc.records;
if(!Array.isArray(records)||records.length!==registry.policies.length)throw new Error('Every R2 policy needs a separate independent disposition');
const policyHashes={};
for(const p of registry.policies){
 const matches=records.filter(r=>r.target?.rule_ids?.includes(p.policyId));
 if(matches.length!==1)throw new Error('Missing/ambiguous SSCTR record '+p.policyId);
 const r=matches[0];
 if(r.target.artifact!==registryPath||r.target.sha256!==rawHash||r.target.artifact_revision!==registry.revision)throw new Error('Stale/mismatched review target '+p.policyId);
 if(r.reviewer.independent_of_target_author!==true||r.reviewer.human_credentials_claimed!==false||r.reviewer.actor_type!=='AI_AGENT')throw new Error('Independent provisional reviewer identity is required');
 if(r.disposition==='APPROVE_WITH_CONDITIONS'&&!['WELL_SUPPORTED','SUPPORTED_WITH_LIMITS'].includes(r.evidence_status))throw new Error('Insufficient evidence cannot enable positive policy');
 const source=fs.readFileSync(path.join(root,p.domainArtifact));
 if(createHash('sha256').update(source).digest('hex')!==p.scientificArtifactSha256)throw new Error('Scientific contract source changed '+p.policyId);
 policyHashes[p.policyId]=hash(p);
}
const authority={revision:'R2-AUTHORITY-1',registryHash:hash(registry),registryRawHash:rawHash,records,policyHashes,compilerScope:'Consistency projection of real independent records, not scientific adjudication or publication'};
fs.writeFileSync(path.join(core,'r2/SSCTR_RUNTIME_AUTHORITY.json'),JSON.stringify(authority,null,2)+'\n');
console.log(JSON.stringify({records:records.length,approved:records.filter(r=>r.disposition==='APPROVE_WITH_CONDITIONS').length,registryRawHash:rawHash}));
