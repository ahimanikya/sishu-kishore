import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
export const model = JSON.parse(fs.readFileSync(path.join(repo, 'kb/editorial-model/model.json'), 'utf8'));
export const fingerprint = bytes => createHash('sha256').update(bytes).digest('hex');
const text = value => typeof value === 'string' && value.trim().length > 0;
const positive = value => Number.isInteger(value) && value > 0;
const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);
export function candidateFingerprint(record) {
  // Exclude authorization and post-publication evidence from the candidate being authorized.
  const {authorization, delivery, ...candidate} = record;
  candidate.stages = (Array.isArray(record.stages) ? record.stages : []).filter(s => s?.id !== 'publish_and_verify');
  return fingerprint(Buffer.from(JSON.stringify(candidate)));
}

export function newProject(kind, id) {
  if (!Object.hasOwn(model.workflows, kind)) throw Error('Choose magazine or book.');
  if (!/^[a-z0-9][a-z0-9-]{0,79}$/.test(id)) throw Error('Use a short lowercase identifier with letters, numbers and hyphens.');
  return {
    model_version: model.version, id, kind, profile: 'sishu-kishore',
    candidate_revision: 1, visibility: 'private', destination: '',
    creative_editor: model.authority.creative_editor,
    required_artifacts: [], artifacts: [], authorization: null,
    stages: model.workflows[kind].map(id => ({id, state: 'pending', evidence: ''})),
    delivery: null,
  };
}

export function validateProject(record, {release = false, readArtifact} = {}) {
  const errors = [], warnings = [], stale = new Set(), items = new Map();
  const error = message => errors.push(message);
  const incomplete = message => (release ? errors : warnings).push(message);
  if (!object(record)) return {errors: ['Record must be an object.'], warnings, stale: []};
  if (record.model_version !== model.version) error('Unsupported model_version; review migration before use.');
  if (!text(record.id)) error('Missing project id.');
  if (!Object.hasOwn(model.workflows, record.kind ?? '')) error('Unknown workflow kind.');
  if (!Object.hasOwn(model.profiles, record.profile ?? '')) error('Unknown publication profile.');
  if (record.creative_editor !== model.authority.creative_editor) error('Creative Editor differs from the current project authority.');
  if (!positive(record.candidate_revision)) error('candidate_revision must be a positive integer.');
  if (!model.publication_modes.includes(record.visibility)) error('Unknown visibility.');
  if (!Array.isArray(record.artifacts)) error('artifacts must be an array.');
  if (!Array.isArray(record.required_artifacts)) error('required_artifacts must be an array.');
  for (const item of Array.isArray(record.artifacts) ? record.artifacts : []) {
    if (!object(item) || !text(item.id)) {error('Artifact must have an id.'); continue;}
    if (items.has(item.id)) error(`Duplicate artifact: ${item.id}`);
    items.set(item.id, item);
    if (!model.artifact_kinds.includes(item.kind)) error(`${item.id}: unknown artifact kind.`);
    if (!positive(item.revision)) error(`${item.id}: revision must be positive.`);
    if (!['draft', 'ready'].includes(item.state)) error(`${item.id}: state must be draft or ready.`);
    if (!Array.isArray(item.depends_on)) error(`${item.id}: depends_on must be an array.`);
    if (!Array.isArray(item.reviews)) error(`${item.id}: reviews must be an array.`);
    if (!Array.isArray(item.open_findings)) error(`${item.id}: open_findings must be an array.`);
    if (!text(item.file) || !/^[a-f0-9]{64}$/.test(item.sha256 ?? '')) {
      warnings.push(`${item.id}: file and SHA-256 are required to verify an artifact.`);
    } else if (readArtifact) {
      try {
        if (fingerprint(readArtifact(item.file)) !== item.sha256) {
          error(`${item.id}: file changed without a matching fingerprint.`); stale.add(item.id);
        }
      } catch {error(`${item.id}: cannot read artifact file within the workspace.`); stale.add(item.id);}
    } else if (release) error(`${item.id}: release check requires actual file verification.`);
  }
  for (const item of items.values()) {
    for (const dep of Array.isArray(item.depends_on) ? item.depends_on : []) {
      if (!object(dep) || !text(dep.id) || !positive(dep.revision)) {error(`${item.id}: malformed dependency.`); continue;}
      const source = items.get(dep.id);
      if (!source) error(`${item.id}: missing dependency ${dep.id}.`);
      else if (source.revision !== dep.revision) stale.add(item.id);
    }
  }
  const visited = new Set(), visiting = new Set();
  function visit(id) {
    if (visiting.has(id)) {error(`Dependency cycle at ${id}.`); return;}
    if (visited.has(id)) return;
    visiting.add(id);
    const item = items.get(id);
    for (const dep of Array.isArray(item?.depends_on) ? item.depends_on : []) {
      if (items.has(dep?.id)) {visit(dep.id); if (stale.has(dep.id)) stale.add(id);}
    }
    visiting.delete(id); visited.add(id);
  }
  for (const id of items.keys()) visit(id);
  for (const id of stale) error(`${id}: stale; compare with changed sources and review again.`);
  const required = Array.isArray(record.required_artifacts) ? record.required_artifacts : [];
  if (!required.length) incomplete('Select the complete release artifact set in required_artifacts.');
  const selected = new Set();
  function select(id) {
    if (selected.has(id)) return;
    selected.add(id);
    const item = items.get(id);
    if (!item) {error(`Required artifact is missing: ${id}`); return;}
    for (const dep of Array.isArray(item.depends_on) ? item.depends_on : []) if (text(dep?.id)) select(dep.id);
  }
  required.forEach(select);
  for (const id of selected) {
    const item = items.get(id); if (!item) continue;
    if (!text(item.file) || !/^[a-f0-9]{64}$/.test(item.sha256 ?? '')) incomplete(`${id}: missing file or fingerprint.`);
    if (item.state !== 'ready') incomplete(`${id}: not ready.`);
    if (item.open_findings?.length) incomplete(`${id}: unresolved findings remain.`);
    const reviews = Array.isArray(item.reviews) ? item.reviews : [];
    if (!reviews.some(r => object(r) && r.revision === item.revision && r.outcome === 'pass' &&
      model.quality_policy.reviews.includes(r.kind) && text(r.reviewer) && text(r.evidence) &&
      Array.isArray(r.dimensions) && r.dimensions.length > 0 && r.dimensions.every(d => model.review_dimensions.includes(d)))) {
      incomplete(`${id}: missing evidenced passing review of this revision.`);
    }
    const kinds = (Array.isArray(item.depends_on) ? item.depends_on : []).map(d => items.get(d.id)?.kind);
    if (['article','book-text'].includes(item.kind) && (!kinds.includes('source') || !kinds.includes('author'))) incomplete(`${id}: must link its source and central author record.`);
    if (item.kind === 'translation' && !kinds.some(k => ['source','article','book-text'].includes(k))) incomplete(`${id}: must depend directly on original text, not only another translation.`);
    if (item.kind === 'illustration' && !kinds.some(k => ['article','book-text'].includes(k))) incomplete(`${id}: must link the complete literary contribution.`);
    if (['cover','editorial'].includes(item.kind) && !kinds.includes('contents')) incomplete(`${id}: must link the edition/book contents.`);
  }
  if (release) {
    const kinds = [...selected].map(id => items.get(id)?.kind);
    const baseline = record.kind === 'magazine' ? ['source','author','article','illustration','contents','cover','layout'] : ['source','author','book-text','contents','cover','layout'];
    for (const kind of baseline) if (!kinds.includes(kind)) error(`Release lacks a ${kind} artifact.`);
    const stages = Array.isArray(record.stages) ? record.stages : [];
    // Publication and live verification follow this pre-release check, never precede it.
    for (const id of (model.workflows[record.kind] ?? []).filter(s => s !== 'publish_and_verify')) {
      const matches = stages.filter(s => s?.id === id), stage = matches[0];
      if (matches.length !== 1 || !['done','not_applicable'].includes(stage?.state) || !text(stage?.evidence)) error(`Stage ${id}: record completion or a justified exclusion.`);
    }
    const auth = record.authorization;
    if (!object(auth) || auth.human !== record.creative_editor || !text(auth.instruction) ||
      auth.candidate_revision !== record.candidate_revision || auth.candidate_sha256 !== candidateFingerprint(record) || auth.visibility !== record.visibility ||
      !text(record.destination) || auth.destination !== record.destination) error('Missing human release authorization matching candidate, visibility and destination.');
    if (record.visibility === 'private') error('Private work cannot pass a publication check.');
    if (/^\/(?:shishu|sishu)(?:\/|$)/.test(record.destination ?? '')) error('Retired publication destination.');
  }
  return {errors: [...new Set(errors)], warnings: [...new Set(warnings)], stale: [...stale]};
}

export function readWorkspaceArtifact(root, file) {
  if (!text(file) || path.isAbsolute(file)) throw Error('Artifact path must be relative.');
  const base = fs.realpathSync(root), target = fs.realpathSync(path.resolve(base, file));
  if (!target.startsWith(base + path.sep)) throw Error('Artifact outside workspace.');
  return fs.readFileSync(target);
}

function main(args) {
  const [command, first, second] = args;
  if (command === 'init') {
    const record = newProject(first, second), dir = path.join(repo, 'editorial-private/editorial-model');
    fs.mkdirSync(dir, {recursive: true});
    const file = path.join(dir, `${record.id}.json`);
    fs.writeFileSync(file, JSON.stringify(record, null, 2) + '\n', {flag: 'wx'});
    console.log(`Created private draft: ${path.relative(repo, file)}`);
  } else if (command === 'candidate-hash') {
    console.log(candidateFingerprint(JSON.parse(fs.readFileSync(path.resolve(repo, first), 'utf8'))));
  } else if (command === 'hash') {
    console.log(fingerprint(readWorkspaceArtifact(repo, first)));
  } else if (command === 'check') {
    const record = JSON.parse(fs.readFileSync(path.resolve(repo, first), 'utf8'));
    const report = validateProject(record, {release: args.includes('--release'), readArtifact: file => readWorkspaceArtifact(repo, file)});
    console.log(JSON.stringify(report, null, 2));
    console.log(report.errors.length ? 'CHECK FAILED' : 'Structure checked. This does not certify content or grant publication approval.');
    process.exitCode = report.errors.length ? 1 : 0;
  } else throw Error('Usage: model.mjs init <magazine|book> <id> | hash <relative-file> | candidate-hash <record.json> | check <record.json> [--release]');
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {main(process.argv.slice(2));} catch (error) {console.error(error.message); process.exitCode = 1;}
}
