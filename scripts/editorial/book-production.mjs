/**
 * Book-production evidence record for English/Odia original, translated and
 * adapted editions. Sections are in intentional reading order; IDs refer to
 * book-text artifacts. Repeated authors across sections are valid. Magazine
 * rotation and contribution quotas never apply here.
 *
 * language_editions carry their own fidelity, natural-language and typography
 * reviews; each requested output has separate QA and a language list. Reviews
 * are {reviewer,outcome:'pass',evidence}; this records claims, not their truth.
 * reviewer_kind may describe human/agent review but does not certify quality.
 * An unchanged original facsimile can use preservation_review instead of new
 * fidelity/language reviews; this certifies preservation, not a fresh proofread.
 * Translation-only publications are valid; source language need not be an output.
 * credits may retain prior translators without labeling the new edition a translation.
 * Original source files/hashes and dependency freshness remain the enclosing
 * artifact model's responsibility. source_preservation records their location.
 *
 * A facsimile may preserve unresolved readings in the original scan. A released
 * transcription cannot silently treat those readings as resolved. Review notes
 * and working copies belong in the private production record, not public pages.
 */
const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const text = value => typeof value === 'string' && value.trim().length > 0;
const languages = ['en', 'or'];
const formats = ['web', 'pdf', 'epub', 'print'];

export function newBookPlan() {
  return {
    audience: {age_band:'', reading_mode:''},
    source_language:'',
    source_preservation:{location:'', evidence:''},
    rights:{confirmed:false, evidence:''},
    credits:{authors:[], evidence:''},
    sections:[],
    language_editions:[],
    outputs:[],
  };
}

export function validateBookPlan(plan, {release=false, requiredSectionIds=[], visibility='private'} = {}) {
  const errors=[], warnings=[];
  const error = message => errors.push(message);
  const incomplete = message => (release ? errors : warnings).push(message);
  const needed = (value, label) => {if (!text(value)) incomplete(`${label} is required.`);};
  const list = (value, label) => {
    if (!Array.isArray(value)) {error(`${label} must be an array.`); return [];}
    return value;
  };
  const evidenceReview = (value, label) => {
    if (!object(value) || value.outcome !== 'pass' || !text(value.reviewer) || !text(value.evidence)) {
      incomplete(`${label} needs a passing review with reviewer and evidence.`);
    }
  };
  if (!object(plan)) return {errors:['Book plan must be an object.'], warnings};
  if (!['private','unlisted','public'].includes(visibility)) error('Unknown book visibility.');
  if (!object(plan.audience)) incomplete('Book audience is required.');
  else {
    needed(plan.audience.age_band, 'Audience age band');
    if (!text(plan.audience.reading_mode)) incomplete('Audience reading mode is required.');
    else if (!['read_aloud','shared','independent'].includes(plan.audience.reading_mode)) error('Unsupported reading mode.');
  }
  if (!text(plan.source_language)) incomplete('Source language is required.');
  else if (!languages.includes(plan.source_language)) error('Source language must be en or or.');
  if (!object(plan.source_preservation)) incomplete('Original-source preservation evidence is required.');
  else {
    needed(plan.source_preservation.location, 'Preserved original-source location');
    needed(plan.source_preservation.evidence, 'Original-source preservation evidence');
  }
  if (!object(plan.rights) || plan.rights.confirmed !== true || !text(plan.rights.evidence)) incomplete('Rights for the requested edition need confirmation and evidence.');
  if (!object(plan.credits)) incomplete('Original creator credits are required.');
  else {
    const authors=list(plan.credits.authors, 'Credited authors');
    if (!authors.length) incomplete('At least one credited author is required.');
    if (authors.some(author=>!text(author))) error('Author credits must be nonempty strings.');
    needed(plan.credits.evidence, 'Credit preservation evidence');
  }
  const sections=list(plan.sections, 'Book sections'), sectionIds=new Set();
  if (!sections.length) incomplete('Inventory the ordered book sections.');
  for (const [index, section] of sections.entries()) {
    const label=`Section ${index+1}`;
    if (!object(section)) {error(`${label} must be an object.`); continue;}
    if (!text(section.id)) error(`${label} needs an artifact ID.`);
    else if (sectionIds.has(section.id)) error(`Duplicate section ID: ${section.id}.`);
    else sectionIds.add(section.id);
    const refs=list(section.source_refs, `${label} source references`);
    if (!refs.length) incomplete(`${label} must identify its source pages or manuscript sections.`);
    if (refs.some(ref=>!text(ref))) error(`${label} source references must be nonempty strings.`);
    if (!['born_digital','transcription','facsimile'].includes(section.text_mode)) error(`${label} has an unsupported text mode.`);
    const unresolved=list(section.unresolved_readings, `${label} unresolved readings`);
    if (unresolved.some(note=>!text(note))) error(`${label} unresolved readings must be nonempty notes.`);
    if (unresolved.length && section.text_mode !== 'facsimile') incomplete(`${label} has unresolved source readings; do not release uncertain transcribed text as final.`);
    if (unresolved.length && section.text_mode === 'facsimile') warnings.push(`${label}: original facsimile retained; unresolved readings are not certified transcription.`);
  }
  if (!Array.isArray(requiredSectionIds) || requiredSectionIds.some(id=>!text(id)) || new Set(requiredSectionIds).size !== requiredSectionIds.length) {
    error('requiredSectionIds must contain distinct artifact IDs.');
  } else if (requiredSectionIds.length && (sectionIds.size !== requiredSectionIds.length || requiredSectionIds.some(id=>!sectionIds.has(id)))) {
    incomplete('Book section inventory must cover exactly the selected book-text artifact IDs.');
  }
  const editions=list(plan.language_editions, 'Language editions'), editionLanguages=new Set();
  if (!editions.length) incomplete('Select at least one language edition.');
  for (const [index, edition] of editions.entries()) {
    const label=`Language edition ${index+1}`;
    if (!object(edition)) {error(`${label} must be an object.`); continue;}
    if (!languages.includes(edition.language)) error(`${label} language must be en or or.`);
    else if (editionLanguages.has(edition.language)) error(`Duplicate language edition: ${edition.language}.`);
    else editionLanguages.add(edition.language);
    if (!['original','translation','adaptation'].includes(edition.mode)) error(`${label} has an unsupported editorial mode.`);
    if (edition.mode === 'original' && edition.language !== plan.source_language) error(`${label}: an original edition must use the source language.`);
    if (edition.mode === 'translation' && edition.language === plan.source_language) error(`${label}: translation needs a distinct target language.`);
    if (edition.mode === 'translation') needed(edition.translator_credit, `${label} translator credit`);
    if (edition.mode === 'adaptation') {
      needed(edition.adaptation_authorization, `${label} adaptation authorization`);
      needed(edition.adapter_credit, `${label} adapter credit`);
    }
    const preservedFacsimile = edition.mode === 'original' && edition.unchanged_facsimile === true;
    if (preservedFacsimile) {
      if (!sections.length || sections.some(section=>!object(section) || section.text_mode !== 'facsimile')) error(`${label}: unchanged facsimile requires all sections to be source facsimiles.`);
      evidenceReview(edition.preservation_review, `${label} unchanged original preservation`);
    } else {
      evidenceReview(edition.source_fidelity_review, `${label} source fidelity`);
      evidenceReview(edition.natural_language_review, `${label} natural language and audience suitability`);
    }
    evidenceReview(edition.typography_review, `${label} script and typography`);
  }
  const outputs=list(plan.outputs, 'Requested outputs'), outputPairs=new Set(), coveredLanguages=new Set();
  if (!outputs.length) incomplete('Select at least one requested output format.');
  for (const [index, output] of outputs.entries()) {
    const label=`Output ${index+1}`;
    if (!object(output)) {error(`${label} must be an object.`); continue;}
    if (!formats.includes(output.format)) error(`${label} format must be web, pdf, epub or print.`);
    const outputLanguages=list(output.languages, `${label} languages`);
    if (!outputLanguages.length) incomplete(`${label} must identify its language editions.`);
    for (const language of outputLanguages) {
      if (!languages.includes(language) || !editionLanguages.has(language)) error(`${label} refers to an undeclared language edition.`);
      const pair=`${output.format}:${language}`;
      if (outputPairs.has(pair)) error(`Duplicate output language/format: ${pair}.`);
      outputPairs.add(pair); coveredLanguages.add(language);
    }
    evidenceReview(output.qa_review, `${label} ${output.format ?? ''} rendering and navigation`);
    if (visibility === 'unlisted' && output.format !== 'print') {
      if (!object(output.discovery) || output.discovery.listed !== false || output.discovery.indexed !== false) incomplete(`${label}: unlisted digital output must be excluded from public listings and indexing.`);
    }
  }
  for (const language of editionLanguages) if (!coveredLanguages.has(language)) incomplete(`No requested output covers the ${language} edition.`);
  return {errors:[...new Set(errors)], warnings:[...new Set(warnings)]};
}
