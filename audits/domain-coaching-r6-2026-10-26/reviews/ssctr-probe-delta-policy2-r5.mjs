// SSCTR R6 round-5 quick check (hash f9f89b7f...): D40, R4 and the new perception/possession denial path.
import fs from 'node:fs';
import path from 'node:path';
import {screenInterruptionReason} from '../../../CoachingCore/src/r6-clinical.mjs';
const T=(reason,expect,cat='WORK')=>({reason,expect,cat});
const B=[
 T('It was hard to run without pain','X'),T('Struggled to run without pain on the trip','X'),T('Apenas conseguia correr sem dor','X'),T('Corría sin dolor solo a veces','X'),
 T('Without pain, just travel','N'),T('Sem dor, só trabalho','N'),T('Sin dolor, solo trabajo','N'),T('nothing clinical, just a busy month','N'),T('nada clínico, só trabalho','N'),
 T("Didn't feel any pain",'N'),T('Não senti dor nenhuma','N'),T('No tuve dolor','N'),T('Never had any injury','N'),
 T("didn't feel well on the trip",'A'),T('Não me senti bem na viagem','A'),T('No me sentí bien en el viaje','A'),
 // perception/possession denial followed by a temporal or contrast qualifier (affirms a clinical event)
 T("Didn't feel any pain until I tried to run",'X'),T('Never had any injury before this trip','X'),T('Não senti dor até voltar a correr','X'),T('No tuve dolor hasta que corrí','X'),T("Didn't have pain except when running",'X'),
 // earlier rounds (must remain)
 T("couldn't run without pain",'C'),T('No pude correr sin dolor en el viaje','C'),T('Not sick - injured on holiday','C'),T('Ocupado y enfermo','C'),T('Me caí en el viaje','X'),T('Work travel, will resume Monday','A',null)
];
const out=B.map(({reason,expect,cat})=>{const r=screenInterruptionReason({reason,reasonCategory:cat,nonclinical:true});const ok=expect==='C'?r.status==='CLINICAL':expect==='N'?r.status==='NONCLINICAL':expect==='A'?r.status==='ASK':r.status!=='NONCLINICAL';return {reason,category:cat,expect,status:r.status,basis:r.basis,ok};});
const res={probe:'R6-SSCTR-DELTA-R5',results:out,failures:out.filter(x=>!x.ok).map(x=>`${x.reason} [${x.category}] -> ${x.status} (expected ${x.expect})`)};
fs.writeFileSync(path.join(import.meta.dirname,'ssctr-probe-delta-policy2-r5.out.json'),JSON.stringify(res,null,2)+'\n');
console.log(JSON.stringify(res.failures,null,1));
