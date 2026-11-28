#!/usr/bin/env node
// Project specialist agents (docs/engineering/AGENTS.md). Static checks of `.claude/agents/*.md`, and a live discovery check.
//
//   node tools/orchestration/agents.mjs            static: frontmatter, names, reviewers' closed allow-lists, registry, no machine paths
//   node tools/orchestration/agents.mjs --discover also starts a fresh headless Claude Code session here and compares the agent
//                                                  types it discovers with the files (uses the CLI; costs one short session)
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, basename } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

// Frontmatter keys Claude Code accepts for subagents (keep in step with the installed version's docs).
export const KNOWN_KEYS = new Set(['name', 'description', 'tools', 'disallowedTools', 'model', 'color', 'effort', 'permissionMode', 'skills', 'memory', 'hooks', 'mcpServers', 'maxTurns', 'background', 'isolation', 'initialPrompt']);
// Reviewers judge work they did not write. They must declare an allow-list (`tools:`) of reading tools only: without it they
// would inherit every tool of the session, MCP write tools included. Bash is the accepted residual (instruction-governed; the
// orchestrator checks the worktree is unchanged after each review). Any `*-reviewer` is a reviewer, except SSCTR, which is
// governed by its own constitution (governance/agents/sports-science-reviewer/).
export const REQUIRED_REVIEWERS = ['quality-reliability-engineer', 'ios-architecture-reviewer', 'visual-ux-reviewer'];
export const GOVERNED = ['sports-science-concurrent-training-reviewer'];
export const READ_TOOLS = new Set(['Read', 'Grep', 'Glob', 'Bash', 'WebFetch', 'WebSearch']);
// Read-only MCP tools, pinned to the two Figma server names this project sees (plugin and claude.ai connector): reads only,
// plus create_session, which the Figma server requires before any file read.
export const READ_MCP = /^mcp__(plugin_figma_figma|claude_ai_Figma)__(create_session|get_screenshot|get_design_context|get_metadata)$/;
export const isReviewer = (name) => REQUIRED_REVIEWERS.includes(name) || (/-reviewer$/.test(name) && !GOVERNED.includes(name));
// Entry points that steer every session must not depend on a machine-private path.
export const ENTRY_POINTS = ['CLAUDE.md', 'AGENTS.md', 'docs/engineering/AGENTS.md'];
// Any absolute path into a user's home or a drive letter, or the old home-directory agent system.
const MACHINE_PATH = /(^|[\s`'"(=:/])([A-Za-z]:[\\/]|\/Users\/[^/\s]+|\/home\/[^/\s]+|(~|\$HOME|\$\{HOME\})\/\.(claude|codex)\/agent-system)/m;

export function parseFrontmatter(raw) {
  const text = raw.replace(/\r\n/g, '\n');
  const m = /^---\n([\s\S]*?)\n---\n/.exec(text);
  if (!m) return null;
  const fields = {};
  for (const line of m[1].split('\n')) {
    if (!line.trim()) continue;
    const kv = /^([A-Za-z][A-Za-z0-9_-]*):\s*(.*)$/.exec(line);
    if (!kv) return { error: `linha inválida no frontmatter (use uma linha por chave): ${line}` };
    fields[kv[1]] = unquote(kv[2].trim());
  }
  return { fields, body: text.slice(m[0].length) };
}

const unquote = (v) => v.replace(/^(['"])(.*)\1$/, '$2');
// Accepts `a, b`, `"a, b"`, `[a, b]` and `['a', "b"]`.
export const list = (v) => unquote((v ?? '').trim()).replace(/^\[(.*)\]$/, '$1').split(',').map((x) => unquote(x.trim())).filter(Boolean);

export function checkAgent(file, text) {
  const errors = [];
  const fm = parseFrontmatter(text);
  if (!fm) return [`${file}: sem frontmatter (--- … ---) no início`];
  if (fm.error) return [`${file}: ${fm.error}`];
  const { fields, body } = fm;
  const stem = basename(file, '.md');
  if (fields.name !== stem) errors.push(`${file}: name "${fields.name ?? ''}" ≠ nome do arquivo "${stem}"`);
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(fields.name ?? '')) errors.push(`${file}: name deve ser kebab-case`);
  if (!fields.description || fields.description.length < 40) errors.push(`${file}: description ausente ou curta demais para o roteamento`);
  for (const k of Object.keys(fields)) if (!KNOWN_KEYS.has(k)) errors.push(`${file}: chave desconhecida "${k}"`);
  if (!body.trim()) errors.push(`${file}: corpo vazio`);
  if (isReviewer(stem)) {
    if (!fields.tools || list(fields.tools).length === 0) errors.push(`${file}: revisor precisa de lista fechada \`tools:\` (sem ela herda todas as ferramentas, MCP de escrita inclusive)`);
    else {
      const bad = list(fields.tools).filter((t) => !READ_TOOLS.has(t) && !READ_MCP.test(t));
      if (bad.length) errors.push(`${file}: revisor precisa ser read-only (pode usar ${bad.join(', ')})`);
    }
    if (fields.permissionMode && !['default', 'plan'].includes(fields.permissionMode)) errors.push(`${file}: revisor não pode usar permissionMode ${fields.permissionMode}`);
  }
  if (MACHINE_PATH.test(text)) errors.push(`${file}: caminho privado de uma máquina`);
  return errors;
}

export function checkRepo(root) {
  const dir = join(root, '.claude/agents');
  const files = existsSync(dir) ? readdirSync(dir).filter((f) => f.endsWith('.md')).sort() : [];
  const errors = files.flatMap((f) => checkAgent(`.claude/agents/${f}`, readFileSync(join(dir, f), 'utf8')));
  for (const r of REQUIRED_REVIEWERS) if (!files.includes(`${r}.md`)) errors.push(`.claude/agents/${r}.md: revisor obrigatório ausente`);
  const registryPath = join(root, 'docs/engineering/AGENTS.md');
  const registry = existsSync(registryPath) ? readFileSync(registryPath, 'utf8') : '';
  for (const f of files) if (!registry.includes(`\`${basename(f, '.md')}\``)) errors.push(`docs/engineering/AGENTS.md: não lista ${basename(f, '.md')}`);
  for (const p of ENTRY_POINTS) {
    const full = join(root, p);
    if (existsSync(full) && MACHINE_PATH.test(readFileSync(full, 'utf8'))) errors.push(`${p}: referência operacional a caminho privado de uma máquina`);
  }
  return { agents: files.map((f) => basename(f, '.md')), errors };
}

function discover(root) {
  // A runtime mission variable would make the child bootstrap a mission (CLAUDE.md); the probe must be a plain session.
  const { AGENT_RUNTIME_MISSION, ...env } = process.env;
  const r = spawnSync('claude', ['-p', 'Reply with the single word OK.', '--output-format', 'stream-json', '--verbose', '--max-turns', '1'],
    { cwd: root, env, encoding: 'utf8', timeout: 180_000 });
  if (r.error) return { error: `claude CLI indisponível: ${r.error.message}` };
  for (const line of (r.stdout ?? '').split('\n')) {
    try {
      const d = JSON.parse(line);
      if (d.type === 'system' && d.subtype === 'init') return { agents: d.agents ?? [] };
    } catch { /* not JSON */ }
  }
  return { error: 'a sessão não emitiu o evento init' };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const root = spawnSync('git', ['rev-parse', '--show-toplevel'], { encoding: 'utf8' }).stdout.trim();
  const { agents, errors } = checkRepo(root);
  console.log(`agents: ${agents.length} definidos em .claude/agents (${agents.join(', ')})`);
  for (const e of errors) console.log(`  ERRO ${e}`);
  let failed = errors.length > 0;
  if (process.argv.includes('--discover')) {
    const d = discover(root);
    if (d.error) { console.log(`  ERRO descoberta: ${d.error}`); failed = true; } else {
      const missing = agents.filter((a) => !d.agents.includes(a));
      console.log(`discover: sessão nova enxerga ${d.agents.length} tipos (${d.agents.join(', ')})`);
      if (missing.length) { console.log(`  ERRO não descobertos: ${missing.join(', ')}`); failed = true; }
    }
  }
  console.log(failed ? 'AGENTS: FAIL' : 'AGENTS: OK');
  process.exit(failed ? 1 : 0);
}
