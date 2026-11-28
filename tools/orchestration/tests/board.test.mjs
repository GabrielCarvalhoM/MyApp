import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { APPROVAL_LABEL, FIELDS, FLAG_FIELDS, labelsFor, transitionError, validateValue } from '../lib/board.mjs';
import { parseBacklog, renderBody } from '../lib/backlog-parse.mjs';
import { similarTitles } from '../lib/dedupe.mjs';

test('the board fields are the founder’s list (plus Integrated and Validação, documented)', () => {
  assert.deepEqual(FIELDS.Tipo.options, ['Feature', 'Bug Fix', 'Refactor', 'Optimization', 'Test', 'Design', 'Infrastructure', 'Research']);
  assert.deepEqual(FIELDS['Área'].options, ['iOS Frontend', 'Backend', 'CoachingCore', 'HealthKit', 'RunRecorder', 'Strength', 'UX/UI', 'DevOps']);
  assert.deepEqual(FIELDS.Prioridade.options, ['P0', 'P1', 'P2', 'P3']);
  assert.deepEqual(FIELDS.Frente.options, ['A', 'B', 'C', 'Design', 'Integration']);
  assert.deepEqual(FIELDS.Release.options, ['V1', 'V1.1', 'V2']);
  assert.deepEqual(FIELDS.Status.options, ['Backlog', 'Founder Decision', 'Ready', 'In Progress', 'Blocked', 'In Review', 'Ready to Integrate', 'Integrated', 'Verified']);
});

test('implemented ≠ validated: Verified needs a real validation and evidence', () => {
  assert.match(transitionError('Verified', { validation: 'Não validado', evidence: 'x' }), /Validação/);
  assert.match(transitionError('Verified', { validation: 'Simulador', evidence: ' ' }), /Evidências/);
  assert.equal(transitionError('Verified', { validation: 'iPhone', evidence: 'https://…/manifest.json' }), null);
  assert.match(transitionError('Verified', { validation: 'Simulador', evidence: 'x', figma: 'NOT_VERIFIED' }), /Figma = MATCH/);
  assert.match(transitionError('Verified', { validation: 'Simulador', evidence: 'x', figma: 'MISMATCH' }), /Figma = MATCH/);
  assert.equal(transitionError('Verified', { validation: 'Simulador', evidence: 'x', figma: 'MATCH' }), null);
  assert.equal(transitionError('Verified', { validation: 'Simulador', evidence: 'x', figma: 'Não se aplica' }), null);
  assert.match(transitionError('Integrated', {}), /Integrated exige Evidências/);
  assert.equal(transitionError('Integrated', { evidence: 'PR #89 integrado; sim.sh 86/86' }), null);
});

test('new scope waits for the founder: only Backlog or Blocked', () => {
  const labels = [APPROVAL_LABEL];
  assert.match(transitionError('Ready', { labels }), /fundador/);
  assert.match(transitionError('In Progress', { labels }), /fundador/);
  assert.equal(transitionError('Blocked', { labels }), null);
  assert.equal(transitionError('Founder Decision', { labels }), null);
  assert.equal(labelsFor({ status: 'Founder Decision' }).includes('status:founder-decision'), true);
  assert.match(transitionError('Done', {}), /desconhecido/);
});

test('labels mirror the fields', () => {
  assert.deepEqual(labelsFor({ type: 'Bug Fix', front: 'B', priority: 'P0', status: 'In Progress' }), ['area:healthkit', 'type:bug', 'priority:p0', 'status:in-progress']);
  assert.deepEqual(labelsFor({ type: 'Test', front: 'Integration', priority: 'P1', status: 'In Review' }), ['area:integration', 'type:integration', 'priority:p1']);
  assert.deepEqual(labelsFor({ type: 'Research', front: 'A', priority: 'P3', approval: true }), ['area:coachinghost', 'type:tech-debt', 'priority:p3', APPROVAL_LABEL]);
});

test('values are validated before any API call', () => {
  assert.match(validateValue('Prioridade', 'P4'), /inválido/);
  assert.match(validateValue('Início', '26/11/2026'), /AAAA-MM-DD/);
  assert.equal(validateValue('Área', 'RunRecorder'), null);
  assert.match(validateValue('Cor', 'x'), /desconhecido/);
});

test('the initial backlog parses, every value is valid and every dependency is declared earlier', () => {
  const file = fileURLToPath(new URL('../backlog/V1_INITIAL_BACKLOG.md', import.meta.url));
  const items = parseBacklog(readFileSync(file, 'utf8'));
  assert.ok(items.length >= 12 && items.length <= 30, `${items.length} itens`);
  for (const it of items) {
    for (const k of ['type', 'area', 'front', 'priority', 'release', 'status']) assert.ok(it.fields[k], `${it.key} sem ${k}`);
    for (const [k, v] of Object.entries(it.fields)) if (FLAG_FIELDS[k]) assert.equal(validateValue(FLAG_FIELDS[k], v), null, `${it.key}.${k}`);
    if (it.fields.approval) assert.equal(it.fields.status, 'Backlog', `${it.key}: aprovação pendente fica em Backlog`);
  }
  const body = renderBody(items.find((x) => x.key === 'C2'), (k) => `#${k}`);
  assert.match(body, /### Dependências\n\n#T-FIG, #C1/);
  assert.match(body, /<!-- backlog-key: C2 -->/);
  assert.throws(() => parseBacklog('## X · a\ndeps: Y\n'), /precisa vir antes/);
  assert.throws(() => parseBacklog('## X · a\n## X · b\n'), /duplicada/);
});

test('duplicate detection ignores the front prefix and accents', () => {
  const issues = [{ number: 4, title: '[C] RunRecorder (gravador de corrida sem UI)', state: 'OPEN' }, { number: 5, title: '[A] Persistência selada', state: 'OPEN' }];
  assert.deepEqual(similarTitles('RunRecorder: gravador da corrida', issues).map((i) => i.number), [4]);
  assert.deepEqual(similarTitles('[B] Fila persistente do HealthKit', issues), []);
});
