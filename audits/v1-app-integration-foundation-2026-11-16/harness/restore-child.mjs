// Cold restore in a fresh process: read the persisted envelope, show the first screen from it without calling the engine, then apply the week's
// review and print the digests the parent compares with its own in-memory continuation.
import {createClient,restore,todayView,digestOf} from './lib.mjs';
import {weekFacts} from './scenario.mjs';
const [file,week,nowIso]=process.argv.slice(2),t0=performance.now();
const o=restore(file);if(!o.ok){console.log(JSON.stringify({ok:false,error:o.error}));process.exit(0);}
const t1=performance.now(),first=todayView(o.envelope,{nowMs:Date.parse(nowIso)}),t2=performance.now();
const c=createClient({envelope:o.envelope}),{asOf,facts}=weekFacts(c.envelope,Number(week)),r=c.review('WEEKLY_REVIEW',asOf,facts,{eventId:`week-${week}`});
console.log(JSON.stringify({ok:true,restoreMs:t1-t0,firstViewMs:t2-t1,firstViewState:first.state,answer:digestOf(r),envelope:digestOf({...c.envelope,decisions:c.envelope.decisions.length})}));
