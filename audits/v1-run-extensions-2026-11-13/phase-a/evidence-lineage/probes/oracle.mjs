// The lineage contract as an oracle, written outside the runtime (diagnosis of 2026-11-14; not a fix and not part of CoachingCore).
// It reads the two records a caller keeps (the engine's record, the superseded rows as well; the record of report facts) and one thing those
// records do not hold yet: `reports`, every run report received for the session as [{id, speaker, at}] (`speaker`: 'ATHLETE', 'DEVICE:<activity
// id>', or null when it cannot be shown; `at`: when the record first held it, any comparable number). The fix-forward keeps it as one fact row
// per report received.
//
// The rule:
//   1. A report is in force until its own speaker replaces it. An applied correction (the engine's record shows it: a superseded row names it
//      in `supersededBy`) replaces every report of the same session by the same speaker that is in the lineage it retired, or that the record
//      first held at an earlier instant. It never replaces what another speaker said. What cannot be shown stays in force.
//   2. A row is handed to a reader of pace, capacity or a race result with its distance only if it carries every report in force for its
//      session (each is one of the reports the row was made of). Nothing a report said is enumerated for this.
//   3. On a row that carries them all, the reading is the runtime's own, unchanged: the kept distance facts of the row's reports.
const isObj=o=>!!o&&typeof o==='object'&&!Array.isArray(o);
const list=v=>Array.isArray(v)?v:[];
export const NOT_CARRIED='REPORT_NOT_CARRIED';
export const sourcesOf=row=>{const m=row?.provenance?.mergedSourceIds;return Array.isArray(m)&&m.length?[...new Set(m.filter(x=>typeof x==='string'))]:typeof row?.eventId==='string'?[row.eventId]:[];};
export const sameSpeaker=(a,b)=>typeof a==='string'&&typeof b==='string'&&a===b&&(a==='ATHLETE'||/^DEVICE:.+/.test(a));

/** Rule 1: the reports in force for one session. One pass over the session's rows and reports; the lineage walk never repeats a row. */
export function inForce({ledger,reports,sessionId,athleteId}){
 const rows=list(ledger).filter(o=>isObj(o)&&!o.fact&&o.athleteId===athleteId&&o.sessionId===sessionId);
 const known=new Map();for(const r of list(reports))if(!known.has(r.id)||r.at<known.get(r.id).at)known.set(r.id,r);
 const retiredBy=new Map();for(const o of rows)if(o.superseded===true&&typeof o.supersededBy==='string'){if(!retiredBy.has(o.supersededBy))retiredBy.set(o.supersededBy,[]);retiredBy.get(o.supersededBy).push(o);}
 const lineage=c=>{const seen=new Set(),out=new Set(),stack=[c];while(stack.length){const id=stack.pop();if(seen.has(id))continue;seen.add(id);for(const old of retiredBy.get(id)??[])for(const s of sourcesOf(old)){out.add(s);stack.push(s);}}out.delete(c);return out;};
 const replaced=new Map();
 for(const c of [...retiredBy.keys()].sort()){
  const mine=known.get(c);if(!mine||typeof mine.speaker!=='string')continue; // a correction the record of reports does not hold, or of no shown speaker, replaces nothing
  const above=lineage(c);
  for(const r of known.values())if(r.id!==c&&sameSpeaker(mine.speaker,r.speaker)&&(above.has(r.id)||r.at<mine.at)&&!replaced.has(r.id))replaced.set(r.id,c);
 }
 return {reports:[...known.keys()].filter(id=>!replaced.has(id)).sort(),replaced:Object.fromEntries([...replaced].sort()),applied:[...retiredBy.keys()].sort()};
}
/** Rule 3, the runtime's own reading: what the kept facts of a set of reports say about a distance, in the runtime's order of reasons. */
export function factsOf(formatRecord,ids,{sessionId,athleteId},V,FACT='RUN_REPORT_RECEIVED',EPS=1e-9){
 const of=new Set(ids);let several=false,corrected=false,untimed=false,shortest=Infinity,longest=-Infinity;
 for(const r of list(formatRecord)){if(!isObj(r)||r.fact!==FACT||r.athleteId!==athleteId||r.sessionId!==sessionId||!isObj(r.report)||!of.has(r.report.reportId))continue;const g=r.report;
  if(g.several)several=true;if(g.corrected)corrected=true;if(g.distanceKm!==null&&!g.timed)untimed=true;for(const k of [g.distanceKm,g.ownKm])if(k!==null){if(k<shortest)shortest=k;if(k>longest)longest=k;}}
 return several?'SEVERAL_RECORDINGS':corrected?'CORRECTED_MEASUREMENT':untimed?'DURATION_REQUIRED':shortest<V.tied.correctionFloorFraction*longest-EPS?'DISTANCE_DISPUTED':null;
}
/**
 * Rules 2 and 3 for one live row: why its distance is withheld from pace readers, or null.
 * `factsOnEveryReportInForce` is the weaker reading (the kept distance facts read on every report in force, carried or not), shown beside it:
 * it misses whatever a report said that is not a kept fact (d-other-statements.mjs).
 */
export function admission(row,x,V){
 const f=inForce(x),carried=new Set(sourcesOf(row)),notCarried=f.reports.filter(id=>!carried.has(id)),own=factsOf(x.formatRecord,[...carried],x,V);
 return {verdict:own??(notCarried.length?NOT_CARRIED:null),inForce:f.reports,notCarried,replaced:f.replaced,factsOnEveryReportInForce:factsOf(x.formatRecord,f.reports,x,V)};
}
