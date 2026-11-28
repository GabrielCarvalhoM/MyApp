import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdirSync, mkdtempSync, writeFileSync, appendFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { verifyRecord } from '../visual.mjs';

function record({ verdict = 'PENDING', differences = [], result = 'ok', withFigma = true, command = 'run', png = true } = {}) {
  const dir = mkdtempSync(join(tmpdir(), 'visual-'));
  writeFileSync(join(dir, 'record.json'), JSON.stringify({ screen: 's', figma: { nodeId: '1:2' }, verdict, differences,
    requiredConditions: [{ locale: 'pt_BR', appearance: 'light', contentSize: 'default' }] }));
  if (withFigma) writeFileSync(join(dir, 'figma.png'), 'ref');
  const cap = join(dir, 'captures', 'run1');
  mkdirSync(cap, { recursive: true });
  if (png) writeFileSync(join(cap, 'shot.png'), 'pixels');
  const sha = createHash('sha256').update('pixels').digest('hex');
  writeFileSync(join(cap, 'manifest.json'), JSON.stringify({ target: 'simulator', command, result, locale: 'pt_BR', appearance: 'light', contentSize: 'default', screenshots: { 'shot.png': sha } }));
  return { dir, cap };
}

test('a complete record with a real capture may claim MATCHES', () => {
  const v = verifyRecord(record({ verdict: 'MATCHES' }).dir);
  assert.deepEqual(v.errors, []);
  assert.deepEqual(v.pending, []);
});

test('an edited screenshot, a failed run or open differences are violations', () => {
  const r = record({ verdict: 'MATCHES' });
  appendFileSync(join(r.cap, 'shot.png'), 'x');
  assert.match(verifyRecord(r.dir).errors.join(), /hash/);
  assert.match(verifyRecord(record({ result: 'build_failed' }).dir).errors.join(), /build_failed/);
  assert.match(verifyRecord(record({ verdict: 'MATCHES', differences: [{ status: 'open' }] }).dir).errors.join(), /diferença/);
  assert.match(verifyRecord(record({ verdict: 'MATCHES', withFigma: false }).dir).errors.join(), /Figma/);
});

test('a capture without screenshots, or from a run that never opened the app, cannot cover a condition (review R1 #11)', () => {
  assert.match(verifyRecord(record({ verdict: 'MATCHES', png: false }).dir).errors.join(), /nenhuma screenshot/);
  assert.match(verifyRecord(record({ verdict: 'MATCHES', command: 'test' }).dir).errors.join(), /não abre o app/);
});
