// P6-M witness: the surviving mutants J-M2 (REGRESS not counted as an executed run gate) and J-M8 (the recorded re-plan before the ceiling re-plan),
// each applied to an ISOLATED copy (argv[2]) in a child process and restored by bytes, on three cells: GEN week 7, every gap run done with an
// adverse response (RV), and known stops (RV, NR); clinical substitution, cleared, plain review day 3; against the direct answer.
// Usage: node p6-m-witness.mjs <isolated copy root> "" <absolute path of p6-lib.mjs>
// Witness cells for J-M2 and J-M8 on an isolated copy (argv[2]); each mutant applied in a child process, the copy restored by bytes.
import fs from 'node:fs';import path from 'node:path';import {spawnSync} from 'node:child_process';import {pathToFileURL} from 'node:url';
const root=path.resolve(process.argv[2]),file=path.join(root,'CoachingCore/src/r6-adaptation.mjs'),orig=fs.readFileSync(file,'utf8');
if(root.toLowerCase().includes('worktrees'))throw Error('refusing');
const M={none:null,'J-M2':["keys.some(k=>['ADVANCE','EARNED','REGRESS'].includes(g[k]))","keys.some(k=>['ADVANCE','EARNED'].includes(g[k]))"],'J-M8':["const recorded=!moved&&!answered&&!overCeiling&&!ctx.noCeiling&&answeredOnRecord(ctx);\n const origin=moved?'MOVED':answered?'ANSWERED':overCeiling?'CEILING':'RECORDED';","const recorded=!moved&&!answered&&!ctx.noCeiling&&answeredOnRecord(ctx);\n const origin=moved?'MOVED':answered?'ANSWERED':recorded?'RECORDED':'CEILING';"]};
const child=process.argv[3];
if(child){
 const L=await import(pathToFileURL(process.argv[4]).href);const {RUNTIMES,client,live,notDone,BAD,brief,runsFromDay}=L;const R=Object.values(RUNTIMES)[0],H=R.H;
 const GEN={id:'p6w-gen',weeks:12,goals:{run:'PERFORMANCE',strength:'GENERAL'},equipment:H.FULL,knownExercises:[H.K('back-squat',3,5,82.5)]};
 const strengthOf=(p,w)=>p.weeks[w].sessions.filter(s=>live(s)&&s.sport==='STRENGTH').map(s=>H.obs(p,s));const out=[];
 for(const [V,mode] of [['ALL_ADVERSE','RV'],['MISS','NR'],['MISS','RV']]){
  const b=7,t=client(R,H.program(GEN));if(mode==='RV')for(let w=0;w<b-1;w++)t.step(w,{observations:strengthOf(t.p,w)});t.step(b-1,{observations:mode==='NR'?Array.from({length:b},(_,w)=>w).flatMap(w=>strengthOf(t.p,w)):strengthOf(t.p,b-1)});
  const facts=t.p.weeks.slice(0,b).flatMap(x=>x.sessions.filter(s=>live(s)&&s.sport==='RUN')).map(s=>V==='MISS'?notDone(t.p,s):H.obs(t.p,s,{response:BAD}));
  const d=t.copy();d.step(b,{day:2,hour:'07:00:00',observations:facts});d.step(b,{day:3,hour:'07:00:00'});
  const X=t.p.weeks[b].sessions.filter(s=>live(s)&&s.sport==='STRENGTH').flatMap(s=>s.prescription.exercises.map(e=>e.id))[0];
  t.step(b,{day:2,hour:'07:00:00',kind:'EXERCISE_SUBSTITUTION',substitution:{exerciseId:X,reason:'SKILL_MISMATCH',pain:true},observations:facts});t.ref=null;
  const r=t.step(b,{day:3,hour:'07:00:00'});out.push({cell:`GEN b=7 g=0 ${mode} ${V} CSUB, cleared, plain day 3`,carried:{...brief(r),runs:runsFromDay(t.p,b,3)},direct:runsFromDay(d.p,b,3)});
 }
 console.log(JSON.stringify(out));process.exit(0);
}
const res={};
for(const [id,edit] of Object.entries(M)){
 if(edit){if(orig.split(edit[0]).length!==2)throw Error('anchor '+id);fs.writeFileSync(file,orig.replace(edit[0],edit[1]));}
 const r=spawnSync(process.execPath,[process.argv[1],root,'child',process.argv[4]??''],{encoding:'utf8',env:{...process.env,QE_ROOTS:'M='+root.split(String.fromCharCode(92)).join('/')}});
 fs.writeFileSync(file,orig);res[id]=r.status===0?JSON.parse(r.stdout):{error:r.stderr.slice(0,500)};
}
console.log(JSON.stringify({restored:fs.readFileSync(file,'utf8')===orig,res},null,1));
