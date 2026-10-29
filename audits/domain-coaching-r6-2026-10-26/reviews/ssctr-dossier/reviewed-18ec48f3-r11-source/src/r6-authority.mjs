import fs from 'node:fs';
import {hash} from './value.mjs';
import {programAuthority as r5ProgramAuthority} from './r5-authority.mjs';

const read=url=>fs.existsSync(url)?JSON.parse(fs.readFileSync(url,'utf8').replace(/^﻿/,'')):null;
export const POLICY_URL=new URL('../r6/PROGRAM_POLICY_R6.json',import.meta.url);
export const REVIEW_URL=new URL('../../audits/domain-coaching-r6-2026-10-26/reviews/ssctr-policy-review.json',import.meta.url);
export function loadR6Policy(){return read(POLICY_URL);}
const ENABLING={APPROVE:'APPROVED',APPROVE_WITH_CONDITIONS:'APPROVED',LIMITED_REVERSIBLE_RECOMMENDATION:'LIMITED'};
const EVIDENCE={APPROVED:['WELL_SUPPORTED','SUPPORTED_WITH_LIMITS'],LIMITED:['SUPPORTED_WITH_LIMITS','PLAUSIBLE_BUT_UNCERTAIN']};
/**
 * Per-boundary activation. Only an independent current record bound to the exact policy hash enables a boundary;
 * everything else fails closed. Conditions travel with the record for the trace.
 */
export function r6Authority(options={}){
 if(options.authority)return options.authority;
 const policy=options.policy??loadR6Policy(),review=options.review??read(REVIEW_URL),policyHash=policy?hash(policy):null;
 const approved={},records=[];
 for(const id of policy?.scientificBoundaryIds??[]){
  const r=review?.records?.find(x=>x.boundaryId===id&&x.policyHash===policyHash&&x.independent===true&&ENABLING[x.disposition]&&EVIDENCE[ENABLING[x.disposition]].includes(x.evidenceStatus)&&x.sourceIds?.length);
  if(r){approved[id]=ENABLING[r.disposition];records.push({boundaryId:id,disposition:r.disposition,evidenceStatus:r.evidenceStatus,conditions:r.conditions??[],reviewId:r.reviewId??null});}
 }
 const r5=r5ProgramAuthority();
 return {valid:!!policy&&Object.keys(approved).length>0,policy,policyHash,approved,records,r5Valid:r5.valid,r5PolicyHash:r5.policyHash,source:'CURRENT_INDEPENDENT_REVIEW'};
}
export const allows=(authority,id)=>!!authority?.approved?.[id];
