// R7ASE-QE-r1 scratch (read-only): planning trajectory of the Saturday-only exercises after N reviewed weeks. Prints only.
import {H,print} from '../../domain-coaching-r7a-final-2026-10-28/reviews/qe-r7af-lib.mjs';
const N=Number(process.env.QE_N??5),t=H.start({id:'qse-traj'},N);
print(Object.fromEntries(['db-rdl','db-split-squat','back-squat'].map(id=>[id,t.p.stateTrace.map((s,i)=>{const e=s.strength.exercises[id];return `${i}:${e?e.mode+(e.load??'')+' t'+(e.loadTick??0)+' r'+e.reps+' s'+(e.sets??'-')+' bd'+(e.blocksDone??0):'-'}`;}).slice(N-1,N+5).join(' | ')])));
