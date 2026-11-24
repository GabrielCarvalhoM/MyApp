// SSCTR O-1 R1 probe: an athlete's ADVERSE response on a head-on dispute (completed with other minutes vs device), both orders, then the device re-sync:
// the week's adverseSessions and the row's kind source, on one tree. Uses the v1rws-lineage.test.mjs context. Synthetic.
import fs from 'node:fs';import path from 'node:path';import {pathToFileURL} from 'node:url';
const [root,scratch,testFile]=process.argv.slice(2);const here=path.join(root,'test');let src=fs.readFileSync(testFile,'utf8');
const NEEDLE="import test from 'node:test';";
const tail=`
const go=(order,resync)=>{
 const t=timeline(sixteen());t.week(0,()=>({pace:340,rpe:4}));
 const s=t.runsOf(1,q=>q.role==='EASY')[0],min=s.prescription.durationMinutes;let rest=t.p.weeks[1].sessions.filter(live).filter(q=>q.id!==s.id).map(q=>report(t.p,q,q.sport==='RUN'?{pace:340,rpe:4}:{}));
 const review=(obs,time)=>{const r=t.step(1,6,'WEEKLY_REVIEW',{observations:[...rest,...obs]},time);rest=[];return r;};
 const dev=id=>({eventId:id,athleteId:t.p.athleteId,sessionId:s.id,occurrenceDate:s.date,canonicalActivityId:'hk-1',source:{provider:'HEALTHKIT',activityId:'hk-1',quality:'WEARABLE_FULL'},actual:{completed:true,minutes:min},response:UNKNOWN});
 const app={...report(t.p,s,{rpe:6,response:{effort:'HARDER',recovery:'ADVERSE'}}),eventId:'app-x'};app.actual={...app.actual,completed:true,minutes:min+20};
 const seq=order==='device first'?[dev('dev-x'),app]:[app,dev('dev-x')];
 review([seq[0]],'18:00');review([seq[1]],'19:00');
 if(resync)review([{...dev('dev-x-v2'),correctionOf:'dev-x',correctedAt:t.day(1,6)+'T20:30:00-03:00'}],'21:00');
 const r=t.results.at(-1),row=t.row(s.id);
 return [order,resync?'+resync':'',row?.eventId,row?.conflicted===true,row?.response?.recovery,r.weekEvidence?.adverseSessions,r.weekEvidence?.conflicted];
};
for(const o of ['device first','athlete first'])for(const rs of [false,true])console.log(JSON.stringify(go(o,rs)));`;
const b=src.replace(NEEDLE,'const test=()=>{};').replaceAll("from './","from '"+pathToFileURL(here).href+'/').replaceAll("from '../","from '"+pathToFileURL(root).href+'/')+tail;
const dir=fs.mkdtempSync(path.join(scratch,'adv-')),file=path.join(dir,'p.mjs');fs.writeFileSync(file,b);await import(pathToFileURL(file).href);
