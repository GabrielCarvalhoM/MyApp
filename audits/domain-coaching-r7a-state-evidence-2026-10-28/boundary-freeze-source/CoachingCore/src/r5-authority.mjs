import fs from 'node:fs';
import {hash} from './value.mjs';
const read=url=>fs.existsSync(url)?JSON.parse(fs.readFileSync(url,'utf8').replace(/^\uFEFF/,'')):null;
export function loadProgramAuthority(){return {policy:read(new URL('../r5/PROGRAM_POLICY_R5.json',import.meta.url)),authority:read(new URL('../../audits/domain-coaching-r5-2026-10-25/reviews/ssctr-policy-review.json',import.meta.url))};}
export function programAuthority(options={}){
 const loaded=loadProgramAuthority(),policy=options.policy??loaded.policy,authority=options.authority??loaded.authority;
 const records=policy?.scientificBoundaryIds?.map(id=>authority?.records?.find(r=>r.boundaryId===id&&r.policyHash===hash(policy)&&r.independent===true&&['APPROVE','APPROVE_WITH_CONDITIONS'].includes(r.disposition)&&['WELL_SUPPORTED','SUPPORTED_WITH_LIMITS'].includes(r.evidenceStatus)&&r.sourceIds?.length));
 return {valid:records?.length===4&&records.every(Boolean),policyHash:policy?hash(policy):null,records:records?.filter(Boolean)??[]};
}
