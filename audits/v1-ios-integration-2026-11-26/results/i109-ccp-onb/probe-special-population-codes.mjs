// CCP-ONB-1 (#109/#110) evidence, raw JSON outside the Swift types: how the FROZEN engine reads a special-population code it does not know, and
// the absent key. Run from the repository root: node audits/v1-ios-integration-2026-11-26/results/i109-ccp-onb/probe-special-population-codes.mjs
import {athlete,athleteA} from '../../../../CoachingCore/test/v1int-helpers.mjs';
const out=[];
for(const [name,sp,clinical] of [['PREGNANCY',['PREGNANCY'],false],['combined code',['PREGNANCY_OR_POSTPARTUM'],false],['unspecified code',['SPECIAL_POPULATION_UNSPECIFIED'],false],
 ['empty list (none)',[],false],['key absent',undefined,false],['key absent + pain',undefined,true]]){
 const t=athlete({id:'sp-'+out.length,weeks:8}),i=athleteA({weeks:8,id:'x'});if(sp===undefined)delete i.athlete.specialPopulation;else i.athlete.specialPopulation=sp;
 if(clinical)i.athlete.eligibility={assessedAt:'2026-11-13',pain:true};
 const r=t.api.onboard({actor:t.actor,intake:i,consents:{COACHING:true},clientRequestId:'r'});out.push({case:name,status:r.status,enrolled:r.enrolled,reason:r.reason??null});
}
console.log(JSON.stringify(out,null,1));
