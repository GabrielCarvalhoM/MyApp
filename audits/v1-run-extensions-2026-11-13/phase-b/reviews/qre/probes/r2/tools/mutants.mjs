// R2 mutants of the lines the corrective cycle added (0d3015b), plus the R1 survivors the cycle said it closed or left.
const IX = 'src/v1-run-forecast-index.mjs';
export const MUTANTS = [
 ['N01', IX, "return [...seen.values()].some(x=>x.before&&x.since)?'REPORTS':", "return false?'REPORTS':", 'week never withdrawn on changed reports'],
 ['N02', IX, "&&!!created&&recordedDay(o,tz)>=created;};", "&&!!created;};", 'own: first-recorded-after-the-plan check dropped'],
 ['N03', IX, "&&o.localDate>=startOf(s.weekIndex)&&o.localDate<=onDate(startOf(s.weekIndex),6)", "", 'own: inside-its-week check dropped'],
 ['N04', IX, "(delivered.get(sessionId)??[]).filter(x=>x.day<=onDay).at(-1)", "(delivered.get(sessionId)??[]).at(-1)", 'delivered band: a format recorded after the run is read'],
 ['N05', IX, "return b&&b.domain===domain?", "return b?", 'delivered band: domain not checked'],
 ['N06', IX, "b.days>=r.RC.withdrawal.breakDaysWithdrawMin&&b.to>=r.asOfDay", "b.days>=r.RC.withdrawal.breakDaysWithdrawMin&&b.from>=r.asOfDay", 'break withdrawal only before the break starts'],
 ['N07', IX, "forPair:p.tier==='HIGH'&&", "forPair:", 'pair from any tier'],
 ['N08', IX, "||underHold(week.index),planned:", ",planned:", 'hold weeks credited'],
 ['N09', IX, "return changed==='REPORTS'?'REPORTS_CHANGED_SINCE_THE_WEEK_STARTED':changed==='BREAK'?'BREAK_DECLARED_SINCE_THE_WEEK_STARTED':null;", "return null;", 'insights never withdrawn on changes'],
 ['N10', IX, "const changed=now?r.changedSince(started?weekStart:onDate(asOfDay,1)):null;", "const changed=null;", 'forecast never withdrawn on changes'],
 ['N11', IX, "f.inputHash===hash(f.format)&&", "", 'delivered band: unsealed format rows read'],
 ['N12', IX, "const bandAt=(domain,e)=>e.band??null;", "const bandAt=(domain,e)=>e.band??{fastSecondsPerKm:300,slowSecondsPerKm:320};", 'a session with no delivered band votes'],
 // R1 survivors
 ['E03', IX, "(e.paceEvidence===false?'NOT_PACE_EVIDENCE':null)", "null", 'paceEvidence false admitted'],
 ['E08', IX, "const internal=options=>{const {[F.BAND_OF]:_never,...rest}=isObj(options)?options:{};return rest;};", "const internal=options=>isObj(options)?options:{};", 'caller band hook passes'],
 ['E15', IX, "!asOf||Date.parse(asOf)<held.last?'REVIEW_BEFORE_THE_RECORD'", "!asOf?'REVIEW_BEFORE_THE_RECORD'", 'answer earlier than the record kept'],
 ['E16', IX, "experience=known?(program.capability?.run?.experience??athlete.runExperience??null):null;", "experience=program.capability?.run?.experience??athlete.runExperience??null;", 'stored NOVICE read as known (L-4)'],
 ['P11', 'src/v1-pace-insights.mjs', "if(!(total>0)||e.admitted!==true)continue;", "if(!(total>0))continue;", 'withheld pace reaches the revision ending rule'],
];
