import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {newProject,migrateProject,migratePrivateRecord,validateProject,model} from '../scripts/editorial/model.mjs';

test('book drafts include a plan and incomplete evidence is a warning',()=>{
 const book=newProject('book','draft');
 assert.ok(book.book_plan);
 assert.deepEqual(validateProject(book).errors,[]);
 assert.ok(validateProject(book).warnings.some(x=>x.includes('age band')));
});
test('migration preserves source evidence and clears old release authority',()=>{
 const old={...newProject('book','old'),model_version:'0.1.0',authorization:{instruction:'publish'},delivery:{live:true},artifacts:[{id:'source',text:'unchanged'}]};
 delete old.book_plan;
 const migrated=migrateProject(old);
 assert.equal(migrated.model_version,model.version);
 assert.equal(migrated.candidate_revision,2);
 assert.equal(migrated.authorization,null);assert.equal(migrated.delivery,null);
 assert.deepEqual(migrated.artifacts,old.artifacts);
 assert.ok(old.authorization);assert.ok(migrated.book_plan);
 assert.equal(migrated.stages.find(x=>x.id==='publish_and_verify').state,'pending');
 assert.throws(()=>migrateProject({...old,model_version:'unknown'}));
});
test('private migration preserves original and refuses overwrite and external records',()=>{
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'sishu-migration-'));
 try {
  fs.mkdirSync(path.join(root,'editorial-private'));
  const old=JSON.stringify({...newProject('magazine','old'),model_version:'0.1.0'});
  const file='editorial-private/old.json';fs.writeFileSync(path.join(root,file),old);
  const target=migratePrivateRecord(root,file);
  assert.equal(fs.readFileSync(path.join(root,file),'utf8'),old);assert.ok(fs.existsSync(target));
  assert.throws(()=>migratePrivateRecord(root,file));
  fs.writeFileSync(path.join(root,'public.json'),old);
  assert.throws(()=>migratePrivateRecord(root,'public.json'));
 } finally {fs.rmSync(root,{recursive:true,force:true});}
});
