// Q-R7B probe 09b: what an EASY_UNKNOWN athlete is told (uncertainty, negotiation, gaps, feasibility) versus what the runtime does over
// 16 executed weeks (p09): is the permanent absence of quality, event-specific work and strides disclosed anywhere? Also the same
// athlete once the weekly minutes are reported (the only way out).
import fs from 'node:fs';
import {program,weekly} from '../../../../../CoachingCore/r7/b/fixtures/helpers.mjs';
import {runRepertoireOf} from '../../../../../CoachingCore/src/r7b-repertoire.mjs';
const fams=p=>[...new Set(p.weeks.flatMap(w=>w.sessions.filter(s=>s.prescription?.modality==='RUN').map(s=>runRepertoireOf(s.prescription)?.family+(s.prescription.strides?'+STRIDES':''))))];
const base={goals:{run:'RACE',strength:'NONE'},event:{kind:'10K',date:'2027-02-14'},schedule:{strengthDays:[],runMinutes:60},weeks:16};
const unk=program({id:'q9b-unknown',...base,recent:{runDaysPerWeek:3,runMinutesPerWeek:null,longestRunMinutes:null}});
const known=program({id:'q9b-known',...base,recent:{runDaysPerWeek:3,runMinutesPerWeek:150,longestRunMinutes:60}});
const t={p:unk,ledger:[]};const rd=[];for(let w=0;w<16;w++){const r=weekly(t,w);rd.push(...(r.disclosures??[]).map(d=>d.id));}
const told=p=>({uncertainty:p.uncertainty.map(u=>u.field+': '+u.category+' - '+u.action),negotiation:p.negotiation.map(n=>n.id+(n.detail?': '+n.detail.slice(0,140):'')),gaps:p.gaps,feasibility:{ideal:p.feasibility?.ideal,reductions:p.feasibility?.reductions,lost:p.feasibility?.lost??p.feasibility?.protectedLost??null},coldStart:p.coldStart?.run,classification:p.classification?.run});
const out={unknown:{class:unk.capability.run.class,families:fams(unk),familiesAfter16ExecutedWeeks:fams(t.p),reviewDisclosures:[...new Set(rd)],...told(unk)},known:{class:known.capability.run.class,families:fams(known)}};
fs.writeFileSync(new URL('./out/p09b-easy-unknown-disclosure.json',import.meta.url),JSON.stringify(out,null,1));
console.log(JSON.stringify(out,null,1));
// Executed evidence the reviews saw: planned (= executed, all sessions completed as prescribed) run minutes and run days per week.
const ev=t.p.weeks.map(w=>({w:w.index,phase:w.phase,runMinutes:w.plannedRunMinutes,runDays:w.sessions.filter(s=>s.sport==='RUN'&&s.prescription&&s.status!=='SKIPPED').length,mode:t.p.stateTrace[w.index]?.run?.mode}));
fs.writeFileSync(new URL('./out/p09b-easy-unknown-evidence.json',import.meta.url),JSON.stringify(ev,null,1));
console.log(JSON.stringify(ev));
