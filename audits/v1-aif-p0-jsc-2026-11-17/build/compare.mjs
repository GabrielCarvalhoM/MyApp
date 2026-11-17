// Comparison digests shared by the oracle (Node) and the bundle (device): they let a digest mismatch be classified without shipping every
// answer. Only the Race Forecast computes with Math.exp/Math.log/Math.pow, whose last bit may differ between engines' math libraries
// (lab ULP test: only runForecast moved). So, next to the exact digests:
//   sansForecast     the answer (or envelope) with every runForecast block removed: must ALWAYS match exactly;
//   forecastCoarse   the runForecast block with its own hashes removed and every non-integer number at 9 significant digits: must match.
// A mismatch of the exact digest with both of these matching is a math-library difference below what any forecast shows; anything else blocks.
import { digestOf } from '../../v1-app-integration-foundation-2026-11-16/harness/lib.mjs';

const HASH_KEYS = new Set(['hash', 'inputDigest']);
const strip = v => Array.isArray(v) ? v.map(strip) : (v && typeof v === 'object') ? Object.fromEntries(Object.entries(v).filter(([k]) => k !== 'runForecast').map(([k, x]) => [k, strip(x)])) : v;
const coarse = v => Array.isArray(v) ? v.map(coarse) : (v && typeof v === 'object') ? Object.fromEntries(Object.entries(v).filter(([k]) => !HASH_KEYS.has(k)).map(([k, x]) => [k, coarse(x)]))
  : (typeof v === 'number' && Number.isFinite(v) && !Number.isInteger(v)) ? Number(v.toPrecision(9)) : v;
const forecasts = (v, out = []) => { if (Array.isArray(v)) v.forEach(x => forecasts(x, out)); else if (v && typeof v === 'object') for (const [k, x] of Object.entries(v)) k === 'runForecast' ? out.push(coarse(x)) : forecasts(x, out); return out; };

export const comparisonDigests = (answer, envelope) => ({
  answerSansForecast: digestOf(strip(answer)), envelopeSansForecast: digestOf(strip(envelope)),
  forecastCoarse: digestOf([...forecasts(answer), ...forecasts(envelope)])
});
