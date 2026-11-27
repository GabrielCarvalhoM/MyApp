import test from 'node:test';
import assert from 'node:assert/strict';
import { execSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { checkAgent, checkRepo, list, parseFrontmatter } from '../agents.mjs';

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

test('reviewers need a closed allow-list of reading tools', () => {
  const qre = (tools) => checkAgent('a/quality-reliability-engineer.md', agent(`name: quality-reliability-engineer\n${desc}\n${tools}`));
  assert.deepEqual(qre('tools: Read, Grep, Glob, Bash'), []);
  assert.match(qre('disallowedTools: Agent, Edit, Write, NotebookEdit').join(), /lista fechada/);
  assert.match(qre('tools: Read, Write').join(), /read-only \(pode usar Write\)/);
  assert.match(qre('tools: Read, mcp__claude_ai_Figma__use_figma').join(), /pode usar mcp__claude_ai_Figma__use_figma/);
  assert.match(qre('tools: Read, mcp__claude_ai_Supabase__execute_sql').join(), /execute_sql/);
  assert.deepEqual(qre('tools: Read, mcp__plugin_figma_figma__get_screenshot'), []);
  assert.match(qre('tools: Read\npermissionMode: bypassPermissions').join(), /permissionMode bypassPermissions/);
});

test('YAML list forms cannot smuggle a write tool past the check', () => {
  assert.deepEqual(list('"Read, Edit"'), ['Read', 'Edit']);
  assert.deepEqual(list('[Read, Edit]'), ['Read', 'Edit']);
  assert.deepEqual(list("['Read', \"Edit\"]"), ['Read', 'Edit']);
  const qre = (tools) => checkAgent('a/quality-reliability-engineer.md', agent(`name: quality-reliability-engineer\n${desc}\n${tools}`));
  assert.match(qre('tools: "Read, Edit"').join(), /pode usar Edit/);
  assert.match(qre('tools: [Read, Edit]').join(), /pode usar Edit/);
});

test('any *-reviewer is a reviewer (except the governed SSCTR); CRLF and quoted names parse', () => {
  assert.match(checkAgent('a/new-reviewer.md', agent(`name: new-reviewer\n${desc}`)).join(), /lista fechada/);
  assert.deepEqual(checkAgent('a/sports-science-concurrent-training-reviewer.md', agent(`name: sports-science-concurrent-training-reviewer\n${desc}\ndisallowedTools: Agent`)), []);
  assert.deepEqual(checkAgent('a/x.md', agent(`name: "x"\n${desc}`).replace(/\n/g, '\r\n')), []);
});

test('a machine-private path is rejected (Windows or a home-directory agent system)', () => {
  assert.match(checkAgent('a/x.md', agent(`name: x\n${desc}`, 'Read C:/Users/someone/.claude/agent-system/README.md')).join(), /caminho privado/);
  assert.match(checkAgent('a/x.md', agent(`name: x\n${desc}`, 'Read C:\\Users\\someone\\x')).join(), /caminho privado/);
  assert.match(checkAgent('a/x.md', agent(`name: x\n${desc}`, 'Open /Users/someone/Documents/x')).join(), /caminho privado/);
  assert.match(checkAgent('a/x.md', agent(`name: x\n${desc}`, 'See ~/.claude/agent-system/README.md')).join(), /caminho privado/);
  assert.match(checkAgent('a/x.md', agent(`name: x\n${desc}`, 'D:/tools/x')).join(), /caminho privado/);
  assert.deepEqual(checkAgent('a/x.md', agent(`name: x\n${desc}`, 'Read docs/engineering/AGENTS.md and ~/.codex/worktrees are fine')), []);
});

test('repository errors: missing reviewer, unlisted agent, private path in an entry point', () => {
  const root = mkdtempSync(join(tmpdir(), 'agents-'));
  mkdirSync(join(root, '.claude/agents'), { recursive: true });
  mkdirSync(join(root, 'docs/engineering'), { recursive: true });
  writeFileSync(join(root, '.claude/agents/ios-engineer.md'), agent(`name: ios-engineer\n${desc}`));
  writeFileSync(join(root, 'docs/engineering/AGENTS.md'), '# registry without entries\n');
  writeFileSync(join(root, 'CLAUDE.md'), 'Entry point: C:/Users/someone/.claude/agent-system/README.md\n');
  const e = checkRepo(root).errors.join('\n');
  assert.match(e, /quality-reliability-engineer.md: revisor obrigatório ausente/);
  assert.match(e, /não lista ios-engineer/);
  assert.match(e, /CLAUDE.md: referência operacional/);
});

test('this repository: every agent is valid, reviewers exist and are listed in the registry', () => {
  const root = execSync('git rev-parse --show-toplevel', { encoding: 'utf8' }).trim();
  const r = checkRepo(root);
  assert.deepEqual(r.errors, []);
  for (const a of ['ios-engineer', 'quality-reliability-engineer', 'sports-science-concurrent-training-reviewer']) assert.ok(r.agents.includes(a), a);
});
