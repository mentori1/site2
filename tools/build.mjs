import fs from 'node:fs/promises';
import { minify } from 'terser';
import './build-services.mjs';
await import('./build-finish.mjs');

const result=await minify(await fs.readFile('main.js','utf8'),{compress:true,mangle:true});
await fs.writeFile('main.min.js',result.code);
console.log('Shared site script built. Homepage scenes need no WebGL bundle.');
