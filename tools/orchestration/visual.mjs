#!/usr/bin/env node
// Figma × app visual validation records (docs/engineering/VISUAL_VALIDATION.md).
//
//   visual.mjs init   --dir <visual dir> --screen <slug> --node <nodeId> [--file <figma fileKey>] [--version "<named version>"]
//   visual.mjs attach <record dir> --run <sim.sh evidence dir>      copy one run's screenshot(s) + manifest into the record
//   visual.mjs verify [--dir <visual dir>] [--strict]               check every record under the dir
//
// A record is <visual dir>/<screen>/record.json + figma.png + captures/<run>/{manifest.json,*.png}. `verify` refuses:
// a capture whose PNG does not match the hash its sim.sh manifest recorded (no hand-made screenshots), a capture from a run that
// did not succeed, and a MATCHES verdict with open differences or without a capture for every required condition.
// Exit 0: no violation (pending records are listed; --strict makes them fail). 1: violation. 2: usage.
import { parseArgs } from 'node:util';
import { createHash } from 'node:crypto';
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { basename, join } from 'node:path';

const sha = (f) => createHash('sha256').update(readFileSync(f)).digest('hex');
const readJson = (f) => JSON.parse(readFileSync(f, 'utf8'));
const DEFAULT_CONDITIONS = [{ locale: 'pt_BR', appearance: 'light', contentSize: 'default' }];

export function verifyRecord(dir) {
  const errors = [], pending = [];
  const rf = join(dir, 'record.json');
  if (!existsSync(rf)) return { errors: [`${dir}: sem record.json`], pending };
  const r = readJson(rf);
  if (!r.figma?.nodeId) errors.push('figma.nodeId ausente');
  if (!existsSync(join(dir, 'figma.png'))) pending.push('referência do Figma (figma.png) ainda não exportada');
  const capDir = join(dir, 'captures');
  const caps = existsSync(capDir) ? readdirSync(capDir).filter((d) => statSync(join(capDir, d)).isDirectory()) : [];
  const covered = [];
  for (const c of caps) {
    const mf = join(capDir, c, 'manifest.json');
    if (!existsSync(mf)) { errors.push(`captura ${c}: sem manifest.json do sim.sh`); continue; }
    const m = readJson(mf);
    if (m.result !== 'ok') errors.push(`captura ${c}: a execução terminou com result=${m.result}`);
    if (!['simulator', 'device'].includes(m.target)) errors.push(`captura ${c}: target desconhecido`);
    const pngs = readdirSync(join(capDir, c)).filter((f) => f.endsWith('.png'));
    if (!['run', 'all'].includes(m.command)) errors.push(`captura ${c}: vem de \`sim.sh ${m.command}\`, que não abre o app (use run ou all)`);
    if (!pngs.length) { errors.push(`captura ${c}: nenhuma screenshot`); continue; }
    for (const png of pngs) {
      if (m.screenshots?.[png] !== sha(join(capDir, c, png))) errors.push(`captura ${c}/${png}: o hash não confere com o manifest da execução`);
    }
    covered.push({ locale: m.locale, appearance: m.appearance, contentSize: m.contentSize ?? 'default', target: m.target });
  }
  if (!caps.length) pending.push('nenhuma captura do app rodando');
  const required = r.requiredConditions ?? DEFAULT_CONDITIONS;
  const missing = required.filter((q) => !covered.some((c) => Object.entries(q).every(([k, v]) => c[k] === v)));
  for (const q of missing) pending.push(`condição sem captura: ${JSON.stringify(q)}`);
  const open = (r.differences ?? []).filter((d) => d.status === 'open');
  if (r.verdict === 'MATCHES') {
    if (missing.length || !caps.length) errors.push('verdict MATCHES sem captura para todas as condições exigidas');
    if (open.length) errors.push(`verdict MATCHES com ${open.length} diferença(s) abertas`);
    if (!existsSync(join(dir, 'figma.png'))) errors.push('verdict MATCHES sem a referência do Figma');
  } else if (r.verdict !== 'DIFFERS') pending.push(`verdict ${r.verdict ?? 'PENDING'}`);
  return { screen: r.screen, verdict: r.verdict ?? 'PENDING', errors, pending, openDifferences: open.length };
}

function main() {
  const [cmd, ...rest] = process.argv.slice(2);
  const { values, positionals } = parseArgs({ args: rest, allowPositionals: true, options: {
    dir: { type: 'string' }, screen: { type: 'string' }, node: { type: 'string' }, file: { type: 'string', default: '90oyvXHxxBQAvr1netov7S' },
    version: { type: 'string' }, run: { type: 'string' }, strict: { type: 'boolean', default: false } } });
  if (cmd === 'init') {
    if (!values.dir || !values.screen || !values.node) return usage();
    const dir = join(values.dir, values.screen);
    if (existsSync(join(dir, 'record.json'))) { console.error(`visual: ${dir}/record.json já existe`); process.exitCode = 1; return; }
    mkdirSync(join(dir, 'captures'), { recursive: true });
    const rec = { screen: values.screen, figma: { fileKey: values.file, nodeId: values.node, version: values.version ?? null },
      requiredConditions: [
        { locale: 'pt_BR', appearance: 'light', contentSize: 'default' }, { locale: 'pt_BR', appearance: 'dark', contentSize: 'default' },
        { locale: 'en_US', appearance: 'light', contentSize: 'default' }, { locale: 'es_ES', appearance: 'light', contentSize: 'default' },
        { locale: 'pt_BR', appearance: 'light', contentSize: 'extra-extra-extra-large' }],
      fixture: null, differences: [], verdict: 'PENDING', reviewedAt: null };
    writeFileSync(join(dir, 'record.json'), `${JSON.stringify(rec, null, 2)}\n`);
    return console.log(`visual: ${dir}/record.json criado; exporte o nó ${values.node} como figma.png e anexe execuções com \`attach\``);
  }
  if (cmd === 'attach') {
    const [dir] = positionals;
    if (!dir || !values.run) return usage();
    const m = readJson(join(values.run, 'manifest.json'));
    if (m.result !== 'ok') { console.error(`visual: a execução ${values.run} terminou com result=${m.result}; não anexada`); process.exitCode = 1; return; }
    const dest = join(dir, 'captures', basename(values.run));
    mkdirSync(dest, { recursive: true });
    cpSync(join(values.run, 'manifest.json'), join(dest, 'manifest.json'));
    const shots = Object.keys(m.screenshots ?? {});
    if (!shots.length || shots.some((f) => f !== basename(f) || !f.endsWith('.png'))) { console.error('visual: manifest sem screenshots válidas'); process.exitCode = 1; return; }
    for (const png of shots) cpSync(join(values.run, png), join(dest, png));
    return console.log(`visual: ${Object.keys(m.screenshots ?? {}).length} screenshot(s) de ${m.simulator?.name} (${m.locale}, ${m.appearance}, ${m.contentSize}) → ${dest}`);
  }
  if (cmd === 'verify') {
    const root = values.dir ?? positionals[0];
    if (!root) return usage();
    if (!existsSync(root)) { console.log(`visual: ${root} ainda não existe (nenhuma tela registrada)`); return; }
    let bad = 0, pend = 0;
    for (const d of readdirSync(root).filter((x) => statSync(join(root, x)).isDirectory())) {
      const v = verifyRecord(join(root, d));
      console.log(`${v.errors.length ? 'VIOLAÇÃO' : v.pending.length ? 'PENDENTE' : 'OK      '} ${d} · ${v.verdict}${v.openDifferences ? ` · ${v.openDifferences} diferença(s) abertas` : ''}`);
      for (const e of v.errors) console.log(`   ✗ ${e}`);
      for (const p of v.pending) console.log(`   · ${p}`);
      bad += v.errors.length ? 1 : 0; pend += v.pending.length ? 1 : 0;
    }
    process.exitCode = bad || (values.strict && pend) ? 1 : 0;
    return;
  }
  usage();
}

function usage() { console.error('uso: visual.mjs <init|attach|verify> … (cabeçalho do arquivo)'); process.exitCode = 2; }

if (process.argv[1] && import.meta.url.endsWith(basename(process.argv[1]))) main();
