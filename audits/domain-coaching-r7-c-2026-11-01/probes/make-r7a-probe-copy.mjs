// Copies the closed R7-A class probe (audits/domain-coaching-r7a-2026-10-27/probes/r7a-class-probes.mjs) to a scratch
// location, re-pointing only its runtime base and its output file, so it runs read-only against any CoachingCore checkout
// without writing into the closed R7-A audit folder. The probe's predicates are R7-A CYCLE2-era (see PHASE1_CHECKPOINT D3).
// Usage:
//   node make-r7a-probe-copy.mjs <originalProbe> <scratchCopy>
//   R7C_BASE=<abs CoachingCore> R7C_OUT=<abs output.json> node <scratchCopy>
import { readFileSync, writeFileSync } from 'node:fs';
const [src, dest] = process.argv.slice(2);
if (!src || !dest) throw new Error('usage: make-r7a-probe-copy.mjs <originalProbe> <scratchCopy>');
let text = readFileSync(src, 'utf8');
const baseOld = "const base=PRE?path.resolve(import.meta.dirname,'../pre-r7a-source/CoachingCore'):path.resolve(import.meta.dirname,'../../../CoachingCore');";
const fileOld = "const file=path.join(import.meta.dirname,process.env.R7A_PROBE_OUT??'r7a-class-probes.out.json');";
for (const [needle, label] of [[baseOld, 'base'], [fileOld, 'file']]) {
  const count = text.split(needle).length - 1;
  if (count !== 1) throw new Error(`${label} line found ${count} times (expected exactly 1)`);
}
text = text.replace(baseOld, "if(!process.env.R7C_BASE)throw Error('R7C_BASE missing');const base=process.env.R7C_BASE;");
text = text.replace(fileOld, "if(!process.env.R7C_OUT)throw Error('R7C_OUT missing');const file=process.env.R7C_OUT;");
writeFileSync(dest, text);
console.log('copied with 2 replacements ->', dest);
