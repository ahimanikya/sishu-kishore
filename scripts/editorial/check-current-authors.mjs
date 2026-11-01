import fs from 'node:fs';
import {readSiteEdition, validateAuthorSelection, precedingIssue} from './author-selection.mjs';
const page=fs.readFileSync('public/current_issue.html','utf8');
const route=page.match(/data-reading-issue="([^"]+)"/)?.[1];
const candidate=readSiteEdition(route);
const previous=readSiteEdition(`/editions/${precedingIssue(candidate.issue)}/`);
const policy=JSON.parse(fs.readFileSync('kb/editorial-model/model.json','utf8')).profiles['sishu-kishore'].author_selection;
// An unresolved rotation decision cannot silently permit a consecutive author.
const report=validateAuthorSelection(candidate,previous,{rotationMode:policy.rotation_mode ?? 'strict'});
if(report.errors.length){console.error(JSON.stringify(report,null,2));process.exitCode=1;}
else console.log(`Author selection verified: ${candidate.articles.length} contributions; one per canonical author; previous issue checked.`);
