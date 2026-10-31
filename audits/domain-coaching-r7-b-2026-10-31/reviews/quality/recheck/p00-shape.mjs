// Q-R7B probe 00: shape of a generated program (read-only; synthetic inputs under the development authority fixture).
import {program} from '../../../../../CoachingCore/r7/b/fixtures/helpers.mjs';
const p=program({id:'shape'});
const top=Object.keys(p);
console.log('program keys',top.join(','));
for(const k of top){const v=p[k];if(k==='weeks')continue;console.log(k,JSON.stringify(v)?.slice(0,300));}
console.log('week keys',Object.keys(p.weeks[0]).join(','));
console.log('week0',JSON.stringify({...p.weeks[0],sessions:undefined}).slice(0,600));
const s=p.weeks[0].sessions;
for(const x of s)console.log(JSON.stringify({...x,prescription:x.prescription?{...x.prescription,exercises:x.prescription.exercises?.map(e=>({id:e.id,role:e.role,slot:e.slot,template:e.template}))}:null}).slice(0,900));
