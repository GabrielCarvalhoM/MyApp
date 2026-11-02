// P6-X2b: GEN, the first easy run of every week reported not done, every other session reported on its day; never reviewed (PERDAY: Sunday on
// Monday 06:00) against reviewed at the end of each week (TIMELY_REVIEWED), on every runtime in QE_ROOTS. Prints each week-start decision and
// the run doses of the next three weeks: the reference for QE-R7C-11 (FREEZE-3 never-reviewed against FREEZE-2 and the reviewed path).
// Usage: QE_ROOTS="F2=<archive a10cec0>;F3=<worktree>" node p6-x2b-reviewed-reference.mjs <absolute path of p6-lib.mjs>
import {pathToFileURL} from 'node:url';
const L=await import(pathToFileURL(process.argv[2]).href);
const {RUNTIMES,client,live,notDone,brief,runsOfWeek}=L;
for(const [name,R] of Object.entries(RUNTIMES)){
 const H=R.H,GEN={id:'p6x2-gen',weeks:12,goals:{run:'PERFORMANCE',strength:'GENERAL'},equipment:H.FULL,knownExercises:[H.K('back-squat',3,5,82.5)]};
 for(const family of ['PERDAY','TIMELY_REVIEWED']){
  const t=client(R,H.program(GEN));const lines=[];
  const firstEasy=w=>t.p.weeks[w].sessions.find(x=>x.sport==='RUN'&&x.role==='EASY'&&live(x))?.id;
  const rep=(w,s)=>s.id===firstEasy(w)?notDone(t.p,s):H.obs(t.p,s);
  for(let w=0;w<10;w++){
   const ss=t.p.weeks[w].sessions.filter(live);
   for(const d of [...new Set(ss.filter(s=>s.day<6).map(s=>s.day))].sort())t.step(w,{day:d,hour:'21:00:00',observations:ss.filter(s=>s.day===d).map(s=>rep(w,s))});
   const sat=t.p.weeks[w].sessions.filter(s=>live(s)&&s.day===6).map(s=>rep(w,s));
   const r=family==='PERDAY'?t.step(w+1,{day:0,hour:'06:00:00',observations:sat}):t.step(w,{day:6,hour:'21:00:00',observations:sat});
   const B=brief(r);lines.push(`${family==='PERDAY'?'w'+(w+1)+' d0':'w'+w+' review'} ${B.status}/${B.origin}/${B.validity} | w${w+1}: ${runsOfWeek(t.p,w+1)} | w${w+2}: ${runsOfWeek(t.p,w+2)} | w${w+3}: ${runsOfWeek(t.p,w+3)} | startProv w${w+1} ${t.p.weeks[w+1].startAuthority?.RUN?.provenance}`);
  }
  console.log('==',name,family);console.log(lines.join('\n'));
 }
}
