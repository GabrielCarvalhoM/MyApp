// QRE R7-D Phase 3.4: time-zone metamorphic check of the new code paths (own return point, the re-entry week cut, race keys). The harness client
// states every clock in the athlete's local time with its offset, so the same case with the intake's timezoneOffsetMinutes changed must decide the
// same: per step the action, the return's placements, class and days, and every live session's dose.
//   node qre-p34-tz.mjs <harness dir> <runtime root> --label <name> [--out <file>]
import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';

const [harness,root]=process.argv.slice(2),arg=k=>{const i=process.argv.indexOf(k);return i>=0?process.argv[i+1]:null;};
const label=arg('--label')??'unlabelled',outFile=arg('--out');
const {loadRuntime,runCase}=await import(pathToFileURL(path.join(harness,'lib/client.mjs')).href);
const rt=await loadRuntime(path.join(root,'CoachingCore'));
const dev=JSON.parse(fs.readFileSync(path.join(harness,'validation/DEV_CASES_R7D_6.json'),'utf8'));
// The multi-break cases of validation 6 that state no instant (startedAt/observedAt are absolute and would need shifting).
const IDS=dev.cases.filter(c=>c.timeline.filter(s=>s.event?.interruption).length>=2&&!JSON.stringify(c.timeline).includes('startedAt')&&!JSON.stringify(c.timeline).includes('observedAt')).map(c=>c.caseId);
const live=s=>!!s?.prescription&&s.status!=='SKIPPED';
const view=t=>t.steps.map(s=>{const ret=(s.adopted?(s.planAfter.decisions??[]).slice((s.planBefore.decisions??[]).length):[]).filter(d=>d.action==='REESTABLISH').at(-1)?.interruption;
 return {step:s.stepId,action:s.result.action,ret:ret?{start:ret.startDate,end:ret.endDate,days:ret.days,cls:ret.class,mode:ret.entry?.run?.mode,stops:(ret.separateBreaks??[]).map(b=>b.stop+(b.ownReturn?':'+b.ownReturn.class+':'+b.ownReturn.returnDay+':'+b.ownReturn.reentered.RUN+':'+b.ownReturn.reentered.STRENGTH:''))}:null,
  doses:(s.planAfter.weeks??[]).flatMap(w=>w.sessions.filter(live).map(x=>x.id+'='+(x.sport==='RUN'?x.prescription.durationMinutes:(x.prescription.exercises??[]).map(e=>`${e.sets}x${e.reps}@${e.load?.value??e.load?.mode}`).join(','))))};});
const out={probe:'QRE-P34-TZ-1',label,offsets:[0,-180,540],cases:{}};
for(const id of IDS){
 const kase=dev.cases.find(c=>c.caseId===id),views={};
 for(const tz of out.offsets){const k=structuredClone(kase);k.intake.timezoneOffsetMinutes=tz;const t=runCase(rt,k);views[tz]={stopped:t.stopped,errors:[...t.corpusErrors,...t.runtimeErrors].map(e=>e.message),v:view(t)};}
 const base=JSON.stringify(views[0].v),diff=out.offsets.filter(tz=>JSON.stringify(views[tz].v)!==base);
 out.cases[id]={equal:!diff.length,differs:diff,...(diff.length?{detail:Object.fromEntries(out.offsets.map(tz=>[tz,{stopped:views[tz].stopped,errors:views[tz].errors,steps:views[tz].v.map(x=>({step:x.step,action:x.action,ret:x.ret}))}]))}:{})};
}
out.summary={cases:IDS.length,equal:Object.values(out.cases).filter(c=>c.equal).length,differ:Object.entries(out.cases).filter(([,c])=>!c.equal).map(([k])=>k)};
const text=JSON.stringify(out,null,1);
if(outFile)fs.writeFileSync(outFile,text+'\n');else console.log(text);
console.error(JSON.stringify(out.summary));
