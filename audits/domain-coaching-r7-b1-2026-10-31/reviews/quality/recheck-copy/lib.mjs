// Q-R7B probe library: collects the repertoire a program actually prescribes through public entry points (read-only).
import fs from 'node:fs';
import {intake,opts,generateProgram,evaluateProgram} from '../../../../../CoachingCore/r7/b/fixtures/helpers.mjs';
import {runRepertoireOf} from '../../../../../CoachingCore/src/r7b-repertoire.mjs';
export {intake,opts,generateProgram,evaluateProgram};
export const CATALOG=JSON.parse(fs.readFileSync(new URL('../../../../../CoachingCore/r7/b0/REPERTOIRE_CATALOG_B0.json',import.meta.url),'utf8'));
export const PROFILES=CATALOG.strength.equipmentProfiles;
export const DAYSETS={1:[0],2:[0,4],3:[0,2,4],4:[0,2,4,5],5:[0,1,2,4,5]};
export function newAcc(){return {runFamilies:new Map(),runConfigs:new Map(),configs:new Map(),configRoles:new Map(),templates:new Map(),archetypes:new Map(),overlays:new Map(),disclosures:new Map(),statuses:new Map(),strides:0,n:0};}
const bump=(m,k,w)=>{if(!m.has(k))m.set(k,w);};
/** Record what a program prescribes (every week, every live session) into acc, with `witness` as the first input that produced each item. */
export function collect(acc,p,witness){
 acc.n++;
 bump(acc.archetypes,p.archetype?.id,witness);for(const o of p.archetype?.overlays??[])bump(acc.overlays,o,witness);
 for(const t of p.templates??[])bump(acc.templates,t.templateId,witness);
 for(const n of [...(p.negotiation??[]),...(p.gaps??[])])bump(acc.disclosures,n.id,witness);
 for(const wk of p.weeks)for(const s of wk.sessions){
  const pr=s.prescription;if(!pr||s.status==='SKIPPED')continue;
  if(pr.modality==='RUN'){const r=runRepertoireOf(pr);if(r){bump(acc.runFamilies,r.family,witness);bump(acc.runConfigs,r.configuration,witness);if(r.components?.includes('RUN.STRIDES')){bump(acc.runFamilies,'RUN.STRIDES',witness);acc.strides++;}}else bump(acc.runFamilies,'UNMAPPED:'+pr.family,witness);}
  if(pr.modality==='STRENGTH'){
   const m=/^STRENGTH_(.+)$/.exec(s.role??'');if(m)bump(acc.templates,'TPL.'+m[1],witness);
   for(const e of pr.exercises??[]){bump(acc.configs,e.id,witness);const k=e.id+'|'+e.role;bump(acc.configRoles,k,witness);}
  }
 }
}
export function tryGen(o,acc,label){
 const g=generateProgram(intake(o),opts);
 const st=g.program?'PROGRAM':`${g.status}:${g.reason??''}`;acc.statuses.set(st,(acc.statuses.get(st)??0)+1);
 if(g.program)collect(acc,g.program,label);
 return g;
}
export const ser=acc=>Object.fromEntries(Object.entries(acc).map(([k,v])=>[k,v instanceof Map?Object.fromEntries(v):v]));
