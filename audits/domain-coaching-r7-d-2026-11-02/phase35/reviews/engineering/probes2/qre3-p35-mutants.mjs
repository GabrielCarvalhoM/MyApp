// QRE R7-D Phase 3.5 recheck (QRE-R7D-PHASE35-CHECK-r2, Q2/Q4): the mutants for candidate 33d3181. The role's r1 mutants (probes/qre2-p35-mutants.mjs,
// read unchanged; the FIX-DUP prototype is left out, since the candidate now holds it) plus QF1-QF7, exact text edits of the bounded cycle's own line in
// CoachingCore/src/r6-adaptation.mjs (returnAfterPause, the unnamed same-dates re-read). Each `from` must occur exactly once in the candidate.
import {MUTANTS as R1} from '../probes/qre2-p35-mutants.mjs';
const FIX=' else{const last=episodesOf(program).at(-1),dup=!named&&!!last&&(start??onDate(end,-(days-1)))===last.live.start&&end===last.live.end,r=last&&(named?(last.id===i.episodeId||last.reports.some(b=>b.eventId===i.episodeId)):dup)?recordedStop(ctx,last.live.eventId,{start,end,days,startedAt}):null;if(r?.decision)return r.decision;sep=r?.stop?{...r.stop,reread:true}:null;}';
const edit=(a,b)=>({from:FIX,to:FIX.replace(a,b)});
export const FIX_LINE=FIX;
export const MUTANTS=[
 ...R1.filter(m=>m.id!=='FIX-DUP'),
 // The cycle's fix reverted (the author's P35-M13, re-derived here): only a named report re-reads the recorded return.
 {id:'QF0',what:'QRE-P35-01 reverted: an unnamed same-dates report re-establishes the latest break alone',...edit('r=last&&(named?(last.id===i.episodeId||last.reports.some(b=>b.eventId===i.episodeId)):dup)?','r=last&&named&&(last.id===i.episodeId||last.reports.some(b=>b.eventId===i.episodeId))?')},
 {id:'QF1',what:'the duplicate test drops the end date (the same first day is enough)',...edit('===last.live.start&&end===last.live.end,','===last.live.start,')},
 {id:'QF2',what:'the duplicate test drops the first day (the same last day is enough)',...edit('dup=!named&&!!last&&(start??onDate(end,-(days-1)))===last.live.start&&end===last.live.end,','dup=!named&&!!last&&end===last.live.end,')},
 {id:'QF3',what:'the duplicate test reads only a stated first day (a report giving its last day and length is never a duplicate)',...edit('(start??onDate(end,-(days-1)))===last.live.start','start===last.live.start')},
 {id:'QF4',what:'every unnamed report re-reads the latest recorded return (no duplicate test)',...edit('dup=!named&&!!last&&(start??onDate(end,-(days-1)))===last.live.start&&end===last.live.end,','dup=!named&&!!last,')},
 {id:'QF5',what:'the unnamed re-read reads only a return with an own-return row (a TRAINING_AFTER row is dropped)',...edit('recordedStop(ctx,last.live.eventId,{start,end,days,startedAt}):null;','recordedStop(ctx,last.live.eventId,{start,end,days,startedAt},{onlyOwnReturn:!named}):null;')},
 {id:'QF6',what:'a decision of the unnamed re-read (a missing declaration ASK, a clinical route, a question) is ignored: the duplicate is read alone',...edit('if(r?.decision)return r.decision;','if(r?.decision&&named)return r.decision;')},
 {id:'QF7',what:'the duplicate test compares with the first report of the latest break, not the report in force',...edit('===last.live.start&&end===last.live.end,','===last.first.start&&end===last.first.end,')}
];
