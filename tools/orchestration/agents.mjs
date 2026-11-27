#!/usr/bin/env node
// Project specialist agents (docs/engineering/AGENTS.md). Static checks of `.claude/agents/*.md`, and a live discovery check.
//
//   node tools/orchestration/agents.mjs            static: frontmatter, names, read-only reviewers, registry, no Windows paths
//   node tools/orchestration/agents.mjs --discover also starts a fresh headless Claude Code session here and compares the agent
//                                                  types it discovers with the files (uses the CLI; costs one short session)
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, basename } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

// Frontmatter keys Claude Code accepts for subagents (keep in step with the installed version's docs).
export const KNOWN_KEYS = new Set(['name', 'description', 'tools', 'disallowedTools', 'model', 'color', 'effort', 'permissionMode', 'skills', 'memory', 'hooks', 'mcpServers', 'maxTurns', 'background', 'isolation', 'initialPrompt']);
// Reviewers judge work they did not write: they must not be able to edit it.
export const READ_ONLY = ['quality-reliability-engineer', 'ios-architecture-reviewer', 'visual-ux-reviewer'];
export const WRITE_TOOLS = ['Edit', 'Write', 'NotebookEdit'];
// Entry points that steer every session must not depend on a machine-private path.
export const ENTRY_POINTS = ['CLAUDE.md', 'AGENTS.md', 'docs/engineering/AGENTS.md'];
const MACHINE_PATH = /[A-Za-z]:[\\/]+Users[\\/]|\/Users\/[^/\s]+\/\.(claude|codex)\/agent-system/;

export function parseFrontmatter(text) {
  const m = /^---\n([\s\S]*?)\n---\n/.exec(text);
  if (!m) return null;
  const fields = {};
  for (const line of m[1].split('\n')) {
    if (!line.trim()) continue;
    const kv = /^([A-Za-z][A-Za-z0-9_-]*):\s*(.*)$/.exec(line);
    if (!kv) return { error: `linha inválida no frontmatter: ${line}` };
    fields[kv[1]] = kv[2].trim();
  }
  return { fields, body: text.slice(m[0].length) };
}

const list = (v) => (v ?? '').split(',').map((s) => s.trim()).filter(Boolean);

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
  if (READ_ONLY.includes(stem)) {
    const denied = list(fields.disallowedTools);
    const allowed = fields.tools ? list(fields.tools) : null;
    const canWrite = WRITE_TOOLS.filter((t) => (allowed ? allowed.includes(t) : !denied.includes(t)));
    if (canWrite.length) errors.push(`${file}: revisor precisa ser read-only (pode usar ${canWrite.join(', ')})`);
  }
  if (MACHINE_PATH.test(text)) errors.push(`${file}: caminho privado de uma máquina`);
  return errors;
}

export function checkRepo(root) {
  const dir = join(root, '.claude/agents');
  const files = existsSync(dir) ? readdirSync(dir).filter((f) => f.endsWith('.md')).sort() : [];
  const errors = files.flatMap((f) => checkAgent(`.claude/agents/${f}`, readFileSync(join(dir, f), 'utf8')));
  for (const r of READ_ONLY) if (!files.includes(`${r}.md`)) errors.push(`.claude/agents/${r}.md: revisor obrigatório ausente`);
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
  const r = spawnSync('claude', ['-p', 'Reply with the single word OK.', '--output-format', 'stream-json', '--verbose', '--max-turns', '1'],
    { cwd: root, encoding: 'utf8', timeout: 180_000 });
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
