// R7AF-QE-r1 P36 (independent engineering judge, R7A-FINAL-FREEZE): the confirmation-first check (staleReturn, contract §5) runs before every
// non-return review while the latest return still sets the plan. Without any late pre-break evidence it must never ask (a false question
// blocks all planning). Grid: three return settings x the ordinary reviews of the re-entry week, each evaluated (not applied) on the state
// right after the return and after the re-entry days were logged. Counts the reviews answered with the confirmation question.
// Settings: R16 = default program, 16-day break reported Monday of week 5; FW-<cls> = first loaded week (NONE, FAMILIAR, KNOWN), Mon+Thu lifts
// logged, 14-day break from Saturday reported Saturday two weeks later; S6 = short 6-day break reported Monday of week 3.
// Synthetic data, DEV_TEST_ONLY authority, prints only.
import {H,at,on,obs,addDays,brk,lastR,print,copy,afterA,reportOn,peek,live} from './qe-r7af-lib.mjs';
const out={probe:'R7AF-QE-P36',runtime:process.env.QE_LIVE_ROOT?'QE_LIVE_ROOT':'LIVE',evaluated:0,staleAsks:[],otherAsks:{},statuses:{}};
const ATH={NONE:{strengthExperience:'NONE',recent:{runDaysPerWeek:3,runMinutesPerWeek:150,longestRunMinutes:70,strengthDaysPerWeek:0},knownExercises:[]},FAMILIAR:{knownExercises:[]},KNOWN:{}};
const settings=[];
{const {t,d0}=afterA('qaf-p36-r16');settings.push({name:'R16',t,w:5,day0:0,logged:s=>s.day<3});}
for(const cls of ['NONE','FAMILIAR','KNOWN']){
 const t=H.start({id:'qaf-p36-fw-'+cls,athlete:ATH[cls],schedule:{strengthDays:[0,3],runDays:[1,4,6],longRunDay:6}},0);
 const F=t.p.weeks.findIndex(x=>x.sessions.some(s=>s.sport==='STRENGTH'&&s.prescription?.exercises?.some(e=>e.load.mode!=='BODYWEIGHT'&&e.exposure?.kind!=='PRACTICE')));
 for(let w=0;w<F;w++)H.weekly(t,w);const d=t.p.weeks[F].startDate;
 H.weekly(t,F,s=>s.day<5);H.weekly(t,F+1,()=>false);H.ev(t,at(t.p,F+2,5,'06:00',brk(addDays(d,5),addDays(d,18))));
 settings.push({name:'FW-'+cls,t,w:F+2,day0:5,logged:s=>s.day===5});
}
{const t=H.start({id:'qaf-p36-s6'},3),d0=t.p.weeks[3].startDate;H.ev(t,at(t.p,3,0,'06:00',brk(addDays(d0,-6),addDays(d0,-1))));settings.push({name:'S6',t,w:3,day0:0,logged:s=>s.day<3});}
const REVIEWS=(t,w,day)=>{const wk=t.p.weeks[w],d=addDays(wk.startDate,day),fut=wk.sessions.filter(s=>s.prescription&&s.date>d),past=wk.sessions.filter(s=>live(s)&&s.date<=d);
 return {
  weeklyAll:at(t.p,w,6,'21:00',{kind:'WEEKLY_REVIEW',observations:wk.sessions.filter(live).map(s=>obs(t.p,s))}),
  weeklyNone:at(t.p,w,6,'21:00',{kind:'WEEKLY_REVIEW',observations:[]}),
  partial:at(t.p,w,day,'22:00',{kind:'PARTIAL_SESSION',observations:past.slice(0,1).map(s=>obs(t.p,s))}),
  missed:past[0]?at(t.p,w,day,'22:00',{kind:'MISSED_SESSION',targetSessionId:past[0].id}):null,
  systemic:at(t.p,w,day,'22:00',{kind:'SYSTEMIC_FATIGUE'}),
  local:at(t.p,w,day,'22:00',{kind:'LOCAL_FATIGUE',signals:{region:'LOWER'}}),
  schedule:at(t.p,w,day,'22:00',{kind:'SCHEDULE_CHANGE',changes:{strengthMinutes:45}}),
  equipPerm:at(t.p,w,day,'22:00',{kind:'EQUIPMENT_CHANGE',changes:{equipment:['DUMBBELLS','BENCH']}}),
  equipWindow:at(t.p,w,day,'22:00',{kind:'EQUIPMENT_CHANGE',changes:{equipment:['DUMBBELLS'],from:addDays(d,1),to:addDays(d,5)}}),
  goal:at(t.p,w,day,'22:00',{kind:'GOAL_CHANGE',changes:{goals:{strength:'GENERAL'}}}),
  unavailable:fut[0]?at(t.p,w,day,'22:00',{kind:'UNAVAILABLE_DAY',changes:{unavailableDates:[fut[0].date]}}):null
 };};
for(const S of settings){
 for(const phase of ['rightAfterReturn','afterReentryLogged']){
  const t=copy(S.t);let day=S.day0;
  if(phase==='afterReentryLogged'){const lastDay=Math.min(6,S.day0+2);H.ev(t,at(t.p,S.w,lastDay,'21:00',{kind:'PARTIAL_SESSION',observations:t.p.weeks[S.w].sessions.filter(s=>live(s)&&s.day>=S.day0&&s.day<=lastDay).map(s=>obs(t.p,s))}));out.statuses[`${S.name}/${phase}/log`]=t.last.status;day=lastDay;}
  for(const [k,rv] of Object.entries(REVIEWS(t,S.w,day))){if(!rv)continue;const r=peek(t,rv);out.evaluated++;out.statuses[`${S.name}/${phase}/${k}`]=r.status+'/'+r.action;
   if(r.status==='ASK'&&/Training before the interruption/.test(r.reason??''))out.staleAsks.push({setting:S.name,phase,review:k,reason:r.reason});
   else if(r.status==='ASK')out.otherAsks[`${S.name}/${phase}/${k}`]=r.missingInputs;}
 }
}
print(out);
