// Probe batch A4: rotation state against block-boundary and reason-based choices; substitution inside event phases. Read-only.
import {record,guard,done,program,reviewed,weekly,review,evaluateProgram,opts,FULL,live,obs,strengthIds,evalAt,apply,summary,R,P} from './lib.mjs';

// A12: an ACCESSORY ladder step accepted at a block boundary under EVERY_2_WEEKS. The calendar rotation must not take the athlete back to the
// configuration the step replaced (the ladder state is not undone on the calendar), and the accepted step must be what the slot prescribes.
guard('A12','rotation state vs an accepted ladder step',()=>{
 const tried=[];
 for(const [strength,eq,days] of [['GENERAL',['DUMBBELLS','BENCH'],[0,2,4]],['HYPERTROPHY',['DUMBBELLS','BENCH','BANDS'],[0,1,3,4]],['RUNNING_SUPPORT',['DUMBBELLS'],[0,2,4]],['GENERAL',[],[0,2,4]]]){
  const o={id:`e4-rot-${strength}-${eq.length}`,equipment:eq,goals:{run:'PERFORMANCE',strength},rotation:'EVERY_2_WEEKS',weeks:16,schedule:{strengthDays:days}};
  const t=reviewed(o,4),ob=t.p.weeks[4].sessions.filter(live).map(s=>obs(t.p,s));
  const at=evaluateProgram(t.p,{...review(t.p,4,{observations:ob}),actualLedger:t.ledger},opts);
  const offer=(at.offers??[]).find(x=>x.role==='ACCESSORY');if(!offer){tried.push({program:o.id,offers:(at.offers??[]).map(x=>`${x.from}->${x.to}:${x.role}`)});continue;}
  const acc=evaluateProgram(t.p,{...review(t.p,4,{observations:ob,choices:[{type:'LADDER_STEP',from:offer.from,to:offer.to}]}),actualLedger:t.ledger},opts);
  const P2=acc.proposal,cfg=R.configurationOf(offer.from),weeks=[];
  for(let w=5;w<12;w++)weeks.push({week:w,phase:P2.weeks[w].phase,ids:[...new Set(strengthIds(P2,w,e=>e.pattern===cfg.pattern&&e.role==='ACCESSORY'))]});
  const backToFrom=weeks.filter(x=>x.ids.includes(offer.from)&&!x.ids.includes(offer.to)).map(x=>x.week),missingTo=weeks.filter(x=>!x.ids.includes(offer.to)).map(x=>x.week);
  record('A12','rotation state vs an accepted ladder step',!backToFrom.length,
   'after an accepted accessory ladder step, the calendar rotation never puts the replaced configuration back in place of the step',
   {program:o.id,offer:`${offer.from} -> ${offer.to}`,decision:summary(acc),weeksBackToReplaced:backToFrom,weeksWithoutTheStep:missingTo,weeks});
  return;
 }
 record('A12','rotation state vs an accepted ladder step',true,'n/a (no accessory ladder offer found)',tried);
});

// A13: a reason-based substitution of a MAIN lift during the taper and race week of a 10K: is a never-performed configuration introduced there?
guard('A13','substitution inside event phases',()=>{
 const E={id:'e4-ev',goals:{run:'RACE',strength:'GENERAL'},event:{kind:'10K',date:'2027-02-14'},weeks:16,equipment:['DUMBBELLS','BENCH','KETTLEBELL'],rotation:'FIXED',recent:{runDaysPerWeek:4,runMinutesPerWeek:200,longestRunMinutes:70,strengthDaysPerWeek:2},schedule:{runDays:[1,3,5,6]}};
 const ph=program(E).phases.phases,tw=ph.indexOf('TAPER'),rw=ph.indexOf('RACE_WEEK');
 const t=reviewed(E,tw);
 const main=strengthIds(t.p,tw,e=>e.role==='MAIN')[0];
 const r=evaluateProgram(t.p,{...review(t.p,tw,{day:0,hour:'06:00:00',kind:'EXERCISE_SUBSTITUTION',substitution:{exerciseId:main,reason:'NONCLINICAL_DISCOMFORT_OR_PREFERENCE',nonclinicalConfirmed:true}}),actualLedger:t.ledger},opts);
 const performed=new Set(t.p.weeks.slice(0,tw).flatMap(w=>strengthIds(t.p,w.index)));
 const fresh=r.proposal?[tw,rw].flatMap(w=>r.proposal.weeks[w].sessions.filter(s=>live(s)&&s.sport==='STRENGTH').flatMap(s=>s.prescription.exercises.filter(e=>!performed.has(e.id)).map(e=>({week:w,phase:ph[w],id:e.id,role:e.role,mode:e.load.mode,sets:e.sets,rir:e.rir})))):[];
 record('A13','substitution inside event phases',r.status!=='MODIFY'||!fresh.length,
  'observation for the SSCTR: B0-C05 c1 keeps new exercises out of TAPER, RACE_WEEK and POST_EVENT; a reason-based substitution there either asks or introduces one (disclosed)',
  {taperWeek:tw,raceWeek:rw,replaced:main,decision:{...summary(r),selected:r.substitutions?.[0]?.selected??null},newConfigurationsInTaperOrRaceWeek:fresh});
});
done('a4-rotation');
