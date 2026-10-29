import fs from 'node:fs';
import {clone,hash} from './value.mjs';

const optional=url=>fs.existsSync(url)?JSON.parse(fs.readFileSync(url,'utf8')):null;
export function loadR4Authority(){
 return {registry:optional(new URL('../r4/PRESCRIPTION_ENVELOPE_REGISTRY.json',import.meta.url)),authority:optional(new URL('../../audits/domain-closure-r4-2026-10-25/reviews/ssctr-envelope-review.json',import.meta.url))};
}
/** Authority approves reusable boundaries. A changed envelope invalidates its prior review. */
export function approvedEnvelope(id,registry,authority){
 const envelope=registry?.envelopes?.find(e=>(e.envelopeId??e.id)===id);
 if(!envelope)return null;
 const review=authority?.records?.find(r=>r.envelopeId===id&&r.envelopeHash===hash(envelope)&&r.independent===true&&['APPROVE_WITH_CONDITIONS','APPROVE'].includes(r.disposition)&&['SUPPORTED_WITH_LIMITS','WELL_SUPPORTED'].includes(r.evidenceStatus)&&Array.isArray(r.sourceIds)&&r.sourceIds.length>0);
 return review?{envelope:clone(envelope),review:clone(review),bounds:clone(envelope.runtime?.bounds??envelope.bounds??{})}:null;
}
export function numericBound(bounds,key,{minimum=0,maximum=Infinity}={}){
 const v=bounds[key];return typeof v==='number'&&Number.isFinite(v)&&v>minimum&&v<=maximum?v:null;
}
