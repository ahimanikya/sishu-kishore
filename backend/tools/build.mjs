import {build} from 'esbuild';
await build({entryPoints:['src/editorial.js'],bundle:true,minify:true,format:'esm',target:['es2022'],outfile:'../public/editorial/app.js'});
