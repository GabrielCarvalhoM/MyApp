import test from 'node:test';
import assert from 'node:assert/strict';
import { execSync } from 'node:child_process';
import { checkAgent, checkRepo, parseFrontmatter } from '../agents.mjs';

const agent = (fm, body = 'Do the work.\n') => `---\n${fm}\n---\n\n${body}`;
const desc = 'description: Reviews RepMile changes for bugs and regressions, read-only, before merge.';

test('frontmatter is parsed; missing or malformed frontmatter fails', () => {
  assert.deepEqual(parseFrontmatter(agent('name: x\nmodel: inherit')).fields, { name: 'x', model: 'inherit' });
  assert.match(checkAgent('a/x.md', 'no frontmatter')[0], /sem frontmatter/);
  assert.match(checkAgent('a/x.md', agent('name x'))[0], /linha inválida/);
});

test('name must match the file, be kebab-case, with a routable description and known keys', () => {
  assert.deepEqual(checkAgent('a/ios-engineer.md', agent(`name: ios-engineer\n${desc}\nmodel: inherit`)), []);
  const e = checkAgent('a/ios-engineer.md', agent('name: iOS_Engineer\ndescription: short\ncolour: red'));
  assert.ok(e.some((x) => /≠ nome do arquivo/.test(x)));
  assert.ok(e.some((x) => /kebab-case/.test(x)));
  assert.ok(e.some((x) => /description/.test(x)));
  assert.ok(e.some((x) => /chave desconhecida "colour"/.test(x)));
});

test('reviewers must be read-only: Edit/Write/NotebookEdit denied, or absent from an allow-list', () => {
  const qre = (tools) => checkAgent('a/quality-reliability-engineer.md', agent(`name: quality-reliability-engineer\n${desc}\n${tools}`));
  assert.deepEqual(qre('disallowedTools: Agent, Edit, Write, NotebookEdit'), []);
  assert.deepEqual(qre('tools: Read, Grep, Glob, Bash'), []);
  assert.match(qre('disallowedTools: Agent, Edit').join(), /read-only \(pode usar Write, NotebookEdit\)/);
  assert.match(qre('tools: Read, Write').join(), /read-only \(pode usar Write\)/);
});

test('a machine-private path is rejected (Windows or a home-directory agent system)', () => {
  assert.match(checkAgent('a/x.md', agent(`name: x\n${desc}`, 'Read C:/Users/someone/.claude/agent-system/README.md')).join(), /caminho privado/);
  assert.match(checkAgent('a/x.md', agent(`name: x\n${desc}`, 'Read C:\\Users\\someone\\x')).join(), /caminho privado/);
  assert.deepEqual(checkAgent('a/x.md', agent(`name: x\n${desc}`, 'Read docs/engineering/AGENTS.md')), []);
});

test('this repository: every agent is valid, reviewers exist and are listed in the registry', () => {
  const root = execSync('git rev-parse --show-toplevel', { encoding: 'utf8' }).trim();
  const r = checkRepo(root);
  assert.deepEqual(r.errors, []);
  for (const a of ['ios-engineer', 'quality-reliability-engineer', 'sports-science-concurrent-training-reviewer']) assert.ok(r.agents.includes(a), a);
});
