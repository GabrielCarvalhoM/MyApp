import { createHash } from 'node:crypto';

// JSON value semantics make snapshots independent of caller-owned references.
// V1 Coaching Integration Boundary QRE-FF-06: the canonical text is the JSON text of the value with its keys sorted, so a value and its JSON round trip
// (storage, transport, a restart of the app) hash the same. An object key whose value is not a JSON value (undefined, a function, a symbol) is left
// out, as JSON leaves it out, and such an array element (or a hole) is null; null stays null and is never read as an absent key; a number JSON cannot
// hold is null and a toJSON method applies, as in JSON. A JSON-stable value keeps exactly the text it had before this change.
export function canonical(value) {
  const v = value !== null && typeof value === 'object' && typeof value.toJSON === 'function' ? value.toJSON() : value;
  if (v === undefined || typeof v === 'function' || typeof v === 'symbol') return undefined;
  if (v === null || typeof v !== 'object') return JSON.stringify(v);
  if (Array.isArray(v)) return '[' + Array.from(v, x => canonical(x) ?? 'null').join(',') + ']';
  return '{' + Object.keys(v).sort().flatMap(k => { const c = canonical(v[k]); return c === undefined ? [] : [JSON.stringify(k) + ':' + c]; }).join(',') + '}';
}
export const hash = value => createHash('sha256').update(canonical(value)).digest('hex');
export const clone = value => structuredClone(value);
export function freeze(value) {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.freeze(value);
    Object.values(value).forEach(freeze);
  }
  return value;
}
