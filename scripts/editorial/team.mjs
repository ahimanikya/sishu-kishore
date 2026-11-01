import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const ROLES = ['Disha', 'Anvesha', 'Samanta', 'Drishti'];
const UNITS = ['article', 'book_section', 'edition_assembly', 'bounded_maintenance', 'author_profile', 'translation_section', 'illustration_batch'];
const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const text = value => typeof value === 'string' && value.trim().length > 0;
const evidence = value => Array.isArray(value) && value.length > 0 && value.every(text);
const array = value => Array.isArray(value) ? value : [];
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
export const safeFile = value => text(value) && !value.includes('\\') && !value.includes(':') &&
  !value.includes('\0') && !/[?*\[\]{}]/.test(value) && !path.posix.isAbsolute(value) &&
  value.split('/').every(part => part !== '' && part !== '.' && part !== '..');

/** Consistency only: saved records do not prove approval, a live worker or an OS lock. */
export function validateTeam(assignments, operations, handoff, {readFile} = {}) {
  const errors = [];
  const error = message => errors.push(message);
  if (![assignments, operations, handoff].every(object)) return {errors:['Assignments, operations and handoff must be objects.']};
  if (assignments.version !== 1 || operations.version !== 1) error('Unsupported team record version.');
  for (const record of [assignments, operations]) {
    if (record.human_supervisor !== 'Ahimanikya Satapathy' || record.human_role !== 'Creative Editor') error('All AI roles must report directly to Ahimanikya Satapathy, Creative Editor.');
  }
  if (assignments.human_editors !== 'peers') error('Human editors must remain peers.');
  if (!text(assignments.authorization)) error('Missing adoption instruction.');
  if (!Array.isArray(assignments.assignments)) error('assignments must be an array.');
  const roster = array(assignments.assignments);
  if (roster.length !== 4 || new Set(roster.map(x => x?.name)).size !== 4 || roster.some(x => !ROLES.includes(x?.name))) error('Four distinct approved roles are required.');
  for (const member of roster) {
    if (!object(member)) {error('Malformed assignment.'); continue;}
    if (member.reports_to !== assignments.human_supervisor || !Array.isArray(member.human_reports) || member.human_reports.length) error(`${member.name}: invalid reporting relationship.`);
    if (member.mode !== (member.name === 'Disha' ? 'coordinator' : 'separate_task_agent') || !text(member.scope)) error(`${member.name}: invalid execution mode or missing scope.`);
  }
  if (['coordinator','shared_writer','publisher'].some(key => operations[key] !== 'Disha')) error('Disha alone coordinates shared records and delivery.');
  if (operations.maximum_active_units !== 1) error('Keep one active bounded production unit.');
  if (!Array.isArray(operations.unit_types) || operations.unit_types.length !== UNITS.length || new Set(operations.unit_types).size !== UNITS.length || UNITS.some(unit => !operations.unit_types.includes(unit))) error('Invalid work-unit definitions.');
  if (!text(handoff.id) || !text(handoff.task) || !text(handoff.authorization) || !/^[a-f0-9]{7,40}$/.test(handoff.input_head ?? '')) error('Handoff requires identity, task, authorization and input head.');
  if (!UNITS.includes(handoff.unit_type)) error('Invalid handoff unit type.');
  if (!['in_progress','awaiting_review','ready','completed','blocked'].includes(handoff.status)) error('Invalid handoff status.');
  if (handoff.coordinator !== 'Disha') error('Handoff must have Disha as coordinator.');
  if (!Array.isArray(handoff.workers) || !Array.isArray(handoff.coordinator_files)) error('Worker and coordinator file lists must be arrays.');
  const workers = array(handoff.workers), ownership = new Map(), runtimes = new Map();
  function files(paths, owner, active) {
    if (!Array.isArray(paths)) {error(`${owner}: reserved_files must be an array.`); return;}
    const seen = new Set();
    for (const file of paths) {
      if (!safeFile(file)) {error(`${owner}: unsafe or non-exact file reservation.`); continue;}
      if (seen.has(file)) error(`${owner}: duplicate reservation ${file}.`);
      seen.add(file);
      if (active) {
        for (const [existing, previous] of ownership) {
          if (file === existing || file.startsWith(existing + '/') || existing.startsWith(file + '/')) error(`Conflicting reservations: ${owner} and ${previous} (${file}).`);
        }
        ownership.set(file, owner);
      }
    }
  }
  files(handoff.coordinator_files, 'Disha', handoff.coordinator_reservations_released !== true);
  const seenRoles = new Set();
  for (const worker of workers) {
    if (!object(worker)) {error('Malformed worker.'); continue;}
    if (!['Anvesha','Samanta','Drishti'].includes(worker.role) || seenRoles.has(worker.role)) error('Workers must have distinct specialist roles.');
    seenRoles.add(worker.role);
    if (!['assigned','running','completed','blocked'].includes(worker.status)) error(`${worker.role}: invalid worker status.`);
    if (!['read_only','write'].includes(worker.mode)) error(`${worker.role}: invalid worker mode.`);
    if (worker.role === 'Drishti' && worker.mode !== 'read_only') error('Drishti must review read-only.');
    if (worker.mode === 'read_only' && array(worker.reserved_files).length) error(`${worker.role}: read-only workers cannot reserve write files.`);
    if (['running','completed'].includes(worker.status) && !text(worker.runtime)) error(`${worker.role}: actual runtime identity is required.`);
    if (text(worker.runtime)) {
      if (worker.runtime === (handoff.coordinator_runtime ?? '/root') || runtimes.has(worker.runtime)) error(`${worker.role}: runtime must be distinct from coordinator and other workers.`);
      runtimes.set(worker.runtime, worker.role);
    }
    if (['assigned','running','blocked'].includes(worker.status) && worker.reservations_released === true && worker.mode === 'write') error(`${worker.role}: active writer cannot have released reservations.`);
    files(worker.reserved_files, worker.role, ['assigned','running','blocked'].includes(worker.status) && worker.reservations_released !== true);
    if (worker.status === 'completed') {
      if (worker.reservations_released !== true) error(`${worker.role}: completed reservations must be explicitly released.`);
      if (!object(worker.result) || !text(worker.result.summary) || !evidence(worker.result.evidence)) error(`${worker.role}: completed work needs a result and evidence.`);
    }
  }
  const review = handoff.review;
  const boundedSelfReview = object(review) && review.kind === 'self_review' && review.reviewer === 'Disha' &&
    text(review.runtime) && review.runtime === (handoff.coordinator_runtime ?? '/root') &&
    ['trivial_change','separate_agents_unavailable'].includes(review.exception_reason) && text(review.limitation) &&
    review.independent !== true;
  if (review !== null && review !== undefined) {
    if (!object(review)) error('Review must be an object.');
    else {
      const reviewer = workers.find(w => w?.role === 'Drishti');
      if (review.kind === 'self_review') {
        if (!boundedSelfReview) error('Self-review requires coordinator identity, a bounded exception reason and an explicit limitation; it cannot be independent.');
      } else if (review.kind !== 'separate_ai_review' || review.reviewer !== 'Drishti' || !text(review.runtime) || review.runtime !== reviewer?.runtime || reviewer?.mode !== 'read_only') {
        error('Review must identify the actual separate read-only Drishti worker.');
      }
      if (!['pass','pass_with_limitations','fail','not_tested'].includes(review.outcome) || !evidence(review.evidence)) error('Review needs an outcome and evidence.');
      const commit = typeof review.candidate_commit === 'string' && /^[a-f0-9]{40}$/.test(review.candidate_commit);
      const manifest = object(review.candidate_files) && Object.keys(review.candidate_files).length > 0;
      if (!commit && !manifest) error('Review must pin a full candidate commit or SHA-256 file manifest.');
      if (review.candidate_commit !== undefined && !commit) error('Invalid candidate commit.');
      if (review.candidate_files !== undefined && !manifest) error('Invalid candidate file manifest.');
      if (manifest) for (const [file, digest] of Object.entries(review.candidate_files)) {
        if (!safeFile(file) || typeof digest !== 'string' || !/^[a-f0-9]{64}$/.test(digest)) {error('Invalid reviewed file or SHA-256.'); continue;}
        if (handoff.status !== 'completed' && ['awaiting_review','ready'].includes(handoff.status)) {
          if (!readFile) error('Active review manifest needs actual file verification.');
          else try {if (hash(readFile(file)) !== digest) error(`Reviewed file changed: ${file}.`);} catch {error(`Cannot verify reviewed file: ${file}.`);}
        }
      }
    }
  }
  if (['ready','completed'].includes(handoff.status)) {
    if (!object(review) || !['pass','pass_with_limitations'].includes(review.outcome)) error('Ready/completed work needs a passing separate review or a documented bounded self-review.');
    if (workers.some(w => w?.status !== 'completed')) error('Ready/completed task must have completed workers only.');
    if (!workers.length && !boundedSelfReview) error('An empty worker list is allowed only for documented bounded self-review.');
  }
  if (handoff.status === 'ready' && handoff.coordinator_reservations_released === true) error('Keep coordinator reservations until delivery is completed.');
  if (handoff.status === 'completed') {
    if (handoff.coordinator_reservations_released !== true) error('Release coordinator reservations on completion.');
    if (!object(handoff.delivery) || !['local','published'].includes(handoff.delivery.mode) || !evidence(handoff.delivery.evidence)) error('Completed task needs local or published delivery evidence.');
  }
  return {errors:[...new Set(errors)], scope:'Record consistency only; not distributed locking, approval authenticity, runtime liveness or proof of actual review.'};
}

function readLocal(file) {
  if (!safeFile(file)) throw Error('Use a safe repository-relative path.');
  const realRoot = fs.realpathSync(root), actual = fs.realpathSync(path.join(root, file));
  if (!actual.startsWith(realRoot + path.sep) || !fs.statSync(actual).isFile()) throw Error('File is outside the repository or is not a regular file.');
  return fs.readFileSync(actual);
}
function main() {
  const load = file => JSON.parse(readLocal(file).toString('utf8'));
  const assignments = load('kb/team/assignments.json'), operations = load('kb/team/operations.json');
  const handoffPath = process.argv[2] ?? operations.active_handoff ?? operations.latest_handoff;
  if (!handoffPath) throw Error('No active or latest handoff recorded.');
  const report = validateTeam(assignments, operations, load(handoffPath), {readFile:readLocal});
  console.log(JSON.stringify(report, null, 2));
  process.exitCode = report.errors.length ? 1 : 0;
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {main();} catch (error) {console.error(error.message); process.exitCode = 1;}
}
