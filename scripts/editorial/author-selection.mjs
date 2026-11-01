import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const text = value => typeof value === 'string' && value.trim().length > 0;
const profile = value => typeof value === 'string' && /^\/writers\/[a-zA-Z0-9][a-zA-Z0-9_-]*\.html$/.test(value);
const month = value => typeof value === 'string' && /^\d{4}-(0[1-9]|1[0-2])$/.test(value) && Number(value.slice(0, 4)) > 0;
export function precedingIssue(issue) {
  if (!month(issue)) throw Error('Issue must be YYYY-MM.');
  const [year, number] = issue.split('-').map(Number);
  if (year === 1 && number === 1) throw Error('Issue has no supported preceding month.');
  return number === 1 ? `${String(year - 1).padStart(4, '0')}-12` : `${String(year).padStart(4, '0')}-${String(number - 1).padStart(2, '0')}`;
}

/**
 * Compare contributor identities, never display-name spellings. Callers must
 * resolve author_profiles to the existing canonical central profile routes.
 * A first issue requires explicit first_issue:true and previous:null.
 * Historical prior issues may have repeated authors; only candidate selection
 * is subject to the one-contribution rule. This does not grant release approval.
 */
export function validateAuthorSelection(candidate, previous, options = {}) {
  const errors = [], warnings = [], duplicates = [], rotation = [];
  const rotationMode = options?.rotationMode ?? 'strict';
  if (!['strict', 'advisory'].includes(rotationMode)) errors.push('rotationMode must be strict or advisory.');
  function parse(record, label) {
    if (!object(record)) {errors.push(`${label}: selection must be an object.`); return [];}
    if (!month(record.issue)) errors.push(`${label}: issue must be YYYY-MM.`);
    if (!Array.isArray(record.articles)) {errors.push(`${label}: articles must be an array.`); return [];}
    if (!record.articles.length) errors.push(`${label}: articles must not be empty.`);
    const ids = new Set(), articles = [];
    for (const [index, item] of record.articles.entries()) {
      const where = `${label}: article ${index + 1}`;
      if (!object(item)) {errors.push(`${where} must be an object.`); continue;}
      if (!text(item.id)) errors.push(`${where} needs an id.`);
      else if (ids.has(item.id)) errors.push(`${where}: duplicate article id ${item.id}.`);
      ids.add(item.id);
      if (!text(item.title)) errors.push(`${where} needs a title.`);
      if (!Array.isArray(item.author_profiles) || !item.author_profiles.length) {
        errors.push(`${where} needs at least one resolved canonical author profile.`); continue;
      }
      const authors = new Set();
      for (const author of item.author_profiles) {
        if (!profile(author)) errors.push(`${where}: invalid canonical author profile.`);
        else if (authors.has(author)) errors.push(`${where}: repeated author profile ${author}.`);
        else authors.add(author);
      }
      articles.push({id: item.id, title: item.title, author_profiles: [...authors]});
    }
    return articles;
  }
  const selected = parse(candidate, 'Candidate');
  let preceding = [];
  if (previous === null) {
    if (!object(candidate) || candidate.first_issue !== true) errors.push('Previous issue is required; only an explicit first_issue:true may use null.');
  } else {
    preceding = parse(previous, 'Previous');
    if (candidate?.first_issue === true) errors.push('A first issue cannot also provide a previous issue.');
    if (month(candidate?.issue) && month(previous?.issue)) {
      try {
        if (previous.issue !== precedingIssue(candidate.issue)) errors.push('Previous issue must be the immediately preceding month.');
      } catch (error) {errors.push(error.message);}
    }
  }
  const selectedByAuthor = new Map(), previousByAuthor = new Map();
  for (const item of selected) for (const author of item.author_profiles) {
    const group = selectedByAuthor.get(author) ?? []; group.push({id:item.id, title:item.title}); selectedByAuthor.set(author, group);
  }
  for (const item of preceding) for (const author of item.author_profiles) {
    const group = previousByAuthor.get(author) ?? []; group.push({id:item.id, title:item.title}); previousByAuthor.set(author, group);
  }
  for (const [author_profile, articles] of selectedByAuthor) {
    if (articles.length > 1) {
      duplicates.push({author_profile, articles});
      errors.push(`More than one contribution by ${author_profile} in the candidate issue.`);
    }
    if (previousByAuthor.has(author_profile)) {
      rotation.push({author_profile, articles, previous_articles:previousByAuthor.get(author_profile)});
      const message = `${author_profile} also contributed to the previous issue.`;
      if (rotationMode === 'strict') errors.push(message);
      else if (rotationMode === 'advisory') warnings.push(message);
    }
  }
  return {errors:[...new Set(errors)], warnings:[...new Set(warnings)], duplicates, rotation,
    rotation_mode:rotationMode, scope:'Selection check only; canonical identity resolution and publication authorization remain editorial responsibilities.'};
}

/** Read public catalogue membership and byline links, resolving reviewed aliases. */
export function readSiteEdition(route, issue, root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')) {
  root = path.resolve(root);
  if (typeof route !== 'string' || !route.startsWith('/') || route.includes('..') || /[?#]/.test(route)) throw Error('Invalid edition catalogue route.');
  issue ??= /^\/editions\/(\d{4}-\d{2})\/$/.exec(route)?.[1];
  if (!month(issue)) throw Error('An explicit YYYY-MM is required for legacy issue routes.');
  const catalog = JSON.parse(fs.readFileSync(path.join(root, 'public/edition-reader.json'), 'utf8'));
  if (!Object.hasOwn(catalog, route) || !Array.isArray(catalog[route]?.items)) throw Error('Edition is missing from the public catalogue.');
  const aliasFile = path.join(root, 'provenance/writer-merges.json');
  const aliases = new Map();
  const normalize = value => typeof value === 'string' ? value.replace(/^\/shishu\//, '/') : value;
  if (fs.existsSync(aliasFile)) {
    const manifest = JSON.parse(fs.readFileSync(aliasFile, 'utf8'));
    for (const group of manifest.groups ?? []) {
      const canonical = normalize(group.canonical);
      if (!profile(canonical)) throw Error('Invalid canonical author in merge provenance.');
      for (const member of group.members ?? []) aliases.set(normalize(member.route), canonical);
    }
  }
  const resolve = value => {
    const seen = new Set(); let current = normalize(value);
    while (aliases.has(current) && aliases.get(current) !== current) {
      if (seen.has(current)) throw Error('Author alias cycle.');
      seen.add(current); current = aliases.get(current);
    }
    if (!profile(current) || !fs.existsSync(path.join(root, 'public', current))) throw Error('Missing canonical author profile.');
    return current;
  };
  const articles = catalog[route].items.map(item => {
    if (!object(item) || !text(item.href) || !item.href.startsWith('/') || item.href.includes('..')) throw Error('Malformed article catalogue entry.');
    const url = new URL(item.href, 'https://shishukishora.com');
    if (url.origin !== 'https://shishukishora.com' || !url.pathname.endsWith('.html')) throw Error('Article URL must be a local HTML page.');
    const html = fs.readFileSync(path.join(root, 'public', url.pathname), 'utf8');
    const byline = html.match(/<p\b(?=[^>]*\bclass\s*=\s*["'][^"']*\bia-byline\b[^"']*["'])[^>]*>([\s\S]*?)<\/p>/i)?.[1];
    if (!byline) throw Error(`Missing linked author byline for ${url.pathname}.`);
    const links = [...byline.matchAll(/<a\b[^>]*\bhref\s*=\s*(["'])(.*?)\1/gi)].map(match => match[2]);
    const profiles = links.filter(link => /^\/(?:shishu\/)?writers\//.test(link)).map(resolve);
    if (!profiles.length) throw Error(`Missing canonical author link for ${url.pathname}.`);
    return {id:url.pathname, title:item.title, author_profiles:[...new Set(profiles)]};
  });
  return {issue, articles};
}

function main(args) {
  if (args[0] === 'site') {
    const [, candidateRoute, previousRoute, ...flags] = args;
    if (!candidateRoute || !previousRoute || flags.length % 2) throw Error('Usage: author-selection.mjs site <candidateRoute> <previousRoute> [--rotation-mode strict|advisory] [--candidate-month YYYY-MM] [--previous-month YYYY-MM]');
    const values = new Map();
    for (let i=0;i<flags.length;i+=2) {
      if (!['--rotation-mode','--candidate-month','--previous-month'].includes(flags[i]) || values.has(flags[i])) throw Error('Unknown or repeated site option.');
      values.set(flags[i],flags[i+1]);
    }
    const report = validateAuthorSelection(readSiteEdition(candidateRoute, values.get('--candidate-month')), readSiteEdition(previousRoute, values.get('--previous-month')), {rotationMode:values.get('--rotation-mode') ?? 'strict'});
    console.log(JSON.stringify(report, null, 2)); process.exitCode = report.errors.length ? 1 : 0; return;
  }
  const [candidateFile, previousFile, ...flags] = args;
  if (!candidateFile || !previousFile || (flags.length && (flags.length !== 2 || flags[0] !== '--rotation' || !['strict','advisory'].includes(flags[1])))) {
    throw Error('Usage: author-selection.mjs <candidate.json> <previous.json|--first-issue> [--rotation strict|advisory]');
  }
  const candidate = JSON.parse(fs.readFileSync(candidateFile, 'utf8'));
  const previous = previousFile === '--first-issue' ? null : JSON.parse(fs.readFileSync(previousFile, 'utf8'));
  const report = validateAuthorSelection(candidate, previous, {rotationMode:flags[1] ?? 'strict'});
  console.log(JSON.stringify(report, null, 2));
  process.exitCode = report.errors.length ? 1 : 0;
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {main(process.argv.slice(2));} catch (error) {console.error(error.message); process.exitCode = 1;}
}
