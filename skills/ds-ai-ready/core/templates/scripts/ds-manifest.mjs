#!/usr/bin/env node
// ds-manifest: reads per-component manifests, generates the human docs,
// and validates both. Zero dependencies. Usage:
//   node scripts/ds-manifest.mjs docs    # write PARITY.md / LEGACY-MAP.md / MIGRATION.md
//   node scripts/ds-manifest.mjs check   # validate manifests (+ docs equality when commitDocs, + shipping config)
//   node scripts/ds-manifest.mjs usage <key>   # scaffold the component's usage doc from its manifest
//   node scripts/ds-manifest.mjs ship    # copy docs + merged manifests into manifests.ship, write llms.txt
// Exports the same functions for the test runner.

import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync, rmSync, copyFileSync } from 'node:fs';
import { join, basename, resolve, dirname, relative } from 'node:path';

export const PARITY_STATUSES = [
  'parity', 'gap-code', 'gap-kit', 'code-only', 'decision-needed', 'kit-ready', 'kit-wip', 'deprecated',
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

export const usagePath = (config, key, root = process.cwd()) =>
  resolve(root, config.manifests.usage ?? join(config.namespace, 'usage'), `${key}.md`);

export const PLACEHOLDER = /<fill[^>]*>/;

// The usage doc is the component's contract for callers (when, which variant, how to
// compose). Scaffolded from the manifest so the axes and decisions are never retyped;
// the prose is filled by the builder, then reviewed by the design owner.
export const renderUsageScaffold = (key, m) => {
  const axes = Object.entries(m.axes ?? {}).flatMap(([axis, v]) =>
    (v.code ?? []).map((value) => `- \`${axis}="${value}"\`: <fill: the intent this value serves>`));
  const compose = (m.composeOnly ?? []).map((c) => `- ${c}: <fill: the child to render and when>`);
  return [
    `# ${displayName(key)}`,
    '',
    `Generated scaffold from \`${key}.json\`; the prose is written by hand and reviewed by the design owner. Axes and composition stay in sync with the manifest by hand: when the manifest changes, this file changes in the same PR.`,
    '',
    '## Use when',
    '',
    '<fill: the situations this component is for, one per line, in the product\'s words>',
    '',
    '## Use something else when',
    '',
    '<fill: the nearby component and the boundary between them, one per line>',
    '',
    '## Variants',
    '',
    axes.length ? axes.join('\n') : '_no variant axes_',
    '',
    '## Composition',
    '',
    compose.length ? compose.join('\n') : '_nothing composed; props cover every kit state_',
    '',
    '## Decisions',
    '',
    ...(m.deviation ? [`- Deviation from upstream: ${m.deviation}`] : []),
    m.note ? `- ${m.note}` : '- <fill: from the manifest note>',
    '',
    '## Owner notes',
    '',
    '<fill: the design owner\'s own sentences: what callers get wrong with this component, what they ask for that it should refuse. Write "none yet" if they had nothing to add.>',
    '',
  ].join('\n');
};

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
    if (m.status === 'parity') {
      const usage = usagePath(config, key, root);
      if (!existsSync(usage)) errors.push(`parity/${key}: status parity but usage doc ${key}.md is missing (run \`ds-manifest.mjs usage ${key}\`)`);
      else if (PLACEHOLDER.test(readFileSync(usage, 'utf8'))) errors.push(`parity/${key}: usage doc still carries a <fill> placeholder`);
    }
    // A deprecation with no replacement and no removal version is a permanent
    // warning, and consumers learn to ignore permanent warnings.
    if (m.status === 'deprecated') {
      const superseded = m.supersededBy ?? [];
      if (superseded.length === 0) errors.push(`parity/${key}: status deprecated without supersededBy`);
      for (const ref of superseded) if (!parity[ref]) errors.push(`parity/${key}: supersededBy references unknown module "${ref}"`);
      if (!m.removeIn) errors.push(`parity/${key}: status deprecated without removeIn (the major that removes it)`);
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
  const deprecated = Object.keys(parity)
    .filter((k) => parity[k].status === 'deprecated')
    .sort()
    .map((k) => `- ${displayName(k)} → ${(parity[k].supersededBy ?? []).map(displayName).join(', ')} (removed in ${parity[k].removeIn})`);
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
    `## Deprecated\n\n${deprecated.length ? deprecated.join('\n') : '_none_'}\n`,
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

// The consumer's migration guide, derived from the legacy map from the first
// `replaced` entry on: a consumer migrating with agents needs the recipes that exist
// now, and needs `undecided` named as such so nothing gets migrated on a guess.
// `recipe` is the find/replace a caller applies; `note` is the builder's reasoning and
// is only the fallback.
export const renderMigrationDoc = (config, { legacy, parity }) => {
  const names = Object.keys(legacy).sort((a, b) => a.localeCompare(b));
  const of = (s) => names.filter((n) => legacy[n].status === s);
  const usage = (m) => (m.usage ? Object.entries(m.usage).map(([c, v]) => `${c} ${v}`).join(' · ') : '');
  const line = (n, tail) => `- **${n}**${legacy[n].aliases?.length ? ` (also ${legacy[n].aliases.join(', ')})` : ''}: ${tail}${usage(legacy[n]) ? ` _(${usage(legacy[n])} importing files)_` : ''}`;
  const replaced = of('replaced').map((n) => {
    const m = legacy[n];
    const next = (m.next ?? []).map((k) => `\`${displayName(k)}\``).join(' + ');
    return line(n, `→ ${next}. ${m.recipe ?? m.note ?? ''}`.trim());
  });
  const absorbed = of('absorbed').map((n) => line(n, legacy[n].recipe ?? legacy[n].note ?? 'absorbed at the call site'));
  const deprecated = of('deprecated').map((n) => line(n, legacy[n].recipe ?? legacy[n].note ?? 'still exported; replacement pending'));
  const kept = of('kept').map((n) => line(n, 'no change'));
  const undecided = of('undecided').map((n) => line(n, `**do not migrate yet.** ${legacy[n].proposedNext?.length ? `Proposal: ${legacy[n].proposedNext.map(displayName).join(', ')}. ` : ''}${legacy[n].note ?? ''}`.trim()));
  const usageDir = config.manifests.ship ? `${config.manifests.ship}/usage/<key>.md` : `${config.manifests.usage}/<key>.md`;
  const list = (rows) => (rows.length ? rows.join('\n') : '_none_');
  return [
    '# Migration guide: legacy → namespace',
    '',
    `Generated from \`${config.manifests.legacy}/*.json\` by \`scripts/ds-manifest.mjs docs\`. Do not edit; regenerate. Recipes are find/replace per export; the target component's contract (when, which variant, what to compose) is its usage doc at \`${usageDir}\`. Read the usage doc before applying a recipe.`,
    '',
    `**${names.length} legacy exports: ${of('replaced').length} replaced · ${of('absorbed').length} absorbed · ${of('deprecated').length} deprecated · ${of('kept').length} kept · ${of('undecided').length} undecided.** Entries under Undecided have no recipe yet: leave those call sites alone and report them.`,
    '',
    `## Replaced\n\n${list(replaced)}\n`,
    `## Absorbed (dies by recipe, no namespace component)\n\n${list(absorbed)}\n`,
    `## Deprecated (still exported)\n\n${list(deprecated)}\n`,
    `## Kept\n\n${list(kept)}\n`,
    `## Undecided\n\n${list(undecided)}\n`,
  ].join('\n');
};

// ---------- commands ----------

export const docsPaths = (config, root = process.cwd()) => ({
  parity: resolve(root, config.manifests.parityDoc),
  legacy: resolve(root, config.manifests.legacyDoc),
  migration: resolve(root, config.manifests.migrationDoc ?? 'MIGRATION.md'),
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
  if (Object.keys(manifests.legacy).length) {
    compare(config.manifests.legacyDoc, paths.legacy, renderLegacyDoc(config, manifests));
    compare(config.manifests.migrationDoc ?? 'MIGRATION.md', paths.migration, renderMigrationDoc(config, manifests));
  }
  return errors;
};

// ---------- shipping ----------
// A doc that never crosses node_modules does not exist for the consumer. The package
// ships compiled output; the docs above sit in the repo root and the usage folder, so
// without this step an agent migrating a consumer app has nothing to read.

const readPackageJson = (root) => {
  const p = join(root, 'package.json');
  return existsSync(p) ? JSON.parse(readFileSync(p, 'utf8')) : null;
};

// `files` covers a path when an entry equals it or is one of its parents.
const filesCover = (files, path) => {
  const clean = (x) => x.replace(/^\.\//, '').replace(/\/+$/, '');
  const target = clean(path);
  return (files ?? []).some((f) => { const e = clean(f); return e === target || target.startsWith(`${e}/`); });
};

export const checkShip = (config, root = process.cwd()) => {
  const ship = config.manifests.ship;
  if (!ship) return [];
  const errors = [];
  const pkg = readPackageJson(root);
  if (!pkg) return [`manifests.ship is set but package.json is missing`];
  const llms = config.manifests.llmsDoc ?? 'llms.txt';
  if (!Array.isArray(pkg.files)) errors.push(`package.json has no "files"; the shipped docs (${ship}, ${llms}) never reach the consumer`);
  else {
    if (!filesCover(pkg.files, ship)) errors.push(`package.json "files" does not cover ${ship}; usage docs and MIGRATION.md stay in the repo`);
    if (!filesCover(pkg.files, llms)) errors.push(`package.json "files" does not cover ${llms}; the consumer's agent has no index to find the docs`);
  }
  const scripts = Object.values(pkg.scripts ?? {}).join('\n');
  if (!/ds-manifest\.mjs ship|ds:ship/.test(scripts)) errors.push(`no package.json script runs \`ds-manifest.mjs ship\`; wire it into prepack or build so a release cannot skip it`);
  return errors;
};

export const renderLlms = (config, manifests, pkgName, usageKeys) => {
  const base = `node_modules/${pkgName}`;
  const ship = config.manifests.ship;
  const parityKeys = [...usageKeys].sort();
  const legacyCount = Object.keys(manifests.legacy).length;
  return [
    `# ${pkgName}`,
    '',
    `> Design-system package. Components live under the namespace export; every component at parity has a usage doc (when to use it, which variant, what to compose, the owner's warnings). Read the usage doc before composing; read MIGRATION.md before touching a legacy import. Paths below are relative to the consuming repo.`,
    '',
    '## Start here',
    '',
    ...(legacyCount ? [`- [Migration guide](${base}/${ship}/MIGRATION.md): find/replace recipe per legacy export; \`undecided\` entries are not to be migrated yet.`] : []),
    `- [Parity](${base}/${ship}/PARITY.md): which components exist and their status against the design kit.`,
    `- [parity.json](${base}/${ship}/parity.json): the same, machine-readable, one entry per component key with axes and decisions.`,
    ...(legacyCount ? [`- [legacy-map.json](${base}/${ship}/legacy-map.json): the migration guide, machine-readable, keyed by legacy export name.`] : []),
    '',
    `## Usage docs (${parityKeys.length})`,
    '',
    ...parityKeys.map((k) => `- [${displayName(k)}](${base}/${ship}/usage/${k}.md)`),
    '',
    '## Not shipped',
    '',
    '- Component sources and stories stay in the library repo. The surface is the exports, their props and the token names; anything past that is internal.',
    '',
  ].join('\n');
};

export const ship = (config, manifests, root = process.cwd()) => {
  const shipDir = config.manifests.ship;
  if (!shipDir) throw new Error('manifests.ship is not set in ds.config.json');
  const pkg = readPackageJson(root);
  if (!pkg?.name) throw new Error('package.json name is required to write llms.txt paths');
  const out = resolve(root, shipDir);
  rmSync(out, { recursive: true, force: true });
  mkdirSync(join(out, 'usage'), { recursive: true });
  const shipped = [];
  const copy = (from, to) => { if (existsSync(from)) { copyFileSync(from, to); shipped.push(relative(root, to)); } };
  const paths = docsPaths(config, root);
  copy(paths.parity, join(out, 'PARITY.md'));
  if (Object.keys(manifests.legacy).length) {
    copy(paths.legacy, join(out, 'LEGACY-MAP.md'));
    copy(paths.migration, join(out, 'MIGRATION.md'));
    writeFileSync(join(out, 'legacy-map.json'), JSON.stringify(manifests.legacy, null, 2) + '\n');
    shipped.push(relative(root, join(out, 'legacy-map.json')));
  }
  writeFileSync(join(out, 'parity.json'), JSON.stringify(manifests.parity, null, 2) + '\n');
  shipped.push(relative(root, join(out, 'parity.json')));
  const usageKeys = Object.keys(manifests.parity).filter((key) => existsSync(usagePath(config, key, root)));
  for (const key of usageKeys) copy(usagePath(config, key, root), join(out, 'usage', `${key}.md`));
  const llms = resolve(root, config.manifests.llmsDoc ?? 'llms.txt');
  writeFileSync(llms, renderLlms(config, manifests, pkg.name, usageKeys));
  shipped.push(relative(root, llms));
  return shipped;
};

const main = () => {
  const cmd = process.argv[2];
  const root = process.cwd();
  const config = loadConfig(root);
  const manifests = loadManifests(config, root);
  if (cmd === 'docs') {
    const paths = docsPaths(config, root);
    writeFileSync(paths.parity, renderParityDoc(config, manifests));
    if (Object.keys(manifests.legacy).length) {
      writeFileSync(paths.legacy, renderLegacyDoc(config, manifests));
      writeFileSync(paths.migration, renderMigrationDoc(config, manifests));
    }
    console.log(`docs written: ${Object.keys(manifests.parity).length} parity, ${Object.keys(manifests.legacy).length} legacy`);
    return;
  }
  if (cmd === 'ship') {
    const shipped = ship(config, manifests, root);
    console.log(`shipped ${shipped.length} files:\n${shipped.map((f) => `  ${f}`).join('\n')}`);
    return;
  }
  if (cmd === 'usage') {
    const key = process.argv[3];
    if (!key || !manifests.parity[key]) { console.error(`usage: ds-manifest.mjs usage <key>; known: ${Object.keys(manifests.parity).join(', ') || 'none'}`); process.exit(2); }
    const path = usagePath(config, key, root);
    if (existsSync(path)) { console.error(`${path} exists; edit it, the scaffold never overwrites`); process.exit(1); }
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, renderUsageScaffold(key, manifests.parity[key]));
    console.log(`scaffold written: ${path}`);
    return;
  }
  if (cmd === 'check') {
    const errors = [...validate(config, manifests, root), ...checkDocs(config, manifests, root), ...checkShip(config, root)];
    if (errors.length) { errors.forEach((e) => console.error(`✗ ${e}`)); process.exit(1); }
    console.log(`ok: ${Object.keys(manifests.parity).length} parity, ${Object.keys(manifests.legacy).length} legacy`);
    return;
  }
  console.error('usage: ds-manifest.mjs <docs|check|ship|usage <key>>');
  process.exit(2);
};

if (import.meta.url === `file://${process.argv[1]}`) main();
