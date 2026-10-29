// QRE probe Q2b: which parts of an evaluation change when only the ICU collation locale differs (child per locale).
import {spawnSync} from 'node:child_process';
const loc=process.argv[2];
if(loc){if(loc!=='default'){const lc=String.prototype.localeCompare;String.prototype.localeCompare=function(b,_l,o){return lc.call(this,b,loc,o);};}
 const {R6,hash,baseIntake,review,obsFor,sessionsOf}=await import('./qlib.mjs');
 const p=R6.generateProgram(baseIntake({id:'q-shared',schedule:{runDays:[1,3,5],strengthDays:[1,3],runTurn:'PM',strengthTurn:'PM',longRunDay:5}})).program;
 const w0=sessionsOf(p).filter(s=>s.weekIndex===0&&s.prescription);
 const obs=w0.map((s,i)=>obsFor(p,s,{eventId:['Zeta-1','alpha-2','Älpha-3','z-4','ch-5','y-6'][i%6]+'-'+s.id,observedAt:s.date+'T12:00:00Z'}));
 const r=R6.evaluateProgram(p,review(p,0,{observations:obs}));
 process.stdout.write(JSON.stringify({status:r.status,action:r.action,proposal:hash(r.proposal),ledgerOrder:r.actualLedger.map(o=>o.eventId),ledgerSet:hash([...r.actualLedger].sort((a,b)=>a.eventId<b.eventId?-1:1)),model:r.updatedModel.hash,trace:r.trace}));process.exit(0);}
const run=l=>JSON.parse(spawnSync(process.execPath,[import.meta.filename,l],{encoding:'utf8'}).stdout);
const d=run('default'),e=run('et'),s=run('sv');
const out={default:d,et:e,sv:s,sameDecision:d.status===e.status&&d.action===e.action&&d.proposal===e.proposal&&d.proposal===s.proposal,sameLedgerSet:d.ledgerSet===e.ledgerSet,ledgerOrderDiffers:JSON.stringify(d.ledgerOrder)!==JSON.stringify(e.ledgerOrder),modelHashDiffers:d.model!==e.model||d.model!==s.model};
(await import('./qlib.mjs')).write('q2b-collation-detail.out.json',out);
console.log(JSON.stringify({sameDecision:out.sameDecision,sameLedgerSet:out.sameLedgerSet,ledgerOrderDiffers:out.ledgerOrderDiffers,modelHashDiffers:out.modelHashDiffers,defaultOrder:d.ledgerOrder.map(x=>x.split('-')[0]),etOrder:e.ledgerOrder.map(x=>x.split('-')[0])}));
