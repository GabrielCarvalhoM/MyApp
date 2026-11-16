// QRE V1STR recheck R2, probe D (read-only): a NONE plan (built with no asking slot, D-13) in force. After a rebuild, does the plane rule change
// any selection, prescription or week, or only add `planeAlternation` annotations to its template rows?
// Run from CoachingCore/: node ../audits/v1-strength-corrections-2026-11-16/candidate/reviews/qre/probes/r2-d-none-in-force.mjs
import {lifter,timeline,hash,EQUIPMENT,DEV,only} from '../../../../../../CoachingCore/test/v1str-helpers.mjs';
const NOPLANE=only('HOLD','UPPER'),strip=v=>JSON.parse(JSON.stringify(v,(k,x)=>k==='planeAlternation'?undefined:x));
const changes={'2->3':[[1,4],[1,3,5]],'2->4':[[1,4],[0,2,4,6]],'4->2':[[0,2,4,6],[1,4]],'3->2':[[1,3,5],[1,4]],'5->2':[[0,1,2,4,6],[1,4]]};
let n=0,annotationOnly=0,selectionDiffers=[],weeksDiffer=[];
for(const [name,[from,to]] of Object.entries(changes))for(const eq of ['FULL','MACH_DB','MACHINES','BANDS','BANDS_PULLUP','DB_BANDS','KB']){
 const run=opts=>{const t=timeline(lifter({experience:'NONE',equipment:EQUIPMENT[eq],days:from,goal:'HYPERTROPHY'}),{opts});t.weeks(0,1);t.step(2,0,'SCHEDULE_CHANGE',{changes:{strengthDays:to}},'06:00');t.weeks(2,7);return t.p;};
 const a=run(DEV),b=run(NOPLANE);n++;
 const ta=[a.templates,a.noviceTemplates??null],tb=[b.templates,b.noviceTemplates??null];
 if(hash(ta)===hash(tb))continue;
 if(hash(strip(ta))===hash(strip(tb)))annotationOnly++;else selectionDiffers.push(name+' '+eq);
 if(hash(strip(a.weeks))!==hash(strip(b.weeks)))weeksDiffer.push(name+' '+eq);
}
console.log(JSON.stringify({sequences:n,annotationOnly,selectionDiffers,weeksDiffer}));
