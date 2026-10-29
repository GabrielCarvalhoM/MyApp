// QRE probe Q6b: event-transition proximity across every race weekday offset (raceDay 0-6), event kind, race week index
// and chosen days. Checks: no lower-body MODERATE/HEAVY strength within raceWeekStrengthMinDaysBeforeRace days before the
// race (any phase), no LONG/QUALITY/RACE_TOUCH the day before the race, no run within postEventFirstRunMinDaysAfterRace
// after it. Real authority.
import {R6,baseIntake,sessionsOf,write,addDays,loadR6Policy} from './qlib.mjs';
const E=loadR6Policy().operational.event;
const gap=(a,b)=>(Date.parse(b)-Date.parse(a))/864e5;
const DAYSETS=[{runDays:[1,3,6],strengthDays:[0,4],longRunDay:6},{runDays:[0,2,4,6],strengthDays:[1,5],longRunDay:6},{runDays:[2,4,5],strengthDays:[3,6],longRunDay:5},{runDays:[0,3,5],strengthDays:[0,3,6],longRunDay:0},{runDays:[1,2,4,6],strengthDays:[1,4,6],longRunDay:4,runTurn:'AM',strengthTurn:'PM'}];
const KNOWN=[{id:'back-squat',sets:3,reps:5,load:{value:80,unit:'KG',convention:'TOTAL'},rir:2,current:true,familiar:true,tolerated:true,observedAt:'2026-10-29'},{id:'barbell-rdl',sets:3,reps:6,load:{value:90,unit:'KG',convention:'TOTAL'},rir:2,current:true,familiar:true,tolerated:true,observedAt:'2026-10-29'}];
const violations=[],stats={programs:0,statuses:{}};
for(const kind of ['10K','HALF_MARATHON'])for(const raceWeek of [3,5,7,10])for(let raceDay=0;raceDay<7;raceDay++)for(const [di,days] of DAYSETS.entries())for(const strength of ['STRENGTH','RUNNING_SUPPORT','MAINTAIN']){
 const input=baseIntake({id:`q-rp-${kind}-${raceWeek}-${raceDay}-${di}-${strength}`,weeks:12,athlete:{goals:{run:{kind:'RACE',event:{kind,date:addDays('2026-11-02',raceWeek*7+raceDay)}},strength},knownExercises:KNOWN,recent:{runDaysPerWeek:3,runMinutesPerWeek:150,longestRunMinutes:70}},schedule:{runMinutes:60,longRunMinutes:100,strengthMinutes:60,runTurn:'AM',strengthTurn:'PM',...days}});
 const g=R6.generateProgram(input);stats.statuses[g.status]=(stats.statuses[g.status]??0)+1;if(!g.program)continue;stats.programs++;
 const P=g.program,race=sessionsOf(P).find(s=>s.role==='RACE');if(!race){violations.push({id:'raceMissing',input:input.athlete.id});continue;}
 for(const s of sessionsOf(P).filter(s=>s.prescription)){const d=gap(race.date,s.date),phase=P.weeks[s.weekIndex].phase;
  if(s.sport==='STRENGTH'&&d<0&&-d<E.raceWeekStrengthMinDaysBeforeRace){const lower=s.prescription.exercises.filter(e=>e.region==='LOWER'&&['MODERATE','HEAVY'].includes(e.lowerDemand)&&e.sets>=2);violations.push({id:lower.length?'lowerStrengthWithinMinDaysBeforeRace':'anyStrengthWithinMinDaysBeforeRace',athlete:input.athlete.id,session:s.id,phase,daysBefore:-d,exercises:s.prescription.exercises.map(e=>`${e.id}x${e.sets}@${e.load.mode}${e.load.value??''}`)});}
  if(s.sport==='RUN'&&['LONG','QUALITY','RACE_TOUCH'].includes(s.role)&&d<0&&-d<2)violations.push({id:'keyRunDayBeforeRace',athlete:input.athlete.id,session:s.id,role:s.role,phase,minutes:s.prescription.durationMinutes});
  if(s.sport==='RUN'&&s.role!=='RACE'&&d>0&&d<E.postEventFirstRunMinDaysAfterRace)violations.push({id:'runTooSoonAfterRace',athlete:input.athlete.id,session:s.id,daysAfter:d});
 }
}
const byId={};for(const v of violations)(byId[v.id]??=[]).push(v);
const dist={};for(const v of violations){const k=v.id+'|'+(v.phase??'')+'|raceDay'+v.athlete?.split('-')[4]+'|wk'+v.athlete?.split('-')[3];dist[k]=(dist[k]??0)+1;}
const out={dist,probe:'Q6b-race-proximity',authorityUsed:'REAL r6Authority()',stats,counts:Object.fromEntries(Object.entries(byId).map(([k,v])=>[k,v.length])),examples:Object.fromEntries(Object.entries(byId).map(([k,v])=>[k,v.slice(0,6)]))};
write('q6b-race-proximity.out.json',out);console.log(JSON.stringify({stats,counts:out.counts},null,0));for(const [k,v] of Object.entries(out.examples))console.log(k,JSON.stringify(v.slice(0,3)));
