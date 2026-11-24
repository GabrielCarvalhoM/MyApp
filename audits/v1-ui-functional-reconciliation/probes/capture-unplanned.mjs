// V1 UI functional reconciliation (2026-11-24): an unplanned ("avulsa") run and strength session, and an athlete's contest of a device
// distance, through the FROZEN boundary (ATHLETE channel `submit`). Writes only ./out/unplanned-*.json. No training rule here.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {athlete,ELIG,addDays,U} from '../../../CoachingCore/test/v1int-helpers.mjs';
let idSeq=0;const newId=p=>`${p}_${String(++idSeq).padStart(6,'0')}`; // deterministic ids (as v1int-journeys Journey D): reruns give the same bytes
const OUT=path.join(path.dirname(fileURLToPath(import.meta.url)),'out');
const code=r=>r?.ok?'OK':r?.error?.code;const log=[];
const step=(name,r)=>{log.push([name,code(r),r?.status??'',JSON.stringify(r?.recorded??null),JSON.stringify(r?.notRecorded??null),JSON.stringify(r?.error??null)].join('\t'));fs.writeFileSync(path.join(OUT,'unplanned-'+name+'.json'),JSON.stringify(r,null,1)+'\n');return r;};
const t=athlete({newId,id:'ui-avulsa',weeks:12});t.enroll();
// A device run, then the athlete's contest of its distance (a declared distance with a stated failure reason).
const s=t.sessions(0).find(x=>x.sport==='RUN');t.set(s.date,'08:00');
const hk=step('4-device-run',t.import([t.watch(s,{actual:{distanceKm:12.5}})],{eligibility:ELIG(s.date)}));
t.set(s.date,'20:00');
step('5-athlete-contests-distance',t.weekly(s.date,[{...t.form(s),actual:{...t.form(s).actual,declared:{distanceKm:7,reason:'SIGNAL_LOSS'}}}]));
const rest=t.sessions(0)[0].date;const d=addDays(t.doc().program.startDate,5);t.set(d,'19:00');
step('1-unplanned-run-with-sport',t.weekly(d,[{occurrenceDate:d,actual:{completed:true,minutes:30,distanceKm:5,sport:'RUN',rpe:3},response:U}]));
step('2-unplanned-run-no-sport',t.weekly(d,[{occurrenceDate:d,actual:{completed:true,minutes:25},response:U}]));
step('3-unplanned-strength',t.weekly(d,[{occurrenceDate:d,actual:{completed:true,minutes:35,sport:'STRENGTH',exercises:[{id:'goblet-squat',sets:[{reps:8,load:{value:16,unit:'KG',convention:'SINGLE_IMPLEMENT'},rir:3}]}]},response:U}]));
step('6-history',t.api.history({actor:t.actor}));
step('7-presentation',t.it.presentation({actor:t.actor}));
fs.writeFileSync(path.join(OUT,'unplanned-00-log.tsv'),'step\tresult\tstatus\trecorded\tnotRecorded\terror\n'+log.join('\n')+'\n');
console.log(log.join('\n'));
const p=JSON.parse(fs.readFileSync(path.join(OUT,'unplanned-7-presentation.json')));console.log(JSON.stringify(Object.values(p.inForce).find(x=>x.sessionId===s.id).execution));
console.log(JSON.stringify(t.rows().filter(o=>!o.fact&&(!o.sessionId||o.context?.sessionType)).map(o=>({sport:o.actual?.sport,min:o.actual?.minutes,ctx:o.context}))).slice(0,400));
// What the record keeps of the unplanned reports (ids from the answers above).
const ids=log.map(l=>JSON.parse(l.split('\t')[3]??'null')).flat().filter(Boolean);
const kept=t.it.visible(t.doc()).filter(o=>ids.includes(o.eventId)).map(o=>({eventId:o.eventId,sessionId:o.sessionId??null,actual:o.actual,context:o.context?.sessionType??null}));
fs.writeFileSync(path.join(OUT,'unplanned-8-rows-kept.json'),JSON.stringify(kept,null,1)+'\n');
console.log('KEPT',JSON.stringify(kept).slice(0,900));
const raw=t.doc().rows.filter(r=>r&&ids.includes(r.eventId)).map(r=>r.eventId);
console.log('DOCROWS',JSON.stringify(raw),'IDS',JSON.stringify(ids));
console.log('VISIBLE_SRC',t.it.visible.toString().slice(0,300));
