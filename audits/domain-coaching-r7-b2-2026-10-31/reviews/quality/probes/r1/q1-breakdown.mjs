// R7B2-QUALITY-r1: per class-(b) exit x proposal source x choice breakdown of out/q1-enum.json (signal rows), and the plan-in-force dose summary
// of the changed rows. Reads only ./out/q1-enum.json; writes ./out/q1-breakdown.json.
import fs from 'node:fs';import path from 'node:path';import {fileURLToPath} from 'node:url';
const HERE=path.dirname(fileURLToPath(import.meta.url)),j=JSON.parse(fs.readFileSync(path.join(HERE,'out','q1-enum.json'),'utf8'));
const exitOf=r=>/^Training before the interruption/.test(r.freeze2.reason)?'lateEvidence':/^This report id already belongs/.test(r.freeze2.reason)?'reportIdentity':/^The race now falls on a date marked unavailable/.test(r.freeze2.reason)?'factualAsk':/^Block choices are made/.test(r.freeze2.reason)?'blockChoice':/^Some choices are not recognised/.test(r.freeze2.reason)?'unrecognisedChoice':r.freeze2.status;
const sourceOf=r=>!r.freeze2.proposal?'none':r.freeze2.disclosureIds.includes('RUN_QUALITY_GRADUATION_WITHDRAWN')?'graduationWithdrawal':'factualReplan';
const pathOf=r=>({A:'reportIdentity',A2:'reportIdentity',A3:'reportIdentity',B:'reportIdentity',B2:'reportIdentity',C1:'lateEvidence',C2:'lateEvidence',C3:'lateEvidence',D:'lateEvidence','D-2step':'lateEvidence',E:'factualAsk'})[r.group]??r.group;
const sig=j.grid.filter(r=>r.signal),tab={},byChoice={};
for(const r of sig){const k=`${pathOf(r)} | source=${sourceOf(r)} | ${r.cls}`;tab[k]=(tab[k]??0)+1;
 const ch=r.name.split(' | ').at(-1);if(r.cls.startsWith('QE01')){byChoice[ch]=byChoice[ch]??{rows:0,freeze2Exits:{}};byChoice[ch].rows++;const e=exitOf(r);byChoice[ch].freeze2Exits[e]=(byChoice[ch].freeze2Exits[e]??0)+1;}}
const dose={};for(const r of j.grid.filter(r=>r.cls!=='SAME')){const g=dose[r.cls+' '+r.group]??={rows:0,r7b2Proposals:0,sessionsDiffering:new Set(),rowsWithB2AboveF2:0,maxSessionsB2Above:0,maxSessionsB2Below:0,maxRunFamilyDiffers:0};
 g.rows++;if(r.r7b2.proposal)g.r7b2Proposals++;if(r.dose?.b2AboveF2)g.rowsWithB2AboveF2++;g.maxSessionsB2Above=Math.max(g.maxSessionsB2Above,r.dose?.b2AboveF2??0);g.maxSessionsB2Below=Math.max(g.maxSessionsB2Below,r.dose?.b2BelowF2??0);g.maxRunFamilyDiffers=Math.max(g.maxRunFamilyDiffers,r.dose?.runFamilyDiffers??0);g.sessionsDiffering.add(r.dose?.differing??0);}
for(const g of Object.values(dose))g.sessionsDiffering=[...g.sessionsDiffering];
const nonSignalChanged=j.grid.filter(r=>!r.signal&&r.cls!=='SAME').map(r=>({name:r.name,cls:r.cls,freeze2:r.freeze2.status,r7b2:r.r7b2.status,r7b2Reason:r.r7b2.reason}));
const out={source:'out/q1-enum.json',signalRows:sig.length,exitBySourceByClass:tab,qe01FamilyByChoice:byChoice,planInForceDose:dose,nonSignalChanged,
 invariants:{ledgerDiffers:j.grid.filter(r=>r.freeze2.ledger!==r.r7b2.ledger).length,proposalContentDiffers:j.grid.filter(r=>r.freeze2.proposal&&r.r7b2.proposal&&r.freeze2.proposal!==r.r7b2.proposal).length,
  r7b2ProposalOnChangedRow:j.grid.filter(r=>r.cls!=='SAME'&&r.r7b2.proposal).length,freeze2NotAskOnSignalRow:sig.filter(r=>r.freeze2.status!=='ASK').length,signalRowNotClinicalOnR7B2:sig.filter(r=>r.r7b2.status!=='CLINICAL_HUMAN_REQUIRED').length,
  changedRowPendingNotClinicalOnR7B2:j.grid.filter(r=>r.cls!=='SAME'&&r.signal&&r.r7b2.pending!=='CLINICAL_HUMAN_REQUIRED').length}};
fs.writeFileSync(path.join(HERE,'out','q1-breakdown.json'),JSON.stringify(out,null,1)+'\n');console.log(JSON.stringify(out,null,1));
