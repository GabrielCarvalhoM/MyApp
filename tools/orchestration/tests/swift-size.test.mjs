import test from 'node:test';
import assert from 'node:assert/strict';
import { check, exceptionReason, lineCount, LIMIT, WARN } from '../swift-size.mjs';

const body = (n) => Array.from({ length: n }, (_, i) => `let x${i} = ${i}`).join('\n') + '\n';

test('line count ignores the final newline', () => {
  assert.equal(lineCount(''), 0);
  assert.equal(lineCount('a\n'), 1);
  assert.equal(lineCount('a\nb'), 2);
  assert.equal(lineCount(body(351)), 351);
});

test('limit 350, warning above 300, new file above the limit fails', () => {
  const r = check([
    { path: 'ios/A/Small.swift', text: body(WARN) },
    { path: 'ios/A/Warn.swift', text: body(WARN + 1) },
    { path: 'ios/A/AtLimit.swift', text: body(LIMIT) },
    { path: 'ios/A/Big.swift', text: body(LIMIT + 1) },
  ]);
  assert.deepEqual(r.rows.map((x) => [x.path, x.verdict]), [['ios/A/Big.swift', 'FAIL'], ['ios/A/AtLimit.swift', 'WARN'], ['ios/A/Warn.swift', 'WARN']]);
  assert.equal(r.failed, true);
});

test('inventoried legacy file is reported, not failed; an unlisted lookalike still fails', () => {
  const r = check([
    { path: 'ios/A/Legacy.swift', text: body(800) },
    { path: 'ios/A/Legacy2.swift', text: body(400) },
  ], { 'ios/A/Legacy.swift': 796 });
  assert.equal(r.rows.find((x) => x.path === 'ios/A/Legacy.swift').verdict, 'LEGACY');
  assert.equal(r.rows.find((x) => x.path === 'ios/A/Legacy2.swift').verdict, 'FAIL');
});

test('justified exception only in the file header; generated and non-Swift files are not counted', () => {
  const withReason = `// swift-size-exception: one exhaustive mapping table\n${body(400)}`;
  const late = `${body(20)}// swift-size-exception: too late\n${body(400)}`;
  assert.equal(exceptionReason(withReason), 'one exhaustive mapping table');
  assert.equal(exceptionReason(late), null);
  const r = check([
    { path: 'ios/A/Table.swift', text: withReason },
    { path: 'ios/A/Late.swift', text: late },
    { path: 'ios/A/Model.generated.swift', text: body(900) },
    { path: 'ios/A/Generated/X.swift', text: body(900) },
    { path: 'ios/A/.build/X.swift', text: body(900) },
    { path: 'ios/A/notes.md', text: body(900) },
  ]);
  assert.deepEqual(r.rows.map((x) => [x.path, x.verdict]), [['ios/A/Late.swift', 'FAIL'], ['ios/A/Table.swift', 'EXCEPTION']]);
});
