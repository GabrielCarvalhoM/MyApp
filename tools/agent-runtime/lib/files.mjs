import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

export const nowIso = () => new Date().toISOString();

export function sha256(data) {
  return crypto.createHash('sha256').update(data).digest('hex');
}

export function sha256File(file) {
  return sha256(fs.readFileSync(file));
}

export function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

export function readJson(file) {
  const text = fs.readFileSync(file, 'utf8');
  try {
    return JSON.parse(text);
  } catch (error) {
    throw new Error(`${file}: invalid JSON (${error.message})`);
  }
}

export function readJsonIfExists(file) {
  return fs.existsSync(file) ? readJson(file) : null;
}

// Write-then-rename, so an interrupted write never leaves a truncated state file behind.
export function writeJsonAtomic(file, value) {
  ensureDir(path.dirname(file));
  const tmp = `${file}.tmp-${process.pid}`;
  fs.writeFileSync(tmp, `${JSON.stringify(value, null, 2)}\n`);
  fs.renameSync(tmp, file);
}

export function writeText(file, text) {
  ensureDir(path.dirname(file));
  fs.writeFileSync(file, text);
}

export function appendJsonl(file, record) {
  ensureDir(path.dirname(file));
  fs.appendFileSync(file, `${JSON.stringify(record)}\n`);
}

// Only the last line can be truncated (an append interrupted by a crash); any other bad line is corruption.
export function readJsonl(file) {
  if (!fs.existsSync(file)) return [];
  const lines = fs.readFileSync(file, 'utf8').split('\n').filter((line) => line.trim() !== '');
  const records = [];
  lines.forEach((line, index) => {
    try {
      records.push(JSON.parse(line));
    } catch (error) {
      if (index !== lines.length - 1) throw new Error(`${file}: corrupt line ${index + 1} (${error.message})`);
    }
  });
  return records;
}
