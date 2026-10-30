// Scan the reviewable checkout, including new files, without scanning installed dependencies.
// Gitleaks must be installed separately at the pinned version documented in QUALITY.md.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const root = path.resolve(import.meta.dirname, '../..');
const snapshot = fs.mkdtempSync(path.join(os.tmpdir(), 'vilumo-secret-scan-'));
try {
  const files = execFileSync('git', ['ls-files', '--cached', '--others', '--exclude-standard', '-z'], { cwd: root })
    .toString().split('\0').filter(Boolean);
  for (const file of new Set(files)) {
    const source = path.join(root, file);
    if (!fs.existsSync(source)) continue; // Deleted working-tree file; history scan covers it.
    if (!fs.lstatSync(source).isFile()) throw new Error(`Expected regular repository file: ${file}`);
    const destination = path.join(snapshot, file);
    fs.mkdirSync(path.dirname(destination), { recursive: true });
    fs.copyFileSync(source, destination);
  }
  const report = process.env.GITLEAKS_REPORT_PATH;
  const reportArgs = report ? ['--report-format', 'json', '--report-path', path.resolve(report)] : [];
  execFileSync('gitleaks', ['dir', '--config', path.join(root, '.gitleaks.toml'), '--redact', '--no-banner', '--ignore-gitleaks-allow', ...reportArgs, snapshot], { cwd: root, stdio: 'inherit' });
} finally {
  fs.rmSync(snapshot, { recursive: true, force: true });
}
