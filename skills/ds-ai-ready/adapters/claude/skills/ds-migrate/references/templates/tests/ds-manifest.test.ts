// Guards over the per-component manifests. Works under jest, or vitest with
// `test.globals: true` (bare describe/it). Expects to live one folder below
// the repo root, beside `scripts/`.
// Every assertion names the offending module: a red check that says
// "expected true" costs a reviewer a round trip.
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import {
  loadConfig, loadManifests, validate, checkDocs, renderParityDoc, docsPaths,
} from '../scripts/ds-manifest.mjs';

const root = process.cwd();
const config = loadConfig(root);
const manifests = loadManifests(config, root);

describe('parity manifests', () => {
  it('validate (statuses, references, usage docs, code connect mappings)', () => {
    expect(validate(config, manifests, root)).toEqual([]);
  });

  it('generated docs match the committed ones', () => {
    expect(checkDocs(config, manifests, root)).toEqual([]);
  });

  it('PARITY.md carries exactly one copy of each section', () => {
    if (!config.manifests.commitDocs) return;
    const doc = readFileSync(docsPaths(config, root).parity, 'utf8');
    for (const heading of renderParityDoc(config, manifests).match(/^## .+$/gm) ?? []) {
      expect({ heading, copies: doc.split(heading).length - 1 }).toEqual({ heading, copies: 1 });
    }
  });
});

describe('legacy map', () => {
  const indexPath = join(root, 'src', 'index.ts');
  const exportsFromIndex = (): string[] => {
    if (!existsSync(indexPath)) return [];
    const src = readFileSync(indexPath, 'utf8');
    return [...src.matchAll(/export \* as (\w+) from/g)].map((m) => m[1]);
  };

  it('every legacy export in src/index.ts has a manifest file or alias', () => {
    const known = new Set(Object.keys(manifests.legacy));
    for (const m of Object.values(manifests.legacy)) for (const a of m.aliases ?? []) known.add(a);
    const missing = exportsFromIndex().filter((e) => !known.has(e));
    expect(missing).toEqual([]);
  });
});
