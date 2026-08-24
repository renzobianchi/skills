#!/usr/bin/env node
// ds-manifest: reads per-component manifests, generates the human docs,
// and validates both. Zero dependencies. Usage:
//   node scripts/ds-manifest.mjs docs    # write PARITY.md / LEGACY-MAP.md
//   node scripts/ds-manifest.mjs check   # validate manifests (+ docs equality when commitDocs)
// Exports the same functions for the test runner.

import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { join, basename, resolve } from 'node:path';

export const PARITY_STATUSES = [
  'parity', 'gap-code', 'gap-kit', 'code-only', 'decision-needed', 'kit-ready', 'kit-wip',
];
export const LEGACY_STATUSES = ['replaced', 'absorbed', 'deprecated', 'kept', 'undecided'];

export const loadConfig = (root = process.cwd()) =>
  JSON.parse(readFileSync(join(root, 'ds.config.json'), 'utf8'));

const readDir = (dir) => {
  if (!existsSync(dir)) return {};
  const out = {};
  for (const f of readdirSync(dir).filter((f) => f.endsWith('.json')).sort()) {
    out[basename(f, '.json')] = JSON.parse(readFileSync(join(dir, f), 'utf8'));
  }
  return out;
};

export const loadManifests = (config, root = process.cwd()) => ({
  parity: readDir(resolve(root, config.manifests.parity)),
  legacy: readDir(resolve(root, config.manifests.legacy)),
});

export const displayName = (key) =>
  key.split('-').map((p) => p[0].toUpperCase() + p.slice(1)).join('');

// ---------- validation ----------

export const validate = (config, { parity, legacy }, root = process.cwd()) => {
  const errors = [];
  for (const [key, m] of Object.entries(parity)) {
    if (!PARITY_STATUSES.includes(m.status)) errors.push(`parity/${key}: invalid status "${m.status}"`);
    if (!m.design || !m.design.tool) errors.push(`parity/${key}: design.tool missing`);
    if (m.design?.tool === 'paper' && config.codeConnect && m.status === 'parity') {
      // Code Connect is Figma-only; a paper project must run with codeConnect: false.
      errors.push(`parity/${key}: codeConnect is true but design.tool is paper`);
    }
    if (config.codeConnect && m.status === 'parity' && m.design?.tool === 'figma' && m.design?.componentSetId) {
      const mapping = resolve(root, config.namespace, `${key}.figma.tsx`);
      if (!existsSync(mapping)) errors.push(`parity/${key}: status parity but ${key}.figma.tsx is missing`);
    }
  }
  for (const [name, m] of Object.entries(legacy)) {
    if (!LEGACY_STATUSES.includes(m.status)) errors.push(`legacy/${name}: invalid status "${m.status}"`);
    const next = m.next ?? [];
    if (m.status === 'replaced' && next.length === 0) errors.push(`legacy/${name}: replaced without next`);
    if (m.status !== 'replaced' && next.length > 0) errors.push(`legacy/${name}: next set but status is ${m.status}`);
    for (const ref of [...next, ...(m.proposedNext ?? [])]) {
      if (!parity[ref]) errors.push(`legacy/${name}: references unknown module "${ref}"`);
    }
  }
  return errors;
};

// ---------- docs ----------

const section = (title, keys) =>
  `## ${title}\n\n${keys.length ? keys.map((k) => `- ${k}`).join('\n') : '_none_'}\n`;

export const renderParityDoc = (config, { parity }) => {
  const by = (s) => Object.keys(parity).filter((k) => parity[k].status === s).map(displayName).sort((a, b) => a.localeCompare(b));
  const gaps = Object.keys(parity)
    .filter((k) => ['gap-code', 'gap-kit', 'decision-needed'].includes(parity[k].status))
    .sort()
    .map((k) => `- ${displayName(k)} (${parity[k].status})`);
  // Standing deviations (forwardRef shims, token over upstream literal) live in the
  // manifest; rendering them here is what keeps the doc from needing a hand edit.
  const deviations = Object.keys(parity)
    .filter((k) => parity[k].deviation)
    .sort()
    .map((k) => `- ${displayName(k)}: ${parity[k].deviation}`);
  const m = config.markers;
  return [
    '# Kit ↔ code parity',
    '',
    `Generated from \`${config.manifests.parity}/*.json\` by \`scripts/ds-manifest.mjs docs\`. Do not edit; regenerate. When this file and the manifests disagree, the manifests win.`,
    '',
    section(`${m.done} In parity`, by('parity')),
    section(`${m.ready} Kit-ready (the code queue)`, by('kit-ready')),
    section(`${m.wip} Kit-wip (the queue behind the queue)`, by('kit-wip')),
    section('Code-only (deliberate, not a gap)', by('code-only')),
    `## Gaps\n\n${gaps.length ? gaps.join('\n') : '_none_'}\n`,
    `## Deviations\n\n${deviations.length ? deviations.join('\n') : '_none_'}\n`,
  ].join('\n');
};

export const renderLegacyDoc = (config, { legacy }) => {
  const names = Object.keys(legacy).sort((a, b) => a.localeCompare(b));
  const counts = LEGACY_STATUSES.map((s) => `${names.filter((n) => legacy[n].status === s).length} ${s}`).join(' · ');
  const row = (n) => {
    const m = legacy[n];
    const usage = m.usage ? Object.entries(m.usage).map(([c, v]) => `${c} ${v}`).join(' · ') : '';
    return `| ${n}${m.aliases?.length ? ` (aliases: ${m.aliases.join(', ')})` : ''} | ${(m.next ?? m.proposedNext ?? []).join(', ')} | ${usage} | ${m.note ?? ''} |`;
  };
  const table = (s) => {
    const rows = names.filter((n) => legacy[n].status === s);
    return `## ${s} (${rows.length})\n\n| Legacy | Module | Usage | Note |\n| --- | --- | --- | --- |\n${rows.map(row).join('\n')}\n`;
  };
  return [
    '# Legacy → namespace map',
    '',
    `Generated from \`${config.manifests.legacy}/*.json\` by \`scripts/ds-manifest.mjs docs\`. Do not edit; regenerate.`,
    '',
    `**${names.length} legacy exports: ${counts}**`,
    '',
    ...LEGACY_STATUSES.map(table),
  ].join('\n');
};

// ---------- commands ----------

export const docsPaths = (config, root = process.cwd()) => ({
  parity: resolve(root, config.manifests.parityDoc),
  legacy: resolve(root, config.manifests.legacyDoc),
});

export const checkDocs = (config, manifests, root = process.cwd()) => {
  if (!config.manifests.commitDocs) return [];
  const paths = docsPaths(config, root);
  const errors = [];
  const compare = (label, path, expected) => {
    const actual = existsSync(path) ? readFileSync(path, 'utf8') : '';
    if (actual !== expected) errors.push(`${label} is stale: run \`node scripts/ds-manifest.mjs docs\``);
  };
  compare(config.manifests.parityDoc, paths.parity, renderParityDoc(config, manifests));
  if (Object.keys(manifests.legacy).length) compare(config.manifests.legacyDoc, paths.legacy, renderLegacyDoc(config, manifests));
  return errors;
};

const main = () => {
  const cmd = process.argv[2];
  const root = process.cwd();
  const config = loadConfig(root);
  const manifests = loadManifests(config, root);
  if (cmd === 'docs') {
    const paths = docsPaths(config, root);
    writeFileSync(paths.parity, renderParityDoc(config, manifests));
    if (Object.keys(manifests.legacy).length) writeFileSync(paths.legacy, renderLegacyDoc(config, manifests));
    console.log(`docs written: ${Object.keys(manifests.parity).length} parity, ${Object.keys(manifests.legacy).length} legacy`);
    return;
  }
  if (cmd === 'check') {
    const errors = [...validate(config, manifests, root), ...checkDocs(config, manifests, root)];
    if (errors.length) { errors.forEach((e) => console.error(`✗ ${e}`)); process.exit(1); }
    console.log(`ok: ${Object.keys(manifests.parity).length} parity, ${Object.keys(manifests.legacy).length} legacy`);
    return;
  }
  console.error('usage: ds-manifest.mjs <docs|check>');
  process.exit(2);
};

if (import.meta.url === `file://${process.argv[1]}`) main();
