import {hash} from '../../src/value.mjs';
import {loadR6Policy} from '../../src/r6-authority.mjs';
/** Development-only authority: enables listed boundaries for unit tests. Never quality or scientific evidence. */
export function devAuthority(enabled=null,{policy=loadR6Policy()}={}){
 const ids=enabled??policy.scientificBoundaryIds;
 return {valid:true,policy,policyHash:hash(policy),approved:Object.fromEntries(ids.map(id=>[id,'APPROVED'])),records:ids.map(id=>({boundaryId:id,disposition:'DEV_TEST_ONLY'})),r5Valid:true,source:'DEV_TEST_ONLY'};
}
