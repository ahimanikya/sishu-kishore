import {build} from 'esbuild';
await build({entryPoints:['src/editorial.js'],bundle:true,minify:true,format:'esm',target:['es2022'],outfile:'../public/editorial/app.js'});

await build({entryPoints:['src/engagement.js'],bundle:true,minify:true,format:'esm',target:['es2022'],outfile:'../public/editorial/engagement.js'});
