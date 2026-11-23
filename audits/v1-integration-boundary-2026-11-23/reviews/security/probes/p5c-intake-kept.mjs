// SEC_INT_R1 probe 5c: which intake content the stored record keeps (an unknown free-text field; the padded anchors).
// Run from CoachingCore/: node ../audits/v1-integration-boundary-2026-11-23/reviews/security/probes/p5c-intake-kept.mjs
import {athlete,athleteA} from '../../../../../CoachingCore/test/v1int-helpers.mjs';
const t=athlete({id:'p5c2'}),i=athleteA({weeks:8,id:'p5c2'});
const e=t.enroll({...i,freeText:'SECRET-FREE-TEXT',athlete:{...i.athlete,notes:'SECRET-NOTE',performanceAnchors:Array.from({length:500},(_,k)=>({...i.athlete.performanceAnchors[0],note:'ANCHOR-NOTE-'+k}))}});
const raw=t.store.raw('p5c2');console.log('enroll:',e.ok,e.status,'| bytes',raw.length,'| kept: freeText',raw.includes('SECRET-FREE-TEXT'),'notes',raw.includes('SECRET-NOTE'),'anchor notes',(raw.match(/ANCHOR-NOTE-/g)??[]).length);
