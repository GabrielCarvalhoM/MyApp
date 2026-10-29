// R7ASE-QE-r1 scratch (read-only): the default synthetic program's phases, blocks and db-rdl planning trajectory. Prints only.
import {H,print} from '../../domain-coaching-r7a-final-2026-10-28/reviews/qe-r7af-lib.mjs';
const t=H.start({id:'qse-phases'},0);
print({phases:t.p.phases.phases.map((p,i)=>i+':'+p).join(' '),blocks:t.p.blocks.map(b=>`${b.family} ${b.startWeek}-${b.endWeekExclusive}`),
 rdl:t.p.stateTrace.map((s,i)=>{const e=s.strength.exercises['db-rdl'];return `${i}:${e?e.mode+(e.load??'')+' t'+(e.loadTick??0)+' r'+e.reps:'-'}`;}).join(' ')});
