import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { randomBytes } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import test from 'node:test';

test('synthetic-history exception keeps detection active in the same file and elsewhere', t => {
  const repo = fs.mkdtempSync(path.join(os.tmpdir(), 'vilumo-scanner-test-'));
  t.after(() => fs.rmSync(repo, { recursive: true, force: true }));
  const scan = (file, content) => {
    const destination = path.join(repo, file);
    fs.mkdirSync(path.dirname(destination), { recursive: true });
    fs.writeFileSync(destination, content);
    const result = spawnSync('gitleaks', ['dir', '--config', path.resolve(import.meta.dirname, '../../.gitleaks.toml'),
      '--redact', '--no-banner', '--ignore-gitleaks-allow', repo], { encoding: 'utf8' });
    fs.unlinkSync(destination);
    assert.ifError(result.error);
    return result.status;
  };
  const fixedFile = 'CoachingCore/r5/DEMONSTRATIONS_R5.json';
  const digest = randomBytes(32).toString('hex');
  const fakeCredential = randomBytes(32).toString('base64');
  assert.equal(scan(fixedFile, `{"doseKey": "${digest}"}\n`), 0);
  assert.equal(scan(fixedFile, `{"api_key": "${fakeCredential}"}\n`), 1);
  assert.equal(scan('new-source.json', `{"doseKey": "${digest}"}\n`), 1);
  assert.equal(scan(fixedFile, `{"doseKey": "${fakeCredential}"}\n`), 1);
  assert.equal(scan(fixedFile, `api_key = "${fakeCredential}" # gitleaks:allow\n`), 1);
});
