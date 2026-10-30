import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { test } from 'node:test';
import { changedPaths, checkFreeze, freezeRecord, freezeVerifier, requiresCoaching, requiresQuality } from './coaching.mjs';

test('quality selection covers tooling, dependencies and JavaScript; docs and future UI skip it', () => {
  for (const file of ['scripts/ci/new.mjs', 'backend/new.js', 'eslint.config.mjs', 'package-lock.json',
    'CoachingCore/package-lock.json', '.github/workflows/ci.yml', '.github/dependabot.yml', '.gitleaksignore']) {
    assert.equal(requiresQuality([file]), true, file);
  }
  assert.equal(requiresQuality(['docs/engineering/README.md', 'app/Screen.swift',
    'audits/historical/probe.mjs', 'reviews/evidence.json', 'governance/snapshots/old/script.js']), false);
});

test('docs and app UI skip the suite; runtime, policy, evidence and CI changes trigger it', () => {
  assert.equal(requiresCoaching(['CONTRIBUTING.md', 'docs/setup.md', 'app/Screen.swift', '.github/pull_request_template.md']), false);
  for (const file of ['CoachingCore/src/r6-program.mjs', 'CoachingCore/test/new.test.mjs', freezeRecord,
    'CoachingCore/package-lock.json', 'product/POLICY.md', 'canon/CONTRACT.md',
    'reviews/provisional-sports-science/new.json', 'governance/agents/sports-science-reviewer/registry.json',
    'audits/domain-coaching-r7a-residual-authority-2026-10-30/probes/new.json',
    'CURRENT_MISSION.md', '.gitattributes', '.github/workflows/ci.yml', 'scripts/ci/coaching.mjs']) {
    assert.equal(requiresCoaching([file]), true, file);
  }
});

function repository(t) {
  const repo = fs.mkdtempSync(path.join(os.tmpdir(), 'myapp-delivery-ci-'));
  t.after(() => fs.rmSync(repo, { recursive: true, force: true }));
  const git = (...args) => execFileSync('git', args, { cwd: repo, stdio: ['ignore', 'pipe', 'pipe'] }).toString().trim();
  const write = (file, content) => {
    fs.mkdirSync(path.dirname(path.join(repo, file)), { recursive: true });
    fs.writeFileSync(path.join(repo, file), content);
  };
  git('init', '--quiet');
  git('config', 'user.name', 'CI fixture');
  git('config', 'user.email', 'ci@example.invalid');
  git('config', 'commit.gpgsign', 'false');
  git('config', 'core.autocrlf', 'false');
  write(freezeRecord, '{"fixture":true}\n');
  write(freezeVerifier, 'process.exit(0);\n');
  write('CoachingCore/src/example.mjs', 'export const value = 1;\n');
  git('add', '.');
  git('commit', '--quiet', '-m', 'fixture baseline');
  return { repo, git, write, base: git('rev-parse', 'HEAD') };
}

test('git path selection handles Core moved to UI, new branches, and bad refs fail closed', t => {
  const { repo, git, base } = repository(t);
  fs.mkdirSync(path.join(repo, 'app'));
  git('mv', 'CoachingCore/src/example.mjs', 'app/example.mjs');
  git('commit', '--quiet', '-am', 'move fixture');
  assert.equal(requiresCoaching(changedPaths(base, 'HEAD', repo)), true);
  assert.equal(requiresCoaching(changedPaths('0'.repeat(40), 'HEAD', repo)), true);
  assert.throws(() => changedPaths('nonexistent-ref', 'HEAD', repo));
});

test('a docs-only PR skips the suite even if its integration base advanced in Core', t => {
  const { repo, git, base, write } = repository(t);
  write('docs/setup.md', 'Setup instructions\n');
  git('add', '.');
  git('commit', '--quiet', '-m', 'docs fixture');
  const docsHead = git('rev-parse', 'HEAD');
  git('checkout', '--quiet', '--detach', base);
  write('CoachingCore/src/example.mjs', 'export const value = 2;\n');
  git('commit', '--quiet', '-am', 'advanced Core fixture');
  assert.equal(requiresCoaching(changedPaths(git('rev-parse', 'HEAD'), docsHead, repo)), false);
});

test('unchanged declaration runs verifier; replacing, deleting or bypassing it fails', t => {
  const { repo, base, write } = repository(t);
  checkFreeze(base, repo);
  write(freezeRecord, '{"fixture":"recomputed"}\n');
  assert.throws(() => checkFreeze(base, repo), /record\/verifier changed/);
  fs.unlinkSync(path.join(repo, freezeRecord));
  assert.throws(() => checkFreeze(base, repo), /record\/verifier changed/);
  write(freezeRecord, '{"fixture":true}\n');
  write(freezeVerifier, 'process.exit(0); // bypass\n');
  assert.throws(() => checkFreeze(base, repo), /record\/verifier changed/);
  write(freezeVerifier, 'process.exit(1);\n');
  assert.throws(() => checkFreeze('', repo));
});
